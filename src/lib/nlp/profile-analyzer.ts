// =====================================================
// USER PROFILE ANALYZER
// Extracts skills from resume, GitHub, portfolio
// =====================================================

import {
    GitHubData,
    GitHubRepo,
    ProficiencyLevel,
    SkillCategory,
    SkillSource,
    UserSkill
} from '@/types';
import {
    SKILL_TAXONOMY, getSkillEntry
} from './skill-taxonomy';

// =====================================================
// RESUME TEXT PARSER
// =====================================================

interface ExtractedResumeSkill {
  skill: string;
  canonical: string;
  category: SkillCategory;
  frequency: number;
  yearsExperience: number | null;
  proficiency: ProficiencyLevel;
  confidence: number;
}

// Patterns for experience detection
const EXPERIENCE_PATTERNS = {
  yearsWithSkill: /(\d+)\+?\s*(?:years?|yrs?)\s+(?:of\s+)?(?:experience\s+(?:with|in|using))?\s*(\w+)/gi,
  skillWithYears: /(\w+)[\s,:-]+(\d+)\+?\s*(?:years?|yrs?)/gi,
  proficiencyLevel: {
    expert: /(?:expert|proficient|mastery|advanced|strong)\s+(?:in|with|knowledge)?\s*/gi,
    advanced: /(?:extensive|deep|solid|advanced)\s+(?:experience|knowledge)?\s*/gi,
    intermediate: /(?:intermediate|moderate|working knowledge|familiar)\s+(?:with|in)?\s*/gi,
    beginner: /(?:basic|beginner|learning|exposure)\s+(?:knowledge|experience)?\s*/gi,
  },
};

// Section detection patterns
const RESUME_SECTIONS = {
  skills: /(?:technical\s+)?skills?|technologies|expertise|proficiencies/gi,
  experience: /(?:work\s+)?experience|employment|career\s+history/gi,
  projects: /projects?|portfolio/gi,
  education: /education|academic|degree/gi,
  certifications: /certifications?|licenses?|credentials/gi,
};

function detectProficiencyFromContext(context: string, frequency: number): ProficiencyLevel {
  const lowerContext = context.toLowerCase();
  
  // Check explicit proficiency markers
  if (EXPERIENCE_PATTERNS.proficiencyLevel.expert.test(lowerContext)) return 'expert';
  if (EXPERIENCE_PATTERNS.proficiencyLevel.advanced.test(lowerContext)) return 'advanced';
  if (EXPERIENCE_PATTERNS.proficiencyLevel.beginner.test(lowerContext)) return 'beginner';
  
  // Reset regex lastIndex
  Object.values(EXPERIENCE_PATTERNS.proficiencyLevel).forEach(r => r.lastIndex = 0);
  
  // Infer from frequency
  if (frequency >= 5) return 'advanced';
  if (frequency >= 3) return 'intermediate';
  return 'intermediate'; // Default
}

function extractYearsExperience(text: string, skillName: string): number | null {
  const escapedSkill = skillName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Pattern: "5 years of React experience" or "React: 5 years"
  const patterns = [
    new RegExp(`(\\d+)\\+?\\s*(?:years?|yrs?)\\s+(?:of\\s+)?(?:experience\\s+(?:with|in)\\s+)?${escapedSkill}`, 'gi'),
    new RegExp(`${escapedSkill}[\\s,:-]+(\\d+)\\+?\\s*(?:years?|yrs?)`, 'gi'),
    new RegExp(`(\\d+)\\+?\\s*(?:years?|yrs?)\\s+${escapedSkill}`, 'gi'),
  ];
  
  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match) {
      return parseInt(match[1]);
    }
  }
  
  return null;
}

