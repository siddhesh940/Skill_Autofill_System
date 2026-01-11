// =====================================================
// ROADMAP GENERATOR
// Creates learning paths from missing skills
// =====================================================

import {
    LearningResource,
    LearningRoadmap,
    MissingSkill,
    RoadmapMilestone,
    RoadmapPhase,
    RoadmapTask,
    SkillCategory
} from '@/types';

// LEARNING RESOURCES DATABASE
// =====================================================

interface ResourceTemplate {
  type: 'course' | 'tutorial' | 'documentation' | 'video' | 'book' | 'practice';
  titleTemplate: string;
  urlTemplate: string;
  provider: string;
  is_free: boolean;
  hours: number;
}

const SKILL_RESOURCES: Record<string, ResourceTemplate[]> = {
  'React': [
    { type: 'documentation', titleTemplate: 'React Official Documentation', urlTemplate: 'https://react.dev/learn', provider: 'React', is_free: true, hours: 10 },
    { type: 'tutorial', titleTemplate: 'React Tutorial for Beginners', urlTemplate: 'https://react.dev/learn/tutorial-tic-tac-toe', provider: 'React', is_free: true, hours: 5 },
    { type: 'practice', titleTemplate: 'Build 5 React Projects', urlTemplate: 'https://github.com/topics/react-projects', provider: 'GitHub', is_free: true, hours: 20 },
  ],
  'TypeScript': [
    { type: 'documentation', titleTemplate: 'TypeScript Handbook', urlTemplate: 'https://www.typescriptlang.org/docs/handbook/', provider: 'Microsoft', is_free: true, hours: 8 },
    { type: 'tutorial', titleTemplate: 'TypeScript Deep Dive', urlTemplate: 'https://basarat.gitbook.io/typescript/', provider: 'Basarat', is_free: true, hours: 15 },
    { type: 'practice', titleTemplate: 'Type Challenges', urlTemplate: 'https://github.com/type-challenges/type-challenges', provider: 'GitHub', is_free: true, hours: 10 },
  ],
  'Next.js': [
    { type: 'documentation', titleTemplate: 'Next.js Documentation', urlTemplate: 'https://nextjs.org/docs', provider: 'Vercel', is_free: true, hours: 10 },
    { type: 'tutorial', titleTemplate: 'Learn Next.js', urlTemplate: 'https://nextjs.org/learn', provider: 'Vercel', is_free: true, hours: 8 },
    { type: 'practice', titleTemplate: 'Build a Full-Stack App with Next.js', urlTemplate: 'https://nextjs.org/docs/app', provider: 'Vercel', is_free: true, hours: 15 },
  ],
  'Node.js': [
    { type: 'documentation', titleTemplate: 'Node.js Official Docs', urlTemplate: 'https://nodejs.org/docs/latest/api/', provider: 'Node.js', is_free: true, hours: 10 },
    { type: 'tutorial', titleTemplate: 'Node.js Tutorial', urlTemplate: 'https://nodejs.dev/learn', provider: 'Node.js', is_free: true, hours: 8 },
    { type: 'practice', titleTemplate: 'Build REST APIs with Node.js', urlTemplate: 'https://github.com/topics/nodejs-api', provider: 'GitHub', is_free: true, hours: 15 },
  ],
  'PostgreSQL': [
    { type: 'documentation', titleTemplate: 'PostgreSQL Documentation', urlTemplate: 'https://www.postgresql.org/docs/', provider: 'PostgreSQL', is_free: true, hours: 10 },
    { type: 'tutorial', titleTemplate: 'PostgreSQL Tutorial', urlTemplate: 'https://www.postgresqltutorial.com/', provider: 'PostgreSQL Tutorial', is_free: true, hours: 8 },
    { type: 'practice', titleTemplate: 'SQL Practice Problems', urlTemplate: 'https://www.sql-practice.com/', provider: 'SQL Practice', is_free: true, hours: 10 },
  ],
  'Docker': [
    { type: 'documentation', titleTemplate: 'Docker Official Docs', urlTemplate: 'https://docs.docker.com/get-started/', provider: 'Docker', is_free: true, hours: 6 },
    { type: 'tutorial', titleTemplate: 'Docker Getting Started', urlTemplate: 'https://docs.docker.com/get-started/', provider: 'Docker', is_free: true, hours: 5 },
    { type: 'practice', titleTemplate: 'Dockerize Your Projects', urlTemplate: 'https://docs.docker.com/samples/', provider: 'Docker', is_free: true, hours: 10 },
  ],
  'AWS': [
    { type: 'documentation', titleTemplate: 'AWS Documentation', urlTemplate: 'https://docs.aws.amazon.com/', provider: 'AWS', is_free: true, hours: 20 },
    { type: 'tutorial', titleTemplate: 'AWS Skill Builder', urlTemplate: 'https://explore.skillbuilder.aws/', provider: 'AWS', is_free: true, hours: 15 },
    { type: 'practice', titleTemplate: 'AWS Hands-On Labs', urlTemplate: 'https://aws.amazon.com/getting-started/hands-on/', provider: 'AWS', is_free: true, hours: 20 },
  ],
  'Kubernetes': [
    { type: 'documentation', titleTemplate: 'Kubernetes Documentation', urlTemplate: 'https://kubernetes.io/docs/home/', provider: 'CNCF', is_free: true, hours: 15 },
    { type: 'tutorial', titleTemplate: 'Learn Kubernetes Basics', urlTemplate: 'https://kubernetes.io/docs/tutorials/kubernetes-basics/', provider: 'CNCF', is_free: true, hours: 8 },
    { type: 'practice', titleTemplate: 'Kubernetes Exercises', urlTemplate: 'https://github.com/dgkanatsios/CKAD-exercises', provider: 'GitHub', is_free: true, hours: 15 },
  ],
};

