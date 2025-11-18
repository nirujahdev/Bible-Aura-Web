-- Migration: Update research_studio_outputs for 6 AI Agents
-- Adds new output types and unique constraint

-- 1. Drop the old CHECK constraint
ALTER TABLE research_studio_outputs 
  DROP CONSTRAINT IF EXISTS research_studio_outputs_output_type_check;

-- 2. Add new CHECK constraint with all output types (old + new agents)
ALTER TABLE research_studio_outputs 
  ADD CONSTRAINT research_studio_outputs_output_type_check 
  CHECK (output_type IN (
    -- Original types
    'summary', 
    'audio_overview', 
    'mind_map', 
    'flashcards', 
    'quiz', 
    'report', 
    'study_guide', 
    'sermon', 
    'timeline', 
    'glossary',
    -- New AI Agent types
    'summarization',
    'theology_qa',
    'cross_references',
    'curriculum',
    'doctrinal_harmony'
  ));

-- 3. Add unique constraint on (notebook_id, output_type) to allow upserts
-- This ensures one output per type per notebook
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'unique_notebook_output_type'
  ) THEN
    ALTER TABLE research_studio_outputs 
      ADD CONSTRAINT unique_notebook_output_type 
      UNIQUE (notebook_id, output_type);
  END IF;
END $$;

-- 4. Add index for faster lookups by output_type (if not exists)
CREATE INDEX IF NOT EXISTS idx_research_studio_outputs_notebook_type 
  ON research_studio_outputs(notebook_id, output_type);

