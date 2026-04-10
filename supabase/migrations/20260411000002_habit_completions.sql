-- Phase 5: habit completions table for persisting daily habit check-ins
CREATE TABLE IF NOT EXISTS public.habit_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id text NOT NULL,
  completed_date date NOT NULL,
  completed_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, habit_id, completed_date)
);

ALTER TABLE public.habit_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own habit completions" ON public.habit_completions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own habit completions" ON public.habit_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own habit completions" ON public.habit_completions
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX habit_completions_user_date_idx ON public.habit_completions(user_id, completed_date);
CREATE INDEX habit_completions_habit_id_idx ON public.habit_completions(habit_id);
