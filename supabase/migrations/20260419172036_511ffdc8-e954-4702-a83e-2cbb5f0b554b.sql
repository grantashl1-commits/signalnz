
-- ============================================================
-- 1. Storage bucket for chat media (images + voice)
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'community-media',
  'community-media',
  false,
  5242880, -- 5 MB
  ARRAY['image/jpeg','image/png','image/webp','image/gif','audio/webm','audio/mpeg','audio/mp4','audio/ogg','audio/wav']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage policies — files are stored under {group_id}/{user_id}/{filename}
CREATE POLICY "Group members can upload media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'community-media'
  AND auth.uid()::text = (storage.foldername(name))[2]
  AND public.is_group_member(auth.uid(), ((storage.foldername(name))[1])::uuid)
);

CREATE POLICY "Group members can view media"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'community-media'
  AND public.is_group_member(auth.uid(), ((storage.foldername(name))[1])::uuid)
);

CREATE POLICY "Owners can delete own media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'community-media'
  AND auth.uid()::text = (storage.foldername(name))[2]
);

-- ============================================================
-- 2. Challenge completions (group-shared)
-- ============================================================
CREATE TABLE public.challenge_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.community_groups(id) ON DELETE CASCADE,
  challenge_index INTEGER NOT NULL,
  user_id UUID NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (group_id, challenge_index, user_id)
);

CREATE INDEX idx_challenge_completions_group ON public.challenge_completions(group_id, challenge_index);

ALTER TABLE public.challenge_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view group completions"
ON public.challenge_completions FOR SELECT
TO authenticated
USING (public.is_group_member(auth.uid(), group_id));

CREATE POLICY "Members add own completion"
ON public.challenge_completions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND public.is_group_member(auth.uid(), group_id));

CREATE POLICY "Members remove own completion"
ON public.challenge_completions FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================================
-- 3. Challenge answers (private)
-- ============================================================
CREATE TABLE public.challenge_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.community_groups(id) ON DELETE CASCADE,
  question_index INTEGER NOT NULL,
  user_id UUID NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (group_id, question_index, user_id)
);

CREATE INDEX idx_challenge_answers_user ON public.challenge_answers(user_id, group_id);

ALTER TABLE public.challenge_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own answers"
ON public.challenge_answers FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_challenge_answers_updated_at
BEFORE UPDATE ON public.challenge_answers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 4. Moderation queue: allow group members to report messages
-- ============================================================
-- Add column to support reporting community_messages (in addition to posts/comments)
ALTER TABLE public.moderation_queue
  ADD COLUMN IF NOT EXISTS message_id UUID REFERENCES public.community_messages(id) ON DELETE CASCADE;

CREATE POLICY "Members can report group messages"
ON public.moderation_queue FOR INSERT
TO authenticated
WITH CHECK (
  reporter_id = auth.uid()
  AND message_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.community_messages cm
    WHERE cm.id = message_id
    AND public.is_group_member(auth.uid(), cm.group_id)
  )
);
