'use client';

import type { FullAnalysisResponse } from '@/types';
import { useState } from 'react';
import { ExportModal, GitHubModal } from './modals';
import GitHubCard from './results/GitHubCard';
import PortfolioCard from './results/PortfolioCard';
import ProjectsCard from './results/ProjectsCard';
import ResumeCard from './results/ResumeCard';
import RoadmapCard from './results/RoadmapCard';
import SkillGapCard from './results/SkillGapCard';

interface AnalysisResultsProps {
  results: FullAnalysisResponse;
  onReset: () => void;
}

type TabId = 'overview' | 'roadmap' | 'resume' | 'projects' | 'github' | 'portfolio';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'overview', label: 'Skill Gap', icon: '🎯' },
  { id: 'roadmap', label: 'Roadmap', icon: '🗺️' },
  { id: 'resume', label: 'Resume', icon: '✍️' },
  { id: 'projects', label: 'Projects', icon: '💡' },
  { id: 'github', label: 'GitHub', icon: '🐙' },
  { id: 'portfolio', label: 'Portfolio', icon: '🌐' },
];

export default function AnalysisResults({ results, onReset }: AnalysisResultsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showGitHubModal, setShowGitHubModal] = useState(false);

  const matchRate = results.skill_gap?.match_percentage || 0;
  const jobTitle = results.job_analysis?.job_title || 'Job Position';
  const company = results.job_analysis?.company || 'Company';

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Analysis Complete ✨
          </h1>
          <p className="text-slate-400">
            {jobTitle} at {company}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Match Score */}
          <div className="flex items-center gap-3 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
            <div
              className={`text-2xl font-bold ${
                matchRate >= 70
                  ? 'text-green-400'
                  : matchRate >= 50
                  ? 'text-yellow-400'
                  : 'text-red-400'
              }`}
            >
              {matchRate}%
            </div>
            <div className="text-sm text-slate-400">
              Match
              <br />
              Score
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button 
              onClick={() => setShowExportModal(true)} 
              className="btn-outline"
              title="Export Results"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
            <button onClick={onReset} className="btn-secondary">
              ← New Analysis
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 p-1 bg-slate-800/30 rounded-xl">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-blue-500 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && results.skill_gap && (
          <SkillGapCard skillGap={results.skill_gap} />
        )}

        {activeTab === 'roadmap' && results.roadmap && (
          <RoadmapCard roadmap={results.roadmap} />
        )}

        {activeTab === 'resume' && results.resume_suggestions && (
          <ResumeCard resumeSuggestions={results.resume_suggestions} />
        )}

        {activeTab === 'projects' && results.recommended_projects && (
          <ProjectsCard
            projects={results.recommended_projects}
            skillGap={results.skill_gap}
          />
        )}

        {activeTab === 'github' && results.github_tasks && (
          <GitHubCard 
            githubTasks={results.github_tasks} 
            projects={results.recommended_projects}
          />
        )}

        {activeTab === 'portfolio' && results.portfolio_updates && (
          <PortfolioCard 
            portfolioUpdates={results.portfolio_updates} 
            jobAnalysis={results.job_analysis}
          />
        )}
      </div>

      {/* Modals */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        data={results}
      />
      
      {results.github_tasks && (
        <GitHubModal
          isOpen={showGitHubModal}
          onClose={() => setShowGitHubModal(false)}
          issues={results.github_tasks.issues}
        />
      )}
    </div>
  );
}
