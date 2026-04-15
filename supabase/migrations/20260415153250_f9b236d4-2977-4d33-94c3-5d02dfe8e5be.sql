
CREATE TABLE public.one_off_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_key TEXT NOT NULL,
  stripe_product_id TEXT,
  stripe_session_id TEXT,
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_key)
);

ALTER TABLE public.one_off_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own purchases"
ON public.one_off_purchases FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
