-- ========================================
-- FIX DATABASE FOR SIMPLIFIED SIGNUP FLOW
-- Updated to work with email/password only signup
-- Profile completion handled via popup modal after signup
-- ========================================

BEGIN;

-- ========================================
-- FIX 1: Ensure all profile fields are nullable
-- ========================================

-- Make sure all fields that are collected in the popup modal are nullable
-- (They will be filled in later via the profile completion modal)

DO $$ 
BEGIN
  -- Make phone_number nullable if it isn't already
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'phone_number'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.profiles ALTER COLUMN phone_number DROP NOT NULL;
    RAISE NOTICE 'Made phone_number nullable';
  END IF;

  -- Make age nullable if it isn't already
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'age'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.profiles ALTER COLUMN age DROP NOT NULL;
    RAISE NOTICE 'Made age nullable';
  END IF;

  -- Make display_name nullable if it isn't already (will use email as fallback)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'display_name'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.profiles ALTER COLUMN display_name DROP NOT NULL;
    RAISE NOTICE 'Made display_name nullable';
  END IF;

  -- Make denomination nullable if it isn't already
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'denomination'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.profiles ALTER COLUMN denomination DROP NOT NULL;
    RAISE NOTICE 'Made denomination nullable';
  END IF;

  -- Ensure agreed_to_terms, agreed_to_privacy, is_over_13 default to false (not null)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'agreed_to_terms'
  ) THEN
    ALTER TABLE public.profiles 
      ALTER COLUMN agreed_to_terms SET DEFAULT false,
      ALTER COLUMN agreed_to_terms SET NOT NULL;
    UPDATE public.profiles SET agreed_to_terms = false WHERE agreed_to_terms IS NULL;
    RAISE NOTICE 'Set agreed_to_terms default to false';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'agreed_to_privacy'
  ) THEN
    ALTER TABLE public.profiles 
      ALTER COLUMN agreed_to_privacy SET DEFAULT false,
      ALTER COLUMN agreed_to_privacy SET NOT NULL;
    UPDATE public.profiles SET agreed_to_privacy = false WHERE agreed_to_privacy IS NULL;
    RAISE NOTICE 'Set agreed_to_privacy default to false';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'is_over_13'
  ) THEN
    ALTER TABLE public.profiles 
      ALTER COLUMN is_over_13 SET DEFAULT false,
      ALTER COLUMN is_over_13 SET NOT NULL;
    UPDATE public.profiles SET is_over_13 = false WHERE is_over_13 IS NULL;
    RAISE NOTICE 'Set is_over_13 default to false';
  END IF;
END $$;

-- ========================================
-- FIX 2: Update RLS Policies
-- ========================================

-- Remove duplicate policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow trigger to create profiles" ON public.profiles;

-- Create clean RLS policies
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND deleted_at IS NULL)
  WITH CHECK (auth.uid() = user_id AND deleted_at IS NULL);

-- Allow trigger to create profiles (SECURITY DEFINER bypasses RLS, but explicit is better)
CREATE POLICY "Allow trigger to create profiles" ON public.profiles
  FOR INSERT
  WITH CHECK (true);

-- ========================================
-- FIX 3: Update Trigger Function for Simplified Signup
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
  v_display_name TEXT;
  v_avatar_url TEXT;
