'use client';

import AnalysisResults from '@/components/AnalysisResults';
import Header from '@/components/Header';
import JDInput from '@/components/JDInput';
import LoadingState from '@/components/LoadingState';
import ProfileInput from '@/components/ProfileInput';
import type { FullAnalysisResponse } from '@/types';
import { useState } from 'react';

export default function HomePage() {
  const [step, setStep] = useState<'input' | 'loading' | 'results'>('input');
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const [results, setResults] = useState<FullAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!jdText) {
      setError('Please provide a job description');
      return;
    }

    if (!resumeText && !githubUsername) {
      setError('Please provide either a resume or GitHub username');
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
          jd_text: jdText,
          resume_text: resumeText || undefined,
          github_username: githubUsername || undefined,
          available_hours_per_week: 10,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      setResults(data.data);
      setStep('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
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

        {/* Error Alert */}
        {error && (
          <div className="max-w-4xl mx-auto mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 animate-fade-in">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
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
                disabled={!jdText || (!resumeText && !githubUsername)}
                className="btn-primary text-lg px-10 py-4 animate-pulse-glow disabled:animate-none disabled:opacity-50 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-shadow"
              >
                🚀 Analyze &amp; Generate
              </button>
              <p className="mt-3 text-xs text-slate-500">Takes about 10-15 seconds</p>
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
