-- Behaviour chart enhancements: colour coding, recurring chores, daily completions

-- Add colour and recurrence fields to parenting_chores
ALTER TABLE public.parenting_chores ADD COLUMN IF NOT EXISTS color text NULL;
ALTER TABLE public.parenting_chores ADD COLUMN IF NOT EXISTS recurrence text NOT NULL DEFAULT 'none';

-- Daily completion tracking for recurring chores
CREATE TABLE IF NOT EXISTS public.parenting_chore_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chore_id uuid NOT NULL REFERENCES public.parenting_chores(id) ON DELETE CASCADE,
  child_id uuid NOT NULL REFERENCES public.parenting_children(id) ON DELETE CASCADE,
  completed_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(chore_id, child_id, completed_date)
);

ALTER TABLE public.parenting_chore_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own chore completions" ON public.parenting_chore_completions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.parenting_children pc
      WHERE pc.id = parenting_chore_completions.child_id
        AND pc.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS parenting_chore_completions_child_date_idx
  ON public.parenting_chore_completions(child_id, completed_date);