'use client';

import { useRef, useState } from 'react';

// Inline resilient upload function to avoid import issues
async function uploadFileWithRetry<T>(
  url: string,
  file: File,
  options: { timeout?: number; retries?: number } = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  const { timeout = 60000, retries = 1 } = options;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data };
      }
      
      // Don't retry client errors
      if (response.status >= 400 && response.status < 500) {
        return { success: false, error: data.error || 'Upload failed' };
      }
      
      // Server error - retry if attempts remaining
      if (attempt >= retries) {
        return { success: false, error: data.error || 'Upload failed' };
      }
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (attempt >= retries) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return { success: false, error: 'Upload timed out. Please try again.' };
        }
        return { success: false, error: 'Connection issue. Please try again.' };
      }
    }
    
    // Wait before retry
    await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
  }
  
  return { success: false, error: 'Upload failed. Please try again.' };
}

interface ProfileInputProps {
  resumeText: string;
  onResumeChange: (value: string) => void;
  githubUsername: string;
  onGithubChange: (value: string) => void;
}

interface ParseWarning {
  message: string;
  quality: 'good' | 'partial' | 'failed';
}

interface ParseResponse {
  success?: boolean;
  text?: string;
  structured?: {
    skills?: string[];
  };
  parseQuality?: string;
  warnings?: string[];
  error?: string;
  suggestion?: string;
}

