-- Create verse_highlights table for user-specific verse highlighting and favorites
CREATE TABLE IF NOT EXISTS verse_highlights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  verse_id TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'yellow' CHECK (color IN ('yellow', 'green', 'blue', 'purple', 'pink', 'orange', 'red', 'gray')),
  category TEXT NOT NULL DEFAULT 'study' CHECK (category IN ('favorite', 'prayer', 'study', 'memory', 'encouragement', 'wisdom', 'prophecy', 'promise')),
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS verse_highlights_user_id_idx ON verse_highlights(user_id);
CREATE INDEX IF NOT EXISTS verse_highlights_user_verse_idx ON verse_highlights(user_id, verse_id);
CREATE INDEX IF NOT EXISTS verse_highlights_favorites_idx ON verse_highlights(user_id, is_favorite) WHERE is_favorite = TRUE;
CREATE INDEX IF NOT EXISTS verse_highlights_color_idx ON verse_highlights(user_id, color);
CREATE INDEX IF NOT EXISTS verse_highlights_category_idx ON verse_highlights(user_id, category);

-- Create unique constraint to prevent duplicate highlights for same verse by same user
CREATE UNIQUE INDEX IF NOT EXISTS verse_highlights_user_verse_unique ON verse_highlights(user_id, verse_id);

-- Enable Row Level Security
ALTER TABLE verse_highlights ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user data isolation
CREATE POLICY "Users can view their own verse highlights" ON verse_highlights
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own verse highlights" ON verse_highlights
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own verse highlights" ON verse_highlights
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own verse highlights" ON verse_highlights
  FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions to authenticated users
GRANT ALL ON TABLE verse_highlights TO authenticated;

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_verse_highlights_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_verse_highlights_updated_at
  BEFORE UPDATE ON verse_highlights
  FOR EACH ROW
  EXECUTE FUNCTION update_verse_highlights_updated_at(); 