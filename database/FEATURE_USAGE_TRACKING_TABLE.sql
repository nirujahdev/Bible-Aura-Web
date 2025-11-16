-- Feature Usage Tracking Table
-- Tracks feature usage across the platform for analytics

CREATE TABLE IF NOT EXISTS public.feature_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT, -- Optional: link to user_sessions table
  
  -- Feature details
  feature_name TEXT NOT NULL, -- e.g., 'bookmark', 'share', 'export', 'premium_ai', 'verse_search', etc.
  feature_category TEXT, -- e.g., 'ai_chat', 'bible_reading', 'sermons', 'journal', etc.
  
  -- Usage context
  usage_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  page_url TEXT, -- Page where feature was used
  context TEXT, -- Additional context about usage
  
  -- User context at time of usage
  subscription_tier TEXT, -- User's subscription tier at usage time
  device_type TEXT, -- Device type at usage time
  
  -- Outcome tracking
  was_successful BOOLEAN DEFAULT TRUE, -- Whether feature usage was successful
  error_message TEXT, -- Error message if usage failed
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb, -- Flexible additional data
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_feature_usage_user_id ON public.feature_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_usage_feature_name ON public.feature_usage(feature_name);
CREATE INDEX IF NOT EXISTS idx_feature_usage_category ON public.feature_usage(feature_category);
CREATE INDEX IF NOT EXISTS idx_feature_usage_timestamp ON public.feature_usage(usage_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_feature_usage_session_id ON public.feature_usage(session_id);
CREATE INDEX IF NOT EXISTS idx_feature_usage_subscription_tier ON public.feature_usage(subscription_tier);

-- Composite indexes for common analytics queries
CREATE INDEX IF NOT EXISTS idx_feature_usage_user_feature ON public.feature_usage(user_id, feature_name, usage_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_feature_usage_category_tier ON public.feature_usage(feature_category, subscription_tier);

-- Enable Row Level Security
ALTER TABLE public.feature_usage ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own feature usage
CREATE POLICY "Users can view their own feature usage"
  ON public.feature_usage
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own feature usage
CREATE POLICY "Users can insert their own feature usage"
  ON public.feature_usage
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add helpful comments
COMMENT ON TABLE public.feature_usage IS 'Tracks feature usage across the platform for analytics and product insights';
COMMENT ON COLUMN public.feature_usage.feature_name IS 'Name of the feature used (bookmark, share, export, premium_ai, etc.)';
COMMENT ON COLUMN public.feature_usage.feature_category IS 'Category of feature (ai_chat, bible_reading, sermons, journal, etc.)';

