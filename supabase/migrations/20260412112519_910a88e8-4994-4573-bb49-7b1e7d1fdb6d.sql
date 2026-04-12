
-- 1. Remove sensitive tables from Realtime publication (no IF EXISTS for ALTER PUBLICATION)
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.user_locations;
  EXCEPTION WHEN undefined_object THEN
    NULL; -- table not in publication, ignore
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.connect_messages;
  EXCEPTION WHEN undefined_object THEN
    NULL;
  END;
END;
$$;

-- 2. Add missing UPDATE policy for progress-photos
CREATE POLICY "Users can update own progress photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'progress-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Add missing UPDATE and DELETE policies for feedback-screenshots
CREATE POLICY "Users can update own feedback screenshots"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'feedback-screenshots'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.has_role(auth.uid(), 'admin')
  )
);

CREATE POLICY "Users can delete own feedback screenshots"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'feedback-screenshots'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.has_role(auth.uid(), 'admin')
  )
);

-- 4. Restrict reference-pdfs uploads to admins only
DROP POLICY IF EXISTS "Authenticated users can upload reference PDFs" ON storage.objects;

CREATE POLICY "Only admins can upload reference PDFs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'reference-pdfs'
  AND public.has_role(auth.uid(), 'admin')
);
