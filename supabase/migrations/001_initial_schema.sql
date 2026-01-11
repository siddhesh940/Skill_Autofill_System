-- =====================================================
-- SKILL AUTOFILL SYSTEM - SUPABASE DATABASE SCHEMA
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

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- =====================================================
-- TABLE: user_profiles (resume, portfolio data)
-- =====================================================
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  resume_text TEXT,
  resume_file_url TEXT,
  resume_parsed_at TIMESTAMPTZ,
  github_data JSONB DEFAULT '{}',
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
-- TABLE: user_skills (normalized skill database)
-- =====================================================
CREATE TABLE public.user_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  skill_category TEXT, -- 'language', 'framework', 'tool', 'soft_skill'
  proficiency_level TEXT DEFAULT 'intermediate', -- 'beginner', 'intermediate', 'advanced', 'expert'
  years_experience NUMERIC(3,1),
  source TEXT, -- 'resume', 'github', 'manual', 'ai_detected'
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
  job_title TEXT,
  company_name TEXT,
  job_url TEXT,
  job_description_raw TEXT NOT NULL,
  job_description_parsed JSONB,
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.job_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own job requests" ON public.job_requests
  FOR ALL USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_job_requests_user_id ON public.job_requests(user_id);
CREATE INDEX idx_job_requests_status ON public.job_requests(status);

-- =====================================================
-- TABLE: ai_outputs (all AI-generated content)
-- =====================================================
CREATE TABLE public.ai_outputs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  job_request_id UUID REFERENCES public.job_requests(id) ON DELETE CASCADE,
  output_type TEXT NOT NULL, -- 'skill_gap', 'roadmap', 'resume_bullets', 'projects', 'github_tasks', 'portfolio_updates'
  output_data JSONB NOT NULL,
  model_used TEXT DEFAULT 'gpt-4',
  tokens_used INTEGER,
  processing_time_ms INTEGER,
  is_applied BOOLEAN DEFAULT false,
  applied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ai_outputs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own AI outputs" ON public.ai_outputs
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_ai_outputs_user_id ON public.ai_outputs(user_id);
CREATE INDEX idx_ai_outputs_job_request_id ON public.ai_outputs(job_request_id);
CREATE INDEX idx_ai_outputs_type ON public.ai_outputs(output_type);

-- =====================================================
-- TABLE: skill_taxonomy (canonical skill names)
-- =====================================================
CREATE TABLE public.skill_taxonomy (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  canonical_name TEXT NOT NULL UNIQUE,
  aliases TEXT[] DEFAULT '{}',
  category TEXT NOT NULL,
  parent_skill TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert common skills for normalization
INSERT INTO public.skill_taxonomy (canonical_name, aliases, category) VALUES
  ('JavaScript', ARRAY['JS', 'Javascript', 'javascript', 'js'], 'language'),
  ('TypeScript', ARRAY['TS', 'Typescript', 'typescript', 'ts'], 'language'),
  ('Python', ARRAY['python', 'py', 'Python3', 'python3'], 'language'),
  ('React', ARRAY['ReactJS', 'React.js', 'react', 'reactjs'], 'framework'),
  ('Next.js', ARRAY['NextJS', 'Nextjs', 'next', 'nextjs'], 'framework'),
  ('Node.js', ARRAY['NodeJS', 'Nodejs', 'node', 'nodejs'], 'runtime'),
  ('PostgreSQL', ARRAY['Postgres', 'postgres', 'postgresql', 'psql'], 'database'),
  ('MongoDB', ARRAY['Mongo', 'mongo', 'mongodb'], 'database'),
  ('AWS', ARRAY['Amazon Web Services', 'aws'], 'cloud'),
  ('Docker', ARRAY['docker', 'containers'], 'devops'),
  ('Kubernetes', ARRAY['K8s', 'k8s', 'kubernetes'], 'devops'),
  ('Git', ARRAY['git', 'version control'], 'tool'),
  ('REST API', ARRAY['REST', 'RESTful', 'rest api', 'restful api'], 'concept'),
  ('GraphQL', ARRAY['graphql', 'gql'], 'concept'),
  ('SQL', ARRAY['sql', 'Structured Query Language'], 'language'),
  ('TailwindCSS', ARRAY['Tailwind', 'tailwind', 'tailwindcss'], 'framework'),
  ('Machine Learning', ARRAY['ML', 'ml', 'machine learning'], 'concept'),
  ('CI/CD', ARRAY['cicd', 'continuous integration', 'continuous deployment'], 'devops');

-- =====================================================
-- TABLE: learning_resources (curated resources)
-- =====================================================
CREATE TABLE public.learning_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  skill_name TEXT NOT NULL,
  resource_type TEXT NOT NULL, -- 'course', 'tutorial', 'documentation', 'video', 'book'
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  provider TEXT, -- 'Udemy', 'Coursera', 'YouTube', 'Official Docs'
  difficulty TEXT, -- 'beginner', 'intermediate', 'advanced'
  estimated_hours INTEGER,
  is_free BOOLEAN DEFAULT true,
  rating NUMERIC(2,1),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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

-- =====================================================
-- VIEWS
-- =====================================================

-- View for user skill summary
CREATE OR REPLACE VIEW public.user_skill_summary AS
SELECT 
  u.id as user_id,
  u.email,
  COUNT(us.id) as total_skills,
  array_agg(DISTINCT us.skill_category) FILTER (WHERE us.skill_category IS NOT NULL) as skill_categories,
  array_agg(us.skill_name ORDER BY us.proficiency_level DESC) as skills
FROM public.users u
LEFT JOIN public.user_skills us ON u.id = us.user_id
GROUP BY u.id, u.email;
