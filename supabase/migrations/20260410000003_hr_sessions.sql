-- Phase 3: HR sessions table for persisting heart rate workouts
CREATE TABLE IF NOT EXISTS public.hr_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_date date NOT NULL DEFAULT CURRENT_DATE,
  workout_name text,
  duration_minutes numeric,
  bpm_trace jsonb NOT NULL DEFAULT '[]',
  avg_bpm integer,
  max_bpm integer,
  calories integer,
  zones_summary jsonb NOT NULL DEFAULT '{}',
  zone2_plus_percent integer,
  cycle_phase text,
  cycle_day integer,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.hr_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own hr sessions" ON public.hr_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own hr sessions" ON public.hr_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own hr sessions" ON public.hr_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX hr_sessions_user_id_idx ON public.hr_sessions(user_id);
CREATE INDEX hr_sessions_session_date_idx ON public.hr_sessions(session_date DESC);
