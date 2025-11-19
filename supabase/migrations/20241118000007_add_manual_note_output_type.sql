-- Add 'manual_note' to output_type CHECK constraint
-- This allows users to create manual notes (non-AI generated)

-- Drop existing constraint
ALTER TABLE research_studio_outputs
  DROP CONSTRAINT IF EXISTS research_studio_outputs_output_type_check;

-- Add new constraint with manual_note
ALTER TABLE research_studio_outputs
  ADD CONSTRAINT research_studio_outputs_output_type_check 
  CHECK (output_type IN (
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
    'summarization',
    'theology_qa',
    'cross_references',
    'curriculum',
    'doctrinal_harmony',
    'manual_note'
  ));

