-- COMPLETE BIBLE FEATURES FIX v2
-- Date: 2025-02-05
-- Fix: Separate Favorites & Bookmarks, Remove Highlights, Show Full Verses

-- ============================================================================
-- 1. DROP EXISTING TABLES AND START FRESH
-- ============================================================================

-- Drop all existing tables to ensure clean structure
DROP TABLE IF EXISTS public.user_favorites CASCADE;
DROP TABLE IF EXISTS public.user_bookmarks CASCADE;
DROP TABLE IF EXISTS public.verse_highlights CASCADE;
DROP TABLE IF EXISTS public.bookmarks CASCADE;

-- ============================================================================
-- 2. CREATE SEPARATE FAVORITES TABLE
-- ============================================================================

CREATE TABLE public.user_favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    verse_id TEXT NOT NULL, -- Format: "Genesis-1-1"
    book_name TEXT NOT NULL,
    chapter INTEGER NOT NULL,
    verse_number INTEGER NOT NULL,
    verse_text TEXT NOT NULL,
    verse_reference TEXT NOT NULL, -- Format: "Genesis 1:1"
    translation TEXT DEFAULT 'KJV',
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, verse_id)
);

-- ============================================================================
-- 3. CREATE SEPARATE BOOKMARKS TABLE
-- ============================================================================

CREATE TABLE public.user_bookmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    verse_id TEXT NOT NULL, -- Format: "Genesis-1-1"
    book_name TEXT NOT NULL,
    chapter INTEGER NOT NULL,
    verse_number INTEGER NOT NULL,
    verse_text TEXT NOT NULL,
    verse_reference TEXT NOT NULL, -- Format: "Genesis 1:1"
    translation TEXT DEFAULT 'KJV',
    category TEXT DEFAULT 'study' CHECK (category IN ('study', 'prayer', 'inspiration', 'memorization')),
    highlight_color TEXT DEFAULT 'yellow' CHECK (highlight_color IN ('yellow', 'green', 'blue', 'purple', 'red', 'orange')),
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, verse_id)
);

-- ============================================================================
-- 4. ENSURE JOURNAL ENTRIES TABLE EXISTS
-- ============================================================================

-- Drop and recreate journal_entries table to ensure all fields exist
DROP TABLE IF EXISTS public.journal_entries CASCADE;

CREATE TABLE public.journal_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    content TEXT NOT NULL DEFAULT '',
    mood TEXT,
    spiritual_state TEXT,
    verse_reference TEXT,
    verse_text TEXT,
    verse_references TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    is_private BOOLEAN DEFAULT TRUE,
    language TEXT DEFAULT 'english',
    category TEXT DEFAULT 'personal',
    word_count INTEGER DEFAULT 0,
    reading_time INTEGER DEFAULT 1,
    metadata JSONB DEFAULT '{}',
    is_pinned BOOLEAN DEFAULT FALSE,
    template_used TEXT,
    entry_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 5. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Favorites indexes
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_verse_id ON public.user_favorites(verse_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_created_at ON public.user_favorites(created_at DESC);

-- Bookmarks indexes
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user_id ON public.user_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_verse_id ON public.user_bookmarks(verse_id);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_category ON public.user_bookmarks(category);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_created_at ON public.user_bookmarks(created_at DESC);

-- Journal entries indexes
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON public.journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_entry_date ON public.journal_entries(entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_category ON public.journal_entries(category);
CREATE INDEX IF NOT EXISTS idx_journal_entries_updated_at ON public.journal_entries(updated_at DESC);

-- ============================================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- Favorites policies
CREATE POLICY "Users can view own favorites" ON public.user_favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON public.user_favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own favorites" ON public.user_favorites
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON public.user_favorites
    FOR DELETE USING (auth.uid() = user_id);

-- Bookmarks policies
CREATE POLICY "Users can view own bookmarks" ON public.user_bookmarks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks" ON public.user_bookmarks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookmarks" ON public.user_bookmarks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks" ON public.user_bookmarks
    FOR DELETE USING (auth.uid() = user_id);

-- Journal entries policies
CREATE POLICY "Users can view own journal entries" ON public.journal_entries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journal entries" ON public.journal_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal entries" ON public.journal_entries
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own journal entries" ON public.journal_entries
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- 7. TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Create or replace updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Favorites trigger
CREATE TRIGGER update_user_favorites_updated_at
    BEFORE UPDATE ON public.user_favorites
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Bookmarks trigger
CREATE TRIGGER update_user_bookmarks_updated_at
    BEFORE UPDATE ON public.user_bookmarks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Journal entries trigger
CREATE TRIGGER update_journal_entries_updated_at
    BEFORE UPDATE ON public.journal_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 8. GRANT PERMISSIONS
-- ============================================================================

-- Grant necessary permissions
GRANT ALL ON public.user_favorites TO authenticated;
GRANT ALL ON public.user_favorites TO service_role;

GRANT ALL ON public.user_bookmarks TO authenticated;
GRANT ALL ON public.user_bookmarks TO service_role;

GRANT ALL ON public.journal_entries TO authenticated;
GRANT ALL ON public.journal_entries TO service_role;

-- ============================================================================
-- 9. COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE public.user_favorites IS 'Stores user favorite Bible verses - completely separate from bookmarks';
COMMENT ON TABLE public.user_bookmarks IS 'Stores user bookmarked Bible verses with categorization and highlighting';
COMMENT ON TABLE public.journal_entries IS 'Stores user journal entries with all necessary fields for Bible study';

-- ============================================================================
-- 10. TEST QUERIES (UNCOMMENT TO RUN)
-- ============================================================================

-- Verify table structure
-- SELECT table_name, column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name IN ('user_favorites', 'user_bookmarks', 'journal_entries')
-- ORDER BY table_name, ordinal_position; 