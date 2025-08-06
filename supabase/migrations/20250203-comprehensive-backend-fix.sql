-- Comprehensive Backend Fix for Sermons and Journal Entries
-- Date: 2025-02-03
-- This migration ensures all backend functionality works properly

-- ============================================================================
-- SERMONS TABLE - COMPREHENSIVE FIX
-- ============================================================================

-- Ensure sermons table exists with core structure
CREATE TABLE IF NOT EXISTS sermons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    content TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add all required columns for sermons if they don't exist
DO $$
BEGIN
    -- Scripture fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'scripture_reference') THEN
        ALTER TABLE sermons ADD COLUMN scripture_reference TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'scripture_references') THEN
        ALTER TABLE sermons ADD COLUMN scripture_references TEXT[] DEFAULT '{}';
    END IF;
    
    -- Content organization
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'main_points') THEN
        ALTER TABLE sermons ADD COLUMN main_points TEXT[] DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'outline') THEN
        ALTER TABLE sermons ADD COLUMN outline JSONB;
    END IF;
    
    -- Sermon details
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'congregation') THEN
        ALTER TABLE sermons ADD COLUMN congregation TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'sermon_date') THEN
        ALTER TABLE sermons ADD COLUMN sermon_date DATE DEFAULT CURRENT_DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'duration') THEN
        ALTER TABLE sermons ADD COLUMN duration INTEGER;
    END IF;
    
    -- Notes and metadata
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'notes') THEN
        ALTER TABLE sermons ADD COLUMN notes TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'private_notes') THEN
        ALTER TABLE sermons ADD COLUMN private_notes TEXT;
    END IF;
    
    -- Organization
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'tags') THEN
        ALTER TABLE sermons ADD COLUMN tags TEXT[] DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'series_name') THEN
        ALTER TABLE sermons ADD COLUMN series_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'category') THEN
        ALTER TABLE sermons ADD COLUMN category TEXT DEFAULT 'general';
    END IF;
    
    -- Status and workflow
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'is_draft') THEN
        ALTER TABLE sermons ADD COLUMN is_draft BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'status') THEN
        ALTER TABLE sermons ADD COLUMN status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'delivered', 'archived'));
    END IF;
    
    -- Analytics
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'word_count') THEN
        ALTER TABLE sermons ADD COLUMN word_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'estimated_time') THEN
        ALTER TABLE sermons ADD COLUMN estimated_time INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'estimated_duration') THEN
        ALTER TABLE sermons ADD COLUMN estimated_duration INTEGER DEFAULT 0;
    END IF;
    
    -- Localization
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'language') THEN
        ALTER TABLE sermons ADD COLUMN language TEXT DEFAULT 'english' CHECK (language IN ('english', 'tamil', 'sinhala'));
    END IF;
    
    -- AI and templates
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'ai_generated') THEN
        ALTER TABLE sermons ADD COLUMN ai_generated BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'template_type') THEN
        ALTER TABLE sermons ADD COLUMN template_type TEXT;
    END IF;
    
    -- Content enhancement
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'illustrations') THEN
        ALTER TABLE sermons ADD COLUMN illustrations TEXT[] DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'applications') THEN
        ALTER TABLE sermons ADD COLUMN applications TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- ============================================================================
-- JOURNAL ENTRIES TABLE - COMPREHENSIVE FIX
-- ============================================================================

