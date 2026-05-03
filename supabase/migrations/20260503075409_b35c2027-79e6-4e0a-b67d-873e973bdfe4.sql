CREATE TABLE IF NOT EXISTS public.user_recipes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'Other',
  ingredients text[] NOT NULL DEFAULT '{}',
  instructions text[] NOT NULL DEFAULT '{}',
  estimated_time integer,
  rating integer,
  image_url text,
  source_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.user_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own recipes"
  ON public.user_recipes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recipes"
  ON public.user_recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recipes"
  ON public.user_recipes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recipes"
  ON public.user_recipes FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_recipes_user_id ON public.user_recipes(user_id);

CREATE TRIGGER update_user_recipes_updated_at
  BEFORE UPDATE ON public.user_recipes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();