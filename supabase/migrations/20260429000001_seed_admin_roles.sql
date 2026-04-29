-- Grant admin role to Signal admin accounts.
-- Uses a subquery so the insert is a no-op if the account doesn't exist yet
-- (admin@mindcast.co.nz may not have signed up yet — role row is inserted
-- automatically by the trigger below once they complete signup).

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE email IN ('grantashl1@gmail.com', 'admin@mindcast.co.nz')
ON CONFLICT (user_id, role) DO NOTHING;

-- Trigger: automatically grant admin role when either admin email signs up.
CREATE OR REPLACE FUNCTION public.auto_grant_admin_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email IN ('grantashl1@gmail.com', 'admin@mindcast.co.nz') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Fire after every new auth.users insert (covers fresh signup + invite acceptance)
DROP TRIGGER IF EXISTS on_admin_signup ON auth.users;
CREATE TRIGGER on_admin_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_grant_admin_role();
