// =====================================================
// PORTFOLIO UPDATER
// Generates portfolio update suggestions
// =====================================================

import {
    ParsedJobDescription,
    PortfolioSkill,
    PortfolioUpdates,
    ProficiencyLevel,
    SkillGapAnalysis,
    UserSkill
} from '@/types';
import { getSkillEntry } from './skill-taxonomy';

// =====================================================
// SKILL PRIORITY FOR PORTFOLIO
// =====================================================

function determineHighlightPriority(
  skill: UserSkill,
  jobSkills: string[]
): number {
  let priority = 0;
  
  // Skill matches job requirements
  if (jobSkills.map(s => s.toLowerCase()).includes(skill.skill_name.toLowerCase())) {
    priority += 50;
  }
  
  // Skill is verified (from GitHub)
  if (skill.is_verified) {
    priority += 20;
  }
  
  // Higher proficiency = higher priority
  const proficiencyBonus: Record<ProficiencyLevel, number> = {
    'beginner': 5,
    'intermediate': 10,
    'advanced': 20,
    'expert': 30,
  };
  priority += proficiencyBonus[skill.proficiency_level] || 0;
  
  // Hot skill bonus
  const entry = getSkillEntry(skill.skill_name);
  if (entry?.isHot) {
    priority += 15;
  }
  
  return priority;
}

// =====================================================
// HEADLINE GENERATION
// =====================================================

const HEADLINE_TEMPLATES = [
  '{primary_skill} Developer | {secondary_skills}',
  '{role} specializing in {primary_skill} & {secondary_skill}',
  '{experience_level} {role} | {tech_stack}',
  'Building with {primary_skill}, {secondary_skill}, and {tertiary_skill}',
];

function generateHeadlineSuggestion(
  userSkills: UserSkill[],
  jobTitle: string,
  experienceLevel: string
): string | null {
  // Get top skills by proficiency
  const topSkills = userSkills
    .filter(s => s.skill_category !== 'soft_skill')
    .sort((a, b) => {
      const profOrder = ['expert', 'advanced', 'intermediate', 'beginner'];
      return profOrder.indexOf(a.proficiency_level) - profOrder.indexOf(b.proficiency_level);
    })
    .slice(0, 4);
  
  if (topSkills.length < 2) return null;
  
  // Determine role
  const hasReact = topSkills.some(s => ['React', 'Vue.js', 'Angular'].includes(s.skill_name));
  const hasBackend = topSkills.some(s => ['Node.js', 'Python', 'Java', 'Go'].includes(s.skill_name));
  const hasDevOps = topSkills.some(s => ['Docker', 'Kubernetes', 'AWS', 'Azure'].includes(s.skill_name));
  
  let role = 'Software Developer';
  if (hasReact && hasBackend) role = 'Full-Stack Developer';
  else if (hasReact) role = 'Frontend Developer';
  else if (hasBackend) role = 'Backend Developer';
  else if (hasDevOps) role = 'DevOps Engineer';
  
  // Use job title if available
  if (jobTitle) {
    role = jobTitle.replace(/(?:senior|junior|lead|principal|staff)\s*/gi, '').trim();
  }
  
  // Format experience level
  const levelMap: Record<string, string> = {
    'entry': 'Junior',
    'mid': '',
    'senior': 'Senior',
    'lead': 'Lead',
    'principal': 'Principal',
  };
  const level = levelMap[experienceLevel] || '';
  
  // Build headline
  const template = HEADLINE_TEMPLATES[Math.floor(Math.random() * HEADLINE_TEMPLATES.length)];
  
  return template
    .replace('{primary_skill}', topSkills[0]?.skill_name || '')
    .replace('{secondary_skill}', topSkills[1]?.skill_name || '')
    .replace('{secondary_skills}', topSkills.slice(1, 3).map(s => s.skill_name).join(' & '))
    .replace('{tertiary_skill}', topSkills[2]?.skill_name || topSkills[1]?.skill_name || '')
    .replace('{role}', role)
    .replace('{experience_level}', level)
    .replace('{tech_stack}', topSkills.slice(0, 3).map(s => s.skill_name).join(', '))
    .replace(/\s+/g, ' ')
    .trim();
}

// =====================================================
// BIO GENERATION
// =====================================================

const BIO_TEMPLATES = [
  `Passionate {role} with experience in {skills}. I love building {project_types} that {impact}. Currently focused on {focus_areas}.`,
  `{role} who thrives on turning complex problems into elegant solutions using {skills}. Experienced in {experience_areas}.`,
  `I build {project_types} with {skills}. {years_text}focused on creating impactful software that {impact}.`,
];

