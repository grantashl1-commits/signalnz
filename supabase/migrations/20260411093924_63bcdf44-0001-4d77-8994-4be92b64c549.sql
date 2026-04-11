
-- 1. Insert Reformer Pilates exercises
INSERT INTO exercises (id, name, body_part, target, category, difficulty, equipment, primary_muscles, secondary_muscles, is_low_impact, instructions, cues) VALUES
('ex-ref-001', 'Reformer Footwork (Parallel)', 'lower body', 'quadriceps', 'pilates', 1, ARRAY['reformer'], ARRAY['quadriceps','glutes'], ARRAY['calves','hamstrings'], true, 'Lie supine on the carriage with feet on the footbar hip-width apart. Press out to straight legs, then return with control.', ARRAY['Keep pelvis neutral','Press evenly through feet','Exhale on press']),
('ex-ref-002', 'Reformer Footwork (V Position)', 'lower body', 'adductors', 'pilates', 1, ARRAY['reformer'], ARRAY['quadriceps','adductors'], ARRAY['glutes','calves'], true, 'Heels together, toes apart on the footbar. Press out and in maintaining turnout.', ARRAY['Wrap inner thighs','Keep heels connected','Control the return']),
('ex-ref-003', 'Reformer Hundred', 'core', 'abdominals', 'pilates', 2, ARRAY['reformer'], ARRAY['abdominals','hip flexors'], ARRAY['obliques'], true, 'Curl head and shoulders up, legs in tabletop or extended. Pump arms vigorously while breathing 5 counts in, 5 counts out.', ARRAY['Scoop navel to spine','Pump from shoulders','Keep neck long']),
('ex-ref-004', 'Reformer Long Stretch', 'full body', 'core', 'pilates', 3, ARRAY['reformer'], ARRAY['abdominals','shoulders'], ARRAY['triceps','glutes'], true, 'Plank position with hands on footbar, feet on headrest. Push carriage out and pull back maintaining plank.', ARRAY['One long line from head to heels','Engage lats','Exhale on return']),
('ex-ref-005', 'Reformer Elephant', 'full body', 'hamstrings', 'pilates', 2, ARRAY['reformer'], ARRAY['hamstrings','abdominals'], ARRAY['hip flexors','calves'], true, 'Stand on carriage with hands on footbar, pike position. Push carriage back with legs, pull in with abs.', ARRAY['Round the spine','Push from hamstrings','Draw belly up and in']),
('ex-ref-006', 'Reformer Knee Stretch (Round)', 'core', 'abdominals', 'pilates', 2, ARRAY['reformer'], ARRAY['abdominals','hip flexors'], ARRAY['quadriceps','shoulders'], true, 'Kneel on carriage, hands on footbar, spine rounded. Push carriage back with knees, pull in with core.', ARRAY['Deep C-curve','Initiate from core','Control the springs']),
('ex-ref-007', 'Reformer Leg Circles', 'lower body', 'hip flexors', 'pilates', 2, ARRAY['reformer'], ARRAY['hip flexors','adductors'], ARRAY['abdominals','glutes'], true, 'Lie supine with feet in straps. Circle legs maintaining stable pelvis.', ARRAY['Keep pelvis still','Move from hip joint','Equal circle each direction']),
('ex-ref-008', 'Reformer Short Spine', 'core', 'spine', 'pilates', 3, ARRAY['reformer'], ARRAY['abdominals','spinal extensors'], ARRAY['hamstrings','glutes'], true, 'Feet in straps, fold over to lift hips overhead, then roll down one vertebra at a time.', ARRAY['Articulate the spine','Use abs not momentum','Control the descent']),
('ex-ref-009', 'Reformer Mermaid', 'core', 'obliques', 'pilates', 2, ARRAY['reformer'], ARRAY['obliques','lats'], ARRAY['shoulders','intercostals'], true, 'Sit side-on, hand on footbar. Press out into side stretch, return with control.', ARRAY['Reach long through crown','Open the ribs','Keep hips grounded']),
('ex-ref-010', 'Reformer Scooter', 'lower body', 'glutes', 'pilates', 2, ARRAY['reformer'], ARRAY['glutes','hamstrings'], ARRAY['quadriceps','core'], true, 'Stand on one leg on the carriage, other foot on platform. Push carriage back with standing leg.', ARRAY['Square the hips','Drive from the glute','Keep torso upright']),
('ex-ref-011', 'Reformer Long Box Pull', 'upper body', 'lats', 'pilates', 2, ARRAY['reformer'], ARRAY['lats','rhomboids'], ARRAY['biceps','rear deltoids'], true, 'Lie prone on the long box, arms reaching for straps. Pull straps alongside body.', ARRAY['Squeeze shoulder blades','Lift chest slightly','Control the release']),
('ex-ref-012', 'Reformer Stomach Massage (Round)', 'core', 'abdominals', 'pilates', 2, ARRAY['reformer'], ARRAY['abdominals','hip flexors'], ARRAY['quadriceps','calves'], true, 'Sit on carriage facing footbar, hands on bar, spine rounded. Press out and in.', ARRAY['Deep C-curve','Scoop through center','Heels together']),
('ex-ref-013', 'Reformer Side Splits', 'lower body', 'adductors', 'pilates', 3, ARRAY['reformer'], ARRAY['adductors','abductors'], ARRAY['core','quadriceps'], true, 'Stand on carriage and platform, press carriage out to the side, return with inner thigh control.', ARRAY['Stand tall','Draw carriage in with inner thigh','Keep equal weight']),
('ex-ref-014', 'Reformer Snake/Twist', 'full body', 'obliques', 'pilates', 4, ARRAY['reformer'], ARRAY['obliques','shoulders'], ARRAY['abdominals','hip flexors'], true, 'Side plank on reformer with rotation. Advanced full-body integration.', ARRAY['Stack shoulders','Rotate from thoracic','Breathe through the twist']),
('ex-ref-015', 'Reformer Eve Lunge', 'lower body', 'hip flexors', 'pilates', 1, ARRAY['reformer'], ARRAY['hip flexors','quadriceps'], ARRAY['glutes','calves'], true, 'One foot on platform, one on carriage. Lunge back stretching the hip flexor.', ARRAY['Keep front knee over ankle','Sink hips forward','Breathe into the stretch']),
('ex-ref-016', 'Reformer Running', 'lower body', 'calves', 'pilates', 1, ARRAY['reformer'], ARRAY['calves','quadriceps'], ARRAY['hamstrings'], true, 'Lie supine, legs pressed out. Alternate bending and straightening ankles in a running motion.', ARRAY['Keep pelvis stable','Smooth transitions','Full range at ankle']);

