-- Enhanced Message Logs for High-Value Data Insights
-- Adds context, sentiment, conversion tracking, and content categorization

-- 1. Add User Context at Message Time Columns
DO $$
BEGIN
  -- User Age at Message Time
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ai_message_logs' AND column_name = 'user_age_at_message'
  ) THEN
    ALTER TABLE public.ai_message_logs ADD COLUMN user_age_at_message INTEGER;
    RAISE NOTICE 'Added user_age_at_message column';
  END IF;

  -- User Denomination at Message Time
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ai_message_logs' AND column_name = 'user_denomination_at_message'
  ) THEN
    ALTER TABLE public.ai_message_logs ADD COLUMN user_denomination_at_message TEXT;
    RAISE NOTICE 'Added user_denomination_at_message column';
  END IF;

  -- User Subscription Tier at Message Time
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ai_message_logs' AND column_name = 'user_subscription_tier_at_message'
  ) THEN
    ALTER TABLE public.ai_message_logs ADD COLUMN user_subscription_tier_at_message TEXT;
    RAISE NOTICE 'Added user_subscription_tier_at_message column';
  END IF;
END $$;

-- 2. Add Interaction Context Columns
DO $$
BEGIN
  -- Session ID
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ai_message_logs' AND column_name = 'session_id'
  ) THEN
    ALTER TABLE public.ai_message_logs ADD COLUMN session_id TEXT;
    RAISE NOTICE 'Added session_id column';
  END IF;

  -- Previous Messages in Session
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ai_message_logs' AND column_name = 'previous_messages_in_session'
  ) THEN
    ALTER TABLE public.ai_message_logs ADD COLUMN previous_messages_in_session INTEGER DEFAULT 0;
    RAISE NOTICE 'Added previous_messages_in_session column';
  END IF;

  -- Time Since Last Message (seconds)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ai_message_logs' AND column_name = 'time_since_last_message'
  ) THEN
    ALTER TABLE public.ai_message_logs ADD COLUMN time_since_last_message INTEGER;
    RAISE NOTICE 'Added time_since_last_message column';
  END IF;

  -- Conversation Depth
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ai_message_logs' AND column_name = 'conversation_depth'
  ) THEN
    ALTER TABLE public.ai_message_logs ADD COLUMN conversation_depth INTEGER DEFAULT 1;
    RAISE NOTICE 'Added conversation_depth column';
  END IF;
END $$;

-- 3. Add Sentiment & Emotion Columns
DO $$
BEGIN
  -- Message Sentiment
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ai_message_logs' AND column_name = 'message_sentiment'
  ) THEN
    ALTER TABLE public.ai_message_logs ADD COLUMN message_sentiment TEXT 
      CHECK (message_sentiment IN ('positive', 'neutral', 'negative', 'question', 'prayer') OR message_sentiment IS NULL);
    RAISE NOTICE 'Added message_sentiment column';
  END IF;

  -- Detected Emotion
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ai_message_logs' AND column_name = 'detected_emotion'
  ) THEN
    ALTER TABLE public.ai_message_logs ADD COLUMN detected_emotion TEXT;
    RAISE NOTICE 'Added detected_emotion column';
  END IF;

  -- Urgency Level
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ai_message_logs' AND column_name = 'urgency_level'
  ) THEN
    ALTER TABLE public.ai_message_logs ADD COLUMN urgency_level TEXT 
      CHECK (urgency_level IN ('low', 'medium', 'high') OR urgency_level IS NULL);
    RAISE NOTICE 'Added urgency_level column';
  END IF;
END $$;

-- 4. Add Content Categorization Columns
DO $$
BEGIN
  -- Detected Topic
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ai_message_logs' AND column_name = 'detected_topic'
  ) THEN
    ALTER TABLE public.ai_message_logs ADD COLUMN detected_topic TEXT;
    RAISE NOTICE 'Added detected_topic column';
  END IF;

  -- Bible Book Referenced
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ai_message_logs' AND column_name = 'bible_book_referenced'
  ) THEN
    ALTER TABLE public.ai_message_logs ADD COLUMN bible_book_referenced TEXT;
    RAISE NOTICE 'Added bible_book_referenced column';
  END IF;

  -- Bible Chapter Referenced
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ai_message_logs' AND column_name = 'bible_chapter_referenced'
  ) THEN
    ALTER TABLE public.ai_message_logs ADD COLUMN bible_chapter_referenced INTEGER;
    RAISE NOTICE 'Added bible_chapter_referenced column';
  END IF;

  -- Bible Verse Referenced
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ai_message_logs' AND column_name = 'bible_verse_referenced'
  ) THEN
    ALTER TABLE public.ai_message_logs ADD COLUMN bible_verse_referenced INTEGER;
    RAISE NOTICE 'Added bible_verse_referenced column';
  END IF;

  -- Scripture Reference
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ai_message_logs' AND column_name = 'scripture_reference'
  ) THEN
    ALTER TABLE public.ai_message_logs ADD COLUMN scripture_reference TEXT;
    RAISE NOTICE 'Added scripture_reference column';
  END IF;
