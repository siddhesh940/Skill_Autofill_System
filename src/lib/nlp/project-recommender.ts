// =====================================================
// PROJECT RECOMMENDATION ENGINE
// Matches skill gaps to project templates
// =====================================================

import {
    DifficultyLevel,
    MissingSkill,
    ParsedJobDescription,
    ProjectRecommendations,
    RecommendedProject,
} from '@/types';
// =====================================================
// PROJECT TEMPLATE DATABASE
// =====================================================

interface ProjectTemplate {
  id: string;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  estimated_hours: number;
  tech_stack: string[];
  skills_demonstrated: string[];
  features: string[];
  github_structure: string[];
  learning_outcomes: string[];
  tags: string[];
}

const PROJECT_TEMPLATES: ProjectTemplate[] = [
  // Full-Stack Projects
  {
    id: 'task-manager',
    title: 'Full-Stack Task Manager',
    description: 'A comprehensive task management application with user authentication, real-time updates, and team collaboration features.',
    difficulty: 'intermediate',
    estimated_hours: 40,
    tech_stack: ['Next.js', 'TypeScript', 'TailwindCSS', 'Supabase', 'PostgreSQL'],
    skills_demonstrated: ['React', 'Next.js', 'TypeScript', 'PostgreSQL', 'REST API', 'Authentication'],
    features: ['User authentication', 'CRUD operations', 'Real-time updates', 'Team workspaces', 'Task filtering & sorting', 'Due date reminders'],
    github_structure: ['src/app/', 'src/components/', 'src/lib/', 'src/types/', 'supabase/migrations/', 'README.md'],
    learning_outcomes: ['Full-stack development', 'Database design', 'State management', 'API design'],
    tags: ['fullstack', 'crud', 'auth', 'realtime'],
  },
  {
    id: 'ecommerce',
    title: 'E-Commerce Platform',
    description: 'A modern e-commerce platform with product catalog, shopping cart, payment integration, and admin dashboard.',
    difficulty: 'advanced',
    estimated_hours: 80,
    tech_stack: ['Next.js', 'TypeScript', 'TailwindCSS', 'PostgreSQL', 'Stripe', 'Redis'],
    skills_demonstrated: ['React', 'Next.js', 'TypeScript', 'PostgreSQL', 'Payment Integration', 'Caching'],
    features: ['Product catalog', 'Shopping cart', 'Checkout flow', 'Payment processing', 'Order management', 'Admin dashboard'],
    github_structure: ['src/app/', 'src/components/', 'src/lib/', 'src/hooks/', 'prisma/', 'README.md'],
    learning_outcomes: ['Complex state management', 'Payment integration', 'Performance optimization', 'Security best practices'],
    tags: ['fullstack', 'payments', 'advanced', 'production'],
  },
  {
    id: 'chat-app',
    title: 'Real-Time Chat Application',
    description: 'A real-time messaging application with channels, direct messages, and file sharing capabilities.',
    difficulty: 'intermediate',
    estimated_hours: 35,
    tech_stack: ['Next.js', 'TypeScript', 'Supabase', 'WebSockets', 'TailwindCSS'],
    skills_demonstrated: ['React', 'WebSockets', 'Real-time', 'PostgreSQL', 'File Upload'],
    features: ['Real-time messaging', 'Channel creation', 'Direct messages', 'File sharing', 'User presence', 'Message search'],
    github_structure: ['src/app/', 'src/components/', 'src/lib/', 'src/hooks/', 'supabase/', 'README.md'],
    learning_outcomes: ['Real-time communication', 'WebSocket handling', 'Database relationships'],
    tags: ['fullstack', 'realtime', 'websockets'],
  },
  {
    id: 'blog-cms',
    title: 'Personal Blog with CMS',
    description: 'A modern blog platform with a custom CMS, markdown support, and SEO optimization.',
    difficulty: 'beginner',
    estimated_hours: 25,
    tech_stack: ['Next.js', 'TypeScript', 'TailwindCSS', 'MDX', 'Supabase'],
    skills_demonstrated: ['React', 'Next.js', 'TypeScript', 'SEO', 'Markdown'],
    features: ['Blog posts', 'Categories & tags', 'Search functionality', 'Admin CMS', 'SEO optimization', 'RSS feed'],
    github_structure: ['src/app/', 'src/components/', 'src/content/', 'public/', 'README.md'],
    learning_outcomes: ['Content management', 'SEO practices', 'Static site generation'],
    tags: ['frontend', 'cms', 'seo', 'beginner'],
  },
  
  // Backend Projects
  {
    id: 'api-rate-limiter',
    title: 'API Rate Limiter Service',
    description: 'A high-performance API rate limiting service with Redis caching and analytics dashboard.',
    difficulty: 'advanced',
    estimated_hours: 30,
    tech_stack: ['Node.js', 'TypeScript', 'Redis', 'Express.js', 'Docker'],
    skills_demonstrated: ['Node.js', 'Redis', 'Docker', 'REST API', 'Microservices'],
    features: ['Rate limiting algorithms', 'Redis caching', 'API key management', 'Analytics dashboard', 'Docker deployment'],
    github_structure: ['src/', 'tests/', 'docker/', 'docs/', 'README.md'],
    learning_outcomes: ['Caching strategies', 'Algorithm implementation', 'Microservice architecture'],
    tags: ['backend', 'caching', 'microservices', 'devops'],
  },
  {
    id: 'job-board',
    title: 'Job Board Platform',
    description: 'A job board with company profiles, job listings, and application tracking.',
    difficulty: 'intermediate',
    estimated_hours: 45,
    tech_stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'TailwindCSS', 'Supabase'],
    skills_demonstrated: ['React', 'Next.js', 'PostgreSQL', 'Full-text Search', 'Authentication'],
    features: ['Job listings', 'Company profiles', 'Application tracking', 'Search & filters', 'Email notifications', 'Resume upload'],
    github_structure: ['src/app/', 'src/components/', 'src/lib/', 'supabase/', 'README.md'],
    learning_outcomes: ['Complex queries', 'Full-text search', 'File handling', 'Email integration'],
    tags: ['fullstack', 'search', 'auth'],
  },
  {
    id: 'weather-dashboard',
    title: 'Weather Dashboard',
    description: 'A beautiful weather dashboard with location-based forecasts and data visualization.',
    difficulty: 'beginner',
    estimated_hours: 15,
    tech_stack: ['Next.js', 'TypeScript', 'TailwindCSS', 'Chart.js'],
    skills_demonstrated: ['React', 'REST API', 'Data Visualization', 'TypeScript'],
    features: ['Current weather', '7-day forecast', 'Location search', 'Weather charts', 'Responsive design'],
    github_structure: ['src/app/', 'src/components/', 'src/lib/', 'public/', 'README.md'],
    learning_outcomes: ['API consumption', 'Data visualization', 'Responsive design'],
    tags: ['frontend', 'api', 'beginner', 'visualization'],
  },
  {
    id: 'devops-dashboard',
    title: 'DevOps Dashboard',
    description: 'A monitoring dashboard for CI/CD pipelines, deployments, and system health.',
    difficulty: 'advanced',
    estimated_hours: 50,
    tech_stack: ['Next.js', 'TypeScript', 'Docker', 'Kubernetes', 'PostgreSQL'],
    skills_demonstrated: ['Docker', 'Kubernetes', 'CI/CD', 'Monitoring', 'DevOps'],
    features: ['Pipeline monitoring', 'Deployment tracking', 'System metrics', 'Alert management', 'Log aggregation'],
    github_structure: ['src/', 'k8s/', 'docker/', 'monitoring/', 'README.md'],
    learning_outcomes: ['Container orchestration', 'Monitoring setup', 'Infrastructure management'],
    tags: ['devops', 'docker', 'kubernetes', 'advanced'],
  },
  
  // API Projects
  {
    id: 'graphql-api',
    title: 'GraphQL API with Authentication',
    description: 'A production-ready GraphQL API with authentication, authorization, and database integration.',
    difficulty: 'intermediate',
    estimated_hours: 30,
    tech_stack: ['Node.js', 'TypeScript', 'GraphQL', 'PostgreSQL', 'JWT'],
    skills_demonstrated: ['GraphQL', 'Node.js', 'TypeScript', 'PostgreSQL', 'Authentication'],
    features: ['GraphQL schema', 'Mutations & Queries', 'JWT auth', 'Role-based access', 'Pagination', 'Error handling'],
    github_structure: ['src/schema/', 'src/resolvers/', 'src/models/', 'src/middleware/', 'README.md'],
    learning_outcomes: ['GraphQL design', 'Authentication patterns', 'API security'],
    tags: ['backend', 'graphql', 'api', 'auth'],
  },
  {
    id: 'rest-api-express',
    title: 'RESTful API with Express',
    description: 'A well-structured REST API following best practices with comprehensive documentation.',
    difficulty: 'beginner',
    estimated_hours: 20,
    tech_stack: ['Node.js', 'Express.js', 'TypeScript', 'PostgreSQL', 'Swagger'],
    skills_demonstrated: ['Node.js', 'Express.js', 'REST API', 'PostgreSQL', 'TypeScript'],
    features: ['CRUD endpoints', 'Input validation', 'Error handling', 'API documentation', 'Rate limiting', 'Logging'],
    github_structure: ['src/routes/', 'src/controllers/', 'src/models/', 'src/middleware/', 'docs/', 'README.md'],
    learning_outcomes: ['REST principles', 'API design', 'Documentation', 'Error handling'],
    tags: ['backend', 'rest', 'api', 'beginner'],
  },
  
  // Cloud Projects
  {
    id: 'serverless-app',
    title: 'Serverless Application',
    description: 'A serverless application deployed on AWS with Lambda, API Gateway, and DynamoDB.',
    difficulty: 'intermediate',
    estimated_hours: 35,
    tech_stack: ['AWS', 'Lambda', 'DynamoDB', 'API Gateway', 'TypeScript'],
    skills_demonstrated: ['AWS', 'Serverless', 'Cloud Architecture', 'NoSQL'],
    features: ['Lambda functions', 'API Gateway', 'DynamoDB tables', 'CloudWatch logging', 'IAM roles', 'CI/CD deployment'],
    github_structure: ['src/functions/', 'src/lib/', 'serverless.yml', 'tests/', 'README.md'],
    learning_outcomes: ['Serverless architecture', 'AWS services', 'Cloud deployment'],
    tags: ['cloud', 'aws', 'serverless'],
  },
  {
    id: 'container-deploy',
    title: 'Containerized Microservice',
    description: 'A containerized microservice with Docker Compose and Kubernetes deployment.',
    difficulty: 'intermediate',
    estimated_hours: 25,
    tech_stack: ['Docker', 'Kubernetes', 'Node.js', 'PostgreSQL', 'Nginx'],
    skills_demonstrated: ['Docker', 'Kubernetes', 'DevOps', 'Microservices'],
    features: ['Dockerfile', 'Docker Compose', 'K8s manifests', 'Health checks', 'Load balancing', 'Secrets management'],
    github_structure: ['src/', 'docker/', 'k8s/', 'scripts/', 'README.md'],
    learning_outcomes: ['Containerization', 'Orchestration', 'Infrastructure as Code'],
    tags: ['devops', 'docker', 'kubernetes'],
  },
  
  // Data Projects
  {
    id: 'analytics-dashboard',
    title: 'Analytics Dashboard',
    description: 'A data analytics dashboard with charts, filters, and export capabilities.',
    difficulty: 'intermediate',
    estimated_hours: 35,
    tech_stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Chart.js', 'TailwindCSS'],
    skills_demonstrated: ['React', 'Data Visualization', 'PostgreSQL', 'TypeScript'],
    features: ['Interactive charts', 'Date filtering', 'Data export', 'Dashboard layout', 'Real-time updates'],
    github_structure: ['src/app/', 'src/components/', 'src/lib/', 'src/hooks/', 'README.md'],
    learning_outcomes: ['Data visualization', 'Dashboard design', 'Performance optimization'],
    tags: ['frontend', 'data', 'visualization'],
  },
];

