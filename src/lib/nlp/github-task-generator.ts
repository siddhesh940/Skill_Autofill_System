// =====================================================
// GITHUB TASK GENERATOR
// Creates PROJECT-SPECIFIC GitHub issues
// Each project gets unique phases and issues
// =====================================================

import {
    GitHubIssue,
    GitHubLabel,
    GitHubMilestone,
    GitHubTasks,
    PriorityLevel,
    RecommendedProject,
} from '@/types';

// =====================================================
// PROJECT TYPE DETECTION
// =====================================================

type ProjectType = 'frontend' | 'backend' | 'fullstack' | 'devops' | 'data' | 'mobile';

function detectProjectType(project: RecommendedProject): ProjectType {
  const techLower = [...project.tech_stack, ...project.skills_demonstrated]
    .map(t => t.toLowerCase())
    .join(' ');
  
  const frontendIndicators = ['react', 'vue', 'angular', 'css', 'tailwind', 'ui', 'ux', 'html', 'sass', 'styled-components'];
  const backendIndicators = ['node', 'express', 'fastify', 'nestjs', 'django', 'flask', 'spring', 'go', 'rust', 'api', 'graphql', 'rest'];
  const devopsIndicators = ['docker', 'kubernetes', 'k8s', 'terraform', 'ansible', 'ci/cd', 'jenkins', 'aws', 'azure', 'gcp'];
  const dataIndicators = ['python', 'pandas', 'numpy', 'ml', 'machine learning', 'data', 'analytics', 'jupyter'];
  const mobileIndicators = ['react native', 'flutter', 'swift', 'kotlin', 'ios', 'android'];
  
  const frontendScore = frontendIndicators.filter(i => techLower.includes(i)).length;
  const backendScore = backendIndicators.filter(i => techLower.includes(i)).length;
  const devopsScore = devopsIndicators.filter(i => techLower.includes(i)).length;
  const dataScore = dataIndicators.filter(i => techLower.includes(i)).length;
  const mobileScore = mobileIndicators.filter(i => techLower.includes(i)).length;
  
  if (mobileScore >= 2) return 'mobile';
  if (devopsScore >= 2) return 'devops';
  if (dataScore >= 2) return 'data';
  if (frontendScore >= 3 && backendScore >= 2) return 'fullstack';
  if (backendScore > frontendScore + 1) return 'backend';
  if (frontendScore > backendScore) return 'frontend';
  
  return 'fullstack';
}

// =====================================================
// PROJECT-SPECIFIC PHASE TEMPLATES
// =====================================================

interface PhaseTemplate {
  name: string;
  description: string;
  issueGenerators: ((project: RecommendedProject, phaseIndex: number) => GitHubIssue[])[];
}

