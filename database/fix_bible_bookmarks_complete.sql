-- =====================================================
-- COMPREHENSIVE BIBLE BOOKMARKS & FAVORITES FIX
-- Date: 2025-01-XX
-- Purpose: Fix ALL bookmark/favorite issues for Bible verses
-- =====================================================

-- ============================================================================
-- STEP 1: CLEAN SLATE - Remove conflicting tables
-- ============================================================================

-- Drop Bible-specific bookmark tables (keep community user_bookmarks)
DROP TABLE IF EXISTS public.bible_bookmarks CASCADE;
DROP TABLE IF EXISTS public.bible_favorites CASCADE;
DROP TABLE IF EXISTS public.verse_bookmarks CASCADE;
DROP TABLE IF EXISTS public.verse_favorites CASCADE;
DROP TABLE IF EXISTS public.user_bible_bookmarks CASCADE;
DROP TABLE IF EXISTS public.user_bible_favorites CASCADE;

-- ============================================================================
-- STEP 2: CREATE BIBLE VERSE BOOKMARKS TABLE
-- ============================================================================

CREATE TABLE public.user_bible_bookmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    verse_id TEXT NOT NULL, -- Format: "Genesis-1-1"
    book_name TEXT NOT NULL,
    chapter INTEGER NOT NULL,
    verse_number INTEGER NOT NULL, -- This matches frontend expectation
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
-- STEP 3: CREATE BIBLE VERSE FAVORITES TABLE
-- ============================================================================

CREATE TABLE public.user_bible_favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    verse_id TEXT NOT NULL, -- Format: "Genesis-1-1"
    book_name TEXT NOT NULL,
    chapter INTEGER NOT NULL,
    verse_number INTEGER NOT NULL, -- This matches frontend expectation
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
-- STEP 4: CREATE UPDATED_AT TRIGGER FUNCTION
-- ============================================================================

-- Create or replace the updated_at function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================================================
-- STEP 5: ADD TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Add triggers for both tables
CREATE TRIGGER update_bible_bookmarks_updated_at
    BEFORE UPDATE ON public.user_bible_bookmarks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bible_favorites_updated_at
    BEFORE UPDATE ON public.user_bible_favorites
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STEP 6: CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Indexes for user_bible_bookmarks
CREATE INDEX idx_bible_bookmarks_user_id ON public.user_bible_bookmarks(user_id);
CREATE INDEX idx_bible_bookmarks_verse_id ON public.user_bible_bookmarks(verse_id);
CREATE INDEX idx_bible_bookmarks_user_verse ON public.user_bible_bookmarks(user_id, verse_id);
CREATE INDEX idx_bible_bookmarks_category ON public.user_bible_bookmarks(user_id, category);
CREATE INDEX idx_bible_bookmarks_created_at ON public.user_bible_bookmarks(user_id, created_at DESC);
CREATE INDEX idx_bible_bookmarks_book_chapter ON public.user_bible_bookmarks(book_name, chapter);

-- Indexes for user_bible_favorites
CREATE INDEX idx_bible_favorites_user_id ON public.user_bible_favorites(user_id);
CREATE INDEX idx_bible_favorites_verse_id ON public.user_bible_favorites(verse_id);
CREATE INDEX idx_bible_favorites_user_verse ON public.user_bible_favorites(user_id, verse_id);
CREATE INDEX idx_bible_favorites_created_at ON public.user_bible_favorites(user_id, created_at DESC);
CREATE INDEX idx_bible_favorites_book_chapter ON public.user_bible_favorites(book_name, chapter);

-- ============================================================================
-- STEP 7: ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on both tables
ALTER TABLE public.user_bible_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bible_favorites ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 8: CREATE RLS POLICIES
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "users_can_view_own_bible_bookmarks" ON public.user_bible_bookmarks;
DROP POLICY IF EXISTS "users_can_insert_own_bible_bookmarks" ON public.user_bible_bookmarks;
DROP POLICY IF EXISTS "users_can_update_own_bible_bookmarks" ON public.user_bible_bookmarks;
DROP POLICY IF EXISTS "users_can_delete_own_bible_bookmarks" ON public.user_bible_bookmarks;

DROP POLICY IF EXISTS "users_can_view_own_bible_favorites" ON public.user_bible_favorites;
DROP POLICY IF EXISTS "users_can_insert_own_bible_favorites" ON public.user_bible_favorites;
DROP POLICY IF EXISTS "users_can_update_own_bible_favorites" ON public.user_bible_favorites;
DROP POLICY IF EXISTS "users_can_delete_own_bible_favorites" ON public.user_bible_favorites;

-- Create policies for user_bible_bookmarks
CREATE POLICY "users_can_view_own_bible_bookmarks" ON public.user_bible_bookmarks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_can_insert_own_bible_bookmarks" ON public.user_bible_bookmarks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_update_own_bible_bookmarks" ON public.user_bible_bookmarks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "users_can_delete_own_bible_bookmarks" ON public.user_bible_bookmarks
    FOR DELETE USING (auth.uid() = user_id);

-- Create policies for user_bible_favorites
CREATE POLICY "users_can_view_own_bible_favorites" ON public.user_bible_favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_can_insert_own_bible_favorites" ON public.user_bible_favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_update_own_bible_favorites" ON public.user_bible_favorites
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "users_can_delete_own_bible_favorites" ON public.user_bible_favorites
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 9: GRANT PERMISSIONS
-- ============================================================================

-- Grant necessary permissions
GRANT ALL ON public.user_bible_bookmarks TO authenticated;
GRANT ALL ON public.user_bible_favorites TO authenticated;
GRANT ALL ON public.user_bible_bookmarks TO service_role;
GRANT ALL ON public.user_bible_favorites TO service_role;

-- ============================================================================
-- STEP 10: ADD TABLE COMMENTS
-- ============================================================================

COMMENT ON TABLE public.user_bible_bookmarks IS 'Bible verse bookmarks with categories and highlighting';
COMMENT ON TABLE public.user_bible_favorites IS 'Bible verse favorites for quick access';

-- ============================================================================
-- STEP 11: VERIFICATION
-- ============================================================================

-- Check if tables were created successfully
SELECT 
    'SUCCESS: Bible bookmarks system fixed' as status,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'user_bible_bookmarks') as bookmarks_table,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'user_bible_favorites') as favorites_table,
    (SELECT COUNT(*) FROM information_schema.table_privileges WHERE table_name IN ('user_bible_bookmarks', 'user_bible_favorites') AND grantee = 'authenticated') as permissions_count;

-- Show table structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('user_bible_bookmarks', 'user_bible_favorites')
ORDER BY table_name, ordinal_position;

-- Show policies
SELECT 
    tablename,
    policyname,
    permissive,
    cmd
FROM pg_policies 
WHERE tablename IN ('user_bible_bookmarks', 'user_bible_favorites')
ORDER BY tablename, policyname; 