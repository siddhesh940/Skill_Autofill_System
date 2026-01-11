// =====================================================
// JOB DESCRIPTION EXTRACTOR
// Rule-based extraction using regex + keyword matching
// =====================================================

import {
    ExtractedSkill,
    ParsedJobDescription,
    SalaryRange,
    SkillCategory
} from '@/types';
import {
    SKILL_TAXONOMY
} from './skill-taxonomy';

// =====================================================
// CONTEXTUAL SKILL INFERENCE
// =====================================================

// Maps broad terms to specific skills they imply
const CONTEXTUAL_SKILL_MAP: Record<string, string[]> = {
  'javascript frameworks': ['React', 'Vue.js', 'Angular', 'JavaScript'],
  'js frameworks': ['React', 'Vue.js', 'Angular', 'JavaScript'],
  'modern javascript': ['JavaScript', 'TypeScript', 'React'],
  'frontend frameworks': ['React', 'Vue.js', 'Angular', 'Next.js'],
  'front-end frameworks': ['React', 'Vue.js', 'Angular', 'Next.js'],
  'backend frameworks': ['Node.js', 'Express.js', 'Django', 'Spring Boot'],
  'back-end frameworks': ['Node.js', 'Express.js', 'Django', 'Spring Boot'],
  'web applications': ['JavaScript', 'HTML', 'CSS', 'React'],
  'web development': ['JavaScript', 'HTML', 'CSS', 'React', 'Node.js'],
  'full-stack': ['JavaScript', 'Node.js', 'React', 'PostgreSQL'],
  'full stack': ['JavaScript', 'Node.js', 'React', 'PostgreSQL'],
  'relational databases': ['PostgreSQL', 'MySQL', 'SQL'],
  'nosql databases': ['MongoDB', 'Redis', 'DynamoDB'],
  'cloud services': ['AWS', 'Azure', 'GCP'],
  'cloud platforms': ['AWS', 'Azure', 'GCP'],
  'ci/cd pipelines': ['CI/CD', 'GitHub', 'Docker'],
  'devops practices': ['Docker', 'CI/CD', 'Linux', 'Kubernetes'],
  'agile methodologies': ['Agile', 'Project Management'],
  'agile environment': ['Agile', 'Team Collaboration'],
  'version control': ['Git', 'GitHub'],
  'api development': ['REST API', 'Node.js', 'API Design'],
  'restful services': ['REST API', 'API Design'],
  'microservices architecture': ['Microservices', 'Docker', 'Kubernetes'],
  'responsive web': ['Responsive Design', 'CSS', 'HTML'],
  'mobile-responsive': ['Responsive Design', 'CSS'],
  'cross-browser': ['HTML', 'CSS', 'JavaScript'],
  'single page applications': ['SPA', 'React', 'Vue.js'],
  'server-side rendering': ['SSR', 'Next.js'],
  'state management': ['State Management', 'React'],
  'design systems': ['Component Design', 'CSS', 'Storybook'],
  'unit testing': ['Unit Testing', 'Jest'],
  'test-driven': ['Unit Testing', 'Jest'],
  'e2e testing': ['Integration Testing', 'Cypress', 'Playwright'],
  'end-to-end testing': ['Integration Testing', 'Cypress'],
  'sql databases': ['SQL', 'PostgreSQL', 'MySQL'],
  'orm': ['Prisma', 'Database Design'],
  'authentication systems': ['Authentication', 'OAuth', 'JWT'],
  'security best practices': ['Security', 'Authentication'],
  'performance tuning': ['Performance Optimization', 'Caching'],
  'scalable applications': ['Microservices', 'Caching', 'Database Design'],
  'code reviews': ['Git Workflows', 'Clean Code'],
  'technical documentation': ['Clean Code', 'Markdown'],
};

