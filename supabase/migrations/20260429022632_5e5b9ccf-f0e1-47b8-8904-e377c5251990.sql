-- Grant admin role to existing accounts
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE email IN ('grantashl1@gmail.com', 'admin@mindcast.co.nz')
ON CONFLICT (user_id, role) DO NOTHING;

-- Auto-grant admin on signup (covers admin@mindcast.co.nz invite acceptance)
CREATE OR REPLACE FUNCTION public.auto_grant_admin_role()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.email IN ('grantashl1@gmail.com', 'admin@mindcast.co.nz') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_admin_signup ON auth.users;
CREATE TRIGGER on_admin_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_grant_admin_role();