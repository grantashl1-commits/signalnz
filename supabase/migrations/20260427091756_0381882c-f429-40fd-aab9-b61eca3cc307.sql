
-- Behaviour management system tables

-- Children profiles
CREATE TABLE IF NOT EXISTS public.parenting_children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  character_id TEXT NOT NULL DEFAULT 'triumph',
  accent_color TEXT NOT NULL DEFAULT '#7BB7E0',
  age INT,
  points INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.parenting_children ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own children select" ON public.parenting_children FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own children insert" ON public.parenting_children FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own children update" ON public.parenting_children FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own children delete" ON public.parenting_children FOR DELETE USING (auth.uid() = user_id);

-- Chores (templates per parent, optionally scoped per child)
CREATE TABLE IF NOT EXISTS public.parenting_chores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  child_id UUID REFERENCES public.parenting_children(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  points INT NOT NULL DEFAULT 1,
  category TEXT NOT NULL DEFAULT 'must' CHECK (category IN ('must','bonus')),
  icon TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.parenting_chores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own chores all" ON public.parenting_chores FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Bad behaviours
CREATE TABLE IF NOT EXISTS public.parenting_behaviours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  child_id UUID REFERENCES public.parenting_children(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  penalty INT NOT NULL DEFAULT 5,
  reset_to_zero BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.parenting_behaviours ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own behaviours all" ON public.parenting_behaviours FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Reward goals
CREATE TABLE IF NOT EXISTS public.parenting_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  child_id UUID NOT NULL REFERENCES public.parenting_children(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_points INT NOT NULL,
  icon TEXT,
  achieved BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.parenting_rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own rewards all" ON public.parenting_rewards FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Transactions (history)
CREATE TABLE IF NOT EXISTS public.parenting_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  child_id UUID NOT NULL REFERENCES public.parenting_children(id) ON DELETE CASCADE,
  delta INT NOT NULL,
  reason TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('chore','behaviour','reward','manual','reset')),
  source_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.parenting_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own tx select" ON public.parenting_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own tx insert" ON public.parenting_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own tx delete" ON public.parenting_transactions FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_parenting_tx_child_created ON public.parenting_transactions (child_id, created_at DESC);
CREATE INDEX idx_parenting_chores_user ON public.parenting_chores (user_id, child_id);
CREATE INDEX idx_parenting_behaviours_user ON public.parenting_behaviours (user_id, child_id);

-- Update trigger
CREATE TRIGGER trg_parenting_children_updated
BEFORE UPDATE ON public.parenting_children
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