// Default resources for skills not in database
const DEFAULT_RESOURCES: ResourceTemplate[] = [
  { type: 'documentation', titleTemplate: '{skill} Official Documentation', urlTemplate: 'https://www.google.com/search?q={skill}+documentation', provider: 'Various', is_free: true, hours: 10 },
  { type: 'tutorial', titleTemplate: '{skill} Beginner Tutorial', urlTemplate: 'https://www.youtube.com/results?search_query={skill}+tutorial', provider: 'YouTube', is_free: true, hours: 5 },
  { type: 'practice', titleTemplate: 'Practice {skill} Projects', urlTemplate: 'https://github.com/topics/{skill}', provider: 'GitHub', is_free: true, hours: 15 },
];

function getResourcesForSkill(skillName: string): LearningResource[] {
  const templates = SKILL_RESOURCES[skillName] || DEFAULT_RESOURCES;
  
  return templates.map(t => ({
    title: t.titleTemplate.replace('{skill}', skillName),
    url: t.urlTemplate.replace('{skill}', skillName.toLowerCase().replace(/\s+/g, '-')),
    type: t.type,
    provider: t.provider,
    is_free: t.is_free,
  }));
}

// =====================================================
// TASK TEMPLATES
// =====================================================

interface TaskTemplate {
  titleTemplate: string;
  descriptionTemplate: string;
  deliverableTemplate: string;
  hours: number;
}

