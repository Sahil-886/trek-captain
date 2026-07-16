-- Migration: Dashboard V3 additions
-- Path: supabase/migrations/003_dashboard_v3.sql

-- Add has_shared column to captains to track checklist progress
ALTER TABLE captains ADD COLUMN IF NOT EXISTS has_shared BOOLEAN DEFAULT false;

-- Create page_views table for public page analytics
CREATE TABLE IF NOT EXISTS page_views (
  id bigserial PRIMARY KEY,
  captain_id uuid NOT NULL REFERENCES captains(id) ON DELETE CASCADE,
  trek_id uuid REFERENCES treks(id) ON DELETE CASCADE,   -- null = captain home page
  visitor_hash text,          -- daily-rotating hash, NOT an IP
  referrer text,
  viewed_at timestamptz DEFAULT now()
);

-- Create index for analytics querying
CREATE INDEX IF NOT EXISTS page_views_captain_id_viewed_at_idx ON page_views (captain_id, viewed_at DESC);

-- Enable RLS
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to prevent migration clash
DROP POLICY IF EXISTS "anon insert views" ON page_views;
DROP POLICY IF EXISTS "owner read views" ON page_views;

-- Anyone (even anonymous visitors) may log a page view
CREATE POLICY "anon insert views" ON page_views FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Only the owner captain can read page views for their own pages
CREATE POLICY "owner read views" ON page_views FOR SELECT USING (auth.uid() = captain_id);
