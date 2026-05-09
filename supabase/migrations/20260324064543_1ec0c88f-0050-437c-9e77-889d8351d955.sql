
CREATE TABLE IF NOT EXISTS public.stretches (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  target_muscle text NOT NULL,
  hold_duration text NOT NULL DEFAULT '30 seconds',
  instructions jsonb NOT NULL DEFAULT '[]'::jsonb,
  gif_url text,
  category text NOT NULL DEFAULT 'cool-down',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.stretches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read stretches" ON public.stretches
  FOR SELECT TO anon, authenticated USING (true);
