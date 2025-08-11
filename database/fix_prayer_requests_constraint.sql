-- =====================================================
-- FIX PRAYER REQUESTS CONTENT CONSTRAINT  
-- Allow shorter prayer request content (minimum 1 character instead of 10)
-- =====================================================

-- Drop the existing constraint for prayer requests
ALTER TABLE prayer_requests 
DROP CONSTRAINT IF EXISTS prayer_requests_content_check;

-- Add new constraint with minimum 1 character (more reasonable)
ALTER TABLE prayer_requests 
ADD CONSTRAINT prayer_requests_content_check 
CHECK (length(trim(content)) >= 1);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Prayer requests content constraints updated!';
    RAISE NOTICE 'Minimum content length: 1 character (was 10)';
    RAISE NOTICE 'Users can now post shorter prayer requests.';
END $$; 