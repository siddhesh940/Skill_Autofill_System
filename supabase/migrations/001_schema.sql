-- =====================================================
-- SKILL AUTOFILL SYSTEM - DATABASE SCHEMA (NO AI)
-- 100% Rule-Based Career Optimization Platform
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: users (extends Supabase auth.users)
-- =====================================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  github_username TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- =====================================================
-- TABLE: user_profiles (resume & portfolio data)
-- =====================================================
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Resume Data
  resume_text TEXT,
  resume_file_url TEXT,
  resume_parsed_at TIMESTAMPTZ,
  
  -- GitHub Data (fetched from public API)
  github_data JSONB DEFAULT '{
    "username": null,
    "repos": [],
    "languages": {},
    "total_stars": 0,
    "total_commits": 0
  }',
  
  -- Portfolio Data (syncs with frontend)
  portfolio_data JSONB DEFAULT '{
    "bio": "",
    "headline": "",
    "skills": [],
    "projects": [],
    "experience": [],
    "education": []
  }',
  
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own profile" ON public.user_profiles
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- TABLE: user_skills (normalized user skills)
-- =====================================================
CREATE TABLE public.user_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  skill_name TEXT NOT NULL,              -- Canonical skill name
  skill_category TEXT,                    -- 'language', 'framework', 'tool', 'database', 'cloud', 'soft_skill'
  proficiency_level TEXT DEFAULT 'intermediate', -- 'beginner', 'intermediate', 'advanced', 'expert'
  years_experience NUMERIC(3,1),
  
  source TEXT NOT NULL,                   -- 'resume', 'github', 'manual'
  confidence_score NUMERIC(3,2) DEFAULT 1.0, -- 0.0 to 1.0 (how confident the extraction is)
  
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, skill_name)
);

ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own skills" ON public.user_skills
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- TABLE: job_requests (job analysis requests)
-- =====================================================
CREATE TABLE public.job_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Input Data
  job_title TEXT,
  company_name TEXT,
  job_url TEXT,
  job_description_raw TEXT NOT NULL,
  
  -- Parsed Output (structured JSON from NLP)
  job_parsed JSONB DEFAULT '{
    "job_title": "",
    "company": "",
    "location": "",
    "experience_level": "",
    "experience_years_min": 0,
    "experience_years_max": null,
    "core_skills": [],
    "nice_to_have_skills": [],
    "tools": [],
    "responsibilities": [],
    "qualifications": [],
    "ats_keywords": [],
    "salary_range": null
  }',
  
  status TEXT DEFAULT 'pending',  -- 'pending', 'processing', 'completed', 'failed'
  error_message TEXT,
  processing_time_ms INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.job_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own job requests" ON public.job_requests
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_job_requests_user_id ON public.job_requests(user_id);
CREATE INDEX idx_job_requests_status ON public.job_requests(status);

-- =====================================================
-- TABLE: analysis_results (all generated outputs)
-- =====================================================
CREATE TABLE public.analysis_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  job_request_id UUID NOT NULL REFERENCES public.job_requests(id) ON DELETE CASCADE,
  
  -- Skill Gap Analysis
  skill_gap JSONB DEFAULT '{
    "required_skills": [],
    "user_skills": [],
    "matching_skills": [],
    "missing_skills": [],
    "match_percentage": 0
  }',
  
  -- Learning Roadmap
  roadmap JSONB DEFAULT '{
    "total_weeks": 0,
    "weekly_hours": 0,
    "phases": [],
    "milestones": []
  }',
  
  -- Resume Improvements
  resume_suggestions JSONB DEFAULT '{
    "improved_bullets": [],
    "new_bullets": [],
    "keywords_to_add": []
  }',
  
  -- Project Recommendations
  recommended_projects JSONB DEFAULT '{
    "projects": []
  }',
  
  -- GitHub Tasks
  github_tasks JSONB DEFAULT '{
    "repo_name": "",
    "issues": [],
    "labels": []
  }',
  
  -- Portfolio Updates
  portfolio_updates JSONB DEFAULT '{
    "skills_to_add": [],
    "skills_to_highlight": [],
    "bio_update": null,
    "headline_update": null
  }',
  
  -- Metadata
  is_applied BOOLEAN DEFAULT false,
  applied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own analysis results" ON public.analysis_results
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_analysis_results_user_id ON public.analysis_results(user_id);
CREATE INDEX idx_analysis_results_job_request_id ON public.analysis_results(job_request_id);

