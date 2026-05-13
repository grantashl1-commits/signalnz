ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS training_path_id text,
  ADD COLUMN IF NOT EXISTS training_days_per_week int,
  ADD COLUMN IF NOT EXISTS body_focus_areas text[] DEFAULT '{}'::text[];