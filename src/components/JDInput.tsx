'use client';

interface JDInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function JDInput({ value, onChange }: JDInputProps) {
  return (
    <div className="card animate-fade-in hover:translate-y-[-2px] hover:shadow-lg hover:shadow-cyan-500/5 transition-all duration-200">
      <div className="section-header">
        <div className="section-icon bg-blue-500/20 text-blue-400">
          📋
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Job Description</h2>
          <p className="text-sm text-slate-400">Paste the job posting or URL</p>
        </div>
      </div>

      <div className="space-y-4">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste the full job description here...

Example:
We are looking for a Senior Full-Stack Developer with 5+ years of experience.

Requirements:
- Strong proficiency in React, Node.js, and TypeScript
- Experience with PostgreSQL and MongoDB
- Familiarity with AWS or Azure cloud services
- Understanding of CI/CD pipelines
- Excellent problem-solving skills"
          className="textarea h-80 leading-relaxed"
          style={{ lineHeight: '1.6' }}
        />

        <div className="flex items-center gap-2 text-sm text-slate-500">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Supports LinkedIn, Indeed, or any job posting text</span>
        </div>
      </div>
    </div>
  );
}
