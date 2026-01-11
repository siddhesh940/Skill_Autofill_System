// =====================================================
// SKILL AUTOFILL SYSTEM - TYPE DEFINITIONS
// 100% Rule-Based (No AI APIs)
// =====================================================

// =====================================================
// ENUMS & CONSTANTS
// =====================================================

export type SkillCategory = 
  | 'language' 
  | 'framework' 
  | 'runtime'
  | 'database' 
  | 'cloud' 
  | 'devops' 
  | 'tool' 
  | 'concept' 
  | 'soft_skill';

export type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type PriorityLevel = 'high' | 'medium' | 'low';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export type SkillSource = 'resume' | 'github' | 'manual';

export type JobRequestStatus = 'pending' | 'processing' | 'completed' | 'failed';

// =====================================================
// DATABASE TYPES
// =====================================================

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  github_username: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  resume_text: string | null;
  resume_file_url: string | null;
  resume_parsed_at: string | null;
  github_data: GitHubData;
  portfolio_data: PortfolioData;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserSkill {
  id: string;
  user_id: string;
  skill_name: string;
  skill_category: SkillCategory | null;
  proficiency_level: ProficiencyLevel;
  years_experience: number | null;
  source: SkillSource;
  confidence_score: number;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface JobRequest {
  id: string;
  user_id: string;
  job_title: string | null;
  company_name: string | null;
  job_url: string | null;
  job_description_raw: string;
  job_parsed: ParsedJobDescription;
  status: JobRequestStatus;
  error_message: string | null;
  processing_time_ms: number | null;
  created_at: string;
  updated_at: string;
}

export interface AnalysisResult {
  id: string;
  user_id: string;
  job_request_id: string;
  skill_gap: SkillGapAnalysis;
  roadmap: LearningRoadmap;
  resume_suggestions: ResumeSuggestions;
  recommended_projects: ProjectRecommendations;
  github_tasks: GitHubTasks;
  portfolio_updates: PortfolioUpdates;
  is_applied: boolean;
  applied_at: string | null;
  created_at: string;
}

export interface SkillTaxonomy {
  id: string;
  canonical_name: string;
  aliases: string[];
  category: SkillCategory;
  parent_skill: string | null;
  importance_weight: number;
  is_hot_skill: boolean;
  created_at: string;
}

// =====================================================
// PARSED DATA TYPES
// =====================================================

export interface ParsedJobDescription {
  job_title: string;
  company: string;
  location: string | null;
  experience_level: 'entry' | 'mid' | 'senior' | 'lead' | 'principal';
  experience_years_min: number;
  experience_years_max: number | null;
  core_skills: ExtractedSkill[];
  nice_to_have_skills: ExtractedSkill[];
  tools: string[];
  responsibilities: string[];
  qualifications: string[];
  ats_keywords: string[];
  salary_range: SalaryRange | null;
}

export interface ExtractedSkill {
  name: string;
  canonical_name: string;
  category: SkillCategory;
  frequency: number;
  is_required: boolean;
  context: string;
}

export interface SalaryRange {
  min: number;
  max: number;
  currency: string;
  period: 'hourly' | 'monthly' | 'yearly';
}

// =====================================================
// GITHUB DATA TYPES
// =====================================================

export interface GitHubData {
  username: string | null;
  profile_url: string | null;
  avatar_url: string | null;
  bio: string | null;
  repos: GitHubRepo[];
  languages: Record<string, number>;
  total_stars: number;
  total_commits: number;
  last_fetched_at: string | null;
}

export interface GitHubRepo {
  name: string;
  description: string | null;
  url: string;
  language: string | null;
  languages: Record<string, number>;
  stars: number;
  forks: number;
  is_fork: boolean;
  topics: string[];
  created_at: string;
  updated_at: string;
}

// =====================================================
// PORTFOLIO DATA TYPES
// =====================================================

export interface PortfolioData {
  bio: string;
  headline: string;
  skills: PortfolioSkill[];
  projects: PortfolioProject[];
  experience: PortfolioExperience[];
  education: PortfolioEducation[];
}

export interface PortfolioSkill {
  name: string;
  category: SkillCategory;
  level: ProficiencyLevel;
}

export interface PortfolioProject {
  title: string;
  description: string;
  technologies: string[];
  url: string | null;
  github_url: string | null;
  image_url: string | null;
  featured: boolean;
}

export interface PortfolioExperience {
  title: string;
  company: string;
  location: string | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  bullets: string[];
}

export interface PortfolioEducation {
  degree: string;
  institution: string;
  graduation_date: string;
  gpa: string | null;
}

// =====================================================
// ANALYSIS OUTPUT TYPES
// =====================================================

export interface SkillGapAnalysis {
  required_skills: AnalyzedSkill[];
  user_skills: AnalyzedSkill[];
  matching_skills: SkillMatch[];
  missing_skills: MissingSkill[];
  match_percentage: number;
}

export interface AnalyzedSkill {
  name: string;
  canonical_name: string;
  category: SkillCategory;
  importance_weight: number;
}

export interface SkillMatch {
  skill_name: string;
  user_proficiency: ProficiencyLevel;
  required_proficiency: ProficiencyLevel;
  match_quality: 'exact' | 'partial' | 'exceeds';
}

export interface MissingSkill {
  skill_name: string;
  category: SkillCategory;
  priority: PriorityLevel;
  priority_score: number;
  reason: string;
  estimated_weeks: number;
  related_skills: string[];
}

export interface LearningRoadmap {
  total_weeks: number;
  weekly_hours: number;
  phases: RoadmapPhase[];
  milestones: RoadmapMilestone[];
}

export interface RoadmapPhase {
  phase_number: number;
  title: string;
  duration_weeks: number;
  skills_covered: string[];
  tasks: RoadmapTask[];
  resources: LearningResource[];
}

export interface RoadmapTask {
  id: string;
  title: string;
  description: string;
  skill: string;
  estimated_hours: number;
  deliverable: string;
}

export interface RoadmapMilestone {
  week: number;
  title: string;
  skills_acquired: string[];
  checkpoint: string;
}

export interface LearningResource {
  title: string;
  url: string;
  type: 'course' | 'tutorial' | 'documentation' | 'video' | 'book' | 'practice';
  provider: string;
  is_free: boolean;
}

// =====================================================
// RESUME ANALYSIS TYPES
// =====================================================

export type ResumeGapSeverity = 'critical' | 'warning' | 'info';

export type ResumeGapCategory = 
  | 'missing_metrics'
  | 'weak_verbs'
  | 'missing_keywords'
  | 'shallow_descriptions'
  | 'missing_terminology'
  | 'format_issues';

export interface ResumeGap {
  id: string;
  category: ResumeGapCategory;
  severity: ResumeGapSeverity;
  message: string;
  details?: string;
  affectedBullets?: number[];  // Indices of affected bullets
  suggestedFix?: string;
}

export interface BulletImprovement {
  original: string;
  improved: string;
  changes: string[];
  improvement_type: 'metrics' | 'verb' | 'keyword' | 'clarity';
}

export interface ATSKeywordAnalysis {
  present_keywords: string[];
  missing_keywords: string[];
  keyword_density_score: number;  // 0-100
}

export interface ResumeReadinessScore {
  overall_score: number;  // 0-100
  breakdown: {
    metrics_score: number;      // 0-25 - quantifiable achievements
    action_verbs_score: number; // 0-25 - strong action verbs
    keywords_score: number;     // 0-30 - ATS keyword coverage
    format_score: number;       // 0-20 - clarity and format
  };
  improvement_potential: {
    action: string;
    potential_gain: number;
  }[];
}

export interface ResumeSuggestions {
  // New fields for redesigned Resume tab
  resume_gaps: ResumeGap[];
  bullet_improvements: BulletImprovement[];
  ats_analysis: ATSKeywordAnalysis;
  readiness_score: ResumeReadinessScore;
  
  // Legacy fields for backward compatibility
  improved_bullets: ImprovedBullet[];
  new_bullets: NewBullet[];
  keywords_to_add: string[];
  ats_score: number;
}

export interface ImprovedBullet {
  original: string;
  improved: string;
  changes_made: string[];
  keywords_added: string[];
}

export interface NewBullet {
  bullet: string;
  relevant_skill: string;
  disclaimer: string;
}

export interface ProjectRecommendations {
  projects: RecommendedProject[];
  strategy: string;
}

export interface RecommendedProject {
  id: string;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  estimated_hours: number;
  tech_stack: string[];
  skills_demonstrated: string[];
  why_recommended: string;
  features: string[];
  github_structure: string[];
  learning_outcomes: string[];
}

export interface GitHubTasks {
  repo_name: string;
  repo_description: string;
  issues: GitHubIssue[];
  labels: GitHubLabel[];
  milestones: GitHubMilestone[];
}

export interface GitHubIssue {
  title: string;
  body: string;
  labels: string[];
  milestone: string | null;
  checklist: string[];
  priority: PriorityLevel;
  estimated_hours: number;
}

export interface GitHubLabel {
  name: string;
  color: string;
  description: string;
}

export interface GitHubMilestone {
  title: string;
  description: string;
  due_on: string | null;
}

export interface PortfolioUpdates {
  skills_to_add: PortfolioSkill[];
  skills_to_highlight: string[];
  bio_update: string | null;
  headline_update: string | null;
  projects_to_feature: string[];
}

// =====================================================
// API REQUEST/RESPONSE TYPES
// =====================================================

export interface ExtractJDRequest {
  job_url?: string;
  job_text?: string;
  job_pdf_base64?: string;
}

export interface ExtractJDResponse {
  success: boolean;
  job_request_id?: string;
  parsed_job?: ParsedJobDescription;
  error?: string;
}

export interface AnalyzeProfileRequest {
  resume_text?: string;
  resume_pdf_base64?: string;
  github_username?: string;
  force_refresh?: boolean;
}

export interface AnalyzeProfileResponse {
  success: boolean;
  skills: UserSkill[];
  github_data?: GitHubData;
  error?: string;
}

export interface SkillGapRequest {
  job_request_id: string;
}

export interface SkillGapResponse {
  success: boolean;
  skill_gap?: SkillGapAnalysis;
  error?: string;
}

export interface GenerateAllRequest {
  job_request_id: string;
  weekly_hours_available?: number;
  include_roadmap?: boolean;
  include_resume?: boolean;
  include_projects?: boolean;
  include_github_tasks?: boolean;
  include_portfolio?: boolean;
}

export interface GenerateAllResponse {
  success: boolean;
  analysis_result_id?: string;
  result?: CompleteAnalysisOutput;
  error?: string;
}

export interface ApplyUpdatesRequest {
  analysis_result_id: string;
  apply_to_github?: boolean;
  apply_to_portfolio?: boolean;
  github_repo_name?: string;
}

export interface ApplyUpdatesResponse {
  success: boolean;
  github_issues_created?: number;
  portfolio_updated?: boolean;
  error?: string;
}

// =====================================================
// COMPLETE SYSTEM OUTPUT
// =====================================================

export interface CompleteAnalysisOutput {
  job_request_id: string;
  job_analysis: ParsedJobDescription;
  skill_gap: SkillGapAnalysis;
  roadmap: LearningRoadmap;
  resume_suggestions: ResumeSuggestions;
  recommended_projects: ProjectRecommendations;
  github_tasks: GitHubTasks;
  portfolio_updates: PortfolioUpdates;
  generated_at: string;
}

// =====================================================
// FRONTEND-FRIENDLY RESPONSE TYPES
// =====================================================

export interface FullAnalysisResponse {
  job_analysis: {
    job_title: string;
    company: string;
    experience_level: string;
    core_skills: string[];
    tools: string[];
    responsibilities: string[];
    ats_keywords: string[];
  };
  skill_gap: {
    match_percentage: number;
    matching_skills: string[];
    missing_skills: Array<{
      skill: string;
      priority: PriorityLevel;
      estimated_hours: number;
    }>;
  };
  roadmap: {
    total_weeks: number;
    total_hours: number;
    hours_per_week: number;
    weekly_plan: Array<{
      week: number;
      focus_skill: string;
      tasks: Array<{
        title: string;
        description: string;
        hours: number;
      }>;
      resources: Array<{
        title: string;
        url: string;
        type: string;
      }>;
    }>;
  };
  resume_suggestions: {
    // New enhanced fields for redesigned Resume tab
    resume_gaps?: ResumeGap[];
    bullet_improvements?: BulletImprovement[];
    ats_analysis?: ATSKeywordAnalysis;
    readiness_score?: ResumeReadinessScore;
    // Legacy fields
    improved_bullets: Array<{
      original: string;
      improved: string;
      keywords_added: string[];
    }>;
    ats_keywords: string[];
  };
  recommended_projects: {
    projects: Array<{
      name: string;
      description: string;
      tech_stack: string[];
      difficulty: DifficultyLevel;
      estimated_hours: number;
      skills_demonstrated: string[];
      features: string[];
      why_recommended?: string;
      learning_outcomes?: string[];
    }>;
  };
  github_tasks: {
    repo_name: string;
    repo_description: string;
    issues: Array<{
      title: string;
      body: string;
      labels: string[];
      milestone?: string | null;
      checklist: string[];
      priority: PriorityLevel;
      estimated_hours?: number;
    }>;
    labels: Array<{
      name: string;
      color: string;
      description: string;
    }>;
    milestones: Array<{
      title: string;
      description: string;
      due_on: string | null;
    }>;
  };
  portfolio_updates: {
    skills_to_add: Array<{
      name: string;
      category: string;
      proficiency?: ProficiencyLevel;
    }>;
    bio_suggestion: string | null;
    headline_suggestion: string | null;
  };
}

export interface UserSkillProfile {
  skills: Array<{
    name: string;
    category: SkillCategory;
    confidence: number;
    source: SkillSource;
  }>;
  experience_years: number;
  github_languages: string[];
  total_repos: number;
}
