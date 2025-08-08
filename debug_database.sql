-- DEBUG: Check if tables exist and are properly configured
-- Run this in Supabase SQL Editor to diagnose the issue

-- 1. Check if tables exist
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_favorites', 'user_bookmarks', 'journal_entries')
ORDER BY table_name;

-- 2. Check table structure
SELECT table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name IN ('user_favorites', 'user_bookmarks', 'journal_entries')
AND table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- 3. Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('user_favorites', 'user_bookmarks', 'journal_entries')
ORDER BY tablename, policyname;

-- 4. Check if user can insert (replace YOUR_USER_ID with actual user ID)
-- SELECT auth.uid(); -- Get your current user ID first

-- 5. Test insert into user_favorites (replace with your user ID)
-- INSERT INTO user_favorites (
--     user_id, verse_id, book_name, chapter, verse_number, 
--     verse_text, verse_reference, translation
-- ) VALUES (
--     'YOUR_USER_ID', 
--     'Test-1-1', 
--     'Test', 
--     1, 
--     1, 
--     'Test verse text', 
--     'Test 1:1', 
--     'KJV'
-- );

-- 6. Check grants
SELECT grantee, privilege_type, is_grantable
FROM information_schema.role_table_grants 
WHERE table_name IN ('user_favorites', 'user_bookmarks', 'journal_entries')
AND table_schema = 'public'
ORDER BY table_name, grantee; 