// =====================================================
// MATCHING ALGORITHM
// =====================================================

interface ProjectScore {
  project: ProjectTemplate;
  score: number;
  matchedSkills: string[];
  reason: string;
}

function scoreProject(
  template: ProjectTemplate,
  missingSkills: MissingSkill[],
  jobRequirements: string[]
): ProjectScore {
  let score = 0;
  const matchedSkills: string[] = [];
  const reasons: string[] = [];
  
  const missingSkillNames = new Set(missingSkills.map(s => s.skill_name.toLowerCase()));
  const jobReqNames = new Set(jobRequirements.map(s => s.toLowerCase()));
  
  // Score based on skills demonstrated
  for (const skill of template.skills_demonstrated) {
    const lowerSkill = skill.toLowerCase();
    
    if (missingSkillNames.has(lowerSkill)) {
      // High value: teaches a missing skill
      score += 15;
      matchedSkills.push(skill);
      reasons.push(`Teaches ${skill} (missing skill)`);
    } else if (jobReqNames.has(lowerSkill)) {
      // Medium value: reinforces a required skill
      score += 8;
      matchedSkills.push(skill);
    }
  }
  
  // Bonus for tech stack match
  for (const tech of template.tech_stack) {
    if (jobReqNames.has(tech.toLowerCase())) {
      score += 5;
    }
  }
  
  // Bonus for covering high-priority skills
  const highPriorityMissing = missingSkills.filter(s => s.priority === 'high');
  for (const skill of highPriorityMissing) {
    if (template.skills_demonstrated.map(s => s.toLowerCase()).includes(skill.skill_name.toLowerCase())) {
      score += 10;
      reasons.push(`Addresses high-priority gap: ${skill.skill_name}`);
    }
  }
  
  // Difficulty adjustment
  const priorityCount = missingSkills.filter(s => s.priority === 'high' || s.priority === 'medium').length;
  if (priorityCount <= 2 && template.difficulty === 'beginner') {
    score += 5;
  } else if (priorityCount >= 5 && template.difficulty === 'advanced') {
    score += 5;
  }
  
  // Generate reason string
  const reason = reasons.length > 0 
    ? reasons.slice(0, 2).join('; ')
    : `Demonstrates ${matchedSkills.slice(0, 3).join(', ')}`;
  
  return { project: template, score, matchedSkills, reason };
}