-- 2. Insert training program
INSERT INTO training_programs (id, title, goal_category_id, duration_weeks, sessions_per_week, equipment_needed, tags, description, who_its_for, evidence_basis)
VALUES (
  'prog-reformer-6',
  'Reformer Pilates Foundation 6-Week',
  'gc-013',
  6,
  3,
  ARRAY['reformer'],
  ARRAY['pilates','reformer','core','flexibility','beginner'],
  'A structured 6-week introduction to the Pilates reformer covering footwork, springs, and the classical repertoire. Builds core control, spinal mobility, and full-body coordination.',
  'Beginners to the reformer or those returning after a break. Access to a reformer is required.',
  'Based on classical Pilates methodology adapted for progressive overload.'
);

-- 3. Insert program phases
INSERT INTO program_phases (id, program_id, phase_number, title, phase_goal, week_start, week_end, rpe_target_min, rpe_target_max) VALUES
('ph-ref6-1', 'prog-reformer-6', 1, 'Fundamentals', 'Learn the reformer basics: footwork, springs, breath patterns, and pelvic stability.', 1, 2, 3, 5),
('ph-ref6-2', 'prog-reformer-6', 2, 'Flow Building', 'Link exercises into flowing sequences. Introduce intermediate movements.', 3, 4, 4, 6),
('ph-ref6-3', 'prog-reformer-6', 3, 'Full Repertoire', 'Full-length sessions using the classical order. Build endurance and precision.', 5, 6, 5, 7);

