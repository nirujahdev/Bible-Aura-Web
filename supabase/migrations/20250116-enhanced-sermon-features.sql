-- Enhanced Sermon Features Migration
-- Adds new columns to support advanced sermon functionality

-- Add new columns to sermons table
ALTER TABLE sermons 
ADD COLUMN series_name TEXT,
ADD COLUMN template_type TEXT,
ADD COLUMN ai_generated BOOLEAN DEFAULT FALSE,
ADD COLUMN word_count INTEGER DEFAULT 0,
ADD COLUMN estimated_duration INTEGER DEFAULT 0,
ADD COLUMN last_auto_save TIMESTAMPTZ,
ADD COLUMN version INTEGER DEFAULT 1,
ADD COLUMN delivered_at TIMESTAMPTZ,
ADD COLUMN recording_url TEXT,
ADD COLUMN feedback_score INTEGER,
ADD COLUMN view_count INTEGER DEFAULT 0;

-- Add indexes for better performance
CREATE INDEX idx_sermons_series_name ON sermons(series_name);
CREATE INDEX idx_sermons_template_type ON sermons(template_type);
CREATE INDEX idx_sermons_ai_generated ON sermons(ai_generated);
CREATE INDEX idx_sermons_delivered_at ON sermons(delivered_at);
CREATE INDEX idx_sermons_word_count ON sermons(word_count);

-- Create sermon_collaboration table for team sharing
CREATE TABLE sermon_collaboration (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sermon_id UUID REFERENCES sermons(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('editor', 'reviewer', 'viewer')) DEFAULT 'viewer',
    invited_by UUID REFERENCES auth.users(id),
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create sermon_comments table for feedback
CREATE TABLE sermon_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sermon_id UUID REFERENCES sermons(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    section_reference TEXT, -- which part of sermon this refers to
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create sermon_versions table for version control
CREATE TABLE sermon_versions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sermon_id UUID REFERENCES sermons(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    outline JSONB,
    scripture_references TEXT[],
    tags TEXT[],
    changes_summary TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create sermon_feedback table for congregation feedback
CREATE TABLE sermon_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sermon_id UUID REFERENCES sermons(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback_text TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE sermon_collaboration ENABLE ROW LEVEL SECURITY;
ALTER TABLE sermon_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sermon_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sermon_feedback ENABLE ROW LEVEL SECURITY;

-- Collaboration policies
CREATE POLICY "Users can view collaborations for their sermons" ON sermon_collaboration
    FOR SELECT USING (
        sermon_id IN (
            SELECT id FROM sermons WHERE user_id = auth.uid()
        ) OR user_id = auth.uid()
    );

CREATE POLICY "Sermon owners can manage collaborations" ON sermon_collaboration
    FOR ALL USING (
        sermon_id IN (
            SELECT id FROM sermons WHERE user_id = auth.uid()
        )
    );

-- Comments policies
CREATE POLICY "Users can view comments for accessible sermons" ON sermon_comments
    FOR SELECT USING (
        sermon_id IN (
            SELECT s.id FROM sermons s
            LEFT JOIN sermon_collaboration sc ON s.id = sc.sermon_id
            WHERE s.user_id = auth.uid() OR sc.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create comments for accessible sermons" ON sermon_comments
    FOR INSERT WITH CHECK (
        sermon_id IN (
            SELECT s.id FROM sermons s
            LEFT JOIN sermon_collaboration sc ON s.id = sc.sermon_id
            WHERE s.user_id = auth.uid() OR sc.user_id = auth.uid()
        )
    );

-- Version policies
CREATE POLICY "Users can view versions for their sermons" ON sermon_versions
    FOR SELECT USING (
        sermon_id IN (
            SELECT id FROM sermons WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create versions for their sermons" ON sermon_versions
    FOR INSERT WITH CHECK (
        sermon_id IN (
            SELECT id FROM sermons WHERE user_id = auth.uid()
        )
    );

-- Feedback policies
CREATE POLICY "Anyone can submit anonymous feedback" ON sermon_feedback
    FOR INSERT WITH CHECK (is_anonymous = TRUE);

CREATE POLICY "Users can submit feedback with their identity" ON sermon_feedback
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Sermon owners can view all feedback" ON sermon_feedback
    FOR SELECT USING (
        sermon_id IN (
            SELECT id FROM sermons WHERE user_id = auth.uid()
        )
    );

-- Add indexes for new tables
CREATE INDEX idx_sermon_collaboration_sermon_id ON sermon_collaboration(sermon_id);
CREATE INDEX idx_sermon_collaboration_user_id ON sermon_collaboration(user_id);
CREATE INDEX idx_sermon_comments_sermon_id ON sermon_comments(sermon_id);
CREATE INDEX idx_sermon_comments_user_id ON sermon_comments(user_id);
CREATE INDEX idx_sermon_versions_sermon_id ON sermon_versions(sermon_id);
CREATE INDEX idx_sermon_versions_version ON sermon_versions(sermon_id, version_number);
CREATE INDEX idx_sermon_feedback_sermon_id ON sermon_feedback(sermon_id);

-- Create function to automatically increment version numbers
CREATE OR REPLACE FUNCTION increment_sermon_version()
RETURNS TRIGGER AS $$
BEGIN
    NEW.version = COALESCE(OLD.version, 0) + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-increment version on sermon updates
CREATE TRIGGER trigger_increment_sermon_version
    BEFORE UPDATE ON sermons
    FOR EACH ROW
    WHEN (OLD.title IS DISTINCT FROM NEW.title OR 
          OLD.content IS DISTINCT FROM NEW.content OR 
          OLD.outline IS DISTINCT FROM NEW.outline)
    EXECUTE FUNCTION increment_sermon_version();

-- Create function to auto-update word count
CREATE OR REPLACE FUNCTION update_word_count()
RETURNS TRIGGER AS $$
BEGIN
    NEW.word_count = COALESCE(
        array_length(
            string_to_array(
                regexp_replace(COALESCE(NEW.content, ''), '<[^>]*>', '', 'g'),
                ' '
            ), 1
        ), 0
    );
    NEW.estimated_duration = CEILING(NEW.word_count / 150.0); -- 150 words per minute
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-calculate word count
CREATE TRIGGER trigger_update_word_count
    BEFORE INSERT OR UPDATE ON sermons
    FOR EACH ROW
    WHEN (NEW.content IS NOT NULL)
    EXECUTE FUNCTION update_word_count(); 