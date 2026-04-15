
-- Fix partner_connections: allow both member and partner to view
DROP POLICY IF EXISTS "Members can view own connections" ON public.partner_connections;

CREATE POLICY "Both parties can view connections"
ON public.partner_connections FOR SELECT
TO authenticated
USING (
  auth.uid() = member_user_id
  OR auth.uid() = partner_user_id
);

-- Fix connect_messages: allow both parties to read messages
DROP POLICY IF EXISTS "Members can view connection messages" ON public.connect_messages;

CREATE POLICY "Both parties can view connection messages"
ON public.connect_messages FOR SELECT
TO authenticated
USING (
  connection_id IN (
    SELECT id FROM public.partner_connections
    WHERE member_user_id = auth.uid() OR partner_user_id = auth.uid()
  )
);
