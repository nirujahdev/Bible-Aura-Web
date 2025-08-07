-- Fix Bookmarks and Favorites System Migration
-- Date: 2025-01-31
-- Purpose: Create separate, user-specific tables for bookmarks and favorites

-- ============================================================================
-- DROP CONFLICTING TABLES AND CONSTRAINTS
-- ============================================================================

-- Drop existing conflicting tables safely
DROP TABLE IF EXISTS public.user_bookmarks CASCADE;
DROP TABLE IF EXISTS public.verse_highlights CASCADE;

-- Remove conflicting constraints from main bookmarks table
ALTER TABLE public.bookmarks DROP CONSTRAINT IF EXISTS bookmarks_verse_id_fkey;
ALTER TABLE public.bookmarks DROP CONSTRAINT IF EXISTS bookmarks_user_id_verse_id_key;

-- ============================================================================
-- CREATE USER FAVORITES TABLE (SEPARATE FROM BOOKMARKS)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  verse_id TEXT NOT NULL, -- Format: "book-chapter-verse" (e.g., "Genesis-1-1")
  book_name TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  verse_number INTEGER NOT NULL,
  verse_text TEXT NOT NULL,
  verse_reference TEXT NOT NULL, -- Format: "Genesis 1:1"
  translation TEXT DEFAULT 'KJV',
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, verse_id)
);

-- ============================================================================
-- CREATE USER BOOKMARKS TABLE (SEPARATE FROM FAVORITES)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  verse_id TEXT NOT NULL, -- Format: "book-chapter-verse" (e.g., "Genesis-1-1")
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
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, verse_id)
);

-- ============================================================================
-- RESTRUCTURE MAIN BOOKMARKS TABLE FOR COMPATIBILITY
-- ============================================================================

-- Update main bookmarks table structure
ALTER TABLE public.bookmarks 
  ALTER COLUMN verse_id TYPE TEXT,
  ADD COLUMN IF NOT EXISTS book_name TEXT,
  ADD COLUMN IF NOT EXISTS chapter INTEGER,
  ADD COLUMN IF NOT EXISTS verse_number INTEGER,
  ADD COLUMN IF NOT EXISTS verse_text TEXT,
  ADD COLUMN IF NOT EXISTS verse_reference TEXT,
  ADD COLUMN IF NOT EXISTS translation TEXT DEFAULT 'KJV',
  ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_bookmark BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS highlight_color TEXT DEFAULT 'yellow';

-- ============================================================================
-- CREATE ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bookmarks ENABLE ROW LEVEL SECURITY;

-- User Favorites Policies
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can insert their own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can update their own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.user_favorites;

CREATE POLICY "Users can view their own favorites" 
  ON public.user_favorites FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites" 
  ON public.user_favorites FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own favorites" 
  ON public.user_favorites FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" 
  ON public.user_favorites FOR DELETE 
  USING (auth.uid() = user_id);

-- User Bookmarks Policies
DROP POLICY IF EXISTS "Users can view their own bookmarks" ON public.user_bookmarks;
DROP POLICY IF EXISTS "Users can insert their own bookmarks" ON public.user_bookmarks;
DROP POLICY IF EXISTS "Users can update their own bookmarks" ON public.user_bookmarks;
DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON public.user_bookmarks;

CREATE POLICY "Users can view their own bookmarks" 
  ON public.user_bookmarks FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookmarks" 
  ON public.user_bookmarks FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookmarks" 
  ON public.user_bookmarks FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks" 
  ON public.user_bookmarks FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================================================
-- CREATE PERFORMANCE INDEXES
-- ============================================================================

-- User Favorites Indexes
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_verse_id ON public.user_favorites(user_id, verse_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_book_chapter ON public.user_favorites(user_id, book_name, chapter);
CREATE INDEX IF NOT EXISTS idx_user_favorites_created_at ON public.user_favorites(user_id, created_at DESC);

-- User Bookmarks Indexes
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user_id ON public.user_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_verse_id ON public.user_bookmarks(user_id, verse_id);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_category ON public.user_bookmarks(user_id, category);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_created_at ON public.user_bookmarks(user_id, created_at DESC);

-- ============================================================================
-- CREATE UPDATE TIMESTAMP TRIGGERS
-- ============================================================================

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add update triggers
DROP TRIGGER IF EXISTS handle_user_favorites_updated_at ON public.user_favorites;
CREATE TRIGGER handle_user_favorites_updated_at
    BEFORE UPDATE ON public.user_favorites
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_user_bookmarks_updated_at ON public.user_bookmarks;
CREATE TRIGGER handle_user_bookmarks_updated_at
    BEFORE UPDATE ON public.user_bookmarks
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at(); 