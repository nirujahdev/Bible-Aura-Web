-- ========================================
-- BIBLE AURA - AI USAGE TRACKING IMPROVEMENTS
-- ========================================
-- Adds decrement function for rollback
-- Improves conversation linking
-- Adds indexes for better performance

BEGIN;

-- 1. Create function to decrement AI usage (for rollback on API failure)
CREATE OR REPLACE FUNCTION public.decrement_ai_usage(
  p_user_id UUID,
  p_usage_type TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_current_user_id UUID;
BEGIN
  -- Get the current authenticated user ID
  v_current_user_id := auth.uid();
  
  -- Security check: Ensure the user can only decrement their own usage
  IF v_current_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Security check: Ensure user_id matches the authenticated user
  IF p_user_id IS NULL OR p_user_id != v_current_user_id THEN
    RETURN false;
  END IF;
  
  -- Input validation: Ensure usage_type is valid
  IF p_usage_type NOT IN ('ai_message', 'ai_sermon') THEN
    RETURN false;
  END IF;
  
  -- Decrement usage (only if > 0)
  UPDATE public.ai_usage_tracking
  SET usage_count = GREATEST(0, usage_count - 1),
      updated_at = NOW()
  WHERE user_id = p_user_id 
    AND usage_type = p_usage_type 
    AND usage_date = v_today
    AND usage_count > 0;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- 2. Fix the check_and_increment_ai_usage function (add missing variable declaration)
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
  v_current_user_id UUID; -- Fixed: Added missing variable declaration
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
  
  -- If no limit found, default to 0 (blocked)
  IF v_limit IS NULL THEN
    v_limit := 0;
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

-- 3. Add index on ai_message_logs for conversation_id lookups
CREATE INDEX IF NOT EXISTS idx_ai_message_logs_conversation_id 
  ON public.ai_message_logs(conversation_id) 
  WHERE conversation_id IS NOT NULL;

-- 4. Add composite index for turn number queries
CREATE INDEX IF NOT EXISTS idx_ai_message_logs_conversation_turn 
  ON public.ai_message_logs(user_id, conversation_id, turn_number DESC) 
  WHERE conversation_id IS NOT NULL AND turn_number IS NOT NULL;

-- 5. Add index on ai_conversations for faster updates
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_updated 
  ON public.ai_conversations(user_id, updated_at DESC);

COMMIT;

-- ========================================
-- VERIFICATION
-- ========================================

-- Verify decrement function exists
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public' 
  AND routine_name = 'decrement_ai_usage';

-- Verify indexes were created
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('ai_message_logs', 'ai_conversations')
  AND indexname LIKE '%conversation%';

