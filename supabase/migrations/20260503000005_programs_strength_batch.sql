-- Strength programs batch: 4 Weeks Beginners, Anatomy of Exercise, Complete Training Guide,
-- Butt & Legs, Science of Muscle Hypertrophy, Next Level (Menopause)

-- ── EXERCISES (all strength programs) ────────────────────────────────────────
INSERT INTO exercises (id, name, body_part, target, category, difficulty, equipment, primary_muscles, secondary_muscles, is_low_impact, instructions, cues)
VALUES
  -- Beginners / general strength
  ('ex-gen-001','Dumbbell Goblet Squat','lower body','quads','strength',1,ARRAY['dumbbell'],ARRAY['quads','glutes'],ARRAY['hamstrings','core'],true,'Hold dumbbell at chest. Feet shoulder-width. Squat keeping chest upright and knees pushing out. Push through whole foot.','Chest upright; knees out; hold dumbbell close; push through whole foot'),
  ('ex-gen-002','Dumbbell Step-Up','lower body','quads','strength',1,ARRAY['dumbbell','bench'],ARRAY['quads','glutes'],ARRAY['hamstrings','calves'],true,'Use a sturdy box. Step up with control. Keep torso upright. Drive through the stepping foot — do not push off back foot.','Use sturdy box; step up with control; keep torso upright'),
  ('ex-gen-003','Seated Cable Row','back','lats','strength',1,ARRAY['cable machine'],ARRAY['lats','rhomboids'],ARRAY['biceps','traps'],false,'Keep back straight. Pull handle toward waist. Squeeze shoulder blades at full contraction. Return with control.','Keep back straight; pull to waist; squeeze shoulder blades'),
  ('ex-gen-004','Incline Dumbbell Bench Press','upper body','chest','strength',1,ARRAY['dumbbell','bench'],ARRAY['chest','triceps'],ARRAY['shoulders'],false,'Press weights straight up from chest. Keep elbows slightly tucked. Use controlled motion — 3-sec eccentric.','Press straight up; keep elbows slightly tucked; controlled motion'),
  ('ex-gen-005','Cable Crossover Fly','upper body','chest','strength',1,ARRAY['cable machine'],ARRAY['chest'],ARRAY['shoulders'],false,'Maintain slight elbow bend throughout. Draw hands together in front of chest. Focus on chest contraction.','Maintain slight elbow bend; draw hands together; focus on chest contraction'),
  ('ex-gen-006','Barbell Bench Press','upper body','chest','strength',2,ARRAY['barbell','bench'],ARRAY['chest','triceps'],ARRAY['shoulders'],false,'Keep feet planted. Lower bar to mid-chest. Don''t arch back excessively. Leg drive for stability.','Keep feet planted; lower bar to mid-chest; don''t arch back excessively'),
  ('ex-gen-007','Seated Dumbbell Shoulder Press','upper body','shoulders','strength',1,ARRAY['dumbbell'],ARRAY['shoulders','triceps'],ARRAY['traps'],false,'Press straight overhead. Avoid leaning back. Keep a neutral grip. Control the lowering phase.','Press straight overhead; avoid leaning back; neutral grip'),
  ('ex-gen-008','Barbell Romanian Deadlift','lower body','hamstrings','strength',2,ARRAY['barbell'],ARRAY['hamstrings','glutes'],ARRAY['lower back','core'],false,'Hinge at hips with slight knee bend. Keep bar close to body. Lower with control. Squeeze glutes at top.','Hinge at hips; keep bar close; slight knee bend; lower with control'),
  ('ex-gen-009','Dumbbell Lunge','lower body','quads','strength',1,ARRAY['dumbbell'],ARRAY['quads','glutes'],ARRAY['hamstrings','calves'],true,'Step forward and lower back knee toward floor. Keep front knee behind toes. Push back through front foot.','Step forward and lower; front knee behind toes; push back to start'),
  ('ex-gen-010','Lat Pulldown','back','lats','strength',1,ARRAY['cable machine'],ARRAY['lats'],ARRAY['biceps','rhomboids'],false,'Pull bar to chest level. Avoid swinging. Keep elbows pointing down and slightly forward.','Pull bar to chest; avoid swinging; keep elbows pointing down'),
  ('ex-gen-011','Inverted Row','back','lats','strength',1,ARRAY['barbell','rack'],ARRAY['lats','rhomboids'],ARRAY['biceps','core'],true,'Keep body straight from head to heels. Pull chest to bar. Squeeze shoulder blades at the top.','Keep body straight; pull chest to bar; squeeze shoulder blades'),
  ('ex-gen-012','Dumbbell Bulgarian Split Squat','lower body','quads','strength',2,ARRAY['dumbbell','bench'],ARRAY['quads','glutes'],ARRAY['hamstrings','calves'],true,'Rear foot elevated on bench. Keep front knee stable over ankle. Lower with control.','Keep front knee stable; lower with control; align knee over ankle'),
  -- Anatomy of Exercise
  ('ex-gen-013','Running (Aerobic)','full body','cardiovascular','cardio',1,ARRAY['bodyweight'],ARRAY['cardiovascular'],ARRAY['legs','hips','glutes'],false,'Strike ground with forefoot under center of mass. Maintain a soundless transition. Keep hips forward, torso tall.','Forefoot under center of mass; soundless transition; hips forward; torso tall'),
  ('ex-gen-014','Jump Rope','full body','cardiovascular','cardio',1,ARRAY['jump rope'],ARRAY['cardiovascular','calves'],ARRAY['shoulders','core'],false,'Keep ankles, knees, and hips bending simultaneously. Maintain a short foot-strike duration. Arms close to body.','Bend ankles knees hips simultaneously; short foot-strike; arms close to body'),
  ('ex-gen-015','Barbell Squat','lower body','quads','strength',3,ARRAY['barbell'],ARRAY['quads','glutes'],ARRAY['hamstrings','core'],false,'Keep spine neutral. Distribute weight evenly. Sit back and down. Drive through heels.','Neutral spine; even weight distribution; sit back and down; drive through heels'),
  ('ex-gen-016','Lateral Lunge','lower body','adductors','strength',2,ARRAY['dumbbell'],ARRAY['adductors','glutes'],ARRAY['quads'],true,'Keep chest up and shoulders back. Step wide to the side. Knee doesn''t move past toe line.','Chest up; step wide; knee doesn''t move past toe'),
  ('ex-gen-017','Bench Press (Barbell)','upper body','chest','strength',2,ARRAY['barbell','bench'],ARRAY['chest','triceps'],ARRAY['shoulders'],false,'Keep forearms perpendicular to floor. Shoulder blades retracted and flat against bench. Control the descent.','Forearms perpendicular; shoulder blades retracted; control descent'),
  ('ex-gen-018','Pull-Up','back','lats','strength',3,ARRAY['pull-up bar'],ARRAY['lats','biceps'],ARRAY['core','rear deltoids'],false,'Retract scapula before pulling. Maintain core tightness. Pull until chin clears bar. Lower fully.','Retract scapula before pulling; maintain core tightness; avoid swinging'),
  -- Complete Training Guide extras
  ('ex-gen-019','EZ-Bar Curl','upper body','biceps','strength',1,ARRAY['ez-bar'],ARRAY['biceps'],ARRAY['forearms'],false,'Grip with hands slightly inward. Keep elbows tucked. Lower slowly. Do not rock body.','Grip slightly inward; elbows tucked; do not rock body'),
  ('ex-gen-020','Barbell Curl','upper body','biceps','strength',1,ARRAY['barbell'],ARRAY['biceps'],ARRAY['forearms'],false,'Stand tall, shoulders back. Keep elbows tucked into sides. Lower slowly. No body rocking.','Stand tall; elbows tucked into sides; lower slowly; no body rocking'),
  ('ex-gen-021','Dumbbell Curl','upper body','biceps','strength',1,ARRAY['dumbbell'],ARRAY['biceps'],ARRAY['forearms'],false,'Keep body still. Focus on each arm. Full range of motion. Control the eccentric.','Keep body still; focus on each arm; full range'),
  ('ex-gen-022','Dip','upper body','triceps','strength',2,ARRAY['dip bars'],ARRAY['triceps','chest'],ARRAY['shoulders'],false,'Body upright. Lower slowly and push up powerfully. Point elbows back. Full range of motion.','Body upright; lower slowly; push up powerfully; elbows back'),
  ('ex-gen-023','Close-Grip Bench Press','upper body','triceps','strength',2,ARRAY['barbell','bench'],ARRAY['triceps','chest'],ARRAY['shoulders'],false,'Hands close on the bar, about shoulder-width. Lower toward sternum. Keep elbows close to sides.','Hands close; lower toward sternum; elbows close to sides'),
  ('ex-gen-024','Oblique Crunch','core','obliques','strength',1,ARRAY['bodyweight'],ARRAY['obliques'],ARRAY['core'],true,'Lie on side. Touch fingers to temples. Use side abs to crunch. Control both directions.','Lie on side; touch fingers to temples; use side abs to crunch'),
  -- Butt & Legs
  ('ex-gen-025','Back Extension','lower body','glutes','strength',1,ARRAY['hyperextension bench'],ARRAY['glutes','hamstrings'],ARRAY['lower back'],false,'Avoid raising above parallel on extension. Control the downward phase. Squeeze glutes as you raise.','Do not raise above parallel; control downward; squeeze glutes'),
  ('ex-gen-026','Prone Single-Leg Raises','lower body','glutes','strength',1,ARRAY['bodyweight'],ARRAY['glutes','hamstrings'],ARRAY['lower back'],true,'Do not raise leg so high that you feel pain in lower back. Keep upper body stationary. Squeeze glutes.','Do not raise too high; keep upper body still; squeeze glutes'),
  ('ex-gen-027','Standing Kickbacks','lower body','glutes','strength',1,ARRAY['ankle weights','cable machine'],ARRAY['glutes','hamstrings'],ARRAY['lower back'],true,'Keep knee slightly bent. Maintain a straight back. Focus on the glute contraction at peak extension.','Knee slightly bent; straight back; focus on glute contraction'),
  ('ex-gen-028','Leg Extension','lower body','quads','strength',1,ARRAY['leg extension machine'],ARRAY['quads'],ARRAY[],false,'Maintain stable torso. Do not lock knees at the top. Focus on the squeeze at peak extension.','Stable torso; do not lock knees at top; squeeze at peak'),
  ('ex-gen-029','Butterfly Inside Raises','lower body','adductors','strength',1,ARRAY['bodyweight'],ARRAY['adductors'],ARRAY[],true,'Keep both legs bent. Use your hand to provide resistance. Keep lower back pressed to ground.','Both legs bent; hand provides resistance; lower back to ground'),
  ('ex-gen-030','Lying Adductions','lower body','adductors','strength',1,ARRAY['ankle weights','resistance band'],ARRAY['adductors'],ARRAY[],true,'Keep lower back flat to floor. Keep foot flexed. Focus on inner thigh contraction.','Lower back flat; foot flexed; focus on inner thigh contraction'),
  ('ex-gen-031','Kneeling Side Leg Raises','lower body','abductors','strength',1,ARRAY['bodyweight','resistance band'],ARRAY['abductors','glutes'],ARRAY[],true,'Control the descent. Focus on outer hip contraction. Keep back flat.','Control descent; outer hip contraction; keep back flat'),
  ('ex-gen-032','Lying Straight-Leg Side Raises','lower body','abductors','strength',1,ARRAY['ankle weights'],ARRAY['abductors','glutes'],ARRAY[],true,'Keep top leg rotated in. Maintain foot position. Keep upper body stable.','Top leg rotated in; maintain foot position; upper body stable'),
  ('ex-gen-033','Lunge Pulls (Walking Lunges)','lower body','quads','strength',2,ARRAY['dumbbell'],ARRAY['quads','glutes'],ARRAY['hamstrings'],true,'Knee should not extend over toe. Keep torso erect. Focus on leg muscles.','Knee not past toe; torso erect; focus on legs'),
  -- Hypertrophy (Science of Muscle Hypertrophy additions)
  ('ex-gen-034','Shoulder Press (Barbell)','upper body','shoulders','strength',2,ARRAY['barbell'],ARRAY['shoulders','triceps'],ARRAY['traps','core'],false,'Keep back straight. Press weight overhead. Avoid locking elbows. Lower slowly to shoulder level.','Keep back straight; press overhead; avoid locking elbows; lower slowly'),
  ('ex-gen-035','Tricep Extension (Overhead)','upper body','triceps','strength',1,ARRAY['dumbbell'],ARRAY['triceps'],ARRAY['shoulders'],false,'Keep elbows tucked. Lower weight behind head. Extend arms fully. Control on return.','Keep elbows tucked; lower behind head; extend fully; control return'),
  ('ex-gen-036','Leg Curl (Machine)','lower body','hamstrings','strength',1,ARRAY['leg curl machine'],ARRAY['hamstrings'],ARRAY['calves','glutes'],false,'Pull weight with heels. Keep hips down. Squeeze at full contraction. Lower slowly.','Pull with heels; keep hips down; squeeze at contraction; lower slowly'),
  ('ex-gen-037','Calf Raise','lower body','calves','strength',1,ARRAY['bodyweight'],ARRAY['calves'],ARRAY[],true,'Lift heel off ground. Keep legs straight. Pause at top. Lower with control.','Lift heel; keep legs straight; pause at top; lower with control'),
  -- Next Level (Menopause) extras
  ('ex-gen-038','Deadlift (Barbell)','lower body','hamstrings','strength',3,ARRAY['barbell'],ARRAY['hamstrings','glutes'],ARRAY['back','core'],false,'Keep spine neutral. Engage core. Lift with legs. Drive hips forward at the top.','Neutral spine; engage core; lift with legs; drive hips forward'),
  ('ex-gen-039','Squat Jump','lower body','quads','plyometrics',2,ARRAY['bodyweight'],ARRAY['quads','glutes'],ARRAY['calves','core'],false,'Land softly with bent knees. Use arms to propel. Keep chest up. Engage core throughout.','Land softly; use arms to propel; chest up; engage core'),
  ('ex-gen-040','Tabata Intervals','full body','cardiovascular','hiit',4,ARRAY['bodyweight','cardio machine'],ARRAY['cardiovascular'],ARRAY['legs','core'],false,'20 seconds max effort, 10 seconds rest. 6-8 rounds. Choose: bike, sprint, burpees, or jump squats.','Push hard; recover well; maintain intensity; focus on form'),
  -- Reverse crunch (already in ex-fs-016, but add generic version for other programs)
  ('ex-gen-041','Russian Twist (Weighted)','core','obliques','strength',2,ARRAY['dumbbell'],ARRAY['obliques','core'],ARRAY['hip flexors'],true,'Sit with knees bent, leaning slightly back. Hold dumbbell and rotate torso side to side. Keep chest up.','Lean slightly back; rotate torso; keep chest up; controlled movement')
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════
-- PROGRAM 1: 4 Weeks of Weight Lifting for Beginners
-- ══════════════════════════════════════════════════════════════════
INSERT INTO training_programs (id, title, goal_category_id, duration_weeks, sessions_per_week, intensity_level, equipment_needed, tags, description, who_its_for, evidence_basis)
VALUES (
  'prog-4wk-beginners',
  '4 Weeks of Weight Lifting for Beginners',
  'gc-001',
  4, 3, 3,
  ARRAY['dumbbells','barbell','cable machine','bench'],
  ARRAY['strength','beginner','full body','gym'],
  'A simple 4-week, 3-day-per-week full-body program for beginners. Each workout focuses on fundamental compound and accessory movements with 2 sets per exercise to build the habit and technique before increasing volume.',
  'Complete beginners to weight training who have access to a commercial gym.',
  'Based on beginner linear progression principles: low volume to allow adaptation, compound movements first, accessory work second.'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO program_phases (id, program_id, phase_number, title, phase_goal, week_start, week_end, rpe_target_min, rpe_target_max)
VALUES ('ph-4wb-1', 'prog-4wk-beginners', 1, 'Beginner Foundation', 'Learn key movement patterns with low volume. Build confidence and technique on all major lifts.', 1, 4, 4, 6)
ON CONFLICT (id) DO NOTHING;

INSERT INTO workout_templates (id, program_id, phase_id, day_label, title, estimated_duration_mins, session_number, session_type, warmup_notes, session_notes)
VALUES
  ('wt-4wb-d1','prog-4wk-beginners','ph-4wb-1','Day 1','Day 1 — Full Body',60,1,'strength','5-10 min general warm-up: light cardio + dynamic stretches','2 sets per exercise. Rest 2 min between sets. Focus on form over weight.'),
  ('wt-4wb-d3','prog-4wk-beginners','ph-4wb-1','Day 3','Day 3 — Full Body',60,2,'strength','5-10 min general warm-up','2 sets per exercise. Rest 2 min between sets.'),
  ('wt-4wb-d5','prog-4wk-beginners','ph-4wb-1','Day 5','Day 5 — Full Body',60,3,'strength','5-10 min general warm-up','2 sets per exercise. Rest 2 min between sets.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO workout_exercises (id, workout_id, exercise_id, order_index, sets, reps, rest_seconds, load_guidance, is_superset)
VALUES
  ('we-4wb-001','wt-4wb-d1','ex-gen-001',1,2,'6-8',120,'Moderate',false),
  ('we-4wb-002','wt-4wb-d1','ex-gen-002',2,2,'6-8',120,'Moderate',false),
  ('we-4wb-003','wt-4wb-d1','ex-gen-003',3,2,'8-10',120,'Moderate',false),
  ('we-4wb-004','wt-4wb-d1','ex-gen-004',4,2,'8-10',120,'Moderate',false),
  ('we-4wb-005','wt-4wb-d1','ex-gen-005',5,2,'8-10',120,'Light',false),
  ('we-4wb-006','wt-4wb-d3','ex-gen-006',1,2,'6-8',120,'Heavy',false),
  ('we-4wb-007','wt-4wb-d3','ex-gen-007',2,2,'6-8',120,'Moderate',false),
  ('we-4wb-008','wt-4wb-d3','ex-gen-008',3,2,'6-8',120,'Moderate',false),
  ('we-4wb-009','wt-4wb-d3','ex-gen-009',4,2,'8-10',120,'Moderate',false),
  ('we-4wb-010','wt-4wb-d5','ex-gen-010',1,2,'6-8',120,'Moderate',false),
  ('we-4wb-011','wt-4wb-d5','ex-gen-011',2,2,'6-8',120,'Bodyweight',false),
  ('we-4wb-012','wt-4wb-d5','ex-gen-012',3,2,'6-8',120,'Moderate',false)
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════
-- PROGRAM 2: Anatomy of Exercise Training Program
-- ══════════════════════════════════════════════════════════════════
INSERT INTO training_programs (id, title, goal_category_id, duration_weeks, sessions_per_week, intensity_level, equipment_needed, tags, description, who_its_for, evidence_basis)
VALUES (
  'prog-anatomy-exercise',
  'Anatomy of Exercise Training Program',
  'gc-001',
  8, 3, 5,
  ARRAY['barbell','bench','pull-up bar','jump rope'],
  ARRAY['strength','anatomy','full body','intermediate','running'],
  'A comprehensive program covering all major movement patterns — warm-up cardio, lower body strength, upper body strength, and core stability — with anatomical cues for each exercise.',
  'Anyone wanting a structured full-body program grounded in anatomical exercise principles.',
  'Based on the "Anatomy of Exercise" methodology: understanding muscle function to optimize form and training outcomes.'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO program_phases (id, program_id, phase_number, title, phase_goal, week_start, week_end, rpe_target_min, rpe_target_max)
VALUES ('ph-anat-1', 'prog-anatomy-exercise', 1, 'Full Program', 'Build strength across all movement planes with anatomically informed form cues.', 1, 8, 5, 7)
ON CONFLICT (id) DO NOTHING;

INSERT INTO workout_templates (id, program_id, phase_id, day_label, title, estimated_duration_mins, session_number, session_type, warmup_notes, session_notes)
VALUES
  ('wt-anat-wu','prog-anatomy-exercise','ph-anat-1','Day 1','Warm-Up & Cardio',15,1,'cardio','Dynamic stretching','Perform running and jump rope to elevate heart rate and prime the nervous system.'),
  ('wt-anat-legs','prog-anatomy-exercise','ph-anat-1','Day 1','Legs & Hips Strength',45,2,'strength','After warm-up session','3 sets of 8-12. Rest 90s between sets.'),
  ('wt-anat-upper','prog-anatomy-exercise','ph-anat-1','Day 2','Upper Body Strength',45,3,'strength','5-10 min warm-up','3 sets of 8-12. Rest 90s between sets.'),
  ('wt-anat-core','prog-anatomy-exercise','ph-anat-1','Day 2','Core Stability & Strength',30,4,'core','After upper body session','3 sets. Rest 60s between sets.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO workout_exercises (id, workout_id, exercise_id, order_index, sets, reps, rest_seconds, load_guidance, is_superset)
VALUES
  ('we-anat-001','wt-anat-wu','ex-gen-013',1,1,'10 min',0,'Bodyweight',false),
  ('we-anat-002','wt-anat-wu','ex-gen-014',2,1,'10 min',0,'Jump rope',false),
  ('we-anat-003','wt-anat-legs','ex-gen-015',1,3,'8-12',90,'Heavy',false),
  ('we-anat-004','wt-anat-legs','ex-gen-016',2,3,'8-12',90,'Moderate',false),
  ('we-anat-005','wt-anat-upper','ex-gen-017',1,3,'8-12',90,'Heavy',false),
  ('we-anat-006','wt-anat-upper','ex-gen-018',2,3,'8-12',90,'Bodyweight',false),
  ('we-anat-007','wt-anat-core','ex-fs-011',1,3,'30-60 sec',60,'Bodyweight',false),
  ('we-anat-008','wt-anat-core','ex-fs-023',2,3,'20',60,'Light',false)
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════
-- PROGRAM 3: Complete Training Guide
-- ══════════════════════════════════════════════════════════════════
INSERT INTO training_programs (id, title, goal_category_id, duration_weeks, sessions_per_week, intensity_level, equipment_needed, tags, description, who_its_for, evidence_basis)
VALUES (
  'prog-complete-training',
  'Complete Training Guide',
  'gc-001',
  12, 4, 5,
  ARRAY['barbell','dumbbells','cable machine','bench','dip bars'],
  ARRAY['strength','hypertrophy','arms','core','intermediate','reference'],
  'A comprehensive reference program covering all major body parts: biceps, triceps, abs, and core. Organised by body part, making it easy to plug sessions into any split routine.',
  'Intermediate lifters looking for a complete reference library of exercises organised by body part.',
  'Evidence-based exercise selection for each body part with focus on correct form and progressive overload.'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO program_phases (id, program_id, phase_number, title, phase_goal, week_start, week_end, rpe_target_min, rpe_target_max)
VALUES ('ph-ctr-1', 'prog-complete-training', 1, 'Full Training Reference', 'Develop strength and size across all body parts using compound and isolation exercises.', 1, 12, 5, 8)
ON CONFLICT (id) DO NOTHING;

INSERT INTO workout_templates (id, program_id, phase_id, day_label, title, estimated_duration_mins, session_number, session_type, session_notes)
VALUES
  ('wt-ctr-arms','prog-complete-training','ph-ctr-1','Arms Day','Arms: Biceps & Triceps',45,1,'strength','2-3 sets of 8-12. Choose 2-3 exercises per muscle group.'),
  ('wt-ctr-core','prog-complete-training','ph-ctr-1','Core Day','Abs & Core',35,2,'core','2-3 sets. Mix planks, twists, and crunches.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO workout_exercises (id, workout_id, exercise_id, order_index, sets, reps, rest_seconds, load_guidance, is_superset)
VALUES
  ('we-ctr-001','wt-ctr-arms','ex-gen-020',1,3,'8-12',90,'Light to Moderate',false),
  ('we-ctr-002','wt-ctr-arms','ex-gen-019',2,3,'8-12',90,'Light to Moderate',false),
  ('we-ctr-003','wt-ctr-arms','ex-gen-021',3,3,'8-12',90,'Light to Moderate',false),
  ('we-ctr-004','wt-ctr-arms','ex-gen-022',4,3,'8-12',90,'Bodyweight',false),
  ('we-ctr-005','wt-ctr-arms','ex-gen-023',5,3,'8-12',90,'Moderate',false),
  ('we-ctr-006','wt-ctr-core','ex-fs-016',1,3,'15-20',60,'Bodyweight',false),
  ('we-ctr-007','wt-ctr-core','ex-fs-011',2,3,'30-60 sec',60,'Bodyweight',false),
  ('we-ctr-008','wt-ctr-core','ex-gen-024',3,3,'12-15 each side',60,'Bodyweight',false)
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════
-- PROGRAM 4: The Complete Book of Butt and Legs
-- ══════════════════════════════════════════════════════════════════
INSERT INTO training_programs (id, title, goal_category_id, duration_weeks, sessions_per_week, intensity_level, equipment_needed, tags, description, who_its_for, evidence_basis)
VALUES (
  'prog-butt-legs',
  'The Complete Book of Butt and Legs',
  'gc-001',
  6, 3, 5,
  ARRAY['dumbbells','barbell','ankle weights','resistance bands','leg extension machine','hyperextension bench'],
  ARRAY['lower body','glutes','quads','hamstrings','adductors','abductors','strength'],
  'A targeted lower body program covering every angle: posterior chain (glutes/hamstrings), anterior (quads), inner thighs (adductors), outer hips (abductors), and full compound movements.',
  'Anyone wanting to specifically develop their lower body shape and strength.',
  'Comprehensive lower body training based on multi-angle muscle targeting principles from the Complete Book of Butt and Legs.'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO program_phases (id, program_id, phase_number, title, phase_goal, week_start, week_end, rpe_target_min, rpe_target_max)
VALUES ('ph-bnl-1', 'prog-butt-legs', 1, 'Lower Body Strength & Shape', 'Target every muscle of the lower body across specialised sessions.', 1, 6, 5, 7)
ON CONFLICT (id) DO NOTHING;

INSERT INTO workout_templates (id, program_id, phase_id, day_label, title, estimated_duration_mins, session_number, session_type, session_notes)
VALUES
  ('wt-bnl-back','prog-butt-legs','ph-bnl-1','Day 1','Back Work (Glutes & Hamstrings)',45,1,'strength','3 sets of 10-15. Rest 60-90s.'),
  ('wt-bnl-front','prog-butt-legs','ph-bnl-1','Day 2','Front & Quad Focus',45,2,'strength','3 sets of 12-15. Rest 60-90s.'),
  ('wt-bnl-inner','prog-butt-legs','ph-bnl-1','Day 3','Inner & Outer Hip',45,3,'strength','3 sets of 12-15. Rest 60s.'),
  ('wt-bnl-combo','prog-butt-legs','ph-bnl-1','Day 4','Full Lower Body Compound',45,4,'strength','3 sets of 8-12. Rest 90s.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO workout_exercises (id, workout_id, exercise_id, order_index, sets, reps, rest_seconds, load_guidance, is_superset)
VALUES
  ('we-bnl-001','wt-bnl-back','ex-gen-025',1,3,'10-12',90,'Bodyweight or weighted',false),
  ('we-bnl-002','wt-bnl-back','ex-gen-026',2,3,'10-15',90,'Bodyweight',false),
  ('we-bnl-003','wt-bnl-back','ex-gen-027',3,3,'12-15',60,'Ankle weights or cable',false),
  ('we-bnl-004','wt-bnl-front','ex-gen-028',1,3,'12-15',90,'Machine',false),
  ('we-bnl-005','wt-bnl-front','ex-gen-002',2,3,'10-15',90,'Moderate',false),
  ('we-bnl-006','wt-bnl-inner','ex-gen-029',1,3,'12-15',60,'Bodyweight',false),
  ('we-bnl-007','wt-bnl-inner','ex-gen-030',2,3,'12-15',60,'Ankle weights',false),
  ('we-bnl-008','wt-bnl-inner','ex-gen-031',3,3,'12-15',60,'Bodyweight',false),
  ('we-bnl-009','wt-bnl-inner','ex-gen-032',4,3,'15',60,'Ankle weights',false),
  ('we-bnl-010','wt-bnl-combo','ex-gen-015',1,3,'8-12',90,'Barbell',false),
  ('we-bnl-011','wt-bnl-combo','ex-gen-033',2,3,'12-16 each leg',90,'Dumbbells',false)
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════
-- PROGRAM 5: Science and Development of Muscle Hypertrophy
-- ══════════════════════════════════════════════════════════════════
INSERT INTO training_programs (id, title, goal_category_id, duration_weeks, sessions_per_week, intensity_level, equipment_needed, tags, description, who_its_for, evidence_basis)
VALUES (
  'prog-muscle-hypertrophy',
  'Science and Development of Muscle Hypertrophy',
  'gc-001',
  12, 4, 7,
  ARRAY['barbell','dumbbells','pull-up bar','cable machine','bench'],
  ARRAY['hypertrophy','muscle building','strength','intermediate','upper lower','evidence-based'],
  'A science-backed hypertrophy program covering upper and lower body splits with optimal rep ranges (8-12), progressive overload, and compound plus isolation movements.',
  'Intermediate lifters who want to build muscle mass using evidence-based methods from sports science research.',
  'Based on Brad Schoenfeld''s research on muscle hypertrophy: mechanical tension, metabolic stress, and muscle damage as the three primary mechanisms.'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO program_phases (id, program_id, phase_number, title, phase_goal, week_start, week_end, rpe_target_min, rpe_target_max)
VALUES ('ph-hyp-1', 'prog-muscle-hypertrophy', 1, 'Hypertrophy Block', 'Maximise mechanical tension and metabolic stress through 3-4 sets of 8-12 reps on all major movements.', 1, 12, 6, 8)
ON CONFLICT (id) DO NOTHING;

INSERT INTO workout_templates (id, program_id, phase_id, day_label, title, estimated_duration_mins, session_number, session_type, session_notes)
VALUES
  ('wt-hyp-upper','prog-muscle-hypertrophy','ph-hyp-1','Day 1','Upper Body & Core',60,1,'strength','3-4 sets of 8-12. Rest 60-90s. Progressive overload each week.'),
  ('wt-hyp-lower','prog-muscle-hypertrophy','ph-hyp-1','Day 2','Lower Body & Core',60,2,'strength','3-4 sets of 8-12. Rest 90s. Focus on controlled eccentric.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO workout_exercises (id, workout_id, exercise_id, order_index, sets, reps, rest_seconds, load_guidance, is_superset)
VALUES
  ('we-hyp-001','wt-hyp-upper','ex-gen-017',1,4,'8-12',90,'Heavy',false),
  ('we-hyp-002','wt-hyp-upper','ex-gen-018',2,4,'8-12',90,'Bodyweight',false),
  ('we-hyp-003','wt-hyp-upper','ex-gen-034',3,3,'8-10',90,'Moderate',false),
  ('we-hyp-004','wt-hyp-upper','ex-gen-035',4,3,'10-12',90,'Light to Moderate',false),
  ('we-hyp-005','wt-hyp-upper','ex-gen-021',5,3,'10-12',90,'Moderate',false),
  ('we-hyp-006','wt-hyp-upper','ex-fs-011',6,3,'30-60 sec',60,'Bodyweight',false),
  ('we-hyp-007','wt-hyp-lower','ex-gen-015',1,4,'8-12',90,'Heavy',false),
  ('we-hyp-008','wt-hyp-lower','ex-gen-038',2,3,'8-10',90,'Heavy',false),
  ('we-hyp-009','wt-hyp-lower','ex-gen-036',3,3,'10-12',90,'Moderate',false),
  ('we-hyp-010','wt-hyp-lower','ex-gen-037',4,3,'12-15',60,'Bodyweight',false)
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════
-- PROGRAM 6: Next Level — Menopause & Beyond
-- ══════════════════════════════════════════════════════════════════
INSERT INTO training_programs (id, title, goal_category_id, duration_weeks, sessions_per_week, intensity_level, equipment_needed, tags, description, who_its_for, evidence_basis)
VALUES (
  'prog-next-level',
  'Next Level: Kicking Ass Through Menopause & Beyond',
  'gc-004',
  12, 3, 6,
  ARRAY['barbell','dumbbells','cardio machine'],
  ARRAY['womens health','menopause','strength','plyometrics','hiit','perimenopause'],
  'A multi-modal program for women navigating perimenopause and beyond. Combines heavy compound strength, plyometrics for bone density, sprint interval training, and hormone-supportive nutrition cues.',
  'Women in perimenopause, menopause, or post-menopause who want to maintain strength, power, and vitality.',
  'Based on Dr. Stacy Sims'' Next Level research: muscle-first approach, high-intensity training for hormonal adaptation, sprint intervals for GH/IGF-1 stimulation, and plyometrics for bone density.'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO program_phases (id, program_id, phase_number, title, phase_goal, week_start, week_end, rpe_target_min, rpe_target_max)
VALUES ('ph-nl-1', 'prog-next-level', 1, 'Strength & Power', 'Build maximal strength (heavy compound lifts) and explosive power (plyometrics + sprint intervals).', 1, 12, 6, 9)
ON CONFLICT (id) DO NOTHING;

INSERT INTO workout_templates (id, program_id, phase_id, day_label, title, estimated_duration_mins, session_number, session_type, warmup_notes, session_notes)
VALUES
  ('wt-nl-strength','prog-next-level','ph-nl-1','Day 1','Heavy Strength Training',60,1,'strength','5-10 min warm-up + mobility','4-6 sets of 3-5 reps at heavy load (85-90% 1RM). Full rest 3-5 min between sets.'),
  ('wt-nl-plyo','prog-next-level','ph-nl-1','Day 2','Plyometrics & Sprint Intervals',45,2,'hiit','5 min easy cardio + dynamic stretches','Plyometrics first (fresh), then sprint intervals. 20s max / 10s rest × 6-8 rounds for Tabata.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO workout_exercises (id, workout_id, exercise_id, order_index, sets, reps, rest_seconds, load_guidance, is_superset)
VALUES
  ('we-nl-001','wt-nl-strength','ex-gen-015',1,5,'3-5',240,'Heavy (85-90% 1RM)',false),
  ('we-nl-002','wt-nl-strength','ex-gen-038',2,4,'3-5',240,'Heavy',false),
  ('we-nl-003','wt-nl-plyo','ex-gen-039',1,2,'8-10',90,'Bodyweight',false),
  ('we-nl-004','wt-nl-plyo','ex-gen-040',2,6,'20s on/10s off',0,'Max effort',false)
ON CONFLICT (id) DO NOTHING;
