'use client';

import { Button, Card } from '@/components/ui';
import type { FullAnalysisResponse } from '@/types';
import { useState } from 'react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: FullAnalysisResponse;
}

export function ExportModal({ isOpen, onClose, data }: ExportModalProps) {
  const [exportFormat, setExportFormat] = useState<'json' | 'markdown'>('json');

  if (!isOpen) return null;

  const handleExport = () => {
    const filename = `skill-analysis-${Date.now()}`;
    
    if (exportFormat === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      downloadBlob(blob, `${filename}.json`);
    } else {
      const markdown = generateMarkdown(data);
      const blob = new Blob([markdown], { type: 'text/markdown' });
      downloadBlob(blob, `${filename}.md`);
    }
    
    onClose();
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Export Analysis</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Format</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setExportFormat('json')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  exportFormat === 'json'
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="text-2xl mb-1">📋</div>
                <div className="text-sm font-medium text-slate-200">JSON</div>
                <div className="text-xs text-slate-400">Machine readable</div>
              </button>
              <button
                onClick={() => setExportFormat('markdown')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  exportFormat === 'markdown'
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="text-2xl mb-1">📝</div>
                <div className="text-sm font-medium text-slate-200">Markdown</div>
                <div className="text-xs text-slate-400">Human readable</div>
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleExport} className="flex-1">
              Download
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function generateMarkdown(data: FullAnalysisResponse): string {
  let md = `# Career Analysis Report\n\n`;
  md += `**Generated:** ${new Date().toLocaleString()}\n\n`;
  md += `---\n\n`;

  // Job Analysis
  if (data.job_analysis) {
    md += `## 📋 Job Analysis\n\n`;
    md += `| Field | Value |\n|-------|-------|\n`;
    md += `| **Title** | ${data.job_analysis.job_title} |\n`;
    md += `| **Company** | ${data.job_analysis.company} |\n`;
    md += `| **Experience** | ${data.job_analysis.experience_level} |\n\n`;

    md += `### Required Skills\n`;
    data.job_analysis.core_skills.forEach(skill => {
      md += `- ${skill}\n`;
    });
    md += `\n`;

    if (data.job_analysis.tools?.length) {
      md += `### Tools & Technologies\n`;
      data.job_analysis.tools.forEach(tool => {
        md += `- ${tool}\n`;
      });
      md += `\n`;
    }
  }

  // Skill Gap
  if (data.skill_gap) {
    md += `## 📊 Skill Gap Analysis\n\n`;
    md += `**Overall Match:** ${data.skill_gap.match_percentage}%\n\n`;

    md += `### ✅ Matching Skills (${data.skill_gap.matching_skills.length})\n`;
    data.skill_gap.matching_skills.forEach(skill => {
      md += `- ${skill}\n`;
    });
    md += `\n`;

    md += `### ❌ Missing Skills (${data.skill_gap.missing_skills.length})\n`;
    md += `| Skill | Priority | Est. Hours |\n|-------|----------|------------|\n`;
    data.skill_gap.missing_skills.forEach(item => {
      md += `| ${item.skill} | ${item.priority} | ${item.estimated_hours || '-'}h |\n`;
    });
    md += `\n`;
  }

  // Roadmap
  if (data.roadmap) {
    md += `## 🗺️ Learning Roadmap\n\n`;
    md += `**Total Duration:** ${data.roadmap.total_weeks} weeks\n`;
    md += `**Weekly Commitment:** ${data.roadmap.hours_per_week || 10} hours\n\n`;

    data.roadmap.weekly_plan.forEach(week => {
      md += `### Week ${week.week}: ${week.focus_skill}\n`;
      week.tasks.forEach(task => {
        md += `- [ ] **${task.title}** (${task.hours}h)\n`;
        md += `  - ${task.description}\n`;
      });
      if (week.resources?.length) {
        md += `\n**Resources:**\n`;
        week.resources.forEach(resource => {
          md += `- [${resource.title}](${resource.url})\n`;
        });
      }
      md += `\n`;
    });
  }

  // Resume Suggestions
  if (data.resume_suggestions) {
    md += `## 📄 Resume Improvements\n\n`;
    
    if (data.resume_suggestions.improved_bullets?.length) {
      md += `### Improved Bullets\n`;
      data.resume_suggestions.improved_bullets.forEach(bullet => {
        md += `\n**Original:**\n> ${bullet.original}\n\n`;
        md += `**Improved:**\n> ${bullet.improved}\n\n`;
        md += `*Keywords added: ${bullet.keywords_added?.join(', ') || 'None'}*\n\n---\n`;
      });
    }

    if (data.resume_suggestions.ats_keywords?.length) {
      md += `### ATS Keywords to Include\n`;
      data.resume_suggestions.ats_keywords.forEach(kw => {
        md += `- ${kw}\n`;
      });
      md += `\n`;
    }
  }

  // Projects
  if (data.recommended_projects?.projects?.length) {
    md += `## 💡 Recommended Projects\n\n`;
    data.recommended_projects.projects.forEach((project, i) => {
      md += `### ${i + 1}. ${project.name}\n\n`;
      md += `${project.description}\n\n`;
      md += `- **Difficulty:** ${project.difficulty}\n`;
      md += `- **Time:** ${project.estimated_hours}h\n`;
      md += `- **Tech Stack:** ${project.tech_stack.join(', ')}\n`;
      md += `- **Skills:** ${project.skills_demonstrated.join(', ')}\n\n`;
    });
  }

  // GitHub Tasks
  if (data.github_tasks?.issues?.length) {
    md += `## 🐙 GitHub Tasks\n\n`;
    data.github_tasks.issues.forEach((issue, i) => {
      md += `### Issue ${i + 1}: ${issue.title}\n\n`;
      md += `${issue.body}\n\n`;
      if (issue.checklist?.length) {
        md += `**Checklist:**\n`;
        issue.checklist.forEach(item => {
          md += `- [ ] ${item}\n`;
        });
        md += `\n`;
      }
    });
  }

  md += `---\n\n`;
  md += `*Generated by Skill Autofill System*\n`;

  return md;
}

// GitHub Integration Modal
interface GitHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  issues: Array<{ title: string; body: string; labels?: string[] }>;
}

export function GitHubModal({ isOpen, onClose, issues }: GitHubModalProps) {
  const [repoOwner, setRepoOwner] = useState('');
  const [repoName, setRepoName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [result, setResult] = useState<{ created: number; errors: string[] } | null>(null);

  if (!isOpen) return null;

  const handleCreate = async () => {
    if (!repoOwner || !repoName) return;
    
    setIsCreating(true);
    setResult(null);

    try {
      const response = await fetch('/api/github/create-issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo_owner: repoOwner,
          repo_name: repoName,
          issues,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setResult({
          created: data.data.created_count,
          errors: data.data.errors || [],
        });
      } else {
        setResult({
          created: 0,
          errors: [data.error],
        });
      }
    } catch (err) {
      setResult({
        created: 0,
        errors: [err instanceof Error ? err.message : 'Unknown error'],
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-lg mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Create GitHub Issues</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!result ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">
              This will create {issues.length} issue{issues.length !== 1 ? 's' : ''} in your GitHub repository.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Owner</label>
                <input
                  type="text"
                  value={repoOwner}
                  onChange={(e) => setRepoOwner(e.target.value)}
                  placeholder="username"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Repository</label>
                <input
                  type="text"
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value)}
                  placeholder="repo-name"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleCreate} 
                className="flex-1"
                isLoading={isCreating}
                disabled={!repoOwner || !repoName}
              >
                Create Issues
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {result.created > 0 && (
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center gap-2 text-green-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Successfully created {result.created} issue{result.created !== 1 ? 's' : ''}!</span>
                </div>
              </div>
            )}

            {result.errors.length > 0 && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="text-red-400 mb-2">Errors:</div>
                <ul className="text-sm text-red-300 list-disc list-inside">
                  {result.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
