-- ========================================
-- FIX AI LIMITS MIGRATION
-- ========================================
-- Updates existing profiles with incorrect limits (50/5) to correct limits (20/1)
-- Ensures all profiles have correct default limits
-- Fixes database functions to use proper defaults

BEGIN;

-- 1. Update existing profiles with wrong limits
UPDATE public.profiles
SET 
  ai_message_limit = 20,
  ai_sermon_limit = 1
WHERE 
  (ai_message_limit = 50 OR ai_message_limit IS NULL)
  OR (ai_sermon_limit = 5 OR ai_sermon_limit IS NULL);

-- 2. Set defaults for any remaining NULL values
UPDATE public.profiles
SET 
  ai_message_limit = COALESCE(ai_message_limit, 20),
  ai_sermon_limit = COALESCE(ai_sermon_limit, 1)
WHERE 
  ai_message_limit IS NULL 
  OR ai_sermon_limit IS NULL;

-- 3. Ensure column defaults are correct (redundant but safe)
ALTER TABLE public.profiles 
  ALTER COLUMN ai_message_limit SET DEFAULT 20;

ALTER TABLE public.profiles 
  ALTER COLUMN ai_sermon_limit SET DEFAULT 1;

-- 4. Update check_and_increment_ai_usage function with proper defaults
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
  v_current_user_id UUID;
BEGIN
  -- Get the current authenticated user ID
  v_current_user_id := auth.uid();
  
  -- Security check: Ensure the user can only check their own usage
  IF v_current_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'current_usage', 0,
      'limit', 0,
      'remaining', 0,
      'message', 'Authentication required'
    );
  END IF;
  
  -- Security check: Ensure user_id matches the authenticated user
  IF p_user_id IS NULL OR p_user_id != v_current_user_id THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'current_usage', 0,
      'limit', 0,
      'remaining', 0,
      'message', 'Unauthorized: Can only check your own usage'
    );
  END IF;
  
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
  
  -- Get user's limit from profile (RLS will ensure user can only read their own profile)
  SELECT 
    CASE 
      WHEN p_usage_type = 'ai_message' THEN ai_message_limit
      WHEN p_usage_type = 'ai_sermon' THEN ai_sermon_limit
      ELSE 0
    END
  INTO v_limit
  FROM public.profiles
  WHERE user_id = p_user_id;
  
  -- If no limit found, use default values (20 messages, 1 sermon per day)
  IF v_limit IS NULL THEN
    IF p_usage_type = 'ai_message' THEN
      v_limit := 20;
    ELSIF p_usage_type = 'ai_sermon' THEN
      v_limit := 1;
    ELSE
      v_limit := 0;
    END IF;
  END IF;
  
  -- Get or create today's usage record (RLS will ensure user can only insert/update their own records)
  INSERT INTO public.ai_usage_tracking (user_id, usage_type, usage_date, usage_count)
  VALUES (p_user_id, p_usage_type, v_today, 0)
  ON CONFLICT (user_id, usage_type, usage_date)
  DO NOTHING;
  
  -- Get current usage count (RLS will ensure user can only read their own records)
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
    -- Increment usage (RLS will ensure user can only update their own records)
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
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- 5. Update get_ai_usage function with proper defaults
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
  v_current_user_id UUID;
BEGIN
  -- Get the current authenticated user ID
  v_current_user_id := auth.uid();
  
  -- Security check: Ensure the user can only check their own usage
  IF v_current_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'current_usage', 0,
      'limit', 0,
      'remaining', 0,
      'limit_reached', false
    );
  END IF;
  
  -- Security check: Ensure user_id matches the authenticated user
  IF p_user_id IS NULL OR p_user_id != v_current_user_id THEN
    RETURN jsonb_build_object(
      'current_usage', 0,
      'limit', 0,
      'remaining', 0,
      'limit_reached', false
    );
  END IF;
  
  -- Input validation: Ensure usage_type is valid
  IF p_usage_type NOT IN ('ai_message', 'ai_sermon') THEN
    RETURN jsonb_build_object(
      'current_usage', 0,
      'limit', 0,
      'remaining', 0,
      'limit_reached', false
    );
  END IF;
  
  -- Get user's limit from profile (RLS will ensure user can only read their own profile)
  SELECT 
    CASE 
      WHEN p_usage_type = 'ai_message' THEN ai_message_limit
      WHEN p_usage_type = 'ai_sermon' THEN ai_sermon_limit
      ELSE 0
    END
  INTO v_limit
  FROM public.profiles
  WHERE user_id = p_user_id;
  
  -- If no limit found, use default values (20 messages, 1 sermon per day)
  IF v_limit IS NULL THEN
    IF p_usage_type = 'ai_message' THEN
      v_limit := 20;
    ELSIF p_usage_type = 'ai_sermon' THEN
      v_limit := 1;
    ELSE
      v_limit := 0;
    END IF;
  END IF;
  
  -- Get current usage count (RLS will ensure user can only read their own records)
  -- Usage is tracked per day (usage_date = CURRENT_DATE), so it automatically resets daily
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
$$ LANGUAGE plpgsql SECURITY INVOKER;

COMMIT;

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Check profiles with correct limits
SELECT 
  user_id,
  ai_message_limit,
  ai_sermon_limit,
  CASE 
    WHEN ai_message_limit = 20 AND ai_sermon_limit = 1 THEN '✅ Correct'
    ELSE '❌ Needs Update'
  END as status
FROM public.profiles
WHERE ai_message_limit IS NOT NULL OR ai_sermon_limit IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

-- Check usage tracking (should show today's date)
SELECT 
  user_id,
  usage_type,
  usage_date,
  usage_count,
  CASE 
    WHEN usage_date = CURRENT_DATE THEN '✅ Today'
    ELSE '⚠️ Old Date'
  END as date_status
FROM public.ai_usage_tracking
ORDER BY updated_at DESC
LIMIT 10;

