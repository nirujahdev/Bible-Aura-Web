-- =====================================================
-- DROP TABLES: Remove Tables for Deleted Features
-- Bible Aura - Drop tables for subscriptions, journals, community
-- =====================================================
-- 
-- WARNING: This script will DROP (delete) entire tables!
-- Make sure you've backed up any important data first!
-- =====================================================

BEGIN;

-- =====================================================
-- 1. DROP SUBSCRIPTION & PAYMENT TABLES
-- =====================================================

DROP TABLE IF EXISTS public.payment_history CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;

-- =====================================================
-- 2. DROP JOURNAL TABLES
-- =====================================================

DROP TABLE IF EXISTS public.journal_categories CASCADE;
DROP TABLE IF EXISTS public.journal_entries CASCADE;

-- =====================================================
-- 3. DROP COMMUNITY TABLES
-- =====================================================

DROP TABLE IF EXISTS public.event_attendees CASCADE;
DROP TABLE IF EXISTS public.community_events CASCADE;
DROP TABLE IF EXISTS public.prayer_interactions CASCADE;
DROP TABLE IF EXISTS public.prayer_requests CASCADE;
DROP TABLE IF EXISTS public.discussion_likes CASCADE;
DROP TABLE IF EXISTS public.discussion_comments CASCADE;
DROP TABLE IF EXISTS public.community_discussions CASCADE;
DROP TABLE IF EXISTS public.group_discussions CASCADE;
DROP TABLE IF EXISTS public.group_memberships CASCADE;
DROP TABLE IF EXISTS public.community_groups CASCADE;

-- =====================================================
-- 4. DROP STUDY HUB TABLES (if not used elsewhere)
-- =====================================================
-- Uncomment these if you want to remove reading plans entirely
-- DROP TABLE IF EXISTS public.reading_progress CASCADE;
-- DROP TABLE IF EXISTS public.reading_plans CASCADE;

COMMIT;

-- =====================================================
-- VERIFY TABLES ARE DROPPED
-- =====================================================

DO $$ 
DECLARE
    table_exists BOOLEAN;
BEGIN
    -- Check if subscription table exists
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'subscriptions'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE 'WARNING: subscriptions table still exists!';
    ELSE
        RAISE NOTICE '✓ subscriptions table dropped successfully';
    END IF;
    
    -- Check if journal_entries table exists
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'journal_entries'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE 'WARNING: journal_entries table still exists!';
    ELSE
        RAISE NOTICE '✓ journal_entries table dropped successfully';
    END IF;
    
    -- Check if community_discussions table exists
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'community_discussions'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE 'WARNING: community_discussions table still exists!';
    ELSE
        RAISE NOTICE '✓ community_discussions table dropped successfully';
    END IF;
END $$;

