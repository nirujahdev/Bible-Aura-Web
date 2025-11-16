-- User Sessions Tracking Table
-- Tracks user sessions for engagement analysis and insights

CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Session details
  session_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  session_end TIMESTAMPTZ,
  duration_seconds INTEGER, -- Calculated duration
  
  -- Engagement metrics
  messages_count INTEGER DEFAULT 0,
  ai_interactions_count INTEGER DEFAULT 0,
  features_used TEXT[], -- Array of features used in session
  pages_visited TEXT[], -- Array of pages visited
  
  -- Device and technical info
  device_type TEXT, -- mobile, tablet, desktop
  os_type TEXT, -- ios, android, windows, macos, linux
  browser_type TEXT, -- chrome, safari, firefox, edge
  user_agent TEXT,
  ip_address INET,
  
  -- Geographic info (from IP or user profile)
  country TEXT,
  timezone TEXT,
  
  -- Referral and source
  referrer TEXT,
  entry_page TEXT,
  exit_page TEXT,
  
  -- Engagement quality
  is_bounce BOOLEAN DEFAULT FALSE, -- Session with no meaningful interaction
  is_engaged BOOLEAN DEFAULT FALSE, -- Session with meaningful engagement
  engagement_score INTEGER DEFAULT 0, -- Calculated engagement score (0-100)
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_start ON public.user_sessions(session_start DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_device_type ON public.user_sessions(device_type);
CREATE INDEX IF NOT EXISTS idx_user_sessions_country ON public.user_sessions(country);
CREATE INDEX IF NOT EXISTS idx_user_sessions_engaged ON public.user_sessions(is_engaged) WHERE is_engaged = TRUE;

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_start ON public.user_sessions(user_id, session_start DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_device_country ON public.user_sessions(device_type, country);

-- Enable Row Level Security
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own sessions
CREATE POLICY "Users can view their own sessions"
  ON public.user_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own sessions
CREATE POLICY "Users can insert their own sessions"
  ON public.user_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own sessions
CREATE POLICY "Users can update their own sessions"
  ON public.user_sessions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  
  -- Auto-calculate duration when session_end is set
  IF NEW.session_end IS NOT NULL AND OLD.session_end IS NULL THEN
    NEW.duration_seconds = EXTRACT(EPOCH FROM (NEW.session_end - NEW.session_start))::INTEGER;
    
    -- Calculate engagement score based on session metrics
    NEW.engagement_score = (
      CASE WHEN NEW.messages_count > 0 THEN 30 ELSE 0 END +
      CASE WHEN NEW.messages_count > 5 THEN 20 ELSE 0 END +
      CASE WHEN NEW.messages_count > 10 THEN 20 ELSE 0 END +
      CASE WHEN array_length(NEW.features_used, 1) > 0 THEN 10 ELSE 0 END +
      CASE WHEN array_length(NEW.features_used, 1) > 2 THEN 10 ELSE 0 END +
      CASE WHEN NEW.duration_seconds > 300 THEN 10 ELSE 0 END
    );
    
    -- Determine if session is engaged
    NEW.is_engaged = NEW.engagement_score >= 50;
    NEW.is_bounce = NEW.messages_count = 0 AND NEW.duration_seconds < 30;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at and calculate metrics
CREATE TRIGGER update_user_sessions_updated_at
  BEFORE UPDATE ON public.user_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_sessions_updated_at();

-- Add helpful comments
COMMENT ON TABLE public.user_sessions IS 'Tracks user sessions for engagement analysis and insights';
COMMENT ON COLUMN public.user_sessions.engagement_score IS 'Calculated engagement score (0-100) based on messages, features, and duration';
COMMENT ON COLUMN public.user_sessions.is_engaged IS 'True if session had meaningful engagement (score >= 50)';

