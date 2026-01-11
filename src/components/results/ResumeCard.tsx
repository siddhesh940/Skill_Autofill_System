'use client';

import type { FullAnalysisResponse, ResumeGap, ResumeGapSeverity } from '@/types';
import { useState } from 'react';

interface ResumeCardProps {
  resumeSuggestions: FullAnalysisResponse['resume_suggestions'];
}

// Severity indicator component
function SeverityBadge({ severity }: { severity: ResumeGapSeverity }) {
  const styles = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };

  const labels = {
    critical: 'Critical',
    warning: 'Needs Attention',
    info: 'Suggestion',
  };

  return (
    <span className={`text-xs px-2 py-0.5 rounded border ${styles[severity]}`}>
      {labels[severity]}
    </span>
  );
}

// Gap icon based on category
function GapIcon({ category }: { category: ResumeGap['category'] }) {
  const icons: Record<string, string> = {
    missing_metrics: '📊',
    weak_verbs: '✍️',
    missing_keywords: '🔍',
    shallow_descriptions: '📝',
    missing_terminology: '💼',
    format_issues: '⚠️',
  };
  return <span className="text-lg">{icons[category] || '📋'}</span>;
}

// Score ring component
function ScoreRing({ 
  score, 
  label,
  size = 'large' 
}: { 
  score: number; 
  label: string;
  size?: 'small' | 'large';
}) {
  const getColor = (s: number) => {
    if (s >= 70) return 'text-green-400';
    if (s >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getStrokeColor = (s: number) => {
    if (s >= 70) return 'stroke-green-400';
    if (s >= 50) return 'stroke-yellow-400';
    return 'stroke-red-400';
  };

  const radius = size === 'large' ? 40 : 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const viewBox = size === 'large' ? '0 0 100 100' : '0 0 60 60';
  const center = size === 'large' ? 50 : 30;
  const strokeWidth = size === 'large' ? 8 : 5;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg 
          className={size === 'large' ? 'w-24 h-24' : 'w-14 h-14'} 
          viewBox={viewBox}
        >
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-700"
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`${getStrokeColor(score)} transition-all duration-500`}
            transform={`rotate(-90 ${center} ${center})`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`${size === 'large' ? 'text-2xl' : 'text-sm'} font-bold ${getColor(score)}`}>
            {score}
          </span>
        </div>
      </div>
      <span className={`${size === 'large' ? 'mt-2 text-sm' : 'mt-1 text-xs'} text-slate-400`}>
        {label}
      </span>
    </div>
  );
}

