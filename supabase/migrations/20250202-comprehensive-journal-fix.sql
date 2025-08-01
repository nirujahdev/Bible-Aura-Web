-- Comprehensive Journal Schema Fix
-- Date: 2025-02-02
-- Fixes all database issues for journal_entries table to match Journal.tsx requirements

-- Ensure all required columns exist with correct types
DO $$
BEGIN
    -- Add language column if missing (with proper constraint)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'journal_entries' 
        AND column_name = 'language'
    ) THEN
        ALTER TABLE journal_entries ADD COLUMN language TEXT DEFAULT 'english' CHECK (language IN ('english', 'tamil', 'sinhala'));
    END IF;
    
    -- Add category column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'journal_entries' 
        AND column_name = 'category'
    ) THEN
        ALTER TABLE journal_entries ADD COLUMN category TEXT DEFAULT 'personal';
    END IF;
    
    -- Add verse_reference column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'journal_entries' 
        AND column_name = 'verse_reference'
    ) THEN
        ALTER TABLE journal_entries ADD COLUMN verse_reference TEXT;
    END IF;
    
    -- Add verse_text column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'journal_entries' 
        AND column_name = 'verse_text'
    ) THEN
        ALTER TABLE journal_entries ADD COLUMN verse_text TEXT;
    END IF;
    
    -- Add tags column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'journal_entries' 
        AND column_name = 'tags'
    ) THEN
        ALTER TABLE journal_entries ADD COLUMN tags TEXT[] DEFAULT '{}';
    END IF;
    
    -- Add is_private column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'journal_entries' 
        AND column_name = 'is_private'
    ) THEN
        ALTER TABLE journal_entries ADD COLUMN is_private BOOLEAN DEFAULT true;
    END IF;
    
    -- Add entry_date column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'journal_entries' 
        AND column_name = 'entry_date'
    ) THEN
        ALTER TABLE journal_entries ADD COLUMN entry_date DATE DEFAULT CURRENT_DATE;
    END IF;
    
    -- Add word_count column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'journal_entries' 
        AND column_name = 'word_count'
    ) THEN
        ALTER TABLE journal_entries ADD COLUMN word_count INTEGER DEFAULT 0;
    END IF;
    
    -- Add reading_time column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'journal_entries' 
        AND column_name = 'reading_time'
    ) THEN
        ALTER TABLE journal_entries ADD COLUMN reading_time INTEGER DEFAULT 1;
    END IF;
    
    -- Add is_pinned column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'journal_entries' 
        AND column_name = 'is_pinned'
    ) THEN
        ALTER TABLE journal_entries ADD COLUMN is_pinned BOOLEAN DEFAULT false;
    END IF;
    
    -- Add template_used column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'journal_entries' 
        AND column_name = 'template_used'
    ) THEN
        ALTER TABLE journal_entries ADD COLUMN template_used TEXT;
    END IF;
    
    -- Add metadata column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'journal_entries' 
        AND column_name = 'metadata'
    ) THEN
        ALTER TABLE journal_entries ADD COLUMN metadata JSONB;
    END IF;
    
    -- Fix verse_references column type if it's UUID[] instead of TEXT[]
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'journal_entries' 
        AND column_name = 'verse_references' 
        AND data_type = 'ARRAY' 
        AND udt_name = '_uuid'
    ) THEN
        ALTER TABLE journal_entries ALTER COLUMN verse_references TYPE TEXT[] USING verse_references::TEXT[];
    END IF;
    
    -- Ensure verse_references exists as TEXT[] if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'journal_entries' 
        AND column_name = 'verse_references'
    ) THEN
        ALTER TABLE journal_entries ADD COLUMN verse_references TEXT[] DEFAULT '{}';
    END IF;
    
END $$;

