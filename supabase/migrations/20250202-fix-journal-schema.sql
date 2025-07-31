-- Fix journal_entries table schema
-- Date: 2025-02-02

-- First, let's ensure the table has all the correct columns
DO $$
BEGIN
    -- Fix verse_references column type (should be text[], not UUID[])
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'journal_entries' 
        AND column_name = 'verse_references' 
        AND data_type = 'ARRAY' 
        AND udt_name = '_uuid'
    ) THEN
        ALTER TABLE journal_entries ALTER COLUMN verse_references TYPE text[] USING verse_references::text[];
    END IF;
    
    -- Add verse_reference column if it doesn't exist (for backward compatibility)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'journal_entries' 
        AND column_name = 'verse_reference'
    ) THEN
        ALTER TABLE journal_entries ADD COLUMN verse_reference TEXT;
    END IF;
    
    -- Add verse_text column if it doesn't exist (for backward compatibility)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'journal_entries' 
        AND column_name = 'verse_text'
    ) THEN
        ALTER TABLE journal_entries ADD COLUMN verse_text TEXT;
    END IF;
END $$;

-- Update the types table to reflect the correct schema
DO $$
BEGIN
    -- Regenerate types (this will be done by Supabase automatically)
    NOTIFY pgrst, 'reload schema';
END $$;

-- Clear any cached schema information
SELECT pg_notify('pgrst', 'reload schema');

-- Create or replace updated stats function to handle null values better
CREATE OR REPLACE FUNCTION update_journal_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate word count from content, handling null/empty content
    IF NEW.content IS NOT NULL AND trim(NEW.content) != '' THEN
        NEW.word_count = array_length(string_to_array(trim(NEW.content), ' '), 1);
    ELSE
        NEW.word_count = 0;
    END IF;
    
    -- Calculate reading time
    NEW.reading_time = calculate_reading_time(COALESCE(NEW.word_count, 0));
    
    -- Set updated_at
    NEW.updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
DROP TRIGGER IF EXISTS journal_entries_stats_trigger ON journal_entries;
CREATE TRIGGER journal_entries_stats_trigger
    BEFORE INSERT OR UPDATE ON journal_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_journal_stats();

-- Update any existing entries that might have null values
UPDATE journal_entries 
SET 
    word_count = COALESCE(
        CASE 
            WHEN content IS NOT NULL AND trim(content) != '' 
            THEN array_length(string_to_array(trim(content), ' '), 1)
            ELSE 0
        END, 
        0
    ),
    reading_time = COALESCE(
        CASE 
            WHEN content IS NOT NULL AND trim(content) != '' 
            THEN calculate_reading_time(array_length(string_to_array(trim(content), ' '), 1))
            ELSE 1
        END, 
        1
    ),
    entry_date = COALESCE(entry_date, created_at::date),
    category = COALESCE(category, 'personal'),
    language = COALESCE(language, 'english'),
    is_private = COALESCE(is_private, true),
    tags = COALESCE(tags, '{}'),
    verse_references = COALESCE(verse_references, '{}')
WHERE 
    word_count IS NULL 
    OR reading_time IS NULL 
    OR entry_date IS NULL 
    OR category IS NULL 
    OR language IS NULL 
    OR is_private IS NULL; 