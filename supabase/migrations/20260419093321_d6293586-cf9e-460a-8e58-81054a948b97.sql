-- Community chat messages
CREATE TABLE public.community_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.community_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text', -- text | poll | event | image | voice
  content TEXT,
  media_path TEXT,           -- storage path for image/voice
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb, -- poll options/votes, event details, etc.
  is_removed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_community_messages_group_created
  ON public.community_messages (group_id, created_at);

ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;

-- Security definer helper to avoid RLS recursion against community_memberships
CREATE OR REPLACE FUNCTION public.is_group_member(_user_id UUID, _group_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.community_memberships
    WHERE user_id = _user_id AND group_id = _group_id
  );
$$;

-- Policies
CREATE POLICY "Members can view group messages"
  ON public.community_messages FOR SELECT
  TO authenticated
  USING (is_removed = false AND public.is_group_member(auth.uid(), group_id));

CREATE POLICY "Admins can view all messages"
  ON public.community_messages FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Members can post in their groups"
  ON public.community_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.is_group_member(auth.uid(), group_id));

CREATE POLICY "Authors can update own messages"
  ON public.community_messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authors can delete own messages"
  ON public.community_messages FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can moderate messages"
  ON public.community_messages FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Auto-update updated_at
CREATE TRIGGER update_community_messages_updated_at
  BEFORE UPDATE ON public.community_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER TABLE public.community_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_messages;