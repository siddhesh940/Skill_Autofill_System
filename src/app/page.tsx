'use client';

import AnalysisResults from '@/components/AnalysisResults';
import ErrorMessage from '@/components/ErrorMessage';
import Header from '@/components/Header';
import JDInput from '@/components/JDInput';
import LoadingState from '@/components/LoadingState';
import ProfileInput from '@/components/ProfileInput';
import { logPlatformError } from '@/lib';
import { FullAnalysisResponse } from '@/types';
import { useState } from 'react';

export default function HomePage() {
  const [step, setStep] = useState<'input' | 'loading' | 'results'>('input');
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const [results, setResults] = useState<FullAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    // Enhanced input validation
    const jdTrimmed = jdText.trim();
    const resumeTrimmed = resumeText.trim();
    const githubTrimmed = githubUsername.trim();

    // Validate job description
    if (!jdTrimmed) {
      setError('Please add a job description before analyzing.');
      return;
    }

    if (jdTrimmed.length < 50) {
      setError('Please provide a more detailed job description (at least 50 characters).');
      return;
    }

    // Validate profile data
    if (!resumeTrimmed && !githubTrimmed) {
      setError('Please add job description and resume before analyzing.');
      return;
    }

    if (resumeTrimmed && resumeTrimmed.length < 100) {
      setError('Please provide a more detailed resume (at least 100 characters) or GitHub username.');
      return;
    }

    setError(null);
    setStep('loading');

    try {
      const response = await fetch('/api/generate-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jd_text: jdTrimmed,
          resume_text: resumeTrimmed || undefined,
          github_username: githubTrimmed || undefined,
          available_hours_per_week: 10,
        }),
      });

      // Handle network errors
      if (!response) {
        throw new Error('NETWORK_ERROR');
      }

      const data = await response.json();

      if (!response.ok) {
        // Log technical details for debugging
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: data.error,
          url: response.url
        });
        
        // Provide user-friendly error messages
        if (response.status >= 400 && response.status < 500) {
          throw new Error('VALIDATION_ERROR');
        } else if (response.status >= 500) {
          throw new Error('SERVER_ERROR');
        }
        
        throw new Error('UNKNOWN_ERROR');
      }

      setResults(data.data);
      setStep('results');
    } catch (err) {
      // Log platform-aware error for debugging
      logPlatformError(err, 'main-analysis');
      
      // Set user-friendly error messages
      let userMessage = 'Something went wrong on our side. Please try again in a moment.';
      
      if (err instanceof Error) {
        switch (err.message) {
          case 'NETWORK_ERROR':
          case 'Failed to fetch':
            userMessage = 'Unable to connect. Please check your internet connection and try again.';
            break;
          case 'VALIDATION_ERROR':
            userMessage = 'Please check your inputs and try again.';
            break;
          case 'SERVER_ERROR':
            userMessage = 'Our servers are having issues. Please try again in a moment.';
            break;
          default:
            if (err.message.includes('fetch')) {
              userMessage = 'Connection issue. Please try again.';
            }
            break;
        }
      }
      
      setError(userMessage);
      setStep('input');
    }
  };

  const handleReset = () => {
    setStep('input');
    setJdText('');
    setResumeText('');
    setGithubUsername('');
    setResults(null);
    setError(null);
  };

  return (
    <main className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        {step === 'input' && (
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="gradient-text">Skill Autofill System</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Paste a job description and your resume to get AI-powered skill gap analysis,
              personalized learning roadmaps, and resume improvements.
            </p>
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-500/50"></span>
                No signup required
              </span>
              <span className="text-slate-700">•</span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500/50"></span>
                100% free
              </span>
            </div>
          </div>
        )}

        {/* Enhanced Error Alert */}
        {error && (
          <div className="max-w-4xl mx-auto mb-6">
            <ErrorMessage 
              message={error} 
              onDismiss={() => setError(null)} 
              type="error"
            />
          </div>
        )}

        {/* Input Form */}
        {step === 'input' && (
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Step 1: Job Description */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <span className="text-xs font-semibold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">Step 1</span>
                  <span className="text-xs text-slate-500">Target Role</span>
                </div>
                <JDInput value={jdText} onChange={setJdText} />
              </div>
              {/* Step 2: Your Profile */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <span className="text-xs font-semibold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">Step 2</span>
                  <span className="text-xs text-slate-500">Your Experience</span>
                </div>
                <ProfileInput
                  resumeText={resumeText}
                  onResumeChange={setResumeText}
                  githubUsername={githubUsername}
                  onGithubChange={setGithubUsername}
                />
              </div>
            </div>

            <div className="text-center pt-6">
              <button
                onClick={handleAnalyze}
                disabled={
                  !jdText.trim() || 
                  jdText.trim().length < 50 || 
                  (!resumeText.trim() && !githubUsername.trim()) || 
                  (!!resumeText.trim() && resumeText.trim().length < 100 && !githubUsername.trim())
                }
                className="btn-primary text-lg px-10 py-4 animate-pulse-glow disabled:animate-none disabled:opacity-50 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-shadow"
              >
                🚀 Analyze &amp; Generate
              </button>
              <p className="mt-3 text-xs text-slate-500">Takes about 10-15 seconds</p>
              {/* Validation hints */}
              {(!jdText.trim() || jdText.trim().length < 50) && (
                <p className="mt-2 text-xs text-yellow-400">Please add a detailed job description (50+ characters)</p>
              )}
              {(!resumeText.trim() && !githubUsername.trim()) && jdText.trim().length >= 50 && (
                <p className="mt-2 text-xs text-yellow-400">Please add resume text or GitHub username</p>
              )}
              {resumeText.trim() && resumeText.trim().length < 100 && !githubUsername.trim() && (
                <p className="mt-2 text-xs text-yellow-400">Resume needs more detail (100+ characters) or add GitHub username</p>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {step === 'loading' && <LoadingState />}

        {/* Results */}
        {step === 'results' && results && (
          <AnalysisResults results={results} onReset={handleReset} />
        )}
      </div>
    </main>
  );
}
