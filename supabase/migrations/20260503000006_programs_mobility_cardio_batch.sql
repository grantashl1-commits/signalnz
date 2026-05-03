-- Mobility, Cardio, Yoga, HIIT, and Mind-Body programs batch:
-- Ashtanga Yoga, Relax into Stretch, Stretching Essentials, Somatic Exercise,
-- The Shaolin Workout, The Female Body Bible, The Maffetone Method,
-- Total Heart Rate Training, 28-Minute Women's HIIT Circuit Level 1

-- ── EXERCISES ────────────────────────────────────────────────────────────────
INSERT INTO exercises (id, name, body_part, target, category, difficulty, equipment, primary_muscles, secondary_muscles, is_low_impact, instructions, cues)
VALUES
  -- Yoga (Ashtanga)
  ('ex-yog-001','Surya Namaskara A (Sun Salutation A)','full body','full body','yoga',1,ARRAY['bodyweight'],ARRAY['full body'],ARRAY[],true,'Five-posture vinyasa: Mountain → Forward Fold → Plank → Chaturanga → Upward Dog → Downward Dog → Forward Fold → Mountain. Link breath to each movement.','Link breath with movement; keep feet hip-width apart; maintain a steady gaze (drishti)'),
  ('ex-yog-002','Surya Namaskara B (Sun Salutation B)','full body','full body','yoga',2,ARRAY['bodyweight'],ARRAY['full body'],ARRAY[],true,'Adds Chair Pose (Utkatasana) and Warrior I at the start and end of Sun A. Bend knees as you sit back in Chair. Arms alongside ears on inhale.','Bend knees as you sit back; arms alongside ears; inhale to raise; exhale to fold'),
  ('ex-yog-003','Utthita Trikonasana (Extended Triangle)','lower body','hips','yoga',2,ARRAY['bodyweight'],ARRAY['hips','legs'],ARRAY['core','back'],true,'Stand with feet wide. Extend arms. Reach forward foot over shin. Gaze toward raised hand. Keep thighs actively engaged.','Extend arms and legs fully; gaze toward raised hand; engage thighs actively'),
  ('ex-yog-004','Virabhadrasana A (Warrior I)','lower body','hips','yoga',2,ARRAY['bodyweight'],ARRAY['quads','hip flexors'],ARRAY['glutes','core'],true,'Lunge deep with front knee over ankle. Square hips to front. Reach arms overhead. Stay grounded through back heel.','Lunge deep; knee over ankle; square hips; reach arms up; ground through back heel'),
  ('ex-yog-005','Navasana (Boat Pose)','core','abdominals','yoga',2,ARRAY['bodyweight'],ARRAY['core','hip flexors'],ARRAY['quads'],true,'Balance on sit bones. Lift chest and extend legs parallel to floor. Arms extend forward. Hold 5 breaths × 5 rounds.','Balance on sit bones; chest lifted; shoulders back; extend legs; engage core fully'),
  ('ex-yog-006','Paschimottanasana (Seated Forward Fold)','lower body','hamstrings','yoga',1,ARRAY['bodyweight'],ARRAY['hamstrings','lower back'],ARRAY['calves'],true,'Sit with legs extended, feet flexed. Fold from hips reaching for feet. Keep back flat on inhale; fold deeper on exhale.','Fold from hips; reach for feet; keep back flat; use breath to deepen fold'),
  ('ex-yog-007','Savasana (Corpse Pose)','full body','relaxation','yoga',1,ARRAY['bodyweight'],ARRAY[],ARRAY[],true,'Lie flat on back. Arms at sides, palms facing up. Allow entire body to be heavy. Focus on breath and release all tension.','Lie flat; arms at sides; palms up; let body be heavy; focus on breath; release all tension'),
  ('ex-yog-008','Setu Bandhasana (Bridge Pose)','lower body','glutes','yoga',1,ARRAY['bodyweight'],ARRAY['glutes','hamstrings'],ARRAY['lower back','core'],true,'Lie on back, feet flat. Lift hips while pressing through feet. Engage thighs. Open chest and shoulders.','Lift hips; feet flat; engage thighs; open chest and shoulders'),
  ('ex-yog-009','Salamba Sarvangasana (Shoulderstand)','full body','shoulders','yoga',3,ARRAY['bodyweight'],ARRAY['shoulders','core'],ARRAY['legs','neck'],true,'Lift feet overhead. Support back with hands. Keep legs extended upward. Balance on shoulders — not the neck.','Lift feet overhead; support back with hands; legs upward; balance on shoulders not neck'),
  ('ex-yog-010','Dandasana (Staff Pose)','core','core','yoga',1,ARRAY['bodyweight'],ARRAY['core','legs'],ARRAY['back'],true,'Sit with legs extended. Flex feet back. Keep spine straight and tall. Hands beside hips pressing into floor.','Sit with legs extended; flex feet; spine straight and tall; hands beside hips'),
  -- Stretching & Mobility
  ('ex-mob-001','Souped Up Toe Touch','lower body','hamstrings','mobility',1,ARRAY['bodyweight'],ARRAY['hamstrings','glutes','lower back'],ARRAY[],true,'Standing forward fold. Keep knees locked. Balance weight evenly. Release tension with each exhale. Hold 1-2 min.','Knees locked; weight even; release tension gently; breathe deeply'),
  ('ex-mob-002','Spine Decompression Hang','upper body','spine','mobility',1,ARRAY['pull-up bar'],ARRAY['spine','upper back'],ARRAY['shoulders','lats'],true,'Hang from a pull-up bar. Let body weight decompress the spine. Relax shoulders fully. Do not pull up. Alternate grips.','Hang; do not pull up while inhaling; relax shoulders; alternate grips; let gravity work'),
  ('ex-mob-003','Improved Cobra Stretch','core','spine','mobility',1,ARRAY['bodyweight'],ARRAY['spine','abdominals'],ARRAY['shoulders'],true,'Lie face down, hands under shoulders. Press up. Elongate spine. Inhale and tighten abs slightly. Wrap spine around imaginary ball.','Place hands on elevated surface; elongate spine; inhale and tighten abs; wrap spine around imaginary ball'),
  ('ex-mob-004','Side Bend Stretch','core','obliques','mobility',1,ARRAY['bodyweight'],ARRAY['obliques','lateral line'],ARRAY[],true,'Slide along a wall. Keep shoulders square. Contract glutes while returning to start. Do not twist torso.','Slide along wall; keep shoulders square; contract glutes on return; do not twist'),
  ('ex-mob-005','Spine Rotation Stretch','core','spine','mobility',1,ARRAY['bodyweight'],ARRAY['spine','core'],ARRAY[],true,'Sit upright. Anchor hips firmly. Extend spine while twisting. Use arm to deepen the stretch progressively.','Sit upright; anchor hips; extend spine while twisting; use arm to deepen'),
  ('ex-mob-006','Lateral Neck & Trap Stretch','upper body','neck','mobility',1,ARRAY['bodyweight'],ARRAY['neck','trapezius'],ARRAY['shoulders'],true,'Keep arm straight at side or hold onto chair. Do not force range of motion. Support head gently. Relax shoulders.','Keep arm straight; do not force range; support head gently; relax shoulders'),
  ('ex-mob-007','Kneeling Hip Flexor Stretch','lower body','hip flexors','mobility',1,ARRAY['bodyweight'],ARRAY['hip flexors','quads'],ARRAY['glutes'],true,'Kneeling lunge position. Hips squared. Stay upright. Do not lean forward. Flex abs for support. Hold 1-2 min each side.','Hips squared; stay upright; do not lean forward; flex abs for support'),
  -- Stretching Essentials (Hannah Corbin)
  ('ex-mob-008','Forearm Extension Stretch','upper body','forearms','mobility',1,ARRAY['bodyweight'],ARRAY['forearms'],ARRAY['wrists'],true,'Extend arms like pushing bad vibes away. Rotate fingers out and down. Keep elbows straight. Gently press palms toward floor.','Extend arms; rotate fingers out and down; keep elbows straight; press palms toward floor'),
  ('ex-mob-009','Tilt-a-Whirl Neck Stretch','upper body','neck','mobility',1,ARRAY['bodyweight'],ARRAY['neck','shoulders'],ARRAY[],true,'Bring arm behind back to hold hands with the other. Tilt head toward clasped hands. Exhale and create space. Keep spine tall.','Arm behind back; tilt head toward hands; exhale and create space; spine tall'),
  ('ex-mob-010','Thread the Needle (Spine Rotation)','back','spine','mobility',1,ARRAY['bodyweight'],ARRAY['spine','upper back'],ARRAY['shoulders'],true,'On all fours, thread one arm under the other. Rotate and lift opposite cheek. Push with hand and rotate torso.','Thread arm under; lift opposite cheek; push with hand; rotate torso; exhale'),
  ('ex-mob-011','Child''s Pose Variation (Happy Juanito)','back','lats','mobility',1,ARRAY['bodyweight'],ARRAY['lats','shoulders'],ARRAY['back'],true,'On all fours, walk hands forward and release forehead and armpits to earth. Keep hips above knees. Reach bottom to ceiling.','Walk hands forward; forehead and armpits to earth; hips above knees'),
  ('ex-mob-012','Triceps Over-the-Head Stretch','upper body','triceps','mobility',1,ARRAY['bodyweight'],ARRAY['triceps','shoulders'],ARRAY[],true,'Lift arm to pat back. Engage abs and close rib cage. Grab opposite elbow. Encourage elbow gently backward.','Lift arm to pat back; engage abs; grab opposite elbow; encourage elbow backward'),
  -- Somatic Exercise
  ('ex-som-001','Arch and Flatten (Lower Back)','back','spine','somatic',1,ARRAY['bodyweight'],ARRAY['spine','lower back'],ARRAY['core'],true,'Lie on back. Press pelvis down against floor. Make lower back arch up at belt line. Inhale to arch, exhale to flatten. Increase range gently. 20 reps.','Press pelvis down; arch lower back on inhale; flatten on exhale; increase range gently'),
  ('ex-som-002','Lift Elbow on Stomach','upper body','shoulder','somatic',1,ARRAY['bodyweight'],ARRAY['shoulder'],ARRAY['upper back'],true,'Lie on stomach. Slowly lift elbow. Feel muscle contraction in shoulder. Maintain a relaxed, slow pace. 3 sets × 3 reps.','Lift elbow slowly; feel contraction in shoulder; maintain relaxed pace'),
  ('ex-som-003','Lift Head and Elbow to Knee','core','abdominals','somatic',1,ARRAY['bodyweight'],ARRAY['abdominals','spine'],ARRAY['core'],true,'Lie on back. Exhale while lifting head and elbow. Bring elbow toward knee by flattening the back. 6 sets × 1 rep slowly.','Exhale lifting head and elbow; bring elbow to knee by flattening back; slow and controlled'),
  -- Shaolin Workout
  ('ex-sha-001','Wrist Rotation','upper body','wrists','mobility',1,ARRAY['bodyweight'],ARRAY['wrists','forearms'],ARRAY[],true,'Stand tall, extend arms. Rotate wrists outward. Relax and loosen up. 10 reps.','Stand tall; extend arms; rotate wrists outward; relax and loosen up'),
  ('ex-sha-002','Ankle Rotation','lower body','ankles','mobility',1,ARRAY['bodyweight'],ARRAY['ankles','calves'],ARRAY[],true,'Lift foot onto toes. Rotate ankle clockwise then counterclockwise. Keep balance. 10 each direction.','Lift foot onto toes; rotate ankle; keep balance; clockwise and counter-clockwise'),
  ('ex-sha-003','Neck Rotation & Stretch','upper body','neck','mobility',1,ARRAY['bodyweight'],ARRAY['neck'],ARRAY['trapezius'],true,'Circle head smoothly. Keep body straight. Feel stretch through the neck. Tilt head slowly to each side. 10 circles.','Circle head smoothly; keep body straight; feel stretch in neck'),
  ('ex-sha-004','Shoulder Rotation','upper body','shoulders','mobility',1,ARRAY['bodyweight'],ARRAY['shoulders'],ARRAY['upper back'],true,'Roll shoulders slowly forward then back. Keep rest of body steady. Feel arm muscles engage. 10 each direction.','Roll shoulders slowly; keep body steady; feel arm muscles engage'),
  ('ex-sha-005','Arm Rotation (Windmill)','upper body','shoulders','mobility',1,ARRAY['bodyweight'],ARRAY['shoulders','arms'],ARRAY['chest'],true,'Windmill arms in full circles. Keep arms straight. Rotate with speed. 10 each direction.','Windmill arms; keep arms straight; rotate with speed'),
  -- Female Body Bible
  ('ex-wom-001','Hip Hinge (Mobility)','lower body','hamstrings','mobility',1,ARRAY['bodyweight'],ARRAY['hamstrings','glutes'],ARRAY['lower back'],true,'Stand feet shoulder-width. Slight knee bend. Push hips back while controlling upper body. 1 min of smooth repetitions.','Feet shoulder-width; slightly bend knees; push hips back; control upper body with hips'),
  ('ex-wom-002','Clock Lunge','lower body','quads','mobility',2,ARRAY['bodyweight'],ARRAY['quads','glutes','hamstrings'],ARRAY['hip flexors','adductors'],true,'Imagine a clock face. Step to each clock position: forward (12), side (3/9), back (6). Step as far out as possible. Keep body facing forward.','Imagine clock face; step to clock positions; step as far out as possible; keep body facing forward'),
  ('ex-wom-003','Bird Dog','core','lower back','mobility',1,ARRAY['bodyweight'],ARRAY['core','lower back'],ARRAY['glutes','shoulders'],true,'On all fours. Extend opposite arm and leg. Keep core tight. Distribute weight evenly. Hold 2-3 sec each rep.','On all fours; extend opposite hand and foot; keep core tight; distribute weight evenly'),
  ('ex-wom-004','Vertical Jump (Landing Practice)','lower body','quads','plyometrics',2,ARRAY['bodyweight'],ARRAY['quads','glutes'],ARRAY['calves','core'],false,'Start in squat position. Drive up and jump. Land softly with focus on knee alignment. Build to adding height progressively.','Start squat position; drive up and jump; land softly; focus on knee alignment'),
  ('ex-wom-005','Balance Training (Single Leg)','lower body','balance','mobility',1,ARRAY['bodyweight'],ARRAY['core','ankle stabilisers'],ARRAY['glutes','hip stabilisers'],true,'Balance on one foot. Try closing eyes for extra challenge. Stand on uneven surfaces if available. Add dynamic movements.','Balance on one foot; try closing eyes; stand on uneven surfaces; integrate dynamic movements'),
  -- Maffetone / Heart Rate Training
  ('ex-end-001','Easy Aerobic Walk','lower body','cardiovascular','cardio',1,ARRAY['bodyweight'],ARRAY['cardiovascular','legs'],ARRAY['core'],true,'Maintain easy pace at heart rate 70-75% max. Focus on posture. Keep breathing steady. Relax shoulders.','Maintain easy pace; focus on posture; keep breathing steady; relax shoulders'),
  ('ex-end-002','Stationary Bike (Aerobic)','lower body','cardiovascular','cardio',1,ARRAY['stationary bike'],ARRAY['cardiovascular','legs'],ARRAY['core'],true,'Keep resistance moderate. Focus on smooth pedaling. Keep back straight. Breathe steadily. 45 min Zone 2.','Keep resistance moderate; smooth pedaling; back straight; breathe steadily; stay in Zone 2'),
  ('ex-end-003','Full Body Circuit (Light)','full body','cardiovascular','strength',1,ARRAY['dumbbells'],ARRAY['full body'],ARRAY[],true,'Maintain good form throughout. Use controlled movements. Breathe out during exertion. Focus on range of motion.','Maintain good form; controlled movements; breathe out on exertion; focus on range of motion'),
  ('ex-end-004','Cruise Interval Run','full body','cardiovascular','cardio',3,ARRAY['bodyweight','treadmill'],ARRAY['cardiovascular'],ARRAY['legs'],false,'Zone 4 intensity (comfortably hard). 4-8 min intervals. Short recovery between. Consistent pacing is key.','Zone 4 effort; consistent pacing; short recovery; focus on form'),
  -- BBG Circuit exercises
  ('ex-bbg-001','Squat','lower body','quads','strength',1,ARRAY['bodyweight'],ARRAY['quads','glutes'],ARRAY['hamstrings','core'],true,'Feet shoulder-width. Sit back and down. Keep knees tracking toes. Press through heels to stand.','Feet shoulder-width; sit back and down; knees track toes; press through heels'),
  ('ex-bbg-002','Stationary Lunge','lower body','quads','strength',1,ARRAY['bodyweight'],ARRAY['quads','glutes','hamstrings'],ARRAY['calves','core'],true,'Step forward into split stance. Lower back knee toward floor. Keep front knee over ankle. Keep torso upright.','Front foot forward; lower back knee; front knee over ankle; torso upright'),
  ('ex-bbg-003','Skipping','full body','cardiovascular','cardio',1,ARRAY['jump rope'],ARRAY['cardiovascular','calves'],ARRAY['shoulders'],false,'Jump rope with light, quick bounces. Keep ankles, knees, hips slightly bent. Minimal foot contact time.','Light quick bounces; ankles knees hips bent; minimal foot contact'),
  ('ex-bbg-004','Knee Ups (High Knees)','full body','cardiovascular','cardio',1,ARRAY['bodyweight'],ARRAY['cardiovascular','core','hip flexors'],ARRAY['quads'],false,'Drive knees up toward chest alternately. Pump arms. Stay light on feet. Maintain quick pace.','Drive knees up to chest; pump arms; stay light on feet; quick pace'),
  ('ex-bbg-005','Walking Lunges','lower body','quads','strength',1,ARRAY['bodyweight'],ARRAY['quads','glutes','hamstrings'],ARRAY['calves','core'],true,'Step forward into lunge, then continue forward alternating legs. Keep torso upright. Knee does not pass toe.','Step forward; alternate legs; torso upright; knee behind toe'),
  ('ex-bbg-006','Sumo Squat','lower body','adductors','strength',1,ARRAY['bodyweight'],ARRAY['adductors','glutes','quads'],ARRAY['hamstrings'],true,'Wide stance, toes pointed out. Squat keeping chest up and knees pushing out over toes.','Wide stance; toes out; chest up; knees push out over toes'),
  ('ex-bbg-007','Step Ups','lower body','quads','strength',1,ARRAY['bodyweight','bench'],ARRAY['quads','glutes'],ARRAY['hamstrings'],true,'Use a sturdy surface. Step up fully, then step down with control. Alternate lead leg.','Sturdy surface; step up fully; step down with control; alternate lead leg'),
  ('ex-bbg-008','Mountain Climbers','full body','cardiovascular','cardio',1,ARRAY['bodyweight'],ARRAY['cardiovascular','core','shoulders'],ARRAY['quads','hip flexors'],false,'In plank position. Drive knees toward chest alternately as fast as possible while maintaining stable hips.','Plank position; drive knees to chest; alternate quickly; keep hips stable'),
  ('ex-bbg-009','Push Ups (On Knees)','upper body','chest','strength',1,ARRAY['bodyweight'],ARRAY['chest','triceps','shoulders'],ARRAY['core'],true,'Modified push-up from knees. Straight line from knees to shoulders. Lower chest to floor and press up.','Knees on floor; straight line knees to shoulders; lower chest to floor; press up'),
  ('ex-bbg-010','Straight Leg Raises','core','lower abs','strength',1,ARRAY['bodyweight'],ARRAY['lower abs','hip flexors'],ARRAY['core'],true,'Lie flat. Keep legs straight. Raise legs to ceiling and lower with control. Keep lower back pressed to floor.','Lie flat; legs straight; raise to ceiling; lower with control; lower back to floor'),
  ('ex-bbg-011','Toe Taps','core','obliques','strength',1,ARRAY['bodyweight'],ARRAY['core','obliques'],ARRAY[],true,'Lie on back, knees bent. Alternate tapping toes to floor while keeping core engaged. Control the movement.','Lie on back; knees bent; tap toes alternately; keep core engaged'),
  ('ex-bbg-012','Straight Leg Sit Ups','core','abdominals','strength',1,ARRAY['bodyweight'],ARRAY['abdominals','core'],ARRAY['hip flexors'],true,'Lie flat with legs extended. Sit up fully. Lower with control. Focus on core contraction throughout.','Legs extended; sit up fully; lower with control; core contraction'),
  ('ex-bbg-013','Tricep Dips','upper body','triceps','strength',1,ARRAY['bench','bodyweight'],ARRAY['triceps'],ARRAY['chest','shoulders'],false,'Hands on bench behind you. Bend elbows to lower body. Press up. Keep elbows pointing back not flaring out.','Hands on bench; bend elbows to lower; press up; elbows point back'),
  ('ex-bbg-014','Ab Bikes (Bicycle Crunches)','core','obliques','strength',1,ARRAY['bodyweight'],ARRAY['obliques','core'],ARRAY['hip flexors'],true,'Lie on back, hands behind head. Bring opposite elbow to knee while extending the other leg. Alternate rhythmically.','Hands behind head; opposite elbow to knee; extend other leg; alternate rhythmically'),
  ('ex-bbg-015','Burpees','full body','cardiovascular','hiit',2,ARRAY['bodyweight'],ARRAY['cardiovascular','full body'],ARRAY['chest','shoulders','quads'],false,'Squat down, jump feet back to plank, do a push-up, jump feet to hands, jump up with arms overhead. Fast and continuous.','Squat down; jump to plank; push-up; jump to hands; jump up; continuous movement'),
  ('ex-bbg-016','Lay Down Push Ups','upper body','chest','strength',1,ARRAY['bodyweight'],ARRAY['chest','triceps','core'],ARRAY['shoulders'],true,'From plank, lower whole body to floor, then peel chest up and push back to plank. Core stays engaged throughout.','Lower whole body; peel chest up; push back to plank; core engaged')
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════
-- PROGRAM 1: Ashtanga Yoga Primary Series
-- ══════════════════════════════════════════════════════════════════
INSERT INTO training_programs (id, title, goal_category_id, duration_weeks, sessions_per_week, intensity_level, equipment_needed, tags, description, who_its_for, evidence_basis)
VALUES (
  'prog-ashtanga-yoga',
  'Ashtanga Yoga Primary Series',
  'gc-012',
  12, 5, 4,
  ARRAY['yoga mat'],
  ARRAY['yoga','ashtanga','flexibility','strength','mindfulness','full body'],
  'The classical Ashtanga Primary Series (Yoga Chikitsa) — a set sequence of 41 postures linked by breath and vinyasa. Builds heat, purifies the body, and develops strength, flexibility, and focus. 75-90 min per session.',
  'Yoga practitioners with some experience who want to follow the structured Ashtanga Primary Series tradition.',
  'Classical Ashtanga yoga methodology as taught by Sri K. Pattabhi Jois. Pranayama, drishti (gaze), and bandhas (energy locks) are the three pillars.'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO program_phases (id, program_id, phase_number, title, phase_goal, week_start, week_end, rpe_target_min, rpe_target_max)
VALUES ('ph-yog-1', 'prog-ashtanga-yoga', 1, 'Primary Series', 'Learn and practice the full Ashtanga Primary Series, building consistency, breath awareness, and progressive depth in each posture.', 1, 12, 3, 6)
ON CONFLICT (id) DO NOTHING;

INSERT INTO workout_templates (id, program_id, phase_id, day_label, title, estimated_duration_mins, session_number, session_type, warmup_notes, cooldown_notes, session_notes)
VALUES (
  'wt-yog-1a','prog-ashtanga-yoga','ph-yog-1','Daily Practice','Ashtanga Primary Series',90,1,'yoga',
  'Set intention. Ujjayi breath awareness 5 min.',
  'Savasana 5-10 min. Full release.',
  'Practice 5 days per week. Traditional rest on Saturdays and moon days. Surya Namaskara A × 5 then B × 5 as the warm-up before standing sequence.'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO workout_exercises (id, workout_id, exercise_id, order_index, sets, reps, rest_seconds, load_guidance, is_superset)
VALUES
  ('we-yog-001','wt-yog-1a','ex-yog-001',1,5,'1 full sequence',0,'Bodyweight',false),
  ('we-yog-002','wt-yog-1a','ex-yog-002',2,5,'1 full sequence',0,'Bodyweight',false),
  ('we-yog-003','wt-yog-1a','ex-yog-003',3,2,'5 breaths each side',0,'Bodyweight',false),
  ('we-yog-004','wt-yog-1a','ex-yog-004',4,2,'5 breaths each side',0,'Bodyweight',false),
  ('we-yog-005','wt-yog-1a','ex-yog-010',5,1,'5 breaths',0,'Bodyweight',false),
  ('we-yog-006','wt-yog-1a','ex-yog-006',6,1,'5 breaths',0,'Bodyweight',false),
  ('we-yog-007','wt-yog-1a','ex-yog-005',7,5,'5 breaths',0,'Bodyweight',false),
  ('we-yog-008','wt-yog-1a','ex-yog-008',8,1,'5 breaths',0,'Bodyweight',false),
  ('we-yog-009','wt-yog-1a','ex-yog-009',9,1,'15 breaths',0,'Bodyweight',false),
  ('we-yog-010','wt-yog-1a','ex-yog-007',10,1,'5-10 min',0,'Bodyweight',false)
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════
-- PROGRAM 2: Relax Into Stretch
-- ══════════════════════════════════════════════════════════════════
INSERT INTO training_programs (id, title, goal_category_id, duration_weeks, sessions_per_week, intensity_level, equipment_needed, tags, description, who_its_for, evidence_basis)
VALUES (
  'prog-relax-stretch',
  'Relax Into Stretch',
  'gc-003',
  4, 4, 2,
  ARRAY['pull-up bar','yoga mat'],
  ARRAY['flexibility','stretching','mobility','hamstrings','spine','hip flexors'],
  'A progressive flexibility program using Proprioceptive Neuromuscular Facilitation (PNF) and relaxation techniques to rapidly increase flexibility by teaching the nervous system to release muscular tension.',
  'Anyone who feels chronically tight and wants to make rapid flexibility gains. Safe for all fitness levels.',
  'Based on Pavel Tsatsouline''s "Relax into Stretch" methodology: PNF stretching, "pulling yourself into a stretch," and the use of muscle tension to deepen flexibility.'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO program_phases (id, program_id, phase_number, title, phase_goal, week_start, week_end, rpe_target_min, rpe_target_max)
VALUES ('ph-rts-1', 'prog-relax-stretch', 1, 'Progressive Flexibility', 'Gradually increase range of motion in the whole body using PNF and relaxation strategies.', 1, 4, 2, 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO workout_templates (id, program_id, phase_id, day_label, title, estimated_duration_mins, session_number, session_type, warmup_notes, session_notes)
VALUES (
  'wt-rts-1a','prog-relax-stretch','ph-rts-1','Daily','Full Body Mobility & Flexibility',30,1,'mobility',
  '5 min gentle walking or light movement',
  'Hold each stretch 1-2 min. Breathe into the tension. PNF: contract the muscle 3-5 sec, release and go deeper. 3 rounds per stretch.'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO workout_exercises (id, workout_id, exercise_id, order_index, sets, reps, rest_seconds, load_guidance, is_superset)
VALUES
  ('we-rts-001','wt-rts-1a','ex-mob-001',1,3,'Hold 1-2 min',30,'Bodyweight',false),
  ('we-rts-002','wt-rts-1a','ex-mob-002',2,3,'Hold 1-2 min',30,'Pull-up bar',false),
  ('we-rts-003','wt-rts-1a','ex-mob-003',3,3,'Hold 1-2 min',30,'Bodyweight',false),
  ('we-rts-004','wt-rts-1a','ex-mob-004',4,3,'Hold 1-2 min each side',30,'Bodyweight',false),
  ('we-rts-005','wt-rts-1a','ex-mob-005',5,3,'Hold 1-2 min each side',30,'Bodyweight',false),
  ('we-rts-006','wt-rts-1a','ex-mob-006',6,3,'Hold 1-2 min each side',30,'Bodyweight',false),
  ('we-rts-007','wt-rts-1a','ex-mob-007',7,3,'Hold 1-2 min each side',30,'Bodyweight',false)
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════
-- PROGRAM 3: Stretching Essentials with Hannah Corbin
-- ══════════════════════════════════════════════════════════════════
INSERT INTO training_programs (id, title, goal_category_id, duration_weeks, sessions_per_week, intensity_level, equipment_needed, tags, description, who_its_for, evidence_basis)
VALUES (
  'prog-stretching-essentials',
  'Stretching Essentials with Hannah Corbin',
  'gc-003',
  8, 4, 1,
  ARRAY['yoga mat'],
  ARRAY['stretching','mobility','neck','back','triceps','hips','flexibility'],
  'A card-deck style stretching program with playfully named exercises covering the whole body: neck, forearms, upper back, triceps, and beyond. Easy to slot into any routine as a warm-up or cool-down.',
  'Anyone who wants a fun, approachable stretching routine. Great as a warm-up, cool-down, or standalone flexibility session.',
  'Based on targeted mobility work for each body area using PNF and static stretch principles.'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO program_phases (id, program_id, phase_number, title, phase_goal, week_start, week_end, rpe_target_min, rpe_target_max)
VALUES ('ph-se-1', 'prog-stretching-essentials', 1, 'Full Body Stretch Program', 'Build daily flexibility through consistent, gentle stretching of every major muscle group.', 1, 8, 1, 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO workout_templates (id, program_id, phase_id, day_label, title, estimated_duration_mins, session_number, session_type, session_notes)
VALUES
  ('wt-se-neck','prog-stretching-essentials','ph-se-1','Day 1','Neck & Forearms',20,1,'mobility','Hold each stretch 30-60 sec. Breathe steadily. Never force range of motion.'),
  ('wt-se-upper','prog-stretching-essentials','ph-se-1','Day 2','Upper Back & Triceps',20,2,'mobility','Hold each stretch 30-60 sec. Move with breath.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO workout_exercises (id, workout_id, exercise_id, order_index, sets, reps, rest_seconds, load_guidance, is_superset)
VALUES
  ('we-se-001','wt-se-neck','ex-mob-008',1,1,'1 min',15,'Bodyweight',false),
  ('we-se-002','wt-se-neck','ex-mob-009',2,2,'30 sec each side',15,'Bodyweight',false),
  ('we-se-003','wt-se-neck','ex-mob-006',3,2,'30 sec each side',15,'Bodyweight',false),
  ('we-se-004','wt-se-upper','ex-mob-012',4,2,'30 sec each side',15,'Bodyweight',false),
  ('we-se-005','wt-se-upper','ex-mob-011',5,1,'1 min',15,'Bodyweight',false),
  ('we-se-006','wt-se-upper','ex-mob-010',6,2,'30 sec each side',15,'Bodyweight',false)
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════
-- PROGRAM 4: Somatic Exercise Program
-- ══════════════════════════════════════════════════════════════════
INSERT INTO training_programs (id, title, goal_category_id, duration_weeks, sessions_per_week, intensity_level, equipment_needed, tags, description, who_its_for, evidence_basis)
VALUES (
  'prog-somatic-exercise',
  'Somatic Exercise Program',
  'gc-006',
  8, 5, 1,
  ARRAY['yoga mat'],
  ARRAY['somatic','nervous system','mobility','back pain','gentle','mind-body'],
  'A gentle somatic movement program that uses slow, mindful movements to re-educate the nervous system and release chronic muscular tension. Focuses on the extensor and flexor muscles of the back and core.',
  'Anyone with chronic back tension, stress-related muscle holding, or anyone wanting to improve body awareness and nervous system regulation.',
  'Based on Thomas Hanna''s Somatic Education principles: pandiculation (voluntary muscle contraction + slow release) re-trains motor neurons to achieve lasting flexibility.'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO program_phases (id, program_id, phase_number, title, phase_goal, week_start, week_end, rpe_target_min, rpe_target_max)
VALUES ('ph-som-1', 'prog-somatic-exercise', 1, 'Somatic Re-Education', 'Release chronic muscular tension through slow, mindful pandiculation exercises. Build body awareness.', 1, 8, 1, 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO workout_templates (id, program_id, phase_id, day_label, title, estimated_duration_mins, session_number, session_type, warmup_notes, session_notes)
VALUES (
  'wt-som-1a','prog-somatic-exercise','ph-som-1','Daily','Somatic Movement Session',20,1,'somatic',
  'Lie quietly, breathe naturally for 2-3 min',
  'Move very slowly — slower than feels natural. Less is more. Focus entirely on the sensation of muscle contraction and release. Never push through pain.'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO workout_exercises (id, workout_id, exercise_id, order_index, sets, reps, rest_seconds, load_guidance, is_superset)
VALUES
  ('we-som-001','wt-som-1a','ex-som-001',1,1,'20',0,'Bodyweight',false),
  ('we-som-002','wt-som-1a','ex-som-002',2,3,'3',15,'Bodyweight',false),
  ('we-som-003','wt-som-1a','ex-som-003',3,6,'1',15,'Bodyweight',false)
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════
-- PROGRAM 5: The Shaolin Workout (28 Days)
-- ══════════════════════════════════════════════════════════════════
INSERT INTO training_programs (id, title, goal_category_id, duration_weeks, sessions_per_week, intensity_level, equipment_needed, tags, description, who_its_for, evidence_basis)
VALUES (
  'prog-shaolin-workout',
  'The Shaolin Workout — 28 Days',
  'gc-005',
  4, 7, 4,
  ARRAY['bodyweight'],
  ARRAY['shaolin','martial arts','mobility','body conditioning','calisthenics'],
  'A 28-day daily mobility and conditioning program based on Shaolin Temple training. Works through the body sequentially: wrists, ankles, neck, eyes, shoulders, arms, chest — building joint mobility, coordination, and body awareness.',
  'Anyone wanting daily movement practice grounded in Shaolin martial arts traditions. No equipment needed.',
  'Based on Sifu Shi Yan Lei''s "The Shaolin Workout" — 28 progressive daily sessions covering the full body.'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO program_phases (id, program_id, phase_number, title, phase_goal, week_start, week_end, rpe_target_min, rpe_target_max)
VALUES ('ph-sha-1', 'prog-shaolin-workout', 1, 'Shaolin 28-Day Daily Practice', 'Build daily movement practice through progressive Shaolin mobility and conditioning sessions.', 1, 4, 2, 5)
ON CONFLICT (id) DO NOTHING;

INSERT INTO workout_templates (id, program_id, phase_id, day_label, title, estimated_duration_mins, session_number, session_type, session_notes)
VALUES
  ('wt-sha-s1','prog-shaolin-workout','ph-sha-1','Session 1','Wrists & Ankles',12,1,'mobility','10 reps each movement. Slow and controlled. Stand tall throughout.'),
  ('wt-sha-s2','prog-shaolin-workout','ph-sha-1','Session 2','Neck & Eyes',12,2,'mobility','Smooth, controlled movements. Do not force range. Keep body still.'),
  ('wt-sha-s3','prog-shaolin-workout','ph-sha-1','Session 3','Shoulders, Arms & Chest',12,3,'mobility','Full range in each direction. Build momentum gradually.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO workout_exercises (id, workout_id, exercise_id, order_index, sets, reps, rest_seconds, load_guidance, is_superset)
VALUES
  ('we-sha-001','wt-sha-s1','ex-sha-001',1,1,'10',0,'Bodyweight',false),
  ('we-sha-002','wt-sha-s1','ex-sha-002',2,1,'10 each direction',0,'Bodyweight',false),
  ('we-sha-003','wt-sha-s2','ex-sha-003',1,1,'10 circles',0,'Bodyweight',false),
  ('we-sha-004','wt-sha-s3','ex-sha-004',1,1,'10 each direction',0,'Bodyweight',false),
  ('we-sha-005','wt-sha-s3','ex-sha-005',2,1,'10 each direction',0,'Bodyweight',false)
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════
-- PROGRAM 6: The Female Body Bible
-- ══════════════════════════════════════════════════════════════════
INSERT INTO training_programs (id, title, goal_category_id, duration_weeks, sessions_per_week, intensity_level, equipment_needed, tags, description, who_its_for, evidence_basis)
VALUES (
  'prog-female-body-bible',
  'The Female Body Bible',
  'gc-004',
  12, 4, 4,
  ARRAY['bodyweight'],
  ARRAY['womens fitness','injury prevention','warm-up','plyometrics','balance','mobility'],
  'A comprehensive female fitness program centred on building injury resilience, correct movement patterns, and athletic capacity. Features warm-up routines, plyometrics, and balance training tailored to female biomechanics.',
  'Women of all fitness levels who want to build resilience, reduce injury risk, and develop athletic movement quality.',
  'Based on Dr. Victoria Sekely''s Female Body Bible: addressing female-specific injury patterns, ACL prevention, and performance through evidence-based warm-up and movement practices.'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO program_phases (id, program_id, phase_number, title, phase_goal, week_start, week_end, rpe_target_min, rpe_target_max)
VALUES ('ph-fbb-1', 'prog-female-body-bible', 1, 'Injury-Resilience & Movement Foundation', 'Build the movement patterns, joint stability, and neuromuscular control needed to train safely and effectively.', 1, 12, 3, 6)
ON CONFLICT (id) DO NOTHING;

INSERT INTO workout_templates (id, program_id, phase_id, day_label, title, estimated_duration_mins, session_number, session_type, session_notes)
VALUES (
  'wt-fbb-wu','prog-female-body-bible','ph-fbb-1','Daily Warm-Up','Injury-Resilience Building Warm-Up',15,1,'mobility',
  '1 min per exercise. Move smoothly. Focus on quality of movement. Use this before every training session.'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO workout_exercises (id, workout_id, exercise_id, order_index, sets, reps, rest_seconds, load_guidance, is_superset)
VALUES
  ('we-fbb-001','wt-fbb-wu','ex-gen-001',1,1,'1 min',0,'Bodyweight',false),
  ('we-fbb-002','wt-fbb-wu','ex-wom-001',2,1,'1 min',0,'Bodyweight',false),
  ('we-fbb-003','wt-fbb-wu','ex-wom-002',3,1,'1 min',0,'Bodyweight',false),
  ('we-fbb-004','wt-fbb-wu','ex-wom-003',4,1,'1 min',0,'Bodyweight',false),
  ('we-fbb-005','wt-fbb-wu','ex-wom-004',5,1,'1 min',0,'Bodyweight',false),
  ('we-fbb-006','wt-fbb-wu','ex-wom-005',6,1,'1 min',0,'Bodyweight',false)
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════
-- PROGRAM 7: The Maffetone Method
-- ══════════════════════════════════════════════════════════════════
INSERT INTO training_programs (id, title, goal_category_id, duration_weeks, sessions_per_week, intensity_level, equipment_needed, tags, description, who_its_for, evidence_basis)
VALUES (
  'prog-maffetone',
  'The Maffetone Method Training Program',
  'gc-014',
  12, 5, 3,
  ARRAY['running shoes','stationary bike','heart rate monitor'],
  ARRAY['endurance','aerobic','zone 2','running','low intensity','fat adaptation'],
  'A 12-week aerobic base-building program using the Maffetone 180 Formula heart rate method. All training is kept at or below the Maximum Aerobic Heart Rate (MAHR = 180 - age). Develops aerobic efficiency and fat adaptation.',
  'Runners and endurance athletes who want to build a strong aerobic base or recover from overtraining syndrome.',
  'Based on Dr. Philip Maffetone''s 180 Formula: training at 180 minus your age in BPM maximises aerobic system development while minimising cortisol and overtraining risk.'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO program_phases (id, program_id, phase_number, title, phase_goal, week_start, week_end, rpe_target_min, rpe_target_max)
VALUES ('ph-maff-1', 'prog-maffetone', 1, 'Maffetone Base Building', 'Build aerobic base at 180-minus-age heart rate. All sessions stay below MAHR. Develop fat adaptation and aerobic efficiency.', 1, 12, 3, 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO workout_templates (id, program_id, phase_id, day_label, title, estimated_duration_mins, session_number, session_type, warmup_notes, session_notes)
VALUES
  ('wt-maff-walk','prog-maffetone','ph-maff-1','Day 1','Easy Aerobic Walk',30,1,'cardio','5 min very easy warm-up walk','Keep heart rate at or below 180 - your age (MAHR). Conversational pace. If HR rises above MAHR, slow down or walk.'),
  ('wt-maff-bike','prog-maffetone','ph-maff-1','Day 2','Stationary Aerobic Ride',45,2,'cardio','5 min easy pedaling','Moderate resistance. Keep HR at MAHR. Smooth pedaling technique. Zone 2 the whole session.'),
  ('wt-maff-circuit','prog-maffetone','ph-maff-1','Day 3','Light Full-Body Circuit',30,3,'strength','5 min easy cardio warm-up','Light weights only. HR must stay below MAHR. 3 sets of 10-15 per exercise.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO workout_exercises (id, workout_id, exercise_id, order_index, sets, reps, rest_seconds, load_guidance, is_superset)
VALUES
  ('we-maff-001','wt-maff-walk','ex-end-001',1,1,'30 min',0,'Bodyweight — HR monitor required',false),
  ('we-maff-002','wt-maff-bike','ex-end-002',1,1,'45 min',0,'Moderate resistance',false),
  ('we-maff-003','wt-maff-circuit','ex-end-003',1,3,'10-15',60,'Light — below MAHR',false)
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════
-- PROGRAM 8: Total Heart Rate Training
-- ══════════════════════════════════════════════════════════════════
INSERT INTO training_programs (id, title, goal_category_id, duration_weeks, sessions_per_week, intensity_level, equipment_needed, tags, description, who_its_for, evidence_basis)
VALUES (
  'prog-total-heart-rate',
  'Total Heart Rate Training',
  'gc-014',
  24, 4, 5,
  ARRAY['heart rate monitor','running shoes','bike'],
  ARRAY['endurance','heart rate zones','periodisation','running','cycling','triathlon'],
  'A complete periodised training system structured across four phases: Preparation, Base, Build, Peak, and Race. All training intensity is prescribed using heart rate zones rather than pace, making it adaptable to any endurance sport.',
  'Endurance athletes (runners, cyclists, triathletes) who want a heart rate-based periodised training system from preparation through to race day.',
  'Based on Joe Friel''s "Total Heart Rate Training" periodisation model using HR zones 1-5 for structured progressive training.'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO program_phases (id, program_id, phase_number, title, phase_goal, week_start, week_end, rpe_target_min, rpe_target_max)
VALUES
  ('ph-thr-1','prog-total-heart-rate',1,'Preparation','Develop basic aerobic skill and technique. Focus on form at low intensity. 2-6 weeks.',1,4,3,4),
  ('ph-thr-2','prog-total-heart-rate',2,'Base Training','Build aerobic threshold. Long slow sessions at Zone 2. 9-12 weeks.',5,16,3,5),
  ('ph-thr-3','prog-total-heart-rate',3,'Build Training','Add cruise intervals at Zone 4 lactate threshold. 6-8 weeks.',17,22,5,7),
  ('ph-thr-4','prog-total-heart-rate',4,'Peak & Race','Short race simulations and race-pace rehearsal. 2-3 weeks taper.',23,24,6,8)
ON CONFLICT (id) DO NOTHING;

INSERT INTO workout_templates (id, program_id, phase_id, day_label, title, estimated_duration_mins, session_number, session_type, session_notes)
VALUES
  ('wt-thr-prep','prog-total-heart-rate','ph-thr-1','Prep','Basic Skill Development',60,1,'cardio','Focus on technique. Perform slowly. Maintain form. HR Zone 1-2.'),
  ('wt-thr-base','prog-total-heart-rate','ph-thr-2','Base','Aerobic Threshold Session',120,2,'cardio','Steady Zone 2 effort. HR 65-75% max. Long, slow, and consistent. Monitor HR closely.'),
  ('wt-thr-build','prog-total-heart-rate','ph-thr-3','Build','Cruise Intervals',60,3,'cardio','4-8 × 8 min Zone 4. Short 2-3 min Zone 2 recovery. Consistent pacing throughout.'),
  ('wt-thr-race','prog-total-heart-rate','ph-thr-4','Race','Race Pace Rehearsal',45,4,'cardio','Simulate race conditions. Multiple short intervals at race pace. Full recovery between. Race day gear.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO workout_exercises (id, workout_id, exercise_id, order_index, sets, reps, rest_seconds, load_guidance, is_superset)
VALUES
  ('we-thr-001','wt-thr-prep','ex-end-001',1,1,'60 min',0,'Zone 1-2 HR',false),
  ('we-thr-002','wt-thr-base','ex-end-001',1,1,'90-120 min',0,'Zone 2 HR',false),
  ('we-thr-003','wt-thr-build','ex-end-004',1,6,'8 min per interval',120,'Zone 4 HR — comfortably hard',false),
  ('we-thr-004','wt-thr-race','ex-end-004',1,4,'Race-specific intervals',180,'Race pace effort',false)
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════
-- PROGRAM 9: 28-Minute Women's HIIT Circuit — Level 1 (Beginner)
-- ══════════════════════════════════════════════════════════════════
INSERT INTO training_programs (id, title, goal_category_id, duration_weeks, sessions_per_week, intensity_level, equipment_needed, tags, description, who_its_for, evidence_basis)
VALUES (
  'prog-bbg-1',
  '28-Minute Women''s HIIT Circuit — Level 1 (Beginner)',
  'gc-002',
  14, 3, 6,
  ARRAY['bodyweight','bench','skipping rope','medicine ball'],
  ARRAY['hiit','circuit','women','fat loss','beginners','legs','arms','abs'],
  'AMRAP-style 28-minute circuits (4 × 7 min) done 3 days per week: Legs & Cardio on Monday, Arms & Abs on Wednesday, optional Full Body on Friday. Starts with a 2-week pre-training block before the 12-week main program. Each 7-minute circuit is repeated twice with short rest between rounds.',
  'Women new to high-intensity training who want a structured circuit program they can do at home or in a gym with minimal equipment.',
  'High-intensity resistance training (HIRT) with circuit format for cardiovascular and strength adaptation. Each circuit is repeated twice in AMRAP format within a 7-minute window.'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO program_phases (id, program_id, phase_number, title, phase_goal, week_start, week_end, rpe_target_min, rpe_target_max)
VALUES
  ('ph-bbg1-pre','prog-bbg-1',1,'Pre-Training (Weeks Pre-1 & Pre-2)','Introduce AMRAP circuit format with bodyweight-only movements before the main program begins.',1,2,5,7),
  ('ph-bbg1-main','prog-bbg-1',2,'Main Program (Weeks 1-12)','Progress through 12 weeks of increasing intensity circuits. Exercises become more challenging each 4-week block.',3,14,6,9)
ON CONFLICT (id) DO NOTHING;

INSERT INTO workout_templates (id, program_id, phase_id, day_label, title, estimated_duration_mins, session_number, session_type, warmup_notes, cooldown_notes, session_notes)
VALUES
  ('wt-bbg1-legs','prog-bbg-1','ph-bbg1-pre','Monday','Legs & Cardio (Pre-Training)',30,1,'hiit','5 min warm-up walk or light jog','Cool down + stretch 5-10 min','AMRAP format: 7 min per circuit × 2 rounds. Alternate C1→C2→C1→C2. Rest 30 sec between circuits; 90 sec before repeating. Circuit 1: Squats 15 / Stationary Lunges 24 / Skipping 50 / Knee Ups 24. Circuit 2: Walking Lunges 24 / Sumo Squats 15 / Step Ups 24 / Mountain Climbers 50.'),
  ('wt-bbg1-arms','prog-bbg-1','ph-bbg1-pre','Wednesday','Arms & Abs (Pre-Training)',30,2,'hiit','5 min warm-up','Cool down + stretch 5-10 min','AMRAP format: 7 min per circuit × 2 rounds. Circuit 1: Push Ups 15 / Straight Leg Raises 15 / Toe Taps 15 / Plank 30s. Circuit 2: Lay Down Push Ups 15 / Straight Leg Sit Ups 15 / Tricep Dips 15 / Ab Bikes 30.'),
  ('wt-bbg1-full','prog-bbg-1','ph-bbg1-pre','Friday','Full Body Optional (Pre-Training)',30,3,'hiit','5 min warm-up','Cool down + stretch','AMRAP format: 7 min per circuit × 2 rounds. Circuit 1: Squats 20 / Burpees 10 / Tricep Dips 20 / Straight Leg Sit Ups 15. Circuit 2: Toe Taps 20 / Lay Down Push Ups 15 / Step Ups 24 / Mountain Climbers 50.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO workout_exercises (id, workout_id, exercise_id, order_index, sets, reps, rest_seconds, load_guidance, is_superset, superset_group)
VALUES
  -- Legs & Cardio session
  ('we-bbg1-001','wt-bbg1-legs','ex-bbg-001',1,2,'15',30,'Bodyweight',true,'Circuit 1'),
  ('we-bbg1-002','wt-bbg1-legs','ex-bbg-002',2,2,'24 (12/side)',30,'Bodyweight',true,'Circuit 1'),
  ('we-bbg1-003','wt-bbg1-legs','ex-bbg-003',3,2,'50',30,'Skipping rope',true,'Circuit 1'),
  ('we-bbg1-004','wt-bbg1-legs','ex-bbg-004',4,2,'24 (12/side)',90,'Bodyweight',true,'Circuit 1'),
  ('we-bbg1-005','wt-bbg1-legs','ex-bbg-005',5,2,'24 (12/side)',30,'Bodyweight',true,'Circuit 2'),
  ('we-bbg1-006','wt-bbg1-legs','ex-bbg-006',6,2,'15',30,'Bodyweight',true,'Circuit 2'),
  ('we-bbg1-007','wt-bbg1-legs','ex-bbg-007',7,2,'24 (12/side)',30,'Bodyweight',true,'Circuit 2'),
  ('we-bbg1-008','wt-bbg1-legs','ex-bbg-008',8,2,'50 (25/side)',90,'Bodyweight',true,'Circuit 2'),
  -- Arms & Abs session
  ('we-bbg1-009','wt-bbg1-arms','ex-bbg-009',1,2,'15',30,'Bodyweight',true,'Circuit 1'),
  ('we-bbg1-010','wt-bbg1-arms','ex-bbg-010',2,2,'15',30,'Bodyweight',true,'Circuit 1'),
  ('we-bbg1-011','wt-bbg1-arms','ex-bbg-011',3,2,'15',30,'Bodyweight',true,'Circuit 1'),
  ('we-bbg1-012','wt-bbg1-arms','ex-fs-011',4,2,'30 sec',90,'Bodyweight',true,'Circuit 1'),
  ('we-bbg1-013','wt-bbg1-arms','ex-bbg-016',5,2,'15',30,'Bodyweight',true,'Circuit 2'),
  ('we-bbg1-014','wt-bbg1-arms','ex-bbg-012',6,2,'15',30,'Bodyweight',true,'Circuit 2'),
  ('we-bbg1-015','wt-bbg1-arms','ex-bbg-013',7,2,'15',30,'Bench',true,'Circuit 2'),
  ('we-bbg1-016','wt-bbg1-arms','ex-bbg-014',8,2,'30 (15/side)',90,'Bodyweight',true,'Circuit 2'),
  -- Full Body session
  ('we-bbg1-017','wt-bbg1-full','ex-bbg-001',1,2,'20',30,'Bodyweight',true,'Circuit 1'),
  ('we-bbg1-018','wt-bbg1-full','ex-bbg-015',2,2,'10',30,'Bodyweight',true,'Circuit 1'),
  ('we-bbg1-019','wt-bbg1-full','ex-bbg-013',3,2,'20',30,'Bench',true,'Circuit 1'),
  ('we-bbg1-020','wt-bbg1-full','ex-bbg-012',4,2,'15',90,'Bodyweight',true,'Circuit 1'),
  ('we-bbg1-021','wt-bbg1-full','ex-bbg-011',5,2,'20',30,'Bodyweight',true,'Circuit 2'),
  ('we-bbg1-022','wt-bbg1-full','ex-bbg-016',6,2,'15',30,'Bodyweight',true,'Circuit 2'),
  ('we-bbg1-023','wt-bbg1-full','ex-bbg-007',7,2,'24 (12/side)',30,'Bodyweight',true,'Circuit 2'),
  ('we-bbg1-024','wt-bbg1-full','ex-bbg-008',8,2,'50 (25/side)',90,'Bodyweight',true,'Circuit 2')
ON CONFLICT (id) DO NOTHING;
