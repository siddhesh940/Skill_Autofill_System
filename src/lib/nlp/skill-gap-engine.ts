// =====================================================
// SKILL GAP ENGINE
// Compares JD requirements vs user skills
// =====================================================

import {
    AnalyzedSkill,
    MissingSkill,
    ParsedJobDescription,
    PriorityLevel,
    ProficiencyLevel,
    SkillCategory,
    SkillGapAnalysis,
    SkillMatch,
    UserSkill,
} from '@/types';
import { getSkillEntry, SKILL_TAXONOMY } from './skill-taxonomy';

// =====================================================
// PRIORITY SCORING RULES
// =====================================================

interface PriorityFactors {
  isRequired: boolean;
  frequency: number;
  categoryWeight: number;
  isHotSkill: boolean;
  hasRelatedSkills: boolean;
}

function calculatePriorityScore(factors: PriorityFactors): number {
  let score = 0;
  
  // Required skills get base score of 50
  if (factors.isRequired) score += 50;
  
  // Frequency bonus (max 20)
  score += Math.min(factors.frequency * 5, 20);
  
  // Category weight (0-1 scaled to 0-15)
  score += factors.categoryWeight * 15;
  
  // Hot skill bonus
  if (factors.isHotSkill) score += 10;
  
  // Related skills penalty (user has foundation)
  if (factors.hasRelatedSkills) score -= 10;
  
  return Math.max(0, Math.min(100, score));
}

function scoreToPriority(score: number): PriorityLevel {
  if (score >= 60) return 'high';
  if (score >= 35) return 'medium';
  return 'low';
}

// =====================================================
// PROFICIENCY COMPARISON
// =====================================================

const PROFICIENCY_ORDER: ProficiencyLevel[] = ['beginner', 'intermediate', 'advanced', 'expert'];

function compareProficiency(
  userLevel: ProficiencyLevel,
  requiredLevel: ProficiencyLevel
): 'exact' | 'partial' | 'exceeds' {
  const userIndex = PROFICIENCY_ORDER.indexOf(userLevel);
  const reqIndex = PROFICIENCY_ORDER.indexOf(requiredLevel);
  
  if (userIndex === reqIndex) return 'exact';
  if (userIndex > reqIndex) return 'exceeds';
  return 'partial';
}

function inferRequiredProficiency(experienceLevel: string, yearsMin: number): ProficiencyLevel {
  if (experienceLevel === 'entry' || yearsMin <= 1) return 'beginner';
  if (experienceLevel === 'mid' || yearsMin <= 3) return 'intermediate';
  if (experienceLevel === 'senior' || yearsMin <= 7) return 'advanced';
  return 'expert';
}

// =====================================================
// RELATED SKILLS DETECTION
// =====================================================

function findRelatedSkills(skillName: string, userSkills: UserSkill[]): string[] {
  const entry = getSkillEntry(skillName);
  if (!entry) return [];
  
  const related: string[] = [];
  const userSkillNames = new Set(userSkills.map(s => s.skill_name.toLowerCase()));
  
  // Check for parent-child relationships
  for (const taxonomy of SKILL_TAXONOMY) {
    if (taxonomy.parent === skillName && userSkillNames.has(taxonomy.canonical.toLowerCase())) {
      related.push(taxonomy.canonical);
    }
    if (entry.parent === taxonomy.canonical && userSkillNames.has(taxonomy.canonical.toLowerCase())) {
      related.push(taxonomy.canonical);
    }
  }
  
  // Check same category skills
  for (const taxonomy of SKILL_TAXONOMY) {
    if (
      taxonomy.category === entry.category &&
      taxonomy.canonical !== skillName &&
      userSkillNames.has(taxonomy.canonical.toLowerCase())
    ) {
      related.push(taxonomy.canonical);
    }
  }
  
  return related.slice(0, 3); // Return max 3 related skills
}

// =====================================================
// LEARNING TIME ESTIMATION
// =====================================================

