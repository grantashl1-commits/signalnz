-- User's personal recipe collection (My Recipes tab)
CREATE TABLE IF NOT EXISTS public.user_recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'Other',
  ingredients text[] NOT NULL DEFAULT '{}',
  instructions text[] NOT NULL DEFAULT '{}',
  estimated_time integer NULL,
  rating integer NULL CHECK (rating BETWEEN 1 AND 5),
  image_url text NULL,
  source_url text NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.user_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own recipes" ON public.user_recipes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own recipes" ON public.user_recipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own recipes" ON public.user_recipes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users delete own recipes" ON public.user_recipes
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX user_recipes_user_id_idx ON public.user_recipes(user_id);
CREATE INDEX user_recipes_created_at_idx ON public.user_recipes(created_at DESC);

CREATE TRIGGER user_recipes_updated_at
  BEFORE UPDATE ON public.user_recipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
