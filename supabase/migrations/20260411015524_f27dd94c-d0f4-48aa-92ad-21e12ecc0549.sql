
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS illustration_url text;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('exercise-illustrations', 'exercise-illustrations', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read exercise illustrations"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'exercise-illustrations');

CREATE POLICY "Service role upload exercise illustrations"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'exercise-illustrations');
