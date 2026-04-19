
-- ============================================================
-- 1. community_last_reads — unread tracking
-- ============================================================
CREATE TABLE public.community_last_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  group_id UUID NOT NULL REFERENCES public.community_groups(id) ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, group_id)
);

CREATE INDEX idx_last_reads_user ON public.community_last_reads(user_id);

ALTER TABLE public.community_last_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own last_read"
ON public.community_last_reads FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 2. message_reactions — emoji reactions
-- ============================================================
CREATE TABLE public.message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.community_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (message_id, user_id, emoji)
);

CREATE INDEX idx_message_reactions_message ON public.message_reactions(message_id);

ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view reactions in their groups"
ON public.message_reactions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.community_messages cm
    WHERE cm.id = message_id
    AND public.is_group_member(auth.uid(), cm.group_id)
  )
);

CREATE POLICY "Members add own reactions"
ON public.message_reactions FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.community_messages cm
    WHERE cm.id = message_id
    AND public.is_group_member(auth.uid(), cm.group_id)
  )
);

CREATE POLICY "Members remove own reactions"
ON public.message_reactions FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Realtime for reactions
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;

-- ============================================================
-- 3. community_messages — replies, mentions, edits
-- ============================================================
ALTER TABLE public.community_messages
  ADD COLUMN IF NOT EXISTS reply_to_id UUID REFERENCES public.community_messages(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS mentions UUID[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS original_content TEXT;

CREATE INDEX IF NOT EXISTS idx_community_messages_reply_to ON public.community_messages(reply_to_id);
CREATE INDEX IF NOT EXISTS idx_community_messages_mentions ON public.community_messages USING GIN(mentions);

-- Replace the existing "Authors can update own messages" policy with a 15-minute edit window
-- (and only allow editing content / mentions / edited_at / original_content)
DROP POLICY IF EXISTS "Authors can update own messages" ON public.community_messages;

CREATE POLICY "Authors edit own messages within 15 min"
ON public.community_messages FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
  AND created_at > (now() - INTERVAL '15 minutes')
  AND is_removed = false
)
WITH CHECK (
  auth.uid() = user_id
  AND is_removed = false
);

-- Keep the author soft-delete path working (sets is_removed = true)
CREATE POLICY "Authors soft-delete own messages"
ON public.community_messages FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id AND is_removed = true);
