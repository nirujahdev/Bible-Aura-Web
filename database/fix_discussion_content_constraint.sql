-- =====================================================
-- FIX DISCUSSION CONTENT CONSTRAINT
-- Allow shorter discussion content (minimum 1 character instead of 10)
-- =====================================================

-- Drop the existing constraint
ALTER TABLE community_discussions 
DROP CONSTRAINT IF EXISTS community_discussions_content_check;

-- Add new constraint with minimum 1 character (more reasonable)
ALTER TABLE community_discussions 
ADD CONSTRAINT community_discussions_content_check 
CHECK (length(trim(content)) >= 1);

-- Also fix comments constraint if it exists
ALTER TABLE discussion_comments 
DROP CONSTRAINT IF EXISTS discussion_comments_content_check;

ALTER TABLE discussion_comments 
ADD CONSTRAINT discussion_comments_content_check 
CHECK (length(trim(content)) >= 1);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Discussion content constraints updated!';
    RAISE NOTICE 'Minimum content length: 1 character (was 10)';
    RAISE NOTICE 'Users can now post shorter discussions and comments.';
END $$; 