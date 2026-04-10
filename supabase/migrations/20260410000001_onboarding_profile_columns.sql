-- Phase 1 onboarding: add extended profile columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS weight_kg numeric;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS height_cm numeric;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS goal_weight_kg numeric;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS movement_goals text[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS dietary_preferences text[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS dietary_dislikes text[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS calorie_target integer;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS protein_target_g integer;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS carb_target_g integer;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS fat_target_g integer;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_period_date date;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cycle_status text DEFAULT 'cycling';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS meal_prep_day text;

-- Create user_plans table for AI-generated workout and nutrition plans
CREATE TABLE IF NOT EXISTS public.user_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type text NOT NULL CHECK (plan_type IN ('workout', 'nutrition')),
  week_number integer,
  cycle_week integer,
  plan_data jsonb NOT NULL DEFAULT '{}',
  generated_at timestamptz DEFAULT now() NOT NULL,
  cycle_phase_at_generation text
);

ALTER TABLE public.user_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own plans" ON public.user_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own plans" ON public.user_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own plans" ON public.user_plans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX user_plans_user_id_idx ON public.user_plans(user_id);
CREATE INDEX user_plans_plan_type_idx ON public.user_plans(plan_type);
