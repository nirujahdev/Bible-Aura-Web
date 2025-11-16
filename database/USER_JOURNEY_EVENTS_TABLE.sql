-- User Journey Events Tracking Table
-- Tracks key events in user journey for conversion funnel analysis

CREATE TABLE IF NOT EXISTS public.user_journey_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT, -- Optional: link to user_sessions table
  
  -- Event details
  event_type TEXT NOT NULL, -- e.g., 'signup', 'first_message', 'feature_discovery', 'conversion', 'churn', etc.
  event_category TEXT, -- e.g., 'acquisition', 'activation', 'engagement', 'conversion', 'retention'
  
  -- Event timing
  event_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Event context
  page_url TEXT, -- Page where event occurred
  referrer TEXT, -- Referrer URL
  previous_event_id UUID REFERENCES public.user_journey_events(id), -- Link to previous event in journey
  
  -- Event data (flexible JSON)
  event_data JSONB DEFAULT '{}'::jsonb, -- Event-specific data
  
  -- User context at event time
  subscription_tier TEXT, -- Subscription tier at event time
  days_since_signup INTEGER, -- Days since user signed up
  
  -- Conversion tracking
  is_conversion_event BOOLEAN DEFAULT FALSE, -- True for conversion events (signup, premium, etc.)
  conversion_value DECIMAL(10,2) DEFAULT 0.00, -- Value of conversion (e.g., subscription revenue)
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_user_journey_events_user_id ON public.user_journey_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_journey_events_event_type ON public.user_journey_events(event_type);
CREATE INDEX IF NOT EXISTS idx_user_journey_events_category ON public.user_journey_events(event_category);
CREATE INDEX IF NOT EXISTS idx_user_journey_events_timestamp ON public.user_journey_events(event_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_user_journey_events_session_id ON public.user_journey_events(session_id);
CREATE INDEX IF NOT EXISTS idx_user_journey_events_conversion ON public.user_journey_events(is_conversion_event) WHERE is_conversion_event = TRUE;

-- Composite indexes for funnel analysis
CREATE INDEX IF NOT EXISTS idx_user_journey_user_type_timestamp ON public.user_journey_events(user_id, event_type, event_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_user_journey_category_tier ON public.user_journey_events(event_category, subscription_tier);

-- Enable Row Level Security
ALTER TABLE public.user_journey_events ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own journey events
CREATE POLICY "Users can view their own journey events"
  ON public.user_journey_events
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own journey events
CREATE POLICY "Users can insert their own journey events"
  ON public.user_journey_events
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add helpful comments
COMMENT ON TABLE public.user_journey_events IS 'Tracks key events in user journey for conversion funnel analysis';
COMMENT ON COLUMN public.user_journey_events.event_type IS 'Type of event: signup, first_message, feature_discovery, conversion, churn, etc.';
COMMENT ON COLUMN public.user_journey_events.event_category IS 'Category: acquisition, activation, engagement, conversion, retention';
COMMENT ON COLUMN public.user_journey_events.is_conversion_event IS 'True for conversion events like signup or premium subscription';

