-- Research Lab Database Migration
-- Creates all tables needed for Research Lab feature

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. research_notebooks table
CREATE TABLE IF NOT EXISTS research_notebooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'Untitled notebook',
  description TEXT,
  thumbnail_url TEXT,
  source_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for research_notebooks
CREATE INDEX IF NOT EXISTS idx_research_notebooks_user_id ON research_notebooks(user_id);
CREATE INDEX IF NOT EXISTS idx_research_notebooks_updated_at ON research_notebooks(updated_at DESC);

-- 2. research_sources table
CREATE TABLE IF NOT EXISTS research_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  notebook_id UUID NOT NULL REFERENCES research_notebooks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (source_type IN ('pdf', 'docx', 'txt', 'markdown', 'link', 'text', 'image', 'audio', 'video')),
  title TEXT NOT NULL,
  file_path TEXT,
  file_url TEXT,
  link_url TEXT,
  content_text TEXT,
  processed_content TEXT,
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  file_size BIGINT,
  mime_type TEXT,
  is_included BOOLEAN DEFAULT true,
  metadata JSONB,
  extracted_verses JSONB,
  key_insights JSONB,
  toc_structure JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for research_sources
CREATE INDEX IF NOT EXISTS idx_research_sources_notebook_id ON research_sources(notebook_id);
CREATE INDEX IF NOT EXISTS idx_research_sources_user_id ON research_sources(user_id);
CREATE INDEX IF NOT EXISTS idx_research_sources_source_type ON research_sources(source_type);
CREATE INDEX IF NOT EXISTS idx_research_sources_processing_status ON research_sources(processing_status);

-- 3. research_chat_messages table
CREATE TABLE IF NOT EXISTS research_chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  notebook_id UUID NOT NULL REFERENCES research_notebooks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  sources_used JSONB,
  citations JSONB,
  tool_calls JSONB,
  confidence_score FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for research_chat_messages
CREATE INDEX IF NOT EXISTS idx_research_chat_messages_notebook_id ON research_chat_messages(notebook_id);
CREATE INDEX IF NOT EXISTS idx_research_chat_messages_user_id ON research_chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_research_chat_messages_created_at ON research_chat_messages(created_at);

-- 4. research_studio_outputs table
CREATE TABLE IF NOT EXISTS research_studio_outputs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  notebook_id UUID NOT NULL REFERENCES research_notebooks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  output_type TEXT NOT NULL CHECK (output_type IN ('summary', 'audio_overview', 'mind_map', 'flashcards', 'quiz', 'report', 'study_guide', 'sermon', 'timeline', 'glossary')),
  content JSONB NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for research_studio_outputs
CREATE INDEX IF NOT EXISTS idx_research_studio_outputs_notebook_id ON research_studio_outputs(notebook_id);
CREATE INDEX IF NOT EXISTS idx_research_studio_outputs_user_id ON research_studio_outputs(user_id);
CREATE INDEX IF NOT EXISTS idx_research_studio_outputs_output_type ON research_studio_outputs(output_type);

-- 5. research_agentic_actions table
CREATE TABLE IF NOT EXISTS research_agentic_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  notebook_id UUID NOT NULL REFERENCES research_notebooks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('search', 'synthesize', 'extract', 'generate', 'build')),
  tool_name TEXT NOT NULL,
  parameters JSONB,
  result JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes for research_agentic_actions
CREATE INDEX IF NOT EXISTS idx_research_agentic_actions_notebook_id ON research_agentic_actions(notebook_id);
CREATE INDEX IF NOT EXISTS idx_research_agentic_actions_user_id ON research_agentic_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_research_agentic_actions_action_type ON research_agentic_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_research_agentic_actions_status ON research_agentic_actions(status);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE research_notebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_studio_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_agentic_actions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for research_notebooks
DROP POLICY IF EXISTS "Users can view their own notebooks" ON research_notebooks;
CREATE POLICY "Users can view their own notebooks" ON research_notebooks
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own notebooks" ON research_notebooks;
CREATE POLICY "Users can insert their own notebooks" ON research_notebooks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notebooks" ON research_notebooks;
CREATE POLICY "Users can update their own notebooks" ON research_notebooks
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own notebooks" ON research_notebooks;
CREATE POLICY "Users can delete their own notebooks" ON research_notebooks
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for research_sources
DROP POLICY IF EXISTS "Users can view sources in their notebooks" ON research_sources;
CREATE POLICY "Users can view sources in their notebooks" ON research_sources
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert sources in their notebooks" ON research_sources;
CREATE POLICY "Users can insert sources in their notebooks" ON research_sources
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update sources in their notebooks" ON research_sources;
CREATE POLICY "Users can update sources in their notebooks" ON research_sources
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete sources in their notebooks" ON research_sources;
CREATE POLICY "Users can delete sources in their notebooks" ON research_sources
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for research_chat_messages
DROP POLICY IF EXISTS "Users can view messages in their notebooks" ON research_chat_messages;
CREATE POLICY "Users can view messages in their notebooks" ON research_chat_messages
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert messages in their notebooks" ON research_chat_messages;
CREATE POLICY "Users can insert messages in their notebooks" ON research_chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete messages in their notebooks" ON research_chat_messages;
CREATE POLICY "Users can delete messages in their notebooks" ON research_chat_messages
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for research_studio_outputs
DROP POLICY IF EXISTS "Users can view outputs in their notebooks" ON research_studio_outputs;
CREATE POLICY "Users can view outputs in their notebooks" ON research_studio_outputs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert outputs in their notebooks" ON research_studio_outputs;
CREATE POLICY "Users can insert outputs in their notebooks" ON research_studio_outputs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update outputs in their notebooks" ON research_studio_outputs;
CREATE POLICY "Users can update outputs in their notebooks" ON research_studio_outputs
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete outputs in their notebooks" ON research_studio_outputs;
CREATE POLICY "Users can delete outputs in their notebooks" ON research_studio_outputs
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for research_agentic_actions
DROP POLICY IF EXISTS "Users can view actions in their notebooks" ON research_agentic_actions;
CREATE POLICY "Users can view actions in their notebooks" ON research_agentic_actions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert actions in their notebooks" ON research_agentic_actions;
CREATE POLICY "Users can insert actions in their notebooks" ON research_agentic_actions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update actions in their notebooks" ON research_agentic_actions;
CREATE POLICY "Users can update actions in their notebooks" ON research_agentic_actions
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete actions in their notebooks" ON research_agentic_actions;
CREATE POLICY "Users can delete actions in their notebooks" ON research_agentic_actions
  FOR DELETE USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
DROP TRIGGER IF EXISTS update_research_notebooks_updated_at ON research_notebooks;
CREATE TRIGGER update_research_notebooks_updated_at
  BEFORE UPDATE ON research_notebooks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_research_sources_updated_at ON research_sources;
CREATE TRIGGER update_research_sources_updated_at
  BEFORE UPDATE ON research_sources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_research_studio_outputs_updated_at ON research_studio_outputs;
CREATE TRIGGER update_research_studio_outputs_updated_at
  BEFORE UPDATE ON research_studio_outputs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