END $$;

-- 5. Add Conversion Tracking Columns
DO $$
BEGIN
  -- Led to Bookmark
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ai_message_logs' AND column_name = 'led_to_bookmark'
  ) THEN
    ALTER TABLE public.ai_message_logs ADD COLUMN led_to_bookmark BOOLEAN DEFAULT FALSE;
    RAISE NOTICE 'Added led_to_bookmark column';
  END IF;

  -- Led to Favorite
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ai_message_logs' AND column_name = 'led_to_favorite'
  ) THEN
    ALTER TABLE public.ai_message_logs ADD COLUMN led_to_favorite BOOLEAN DEFAULT FALSE;
    RAISE NOTICE 'Added led_to_favorite column';
  END IF;

  -- Led to Share
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ai_message_logs' AND column_name = 'led_to_share'
  ) THEN
    ALTER TABLE public.ai_message_logs ADD COLUMN led_to_share BOOLEAN DEFAULT FALSE;
    RAISE NOTICE 'Added led_to_share column';
  END IF;

  -- Led to Premium Signup
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ai_message_logs' AND column_name = 'led_to_premium_signup'
  ) THEN
    ALTER TABLE public.ai_message_logs ADD COLUMN led_to_premium_signup BOOLEAN DEFAULT FALSE;
    RAISE NOTICE 'Added led_to_premium_signup column';
  END IF;
END $$;

-- 6. Create Indexes for Analytics Queries
CREATE INDEX IF NOT EXISTS idx_ai_message_logs_session_id ON public.ai_message_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_message_logs_user_subscription_tier ON public.ai_message_logs(user_subscription_tier_at_message);
CREATE INDEX IF NOT EXISTS idx_ai_message_logs_sentiment ON public.ai_message_logs(message_sentiment);
CREATE INDEX IF NOT EXISTS idx_ai_message_logs_detected_topic ON public.ai_message_logs(detected_topic);
CREATE INDEX IF NOT EXISTS idx_ai_message_logs_bible_book ON public.ai_message_logs(bible_book_referenced);
CREATE INDEX IF NOT EXISTS idx_ai_message_logs_scripture_ref ON public.ai_message_logs(scripture_reference);
CREATE INDEX IF NOT EXISTS idx_ai_message_logs_conversion_bookmark ON public.ai_message_logs(led_to_bookmark) WHERE led_to_bookmark = TRUE;
CREATE INDEX IF NOT EXISTS idx_ai_message_logs_conversion_premium ON public.ai_message_logs(led_to_premium_signup) WHERE led_to_premium_signup = TRUE;

-- Composite indexes for analytics
CREATE INDEX IF NOT EXISTS idx_ai_message_logs_session_timestamp ON public.ai_message_logs(session_id, message_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_ai_message_logs_tier_topic ON public.ai_message_logs(user_subscription_tier_at_message, detected_topic);
CREATE INDEX IF NOT EXISTS idx_ai_message_logs_book_chapter_verse ON public.ai_message_logs(bible_book_referenced, bible_chapter_referenced, bible_verse_referenced);

-- Add helpful comments
COMMENT ON COLUMN public.ai_message_logs.session_id IS 'Tracks conversation sessions for engagement analysis';
COMMENT ON COLUMN public.ai_message_logs.message_sentiment IS 'Sentiment analysis: positive, neutral, negative, question, prayer';
COMMENT ON COLUMN public.ai_message_logs.detected_topic IS 'Topic categorization: doctrine, history, character, verse, application, etc.';
COMMENT ON COLUMN public.ai_message_logs.led_to_premium_signup IS 'Tracks if this message led to premium subscription conversion';