export function parseResumeText(resumeText: string): ExtractedResumeSkill[] {
  const skills: ExtractedResumeSkill[] = [];
  const skillMap = new Map<string, ExtractedResumeSkill>();
  const lowerText = resumeText.toLowerCase();
  
  // Find skills section for higher confidence
  let skillsSectionStart = -1;
  let skillsSectionEnd = resumeText.length;
  
  const skillsMatch = RESUME_SECTIONS.skills.exec(lowerText);
  if (skillsMatch) {
    skillsSectionStart = skillsMatch.index;
    // Find next section
    const sections = [RESUME_SECTIONS.experience, RESUME_SECTIONS.projects, RESUME_SECTIONS.education];
    for (const section of sections) {
      section.lastIndex = skillsMatch.index + 1;
      const nextMatch = section.exec(lowerText);
      if (nextMatch && nextMatch.index > skillsSectionStart) {
        skillsSectionEnd = Math.min(skillsSectionEnd, nextMatch.index);
      }
      section.lastIndex = 0;
    }
  }
  RESUME_SECTIONS.skills.lastIndex = 0;
  
  // Extract skills from taxonomy
  for (const entry of SKILL_TAXONOMY) {
    const allTerms = [entry.canonical, ...entry.aliases];
    
    for (const term of allTerms) {
      const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedTerm}\\b`, 'gi');
      
      let match;
      let frequency = 0;
      let inSkillsSection = false;
      
      while ((match = regex.exec(resumeText)) !== null) {
        frequency++;
        if (skillsSectionStart !== -1 && 
            match.index >= skillsSectionStart && 
            match.index < skillsSectionEnd) {
          inSkillsSection = true;
        }
      }
      
      if (frequency > 0) {
        const existing = skillMap.get(entry.canonical);
        
        if (!existing || frequency > existing.frequency) {
          // Get surrounding context for proficiency detection
          const firstMatch = resumeText.toLowerCase().indexOf(term.toLowerCase());
          const context = resumeText.slice(
            Math.max(0, firstMatch - 50),
            Math.min(resumeText.length, firstMatch + term.length + 100)
          );
          
          const yearsExp = extractYearsExperience(resumeText, entry.canonical);
          const proficiency = yearsExp 
            ? (yearsExp >= 5 ? 'expert' : yearsExp >= 3 ? 'advanced' : yearsExp >= 1 ? 'intermediate' : 'beginner')
            : detectProficiencyFromContext(context, frequency);
          
          // Calculate confidence score
          let confidence = 0.7; // Base confidence
          if (inSkillsSection) confidence += 0.2;
          if (yearsExp) confidence += 0.1;
          confidence = Math.min(1.0, confidence);
          
          skillMap.set(entry.canonical, {
            skill: entry.canonical,
            canonical: entry.canonical,
            category: entry.category,
            frequency,
            yearsExperience: yearsExp,
            proficiency,
            confidence,
          });
        }
      }
    }
  }
  
  return Array.from(skillMap.values()).sort((a, b) => b.confidence - a.confidence);
}

// =====================================================
// GITHUB DATA ANALYZER
// =====================================================

// Language to skill mapping
const LANGUAGE_TO_SKILL: Record<string, string> = {
  'JavaScript': 'JavaScript',
  'TypeScript': 'TypeScript',
  'Python': 'Python',
  'Java': 'Java',
  'C++': 'C++',
  'C#': 'C#',
  'Go': 'Go',
  'Rust': 'Rust',
  'Ruby': 'Ruby',
  'PHP': 'PHP',
  'Swift': 'Swift',
  'Kotlin': 'Kotlin',
  'Scala': 'Scala',
  'HTML': 'HTML',
  'CSS': 'CSS',
  'SCSS': 'SASS',
  'Shell': 'Linux',
  'Dockerfile': 'Docker',
};

// Topics to skill mapping (GitHub topics)
const TOPIC_TO_SKILL: Record<string, string> = {
  'react': 'React',
  'reactjs': 'React',
  'nextjs': 'Next.js',
  'next': 'Next.js',
  'vue': 'Vue.js',
  'vuejs': 'Vue.js',
  'angular': 'Angular',
  'svelte': 'Svelte',
  'nodejs': 'Node.js',
  'node': 'Node.js',
  'express': 'Express.js',
  'fastapi': 'FastAPI',
  'django': 'Django',
  'flask': 'Flask',
  'spring': 'Spring Boot',
  'springboot': 'Spring Boot',
  'postgresql': 'PostgreSQL',
  'postgres': 'PostgreSQL',
  'mongodb': 'MongoDB',
  'mysql': 'MySQL',
  'redis': 'Redis',
  'docker': 'Docker',
  'kubernetes': 'Kubernetes',
  'k8s': 'Kubernetes',
  'aws': 'AWS',
  'azure': 'Azure',
  'gcp': 'GCP',
  'graphql': 'GraphQL',
  'rest-api': 'REST API',
  'typescript': 'TypeScript',
  'tailwindcss': 'TailwindCSS',
  'tailwind': 'TailwindCSS',
  'prisma': 'Prisma',
  'supabase': 'Supabase',
  'firebase': 'Firebase',
  'jest': 'Jest',
  'cypress': 'Cypress',
  'terraform': 'Terraform',
  'ci-cd': 'CI/CD',
  'machine-learning': 'Machine Learning',
  'ml': 'Machine Learning',
  'tensorflow': 'TensorFlow',
  'pytorch': 'PyTorch',
};

export interface GitHubSkillAnalysis {
  skills: ExtractedResumeSkill[];
  languageBreakdown: Record<string, number>;
  topRepos: GitHubRepo[];
}

export function analyzeGitHubData(data: GitHubData): GitHubSkillAnalysis {
  const skillMap = new Map<string, ExtractedResumeSkill>();
  const languageBytes: Record<string, number> = {};
  
  // Aggregate languages across all repos
  for (const repo of data.repos) {
    // Skip forks for skill analysis
    if (repo.is_fork) continue;
    
    // Process languages
    if (repo.language && LANGUAGE_TO_SKILL[repo.language]) {
      const skillName = LANGUAGE_TO_SKILL[repo.language];
      const bytes = repo.languages[repo.language] || 0;
      languageBytes[skillName] = (languageBytes[skillName] || 0) + bytes;
      
      updateSkillMap(skillMap, skillName, repo.stars);
    }
    
    // Process all languages in repo
    for (const [lang, bytes] of Object.entries(repo.languages)) {
      if (LANGUAGE_TO_SKILL[lang]) {
        const skillName = LANGUAGE_TO_SKILL[lang];
        languageBytes[skillName] = (languageBytes[skillName] || 0) + bytes;
        updateSkillMap(skillMap, skillName, 0);
      }
    }
    
    // Process topics
    for (const topic of repo.topics) {
      const lowerTopic = topic.toLowerCase();
      if (TOPIC_TO_SKILL[lowerTopic]) {
        updateSkillMap(skillMap, TOPIC_TO_SKILL[lowerTopic], repo.stars);
      }
    }
    
    // Analyze repo description for framework hints
    if (repo.description) {
      for (const entry of SKILL_TAXONOMY) {
        if (entry.category === 'framework' || entry.category === 'database') {
          const terms = [entry.canonical, ...entry.aliases];
          for (const term of terms) {
            if (repo.description.toLowerCase().includes(term.toLowerCase())) {
              updateSkillMap(skillMap, entry.canonical, repo.stars);
              break;
            }
          }
        }
      }
    }
  }
  
  // Sort repos by stars for top repos
  const topRepos = [...data.repos]
    .filter(r => !r.is_fork)
    .sort((a, b) => b.stars - a.stars)
    .slice(0, 10);
  
  return {
    skills: Array.from(skillMap.values()),
    languageBreakdown: languageBytes,
    topRepos,
  };
}

function updateSkillMap(
  map: Map<string, ExtractedResumeSkill>, 
  skillName: string, 
  stars: number
): void {
  const entry = getSkillEntry(skillName);
  if (!entry) return;
  
  const existing = map.get(skillName);
  if (existing) {
    existing.frequency++;
    // Higher stars = higher confidence
    existing.confidence = Math.min(1.0, existing.confidence + (stars > 10 ? 0.1 : 0.05));
  } else {
    map.set(skillName, {
      skill: skillName,
      canonical: entry.canonical,
      category: entry.category,
      frequency: 1,
      yearsExperience: null,
      proficiency: stars > 50 ? 'advanced' : stars > 10 ? 'intermediate' : 'beginner',
      confidence: 0.6 + (stars > 10 ? 0.2 : 0),
    });
  }
}

// =====================================================
// SKILL COMBINER
// Merges skills from multiple sources
// =====================================================

export function combineSkills(
  resumeSkills: ExtractedResumeSkill[],
  githubSkills: ExtractedResumeSkill[],
  userId: string
): UserSkill[] {
  const combined = new Map<string, UserSkill>();
  
  // Process resume skills (higher priority for experience claims)
  for (const skill of resumeSkills) {
    combined.set(skill.canonical, {
      id: '',  // Will be set by DB
      user_id: userId,
      skill_name: skill.canonical,
      skill_category: skill.category,
      proficiency_level: skill.proficiency,
      years_experience: skill.yearsExperience,
      source: 'resume' as SkillSource,
      confidence_score: skill.confidence,
      is_verified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
  
  // Merge GitHub skills
  for (const skill of githubSkills) {
    const existing = combined.get(skill.canonical);
    if (existing) {
      // Boost confidence if skill appears in both sources
      existing.confidence_score = Math.min(1.0, existing.confidence_score + 0.15);
      // GitHub can validate resume claims
      if (skill.proficiency === 'advanced' || skill.proficiency === 'expert') {
        existing.is_verified = true;
      }
    } else {
      combined.set(skill.canonical, {
        id: '',
        user_id: userId,
        skill_name: skill.canonical,
        skill_category: skill.category,
        proficiency_level: skill.proficiency,
        years_experience: skill.yearsExperience,
        source: 'github' as SkillSource,
        confidence_score: skill.confidence,
        is_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  }
  
  return Array.from(combined.values())
    .sort((a, b) => b.confidence_score - a.confidence_score);
}
