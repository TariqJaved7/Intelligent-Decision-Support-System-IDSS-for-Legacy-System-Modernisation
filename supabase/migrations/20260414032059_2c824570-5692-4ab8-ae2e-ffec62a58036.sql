
-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  organisation TEXT NOT NULL DEFAULT '',
  industry TEXT NOT NULL DEFAULT '',
  system_type TEXT NOT NULL DEFAULT '',
  criticality TEXT NOT NULL DEFAULT 'Low' CHECK (criticality IN ('Low', 'Medium', 'High')),
  project_size TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create assessments table
CREATE TABLE public.assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE UNIQUE,
  technical NUMERIC NOT NULL DEFAULT 1,
  data NUMERIC NOT NULL DEFAULT 1,
  security NUMERIC NOT NULL DEFAULT 1,
  operational NUMERIC NOT NULL DEFAULT 1
);

-- Create risks table
CREATE TABLE public.risks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  probability NUMERIC NOT NULL DEFAULT 1,
  impact NUMERIC NOT NULL DEFAULT 1
);

-- Create scenarios table
CREATE TABLE public.scenarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  technical NUMERIC NOT NULL DEFAULT 1,
  data NUMERIC NOT NULL DEFAULT 1,
  security NUMERIC NOT NULL DEFAULT 1,
  operational NUMERIC NOT NULL DEFAULT 1,
  risk_score NUMERIC NOT NULL DEFAULT 0,
  criticality TEXT NOT NULL DEFAULT 'Low' CHECK (criticality IN ('Low', 'Medium', 'High'))
);

-- Create change_management table
CREATE TABLE public.change_management (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE UNIQUE,
  communication_plan TEXT NOT NULL DEFAULT '',
  training_level NUMERIC NOT NULL DEFAULT 1,
  resistance_level TEXT NOT NULL DEFAULT 'Low' CHECK (resistance_level IN ('Low', 'Medium', 'High'))
);

-- Create evaluations table
CREATE TABLE public.evaluations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE UNIQUE,
  adoption_rate NUMERIC NOT NULL DEFAULT 0,
  system_reliability NUMERIC NOT NULL DEFAULT 0,
  user_satisfaction NUMERIC NOT NULL DEFAULT 1,
  efficiency_improvement NUMERIC NOT NULL DEFAULT 0
);

-- Enable RLS on all tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.change_management ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

-- Allow public access (no auth required)
CREATE POLICY "Allow all access to projects" ON public.projects FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to assessments" ON public.assessments FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to risks" ON public.risks FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to scenarios" ON public.scenarios FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to change_management" ON public.change_management FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to evaluations" ON public.evaluations FOR ALL TO anon USING (true) WITH CHECK (true);
