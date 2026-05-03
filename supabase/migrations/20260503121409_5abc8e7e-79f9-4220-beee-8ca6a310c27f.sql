-- Private storage bucket for community chat media
INSERT INTO storage.buckets (id, name, public)
VALUES ('community-media', 'community-media', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS (idempotent)
DROP POLICY IF EXISTS "Users can upload their own community media" ON storage.objects;
CREATE POLICY "Users can upload their own community media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'community-media'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Authenticated users can read community media" ON storage.objects;
CREATE POLICY "Authenticated users can read community media"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'community-media');

DROP POLICY IF EXISTS "Users can delete their own community media" ON storage.objects;
CREATE POLICY "Users can delete their own community media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'community-media'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Poll votes
CREATE TABLE IF NOT EXISTS public.community_message_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.community_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  option_index INTEGER NOT NULL CHECK (option_index >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (message_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_community_message_votes_message ON public.community_message_votes(message_id);

ALTER TABLE public.community_message_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view votes" ON public.community_message_votes;
CREATE POLICY "Authenticated users can view votes"
ON public.community_message_votes FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Users can cast their own vote" ON public.community_message_votes;
CREATE POLICY "Users can cast their own vote"
ON public.community_message_votes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can change their own vote" ON public.community_message_votes;
CREATE POLICY "Users can change their own vote"
ON public.community_message_votes FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove their own vote" ON public.community_message_votes;
CREATE POLICY "Users can remove their own vote"
ON public.community_message_votes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Event RSVPs
CREATE TABLE IF NOT EXISTS public.community_message_rsvps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.community_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (message_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_community_message_rsvps_message ON public.community_message_rsvps(message_id);

ALTER TABLE public.community_message_rsvps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view RSVPs" ON public.community_message_rsvps;
CREATE POLICY "Authenticated users can view RSVPs"
ON public.community_message_rsvps FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Users can RSVP for themselves" ON public.community_message_rsvps;
CREATE POLICY "Users can RSVP for themselves"
ON public.community_message_rsvps FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can cancel their own RSVP" ON public.community_message_rsvps;
CREATE POLICY "Users can cancel their own RSVP"
ON public.community_message_rsvps FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Realtime (guarded against duplicate add)
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.community_message_votes;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.community_message_rsvps;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;