-- Ensure journal_entries table exists with core structure
CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    content TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add all required columns for journal entries if they don't exist
DO $$
BEGIN
    -- Personal reflection fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journal_entries' AND column_name = 'mood') THEN
        ALTER TABLE journal_entries ADD COLUMN mood TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journal_entries' AND column_name = 'spiritual_state') THEN
        ALTER TABLE journal_entries ADD COLUMN spiritual_state TEXT;
    END IF;
    
    -- Scripture integration
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journal_entries' AND column_name = 'verse_reference') THEN
        ALTER TABLE journal_entries ADD COLUMN verse_reference TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journal_entries' AND column_name = 'verse_text') THEN
        ALTER TABLE journal_entries ADD COLUMN verse_text TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journal_entries' AND column_name = 'verse_references') THEN
        ALTER TABLE journal_entries ADD COLUMN verse_references TEXT[] DEFAULT '{}';
    END IF;
    
    -- Organization
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journal_entries' AND column_name = 'tags') THEN
        ALTER TABLE journal_entries ADD COLUMN tags TEXT[] DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journal_entries' AND column_name = 'category') THEN
        ALTER TABLE journal_entries ADD COLUMN category TEXT DEFAULT 'personal';
    END IF;
    
    -- Privacy and sharing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journal_entries' AND column_name = 'is_private') THEN
        ALTER TABLE journal_entries ADD COLUMN is_private BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journal_entries' AND column_name = 'is_pinned') THEN
        ALTER TABLE journal_entries ADD COLUMN is_pinned BOOLEAN DEFAULT false;
    END IF;
    
    -- Temporal
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journal_entries' AND column_name = 'entry_date') THEN
        ALTER TABLE journal_entries ADD COLUMN entry_date DATE DEFAULT CURRENT_DATE;
    END IF;
    
    -- Analytics
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journal_entries' AND column_name = 'word_count') THEN
        ALTER TABLE journal_entries ADD COLUMN word_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journal_entries' AND column_name = 'reading_time') THEN
        ALTER TABLE journal_entries ADD COLUMN reading_time INTEGER DEFAULT 0;
    END IF;
    
    -- Localization
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journal_entries' AND column_name = 'language') THEN
        ALTER TABLE journal_entries ADD COLUMN language TEXT DEFAULT 'english' CHECK (language IN ('english', 'tamil', 'sinhala'));
    END IF;
    
    -- Enhanced metadata for daily devotion features
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journal_entries' AND column_name = 'metadata') THEN
        ALTER TABLE journal_entries ADD COLUMN metadata JSONB DEFAULT '{}';
    END IF;
    
    -- Templates
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journal_entries' AND column_name = 'template_used') THEN
        ALTER TABLE journal_entries ADD COLUMN template_used TEXT;
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

-- Function to calculate sermon delivery time
CREATE OR REPLACE FUNCTION calculate_sermon_time(word_count integer)
RETURNS integer AS $$
BEGIN
    -- Assuming 150 words per minute for sermon delivery
    RETURN GREATEST(1, CEIL(word_count::float / 150));
END;
$$ LANGUAGE plpgsql;

-- Enhanced journal stats function
CREATE OR REPLACE FUNCTION update_journal_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate word count from content
    IF NEW.content IS NOT NULL AND trim(NEW.content) != '' THEN
        NEW.word_count = array_length(string_to_array(regexp_replace(trim(NEW.content), '[^\w\s]', '', 'g'), ' '), 1);
        NEW.word_count = COALESCE(NEW.word_count, 0);
    ELSE
        NEW.word_count = 0;
    END IF;
    
    -- Calculate reading time
    NEW.reading_time = calculate_reading_time(NEW.word_count);
    
    -- Set updated_at
    NEW.updated_at = NOW();
    
    -- Ensure entry_date is set
    IF NEW.entry_date IS NULL THEN
        NEW.entry_date = CURRENT_DATE;
    END IF;
    
    -- Initialize metadata if null
    IF NEW.metadata IS NULL THEN
        NEW.metadata = '{}';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Enhanced sermon stats function
CREATE OR REPLACE FUNCTION update_sermon_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate word count from content
    IF NEW.content IS NOT NULL AND trim(NEW.content) != '' THEN
        NEW.word_count = array_length(string_to_array(regexp_replace(trim(NEW.content), '[^\w\s]', '', 'g'), ' '), 1);
        NEW.word_count = COALESCE(NEW.word_count, 0);
    ELSE
        NEW.word_count = 0;
    END IF;
    
    -- Calculate estimated time
    NEW.estimated_time = calculate_sermon_time(NEW.word_count);
    NEW.estimated_duration = NEW.estimated_time;
    
    -- Set updated_at
    NEW.updated_at = NOW();
    
    -- Ensure sermon_date is set
    IF NEW.sermon_date IS NULL THEN
        NEW.sermon_date = CURRENT_DATE;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Drop existing triggers
DROP TRIGGER IF EXISTS journal_entries_stats_trigger ON journal_entries;
DROP TRIGGER IF EXISTS sermons_stats_trigger ON sermons;

