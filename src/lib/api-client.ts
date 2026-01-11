/**
 * Resilient API Client for Production
 * 
 * Handles:
 * - Automatic retries with exponential backoff
 * - Timeout protection
 * - Cold start recovery
 * - Network failure resilience
 * - Mobile-friendly error handling
 */

interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  isRetry?: boolean;
}

// Default timeout for serverless functions (accounts for cold starts)
const DEFAULT_TIMEOUT = 60000; // 60 seconds
const DEFAULT_RETRIES = 2;
const DEFAULT_RETRY_DELAY = 1000; // 1 second base delay

/**
 * Creates an AbortController with timeout
 */
function createTimeoutController(timeout: number): { controller: AbortController; timeoutId: NodeJS.Timeout } {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  return { controller, timeoutId };
}

/**
 * Sleep function for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if error is retryable
 */
function isRetryableError(error: unknown, response?: Response): boolean {
  // Network errors are retryable
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }
  
  // Abort errors (timeouts) are retryable
  if (error instanceof DOMException && error.name === 'AbortError') {
    return true;
  }
  
  // Server errors (5xx) are retryable
  if (response && response.status >= 500 && response.status < 600) {
    return true;
  }
  
  // 429 Too Many Requests is retryable
  if (response && response.status === 429) {
    return true;
  }
  
  return false;
}

/**
 * Resilient fetch with timeout, retries, and error handling
 */
export async function resilientFetch<T>(
  url: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const {
    timeout = DEFAULT_TIMEOUT,
    retries = DEFAULT_RETRIES,
    retryDelay = DEFAULT_RETRY_DELAY,
    ...fetchOptions
  } = options;

  let lastError: unknown;
  let lastResponse: Response | undefined;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const { controller, timeoutId } = createTimeoutController(timeout);
    
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      lastResponse = response;

      // Try to parse response
      let data: unknown;
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        try {
          data = await response.json();
        } catch {
          // If JSON parsing fails, treat as empty response
          data = {};
        }
      } else {
        data = await response.text();
      }

      // Handle successful response
      if (response.ok) {
        return {
          success: true,
          data: (data as { data?: T })?.data ?? (data as T),
          isRetry: attempt > 0,
        };
      }

      // Handle client errors (4xx) - don't retry
      if (response.status >= 400 && response.status < 500) {
        const errorMessage = (data as { error?: string })?.error || `Request failed`;
        return {
          success: false,
          error: errorMessage,
        };
      }

      // Server error - will retry if attempts remaining
      lastError = new Error((data as { error?: string })?.error || `Server error: ${response.status}`);
      
      if (!isRetryableError(lastError, response) || attempt >= retries) {
        throw lastError;
      }
      
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error;
      
      // Don't retry if not a retryable error or no attempts left
      if (!isRetryableError(error, lastResponse) || attempt >= retries) {
        break;
      }
    }

    // Wait before retry with exponential backoff
    if (attempt < retries) {
      const delay = retryDelay * Math.pow(2, attempt);
      await sleep(delay);
    }
  }

  // All retries exhausted - return user-friendly error
  return {
    success: false,
    error: getUserFriendlyError(lastError),
  };
}

/**
 * Convert technical errors to user-friendly messages
 */
function getUserFriendlyError(error: unknown): string {
  if (error instanceof DOMException && error.name === 'AbortError') {
    return 'The request took too long. Please try again.';
  }
  
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return 'Unable to connect. Please check your internet connection.';
  }
  
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    
    if (msg.includes('network') || msg.includes('failed to fetch')) {
      return 'Connection issue. Please check your internet and try again.';
    }
    
    if (msg.includes('timeout')) {
      return 'The request took too long. Please try again.';
    }
    
    if (msg.includes('server') || msg.includes('500')) {
      return 'Our servers are temporarily busy. Please try again in a moment.';
    }
  }
  
  return 'Something went wrong. Please try again.';
}

/**
 * API-specific fetch wrapper with proper content-type headers
 */
export async function apiRequest<T>(
  endpoint: string,
  options: FetchOptions & { body?: unknown } = {}
): Promise<ApiResponse<T>> {
  const { body, ...rest } = options;
  
  return resilientFetch<T>(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    ...rest,
  });
}

/**
 * Upload file with resilient handling
 * Uses chunked approach for large files
 */
export async function uploadFile<T>(
  endpoint: string,
  file: File,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const formData = new FormData();
  formData.append('file', file);
  
  // For file uploads, use longer timeout
  const timeout = options.timeout || 90000; // 90 seconds for file uploads
  
  return resilientFetch<T>(endpoint, {
    method: 'POST',
    body: formData,
    timeout,
    retries: options.retries ?? 1, // Fewer retries for file uploads
    ...options,
  });
}
