-- Create Research Lab Storage Bucket
-- This migration creates the storage bucket for Research Lab file uploads

-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'research-lab-sources',
  'research-lab-sources',
  false, -- Private bucket
  52428800, -- 50MB file size limit
  ARRAY[
    -- Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown',
    'application/json',
    -- Images
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    -- Audio
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/webm',
    -- Video
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/quicktime'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies for research-lab-sources bucket

-- Allow users to upload to their own folder
DROP POLICY IF EXISTS "Users can upload to their own folder" ON storage.objects;
CREATE POLICY "Users can upload to their own folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'research-lab-sources' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to read their own files
DROP POLICY IF EXISTS "Users can read their own files" ON storage.objects;
CREATE POLICY "Users can read their own files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'research-lab-sources' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own files
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
CREATE POLICY "Users can update their own files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'research-lab-sources' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own files
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'research-lab-sources' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

