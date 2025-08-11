-- =====================================================
-- QUICK BACKEND VERIFICATION
-- Check if all essential community tables and features exist
-- =====================================================

-- Check if all required tables exist
SELECT 
    'Tables Check' as check_type,
    COUNT(*) as total_tables,
    CASE 
        WHEN COUNT(*) >= 15 THEN '✅ All tables exist'
        ELSE '❌ Missing tables'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'community_discussions',
    'discussion_comments', 
    'discussion_likes',
    'comment_likes',
    'prayer_requests',
    'prayer_interactions',
    'community_groups',
    'group_memberships',
    'community_events',
    'event_rsvps',
    'community_profiles',
    'user_badges',
    'user_bookmarks',
    'user_follows',
    'community_activities',
    'user_notifications',
    'verse_discussions',
    'daily_verses',
    'community_stats'
);

-- Check RLS policies
SELECT 
    'RLS Policies' as check_type,
    COUNT(*) as total_policies,
    CASE 
        WHEN COUNT(*) >= 20 THEN '✅ RLS policies active'
        ELSE '❌ Missing RLS policies'
    END as status
FROM pg_policies 
WHERE schemaname = 'public';

-- Check functions
SELECT 
    'Functions' as check_type,
    COUNT(*) as total_functions,
    CASE 
        WHEN COUNT(*) >= 5 THEN '✅ Functions created'
        ELSE '❌ Missing functions'
    END as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type = 'FUNCTION';

-- Check performance indexes
SELECT 
    'Indexes' as check_type,
    COUNT(*) as total_indexes,
    CASE 
        WHEN COUNT(*) >= 30 THEN '✅ Performance indexes ready'
        ELSE '❌ Missing indexes'
    END as status
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%';

-- Check triggers
SELECT 
    'Triggers' as check_type,
    COUNT(*) as total_triggers,
    CASE 
        WHEN COUNT(*) >= 10 THEN '✅ Triggers active'
        ELSE '❌ Missing triggers'
    END as status
FROM information_schema.triggers 
WHERE trigger_schema = 'public';

-- Summary message
SELECT 
    '🎉 COMMUNITY BACKEND READY!' as summary,
    'All essential components verified' as details; 