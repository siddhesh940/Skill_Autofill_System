'use client';

import { useEffect, useState } from 'react';

const LOADING_STEPS = [
  { id: 1, label: 'Parsing job description...', icon: '📋', duration: 1500 },
  { id: 2, label: 'Analyzing your profile...', icon: '👤', duration: 1500 },
  { id: 3, label: 'Computing skill gaps...', icon: '🎯', duration: 2000 },
  { id: 4, label: 'Generating learning roadmap...', icon: '🗺️', duration: 1500 },
  { id: 5, label: 'Improving resume bullets...', icon: '✍️', duration: 1500 },
  { id: 6, label: 'Recommending projects...', icon: '💡', duration: 1500 },
  { id: 7, label: 'Creating GitHub tasks...', icon: '🐙', duration: 1000 },
  { id: 8, label: 'Finalizing results...', icon: '✨', duration: 500 },
];

export default function LoadingState() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    let accumulatedTime = 0;

    LOADING_STEPS.forEach((step, index) => {
      const timer = setTimeout(() => {
        setCurrentStep(index + 1);
      }, accumulatedTime);
      timers.push(timer);
      accumulatedTime += step.duration;
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="card">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 text-4xl mb-4 animate-pulse">
            ⚡
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Analyzing Your Career Path
          </h2>
          <p className="text-slate-400">
            Our NLP engine is processing your data...
          </p>
        </div>

        <div className="space-y-3">
          {LOADING_STEPS.map((step, index) => {
            const isComplete = currentStep > index;
            const isCurrent = currentStep === index + 1;

            return (
              <div
                key={step.id}
                className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-300 ${
                  isComplete
                    ? 'bg-green-500/10 border border-green-500/30'
                    : isCurrent
                    ? 'bg-blue-500/10 border border-blue-500/30'
                    : 'bg-slate-700/20 border border-transparent'
                }`}
              >
                <span className="text-2xl">{step.icon}</span>
                <span
                  className={`flex-1 ${
                    isComplete
                      ? 'text-green-400'
                      : isCurrent
                      ? 'text-blue-400'
                      : 'text-slate-500'
                  }`}
                >
                  {step.label}
                </span>
                {isComplete && <span className="text-green-400">✓</span>}
                {isCurrent && (
                  <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8">
          <div className="progress-bar">
            <div
              className="progress-fill bg-gradient-to-r from-blue-500 to-purple-500"
              style={{ width: `${(currentStep / LOADING_STEPS.length) * 100}%` }}
            />
          </div>
          <p className="text-center text-sm text-slate-500 mt-2">
            {Math.round((currentStep / LOADING_STEPS.length) * 100)}% complete
          </p>
        </div>
      </div>
    </div>
  );
}