// Different phase structures based on project type
function getPhasesForProjectType(projectType: ProjectType, project: RecommendedProject): PhaseTemplate[] {
  const projectName = project.title;
  
  switch (projectType) {
    case 'frontend':
      return [
        {
          name: `UI Foundation for ${projectName}`,
          description: 'Component architecture and design system setup',
          issueGenerators: [generateUISetupIssues],
        },
        {
          name: 'Core Components',
          description: 'Build primary UI components and layouts',
          issueGenerators: [generateFrontendComponentIssues],
        },
        {
          name: 'Interactivity & State',
          description: 'Add user interactions and state management',
          issueGenerators: [generateFrontendStateIssues],
        },
        {
          name: 'Polish & Performance',
          description: 'Responsive design, accessibility, and optimization',
          issueGenerators: [generateFrontendPolishIssues],
        },
        {
          name: 'Deployment & Documentation',
          description: 'Production deployment and project documentation',
          issueGenerators: [generateDeploymentIssues],
        },
      ];
      
    case 'backend':
      return [
        {
          name: `API Architecture for ${projectName}`,
          description: 'Database schema and API structure setup',
          issueGenerators: [generateBackendSetupIssues],
        },
        {
          name: 'Core Endpoints',
          description: 'Implement primary API routes and business logic',
          issueGenerators: [generateBackendCoreIssues],
        },
        {
          name: 'Security & Auth',
          description: 'Authentication, authorization, and security hardening',
          issueGenerators: [generateBackendSecurityIssues],
        },
        {
          name: 'Performance & Monitoring',
          description: 'Caching, logging, and observability',
          issueGenerators: [generateBackendPerformanceIssues],
        },
        {
          name: 'Deployment & Documentation',
          description: 'Production deployment and API documentation',
          issueGenerators: [generateDeploymentIssues],
        },
      ];
      
    case 'devops':
      return [
        {
          name: `Infrastructure Setup for ${projectName}`,
          description: 'Infrastructure as Code and base configuration',
          issueGenerators: [generateDevOpsSetupIssues],
        },
        {
          name: 'CI/CD Pipeline',
          description: 'Automated testing and deployment pipeline',
          issueGenerators: [generateDevOpsCICDIssues],
        },
        {
          name: 'Monitoring & Alerts',
          description: 'Observability, logging, and alerting',
          issueGenerators: [generateDevOpsMonitoringIssues],
        },
        {
          name: 'Security & Compliance',
          description: 'Security scanning and compliance automation',
          issueGenerators: [generateDevOpsSecurityIssues],
        },
        {
          name: 'Documentation & Runbooks',
          description: 'Operational documentation and runbook creation',
          issueGenerators: [generateDevOpsDocumentationIssues],
        },
      ];
      
    case 'fullstack':
    default:
      return [
        {
          name: `Project Bootstrap: ${projectName}`,
          description: 'Initialize project with frontend and backend structure',
          issueGenerators: [generateFullstackSetupIssues],
        },
        {
          name: 'Backend API & Database',
          description: 'Build API endpoints and database layer',
          issueGenerators: [generateFullstackBackendIssues],
        },
        {
          name: 'Frontend Implementation',
          description: 'Build UI components and connect to API',
          issueGenerators: [generateFullstackFrontendIssues],
        },
        {
          name: 'Integration & Testing',
          description: 'End-to-end integration and quality assurance',
          issueGenerators: [generateFullstackTestingIssues],
        },
        {
          name: 'Deployment & Launch',
          description: 'Production deployment and go-live preparation',
          issueGenerators: [generateDeploymentIssues],
        },
      ];
  }
}

// =====================================================
// ISSUE GENERATORS - FRONTEND
// =====================================================

function generateUISetupIssues(project: RecommendedProject, _phaseIndex: number): GitHubIssue[] {
  const mainTech = project.tech_stack[0] || 'React';
  const cssTech = project.tech_stack.find(t => 
    ['tailwind', 'css', 'sass', 'styled-components', 'chakra'].some(c => t.toLowerCase().includes(c))
  ) || 'TailwindCSS';
  
  return [
    {
        title: `🎨 Set up ${mainTech} project with ${cssTech}`,
        body: `Initialize ${project.title} with ${mainTech} and configure styling with ${cssTech}.`,
        labels: ['setup', 'frontend', 'priority: high'],
        milestone: `UI Foundation for ${project.title}`,
        checklist: [
            `Initialize ${mainTech} project`,
            `Configure ${cssTech}`,
            'Set up component folder structure',
            'Add base styles and theme',
            'Create layout components',
        ],
        priority: 'high',
        estimated_hours: 0
    },
    {
        title: '🧩 Create design tokens and theme configuration',
        body: `Define colors, typography, spacing, and breakpoints for ${project.title}.`,
        labels: ['setup', 'frontend', 'design'],
        milestone: `UI Foundation for ${project.title}`,
        checklist: [
            'Define color palette',
            'Set up typography scale',
            'Configure spacing system',
            'Add responsive breakpoints',
        ],
        priority: 'medium',
        estimated_hours: 0
    },
  ];
}

