-- Forever Strong Power Plan — full 6-week dumbbell strength program (2 phases, 6 sessions)

-- ── EXERCISES ──────────────────────────────────────────────────────────────────
INSERT INTO exercises (id, name, body_part, target, category, difficulty, equipment, primary_muscles, secondary_muscles, is_low_impact, instructions, cues)
VALUES
  ('ex-fs-001','Goblet Squat','lower body','quads','strength',2,ARRAY['dumbbell'],ARRAY['quads','glutes'],ARRAY['core','calves'],true,'Hold a dumbbell vertically at chest height with both hands. Stand feet shoulder-width apart. Sit hips back and down while keeping chest up and elbows inside knees. Drive through heels to stand.','Hold DB close to chest; elbows down inside knees; drive through heels; 3-sec eccentric'),
  ('ex-fs-002','Dumbbell Romanian Deadlift','lower body','hamstrings','strength',2,ARRAY['dumbbell'],ARRAY['hamstrings','glutes'],ARRAY['lower back','core'],true,'Hold dumbbells at hips. Hinge forward at the hips with a slight knee bend, lowering the DBs along your legs. Squeeze glutes to return upright.','Slight knee bend; hinge at hips; keep DBs close; squeeze glutes at top; 3-sec eccentric'),
  ('ex-fs-003','Push-Up','upper body','chest','strength',2,ARRAY['bodyweight'],ARRAY['chest','triceps'],ARRAY['shoulders','core'],true,'Straight line from head to heels. Lower chest to floor with elbows at 45° to body. Press up with control. Modify on knees if needed.','Straight line head to heels; elbows 45° to body; lower slowly; chest touches floor'),
  ('ex-fs-004','Dumbbell Row','back','lats','strength',2,ARRAY['dumbbell'],ARRAY['lats','rhomboids'],ARRAY['biceps','rear deltoids'],true,'Hinge at hips with a flat back. Pull dumbbell toward hip, squeezing shoulder blades. Lower with control.','Hinge at hips; back flat; squeeze shoulder blades; pull toward hip not armpit'),
  ('ex-fs-005','Side Plank','core','obliques','strength',2,ARRAY['bodyweight'],ARRAY['obliques','core'],ARRAY['glutes','shoulder'],true,'Lie on side. Prop up on forearm and feet stacked. Hold a straight line from head to feet. Elbow directly under shoulder.','Elbow under shoulder; straight line head to feet; avoid hip sag'),
  ('ex-fs-006','HIIT Finisher','full body','cardiovascular','cardio',3,ARRAY['bodyweight','cardio machine'],ARRAY['cardiovascular'],ARRAY['legs','core'],false,'Choose your hard: Airbike / Rower / Sled push / Sprints. 15 sec max effort / 45 sec rest. 3 rounds.','15 sec on / 45 sec off; choose your modality; max effort each round'),
  ('ex-fs-007','Split Squat','lower body','quads','strength',2,ARRAY['dumbbell'],ARRAY['quads','glutes'],ARRAY['hamstrings','calves'],true,'Front foot flat, rear foot elevated or on ground. Lower hips straight down, front knee over toes. Torso upright.','Front knee over toes; torso upright; hips square; lower straight down; 3-sec eccentric'),
  ('ex-fs-008','Dumbbell Deadlift','lower body','hamstrings','strength',2,ARRAY['dumbbell'],ARRAY['hamstrings','glutes'],ARRAY['lower back','core'],true,'Hinge at hips with slight knee bend. Hold DBs outside legs. Neutral spine throughout. Drive hips forward at the top.','Hinge at hips; slight knee bend; DB close to body; neutral spine; drive through glutes'),
  ('ex-fs-009','Standing Dumbbell Shoulder Press','upper body','shoulders','strength',2,ARRAY['dumbbell'],ARRAY['shoulders','triceps'],ARRAY['upper traps','core'],true,'Stand upright, core engaged. Press DBs overhead from shoulder height without flaring elbows excessively. Control the lowering.','Core engaged; back straight; press overhead without flaring elbows; controlled movement'),
  ('ex-fs-010','Dumbbell Pullover','upper body','lats','strength',2,ARRAY['dumbbell'],ARRAY['lats','chest'],ARRAY['core','triceps'],true,'Lie on bench. Hold DB with both hands above chest, arms slightly bent. Lower behind head without letting ribs flare. Pull back to start.','Arms slightly bent; lower DB without rib-cage flare; core braced; control both ways; light weight'),
  ('ex-fs-011','Plank','core','core','strength',1,ARRAY['bodyweight'],ARRAY['core','glutes'],ARRAY['shoulders','quads'],true,'Hold a straight line from head to heels on forearms and toes. Engage core, glutes and quads. Breathe steadily.','Engage core, glutes, and quads; avoid hip sag or back arch; neutral neck'),
  ('ex-fs-012','Front-Loaded Step-Up','lower body','quads','strength',2,ARRAY['dumbbell','bench'],ARRAY['quads','glutes'],ARRAY['hamstrings','calves'],true,'Place full foot on bench. Drive through front heel to stand. Do not push off the back foot. Keep chest lifted.','Full foot on bench; chest lifted; drive through front heel; do not push off back leg'),
  ('ex-fs-013','Kickstand RDL','lower body','hamstrings','strength',2,ARRAY['dumbbell'],ARRAY['hamstrings','glutes'],ARRAY['lower back','core'],true,'Stand on one leg with the toes of the back foot lightly touching for balance. Hinge at hips keeping level pelvis. Return to stand by squeezing glutes.','Stand on one leg; toes of back foot touch for balance; hinge at hips; keep hips level'),
  ('ex-fs-014','Flat Bench Dumbbell Chest Press','upper body','chest','strength',2,ARRAY['dumbbell','bench'],ARRAY['chest','triceps'],ARRAY['shoulders','core'],true,'Lie on bench. DBs at chest level, elbows at 45°. Press straight up. Lower with control.','DBs at chest; elbows at 45°; press straight up; lower with control'),
  ('ex-fs-015','Dumbbell Reverse Fly','upper body','rear deltoids','strength',1,ARRAY['dumbbell'],ARRAY['rear deltoids','upper back'],ARRAY['middle traps','rhomboids'],true,'Hinge at hips with a flat back. Raise DBs out to the sides with a slight elbow bend, squeezing shoulder blades at the top.','Hinge at hips; flat back; squeeze shoulder blades; slight elbow bend; do not shrug; light weight'),
  ('ex-fs-016','Reverse Crunch','core','lower abs','strength',1,ARRAY['bodyweight'],ARRAY['lower abs','core'],ARRAY['hip flexors'],true,'Lie flat. Lift legs to ceiling and use core to curl hips off the floor. Lower with control. Keep lower back pressed down throughout.','Flat on back; lift legs toward ceiling; lower with control; lower back stays down'),
  ('ex-fs-017','Lateral Raise','upper body','shoulders','strength',1,ARRAY['dumbbell'],ARRAY['lateral deltoids'],ARRAY['upper traps'],true,'Stand tall holding DBs at sides. Lead with elbows to raise arms to shoulder height. Lower slowly. Avoid shrugging.','Lead with elbows; raise to shoulder height; lower slowly; do not shrug; light weight'),
  ('ex-fs-018','Dumbbell Alternating Row','back','lats','strength',2,ARRAY['dumbbell'],ARRAY['lats','rhomboids'],ARRAY['biceps','rear deltoids'],true,'Hinge at hips. Alternate pulling each DB toward the hip. Squeeze shoulder blade with each rep. Control the return.','Squeeze shoulder blade; pull toward hip; control both pull and return; no torso rotation'),
  ('ex-fs-019','Reverse Lunge','lower body','quads','strength',2,ARRAY['dumbbell'],ARRAY['quads','glutes'],ARRAY['hamstrings','calves'],true,'Step back and lower hips straight down. Front knee tracks over toes. Push back to start through the front heel.','Step back; lower hips straight down; front knee over toes; push back through front heel'),
  ('ex-fs-020','Single-Leg RDL','lower body','hamstrings','strength',3,ARRAY['dumbbell'],ARRAY['hamstrings','glutes'],ARRAY['core','lower back'],true,'Balance on one leg with slight knee bend. Hinge at hips reaching hand toward floor. Squeeze glute to return.','Flat back; hinge at hips; slight bend in standing knee; reach hand toward foot; control balance'),
  ('ex-fs-021','Alternating Dumbbell Shoulder Press','upper body','shoulders','strength',2,ARRAY['dumbbell'],ARRAY['shoulders','triceps'],ARRAY['core','upper traps'],true,'Stand or sit. Alternate pressing each arm overhead while the other holds at shoulder height. Core stays engaged.','Alternate arms; core engaged; back straight; controlled press overhead'),
  ('ex-fs-022','Plank Row','back','lats','strength',3,ARRAY['dumbbell'],ARRAY['lats','core'],ARRAY['biceps','rear deltoids'],true,'Start in plank with a DB in each hand. Row one DB to hip without rotating the torso. Return to plank. Alternate sides.','In plank; row one DB without rotating torso; keep hips stable; brace core hard'),
  ('ex-fs-023','Russian Twist','core','obliques','strength',2,ARRAY['bodyweight'],ARRAY['obliques','core'],ARRAY['hip flexors'],true,'Sit with knees bent, leaning slightly back. Rotate torso side to side, keeping chest up. Add DB for extra challenge.','Lean slightly back; rotate torso side to side; keep chest up; can hold DB for challenge'),
  ('ex-fs-024','Goblet Squat Hold','lower body','quads','strength',1,ARRAY['dumbbell'],ARRAY['quads','glutes'],ARRAY['core','hip flexors'],true,'Hold the bottom of a goblet squat for the prescribed time. Chest up, knees out, elbows inside knees. Breathe deeply.','Hold at bottom of squat; chest up; knees out; elbows inside knees; breathe deeply; light weight'),
  ('ex-fs-025','Dumbbell Leg Curl','lower body','hamstrings','strength',2,ARRAY['dumbbell','bench'],ARRAY['hamstrings'],ARRAY['calves','glutes'],true,'Lie face down holding a DB between your feet. Curl heels toward glutes. Lower with control.','Hold DB between feet; bend knees to curl toward glutes; lower with control; keep hips down'),
  ('ex-fs-026','Single Arm Glute Bridge Press','full body','chest','strength',3,ARRAY['dumbbell'],ARRAY['glutes','chest'],ARRAY['triceps','core'],true,'Bridge position with hips raised. Hold one DB and press it overhead. Keep hips level and squeeze glutes throughout.','Bridge position; single-arm press; keep hips level; squeeze glutes throughout'),
  ('ex-fs-027','Pronated Dumbbell Row','back','upper back','strength',2,ARRAY['dumbbell'],ARRAY['upper back','rear deltoids'],ARRAY['rhomboids','biceps'],true,'Hinge at hips with flat back. Hold DBs overhand. Row to hip squeezing shoulder blades. Control the return.','Overhand grip; hinge at hips; flat back; squeeze shoulder blades; pull to hip'),
  ('ex-fs-028','Curtsy Lunge','lower body','glutes','strength',2,ARRAY['dumbbell'],ARRAY['glutes','quads'],ARRAY['hamstrings','adductors'],true,'Step one foot back and across the other, lowering hips down. Keep front knee tracking over toes. Return to start.','Step back and across; lower hips; front knee tracking over toes; controlled descent'),
  ('ex-fs-029','Dumbbell Biceps Curl','upper body','biceps','strength',1,ARRAY['dumbbell'],ARRAY['biceps'],ARRAY['forearms'],true,'Stand tall, elbows fixed at sides. Curl DBs to shoulder height, squeezing at the top. Lower with control.','Full range of motion; keep elbows fixed at sides; squeeze at top; control the lowering'),
  ('ex-fs-030','Dumbbell Triceps Kickback','upper body','triceps','strength',1,ARRAY['dumbbell'],ARRAY['triceps'],ARRAY['rear deltoids'],true,'Hinge forward, upper arm parallel to floor. Extend forearm back fully. Squeeze at the top. Return with control.','Hinge at hips; upper arm parallel to floor; extend arm fully; squeeze at top; light weight'),
  ('ex-fs-031','Split-Stance Chops','core','obliques','strength',2,ARRAY['dumbbell'],ARRAY['obliques','core'],ARRAY['hips','shoulders'],true,'Staggered stance. Hold DB with both hands and rotate from hips and torso in a chopping motion. Control throughout.','Staggered stance; rotate from hips and torso; control the movement; keep core braced; light weight')
