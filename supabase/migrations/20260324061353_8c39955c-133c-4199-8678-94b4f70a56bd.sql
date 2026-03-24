
CREATE TABLE public.exercises (
  id text PRIMARY KEY,
  name text NOT NULL,
  body_part text,
  equipment text,
  target text,
  gif_url text,
  instructions jsonb DEFAULT '[]'::jsonb,
  secondary_muscles jsonb DEFAULT '[]'::jsonb
);

ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read exercises" ON public.exercises
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE INDEX idx_exercises_name ON public.exercises USING btree (lower(name));
