'use client';

import { generateGitHubTasks } from '@/lib/nlp/github-task-generator';
import type { FullAnalysisResponse } from '@/types';
import { useCallback, useMemo, useState } from 'react';

// =====================================================
// TYPES
// =====================================================

interface GitHubCardProps {
  githubTasks: FullAnalysisResponse['github_tasks'];
  projects?: FullAnalysisResponse['recommended_projects'];
}

// =====================================================
// HELPER: Format issue for clipboard (GitHub-ready)
// =====================================================

function formatIssueForCopy(issue: FullAnalysisResponse['github_tasks']['issues'][0]): string {
  const lines: string[] = [];
  
  lines.push(`Title: ${issue.title}`);
  lines.push('');
  lines.push('Body:');
  
  if (issue.checklist && issue.checklist.length > 0) {
    issue.checklist.forEach(item => {
      lines.push(`- [ ] ${item}`);
    });
  }
  
  lines.push('');
  lines.push(`Labels: ${issue.labels?.join(', ') || 'none'}`);
  lines.push(`Priority: ${issue.priority || 'medium'}`);
  
  return lines.join('\n');
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function GitHubCard({ githubTasks, projects }: GitHubCardProps) {
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedIssueIndex, setCopiedIssueIndex] = useState<string | null>(null);
  const [selectedProjectIndex, setSelectedProjectIndex] = useState(0);

  // Get project list
  const projectList = projects?.projects || [];
  const hasMultipleProjects = projectList.length > 1;
  const selectedProject = projectList[selectedProjectIndex];

  // =====================================================
  // KEY FIX: Generate tasks per project dynamically
  // =====================================================
  const currentTasks = useMemo(() => {
    if (!selectedProject) {
      return githubTasks; // Fallback to original tasks
    }

    // Convert frontend project format to RecommendedProject format
    const projectForGenerator = {
      id: `project-${selectedProjectIndex}`,
      title: selectedProject.name,
      description: selectedProject.description,
      tech_stack: selectedProject.tech_stack,
      skills_demonstrated: selectedProject.skills_demonstrated,
      features: selectedProject.features,
      difficulty: selectedProject.difficulty,
      estimated_hours: selectedProject.estimated_hours,
      why_recommended: selectedProject.why_recommended || '',
      github_structure: [],
      learning_outcomes: selectedProject.learning_outcomes || [],
    };

    // Generate UNIQUE tasks for THIS project
    const generatedTasks = generateGitHubTasks(projectForGenerator);
    
    return generatedTasks;
  }, [selectedProject, selectedProjectIndex, githubTasks]);

  // =====================================================
  // COPY ALL ISSUES (for current project only)
  // =====================================================
  const copyAllIssues = useCallback(async () => {
    const milestones = currentTasks.milestones || [];
    const allContent: string[] = [];
    
    // Header
    allContent.push(`# GitHub Issues for: ${currentTasks.repo_name}`);
    allContent.push('');
    allContent.push(`> ${currentTasks.repo_description || ''}`);
    allContent.push('');
    allContent.push('---');
    allContent.push('');
    
    // Group issues by milestone/phase
    milestones.forEach(milestone => {
      const milestoneIssues = currentTasks.issues.filter(
        issue => issue.milestone === milestone.title
      );
      
      if (milestoneIssues.length > 0) {
        allContent.push(`## ${milestone.title}`);
        allContent.push(`> ${milestone.description || ''}`);
        allContent.push('');
        
        milestoneIssues.forEach((issue, idx) => {
          allContent.push(`### Issue ${idx + 1}: ${issue.title}`);
          allContent.push('');
          
          if (issue.checklist && issue.checklist.length > 0) {
            issue.checklist.forEach(item => {
              allContent.push(`- [ ] ${item}`);
            });
            allContent.push('');
          }
          
          allContent.push(`**Labels:** ${issue.labels?.join(', ') || 'none'}`);
          allContent.push(`**Priority:** ${issue.priority || 'medium'}`);
          allContent.push('');
          allContent.push('---');
          allContent.push('');
        });
      }
    });
    
    const textToCopy = allContent.join('\n');
    
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch {
      // Fallback for browsers without clipboard API
      const textarea = document.createElement('textarea');
      textarea.value = textToCopy;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        setCopiedAll(true);
        setTimeout(() => setCopiedAll(false), 2000);
      } catch (e) {
        console.error('Copy failed:', e);
      }
      document.body.removeChild(textarea);
    }
  }, [currentTasks]);

  // =====================================================
  // COPY SINGLE ISSUE
  // =====================================================
  const copyIssue = useCallback(async (issue: FullAnalysisResponse['github_tasks']['issues'][0], issueKey: string) => {
    const content = formatIssueForCopy(issue);
    
    try {
      await navigator.clipboard.writeText(content);
      setCopiedIssueIndex(issueKey);
      setTimeout(() => setCopiedIssueIndex(null), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = content;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        setCopiedIssueIndex(issueKey);
        setTimeout(() => setCopiedIssueIndex(null), 2000);
      } catch (e) {
        console.error('Copy failed:', e);
      }
      document.body.removeChild(textarea);
    }
  }, []);

  // Priority badge styles
  const priorityStyles = {
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-green-500/20 text-green-400 border-green-500/30',
  };

  return (
    <div className="space-y-6">
      {/* ========== EXPLANATION HEADER ========== */}
      <div className="card bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🎯</span>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              GitHub-Ready Project Tasks
            </h3>
            <p className="text-sm text-slate-300 mb-4">
              This section converts job requirements into GitHub-ready issues so you can build real projects step by step.
            </p>
            
            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="text-xs text-slate-400 font-medium mb-2">📋 How to use:</p>
              <ol className="text-xs text-slate-400 space-y-1 list-decimal list-inside">
                <li>Select a project below (if multiple available)</li>
                <li>Create a new GitHub repository with the suggested name</li>
                <li>Copy issues using the buttons provided</li>
                <li>Paste them into GitHub Issues</li>
                <li>Build and close issues one by one to complete the project</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* ========== PROJECT SELECTOR ========== */}
      {hasMultipleProjects && (
        <div className="card">
          <h4 className="text-sm font-medium text-slate-400 mb-3">Select Project:</h4>
          <div className="flex flex-wrap gap-2">
            {projectList.map((project, index) => (
              <button
                key={index}
                onClick={() => setSelectedProjectIndex(index)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedProjectIndex === index
                    ? 'bg-blue-500 text-white ring-2 ring-blue-400'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {project.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ========== CURRENT PROJECT INFO (with clear indicator) ========== */}
      <div className="card">
        <div className="section-header">
          <div className="section-icon bg-slate-700 text-white">
            🐙
          </div>
          <div className="flex-1">
            <p className="text-xs text-blue-400 font-medium mb-1">
              ✨ GitHub tasks shown for:
            </p>
            <h3 className="text-lg font-semibold text-white">
              {currentTasks.repo_name}
            </h3>
            <p className="text-sm text-slate-400">
              {currentTasks.repo_description}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center p-4 bg-slate-700/30 rounded-lg">
            <div className="text-2xl font-bold text-white">
              {currentTasks.issues?.length || 0}
            </div>
            <div className="text-sm text-slate-400">Issues</div>
          </div>
          <div className="text-center p-4 bg-slate-700/30 rounded-lg">
            <div className="text-2xl font-bold text-blue-400">
              {currentTasks.milestones?.length || 0}
            </div>
            <div className="text-sm text-slate-400">Phases</div>
          </div>
          <div className="text-center p-4 bg-slate-700/30 rounded-lg">
            <div className="text-2xl font-bold text-green-400">
              {currentTasks.labels?.length || 0}
            </div>
            <div className="text-sm text-slate-400">Labels</div>
          </div>
        </div>

        {/* Copy All Button */}
        <div className="mt-4">
          <button 
            onClick={copyAllIssues} 
            className={`w-full py-3 rounded-lg font-medium transition-all ${
              copiedAll 
                ? 'bg-green-500 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {copiedAll ? '✓ Copied All Issues!' : '📋 Copy All Issues'}
          </button>
        </div>
      </div>

      {/* ========== PHASES OVERVIEW ========== */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">
          📅 Phases (Milestones)
        </h3>
        <div className="space-y-3">
          {currentTasks.milestones.map((milestone, index) => {
            const issueCount = currentTasks.issues.filter(i => i.milestone === milestone.title).length;
            return (
              <div
                key={`${currentTasks.repo_name}-phase-${index}`}
                className="flex items-center gap-4 p-3 bg-slate-700/30 rounded-lg"
              >
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{milestone.title}</p>
                  <p className="text-sm text-slate-400">
                    {milestone.description}
                  </p>
                </div>
                <span className="text-xs text-slate-500 bg-slate-700/50 px-2 py-1 rounded">
                  {issueCount} issue{issueCount !== 1 ? 's' : ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========== ISSUES BY PHASE ========== */}
      {currentTasks.milestones.map((milestone, milestoneIndex) => {
        const milestoneIssues = currentTasks.issues.filter(
          issue => issue.milestone === milestone.title
        );
        
        if (milestoneIssues.length === 0) return null;
        
        return (
          <div key={`${currentTasks.repo_name}-${milestone.title}`} className="card">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-xs font-bold">
                {milestoneIndex + 1}
              </span>
              {milestone.title}
            </h3>

            <div className="space-y-3">
              {milestoneIssues.map((issue, issueIndex) => {
                const issueKey = `${currentTasks.repo_name}-${milestoneIndex}-${issueIndex}`;
                const isCopied = copiedIssueIndex === issueKey;
                
                return (
                  <div
                    key={issueKey}
                    className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30"
                  >
                    {/* Issue Header */}
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-white font-medium flex-1 pr-4">{issue.title}</h4>
                      <span
                        className={`text-xs px-2 py-1 rounded border ${
                          priorityStyles[issue.priority as keyof typeof priorityStyles] || priorityStyles.medium
                        }`}
                      >
                        {issue.priority}
                      </span>
                    </div>

                    {/* Labels */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {issue.labels.map((label) => {
                        const labelDef = currentTasks.labels.find(l => l.name === label);
                        return (
                          <span
                            key={`${issueKey}-${label}`}
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: `#${labelDef?.color || '6366f1'}20`,
                              color: `#${labelDef?.color || '6366f1'}`,
                              border: `1px solid #${labelDef?.color || '6366f1'}40`,
                            }}
                          >
                            {label}
                          </span>
                        );
                      })}
                    </div>

                    {/* Checklist - ALL items shown */}
                    {issue.checklist && issue.checklist.length > 0 && (
                      <div className="space-y-1 mb-3">
                        {issue.checklist.map((item, cIndex) => (
                          <div
                            key={`${issueKey}-check-${cIndex}`}
                            className="flex items-start gap-2 text-sm text-slate-400"
                          >
                            <span className="text-slate-500 mt-0.5">☐</span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Copy Button */}
                    <div className="mt-3 pt-3 border-t border-slate-600/30 flex justify-end">
                      <button 
                        onClick={() => copyIssue(issue, issueKey)}
                        className={`text-xs px-3 py-1.5 rounded transition-all ${
                          isCopied 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
                        }`}
                      >
                        {isCopied ? '✓ Copied!' : '📋 Copy Issue'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* ========== LABELS REFERENCE ========== */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">
          🏷️ Suggested Labels
        </h3>
        <p className="text-sm text-slate-400 mb-4">
          Create these labels in your GitHub repository for better organization:
        </p>
        <div className="flex flex-wrap gap-2">
          {currentTasks.labels.map((label) => (
            <span
              key={`${currentTasks.repo_name}-label-${label.name}`}
              className="text-xs px-3 py-1.5 rounded-full flex items-center gap-2"
              style={{
                backgroundColor: `#${label.color}20`,
                color: `#${label.color}`,
                border: `1px solid #${label.color}40`,
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: `#${label.color}` }}
              />
              {label.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
