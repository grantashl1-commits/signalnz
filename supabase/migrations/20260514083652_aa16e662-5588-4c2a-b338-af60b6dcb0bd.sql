CREATE TABLE IF NOT EXISTS public.community_message_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.community_messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  reaction text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (message_id, user_id, reaction)
);

CREATE INDEX IF NOT EXISTS idx_cmr_message ON public.community_message_reactions(message_id);

ALTER TABLE public.community_message_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reactions are viewable by group members"
  ON public.community_message_reactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.community_messages m
      JOIN public.community_memberships mem ON mem.group_id = m.group_id
      WHERE m.id = community_message_reactions.message_id
        AND mem.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can react as themselves"
  ON public.community_message_reactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove own reactions"
  ON public.community_message_reactions FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

ALTER PUBLICATION supabase_realtime ADD TABLE public.community_message_reactions;