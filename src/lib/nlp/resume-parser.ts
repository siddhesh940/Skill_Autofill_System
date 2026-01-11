// =====================================================
// RESUME PARSER - STATE MACHINE IMPLEMENTATION
// Proper section-based parsing with skill taxonomy
// =====================================================

import { SKILL_TAXONOMY } from './skill-taxonomy';

// ========== TYPES ==========

export interface ParsedResume {
  summary: string;
  skills: string[];
  experience: string[];
  projects: string[];
  education: string[];
  certifications: string[];
  rawText: string;
  parseQuality: 'good' | 'partial' | 'failed';
  warnings: string[];
}

// State machine section types (ONLY these are valid)
type SectionType = 
  | 'HEADER'        // Contact info at top (ignored for content)
  | 'SUMMARY'
  | 'SKILLS'
  | 'EXPERIENCE'
  | 'PROJECTS'
  | 'EDUCATION'
  | 'CERTIFICATIONS'
  | 'UNKNOWN';

interface ParserState {
  currentSection: SectionType;
  sections: Map<SectionType, string[]>;
  contactInfo: ContactInfo;
}

interface ContactInfo {
  emails: string[];
  phones: string[];
  urls: string[];
  github: string | null;
  linkedin: string | null;
}

// ========== CONTACT INFO PATTERNS (TO FILTER OUT) ==========

const CONTACT_PATTERNS = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phone: /\b(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}\b/g,
  url: /\bhttps?:\/\/[^\s<>"{}|\\^`\[\]]+/gi,
  github: /\bgithub\.com\/[A-Za-z0-9_-]+\b/gi,
  linkedin: /\blinkedin\.com\/in\/[A-Za-z0-9_-]+\b/gi,
};

// ========== SECTION HEADER PATTERNS ==========

const SECTION_HEADERS: Record<SectionType, RegExp[]> = {
  HEADER: [], // No explicit header for contact section
  SUMMARY: [
    /^(?:professional\s+)?summary$/i,
    /^(?:career\s+)?objective$/i,
    /^profile$/i,
    /^about\s*(?:me)?$/i,
    /^introduction$/i,
    /^overview$/i,
    /^executive\s+summary$/i,
  ],
  SKILLS: [
    /^(?:technical\s+)?skills$/i,
    /^core\s+competenc(?:y|ies)$/i,
    /^technologies$/i,
    /^tools?\s*(?:&|and)?\s*technologies$/i,
    /^expertise$/i,
    /^technical\s+expertise$/i,
    /^proficienc(?:y|ies)$/i,
    /^technical\s+proficienc(?:y|ies)$/i,
    /^skills?\s*(?:&|and)?\s*(?:tools?|technologies?)$/i,
    /^areas?\s+of\s+expertise$/i,
  ],
  EXPERIENCE: [
    /^(?:work\s+)?experience$/i,
    /^employment(?:\s+history)?$/i,
    /^professional\s+experience$/i,
    /^work\s+history$/i,
    /^career\s+history$/i,
    /^positions?\s+held$/i,
    /^relevant\s+experience$/i,
  ],
  PROJECTS: [
    /^projects?$/i,
    /^(?:key\s+)?projects?$/i,
    /^personal\s+projects?$/i,
    /^portfolio$/i,
    /^selected\s+projects?$/i,
    /^notable\s+projects?$/i,
    /^side\s+projects?$/i,
    /^academic\s+projects?$/i,
  ],
  EDUCATION: [
    /^education(?:al\s+background)?$/i,
    /^academic(?:\s+background)?$/i,
    /^qualifications?$/i,
    /^academic\s+qualifications?$/i,
  ],
  CERTIFICATIONS: [
    /^certifications?$/i,
    /^licenses?\s*(?:&|and)?\s*certifications?$/i,
    /^professional\s+certifications?$/i,
    /^credentials?$/i,
    /^training(?:\s*&\s*certifications?)?$/i,
    /^courses?\s*(?:&|and)?\s*certifications?$/i,
  ],
  UNKNOWN: [],
};

// ========== SKILL TAXONOMY LOOKUP ==========

