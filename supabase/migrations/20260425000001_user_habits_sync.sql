-- Add habits JSONB column to profiles for cross-device habit list sync
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS habits jsonb DEFAULT '[]'::jsonb;