const SKILL_LEARNING_WEEKS: Record<SkillCategory, number> = {
  language: 4,
  framework: 3,
  runtime: 2,
  database: 3,
  cloud: 4,
  devops: 3,
  tool: 2,
  concept: 2,
  soft_skill: 4,
};

function estimateLearningWeeks(skill: string, hasRelated: boolean): number {
  const entry = getSkillEntry(skill);
  const baseWeeks = entry ? SKILL_LEARNING_WEEKS[entry.category] : 3;
  
  // Reduce time if user has related skills
  if (hasRelated) return Math.max(1, baseWeeks - 1);
  
  return baseWeeks;
}

// =====================================================
// MAIN SKILL GAP ANALYSIS
// =====================================================

export function analyzeSkillGap(
  parsedJob: ParsedJobDescription,
  userSkills: UserSkill[]
): SkillGapAnalysis {
  // Prepare user skill lookup
  const userSkillMap = new Map<string, UserSkill>();
  userSkills.forEach(skill => {
    userSkillMap.set(skill.skill_name.toLowerCase(), skill);
  });
  
  // Infer required proficiency from job level
  const requiredProficiency = inferRequiredProficiency(
    parsedJob.experience_level,
    parsedJob.experience_years_min
  );
  
  // Analyze required skills
  const requiredSkills: AnalyzedSkill[] = [];
  const matchingSkills: SkillMatch[] = [];
  const missingSkills: MissingSkill[] = [];
  
  // Process core skills
  for (const jdSkill of parsedJob.core_skills) {
    const entry = getSkillEntry(jdSkill.canonical_name);
    const weight = entry?.weight || 0.5;
    
    const analyzedSkill: AnalyzedSkill = {
      name: jdSkill.name,
      canonical_name: jdSkill.canonical_name,
      category: jdSkill.category,
      importance_weight: weight,
    };
    requiredSkills.push(analyzedSkill);
    
    // Check if user has this skill
    const userSkill = userSkillMap.get(jdSkill.canonical_name.toLowerCase());
    
    if (userSkill) {
      const matchQuality = compareProficiency(userSkill.proficiency_level, requiredProficiency);
      matchingSkills.push({
        skill_name: jdSkill.canonical_name,
        user_proficiency: userSkill.proficiency_level,
        required_proficiency: requiredProficiency,
        match_quality: matchQuality,
      });
    } else {
      // User doesn't have this skill
      const relatedSkills = findRelatedSkills(jdSkill.canonical_name, userSkills);
      const hasRelated = relatedSkills.length > 0;
      
      const priorityScore = calculatePriorityScore({
        isRequired: jdSkill.is_required,
        frequency: jdSkill.frequency,
        categoryWeight: weight,
        isHotSkill: entry?.isHot || false,
        hasRelatedSkills: hasRelated,
      });
      
      missingSkills.push({
        skill_name: jdSkill.canonical_name,
        category: jdSkill.category,
        priority: scoreToPriority(priorityScore),
        priority_score: priorityScore,
        reason: generateMissingReason(jdSkill, parsedJob),
        estimated_weeks: estimateLearningWeeks(jdSkill.canonical_name, hasRelated),
        related_skills: relatedSkills,
      });
    }
  }
  
  // Process nice-to-have skills (lower priority)
  for (const jdSkill of parsedJob.nice_to_have_skills) {
    const entry = getSkillEntry(jdSkill.canonical_name);
    const weight = (entry?.weight || 0.5) * 0.7; // Lower weight for nice-to-have
    
    const userSkill = userSkillMap.get(jdSkill.canonical_name.toLowerCase());
    
    if (!userSkill) {
      const relatedSkills = findRelatedSkills(jdSkill.canonical_name, userSkills);
      const hasRelated = relatedSkills.length > 0;
      
      const priorityScore = calculatePriorityScore({
        isRequired: false,
        frequency: jdSkill.frequency,
        categoryWeight: weight,
        isHotSkill: entry?.isHot || false,
        hasRelatedSkills: hasRelated,
      });
      
      // Only add if priority is medium or higher
      if (priorityScore >= 25) {
        missingSkills.push({
          skill_name: jdSkill.canonical_name,
          category: jdSkill.category,
          priority: scoreToPriority(priorityScore),
          priority_score: priorityScore,
          reason: `Nice-to-have skill that would strengthen your application`,
          estimated_weeks: estimateLearningWeeks(jdSkill.canonical_name, hasRelated),
          related_skills: relatedSkills,
        });
      }
    }
  }
  
  // Sort missing skills by priority score
  missingSkills.sort((a, b) => b.priority_score - a.priority_score);
  
  // Prepare user skills for output
  const analyzedUserSkills: AnalyzedSkill[] = userSkills.map(skill => {
    const entry = getSkillEntry(skill.skill_name);
    return {
      name: skill.skill_name,
      canonical_name: skill.skill_name,
      category: skill.skill_category || 'tool',
      importance_weight: entry?.weight || 0.5,
    };
  });
  
  // Calculate match percentage
  const totalRequired = parsedJob.core_skills.length;
  const matched = matchingSkills.filter(m => m.match_quality !== 'partial').length;
  const partialMatched = matchingSkills.filter(m => m.match_quality === 'partial').length;
  const matchPercentage = totalRequired > 0
    ? Math.round(((matched + partialMatched * 0.5) / totalRequired) * 100)
    : 0;
  
  return {
    required_skills: requiredSkills,
    user_skills: analyzedUserSkills,
    matching_skills: matchingSkills,
    missing_skills: missingSkills,
    match_percentage: matchPercentage,
  };
}

