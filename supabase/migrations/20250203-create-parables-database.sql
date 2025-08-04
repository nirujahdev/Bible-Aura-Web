-- Create simplified parables database for Bible study
-- Migration: Add basic parables table with essential study structure

-- Create parables table
CREATE TABLE IF NOT EXISTS parables (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    scripture_reference TEXT NOT NULL,
    content TEXT NOT NULL,
    lessons TEXT,
    applications TEXT,
    reflective_questions TEXT[],
    cross_references TEXT[],
    difficulty_level TEXT DEFAULT 'intermediate' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    study_duration INTEGER DEFAULT 30, -- in minutes
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create parable_studies table for user progress tracking
CREATE TABLE IF NOT EXISTS parable_studies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    parable_id UUID NOT NULL REFERENCES parables(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    personal_notes TEXT,
    study_date DATE DEFAULT CURRENT_DATE,
    time_spent INTEGER DEFAULT 0, -- in minutes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, parable_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_parables_difficulty ON parables(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_parables_tags ON parables USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_parable_studies_user_id ON parable_studies(user_id);
CREATE INDEX IF NOT EXISTS idx_parable_studies_parable_id ON parable_studies(parable_id);

-- Enable Row Level Security
ALTER TABLE parables ENABLE ROW LEVEL SECURITY;
ALTER TABLE parable_studies ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for parables (public read)
CREATE POLICY "Anyone can view parables" ON parables
    FOR SELECT USING (true);

-- Create RLS policies for parable_studies (user-specific)
CREATE POLICY "Users can view their own parable studies" ON parable_studies
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own parable studies" ON parable_studies
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own parable studies" ON parable_studies
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own parable studies" ON parable_studies
    FOR DELETE USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_parables_updated_at 
    BEFORE UPDATE ON parables 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_parable_studies_updated_at 
    BEFORE UPDATE ON parable_studies 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Insert The Good Samaritan parable study
INSERT INTO parables (
    title,
    scripture_reference,
    content,
    lessons,
    applications,
    reflective_questions,
    cross_references,
    difficulty_level,
    study_duration,
    tags
) VALUES (
    'The Good Samaritan',
    'Luke 10:25–37',
    'A man was going down from Jerusalem to Jericho, when he was attacked by robbers. They stripped him of his clothes, beat him and went away, leaving him half dead. A priest happened to be going down the same road, and when he saw the man, he passed by on the other side. So too, a Levite, when he came to the place and saw him, passed by on the other side. But a Samaritan, as he traveled, came where the man was; and when he saw him, he took pity on him. He went to him and bandaged his wounds, pouring on oil and wine. Then he put the man on his own donkey, brought him to an inn and took care of him. The next day he took out two denarii and gave them to the innkeeper. "Look after him," he said, "and when I return, I will reimburse you for any extra expense you may have."',
    'Love is shown through action, not just words. True compassion crosses social and cultural barriers. Religious status means nothing without mercy and kindness.',
    'Help people regardless of their background or social status. Look for opportunities to show practical kindness. Challenge your own prejudices and biases.',
    ARRAY[
        'When have I avoided helping someone in need?',
        'Who are the people I tend to overlook or avoid?',
        'How can I show practical compassion this week?',
        'What prejudices do I need to address in my heart?',
        'Am I known more for my religious knowledge or my loving actions?'
    ],
    ARRAY[
        'Matthew 25:35-40',
        'James 2:14-17',
        '1 John 3:17-18',
        'Leviticus 19:18',
        'Romans 13:8-10'
    ],
    'intermediate',
    30,
    ARRAY['compassion', 'neighbor', 'mercy', 'service', 'love']
);

-- Add comments for documentation
COMMENT ON TABLE parables IS 'Biblical parables with study content and applications';
COMMENT ON TABLE parable_studies IS 'User progress tracking for parable studies'; 