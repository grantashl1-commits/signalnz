-- 1. gift_codes: stop public browsing of purchaser emails.
--    Redemption goes through a security-definer lookup that returns no emails.
DROP POLICY IF EXISTS "Anyone can look up gift codes for redemption" ON public.gift_codes;

CREATE POLICY "Users can view gift codes they purchased or received"
  ON public.gift_codes FOR SELECT TO authenticated
  USING (
    purchaser_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR recipient_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR redeemed_by = auth.uid()
  );

CREATE OR REPLACE FUNCTION public.lookup_gift_code(p_code text)
RETURNS TABLE(tier text, duration_months integer, is_redeemed boolean, is_expired boolean)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT g.tier, g.duration_months, g.redeemed_at IS NOT NULL, g.expires_at < now()
  FROM public.gift_codes g
  WHERE g.code = p_code
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.lookup_gift_code(text) TO anon, authenticated;

-- 2. community_message_rsvps: only members of the event's group can see RSVPs
DROP POLICY IF EXISTS "Authenticated users can view RSVPs" ON public.community_message_rsvps;

CREATE POLICY "Group members can view RSVPs for their group events"
  ON public.community_message_rsvps FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.community_messages m
      JOIN public.community_memberships cm
        ON cm.group_id = m.group_id AND cm.user_id = auth.uid()
      WHERE m.id = community_message_rsvps.message_id
    )
  );