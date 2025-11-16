-- Enhanced Profiles Table for High-Value Data Insights
-- Adds geographic, demographic, ministry, and subscription data for analytics

-- 1. Add Geographic Data Columns
DO $$
BEGIN
  -- Country
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'country'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN country TEXT;
    RAISE NOTICE 'Added country column';
  END IF;

  -- State/Province
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'state_province'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN state_province TEXT;
    RAISE NOTICE 'Added state_province column';
  END IF;

  -- City
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'city'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN city TEXT;
    RAISE NOTICE 'Added city column';
  END IF;

  -- Timezone
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'timezone'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN timezone TEXT;
    RAISE NOTICE 'Added timezone column';
  END IF;
END $$;

-- 2. Add Demographic Data Columns
DO $$
BEGIN
  -- Gender
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'gender'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN gender TEXT 
      CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say') OR gender IS NULL);
    RAISE NOTICE 'Added gender column';
  END IF;

  -- Education Level
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'education_level'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN education_level TEXT 
      CHECK (education_level IN ('high_school', 'bachelor', 'master', 'phd', 'other') OR education_level IS NULL);
    RAISE NOTICE 'Added education_level column';
  END IF;

  -- Occupation
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'occupation'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN occupation TEXT;
    RAISE NOTICE 'Added occupation column';
  END IF;

  -- Ministry Role
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'ministry_role'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN ministry_role TEXT;
    RAISE NOTICE 'Added ministry_role column';
  END IF;
END $$;

-- 3. Add Bible Study Background Columns
DO $$
BEGIN
  -- Years Studying Bible
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'years_studying_bible'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN years_studying_bible INTEGER 
      CHECK (years_studying_bible >= 0 OR years_studying_bible IS NULL);
    RAISE NOTICE 'Added years_studying_bible column';
  END IF;

  -- Bible Study Frequency
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'bible_study_frequency'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN bible_study_frequency TEXT 
      CHECK (bible_study_frequency IN ('daily', 'weekly', 'monthly', 'occasionally') OR bible_study_frequency IS NULL);
    RAISE NOTICE 'Added bible_study_frequency column';
  END IF;

  -- Study Method Preference
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'study_method_preference'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN study_method_preference TEXT;
    RAISE NOTICE 'Added study_method_preference column';
  END IF;

  -- Preferred Study Time
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'preferred_study_time'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN preferred_study_time TEXT 
      CHECK (preferred_study_time IN ('morning', 'afternoon', 'evening', 'night') OR preferred_study_time IS NULL);
    RAISE NOTICE 'Added preferred_study_time column';
  END IF;
END $$;

-- 4. Add Engagement Preferences Columns
DO $$
BEGIN
  -- Notification Preferences (JSONB)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'notification_preferences'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN notification_preferences JSONB DEFAULT '{}'::jsonb;
    RAISE NOTICE 'Added notification_preferences column';
  END IF;

  -- Email Marketing Opt-in
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'email_marketing_opt_in'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN email_marketing_opt_in BOOLEAN DEFAULT FALSE;
    RAISE NOTICE 'Added email_marketing_opt_in column';
  END IF;

  -- Data Analytics Consent (GDPR compliance)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'data_analytics_consent'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN data_analytics_consent BOOLEAN DEFAULT FALSE;
    RAISE NOTICE 'Added data_analytics_consent column';
  END IF;
END $$;

-- 5. Add Device & Technical Columns
DO $$
BEGIN
  -- Device Type
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'device_type'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN device_type TEXT;
    RAISE NOTICE 'Added device_type column';
  END IF;

  -- OS Type
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'os_type'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN os_type TEXT;
    RAISE NOTICE 'Added os_type column';
  END IF;

  -- Browser Type
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'browser_type'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN browser_type TEXT;
    RAISE NOTICE 'Added browser_type column';
  END IF;
END $$;

-- 6. Add Subscription & Monetization Columns
DO $$
BEGIN
  -- Subscription Tier
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'subscription_tier'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN subscription_tier TEXT DEFAULT 'free' 
      CHECK (subscription_tier IN ('free', 'basic', 'premium', 'enterprise') OR subscription_tier IS NULL);
    RAISE NOTICE 'Added subscription_tier column';
  END IF;

  -- Subscription Start Date
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'subscription_start_date'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN subscription_start_date TIMESTAMPTZ;
    RAISE NOTICE 'Added subscription_start_date column';
  END IF;

  -- Subscription End Date
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'subscription_end_date'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN subscription_end_date TIMESTAMPTZ;
    RAISE NOTICE 'Added subscription_end_date column';
  END IF;

  -- Lifetime Value
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'lifetime_value'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN lifetime_value DECIMAL(10,2) DEFAULT 0.00 
      CHECK (lifetime_value >= 0);
    RAISE NOTICE 'Added lifetime_value column';
  END IF;
END $$;

-- 7. Add Referral & Acquisition Columns
DO $$
BEGIN
  -- Referral Source
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'referral_source'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN referral_source TEXT;
    RAISE NOTICE 'Added referral_source column';
  END IF;

  -- Referral Code
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'referral_code'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN referral_code TEXT;
    RAISE NOTICE 'Added referral_code column';
  END IF;

  -- UTM Source
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'utm_source'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN utm_source TEXT;
    RAISE NOTICE 'Added utm_source column';
  END IF;

  -- UTM Medium
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'utm_medium'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN utm_medium TEXT;
    RAISE NOTICE 'Added utm_medium column';
  END IF;

  -- UTM Campaign
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'utm_campaign'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN utm_campaign TEXT;
    RAISE NOTICE 'Added utm_campaign column';
  END IF;

  -- Signup Device
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'signup_device'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN signup_device TEXT;
    RAISE NOTICE 'Added signup_device column';
  END IF;
END $$;

-- 8. Create Indexes for Analytics Queries
CREATE INDEX IF NOT EXISTS idx_profiles_country ON public.profiles(country);
CREATE INDEX IF NOT EXISTS idx_profiles_state_province ON public.profiles(state_province);
CREATE INDEX IF NOT EXISTS idx_profiles_gender ON public.profiles(gender);
CREATE INDEX IF NOT EXISTS idx_profiles_education_level ON public.profiles(education_level);
CREATE INDEX IF NOT EXISTS idx_profiles_ministry_role ON public.profiles(ministry_role);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON public.profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_source ON public.profiles(referral_source);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);

-- Composite indexes for common analytics queries
CREATE INDEX IF NOT EXISTS idx_profiles_country_created ON public.profiles(country, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_tier_created ON public.profiles(subscription_tier, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_ministry_age ON public.profiles(ministry_role, age);

-- Add helpful comments
COMMENT ON COLUMN public.profiles.country IS 'User country for geographic analytics';
COMMENT ON COLUMN public.profiles.subscription_tier IS 'User subscription tier: free, basic, premium, enterprise';
COMMENT ON COLUMN public.profiles.lifetime_value IS 'Total revenue generated from this user';
COMMENT ON COLUMN public.profiles.referral_source IS 'Source of user acquisition (direct, google, facebook, referral_code, etc.)';
COMMENT ON COLUMN public.profiles.data_analytics_consent IS 'GDPR/CCPA consent for data analytics usage';

