
-- Fix the security definer view issue
DROP VIEW IF EXISTS public.partner_connections_safe;
CREATE VIEW public.partner_connections_safe
WITH (security_invoker = true)
AS SELECT
  id, member_user_id, partner_user_id, partner_name,
  status, shared_preferences, created_at, updated_at
FROM public.partner_connections;

-- Now fix Connect table policies
-- connect_checkins
DROP POLICY IF EXISTS "Allow all access to connect_checkins" ON public.connect_checkins;
DROP POLICY IF EXISTS "Users can manage their own connection checkins" ON public.connect_checkins;
CREATE POLICY "Users can manage their own connection checkins"
  ON public.connect_checkins FOR ALL TO authenticated
  USING (
    connection_id IN (
      SELECT id FROM public.partner_connections
      WHERE member_user_id = auth.uid() OR partner_user_id = auth.uid()
    )
  )
  WITH CHECK (
    connection_id IN (
      SELECT id FROM public.partner_connections
      WHERE member_user_id = auth.uid() OR partner_user_id = auth.uid()
    )
  );

-- connect_reflections
DROP POLICY IF EXISTS "Allow all access to connect_reflections" ON public.connect_reflections;
DROP POLICY IF EXISTS "Users can manage their own connection reflections" ON public.connect_reflections;
CREATE POLICY "Users can manage their own connection reflections"
  ON public.connect_reflections FOR ALL TO authenticated
  USING (
    connection_id IN (
      SELECT id FROM public.partner_connections
      WHERE member_user_id = auth.uid() OR partner_user_id = auth.uid()
    )
  )
  WITH CHECK (
    connection_id IN (
      SELECT id FROM public.partner_connections
      WHERE member_user_id = auth.uid() OR partner_user_id = auth.uid()
    )
  );

-- connect_partner_progress
DROP POLICY IF EXISTS "Allow all access to connect_partner_progress" ON public.connect_partner_progress;
DROP POLICY IF EXISTS "Users can manage their own connection progress" ON public.connect_partner_progress;
CREATE POLICY "Users can manage their own connection progress"
  ON public.connect_partner_progress FOR ALL TO authenticated
  USING (
    connection_id IN (
      SELECT id FROM public.partner_connections
      WHERE member_user_id = auth.uid() OR partner_user_id = auth.uid()
    )
  )
  WITH CHECK (
    connection_id IN (
      SELECT id FROM public.partner_connections
      WHERE member_user_id = auth.uid() OR partner_user_id = auth.uid()
    )
  );

-- connect_shared_responses
DROP POLICY IF EXISTS "Allow all access to connect_shared_responses" ON public.connect_shared_responses;
DROP POLICY IF EXISTS "Users can manage their own shared responses" ON public.connect_shared_responses;
CREATE POLICY "Users can manage their own shared responses"
  ON public.connect_shared_responses FOR ALL TO authenticated
  USING (
    connection_id IN (
      SELECT id FROM public.partner_connections
      WHERE member_user_id = auth.uid() OR partner_user_id = auth.uid()
    )
  )
  WITH CHECK (
    connection_id IN (
      SELECT id FROM public.partner_connections
      WHERE member_user_id = auth.uid() OR partner_user_id = auth.uid()
    )
  );

-- connect_commitments
DROP POLICY IF EXISTS "Allow all access to connect_commitments" ON public.connect_commitments;
DROP POLICY IF EXISTS "Users can manage their own commitments" ON public.connect_commitments;
CREATE POLICY "Users can manage their own commitments"
  ON public.connect_commitments FOR ALL TO authenticated
  USING (
    connection_id IN (
      SELECT id FROM public.partner_connections
      WHERE member_user_id = auth.uid() OR partner_user_id = auth.uid()
    )
  )
  WITH CHECK (
    connection_id IN (
      SELECT id FROM public.partner_connections
      WHERE member_user_id = auth.uid() OR partner_user_id = auth.uid()
    )
  );

-- connect_messages
DROP POLICY IF EXISTS "Allow all access to connect_messages" ON public.connect_messages;
DROP POLICY IF EXISTS "Users can manage their own connection messages" ON public.connect_messages;
CREATE POLICY "Users can manage their own connection messages"
  ON public.connect_messages FOR ALL TO authenticated
  USING (
    connection_id IN (
      SELECT id FROM public.partner_connections
      WHERE member_user_id = auth.uid() OR partner_user_id = auth.uid()
    )
  )
  WITH CHECK (
    connection_id IN (
      SELECT id FROM public.partner_connections
      WHERE member_user_id = auth.uid() OR partner_user_id = auth.uid()
    )
  );
