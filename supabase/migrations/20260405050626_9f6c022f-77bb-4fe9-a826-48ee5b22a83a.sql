-- Add missing columns for book calendar mapping
ALTER TABLE public.daily_stoic_readings
  ADD COLUMN IF NOT EXISTS month text,
  ADD COLUMN IF NOT EXISTS day_of_month integer;

-- Remove placeholder seed data so we can insert real entries
DELETE FROM public.daily_stoic_readings;