function generateFrontendComponentIssues(project: RecommendedProject, _phaseIndex: number): GitHubIssue[] {
  // Generate issues based on actual project features
  const uiFeatures = project.features.filter(f => 
    /display|list|view|card|dashboard|page|form|table|grid/i.test(f)
  ).slice(0, 3);
  
  const issues: GitHubIssue[] = [];
  
  uiFeatures.forEach((feature, idx) => {
    issues.push({
        title: `✨ Build UI: ${feature}`,
        body: `Create the user interface for "${feature}" in ${project.title}.`,
        labels: ['feature', 'frontend', idx === 0 ? 'priority: high' : 'priority: medium'],
        milestone: 'Core Components',
        checklist: [
            `Design component structure for ${feature}`,
            'Implement responsive layout',
            'Add loading and error states',
            'Style according to design system',
        ],
        priority: idx === 0 ? 'high' : 'medium',
        estimated_hours: 0
    });
  });
  
  // If no specific UI features, add generic ones based on project
  if (issues.length === 0) {
    issues.push({
        title: `📱 Create main dashboard for ${project.title}`,
        body: `Build the primary dashboard view showing key information.`,
        labels: ['feature', 'frontend', 'priority: high'],
        milestone: 'Core Components',
        checklist: [
            'Design dashboard layout',
            'Add summary cards',
            'Implement data display components',
            'Add navigation elements',
        ],
        priority: 'high',
        estimated_hours: 0
    });
  }
  
  return issues;
}

function generateFrontendStateIssues(project: RecommendedProject, _phaseIndex: number): GitHubIssue[] {
  const stateLib = project.tech_stack.find(t => 
    ['redux', 'zustand', 'mobx', 'jotai', 'recoil'].some(s => t.toLowerCase().includes(s))
  ) || 'React Context';
  
  const interactiveFeatures = project.features.filter(f => 
    /auth|login|form|submit|filter|search|sort|edit|create|delete/i.test(f)
  ).slice(0, 2);
  
  const issues: GitHubIssue[] = [
    {
        title: `🔄 Set up state management with ${stateLib}`,
        body: `Configure global state management for ${project.title}.`,
        labels: ['feature', 'frontend', 'priority: high'],
        milestone: 'Interactivity & State',
        checklist: [
            `Initialize ${stateLib}`,
            'Define state structure',
            'Create actions/reducers',
            'Connect to components',
        ],
        priority: 'high',
        estimated_hours: 0
    },
  ];
  
  interactiveFeatures.forEach(feature => {
    issues.push({
        title: `⚡ Add interactivity: ${feature}`,
        body: `Implement user interaction for "${feature}".`,
        labels: ['feature', 'frontend', 'priority: medium'],
        milestone: 'Interactivity & State',
        checklist: [
            'Handle user input',
            'Add form validation',
            'Implement API integration',
            'Add feedback (loading, success, error)',
        ],
        priority: 'medium',
        estimated_hours: 0
    });
  });
  
  return issues;
}

function generateFrontendPolishIssues(project: RecommendedProject, _phaseIndex: number): GitHubIssue[] {
  return [
    {
        title: '📱 Ensure responsive design across devices',
        body: `Make ${project.title} work beautifully on mobile, tablet, and desktop.`,
        labels: ['enhancement', 'frontend', 'priority: medium'],
        milestone: 'Polish & Performance',
        checklist: [
            'Test on mobile breakpoints',
            'Fix tablet layout issues',
            'Optimize touch interactions',
            'Test on real devices',
        ],
        priority: 'medium',
        estimated_hours: 0
    },
    {
        title: '♿ Add accessibility (a11y) support',
        body: `Ensure ${project.title} is accessible to all users.`,
        labels: ['enhancement', 'frontend', 'a11y', 'priority: medium'],
        milestone: 'Polish & Performance',
        checklist: [
            'Add ARIA labels',
            'Ensure keyboard navigation',
            'Check color contrast',
            'Test with screen reader',
        ],
        priority: 'medium',
        estimated_hours: 0
    },
  ];
}

