-- =====================================================
-- TEST SCRIPT: Bible Bookmarks & Favorites Fix
-- Run this after applying the fix to verify everything works
-- =====================================================

-- STEP 1: Check if the tables exist
SELECT 
    'Table Existence Check' as test_name,
    CASE 
        WHEN (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'user_bible_bookmarks') = 1 
        THEN '✅ user_bible_bookmarks exists'
        ELSE '❌ user_bible_bookmarks missing'
    END as bookmarks_table,
    CASE 
        WHEN (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'user_bible_favorites') = 1 
        THEN '✅ user_bible_favorites exists'
        ELSE '❌ user_bible_favorites missing'
    END as favorites_table;

-- STEP 2: Check table schemas
SELECT 
    'Schema Check' as test_name,
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('user_bible_bookmarks', 'user_bible_favorites')
ORDER BY table_name, ordinal_position;

-- STEP 3: Check RLS policies
SELECT 
    'RLS Policies Check' as test_name,
    tablename,
    policyname,
    permissive,
    cmd,
    CASE 
        WHEN cmd IN ('SELECT', 'INSERT', 'UPDATE', 'DELETE') THEN '✅ Complete'
        ELSE '⚠️ Incomplete'
    END as status
FROM pg_policies 
WHERE tablename IN ('user_bible_bookmarks', 'user_bible_favorites')
ORDER BY tablename, cmd;

-- STEP 4: Check indexes
SELECT 
    'Indexes Check' as test_name,
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('user_bible_bookmarks', 'user_bible_favorites')
ORDER BY tablename, indexname;

-- STEP 5: Check grants/permissions
SELECT 
    'Permissions Check' as test_name,
    table_name,
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_name IN ('user_bible_bookmarks', 'user_bible_favorites')
AND grantee IN ('authenticated', 'service_role')
ORDER BY table_name, grantee, privilege_type;

-- STEP 6: Test insert (requires real user ID - replace with actual user ID for testing)
-- 
-- INSERT INTO user_bible_bookmarks (
--     user_id, 
--     verse_id, 
--     book_name, 
--     chapter, 
--     verse_number, 
--     verse_text, 
--     verse_reference, 
--     translation, 
--     category, 
--     highlight_color
-- ) VALUES (
--     'YOUR_USER_ID_HERE',  -- Replace with actual user ID
--     'John-3-16',
--     'John',
--     3,
--     16,
--     'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
--     'John 3:16',
--     'KJV',
--     'study',
--     'yellow'
-- );

-- STEP 7: Test favorite insert (requires real user ID)
-- 
-- INSERT INTO user_bible_favorites (
--     user_id, 
--     verse_id, 
--     book_name, 
--     chapter, 
--     verse_number, 
--     verse_text, 
--     verse_reference, 
--     translation
-- ) VALUES (
--     'YOUR_USER_ID_HERE',  -- Replace with actual user ID
--     'Philippians-4-13',
--     'Philippians',
--     4,
--     13,
--     'I can do all this through him who gives me strength.',
--     'Philippians 4:13',
--     'KJV'
-- );

-- STEP 8: Final validation summary
SELECT 
    'Final Summary' as test_name,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name IN ('user_bible_bookmarks', 'user_bible_favorites')) as tables_created,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename IN ('user_bible_bookmarks', 'user_bible_favorites')) as policies_created,
    (SELECT COUNT(*) FROM pg_indexes WHERE tablename IN ('user_bible_bookmarks', 'user_bible_favorites')) as indexes_created,
    CASE 
        WHEN (SELECT COUNT(*) FROM information_schema.tables WHERE table_name IN ('user_bible_bookmarks', 'user_bible_favorites')) = 2 
        AND (SELECT COUNT(*) FROM pg_policies WHERE tablename IN ('user_bible_bookmarks', 'user_bible_favorites')) >= 8
        THEN '✅ Bible bookmarks system ready!'
        ELSE '❌ Setup incomplete'
    END as overall_status;

-- STEP 9: Usage instructions
SELECT 
    'Usage Instructions' as info_type,
    'Frontend should now use:' as instruction_1,
    'BookmarksService.addToBookmarks() for bookmarks' as instruction_2,
    'FavoritesService.addToFavorites() for favorites' as instruction_3,
    'Tables: user_bible_bookmarks, user_bible_favorites' as instruction_4; 