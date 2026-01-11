// =====================================================
// NLP MODULE INDEX
// Central export for all NLP processing modules
// =====================================================

// Skill Taxonomy
export { ALIAS_TO_CANONICAL, CANONICAL_TO_ENTRY, SKILL_TAXONOMY, getHotSkills, getSkillEntry, getSkillsByCategory, isKnownSkill, normalizeSkill, type TaxonomyEntry } from './skill-taxonomy';

// JD Extractor
export {
    extractJobDescription,
    scrapeJobUrl
} from './jd-extractor';

// Profile Analyzer
export {
    analyzeGitHubData,
    combineSkills, parseResumeText
} from './profile-analyzer';

// Skill Gap Engine
export {
    analyzeSkillGap,
    summarizeSkillGap
} from './skill-gap-engine';

// Roadmap Generator
export {
    generateRoadmap
} from './roadmap-generator';

// Resume Improver
export {
    improveResume,
    validateResumeTruthfulness
} from './resume-improver';

// Resume Parser (PDF text extraction and structured parsing)
export {
    cleanExtractedText, extractSkills as extractSkillsFromText, formatResumeForDisplay, isTextCorrupted, parseResumeText as parseResumeStructured, type ParsedResume
} from './resume-parser';

// Project Recommender
export {
    customizeProjectForJob, recommendProjects
} from './project-recommender';

// GitHub Task Generator
export { generateGitHubTasks } from './github-task-generator';

// Portfolio Updater
export {
    generatePortfolioUpdates,
    mergePortfolioUpdates,
    type PortfolioSyncResult
} from './portfolio-updater';