function generateMissingReason(
  skill: { canonical_name: string; frequency: number; is_required: boolean },
  job: ParsedJobDescription
): string {
  const entry = getSkillEntry(skill.canonical_name);
  
  if (skill.is_required && skill.frequency >= 3) {
    return `Core requirement mentioned ${skill.frequency} times in the job description`;
  }
  
  if (skill.is_required) {
    return `Required skill for this ${job.experience_level}-level position`;
  }
  
  if (entry?.isHot) {
    return `In-demand skill that would make you a stronger candidate`;
  }
  
  return `Would complement your existing skillset for this role`;
}

// =====================================================
// SKILL GAP SUMMARY
// =====================================================

export interface SkillGapSummary {
  matchPercentage: number;
  highPriorityCount: number;
  estimatedLearningWeeks: number;
  strongestMatches: string[];
  criticalGaps: string[];
  recommendation: string;
}

export function summarizeSkillGap(analysis: SkillGapAnalysis): SkillGapSummary {
  const highPriorityMissing = analysis.missing_skills.filter(s => s.priority === 'high');
  const excellentMatches = analysis.matching_skills.filter(s => s.match_quality === 'exceeds');
  
  const totalLearningWeeks = analysis.missing_skills
    .filter(s => s.priority !== 'low')
    .reduce((sum, s) => sum + s.estimated_weeks, 0);
  
  let recommendation: string;
  
  if (analysis.match_percentage >= 80) {
    recommendation = 'Excellent match! Focus on highlighting your relevant experience.';
  } else if (analysis.match_percentage >= 60) {
    recommendation = 'Good foundation. Address high-priority gaps to strengthen your application.';
  } else if (analysis.match_percentage >= 40) {
    recommendation = 'Moderate match. Consider upskilling before applying or emphasize transferable skills.';
  } else {
    recommendation = 'Significant skill gap. This role may require substantial learning investment.';
  }
  
  return {
    matchPercentage: analysis.match_percentage,
    highPriorityCount: highPriorityMissing.length,
    estimatedLearningWeeks: Math.ceil(totalLearningWeeks * 0.7), // Parallel learning adjustment
    strongestMatches: excellentMatches.map(m => m.skill_name),
    criticalGaps: highPriorityMissing.slice(0, 5).map(s => s.skill_name),
    recommendation,
  };
}
