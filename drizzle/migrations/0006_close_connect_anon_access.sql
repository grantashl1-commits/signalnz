-- Connect: close the blanket anon access on the Connect tables.
--
-- The 2026-04-15 Connect tables allowed the anon role to SELECT/INSERT/UPDATE
-- every row (USING (true)), so anyone holding the public app key could read
-- every couple's reflections, check-ins, commitments and shared answers.
-- Messages were already locked to the two linked people (2026-04-12). The
-- other Connect tables now follow the same rule: only the member and the
-- linked partner (an account or a Supabase anonymous sign-in) can see them.

DROP POLICY IF EXISTS "Anon can insert progress" ON public.connect_partner_progress;
DROP POLICY IF EXISTS "Anon can select progress" ON public.connect_partner_progress;
DROP POLICY IF EXISTS "Anon can update progress" ON public.connect_partner_progress;
DROP POLICY IF EXISTS "Anon insert reflections" ON public.connect_reflections;
DROP POLICY IF EXISTS "Anon select reflections" ON public.connect_reflections;
DROP POLICY IF EXISTS "Anon update reflections" ON public.connect_reflections;
DROP POLICY IF EXISTS "Anon insert responses" ON public.connect_shared_responses;
DROP POLICY IF EXISTS "Anon select responses" ON public.connect_shared_responses;
DROP POLICY IF EXISTS "Anon insert commitments" ON public.connect_commitments;
DROP POLICY IF EXISTS "Anon select commitments" ON public.connect_commitments;
DROP POLICY IF EXISTS "Anon insert checkins" ON public.connect_checkins;
DROP POLICY IF EXISTS "Anon select checkins" ON public.connect_checkins;

-- The weekly check-in is saved with an upsert, which needs an UPDATE policy too.
DROP POLICY IF EXISTS "Partners update checkins" ON public.connect_checkins;
CREATE POLICY "Partners update checkins" ON public.connect_checkins FOR UPDATE TO authenticated
  USING (connection_id IN (SELECT id FROM public.partner_connections WHERE member_user_id = auth.uid() OR partner_user_id = auth.uid()))
  WITH CHECK (connection_id IN (SELECT id FROM public.partner_connections WHERE member_user_id = auth.uid() OR partner_user_id = auth.uid()));

-- The partner joins with the 6-character code and PIN. This links the signed-in
-- caller as the partner (the client cannot update partner_connections itself),
-- and allows 5 attempts a minute per caller so the PIN can't be guessed quickly.
CREATE OR REPLACE FUNCTION public.join_partner_connection(_code text, _pin_hash text)
RETURNS TABLE(connection_id uuid, partner_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _limit jsonb;
  _row record;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Sign-in required' USING ERRCODE = '28000';
  END IF;

  _limit := public.check_rate_limit(_uid::text, 'join_partner_connection', 5);
  IF NOT COALESCE((_limit->>'allowed')::boolean, true) THEN
    RAISE EXCEPTION 'Too many attempts. Wait a minute and try again.' USING ERRCODE = '54000';
  END IF;

  SELECT pc.id, pc.partner_name, pc.member_user_id INTO _row
  FROM public.partner_connections pc
  WHERE pc.join_code = upper(_code) AND pc.partner_pin_hash = _pin_hash
  LIMIT 1;

  IF NOT FOUND OR _row.member_user_id = _uid THEN
    RETURN;
  END IF;

  UPDATE public.partner_connections
  SET status = 'linked', partner_user_id = _uid
  WHERE id = _row.id;

  RETURN QUERY SELECT _row.id, _row.partner_name;
END;
$$;

REVOKE ALL ON FUNCTION public.join_partner_connection(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.join_partner_connection(text, text) TO authenticated;

-- The old lookup returned a match to anyone (anon included) without linking or
-- rate limiting; joining now goes through join_partner_connection.
REVOKE EXECUTE ON FUNCTION public.verify_partner_pin(text, text) FROM PUBLIC, anon;
