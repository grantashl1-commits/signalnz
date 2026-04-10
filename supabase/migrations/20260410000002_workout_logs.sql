-- Phase 2: workout logs table for persisting completed sessions
CREATE TABLE IF NOT EXISTS public.workout_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_date date NOT NULL DEFAULT CURRENT_DATE,
  workout_template_id text,
  exercises jsonb NOT NULL DEFAULT '[]',
  duration_minutes integer,
  notes text,
  completed boolean NOT NULL DEFAULT true,
  hr_session_id uuid,
  cycle_phase text,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own workout logs" ON public.workout_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own workout logs" ON public.workout_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own workout logs" ON public.workout_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX workout_logs_user_id_idx ON public.workout_logs(user_id);
CREATE INDEX workout_logs_session_date_idx ON public.workout_logs(session_date DESC);
