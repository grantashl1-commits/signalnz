
-- Daily Stoic Readings table (366 entries, sequential)
CREATE TABLE IF NOT EXISTS public.daily_stoic_readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seq_day INTEGER NOT NULL UNIQUE,
  title TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT 'Marcus Aurelius',
  source TEXT NOT NULL DEFAULT 'Meditations',
  quote TEXT NOT NULL,
  reflection TEXT NOT NULL,
  journal_prompt TEXT,
  tts_script TEXT,
  duration_sec INTEGER DEFAULT 240,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.daily_stoic_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read stoic readings"
ON public.daily_stoic_readings FOR SELECT
USING (true);

-- Member Stoic Progress table
CREATE TABLE IF NOT EXISTS public.member_stoic_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  current_seq_day INTEGER NOT NULL DEFAULT 1,
  last_listened_at TIMESTAMPTZ,
  total_days_completed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.member_stoic_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own stoic progress"
ON public.member_stoic_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own stoic progress"
ON public.member_stoic_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stoic progress"
ON public.member_stoic_progress FOR UPDATE
USING (auth.uid() = user_id);

-- Add Stoic columns to existing journal_entries table
ALTER TABLE public.journal_entries ADD COLUMN IF NOT EXISTS stoic_seq_day INTEGER;
ALTER TABLE public.journal_entries ADD COLUMN IF NOT EXISTS stoic_title TEXT;
ALTER TABLE public.journal_entries ADD COLUMN IF NOT EXISTS stoic_lens JSONB;
ALTER TABLE public.journal_entries ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE public.journal_entries ADD COLUMN IF NOT EXISTS word_count INTEGER;
ALTER TABLE public.journal_entries ADD COLUMN IF NOT EXISTS mood TEXT;
ALTER TABLE public.journal_entries ADD COLUMN IF NOT EXISTS cycle_phase TEXT;
ALTER TABLE public.journal_entries ADD COLUMN IF NOT EXISTS cycle_day INTEGER;
ALTER TABLE public.journal_entries ADD COLUMN IF NOT EXISTS cycle_mode TEXT;
