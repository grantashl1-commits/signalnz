CREATE TABLE public.breathwork_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  practice_key TEXT NOT NULL,
  practice_title TEXT,
  category TEXT NOT NULL DEFAULT 'breathwork',
  duration_minutes NUMERIC(6,2) NOT NULL DEFAULT 0,
  mood SMALLINT CHECK (mood BETWEEN 1 AND 3),
  cycle_phase TEXT,
  date DATE NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_breathwork_logs_user_date ON public.breathwork_logs(user_id, date DESC);

ALTER TABLE public.breathwork_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own breathwork logs"
  ON public.breathwork_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own breathwork logs"
  ON public.breathwork_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own breathwork logs"
  ON public.breathwork_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own breathwork logs"
  ON public.breathwork_logs FOR DELETE
  USING (auth.uid() = user_id);