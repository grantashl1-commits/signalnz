
-- Create public storage bucket for practice audio
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('practice-audio', 'practice-audio', true, 52428800, ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav']);

-- Allow public read access
CREATE POLICY "Public read access for practice audio"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'practice-audio');

-- Allow service role to upload (edge functions use service role)
CREATE POLICY "Service role upload for practice audio"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'practice-audio');

CREATE POLICY "Service role update for practice audio"
ON storage.objects FOR UPDATE
TO service_role
USING (bucket_id = 'practice-audio');
