-- Migration: Add Collaboration and Sharing Features for Research Lab
-- This migration adds tables and columns for sharing notebooks with other users

-- Add sharing columns to research_notebooks table
ALTER TABLE research_notebooks
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS share_settings JSONB DEFAULT '{"access_type": "restricted", "allow_link_sharing": false}'::jsonb;

-- Create research_notebook_shares table
CREATE TABLE IF NOT EXISTS research_notebook_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  notebook_id UUID NOT NULL REFERENCES research_notebooks(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- nullable for link sharing
  permission TEXT NOT NULL CHECK (permission IN ('owner', 'editor', 'viewer')),
  access_type TEXT NOT NULL CHECK (access_type IN ('user', 'link')) DEFAULT 'user',
  share_token TEXT UNIQUE, -- for link sharing, nullable
  notify_user BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique user shares per notebook
  CONSTRAINT unique_user_share UNIQUE (notebook_id, shared_with) WHERE shared_with IS NOT NULL,
  -- Ensure unique link shares per notebook
  CONSTRAINT unique_link_share UNIQUE (notebook_id, share_token) WHERE share_token IS NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notebook_shares_notebook_id ON research_notebook_shares(notebook_id);
CREATE INDEX IF NOT EXISTS idx_notebook_shares_shared_with ON research_notebook_shares(shared_with);
CREATE INDEX IF NOT EXISTS idx_notebook_shares_shared_by ON research_notebook_shares(shared_by);
CREATE INDEX IF NOT EXISTS idx_notebook_shares_token ON research_notebook_shares(share_token) WHERE share_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notebook_shares_access_type ON research_notebook_shares(access_type);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_research_notebook_shares_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_research_notebook_shares_updated_at
  BEFORE UPDATE ON research_notebook_shares
  FOR EACH ROW
  EXECUTE FUNCTION update_research_notebook_shares_updated_at();

-- Enable Row Level Security
ALTER TABLE research_notebook_shares ENABLE ROW LEVEL SECURITY;

-- RLS Policies for research_notebook_shares

-- Policy: Users can view shares for notebooks they own or are shared with
CREATE POLICY "Users can view their notebook shares"
  ON research_notebook_shares
  FOR SELECT
  USING (
    -- Owner of the notebook
    EXISTS (
      SELECT 1 FROM research_notebooks
      WHERE research_notebooks.id = research_notebook_shares.notebook_id
      AND research_notebooks.user_id = auth.uid()
    )
    OR
    -- Shared with this user
    shared_with = auth.uid()
    OR
    -- User who created the share
    shared_by = auth.uid()
  );

-- Policy: Users can create shares for notebooks they own
CREATE POLICY "Users can create shares for their notebooks"
  ON research_notebook_shares
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM research_notebooks
      WHERE research_notebooks.id = research_notebook_shares.notebook_id
      AND research_notebooks.user_id = auth.uid()
    )
    AND shared_by = auth.uid()
  );

-- Policy: Users can update shares for notebooks they own
CREATE POLICY "Users can update shares for their notebooks"
  ON research_notebook_shares
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM research_notebooks
      WHERE research_notebooks.id = research_notebook_shares.notebook_id
      AND research_notebooks.user_id = auth.uid()
    )
  );

-- Policy: Users can delete shares for notebooks they own, or their own share access
CREATE POLICY "Users can delete shares for their notebooks or their own access"
  ON research_notebook_shares
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM research_notebooks
      WHERE research_notebooks.id = research_notebook_shares.notebook_id
      AND research_notebooks.user_id = auth.uid()
    )
    OR
    shared_with = auth.uid()
  );

-- Function to generate share token
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TEXT AS $$
DECLARE
  token TEXT;
BEGIN
  -- Generate a random token (32 characters, alphanumeric)
  token := upper(
    encode(
      gen_random_bytes(16),
      'base64'
    )
  );
  -- Remove any special characters and limit to 32 chars
  token := regexp_replace(token, '[^A-Z0-9]', '', 'g');
  token := substring(token from 1 for 32);
  
  RETURN token;
END;
$$ LANGUAGE plpgsql;

-- Function to create a share link
CREATE OR REPLACE FUNCTION create_share_link(
  p_notebook_id UUID,
  p_user_id UUID,
  p_permission TEXT DEFAULT 'viewer'
)
RETURNS TEXT AS $$
DECLARE
  v_token TEXT;
  v_share_id UUID;
BEGIN
  -- Check if user owns the notebook
  IF NOT EXISTS (
    SELECT 1 FROM research_notebooks
    WHERE id = p_notebook_id AND user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'User does not own this notebook';
  END IF;

  -- Generate unique token
  LOOP
    v_token := generate_share_token();
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM research_notebook_shares
      WHERE share_token = v_token
    );
  END LOOP;

  -- Create share record
  INSERT INTO research_notebook_shares (
    notebook_id,
    shared_by,
    permission,
    access_type,
    share_token,
    notify_user
  ) VALUES (
    p_notebook_id,
    p_user_id,
    p_permission,
    'link',
    v_token,
    FALSE
  ) RETURNING id INTO v_share_id;

  RETURN v_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_share_link(UUID, UUID, TEXT) TO authenticated;

-- Comments for documentation
COMMENT ON TABLE research_notebook_shares IS 'Stores sharing relationships for research notebooks';
COMMENT ON COLUMN research_notebook_shares.notebook_id IS 'The notebook being shared';
COMMENT ON COLUMN research_notebook_shares.shared_by IS 'User who created the share';
COMMENT ON COLUMN research_notebook_shares.shared_with IS 'User with whom notebook is shared (null for link shares)';
COMMENT ON COLUMN research_notebook_shares.permission IS 'Permission level: owner, editor, or viewer';
COMMENT ON COLUMN research_notebook_shares.access_type IS 'Type of share: user (direct) or link (via token)';
COMMENT ON COLUMN research_notebook_shares.share_token IS 'Unique token for link-based sharing';
COMMENT ON COLUMN research_notebook_shares.notify_user IS 'Whether to notify the shared user';