-- =====================================================
-- TABLE: skill_taxonomy (canonical skill database)
-- Master dictionary for skill normalization
-- =====================================================
CREATE TABLE public.skill_taxonomy (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  canonical_name TEXT NOT NULL UNIQUE,
  aliases TEXT[] DEFAULT '{}',
  category TEXT NOT NULL,
  parent_skill TEXT,
  importance_weight NUMERIC(3,2) DEFAULT 1.0,  -- For priority scoring
  is_hot_skill BOOLEAN DEFAULT false,           -- Trending in job market
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert comprehensive skill taxonomy
INSERT INTO public.skill_taxonomy (canonical_name, aliases, category, importance_weight, is_hot_skill) VALUES
  -- Programming Languages
  ('JavaScript', ARRAY['JS', 'Javascript', 'javascript', 'js', 'ES6', 'ES2015', 'ECMAScript'], 'language', 1.0, true),
  ('TypeScript', ARRAY['TS', 'Typescript', 'typescript', 'ts'], 'language', 1.0, true),
  ('Python', ARRAY['python', 'py', 'Python3', 'python3', 'Python 3'], 'language', 1.0, true),
  ('Java', ARRAY['java', 'J2EE', 'j2ee', 'JDK', 'jdk'], 'language', 0.9, false),
  ('C++', ARRAY['cpp', 'c++', 'Cpp', 'CPP'], 'language', 0.8, false),
  ('C#', ARRAY['csharp', 'c#', 'CSharp', 'dotnet', '.NET'], 'language', 0.85, false),
  ('Go', ARRAY['Golang', 'golang', 'go-lang'], 'language', 0.9, true),
  ('Rust', ARRAY['rust', 'rustlang', 'rust-lang'], 'language', 0.85, true),
  ('Ruby', ARRAY['ruby', 'rb'], 'language', 0.7, false),
  ('PHP', ARRAY['php', 'Php'], 'language', 0.6, false),
  ('Swift', ARRAY['swift', 'SwiftUI'], 'language', 0.8, false),
  ('Kotlin', ARRAY['kotlin', 'kt'], 'language', 0.8, false),
  ('SQL', ARRAY['sql', 'Structured Query Language'], 'language', 0.9, false),
  
  -- Frontend Frameworks
  ('React', ARRAY['ReactJS', 'React.js', 'react', 'reactjs', 'React JS'], 'framework', 1.0, true),
  ('Next.js', ARRAY['NextJS', 'Nextjs', 'next', 'nextjs', 'Next'], 'framework', 1.0, true),
  ('Vue.js', ARRAY['Vue', 'vue', 'vuejs', 'Vue 3', 'vue3'], 'framework', 0.9, true),
  ('Angular', ARRAY['angular', 'AngularJS', 'Angular 2+', 'ng'], 'framework', 0.85, false),
  ('Svelte', ARRAY['svelte', 'SvelteKit', 'sveltekit'], 'framework', 0.8, true),
  
  -- Backend Frameworks
  ('Node.js', ARRAY['NodeJS', 'Nodejs', 'node', 'nodejs', 'Node'], 'runtime', 1.0, true),
  ('Express.js', ARRAY['Express', 'express', 'expressjs'], 'framework', 0.9, false),
  ('Django', ARRAY['django', 'Django REST', 'DRF'], 'framework', 0.85, false),
  ('FastAPI', ARRAY['fastapi', 'fast-api', 'Fast API'], 'framework', 0.9, true),
  ('Flask', ARRAY['flask'], 'framework', 0.75, false),
  ('Spring Boot', ARRAY['Spring', 'spring', 'springboot', 'Spring Framework'], 'framework', 0.9, false),
  ('NestJS', ARRAY['nestjs', 'Nest.js', 'nest'], 'framework', 0.85, true),
  
  -- Databases
  ('PostgreSQL', ARRAY['Postgres', 'postgres', 'postgresql', 'psql', 'pg'], 'database', 0.95, true),
  ('MongoDB', ARRAY['Mongo', 'mongo', 'mongodb', 'NoSQL'], 'database', 0.9, false),
  ('MySQL', ARRAY['mysql', 'MariaDB', 'mariadb'], 'database', 0.85, false),
  ('Redis', ARRAY['redis', 'Redis Cache'], 'database', 0.85, false),
  ('Supabase', ARRAY['supabase'], 'database', 0.9, true),
  ('Firebase', ARRAY['firebase', 'Firestore', 'firestore'], 'database', 0.85, false),
  
  -- Cloud Platforms
  ('AWS', ARRAY['Amazon Web Services', 'aws', 'Amazon AWS'], 'cloud', 1.0, true),
  ('Azure', ARRAY['Microsoft Azure', 'azure', 'Azure Cloud'], 'cloud', 0.95, true),
  ('GCP', ARRAY['Google Cloud', 'Google Cloud Platform', 'gcp'], 'cloud', 0.9, true),
  ('Vercel', ARRAY['vercel', 'Zeit'], 'cloud', 0.85, true),
  
  -- DevOps & Tools
  ('Docker', ARRAY['docker', 'containers', 'containerization'], 'devops', 1.0, true),
  ('Kubernetes', ARRAY['K8s', 'k8s', 'kubernetes', 'k8'], 'devops', 0.95, true),
  ('Git', ARRAY['git', 'version control', 'VCS'], 'tool', 0.95, false),
  ('GitHub', ARRAY['github', 'Github Actions', 'GH'], 'tool', 0.9, false),
  ('CI/CD', ARRAY['cicd', 'continuous integration', 'continuous deployment', 'Jenkins', 'GitHub Actions'], 'devops', 0.9, true),
  ('Terraform', ARRAY['terraform', 'IaC', 'Infrastructure as Code'], 'devops', 0.9, true),
  
  -- APIs & Concepts
  ('REST API', ARRAY['REST', 'RESTful', 'rest api', 'restful api', 'RESTful API'], 'concept', 0.9, false),
  ('GraphQL', ARRAY['graphql', 'gql', 'Graph QL'], 'concept', 0.85, true),
  ('Microservices', ARRAY['microservices', 'micro-services', 'MSA'], 'concept', 0.85, false),
  ('WebSockets', ARRAY['websockets', 'websocket', 'WS', 'real-time'], 'concept', 0.8, false),
  
  -- CSS & Styling
  ('TailwindCSS', ARRAY['Tailwind', 'tailwind', 'tailwindcss', 'Tailwind CSS'], 'framework', 0.9, true),
  ('CSS', ARRAY['css', 'CSS3', 'css3', 'Cascading Style Sheets'], 'language', 0.8, false),
  ('SASS', ARRAY['sass', 'scss', 'SCSS'], 'language', 0.7, false),
  
  -- Testing
  ('Jest', ARRAY['jest', 'Jest Testing'], 'tool', 0.8, false),
  ('Cypress', ARRAY['cypress', 'cy'], 'tool', 0.8, false),
  ('Unit Testing', ARRAY['unit tests', 'unit testing', 'TDD'], 'concept', 0.85, false),
  
  -- AI/ML (for detection, not usage)
  ('Machine Learning', ARRAY['ML', 'ml', 'machine learning'], 'concept', 0.9, true),
  ('TensorFlow', ARRAY['tensorflow', 'tf', 'TF'], 'framework', 0.85, false),
  ('PyTorch', ARRAY['pytorch', 'torch'], 'framework', 0.85, true),
  
  -- Soft Skills
  ('Communication', ARRAY['communication skills', 'verbal communication', 'written communication'], 'soft_skill', 0.7, false),
  ('Problem Solving', ARRAY['problem-solving', 'analytical thinking', 'critical thinking'], 'soft_skill', 0.8, false),
  ('Team Collaboration', ARRAY['teamwork', 'collaboration', 'team player'], 'soft_skill', 0.7, false),
  ('Agile', ARRAY['agile', 'Scrum', 'scrum', 'Kanban', 'kanban', 'Agile methodology'], 'soft_skill', 0.8, false);

-- =====================================================
-- TABLE: project_templates (for recommendations)
-- =====================================================
CREATE TABLE public.project_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT NOT NULL,  -- 'beginner', 'intermediate', 'advanced'
  estimated_hours INTEGER NOT NULL,
  tech_stack TEXT[] NOT NULL,
  skills_demonstrated TEXT[] NOT NULL,
  features TEXT[] NOT NULL,
  github_structure TEXT[] NOT NULL,
  learning_outcomes TEXT[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert project templates
INSERT INTO public.project_templates (title, description, difficulty, estimated_hours, tech_stack, skills_demonstrated, features, github_structure, learning_outcomes) VALUES
  (
    'Full-Stack Task Manager',
    'A comprehensive task management application with user authentication, real-time updates, and team collaboration features.',
    'intermediate',
    40,
    ARRAY['Next.js', 'TypeScript', 'TailwindCSS', 'Supabase', 'PostgreSQL'],
    ARRAY['React', 'Next.js', 'TypeScript', 'PostgreSQL', 'REST API', 'Authentication'],
    ARRAY['User authentication', 'CRUD operations', 'Real-time updates', 'Team workspaces', 'Task filtering & sorting', 'Due date reminders'],
    ARRAY['src/app/', 'src/components/', 'src/lib/', 'src/types/', 'supabase/migrations/', 'README.md'],
    ARRAY['Full-stack development', 'Database design', 'State management', 'API design']
  ),
  (
    'E-Commerce Platform',
    'A modern e-commerce platform with product catalog, shopping cart, payment integration, and admin dashboard.',
    'advanced',
    80,
    ARRAY['Next.js', 'TypeScript', 'TailwindCSS', 'PostgreSQL', 'Stripe', 'Redis'],
    ARRAY['React', 'Next.js', 'TypeScript', 'PostgreSQL', 'Payment Integration', 'Caching'],
    ARRAY['Product catalog', 'Shopping cart', 'Checkout flow', 'Payment processing', 'Order management', 'Admin dashboard'],
    ARRAY['src/app/', 'src/components/', 'src/lib/', 'src/hooks/', 'prisma/', 'README.md'],
    ARRAY['Complex state management', 'Payment integration', 'Performance optimization', 'Security best practices']
  ),
  (
    'Real-Time Chat Application',
    'A real-time messaging application with channels, direct messages, and file sharing capabilities.',
    'intermediate',
    35,
    ARRAY['Next.js', 'TypeScript', 'Supabase', 'WebSockets', 'TailwindCSS'],
    ARRAY['React', 'WebSockets', 'Real-time', 'PostgreSQL', 'File Upload'],
    ARRAY['Real-time messaging', 'Channel creation', 'Direct messages', 'File sharing', 'User presence', 'Message search'],
    ARRAY['src/app/', 'src/components/', 'src/lib/', 'src/hooks/', 'supabase/', 'README.md'],
    ARRAY['Real-time communication', 'WebSocket handling', 'Database relationships']
  ),
  (
    'Personal Blog with CMS',
    'A modern blog platform with a custom CMS, markdown support, and SEO optimization.',
    'beginner',
    25,
    ARRAY['Next.js', 'TypeScript', 'TailwindCSS', 'MDX', 'Supabase'],
    ARRAY['React', 'Next.js', 'TypeScript', 'SEO', 'Markdown'],
    ARRAY['Blog posts', 'Categories & tags', 'Search functionality', 'Admin CMS', 'SEO optimization', 'RSS feed'],
    ARRAY['src/app/', 'src/components/', 'src/content/', 'public/', 'README.md'],
    ARRAY['Content management', 'SEO practices', 'Static site generation']
  ),
  (
    'API Rate Limiter Service',
    'A high-performance API rate limiting service with Redis caching and analytics dashboard.',
    'advanced',
    30,
    ARRAY['Node.js', 'TypeScript', 'Redis', 'Express.js', 'Docker'],
    ARRAY['Node.js', 'Redis', 'Docker', 'API Design', 'Microservices'],
    ARRAY['Rate limiting algorithms', 'Redis caching', 'API key management', 'Analytics dashboard', 'Docker deployment'],
    ARRAY['src/', 'tests/', 'docker/', 'docs/', 'README.md'],
    ARRAY['Caching strategies', 'Algorithm implementation', 'Microservice architecture']
  ),
  (
    'Job Board Platform',
    'A job board with company profiles, job listings, and application tracking.',
    'intermediate',
    45,
    ARRAY['Next.js', 'TypeScript', 'PostgreSQL', 'TailwindCSS', 'Supabase'],
    ARRAY['React', 'Next.js', 'PostgreSQL', 'Full-text Search', 'Authentication'],
    ARRAY['Job listings', 'Company profiles', 'Application tracking', 'Search & filters', 'Email notifications', 'Resume upload'],
    ARRAY['src/app/', 'src/components/', 'src/lib/', 'supabase/', 'README.md'],
    ARRAY['Complex queries', 'Full-text search', 'File handling', 'Email integration']
  ),
  (
    'Weather Dashboard',
    'A beautiful weather dashboard with location-based forecasts and data visualization.',
    'beginner',
    15,
    ARRAY['Next.js', 'TypeScript', 'TailwindCSS', 'Chart.js'],
    ARRAY['React', 'API Integration', 'Data Visualization', 'TypeScript'],
    ARRAY['Current weather', '7-day forecast', 'Location search', 'Weather charts', 'Responsive design'],
    ARRAY['src/app/', 'src/components/', 'src/lib/', 'public/', 'README.md'],
    ARRAY['API consumption', 'Data visualization', 'Responsive design']
  ),
  (
    'DevOps Dashboard',
    'A monitoring dashboard for CI/CD pipelines, deployments, and system health.',
    'advanced',
    50,
    ARRAY['Next.js', 'TypeScript', 'Docker', 'Kubernetes', 'Grafana'],
    ARRAY['Docker', 'Kubernetes', 'CI/CD', 'Monitoring', 'DevOps'],
    ARRAY['Pipeline monitoring', 'Deployment tracking', 'System metrics', 'Alert management', 'Log aggregation'],
    ARRAY['src/', 'k8s/', 'docker/', 'monitoring/', 'README.md'],
    ARRAY['Container orchestration', 'Monitoring setup', 'Infrastructure management']
  );

-- =====================================================
-- TABLE: roadmap_templates (learning paths)
-- =====================================================
CREATE TABLE public.roadmap_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  skill_name TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  weeks_to_learn INTEGER NOT NULL,
  hours_per_week INTEGER DEFAULT 10,
  learning_path JSONB NOT NULL,
  resources JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert roadmap templates for common skills
INSERT INTO public.roadmap_templates (skill_name, difficulty, weeks_to_learn, hours_per_week, learning_path, resources) VALUES
  (
    'React',
    'intermediate',
    4,
    10,
    '[
      {"week": 1, "focus": "React Fundamentals", "tasks": ["JSX syntax", "Components & Props", "State management basics", "Event handling"]},
      {"week": 2, "focus": "Hooks Deep Dive", "tasks": ["useState & useEffect", "useContext", "useReducer", "Custom hooks"]},
      {"week": 3, "focus": "Advanced Patterns", "tasks": ["Context API", "Performance optimization", "Error boundaries", "Code splitting"]},
      {"week": 4, "focus": "Real Project", "tasks": ["Build complete app", "Testing with Jest", "Deployment", "Best practices"]}
    ]',
    '[
      {"title": "React Official Docs", "url": "https://react.dev", "type": "documentation", "is_free": true},
      {"title": "React Tutorial", "url": "https://react.dev/learn", "type": "tutorial", "is_free": true}
    ]'
  ),
  (
    'TypeScript',
    'intermediate',
    3,
    8,
    '[
      {"week": 1, "focus": "TypeScript Basics", "tasks": ["Type annotations", "Interfaces", "Type aliases", "Union types"]},
      {"week": 2, "focus": "Advanced Types", "tasks": ["Generics", "Utility types", "Type guards", "Conditional types"]},
      {"week": 3, "focus": "Practical TypeScript", "tasks": ["React with TS", "API typing", "Error handling", "Best practices"]}
    ]',
    '[
      {"title": "TypeScript Handbook", "url": "https://www.typescriptlang.org/docs/", "type": "documentation", "is_free": true},
      {"title": "Total TypeScript", "url": "https://www.totaltypescript.com/", "type": "course", "is_free": false}
    ]'
  ),
  (
    'PostgreSQL',
    'intermediate',
    3,
    8,
    '[
      {"week": 1, "focus": "SQL Fundamentals", "tasks": ["SELECT queries", "JOINs", "Aggregations", "Subqueries"]},
      {"week": 2, "focus": "Database Design", "tasks": ["Normalization", "Indexes", "Constraints", "Relationships"]},
      {"week": 3, "focus": "Advanced PostgreSQL", "tasks": ["Transactions", "Stored procedures", "Performance tuning", "Backup & restore"]}
    ]',
    '[
      {"title": "PostgreSQL Tutorial", "url": "https://www.postgresqltutorial.com/", "type": "tutorial", "is_free": true},
      {"title": "PostgreSQL Docs", "url": "https://www.postgresql.org/docs/", "type": "documentation", "is_free": true}
    ]'
  ),
  (
    'Docker',
    'intermediate',
    2,
    10,
    '[
      {"week": 1, "focus": "Docker Basics", "tasks": ["Containers vs VMs", "Dockerfile", "Docker commands", "Images & layers"]},
      {"week": 2, "focus": "Docker in Practice", "tasks": ["Docker Compose", "Networking", "Volumes", "Multi-stage builds"]}
    ]',
    '[
      {"title": "Docker Official Docs", "url": "https://docs.docker.com/", "type": "documentation", "is_free": true},
      {"title": "Docker Getting Started", "url": "https://docs.docker.com/get-started/", "type": "tutorial", "is_free": true}
    ]'
  ),
  (
    'Next.js',
    'intermediate',
    3,
    10,
    '[
      {"week": 1, "focus": "Next.js Fundamentals", "tasks": ["App Router", "File-based routing", "Server Components", "Client Components"]},
      {"week": 2, "focus": "Data Fetching", "tasks": ["Server Actions", "API Routes", "Caching", "Revalidation"]},
      {"week": 3, "focus": "Production Ready", "tasks": ["Authentication", "Deployment", "Performance", "SEO"]}
    ]',
    '[
      {"title": "Next.js Documentation", "url": "https://nextjs.org/docs", "type": "documentation", "is_free": true},
      {"title": "Next.js Learn", "url": "https://nextjs.org/learn", "type": "tutorial", "is_free": true}
    ]'
  ),
  (
    'AWS',
    'advanced',
    6,
    12,
    '[
      {"week": 1, "focus": "AWS Fundamentals", "tasks": ["IAM", "EC2 basics", "S3", "VPC basics"]},
      {"week": 2, "focus": "Compute & Storage", "tasks": ["EC2 deep dive", "EBS", "Lambda", "ECS"]},
      {"week": 3, "focus": "Databases", "tasks": ["RDS", "DynamoDB", "ElastiCache", "Database migration"]},
      {"week": 4, "focus": "Networking & Security", "tasks": ["VPC advanced", "Security groups", "CloudFront", "Route 53"]},
      {"week": 5, "focus": "DevOps on AWS", "tasks": ["CodePipeline", "CloudFormation", "CloudWatch", "X-Ray"]},
      {"week": 6, "focus": "Architecture", "tasks": ["Well-Architected Framework", "High availability", "Cost optimization", "Real project"]}
    ]',
    '[
      {"title": "AWS Documentation", "url": "https://docs.aws.amazon.com/", "type": "documentation", "is_free": true},
      {"title": "AWS Skill Builder", "url": "https://skillbuilder.aws/", "type": "course", "is_free": true}
    ]'
  );