// =====================================================
// ISSUE GENERATORS - BACKEND
// =====================================================

function generateBackendSetupIssues(project: RecommendedProject, _phaseIndex: number): GitHubIssue[] {
  const dbTech = project.tech_stack.find(t => 
    ['postgresql', 'mysql', 'mongodb', 'sqlite', 'supabase', 'prisma', 'redis'].some(d => t.toLowerCase().includes(d))
  ) || 'PostgreSQL';
  
  const framework = project.tech_stack.find(t => 
    ['express', 'fastify', 'nestjs', 'hono', 'next.js'].some(f => t.toLowerCase().includes(f))
  ) || 'Node.js';
  
  return [
    {
        title: `🗄️ Design database schema for ${project.title}`,
        body: `Create ${dbTech} schema based on ${project.title} requirements.`,
        labels: ['setup', 'backend', 'database', 'priority: high'],
        milestone: `API Architecture for ${project.title}`,
        checklist: [
            'Identify entities and relationships',
            'Create ER diagram',
            'Write migration files',
            'Add seed data for development',
        ],
        priority: 'high',
        estimated_hours: 0
    },
    {
        title: `🔌 Set up ${framework} API structure`,
        body: `Initialize ${framework} with proper folder structure and middleware.`,
        labels: ['setup', 'backend', 'priority: high'],
        milestone: `API Architecture for ${project.title}`,
        checklist: [
            `Configure ${framework}`,
            'Set up route structure',
            'Add middleware (cors, logging)',
            'Configure error handling',
        ],
        priority: 'high',
        estimated_hours: 0
    },
  ];
}

function generateBackendCoreIssues(project: RecommendedProject, _phaseIndex: number): GitHubIssue[] {
  // Generate API issues based on project features
  const apiFeatures = project.features.filter(f => 
    /crud|api|data|list|create|update|delete|fetch|manage/i.test(f)
  ).slice(0, 3);
  
  const issues: GitHubIssue[] = [];
  
  apiFeatures.forEach((feature, idx) => {
    const resourceName = feature.split(' ')[0].toLowerCase();
    issues.push({
        title: `📡 API: ${feature}`,
        body: `Implement API endpoints for "${feature}".`,
        labels: ['feature', 'backend', 'api', idx === 0 ? 'priority: high' : 'priority: medium'],
        milestone: 'Core Endpoints',
        checklist: [
            `Create ${resourceName} model`,
            `Implement GET /api/${resourceName}`,
            `Implement POST /api/${resourceName}`,
            `Implement PUT/DELETE endpoints`,
            'Add validation',
        ],
        priority: idx === 0 ? 'high' : 'medium',
        estimated_hours: 0
    });
  });
  
  if (issues.length === 0) {
    issues.push({
        title: `📡 Implement core CRUD endpoints for ${project.title}`,
        body: `Create the main API endpoints for data management.`,
        labels: ['feature', 'backend', 'api', 'priority: high'],
        milestone: 'Core Endpoints',
        checklist: [
            'Design RESTful routes',
            'Implement GET endpoints',
            'Implement POST/PUT endpoints',
            'Add DELETE functionality',
            'Add request validation',
        ],
        priority: 'high',
        estimated_hours: 0
    });
  }
  
  return issues;
}

