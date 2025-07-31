-- Create sermons table for sermon writing feature
-- Migration: Add sermons table for storing user sermons

-- Create sermons table
CREATE TABLE IF NOT EXISTS sermons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    content TEXT NOT NULL DEFAULT '',
    scripture_reference TEXT,
    main_points TEXT[], -- Array of main sermon points
    congregation TEXT,
    sermon_date DATE DEFAULT CURRENT_DATE,
    duration INTEGER, -- Duration in minutes
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    is_draft BOOLEAN DEFAULT true,
    word_count INTEGER DEFAULT 0,
    estimated_time INTEGER DEFAULT 0, -- Estimated reading time in minutes
    language TEXT DEFAULT 'english' CHECK (language IN ('english', 'tamil', 'sinhala')),
    category TEXT DEFAULT 'general',
    outline TEXT,
    illustrations TEXT[] DEFAULT '{}', -- Array of illustrations
    applications TEXT[] DEFAULT '{}', -- Array of practical applications
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_sermons_user_id ON sermons(user_id);
CREATE INDEX IF NOT EXISTS idx_sermons_sermon_date ON sermons(sermon_date);
CREATE INDEX IF NOT EXISTS idx_sermons_is_draft ON sermons(is_draft);
CREATE INDEX IF NOT EXISTS idx_sermons_language ON sermons(language);

-- Enable Row Level Security
ALTER TABLE sermons ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own sermons" ON sermons
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sermons" ON sermons
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sermons" ON sermons
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sermons" ON sermons
    FOR DELETE USING (auth.uid() = user_id);

-- Add comments
COMMENT ON TABLE sermons IS 'Table for storing user sermons and sermon content';
COMMENT ON COLUMN sermons.duration IS 'Estimated sermon duration in minutes';
COMMENT ON COLUMN sermons.estimated_time IS 'Estimated reading time in minutes';
COMMENT ON COLUMN sermons.language IS 'Language of the sermon content';
COMMENT ON COLUMN sermons.is_draft IS 'Whether the sermon is still a draft or completed'; 