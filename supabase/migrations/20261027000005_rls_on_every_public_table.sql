-- Supabase security email (17 and 25 Oct 2026): "Table publicly accessible",
-- rls_disabled_in_public. A table in public has row-level security off, so anyone
-- holding the app's public key can read, change or delete every row in it.
--
-- The email doesn't name the table. Every table this repo's migrations create
-- switches RLS on, so it is PostGIS's spatial_ref_sys or one of the tables made
-- outside the repo. This file fixes whichever of them still has RLS off:
--   * rules that keep what signed-in members do today (chat, the interval timer),
--   * no anonymous access and no writing other people's rows,
--   * edge functions use the service key, which RLS does not apply to.
-- Safe to run more than once. The last query lists anything still exposed: expect none.

-- ── 1. PostGIS out of public ───────────────────────────────────────────────
-- An early migration installed PostGIS into public, which put its reference table
-- spatial_ref_sys there with RLS off. Nothing in the app uses PostGIS (Nearby stores
-- plain numbers), so it moves to the extensions schema, as Supabase recommends.
-- The drop has no CASCADE: if anything does depend on PostGIS it refuses, the
-- block rolls back and app roles lose access to the table instead.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension e JOIN pg_namespace n ON n.oid = e.extnamespace
             WHERE e.extname = 'postgis' AND n.nspname = 'public') THEN
    BEGIN
      DROP EXTENSION postgis;
      CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;
      RAISE NOTICE 'PostGIS moved to the extensions schema';
    EXCEPTION WHEN others THEN
      RAISE NOTICE 'PostGIS not moved (%); removing app access to spatial_ref_sys instead', SQLERRM;
      REVOKE ALL ON TABLE public.spatial_ref_sys FROM PUBLIC, anon, authenticated;
    END;
  END IF;
END $$;

-- ── 2. Tables made outside the repo ────────────────────────────────────────
-- Each is changed only if it exists with RLS off. Rules already written for a
-- table are kept; the ones here are added only where a table has none.
CREATE OR REPLACE FUNCTION pg_temp.protect(t text, rules text[]) RETURNS void
LANGUAGE plpgsql AS $$
DECLARE r text;
BEGIN
  IF to_regclass(format('public.%I', t)) IS NULL
     OR (SELECT relrowsecurity FROM pg_class WHERE oid = to_regclass(format('public.%I', t))) THEN
    RETURN;
  END IF;
  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = t) THEN
    FOREACH r IN ARRAY rules LOOP
      EXECUTE format(r, t);
    END LOOP;
  END IF;
  RAISE NOTICE 'Row-level security switched on: %', t;
END $$;

-- Chat. Signed-in members keep reading as they do now; each writes only her own
-- messages; admins can remove any (Admin → Reports).
SELECT pg_temp.protect('community_messages', ARRAY[
  'CREATE POLICY "Members read messages" ON public.%I FOR SELECT TO authenticated USING (true)',
  'CREATE POLICY "Members post as themselves" ON public.%I FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid())',
  'CREATE POLICY "Authors and admins edit" ON public.%I FOR UPDATE TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), ''admin'')) WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(), ''admin''))',
  'CREATE POLICY "Authors and admins delete" ON public.%I FOR DELETE TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), ''admin''))'
]);

-- Read by the interval timer (WorkoutSessionView.tsx); nobody writes from the app.
SELECT pg_temp.protect('workout_intervals', ARRAY[
  'CREATE POLICY "Members read intervals" ON public.%I FOR SELECT TO authenticated USING (true)'
]);

-- Gift codes: redemption goes through lookup_gift_code; buyers and recipients see their own.
SELECT pg_temp.protect('gift_codes', ARRAY[
  'CREATE POLICY "Buyers and recipients read own" ON public.%I FOR SELECT TO authenticated USING (purchaser_email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR recipient_email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR redeemed_by = auth.uid())'
]);

-- Not read by the app: each member's own rows only.
SELECT pg_temp.protect(t, ARRAY[
  'CREATE POLICY "Own rows" ON public.%I FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid())'
]) FROM unnest(ARRAY['community_last_reads', 'challenge_answers', 'challenge_completions', 'message_reactions']) AS t;

-- Written by webhooks and admins only: members can read their own.
SELECT pg_temp.protect(t, ARRAY[
  'CREATE POLICY "Read own" ON public.%I FOR SELECT TO authenticated USING (user_id = auth.uid())'
]) FROM unnest(ARRAY['one_off_purchases', 'account_suspensions']) AS t;

-- An older reports table the app doesn't use (it uses community_reports).
SELECT pg_temp.protect('user_reports', ARRAY[
  'CREATE POLICY "Reporters file and read own" ON public.%I FOR ALL TO authenticated USING (reporter_id = auth.uid()) WITH CHECK (reporter_id = auth.uid())'
]);

-- Server-only list: RLS on, no access from the app.
SELECT pg_temp.protect('disposable_email_domains', ARRAY[]::text[]);

-- ── 3. Anything else ───────────────────────────────────────────────────────
-- No code in the app or its edge functions reads a public table other than the ones
-- above and those the repo creates (all with RLS on), so any other table found
-- here gets RLS with no rules: closed to the app's keys, open to the service key.
DO $$
DECLARE t text;
BEGIN
  FOR t IN
    SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p') AND NOT c.relrowsecurity
      AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.objid = c.oid AND d.deptype = 'e')
  LOOP
    BEGIN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
      RAISE NOTICE 'Row-level security switched on (no rules): %', t;
    EXCEPTION WHEN others THEN
      RAISE NOTICE 'Could not switch on row-level security for % (%)', t, SQLERRM;
    END;
  END LOOP;
END $$;

-- ── Check: public tables the app's keys can still reach without RLS. Expect no rows. ──
SELECT c.relname AS still_exposed
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p') AND NOT c.relrowsecurity
  AND (has_table_privilege('anon', c.oid, 'SELECT') OR has_table_privilege('authenticated', c.oid, 'SELECT'));
