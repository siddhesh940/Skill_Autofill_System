/**
 * Device detection and platform utilities
 */

/**
 * Detect if the current device is likely a mobile device
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check user agent for mobile patterns
  const userAgent = window.navigator.userAgent.toLowerCase();
  const mobilePatterns = [
    'android',
    'webos',
    'iphone',
    'ipad',
    'ipod',
    'blackberry',
    'windows phone',
    'mobile'
  ];
  
  const isMobileUA = mobilePatterns.some(pattern => userAgent.includes(pattern));
  
  // Check screen dimensions as backup
  const hasSmallScreen = window.screen.width <= 768 || window.screen.height <= 768;
  
  // Check for touch capability
  const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  return isMobileUA || (hasSmallScreen && hasTouchScreen);
}

/**
 * Get platform-specific error messages
 */
export function getPlatformErrorMessage(baseMessage: string, errorType: 'upload' | 'network' | 'validation'): string {
  const isMobile = isMobileDevice();
  
  switch (errorType) {
    case 'upload':
      return isMobile 
        ? `${baseMessage} Try pasting your resume text directly instead.`
        : baseMessage;
    
    case 'network':
      return isMobile
        ? `${baseMessage} Check your connection or try switching between WiFi and mobile data.`
        : baseMessage;
    
    case 'validation':
      return baseMessage;
    
    default:
      return baseMessage;
  }
}

/**
 * Log error with platform context for debugging
 */
export function logPlatformError(error: any, context: string): void {
  const platformInfo = {
    context,
    error: error instanceof Error ? error.message : error,
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString(),
    platform: {
      isMobile: isMobileDevice(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      screenSize: typeof window !== 'undefined' ? {
        width: window.screen.width,
        height: window.screen.height
      } : null,
      viewport: typeof window !== 'undefined' ? {
        width: window.innerWidth,
        height: window.innerHeight
      } : null
    }
  };
  
  console.error('Platform Error:', platformInfo);
}