-- =====================================================
-- TABLE: resume_patterns (for bullet improvement)
-- =====================================================
CREATE TABLE public.resume_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pattern_type TEXT NOT NULL,  -- 'weak_verb', 'strong_verb', 'quantifier', 'action_template'
  pattern_value TEXT NOT NULL,
  replacement TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert resume patterns
INSERT INTO public.resume_patterns (pattern_type, pattern_value, replacement, category) VALUES
  -- Weak verbs to replace
  ('weak_verb', 'helped', 'collaborated', 'action'),
  ('weak_verb', 'worked on', 'developed', 'action'),
  ('weak_verb', 'was responsible for', 'led', 'action'),
  ('weak_verb', 'assisted with', 'supported', 'action'),
  ('weak_verb', 'did', 'executed', 'action'),
  ('weak_verb', 'made', 'created', 'action'),
  ('weak_verb', 'used', 'leveraged', 'action'),
  
  -- Strong action verbs
  ('strong_verb', 'architected', NULL, 'technical'),
  ('strong_verb', 'implemented', NULL, 'technical'),
  ('strong_verb', 'optimized', NULL, 'technical'),
  ('strong_verb', 'automated', NULL, 'technical'),
  ('strong_verb', 'designed', NULL, 'technical'),
  ('strong_verb', 'developed', NULL, 'technical'),
  ('strong_verb', 'engineered', NULL, 'technical'),
  ('strong_verb', 'deployed', NULL, 'technical'),
  ('strong_verb', 'integrated', NULL, 'technical'),
  ('strong_verb', 'streamlined', NULL, 'efficiency'),
  ('strong_verb', 'reduced', NULL, 'impact'),
  ('strong_verb', 'increased', NULL, 'impact'),
  ('strong_verb', 'accelerated', NULL, 'impact'),
  ('strong_verb', 'spearheaded', NULL, 'leadership'),
  ('strong_verb', 'mentored', NULL, 'leadership'),
  ('strong_verb', 'collaborated', NULL, 'teamwork'),
  
  -- Quantifier patterns
  ('quantifier', 'improved performance by X%', NULL, 'metric'),
  ('quantifier', 'reduced load time by X%', NULL, 'metric'),
  ('quantifier', 'increased efficiency by X%', NULL, 'metric'),
  ('quantifier', 'served X+ users', NULL, 'scale'),
  ('quantifier', 'processed X requests/second', NULL, 'scale'),
  
  -- Action templates
  ('action_template', '{action} {technology} {outcome} resulting in {metric}', NULL, 'full'),
  ('action_template', '{action} {count} {items} using {technology}', NULL, 'technical'),
  ('action_template', 'Led {team_size}-person team to {outcome}', NULL, 'leadership');

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_skills_updated_at BEFORE UPDATE ON public.user_skills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_requests_updated_at BEFORE UPDATE ON public.job_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  INSERT INTO public.user_profiles (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
