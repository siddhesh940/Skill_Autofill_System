'use client';

import type { FullAnalysisResponse } from '@/types';

interface SkillGapCardProps {
  skillGap: FullAnalysisResponse['skill_gap'];
}

export default function SkillGapCard({ skillGap }: SkillGapCardProps) {
  const matchingSkills = skillGap.matching_skills || [];
  const missingSkills = skillGap.missing_skills || [];
  const matchPercentage = skillGap.match_percentage || 0;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Matching Skills */}
      <div className="card">
        <div className="section-header">
          <div className="section-icon bg-green-500/20 text-green-400">
            ✓
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Matching Skills ({matchingSkills.length})
            </h3>
            <p className="text-sm text-slate-400">Skills you already have</p>
          </div>
        </div>

        <div className="space-y-3">
          {matchingSkills.map((skill) => (
            <div
              key={typeof skill === 'string' ? skill : skill}
              className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <span className="text-green-400">✓</span>
                <span className="text-white">{typeof skill === 'string' ? skill : skill}</span>
              </div>
            </div>
          ))}
          
          {matchingSkills.length === 0 && (
            <p className="text-slate-500 text-center py-4">
              No matching skills found
            </p>
          )}
        </div>
      </div>

      {/* Missing Skills */}
      <div className="card">
        <div className="section-header">
          <div className="section-icon bg-red-500/20 text-red-400">
            ✗
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Missing Skills ({missingSkills.length})
            </h3>
            <p className="text-sm text-slate-400">Skills to develop</p>
          </div>
        </div>

        <div className="space-y-3">
          {missingSkills.map((item) => (
            <div
              key={item.skill}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                item.priority === 'high'
                  ? 'bg-red-500/10 border-red-500/20'
                  : item.priority === 'medium'
                  ? 'bg-yellow-500/10 border-yellow-500/20'
                  : 'bg-slate-700/30 border-slate-600/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={
                    item.priority === 'high'
                      ? 'text-red-400'
                      : item.priority === 'medium'
                      ? 'text-yellow-400'
                      : 'text-slate-400'
                  }
                >
                  {item.priority === 'high' ? '🔴' : item.priority === 'medium' ? '🟡' : '⚪'}
                </span>
                <span className="text-white">{item.skill}</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    item.priority === 'high'
                      ? 'bg-red-500/20 text-red-400'
                      : item.priority === 'medium'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-slate-600 text-slate-300'
                  } capitalize`}
                >
                  {item.priority}
                </span>
                {item.estimated_hours && (
                  <span className="text-xs text-slate-500">{item.estimated_hours}h</span>
                )}
              </div>
            </div>
          ))}

          {missingSkills.length === 0 && (
            <p className="text-green-400 text-center py-4">
              🎉 You have all required skills!
            </p>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="card md:col-span-2">
        <h3 className="text-lg font-semibold text-white mb-4">Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-slate-700/30 rounded-lg">
            <div className="text-3xl font-bold text-white">
              {matchPercentage}%
            </div>
            <div className="text-sm text-slate-400">Match Rate</div>
          </div>
          <div className="text-center p-4 bg-green-500/10 rounded-lg">
            <div className="text-3xl font-bold text-green-400">
              {matchingSkills.length}
            </div>
            <div className="text-sm text-slate-400">Skills Matched</div>
          </div>
          <div className="text-center p-4 bg-red-500/10 rounded-lg">
            <div className="text-3xl font-bold text-red-400">
              {missingSkills.filter((s) => s.priority === 'high').length}
            </div>
            <div className="text-sm text-slate-400">Critical Gaps</div>
          </div>
          <div className="text-center p-4 bg-yellow-500/10 rounded-lg">
            <div className="text-3xl font-bold text-yellow-400">
              {missingSkills.reduce((sum, s) => sum + (s.estimated_hours || 0), 0)}h
            </div>
            <div className="text-sm text-slate-400">Est. Learning</div>
          </div>
        </div>
      </div>
    </div>
  );
}