-- Create enhanced triggers
CREATE TRIGGER journal_entries_stats_trigger
    BEFORE INSERT OR UPDATE ON journal_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_journal_stats();

CREATE TRIGGER sermons_stats_trigger
    BEFORE INSERT OR UPDATE ON sermons
    FOR EACH ROW
    EXECUTE FUNCTION update_sermon_stats();

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Sermons indexes
CREATE INDEX IF NOT EXISTS idx_sermons_user_id ON sermons(user_id);
CREATE INDEX IF NOT EXISTS idx_sermons_sermon_date ON sermons(sermon_date);
CREATE INDEX IF NOT EXISTS idx_sermons_status ON sermons(status);
CREATE INDEX IF NOT EXISTS idx_sermons_is_draft ON sermons(is_draft);
CREATE INDEX IF NOT EXISTS idx_sermons_language ON sermons(language);
CREATE INDEX IF NOT EXISTS idx_sermons_category ON sermons(category);
CREATE INDEX IF NOT EXISTS idx_sermons_series_name ON sermons(series_name);
CREATE INDEX IF NOT EXISTS idx_sermons_updated_at ON sermons(updated_at);

-- Journal entries indexes
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_entry_date ON journal_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_journal_entries_category ON journal_entries(category);
CREATE INDEX IF NOT EXISTS idx_journal_entries_language ON journal_entries(language);
CREATE INDEX IF NOT EXISTS idx_journal_entries_is_pinned ON journal_entries(is_pinned);
CREATE INDEX IF NOT EXISTS idx_journal_entries_updated_at ON journal_entries(updated_at);

-- GIN indexes for arrays and JSON
CREATE INDEX IF NOT EXISTS idx_sermons_tags ON sermons USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_journal_entries_tags ON journal_entries USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_journal_entries_metadata ON journal_entries USING GIN(metadata);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE sermons ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own sermons" ON sermons;
DROP POLICY IF EXISTS "Users can insert their own sermons" ON sermons;
DROP POLICY IF EXISTS "Users can update their own sermons" ON sermons;
DROP POLICY IF EXISTS "Users can delete their own sermons" ON sermons;

DROP POLICY IF EXISTS "Users can view their own journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can insert their own journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can update their own journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can delete their own journal entries" ON journal_entries;

-- Create comprehensive RLS policies for sermons
CREATE POLICY "Users can view their own sermons" ON sermons
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sermons" ON sermons
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sermons" ON sermons
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sermons" ON sermons
    FOR DELETE USING (auth.uid() = user_id);

-- Create comprehensive RLS policies for journal entries
CREATE POLICY "Users can view their own journal entries" ON journal_entries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own journal entries" ON journal_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journal entries" ON journal_entries
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journal entries" ON journal_entries
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- CLEANUP AND OPTIMIZATION
-- ============================================================================

-- Update any existing records to ensure data consistency
UPDATE sermons SET 
    tags = COALESCE(tags, '{}'),
    scripture_references = COALESCE(scripture_references, '{}'),
    main_points = COALESCE(main_points, '{}'),
    illustrations = COALESCE(illustrations, '{}'),
    applications = COALESCE(applications, '{}'),
    language = COALESCE(language, 'english'),
    category = COALESCE(category, 'general'),
    is_draft = COALESCE(is_draft, true),
    status = COALESCE(status, 'draft'),
    ai_generated = COALESCE(ai_generated, false),
    word_count = COALESCE(word_count, 0),
    estimated_time = COALESCE(estimated_time, 0),
    estimated_duration = COALESCE(estimated_duration, 0)
WHERE user_id IS NOT NULL;

UPDATE journal_entries SET 
    tags = COALESCE(tags, '{}'),
    verse_references = COALESCE(verse_references, '{}'),
    language = COALESCE(language, 'english'),
    category = COALESCE(category, 'personal'),
    is_private = COALESCE(is_private, true),
    is_pinned = COALESCE(is_pinned, false),
    metadata = COALESCE(metadata, '{}'),
    word_count = COALESCE(word_count, 0),
    reading_time = COALESCE(reading_time, 0),
    entry_date = COALESCE(entry_date, created_at::date)
WHERE user_id IS NOT NULL;

-- Analyze tables for better query planning
ANALYZE sermons;
ANALYZE journal_entries; 