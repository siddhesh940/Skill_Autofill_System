// =====================================================
// RESUME IMPROVER
// Rule-based ATS optimization (NO AI)
// Enhanced for Resume Gap Detection
// =====================================================

import {
  ATSKeywordAnalysis,
  BulletImprovement,
  ImprovedBullet,
  NewBullet,
  ParsedJobDescription,
  PortfolioExperience,
  ResumeGap,
  ResumeGapCategory,
  ResumeGapSeverity,
  ResumeReadinessScore,
  ResumeSuggestions,
} from '@/types';

// =====================================================
// ACTION VERB PATTERNS
// =====================================================

const WEAK_VERBS = new Map<string, string>([
  ['helped', 'collaborated'],
  ['worked on', 'developed'],
  ['worked with', 'partnered with'],
  ['was responsible for', 'led'],
  ['was in charge of', 'managed'],
  ['assisted with', 'supported'],
  ['assisted in', 'contributed to'],
  ['did', 'executed'],
  ['made', 'created'],
  ['used', 'leveraged'],
  ['got', 'achieved'],
  ['had to', 'delivered'],
  ['tried to', 'initiated'],
  ['handled', 'orchestrated'],
]);

const STRONG_ACTION_VERBS = {
  technical: ['architected', 'implemented', 'engineered', 'developed', 'designed', 'built', 'created', 'automated', 'integrated', 'deployed', 'optimized', 'refactored', 'debugged', 'configured'],
  leadership: ['led', 'spearheaded', 'mentored', 'directed', 'coordinated', 'managed', 'supervised', 'guided'],
  impact: ['reduced', 'increased', 'improved', 'accelerated', 'enhanced', 'streamlined', 'transformed', 'boosted', 'maximized', 'minimized'],
  collaboration: ['collaborated', 'partnered', 'facilitated', 'liaised', 'aligned', 'synchronized'],
  analysis: ['analyzed', 'evaluated', 'assessed', 'researched', 'investigated', 'diagnosed'],
};

// =====================================================
// QUANTIFICATION PATTERNS
// =====================================================

interface QuantifiablePattern {
  pattern: RegExp;
  suggestion: string;
}

const QUANTIFIABLE_PATTERNS: QuantifiablePattern[] = [
  {
    pattern: /(?:improved|increased|enhanced)\s+(?:the\s+)?(\w+)/i,
    suggestion: 'Add percentage: "Improved {1} by X%"',
  },
  {
    pattern: /(?:reduced|decreased|cut)\s+(?:the\s+)?(\w+)/i,
    suggestion: 'Add metric: "Reduced {1} by X%"',
  },
  {
    pattern: /(?:developed|built|created)\s+(?:a\s+)?(\w+)/i,
    suggestion: 'Add scale: "Developed {1} serving X users"',
  },
  {
    pattern: /(?:managed|led)\s+(?:a\s+)?team/i,
    suggestion: 'Add team size: "Led X-person team"',
  },
];

// =====================================================
// BULLET IMPROVEMENT ENGINE
// =====================================================

interface BulletAnalysis {
  hasStrongVerb: boolean;
  hasQuantification: boolean;
  hasContext: boolean;
  hasKeywords: boolean;
  weakVerbs: string[];
  suggestions: string[];
}

function analyzeBullet(bullet: string, targetKeywords: string[]): BulletAnalysis {
  const lowerBullet = bullet.toLowerCase();
  
  const allStrongVerbs = Object.values(STRONG_ACTION_VERBS).flat();
  const hasStrongVerb = allStrongVerbs.some(verb => 
    lowerBullet.startsWith(verb) || lowerBullet.includes(` ${verb} `)
  );
  
  const hasQuantification = /\d+%|\d+x|\$\d+|\d+\s*(users?|customers?|clients?|team|projects?)/i.test(bullet);
  const hasContext = /using|with|in|via|through|leveraging/.test(lowerBullet);
  
  const matchedKeywords = targetKeywords.filter(kw => 
    lowerBullet.includes(kw.toLowerCase())
  );
  const hasKeywords = matchedKeywords.length > 0;
  
  const weakVerbs: string[] = [];
  WEAK_VERBS.forEach((_, weak) => {
    if (lowerBullet.includes(weak)) {
      weakVerbs.push(weak);
    }
  });
  
  const suggestions: string[] = [];
  
  if (!hasStrongVerb) {
    suggestions.push('Start with a strong action verb');
  }
  
  if (!hasQuantification) {
    for (const { pattern, suggestion } of QUANTIFIABLE_PATTERNS) {
      if (pattern.test(bullet)) {
        suggestions.push(suggestion);
        break;
      }
    }
    if (suggestions.length === 0 || !suggestions.includes(suggestions[suggestions.length - 1])) {
      suggestions.push('Add metrics or quantifiable results');
    }
  }
  
  if (!hasContext) {
    suggestions.push('Add technologies or tools used');
  }
  
  if (!hasKeywords && targetKeywords.length > 0) {
    suggestions.push(`Consider adding relevant keywords: ${targetKeywords.slice(0, 3).join(', ')}`);
  }
  
  return {
    hasStrongVerb,
    hasQuantification,
    hasContext,
    hasKeywords,
    weakVerbs,
    suggestions,
  };
}

