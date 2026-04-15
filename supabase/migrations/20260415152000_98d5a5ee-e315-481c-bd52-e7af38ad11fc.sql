
-- Drop anon policies from connect_checkins
DROP POLICY IF EXISTS "Anon insert checkins" ON public.connect_checkins;
DROP POLICY IF EXISTS "Anon select checkins" ON public.connect_checkins;

-- Drop anon policies from connect_commitments
DROP POLICY IF EXISTS "Anon insert commitments" ON public.connect_commitments;
DROP POLICY IF EXISTS "Anon select commitments" ON public.connect_commitments;

-- Drop anon policies from connect_reflections
DROP POLICY IF EXISTS "Anon insert reflections" ON public.connect_reflections;
DROP POLICY IF EXISTS "Anon select reflections" ON public.connect_reflections;
DROP POLICY IF EXISTS "Anon update reflections" ON public.connect_reflections;

-- Drop anon policies from connect_shared_responses
DROP POLICY IF EXISTS "Anon insert responses" ON public.connect_shared_responses;
DROP POLICY IF EXISTS "Anon select responses" ON public.connect_shared_responses;

-- Drop anon policies from connect_partner_progress
DROP POLICY IF EXISTS "Anon can insert progress" ON public.connect_partner_progress;
DROP POLICY IF EXISTS "Anon can select progress" ON public.connect_partner_progress;
DROP POLICY IF EXISTS "Anon can update progress" ON public.connect_partner_progress;
