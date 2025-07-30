-- Migration for enhanced Bible and Journal features
-- Date: 2025-01-29

-- Create reading_progress table
CREATE TABLE IF NOT EXISTS public.reading_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    progress_percentage DECIMAL(5,2) DEFAULT 0.0,
    last_read_book TEXT,
    last_read_chapter INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique index on user_id for reading_progress
CREATE UNIQUE INDEX IF NOT EXISTS reading_progress_user_id_idx ON public.reading_progress(user_id);

-- Add RLS policies for reading_progress
ALTER TABLE public.reading_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own reading progress" ON public.reading_progress
    FOR ALL USING (auth.uid() = user_id);

-- Add metadata column to journal_entries if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journal_entries' AND column_name = 'metadata') THEN
        ALTER TABLE public.journal_entries ADD COLUMN metadata JSONB;
    END IF;
END $$;

-- Add is_pinned column to journal_entries if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journal_entries' AND column_name = 'is_pinned') THEN
        ALTER TABLE public.journal_entries ADD COLUMN is_pinned BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Add template_used column to journal_entries if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journal_entries' AND column_name = 'template_used') THEN
        ALTER TABLE public.journal_entries ADD COLUMN template_used TEXT;
    END IF;
END $$;

-- Create reading_plans table for structured Bible reading
CREATE TABLE IF NOT EXISTS public.reading_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    plan_id TEXT NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    current_day INTEGER DEFAULT 1,
    completed_days INTEGER[] DEFAULT '{}',
    last_read_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for reading_plans
ALTER TABLE public.reading_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own reading plans" ON public.reading_plans
    FOR ALL USING (auth.uid() = user_id);

-- Create daily_verses table for verse of the day feature
CREATE TABLE IF NOT EXISTS public.daily_verses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    verse_date DATE UNIQUE NOT NULL,
    book_name TEXT NOT NULL,
    chapter INTEGER NOT NULL,
    verse INTEGER NOT NULL,
    verse_text TEXT NOT NULL,
    verse_reference TEXT NOT NULL,
    language TEXT DEFAULT 'english',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policy for daily_verses (public read access)
ALTER TABLE public.daily_verses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read daily verses" ON public.daily_verses
    FOR SELECT USING (true);

-- Create user_bookmarks table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_bookmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    verse_id TEXT NOT NULL,
    book_name TEXT NOT NULL,
    chapter INTEGER NOT NULL,
    verse INTEGER NOT NULL,
    verse_text TEXT NOT NULL,
    verse_reference TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for user_bookmarks
ALTER TABLE public.user_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own bookmarks" ON public.user_bookmarks
    FOR ALL USING (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS reading_progress_updated_at_idx ON public.reading_progress(updated_at);
CREATE INDEX IF NOT EXISTS reading_plans_user_plan_idx ON public.reading_plans(user_id, plan_id);
CREATE INDEX IF NOT EXISTS daily_verses_date_idx ON public.daily_verses(verse_date);
CREATE INDEX IF NOT EXISTS user_bookmarks_user_id_idx ON public.user_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS journal_entries_metadata_idx ON public.journal_entries USING GIN(metadata);
CREATE INDEX IF NOT EXISTS journal_entries_pinned_idx ON public.journal_entries(is_pinned) WHERE is_pinned = true;

-- Insert some sample daily verses
INSERT INTO public.daily_verses (verse_date, book_name, chapter, verse, verse_text, verse_reference, language) 
VALUES 
    (CURRENT_DATE, 'John', 3, 16, 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.', 'John 3:16', 'english'),
    (CURRENT_DATE + INTERVAL '1 day', 'Psalms', 23, 1, 'The Lord is my shepherd; I shall not want.', 'Psalms 23:1', 'english'),
    (CURRENT_DATE + INTERVAL '2 days', 'Proverbs', 3, 5, 'Trust in the Lord with all thine heart; and lean not unto thine own understanding.', 'Proverbs 3:5', 'english')
ON CONFLICT (verse_date) DO NOTHING; 