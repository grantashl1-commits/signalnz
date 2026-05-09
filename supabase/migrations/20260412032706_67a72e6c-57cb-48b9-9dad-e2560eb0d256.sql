
CREATE TABLE IF NOT EXISTS public.plan_generations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  plan_type text NOT NULL DEFAULT 'ai_training',
  month_key text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_plan_generations_user_month ON public.plan_generations (user_id, month_key, plan_type);

ALTER TABLE public.plan_generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own plan generations"
  ON public.plan_generations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plan generations"
  ON public.plan_generations FOR INSERT
  WITH CHECK (auth.uid() = user_id);
