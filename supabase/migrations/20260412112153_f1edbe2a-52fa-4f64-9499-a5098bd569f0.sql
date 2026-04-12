
-- 1. Fix feedback-screenshots: remove public read, add owner/admin read
DROP POLICY IF EXISTS "Public can view feedback screenshots" ON storage.objects;

CREATE POLICY "Users can view own feedback screenshots"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'feedback-screenshots'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.has_role(auth.uid(), 'admin')
  )
);

-- 2. Scope feedback-screenshots uploads to user's folder
DROP POLICY IF EXISTS "Authenticated users can upload feedback screenshots" ON storage.objects;

CREATE POLICY "Users can upload own feedback screenshots"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'feedback-screenshots'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Fix feed_posts: only show published posts to non-admins
DROP POLICY IF EXISTS "Anyone can read feed posts" ON public.feed_posts;

CREATE POLICY "Published feed posts are readable"
ON public.feed_posts FOR SELECT
USING (
  been_published = true
  OR public.has_role(auth.uid(), 'admin')
);

-- 4. Allow partners to send messages
CREATE POLICY "Partners can send messages"
ON public.connect_messages FOR INSERT
TO authenticated
WITH CHECK (
  connection_id IN (
    SELECT id FROM public.partner_connections
    WHERE partner_user_id = auth.uid()
  )
  AND sender_role = 'partner'
);

-- 5. Fix community_profiles: respect visibility settings
DROP POLICY IF EXISTS "Authenticated can view community profiles" ON public.community_profiles;

CREATE POLICY "Users can view visible community profiles"
ON public.community_profiles FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR (visibility->>'profile')::boolean = true
  OR public.has_role(auth.uid(), 'admin')
);
