// =====================================================
// SKILL TAXONOMY DATA
// Master dictionary for skill normalization
// =====================================================

import { SkillCategory } from '@/types';

export interface TaxonomyEntry {
  canonical: string;
  aliases: string[];
  category: SkillCategory;
  weight: number;      // 0-1 importance weight
  isHot: boolean;      // Currently trending
  parent?: string;     // Parent skill for grouping
}

// Comprehensive skill taxonomy for normalization
export const SKILL_TAXONOMY: TaxonomyEntry[] = [
  // ========== PROGRAMMING LANGUAGES ==========
  {
    canonical: 'JavaScript',
    aliases: ['JS', 'Javascript', 'javascript', 'js', 'ES6', 'ES2015', 'ES2020', 'ECMAScript', 'vanilla js', 'vanilla javascript'],
    category: 'language',
    weight: 1.0,
    isHot: true
  },
  {
    canonical: 'TypeScript',
    aliases: ['TS', 'Typescript', 'typescript', 'ts', 'TSX'],
    category: 'language',
    weight: 1.0,
    isHot: true
  },
  {
    canonical: 'Python',
    aliases: ['python', 'py', 'Python3', 'python3', 'Python 3', 'python 3'],
    category: 'language',
    weight: 1.0,
    isHot: true
  },
  {
    canonical: 'Java',
    aliases: ['java', 'J2EE', 'j2ee', 'JDK', 'jdk', 'Java SE', 'Java EE'],
    category: 'language',
    weight: 0.9,
    isHot: false
  },
  {
    canonical: 'C++',
    aliases: ['cpp', 'c++', 'Cpp', 'CPP', 'C plus plus'],
    category: 'language',
    weight: 0.8,
    isHot: false
  },
  {
    canonical: 'C#',
    aliases: ['csharp', 'c#', 'CSharp', 'C Sharp', 'c sharp'],
    category: 'language',
    weight: 0.85,
    isHot: false
  },
  {
    canonical: 'Go',
    aliases: ['Golang', 'golang', 'go-lang', 'go lang'],
    category: 'language',
    weight: 0.9,
    isHot: true
  },
  {
    canonical: 'Rust',
    aliases: ['rust', 'rustlang', 'rust-lang'],
    category: 'language',
    weight: 0.85,
    isHot: true
  },
  {
    canonical: 'Ruby',
    aliases: ['ruby', 'rb'],
    category: 'language',
    weight: 0.7,
    isHot: false
  },
  {
    canonical: 'PHP',
    aliases: ['php', 'Php', 'PHP8', 'php8'],
    category: 'language',
    weight: 0.6,
    isHot: false
  },
  {
    canonical: 'Swift',
    aliases: ['swift', 'SwiftUI', 'swift ui'],
    category: 'language',
    weight: 0.8,
    isHot: false
  },
  {
    canonical: 'Kotlin',
    aliases: ['kotlin', 'kt', 'Kotlin Android'],
    category: 'language',
    weight: 0.8,
    isHot: false
  },
  {
    canonical: 'SQL',
    aliases: ['sql', 'Structured Query Language', 'T-SQL', 'PL/SQL'],
    category: 'language',
    weight: 0.9,
    isHot: false
  },
  {
    canonical: 'HTML',
    aliases: ['html', 'HTML5', 'html5'],
    category: 'language',
    weight: 0.7,
    isHot: false
  },
  {
    canonical: 'CSS',
    aliases: ['css', 'CSS3', 'css3', 'Cascading Style Sheets'],
    category: 'language',
    weight: 0.7,
    isHot: false
  },
  {
    canonical: 'Scala',
    aliases: ['scala'],
    category: 'language',
    weight: 0.7,
    isHot: false
  },

  // ========== FRONTEND FRAMEWORKS ==========
  {
    canonical: 'React',
    aliases: ['ReactJS', 'React.js', 'react', 'reactjs', 'React JS', 'react.js'],
    category: 'framework',
    weight: 1.0,
    isHot: true
  },
  {
    canonical: 'Next.js',
    aliases: ['NextJS', 'Nextjs', 'next', 'nextjs', 'Next', 'next.js', 'Next JS'],
    category: 'framework',
    weight: 1.0,
    isHot: true,
    parent: 'React'
  },
  {
    canonical: 'Vue.js',
    aliases: ['Vue', 'vue', 'vuejs', 'Vue 3', 'vue3', 'Vue.js 3', 'vue.js'],
    category: 'framework',
    weight: 0.9,
    isHot: true
  },
  {
    canonical: 'Angular',
    aliases: ['angular', 'AngularJS', 'Angular 2+', 'ng', 'Angular 2', 'Angular 4+'],
    category: 'framework',
    weight: 0.85,
    isHot: false
  },
  {
    canonical: 'Svelte',
    aliases: ['svelte', 'SvelteKit', 'sveltekit', 'Svelte Kit'],
    category: 'framework',
    weight: 0.8,
    isHot: true
  },
  {
    canonical: 'jQuery',
    aliases: ['jquery', 'JQuery', 'jQ'],
    category: 'framework',
    weight: 0.5,
    isHot: false
  },

  // ========== BACKEND FRAMEWORKS ==========
  {
    canonical: 'Node.js',
    aliases: ['NodeJS', 'Nodejs', 'node', 'nodejs', 'Node', 'node.js'],
    category: 'runtime',
    weight: 1.0,
    isHot: true
  },
  {
    canonical: 'Express.js',
    aliases: ['Express', 'express', 'expressjs', 'express.js'],
    category: 'framework',
    weight: 0.9,
    isHot: false,
    parent: 'Node.js'
  },
  {
    canonical: 'NestJS',
    aliases: ['nestjs', 'Nest.js', 'nest', 'Nest JS'],
    category: 'framework',
    weight: 0.85,
    isHot: true,
    parent: 'Node.js'
  },
  {
    canonical: 'Django',
    aliases: ['django', 'Django REST', 'DRF', 'Django REST Framework'],
    category: 'framework',
    weight: 0.85,
    isHot: false,
    parent: 'Python'
  },
  {
    canonical: 'FastAPI',
    aliases: ['fastapi', 'fast-api', 'Fast API'],
    category: 'framework',
    weight: 0.9,
    isHot: true,
    parent: 'Python'
  },
  {
    canonical: 'Flask',
    aliases: ['flask'],
    category: 'framework',
    weight: 0.75,
    isHot: false,
    parent: 'Python'
  },
  {
    canonical: 'Spring Boot',
    aliases: ['Spring', 'spring', 'springboot', 'Spring Framework', 'spring boot'],
    category: 'framework',
    weight: 0.9,
    isHot: false,
    parent: 'Java'
  },
  {
    canonical: 'Ruby on Rails',
    aliases: ['Rails', 'rails', 'RoR', 'ruby on rails'],
    category: 'framework',
    weight: 0.75,
    isHot: false,
    parent: 'Ruby'
  },
  {
    canonical: '.NET',
    aliases: ['dotnet', '.NET Core', 'ASP.NET', 'asp.net', '.net', 'dotnet core'],
    category: 'framework',
    weight: 0.85,
    isHot: false,
    parent: 'C#'
  },
  {
    canonical: 'Laravel',
    aliases: ['laravel'],
    category: 'framework',
    weight: 0.7,
    isHot: false,
    parent: 'PHP'
  },

  // ========== DATABASES ==========
  {
    canonical: 'PostgreSQL',
    aliases: ['Postgres', 'postgres', 'postgresql', 'psql', 'pg', 'PostgresSQL'],
    category: 'database',
    weight: 0.95,
    isHot: true
  },
  {
    canonical: 'MySQL',
    aliases: ['mysql', 'MariaDB', 'mariadb', 'My SQL'],
    category: 'database',
    weight: 0.85,
    isHot: false
  },
  {
    canonical: 'MongoDB',
    aliases: ['Mongo', 'mongo', 'mongodb', 'NoSQL', 'Mongoose'],
    category: 'database',
    weight: 0.9,
    isHot: false
  },
  {
    canonical: 'Redis',
    aliases: ['redis', 'Redis Cache', 'redis cache'],
    category: 'database',
    weight: 0.85,
    isHot: false
  },
  {
    canonical: 'Supabase',
    aliases: ['supabase'],
    category: 'database',
    weight: 0.9,
    isHot: true
  },
  {
    canonical: 'Firebase',
    aliases: ['firebase', 'Firestore', 'firestore', 'Firebase Realtime'],
    category: 'database',
    weight: 0.85,
    isHot: false
  },
  {
    canonical: 'SQLite',
    aliases: ['sqlite', 'SQLite3', 'sqlite3'],
    category: 'database',
    weight: 0.7,
    isHot: false
  },
  {
    canonical: 'DynamoDB',
    aliases: ['dynamodb', 'dynamo db', 'Amazon DynamoDB'],
    category: 'database',
    weight: 0.8,
    isHot: false
  },
  {
    canonical: 'Elasticsearch',
    aliases: ['elasticsearch', 'elastic search', 'ES', 'Elastic'],
    category: 'database',
    weight: 0.8,
    isHot: false
  },
  {
    canonical: 'Prisma',
    aliases: ['prisma', 'Prisma ORM'],
    category: 'tool',
    weight: 0.8,
    isHot: true
  },

  // ========== CLOUD PLATFORMS ==========
  {
    canonical: 'AWS',
    aliases: ['Amazon Web Services', 'aws', 'Amazon AWS', 'Amazon Cloud'],
    category: 'cloud',
    weight: 1.0,
    isHot: true
  },
  {
    canonical: 'Azure',
    aliases: ['Microsoft Azure', 'azure', 'Azure Cloud', 'MS Azure'],
    category: 'cloud',
    weight: 0.95,
    isHot: true
  },
  {
    canonical: 'GCP',
    aliases: ['Google Cloud', 'Google Cloud Platform', 'gcp', 'Google Cloud Services'],
    category: 'cloud',
    weight: 0.9,
    isHot: true
  },
  {
    canonical: 'Vercel',
    aliases: ['vercel', 'Zeit', 'Vercel Platform'],
    category: 'cloud',
    weight: 0.85,
    isHot: true
  },
  {
    canonical: 'Netlify',
    aliases: ['netlify'],
    category: 'cloud',
    weight: 0.8,
    isHot: false
  },
  {
    canonical: 'Heroku',
    aliases: ['heroku'],
    category: 'cloud',
    weight: 0.7,
    isHot: false
  },
  {
    canonical: 'DigitalOcean',
    aliases: ['digitalocean', 'digital ocean', 'DO'],
    category: 'cloud',
    weight: 0.75,
    isHot: false
  },

  // ========== DEVOPS & TOOLS ==========
  {
    canonical: 'Docker',
    aliases: ['docker', 'containers', 'containerization', 'Docker Container'],
    category: 'devops',
    weight: 1.0,
    isHot: true
  },
  {
    canonical: 'Kubernetes',
    aliases: ['K8s', 'k8s', 'kubernetes', 'k8', 'kube'],
    category: 'devops',
    weight: 0.95,
    isHot: true
  },
  {
    canonical: 'Git',
    aliases: ['git', 'version control', 'VCS', 'Git version control'],
    category: 'tool',
    weight: 0.95,
    isHot: false
  },
  {
    canonical: 'GitHub',
    aliases: ['github', 'Github Actions', 'GH', 'GitHub Actions'],
    category: 'tool',
    weight: 0.9,
    isHot: false
  },
  {
    canonical: 'GitLab',
    aliases: ['gitlab', 'GitLab CI', 'gitlab ci'],
    category: 'tool',
    weight: 0.85,
    isHot: false
  },
  {
    canonical: 'CI/CD',
    aliases: ['cicd', 'ci/cd', 'continuous integration', 'continuous deployment', 'CI CD', 'continuous delivery'],
    category: 'devops',
    weight: 0.9,
    isHot: true
  },
  {
    canonical: 'Jenkins',
    aliases: ['jenkins'],
    category: 'devops',
    weight: 0.8,
    isHot: false
  },
  {
    canonical: 'Terraform',
    aliases: ['terraform', 'IaC', 'Infrastructure as Code', 'TF'],
    category: 'devops',
    weight: 0.9,
    isHot: true
  },
  {
    canonical: 'Ansible',
    aliases: ['ansible'],
    category: 'devops',
    weight: 0.8,
    isHot: false
  },
  {
    canonical: 'Linux',
    aliases: ['linux', 'Unix', 'unix', 'Ubuntu', 'ubuntu', 'Debian', 'CentOS', 'RHEL'],
    category: 'tool',
    weight: 0.85,
    isHot: false
  },
  {
    canonical: 'Nginx',
    aliases: ['nginx', 'NGINX'],
    category: 'tool',
    weight: 0.8,
    isHot: false
  },

  // ========== APIs & CONCEPTS ==========
  {
    canonical: 'REST API',
    aliases: ['REST', 'RESTful', 'rest api', 'restful api', 'RESTful API', 'REST APIs', 'Restful APIs'],
    category: 'concept',
    weight: 0.9,
    isHot: false
  },
  {
    canonical: 'GraphQL',
    aliases: ['graphql', 'gql', 'Graph QL', 'Apollo GraphQL'],
    category: 'concept',
    weight: 0.85,
    isHot: true
  },
  {
    canonical: 'WebSockets',
    aliases: ['websockets', 'websocket', 'WS', 'real-time', 'realtime', 'Socket.io', 'socket.io'],
    category: 'concept',
    weight: 0.8,
    isHot: false
  },
  {
    canonical: 'Microservices',
    aliases: ['microservices', 'micro-services', 'MSA', 'microservice architecture'],
    category: 'concept',
    weight: 0.85,
    isHot: false
  },
  {
    canonical: 'OAuth',
    aliases: ['oauth', 'OAuth2', 'oauth2', 'OAuth 2.0', 'OpenID', 'OIDC'],
    category: 'concept',
    weight: 0.8,
    isHot: false
  },
  {
    canonical: 'JWT',
    aliases: ['jwt', 'JSON Web Token', 'JSON Web Tokens'],
    category: 'concept',
    weight: 0.8,
    isHot: false
  },

  // ========== CSS FRAMEWORKS ==========
  {
    canonical: 'TailwindCSS',
    aliases: ['Tailwind', 'tailwind', 'tailwindcss', 'Tailwind CSS', 'tailwind css'],
    category: 'framework',
    weight: 0.9,
    isHot: true
  },
  {
    canonical: 'Bootstrap',
    aliases: ['bootstrap', 'Bootstrap 5', 'bootstrap5'],
    category: 'framework',
    weight: 0.7,
    isHot: false
  },
  {
    canonical: 'SASS',
    aliases: ['sass', 'scss', 'SCSS', 'Syntactically Awesome Style Sheets'],
    category: 'language',
    weight: 0.7,
    isHot: false
  },
  {
    canonical: 'styled-components',
    aliases: ['styled-components', 'styled components', 'CSS-in-JS', 'css in js'],
    category: 'framework',
    weight: 0.75,
    isHot: false
  },

  // ========== TESTING ==========
  {
    canonical: 'Jest',
    aliases: ['jest', 'Jest Testing'],
    category: 'tool',
    weight: 0.8,
    isHot: false
  },
  {
    canonical: 'Cypress',
    aliases: ['cypress', 'cy', 'Cypress.io'],
    category: 'tool',
    weight: 0.8,
    isHot: true
  },
  {
    canonical: 'Playwright',
    aliases: ['playwright'],
    category: 'tool',
    weight: 0.8,
    isHot: true
  },
  {
    canonical: 'Pytest',
    aliases: ['pytest', 'py.test'],
    category: 'tool',
    weight: 0.8,
    isHot: false
  },
  {
    canonical: 'Unit Testing',
    aliases: ['unit tests', 'unit testing', 'TDD', 'test-driven development'],
    category: 'concept',
    weight: 0.85,
    isHot: false
  },
  {
    canonical: 'Integration Testing',
    aliases: ['integration tests', 'integration testing', 'E2E', 'end-to-end'],
    category: 'concept',
    weight: 0.8,
    isHot: false
  },

  // ========== AI/ML (for detection) ==========
  {
    canonical: 'Machine Learning',
    aliases: ['ML', 'ml', 'machine learning'],
    category: 'concept',
    weight: 0.9,
    isHot: true
  },
  {
    canonical: 'TensorFlow',
    aliases: ['tensorflow', 'tf', 'TF'],
    category: 'framework',
    weight: 0.85,
    isHot: false
  },
  {
    canonical: 'PyTorch',
    aliases: ['pytorch', 'torch', 'Py Torch'],
    category: 'framework',
    weight: 0.85,
    isHot: true
  },
  {
    canonical: 'Deep Learning',
    aliases: ['deep learning', 'DL', 'neural networks', 'Neural Networks'],
    category: 'concept',
    weight: 0.85,
    isHot: true
  },
  {
    canonical: 'NLP',
    aliases: ['nlp', 'Natural Language Processing', 'natural language processing'],
    category: 'concept',
    weight: 0.85,
    isHot: true
  },

  // ========== SOFT SKILLS ==========
  {
    canonical: 'Communication',
    aliases: ['communication skills', 'verbal communication', 'written communication', 'excellent communication'],
    category: 'soft_skill',
    weight: 0.7,
    isHot: false
  },
  {
    canonical: 'Problem Solving',
    aliases: ['problem-solving', 'problem solving', 'analytical thinking', 'critical thinking', 'analytical skills'],
    category: 'soft_skill',
    weight: 0.8,
    isHot: false
  },
  {
    canonical: 'Team Collaboration',
    aliases: ['teamwork', 'collaboration', 'team player', 'cross-functional', 'collaborative'],
    category: 'soft_skill',
    weight: 0.7,
    isHot: false
  },
  {
    canonical: 'Agile',
    aliases: ['agile', 'Scrum', 'scrum', 'Kanban', 'kanban', 'Agile methodology', 'agile development', 'Sprint'],
    category: 'soft_skill',
    weight: 0.8,
    isHot: false
  },
  {
    canonical: 'Leadership',
    aliases: ['leadership', 'team lead', 'tech lead', 'mentoring', 'mentorship'],
    category: 'soft_skill',
    weight: 0.75,
    isHot: false
  },
  {
    canonical: 'Project Management',
    aliases: ['project management', 'PM', 'Jira', 'jira', 'project planning'],
    category: 'soft_skill',
    weight: 0.75,
    isHot: false
  },

  // ========== FRONTEND CONCEPTS ==========
  {
    canonical: 'Responsive Design',
    aliases: ['responsive', 'responsive design', 'responsive web', 'mobile-first', 'mobile first', 'responsive UI', 'adaptive design', 'media queries'],
    category: 'concept',
    weight: 0.85,
    isHot: false
  },
  {
    canonical: 'UI/UX',
    aliases: ['ui/ux', 'UI UX', 'ui ux', 'user interface', 'user experience', 'UX design', 'UI design', 'interface design', 'UX', 'UI'],
    category: 'concept',
    weight: 0.8,
    isHot: true
  },
  {
    canonical: 'Performance Optimization',
    aliases: ['performance', 'performance optimization', 'web performance', 'optimization', 'page speed', 'load time', 'Core Web Vitals', 'lighthouse'],
    category: 'concept',
    weight: 0.85,
    isHot: true
  },
  {
    canonical: 'Clean Code',
    aliases: ['clean code', 'code quality', 'clean architecture', 'SOLID', 'solid principles', 'best practices', 'coding standards', 'maintainable code'],
    category: 'concept',
    weight: 0.8,
    isHot: false
  },
  {
    canonical: 'Accessibility',
    aliases: ['accessibility', 'a11y', 'WCAG', 'wcag', 'accessible', 'screen reader', 'aria', 'ARIA'],
    category: 'concept',
    weight: 0.8,
    isHot: true
  },
  {
    canonical: 'SEO',
    aliases: ['seo', 'search engine optimization', 'SEO optimization', 'meta tags', 'structured data'],
    category: 'concept',
    weight: 0.75,
    isHot: false
  },
  {
    canonical: 'State Management',
    aliases: ['state management', 'Redux', 'redux', 'Zustand', 'zustand', 'Recoil', 'MobX', 'Vuex', 'Pinia', 'context api', 'global state'],
    category: 'concept',
    weight: 0.85,
    isHot: false
  },
  {
    canonical: 'Component Design',
    aliases: ['component', 'components', 'component-based', 'reusable components', 'component architecture', 'atomic design', 'design system'],
    category: 'concept',
    weight: 0.8,
    isHot: false
  },
  {
    canonical: 'CSS Grid',
    aliases: ['css grid', 'grid', 'grid layout', 'CSS Grid Layout'],
    category: 'language',
    weight: 0.75,
    isHot: false
  },
  {
    canonical: 'Flexbox',
    aliases: ['flexbox', 'flex', 'CSS Flexbox', 'flexible box'],
    category: 'language',
    weight: 0.75,
    isHot: false
  },
  {
    canonical: 'CSS Animations',
    aliases: ['css animations', 'animations', 'transitions', 'keyframes', 'animated', 'motion design', 'framer motion', 'Framer Motion'],
    category: 'concept',
    weight: 0.7,
    isHot: false
  },
  {
    canonical: 'Web APIs',
    aliases: ['web apis', 'browser api', 'DOM', 'dom manipulation', 'Fetch API', 'localStorage', 'sessionStorage', 'Web Storage'],
    category: 'concept',
    weight: 0.8,
    isHot: false
  },
  {
    canonical: 'SPA',
    aliases: ['spa', 'single page application', 'single-page application', 'single page app', 'client-side rendering', 'CSR'],
    category: 'concept',
    weight: 0.8,
    isHot: false
  },
  {
    canonical: 'SSR',
    aliases: ['ssr', 'server side rendering', 'server-side rendering', 'SSG', 'static site generation', 'ISR', 'incremental static regeneration'],
    category: 'concept',
    weight: 0.85,
    isHot: true
  },
  {
    canonical: 'PWA',
    aliases: ['pwa', 'progressive web app', 'progressive web application', 'service worker', 'offline-first'],
    category: 'concept',
    weight: 0.75,
    isHot: false
  },

  // ========== FRONTEND TOOLS ==========
  {
    canonical: 'Webpack',
    aliases: ['webpack', 'bundler', 'module bundler'],
    category: 'tool',
    weight: 0.8,
    isHot: false
  },
  {
    canonical: 'Vite',
    aliases: ['vite', 'vitejs', 'vite.js'],
    category: 'tool',
    weight: 0.85,
    isHot: true
  },
  {
    canonical: 'npm',
    aliases: ['npm', 'node package manager', 'package.json'],
    category: 'tool',
    weight: 0.8,
    isHot: false
  },
  {
    canonical: 'yarn',
    aliases: ['yarn', 'yarn package manager'],
    category: 'tool',
    weight: 0.75,
    isHot: false
  },
  {
    canonical: 'pnpm',
    aliases: ['pnpm'],
    category: 'tool',
    weight: 0.75,
    isHot: true
  },
  {
    canonical: 'ESLint',
    aliases: ['eslint', 'linting', 'linter', 'code linting'],
    category: 'tool',
    weight: 0.75,
    isHot: false
  },
  {
    canonical: 'Prettier',
    aliases: ['prettier', 'code formatter', 'formatting'],
    category: 'tool',
    weight: 0.7,
    isHot: false
  },
  {
    canonical: 'Storybook',
    aliases: ['storybook', 'component library', 'UI library'],
    category: 'tool',
    weight: 0.75,
    isHot: false
  },
  {
    canonical: 'Figma',
    aliases: ['figma', 'Figma design', 'design tools'],
    category: 'tool',
    weight: 0.7,
    isHot: true
  },

  // ========== BACKEND CONCEPTS ==========
  {
    canonical: 'API Design',
    aliases: ['api design', 'API development', 'api development', 'backend api', 'API architecture'],
    category: 'concept',
    weight: 0.85,
    isHot: false
  },
  {
    canonical: 'Database Design',
    aliases: ['database design', 'schema design', 'data modeling', 'ER diagrams', 'normalization'],
    category: 'concept',
    weight: 0.85,
    isHot: false
  },
  {
    canonical: 'Authentication',
    aliases: ['authentication', 'auth', 'authorization', 'user authentication', 'login', 'session management', 'SSO', 'single sign-on'],
    category: 'concept',
    weight: 0.85,
    isHot: false
  },
  {
    canonical: 'Caching',
    aliases: ['caching', 'cache', 'memoization', 'CDN', 'content delivery', 'edge caching'],
    category: 'concept',
    weight: 0.8,
    isHot: false
  },
  {
    canonical: 'Message Queues',
    aliases: ['message queue', 'queues', 'RabbitMQ', 'rabbitmq', 'Kafka', 'kafka', 'SQS', 'pub/sub', 'event-driven'],
    category: 'concept',
    weight: 0.8,
    isHot: false
  },
  {
    canonical: 'Serverless',
    aliases: ['serverless', 'Lambda', 'lambda', 'AWS Lambda', 'cloud functions', 'FaaS'],
    category: 'concept',
    weight: 0.85,
    isHot: true
  },

  // ========== DATA FORMATS ==========
  {
    canonical: 'JSON',
    aliases: ['json', 'JSON data', 'JSON format'],
    category: 'language',
    weight: 0.7,
    isHot: false
  },
  {
    canonical: 'XML',
    aliases: ['xml', 'XML data'],
    category: 'language',
    weight: 0.5,
    isHot: false
  },
  {
    canonical: 'YAML',
    aliases: ['yaml', 'yml'],
    category: 'language',
    weight: 0.6,
    isHot: false
  },
  {
    canonical: 'Markdown',
    aliases: ['markdown', 'md', 'MDX', 'mdx'],
    category: 'language',
    weight: 0.5,
    isHot: false
  },

  // ========== MOBILE DEVELOPMENT ==========
  {
    canonical: 'React Native',
    aliases: ['react native', 'React-Native', 'RN', 'react-native', 'expo', 'Expo'],
    category: 'framework',
    weight: 0.9,
    isHot: true
  },
  {
    canonical: 'Flutter',
    aliases: ['flutter', 'Dart', 'dart'],
    category: 'framework',
    weight: 0.9,
    isHot: true
  },
  {
    canonical: 'iOS Development',
    aliases: ['ios', 'iOS', 'iPhone development', 'iPad development', 'Apple development'],
    category: 'concept',
    weight: 0.8,
    isHot: false
  },
  {
    canonical: 'Android Development',
    aliases: ['android', 'Android', 'Android SDK', 'android development'],
    category: 'concept',
    weight: 0.8,
    isHot: false
  },

  // ========== MONITORING & OBSERVABILITY ==========
  {
    canonical: 'Monitoring',
    aliases: ['monitoring', 'observability', 'APM', 'application monitoring', 'metrics'],
    category: 'concept',
    weight: 0.75,
    isHot: false
  },
  {
    canonical: 'Logging',
    aliases: ['logging', 'logs', 'log management', 'ELK', 'Splunk', 'Datadog'],
    category: 'concept',
    weight: 0.7,
    isHot: false
  },
  {
    canonical: 'Sentry',
    aliases: ['sentry', 'error tracking', 'error monitoring', 'bug tracking'],
    category: 'tool',
    weight: 0.7,
    isHot: false
  },

  // ========== VERSION CONTROL CONCEPTS ==========
  {
    canonical: 'Git Workflows',
    aliases: ['git flow', 'gitflow', 'branching strategy', 'trunk-based', 'feature branches', 'pull requests', 'code review'],
    category: 'concept',
    weight: 0.8,
    isHot: false
  },

  // ========== SECURITY ==========
  {
    canonical: 'Security',
    aliases: ['security', 'cybersecurity', 'web security', 'secure coding', 'OWASP', 'vulnerability'],
    category: 'concept',
    weight: 0.85,
    isHot: true
  },
  {
    canonical: 'HTTPS',
    aliases: ['https', 'SSL', 'TLS', 'certificates', 'encryption'],
    category: 'concept',
    weight: 0.7,
    isHot: false
  },
  {
    canonical: 'CORS',
    aliases: ['cors', 'cross-origin', 'cross origin resource sharing'],
    category: 'concept',
    weight: 0.7,
    isHot: false
  },

  // ========== DATA SCIENCE ==========
  {
    canonical: 'Data Analysis',
    aliases: ['data analysis', 'data analytics', 'analytics', 'data visualization', 'dashboard'],
    category: 'concept',
    weight: 0.8,
    isHot: true
  },
  {
    canonical: 'Pandas',
    aliases: ['pandas', 'dataframes', 'data manipulation'],
    category: 'framework',
    weight: 0.8,
    isHot: false,
    parent: 'Python'
  },
  {
    canonical: 'NumPy',
    aliases: ['numpy', 'numerical computing', 'arrays'],
    category: 'framework',
    weight: 0.75,
    isHot: false,
    parent: 'Python'
  },
  {
    canonical: 'Jupyter',
    aliases: ['jupyter', 'jupyter notebook', 'notebooks', 'ipython'],
    category: 'tool',
    weight: 0.7,
    isHot: false
  },
  {
    canonical: 'SQL Analytics',
    aliases: ['sql analytics', 'data warehousing', 'BigQuery', 'Snowflake', 'Redshift', 'data warehouse'],
    category: 'concept',
    weight: 0.8,
    isHot: true
  }
];

