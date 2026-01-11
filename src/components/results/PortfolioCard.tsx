'use client';

import type { FullAnalysisResponse } from '@/types';
import { useCallback, useState } from 'react';

// =====================================================
// TYPES
// =====================================================

interface PortfolioCardProps {
  portfolioUpdates: FullAnalysisResponse['portfolio_updates'];
  jobAnalysis?: FullAnalysisResponse['job_analysis'];
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function PortfolioCard({ portfolioUpdates, jobAnalysis }: PortfolioCardProps) {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const skillsToAdd = portfolioUpdates.skills_to_add || [];
  const bioSuggestion = portfolioUpdates.bio_suggestion;
  const headlineSuggestion = portfolioUpdates.headline_suggestion;

  // Get job info for context
  const jobTitle = jobAnalysis?.job_title || 'Software Developer';
  const coreSkills = jobAnalysis?.core_skills?.slice(0, 3) || [];

  // =====================================================
  // GENERATE JOB-SPECIFIC HEADLINE
  // =====================================================
  const generateJobHeadline = (): string => {
    if (headlineSuggestion && !headlineSuggestion.includes('Deep Learning')) {
      // Clean up the existing headline if it's job-relevant
      return headlineSuggestion;
    }
    
    // Generate a job-specific headline
    const skillString = coreSkills.slice(0, 3).join(', ');
    if (skillString) {
      return `${jobTitle} | ${skillString}`;
    }
    return `${jobTitle} | Building Impactful Software Solutions`;
  };

  // =====================================================
  // GENERATE SHORT & LONG BIOS
  // =====================================================
  const generateShortBio = (): string => {
    const primarySkills = coreSkills.slice(0, 2).join(' and ') || 'modern technologies';
    return `${jobTitle} specializing in ${primarySkills}. Passionate about building high-quality, user-focused applications.`;
  };

  const generateLongBio = (): string => {
    const allSkills = coreSkills.join(', ') || 'modern web technologies';
    const tools = jobAnalysis?.tools?.slice(0, 3).join(', ') || '';
    
    let bio = `I'm a ${jobTitle} with expertise in ${allSkills}. `;
    bio += `I focus on writing clean, maintainable code and building applications that deliver real value to users. `;
    
    if (tools) {
      bio += `Experienced with ${tools} and always eager to learn new technologies. `;
    }
    
    bio += `Looking for opportunities to contribute to impactful projects and grow as a developer.`;
    
    return bio;
  };

  const jobHeadline = generateJobHeadline();
  const shortBio = generateShortBio();
  const longBio = bioSuggestion || generateLongBio();

  // =====================================================
  // COPY FUNCTION WITH FEEDBACK
  // =====================================================
  const copyToClipboard = useCallback(async (text: string, itemId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(itemId);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        setCopiedItem(itemId);
        setTimeout(() => setCopiedItem(null), 2000);
      } catch (e) {
        console.error('Copy failed:', e);
      }
      document.body.removeChild(textarea);
    }
  }, []);

  // Skill level styling
  const proficiencyStyles: Record<string, string> = {
    beginner: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    intermediate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    advanced: 'bg-green-500/20 text-green-400 border-green-500/30',
  };

  return (
    <div className="space-y-6">
      {/* ========== EXPLANATION HEADER ========== */}
      <div className="card bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
        <div className="flex items-start gap-3">
          <span className="text-2xl">�</span>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Public Profile Optimization
            </h3>
            <p className="text-sm text-slate-300 mb-2">
              This section optimizes your <span className="text-blue-400 font-medium">public developer profiles</span> (LinkedIn, GitHub, Portfolio) — not your resume.
            </p>
            <div className="text-xs text-slate-500 p-2 bg-slate-800/50 rounded-lg">
              <span className="text-slate-400">📄 Resume tab</span> = ATS optimization + PDF for recruiters<br/>
              <span className="text-purple-400">🌐 Portfolio tab</span> = Public branding + keywords + online visibility
            </div>
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg">
              <span className="text-xs text-slate-400">Optimizing for:</span>
              <span className="text-xs font-medium text-blue-400">{jobTitle}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========== SUGGESTED HEADLINE ========== */}
      <div className="card">
        <div className="section-header">
          <div className="section-icon bg-blue-500/20 text-blue-400">
            📝
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              LinkedIn Headline
            </h3>
            <p className="text-sm text-slate-400">
              Use as your LinkedIn headline or portfolio hero title. Optimized for recruiter keyword search.
            </p>
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-lg text-white font-medium">
            {jobHeadline}
          </p>
        </div>

        <p className="text-xs text-slate-500 mt-2">
          💡 Recruiters search LinkedIn by job title + skills. This headline is optimized for "{jobTitle}" searches.
        </p>

        <button
          onClick={() => copyToClipboard(jobHeadline, 'headline')}
          className={`w-full mt-4 py-2.5 rounded-lg font-medium transition-all ${
            copiedItem === 'headline'
              ? 'bg-green-500 text-white'
              : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
          }`}
        >
          {copiedItem === 'headline' ? '✓ Copied!' : '📋 Copy LinkedIn Headline'}
        </button>
      </div>

      {/* ========== SUGGESTED BIO (SHORT + LONG) ========== */}
      <div className="card">
        <div className="section-header">
          <div className="section-icon bg-purple-500/20 text-purple-400">
            ✨
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Professional Bio
            </h3>
            <p className="text-sm text-slate-400">
              Two versions — copy and paste directly. No editing required unless you want customization.
            </p>
          </div>
        </div>

        {/* Short Bio */}
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
              SHORT BIO
            </span>
            <span className="text-xs text-slate-500">→ LinkedIn Summary / About section (1-2 lines)</span>
          </div>
          <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
            <p className="text-slate-200 leading-relaxed">
              {shortBio}
            </p>
          </div>
          <button
            onClick={() => copyToClipboard(shortBio, 'short-bio')}
            className={`w-full mt-3 py-2 rounded-lg text-sm font-medium transition-all ${
              copiedItem === 'short-bio'
                ? 'bg-green-500 text-white'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {copiedItem === 'short-bio' ? '✓ Copied!' : '📋 Copy Short Bio'}
          </button>
        </div>

        {/* Long Bio */}
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-green-400 bg-green-500/10 px-2 py-1 rounded">
              LONG BIO
            </span>
            <span className="text-xs text-slate-500">→ GitHub README / Portfolio About section (4-5 lines)</span>
          </div>
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-slate-200 leading-relaxed">
              {longBio}
            </p>
          </div>
          <button
            onClick={() => copyToClipboard(longBio, 'long-bio')}
            className={`w-full mt-3 py-2 rounded-lg text-sm font-medium transition-all ${
              copiedItem === 'long-bio'
                ? 'bg-green-500 text-white'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {copiedItem === 'long-bio' ? '✓ Copied!' : '📋 Copy Long Bio'}
          </button>
        </div>

        {/* Bio Personalization Tip */}
        <div className="mt-4 p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
          <p className="text-xs text-slate-500">
            💡 <span className="text-slate-400">Tip:</span> Customize with your real projects, tools, or achievements for better impact.
          </p>
        </div>
      </div>

      {/* ========== SKILLS TO ADD ========== */}
      <div className="card">
        <div className="section-header">
          <div className="section-icon bg-green-500/20 text-green-400">
            🎯
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Public Skills ({skillsToAdd.length})
            </h3>
            <p className="text-sm text-slate-400">
              Skills to showcase publicly on LinkedIn and portfolio — not resume-only skills.
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {skillsToAdd.map((skill, index) => {
            const proficiency = skill.proficiency || 'intermediate';
            const skillId = `skill-${index}`;
            
            return (
              <div
                key={skill.name}
                className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg group"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => copyToClipboard(skill.name, skillId)}
                    className={`w-6 h-6 rounded flex items-center justify-center transition-all ${
                      copiedItem === skillId
                        ? 'bg-green-500 text-white'
                        : 'bg-green-500/20 text-green-400 hover:bg-green-500/40'
                    }`}
                    title="Copy this skill to add to your LinkedIn or portfolio"
                  >
                    {copiedItem === skillId ? '✓' : '+'}
                  </button>
                  <span className="text-white">{skill.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 capitalize">
                    {skill.category}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded border capitalize ${
                      proficiencyStyles[proficiency] || proficiencyStyles.intermediate
                    }`}
                  >
                    {proficiency}
                  </span>
                </div>
              </div>
            );
          })}

          {skillsToAdd.length === 0 && (
            <p className="text-slate-500 text-center py-4">
              Your portfolio skills are up to date!
            </p>
          )}
        </div>

        {/* Where to add hint */}
        {skillsToAdd.length > 0 && (
          <div className="mt-4 p-3 bg-slate-800/50 rounded-lg space-y-1">
            <p className="text-xs text-slate-400">
              <span className="text-blue-400 font-medium">Where to add:</span> LinkedIn Skills Section, Portfolio Website, GitHub Profile README
            </p>
            <p className="text-xs text-slate-500">
              ⚠️ Only add skills you can confidently explain in interviews.
            </p>
          </div>
        )}

        {skillsToAdd.length > 0 && (
          <button
            onClick={() => copyToClipboard(skillsToAdd.map((s) => s.name).join(', '), 'all-skills')}
            className={`w-full mt-4 py-2.5 rounded-lg font-medium transition-all ${
              copiedItem === 'all-skills'
                ? 'bg-green-500 text-white'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {copiedItem === 'all-skills' ? '✓ Copied All Skills!' : '📋 Copy Skills for Profile'}
          </button>
        )}
      </div>

      {/* ========== QUICK ACTIONS (COPY ONLY - NO FAKE AUTOMATION) ========== */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-2">
          📋 Quick Copy Actions
        </h3>
        <p className="text-sm text-slate-400 mb-4">
          One-click copy for each profile section
        </p>
        
        <div className="grid md:grid-cols-3 gap-3">
          <div className="text-center">
            <button
              onClick={() => copyToClipboard(jobHeadline, 'quick-headline')}
              className={`w-full py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                copiedItem === 'quick-headline'
                  ? 'bg-green-500 text-white'
                  : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30'
              }`}
            >
              {copiedItem === 'quick-headline' ? '✓ Copied!' : '📝 Copy Headline'}
            </button>
            <p className="text-xs text-slate-500 mt-1">→ LinkedIn</p>
          </div>
          
          <div className="text-center">
            <button
              onClick={() => copyToClipboard(`${shortBio}\n\n---\n\n${longBio}`, 'quick-bio')}
              className={`w-full py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                copiedItem === 'quick-bio'
                  ? 'bg-green-500 text-white'
                  : 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/30'
              }`}
            >
              {copiedItem === 'quick-bio' ? '✓ Copied!' : '✨ Copy Both Bios'}
            </button>
            <p className="text-xs text-slate-500 mt-1">→ LinkedIn + GitHub</p>
          </div>
          
          <div className="text-center">
            <button
              onClick={() => copyToClipboard(skillsToAdd.map((s) => s.name).join(', '), 'quick-skills')}
              className={`w-full py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                copiedItem === 'quick-skills'
                  ? 'bg-green-500 text-white'
                  : 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/30'
              }`}
            >
              {copiedItem === 'quick-skills' ? '✓ Copied!' : '🎯 Copy All Skills'}
            </button>
            <p className="text-xs text-slate-500 mt-1">→ LinkedIn Skills / Portfolio</p>
          </div>
        </div>
      </div>

      {/* ========== HOW TO USE FLOW ========== */}
      <div className="card bg-slate-800/30 border-slate-700/50">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <span>📖</span>
          How to use this section
        </h3>
        <div className="grid md:grid-cols-5 gap-3">
          <div className="text-center">
            <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-2 text-xs font-bold">
              1
            </div>
            <p className="text-xs text-slate-400">Update resume first</p>
          </div>
          <div className="text-center">
            <div className="w-7 h-7 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-2 text-xs font-bold">
              2
            </div>
            <p className="text-xs text-slate-400">Review headline & bio</p>
          </div>
          <div className="text-center">
            <div className="w-7 h-7 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mx-auto mb-2 text-xs font-bold">
              3
            </div>
            <p className="text-xs text-slate-400">Copy content</p>
          </div>
          <div className="text-center">
            <div className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-2 text-xs font-bold">
              4
            </div>
            <p className="text-xs text-slate-400">Paste into profiles</p>
          </div>
          <div className="text-center">
            <div className="w-7 h-7 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center mx-auto mb-2 text-xs font-bold">
              5
            </div>
            <p className="text-xs text-slate-400">Apply confidently!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
