-- AI Message Logs Table for Bible Aura
-- This table stores every user message for advanced analysis and analytics
-- Messages are never truly deleted - only soft deleted for users (hidden from user view)
-- Admins can always see all messages for analysis purposes

CREATE TABLE IF NOT EXISTS ai_message_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES ai_conversations(id) ON DELETE SET NULL,
  
  -- Message details
  message_id TEXT NOT NULL, -- ID from the message object (for tracking)
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL, -- The actual message content
  mode TEXT DEFAULT 'chat-clean', -- The chat mode used (chat-clean, verse-clean, etc.)
  language TEXT DEFAULT 'english', -- Language used (english, tamil)
  translation TEXT DEFAULT 'KJV', -- Bible translation used
  
  -- Timestamps
  message_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- When the message was sent
  created_at TIMESTAMPTZ DEFAULT NOW(), -- When this log entry was created
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Feedback and reporting
  feedback TEXT CHECK (feedback IN ('positive', 'negative', NULL)), -- User feedback on AI response
  feedback_timestamp TIMESTAMPTZ, -- When feedback was given
  is_reported BOOLEAN DEFAULT FALSE, -- Whether message was reported
  report_reason TEXT, -- Reason for report (inaccurate, inappropriate, etc.)
  report_category TEXT, -- Category of report (inaccurate, inappropriate, offensive, spam, other, technical)
  report_timestamp TIMESTAMPTZ, -- When report was submitted
  report_resolved BOOLEAN DEFAULT FALSE, -- Whether report was resolved by admin
  report_resolved_at TIMESTAMPTZ, -- When report was resolved
  
  -- Soft delete (user-side only)
  user_deleted BOOLEAN DEFAULT FALSE, -- User deleted this message (hidden from user, but kept for admin)
  user_deleted_at TIMESTAMPTZ, -- When user deleted it
  
  -- AI Response metadata (for assistant messages)
  ai_mode TEXT, -- The mode AI responded with (chat, verse, etc.)
  has_sources BOOLEAN DEFAULT FALSE, -- Whether AI response included sources
  sources_count INTEGER DEFAULT 0, -- Number of sources
  has_cross_references BOOLEAN DEFAULT FALSE, -- Whether AI response included cross-references
  cross_references_count INTEGER DEFAULT 0, -- Number of cross-references
  has_validated_verses BOOLEAN DEFAULT FALSE, -- Whether AI response included validated verses
  validated_verses_count INTEGER DEFAULT 0, -- Number of validated verses
  
  -- Analytics metadata
  message_length INTEGER, -- Length of message content
  response_time_ms INTEGER, -- Time taken for AI to respond (in milliseconds)
  user_agent TEXT, -- Browser/user agent info
  ip_address INET, -- User IP address (for security/analytics)
  
  -- Additional metadata as JSON
  metadata JSONB DEFAULT '{}'::jsonb -- Additional flexible data
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_ai_message_logs_user_id ON ai_message_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_message_logs_conversation_id ON ai_message_logs(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_message_logs_message_timestamp ON ai_message_logs(message_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_ai_message_logs_mode ON ai_message_logs(mode);
CREATE INDEX IF NOT EXISTS idx_ai_message_logs_role ON ai_message_logs(role);
CREATE INDEX IF NOT EXISTS idx_ai_message_logs_feedback ON ai_message_logs(feedback) WHERE feedback IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ai_message_logs_reported ON ai_message_logs(is_reported) WHERE is_reported = TRUE;
CREATE INDEX IF NOT EXISTS idx_ai_message_logs_user_deleted ON ai_message_logs(user_deleted) WHERE user_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_ai_message_logs_created_at ON ai_message_logs(created_at DESC);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_ai_message_logs_user_role_timestamp ON ai_message_logs(user_id, role, message_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_ai_message_logs_user_not_deleted ON ai_message_logs(user_id, user_deleted) WHERE user_deleted = FALSE;

-- Enable Row Level Security
ALTER TABLE ai_message_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own non-deleted messages
CREATE POLICY "Users can view their own non-deleted messages"
  ON ai_message_logs
  FOR SELECT
  USING (
    auth.uid() = user_id 
    AND user_deleted = FALSE
  );

-- Policy: Users can insert their own messages
CREATE POLICY "Users can insert their own messages"
  ON ai_message_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own messages (for feedback, soft delete, reports)
CREATE POLICY "Users can update their own messages"
  ON ai_message_logs
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    -- Prevent users from modifying certain admin-only fields
    AND (
      OLD.user_id = NEW.user_id
      AND OLD.message_id = NEW.message_id
      AND OLD.content = NEW.content
      AND OLD.message_timestamp = NEW.message_timestamp
      AND OLD.ip_address IS NULL OR OLD.ip_address = NEW.ip_address
      AND OLD.user_agent IS NULL OR OLD.user_agent = NEW.user_agent
    )
  );

-- Policy: Users can NOT delete messages (only soft delete via UPDATE)
-- No DELETE policy for regular users - messages are preserved for admin analysis

-- Admin policy: Service role can see ALL messages (for analytics)
-- Note: This requires service role key, not handled by RLS but by service role bypass
-- Service role queries will bypass RLS automatically

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ai_message_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_ai_message_logs_updated_at
  BEFORE UPDATE ON ai_message_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_message_logs_updated_at();

-- Create function to set user_deleted_at when user_deleted is set to TRUE
CREATE OR REPLACE FUNCTION set_user_deleted_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_deleted = TRUE AND OLD.user_deleted = FALSE THEN
    NEW.user_deleted_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to set user_deleted_at timestamp
CREATE TRIGGER set_user_deleted_timestamp
  BEFORE UPDATE ON ai_message_logs
  FOR EACH ROW
  EXECUTE FUNCTION set_user_deleted_timestamp();

-- Create function to set feedback_timestamp when feedback is updated
CREATE OR REPLACE FUNCTION set_feedback_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.feedback IS NOT NULL AND (OLD.feedback IS NULL OR OLD.feedback != NEW.feedback) THEN
    NEW.feedback_timestamp = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to set feedback_timestamp
CREATE TRIGGER set_feedback_timestamp
  BEFORE UPDATE ON ai_message_logs
  FOR EACH ROW
  EXECUTE FUNCTION set_feedback_timestamp();

-- Create function to set report_timestamp when is_reported is set to TRUE
CREATE OR REPLACE FUNCTION set_report_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_reported = TRUE AND (OLD.is_reported = FALSE OR OLD.is_reported IS NULL) THEN
    NEW.report_timestamp = NOW();
  END IF;
  IF NEW.report_resolved = TRUE AND (OLD.report_resolved = FALSE OR OLD.report_resolved IS NULL) THEN
    NEW.report_resolved_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to set report_timestamp
CREATE TRIGGER set_report_timestamp
  BEFORE UPDATE ON ai_message_logs
  FOR EACH ROW
  EXECUTE FUNCTION set_report_timestamp();

-- Add helpful comment
COMMENT ON TABLE ai_message_logs IS 'Stores all AI chat messages for analytics and advanced analysis. Messages are never truly deleted - users can only soft delete (hide from their view). Admins can see all messages.';
COMMENT ON COLUMN ai_message_logs.user_deleted IS 'When TRUE, message is hidden from user view but preserved for admin analysis';
COMMENT ON COLUMN ai_message_logs.metadata IS 'Flexible JSON field for storing additional message metadata (sources, cross-references, etc.)';

