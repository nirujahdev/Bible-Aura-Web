-- ========================================
-- SIMPLE DATABASE FIX FOR BIBLE AURA
-- Run this if the main setup script fails
-- ========================================

-- Step 1: Add missing columns to existing profiles table
DO $$ 
BEGIN
  -- Add phone_number column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'profiles' 
                 AND column_name = 'phone_number') THEN
    ALTER TABLE public.profiles ADD COLUMN phone_number TEXT;
    RAISE NOTICE 'Added phone_number column';
  END IF;
  
  -- Add age column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'profiles' 
                 AND column_name = 'age') THEN
    ALTER TABLE public.profiles ADD COLUMN age INTEGER;
    RAISE NOTICE 'Added age column';
  END IF;
  
  -- Add denomination column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'profiles' 
                 AND column_name = 'denomination') THEN
    ALTER TABLE public.profiles ADD COLUMN denomination TEXT;
    RAISE NOTICE 'Added denomination column';
  END IF;
  
  -- Add agreed_to_terms column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'profiles' 
                 AND column_name = 'agreed_to_terms') THEN
    ALTER TABLE public.profiles ADD COLUMN agreed_to_terms BOOLEAN DEFAULT false;
    RAISE NOTICE 'Added agreed_to_terms column';
  END IF;
  
  -- Add agreed_to_privacy column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'profiles' 
                 AND column_name = 'agreed_to_privacy') THEN
    ALTER TABLE public.profiles ADD COLUMN agreed_to_privacy BOOLEAN DEFAULT false;
    RAISE NOTICE 'Added agreed_to_privacy column';
  END IF;
  
  -- Add is_over_13 column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'profiles' 
                 AND column_name = 'is_over_13') THEN
    ALTER TABLE public.profiles ADD COLUMN is_over_13 BOOLEAN DEFAULT false;
    RAISE NOTICE 'Added is_over_13 column';
  END IF;
END $$;

-- Step 2: Enable RLS (if not already enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 3: Create/recreate RLS policies
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role full access" ON public.profiles;

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access" ON public.profiles
  FOR ALL 
  USING (auth.role() = 'service_role');

-- Step 4: Update the trigger function for Google OAuth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only auto-create profile for Google OAuth users
  IF NEW.raw_user_meta_data->>'provider' = 'google' THEN
    INSERT INTO public.profiles (
      user_id, 
      display_name,
      avatar_url,
      phone_number,
      age,
      denomination,
      agreed_to_terms,
      agreed_to_privacy,
      is_over_13
    )
    VALUES (
      NEW.id,
      COALESCE(
        NEW.raw_user_meta_data->>'full_name', 
        NEW.raw_user_meta_data->>'name', 
        split_part(NEW.email, '@', 1)
      ),
      NEW.raw_user_meta_data->>'avatar_url',
      NULL,
      NULL,
      NULL,
      false,
      false,
      false
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Done!
SELECT 'Database setup complete!' AS status;

