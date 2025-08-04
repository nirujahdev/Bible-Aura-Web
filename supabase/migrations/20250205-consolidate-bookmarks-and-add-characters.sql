-- Comprehensive Backend Fix Migration
-- Date: 2025-02-05
-- Fix: Consolidate bookmarks, add Bible characters, ensure all backends work

-- ============================================================================
-- FIX 1: CONSOLIDATE BOOKMARK TABLES
-- ============================================================================

-- Drop conflicting bookmark tables (safe with IF EXISTS)
DROP TABLE IF EXISTS public.user_bookmarks CASCADE;
DROP TABLE IF EXISTS public.verse_highlights CASCADE;

-- Ensure main bookmarks table has all required columns
ALTER TABLE public.bookmarks 
ADD COLUMN IF NOT EXISTS book_name TEXT,
ADD COLUMN IF NOT EXISTS chapter INTEGER,
ADD COLUMN IF NOT EXISTS verse INTEGER,
ADD COLUMN IF NOT EXISTS verse_text TEXT,
ADD COLUMN IF NOT EXISTS verse_reference TEXT,
ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'bookmark',
ADD COLUMN IF NOT EXISTS highlight_color TEXT DEFAULT 'yellow';

-- Update RLS policies for consolidated bookmarks
DROP POLICY IF EXISTS "Users can manage their own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can manage their own bookmarks" ON public.bookmarks
    FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- FIX 2: ADD BIBLE CHARACTERS TABLE FOR STUDY HUB
-- ============================================================================

-- Create Bible characters table
CREATE TABLE IF NOT EXISTS public.bible_characters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    alt_names TEXT[],
    brief_description TEXT NOT NULL,
    detailed_biography TEXT,
    key_verses TEXT[],
    testament TEXT CHECK (testament IN ('Old', 'New', 'Both')),
    time_period TEXT,
    occupation_role TEXT,
    character_traits TEXT[],
    key_lessons TEXT[],
    modern_applications TEXT,
    cross_references TEXT[],
    difficulty_level TEXT DEFAULT 'intermediate' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    study_duration INTEGER DEFAULT 25,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create character study progress table
CREATE TABLE IF NOT EXISTS public.character_studies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    character_id UUID NOT NULL REFERENCES public.bible_characters(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    personal_notes TEXT,
    study_date DATE DEFAULT CURRENT_DATE,
    time_spent INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, character_id)
);

-- ============================================================================
-- FIX 3: ENSURE AI CONVERSATIONS TABLE EXISTS
-- ============================================================================

-- Create AI conversations table if not exists
CREATE TABLE IF NOT EXISTS public.ai_conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    messages JSONB NOT NULL DEFAULT '[]',
    mode TEXT DEFAULT 'chat',
    language TEXT DEFAULT 'english',
    translation TEXT DEFAULT 'KJV',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- FIX 4: ENSURE ALL READING PLAN TABLES EXIST
-- ============================================================================

