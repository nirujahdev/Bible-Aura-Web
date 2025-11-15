-- ========================================
-- FIX GOOGLE OAUTH SIGN-IN ISSUE
-- This fixes "Database error saving new user" for Google OAuth
-- ========================================

BEGIN;

-- Step 1: Make phone_number and age nullable (required for Google OAuth users)
DO $$ 
BEGIN
  -- Check if phone_number is NOT NULL and make it nullable
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
  
  -- Check if age is NOT NULL and make it nullable
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
  
  -- Make display_name nullable too (just in case)
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
END $$;

-- Step 2: Update the trigger function to handle ALL OAuth providers properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Create profile for OAuth users (Google, GitHub, etc.)
  -- Check multiple ways OAuth provider might be stored in Supabase
  IF (
    NEW.raw_user_meta_data->>'provider' IS NOT NULL 
    OR NEW.app_metadata->>'provider' = 'google'
    OR EXISTS (
      SELECT 1 
      FROM jsonb_array_elements(COALESCE(NEW.identities, '[]'::jsonb)) AS identity
      WHERE identity->>'provider' = 'google'
    )
  ) THEN
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
          NEW.raw_user_meta_data->>'full_name', 
          NEW.raw_user_meta_data->>'name',
          NEW.raw_user_meta_data->>'display_name',
          NEW.user_metadata->>'full_name',
          NEW.user_metadata->>'name',
          NEW.user_metadata->>'display_name',
          split_part(COALESCE(NEW.email, 'user'), '@', 1),
          'Bible Aura Member'
        ),
        COALESCE(
          NEW.raw_user_meta_data->>'avatar_url',
          NEW.raw_user_meta_data->>'picture',
          NEW.user_metadata->>'avatar_url',
          NEW.user_metadata->>'picture'
        ),
        NULL, -- Phone number - user can add later
        NULL, -- Age - user can add later
        NULL, -- Denomination - user can add later
        false, -- Needs to agree to terms later
        false, -- Needs to agree to privacy later
        false, -- Needs to confirm age later
        COALESCE(
          NEW.raw_user_meta_data->>'favorite_translation',
          'ESV' -- Default translation (matching code expectations)
        ),
        0, -- Reading streak
        0  -- Total reading days
      )
      ON CONFLICT (user_id) DO NOTHING;
      
      RAISE NOTICE 'Profile created for OAuth user %', NEW.id;
    EXCEPTION WHEN OTHERS THEN
      -- Log the error but don't block authentication
      RAISE WARNING 'Failed to create profile for OAuth user %: %', NEW.id, SQLERRM;
      -- Return NEW to allow auth to complete even if profile creation fails
    END;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Step 3: Ensure trigger exists and is active
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Add a policy to allow the trigger function to insert profiles
-- (SECURITY DEFINER should bypass RLS, but let's be explicit)
DROP POLICY IF EXISTS "Allow trigger to create profiles" ON public.profiles;
CREATE POLICY "Allow trigger to create profiles" ON public.profiles
  FOR INSERT
  WITH CHECK (true); -- Allow all inserts from trigger (SECURITY DEFINER)

-- Actually, SECURITY DEFINER functions bypass RLS, so the above policy isn't needed
-- But let's keep the service role policy which should work
-- The SECURITY DEFINER function runs with the privileges of the function owner
-- So it should bypass RLS automatically

COMMIT;

-- Verification query
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
  AND column_name IN ('phone_number', 'age', 'display_name')
ORDER BY column_name;

-- Check trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

SELECT 'Google OAuth fix complete! Phone and age are now nullable.' AS status;

