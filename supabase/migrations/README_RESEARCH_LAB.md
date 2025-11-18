# Research Lab Database Migration

## Overview
This migration creates all necessary tables for the Research Lab feature, including:
- `research_notebooks` - User notebooks
- `research_sources` - Uploaded sources (PDFs, videos, audio, links, etc.)
- `research_chat_messages` - Chat conversation history
- `research_studio_outputs` - Generated studio tools outputs
- `research_agentic_actions` - Function calling actions from GLM-4.5-Air

## How to Apply

### Option 1: Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `20241118000000_create_research_lab_tables.sql`
4. Paste and run the SQL

### Option 2: Supabase CLI
```bash
supabase migration up
```

### Option 3: Direct SQL Execution
Run the SQL file directly in your database using any PostgreSQL client.

## Storage Bucket Setup

### Option 1: SQL Migration (Recommended)

Run the storage bucket migration:

1. Go to **SQL Editor** in Supabase dashboard
2. Copy the contents of `20241118000003_create_storage_bucket.sql`
3. Paste and run the SQL

This will create the bucket and all RLS policies automatically.

### Option 2: Manual Setup via Dashboard

If you prefer to create it manually:

1. Go to **Storage** in Supabase dashboard
2. Click **New bucket**
3. Name: `research-lab-sources`
4. **Public**: No (private bucket)
5. **File size limit**: 50MB
6. **Allowed MIME types**: 
   - Documents: `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `text/plain`, `text/markdown`, `application/json`
   - Images: `image/jpeg`, `image/png`, `image/gif`, `image/webp`, `image/svg+xml`
   - Audio: `audio/mpeg`, `audio/mp3`, `audio/wav`, `audio/ogg`, `audio/webm`
   - Video: `video/mp4`, `video/webm`, `video/ogg`, `video/quicktime`

Then add these RLS policies in **SQL Editor**:

```sql
-- Allow users to upload to their own folder
CREATE POLICY "Users can upload to their own folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'research-lab-sources' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to read their own files
CREATE POLICY "Users can read their own files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'research-lab-sources' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own files
CREATE POLICY "Users can update their own files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'research-lab-sources' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'research-lab-sources' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

## Verification

After applying the migration, verify tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'research%'
ORDER BY table_name;
```

You should see:
- research_agentic_actions
- research_chat_messages
- research_notebooks
- research_sources
- research_studio_outputs

## Notes

- All tables have Row Level Security (RLS) enabled
- Users can only access their own data
- Foreign keys ensure data integrity
- Automatic `updated_at` timestamps via triggers
- Indexes optimized for common queries

