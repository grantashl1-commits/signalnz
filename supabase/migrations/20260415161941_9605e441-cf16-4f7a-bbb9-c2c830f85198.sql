
-- Make buckets private
UPDATE storage.buckets SET public = false WHERE id = 'practice-audio';
UPDATE storage.buckets SET public = false WHERE id = 'exercise-assets';
UPDATE storage.buckets SET public = false WHERE id = 'exercise-illustrations';
UPDATE storage.buckets SET public = false WHERE id = 'community-media';

-- Add authenticated SELECT policies for private buckets that need them

-- practice-audio: authenticated users can read all audio
CREATE POLICY "Authenticated users can read practice audio"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'practice-audio');

-- exercise-assets: authenticated users can read all exercises
CREATE POLICY "Authenticated users can read exercise assets"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'exercise-assets');

-- exercise-illustrations: authenticated users can read
CREATE POLICY "Authenticated users can read exercise illustrations"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'exercise-illustrations');

-- community-media: authenticated users can read
CREATE POLICY "Authenticated users can read community media"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'community-media');

-- progress-photos: add authenticated SELECT (bucket already private but missing read policy)
CREATE POLICY "Users can read own progress photos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'progress-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- feedback-screenshots: service role already has access, add authenticated read for uploaders
CREATE POLICY "Users can read own feedback screenshots"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'feedback-screenshots');
