ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_complete boolean NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS primary_goal text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS fitness_level text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cycle_length integer DEFAULT 28;