function generateBioSuggestion(
  userSkills: UserSkill[],
  jobTitle: string
): string | null {
  const topSkills = userSkills
    .filter(s => s.skill_category !== 'soft_skill')
    .slice(0, 5);
  
  if (topSkills.length < 2) return null;
  
  // Determine role
  const hasReact = topSkills.some(s => ['React', 'Vue.js', 'Angular', 'Next.js'].includes(s.skill_name));
  const hasBackend = topSkills.some(s => ['Node.js', 'Python', 'Java', 'Go'].includes(s.skill_name));
  
  let role = 'Software Developer';
  if (hasReact && hasBackend) role = 'Full-Stack Developer';
  else if (hasReact) role = 'Frontend Developer';
  else if (hasBackend) role = 'Backend Developer';
  
  if (jobTitle) {
    role = jobTitle;
  }
  
  // Determine project types based on skills
  const projectTypes: string[] = [];
  if (topSkills.some(s => ['React', 'Next.js', 'Vue.js'].includes(s.skill_name))) {
    projectTypes.push('modern web applications');
  }
  if (topSkills.some(s => ['Node.js', 'Express.js', 'FastAPI'].includes(s.skill_name))) {
    projectTypes.push('scalable APIs');
  }
  if (topSkills.some(s => ['AWS', 'Azure', 'GCP', 'Docker'].includes(s.skill_name))) {
    projectTypes.push('cloud-native solutions');
  }
  
  const template = BIO_TEMPLATES[Math.floor(Math.random() * BIO_TEMPLATES.length)];
  
  // Calculate years experience
  const maxYears = Math.max(...topSkills.map(s => s.years_experience || 0));
  const yearsText = maxYears > 0 ? `With ${maxYears}+ years of experience, ` : '';
  
  return template
    .replace('{role}', role)
    .replace('{skills}', topSkills.slice(0, 3).map(s => s.skill_name).join(', '))
    .replace('{project_types}', projectTypes.slice(0, 2).join(' and ') || 'software solutions')
    .replace('{impact}', 'solve real problems')
    .replace('{focus_areas}', topSkills.slice(0, 2).map(s => s.skill_name).join(' and '))
    .replace('{experience_areas}', projectTypes.join(', ') || 'building software')
    .replace('{years_text}', yearsText)
    .trim();
}

// =====================================================
// MAIN FUNCTION
// =====================================================

export function generatePortfolioUpdates(
  skillGap: SkillGapAnalysis,
  userSkills: UserSkill[],
  parsedJob: ParsedJobDescription
): PortfolioUpdates {
  // Get job skill names for matching
  const jobSkillNames = [
    ...parsedJob.core_skills.map(s => s.canonical_name),
    ...parsedJob.nice_to_have_skills.map(s => s.canonical_name),
  ];
  
  // Determine skills to add (from matching skills user has)
  const skillsToAdd: PortfolioSkill[] = [];
  
  for (const match of skillGap.matching_skills) {
    const userSkill = userSkills.find(s => 
      s.skill_name.toLowerCase() === match.skill_name.toLowerCase()
    );
    
    if (userSkill) {
      const entry = getSkillEntry(match.skill_name);
      skillsToAdd.push({
        name: match.skill_name,
        category: userSkill.skill_category || entry?.category || 'tool',
        level: userSkill.proficiency_level,
      });
    }
  }
  
  // Sort skills by priority for highlighting
  const rankedSkills = userSkills
    .map(skill => ({
      skill,
      priority: determineHighlightPriority(skill, jobSkillNames),
    }))
    .sort((a, b) => b.priority - a.priority);
  
  // Top skills to highlight (that match job requirements)
  const skillsToHighlight = rankedSkills
    .filter(({ skill }) => 
      jobSkillNames.map(s => s.toLowerCase()).includes(skill.skill_name.toLowerCase())
    )
    .slice(0, 5)
    .map(({ skill }) => skill.skill_name);
  
  // Generate headline suggestion
  const headlineUpdate = generateHeadlineSuggestion(
    userSkills,
    parsedJob.job_title,
    parsedJob.experience_level
  );
  
  // Generate bio suggestion
  const bioUpdate = generateBioSuggestion(
    userSkills,
    parsedJob.job_title
  );
  
  // Determine projects to feature (those that demonstrate job-relevant skills)
  const projectsToFeature = skillsToHighlight.slice(0, 3);
  
  return {
    skills_to_add: skillsToAdd.slice(0, 10),
    skills_to_highlight: skillsToHighlight,
    bio_update: bioUpdate,
    headline_update: headlineUpdate,
    projects_to_feature: projectsToFeature,
  };
}

// =====================================================
// PORTFOLIO SYNC HELPERS
// =====================================================

export interface PortfolioSyncResult {
  skillsAdded: number;
  skillsUpdated: number;
  bioUpdated: boolean;
  headlineUpdated: boolean;
}

export function mergePortfolioUpdates(
  currentData: Record<string, unknown>,
  updates: PortfolioUpdates
): Record<string, unknown> {
  const merged = { ...currentData };
  
  // Merge skills
  const currentSkills = (merged.skills as PortfolioSkill[]) || [];
  const currentSkillNames = new Set(currentSkills.map(s => s.name.toLowerCase()));
  
  for (const newSkill of updates.skills_to_add) {
    if (!currentSkillNames.has(newSkill.name.toLowerCase())) {
      currentSkills.push(newSkill);
    }
  }
  merged.skills = currentSkills;
  
  // Update bio if provided
  if (updates.bio_update && !merged.bio) {
    merged.bio = updates.bio_update;
  }
  
  // Update headline if provided
  if (updates.headline_update && !merged.headline) {
    merged.headline = updates.headline_update;
  }
  
  return merged;
}