// Create lookup maps for fast normalization
export const ALIAS_TO_CANONICAL: Map<string, string> = new Map();
export const CANONICAL_TO_ENTRY: Map<string, TaxonomyEntry> = new Map();

// Initialize lookup maps
SKILL_TAXONOMY.forEach(entry => {
  CANONICAL_TO_ENTRY.set(entry.canonical.toLowerCase(), entry);
  ALIAS_TO_CANONICAL.set(entry.canonical.toLowerCase(), entry.canonical);
  entry.aliases.forEach(alias => {
    ALIAS_TO_CANONICAL.set(alias.toLowerCase(), entry.canonical);
  });
});

/**
 * Normalize a skill name to its canonical form
 */
export function normalizeSkill(skillName: string): string | null {
  const normalized = skillName.toLowerCase().trim();
  return ALIAS_TO_CANONICAL.get(normalized) || null;
}

/**
 * Get full taxonomy entry for a skill
 */
export function getSkillEntry(skillName: string): TaxonomyEntry | null {
  const canonical = normalizeSkill(skillName);
  if (!canonical) return null;
  return CANONICAL_TO_ENTRY.get(canonical.toLowerCase()) || null;
}

/**
 * Check if a skill exists in taxonomy
 */
export function isKnownSkill(skillName: string): boolean {
  return normalizeSkill(skillName) !== null;
}

/**
 * Get all skills by category
 */
export function getSkillsByCategory(category: string): TaxonomyEntry[] {
  return SKILL_TAXONOMY.filter(entry => entry.category === category);
}

/**
 * Get hot/trending skills
 */
export function getHotSkills(): TaxonomyEntry[] {
  return SKILL_TAXONOMY.filter(entry => entry.isHot);
}
