-- ========================================
-- BIBLE AURA - COMPLETE PROFILE SETUP
-- ========================================

BEGIN;

-- 1. Drop existing profiles table to recreate with new fields
-- WARNING: This will delete all existing profile data!
-- Comment out this line if you want to preserve existing data
-- DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. Alter existing profiles table OR create new one
-- First, try to alter if table exists
DO $$ 
BEGIN
  -- Check if table exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    -- Add missing columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='phone_number') THEN
      ALTER TABLE public.profiles ADD COLUMN phone_number TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='age') THEN
      ALTER TABLE public.profiles ADD COLUMN age INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='denomination') THEN
      ALTER TABLE public.profiles ADD COLUMN denomination TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='agreed_to_terms') THEN
      ALTER TABLE public.profiles ADD COLUMN agreed_to_terms BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='agreed_to_privacy') THEN
      ALTER TABLE public.profiles ADD COLUMN agreed_to_privacy BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='is_over_13') THEN
      ALTER TABLE public.profiles ADD COLUMN is_over_13 BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='favorite_translation') THEN
      ALTER TABLE public.profiles ADD COLUMN favorite_translation TEXT DEFAULT 'KJV';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='reading_streak') THEN
      ALTER TABLE public.profiles ADD COLUMN reading_streak INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='total_reading_days') THEN
      ALTER TABLE public.profiles ADD COLUMN total_reading_days INTEGER DEFAULT 0;
    END IF;
    
    -- Add age constraint if it doesn't exist
    BEGIN
      ALTER TABLE public.profiles ADD CONSTRAINT age_positive CHECK (age > 0 AND age < 150);
    EXCEPTION WHEN duplicate_object THEN
      -- Constraint already exists, continue
      NULL;
    END;
    
  ELSE
    -- Table doesn't exist, create it
    CREATE TABLE public.profiles (
  -- Primary key (links to auth.users)
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- Required fields (marked with * in form)
  display_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  age INTEGER NOT NULL,
  
  -- Optional fields
  denomination TEXT,
  
  -- Additional profile fields
  avatar_url TEXT,
  bio TEXT,
  
  -- Agreement fields
  agreed_to_terms BOOLEAN DEFAULT false,
  agreed_to_privacy BOOLEAN DEFAULT false,
  is_over_13 BOOLEAN DEFAULT false,
  
  -- Preferences
  favorite_translation TEXT DEFAULT 'KJV',
  
  -- Reading stats
  reading_streak INTEGER DEFAULT 0,
  total_reading_days INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT age_positive CHECK (age > 0 AND age < 150)
    );
  END IF;
END $$;

-- 3. Create indexes for faster queries (IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON public.profiles(display_name);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);

-- 4. Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies if any
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role full access" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON public.profiles;

-- 6. Create RLS policies
-- Allow users to insert their own profile during signup
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Service role has full access (for admin operations)
CREATE POLICY "Service role full access" ON public.profiles
  FOR ALL 
  USING (auth.role() = 'service_role');

-- Optional: Allow authenticated users to view basic info of other users
-- (Uncomment if you want community features)
-- CREATE POLICY "Public profiles viewable by authenticated users" ON public.profiles
--   FOR SELECT 
--   USING (auth.role() = 'authenticated');

-- 7. Create function to handle new user registration (Google OAuth)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create profile for Google OAuth users (they bypass the signup form)
  -- Regular signups will create profile manually with all required fields
  IF NEW.raw_user_meta_data->>'provider' = 'google' THEN
    BEGIN
      INSERT INTO public.profiles (
        user_id, 
        display_name, 
        avatar_url,
        phone_number,
        age,
        agreed_to_terms,
        agreed_to_privacy,
        is_over_13
      )
      VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url',
        NULL, -- Phone number needs to be added later
        NULL, -- Age needs to be added later
        false, -- Needs to agree to terms
        false, -- Needs to agree to privacy
        false  -- Needs to confirm age
      );
    EXCEPTION WHEN OTHERS THEN
      -- Profile creation failed, but don't block auth
      RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create trigger (mainly for future compatibility)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 9. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Create trigger for updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 11. Create view for public profile info (optional, for community features)
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  user_id,
  display_name,
  avatar_url,
  bio,
  denomination,
  reading_streak,
  total_reading_days,
  created_at
FROM public.profiles;

COMMIT;

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Check if table was created successfully
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'profiles';

