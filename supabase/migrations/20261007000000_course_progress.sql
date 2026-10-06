-- Course progress for Modules, Connect, Embodiment and Parenting courses.
-- The app has been reading/writing these tables, but no migration created
-- them, so progress never saved and later modules stayed locked.
-- Idempotent: safe to run even if the tables already exist.

CREATE TABLE IF NOT EXISTS public.connect_course_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id text,
  lesson_id text,
  activity_id text NOT NULL,
  activity_type text,
  response jsonb,
  completed boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT connect_course_progress_user_activity_key UNIQUE (user_id, activity_id)
);

ALTER TABLE public.connect_course_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own course progress" ON public.connect_course_progress;
CREATE POLICY "Users view own course progress" ON public.connect_course_progress
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own course progress" ON public.connect_course_progress;
CREATE POLICY "Users insert own course progress" ON public.connect_course_progress
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own course progress" ON public.connect_course_progress;
CREATE POLICY "Users update own course progress" ON public.connect_course_progress
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own course progress" ON public.connect_course_progress;
CREATE POLICY "Users delete own course progress" ON public.connect_course_progress
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_connect_course_progress_user ON public.connect_course_progress (user_id);

-- Reflections a member chooses to keep from the Connect course.
CREATE TABLE IF NOT EXISTS public.connect_course_vault (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id text,
  lesson_id text,
  activity_id text,
  title text,
  content text,
  media_type text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.connect_course_vault ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own course vault" ON public.connect_course_vault;
CREATE POLICY "Users view own course vault" ON public.connect_course_vault
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own course vault" ON public.connect_course_vault;
CREATE POLICY "Users insert own course vault" ON public.connect_course_vault
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own course vault" ON public.connect_course_vault;
CREATE POLICY "Users delete own course vault" ON public.connect_course_vault
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_connect_course_vault_user ON public.connect_course_vault (user_id);