function generateBackendSecurityIssues(project: RecommendedProject, _phaseIndex: number): GitHubIssue[] {
  const hasAuth = project.features.some(f => /auth|login|user|account/i.test(f));
  
  const issues: GitHubIssue[] = [];
  
  if (hasAuth) {
    issues.push({
        title: '🔐 Implement authentication system',
        body: `Add secure user authentication to ${project.title}.`,
        labels: ['feature', 'backend', 'security', 'priority: high'],
        milestone: 'Security & Auth',
        checklist: [
            'Set up auth strategy (JWT/Session)',
            'Implement login endpoint',
            'Implement registration',
            'Add password hashing',
            'Create auth middleware',
        ],
        priority: 'high',
        estimated_hours: 0
    });
  }
  
  issues.push({
      title: '🛡️ Add API security measures',
      body: `Harden ${project.title} API against common vulnerabilities.`,
      labels: ['enhancement', 'backend', 'security', 'priority: medium'],
      milestone: 'Security & Auth',
      checklist: [
          'Add rate limiting',
          'Implement input sanitization',
          'Configure CORS properly',
          'Add helmet middleware',
      ],
      priority: 'medium',
      estimated_hours: 0
  });
  
  return issues;
}

function generateBackendPerformanceIssues(project: RecommendedProject, _phaseIndex: number): GitHubIssue[] {
  const hasRedis = project.tech_stack.some(t => t.toLowerCase().includes('redis'));
  
  return [
    {
        title: '⚡ Add caching layer' + (hasRedis ? ' with Redis' : ''),
        body: `Implement caching to improve ${project.title} performance.`,
        labels: ['enhancement', 'backend', 'performance', 'priority: medium'],
        milestone: 'Performance & Monitoring',
        checklist: [
            hasRedis ? 'Configure Redis connection' : 'Set up in-memory cache',
            'Cache frequent queries',
            'Add cache invalidation',
            'Test cache hit rates',
        ],
        priority: 'medium',
        estimated_hours: 0
    },
    {
        title: '📊 Add logging and error tracking',
        body: `Set up observability for ${project.title} API.`,
        labels: ['enhancement', 'backend', 'devops', 'priority: low'],
        milestone: 'Performance & Monitoring',
        checklist: [
            'Configure structured logging',
            'Add request/response logging',
            'Set up error tracking',
            'Create health check endpoint',
        ],
        priority: 'low',
        estimated_hours: 0
    },
  ];
}

// =====================================================
// ISSUE GENERATORS - DEVOPS
// =====================================================

function generateDevOpsSetupIssues(project: RecommendedProject, _phaseIndex: number): GitHubIssue[] {
  const infraTool = project.tech_stack.find(t => 
    ['terraform', 'pulumi', 'cloudformation', 'ansible'].some(i => t.toLowerCase().includes(i))
  ) || 'Terraform';
  
  return [
    {
        title: `🏗️ Set up ${infraTool} for ${project.title}`,
        body: `Create infrastructure as code for ${project.title}.`,
        labels: ['setup', 'devops', 'infrastructure', 'priority: high'],
        milestone: `Infrastructure Setup for ${project.title}`,
        checklist: [
            `Initialize ${infraTool} project`,
            'Define provider configuration',
            'Create base infrastructure modules',
            'Set up state management',
        ],
        priority: 'high',
        estimated_hours: 0
    },
  ];
}

function generateDevOpsCICDIssues(project: RecommendedProject, _phaseIndex: number): GitHubIssue[] {
  return [
    {
        title: '🔄 Create CI/CD pipeline with GitHub Actions',
        body: `Automate testing and deployment for ${project.title}.`,
        labels: ['feature', 'devops', 'ci-cd', 'priority: high'],
        milestone: 'CI/CD Pipeline',
        checklist: [
            'Create test workflow',
            'Add build workflow',
            'Configure deployment stages',
            'Set up environment secrets',
        ],
        priority: 'high',
        estimated_hours: 0
    },
  ];
}

function generateDevOpsMonitoringIssues(project: RecommendedProject, _phaseIndex: number): GitHubIssue[] {
  return [
    {
        title: '📈 Set up monitoring and alerting',
        body: `Configure observability stack for ${project.title}.`,
        labels: ['feature', 'devops', 'monitoring', 'priority: medium'],
        milestone: 'Monitoring & Alerts',
        checklist: [
            'Set up metrics collection',
            'Configure log aggregation',
            'Create dashboards',
            'Define alert rules',
        ],
        priority: 'medium',
        estimated_hours: 0
    },
  ];
}