-- 4. Insert workout templates (4 per phase = 12 total)
INSERT INTO workout_templates (id, program_id, phase_id, day_label, title, estimated_duration_mins, session_number, session_type, session_notes, warmup_notes, cooldown_notes) VALUES
-- Phase 1
('wt-ref6-1a', 'prog-reformer-6', 'ph-ref6-1', 'Day 1', 'Footwork & Foundations', 40, 1, 'reformer', 'Learn the basic spring settings and footwork series.', 'Breathing exercises on the carriage — 10 breaths', 'Reformer Eve Lunge stretch each side'),
('wt-ref6-1b', 'prog-reformer-6', 'ph-ref6-1', 'Day 2', 'Core Awakening', 40, 2, 'reformer', 'Hundred, stomach massage, and basic arm work.', 'Footwork warm-up — 8 reps each position', 'Mermaid stretch'),
('wt-ref6-1c', 'prog-reformer-6', 'ph-ref6-1', 'Day 3', 'Lower Body Focus', 40, 3, 'reformer', 'Leg circles, scooter, and running on the reformer.', 'Footwork warm-up', 'Eve Lunge and calf stretches'),
('wt-ref6-1d', 'prog-reformer-6', 'ph-ref6-1', 'Day 4', 'Full Intro Flow', 45, 4, 'reformer', 'Combine everything learned into a complete session.', 'Footwork series — all positions', 'Mermaid and Eve Lunge'),
-- Phase 2
('wt-ref6-2a', 'prog-reformer-6', 'ph-ref6-2', 'Day 1', 'Intermediate Flow A', 45, 5, 'reformer', 'Add long stretch, elephant, and knee stretches.', 'Footwork warm-up', 'Side-lying stretches'),
('wt-ref6-2b', 'prog-reformer-6', 'ph-ref6-2', 'Day 2', 'Back Body & Pull', 45, 6, 'reformer', 'Long box pulling, swimming prep, and back extension.', 'Footwork and hundred', 'Mermaid both sides'),
('wt-ref6-2c', 'prog-reformer-6', 'ph-ref6-2', 'Day 3', 'Side Body & Balance', 45, 7, 'reformer', 'Mermaid, side splits prep, and scooter progression.', 'Footwork warm-up', 'Eve Lunge and hip flexor stretch'),
('wt-ref6-2d', 'prog-reformer-6', 'ph-ref6-2', 'Day 4', 'Full Intermediate Flow', 50, 8, 'reformer', 'Full-length session in classical order with intermediate exercises.', 'Hundred and footwork', 'Full cool-down sequence'),
-- Phase 3
('wt-ref6-3a', 'prog-reformer-6', 'ph-ref6-3', 'Day 1', 'Classical Order A', 50, 9, 'reformer', 'Full classical order focusing on precision and breath.', 'Hundred', 'Stretching series'),
('wt-ref6-3b', 'prog-reformer-6', 'ph-ref6-3', 'Day 2', 'Power & Control', 50, 10, 'reformer', 'Heavier springs for strength. Short spine, long stretch, knee stretch series.', 'Footwork on heavier springs', 'Eve Lunge and mermaid'),
('wt-ref6-3c', 'prog-reformer-6', 'ph-ref6-3', 'Day 3', 'Side Splits & Integration', 50, 11, 'reformer', 'Side splits, snake/twist prep, and full standing work.', 'Footwork warm-up', 'Full cool-down'),
('wt-ref6-3d', 'prog-reformer-6', 'ph-ref6-3', 'Day 4', 'Graduation Flow', 55, 12, 'reformer', 'Complete repertoire flow — your personal best session.', 'Hundred and footwork', 'Full stretching sequence');

