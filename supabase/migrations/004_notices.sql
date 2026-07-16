-- Migration: Notice Board columns for Captain Profiles
-- Path: supabase/migrations/004_notices.sql

ALTER TABLE captains ADD COLUMN IF NOT EXISTS notice text;
ALTER TABLE captains ADD COLUMN IF NOT EXISTS notice_updated_at timestamptz;