function generateDevOpsSecurityIssues(project: RecommendedProject, _phaseIndex: number): GitHubIssue[] {
  return [
    {
        title: '🔒 Implement security scanning',
        body: `Add automated security checks for ${project.title}.`,
        labels: ['feature', 'devops', 'security', 'priority: medium'],
        milestone: 'Security & Compliance',
        checklist: [
            'Add dependency vulnerability scanning',
            'Configure SAST tools',
            'Set up secrets scanning',
            'Add compliance checks',
        ],
        priority: 'medium',
        estimated_hours: 0
    },
  ];
}

function generateDevOpsDocumentationIssues(project: RecommendedProject, _phaseIndex: number): GitHubIssue[] {
  return [
    {
        title: `📚 Create runbook for ${project.title}`,
        body: `Write operational runbook and documentation.`,
        labels: ['documentation', 'devops', 'priority: medium'],
        milestone: 'Documentation & Runbooks',
        checklist: [
            'Document deployment procedures',
            'Create incident response runbook',
            'Add troubleshooting guide',
            'Document rollback procedures',
        ],
        priority: 'medium',
        estimated_hours: 0
    },
    {
        title: '📋 Write infrastructure documentation',
        body: `Document all infrastructure components and configurations.`,
        labels: ['documentation', 'devops', 'priority: low'],
        milestone: 'Documentation & Runbooks',
        checklist: [
            'Create architecture diagram',
            'Document environment variables',
            'Add onboarding guide for new engineers',
            'Document monitoring and alerting',
        ],
        priority: 'low',
        estimated_hours: 0
    },
  ];
}

// =====================================================
// ISSUE GENERATORS - FULLSTACK
// =====================================================

function generateFullstackSetupIssues(project: RecommendedProject, _phaseIndex: number): GitHubIssue[] {
  const mainFramework = project.tech_stack[0] || 'Next.js';
  const dbTech = project.tech_stack.find(t => 
    ['postgresql', 'mysql', 'mongodb', 'supabase', 'prisma'].some(d => t.toLowerCase().includes(d))
  ) || 'PostgreSQL';
  
  return [
    {
        title: `🚀 Initialize ${project.title} with ${mainFramework}`,
        body: `Set up the full-stack project structure for ${project.title}.`,
        labels: ['setup', 'fullstack', 'priority: high'],
        milestone: `Project Bootstrap: ${project.title}`,
        checklist: [
            `Create ${mainFramework} project`,
            'Configure TypeScript',
            'Set up folder structure',
            `Configure ${dbTech} connection`,
            'Add environment configuration',
        ],
        priority: 'high',
        estimated_hours: 0
    },
  ];
}

function generateFullstackBackendIssues(project: RecommendedProject, _phaseIndex: number): GitHubIssue[] {
  // Get actual features for this specific project
  const backendFeatures = project.features.slice(0, 3);
  
  return backendFeatures.map((feature, idx) => ({
    title: `🔌 Backend: ${feature}`,
    body: `Implement server-side logic for "${feature}" in ${project.title}.`,
    labels: ['feature', 'backend', idx === 0 ? 'priority: high' : 'priority: medium'],
    milestone: 'Backend API & Database',
    checklist: [
      'Design data model',
      'Create API route',
      'Implement business logic',
      'Add validation',
      'Write API tests',
    ],
    priority: (idx === 0 ? 'high' : 'medium') as PriorityLevel,
    estimated_hours: 0,
  }));
}

