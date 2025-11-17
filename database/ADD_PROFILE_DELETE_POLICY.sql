-- ========================================
-- ADD DELETE POLICY FOR PROFILES TABLE
-- ========================================
-- This allows users to delete their own profile when deleting their account

-- Add DELETE policy for profiles table
CREATE POLICY IF NOT EXISTS "Users can delete own profile" ON public.profiles
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Verify the policy was created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles' AND policyname = 'Users can delete own profile';

