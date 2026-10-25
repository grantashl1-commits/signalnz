REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE public.spatial_ref_sys FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.spatial_ref_sys TO anon, authenticated;