const CATEGORY_TASKS: Record<SkillCategory, TaskTemplate[]> = {
  language: [
    { titleTemplate: 'Learn {skill} syntax basics', descriptionTemplate: 'Study core syntax, data types, and control structures', deliverableTemplate: 'Complete syntax exercises', hours: 4 },
    { titleTemplate: 'Build CLI tool with {skill}', descriptionTemplate: 'Create a command-line application', deliverableTemplate: 'Working CLI tool', hours: 6 },
    { titleTemplate: 'Solve coding challenges', descriptionTemplate: 'Practice algorithms and data structures', deliverableTemplate: '10 solved problems', hours: 8 },
  ],
  framework: [
    { titleTemplate: 'Setup {skill} project', descriptionTemplate: 'Initialize project with best practices', deliverableTemplate: 'Configured project repository', hours: 3 },
    { titleTemplate: 'Build sample app with {skill}', descriptionTemplate: 'Create a complete application using the framework', deliverableTemplate: 'Deployed sample app', hours: 10 },
    { titleTemplate: 'Learn {skill} patterns', descriptionTemplate: 'Study common patterns and best practices', deliverableTemplate: 'Pattern examples implemented', hours: 5 },
  ],
  runtime: [
    { titleTemplate: 'Setup {skill} environment', descriptionTemplate: 'Configure development environment', deliverableTemplate: 'Working local setup', hours: 2 },
    { titleTemplate: 'Build server with {skill}', descriptionTemplate: 'Create a backend server application', deliverableTemplate: 'Running server', hours: 8 },
  ],
  database: [
    { titleTemplate: 'Learn {skill} fundamentals', descriptionTemplate: 'Study database concepts and queries', deliverableTemplate: 'Query exercise completion', hours: 5 },
    { titleTemplate: 'Design database schema', descriptionTemplate: 'Create normalized database schema', deliverableTemplate: 'Schema documentation', hours: 4 },
    { titleTemplate: 'Optimize queries', descriptionTemplate: 'Learn indexing and query optimization', deliverableTemplate: 'Performance benchmarks', hours: 4 },
  ],
  cloud: [
    { titleTemplate: 'Setup {skill} account', descriptionTemplate: 'Create account and configure CLI', deliverableTemplate: 'Configured cloud account', hours: 2 },
    { titleTemplate: 'Deploy application to {skill}', descriptionTemplate: 'Deploy a sample application', deliverableTemplate: 'Live deployed app', hours: 6 },
    { titleTemplate: 'Learn {skill} services', descriptionTemplate: 'Study core services and use cases', deliverableTemplate: 'Service comparison notes', hours: 8 },
  ],
  devops: [
    { titleTemplate: 'Setup {skill}', descriptionTemplate: 'Install and configure the tool', deliverableTemplate: 'Working installation', hours: 3 },
    { titleTemplate: 'Create {skill} pipeline', descriptionTemplate: 'Build automated deployment pipeline', deliverableTemplate: 'Working CI/CD pipeline', hours: 8 },
    { titleTemplate: 'Implement {skill} best practices', descriptionTemplate: 'Apply industry best practices', deliverableTemplate: 'Documentation of practices', hours: 4 },
  ],
  tool: [
    { titleTemplate: 'Learn {skill} basics', descriptionTemplate: 'Study fundamental operations', deliverableTemplate: 'Completed exercises', hours: 3 },
    { titleTemplate: 'Daily {skill} practice', descriptionTemplate: 'Use the tool in daily workflow', deliverableTemplate: 'Usage logs', hours: 5 },
  ],
  concept: [
    { titleTemplate: 'Study {skill} theory', descriptionTemplate: 'Learn theoretical foundations', deliverableTemplate: 'Summary notes', hours: 4 },
    { titleTemplate: 'Implement {skill}', descriptionTemplate: 'Apply the concept in a project', deliverableTemplate: 'Working implementation', hours: 6 },
  ],
  soft_skill: [
    { titleTemplate: 'Practice {skill}', descriptionTemplate: 'Apply in daily interactions', deliverableTemplate: 'Weekly reflection', hours: 4 },
    { titleTemplate: 'Study {skill} techniques', descriptionTemplate: 'Learn proven techniques', deliverableTemplate: 'Technique summary', hours: 3 },
  ],
};

function generateTasksForSkill(skillName: string, category: SkillCategory): RoadmapTask[] {
  const templates = CATEGORY_TASKS[category] || CATEGORY_TASKS.tool;
  
  return templates.map((t, index) => ({
    id: `task-${skillName.toLowerCase().replace(/\s+/g, '-')}-${index + 1}`,
    title: t.titleTemplate.replace('{skill}', skillName),
    description: t.descriptionTemplate.replace('{skill}', skillName),
    skill: skillName,
    estimated_hours: t.hours,
    deliverable: t.deliverableTemplate.replace('{skill}', skillName),
  }));
}

// =====================================================
// PHASE ORGANIZATION
// =====================================================

