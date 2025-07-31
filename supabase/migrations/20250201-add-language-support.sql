-- Add language support to journal entries
-- Migration: Add language column to journal_entries table for multi-language support

-- Add language column to journal_entries table
ALTER TABLE journal_entries 
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'english' CHECK (language IN ('english', 'tamil', 'sinhala'));

-- Create index for better performance when filtering by language
CREATE INDEX IF NOT EXISTS idx_journal_entries_language ON journal_entries(language);

-- Add comment to describe the column
COMMENT ON COLUMN journal_entries.language IS 'The language used for writing the journal entry (english, tamil, sinhala)';

-- Update existing entries to have default language
UPDATE journal_entries SET language = 'english' WHERE language IS NULL; 