ON CONFLICT (id) DO NOTHING;

-- ── TRAINING PROGRAM ──────────────────────────────────────────────────────────
INSERT INTO training_programs (id, title, goal_category_id, duration_weeks, sessions_per_week, intensity_level, equipment_needed, tags, description, who_its_for, evidence_basis)
VALUES (
  'prog-forever-strong',
  'Forever Strong Power Plan',
  'gc-001',
  6, 3, 6,
  ARRAY['dumbbells','bench'],
  ARRAY['strength','full body','dumbbell','intermediate','women'],
  'A 6-week dumbbell strength program split into two phases: Phase 1 builds foundational movement patterns and Phase 2 progresses to supersets and circuits. Each session ends with a HIIT finisher.',
  'Intermediate lifters who have dumbbell access and want to build full-body strength with an intelligent progressive structure.',
  'Evidence-based strength training principles: progressive overload, eccentric focus, and supersets for metabolic stimulus. Inspired by Dr. Gabrielle Lyon''s Forever Strong methodology.'
)
ON CONFLICT (id) DO NOTHING;

-- ── PHASES ──────────────────────────────────────────────────────────────────
INSERT INTO program_phases (id, program_id, phase_number, title, phase_goal, week_start, week_end, rpe_target_min, rpe_target_max)
VALUES
  ('ph-fs-1', 'prog-forever-strong', 1, 'Establishing Fundamentals', 'Learn the primary movement patterns with moderate loads, 3-second eccentrics, and single-joint warm-ups.', 1, 2, 5, 7),
  ('ph-fs-2', 'prog-forever-strong', 2, 'Progression (Circuit Format)', 'Progress to supersets and circuits with heavier loads. Develop work capacity and metabolic conditioning.', 3, 6, 6, 8)