function organizeIntoPhases(
  missingSkills: MissingSkill[],
  weeklyHours: number
): RoadmapPhase[] {
  const phases: RoadmapPhase[] = [];
  
  // Group by priority
  const highPriority = missingSkills.filter(s => s.priority === 'high');
  const mediumPriority = missingSkills.filter(s => s.priority === 'medium');
  const lowPriority = missingSkills.filter(s => s.priority === 'low');
  
  let phaseNumber = 1;
  
  // Phase 1: High priority skills
  if (highPriority.length > 0) {
    const skills = highPriority.slice(0, 3); // Max 3 skills per phase
    const tasks = skills.flatMap(s => generateTasksForSkill(s.skill_name, s.category));
    const totalHours = tasks.reduce((sum, t) => sum + t.estimated_hours, 0);
    
    phases.push({
      phase_number: phaseNumber++,
      title: 'Foundation: Critical Skills',
      duration_weeks: Math.ceil(totalHours / weeklyHours),
      skills_covered: skills.map(s => s.skill_name),
      tasks,
      resources: skills.flatMap(s => getResourcesForSkill(s.skill_name)),
    });
    
    // Additional high priority if more than 3
    if (highPriority.length > 3) {
      const moreSkills = highPriority.slice(3);
      const moreTasks = moreSkills.flatMap(s => generateTasksForSkill(s.skill_name, s.category));
      const moreHours = moreTasks.reduce((sum, t) => sum + t.estimated_hours, 0);
      
      phases.push({
        phase_number: phaseNumber++,
        title: 'Foundation: Essential Skills',
        duration_weeks: Math.ceil(moreHours / weeklyHours),
        skills_covered: moreSkills.map(s => s.skill_name),
        tasks: moreTasks,
        resources: moreSkills.flatMap(s => getResourcesForSkill(s.skill_name)),
      });
    }
  }
  
  // Phase 2: Medium priority skills
  if (mediumPriority.length > 0) {
    const skills = mediumPriority.slice(0, 4);
    const tasks = skills.flatMap(s => generateTasksForSkill(s.skill_name, s.category));
    const totalHours = tasks.reduce((sum, t) => sum + t.estimated_hours, 0);
    
    phases.push({
      phase_number: phaseNumber++,
      title: 'Growth: Complementary Skills',
      duration_weeks: Math.ceil(totalHours / weeklyHours),
      skills_covered: skills.map(s => s.skill_name),
      tasks,
      resources: skills.flatMap(s => getResourcesForSkill(s.skill_name)),
    });
  }
  
  // Phase 3: Integration project
  const allSkillNames = [...highPriority, ...mediumPriority].map(s => s.skill_name);
  if (allSkillNames.length > 0) {
    phases.push({
      phase_number: phaseNumber++,
      title: 'Integration: Portfolio Project',
      duration_weeks: 2,
      skills_covered: allSkillNames.slice(0, 5),
      tasks: [
        {
          id: 'integration-project',
          title: 'Build Portfolio Project',
          description: `Create a comprehensive project showcasing ${allSkillNames.slice(0, 3).join(', ')}`,
          skill: 'Project Development',
          estimated_hours: weeklyHours * 2,
          deliverable: 'Deployed project with GitHub repository',
        },
      ],
      resources: [
        {
          title: 'Project Ideas Repository',
          url: 'https://github.com/practical-tutorials/project-based-learning',
          type: 'practice',
          provider: 'GitHub',
          is_free: true,
        },
      ],
    });
  }
  
  return phases;
}

// =====================================================
// MILESTONE GENERATION
// =====================================================

function generateMilestones(phases: RoadmapPhase[]): RoadmapMilestone[] {
  const milestones: RoadmapMilestone[] = [];
  let currentWeek = 0;
  
  for (const phase of phases) {
    currentWeek += phase.duration_weeks;
    
    milestones.push({
      week: currentWeek,
      title: `Complete ${phase.title}`,
      skills_acquired: phase.skills_covered,
      checkpoint: phase.phase_number === phases.length
        ? 'Project deployment and portfolio update'
        : `Assessment of ${phase.skills_covered.join(', ')}`,
    });
  }
  
  return milestones;
}

// =====================================================
// MAIN ROADMAP GENERATOR
// =====================================================

export function generateRoadmap(
  missingSkills: MissingSkill[],
  weeklyHoursAvailable: number = 10
): LearningRoadmap {
  // Filter to focus on high and medium priority
  const prioritizedSkills = missingSkills.filter(s => s.priority !== 'low');
  
  // Organize into phases
  const phases = organizeIntoPhases(prioritizedSkills, weeklyHoursAvailable);
  
  // Calculate total duration
  const totalWeeks = phases.reduce((sum, p) => sum + p.duration_weeks, 0);
  
  // Generate milestones
  const milestones = generateMilestones(phases);
  
  return {
    total_weeks: totalWeeks,
    weekly_hours: weeklyHoursAvailable,
    phases,
    milestones,
  };
}

// =====================================================
// ROADMAP SUMMARY
// =====================================================

export function summarizeRoadmap(roadmap: LearningRoadmap): string {
  const totalTasks = roadmap.phases.reduce((sum, p) => sum + p.tasks.length, 0);
  const skillsCovered = [...new Set(roadmap.phases.flatMap(p => p.skills_covered))];
  
  return `${roadmap.total_weeks}-week learning plan covering ${skillsCovered.length} skills with ${totalTasks} tasks. ` +
    `Requires ${roadmap.weekly_hours} hours/week commitment.`;
}
