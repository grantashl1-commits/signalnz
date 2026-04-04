
# Signal Exercise & Program System — Build Plan

## Phase 1: Database Schema (Migration)
Create 4 new tables and extend the existing `exercises` table:

### New tables:
- **`goal_categories`** — 11 training goals with slug, label, description, intensity range, hormonal notes
- **`training_programs`** — 8 programs linked to goal categories, with duration, equipment, description
- **`program_phases`** — Phase blocks within each program (e.g. 3 × 4-week), with RPE targets
- **`workout_templates`** — Individual sessions within phases (Day A, B, C etc), warmup/cooldown notes, duration
- **`workout_exercises`** — Join table linking templates to exercises with sets, reps, rest, RPE, load guidance, progression notes, superset info

### Extend `exercises` table:
- Add columns: `category`, `primary_muscles` (jsonb), `difficulty` (int), `cues` (jsonb), `is_low_impact`, `is_somatic`, `evidence_source`
- Keep existing columns for backward compatibility

### Add `goal_category_id` to `profiles`:
- So each user's selected training goal is persisted

### RLS:
- All program/exercise tables: read-only for authenticated users
- Profiles: existing policies already cover goal updates

## Phase 2: Seed Data
- Insert all 11 goal categories
- Insert 8 training programs
- Insert program phases, workout templates, and workout exercises
- Update existing exercises with new fields + insert new exercises
- Insert 52 stretches into exercises table (with category = 'stretch')

*Note: Full seed data for 120 exercises × sets/reps across 8 programs is extensive. I'll create a representative seed covering all 11 goals, 8 programs, and a subset of exercises/workouts to demonstrate the full flow. You can expand the data later.*

## Phase 3: UI — Goal Selection Screen
- Beautiful card grid showing all 11 goals
- Each card: label, description, intensity bar, hormonal note (expandable)
- Integrated into both **onboarding flow** (new step) and **Movement page** (shown if no goal set, changeable from settings)
- Saves selection to `profiles.goal_category_id`

## Phase 4: UI — Program Assignment
- After goal selection, show the matched program
- Display: title, duration, intensity, description, equipment, phase overview
- "Start Program" button to begin

## Phase 5: UI — Workout Delivery
- Session view querying current phase → today's workout template → exercises
- Each exercise shown with: name, sets, reps, rest, RPE, load guidance
- **Coaching cues** visually distinct from instructions (Signal brand differentiator)
- Warmup/cooldown sections from template notes

## Key Design Principles:
- Goal selection is a premium onboarding moment — not a dropdown
- Hormonal/cycle notes surfaced prominently (brand differentiator)
- Coaching cues styled distinctly from instructions
- Follows existing Signal design system (purple hero, ivory cards, same typography)