function buildSkillLookup(): Map<string, string> {
  const lookup = new Map<string, string>();
  
  for (const entry of SKILL_TAXONOMY) {
    // Add canonical name (lowercase for matching)
    lookup.set(entry.canonical.toLowerCase(), entry.canonical);
    
    // Add all aliases
    for (const alias of entry.aliases) {
      lookup.set(alias.toLowerCase(), entry.canonical);
    }
  }
  
  return lookup;
}

const SKILL_LOOKUP = buildSkillLookup();

// ========== TEXT CLEANING ==========

/**
 * Remove non-printable characters and normalize whitespace
 */
export function cleanExtractedText(text: string): string {
  if (!text) return '';
  
  return text
    // Remove null bytes and control characters (keep newlines, tabs)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Remove BOM and replacement chars
    .replace(/[\uFFFD\uFEFF]/g, '')
    // Normalize unicode spaces
    .replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000]/g, ' ')
    // Fix ligatures
    .replace(/ﬁ/g, 'fi')
    .replace(/ﬂ/g, 'fl')
    .replace(/ﬀ/g, 'ff')
    .replace(/ﬃ/g, 'ffi')
    .replace(/ﬄ/g, 'ffl')
    // Normalize line endings
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Normalize bullet points
    .replace(/[●○•◦▪▸►‣⁃∙⦿⦾]/g, '•')
    // Normalize dashes
    .replace(/[–—―]/g, '-')
    // Multiple spaces to single
    .replace(/[ \t]+/g, ' ')
    // Trim each line
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    // Multiple newlines to max 2
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Check if text is corrupted/binary
 */
export function isTextCorrupted(text: string): boolean {
  if (!text || text.length === 0) return true;
  
  const sampleLength = Math.min(text.length, 2000);
  let printableCount = 0;
  let letterCount = 0;
  
  for (let i = 0; i < sampleLength; i++) {
    const code = text.charCodeAt(i);
    // Printable ASCII + common chars
    if ((code >= 32 && code <= 126) || code === 10 || code === 13 || code === 9) {
      printableCount++;
      if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) {
        letterCount++;
      }
    }
  }
  
  const printableRatio = printableCount / sampleLength;
  const letterRatio = letterCount / sampleLength;
  
  // Too few printable chars or letters = corrupted
  if (printableRatio < 0.7 || letterRatio < 0.15) return true;
  
  // Check for common resume words
  const lower = text.toLowerCase();
  const resumeWords = ['experience', 'education', 'skills', 'work', 'project', 'university', 'degree'];
  const foundWords = resumeWords.filter(w => lower.includes(w)).length;
  
  if (foundWords < 1 && text.length > 200) return true;
  
  return false;
}

// ========== CONTACT INFO EXTRACTION & FILTERING ==========

/**
 * Extract and remove contact information from text
 * Returns cleaned text with contact info removed
 */
function extractContactInfo(text: string): { cleaned: string; contact: ContactInfo } {
  const contact: ContactInfo = {
    emails: [],
    phones: [],
    urls: [],
    github: null,
    linkedin: null,
  };
  
  let cleaned = text;
  
  // Extract emails
  const emails = text.match(CONTACT_PATTERNS.email);
  if (emails) {
    contact.emails = [...new Set(emails)];
    cleaned = cleaned.replace(CONTACT_PATTERNS.email, ' ');
  }
  
  // Extract phones
  const phones = text.match(CONTACT_PATTERNS.phone);
  if (phones) {
    contact.phones = [...new Set(phones)];
    cleaned = cleaned.replace(CONTACT_PATTERNS.phone, ' ');
  }
  
  // Extract GitHub
  const github = text.match(CONTACT_PATTERNS.github);
  if (github && github.length > 0) {
    contact.github = github[0];
  }
  
  // Extract LinkedIn
  const linkedin = text.match(CONTACT_PATTERNS.linkedin);
  if (linkedin && linkedin.length > 0) {
    contact.linkedin = linkedin[0];
  }
  
  // Extract and remove all URLs
  const urls = text.match(CONTACT_PATTERNS.url);
  if (urls) {
    contact.urls = [...new Set(urls)];
    cleaned = cleaned.replace(CONTACT_PATTERNS.url, ' ');
  }
  
  // Clean up extra spaces
  cleaned = cleaned.replace(/\s+/g, ' ').replace(/\n /g, '\n');
  
  return { cleaned, contact };
}

