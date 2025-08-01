-- Fix and ensure verse_highlights table schema consistency
-- Date: 2025-02-02

-- Ensure the verse_highlights table has all required columns
ALTER TABLE public.verse_highlights 
ADD COLUMN IF NOT EXISTS color TEXT DEFAULT 'yellow' CHECK (color IN ('yellow', 'green', 'blue', 'purple', 'pink', 'orange', 'red', 'gray'));

ALTER TABLE public.verse_highlights 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'favorite' CHECK (category IN ('favorite', 'prayer', 'study', 'memory', 'encouragement', 'wisdom', 'prophecy', 'promise'));

-- Ensure the is_favorite column exists
ALTER TABLE public.verse_highlights 
ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT FALSE;

-- Ensure proper unique constraint exists
DROP INDEX IF EXISTS verse_highlights_user_verse_unique;
CREATE UNIQUE INDEX IF NOT EXISTS verse_highlights_user_verse_unique ON public.verse_highlights(user_id, verse_id);

-- Update existing records to ensure consistency
UPDATE public.verse_highlights 
SET is_favorite = TRUE 
WHERE category = 'favorite' AND is_favorite IS NOT TRUE;

-- Add helpful indexes for better performance
CREATE INDEX IF NOT EXISTS verse_highlights_favorites_idx ON public.verse_highlights(user_id, is_favorite) WHERE is_favorite = TRUE;
CREATE INDEX IF NOT EXISTS verse_highlights_color_idx ON public.verse_highlights(user_id, color);
CREATE INDEX IF NOT EXISTS verse_highlights_category_idx ON public.verse_highlights(user_id, category);

-- Grant proper permissions
GRANT ALL ON TABLE public.verse_highlights TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated; 