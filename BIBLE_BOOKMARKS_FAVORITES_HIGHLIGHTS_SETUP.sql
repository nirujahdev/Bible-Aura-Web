-- ========================================
-- BIBLE AURA - BOOKMARKS, FAVORITES & HIGHLIGHTS SETUP
-- ========================================
-- This script creates the tables for:
-- 1. user_bible_favorites - User's favorite Bible verses
-- 2. user_bible_bookmarks - User's bookmarked verses with categories
-- 3. verse_highlights - User's highlighted verses with colors
-- ========================================

BEGIN;

-- ========================================
-- 1. USER BIBLE FAVORITES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.user_bible_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: one favorite per verse per user
  UNIQUE(user_id, verse_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_bible_favorites_user_id ON public.user_bible_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bible_favorites_verse_id ON public.user_bible_favorites(verse_id);
CREATE INDEX IF NOT EXISTS idx_user_bible_favorites_created_at ON public.user_bible_favorites(created_at DESC);

-- ========================================
-- 2. USER BIBLE BOOKMARKS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.user_bible_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  verse_id TEXT NOT NULL,
  book_name TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  verse_number INTEGER NOT NULL,
  verse_text TEXT NOT NULL,
  verse_reference TEXT NOT NULL,
  translation TEXT DEFAULT 'KJV',
  category TEXT NOT NULL DEFAULT 'study' CHECK (category IN ('study', 'prayer', 'inspiration', 'memorization')),
  highlight_color TEXT NOT NULL DEFAULT 'yellow' CHECK (highlight_color IN ('yellow', 'green', 'blue', 'purple', 'red', 'orange')),
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: one bookmark per verse per user
  UNIQUE(user_id, verse_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_user_bible_bookmarks_user_id ON public.user_bible_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bible_bookmarks_verse_id ON public.user_bible_bookmarks(verse_id);
CREATE INDEX IF NOT EXISTS idx_user_bible_bookmarks_category ON public.user_bible_bookmarks(category);
CREATE INDEX IF NOT EXISTS idx_user_bible_bookmarks_created_at ON public.user_bible_bookmarks(created_at DESC);

-- ========================================
-- 3. VERSE HIGHLIGHTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.verse_highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  verse_id TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'yellow' CHECK (color IN ('yellow', 'green', 'blue', 'purple', 'pink', 'red', 'orange')),
  category TEXT DEFAULT 'highlight',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: one highlight per verse per user
  UNIQUE(user_id, verse_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_verse_highlights_user_id ON public.verse_highlights(user_id);
CREATE INDEX IF NOT EXISTS idx_verse_highlights_verse_id ON public.verse_highlights(verse_id);
CREATE INDEX IF NOT EXISTS idx_verse_highlights_color ON public.verse_highlights(color);

-- ========================================
-- 4. ENABLE ROW LEVEL SECURITY (RLS)
-- ========================================
ALTER TABLE public.user_bible_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bible_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verse_highlights ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 5. RLS POLICIES FOR USER_BIBLE_FAVORITES
-- ========================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own favorites" ON public.user_bible_favorites;
DROP POLICY IF EXISTS "Users can insert own favorites" ON public.user_bible_favorites;
DROP POLICY IF EXISTS "Users can update own favorites" ON public.user_bible_favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON public.user_bible_favorites;

-- Create policies
CREATE POLICY "Users can view own favorites"
  ON public.user_bible_favorites
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON public.user_bible_favorites
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own favorites"
  ON public.user_bible_favorites
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON public.user_bible_favorites
  FOR DELETE
  USING (auth.uid() = user_id);

-- ========================================
-- 6. RLS POLICIES FOR USER_BIBLE_BOOKMARKS
-- ========================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own bookmarks" ON public.user_bible_bookmarks;
DROP POLICY IF EXISTS "Users can insert own bookmarks" ON public.user_bible_bookmarks;
DROP POLICY IF EXISTS "Users can update own bookmarks" ON public.user_bible_bookmarks;
DROP POLICY IF EXISTS "Users can delete own bookmarks" ON public.user_bible_bookmarks;

-- Create policies
CREATE POLICY "Users can view own bookmarks"
  ON public.user_bible_bookmarks
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks"
  ON public.user_bible_bookmarks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookmarks"
  ON public.user_bible_bookmarks
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks"
  ON public.user_bible_bookmarks
  FOR DELETE
  USING (auth.uid() = user_id);

-- ========================================
-- 7. RLS POLICIES FOR VERSE_HIGHLIGHTS
-- ========================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own highlights" ON public.verse_highlights;
DROP POLICY IF EXISTS "Users can insert own highlights" ON public.verse_highlights;
DROP POLICY IF EXISTS "Users can update own highlights" ON public.verse_highlights;
DROP POLICY IF EXISTS "Users can delete own highlights" ON public.verse_highlights;

-- Create policies
CREATE POLICY "Users can view own highlights"
  ON public.verse_highlights
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own highlights"
  ON public.verse_highlights
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own highlights"
  ON public.verse_highlights
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own highlights"
  ON public.verse_highlights
  FOR DELETE
  USING (auth.uid() = user_id);

-- ========================================
-- 8. TRIGGERS FOR UPDATED_AT TIMESTAMP
-- ========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_user_bible_favorites_updated_at ON public.user_bible_favorites;
CREATE TRIGGER update_user_bible_favorites_updated_at
  BEFORE UPDATE ON public.user_bible_favorites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_bible_bookmarks_updated_at ON public.user_bible_bookmarks;
CREATE TRIGGER update_user_bible_bookmarks_updated_at
  BEFORE UPDATE ON public.user_bible_bookmarks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_verse_highlights_updated_at ON public.verse_highlights;
CREATE TRIGGER update_verse_highlights_updated_at
  BEFORE UPDATE ON public.verse_highlights
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMIT;

-- ========================================
-- ✅ SETUP COMPLETE!
-- ========================================
-- 
-- Tables created:
-- ✅ user_bible_favorites
-- ✅ user_bible_bookmarks
-- ✅ verse_highlights
--
-- Security:
-- ✅ RLS enabled on all tables
-- ✅ Policies created for user access control
--
-- Performance:
-- ✅ Indexes created for fast queries
-- ✅ Unique constraints for data integrity
--
-- Automation:
-- ✅ Triggers for auto-updating updated_at timestamps
--
-- ========================================