-- Ensure reading plans work properly
CREATE TABLE IF NOT EXISTS public.reading_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    duration_days INTEGER NOT NULL,
    plan_data JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_reading_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.reading_plans(id),
    current_day INTEGER DEFAULT 1,
    completed_days INTEGER[] DEFAULT '{}',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_read_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, plan_id)
);

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Bookmark indexes
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_verse ON public.bookmarks(user_id, verse_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_favorites ON public.bookmarks(user_id, is_favorite) WHERE is_favorite = true;

-- Character indexes
CREATE INDEX IF NOT EXISTS idx_bible_characters_testament ON public.bible_characters(testament);
CREATE INDEX IF NOT EXISTS idx_bible_characters_difficulty ON public.bible_characters(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_bible_characters_tags ON public.bible_characters USING GIN(tags);

-- Character study indexes
CREATE INDEX IF NOT EXISTS idx_character_studies_user_id ON public.character_studies(user_id);
CREATE INDEX IF NOT EXISTS idx_character_studies_character_id ON public.character_studies(character_id);

-- AI conversation indexes
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON public.ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_created_at ON public.ai_conversations(created_at);

-- Reading plan indexes
CREATE INDEX IF NOT EXISTS idx_user_reading_progress_user_id ON public.user_reading_progress(user_id);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS for new tables
ALTER TABLE public.bible_characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.character_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reading_progress ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CREATE RLS POLICIES
-- ============================================================================

-- Bible characters (public read)
CREATE POLICY "Anyone can view bible characters" ON public.bible_characters
    FOR SELECT USING (true);

-- Character studies (user-specific)
CREATE POLICY "Users can manage their own character studies" ON public.character_studies
    FOR ALL USING (auth.uid() = user_id);

-- AI conversations (user-specific)
CREATE POLICY "Users can manage their own AI conversations" ON public.ai_conversations
    FOR ALL USING (auth.uid() = user_id);

-- Reading plans (public read, admin write)
CREATE POLICY "Anyone can view reading plans" ON public.reading_plans
    FOR SELECT USING (true);

-- User reading progress (user-specific)
CREATE POLICY "Users can manage their own reading progress" ON public.user_reading_progress
    FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- CREATE UPDATE TRIGGERS
-- ============================================================================

-- Update triggers for updated_at timestamps
CREATE TRIGGER update_bible_characters_updated_at 
    BEFORE UPDATE ON public.bible_characters 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_character_studies_updated_at 
    BEFORE UPDATE ON public.character_studies 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_ai_conversations_updated_at 
    BEFORE UPDATE ON public.ai_conversations 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ============================================================================
-- INSERT SAMPLE DATA
-- ============================================================================

-- Insert sample Bible characters
INSERT INTO public.bible_characters (
    name, brief_description, key_verses, testament, difficulty_level, tags
) VALUES 
(
    'David',
    'Shepherd boy who became Israel''s greatest king, known for his heart after God despite his failures.',
    ARRAY['1 Samuel 16:7', 'Psalm 51:10', '2 Samuel 7:8-16'],
    'Old',
    'intermediate',
    ARRAY['king', 'courage', 'repentance', 'leadership', 'worship']
),
(
    'Mary Magdalene',
    'Devoted follower of Jesus, first witness to His resurrection.',
    ARRAY['Luke 8:2', 'John 20:11-18', 'Matthew 28:1-10'],
    'New',
    'beginner',
    ARRAY['discipleship', 'resurrection', 'witness', 'devotion']
),
(
    'Paul (Saul)',
    'Apostle to the Gentiles, former persecutor turned passionate missionary.',
    ARRAY['Acts 9:1-19', 'Romans 1:16', '1 Corinthians 15:9-10'],
    'New',
    'advanced',
    ARRAY['apostle', 'missionary', 'transformation', 'persecution', 'grace']
),
(
    'Moses',
    'Prophet and lawgiver who led Israel out of Egypt to the Promised Land.',
    ARRAY['Exodus 3:1-15', 'Deuteronomy 34:10-12', 'Hebrews 11:24-28'],
    'Old',
    'intermediate',
    ARRAY['prophet', 'leader', 'law', 'exodus', 'faithfulness']
),
(
    'Esther',
    'Jewish queen who saved her people from destruction in Persia.',
    ARRAY['Esther 4:14', 'Esther 7:3-6', 'Esther 9:20-22'],
    'Old',
    'intermediate',
    ARRAY['queen', 'courage', 'providence', 'salvation', 'wisdom']
);

-- Insert sample reading plans
INSERT INTO public.reading_plans (name, description, duration_days, plan_data) VALUES
(
    'Bible in a Year',
    'Read through the entire Bible in 365 days with a structured plan.',
    365,
    '{"daily_readings": "Old Testament, New Testament, and Psalms each day", "schedule": "systematic"}'
),
(
    'New Testament in 90 Days',
    'Complete the New Testament in 3 months.',
    90,
    '{"daily_readings": "3-4 chapters per day", "focus": "New Testament only"}'
),
(
    'Psalms and Proverbs',
    'Read one Psalm and one chapter of Proverbs daily for spiritual growth.',
    31,
    '{"daily_readings": "1 Psalm + 1 Proverbs chapter", "focus": "wisdom literature"}'
);

-- ============================================================================
-- ADD DOCUMENTATION COMMENTS
-- ============================================================================

COMMENT ON TABLE public.bible_characters IS 'Biblical characters with study content and biographical information';
COMMENT ON TABLE public.character_studies IS 'User progress tracking for Bible character studies';
COMMENT ON TABLE public.ai_conversations IS 'AI chat conversations with Bible Aura assistant';
COMMENT ON TABLE public.reading_plans IS 'Structured Bible reading plans for users';
COMMENT ON TABLE public.user_reading_progress IS 'User progress tracking for reading plans'; 