-- ========================================
-- FIX ALL NEW USER PROFILE CREATION ISSUES
-- Comprehensive fix for race conditions, RLS policies, and trigger conflicts
-- ========================================

BEGIN;

-- ========================================
-- FIX 1: Update RLS Policies
-- ========================================

-- Remove duplicate INSERT policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Keep only one clear INSERT policy for users
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Fix UPDATE policies to filter deleted_at
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create single UPDATE policy that filters deleted_at
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND deleted_at IS NULL)
  WITH CHECK (auth.uid() = user_id AND deleted_at IS NULL);

-- Fix SELECT policy to filter deleted profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Users can only read their own non-deleted profile
-- (Keep the existing "Users can read own profile" which already filters deleted_at)
-- But ensure it's the primary one
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Ensure trigger can always create profiles (SECURITY DEFINER bypasses RLS, but keep policy for clarity)
DROP POLICY IF EXISTS "Allow trigger to create profiles" ON public.profiles;
CREATE POLICY "Allow trigger to create profiles" ON public.profiles
  FOR INSERT
  WITH CHECK (true); -- SECURITY DEFINER function bypasses RLS anyway, but this is explicit

-- ========================================
-- FIX 2: Improve Trigger Function
-- ========================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  profile_exists BOOLEAN := false;
  is_deleted BOOLEAN := false;
  existing_profile_id UUID;
BEGIN
  -- CRITICAL: Always return NEW at the end to never block authentication
  -- Even if everything fails, auth should succeed
  
  BEGIN
    -- Use advisory lock to prevent race conditions with frontend
    -- Lock based on user_id hash to prevent concurrent profile creation
    PERFORM pg_advisory_xact_lock(hashtext(NEW.id::text));
    
    -- Check if profile exists (including soft-deleted) - use FOR UPDATE to lock row
    SELECT EXISTS(
      SELECT 1 FROM public.profiles WHERE user_id = NEW.id
    ) INTO profile_exists;
    
    -- If profile exists, check if it's soft-deleted and get its ID
    IF profile_exists THEN
      SELECT 
        id,
        (deleted_at IS NOT NULL) 
      INTO 
        existing_profile_id,
        is_deleted
      FROM public.profiles
      WHERE user_id = NEW.id
      FOR UPDATE
      LIMIT 1;
      
      -- If soft-deleted, restore it
      IF is_deleted THEN
        BEGIN
          UPDATE public.profiles
          SET 
            deleted_at = NULL,
            updated_at = NOW(),
            display_name = COALESCE(
              NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
              NULLIF(NEW.raw_user_meta_data->>'name', ''),
              NULLIF(NEW.raw_user_meta_data->>'display_name', ''),
              NULLIF(NEW.user_metadata->>'full_name', ''),
              NULLIF(NEW.user_metadata->>'name', ''),
              NULLIF(NEW.user_metadata->>'display_name', ''),
              display_name, -- Keep existing if no new data
              split_part(COALESCE(NEW.email, 'user'), '@', 1),
              'Bible Aura Member'
            ),
            avatar_url = COALESCE(
              NULLIF(NEW.raw_user_meta_data->>'avatar_url', ''),
              NULLIF(NEW.raw_user_meta_data->>'picture', ''),
              NULLIF(NEW.user_metadata->>'avatar_url', ''),
              NULLIF(NEW.user_metadata->>'picture', ''),
              avatar_url -- Keep existing if no new data
            )
          WHERE user_id = NEW.id;
          RAISE NOTICE 'Restored soft-deleted profile for user %', NEW.id;
        EXCEPTION WHEN OTHERS THEN
          RAISE WARNING 'Failed to restore profile: %', SQLERRM;
        END;
      END IF;
      
      -- Profile exists (and is now restored if needed), nothing to do
      RETURN NEW;
    END IF;
    
    -- Profile doesn't exist, create it
    BEGIN
      INSERT INTO public.profiles (
        user_id, 
        display_name,
        avatar_url,
        phone_number,
        age,
        denomination,
        agreed_to_terms,
        agreed_to_privacy,
        is_over_13,
        favorite_translation,
        reading_streak,
        total_reading_days
      )
      VALUES (
        NEW.id,
        COALESCE(
          NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
          NULLIF(NEW.raw_user_meta_data->>'name', ''),
          NULLIF(NEW.raw_user_meta_data->>'display_name', ''),
          NULLIF(NEW.user_metadata->>'full_name', ''),
          NULLIF(NEW.user_metadata->>'name', ''),
          NULLIF(NEW.user_metadata->>'display_name', ''),
          split_part(COALESCE(NEW.email, 'user'), '@', 1),
          'Bible Aura Member'
        ),
        COALESCE(
          NULLIF(NEW.raw_user_meta_data->>'avatar_url', ''),
          NULLIF(NEW.raw_user_meta_data->>'picture', ''),
          NULLIF(NEW.user_metadata->>'avatar_url', ''),
          NULLIF(NEW.user_metadata->>'picture', '')
        ),
        NULL,
        NULL,
        NULL,
        COALESCE(
          (NEW.raw_user_meta_data->>'agreed_to_terms')::boolean,
          (NEW.user_metadata->>'agreed_to_terms')::boolean,
          false
        ),
        COALESCE(
          (NEW.raw_user_meta_data->>'agreed_to_privacy')::boolean,
          (NEW.user_metadata->>'agreed_to_privacy')::boolean,
          false
        ),
        COALESCE(
          (NEW.raw_user_meta_data->>'is_over_13')::boolean,
          (NEW.user_metadata->>'is_over_13')::boolean,
          false
        ),
        COALESCE(
          NULLIF(NEW.raw_user_meta_data->>'favorite_translation', ''),
          NULLIF(NEW.user_metadata->>'favorite_translation', ''),
          'ESV'
        ),
        0,
        0
      )
      ON CONFLICT (user_id) DO NOTHING;
      
      RAISE NOTICE 'Profile created for user %', NEW.id;
    EXCEPTION WHEN OTHERS THEN
      -- Log error but NEVER fail
      RAISE WARNING 'Profile creation failed for user %: %', NEW.id, SQLERRM;
      -- Continue - don't block auth
    END;
    
  EXCEPTION WHEN OTHERS THEN
    -- Catch ALL errors at the top level
    RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
    -- Continue anyway
  END;
  
  -- ALWAYS return NEW to ensure authentication succeeds
  RETURN NEW;
END;
$$;

-- Verify trigger is active
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

COMMIT;

-- Verification queries
SELECT 
  'RLS Policies Fixed' as status,
  COUNT(*) as total_policies
FROM pg_policies
WHERE tablename = 'profiles' AND schemaname = 'public';

SELECT 
  'Trigger Status' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.triggers 
      WHERE trigger_name = 'on_auth_user_created'
    )
    THEN 'Trigger is active'
    ELSE 'Trigger missing'
  END as status;

SELECT 
  'Function Status' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc 
      WHERE proname = 'handle_new_user' 
      AND prosecdef = true
    )
    THEN 'Function is SECURITY DEFINER'
    ELSE 'Function not configured correctly'
  END as status;

