
-- Create storage bucket for exercise illustrations/GIFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('exercise-assets', 'exercise-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access
CREATE POLICY "Exercise assets are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'exercise-assets');

-- Authenticated upload
CREATE POLICY "Authenticated users can upload exercise assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'exercise-assets' AND auth.role() = 'authenticated');