-- Update existing entries with default values where needed
UPDATE journal_entries 
SET 
    language = COALESCE(language, 'english'),
    category = COALESCE(category, 'personal'),
    tags = COALESCE(tags, '{}'),
    is_private = COALESCE(is_private, true),
    entry_date = COALESCE(entry_date, created_at::date),
    word_count = COALESCE(word_count, 0),
    reading_time = COALESCE(reading_time, 1),
    is_pinned = COALESCE(is_pinned, false),
    verse_references = COALESCE(verse_references, '{}')
WHERE 
    language IS NULL 
    OR category IS NULL 
    OR tags IS NULL 
    OR is_private IS NULL 
    OR entry_date IS NULL 
    OR word_count IS NULL 
    OR reading_time IS NULL 
    OR is_pinned IS NULL 
    OR verse_references IS NULL;

-- Create or update the stats calculation function
CREATE OR REPLACE FUNCTION update_journal_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate word count from content, handling null/empty content
    IF NEW.content IS NOT NULL AND trim(NEW.content) != '' THEN
        NEW.word_count = array_length(string_to_array(trim(NEW.content), ' '), 1);
        NEW.word_count = COALESCE(NEW.word_count, 0);
    ELSE
        NEW.word_count = 0;
    END IF;
    
    -- Calculate reading time based on word count (assuming 200 words per minute)
    NEW.reading_time = GREATEST(1, CEIL(NEW.word_count::float / 200));
    
    -- Ensure updated_at is set
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

-- Create helpful indexes for better performance
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_entry_date ON journal_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_journal_entries_language ON journal_entries(language);
CREATE INDEX IF NOT EXISTS idx_journal_entries_category ON journal_entries(category);
CREATE INDEX IF NOT EXISTS idx_journal_entries_is_pinned ON journal_entries(is_pinned) WHERE is_pinned = true;
CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON journal_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_tags ON journal_entries USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_date ON journal_entries(user_id, entry_date DESC);

-- Ensure RLS is enabled
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Update RLS policies to be comprehensive
DROP POLICY IF EXISTS "Users can view their own journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can insert their own journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can update their own journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can delete their own journal entries" ON journal_entries;

-- Create comprehensive RLS policies
CREATE POLICY "Users can view their own journal entries" ON journal_entries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own journal entries" ON journal_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journal entries" ON journal_entries
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journal entries" ON journal_entries
    FOR DELETE USING (auth.uid() = user_id);

-- Update existing entries with calculated stats
UPDATE journal_entries 
SET updated_at = updated_at  -- This will trigger the stats calculation function
WHERE word_count = 0 OR reading_time <= 0;

-- Add helpful comments to columns
COMMENT ON COLUMN journal_entries.language IS 'Language of the journal entry (english, tamil, sinhala)';
COMMENT ON COLUMN journal_entries.category IS 'Category of the journal entry for organization';
COMMENT ON COLUMN journal_entries.verse_reference IS 'Single Bible verse reference (backward compatibility)';
COMMENT ON COLUMN journal_entries.verse_text IS 'Text of the referenced Bible verse';
COMMENT ON COLUMN journal_entries.verse_references IS 'Array of Bible verse references';
COMMENT ON COLUMN journal_entries.tags IS 'Tags for categorizing and searching entries';
COMMENT ON COLUMN journal_entries.is_private IS 'Whether the entry is private to the user';
COMMENT ON COLUMN journal_entries.entry_date IS 'Date when the journal entry was written';
COMMENT ON COLUMN journal_entries.word_count IS 'Number of words in the entry content';
COMMENT ON COLUMN journal_entries.reading_time IS 'Estimated reading time in minutes';
COMMENT ON COLUMN journal_entries.is_pinned IS 'Whether the entry is pinned for quick access';
COMMENT ON COLUMN journal_entries.template_used IS 'Template used to create this entry';
COMMENT ON COLUMN journal_entries.metadata IS 'Additional metadata stored as JSON';

-- Notify PostgREST to reload schema
SELECT pg_notify('pgrst', 'reload schema'); 