-- Final comprehensive fix for journal_entries and sermons tables
-- Date: 2025-02-02
-- This migration ensures both tables have all required columns and proper RLS policies

-- ============================================================================
-- JOURNAL ENTRIES TABLE FIX
-- ============================================================================

-- First, ensure the journal_entries table exists
CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    content TEXT NOT NULL,
    mood TEXT,
    spiritual_state TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add all required columns for journal_entries
DO $$
BEGIN
    -- Add language column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journal_entries' AND column_name = 'language') THEN
        ALTER TABLE journal_entries ADD COLUMN language TEXT DEFAULT 'english' CHECK (language IN ('english', 'tamil', 'sinhala'));
    END IF;
    
    -- Add category column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journal_entries' AND column_name = 'category') THEN
        ALTER TABLE journal_entries ADD COLUMN category TEXT DEFAULT 'personal';
    END IF;
    
    -- Add verse_reference column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journal_entries' AND column_name = 'verse_reference') THEN
        ALTER TABLE journal_entries ADD COLUMN verse_reference TEXT;
    END IF;
    
    -- Add verse_text column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journal_entries' AND column_name = 'verse_text') THEN
        ALTER TABLE journal_entries ADD COLUMN verse_text TEXT;
    END IF;
    
    -- Add verse_references column as TEXT array
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journal_entries' AND column_name = 'verse_references') THEN
        ALTER TABLE journal_entries ADD COLUMN verse_references TEXT[] DEFAULT '{}';
    ELSE
        -- Fix type if it's UUID array
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journal_entries' AND column_name = 'verse_references' AND udt_name = '_uuid') THEN
            ALTER TABLE journal_entries ALTER COLUMN verse_references TYPE TEXT[] USING verse_references::TEXT[];
        END IF;
    END IF;
    
    -- Add tags column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journal_entries' AND column_name = 'tags') THEN
        ALTER TABLE journal_entries ADD COLUMN tags TEXT[] DEFAULT '{}';
    END IF;
    
    -- Add is_private column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journal_entries' AND column_name = 'is_private') THEN
        ALTER TABLE journal_entries ADD COLUMN is_private BOOLEAN DEFAULT true;
    END IF;
    
    -- Add entry_date column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journal_entries' AND column_name = 'entry_date') THEN
        ALTER TABLE journal_entries ADD COLUMN entry_date DATE DEFAULT CURRENT_DATE;
    END IF;
    
    -- Add word_count column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journal_entries' AND column_name = 'word_count') THEN
        ALTER TABLE journal_entries ADD COLUMN word_count INTEGER DEFAULT 0;
    END IF;
    
    -- Add reading_time column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journal_entries' AND column_name = 'reading_time') THEN
        ALTER TABLE journal_entries ADD COLUMN reading_time INTEGER DEFAULT 1;
    END IF;
    
    -- Add is_pinned column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journal_entries' AND column_name = 'is_pinned') THEN
        ALTER TABLE journal_entries ADD COLUMN is_pinned BOOLEAN DEFAULT false;
    END IF;
    
    -- Add template_used column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journal_entries' AND column_name = 'template_used') THEN
        ALTER TABLE journal_entries ADD COLUMN template_used TEXT;
    END IF;
    
    -- Add metadata column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journal_entries' AND column_name = 'metadata') THEN
        ALTER TABLE journal_entries ADD COLUMN metadata JSONB;
    END IF;
END $$;

-- ============================================================================
-- SERMONS TABLE FIX
-- ============================================================================