function improveBullet(
  bullet: string, 
  _analysis: BulletAnalysis, 
  targetKeywords: string[]
): { improved: string; changes: string[] } {
  let improved = bullet.trim();
  const changes: string[] = [];
  
  for (const [weak, strong] of WEAK_VERBS) {
    const regex = new RegExp(`^${weak}\\b`, 'i');
    if (regex.test(improved)) {
      const capitalized = strong.charAt(0).toUpperCase() + strong.slice(1);
      improved = improved.replace(regex, capitalized);
      changes.push(`Replaced "${weak}" with "${strong}"`);
    }
  }
  
  improved = improved.charAt(0).toUpperCase() + improved.slice(1);
  
  if (!improved.endsWith('.') && !improved.endsWith('!')) {
    improved += '.';
  }
  
  const lowerImproved = improved.toLowerCase();
  const missingKeywords = targetKeywords.filter(kw => 
    !lowerImproved.includes(kw.toLowerCase())
  );
  
  if (missingKeywords.length > 0 && /using|with|leveraging/.test(lowerImproved)) {
    const insertPoint = improved.search(/\s+(using|with|leveraging)\s+/i);
    if (insertPoint > 0) {
      const relevantKeyword = missingKeywords[0];
      changes.push(`Consider mentioning: ${relevantKeyword}`);
    }
  }
  
  return { improved, changes };
}

// =====================================================
// NEW BULLET GENERATION
// =====================================================

interface BulletTemplate {
  template: string;
  category: string;
  skills: string[];
}

const BULLET_TEMPLATES: BulletTemplate[] = [
  {
    template: 'Developed {app_type} using {tech_stack}, resulting in {outcome}',
    category: 'development',
    skills: ['React', 'Vue.js', 'Angular', 'Next.js', 'Node.js'],
  },
  {
    template: 'Designed and implemented {feature} with {technology}, improving {metric}',
    category: 'feature',
    skills: ['REST API', 'GraphQL', 'WebSockets', 'Microservices'],
  },
  {
    template: 'Collaborated with {team_type} team to deliver {project} using {methodology}',
    category: 'collaboration',
    skills: ['Agile', 'Scrum', 'Team Collaboration'],
  },
  {
    template: 'Optimized {system} performance by implementing {technique}, achieving {result}',
    category: 'optimization',
    skills: ['PostgreSQL', 'Redis', 'Docker', 'Kubernetes'],
  },
  {
    template: 'Built and maintained {infrastructure} on {platform}, ensuring {quality}',
    category: 'devops',
    skills: ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD'],
  },
];

function generateSuggestedBullets(
  targetKeywords: string[],
  existingSkills: string[]
): NewBullet[] {
  const suggestions: NewBullet[] = [];
  
  for (const template of BULLET_TEMPLATES) {
    const matchingSkills = template.skills.filter(s => 
      targetKeywords.includes(s) || existingSkills.includes(s)
    );
    
    if (matchingSkills.length > 0) {
      const skill = matchingSkills[0];
      let bullet = template.template
        .replace('{tech_stack}', skill)
        .replace('{technology}', skill)
        .replace('{platform}', skill);
      
      bullet = bullet
        .replace('{app_type}', '[describe application]')
        .replace('{feature}', '[describe feature]')
        .replace('{outcome}', '[add quantifiable outcome]')
        .replace('{metric}', '[add metric, e.g., "response time by 40%"]')
        .replace('{team_type}', 'cross-functional')
        .replace('{project}', '[project name]')
        .replace('{methodology}', 'Agile')
        .replace('{system}', '[system/component]')
        .replace('{technique}', '[optimization technique]')
        .replace('{result}', '[measurable result]')
        .replace('{infrastructure}', '[infrastructure type]')
        .replace('{quality}', '[quality metric, e.g., "99.9% uptime"]');
      
      suggestions.push({
        bullet,
        relevant_skill: skill,
        disclaimer: 'Template only - customize with your actual experience.',
      });
    }
    
    if (suggestions.length >= 5) break;
  }
  
  return suggestions;
}

