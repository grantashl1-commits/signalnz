
-- 1. Make progress-photos bucket private
UPDATE storage.buckets SET public = false WHERE id = 'progress-photos';

-- 2. Make feedback-screenshots bucket private
UPDATE storage.buckets SET public = false WHERE id = 'feedback-screenshots';

-- 3. Fix reference-pdfs: remove overly permissive DELETE and UPDATE policies
DROP POLICY IF EXISTS "Authenticated users can delete reference PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update reference PDFs" ON storage.objects;

-- Add admin-only policies for reference-pdfs management
CREATE POLICY "Only admins can delete reference PDFs"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'reference-pdfs'
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Only admins can update reference PDFs"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'reference-pdfs'
  AND public.has_role(auth.uid(), 'admin')
);
