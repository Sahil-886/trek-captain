-- Migration: Programmatically create the trek-media bucket and enable security policies
-- Path: supabase/migrations/008_storage_setup.sql

-- 1. Create the trek-media bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'trek-media',
  'trek-media',
  true,
  5242880, -- 5 MB in bytes
  '{"image/*"}' -- only allow image uploads
)
ON CONFLICT (id) DO NOTHING;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "captain upload" ON storage.objects;
DROP POLICY IF EXISTS "public read media" ON storage.objects;
DROP POLICY IF EXISTS "captain delete own" ON storage.objects;

-- 3. Allow authenticated captains to upload files to their own folder inside trek-media
CREATE POLICY "captain upload" ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'trek-media' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 4. Allow public (anonymous and authenticated) reads to all files in trek-media
CREATE POLICY "public read media" ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'trek-media');

-- 5. Allow captains to delete their own uploaded files
CREATE POLICY "captain delete own" ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'trek-media' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
