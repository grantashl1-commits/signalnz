
-- Drop the SECURITY DEFINER view and recreate as SECURITY INVOKER
DROP VIEW IF EXISTS public.partner_connections_safe;

CREATE VIEW public.partner_connections_safe
WITH (security_invoker = true)
AS
SELECT 
  id, created_at, join_code, member_user_id, partner_name,
  partner_user_id, shared_preferences, status, updated_at
FROM public.partner_connections;