// =====================================================
// RESUME GAP DETECTION ENGINE
// =====================================================

function generateGapId(): string {
  return `gap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}


function getRoleTerminology(jobTitle: string): string[] {
  const title = jobTitle.toLowerCase();
  
  if (title.includes('frontend') || title.includes('front-end') || title.includes('front end')) {
    return ['component', 'responsive', 'accessibility', 'state management', 'UI/UX', 'webpack', 'performance', 'CSS', 'DOM'];
  }
  if (title.includes('backend') || title.includes('back-end') || title.includes('back end')) {
    return ['API', 'database', 'microservices', 'scalability', 'authentication', 'caching', 'REST', 'security'];
  }
  if (title.includes('fullstack') || title.includes('full-stack') || title.includes('full stack')) {
    return ['API', 'component', 'database', 'deployment', 'responsive', 'authentication', 'full-stack'];
  }
  if (title.includes('devops') || title.includes('sre')) {
    return ['CI/CD', 'infrastructure', 'monitoring', 'containerization', 'automation', 'deployment', 'reliability'];
  }
  if (title.includes('data') || title.includes('ml') || title.includes('machine learning')) {
    return ['pipeline', 'model', 'analysis', 'visualization', 'ETL', 'training', 'prediction'];
  }
  
  return ['developed', 'implemented', 'collaborated', 'optimized', 'delivered'];
}

// =====================================================
// BULLET IMPROVEMENT GENERATOR (SAFE & FOCUSED)
// Only generates 2-3 minor, truthful improvements
// =====================================================

function generateBulletImprovements(
  bullets: string[],
  _targetKeywords: string[]
): BulletImprovement[] {
  const improvements: BulletImprovement[] = [];
  
  // Filter to only valid experience/project bullets
  const validBullets = bullets.filter(b => {
    // Skip if too long (likely concatenated/paragraph content)
    if (b.length > 300) return false;
    // Skip if it looks like education or skills
    if (isEducationOrCertification(b)) return false;
    if (isSkillsSection(b)) return false;
    // Must look like an experience/project bullet
    return isExperienceOrProjectBullet(b);
  });
  
  // If no valid bullets found, return empty array
  if (validBullets.length === 0) {
    return [];
  }
  
  for (const bullet of validBullets) {
    // Skip if already well-written
    const hasWeakVerb = Array.from(WEAK_VERBS.keys()).some(weak => 
      bullet.toLowerCase().startsWith(weak) || 
      new RegExp(`^${weak}\\b`, 'i').test(bullet)
    );
    
    if (!hasWeakVerb) {
      continue; // Already uses good verbs, skip
    }

    let improved = bullet.trim();
    const changes: string[] = [];
    let improvementType: 'metrics' | 'verb' | 'keyword' | 'clarity' = 'verb';

    // ONLY replace weak verbs at the start - no other modifications
    for (const [weak, strong] of WEAK_VERBS) {
      const regex = new RegExp(`^${weak}\\b`, 'i');
      if (regex.test(improved)) {
        const capitalized = strong.charAt(0).toUpperCase() + strong.slice(1);
        improved = improved.replace(regex, capitalized);
        changes.push(`Replaced "${weak}" with stronger verb "${strong}"`);
        break; // Only one verb replacement per bullet
      }
    }

    // Ensure proper capitalization and punctuation
    improved = improved.charAt(0).toUpperCase() + improved.slice(1);
    if (!improved.endsWith('.') && !improved.endsWith('!')) {
      improved += '.';
    }

    // Only add if we actually made a meaningful change
    if (changes.length > 0 && improved !== bullet && improved.length <= 300) {
      improvements.push({
        original: bullet.length > 200 ? bullet.substring(0, 200) + '...' : bullet,
        improved: improved.length > 200 ? improved.substring(0, 200) + '...' : improved,
        changes,
        improvement_type: improvementType,
      });
    }

    // STRICT: Maximum 2-3 improvements only
    if (improvements.length >= 2) break;
  }

  return improvements;
}

// =====================================================
// ATS KEYWORD ANALYSIS (ENHANCED)
// =====================================================


// =====================================================
// RESUME READINESS SCORE
// =====================================================


// =====================================================
// ATS SCORE CALCULATION (LEGACY)
// =====================================================

function calculateATSScore(
  bullets: string[],
  targetKeywords: string[]
): number {
  if (bullets.length === 0 || targetKeywords.length === 0) return 0;
  
  let score = 0;
  const allText = bullets.join(' ').toLowerCase();
  
  const matchedKeywords = targetKeywords.filter(kw => 
    allText.includes(kw.toLowerCase())
  );
  const keywordScore = (matchedKeywords.length / targetKeywords.length) * 40;
  score += keywordScore;
  
  const allStrongVerbs = Object.values(STRONG_ACTION_VERBS).flat();
  const verbScore = bullets.reduce((sum, bullet) => {
    const hasStrong = allStrongVerbs.some(v => 
      bullet.toLowerCase().startsWith(v)
    );
    return sum + (hasStrong ? 20 / bullets.length : 0);
  }, 0);
  score += verbScore;
  
  const quantScore = bullets.reduce((sum, bullet) => {
    const hasNumbers = /\d+%|\d+x|\$\d+|\d+\s*(users?|customers?)/i.test(bullet);
    return sum + (hasNumbers ? 20 / bullets.length : 0);
  }, 0);
  score += quantScore;
  
  const formatScore = bullets.reduce((sum, bullet) => {
    const goodLength = bullet.length >= 50 && bullet.length <= 200;
    const hasContext = /using|with|leveraging/.test(bullet.toLowerCase());
    return sum + ((goodLength ? 10 : 5) + (hasContext ? 10 : 0)) / bullets.length;
  }, 0);
  score += formatScore;
  
  return Math.round(Math.min(100, score));
}

// =====================================================
// EXTRACT BULLET-LIKE CONTENT FROM RESUME TEXT
// =====================================================

// Patterns to identify education/certification content (should be excluded)
const EDUCATION_PATTERNS = [
  /\b(university|college|institute|school|bachelor|master|phd|b\.?e\.?|b\.?tech|m\.?tech|m\.?s\.?|b\.?s\.?|cgpa|gpa|hsc|ssc|diploma|degree)\b/i,
  /\b(education|certifications?|certificates?|coursework|courses?)\b/i,
  /\b\d+\.\d+\s*(cgpa|gpa|%)\b/i,
  /\b(ongoing|pursuing|graduated|class of)\b/i,
];

// Patterns to identify skills sections (should be excluded)
const SKILLS_PATTERNS = [
  /^(skills|technologies|tools|languages|frameworks|libraries|databases|platforms)[\s:]/i,
  /^(technical skills|core competencies|proficiencies)[\s:]/i,
];

function isEducationOrCertification(text: string): boolean {
  return EDUCATION_PATTERNS.some(p => p.test(text));
}

function isSkillsSection(text: string): boolean {
  return SKILLS_PATTERNS.some(p => p.test(text));
}

function isExperienceOrProjectBullet(text: string): boolean {
  
  // Must start with or contain action-oriented language
  const actionIndicators = [
    /^(built|developed|designed|created|implemented|led|managed|collaborated|worked|assisted|contributed|architected|engineered|deployed|integrated|automated|optimized|analyzed|improved|reduced|increased)/i,
    /\b(using|with|via|through|leveraging|utilizing)\b/i,
    /\b(application|system|platform|tool|feature|api|website|dashboard|module|component|service|pipeline)\b/i,
  ];
  
  // Check if it looks like an experience/project description
  const hasActionLanguage = actionIndicators.some(p => p.test(text));
  const hasReasonableLength = text.length >= 30 && text.length <= 500;
  const notTooShort = text.split(/\s+/).length >= 5;
  
  return hasActionLanguage && hasReasonableLength && notTooShort;
}

function extractBulletsFromResumeText(resumeText: string): string[] {
  if (!resumeText || resumeText.trim().length === 0) {
    return [];
  }
  
  const bullets: string[] = [];
  
  // Split by common bullet patterns and line breaks
  const bulletPatterns = [
    /[•●○◦▪▸►◆✓✔]\s*/g,  // Bullet symbols
    /^\d+\.\s*/gm,           // Numbered lists
    /^\s*[-*]\s+/gm,         // Markdown-style bullets (with space after)
  ];
  
  // First try splitting by line breaks
  const lines = resumeText.split(/[\n\r]+/).map(l => l.trim()).filter(l => l.length > 0);
  
  for (const line of lines) {
    // Clean up bullet points
    let cleaned = line;
    for (const pattern of bulletPatterns) {
      cleaned = cleaned.replace(pattern, '');
    }
    cleaned = cleaned.trim();
    
    // Skip if too short, is a header, contact info, education, or skills
    if (cleaned.length < 30) continue;
    if (isLikelySectionHeader(cleaned)) continue;
    if (isContactInfo(cleaned)) continue;
    if (isEducationOrCertification(cleaned)) continue;
    if (isSkillsSection(cleaned)) continue;
    
    // Only include if it looks like an experience/project bullet
    if (isExperienceOrProjectBullet(cleaned)) {
      // Truncate if too long (likely concatenated content)
      if (cleaned.length > 300) {
        // Try to find a natural break point
        const truncated = cleaned.substring(0, 300);
        const lastPeriod = truncated.lastIndexOf('.');
        if (lastPeriod > 100) {
          cleaned = truncated.substring(0, lastPeriod + 1);
        } else {
          continue; // Skip if we can't find a good break - it's probably not a proper bullet
        }
      }
      bullets.push(cleaned);
    }
  }
  
  // Limit to reasonable number of bullets for analysis
  return bullets.slice(0, 10);
}

function isLikelySectionHeader(text: string): boolean {
  const headers = [
    /^(experience|education|skills|projects|certifications|summary|objective|profile|contact)/i,
    /^(work history|professional experience|technical skills|core competencies)/i,
    /^(awards|publications|volunteer|references|interests|hobbies)/i,
  ];
  const cleanText = text.toLowerCase().trim();
  return headers.some(h => h.test(cleanText)) || cleanText.split(/\s+/).length <= 3;
}

function isContactInfo(text: string): boolean {
  // Skip email, phone, URLs, addresses
  return /[@]|^\+?\d[\d\s\-()]+$|^https?:\/\/|linkedin\.com|github\.com/i.test(text);
}

// =====================================================
// ENHANCED ATS KEYWORD ANALYSIS (WITH USER SKILLS)
// =====================================================

function analyzeATSKeywordsEnhanced(
  bullets: string[],
  targetKeywords: string[],
  userSkills: string[],
  fullResumeText: string
): ATSKeywordAnalysis {
  // Combine all resume content for keyword matching
  const allContent = [
    ...bullets,
    ...userSkills,
    fullResumeText,
  ].join(' ').toLowerCase();
  
  const present: string[] = [];
  const missing: string[] = [];
  
  for (const keyword of targetKeywords) {
    const keywordLower = keyword.toLowerCase();
    // Check if keyword is present in any form of resume content
    const isPresent = allContent.includes(keywordLower) ||
      userSkills.some(skill => skill.toLowerCase() === keywordLower) ||
      userSkills.some(skill => skill.toLowerCase().includes(keywordLower)) ||
      userSkills.some(skill => keywordLower.includes(skill.toLowerCase()));
    
    if (isPresent) {
      present.push(keyword);
    } else {
      missing.push(keyword);
    }
  }
  
  const densityScore = targetKeywords.length > 0 
    ? Math.round((present.length / targetKeywords.length) * 100)
    : 0;
  
  return {
    present_keywords: present,
    missing_keywords: missing,
    keyword_density_score: densityScore,
  };
}

// =====================================================
// ENHANCED READINESS SCORE (WITH FULL RESUME)
// =====================================================

function calculateReadinessScoreEnhanced(
  bullets: string[],
  userSkills: string[],
  atsAnalysis: ATSKeywordAnalysis,
  fullResumeText: string
): ResumeReadinessScore {
  // If no bullets but has resume text, still give partial credit
  const hasContent = bullets.length > 0 || fullResumeText.length > 100 || userSkills.length > 0;
  
  if (!hasContent) {
    return {
      overall_score: 0,
      breakdown: {
        metrics_score: 0,
        action_verbs_score: 0,
        keywords_score: 0,
        format_score: 0,
      },
      improvement_potential: [
        { action: 'Add experience bullets with achievements', potential_gain: 50 },
      ],
    };
  }

  // Calculate metrics from bullets (or estimate from resume text)
  let metricsScore = 0;
  if (bullets.length > 0) {
    const bulletsWithMetrics = bullets.filter(b => 
      /\d+%|\d+x|\$[\d,]+|\d+\s*(users?|customers?|clients?|projects?)/i.test(b)
    );
    metricsScore = Math.round((bulletsWithMetrics.length / bullets.length) * 25);
  } else if (fullResumeText) {
    // Check if resume text has metrics anywhere
    const metricsInText = (fullResumeText.match(/\d+%|\d+x|\$[\d,]+|\d+\s*(users?|customers?|clients?|projects?)/gi) || []).length;
    metricsScore = Math.min(15, metricsInText * 3); // Partial credit
  }

  // Calculate action verbs score
  let actionVerbsScore = 0;
  const allStrongVerbs = Object.values(STRONG_ACTION_VERBS).flat();
  if (bullets.length > 0) {
    const bulletsWithStrongVerbs = bullets.filter(b => 
      allStrongVerbs.some(v => b.toLowerCase().startsWith(v))
    );
    actionVerbsScore = Math.round((bulletsWithStrongVerbs.length / bullets.length) * 25);
  } else if (fullResumeText) {
    const verbsFound = allStrongVerbs.filter(v => fullResumeText.toLowerCase().includes(v)).length;
    actionVerbsScore = Math.min(15, verbsFound * 2); // Partial credit
  }

  // Keywords score based on enhanced ATS analysis (max 30)
  const keywordsScore = Math.round((atsAnalysis.keyword_density_score / 100) * 30);

  // Format score
  let formatScore = 0;
  if (bullets.length > 0) {
    const wellFormattedBullets = bullets.filter(b => {
      const wordCount = b.split(/\s+/).length;
      const hasContext = /using|with|leveraging/.test(b.toLowerCase());
      return wordCount >= 8 && wordCount <= 30 && hasContext;
    });
    formatScore = Math.round((wellFormattedBullets.length / bullets.length) * 20);
  } else if (userSkills.length > 0) {
    // Give partial format credit for having skills listed
    formatScore = Math.min(10, userSkills.length);
  }

  const overallScore = metricsScore + actionVerbsScore + keywordsScore + formatScore;

  // Generate improvement suggestions
  const improvementPotential: { action: string; potential_gain: number }[] = [];
  
  if (metricsScore < 20) {
    improvementPotential.push({
      action: bullets.length > 0 
        ? `Add metrics to ${bullets.filter(b => !/\d+%|\d+x/i.test(b)).length} bullets`
        : 'Add quantifiable achievements (%, numbers, scale)',
      potential_gain: 25 - metricsScore,
    });
  }
  
  if (atsAnalysis.missing_keywords.length > 0) {
    const potentialGain = Math.min(15, atsAnalysis.missing_keywords.length * 2);
    improvementPotential.push({
      action: `Add ${Math.min(5, atsAnalysis.missing_keywords.length)} missing keywords`,
      potential_gain: potentialGain,
    });
  }
  
  if (actionVerbsScore < 20) {
    improvementPotential.push({
      action: 'Use stronger action verbs (Developed, Implemented, Architected)',
      potential_gain: 25 - actionVerbsScore,
    });
  }

  if (bullets.length === 0 && fullResumeText) {
    improvementPotential.push({
      action: 'Structure experience as bullet points for better ATS parsing',
      potential_gain: 15,
    });
  }

  improvementPotential.sort((a, b) => b.potential_gain - a.potential_gain);

  return {
    overall_score: Math.min(100, Math.max(0, overallScore)),
    breakdown: {
      metrics_score: metricsScore,
      action_verbs_score: actionVerbsScore,
      keywords_score: keywordsScore,
      format_score: formatScore,
    },
    improvement_potential: improvementPotential.slice(0, 3),
  };
}

// =====================================================
// ENHANCED RESUME GAP DETECTION
// =====================================================

function detectResumeGapsEnhanced(
  bullets: string[],
  targetKeywords: string[],
  jobTitle: string,
  userSkills: string[],
  fullResumeText: string
): ResumeGap[] {
  const gaps: ResumeGap[] = [];
  const allContent = [...bullets, ...userSkills, fullResumeText].join(' ').toLowerCase();
  
  // Check if we have ANY content to analyze
  const hasContent = bullets.length > 0 || userSkills.length > 0 || (fullResumeText && fullResumeText.length > 50);
  
  if (!hasContent) {
    gaps.push({
      id: generateGapId(),
      category: 'format_issues' as ResumeGapCategory,
      severity: 'critical' as ResumeGapSeverity,
      message: 'No resume content detected',
      details: 'Please provide your resume text for analysis.',
      suggestedFix: 'Paste your resume content including experience, projects, and skills.',
    });
    return gaps;
  }

  // 1. Detect if structured bullets are missing but content exists
  if (bullets.length === 0 && (fullResumeText.length > 100 || userSkills.length > 0)) {
    gaps.push({
      id: generateGapId(),
      category: 'format_issues' as ResumeGapCategory,
      severity: 'warning' as ResumeGapSeverity,
      message: 'Experience bullets not clearly structured',
      details: 'Your resume content exists but may not be parsed well by ATS systems.',
      suggestedFix: 'Format experience as clear bullet points starting with action verbs.',
    });
  }

  // 2. Detect missing quantified impact (from bullets)
  if (bullets.length > 0) {
    const bulletsWithoutMetrics = bullets.filter(b => 
      !/\d+%|\d+x|\$[\d,]+|\d+\s*(users?|customers?|clients?|projects?|team|people|requests?|transactions?)/i.test(b)
    );
    
    if (bulletsWithoutMetrics.length > 0) {
      const percentage = Math.round((bulletsWithoutMetrics.length / bullets.length) * 100);
      gaps.push({
        id: generateGapId(),
        category: 'missing_metrics' as ResumeGapCategory,
        severity: percentage >= 70 ? 'critical' : 'warning',
        message: `${bulletsWithoutMetrics.length} of ${bullets.length} bullets lack measurable impact`,
        details: `${percentage}% of your experience bullets don't include quantifiable results.`,
        affectedBullets: bulletsWithoutMetrics.map((b) => bullets.indexOf(b)),
        suggestedFix: 'Add metrics like: "reduced by X%", "increased to Y users", "saved $Z".',
      });
    }
  } else if (fullResumeText) {
    // Check resume text for any metrics
    const hasAnyMetrics = /\d+%|\d+x|\$[\d,]+|\d+\s*(users?|customers?|clients?|projects?)/i.test(fullResumeText);
    if (!hasAnyMetrics) {
      gaps.push({
        id: generateGapId(),
        category: 'missing_metrics' as ResumeGapCategory,
        severity: 'warning',
        message: 'No quantifiable achievements detected',
        details: 'Your resume lacks specific metrics and numbers.',
        suggestedFix: 'Add numbers to show impact: percentages, user counts, cost savings, etc.',
      });
    }
  }

  // 3. Detect missing JD keywords (check against ALL content including skills)
  const missingCriticalKeywords = targetKeywords.filter(kw => {
    const kwLower = kw.toLowerCase();
    // Check if keyword is in any of the content
    return !allContent.includes(kwLower) &&
           !userSkills.some(s => s.toLowerCase() === kwLower) &&
           !userSkills.some(s => s.toLowerCase().includes(kwLower));
  });

  if (missingCriticalKeywords.length > 0) {
    const topMissing = missingCriticalKeywords.slice(0, 6);
    const severity: ResumeGapSeverity = 
      missingCriticalKeywords.length >= 5 ? 'critical' : 
      missingCriticalKeywords.length >= 3 ? 'warning' : 'info';
    
    gaps.push({
      id: generateGapId(),
      category: 'missing_keywords' as ResumeGapCategory,
      severity,
      message: `${missingCriticalKeywords.length} JD keywords are missing from your resume`,
      details: `Missing: ${topMissing.join(', ')}${missingCriticalKeywords.length > 6 ? ` and ${missingCriticalKeywords.length - 6} more` : ''}`,
      suggestedFix: 'Add these skills to your resume if you have experience with them.',
    });
  }

  // 4. Check for weak verbs in bullets
  if (bullets.length > 0) {
    const weakVerbPatterns = Array.from(WEAK_VERBS.keys());
    const bulletsWithWeakVerbs: { index: number; verb: string }[] = [];
    
    bullets.forEach((bullet, index) => {
      const lowerBullet = bullet.toLowerCase();
      for (const weakVerb of weakVerbPatterns) {
        if (lowerBullet.startsWith(weakVerb) || new RegExp(`^${weakVerb}\\b`, 'i').test(lowerBullet)) {
          bulletsWithWeakVerbs.push({ index, verb: weakVerb });
          break;
        }
      }
    });

    if (bulletsWithWeakVerbs.length > 0) {
      const weakVerbsList = [...new Set(bulletsWithWeakVerbs.map(b => b.verb))].slice(0, 4);
      gaps.push({
        id: generateGapId(),
        category: 'weak_verbs' as ResumeGapCategory,
        severity: bulletsWithWeakVerbs.length >= 3 ? 'warning' : 'info',
        message: `${bulletsWithWeakVerbs.length} bullets use weak verbs like "${weakVerbsList.join('", "')}"`,
        details: 'Weak action verbs reduce impact. ATS and recruiters prefer strong, specific verbs.',
        affectedBullets: bulletsWithWeakVerbs.map(b => b.index),
        suggestedFix: 'Replace with: "Developed", "Implemented", "Architected", "Optimized".',
      });
    }
  }

  // 5. Check for role-specific terminology
  const roleTerminology = getRoleTerminology(jobTitle);
  const missingRoleTerms = roleTerminology.filter(term => 
    !allContent.includes(term.toLowerCase())
  );

  if (missingRoleTerms.length >= 3) {
    gaps.push({
      id: generateGapId(),
      category: 'missing_terminology' as ResumeGapCategory,
      severity: 'info',
      message: `Resume may lack role-specific terminology for "${jobTitle}"`,
      details: `Consider: ${missingRoleTerms.slice(0, 4).join(', ')}`,
      suggestedFix: 'Review if any of these terms accurately describe your experience.',
    });
  }

  const severityOrder: Record<ResumeGapSeverity, number> = { critical: 0, warning: 1, info: 2 };
  gaps.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return gaps;
}