ON CONFLICT (id) DO NOTHING;

-- ── WORKOUT TEMPLATES ─────────────────────────────────────────────────────────
INSERT INTO workout_templates (id, program_id, phase_id, day_label, title, estimated_duration_mins, session_number, session_type, warmup_notes, cooldown_notes, session_notes)
VALUES
  ('wt-fs-1a','prog-forever-strong','ph-fs-1','Day 1','Session 1 — Foundation Full Body',45,1,'strength',
   'Hip Airplanes ×10/side | Cat & Cow ×10 | Couch Stretch 30s/side | Lunge to Reach ×5/side | Child''s Pose 30s',
   'Light stretching and breathing, 5 min',
   'Phase 1. Moderate weight. 3-sec eccentric on all lower body. Rest 90s between sets.'),
  ('wt-fs-1b','prog-forever-strong','ph-fs-1','Day 2','Session 2 — Foundation Full Body',45,2,'strength',
   'Hip 90-90 30s/side | Bretzel 30s/side | Squat to Reach ×10 | Single-Leg RDL ×5/side | Scapular Push-Up ×15',
   'Light stretching, 5 min',
   'Phase 1. Moderate weight. 3-sec eccentric on all lower body. Rest 90s between sets.'),
  ('wt-fs-1c','prog-forever-strong','ph-fs-1','Day 3','Session 3 — Foundation Full Body',45,3,'strength',
   'Single-Leg Glute Bridge ×15/side | Bretzel 30s/side | World''s Greatest Stretch ×5/side | Wrist Mobility 30s | Kneeling Toes 30s',
   'Light stretching, 5 min',
   'Phase 1. Moderate weight. 3-sec eccentric on all lower body. Rest 90s between sets.'),
  ('wt-fs-2a','prog-forever-strong','ph-fs-2','Day 1','Session 1 — Full Body Circuit',45,4,'strength',
   'Single-Leg Glute Bridge ×20/side | Lunge to Reach ×5/side | Push-Up to Reach ×3-5/side | Child''s Pose 20-30s',
   'Light stretching, 5 min',
   'Phase 2 Circuit. Supersets: WS1 Goblet Squat + DB RDL; WS2 Bench Press + Alternating Row; WS3 Lateral Raise + Side Plank + Reverse Crunch. No rest between superset exercises; 1-2 min between rounds.'),
  ('wt-fs-2b','prog-forever-strong','ph-fs-2','Day 2','Session 2 — Full Body Circuit',45,5,'strength',
   'Single-Leg Glute Bridge ×20/side | Bear Crawls ×10/side | Lunge to Reach ×5/side | Push-Up to Reach ×3/side | Child''s Pose 20s',
   'Light stretching, 5 min',
   'Phase 2 Circuit. Supersets: WS1 Reverse Lunge + Single-Leg RDL; WS2 Pullover + Alt Shoulder Press; WS3 Plank Row + Russian Twist + Goblet Hold. No rest between superset exercises; 1-2 min between rounds.'),
  ('wt-fs-2c','prog-forever-strong','ph-fs-2','Day 3','Session 3 — Full Body Circuit',45,6,'strength',
   'Single-Leg Glute Bridge ×20/side | Bear Crawls ×10/side | Lunge to Reach ×5/side | Push-Up to Reach ×3/side | Child''s Pose 20s',
   'Light stretching, 5 min',
   'Phase 2 Circuit. Supersets: WS1 Step-Up + DB Leg Curl; WS2 Glute Bridge Press + Pronated Row; WS3 Curtsy Lunge + Biceps Curl + Triceps Kickback + Split-Stance Chops. No rest between superset exercises; 1-2 min between rounds.')