/**
 * Check if a line is likely contact info (to skip during parsing)
 */
function isContactLine(line: string): boolean {
  
  // Contains email
  if (CONTACT_PATTERNS.email.test(line)) return true;
  
  // Contains phone-like pattern
  if (CONTACT_PATTERNS.phone.test(line)) return true;
  
  // Contains URL
  if (CONTACT_PATTERNS.url.test(line)) return true;
  
  // Contains address indicators
  if (/\b\d{5}(-\d{4})?\b/.test(line)) return true; // ZIP code
  if (/\b(?:street|st|avenue|ave|road|rd|boulevard|blvd|drive|dr)\b/i.test(line)) return true;
  
  return false;
}

// ========== STATE MACHINE SECTION DETECTION ==========

/**
 * Detect if a line is a section header
 * Returns the section type or null if not a header
 */
function detectSectionHeader(line: string): SectionType | null {
  const trimmed = line.trim();
  
  // Section headers are typically short (< 40 chars) and don't end with punctuation
  if (trimmed.length > 40 || trimmed.length < 3) return null;
  if (/[.!?,;]$/.test(trimmed)) return null;
  
  // Remove common formatting (bullets, numbers, colons)
  const normalized = trimmed
    .replace(/^[•\-\d.)\]]+\s*/, '')
    .replace(/:$/, '')
    .trim();
  
  // Check against each section type's patterns
  for (const [section, patterns] of Object.entries(SECTION_HEADERS)) {
    if (section === 'HEADER' || section === 'UNKNOWN') continue;
    
    for (const pattern of patterns) {
      if (pattern.test(normalized)) {
        return section as SectionType;
      }
    }
  }
  
  return null;
}

// ========== SKILL EXTRACTION (FROM SKILLS SECTION ONLY) ==========

/**
 * Extract skills from the SKILLS section content only
 * Uses taxonomy for normalization and synonym mapping
 */
function extractSkillsFromSection(skillsContent: string[]): string[] {
  const foundSkills = new Set<string>();
  
  for (const line of skillsContent) {
    // Skip empty lines and contact info
    if (!line.trim() || isContactLine(line)) continue;
    
    // Split by common skill delimiters
    const segments = line.split(/[,•|·;\/]|\s{2,}|\t/);
    
    for (const segment of segments) {
      const cleaned = segment.trim().toLowerCase();
      
      // Skip empty, too short, or too long segments
      if (cleaned.length < 2 || cleaned.length > 40) continue;
      
      // Skip URLs/emails that might have slipped through
      if (cleaned.includes('http') || cleaned.includes('@') || cleaned.includes('.com')) continue;
      
      // Skip common non-skill words
      if (/^(and|or|the|with|using|etc|including|proficient|experienced|knowledge|familiar)$/i.test(cleaned)) continue;
      
      // Look up in taxonomy
      const canonical = SKILL_LOOKUP.get(cleaned);
      if (canonical) {
        foundSkills.add(canonical);
        continue;
      }
      
      // Try partial matching for multi-word skills
      for (const [alias, canonical] of SKILL_LOOKUP) {
        // Exact word boundary match
        const regex = new RegExp(`\\b${escapeRegex(alias)}\\b`, 'i');
        if (regex.test(segment)) {
          foundSkills.add(canonical);
        }
      }
    }
  }
  
  return Array.from(foundSkills).sort();
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ========== CONTENT PROCESSORS ==========

/**
 * Process summary section content
 */
function processSummary(lines: string[]): string {
  return lines
    .filter(l => l.trim() && !isContactLine(l))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Process experience section - preserve structure
 */
function processExperience(lines: string[]): string[] {
  const entries: string[] = [];
  let currentEntry: string[] = [];
  
  for (const line of lines) {
    if (!line.trim()) {
      // Empty line might indicate new entry
      if (currentEntry.length > 0) {
        entries.push(currentEntry.join('\n').trim());
        currentEntry = [];
      }
      continue;
    }
    
    if (isContactLine(line)) continue;
    
    // Check if this line starts a new job entry
    // Indicators: contains date range, job title patterns, or company name patterns
    const isNewEntry = 
      /\b\d{4}\s*[-–—]\s*(?:present|current|\d{4})\b/i.test(line) ||
      /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{4}/i.test(line);
    
    if (isNewEntry && currentEntry.length > 0) {
      entries.push(currentEntry.join('\n').trim());
      currentEntry = [line];
    } else {
      currentEntry.push(line);
    }
  }
  
  // Don't forget the last entry
  if (currentEntry.length > 0) {
    entries.push(currentEntry.join('\n').trim());
  }
  
  // Filter out entries that are too short
  return entries.filter(e => e.length > 20);
}

/**
 * Process projects section - preserve structure
 */
function processProjects(lines: string[]): string[] {
  const entries: string[] = [];
  let currentEntry: string[] = [];
  
  for (const line of lines) {
    if (!line.trim()) {
      if (currentEntry.length > 0) {
        entries.push(currentEntry.join('\n').trim());
        currentEntry = [];
      }
      continue;
    }
    
    // Skip pure URLs (project links should be part of project description)
    if (/^https?:\/\//.test(line.trim())) continue;
    
    // New project indicators: starts with bullet, number, or is a short title-like line
    const isNewProject = 
      /^[•\-\d.)\]]+\s/.test(line) ||
      (line.length < 60 && !line.startsWith(' ') && currentEntry.length > 0);
    
    if (isNewProject && currentEntry.length > 0) {
      entries.push(currentEntry.join('\n').trim());
      currentEntry = [line.replace(/^[•\-\d.)\]]+\s*/, '')];
    } else {
      currentEntry.push(line);
    }
  }
  
  if (currentEntry.length > 0) {
    entries.push(currentEntry.join('\n').trim());
  }
  
  return entries.filter(e => e.length > 15);
}

