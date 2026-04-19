ALTER TABLE public.workout_exercises
  ADD COLUMN IF NOT EXISTS tempo text,
  ADD COLUMN IF NOT EXISTS tip text,
  ADD COLUMN IF NOT EXISTS weight_kg_min numeric,
  ADD COLUMN IF NOT EXISTS weight_kg_max numeric;

ALTER TABLE public.workout_templates
  ADD COLUMN IF NOT EXISTS total_duration_sec integer;

CREATE TABLE IF NOT EXISTS public.workout_intervals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id text NOT NULL REFERENCES public.workout_templates(id) ON DELETE CASCADE,
  order_index integer NOT NULL DEFAULT 0,
  block_label text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('warmup','run','walk','work','rest','cooldown','jog','sprint','recovery')),
  duration_sec integer NOT NULL,
  repeat_count integer NOT NULL DEFAULT 1,
  target_pace text,
  target_rpe numeric,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workout_intervals_workout ON public.workout_intervals(workout_id, order_index);

ALTER TABLE public.workout_intervals ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'workout_intervals' AND policyname = 'Anyone can read workout_intervals'
  ) THEN
    CREATE POLICY "Anyone can read workout_intervals"
      ON public.workout_intervals FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;
END $$;