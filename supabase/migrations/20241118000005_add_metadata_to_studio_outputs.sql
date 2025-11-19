-- Migration: Add metadata column to research_studio_outputs
-- This column stores agent-specific metadata (status, format, language, etc.)

-- Add metadata column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'research_studio_outputs' 
    AND column_name = 'metadata'
  ) THEN
    ALTER TABLE research_studio_outputs 
      ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    
    -- Add comment for documentation
    COMMENT ON COLUMN research_studio_outputs.metadata IS 'Stores agent-specific metadata like status, format, language, agentType, etc.';
  END IF;
END $$;

