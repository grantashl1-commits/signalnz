-- Manual membership grants
--
-- Lets the owner put a member on a paid tier before Stripe products and prices
-- exist. The grant is the source of truth for feature gating; check-subscription
-- reads it before it ever touches Stripe.
--
-- Design notes:
--  * Keyed by email so a grant can be created from the Supabase dashboard before
--    that person has even signed up. The signup trigger applies it on first login.
--  * Members get SELECT on their own row only. There is deliberately no
--    INSERT/UPDATE/DELETE policy for `authenticated`, so a member cannot promote
--    themselves — writes go through the service role or the SQL editor.
--  * Email comparison is always lower(email), so casing never matters and two
--    rows for the same person cannot exist.

CREATE TABLE IF NOT EXISTS public.membership_grants (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email      text NOT NULL,
  tier       text NOT NULL CHECK (tier IN ('rooted', 'nourished', 'thriving')),
  note       text,
  granted_by text DEFAULT 'manual',
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.membership_grants IS
  'Manual/complimentary tier assignments that bypass Stripe. Rows are read by check-subscription before Stripe is consulted.';

-- Case-insensitive uniqueness. NULLs never collide, and email is NOT NULL.
CREATE UNIQUE INDEX IF NOT EXISTS membership_grants_email_lower_key
  ON public.membership_grants (lower(email));

ALTER TABLE public.membership_grants ENABLE ROW LEVEL SECURITY;

-- Read own grant only. `auth.jwt() ->> 'email'` is the signed claim, so it cannot
-- be spoofed by the client.
DROP POLICY IF EXISTS "Members read own membership grant" ON public.membership_grants;
CREATE POLICY "Members read own membership grant"
ON public.membership_grants FOR SELECT TO authenticated
USING (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

DROP TRIGGER IF EXISTS update_membership_grants_updated_at ON public.membership_grants;
CREATE TRIGGER update_membership_grants_updated_at
BEFORE UPDATE ON public.membership_grants
FOR EACH ROW EXECUTE FUNCTION public.update_feedback_updated_at();

-- AI credit allowance per tier, matching the published plan table
-- (Rooted 30, Nourished 150, Thriving 500/month; free 5).
CREATE OR REPLACE FUNCTION public.tier_ai_allowance(p_tier text)
RETURNS integer
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE p_tier
    WHEN 'rooted'    THEN 30
    WHEN 'nourished' THEN 150
    WHEN 'thriving'  THEN 500
    ELSE 5
  END;
$$;

-- The single place that decides whether a grant is currently in force.
-- Returns zero rows when there is no grant or it has expired.
CREATE OR REPLACE FUNCTION public.active_membership_grant(p_email text)
RETURNS TABLE (tier text, expires_at timestamptz, note text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT g.tier, g.expires_at, g.note
  FROM public.membership_grants g
  WHERE lower(g.email) = lower(p_email)
    AND (g.expires_at IS NULL OR g.expires_at > now())
  LIMIT 1;
$$;

-- Bring ai_credits in line with the member's current grant. Kept separate from
-- the grant write so a pre-signup grant can be applied later by the trigger.
CREATE OR REPLACE FUNCTION public.sync_grant_credits(p_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_tier    text;
BEGIN
  SELECT u.id INTO v_user_id
  FROM auth.users u
  WHERE lower(u.email) = lower(p_email)
  LIMIT 1;

  -- Grant is stored; the signup trigger applies it when they register.
  IF v_user_id IS NULL THEN
    RETURN;
  END IF;

  SELECT g.tier INTO v_tier FROM public.active_membership_grant(p_email) g;

  INSERT INTO public.ai_credits (user_identifier, credits_remaining, tier)
  VALUES (
    v_user_id::text,
    public.tier_ai_allowance(v_tier),
    coalesce(v_tier, 'free')
  )
  ON CONFLICT (user_identifier) DO UPDATE
    SET credits_remaining = EXCLUDED.credits_remaining,
        tier              = EXCLUDED.tier,
        updated_at        = now();
END;
$$;

-- Grant or update a tier by email. Safe to re-run; updates in place.
CREATE OR REPLACE FUNCTION public.grant_membership(
  p_email      text,
  p_tier       text,
  p_note       text DEFAULT NULL,
  p_expires_at timestamptz DEFAULT NULL
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_tier NOT IN ('rooted', 'nourished', 'thriving') THEN
    RAISE EXCEPTION 'invalid tier %: expected rooted, nourished or thriving', p_tier;
  END IF;

  INSERT INTO public.membership_grants AS g (email, tier, note, expires_at, granted_by)
  VALUES (lower(trim(p_email)), p_tier, p_note, p_expires_at, 'sql')
  ON CONFLICT (lower(email)) DO UPDATE
    SET tier       = EXCLUDED.tier,
        note       = coalesce(EXCLUDED.note, g.note),
        expires_at = EXCLUDED.expires_at,
        granted_by = EXCLUDED.granted_by;

  PERFORM public.sync_grant_credits(p_email);

  RETURN p_tier;
END;
$$;

-- Remove a grant and drop the member back to free credits.
CREATE OR REPLACE FUNCTION public.revoke_membership(p_email text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.membership_grants WHERE lower(email) = lower(trim(p_email));
  PERFORM public.sync_grant_credits(p_email);
  RETURN 'revoked';
END;
$$;

-- Apply a grant that was created before the member signed up.
CREATE OR REPLACE FUNCTION public.apply_membership_grant_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email IS NOT NULL
     AND EXISTS (SELECT 1 FROM public.active_membership_grant(NEW.email)) THEN
    PERFORM public.sync_grant_credits(NEW.email);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_signup_apply_membership_grant ON auth.users;
CREATE TRIGGER on_signup_apply_membership_grant
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.apply_membership_grant_on_signup();

-- Only the backend may resolve or write grants. Revoking from PUBLIC also strips
-- service_role, so it is re-granted explicitly afterwards — an authenticated
-- member must never be able to call grant_membership for themselves.
REVOKE ALL ON FUNCTION public.active_membership_grant(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.sync_grant_credits(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.grant_membership(text, text, text, timestamptz) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.revoke_membership(text) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.active_membership_grant(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.sync_grant_credits(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.grant_membership(text, text, text, timestamptz) TO service_role;
GRANT EXECUTE ON FUNCTION public.revoke_membership(text) TO service_role;

-- Credit the members previously hardcoded in check-subscription's
-- EMAIL_TIER_OVERRIDES so their access survives the move to this table.
INSERT INTO public.membership_grants (email, tier, note, granted_by)
VALUES
  ('taliasmayall@gmail.com', 'thriving', 'Migrated from check-subscription EMAIL_TIER_OVERRIDES', 'migration'),
  ('leanne.bats@gmail.com',  'thriving', 'Migrated from check-subscription EMAIL_TIER_OVERRIDES', 'migration'),
  ('grantashl1@gmail.com',   'thriving', 'Owner account — full access while Stripe is being set up', 'migration')
ON CONFLICT (lower(email)) DO NOTHING;

-- Apply the seeded grants to ai_credits for anyone who already has an account.
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN SELECT email FROM public.membership_grants LOOP
    PERFORM public.sync_grant_credits(r.email);
  END LOOP;
END;
$$;
