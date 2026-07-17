-- Migration: Add WhatsApp Group URL column to Treks
-- Path: supabase/migrations/007_whatsapp_group.sql

ALTER TABLE treks ADD COLUMN IF NOT EXISTS whatsapp_group_url text;