// Role-based implied skills
const ROLE_IMPLIED_SKILLS: Record<string, string[]> = {
  'frontend': ['JavaScript', 'HTML', 'CSS', 'React', 'Responsive Design', 'UI/UX'],
  'front-end': ['JavaScript', 'HTML', 'CSS', 'React', 'Responsive Design', 'UI/UX'],
  'front end': ['JavaScript', 'HTML', 'CSS', 'React', 'Responsive Design', 'UI/UX'],
  'backend': ['Node.js', 'SQL', 'REST API', 'Database Design', 'API Design'],
  'back-end': ['Node.js', 'SQL', 'REST API', 'Database Design', 'API Design'],
  'back end': ['Node.js', 'SQL', 'REST API', 'Database Design', 'API Design'],
  'fullstack': ['JavaScript', 'Node.js', 'React', 'SQL', 'REST API', 'Git'],
  'full-stack': ['JavaScript', 'Node.js', 'React', 'SQL', 'REST API', 'Git'],
  'full stack': ['JavaScript', 'Node.js', 'React', 'SQL', 'REST API', 'Git'],
  'devops': ['Docker', 'Kubernetes', 'CI/CD', 'Linux', 'AWS', 'Terraform'],
  'data engineer': ['Python', 'SQL', 'AWS', 'Data Analysis', 'SQL Analytics'],
  'data scientist': ['Python', 'Machine Learning', 'Pandas', 'NumPy', 'Data Analysis'],
  'mobile developer': ['React Native', 'JavaScript', 'iOS Development', 'Android Development'],
  'software engineer': ['Git', 'Clean Code', 'Unit Testing', 'Problem Solving'],
  'web developer': ['JavaScript', 'HTML', 'CSS', 'Git', 'Responsive Design'],
};

// =====================================================
// REGEX PATTERNS
// =====================================================

const PATTERNS = {
  // Experience extraction
  experience: [
    /(\d+)\+?\s*(?:years?|yrs?)(?:\s+of)?\s+(?:experience|exp)/gi,
    /(?:experience|exp)[\s:]+(\d+)\+?\s*(?:years?|yrs?)/gi,
    /(\d+)\s*-\s*(\d+)\s*(?:years?|yrs?)\s+(?:experience|exp)/gi,
    /(?:minimum|at least|min)\s+(\d+)\s*(?:years?|yrs?)/gi,
  ],
  
  // Salary extraction
  salary: [
    /\$\s*([\d,]+)\s*(?:k|K)?\s*(?:-|to|–)\s*\$?\s*([\d,]+)\s*(?:k|K)?(?:\s*(?:per\s+)?(?:year|yr|annually|annual))?/gi,
    /(?:salary|compensation)[\s:]+\$?\s*([\d,]+)\s*(?:k|K)?\s*(?:-|to|–)\s*\$?\s*([\d,]+)\s*(?:k|K)?/gi,
    /([\d,]+)\s*(?:k|K)\s*(?:-|to|–)\s*([\d,]+)\s*(?:k|K)/gi,
  ],
  
  // Location extraction
  location: [
    /(?:location|based in|office in|located in)[\s:]+([^,.\n]+(?:,\s*[A-Z]{2})?)/gi,
    /(?:remote|hybrid|on-site|onsite)/gi,
  ],
  
  // Job title extraction
  jobTitle: [
    /^(?:job\s+)?title[\s:]+(.+)$/gim,
    /^(?:position|role)[\s:]+(.+)$/gim,
  ],
  
  // Company name
  company: [
    /^(?:company|employer|organization)[\s:]+(.+)$/gim,
    /(?:at|for|join)\s+([A-Z][A-Za-z0-9\s&]+?)(?:\s+as|\s+is|\.|,)/g,
  ],
  
  // Section headers
  sections: {
    requirements: /(?:requirements?|qualifications?|what you.?ll need|must have|required skills?)/gi,
    niceToHave: /(?:nice to have|preferred|bonus|plus|good to have|optional)/gi,
    responsibilities: /(?:responsibilities?|what you.?ll do|duties|role|job description)/gi,
    benefits: /(?:benefits?|perks|what we offer|compensation)/gi,
  },
  
  // Bullet points
  bullet: /^[\s]*(?:[-•*▪▸►●○◆]|\d+\.|\(\d+\))\s*(.+)$/gm,
  
  // Years of experience mentions
  yearsExp: /(\d+)\+?\s*(?:years?|yrs?)/gi,
};

// =====================================================
// EXPERIENCE LEVEL DETECTION
// =====================================================