// =====================================================
// MAIN RECOMMENDATION FUNCTION
// =====================================================

export function recommendProjects(
  missingSkills: MissingSkill[],
  parsedJob: ParsedJobDescription,
  maxProjects: number = 3
): ProjectRecommendations {
  // Get job requirements for matching
  const jobRequirements = [
    ...parsedJob.core_skills.map(s => s.canonical_name),
    ...parsedJob.nice_to_have_skills.map(s => s.canonical_name),
    ...parsedJob.tools,
  ];
  
  // Score all projects
  const scoredProjects: ProjectScore[] = PROJECT_TEMPLATES.map(template =>
    scoreProject(template, missingSkills, jobRequirements)
  );
  
  // Sort by score and take top N
  scoredProjects.sort((a, b) => b.score - a.score);
  const topProjects = scoredProjects.slice(0, maxProjects);
  
  // Convert to output format
  const projects: RecommendedProject[] = topProjects.map(({ project, matchedSkills, reason }) => ({
    id: project.id,
    title: project.title,
    description: project.description,
    difficulty: project.difficulty,
    estimated_hours: project.estimated_hours,
    tech_stack: project.tech_stack,
    skills_demonstrated: project.skills_demonstrated,
    why_recommended: reason,
    features: project.features,
    github_structure: project.github_structure,
    learning_outcomes: project.learning_outcomes,
  }));
  
  // Generate strategy
  const highPriorityCount = missingSkills.filter(s => s.priority === 'high').length;
  let strategy: string;
  
  if (highPriorityCount >= 3) {
    strategy = 'Focus on projects that address your critical skill gaps. Start with the first project to build foundational skills before moving to more complex ones.';
  } else if (highPriorityCount >= 1) {
    strategy = 'You have a solid foundation. These projects will help you fill remaining gaps and create impressive portfolio pieces.';
  } else {
    strategy = 'Your skills align well with the job requirements. These projects will help you showcase your abilities and stand out from other candidates.';
  }
  
  return { projects, strategy };
}

// =====================================================
// PROJECT CUSTOMIZATION
// =====================================================

export function customizeProjectForJob(
  project: RecommendedProject,
  parsedJob: ParsedJobDescription
): RecommendedProject {
  // Customize description to mention job-relevant aspects
  const jobSkills = parsedJob.core_skills.slice(0, 3).map(s => s.canonical_name);
  const matchingSkills = project.skills_demonstrated.filter(s => 
    jobSkills.map(js => js.toLowerCase()).includes(s.toLowerCase())
  );
  
  let customDescription = project.description;
  if (matchingSkills.length > 0) {
    customDescription += ` This project specifically demonstrates ${matchingSkills.join(', ')} skills relevant to the ${parsedJob.job_title || 'target'} position.`;
  }
  
  return {
    ...project,
    description: customDescription,
    why_recommended: `Aligned with ${parsedJob.job_title || 'target role'}: ${project.why_recommended}`,
  };
}
