-- Create daily_verses table for AI-powered daily Bible verse suggestions
CREATE TABLE IF NOT EXISTS daily_verses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    verse_text TEXT NOT NULL,
    verse_reference VARCHAR(100) NOT NULL,
    ai_context TEXT NOT NULL,
    daily_theme VARCHAR(100) NOT NULL,
    verse_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Ensure one verse per user per day
    UNIQUE(user_id, verse_date)
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS daily_verses_user_date_idx ON daily_verses(user_id, verse_date);
CREATE INDEX IF NOT EXISTS daily_verses_theme_idx ON daily_verses(daily_theme);
CREATE INDEX IF NOT EXISTS daily_verses_date_idx ON daily_verses(verse_date);

-- Enable Row Level Security (RLS)
ALTER TABLE daily_verses ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only access their own daily verses
CREATE POLICY "Users can view their own daily verses" ON daily_verses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily verses" ON daily_verses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily verses" ON daily_verses
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily verses" ON daily_verses
    FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON TABLE daily_verses TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated; 