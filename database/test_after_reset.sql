-- TEST SCRIPT - Run AFTER nuclear_reset.sql to verify everything works
-- Copy and paste this in Supabase SQL Editor AFTER running nuclear_reset.sql

-- ============================================================================
-- STEP 1: Check your user ID
-- ============================================================================
SELECT auth.uid() as your_user_id;

-- ============================================================================
-- STEP 2: Test inserting a favorite (replace YOUR_USER_ID with result from step 1)
-- ============================================================================
-- IMPORTANT: Replace 'YOUR_USER_ID_HERE' with your actual user ID from step 1

INSERT INTO user_favorites (
    user_id, 
    verse_id, 
    book_name, 
    chapter, 
    verse_number, 
    verse_text, 
    verse_reference, 
    translation
) VALUES (
    'YOUR_USER_ID_HERE',  -- ⚠️ REPLACE THIS WITH YOUR ACTUAL USER ID
    'Genesis-1-1',
    'Genesis',
    1,
    1,
    'In the beginning God created the heaven and the earth.',
    'Genesis 1:1',
    'KJV'
);

-- ============================================================================
-- STEP 3: Test inserting a bookmark (replace YOUR_USER_ID with your user ID)
-- ============================================================================

INSERT INTO user_bookmarks (
    user_id, 
    verse_id, 
    book_name, 
    chapter, 
    verse_number, 
    verse_text, 
    verse_reference, 
    translation,
    category,
    highlight_color
) VALUES (
    'YOUR_USER_ID_HERE',  -- ⚠️ REPLACE THIS WITH YOUR ACTUAL USER ID
    'John-3-16',
    'John',
    3,
    16,
    'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.',
    'John 3:16',
    'KJV',
    'study',
    'yellow'
);

-- ============================================================================
-- STEP 4: Verify the data was inserted correctly
-- ============================================================================

-- Check favorites
SELECT 
    'FAVORITES TEST' as test_type,
    id,
    verse_id,
    book_name,
    chapter,
    verse_number,
    verse_reference,
    created_at
FROM user_favorites 
WHERE user_id = 'YOUR_USER_ID_HERE'  -- ⚠️ REPLACE THIS WITH YOUR ACTUAL USER ID
ORDER BY created_at DESC;

-- Check bookmarks
SELECT 
    'BOOKMARKS TEST' as test_type,
    id,
    verse_id,
    book_name,
    chapter,
    verse_number,
    verse_reference,
    category,
    highlight_color,
    created_at
FROM user_bookmarks 
WHERE user_id = 'YOUR_USER_ID_HERE'  -- ⚠️ REPLACE THIS WITH YOUR ACTUAL USER ID
ORDER BY created_at DESC;

-- ============================================================================
-- STEP 5: Test updating (optional)
-- ============================================================================

-- Update favorite with notes
UPDATE user_favorites 
SET notes = 'This is the very first verse of the Bible!'
WHERE user_id = 'YOUR_USER_ID_HERE'   -- ⚠️ REPLACE THIS WITH YOUR ACTUAL USER ID
AND verse_id = 'Genesis-1-1';

-- Update bookmark category
UPDATE user_bookmarks 
SET category = 'memorization',
    notes = 'The most famous verse in the Bible'
WHERE user_id = 'YOUR_USER_ID_HERE'   -- ⚠️ REPLACE THIS WITH YOUR ACTUAL USER ID
AND verse_id = 'John-3-16';

-- ============================================================================
-- STEP 6: Final verification
-- ============================================================================

SELECT '🎉 TEST COMPLETE! If you see data below, everything works!' as status;

-- Show final results
SELECT 
    'FINAL FAVORITES' as type,
    verse_reference,
    notes,
    created_at,
    updated_at
FROM user_favorites 
WHERE user_id = 'YOUR_USER_ID_HERE'  -- ⚠️ REPLACE THIS WITH YOUR ACTUAL USER ID
UNION ALL
SELECT 
    'FINAL BOOKMARKS' as type,
    verse_reference,
    notes,
    created_at,
    updated_at
FROM user_bookmarks 
WHERE user_id = 'YOUR_USER_ID_HERE'  -- ⚠️ REPLACE THIS WITH YOUR ACTUAL USER ID
ORDER BY type, created_at;

-- ============================================================================
-- STEP 7: Cleanup test data (optional - uncomment to remove test data)
-- ============================================================================

-- DELETE FROM user_favorites WHERE user_id = 'YOUR_USER_ID_HERE' AND verse_id IN ('Genesis-1-1');
-- DELETE FROM user_bookmarks WHERE user_id = 'YOUR_USER_ID_HERE' AND verse_id IN ('John-3-16'); 