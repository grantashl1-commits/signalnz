-- Community safety before the community beta: blocking, reporting, private
-- profile fields that stay private, and coarse Nearby coordinates.

-- ── Blocks ─────────────────────────────────────────────────────────────
-- A member's own list of people she has blocked. Hiding their messages and
-- Nearby entry happens in the app (src/lib/community-safety.ts).
CREATE TABLE IF NOT EXISTS public.community_blocks (
  blocker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_id),
  CHECK (blocker_id <> blocked_id)
);
ALTER TABLE public.community_blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members manage their own blocks" ON public.community_blocks;
CREATE POLICY "Members manage their own blocks"
  ON public.community_blocks FOR ALL TO authenticated
  USING (blocker_id = auth.uid())
  WITH CHECK (blocker_id = auth.uid());

-- ── Reports ────────────────────────────────────────────────────────────
-- Filed by members, reviewed by admins. A member sees only her own reports.
CREATE TABLE IF NOT EXISTS public.community_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  message_id UUID REFERENCES public.community_messages(id) ON DELETE SET NULL,
  reason TEXT NOT NULL CHECK (char_length(reason) BETWEEN 1 AND 80),
  details TEXT CHECK (details IS NULL OR char_length(details) <= 1000),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewed', 'actioned', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id)
);
ALTER TABLE public.community_reports ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS community_reports_open_idx ON public.community_reports (created_at DESC) WHERE status = 'open';

DROP POLICY IF EXISTS "Members file reports as themselves" ON public.community_reports;
CREATE POLICY "Members file reports as themselves"
  ON public.community_reports FOR INSERT TO authenticated
  WITH CHECK (reporter_id = auth.uid() AND status = 'open' AND reviewed_at IS NULL AND reviewed_by IS NULL);

DROP POLICY IF EXISTS "Members see their own reports" ON public.community_reports;
CREATE POLICY "Members see their own reports"
  ON public.community_reports FOR SELECT TO authenticated
  USING (reporter_id = auth.uid());

DROP POLICY IF EXISTS "Admins review reports" ON public.community_reports;
CREATE POLICY "Admins review reports"
  ON public.community_reports FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ── Community profiles: hidden fields stay hidden ──────────────────────
-- Every signed-in member could read every column, including the ones a member
-- had switched off (employer, looking for, barter). Other members now go
-- through get_community_profile, which returns only the fields she shows.
DROP POLICY IF EXISTS "Authenticated can view community profiles" ON public.community_profiles;

CREATE OR REPLACE FUNCTION public.get_community_profile(target UUID)
RETURNS TABLE (
  career TEXT, employer TEXT, skills TEXT, offer TEXT,
  looking_for TEXT, community_vision TEXT, barter TEXT, photo_url TEXT
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    CASE WHEN COALESCE((p.visibility ->> 'career')::boolean, true) THEN p.career END,
    CASE WHEN COALESCE((p.visibility ->> 'employer')::boolean, true) THEN p.employer END,
    CASE WHEN COALESCE((p.visibility ->> 'skills')::boolean, true) THEN p.skills END,
    CASE WHEN COALESCE((p.visibility ->> 'offer')::boolean, true) THEN p.offer END,
    CASE WHEN COALESCE((p.visibility ->> 'looking_for')::boolean, true) THEN p.looking_for END,
    CASE WHEN COALESCE((p.visibility ->> 'community_vision')::boolean, true) THEN p.community_vision END,
    CASE WHEN COALESCE((p.visibility ->> 'barter')::boolean, true) THEN p.barter END,
    p.photo_url
  FROM public.community_profiles p
  WHERE p.user_id = target
    AND auth.uid() IS NOT NULL;
$$;

REVOKE EXECUTE ON FUNCTION public.get_community_profile(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_community_profile(UUID) TO authenticated;

-- ── Nearby: coarse coordinates only ────────────────────────────────────
-- Nearby lists suburbs, never points. Stored points were a fresh random
-- offset of ~500 m on every share, which repeated shares could average away.
-- The app now snaps to a fixed ~1 km grid; bring existing rows onto it.
UPDATE public.user_locations
SET fuzzed_lat = round(fuzzed_lat::numeric, 2)::double precision,
    fuzzed_lng = round(fuzzed_lng::numeric, 2)::double precision;