function generateFullstackFrontendIssues(project: RecommendedProject, _phaseIndex: number): GitHubIssue[] {
  const frontendFeatures = project.features.slice(0, 3);
  
  return frontendFeatures.map((feature, idx) => ({
    title: `🎨 Frontend: ${feature}`,
    body: `Build the user interface for "${feature}" in ${project.title}.`,
    labels: ['feature', 'frontend', idx === 0 ? 'priority: high' : 'priority: medium'],
    milestone: 'Frontend Implementation',
    checklist: [
      'Create page/component',
      'Build UI layout',
      'Connect to API',
      'Add loading states',
      'Handle errors',
    ],
    priority: (idx === 0 ? 'high' : 'medium') as PriorityLevel,
    estimated_hours: 0,
  }));
}

function generateFullstackTestingIssues(project: RecommendedProject, _phaseIndex: number): GitHubIssue[] {
  return [
    {
        title: `🧪 Add test suite for ${project.title}`,
        body: `Create comprehensive tests for the application.`,
        labels: ['testing', 'quality', 'priority: medium'],
        milestone: 'Integration & Testing',
        checklist: [
            'Set up testing framework',
            'Write API integration tests',
            'Add component tests',
            'Create E2E tests for critical flows',
        ],
        priority: 'medium',
        estimated_hours: 0
    },
    {
        title: '🔗 Integration testing and bug fixes',
        body: `Ensure all parts of ${project.title} work together seamlessly.`,
        labels: ['testing', 'bug', 'priority: medium'],
        milestone: 'Integration & Testing',
        checklist: [
            'Test API-frontend integration',
            'Fix discovered bugs',
            'Test edge cases',
            'Performance testing',
        ],
        priority: 'medium',
        estimated_hours: 0
    },
  ];
}

function generateDeploymentIssues(project: RecommendedProject, _phaseIndex: number): GitHubIssue[] {
  const platform = project.tech_stack.includes('Next.js') ? 'Vercel' :
    project.tech_stack.some(t => t.toLowerCase().includes('docker')) ? 'Docker/Railway' :
    'Vercel';
  
  return [
    {
        title: `🚀 Deploy ${project.title} to ${platform}`,
        body: `Set up production deployment for ${project.title}.`,
        labels: ['deployment', 'devops', 'priority: medium'],
        milestone: 'Deployment & Launch',
        checklist: [
            `Configure ${platform} project`,
            'Set production environment variables',
            'Configure database for production',
            'Set up CI/CD with GitHub Actions',
            'Test production deployment',
        ],
        priority: 'medium',
        estimated_hours: 0
    },
    {
        title: '📚 Write documentation and README',
        body: `Create comprehensive documentation for ${project.title}.`,
        labels: ['documentation', 'priority: low'],
        milestone: 'Deployment & Launch',
        checklist: [
            'Write project overview',
            'Add setup instructions',
            'Document API endpoints',
            'Add screenshots/demo',
        ],
        priority: 'low',
        estimated_hours: 0
    },
  ];
}

// =====================================================
// LABEL GENERATION (PROJECT-SPECIFIC)
// =====================================================