-- Ensure the sermons table exists with all required columns
CREATE TABLE IF NOT EXISTS sermons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    content TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add all required columns for sermons
DO $$
BEGIN
    -- Add scripture_reference column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'scripture_reference') THEN
        ALTER TABLE sermons ADD COLUMN scripture_reference TEXT;
    END IF;
    
    -- Add scripture_references column as TEXT array
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'scripture_references') THEN
        ALTER TABLE sermons ADD COLUMN scripture_references TEXT[];
    ELSE
        -- Fix type if it's UUID array
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'scripture_references' AND udt_name = '_uuid') THEN
            ALTER TABLE sermons ALTER COLUMN scripture_references TYPE TEXT[] USING scripture_references::TEXT[];
        END IF;
    END IF;
    
    -- Add main_points column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'main_points') THEN
        ALTER TABLE sermons ADD COLUMN main_points TEXT[];
    END IF;
    
    -- Add congregation column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'congregation') THEN
        ALTER TABLE sermons ADD COLUMN congregation TEXT;
    END IF;
    
    -- Add sermon_date column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'sermon_date') THEN
        ALTER TABLE sermons ADD COLUMN sermon_date DATE DEFAULT CURRENT_DATE;
    END IF;
    
    -- Add duration column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'duration') THEN
        ALTER TABLE sermons ADD COLUMN duration INTEGER;
    END IF;
    
    -- Add notes column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'notes') THEN
        ALTER TABLE sermons ADD COLUMN notes TEXT;
    END IF;
    
    -- Add tags column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'tags') THEN
        ALTER TABLE sermons ADD COLUMN tags TEXT[] DEFAULT '{}';
    END IF;
    
    -- Add is_draft column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'is_draft') THEN
        ALTER TABLE sermons ADD COLUMN is_draft BOOLEAN DEFAULT true;
    END IF;
    
    -- Add status column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'status') THEN
        ALTER TABLE sermons ADD COLUMN status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'delivered', 'archived'));
    END IF;
    
    -- Add word_count column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'word_count') THEN
        ALTER TABLE sermons ADD COLUMN word_count INTEGER DEFAULT 0;
    END IF;
    
    -- Add estimated_time column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'estimated_time') THEN
        ALTER TABLE sermons ADD COLUMN estimated_time INTEGER DEFAULT 0;
    END IF;
    
    -- Add estimated_duration column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'estimated_duration') THEN
        ALTER TABLE sermons ADD COLUMN estimated_duration INTEGER DEFAULT 0;
    END IF;
    
    -- Add language column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'language') THEN
        ALTER TABLE sermons ADD COLUMN language TEXT DEFAULT 'english' CHECK (language IN ('english', 'tamil', 'sinhala'));
    END IF;
    
    -- Add category column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'category') THEN
        ALTER TABLE sermons ADD COLUMN category TEXT DEFAULT 'general';
    END IF;
    
    -- Add outline column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'outline') THEN
        ALTER TABLE sermons ADD COLUMN outline JSONB;
    END IF;
    
    -- Add illustrations column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'illustrations') THEN
        ALTER TABLE sermons ADD COLUMN illustrations TEXT[] DEFAULT '{}';
    END IF;
    
    -- Add applications column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'applications') THEN
        ALTER TABLE sermons ADD COLUMN applications TEXT[] DEFAULT '{}';
    END IF;
    
    -- Add private_notes column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'private_notes') THEN
        ALTER TABLE sermons ADD COLUMN private_notes TEXT;
    END IF;
    
    -- Add series_name column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'series_name') THEN
        ALTER TABLE sermons ADD COLUMN series_name TEXT;
    END IF;
    
    -- Add template_type column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'template_type') THEN
        ALTER TABLE sermons ADD COLUMN template_type TEXT;
    END IF;
    
    -- Add ai_generated column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'ai_generated') THEN
        ALTER TABLE sermons ADD COLUMN ai_generated BOOLEAN DEFAULT false;
    END IF;
END $$;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to calculate reading time
CREATE OR REPLACE FUNCTION calculate_reading_time(word_count integer)
RETURNS integer AS $$
BEGIN
    RETURN GREATEST(1, CEIL(word_count::float / 200));
END;
$$ LANGUAGE plpgsql;

-- Function to update journal stats
CREATE OR REPLACE FUNCTION update_journal_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate word count from content
    IF NEW.content IS NOT NULL AND trim(NEW.content) != '' THEN
        NEW.word_count = array_length(string_to_array(trim(NEW.content), ' '), 1);
        NEW.word_count = COALESCE(NEW.word_count, 0);
    ELSE
        NEW.word_count = 0;
    END IF;
    
    -- Calculate reading time
    NEW.reading_time = calculate_reading_time(NEW.word_count);
    
    -- Set updated_at
    NEW.updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update sermon stats
CREATE OR REPLACE FUNCTION update_sermon_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate word count from content
    IF NEW.content IS NOT NULL AND trim(NEW.content) != '' THEN
        NEW.word_count = array_length(string_to_array(trim(NEW.content), ' '), 1);
        NEW.word_count = COALESCE(NEW.word_count, 0);
    ELSE
        NEW.word_count = 0;
    END IF;
    
    -- Calculate estimated time (assuming 150 words per minute for sermon delivery)
    NEW.estimated_time = GREATEST(1, CEIL(NEW.word_count::float / 150));
    NEW.estimated_duration = NEW.estimated_time;
    
    -- Set updated_at
    NEW.updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Journal entries trigger
