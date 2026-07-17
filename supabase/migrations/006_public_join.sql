-- Migration: Allow anonymous/public registration of participants
-- Path: supabase/migrations/006_public_join.sql

-- Drop policy if it exists to avoid migration clash
DROP POLICY IF EXISTS "anon insert participants" ON participants;

-- Allow anonymous clients to insert new participant rows (for public trek registration)
CREATE POLICY "anon insert participants" ON participants FOR INSERT TO anon, authenticated WITH CHECK (true);
