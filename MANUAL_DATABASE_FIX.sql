-- ============================================================================
-- MANUAL DATABASE FIX FOR JOURNAL AND SERMON TABLES
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================================

-- First, let's check what tables exist
SELECT schemaname, tablename FROM pg_tables WHERE schemaname = 'public' AND (tablename = 'journal_entries' OR tablename = 'sermons');

-- ============================================================================
-- JOURNAL ENTRIES TABLE SETUP
-- ============================================================================

-- Create journal_entries table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.journal_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    content TEXT NOT NULL DEFAULT '',
    mood TEXT,
    spiritual_state TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to journal_entries (safe to run multiple times)
ALTER TABLE public.journal_entries 
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'english',
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'personal',
ADD COLUMN IF NOT EXISTS verse_reference TEXT,
ADD COLUMN IF NOT EXISTS verse_text TEXT,
ADD COLUMN IF NOT EXISTS verse_references TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS entry_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS word_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reading_time INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS template_used TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- ============================================================================
-- SERMONS TABLE SETUP
-- ============================================================================

-- Create sermons table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.sermons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    content TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to sermons (safe to run multiple times)
ALTER TABLE public.sermons 
ADD COLUMN IF NOT EXISTS scripture_reference TEXT,
ADD COLUMN IF NOT EXISTS scripture_references TEXT[],
ADD COLUMN IF NOT EXISTS main_points TEXT[],
ADD COLUMN IF NOT EXISTS congregation TEXT,
ADD COLUMN IF NOT EXISTS sermon_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS duration INTEGER,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS word_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS estimated_time INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS estimated_duration INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'english',
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general',
ADD COLUMN IF NOT EXISTS outline JSONB,
ADD COLUMN IF NOT EXISTS illustrations TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS applications TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS private_notes TEXT,
ADD COLUMN IF NOT EXISTS series_name TEXT,
ADD COLUMN IF NOT EXISTS template_type TEXT,
ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT false;

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
DROP TRIGGER IF EXISTS journal_entries_stats_trigger ON public.journal_entries;
CREATE TRIGGER journal_entries_stats_trigger
    BEFORE INSERT OR UPDATE ON public.journal_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_journal_stats();

-- Sermons trigger
DROP TRIGGER IF EXISTS sermons_stats_trigger ON public.sermons;
CREATE TRIGGER sermons_stats_trigger
    BEFORE INSERT OR UPDATE ON public.sermons
    FOR EACH ROW
    EXECUTE FUNCTION update_sermon_stats();

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Journal entries indexes
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON public.journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_entry_date ON public.journal_entries(entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON public.journal_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_language ON public.journal_entries(language);
CREATE INDEX IF NOT EXISTS idx_journal_entries_category ON public.journal_entries(category);
CREATE INDEX IF NOT EXISTS idx_journal_entries_tags ON public.journal_entries USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_journal_entries_is_pinned ON public.journal_entries(is_pinned) WHERE is_pinned = true;

-- Sermons indexes
CREATE INDEX IF NOT EXISTS idx_sermons_user_id ON public.sermons(user_id);
CREATE INDEX IF NOT EXISTS idx_sermons_created_at ON public.sermons(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sermons_updated_at ON public.sermons(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_sermons_sermon_date ON public.sermons(sermon_date DESC);
CREATE INDEX IF NOT EXISTS idx_sermons_is_draft ON public.sermons(is_draft);
CREATE INDEX IF NOT EXISTS idx_sermons_status ON public.sermons(status);
CREATE INDEX IF NOT EXISTS idx_sermons_language ON public.sermons(language);
CREATE INDEX IF NOT EXISTS idx_sermons_tags ON public.sermons USING GIN(tags);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sermons ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (ignore errors if they don't exist)
DROP POLICY IF EXISTS "Users can view their own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can insert their own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can update their own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can delete their own journal entries" ON public.journal_entries;

DROP POLICY IF EXISTS "Users can view their own sermons" ON public.sermons;
DROP POLICY IF EXISTS "Users can insert their own sermons" ON public.sermons;
DROP POLICY IF EXISTS "Users can update their own sermons" ON public.sermons;
DROP POLICY IF EXISTS "Users can delete their own sermons" ON public.sermons;

-- Create comprehensive RLS policies for journal_entries
CREATE POLICY "Users can view their own journal entries" ON public.journal_entries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own journal entries" ON public.journal_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journal entries" ON public.journal_entries
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journal entries" ON public.journal_entries
    FOR DELETE USING (auth.uid() = user_id);

-- Create comprehensive RLS policies for sermons
CREATE POLICY "Users can view their own sermons" ON public.sermons
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sermons" ON public.sermons
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sermons" ON public.sermons
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sermons" ON public.sermons
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- UPDATE EXISTING DATA
-- ============================================================================

-- Update journal entries with default values
UPDATE public.journal_entries 
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
UPDATE public.sermons 
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

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check that both tables exist and have the required columns
SELECT 
    'journal_entries' as table_name,
    count(*) as column_count
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'journal_entries'

UNION ALL

SELECT 
    'sermons' as table_name,
    count(*) as column_count
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'sermons';

-- Show the structure of both tables
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name IN ('journal_entries', 'sermons')
ORDER BY table_name, ordinal_position; 