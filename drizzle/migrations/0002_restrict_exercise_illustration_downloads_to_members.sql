DROP POLICY IF EXISTS "Public read exercise illustrations" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read exercise illustrations" ON storage.objects;
CREATE POLICY "Members read shared exercise illustrations" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'exercise-illustrations' AND (SELECT auth.uid()) IS NOT NULL);