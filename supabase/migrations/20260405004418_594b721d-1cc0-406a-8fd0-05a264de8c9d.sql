
CREATE TABLE IF NOT EXISTS public.cycle_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  log_date date NOT NULL,
  cycle_day integer,
  phase text,
  mood text,
  energy integer,
  weight numeric,
  symptoms text[] DEFAULT '{}',
  symptom_severity jsonb DEFAULT '{}',
  notes text,
  period_start boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, log_date)
);

ALTER TABLE public.cycle_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cycle logs"
  ON public.cycle_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cycle logs"
  ON public.cycle_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cycle logs"
  ON public.cycle_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cycle logs"
  ON public.cycle_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_cycle_logs_user_date ON public.cycle_logs (user_id, log_date DESC);
