-- Update Message Logs to Store User Message and AI Response in Same Row
-- Changes structure so each row represents a conversation turn (user + assistant)

-- 1. Add fields for storing both messages in same row
DO $$
BEGIN
  -- User Message Content (original user message)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ai_message_logs' AND column_name = 'user_message_content'
  ) THEN
    ALTER TABLE public.ai_message_logs ADD COLUMN user_message_content TEXT;
    RAISE NOTICE 'Added user_message_content column';
  END IF;

  -- Assistant Message Content (AI response)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ai_message_logs' AND column_name = 'assistant_message_content'
  ) THEN
    ALTER TABLE public.ai_message_logs ADD COLUMN assistant_message_content TEXT;
    RAISE NOTICE 'Added assistant_message_content column';
  END IF;

  -- User Message ID (for tracking the user message)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ai_message_logs' AND column_name = 'user_message_id'
  ) THEN
    ALTER TABLE public.ai_message_logs ADD COLUMN user_message_id TEXT;
    RAISE NOTICE 'Added user_message_id column';
  END IF;

  -- Assistant Message ID (for tracking the AI response)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ai_message_logs' AND column_name = 'assistant_message_id'
  ) THEN
    ALTER TABLE public.ai_message_logs ADD COLUMN assistant_message_id TEXT;
    RAISE NOTICE 'Added assistant_message_id column';
  END IF;

  -- Conversation Turn Number (order of messages in conversation)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ai_message_logs' AND column_name = 'turn_number'
  ) THEN
    ALTER TABLE public.ai_message_logs ADD COLUMN turn_number INTEGER;
    RAISE NOTICE 'Added turn_number column';
  END IF;

  -- Pair ID (links user message and assistant response together)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ai_message_logs' AND column_name = 'pair_id'
  ) THEN
    ALTER TABLE public.ai_message_logs ADD COLUMN pair_id TEXT;
    RAISE NOTICE 'Added pair_id column';
  END IF;
END $$;

-- 2. Migrate existing data (if any exists)
-- For existing rows where role='user', populate user_message_content
UPDATE public.ai_message_logs
SET user_message_content = content
WHERE role = 'user' AND user_message_content IS NULL;

-- For existing rows where role='assistant', populate assistant_message_content
UPDATE public.ai_message_logs
SET assistant_message_content = content
WHERE role = 'assistant' AND assistant_message_content IS NULL;

-- 3. Create indexes for the new fields
CREATE INDEX IF NOT EXISTS idx_ai_message_logs_pair_id ON public.ai_message_logs(pair_id);
CREATE INDEX IF NOT EXISTS idx_ai_message_logs_user_message_id ON public.ai_message_logs(user_message_id);
CREATE INDEX IF NOT EXISTS idx_ai_message_logs_assistant_message_id ON public.ai_message_logs(assistant_message_id);
CREATE INDEX IF NOT EXISTS idx_ai_message_logs_turn_number ON public.ai_message_logs(turn_number);

-- Composite index for conversation flow analysis
CREATE INDEX IF NOT EXISTS idx_ai_message_logs_conversation_turn ON public.ai_message_logs(conversation_id, turn_number);

-- Add helpful comments
COMMENT ON COLUMN public.ai_message_logs.user_message_content IS 'Original user message content (for pairing with AI response)';
COMMENT ON COLUMN public.ai_message_logs.assistant_message_content IS 'AI assistant response content (paired with user message)';
COMMENT ON COLUMN public.ai_message_logs.pair_id IS 'Unique ID linking user message and AI response in same row';
COMMENT ON COLUMN public.ai_message_logs.turn_number IS 'Order of this conversation turn in the conversation';

