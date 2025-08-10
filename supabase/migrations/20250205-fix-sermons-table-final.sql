-- Final comprehensive fix for sermons table
-- Migration: Fix all missing columns and schema issues for sermons table

-- Ensure sermons table exists with core structure
CREATE TABLE IF NOT EXISTS sermons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    content TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add all required columns for sermons functionality
DO $$
BEGIN
    -- Scripture fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'scripture_reference') THEN
        ALTER TABLE sermons ADD COLUMN scripture_reference TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'scripture_references') THEN
        ALTER TABLE sermons ADD COLUMN scripture_references TEXT[];
    ELSE
        -- Fix type if it's UUID array (convert to TEXT array)
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'scripture_references' AND udt_name = '_uuid') THEN
            ALTER TABLE sermons ALTER COLUMN scripture_references TYPE TEXT[] USING scripture_references::TEXT[];
        END IF;
    END IF;
    
    -- Basic sermon fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'main_points') THEN
        ALTER TABLE sermons ADD COLUMN main_points TEXT[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'congregation') THEN
        ALTER TABLE sermons ADD COLUMN congregation TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'sermon_date') THEN
        ALTER TABLE sermons ADD COLUMN sermon_date DATE DEFAULT CURRENT_DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'duration') THEN
        ALTER TABLE sermons ADD COLUMN duration INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'notes') THEN
        ALTER TABLE sermons ADD COLUMN notes TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'private_notes') THEN
        ALTER TABLE sermons ADD COLUMN private_notes TEXT;
    END IF;
    
    -- Status and classification
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'status') THEN
        ALTER TABLE sermons ADD COLUMN status TEXT DEFAULT 'draft';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'is_draft') THEN
        ALTER TABLE sermons ADD COLUMN is_draft BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'language') THEN
        ALTER TABLE sermons ADD COLUMN language TEXT DEFAULT 'english';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'category') THEN
        ALTER TABLE sermons ADD COLUMN category TEXT DEFAULT 'general';
    END IF;
    
    -- Arrays and collections
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'tags') THEN
        ALTER TABLE sermons ADD COLUMN tags TEXT[] DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'illustrations') THEN
        ALTER TABLE sermons ADD COLUMN illustrations TEXT[] DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'applications') THEN
        ALTER TABLE sermons ADD COLUMN applications TEXT[] DEFAULT '{}';
    END IF;
    
    -- Metrics and metadata
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'word_count') THEN
        ALTER TABLE sermons ADD COLUMN word_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'estimated_time') THEN
        ALTER TABLE sermons ADD COLUMN estimated_time INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'estimated_duration') THEN
        ALTER TABLE sermons ADD COLUMN estimated_duration INTEGER DEFAULT 0;
    END IF;
    
    -- AI and template fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'ai_generated') THEN
        ALTER TABLE sermons ADD COLUMN ai_generated BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'template_type') THEN
        ALTER TABLE sermons ADD COLUMN template_type TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'series_name') THEN
        ALTER TABLE sermons ADD COLUMN series_name TEXT;
    END IF;
    
    -- Advanced fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'outline') THEN
        ALTER TABLE sermons ADD COLUMN outline TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'last_auto_save') THEN
        ALTER TABLE sermons ADD COLUMN last_auto_save TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'version') THEN
        ALTER TABLE sermons ADD COLUMN version INTEGER DEFAULT 1;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'delivered_at') THEN
        ALTER TABLE sermons ADD COLUMN delivered_at TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'recording_url') THEN
        ALTER TABLE sermons ADD COLUMN recording_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'feedback_score') THEN
        ALTER TABLE sermons ADD COLUMN feedback_score INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'view_count') THEN
        ALTER TABLE sermons ADD COLUMN view_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Ensure proper constraints and defaults
ALTER TABLE sermons ALTER COLUMN content DROP NOT NULL;
ALTER TABLE sermons ALTER COLUMN content SET DEFAULT '';
ALTER TABLE sermons ALTER COLUMN title DROP NOT NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sermons_user_id ON sermons(user_id);
CREATE INDEX IF NOT EXISTS idx_sermons_sermon_date ON sermons(sermon_date);
CREATE INDEX IF NOT EXISTS idx_sermons_is_draft ON sermons(is_draft);
CREATE INDEX IF NOT EXISTS idx_sermons_status ON sermons(status);
CREATE INDEX IF NOT EXISTS idx_sermons_language ON sermons(language);
CREATE INDEX IF NOT EXISTS idx_sermons_category ON sermons(category);
CREATE INDEX IF NOT EXISTS idx_sermons_created_at ON sermons(created_at);

-- Enable Row Level Security if not already enabled
ALTER TABLE sermons ENABLE ROW LEVEL SECURITY;

-- Recreate RLS policies if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sermons' AND policyname = 'Users can view their own sermons') THEN
        CREATE POLICY "Users can view their own sermons" ON sermons
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sermons' AND policyname = 'Users can insert their own sermons') THEN
        CREATE POLICY "Users can insert their own sermons" ON sermons
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sermons' AND policyname = 'Users can update their own sermons') THEN
        CREATE POLICY "Users can update their own sermons" ON sermons
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sermons' AND policyname = 'Users can delete their own sermons') THEN
        CREATE POLICY "Users can delete their own sermons" ON sermons
            FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$; 