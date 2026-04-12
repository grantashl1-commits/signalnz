
-- 1. partner_connections — remove blanket anon read
DROP POLICY IF EXISTS "Anyone can read by join code" ON public.partner_connections;

CREATE OR REPLACE FUNCTION public.lookup_connection_by_code(_code text)
RETURNS TABLE(id uuid, partner_name text, status text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, partner_name, status
  FROM public.partner_connections
  WHERE join_code = _code
  LIMIT 1;
$$;

-- 2. progress-photos — remove anon read
DROP POLICY IF EXISTS "Public read access for progress photos" ON storage.objects;

-- 3. exercise-assets — remove public write
DROP POLICY IF EXISTS "Anyone can upload exercise assets" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update exercise assets" ON storage.objects;

CREATE POLICY "Service role upload exercise assets"
  ON storage.objects FOR INSERT TO service_role
  WITH CHECK (bucket_id = 'exercise-assets');

CREATE POLICY "Service role update exercise assets"
  ON storage.objects FOR UPDATE TO service_role
  USING (bucket_id = 'exercise-assets');

-- 4. ai_credits — scope to own user
DROP POLICY IF EXISTS "Allow all on ai_credits" ON public.ai_credits;

CREATE POLICY "Users can view own ai_credits"
  ON public.ai_credits FOR SELECT TO authenticated
  USING (user_identifier = (auth.uid())::text);

CREATE POLICY "Users can insert own ai_credits"
  ON public.ai_credits FOR INSERT TO authenticated
  WITH CHECK (user_identifier = (auth.uid())::text);

CREATE POLICY "Users can update own ai_credits"
  ON public.ai_credits FOR UPDATE TO authenticated
  USING (user_identifier = (auth.uid())::text);

CREATE POLICY "Service role manage ai_credits"
  ON public.ai_credits FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 5. ai_usage — scope to own user
DROP POLICY IF EXISTS "Allow all on ai_usage" ON public.ai_usage;

CREATE POLICY "Users can view own ai_usage"
  ON public.ai_usage FOR SELECT TO authenticated
  USING (user_identifier = (auth.uid())::text);

CREATE POLICY "Users can insert own ai_usage"
  ON public.ai_usage FOR INSERT TO authenticated
  WITH CHECK (user_identifier = (auth.uid())::text);

CREATE POLICY "Service role manage ai_usage"
  ON public.ai_usage FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 6. signal_memory — scope to own user
DROP POLICY IF EXISTS "Allow all on signal_memory" ON public.signal_memory;

CREATE POLICY "Users can view own signal_memory"
  ON public.signal_memory FOR SELECT TO authenticated
  USING (user_identifier = (auth.uid())::text);

CREATE POLICY "Users can insert own signal_memory"
  ON public.signal_memory FOR INSERT TO authenticated
  WITH CHECK (user_identifier = (auth.uid())::text);

CREATE POLICY "Service role manage signal_memory"
  ON public.signal_memory FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 7. user_insight_profiles — scope to own user
DROP POLICY IF EXISTS "Allow all on user_insight_profiles" ON public.user_insight_profiles;

CREATE POLICY "Users can view own insight profiles"
  ON public.user_insight_profiles FOR SELECT TO authenticated
  USING (user_identifier = (auth.uid())::text);

CREATE POLICY "Users can insert own insight profiles"
  ON public.user_insight_profiles FOR INSERT TO authenticated
  WITH CHECK (user_identifier = (auth.uid())::text);

CREATE POLICY "Users can update own insight profiles"
  ON public.user_insight_profiles FOR UPDATE TO authenticated
  USING (user_identifier = (auth.uid())::text);

CREATE POLICY "Service role manage insight profiles"
  ON public.user_insight_profiles FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 8. connect_messages — remove blanket anon access
DROP POLICY IF EXISTS "Anon can insert messages" ON public.connect_messages;
DROP POLICY IF EXISTS "Anon can read messages" ON public.connect_messages;

CREATE POLICY "Service role manage connect_messages"
  ON public.connect_messages FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 9. feedback — restrict to admin + own
DROP POLICY IF EXISTS "Authenticated can read all feedback" ON public.feedback;
DROP POLICY IF EXISTS "Authenticated can update feedback" ON public.feedback;

CREATE POLICY "Admins can read all feedback"
  ON public.feedback FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update feedback"
  ON public.feedback FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));