-- 5. Insert workout exercises (linking exercises to templates)
-- Phase 1 Day 1
INSERT INTO workout_exercises (id, workout_id, exercise_id, order_index, sets, reps, rest_seconds, rpe_target, load_guidance, is_superset) VALUES
('we-ref-001', 'wt-ref6-1a', 'ex-ref-001', 1, 3, '10', 30, 3, '2 springs', false),
('we-ref-002', 'wt-ref6-1a', 'ex-ref-002', 2, 3, '10', 30, 3, '2 springs', false),
('we-ref-003', 'wt-ref6-1a', 'ex-ref-016', 3, 2, '20 each', 30, 3, '2 springs', false),
('we-ref-004', 'wt-ref6-1a', 'ex-ref-015', 4, 1, '30s each', 0, 2, 'Light spring', false);
-- Phase 1 Day 2
INSERT INTO workout_exercises (id, workout_id, exercise_id, order_index, sets, reps, rest_seconds, rpe_target, load_guidance, is_superset) VALUES
('we-ref-005', 'wt-ref6-1b', 'ex-ref-003', 1, 1, '100 pumps', 30, 4, '1 spring', false),
('we-ref-006', 'wt-ref6-1b', 'ex-ref-012', 2, 3, '8', 30, 4, '2 springs', false),
('we-ref-007', 'wt-ref6-1b', 'ex-ref-011', 3, 3, '8', 30, 3, '1 spring', false),
('we-ref-008', 'wt-ref6-1b', 'ex-ref-009', 4, 2, '5 each', 0, 3, '1 spring', false);
-- Phase 1 Day 3
INSERT INTO workout_exercises (id, workout_id, exercise_id, order_index, sets, reps, rest_seconds, rpe_target, load_guidance, is_superset) VALUES
('we-ref-009', 'wt-ref6-1c', 'ex-ref-007', 1, 3, '8 each direction', 30, 4, '1 spring', false),
('we-ref-010', 'wt-ref6-1c', 'ex-ref-010', 2, 3, '10 each', 30, 4, '1 spring', false),
('we-ref-011', 'wt-ref6-1c', 'ex-ref-016', 3, 2, '30 each', 30, 3, '2 springs', false),
('we-ref-012', 'wt-ref6-1c', 'ex-ref-015', 4, 1, '30s each', 0, 2, 'Light spring', false);
-- Phase 1 Day 4
INSERT INTO workout_exercises (id, workout_id, exercise_id, order_index, sets, reps, rest_seconds, rpe_target, load_guidance, is_superset) VALUES
('we-ref-013', 'wt-ref6-1d', 'ex-ref-001', 1, 2, '10', 15, 3, '2 springs', false),
('we-ref-014', 'wt-ref6-1d', 'ex-ref-003', 2, 1, '100 pumps', 30, 4, '1 spring', false),
('we-ref-015', 'wt-ref6-1d', 'ex-ref-007', 3, 2, '8 each', 30, 4, '1 spring', false),
('we-ref-016', 'wt-ref6-1d', 'ex-ref-010', 4, 2, '10 each', 30, 4, '1 spring', false),
('we-ref-017', 'wt-ref6-1d', 'ex-ref-012', 5, 2, '8', 30, 4, '2 springs', false),
('we-ref-018', 'wt-ref6-1d', 'ex-ref-009', 6, 2, '5 each', 0, 3, '1 spring', false);
-- Phase 2 Day 1
INSERT INTO workout_exercises (id, workout_id, exercise_id, order_index, sets, reps, rest_seconds, rpe_target, load_guidance, is_superset) VALUES
('we-ref-019', 'wt-ref6-2a', 'ex-ref-001', 1, 2, '10', 15, 3, '2 springs', false),
('we-ref-020', 'wt-ref6-2a', 'ex-ref-003', 2, 1, '100 pumps', 30, 5, '1 spring', false),
('we-ref-021', 'wt-ref6-2a', 'ex-ref-004', 3, 3, '8', 30, 5, '2 springs', false),
('we-ref-022', 'wt-ref6-2a', 'ex-ref-005', 4, 3, '8', 30, 5, '2 springs', false),
('we-ref-023', 'wt-ref6-2a', 'ex-ref-006', 5, 3, '10', 30, 5, '1 spring', false);
-- Phase 2 Day 2
INSERT INTO workout_exercises (id, workout_id, exercise_id, order_index, sets, reps, rest_seconds, rpe_target, load_guidance, is_superset) VALUES
('we-ref-024', 'wt-ref6-2b', 'ex-ref-001', 1, 2, '10', 15, 3, '2 springs', false),
('we-ref-025', 'wt-ref6-2b', 'ex-ref-003', 2, 1, '100 pumps', 30, 5, '1 spring', false),
('we-ref-026', 'wt-ref6-2b', 'ex-ref-011', 3, 3, '10', 30, 5, '1 spring', false),
('we-ref-027', 'wt-ref6-2b', 'ex-ref-008', 4, 3, '5', 30, 5, '1 spring', false),
('we-ref-028', 'wt-ref6-2b', 'ex-ref-009', 5, 2, '5 each', 0, 4, '1 spring', false);
-- Phase 2 Day 3
INSERT INTO workout_exercises (id, workout_id, exercise_id, order_index, sets, reps, rest_seconds, rpe_target, load_guidance, is_superset) VALUES
('we-ref-029', 'wt-ref6-2c', 'ex-ref-009', 1, 3, '5 each', 30, 5, '1 spring', false),
('we-ref-030', 'wt-ref6-2c', 'ex-ref-010', 2, 3, '10 each', 30, 5, '1 spring', false),
('we-ref-031', 'wt-ref6-2c', 'ex-ref-013', 3, 2, '5', 30, 5, '1 spring', false),
('we-ref-032', 'wt-ref6-2c', 'ex-ref-015', 4, 1, '30s each', 0, 3, 'Light spring', false);
-- Phase 2 Day 4
INSERT INTO workout_exercises (id, workout_id, exercise_id, order_index, sets, reps, rest_seconds, rpe_target, load_guidance, is_superset) VALUES
('we-ref-033', 'wt-ref6-2d', 'ex-ref-001', 1, 2, '10', 15, 3, '2 springs', false),
('we-ref-034', 'wt-ref6-2d', 'ex-ref-003', 2, 1, '100 pumps', 15, 5, '1 spring', false),
('we-ref-035', 'wt-ref6-2d', 'ex-ref-004', 3, 2, '8', 30, 5, '2 springs', false),
('we-ref-036', 'wt-ref6-2d', 'ex-ref-005', 4, 2, '8', 30, 5, '2 springs', false),
('we-ref-037', 'wt-ref6-2d', 'ex-ref-006', 5, 2, '10', 30, 5, '1 spring', false),
('we-ref-038', 'wt-ref6-2d', 'ex-ref-011', 6, 2, '10', 30, 5, '1 spring', false),
('we-ref-039', 'wt-ref6-2d', 'ex-ref-009', 7, 2, '5 each', 0, 4, '1 spring', false);
-- Phase 3 Day 1
INSERT INTO workout_exercises (id, workout_id, exercise_id, order_index, sets, reps, rest_seconds, rpe_target, load_guidance, is_superset) VALUES
('we-ref-040', 'wt-ref6-3a', 'ex-ref-003', 1, 1, '100 pumps', 15, 5, '1 spring', false),
('we-ref-041', 'wt-ref6-3a', 'ex-ref-001', 2, 3, '10', 15, 4, '3 springs', false),
('we-ref-042', 'wt-ref6-3a', 'ex-ref-012', 3, 2, '8', 30, 5, '2 springs', false),
('we-ref-043', 'wt-ref6-3a', 'ex-ref-007', 4, 2, '8 each', 30, 5, '1 spring', false),
('we-ref-044', 'wt-ref6-3a', 'ex-ref-004', 5, 2, '8', 30, 6, '2 springs', false),
('we-ref-045', 'wt-ref6-3a', 'ex-ref-005', 6, 2, '8', 30, 6, '2 springs', false);
-- Phase 3 Day 2
INSERT INTO workout_exercises (id, workout_id, exercise_id, order_index, sets, reps, rest_seconds, rpe_target, load_guidance, is_superset) VALUES
('we-ref-046', 'wt-ref6-3b', 'ex-ref-001', 1, 3, '10', 15, 4, '3 springs', false),
('we-ref-047', 'wt-ref6-3b', 'ex-ref-003', 2, 1, '100 pumps', 15, 6, '1 spring', false),
('we-ref-048', 'wt-ref6-3b', 'ex-ref-008', 3, 3, '5', 30, 6, '1 spring', false),
('we-ref-049', 'wt-ref6-3b', 'ex-ref-004', 4, 3, '8', 30, 6, '2 springs', false),
('we-ref-050', 'wt-ref6-3b', 'ex-ref-006', 5, 3, '10', 30, 6, '1 spring', false);
-- Phase 3 Day 3
INSERT INTO workout_exercises (id, workout_id, exercise_id, order_index, sets, reps, rest_seconds, rpe_target, load_guidance, is_superset) VALUES
('we-ref-051', 'wt-ref6-3c', 'ex-ref-013', 1, 3, '5', 30, 6, '1 spring', false),
('we-ref-052', 'wt-ref6-3c', 'ex-ref-014', 2, 2, '3 each', 30, 7, '1 spring', false),
('we-ref-053', 'wt-ref6-3c', 'ex-ref-010', 3, 3, '10 each', 30, 5, '1 spring', false),
('we-ref-054', 'wt-ref6-3c', 'ex-ref-009', 4, 2, '5 each', 0, 5, '1 spring', false);
-- Phase 3 Day 4
INSERT INTO workout_exercises (id, workout_id, exercise_id, order_index, sets, reps, rest_seconds, rpe_target, load_guidance, is_superset) VALUES
('we-ref-055', 'wt-ref6-3d', 'ex-ref-003', 1, 1, '100 pumps', 15, 6, '1 spring', false),
('we-ref-056', 'wt-ref6-3d', 'ex-ref-001', 2, 2, '10', 15, 4, '3 springs', false),
('we-ref-057', 'wt-ref6-3d', 'ex-ref-012', 3, 2, '8', 30, 5, '2 springs', false),
('we-ref-058', 'wt-ref6-3d', 'ex-ref-004', 4, 2, '8', 30, 6, '2 springs', false),
('we-ref-059', 'wt-ref6-3d', 'ex-ref-005', 5, 2, '8', 30, 6, '2 springs', false),
('we-ref-060', 'wt-ref6-3d', 'ex-ref-008', 6, 2, '5', 30, 6, '1 spring', false),
('we-ref-061', 'wt-ref6-3d', 'ex-ref-013', 7, 2, '5', 30, 6, '1 spring', false),
('we-ref-062', 'wt-ref6-3d', 'ex-ref-011', 8, 2, '10', 30, 5, '1 spring', false),
('we-ref-063', 'wt-ref6-3d', 'ex-ref-009', 9, 2, '5 each', 0, 4, '1 spring', false);
