-- 🚨 NUCLEAR RESET - Complete Clean Slate for Bookmarks & Favorites
-- ⚠️  WARNING: This will DELETE ALL existing bookmarks and favorites data!
-- Copy and paste this ENTIRE script in Supabase SQL Editor

-- ============================================================================
-- STEP 1: NUCLEAR CLEANUP - Delete EVERYTHING related to bookmarks/favorites
-- ============================================================================

-- Drop ALL possible table variations that might exist
DROP TABLE IF EXISTS public.bookmarks CASCADE;
DROP TABLE IF EXISTS public.user_bookmarks CASCADE;
DROP TABLE IF EXISTS public.user_favorites CASCADE;
DROP TABLE IF EXISTS public.verse_highlights CASCADE;
DROP TABLE IF EXISTS public.highlights CASCADE;
DROP TABLE IF EXISTS public.favorites CASCADE;
DROP TABLE IF EXISTS public.bible_bookmarks CASCADE;
DROP TABLE IF EXISTS public.bible_favorites CASCADE;
DROP TABLE IF EXISTS public.verse_bookmarks CASCADE;
DROP TABLE IF EXISTS public.verse_favorites CASCADE;

-- Drop any existing functions that might conflict
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- ============================================================================
-- STEP 2: CREATE FRESH FAVORITES TABLE
-- ============================================================================

CREATE TABLE public.user_favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    verse_id TEXT NOT NULL,
    book_name TEXT NOT NULL,
    chapter INTEGER NOT NULL,
    verse_number INTEGER NOT NULL,
    verse_text TEXT NOT NULL,
    verse_reference TEXT NOT NULL,
    translation TEXT DEFAULT 'KJV',
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, verse_id)
);

-- ============================================================================
-- STEP 3: CREATE FRESH BOOKMARKS TABLE  
-- ============================================================================

CREATE TABLE public.user_bookmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    verse_id TEXT NOT NULL,
    book_name TEXT NOT NULL,
    chapter INTEGER NOT NULL,
    verse_number INTEGER NOT NULL,
    verse_text TEXT NOT NULL,
    verse_reference TEXT NOT NULL,
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
-- STEP 4: RECREATE UPDATED_AT TRIGGER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================================================
-- STEP 5: CREATE TRIGGERS FOR AUTO-UPDATE TIMESTAMPS
-- ============================================================================

CREATE TRIGGER update_user_favorites_updated_at
    BEFORE UPDATE ON public.user_favorites
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_bookmarks_updated_at
    BEFORE UPDATE ON public.user_bookmarks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STEP 6: CREATE PERFORMANCE INDEXES
-- ============================================================================

-- Favorites indexes
CREATE INDEX idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX idx_user_favorites_verse_id ON public.user_favorites(verse_id);
CREATE INDEX idx_user_favorites_created_at ON public.user_favorites(created_at DESC);
CREATE INDEX idx_user_favorites_book_chapter ON public.user_favorites(book_name, chapter);

-- Bookmarks indexes  
CREATE INDEX idx_user_bookmarks_user_id ON public.user_bookmarks(user_id);
CREATE INDEX idx_user_bookmarks_verse_id ON public.user_bookmarks(verse_id);
CREATE INDEX idx_user_bookmarks_created_at ON public.user_bookmarks(created_at DESC);
CREATE INDEX idx_user_bookmarks_category ON public.user_bookmarks(category);
CREATE INDEX idx_user_bookmarks_book_chapter ON public.user_bookmarks(book_name, chapter);

-- ============================================================================
-- STEP 7: ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bookmarks ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 8: CREATE RLS POLICIES (Security)
-- ============================================================================

-- Drop any existing policies first
DROP POLICY IF EXISTS "users_favorites_policy" ON public.user_favorites;
DROP POLICY IF EXISTS "users_bookmarks_policy" ON public.user_bookmarks;
DROP POLICY IF EXISTS "Users can view own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can insert own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can update own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can view own bookmarks" ON public.user_bookmarks;
DROP POLICY IF EXISTS "Users can insert own bookmarks" ON public.user_bookmarks;
DROP POLICY IF EXISTS "Users can update own bookmarks" ON public.user_bookmarks;
DROP POLICY IF EXISTS "Users can delete own bookmarks" ON public.user_bookmarks;

-- Create comprehensive RLS policies for favorites
CREATE POLICY "users_can_view_own_favorites" ON public.user_favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_can_insert_own_favorites" ON public.user_favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_update_own_favorites" ON public.user_favorites
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "users_can_delete_own_favorites" ON public.user_favorites
    FOR DELETE USING (auth.uid() = user_id);

-- Create comprehensive RLS policies for bookmarks
CREATE POLICY "users_can_view_own_bookmarks" ON public.user_bookmarks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_can_insert_own_bookmarks" ON public.user_bookmarks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_update_own_bookmarks" ON public.user_bookmarks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "users_can_delete_own_bookmarks" ON public.user_bookmarks
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 9: GRANT PERMISSIONS
-- ============================================================================

-- Grant all permissions to authenticated users
GRANT ALL ON public.user_favorites TO authenticated;
GRANT ALL ON public.user_favorites TO service_role;
GRANT ALL ON public.user_bookmarks TO authenticated;
GRANT ALL ON public.user_bookmarks TO service_role;

-- Grant sequence permissions if needed
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- ============================================================================
-- STEP 10: ADD TABLE COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE public.user_favorites IS 'Clean favorites table - stores user favorite Bible verses';
COMMENT ON TABLE public.user_bookmarks IS 'Clean bookmarks table - stores user bookmarked Bible verses with categories';

-- ============================================================================
-- STEP 11: VERIFICATION QUERIES
-- ============================================================================

-- Verify tables were created successfully
SELECT 
    'SUCCESS: user_favorites table created' as status,
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'user_favorites' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 
    'SUCCESS: user_bookmarks table created' as status,
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'user_bookmarks' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verify RLS policies
SELECT 
    'RLS Policies Created' as status,
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename IN ('user_favorites', 'user_bookmarks')
ORDER BY tablename, policyname;

-- Test basic functionality (optional - uncomment to test)
-- SELECT auth.uid() as your_user_id;

-- Final success message
SELECT '🎉 NUCLEAR RESET COMPLETE! Both tables recreated successfully.' as final_status; 