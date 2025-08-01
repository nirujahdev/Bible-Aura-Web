-- Fix sermons table schema to match code expectations
-- Migration: Complete sermons table schema fix

-- First, let's see what we have and add missing columns
ALTER TABLE sermons 
ADD COLUMN IF NOT EXISTS scripture_reference TEXT,
ADD COLUMN IF NOT EXISTS main_points TEXT[],
ADD COLUMN IF NOT EXISTS congregation TEXT,
ADD COLUMN IF NOT EXISTS sermon_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS duration INTEGER,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS word_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS estimated_time INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'english' CHECK (language IN ('english', 'tamil', 'sinhala')),
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general',
ADD COLUMN IF NOT EXISTS illustrations TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS applications TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS private_notes TEXT,
ADD COLUMN IF NOT EXISTS series_name TEXT,
ADD COLUMN IF NOT EXISTS template_type TEXT,
ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS estimated_duration INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_auto_save TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS recording_url TEXT,
ADD COLUMN IF NOT EXISTS feedback_score INTEGER,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Make sure content can be empty for new sermons
ALTER TABLE sermons ALTER COLUMN content DROP NOT NULL;
ALTER TABLE sermons ALTER COLUMN content SET DEFAULT '';

-- Make sure title can be null for new sermons
ALTER TABLE sermons ALTER COLUMN title DROP NOT NULL;

-- Update existing indexes
CREATE INDEX IF NOT EXISTS idx_sermons_user_id ON sermons(user_id);
CREATE INDEX IF NOT EXISTS idx_sermons_sermon_date ON sermons(sermon_date);
CREATE INDEX IF NOT EXISTS idx_sermons_is_draft ON sermons(is_draft);
CREATE INDEX IF NOT EXISTS idx_sermons_language ON sermons(language);
CREATE INDEX IF NOT EXISTS idx_sermons_series_name ON sermons(series_name);
CREATE INDEX IF NOT EXISTS idx_sermons_template_type ON sermons(template_type);
CREATE INDEX IF NOT EXISTS idx_sermons_ai_generated ON sermons(ai_generated);
CREATE INDEX IF NOT EXISTS idx_sermons_delivered_at ON sermons(delivered_at);
CREATE INDEX IF NOT EXISTS idx_sermons_word_count ON sermons(word_count);

-- Create or replace function to auto-update word count
CREATE OR REPLACE FUNCTION update_sermon_word_count()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.content IS NOT NULL THEN
        NEW.word_count = COALESCE(
            array_length(
                string_to_array(
                    regexp_replace(NEW.content, '\s+', ' ', 'g'),
                    ' '
                ), 1
            ), 0
        );
        NEW.estimated_time = CEILING(NEW.word_count / 150.0); -- 150 words per minute
        NEW.estimated_duration = NEW.estimated_time;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-calculate word count
DROP TRIGGER IF EXISTS trigger_update_sermon_word_count ON sermons;
CREATE TRIGGER trigger_update_sermon_word_count
    BEFORE INSERT OR UPDATE ON sermons
    FOR EACH ROW
    EXECUTE FUNCTION update_sermon_word_count();

-- Update RLS policies to ensure they work with new schema
DROP POLICY IF EXISTS "Users can view their own sermons" ON sermons;
DROP POLICY IF EXISTS "Users can insert their own sermons" ON sermons;
DROP POLICY IF EXISTS "Users can update their own sermons" ON sermons;
DROP POLICY IF EXISTS "Users can delete their own sermons" ON sermons;

CREATE POLICY "Users can view their own sermons" ON sermons
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sermons" ON sermons
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sermons" ON sermons
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sermons" ON sermons
    FOR DELETE USING (auth.uid() = user_id);

-- Add helpful comments
COMMENT ON TABLE sermons IS 'Table for storing user sermons and sermon content with complete schema';
COMMENT ON COLUMN sermons.duration IS 'Estimated sermon duration in minutes';
COMMENT ON COLUMN sermons.estimated_time IS 'Estimated reading time in minutes';
COMMENT ON COLUMN sermons.estimated_duration IS 'Estimated delivery duration in minutes';
COMMENT ON COLUMN sermons.language IS 'Language of the sermon content';
COMMENT ON COLUMN sermons.is_draft IS 'Whether the sermon is still a draft or completed';
COMMENT ON COLUMN sermons.scripture_reference IS 'Single scripture reference (different from scripture_references array)';
COMMENT ON COLUMN sermons.private_notes IS 'Private notes for the sermon author'; 