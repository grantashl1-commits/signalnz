DROP POLICY IF EXISTS "Public read access for reference PDFs" ON storage.objects;
CREATE POLICY "Admins read reference PDFs" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'reference-pdfs' AND public.has_role((SELECT auth.uid()), 'admin'::public.app_role));
DROP POLICY IF EXISTS "Public read access for practice audio" ON storage.objects;