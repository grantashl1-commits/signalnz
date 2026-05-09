
-- ══════════════════════════════════════════════════════
-- 1. goal_categories
-- ══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.goal_categories (
  id TEXT NOT NULL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  description TEXT,
  intensity_min INTEGER NOT NULL DEFAULT 1,
  intensity_max INTEGER NOT NULL DEFAULT 5,
  hormonal_notes TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.goal_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read goal_categories"
  ON public.goal_categories FOR SELECT
  TO authenticated
  USING (true);

-- ══════════════════════════════════════════════════════
-- 2. training_programs
-- ══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.training_programs (
  id TEXT NOT NULL PRIMARY KEY,
  goal_category_id TEXT NOT NULL REFERENCES public.goal_categories(id),
  title TEXT NOT NULL,
  description TEXT,
  who_its_for TEXT,
  duration_weeks INTEGER NOT NULL DEFAULT 12,
  days_per_week INTEGER NOT NULL DEFAULT 3,
  intensity_level TEXT,
  equipment TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.training_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read training_programs"
  ON public.training_programs FOR SELECT
  TO authenticated
  USING (true);

-- ══════════════════════════════════════════════════════
-- 3. program_phases
-- ══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.program_phases (
  id TEXT NOT NULL PRIMARY KEY,
  program_id TEXT NOT NULL REFERENCES public.training_programs(id),
  phase_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  duration_weeks INTEGER NOT NULL DEFAULT 4,
  rpe_min NUMERIC(3,1),
  rpe_max NUMERIC(3,1),
  focus TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.program_phases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read program_phases"
  ON public.program_phases FOR SELECT
  TO authenticated
  USING (true);

-- ══════════════════════════════════════════════════════
-- 4. workout_templates
-- ══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.workout_templates (
  id TEXT NOT NULL PRIMARY KEY,
  phase_id TEXT NOT NULL REFERENCES public.program_phases(id),
  day_label TEXT NOT NULL,
  session_name TEXT NOT NULL,
  warmup_notes TEXT,
  cooldown_notes TEXT,
  session_notes TEXT,
  estimated_duration_min INTEGER NOT NULL DEFAULT 45,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.workout_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read workout_templates"
  ON public.workout_templates FOR SELECT
  TO authenticated
  USING (true);

-- ══════════════════════════════════════════════════════
-- 5. workout_exercises
-- ══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.workout_exercises (
  id TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  workout_template_id TEXT NOT NULL REFERENCES public.workout_templates(id),
  exercise_id TEXT NOT NULL REFERENCES public.exercises(id),
  order_index INTEGER NOT NULL DEFAULT 0,
  sets INTEGER,
  reps TEXT,
  rest_seconds INTEGER,
  rpe_target NUMERIC(3,1),
  load_guidance TEXT,
  progression_notes TEXT,
  is_superset BOOLEAN NOT NULL DEFAULT false,
  superset_group TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read workout_exercises"
  ON public.workout_exercises FOR SELECT
  TO authenticated
  USING (true);

-- ══════════════════════════════════════════════════════
-- 6. Extend exercises table
-- ══════════════════════════════════════════════════════
ALTER TABLE public.exercises
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS primary_muscles JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS difficulty INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS cues JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS is_low_impact BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_somatic BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS evidence_source TEXT;

-- ══════════════════════════════════════════════════════
-- 7. Add goal_category_id to profiles
-- ══════════════════════════════════════════════════════
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS goal_category_id TEXT REFERENCES public.goal_categories(id);

-- ══════════════════════════════════════════════════════
-- 8. Indexes
-- ══════════════════════════════════════════════════════
CREATE INDEX idx_training_programs_goal ON public.training_programs(goal_category_id);
CREATE INDEX idx_program_phases_program ON public.program_phases(program_id);
CREATE INDEX idx_workout_templates_phase ON public.workout_templates(phase_id);
CREATE INDEX idx_workout_exercises_template ON public.workout_exercises(workout_template_id);
CREATE INDEX idx_workout_exercises_exercise ON public.workout_exercises(exercise_id);
CREATE INDEX idx_exercises_category ON public.exercises(category);
CREATE INDEX idx_profiles_goal ON public.profiles(goal_category_id);
