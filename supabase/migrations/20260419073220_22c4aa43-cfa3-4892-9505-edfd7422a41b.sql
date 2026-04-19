-- Flip exercise-assets bucket to public so anatomy illustrations resolve via /object/public URLs
UPDATE storage.buckets SET public = true WHERE id = 'exercise-assets';

-- Public read policy (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public read exercise-assets'
  ) THEN
    CREATE POLICY "Public read exercise-assets"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'exercise-assets');
  END IF;
END $$;