const EXPERIENCE_LEVEL_KEYWORDS = {
  entry: ['entry level', 'entry-level', 'junior', 'graduate', 'fresher', 'intern', '0-2 years', '1-2 years'],
  mid: ['mid level', 'mid-level', 'intermediate', '2-5 years', '3-5 years', '2+ years', '3+ years'],
  senior: ['senior', 'sr.', 'sr ', 'lead', '5+ years', '5-7 years', '7+ years', 'experienced'],
  lead: ['lead', 'principal', 'staff', 'architect', '8+ years', '10+ years'],
  principal: ['principal', 'distinguished', 'fellow', 'director', '15+ years'],
};

function detectExperienceLevel(text: string): 'entry' | 'mid' | 'senior' | 'lead' | 'principal' {
  const lowerText = text.toLowerCase();
  
  for (const [level, keywords] of Object.entries(EXPERIENCE_LEVEL_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        return level as 'entry' | 'mid' | 'senior' | 'lead' | 'principal';
      }
    }
  }
  
  // Default to mid if no indicators found
  return 'mid';
}

// =====================================================
// CONTEXTUAL SKILL INFERENCE
// =====================================================

function inferContextualSkills(text: string): Map<string, { source: string; weight: number }> {
  const inferredSkills = new Map<string, { source: string; weight: number }>();
  const lowerText = text.toLowerCase();
  
  // Check contextual phrases
  for (const [phrase, skills] of Object.entries(CONTEXTUAL_SKILL_MAP)) {
    if (lowerText.includes(phrase)) {
      for (const skill of skills) {
        const existing = inferredSkills.get(skill);
        if (!existing || existing.weight < 0.6) {
          inferredSkills.set(skill, { source: phrase, weight: 0.6 });
        }
      }
    }
  }
  
  // Check role-implied skills from job title
  for (const [role, skills] of Object.entries(ROLE_IMPLIED_SKILLS)) {
    // Check if role appears in first 200 chars (likely title area)
    const titleArea = lowerText.slice(0, 200);
    if (titleArea.includes(role)) {
      for (const skill of skills) {
        const existing = inferredSkills.get(skill);
        if (!existing || existing.weight < 0.5) {
          inferredSkills.set(skill, { source: `${role} role`, weight: 0.5 });
        }
      }
    }
  }
  
  return inferredSkills;
}

// =====================================================
// SKILL EXTRACTION
// =====================================================

interface SkillMatch {
  skill: string;
  canonical: string;
  category: SkillCategory;
  positions: number[];
  frequency: number;
  inRequiredSection: boolean;
}

