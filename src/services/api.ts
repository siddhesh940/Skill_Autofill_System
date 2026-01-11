// API Service Layer for Skill Autofill System

import type {
  FullAnalysisResponse,
  LearningRoadmap,
  ParsedJobDescription,
  SkillGapAnalysis,
  UserSkillProfile,
} from '../types';

const API_BASE = '/api';

// Generic fetch wrapper with error handling
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const result = await response.json();

    if (!response.ok) {
      return { 
        success: false, 
        error: result.error || `HTTP ${response.status}` 
      };
    }

    return { success: true, data: result.data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Network error' 
    };
  }
}

// =====================================================
// JOB DESCRIPTION EXTRACTION
// =====================================================

export interface ExtractJDRequest {
  jd_text?: string;
  jd_url?: string;
}

export async function extractJobDescription(
  request: ExtractJDRequest
): Promise<{ success: boolean; data?: ParsedJobDescription; error?: string }> {
  return apiRequest<ParsedJobDescription>('/extract-jd', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

// =====================================================
// PROFILE ANALYSIS
// =====================================================

export interface AnalyzeProfileRequest {
  resume_text?: string;
  github_username?: string;
  portfolio_url?: string;
}

export async function analyzeProfile(
  request: AnalyzeProfileRequest
): Promise<{ success: boolean; data?: UserSkillProfile; error?: string }> {
  return apiRequest<UserSkillProfile>('/analyze-profile', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

// =====================================================
// SKILL GAP ANALYSIS
// =====================================================

export interface SkillGapRequest {
  job_data: ParsedJobDescription;
  user_skills: string[];
}

export async function analyzeSkillGap(
  request: SkillGapRequest
): Promise<{ success: boolean; data?: SkillGapAnalysis; error?: string }> {
  return apiRequest<SkillGapAnalysis>('/skill-gap', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

// =====================================================
// ROADMAP GENERATION
// =====================================================

export interface GenerateRoadmapRequest {
  missing_skills: Array<{ skill: string; priority: string }>;
  available_hours_per_week?: number;
}

export async function generateRoadmap(
  request: GenerateRoadmapRequest
): Promise<{ success: boolean; data?: LearningRoadmap; error?: string }> {
  return apiRequest<LearningRoadmap>('/generate-roadmap', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

// =====================================================
// FULL ANALYSIS (ALL-IN-ONE)
// =====================================================

export interface FullAnalysisRequest {
  jd_text: string;
  jd_url?: string;
  resume_text?: string;
  github_username?: string;
  available_hours_per_week?: number;
}

export async function runFullAnalysis(
  request: FullAnalysisRequest
): Promise<{ success: boolean; data?: FullAnalysisResponse; error?: string }> {
  return apiRequest<FullAnalysisResponse>('/generate-all', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

// =====================================================
// APPLY UPDATES
// =====================================================

export interface ApplyUpdatesRequest {
  analysis_id: string;
  apply_to_github?: boolean;
  github_repo_name?: string;
  apply_to_portfolio?: boolean;
}

export interface ApplyUpdatesResponse {
  github_issues_created?: number;
  portfolio_updated?: boolean;
  errors?: string[];
}

export async function applyUpdates(
  request: ApplyUpdatesRequest
): Promise<{ success: boolean; data?: ApplyUpdatesResponse; error?: string }> {
  return apiRequest<ApplyUpdatesResponse>('/apply-updates', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

// =====================================================
// GITHUB INTEGRATION
// =====================================================

export interface CreateGitHubIssuesRequest {
  repo_owner: string;
  repo_name: string;
  issues: Array<{
    title: string;
    body: string;
    labels?: string[];
  }>;
}

export interface CreateGitHubIssuesResponse {
  created_count: number;
  issue_urls: string[];
  errors?: string[];
}

export async function createGitHubIssues(
  request: CreateGitHubIssuesRequest
): Promise<{ success: boolean; data?: CreateGitHubIssuesResponse; error?: string }> {
  return apiRequest<CreateGitHubIssuesResponse>('/github/create-issues', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

// =====================================================
// EXPORT UTILITIES
// =====================================================

export function exportToJSON(data: FullAnalysisResponse, filename: string = 'analysis'): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportToMarkdown(data: FullAnalysisResponse): string {
  let md = `# Career Analysis Report\n\n`;
  md += `Generated: ${new Date().toLocaleString()}\n\n`;
  
  // Job Info
  if (data.job_analysis) {
    md += `## Job Analysis\n`;
    md += `**Title:** ${data.job_analysis.job_title}\n`;
    md += `**Company:** ${data.job_analysis.company}\n`;
    md += `**Experience:** ${data.job_analysis.experience_level}\n\n`;
    
    md += `### Required Skills\n`;
    data.job_analysis.core_skills.forEach(skill => {
      md += `- ${skill}\n`;
    });
    md += `\n`;
  }
  
  // Skill Gap
  if (data.skill_gap) {
    md += `## Skill Gap Analysis\n`;
    md += `**Match:** ${data.skill_gap.match_percentage}%\n\n`;
    
    md += `### Matching Skills\n`;
    data.skill_gap.matching_skills.forEach(skill => {
      md += `- ✅ ${skill}\n`;
    });
    md += `\n`;
    
    md += `### Missing Skills\n`;
    data.skill_gap.missing_skills.forEach(item => {
      md += `- ❌ ${item.skill} (${item.priority} priority)\n`;
    });
    md += `\n`;
  }
  
  // Roadmap
  if (data.roadmap) {
    md += `## Learning Roadmap\n`;
    md += `**Duration:** ${data.roadmap.total_weeks} weeks\n\n`;
    
    data.roadmap.weekly_plan.forEach(week => {
      md += `### Week ${week.week}: ${week.focus_skill}\n`;
      week.tasks.forEach(task => {
        md += `- [ ] ${task.title} (${task.hours}h)\n`;
      });
      md += `\n`;
    });
  }
  
  // Resume Suggestions
  if (data.resume_suggestions) {
    md += `## Resume Improvements\n`;
    data.resume_suggestions.improved_bullets.forEach(bullet => {
      md += `- ${bullet.improved}\n`;
    });
    md += `\n`;
  }
  
  // Projects
  if (data.recommended_projects) {
    md += `## Recommended Projects\n`;
    data.recommended_projects.projects.forEach(project => {
      md += `### ${project.name}\n`;
      md += `${project.description}\n`;
      md += `**Tech:** ${project.tech_stack.join(', ')}\n`;
      md += `**Difficulty:** ${project.difficulty}\n\n`;
    });
  }
  
  return md;
}

export function downloadMarkdown(data: FullAnalysisResponse, filename: string = 'analysis'): void {
  const md = exportToMarkdown(data);
  const blob = new Blob([md], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}-${Date.now()}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
