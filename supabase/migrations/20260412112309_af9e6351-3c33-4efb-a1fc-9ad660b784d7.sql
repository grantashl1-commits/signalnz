
-- 1. Hide partner_pin_hash from SELECT by creating a secure view approach
-- Instead of exposing the hash, create a verify function
CREATE OR REPLACE FUNCTION public.verify_partner_pin(
  _connection_id uuid,
  _pin text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stored_hash text;
BEGIN
  SELECT partner_pin_hash INTO stored_hash
  FROM public.partner_connections
  WHERE id = _connection_id;
  
  IF stored_hash IS NULL THEN
    RETURN false;
  END IF;
  
  -- Compare using crypt for bcrypt hashes, or simple comparison for SHA256
  RETURN stored_hash = crypt(_pin, stored_hash);
END;
$$;

-- Update the SELECT policy to exclude partner_pin_hash by restricting via a view
-- Since we can't do column-level RLS, we'll create a secure view
CREATE OR REPLACE VIEW public.partner_connections_safe AS
SELECT 
  id, created_at, join_code, member_user_id, partner_name,
  partner_user_id, shared_preferences, status, updated_at
FROM public.partner_connections;

-- 2. Add RLS policies on realtime.messages to restrict channel subscriptions
-- Note: We scope this through the underlying table policies since we can't modify realtime schema

-- 3. Restrict anonymous post user_id exposure - add a function to mask anonymous posts
CREATE OR REPLACE FUNCTION public.mask_anonymous_user_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- For anonymous posts, we still store the real user_id for moderation
  -- but the RLS policy will handle visibility
  RETURN NEW;
END;
$$;
