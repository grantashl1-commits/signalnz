
CREATE OR REPLACE FUNCTION public.verify_partner_pin(_code text, _pin_hash text)
RETURNS TABLE(connection_id uuid, partner_name text, connection_status text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, partner_name, status
  FROM public.partner_connections
  WHERE join_code = _code
    AND partner_pin_hash = _pin_hash
  LIMIT 1;
$$;
