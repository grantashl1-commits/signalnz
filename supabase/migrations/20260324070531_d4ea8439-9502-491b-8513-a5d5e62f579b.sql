
-- Journal entries table for cloud sync
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id TEXT NOT NULL PRIMARY KEY,
  user_id UUID NOT NULL,
  date TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  prompts JSONB NOT NULL DEFAULT '{}'::jsonb,
  tracking JSONB NOT NULL DEFAULT '{}'::jsonb,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  ai JSONB,
  entry_type TEXT,
  title TEXT,
  emotional_tone TEXT,
  saved_to_vault BOOLEAN DEFAULT false,
  pinned_to_dream_studio BOOLEAN DEFAULT false,
  vault_category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own journal entries"
  ON public.journal_entries FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Vault entries table for cloud sync
CREATE TABLE IF NOT EXISTS public.vault_entries (
  id TEXT NOT NULL PRIMARY KEY,
  user_id UUID NOT NULL,
  entry_id TEXT,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  preview TEXT,
  date TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.vault_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own vault entries"
  ON public.vault_entries FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Milestones table
CREATE TABLE IF NOT EXISTS public.journal_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  milestone_type TEXT NOT NULL,
  count INTEGER NOT NULL,
  date TEXT NOT NULL,
  analysis JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.journal_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own milestones"
  ON public.journal_milestones FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
