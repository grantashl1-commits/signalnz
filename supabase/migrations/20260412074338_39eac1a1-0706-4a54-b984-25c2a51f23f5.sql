
-- Membership features config table
CREATE TABLE IF NOT EXISTS public.membership_features (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feature_key text NOT NULL UNIQUE,
  feature_label text NOT NULL,
  category text NOT NULL,
  category_sort integer NOT NULL DEFAULT 0,
  feature_sort integer NOT NULL DEFAULT 0,
  free_access text NOT NULL DEFAULT 'locked',
  rooted_access text NOT NULL DEFAULT 'locked',
  nourished_access text NOT NULL DEFAULT 'locked',
  thriving_access text NOT NULL DEFAULT 'full',
  free_note text,
  rooted_note text,
  nourished_note text,
  thriving_note text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.membership_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read membership features"
ON public.membership_features
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage membership features"
ON public.membership_features
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