ON CONFLICT (id) DO NOTHING;

-- ── WORKOUT EXERCISES ─────────────────────────────────────────────────────────
-- Session 1 (Phase 1)
INSERT INTO workout_exercises (id, workout_id, exercise_id, order_index, sets, reps, rest_seconds, rpe_target, load_guidance, is_superset, superset_group)
VALUES
  ('we-fs-001','wt-fs-1a','ex-fs-001',1,3,'6-15',90,6,'Moderate — challenging but controlled',false,null),
  ('we-fs-002','wt-fs-1a','ex-fs-002',2,3,'6-15',90,6,'Moderate',false,null),
  ('we-fs-003','wt-fs-1a','ex-fs-003',3,3,'10-20',90,6,'Bodyweight — modify on knees',false,null),
  ('we-fs-004','wt-fs-1a','ex-fs-004',4,3,'6-15',90,6,'Moderate',false,null),
  ('we-fs-005','wt-fs-1a','ex-fs-005',5,3,'10-30 sec',60,5,'Bodyweight',false,null),
  ('we-fs-006','wt-fs-1a','ex-fs-006',6,3,'15s on/45s off',0,8,'Max effort each round',false,null)
ON CONFLICT (id) DO NOTHING;

-- Session 2 (Phase 1)
INSERT INTO workout_exercises (id, workout_id, exercise_id, order_index, sets, reps, rest_seconds, rpe_target, load_guidance, is_superset, superset_group)
VALUES
  ('we-fs-007','wt-fs-1b','ex-fs-007',1,3,'6-15 per side',90,6,'Moderate',false,null),
  ('we-fs-008','wt-fs-1b','ex-fs-008',2,3,'6-15',90,6,'Moderate',false,null),
  ('we-fs-009','wt-fs-1b','ex-fs-009',3,3,'6-15',90,6,'Moderate',false,null),
  ('we-fs-010','wt-fs-1b','ex-fs-010',4,3,'15',90,5,'Light',false,null),
  ('we-fs-011','wt-fs-1b','ex-fs-011',5,3,'10-30 sec',60,5,'Bodyweight',false,null),
  ('we-fs-012','wt-fs-1b','ex-fs-006',6,3,'15s on/45s off',0,8,'Max effort',false,null)