/**
 * Process education section
 */
function processEducation(lines: string[]): string[] {
  const entries: string[] = [];
  let currentEntry: string[] = [];
  
  for (const line of lines) {
    if (!line.trim()) {
      if (currentEntry.length > 0) {
        entries.push(currentEntry.join(' | ').trim());
        currentEntry = [];
      }
      continue;
    }
    
    if (isContactLine(line)) continue;
    
    // New education entry indicators
    const isNewEntry = 
      /\b(?:bachelor|master|phd|b\.?s\.?|m\.?s\.?|b\.?tech|m\.?tech|mba|associate|diploma)\b/i.test(line) ||
      /\b(?:university|college|institute|school)\b/i.test(line);
    
    if (isNewEntry && currentEntry.length > 0 && !currentEntry.join(' ').toLowerCase().includes(line.toLowerCase().slice(0, 20))) {
      entries.push(currentEntry.join(' | ').trim());
      currentEntry = [line];
    } else {
      currentEntry.push(line);
    }
  }
  
  if (currentEntry.length > 0) {
    entries.push(currentEntry.join(' | ').trim());
  }
  
  return entries.filter(e => e.length > 10);
}

/**
 * Process certifications section
 */
function processCertifications(lines: string[]): string[] {
  return lines
    .filter(l => l.trim() && !isContactLine(l))
    .map(l => l.replace(/^[•\-\d.)\]]+\s*/, '').trim())
    .filter(l => l.length > 5);
}

// ========== MAIN PARSER (STATE MACHINE) ==========

/**
 * Parse resume text using state machine approach
 * 
 * STATE MACHINE EXPLANATION:
 * 1. Start in HEADER state (contact info section)
 * 2. Process line by line
 * 3. When a section header is detected, transition to that state
 * 4. All content goes into the current state's bucket
 * 5. Never guess sections - only explicit headers trigger transitions
 */