export default function ProfileInput({
  resumeText,
  onResumeChange,
  githubUsername,
  onGithubChange,
}: ProfileInputProps) {
  const [activeTab, setActiveTab] = useState<'resume' | 'github'>('resume');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [parseWarning, setParseWarning] = useState<ParseWarning | null>(null);
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file before upload - be more lenient
    const maxSize = 8 * 1024 * 1024; // 8MB (matches server limit)
    if (file.size > maxSize) {
      setUploadError('File is too large (max 8MB). Please paste your resume text directly below.');
      return;
    }

    // Be lenient with file types - check extension as fallback
    const allowedTypes = ['application/pdf', 'text/plain'];
    const fileExtension = file.name.toLowerCase().split('.').pop();
    const isValidExtension = fileExtension === 'pdf' || fileExtension === 'txt';
    
    if (!allowedTypes.includes(file.type) && !isValidExtension) {
      setUploadError('Please upload a PDF or TXT file.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadedFileName(null);
    setParseWarning(null);
    setExtractedSkills([]);

    // Use resilient upload with timeout and retry
    const result = await uploadFileWithRetry<ParseResponse>('/api/parse-pdf', file, {
      timeout: 60000, // 60 second timeout for file uploads
      retries: 1, // One retry for uploads
    });

    if (result.success && result.data) {
      const data = result.data;
      
      // Handle successful or partial parsing
      if (data.text) {
        onResumeChange(data.text);
        setUploadedFileName(file.name);

        // Set extracted skills if available
        if (data.structured?.skills && data.structured.skills.length > 0) {
          setExtractedSkills(data.structured.skills);
        }

        // Show warning for partial parsing
        if (data.parseQuality === 'partial' || (data.warnings && data.warnings.length > 0)) {
          setParseWarning({
            message: data.warnings?.[0] || 'Some sections may not have been extracted correctly.',
            quality: (data.parseQuality as 'good' | 'partial' | 'failed') || 'partial',
          });
        }
      } else {
        // No text extracted - show friendly error
        setUploadError(data.error || 'Could not extract text. Please paste your resume directly below.');
      }
    } else {
      // Upload failed - show user-friendly message
      setUploadError(result.error || 'Upload failed. Please paste your resume text directly below.');
    }

    setIsUploading(false);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="card animate-fade-in hover:translate-y-[-2px] hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-200" style={{ animationDelay: '0.1s' }}>
      <div className="section-header">
        <div className="section-icon bg-purple-500/20 text-purple-400">
          👤
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Your Profile</h2>
          <p className="text-sm text-slate-400">Add your resume and/or GitHub</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('resume')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'resume'
              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
              : 'bg-slate-700/30 text-slate-400 hover:bg-slate-700/50'
          }`}
        >
          📄 Resume
        </button>
        <button
          onClick={() => setActiveTab('github')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'github'
              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
              : 'bg-slate-700/30 text-slate-400 hover:bg-slate-700/50'
          }`}
        >
          🐙 GitHub
        </button>
      </div>

      {/* Resume Tab */}
      {activeTab === 'resume' && (
        <div className="space-y-4">
          <textarea
            value={resumeText}
            onChange={(e) => onResumeChange(e.target.value)}
            placeholder="Paste your resume text here...

Example:
EXPERIENCE
Senior Software Engineer | Tech Company | 2020-Present
- Developed React applications serving 100K+ users
- Built RESTful APIs using Node.js and Express
- Implemented CI/CD pipelines with GitHub Actions

SKILLS
JavaScript, TypeScript, React, Node.js, PostgreSQL, AWS"
            className="textarea h-48 leading-relaxed"
            style={{ lineHeight: '1.6' }}
          />

          {/* Upload Section */}
          <div className="p-3 bg-slate-700/30 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Or upload your resume:</span>
              <label className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isUploading 
                  ? 'bg-slate-600 text-slate-400 cursor-wait' 
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white'
              }`}>
                {isUploading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Parsing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    📎 Upload PDF
                  </span>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </label>
            </div>

            {/* Success message */}
            {uploadedFileName && !uploadError && (
              <div className="mt-3 p-2 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
                <div className="flex items-center gap-2">
                  <span>✓</span>
                  <span>Successfully loaded: <strong>{uploadedFileName}</strong></span>
                </div>
                {extractedSkills.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-green-500/20">
                    <p className="text-xs text-green-300 mb-1">Detected skills:</p>
                    <div className="flex flex-wrap gap-1">
                      {extractedSkills.slice(0, 8).map((skill, i) => (
                        <span key={i} className="px-2 py-0.5 bg-green-500/20 rounded text-xs">
                          {skill}
                        </span>
                      ))}
                      {extractedSkills.length > 8 && (
                        <span className="px-2 py-0.5 text-xs text-green-300">
                          +{extractedSkills.length - 8} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Warning message for partial parsing */}
            {parseWarning && !uploadError && (
              <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-400 text-sm">
                <div className="flex items-start gap-2">
                  <span>⚠</span>
                  <div>
                    <p>{parseWarning.message}</p>
                    <p className="text-xs mt-1 text-slate-500">You can edit the extracted text above if needed.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error message */}
            {uploadError && (
              <div className="mt-3 p-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                <div className="flex items-start gap-2">
                  <span>✕</span>
                  <div>
                    <p>{uploadError}</p>
                    <p className="text-xs mt-1 text-slate-500">Try pasting the text directly instead.</p>
                  </div>
                </div>
              </div>
            )}

            <p className="mt-2 text-xs text-slate-500">
              Supports PDF and TXT files. For best results, use text-based PDFs.
              <br />
              <span className="text-yellow-400">📱 Mobile tip: If upload fails, paste resume text directly above.</span>
            </p>
          </div>
        </div>
      )}

      {/* GitHub Tab */}
      {activeTab === 'github' && (
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none z-10">
              github.com/
            </div>
            <input
              type="text"
              value={githubUsername}
              onChange={(e) => onGithubChange(e.target.value)}
              placeholder="username"
              className="input pl-24 relative z-0"
              style={{ paddingLeft: '6.5rem' }}
            />
          </div>

          <div className="p-4 bg-slate-700/30 rounded-lg space-y-3">
            <h4 className="text-sm font-medium text-white flex items-center gap-2">
              <span>🔍</span> What we analyze:
            </h4>
            <ul className="text-sm text-slate-400 space-y-2">
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                Programming languages from repositories
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                Frameworks detected in package.json
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                Contribution frequency and patterns
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                Project types and complexity
              </li>
            </ul>
          </div>

          {githubUsername && (
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2 text-green-400 text-sm">
              <span>✓</span>
              <span>Will analyze public repos for: <strong>{githubUsername}</strong></span>
            </div>
          )}
        </div>
      )}

      {/* Status indicators */}
      <div className="mt-4 pt-4 border-t border-slate-700/50">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Profile sources:</span>
          <div className="flex gap-3">
            <span className={`flex items-center gap-1 ${resumeText ? 'text-green-400' : 'text-slate-600'}`}>
              📄 Resume {resumeText && '✓'}
            </span>
            <span className={`flex items-center gap-1 ${githubUsername ? 'text-green-400' : 'text-slate-600'}`}>
              🐙 GitHub {githubUsername && '✓'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
