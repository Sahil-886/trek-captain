-- Migration: Safety & Emergency Info columns for Treks
-- Path: supabase/migrations/005_safety.sql

ALTER TABLE treks ADD COLUMN IF NOT EXISTS emergency_contact_name text;
ALTER TABLE treks ADD COLUMN IF NOT EXISTS emergency_contact_phone text;
ALTER TABLE treks ADD COLUMN IF NOT EXISTS nearest_hospital text;
ALTER TABLE treks ADD COLUMN IF NOT EXISTS network_availability text;
ALTER TABLE treks ADD COLUMN IF NOT EXISTS safety_notes text;
ALTER TABLE treks ADD COLUMN IF NOT EXISTS fitness_requirement text;