export default function ResumeCard({ resumeSuggestions }: ResumeCardProps) {
  const [copiedKeywords, setCopiedKeywords] = useState(false);
  
  // Extract data with fallbacks for backward compatibility
  const resumeGaps = resumeSuggestions.resume_gaps || [];
  const bulletImprovements = resumeSuggestions.bullet_improvements || [];
  const atsAnalysis = resumeSuggestions.ats_analysis || {
    present_keywords: [],
    missing_keywords: resumeSuggestions.ats_keywords || [],
    keyword_density_score: 0,
  };
  const readinessScore = resumeSuggestions.readiness_score || {
    overall_score: 0,
    breakdown: {
      metrics_score: 0,
      action_verbs_score: 0,
      keywords_score: 0,
      format_score: 0,
    },
    improvement_potential: [],
  };

  // Legacy fallback for bullet improvements
  const legacyBullets = resumeSuggestions.improved_bullets || [];
  const displayBullets = bulletImprovements.length > 0 
    ? bulletImprovements.map(b => ({ 
        original: b.original, 
        improved: b.improved, 
        changes: b.changes 
      }))
    : legacyBullets.map(b => ({ 
        original: b.original, 
        improved: b.improved, 
        changes: b.keywords_added.length > 0 
          ? [`Keywords: ${b.keywords_added.join(', ')}`] 
          : []
      }));

  const copyMissingKeywords = () => {
    navigator.clipboard.writeText(atsAnalysis.missing_keywords.join(', '));
    setCopiedKeywords(true);
    setTimeout(() => setCopiedKeywords(false), 2000);
  };

  // Count gaps by severity
  const criticalCount = resumeGaps.filter(g => g.severity === 'critical').length;
  const warningCount = resumeGaps.filter(g => g.severity === 'warning').length;

  return (
    <div className="space-y-6">
      {/* ========== SECTION 0: ATS Readiness Score ========== */}
      <div className="card">
        <div className="section-header">
          <div className="section-icon bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-blue-400">
            📊
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Resume ATS Readiness
            </h3>
            <p className="text-sm text-slate-400">
              How well your resume matches this job
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Main Score */}
          <div className="flex flex-col items-center">
            <ScoreRing score={readinessScore.overall_score} label="Overall Score" size="large" />
          </div>

          {/* Score Breakdown */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            <ScoreRing 
              score={Math.round((readinessScore.breakdown.metrics_score / 25) * 100)} 
              label="Metrics" 
              size="small" 
            />
            <ScoreRing 
              score={Math.round((readinessScore.breakdown.action_verbs_score / 25) * 100)} 
              label="Verbs" 
              size="small" 
            />
            <ScoreRing 
              score={Math.round((readinessScore.breakdown.keywords_score / 30) * 100)} 
              label="Keywords" 
              size="small" 
            />
            <ScoreRing 
              score={Math.round((readinessScore.breakdown.format_score / 20) * 100)} 
              label="Format" 
              size="small" 
            />
          </div>
        </div>

        {/* Improvement Potential */}
        {readinessScore.improvement_potential.length > 0 && (
          <div className="mt-6 p-4 bg-slate-700/30 rounded-lg">
            <h4 className="text-sm font-medium text-slate-300 mb-3">
              💡 How to improve your score:
            </h4>
            <div className="space-y-2">
              {readinessScore.improvement_potential.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">{item.action}</span>
                  <span className="text-green-400 font-medium">+{item.potential_gain}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ========== SECTION 1: Resume Gaps (Primary) ========== */}
      <div className="card">
        <div className="section-header">
          <div className="section-icon bg-red-500/20 text-red-400">
            🎯
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">
              Resume Gaps Detected
            </h3>
            <p className="text-sm text-slate-400">
              Issues that may reduce your resume&apos;s effectiveness
            </p>
          </div>
          {/* Gap summary badges */}
          <div className="flex gap-2">
            {criticalCount > 0 && (
              <span className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded-full">
                {criticalCount} Critical
              </span>
            )}
            {warningCount > 0 && (
              <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded-full">
                {warningCount} Warning
              </span>
            )}
          </div>
        </div>

        {resumeGaps.length > 0 ? (
          <div className="mt-4 space-y-3">
            {resumeGaps.map((gap) => (
              <div 
                key={gap.id} 
                className={`p-4 rounded-lg border ${
                  gap.severity === 'critical' 
                    ? 'bg-red-500/5 border-red-500/20' 
                    : gap.severity === 'warning'
                    ? 'bg-yellow-500/5 border-yellow-500/20'
                    : 'bg-blue-500/5 border-blue-500/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  <GapIcon category={gap.category} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-medium text-white">{gap.message}</span>
                      <SeverityBadge severity={gap.severity} />
                    </div>
                    {gap.details && (
                      <p className="text-sm text-slate-400 mb-2">{gap.details}</p>
                    )}
                    {gap.suggestedFix && (
                      <div className="flex items-start gap-2 text-sm">
                        <span className="text-green-400">→</span>
                        <span className="text-slate-300">{gap.suggestedFix}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 p-6 bg-slate-700/30 rounded-lg text-center">
            <span className="text-4xl mb-3 block">✅</span>
            <p className="text-slate-300">No major resume gaps detected!</p>
            <p className="text-sm text-slate-400 mt-1">
              Your resume appears well-structured for this job.
            </p>
          </div>
        )}
      </div>

      {/* ========== SECTION 2: Bullet Improvements ========== */}
      <div className="card">
        <div className="section-header">
          <div className="section-icon bg-green-500/20 text-green-400">
            ✍️
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Suggested Bullet Improvements
            </h3>
            <p className="text-sm text-slate-400">
              Example rewrites for your experience bullets
            </p>
          </div>
        </div>

        {displayBullets.length > 0 ? (
          <div className="mt-4 space-y-4">
            {displayBullets.slice(0, 3).map((bullet, index) => (
              <div key={index} className="p-4 bg-slate-700/30 rounded-lg">
                {/* Before */}
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-red-400 font-medium uppercase tracking-wide">Before</span>
                  </div>
                  <p className="text-slate-400 text-sm line-through">
                    {bullet.original}
                  </p>
                </div>

                {/* Arrow */}
                <div className="flex items-center gap-2 my-2">
                  <div className="flex-1 border-t border-slate-600" />
                  <span className="text-slate-500">↓</span>
                  <div className="flex-1 border-t border-slate-600" />
                </div>

                {/* After */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-green-400 font-medium uppercase tracking-wide">After</span>
                  </div>
                  <p className="text-white text-sm">
                    {bullet.improved}
                  </p>
                </div>

                {/* Changes made */}
                {bullet.changes.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-600/50">
                    <div className="flex flex-wrap gap-2">
                      {bullet.changes.map((change, i) => (
                        <span 
                          key={i} 
                          className="text-xs px-2 py-1 bg-blue-500/10 text-blue-400 rounded"
                        >
                          {change}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            <p className="text-xs text-slate-500 italic text-center mt-4">
              ⚠️ These are template suggestions only. Always verify accuracy and customize with your real experience.
            </p>
          </div>
        ) : (
          <div className="mt-4 p-6 bg-slate-700/30 rounded-lg text-center">
            <span className="text-4xl mb-3 block">✅</span>
            <p className="text-slate-300">Your bullets already look great!</p>
            <p className="text-sm text-slate-400 mt-1">
              No weak verbs detected. Your experience bullets use strong action verbs.
            </p>
          </div>
        )}
      </div>

      {/* ========== SECTION 3: Missing ATS Keywords ========== */}
      {atsAnalysis.missing_keywords.length > 0 && (
        <div className="card">
          <div className="section-header">
            <div className="section-icon bg-orange-500/20 text-orange-400">
              🔍
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                Missing ATS Keywords
              </h3>
              <p className="text-sm text-slate-400">
                Keywords from the job description not found in your resume
              </p>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex flex-wrap gap-2 mb-4">
              {atsAnalysis.missing_keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="px-3 py-1.5 bg-orange-500/10 text-orange-400 border border-orange-500/30 rounded-lg text-sm font-medium"
                >
                  {keyword}
                </span>
              ))}
            </div>

            <button
              onClick={copyMissingKeywords}
              className="btn-outline w-full flex items-center justify-center gap-2"
            >
              {copiedKeywords ? (
                <>
                  <span className="text-green-400">✓</span>
                  Copied!
                </>
              ) : (
                <>
                  📋 Copy Missing Keywords
                </>
              )}
            </button>
          </div>

          {/* Present keywords (collapsed by default) */}
          {atsAnalysis.present_keywords.length > 0 && (
            <details className="mt-4">
              <summary className="text-sm text-slate-400 cursor-pointer hover:text-slate-300">
                ✓ {atsAnalysis.present_keywords.length} keywords already present
              </summary>
              <div className="mt-3 flex flex-wrap gap-2">
                {atsAnalysis.present_keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="px-2 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded text-xs"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </details>
          )}
        </div>
      )}

      {/* ========== SECTION 4: Resume Tips ========== */}
      <div className="card">
        <div className="section-header">
          <div className="section-icon bg-purple-500/20 text-purple-400">
            💡
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Resume Best Practices
            </h3>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex items-start gap-3 text-sm">
            <span className="text-green-400 mt-0.5">✓</span>
            <p className="text-slate-300">
              <span className="font-medium text-white">Use strong action verbs</span> — Start bullets with 
              &quot;Developed&quot;, &quot;Implemented&quot;, &quot;Architected&quot;, &quot;Optimized&quot;, &quot;Spearheaded&quot;
            </p>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <span className="text-green-400 mt-0.5">✓</span>
            <p className="text-slate-300">
              <span className="font-medium text-white">Add quantifiable metrics</span> — Include 
              percentages, numbers, dollar amounts (e.g., &quot;reduced load time by 40%&quot;)
            </p>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <span className="text-green-400 mt-0.5">✓</span>
            <p className="text-slate-300">
              <span className="font-medium text-white">Include technology context</span> — Use 
              &quot;using X&quot;, &quot;with Y&quot;, &quot;leveraging Z&quot; to show your tech stack
            </p>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <span className="text-green-400 mt-0.5">✓</span>
            <p className="text-slate-300">
              <span className="font-medium text-white">Match JD keywords naturally</span> — Incorporate 
              job description terminology where truthful
            </p>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <span className="text-green-400 mt-0.5">✓</span>
            <p className="text-slate-300">
              <span className="font-medium text-white">Keep bullets concise</span> — Aim for 
              1-2 lines per bullet point (50-150 characters)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
