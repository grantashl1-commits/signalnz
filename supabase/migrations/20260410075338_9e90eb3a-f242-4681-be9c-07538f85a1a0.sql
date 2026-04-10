-- Create the reference-pdfs storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('reference-pdfs', 'reference-pdfs', true);

-- Allow public read access
CREATE POLICY "Public read access for reference PDFs"
ON storage.objects FOR SELECT
USING (bucket_id = 'reference-pdfs');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload reference PDFs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'reference-pdfs');

-- Allow authenticated users to update
CREATE POLICY "Authenticated users can update reference PDFs"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'reference-pdfs');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete reference PDFs"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'reference-pdfs');