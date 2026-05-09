
-- Create mindfulness_logs table for tracking meditation/reading completions
CREATE TABLE public.mindfulness_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  practice_id TEXT NOT NULL,
  practice_type TEXT NOT NULL DEFAULT 'meditation',
  duration_sec INTEGER,
  completed BOOLEAN NOT NULL DEFAULT false,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  cycle_phase TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mindfulness_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own logs
CREATE POLICY "Users can view own mindfulness logs"
ON public.mindfulness_logs FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own logs
CREATE POLICY "Users can create own mindfulness logs"
ON public.mindfulness_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own logs
CREATE POLICY "Users can update own mindfulness logs"
ON public.mindfulness_logs FOR UPDATE
USING (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX idx_mindfulness_logs_user_date ON public.mindfulness_logs(user_id, log_date);
