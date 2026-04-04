
-- ══════════════════════════════════════════
-- CLEAR EXISTING SEED DATA (order matters for FK)
-- ══════════════════════════════════════════
DELETE FROM public.workout_exercises;
DELETE FROM public.workout_templates;
DELETE FROM public.program_phases;
DELETE FROM public.training_programs;
DELETE FROM public.exercises WHERE id LIKE 'ex-%';
-- Don't delete goal_categories yet — will upsert

-- ══════════════════════════════════════════
-- 1. EXERCISES: add slug, change column types
-- ══════════════════════════════════════════
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS slug TEXT;

-- Change primary_muscles from JSONB to TEXT[]
ALTER TABLE public.exercises DROP COLUMN IF EXISTS primary_muscles;
ALTER TABLE public.exercises ADD COLUMN primary_muscles TEXT[] DEFAULT '{}';

-- Change secondary_muscles from JSONB to TEXT[]
ALTER TABLE public.exercises DROP COLUMN IF EXISTS secondary_muscles;
ALTER TABLE public.exercises ADD COLUMN secondary_muscles TEXT[] DEFAULT '{}';

-- Change equipment from TEXT to TEXT[]
ALTER TABLE public.exercises DROP COLUMN IF EXISTS equipment;
ALTER TABLE public.exercises ADD COLUMN equipment TEXT[] DEFAULT '{}';

-- Change instructions from JSONB to TEXT
ALTER TABLE public.exercises DROP COLUMN IF EXISTS instructions;
ALTER TABLE public.exercises ADD COLUMN instructions TEXT;

-- Change cues from JSONB to TEXT[]
ALTER TABLE public.exercises DROP COLUMN IF EXISTS cues;
ALTER TABLE public.exercises ADD COLUMN cues TEXT[] DEFAULT '{}';

CREATE UNIQUE INDEX IF NOT EXISTS idx_exercises_slug ON public.exercises(slug) WHERE slug IS NOT NULL;

-- ══════════════════════════════════════════
-- 2. TRAINING_PROGRAMS: restructure columns
-- ══════════════════════════════════════════
ALTER TABLE public.training_programs ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.training_programs ADD COLUMN IF NOT EXISTS phase_structure TEXT;
ALTER TABLE public.training_programs ADD COLUMN IF NOT EXISTS evidence_basis TEXT;
ALTER TABLE public.training_programs ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Rename days_per_week -> sessions_per_week
ALTER TABLE public.training_programs RENAME COLUMN days_per_week TO sessions_per_week;

-- Rename equipment -> equipment_needed  
ALTER TABLE public.training_programs RENAME COLUMN equipment TO equipment_needed;

-- intensity_level is currently TEXT, seed uses INTEGER — change to INTEGER
ALTER TABLE public.training_programs ALTER COLUMN intensity_level TYPE INTEGER USING CASE WHEN intensity_level ~ '^\d+$' THEN intensity_level::integer ELSE NULL END;

-- ══════════════════════════════════════════
-- 3. PROGRAM_PHASES: restructure columns
-- ══════════════════════════════════════════
-- Rename name -> title
ALTER TABLE public.program_phases RENAME COLUMN name TO title;

-- Replace duration_weeks with week_start/week_end
ALTER TABLE public.program_phases DROP COLUMN IF EXISTS duration_weeks;
ALTER TABLE public.program_phases ADD COLUMN IF NOT EXISTS week_start INTEGER;
ALTER TABLE public.program_phases ADD COLUMN IF NOT EXISTS week_end INTEGER;

-- Rename focus -> phase_goal
ALTER TABLE public.program_phases RENAME COLUMN focus TO phase_goal;

-- Rename rpe_min/rpe_max -> rpe_target_min/rpe_target_max
ALTER TABLE public.program_phases RENAME COLUMN rpe_min TO rpe_target_min;
ALTER TABLE public.program_phases RENAME COLUMN rpe_max TO rpe_target_max;

-- ══════════════════════════════════════════
-- 4. WORKOUT_TEMPLATES: restructure columns
-- ══════════════════════════════════════════
-- Add program_id reference
ALTER TABLE public.workout_templates ADD COLUMN IF NOT EXISTS program_id TEXT REFERENCES public.training_programs(id);

-- Rename session_name -> title
ALTER TABLE public.workout_templates RENAME COLUMN session_name TO title;

-- Add session_number and session_type
ALTER TABLE public.workout_templates ADD COLUMN IF NOT EXISTS session_number INTEGER;
ALTER TABLE public.workout_templates ADD COLUMN IF NOT EXISTS session_type TEXT;

-- Rename estimated_duration_min -> estimated_duration_mins
ALTER TABLE public.workout_templates RENAME COLUMN estimated_duration_min TO estimated_duration_mins;

-- Drop sort_order (seed uses session_number instead)
ALTER TABLE public.workout_templates DROP COLUMN IF EXISTS sort_order;
-- Drop day_label (seed uses title which is more descriptive)
ALTER TABLE public.workout_templates ALTER COLUMN day_label DROP NOT NULL;

-- ══════════════════════════════════════════
-- 5. WORKOUT_EXERCISES: rename column
-- ══════════════════════════════════════════
ALTER TABLE public.workout_exercises RENAME COLUMN workout_template_id TO workout_id;

-- Drop the old index and create new one
DROP INDEX IF EXISTS idx_workout_exercises_template;
CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout ON public.workout_exercises(workout_id);

-- Update goal_categories with new data (upsert)
DELETE FROM public.goal_categories;