ON CONFLICT (id) DO NOTHING;

-- Session 3 (Phase 1)
INSERT INTO workout_exercises (id, workout_id, exercise_id, order_index, sets, reps, rest_seconds, rpe_target, load_guidance, is_superset, superset_group)
VALUES
  ('we-fs-013','wt-fs-1c','ex-fs-012',1,3,'6-15 per side',90,6,'Moderate',false,null),
  ('we-fs-014','wt-fs-1c','ex-fs-013',2,3,'10-25',90,6,'Moderate',false,null),
  ('we-fs-015','wt-fs-1c','ex-fs-014',3,3,'6-15',90,6,'Moderate',false,null),
  ('we-fs-016','wt-fs-1c','ex-fs-015',4,3,'6-15',90,5,'Light',false,null),
  ('we-fs-017','wt-fs-1c','ex-fs-016',5,3,'6-15',60,5,'Bodyweight',false,null),
  ('we-fs-018','wt-fs-1c','ex-fs-006',6,3,'15s on/45s off',0,8,'Max effort',false,null)
ON CONFLICT (id) DO NOTHING;

-- Session 4 (Phase 2 — Circuit)
INSERT INTO workout_exercises (id, workout_id, exercise_id, order_index, sets, reps, rest_seconds, rpe_target, load_guidance, is_superset, superset_group)
VALUES
  ('we-fs-019','wt-fs-2a','ex-fs-001',1,3,'6-15',0,7,'Moderate',true,'WS1'),
  ('we-fs-020','wt-fs-2a','ex-fs-002',2,3,'6-15',90,7,'Moderate',true,'WS1'),
  ('we-fs-021','wt-fs-2a','ex-fs-014',3,3,'6-15',0,7,'Moderate',true,'WS2'),
  ('we-fs-022','wt-fs-2a','ex-fs-018',4,3,'6-15',90,7,'Moderate',true,'WS2'),
  ('we-fs-023','wt-fs-2a','ex-fs-017',5,3,'6-15',0,6,'Light',true,'WS3'),
  ('we-fs-024','wt-fs-2a','ex-fs-005',6,3,'20 sec per side',0,6,'Bodyweight',true,'WS3'),
  ('we-fs-025','wt-fs-2a','ex-fs-016',7,3,'6-15',90,6,'Bodyweight',true,'WS3'),
  ('we-fs-026','wt-fs-2a','ex-fs-006',8,3,'15s on/45s off',0,8,'Max effort',false,null)