function extractSkills(text: string): Map<string, SkillMatch> {
  const skillMatches = new Map<string, SkillMatch>();
  const lowerText = text.toLowerCase();
  
  // Detect required vs nice-to-have sections
  const requiredMatch = lowerText.search(PATTERNS.sections.requirements);
  const niceToHaveMatch = lowerText.search(PATTERNS.sections.niceToHave);
  
  // Check each skill in taxonomy
  for (const entry of SKILL_TAXONOMY) {
    const allTerms = [entry.canonical, ...entry.aliases];
    
    for (const term of allTerms) {
      // Create word boundary regex for the term
      const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedTerm}\\b`, 'gi');
      
      let match;
      const positions: number[] = [];
      
      while ((match = regex.exec(text)) !== null) {
        positions.push(match.index);
      }
      
      if (positions.length > 0) {
        const existing = skillMatches.get(entry.canonical);
        
        // Determine if in required section
        let inRequired = true;
        if (niceToHaveMatch !== -1 && requiredMatch !== -1) {
          // Check if most occurrences are before nice-to-have section
          const avgPosition = positions.reduce((a, b) => a + b, 0) / positions.length;
          inRequired = avgPosition < niceToHaveMatch || avgPosition < requiredMatch;
        }
        
        if (existing) {
          existing.positions.push(...positions);
          existing.frequency += positions.length;
          existing.inRequiredSection = existing.inRequiredSection || inRequired;
        } else {
          skillMatches.set(entry.canonical, {
            skill: entry.canonical,
            canonical: entry.canonical,
            category: entry.category,
            positions,
            frequency: positions.length,
            inRequiredSection: inRequired,
          });
        }
      }
    }
  }
  
  return skillMatches;
}

// =====================================================
// SECTION EXTRACTION
// =====================================================

function extractBulletPoints(text: string): string[] {
  const bullets: string[] = [];
  let match;
  
  while ((match = PATTERNS.bullet.exec(text)) !== null) {
    const bullet = match[1].trim();
    if (bullet.length > 10 && bullet.length < 500) {
      bullets.push(bullet);
    }
  }
  
  return bullets;
}

function extractResponsibilities(text: string): string[] {
  const lowerText = text.toLowerCase();
  const respMatch = lowerText.search(PATTERNS.sections.responsibilities);
  
  if (respMatch === -1) {
    return extractBulletPoints(text).slice(0, 10);
  }
  
  // Find the section end
  const reqMatch = lowerText.search(PATTERNS.sections.requirements);
  const sectionEnd = reqMatch > respMatch ? reqMatch : text.length;
  
  const section = text.slice(respMatch, sectionEnd);
  return extractBulletPoints(section);
}

function extractQualifications(text: string): string[] {
  const lowerText = text.toLowerCase();
  const reqMatch = lowerText.search(PATTERNS.sections.requirements);
  
  if (reqMatch === -1) {
    return [];
  }
  
  const niceMatch = lowerText.search(PATTERNS.sections.niceToHave);
  const sectionEnd = niceMatch > reqMatch ? niceMatch : text.length;
  
  const section = text.slice(reqMatch, sectionEnd);
  return extractBulletPoints(section);
}

// =====================================================
// SALARY EXTRACTION
// =====================================================

function extractSalary(text: string): SalaryRange | null {
  for (const pattern of PATTERNS.salary) {
    const match = pattern.exec(text);
    if (match) {
      let min = parseInt(match[1].replace(/,/g, ''));
      let max = parseInt(match[2].replace(/,/g, ''));
      
      // Handle 'k' notation
      if (min < 1000) min *= 1000;
      if (max < 1000) max *= 1000;
      
      return {
        min,
        max,
        currency: 'USD',
        period: 'yearly',
      };
    }
    pattern.lastIndex = 0; // Reset regex
  }
  
  return null;
}

// =====================================================
// EXPERIENCE YEARS EXTRACTION
// =====================================================

function extractExperienceYears(text: string): { min: number; max: number | null } {
  let minYears = 0;
  let maxYears: number | null = null;
  
  for (const pattern of PATTERNS.experience) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      if (match[2]) {
        // Range like "3-5 years"
        minYears = Math.max(minYears, parseInt(match[1]));
        maxYears = parseInt(match[2]);
      } else if (match[1]) {
        // Single number like "5+ years"
        minYears = Math.max(minYears, parseInt(match[1]));
      }
    }
    pattern.lastIndex = 0;
  }
  
  return { min: minYears, max: maxYears };
}

// =====================================================
// ATS KEYWORDS EXTRACTION
// =====================================================

function extractATSKeywords(skills: Map<string, SkillMatch>, text: string): string[] {
  const keywords: string[] = [];
  
  // Add all found skills
  skills.forEach((match) => {
    keywords.push(match.canonical);
  });
  
  // Add common ATS-friendly keywords from text
  const atsPatterns = [
    'bachelor', 'master', 'degree', 'certified', 'certification',
    'agile', 'scrum', 'kanban', 'jira', 'confluence',
    'leadership', 'teamwork', 'communication', 'problem-solving',
    'remote', 'hybrid', 'full-time', 'contract',
  ];
  
  const lowerText = text.toLowerCase();
  for (const pattern of atsPatterns) {
    if (lowerText.includes(pattern) && !keywords.includes(pattern)) {
      keywords.push(pattern);
    }
  }
  
  return [...new Set(keywords)];
}

// =====================================================
// CONTEXT EXTRACTION
// =====================================================

function getSkillContext(text: string, position: number, windowSize: number = 100): string {
  const start = Math.max(0, position - windowSize);
  const end = Math.min(text.length, position + windowSize);
  return text.slice(start, end).replace(/\s+/g, ' ').trim();
}

// =====================================================
// MAIN EXTRACTION FUNCTION
// =====================================================

export function extractJobDescription(rawText: string): ParsedJobDescription {
  // Clean the text
  const text = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/\s{3,}/g, '\n\n')
    .trim();
  
  // Extract explicit skills from taxonomy
  const skillMatches = extractSkills(text);
  
  // Extract contextual/implied skills
  const contextualSkills = inferContextualSkills(text);
  
  // Merge contextual skills that weren't already found
  contextualSkills.forEach((_info, skillName) => {
    if (!skillMatches.has(skillName)) {
      // Find the taxonomy entry for this skill
      const entry = SKILL_TAXONOMY.find(t => t.canonical === skillName);
      if (entry) {
        skillMatches.set(skillName, {
          skill: skillName,
          canonical: skillName,
          category: entry.category,
          positions: [0], // Contextual, no specific position
          frequency: 1,
          inRequiredSection: true, // Assume required since it's implied by role
        });
      }
    }
  });
  
  // Separate required vs nice-to-have skills
  const coreSkills: ExtractedSkill[] = [];
  const niceToHaveSkills: ExtractedSkill[] = [];
  const tools: string[] = [];
  
  skillMatches.forEach((match) => {
    const skill: ExtractedSkill = {
      name: match.skill,
      canonical_name: match.canonical,
      category: match.category,
      frequency: match.frequency,
      is_required: match.inRequiredSection,
      context: match.positions[0] > 0 ? getSkillContext(text, match.positions[0]) : 'Inferred from context',
    };
    
    if (match.category === 'tool') {
      tools.push(match.canonical);
      // Also add tools as skills if they're important
      if (match.frequency >= 1) {
        coreSkills.push(skill);
      }
    } else if (match.inRequiredSection) {
      coreSkills.push(skill);
    } else {
      niceToHaveSkills.push(skill);
    }
  });
  
  // Sort by frequency (most mentioned = most important)
  coreSkills.sort((a, b) => b.frequency - a.frequency);
  niceToHaveSkills.sort((a, b) => b.frequency - a.frequency);
  
  // Extract experience
  const expYears = extractExperienceYears(text);
  const expLevel = detectExperienceLevel(text);
  
  // Extract sections
  const responsibilities = extractResponsibilities(text);
  const qualifications = extractQualifications(text);
  
  // Extract metadata
  const salary = extractSalary(text);
  const atsKeywords = extractATSKeywords(skillMatches, text);
  
  // Try to extract job title and company (basic heuristics)
  let jobTitle = '';
  let company = '';
  let location: string | null = null;
  
  // Job title is often in the first few lines or first sentence
  const firstLines = text.split('\n').slice(0, 5).join(' ');
  const titlePatterns = [
    /(?:looking for|hiring|seeking|need)\s+(?:a|an)?\s*((?:senior|junior|lead|principal|staff)?\s*(?:software|web|full.?stack|front.?end|back.?end|mobile|data|devops|cloud)?\s*(?:engineer|developer|architect|designer|analyst))/i,
    /^((?:senior|junior|lead|principal|staff)?\s*(?:software|web|full.?stack|front.?end|back.?end|mobile|data|devops|cloud)?\s*(?:engineer|developer|architect|designer|analyst))/i,
    /(.+?(?:engineer|developer|architect|manager|analyst|designer))/i,
  ];
  
  for (const pattern of titlePatterns) {
    const match = firstLines.match(pattern);
    if (match) {
      jobTitle = match[1].trim();
      // Capitalize first letter of each word
      jobTitle = jobTitle.replace(/\b\w/g, l => l.toUpperCase());
      break;
    }
  }
  
  // Location extraction
  const locationMatch = text.match(PATTERNS.location[0]);
  if (locationMatch) {
    location = locationMatch[1].trim();
  } else if (text.toLowerCase().includes('remote')) {
    location = 'Remote';
  }
  
  return {
    job_title: jobTitle || 'Software Developer',
    company: company || '',
    location: location,
    experience_level: expLevel,
    experience_years_min: expYears.min,
    experience_years_max: expYears.max,
    core_skills: coreSkills,
    nice_to_have_skills: niceToHaveSkills,
    tools: tools,
    responsibilities: responsibilities,
    qualifications: qualifications,
    ats_keywords: atsKeywords,
    salary_range: salary,
  };
}

// =====================================================
// URL SCRAPER (for job links)
// =====================================================

export async function scrapeJobUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Use cheerio on server side, or basic regex for cleaning
    // Remove scripts, styles, and extract text
    const cleanText = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim();
    
    return cleanText;
  } catch (error) {
    throw new Error(`Failed to scrape job URL: ${error}`);
  }
}
