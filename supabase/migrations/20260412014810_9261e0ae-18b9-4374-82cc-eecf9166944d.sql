
DROP POLICY IF EXISTS "Authenticated users can upload exercise assets" ON storage.objects;

CREATE POLICY "Anyone can upload exercise assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'exercise-assets');

CREATE POLICY "Anyone can update exercise assets"
ON storage.objects FOR UPDATE
USING (bucket_id = 'exercise-assets');