BEGIN
  -- CRITICAL: Always return NEW at the end to never block authentication
  -- Even if everything fails, auth should succeed
  
  BEGIN
    -- Use advisory lock to prevent race conditions with frontend
    PERFORM pg_advisory_xact_lock(hashtext(NEW.id::text));
    
    -- Safely check if profile exists
    BEGIN
      SELECT EXISTS(
        SELECT 1 FROM public.profiles WHERE user_id = NEW.id
      ) INTO profile_exists;
    EXCEPTION WHEN OTHERS THEN
      profile_exists := false;
    END;
    
    -- If profile exists, check if it's soft-deleted
    IF profile_exists THEN
      BEGIN
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
            -- Safely extract display name from email or metadata
            v_display_name := COALESCE(
              NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
              NULLIF(NEW.raw_user_meta_data->>'name', ''),
              NULLIF(NEW.raw_user_meta_data->>'display_name', ''),
              NULLIF(NEW.user_metadata->>'full_name', ''),
              NULLIF(NEW.user_metadata->>'name', ''),
              NULLIF(NEW.user_metadata->>'display_name', ''),
              split_part(COALESCE(NEW.email, 'user'), '@', 1),
              'Bible Aura Member'
            );
            
            -- Safely extract avatar URL
            v_avatar_url := COALESCE(
              NULLIF(NEW.raw_user_meta_data->>'avatar_url', ''),
              NULLIF(NEW.raw_user_meta_data->>'picture', ''),
              NULLIF(NEW.user_metadata->>'avatar_url', ''),
              NULLIF(NEW.user_metadata->>'picture', ''),
              NULL
            );
            
            UPDATE public.profiles
            SET 
              deleted_at = NULL,
              updated_at = NOW(),
              display_name = COALESCE(v_display_name, display_name, split_part(COALESCE(NEW.email, 'user'), '@', 1), 'Bible Aura Member'),
              avatar_url = COALESCE(v_avatar_url, avatar_url)
            WHERE user_id = NEW.id;
          EXCEPTION WHEN OTHERS THEN
            -- Silently fail - don't log anything
            NULL;
          END;
        END IF;
      EXCEPTION WHEN OTHERS THEN
        -- Silently continue
        NULL;
      END;
      
      -- Profile exists (and is now restored if needed), nothing to do
      RETURN NEW;
    END IF;
    
    -- Profile doesn't exist, create it with minimal data
    -- All other fields will be filled via profile completion modal
    BEGIN
      -- Safely extract values with proper defaults
      v_display_name := COALESCE(
        NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
        NULLIF(NEW.raw_user_meta_data->>'name', ''),
        NULLIF(NEW.raw_user_meta_data->>'display_name', ''),
        NULLIF(NEW.user_metadata->>'full_name', ''),
        NULLIF(NEW.user_metadata->>'name', ''),
        NULLIF(NEW.user_metadata->>'display_name', ''),
        split_part(COALESCE(NEW.email, 'user'), '@', 1),
        'Bible Aura Member'
      );
      
      v_avatar_url := COALESCE(
        NULLIF(NEW.raw_user_meta_data->>'avatar_url', ''),
        NULLIF(NEW.raw_user_meta_data->>'picture', ''),
        NULLIF(NEW.user_metadata->>'avatar_url', ''),
        NULLIF(NEW.user_metadata->>'picture', ''),
        NULL
      );
      
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
        v_display_name,
        v_avatar_url,
        NULL, -- Will be filled in profile completion modal
        NULL, -- Will be filled in profile completion modal
        NULL, -- Will be filled in profile completion modal
        false, -- Will be set in profile completion modal
        false, -- Will be set in profile completion modal
        false, -- Will be set in profile completion modal
        'ESV', -- Default translation
        0,
        0
      )
      ON CONFLICT (user_id) DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
      -- Silently fail - don't log anything
      NULL;
    END;
    
  EXCEPTION WHEN OTHERS THEN
    -- Catch ALL errors at the top level - silently
    NULL;
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

-- ========================================
-- Verification Queries
-- ========================================

SELECT 
  'RLS Policies' as check_type,
  COUNT(*) as total_policies
FROM pg_policies
WHERE tablename = 'profiles' AND schemaname = 'public';

SELECT 
  'Trigger Status' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.triggers 
      WHERE trigger_name = 'on_auth_user_created'
      AND event_object_table = 'users'
      AND event_object_schema = 'auth'
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

SELECT 
  'Nullable Fields Check' as check_type,
  CASE 
    WHEN (
      SELECT is_nullable FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'phone_number'
    ) = 'YES'
    AND (
      SELECT is_nullable FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'age'
    ) = 'YES'
    AND (
      SELECT is_nullable FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'denomination'
    ) = 'YES'
    THEN 'All required fields are nullable ✓'
    ELSE 'Some fields need to be nullable'
  END as status;

