CREATE TABLE public.user_saved_recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  recipe_id text NOT NULL,
  saved_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, recipe_id)
);

ALTER TABLE public.user_saved_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved recipes"
  ON public.user_saved_recipes FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save recipes"
  ON public.user_saved_recipes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave recipes"
  ON public.user_saved_recipes FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_saved_recipes_user ON public.user_saved_recipes (user_id);

-- Plant diversity tracker
CREATE TABLE public.plant_diversity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  week_key text NOT NULL,
  plants text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, week_key)
);

ALTER TABLE public.plant_diversity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own plant log"
  ON public.plant_diversity_log FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plant log"
  ON public.plant_diversity_log FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plant log"
  ON public.plant_diversity_log FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_plant_log_user_week ON public.plant_diversity_log (user_id, week_key);