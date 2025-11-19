-- Migration: Fix function search_path security issues
-- Sets explicit search_path to prevent search path manipulation attacks

-- Fix update_research_notebook_shares_updated_at function
CREATE OR REPLACE FUNCTION update_research_notebook_shares_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix create_share_link function
CREATE OR REPLACE FUNCTION create_share_link(
  p_notebook_id UUID,
  p_user_id UUID,
  p_permission TEXT DEFAULT 'viewer'
)
RETURNS TEXT 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_share_link(UUID, UUID, TEXT) TO authenticated;

