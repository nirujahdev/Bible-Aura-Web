-- =====================================================
-- CLEANUP SCRIPT: Remove Data from Deleted Features
-- Bible Aura - Clean up subscriptions, journals, community, etc.
-- =====================================================
-- 
-- WARNING: This script will DELETE ALL DATA from the following tables:
-- - Subscriptions and payment history
-- - Journal entries
-- - Community features (discussions, groups, events, prayer requests)
-- - Study hub related data
--
-- Run this script carefully and make sure you have backups!
-- =====================================================

BEGIN;

-- =====================================================
-- 1. SUBSCRIPTIONS & PAYMENTS
-- =====================================================

-- Delete payment history first (has foreign key to subscriptions)
DELETE FROM public.payment_history;

-- Delete subscriptions
DELETE FROM public.subscriptions;

-- Delete usage tracking related to subscriptions
DELETE FROM public.usage_tracking 
WHERE resource_type IN ('journal_entries', 'ai_chat', 'ai_analysis', 'audio_sermons');

-- =====================================================
-- 2. JOURNAL ENTRIES
-- =====================================================

-- Delete all journal entries
DELETE FROM public.journal_entries;

-- Delete journal categories if table exists
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'journal_categories') THEN
        DELETE FROM public.journal_categories;
    END IF;
END $$;

-- =====================================================
-- 3. COMMUNITY FEATURES
-- =====================================================

-- Delete community events attendees first
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'event_attendees') THEN
        DELETE FROM public.event_attendees;
    END IF;
END $$;

-- Delete community events
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'community_events') THEN
        DELETE FROM public.community_events;
    END IF;
END $$;

-- Delete prayer interactions
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'prayer_interactions') THEN
        DELETE FROM public.prayer_interactions;
    END IF;
END $$;

-- Delete prayer requests
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'prayer_requests') THEN
        DELETE FROM public.prayer_requests;
    END IF;
END $$;

-- Delete discussion likes
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'discussion_likes') THEN
        DELETE FROM public.discussion_likes;
    END IF;
END $$;

-- Delete discussion comments
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'discussion_comments') THEN
        DELETE FROM public.discussion_comments;
    END IF;
END $$;

-- Delete community discussions
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'community_discussions') THEN
        DELETE FROM public.community_discussions;
    END IF;
END $$;

-- Delete group discussions
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'group_discussions') THEN
        DELETE FROM public.group_discussions;
    END IF;
END $$;

-- Delete group memberships
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'group_memberships') THEN
        DELETE FROM public.group_memberships;
    END IF;
END $$;

-- Delete community groups
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'community_groups') THEN
        DELETE FROM public.community_groups;
    END IF;
END $$;

-- =====================================================
-- 4. STUDY HUB RELATED DATA
-- =====================================================

-- Delete reading progress (if related to study hub)
DELETE FROM public.reading_progress;

-- Delete reading plans (if related to study hub)
DELETE FROM public.reading_plans;

-- =====================================================
-- 5. VERIFY DELETIONS
-- =====================================================

-- Show counts after deletion (for verification)
DO $$ 
DECLARE
    subscription_count INTEGER;
    journal_count INTEGER;
    discussion_count INTEGER;
    group_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO subscription_count FROM public.subscriptions;
    SELECT COUNT(*) INTO journal_count FROM public.journal_entries;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'community_discussions') THEN
        SELECT COUNT(*) INTO discussion_count FROM public.community_discussions;
    ELSE
        discussion_count := 0;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'community_groups') THEN
        SELECT COUNT(*) INTO group_count FROM public.community_groups;
    ELSE
        group_count := 0;
    END IF;
    
    RAISE NOTICE 'Cleanup Summary:';
    RAISE NOTICE '  Subscriptions remaining: %', subscription_count;
    RAISE NOTICE '  Journal entries remaining: %', journal_count;
    RAISE NOTICE '  Community discussions remaining: %', discussion_count;
    RAISE NOTICE '  Community groups remaining: %', group_count;
END $$;

COMMIT;

-- =====================================================
-- OPTIONAL: DROP TABLES (Uncomment if you want to remove tables entirely)
-- =====================================================

/*
BEGIN;

-- Drop community tables
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

-- Drop subscription tables
DROP TABLE IF EXISTS public.payment_history CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;

-- Drop journal tables
DROP TABLE IF EXISTS public.journal_categories CASCADE;
DROP TABLE IF EXISTS public.journal_entries CASCADE;

-- Drop study hub tables (if not used elsewhere)
-- DROP TABLE IF EXISTS public.reading_progress CASCADE;
-- DROP TABLE IF EXISTS public.reading_plans CASCADE;

COMMIT;
*/

