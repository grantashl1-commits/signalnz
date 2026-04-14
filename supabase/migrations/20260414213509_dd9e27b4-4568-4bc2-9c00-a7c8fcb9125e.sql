ALTER TABLE public.user_plans ADD COLUMN IF NOT EXISTS current_session_index integer DEFAULT 0;
ALTER TABLE public.workout_logs ADD COLUMN IF NOT EXISTS plan_id uuid REFERENCES public.user_plans(id) ON DELETE SET NULL;
ALTER TABLE public.workout_logs ADD COLUMN IF NOT EXISTS avg_bpm integer;
ALTER TABLE public.workout_logs ADD COLUMN IF NOT EXISTS max_bpm integer;
ALTER TABLE public.workout_logs ADD COLUMN IF NOT EXISTS calories integer;
ALTER TABLE public.workout_logs ADD COLUMN IF NOT EXISTS zone2_plus_percent numeric;