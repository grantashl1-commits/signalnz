
-- Drop existing view first then recreate
DROP VIEW IF EXISTS public.partner_connections_safe;

CREATE VIEW public.partner_connections_safe AS
SELECT
  id, member_user_id, partner_user_id, partner_name,
  status, shared_preferences, created_at, updated_at
FROM public.partner_connections;