ON CONFLICT (id) DO NOTHING;

-- Session 5 (Phase 2 — Circuit)
INSERT INTO workout_exercises (id, workout_id, exercise_id, order_index, sets, reps, rest_seconds, rpe_target, load_guidance, is_superset, superset_group)
VALUES
  ('we-fs-027','wt-fs-2b','ex-fs-019',1,3,'8 per side',0,7,'Moderate',true,'WS1'),
  ('we-fs-028','wt-fs-2b','ex-fs-020',2,3,'8 per side',90,7,'Moderate',true,'WS1'),
  ('we-fs-029','wt-fs-2b','ex-fs-010',3,3,'15',0,6,'Light',true,'WS2'),
  ('we-fs-030','wt-fs-2b','ex-fs-021',4,3,'8 per side',90,7,'Moderate',true,'WS2'),
  ('we-fs-031','wt-fs-2b','ex-fs-022',5,3,'10 per side',0,7,'Moderate',true,'WS3'),
  ('we-fs-032','wt-fs-2b','ex-fs-023',6,3,'12 per side',0,6,'Bodyweight',true,'WS3'),
  ('we-fs-033','wt-fs-2b','ex-fs-024',7,3,'20 sec hold',90,5,'Light',true,'WS3'),
  ('we-fs-034','wt-fs-2b','ex-fs-006',8,3,'15s on/45s off',0,8,'Max effort',false,null)
ON CONFLICT (id) DO NOTHING;

-- Session 6 (Phase 2 — Circuit)
INSERT INTO workout_exercises (id, workout_id, exercise_id, order_index, sets, reps, rest_seconds, rpe_target, load_guidance, is_superset, superset_group)
VALUES
  ('we-fs-035','wt-fs-2c','ex-fs-012',1,3,'8 per side',0,7,'Moderate',true,'WS1'),
  ('we-fs-036','wt-fs-2c','ex-fs-025',2,3,'15',90,6,'Light',true,'WS1'),
  ('we-fs-037','wt-fs-2c','ex-fs-026',3,3,'8 per side',0,7,'Moderate',true,'WS2'),
  ('we-fs-038','wt-fs-2c','ex-fs-027',4,3,'15',90,7,'Moderate',true,'WS2'),
  ('we-fs-039','wt-fs-2c','ex-fs-028',5,3,'6 per side',0,7,'Moderate',true,'WS3'),
  ('we-fs-040','wt-fs-2c','ex-fs-029',6,3,'15',0,6,'Light',true,'WS3'),
  ('we-fs-041','wt-fs-2c','ex-fs-030',7,3,'15',0,6,'Light',true,'WS3'),
  ('we-fs-042','wt-fs-2c','ex-fs-031',8,3,'15 per side',90,6,'Light',true,'WS3'),
  ('we-fs-043','wt-fs-2c','ex-fs-006',9,3,'15s on/45s off',0,8,'Max effort',false,null)
ON CONFLICT (id) DO NOTHING;
