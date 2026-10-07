DROP POLICY IF EXISTS "Public read community media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read community media" ON storage.objects;
DROP POLICY IF EXISTS "Group members can view media" ON storage.objects;
CREATE POLICY "Uploaders and visible parent readers access community media"
ON storage.objects FOR SELECT TO authenticated
USING (
 bucket_id = 'community-media'
 AND (SELECT auth.uid()) IS NOT NULL
 AND (
  owner_id = (SELECT auth.uid()::text)
  OR (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  OR EXISTS (SELECT 1 FROM public.community_posts p WHERE p.media_url = storage.objects.name)
  OR EXISTS (SELECT 1 FROM public.community_messages m WHERE m.media_path = storage.objects.name OR m.metadata->>'path' = storage.objects.name)
 )
);