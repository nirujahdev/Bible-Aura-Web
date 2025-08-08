-- SIMPLE FIX - Run this if the main migration didn't work
-- Copy and paste this entire code block in Supabase SQL Editor

-- Clean slate
DROP TABLE IF EXISTS user_favorites CASCADE;
DROP TABLE IF EXISTS user_bookmarks CASCADE;

-- Create user_favorites table (simple version)
CREATE TABLE user_favorites (
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

-- Create user_bookmarks table (simple version) 
CREATE TABLE user_bookmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    verse_id TEXT NOT NULL,
    book_name TEXT NOT NULL,
    chapter INTEGER NOT NULL,
    verse_number INTEGER NOT NULL,
    verse_text TEXT NOT NULL,
    verse_reference TEXT NOT NULL,
    translation TEXT DEFAULT 'KJV',
    category TEXT DEFAULT 'study',
    highlight_color TEXT DEFAULT 'yellow',
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, verse_id)
);

-- Enable RLS
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bookmarks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "users_favorites_policy" ON user_favorites FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_bookmarks_policy" ON user_bookmarks FOR ALL USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON user_favorites TO authenticated;
GRANT ALL ON user_bookmarks TO authenticated;

-- Test the tables
SELECT 'user_favorites created' as status;
SELECT 'user_bookmarks created' as status; 