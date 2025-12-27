-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE step_status AS ENUM ('pending', 'in_progress', 'blocked', 'completed');
CREATE TYPE alignment_result AS ENUM ('aligned', 'misaligned', 'partial');
CREATE TYPE alignment_status AS ENUM ('aligned', 'misaligned', 'partial', 'unplanned');
CREATE TYPE conversation_status AS ENUM ('open', 'answered', 'resolved');
CREATE TYPE update_type AS ENUM ('suggested', 'approved', 'rejected');
CREATE TYPE message_role AS ENUM ('user', 'assistant');

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  github_repo_owner TEXT NOT NULL,
  github_repo_name TEXT NOT NULL,
  github_repo_full_name TEXT NOT NULL,
  webhook_secret TEXT,
  webhook_id TEXT,
  experimental_mode BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project plans table
CREATE TABLE project_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  version INTEGER DEFAULT 1,
  title TEXT NOT NULL,
  description TEXT,
  current_step_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Plan steps table
CREATE TABLE plan_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_plan_id UUID NOT NULL REFERENCES project_plans(id) ON DELETE CASCADE,
  parent_step_id UUID REFERENCES plan_steps(id) ON DELETE CASCADE,
  step_index INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  acceptance_criteria TEXT,
  status step_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Repo snapshots table
CREATE TABLE repo_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  snapshot_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Commits table
CREATE TABLE commits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  github_commit_sha TEXT NOT NULL UNIQUE,
  commit_message TEXT NOT NULL,
  diff TEXT,
  alignment_status alignment_status,
  reviewed BOOLEAN DEFAULT FALSE,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alignment checks table
CREATE TABLE alignment_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  plan_step_id UUID NOT NULL REFERENCES plan_steps(id) ON DELETE CASCADE,
  commit_id UUID REFERENCES commits(id) ON DELETE SET NULL,
  repo_snapshot_id UUID NOT NULL REFERENCES repo_snapshots(id) ON DELETE CASCADE,
  alignment_result alignment_result NOT NULL,
  analysis_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Misalignment conversations table
CREATE TABLE misalignment_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alignment_check_id UUID NOT NULL REFERENCES alignment_checks(id) ON DELETE CASCADE,
  plan_step_id UUID NOT NULL REFERENCES plan_steps(id) ON DELETE CASCADE,
  questions JSONB NOT NULL,
  answers JSONB,
  impact_analysis JSONB,
  status conversation_status DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Plan updates table
CREATE TABLE plan_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_plan_id UUID NOT NULL REFERENCES project_plans(id) ON DELETE CASCADE,
  alignment_check_id UUID NOT NULL REFERENCES alignment_checks(id) ON DELETE CASCADE,
  update_type update_type DEFAULT 'suggested',
  suggested_changes JSONB NOT NULL,
  approved_changes JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE
);

-- Cursor prompts table
CREATE TABLE cursor_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_plan_id UUID NOT NULL REFERENCES project_plans(id) ON DELETE CASCADE,
  plan_step_id UUID NOT NULL REFERENCES plan_steps(id) ON DELETE CASCADE,
  prompt_text TEXT NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used BOOLEAN DEFAULT FALSE
);

-- Chat messages table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role message_role NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_project_plans_project_id ON project_plans(project_id);
CREATE INDEX idx_plan_steps_project_plan_id ON plan_steps(project_plan_id);
CREATE INDEX idx_plan_steps_parent_step_id ON plan_steps(parent_step_id);
CREATE INDEX idx_repo_snapshots_project_id ON repo_snapshots(project_id);
CREATE INDEX idx_commits_project_id ON commits(project_id);
CREATE INDEX idx_commits_github_commit_sha ON commits(github_commit_sha);
CREATE INDEX idx_alignment_checks_project_id ON alignment_checks(project_id);
CREATE INDEX idx_alignment_checks_plan_step_id ON alignment_checks(plan_step_id);
CREATE INDEX idx_misalignment_conversations_alignment_check_id ON misalignment_conversations(alignment_check_id);
CREATE INDEX idx_plan_updates_project_plan_id ON plan_updates(project_plan_id);
CREATE INDEX idx_cursor_prompts_project_plan_id ON cursor_prompts(project_plan_id);
CREATE INDEX idx_cursor_prompts_plan_step_id ON cursor_prompts(plan_step_id);
CREATE INDEX idx_chat_messages_project_id ON chat_messages(project_id);
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_plans_updated_at BEFORE UPDATE ON project_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plan_steps_updated_at BEFORE UPDATE ON plan_steps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE repo_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE commits ENABLE ROW LEVEL SECURITY;
ALTER TABLE alignment_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE misalignment_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE cursor_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only access their own projects
CREATE POLICY "Users can view their own projects" ON projects
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects" ON projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON projects
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON projects
    FOR DELETE USING (auth.uid() = user_id);

-- Users can access project plans for their projects
CREATE POLICY "Users can view project plans for their projects" ON project_plans
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = project_plans.project_id
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert project plans for their projects" ON project_plans
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = project_plans.project_id
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update project plans for their projects" ON project_plans
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = project_plans.project_id
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete project plans for their projects" ON project_plans
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = project_plans.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Similar policies for other tables (simplified for brevity)
-- Plan steps
CREATE POLICY "Users can manage plan steps for their projects" ON plan_steps
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM project_plans pp
            JOIN projects p ON p.id = pp.project_id
            WHERE pp.id = plan_steps.project_plan_id
            AND p.user_id = auth.uid()
        )
    );

-- Repo snapshots
CREATE POLICY "Users can manage repo snapshots for their projects" ON repo_snapshots
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = repo_snapshots.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Commits
CREATE POLICY "Users can manage commits for their projects" ON commits
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = commits.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Alignment checks
CREATE POLICY "Users can manage alignment checks for their projects" ON alignment_checks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = alignment_checks.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Misalignment conversations
CREATE POLICY "Users can manage conversations for their projects" ON misalignment_conversations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM alignment_checks ac
            JOIN projects p ON p.id = ac.project_id
            WHERE ac.id = misalignment_conversations.alignment_check_id
            AND p.user_id = auth.uid()
        )
    );

-- Plan updates
CREATE POLICY "Users can manage plan updates for their projects" ON plan_updates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM project_plans pp
            JOIN projects p ON p.id = pp.project_id
            WHERE pp.id = plan_updates.project_plan_id
            AND p.user_id = auth.uid()
        )
    );

-- Cursor prompts
CREATE POLICY "Users can manage prompts for their projects" ON cursor_prompts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM project_plans pp
            JOIN projects p ON p.id = pp.project_id
            WHERE pp.id = cursor_prompts.project_plan_id
            AND p.user_id = auth.uid()
        )
    );

-- Chat messages
CREATE POLICY "Users can manage their own chat messages" ON chat_messages
    FOR ALL USING (auth.uid() = user_id);

