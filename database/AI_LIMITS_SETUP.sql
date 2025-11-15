-- ========================================
-- BIBLE AURA - AI LIMITS SETUP
-- ========================================
-- Adds AI message and sermon limits to profiles
-- Creates usage tracking table
-- Creates limit checking functions

BEGIN;

-- 1. Add AI limit columns to profiles table
DO $$ 
BEGIN
  -- Add AI message limit (default: 50 messages per day)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'profiles' 
                 AND column_name = 'ai_message_limit') THEN
    ALTER TABLE public.profiles ADD COLUMN ai_message_limit INTEGER DEFAULT 50;
    RAISE NOTICE 'Added ai_message_limit column';
  END IF;
  
  -- Add AI sermon limit (default: 5 sermons per day)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'profiles' 
                 AND column_name = 'ai_sermon_limit') THEN
    ALTER TABLE public.profiles ADD COLUMN ai_sermon_limit INTEGER DEFAULT 5;
    RAISE NOTICE 'Added ai_sermon_limit column';
  END IF;
  
  -- Add constraints
  BEGIN
    ALTER TABLE public.profiles ADD CONSTRAINT ai_message_limit_positive CHECK (ai_message_limit >= 0);
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
  
  BEGIN
    ALTER TABLE public.profiles ADD CONSTRAINT ai_sermon_limit_positive CHECK (ai_sermon_limit >= 0);
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;

-- 2. Create AI usage tracking table
CREATE TABLE IF NOT EXISTS public.ai_usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_type TEXT NOT NULL CHECK (usage_type IN ('ai_message', 'ai_sermon')),
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, usage_type, usage_date)
);

-- 3. Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_id ON public.ai_usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_date ON public.ai_usage_tracking(usage_date DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_type_date ON public.ai_usage_tracking(user_id, usage_type, usage_date);

-- 4. Enable Row Level Security
ALTER TABLE public.ai_usage_tracking ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies
DROP POLICY IF EXISTS "Users can view own usage" ON public.ai_usage_tracking;
CREATE POLICY "Users can view own usage" ON public.ai_usage_tracking
  FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own usage" ON public.ai_usage_tracking;
CREATE POLICY "Users can insert own usage" ON public.ai_usage_tracking
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own usage" ON public.ai_usage_tracking;
CREATE POLICY "Users can update own usage" ON public.ai_usage_tracking
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Service role has full access
DROP POLICY IF EXISTS "Service role full access" ON public.ai_usage_tracking;
CREATE POLICY "Service role full access" ON public.ai_usage_tracking
  FOR ALL 
  USING (auth.role() = 'service_role');

-- 6. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_ai_usage_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create trigger for updated_at
DROP TRIGGER IF EXISTS set_ai_usage_updated_at ON public.ai_usage_tracking;
CREATE TRIGGER set_ai_usage_updated_at
  BEFORE UPDATE ON public.ai_usage_tracking
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_ai_usage_updated_at();

-- 8. Create function to check and increment AI usage
CREATE OR REPLACE FUNCTION public.check_and_increment_ai_usage(
  p_user_id UUID,
  p_usage_type TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_limit INTEGER;
  v_usage_count INTEGER;
  v_today DATE := CURRENT_DATE;
  v_result JSONB;
BEGIN
  -- Input validation: Ensure usage_type is valid
  IF p_usage_type NOT IN ('ai_message', 'ai_sermon') THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'current_usage', 0,
      'limit', 0,
      'remaining', 0,
      'message', 'Invalid usage type'
    );
  END IF;
  
  -- Input validation: Ensure user_id is not null
  IF p_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'current_usage', 0,
      'limit', 0,
      'remaining', 0,
      'message', 'User ID is required'
    );
  END IF;
  
  -- Get user's limit from profile
  SELECT 
    CASE 
      WHEN p_usage_type = 'ai_message' THEN ai_message_limit
      WHEN p_usage_type = 'ai_sermon' THEN ai_sermon_limit
      ELSE 0
    END
  INTO v_limit
  FROM public.profiles
  WHERE user_id = p_user_id;
  
  -- If no limit found, default to 0 (blocked)
  IF v_limit IS NULL THEN
    v_limit := 0;
  END IF;
  
  -- Get or create today's usage record
  INSERT INTO public.ai_usage_tracking (user_id, usage_type, usage_date, usage_count)
  VALUES (p_user_id, p_usage_type, v_today, 0)
  ON CONFLICT (user_id, usage_type, usage_date)
  DO NOTHING;
  
  -- Get current usage count
  SELECT usage_count INTO v_usage_count
  FROM public.ai_usage_tracking
  WHERE user_id = p_user_id 
    AND usage_type = p_usage_type 
    AND usage_date = v_today;
  
  -- Check if limit exceeded
  IF v_usage_count >= v_limit THEN
    v_result := jsonb_build_object(
      'allowed', false,
      'current_usage', v_usage_count,
      'limit', v_limit,
      'remaining', 0,
      'message', 'AI usage limit reached for today'
    );
  ELSE
    -- Increment usage
    UPDATE public.ai_usage_tracking
    SET usage_count = usage_count + 1,
        updated_at = NOW()
    WHERE user_id = p_user_id 
      AND usage_type = p_usage_type 
      AND usage_date = v_today;
    
    v_result := jsonb_build_object(
      'allowed', true,
      'current_usage', v_usage_count + 1,
      'limit', v_limit,
      'remaining', GREATEST(0, v_limit - (v_usage_count + 1)),
      'message', 'Usage recorded successfully'
    );
  END IF;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Create function to get current usage without incrementing
CREATE OR REPLACE FUNCTION public.get_ai_usage(
  p_user_id UUID,
  p_usage_type TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_limit INTEGER;
  v_usage_count INTEGER;
  v_today DATE := CURRENT_DATE;
  v_result JSONB;
BEGIN
  -- Input validation: Ensure usage_type is valid
  IF p_usage_type NOT IN ('ai_message', 'ai_sermon') THEN
    RETURN jsonb_build_object(
      'current_usage', 0,
      'limit', 0,
      'remaining', 0,
      'limit_reached', false
    );
  END IF;
  
  -- Input validation: Ensure user_id is not null
  IF p_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'current_usage', 0,
      'limit', 0,
      'remaining', 0,
      'limit_reached', false
    );
  END IF;
  
  -- Get user's limit from profile
  SELECT 
    CASE 
      WHEN p_usage_type = 'ai_message' THEN ai_message_limit
      WHEN p_usage_type = 'ai_sermon' THEN ai_sermon_limit
      ELSE 0
    END
  INTO v_limit
  FROM public.profiles
  WHERE user_id = p_user_id;
  
  -- If no limit found, default to 0
  IF v_limit IS NULL THEN
    v_limit := 0;
  END IF;
  
  -- Get current usage count (default to 0 if no record)
  SELECT COALESCE(usage_count, 0) INTO v_usage_count
  FROM public.ai_usage_tracking
  WHERE user_id = p_user_id 
    AND usage_type = p_usage_type 
    AND usage_date = v_today;
  
  v_result := jsonb_build_object(
    'current_usage', v_usage_count,
    'limit', v_limit,
    'remaining', GREATEST(0, v_limit - v_usage_count),
    'limit_reached', v_usage_count >= v_limit
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Check if columns were added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
  AND column_name IN ('ai_message_limit', 'ai_sermon_limit');

-- Check if usage tracking table was created
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'ai_usage_tracking'
ORDER BY ordinal_position;

