-- ========================================
-- FIX VERSE_HIGHLIGHTS TABLE - ADD MISSING COLUMNS
-- ========================================
-- This script fixes the verse_highlights table by:
-- 1. Adding the 'color' column if it doesn't exist
-- 2. Ensuring all required columns are present
-- ========================================

BEGIN;

-- Check if verse_highlights table exists, if not create it
CREATE TABLE IF NOT EXISTS public.verse_highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  verse_id TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'yellow',
  category TEXT DEFAULT 'highlight',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, verse_id)
);

-- Add color column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'verse_highlights' 
    AND column_name = 'color'
  ) THEN
    ALTER TABLE public.verse_highlights ADD COLUMN color TEXT NOT NULL DEFAULT 'yellow';
  END IF;
END $$;

-- Add category column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'verse_highlights' 
    AND column_name = 'category'
  ) THEN
    ALTER TABLE public.verse_highlights ADD COLUMN category TEXT DEFAULT 'highlight';
  END IF;
END $$;

-- Add updated_at column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'verse_highlights' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.verse_highlights ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Ensure unique constraint exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'verse_highlights_user_id_verse_id_key'
  ) THEN
    ALTER TABLE public.verse_highlights 
    ADD CONSTRAINT verse_highlights_user_id_verse_id_key UNIQUE (user_id, verse_id);
  END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_verse_highlights_user_id ON public.verse_highlights(user_id);
CREATE INDEX IF NOT EXISTS idx_verse_highlights_verse_id ON public.verse_highlights(verse_id);
CREATE INDEX IF NOT EXISTS idx_verse_highlights_color ON public.verse_highlights(color);

-- Enable RLS if not already enabled
ALTER TABLE public.verse_highlights ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to recreate them)
DROP POLICY IF EXISTS "Users can view own highlights" ON public.verse_highlights;
DROP POLICY IF EXISTS "Users can insert own highlights" ON public.verse_highlights;
DROP POLICY IF EXISTS "Users can update own highlights" ON public.verse_highlights;
DROP POLICY IF EXISTS "Users can delete own highlights" ON public.verse_highlights;

-- Create RLS policies
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

-- Create or replace trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_verse_highlights_updated_at ON public.verse_highlights;
CREATE TRIGGER update_verse_highlights_updated_at
  BEFORE UPDATE ON public.verse_highlights
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMIT;

-- ========================================
-- ✅ FIX COMPLETE!
-- ========================================
-- The verse_highlights table now has:
-- ✅ color column (TEXT, default 'yellow')
-- ✅ category column (TEXT, default 'highlight')
-- ✅ updated_at column (TIMESTAMPTZ)
-- ✅ Unique constraint on (user_id, verse_id)
-- ✅ RLS policies enabled
-- ✅ Indexes for performance
-- ========================================

