
-- Table for users to bookmark parenting situation scripts to "My Toolkit"
CREATE TABLE IF NOT EXISTS public.saved_parenting_scripts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  script_id TEXT NOT NULL,
  age_group TEXT NOT NULL,
  module_id TEXT,
  saved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, script_id)
);

-- Enable RLS
ALTER TABLE public.saved_parenting_scripts ENABLE ROW LEVEL SECURITY;

-- Users can only view their own saved scripts
CREATE POLICY "Users can view own saved scripts"
  ON public.saved_parenting_scripts FOR SELECT
  USING (auth.uid() = user_id);

-- Users can save their own scripts
CREATE POLICY "Users can save scripts"
  ON public.saved_parenting_scripts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can remove their own saved scripts
CREATE POLICY "Users can remove saved scripts"
  ON public.saved_parenting_scripts FOR DELETE
  USING (auth.uid() = user_id);