export function parseResumeText(text: string): ParsedResume {
  const warnings: string[] = [];
  
  // Step 1: Clean text
  const cleanedText = cleanExtractedText(text);
  
  // Step 2: Check for corruption
  if (isTextCorrupted(cleanedText)) {
    return {
      summary: '',
      skills: [],
      experience: [],
      projects: [],
      education: [],
      certifications: [],
      rawText: '',
      parseQuality: 'failed',
      warnings: ['Text appears corrupted or image-based. Please paste resume text manually.'],
    };
  }
  
  // Step 3: Extract and filter contact info
  const { cleaned: textWithoutContacts } = extractContactInfo(cleanedText);
  
  // Step 4: Initialize state machine
  const state: ParserState = {
    currentSection: 'HEADER',
    sections: new Map([
      ['HEADER', []],
      ['SUMMARY', []],
      ['SKILLS', []],
      ['EXPERIENCE', []],
      ['PROJECTS', []],
      ['EDUCATION', []],
      ['CERTIFICATIONS', []],
      ['UNKNOWN', []],
    ]),
    contactInfo: {
      emails: [],
      phones: [],
      urls: [],
      github: null,
      linkedin: null,
    },
  };
  
  // Step 5: Process line by line
  const lines = textWithoutContacts.split('\n');
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip empty lines but preserve structure
    if (!trimmedLine) {
      const currentContent = state.sections.get(state.currentSection);
      if (currentContent && currentContent.length > 0) {
        currentContent.push(''); // Preserve paragraph breaks
      }
      continue;
    }
    
    // Check if this line is a section header
    const newSection = detectSectionHeader(trimmedLine);
    
    if (newSection) {
      // TRANSITION: Switch to new section
      state.currentSection = newSection;
      continue; // Don't add the header itself to content
    }
    
    // Skip contact info lines
    if (isContactLine(trimmedLine)) {
      continue;
    }
    
    // Add line to current section
    const sectionContent = state.sections.get(state.currentSection);
    if (sectionContent) {
      sectionContent.push(trimmedLine);
    }
  }
  
  // Step 6: Process each section with appropriate handler
  const summaryLines = state.sections.get('SUMMARY') || [];
  const skillsLines = state.sections.get('SKILLS') || [];
  const experienceLines = state.sections.get('EXPERIENCE') || [];
  const projectsLines = state.sections.get('PROJECTS') || [];
  const educationLines = state.sections.get('EDUCATION') || [];
  const certLines = state.sections.get('CERTIFICATIONS') || [];
  
  const summary = processSummary(summaryLines);
  const skills = extractSkillsFromSection(skillsLines);
  const experience = processExperience(experienceLines);
  const projects = processProjects(projectsLines);
  const education = processEducation(educationLines);
  const certifications = processCertifications(certLines);
  
  // Step 7: Determine parse quality
  let parseQuality: 'good' | 'partial' | 'failed' = 'good';
  
  const sectionsFound = [
    skills.length > 0,
    experience.length > 0,
    education.length > 0,
  ].filter(Boolean).length;
  
  if (sectionsFound === 0) {
    parseQuality = 'partial';
    warnings.push('Could not detect standard resume sections. Text may need manual formatting.');
  } else if (sectionsFound < 2) {
    parseQuality = 'partial';
    warnings.push('Some sections may not have been detected correctly.');
  }
  
  // Add warnings for empty important sections
  if (skills.length === 0 && skillsLines.length > 0) {
    warnings.push('Skills section found but no recognized skills extracted.');
  }
  if (experience.length === 0 && cleanedText.length > 500) {
    warnings.push('No work experience section detected.');
  }
  
  return {
    summary,
    skills,
    experience,
    projects,
    education,
    certifications,
    rawText: cleanedText,
    parseQuality,
    warnings,
  };
}

/**
 * Format parsed resume for display
 */
export function formatResumeForDisplay(parsed: ParsedResume): string {
  if (parsed.parseQuality === 'failed') {
    return '';
  }
  
  const parts: string[] = [];
  
  if (parsed.summary) {
    parts.push(`SUMMARY\n${parsed.summary}`);
  }
  
  if (parsed.skills.length > 0) {
    parts.push(`SKILLS\n${parsed.skills.join(', ')}`);
  }
  
  if (parsed.experience.length > 0) {
    parts.push(`EXPERIENCE\n${parsed.experience.join('\n\n')}`);
  }
  
  if (parsed.projects.length > 0) {
    parts.push(`PROJECTS\n${parsed.projects.join('\n\n')}`);
  }
  
  if (parsed.education.length > 0) {
    parts.push(`EDUCATION\n${parsed.education.join('\n')}`);
  }
  
  if (parsed.certifications.length > 0) {
    parts.push(`CERTIFICATIONS\n${parsed.certifications.join('\n')}`);
  }
  
  if (parts.length === 0 && parsed.rawText) {
    return parsed.rawText;
  }
  
  return parts.join('\n\n---\n\n');
}

// ========== EXPORTS FOR EXTERNAL USE ==========

export { extractSkillsFromSection as extractSkills };