DROP TRIGGER IF EXISTS journal_entries_stats_trigger ON journal_entries;
CREATE TRIGGER journal_entries_stats_trigger
    BEFORE INSERT OR UPDATE ON journal_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_journal_stats();

-- Sermons trigger
DROP TRIGGER IF EXISTS sermons_stats_trigger ON sermons;
CREATE TRIGGER sermons_stats_trigger
    BEFORE INSERT OR UPDATE ON sermons
    FOR EACH ROW
    EXECUTE FUNCTION update_sermon_stats();

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Journal entries indexes
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_entry_date ON journal_entries(entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON journal_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_language ON journal_entries(language);
CREATE INDEX IF NOT EXISTS idx_journal_entries_category ON journal_entries(category);
CREATE INDEX IF NOT EXISTS idx_journal_entries_tags ON journal_entries USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_journal_entries_is_pinned ON journal_entries(is_pinned) WHERE is_pinned = true;

-- Sermons indexes
CREATE INDEX IF NOT EXISTS idx_sermons_user_id ON sermons(user_id);
CREATE INDEX IF NOT EXISTS idx_sermons_created_at ON sermons(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sermons_updated_at ON sermons(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_sermons_sermon_date ON sermons(sermon_date DESC);
CREATE INDEX IF NOT EXISTS idx_sermons_is_draft ON sermons(is_draft);
CREATE INDEX IF NOT EXISTS idx_sermons_status ON sermons(status);
CREATE INDEX IF NOT EXISTS idx_sermons_language ON sermons(language);
CREATE INDEX IF NOT EXISTS idx_sermons_tags ON sermons USING GIN(tags);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE sermons ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can insert their own journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can update their own journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can delete their own journal entries" ON journal_entries;

DROP POLICY IF EXISTS "Users can view their own sermons" ON sermons;
DROP POLICY IF EXISTS "Users can insert their own sermons" ON sermons;
DROP POLICY IF EXISTS "Users can update their own sermons" ON sermons;
DROP POLICY IF EXISTS "Users can delete their own sermons" ON sermons;

-- Create comprehensive RLS policies for journal_entries
CREATE POLICY "Users can view their own journal entries" ON journal_entries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own journal entries" ON journal_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journal entries" ON journal_entries
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journal entries" ON journal_entries
    FOR DELETE USING (auth.uid() = user_id);

-- Create comprehensive RLS policies for sermons
CREATE POLICY "Users can view their own sermons" ON sermons
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sermons" ON sermons
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sermons" ON sermons
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sermons" ON sermons
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- UPDATE EXISTING DATA
-- ============================================================================

-- Update journal entries with default values
UPDATE journal_entries 
SET 
    language = COALESCE(language, 'english'),
    category = COALESCE(category, 'personal'),
    tags = COALESCE(tags, '{}'),
    verse_references = COALESCE(verse_references, '{}'),
    is_private = COALESCE(is_private, true),
    entry_date = COALESCE(entry_date, created_at::date),
    word_count = COALESCE(word_count, 0),
    reading_time = COALESCE(reading_time, 1),
    is_pinned = COALESCE(is_pinned, false)
WHERE 
    language IS NULL 
    OR category IS NULL 
    OR tags IS NULL 
    OR verse_references IS NULL
    OR is_private IS NULL 
    OR entry_date IS NULL 
    OR word_count IS NULL 
    OR reading_time IS NULL 
    OR is_pinned IS NULL;

-- Update sermons with default values
UPDATE sermons 
SET 
    language = COALESCE(language, 'english'),
    category = COALESCE(category, 'general'),
    tags = COALESCE(tags, '{}'),
    is_draft = COALESCE(is_draft, true),
    status = COALESCE(status, 'draft'),
    word_count = COALESCE(word_count, 0),
    estimated_time = COALESCE(estimated_time, 0),
    estimated_duration = COALESCE(estimated_duration, 0),
    ai_generated = COALESCE(ai_generated, false),
    illustrations = COALESCE(illustrations, '{}'),
    applications = COALESCE(applications, '{}')
WHERE 
    language IS NULL 
    OR category IS NULL 
    OR tags IS NULL 
    OR is_draft IS NULL 
    OR status IS NULL 
    OR word_count IS NULL 
    OR estimated_time IS NULL 
    OR estimated_duration IS NULL 
    OR ai_generated IS NULL
    OR illustrations IS NULL
    OR applications IS NULL;

-- Refresh the schema
SELECT pg_notify('pgrst', 'reload schema'); 