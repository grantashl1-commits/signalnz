
CREATE TABLE IF NOT EXISTS public.community_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  career TEXT,
  employer TEXT,
  skills TEXT,
  offer TEXT,
  looking_for TEXT,
  community_vision TEXT,
  barter TEXT,
  photo_url TEXT,
  visibility JSONB NOT NULL DEFAULT '{"career":true,"employer":false,"skills":true,"offer":true,"looking_for":false,"community_vision":true,"barter":false}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.community_profiles ENABLE ROW LEVEL SECURITY;

-- Owner can manage their own profile
CREATE POLICY "Users can manage own community profile"
ON public.community_profiles
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Authenticated users can view profiles (for member viewing)
CREATE POLICY "Authenticated can view community profiles"
ON public.community_profiles
FOR SELECT
TO authenticated
USING (true);