// =====================================================
// MAIN FUNCTION (ENHANCED)
// =====================================================

export function improveResume(
  experience: PortfolioExperience[],
  parsedJob: ParsedJobDescription,
  userSkills: string[],
  resumeText?: string
): ResumeSuggestions {
  const targetKeywords = [
    ...parsedJob.ats_keywords,
    ...parsedJob.core_skills.map(s => s.canonical_name),
    ...parsedJob.tools,
  ].slice(0, 20);
  
  const improvedBullets: ImprovedBullet[] = [];
  const allOriginalBullets: string[] = [];
  
  // Extract bullets from structured experience
  for (const exp of experience) {
    for (const bullet of exp.bullets) {
      allOriginalBullets.push(bullet);
    }
  }
  
  // If no structured bullets, try to extract from resume text
  if (allOriginalBullets.length === 0 && resumeText) {
    const extractedBullets = extractBulletsFromResumeText(resumeText);
    allOriginalBullets.push(...extractedBullets);
  }
  
  // Process bullets for improvements
  for (const bullet of allOriginalBullets) {
    const analysis = analyzeBullet(bullet, targetKeywords);
    
    if (analysis.suggestions.length > 0 || analysis.weakVerbs.length > 0) {
      const { improved, changes } = improveBullet(bullet, analysis, targetKeywords);
      
      if (improved !== bullet || changes.length > 0) {
        const addedKeywords = targetKeywords.filter(kw => 
          improved.toLowerCase().includes(kw.toLowerCase()) &&
          !bullet.toLowerCase().includes(kw.toLowerCase())
        );
        
        improvedBullets.push({
          original: bullet,
          improved: improved,
          changes_made: [...changes, ...analysis.suggestions],
          keywords_added: addedKeywords,
        });
      }
    }
  }
  
  const newBullets = generateSuggestedBullets(targetKeywords, userSkills);
  
  // Use enhanced ATS analysis that considers userSkills and full resume text
  const atsAnalysis = analyzeATSKeywordsEnhanced(
    allOriginalBullets, 
    targetKeywords, 
    userSkills,
    resumeText || ''
  );
  
  const keywordsToAdd = atsAnalysis.missing_keywords.slice(0, 10);
  
  const atsScore = calculateATSScore(allOriginalBullets, targetKeywords);
  
  // Use enhanced gap detection
  const resumeGaps = detectResumeGapsEnhanced(
    allOriginalBullets,
    targetKeywords,
    parsedJob.job_title || 'Software Developer',
    userSkills,
    resumeText || ''
  );
  
  const bulletImprovements = generateBulletImprovements(allOriginalBullets, targetKeywords);
  
  // Use enhanced readiness score
  const readinessScore = calculateReadinessScoreEnhanced(
    allOriginalBullets, 
    userSkills, 
    atsAnalysis,
    resumeText || ''
  );
  
  return {
    resume_gaps: resumeGaps,
    bullet_improvements: bulletImprovements,
    ats_analysis: atsAnalysis,
    readiness_score: readinessScore,
    improved_bullets: improvedBullets,
    new_bullets: newBullets,
    keywords_to_add: keywordsToAdd,
    ats_score: atsScore,
  };
}

// =====================================================
// SAFETY CHECK
// =====================================================

export function validateResumeTruthfulness(
  improvedBullet: string,
  originalBullet: string
): { isValid: boolean; warnings: string[] } {
  const warnings: string[] = [];
  
  const numberPattern = /(\d+)(%|x|\s*users?|\s*customers?)/gi;
  
  const originalNumbers: string[] = originalBullet.match(numberPattern) || [];
  const improvedNumbers: string[] = improvedBullet.match(numberPattern) || [];
  
  const newNumbers = improvedNumbers.filter(n => !originalNumbers.includes(n));
  if (newNumbers.length > 0) {
    warnings.push(`Verify these metrics are accurate: ${newNumbers.join(', ')}`);
  }
  
  const exaggerationWords = ['revolutionary', 'groundbreaking', 'world-class', 'industry-leading'];
  for (const word of exaggerationWords) {
    if (improvedBullet.toLowerCase().includes(word) && !originalBullet.toLowerCase().includes(word)) {
      warnings.push(`Verify claim: "${word}" - avoid exaggeration`);
    }
  }
  
  return {
    isValid: warnings.length === 0,
    warnings,
  };
}
