
-- ═══ COMMUNITY POSTS ═══
CREATE TABLE IF NOT EXISTS public.community_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  content text NOT NULL,
  post_type text DEFAULT 'text',
  phase_tag text,
  media_url text,
  resource_url text,
  challenge_id uuid,
  is_anonymous boolean DEFAULT false,
  is_removed boolean DEFAULT false,
  heart_count integer DEFAULT 0,
  comment_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read non-removed posts"
  ON public.community_posts FOR SELECT TO authenticated
  USING (is_removed = false);

CREATE POLICY "Authors insert own posts"
  ON public.community_posts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authors update own posts"
  ON public.community_posts FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authors delete own posts"
  ON public.community_posts FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins manage all posts"
  ON public.community_posts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ═══ COMMUNITY COMMENTS ═══
CREATE TABLE IF NOT EXISTS public.community_comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid REFERENCES public.community_posts ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  content text NOT NULL,
  is_helpful boolean DEFAULT false,
  heart_count integer DEFAULT 0,
  is_removed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read non-removed comments"
  ON public.community_comments FOR SELECT TO authenticated
  USING (is_removed = false);

CREATE POLICY "Authors insert own comments"
  ON public.community_comments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authors update own comments"
  ON public.community_comments FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authors delete own comments"
  ON public.community_comments FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins manage all comments"
  ON public.community_comments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ═══ COMMUNITY HEARTS ═══
CREATE TABLE IF NOT EXISTS public.community_hearts (
  user_id uuid NOT NULL,
  post_id uuid REFERENCES public.community_posts ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);

ALTER TABLE public.community_hearts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members manage own hearts"
  ON public.community_hearts FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated read hearts"
  ON public.community_hearts FOR SELECT TO authenticated
  USING (true);

-- ═══ COMMUNITY CHALLENGES ═══
CREATE TABLE IF NOT EXISTS public.community_challenges (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  is_admin_created boolean DEFAULT true,
  starts_at timestamptz,
  ends_at timestamptz,
  participant_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.community_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read challenges"
  ON public.community_challenges FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins manage challenges"
  ON public.community_challenges FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ═══ CHALLENGE PARTICIPANTS ═══
CREATE TABLE IF NOT EXISTS public.challenge_participants (
  user_id uuid NOT NULL,
  challenge_id uuid REFERENCES public.community_challenges ON DELETE CASCADE NOT NULL,
  joined_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  PRIMARY KEY (user_id, challenge_id)
);

ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read participants"
  ON public.challenge_participants FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Members manage own participation"
  ON public.challenge_participants FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Members can leave challenges"
  ON public.challenge_participants FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Members update own participation"
  ON public.challenge_participants FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- ═══ MODERATION QUEUE ═══
CREATE TABLE IF NOT EXISTS public.moderation_queue (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid REFERENCES public.community_posts,
  comment_id uuid REFERENCES public.community_comments,
  reporter_id uuid,
  reason text,
  status text DEFAULT 'pending',
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.moderation_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read moderation queue"
  ON public.moderation_queue FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update moderation queue"
  ON public.moderation_queue FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated can report"
  ON public.moderation_queue FOR INSERT TO authenticated
  WITH CHECK (true);

-- ═══ SIGNAL ANNOUNCEMENTS ═══
CREATE TABLE IF NOT EXISTS public.signal_announcements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  content text NOT NULL,
  phase_target text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.signal_announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read announcements"
  ON public.signal_announcements FOR SELECT TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins manage announcements"
  ON public.signal_announcements FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ═══ JOURNAL ENHANCEMENTS ═══
ALTER TABLE public.journal_entries ADD COLUMN IF NOT EXISTS entry_type text DEFAULT 'standard';

CREATE INDEX IF NOT EXISTS journal_entries_user_date
  ON public.journal_entries(user_id, created_at DESC);

-- ═══ REALTIME for community posts ═══
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_comments;

-- ═══ STORAGE BUCKET for community media ═══
INSERT INTO storage.buckets (id, name, public) VALUES ('community-media', 'community-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated upload community media"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'community-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public read community media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'community-media');

CREATE POLICY "Users delete own community media"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'community-media' AND auth.uid()::text = (storage.foldername(name))[1]);