function generateLabels(projectType: ProjectType): GitHubLabel[] {
  const baseLabels: GitHubLabel[] = [
    { name: 'priority: high', color: 'B60205', description: 'High priority' },
    { name: 'priority: medium', color: 'FBCA04', description: 'Medium priority' },
    { name: 'priority: low', color: '0E8A16', description: 'Low priority' },
    { name: 'bug', color: 'D73A4A', description: 'Something is broken' },
    { name: 'documentation', color: '0075CA', description: 'Documentation updates' },
  ];
  
  const typeSpecificLabels: Record<ProjectType, GitHubLabel[]> = {
    frontend: [
      { name: 'setup', color: '0E8A16', description: 'Project setup' },
      { name: 'frontend', color: '61DAFB', description: 'Frontend work' },
      { name: 'feature', color: '1D76DB', description: 'New feature' },
      { name: 'enhancement', color: 'A2EEEF', description: 'Enhancement' },
      { name: 'design', color: 'F9A825', description: 'Design related' },
      { name: 'a11y', color: '7B1FA2', description: 'Accessibility' },
    ],
    backend: [
      { name: 'setup', color: '0E8A16', description: 'Project setup' },
      { name: 'backend', color: '68A063', description: 'Backend work' },
      { name: 'feature', color: '1D76DB', description: 'New feature' },
      { name: 'api', color: '5319E7', description: 'API related' },
      { name: 'database', color: '006B75', description: 'Database work' },
      { name: 'security', color: 'B60205', description: 'Security related' },
      { name: 'performance', color: 'FBCA04', description: 'Performance' },
    ],
    fullstack: [
      { name: 'setup', color: '0E8A16', description: 'Project setup' },
      { name: 'fullstack', color: '7057FF', description: 'Full-stack work' },
      { name: 'frontend', color: '61DAFB', description: 'Frontend work' },
      { name: 'backend', color: '68A063', description: 'Backend work' },
      { name: 'feature', color: '1D76DB', description: 'New feature' },
      { name: 'testing', color: 'F9D0C4', description: 'Testing' },
      { name: 'deployment', color: 'D4C5F9', description: 'Deployment' },
      { name: 'quality', color: 'BFDADC', description: 'Quality' },
    ],
    devops: [
      { name: 'setup', color: '0E8A16', description: 'Project setup' },
      { name: 'devops', color: 'FF6F00', description: 'DevOps work' },
      { name: 'feature', color: '1D76DB', description: 'New feature' },
      { name: 'infrastructure', color: '795548', description: 'Infrastructure' },
      { name: 'ci-cd', color: '00BCD4', description: 'CI/CD' },
      { name: 'monitoring', color: '9C27B0', description: 'Monitoring' },
      { name: 'security', color: 'B60205', description: 'Security' },
    ],
    data: [
      { name: 'setup', color: '0E8A16', description: 'Project setup' },
      { name: 'data', color: '3F51B5', description: 'Data work' },
      { name: 'feature', color: '1D76DB', description: 'New feature' },
      { name: 'analysis', color: 'E91E63', description: 'Data analysis' },
      { name: 'pipeline', color: '009688', description: 'Data pipeline' },
      { name: 'ml', color: 'FF5722', description: 'Machine learning' },
    ],
    mobile: [
      { name: 'setup', color: '0E8A16', description: 'Project setup' },
      { name: 'mobile', color: '4CAF50', description: 'Mobile work' },
      { name: 'feature', color: '1D76DB', description: 'New feature' },
      { name: 'ios', color: '000000', description: 'iOS specific' },
      { name: 'android', color: '3DDC84', description: 'Android specific' },
    ],
  };
  
  return [...baseLabels, ...typeSpecificLabels[projectType]];
}

// =====================================================
// MAIN FUNCTION
// =====================================================

export function generateGitHubTasks(project: RecommendedProject): GitHubTasks {
  // Detect project type
  const projectType = detectProjectType(project);
  
  // Get project-specific phases
  const phases = getPhasesForProjectType(projectType, project);
  
  // Generate repo name from project title
  const repoName = project.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  
  // Generate milestones from phases
  const milestones: GitHubMilestone[] = phases.map((phase) => ({
    title: phase.name,
    description: phase.description,
    due_on: null, // Don't set fake dates
  }));
  
  // Generate issues for each phase
  const allIssues: GitHubIssue[] = [];
  
  phases.forEach((phase, phaseIndex) => {
    phase.issueGenerators.forEach(generator => {
      const phaseIssues = generator(project, phaseIndex);
      // Ensure milestone is set correctly
      phaseIssues.forEach(issue => {
        issue.milestone = phase.name;
      });
      allIssues.push(...phaseIssues);
    });
  });
  
  // Generate project-specific labels
  const labels = generateLabels(projectType);
  
  return {
    repo_name: repoName,
    repo_description: project.description,
    issues: allIssues,
    labels,
    milestones,
  };
}
