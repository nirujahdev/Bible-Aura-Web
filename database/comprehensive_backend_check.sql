-- =====================================================
-- BIBLE AURA COMMUNITY BACKEND - COMPREHENSIVE CHECK
-- This script verifies all backend functionality works
-- =====================================================

-- Enable NOTICE output
SET client_min_messages TO NOTICE;

DO $$
DECLARE
    table_exists BOOLEAN;
    policy_count INTEGER;
    function_count INTEGER;
    trigger_count INTEGER;
    index_count INTEGER;
    sample_user_id UUID := '00000000-0000-0000-0000-000000000001';
    sample_discussion_id UUID;
    sample_prayer_id UUID;
    sample_group_id UUID;
    sample_event_id UUID;
    rec RECORD;
BEGIN
    RAISE NOTICE '==========================================';
    RAISE NOTICE '🔍 BIBLE AURA COMMUNITY BACKEND CHECK';
    RAISE NOTICE '==========================================';
    RAISE NOTICE '';

    -- =====================================================
    -- 1. CHECK CORE TABLES EXIST
    -- =====================================================
    
    RAISE NOTICE '📊 CHECKING CORE TABLES:';
    
    -- Check community_discussions table
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'community_discussions'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE '  ✅ community_discussions - EXISTS';
        
        -- Check table structure
        SELECT COUNT(*) FROM information_schema.columns 
        WHERE table_name = 'community_discussions' INTO policy_count;
        RAISE NOTICE '      Columns: % fields', policy_count;
        
    ELSE
        RAISE NOTICE '  ❌ community_discussions - MISSING';
    END IF;
    
    -- Check discussion_comments table  
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'discussion_comments'
    ) INTO table_exists;
    
    RAISE NOTICE '  % discussion_comments - %', 
        CASE WHEN table_exists THEN '✅' ELSE '❌' END,
        CASE WHEN table_exists THEN 'EXISTS' ELSE 'MISSING' END;

    -- Check prayer_requests table
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'prayer_requests'  
    ) INTO table_exists;
    
    RAISE NOTICE '  % prayer_requests - %', 
        CASE WHEN table_exists THEN '✅' ELSE '❌' END,
        CASE WHEN table_exists THEN 'EXISTS' ELSE 'MISSING' END;

    -- Check community_groups table
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'community_groups'
    ) INTO table_exists;
    
    RAISE NOTICE '  % community_groups - %', 
        CASE WHEN table_exists THEN '✅' ELSE '❌' END,
        CASE WHEN table_exists THEN 'EXISTS' ELSE 'MISSING' END;

    -- Check community_events table  
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'community_events'
    ) INTO table_exists;
    
    RAISE NOTICE '  % community_events - %', 
        CASE WHEN table_exists THEN '✅' ELSE '❌' END,
        CASE WHEN table_exists THEN 'EXISTS' ELSE 'MISSING' END;

    -- Check community_profiles table
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'community_profiles'
    ) INTO table_exists;
    
    RAISE NOTICE '  % community_profiles - %', 
        CASE WHEN table_exists THEN '✅' ELSE '❌' END,
        CASE WHEN table_exists THEN 'EXISTS' ELSE 'MISSING' END;

    RAISE NOTICE '';

    -- =====================================================
    -- 2. CHECK RLS POLICIES
    -- =====================================================
    
    RAISE NOTICE '🔒 CHECKING ROW LEVEL SECURITY:';
    
    -- Count total RLS policies  
    SELECT COUNT(*) FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename LIKE '%community%' OR tablename LIKE '%prayer%' OR tablename LIKE '%discussion%'
    INTO policy_count;
    
    RAISE NOTICE '  ✅ RLS Policies: % active', policy_count;
    
    -- Check specific key policies
    SELECT EXISTS (
        SELECT FROM pg_policies 
        WHERE tablename = 'community_discussions' 
        AND policyname LIKE '%select%'
    ) INTO table_exists;
    
    RAISE NOTICE '  % Discussion Select Policy - %', 
        CASE WHEN table_exists THEN '✅' ELSE '❌' END,
        CASE WHEN table_exists THEN 'ACTIVE' ELSE 'MISSING' END;

    RAISE NOTICE '';

    -- =====================================================
    -- 3. CHECK FUNCTIONS AND TRIGGERS
    -- =====================================================
    
    RAISE NOTICE '⚙️ CHECKING FUNCTIONS & TRIGGERS:';
    
    -- Count functions
    SELECT COUNT(*) FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_type = 'FUNCTION' 
    AND routine_name LIKE '%community%' OR routine_name LIKE '%discussion%' OR routine_name LIKE '%update_%'
    INTO function_count;
    
    RAISE NOTICE '  ✅ Functions: % created', function_count;
    
    -- Count triggers  
    SELECT COUNT(*) FROM information_schema.triggers 
    WHERE trigger_schema = 'public'
    INTO trigger_count;
    
    RAISE NOTICE '  ✅ Triggers: % active', trigger_count;
    
    -- Check key functions exist
    SELECT EXISTS (
        SELECT FROM information_schema.routines 
        WHERE routine_name = 'update_discussion_counts'
    ) INTO table_exists;
    
    RAISE NOTICE '  % update_discussion_counts() - %', 
        CASE WHEN table_exists THEN '✅' ELSE '❌' END,
        CASE WHEN table_exists THEN 'EXISTS' ELSE 'MISSING' END;

    RAISE NOTICE '';

    -- =====================================================
    -- 4. CHECK PERFORMANCE INDEXES  
    -- =====================================================
    
    RAISE NOTICE '🚀 CHECKING PERFORMANCE INDEXES:';
    
    -- Count indexes
    SELECT COUNT(*) FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND indexname LIKE 'idx_%'
    INTO index_count;
    
    RAISE NOTICE '  ✅ Performance Indexes: % created', index_count;
    
    -- Check key indexes
    SELECT EXISTS (
        SELECT FROM pg_indexes 
        WHERE indexname = 'idx_discussions_user_id'
    ) INTO table_exists;
    
    RAISE NOTICE '  % idx_discussions_user_id - %', 
        CASE WHEN table_exists THEN '✅' ELSE '❌' END,
        CASE WHEN table_exists THEN 'EXISTS' ELSE 'MISSING' END;

    RAISE NOTICE '';

    -- =====================================================
    -- 5. TEST CORE OPERATIONS (DML)
    -- =====================================================
    
    RAISE NOTICE '🧪 TESTING CORE OPERATIONS:';
    
    -- Test 1: Insert Discussion (if user exists)
    BEGIN
        IF EXISTS (SELECT FROM auth.users LIMIT 1) THEN
            SELECT id INTO sample_user_id FROM auth.users LIMIT 1;
            
            INSERT INTO community_discussions (user_id, title, content, discussion_type, tags)
            VALUES (sample_user_id, 'Backend Test Discussion', 'Testing backend functionality', 'general', ARRAY['test', 'backend'])
            RETURNING id INTO sample_discussion_id;
            
            RAISE NOTICE '  ✅ Discussion Insert - SUCCESS (ID: %)', sample_discussion_id;
        ELSE
            RAISE NOTICE '  ⚠️  Discussion Insert - SKIPPED (No users in auth.users)';
        END IF;
    EXCEPTION WHEN others THEN
        RAISE NOTICE '  ❌ Discussion Insert - FAILED: %', SQLERRM;
    END;
    
    -- Test 2: Insert Prayer Request  
    BEGIN
        IF sample_user_id IS NOT NULL THEN
            INSERT INTO prayer_requests (user_id, title, content, category, urgency)
            VALUES (sample_user_id, 'Backend Test Prayer', 'Testing prayer functionality', 'general', 'normal')
            RETURNING id INTO sample_prayer_id;
            
            RAISE NOTICE '  ✅ Prayer Request Insert - SUCCESS (ID: %)', sample_prayer_id;
        END IF;
    EXCEPTION WHEN others THEN
        RAISE NOTICE '  ❌ Prayer Request Insert - FAILED: %', SQLERRM;
    END;
    
    -- Test 3: Insert Community Group
    BEGIN
        IF sample_user_id IS NOT NULL THEN
            INSERT INTO community_groups (leader_id, name, description, category)
            VALUES (sample_user_id, 'Backend Test Group', 'Testing group functionality', 'bible-study')
            RETURNING id INTO sample_group_id;
            
            RAISE NOTICE '  ✅ Community Group Insert - SUCCESS (ID: %)', sample_group_id;
        END IF;
    EXCEPTION WHEN others THEN
        RAISE NOTICE '  ❌ Community Group Insert - FAILED: %', SQLERRM;
    END;
    
    -- Test 4: Insert Community Event
    BEGIN
        IF sample_user_id IS NOT NULL THEN
            INSERT INTO community_events (host_id, title, description, event_date, event_time, event_type)
            VALUES (sample_user_id, 'Backend Test Event', 'Testing event functionality', CURRENT_DATE + INTERVAL '1 day', '10:00:00', 'bible-study')
            RETURNING id INTO sample_event_id;
            
            RAISE NOTICE '  ✅ Community Event Insert - SUCCESS (ID: %)', sample_event_id;
        END IF;
    EXCEPTION WHEN others THEN
        RAISE NOTICE '  ❌ Community Event Insert - FAILED: %', SQLERRM;
    END;

    RAISE NOTICE '';

    -- =====================================================
    -- 6. TEST RELATIONSHIPS & CONSTRAINTS
    -- =====================================================
    
    RAISE NOTICE '🔗 TESTING RELATIONSHIPS:';
    
    -- Test Discussion Comments (if discussion exists)
    BEGIN
        IF sample_discussion_id IS NOT NULL AND sample_user_id IS NOT NULL THEN
            INSERT INTO discussion_comments (discussion_id, user_id, content)
            VALUES (sample_discussion_id, sample_user_id, 'Test comment')
            RETURNING id INTO rec;
            
            RAISE NOTICE '  ✅ Discussion Comment - SUCCESS';
        END IF;
    EXCEPTION WHEN others THEN
        RAISE NOTICE '  ❌ Discussion Comment - FAILED: %', SQLERRM;
    END;
    
    -- Test Discussion Likes
    BEGIN
        IF sample_discussion_id IS NOT NULL AND sample_user_id IS NOT NULL THEN
            INSERT INTO discussion_likes (discussion_id, user_id)
            VALUES (sample_discussion_id, sample_user_id)
            RETURNING id INTO rec;
            
            RAISE NOTICE '  ✅ Discussion Like - SUCCESS';
        END IF;
    EXCEPTION WHEN others THEN
        RAISE NOTICE '  ❌ Discussion Like - FAILED: %', SQLERRM;
    END;
    
    -- Test Prayer Interactions  
    BEGIN
        IF sample_prayer_id IS NOT NULL AND sample_user_id IS NOT NULL THEN
            INSERT INTO prayer_interactions (prayer_request_id, user_id, prayer_type)
            VALUES (sample_prayer_id, sample_user_id, 'prayed')
            RETURNING id INTO rec;
            
            RAISE NOTICE '  ✅ Prayer Interaction - SUCCESS';
        END IF;
    EXCEPTION WHEN others THEN
        RAISE NOTICE '  ❌ Prayer Interaction - FAILED: %', SQLERRM;
    END;
    
    -- Test Group Membership
    BEGIN  
        IF sample_group_id IS NOT NULL AND sample_user_id IS NOT NULL THEN
            INSERT INTO group_memberships (group_id, user_id, role, status)
            VALUES (sample_group_id, sample_user_id, 'leader', 'active')
            RETURNING id INTO rec;
            
            RAISE NOTICE '  ✅ Group Membership - SUCCESS';
        END IF;
    EXCEPTION WHEN others THEN
        RAISE NOTICE '  ❌ Group Membership - FAILED: %', SQLERRM;
    END;
    
    -- Test Event RSVP
    BEGIN
        IF sample_event_id IS NOT NULL AND sample_user_id IS NOT NULL THEN
            INSERT INTO event_rsvps (event_id, user_id, rsvp_status)
            VALUES (sample_event_id, sample_user_id, 'going')
            RETURNING id INTO rec;
            
            RAISE NOTICE '  ✅ Event RSVP - SUCCESS';
        END IF;
    EXCEPTION WHEN others THEN
        RAISE NOTICE '  ❌ Event RSVP - FAILED: %', SQLERRM;
    END;

    RAISE NOTICE '';

    -- =====================================================
    -- 7. TEST AUTO-COUNTING TRIGGERS
    -- =====================================================
    
    RAISE NOTICE '🔄 TESTING AUTO-COUNTING:';
    
    -- Check if discussion counts updated
    IF sample_discussion_id IS NOT NULL THEN
        SELECT comments_count, likes_count 
        FROM community_discussions 
        WHERE id = sample_discussion_id 
        INTO rec;
        
        RAISE NOTICE '  ✅ Discussion Counts: Comments=%, Likes=%', rec.comments_count, rec.likes_count;
    END IF;
    
    -- Check if prayer counts updated  
    IF sample_prayer_id IS NOT NULL THEN
        SELECT prayer_count 
        FROM prayer_requests 
        WHERE id = sample_prayer_id 
        INTO rec;
        
        RAISE NOTICE '  ✅ Prayer Count: %', rec.prayer_count;
    END IF;
    
    -- Check if group counts updated
    IF sample_group_id IS NOT NULL THEN
        SELECT member_count 
        FROM community_groups 
        WHERE id = sample_group_id 
        INTO rec;
        
        RAISE NOTICE '  ✅ Group Member Count: %', rec.member_count;
    END IF;
    
    -- Check if event counts updated
    IF sample_event_id IS NOT NULL THEN
        SELECT attendee_count 
        FROM community_events 
        WHERE id = sample_event_id 
        INTO rec;
        
        RAISE NOTICE '  ✅ Event Attendee Count: %', rec.attendee_count;
    END IF;

    RAISE NOTICE '';

    -- =====================================================
    -- 8. TEST QUERY PERFORMANCE  
    -- =====================================================
    
    RAISE NOTICE '📈 TESTING QUERIES:';
    
    -- Test popular discussions view
    BEGIN
        SELECT COUNT(*) FROM popular_discussions INTO policy_count;
        RAISE NOTICE '  ✅ Popular Discussions View: % records', policy_count;
    EXCEPTION WHEN others THEN
        RAISE NOTICE '  ❌ Popular Discussions View - FAILED: %', SQLERRM;
    END;
    
    -- Test active prayer requests view
    BEGIN
        SELECT COUNT(*) FROM active_prayer_requests INTO policy_count;
        RAISE NOTICE '  ✅ Active Prayer Requests View: % records', policy_count;
    EXCEPTION WHEN others THEN
        RAISE NOTICE '  ❌ Active Prayer Requests View - FAILED: %', SQLERRM;
    END;
    
    -- Test upcoming events view
    BEGIN
        SELECT COUNT(*) FROM upcoming_events INTO policy_count;
        RAISE NOTICE '  ✅ Upcoming Events View: % records', policy_count;
    EXCEPTION WHEN others THEN
        RAISE NOTICE '  ❌ Upcoming Events View - FAILED: %', SQLERRM;
    END;
    
    -- Test community leaderboard view
    BEGIN
        SELECT COUNT(*) FROM community_leaderboard INTO policy_count;
        RAISE NOTICE '  ✅ Community Leaderboard View: % records', policy_count;
    EXCEPTION WHEN others THEN
        RAISE NOTICE '  ❌ Community Leaderboard View - FAILED: %', SQLERRM;
    END;

    RAISE NOTICE '';

    -- =====================================================
    -- 9. CLEANUP TEST DATA
    -- =====================================================
    
    RAISE NOTICE '🧹 CLEANING UP TEST DATA:';
    
    -- Clean up in reverse dependency order
    DELETE FROM event_rsvps WHERE event_id = sample_event_id;
    DELETE FROM group_memberships WHERE group_id = sample_group_id;
    DELETE FROM prayer_interactions WHERE prayer_request_id = sample_prayer_id;
    DELETE FROM discussion_likes WHERE discussion_id = sample_discussion_id;
    DELETE FROM discussion_comments WHERE discussion_id = sample_discussion_id;
    DELETE FROM community_events WHERE id = sample_event_id;
    DELETE FROM community_groups WHERE id = sample_group_id;
    DELETE FROM prayer_requests WHERE id = sample_prayer_id;
    DELETE FROM community_discussions WHERE id = sample_discussion_id;
    
    RAISE NOTICE '  ✅ Test data cleaned up';

    RAISE NOTICE '';

    -- =====================================================
    -- 10. FINAL SUMMARY
    -- =====================================================
    
    RAISE NOTICE '📋 BACKEND CHECK SUMMARY:';
    RAISE NOTICE '==========================================';
    
    -- Count total tables
    SELECT COUNT(*) FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND (table_name LIKE '%community%' OR table_name LIKE '%prayer%' OR table_name LIKE '%discussion%' OR table_name LIKE '%event%' OR table_name LIKE '%group%')
    INTO policy_count;
    
    RAISE NOTICE '  📊 Community Tables: %', policy_count;
    
    -- Count total policies
    SELECT COUNT(*) FROM pg_policies 
    WHERE schemaname = 'public'
    INTO policy_count;
    
    RAISE NOTICE '  🔒 RLS Policies: %', policy_count;
    
    -- Count functions
    SELECT COUNT(*) FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_type = 'FUNCTION'
    INTO function_count;
    
    RAISE NOTICE '  ⚙️  Functions: %', function_count;
    
    -- Count triggers
    SELECT COUNT(*) FROM information_schema.triggers 
    WHERE trigger_schema = 'public'
    INTO trigger_count;
    
    RAISE NOTICE '  🔄 Triggers: %', trigger_count;
    
    -- Count indexes
    SELECT COUNT(*) FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND indexname LIKE 'idx_%'
    INTO index_count;
    
    RAISE NOTICE '  🚀 Performance Indexes: %', index_count;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎉 COMMUNITY BACKEND CHECK COMPLETE!';
    RAISE NOTICE '==========================================';
    
END $$; 