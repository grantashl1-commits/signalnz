-- ══════════════════════════════════════════════════════════════════
-- Migration 7: 28-Minute Women's HIIT Circuit — Level 2 (Intermediate)
-- Program ID: prog-hiit-circuit-2
-- Covers 12 weeks (equivalent to Weeks 13-24) across 2 blocks
-- No brand names — descriptive naming only
-- ══════════════════════════════════════════════════════════════════

-- 26 new exercises (ex-b2-001 to ex-b2-026)
INSERT INTO exercises (id, name, body_region, primary_muscle_group, movement_pattern, difficulty_level, equipment_needed, primary_muscles, secondary_muscles, is_compound, coaching_cues, form_cues_short)
VALUES
  ('ex-b2-001','Broad Jumps','lower body','quads','plyometric',2,ARRAY['bodyweight'],ARRAY['quads','glutes','calves'],ARRAY['hamstrings','core'],true,'Jump forward as far as possible with both feet. Swing arms back then forward for momentum. Land softly in a shallow squat. Immediately reset and repeat.','Jump forward; swing arms; land softly; reset into squat'),
  ('ex-b2-002','Jump Squats','lower body','quads','plyometric',2,ARRAY['bodyweight'],ARRAY['quads','glutes'],ARRAY['calves','core'],true,'Squat to parallel, then explode upward. Land softly through toes-to-heel. Absorb landing by returning directly to squat position.','Squat to parallel; explode up; land softly; absorb into next squat'),
  ('ex-b2-003','Barbell Close Squat','lower body','quads','strength',2,ARRAY['barbell'],ARRAY['quads','glutes'],ARRAY['hamstrings','core'],true,'Barbell on upper back. Feet hip-width or narrower. Squat deep with knees tracking over toes. Drive through heels to stand.','Hip-width or narrower; squat deep; knees track toes; drive through heels'),
  ('ex-b2-004','Side Raises','upper body','shoulders','strength',1,ARRAY['dumbbells'],ARRAY['lateral deltoids'],ARRAY['traps'],false,'Hold dumbbells at sides with slight elbow bend. Raise arms laterally to shoulder height. Control the lowering. Do not shrug.','Arms at sides; raise laterally to shoulder height; control lowering; no shrug'),
  ('ex-b2-005','Weighted Bent Leg Jackknifes','core','lower abs','strength',2,ARRAY['dumbbells'],ARRAY['lower abs','hip flexors'],ARRAY['core'],true,'Hold a dumbbell or plate between feet. Lie flat, then simultaneously crunch knees to chest and lift shoulders. Lower under control.','Weight between feet; crunch knees to chest; lift shoulders; lower with control'),
  ('ex-b2-006','Snap Jumps','full body','cardiovascular','plyometric',2,ARRAY['bodyweight'],ARRAY['cardiovascular','core'],ARRAY['quads','shoulders'],false,'From standing, jump feet back to plank position. Then snap feet forward to hands. Keep hips low in plank. Continuous quick movement.','Jump to plank; snap feet to hands; hips low; continuous quick movement'),
  ('ex-b2-007','X Mountain Climbers','full body','cardiovascular','cardio',2,ARRAY['bodyweight'],ARRAY['obliques','core','cardiovascular'],ARRAY['quads','shoulders'],false,'In plank position. Drive right knee toward left elbow and left knee toward right elbow alternately. Keep hips low and square.','Plank position; drive knee to opposite elbow; alternate; hips low and square'),
  ('ex-b2-008','Side Crunches','core','obliques','strength',1,ARRAY['bodyweight'],ARRAY['obliques'],ARRAY['core'],false,'Lie on side or on back with arms extended. Crunch upward toward hip or ceiling. Focus on oblique contraction each rep. Control the lowering.','Crunch toward hip or ceiling; focus oblique contraction; control lowering'),
  ('ex-b2-009','Straight Leg Sit Up with Twist','core','abdominals','strength',2,ARRAY['bodyweight'],ARRAY['abdominals','obliques'],ARRAY['hip flexors'],true,'Legs extended on floor. Sit up fully and rotate torso to one side at the top. Alternate sides each rep. Keep core engaged throughout.','Legs extended; sit up fully; rotate to alternate sides; core engaged'),
  ('ex-b2-010','Medicine Ball Squat & Press','full body','quads','strength',2,ARRAY['medicine ball'],ARRAY['quads','glutes','shoulders'],ARRAY['core','triceps'],true,'Hold medicine ball at chest. Squat deep. As you stand explosively, press ball directly overhead. Control return to chest as you descend.','Ball at chest; squat deep; press overhead as you stand; control return on descent'),
  ('ex-b2-011','Barbell Squat Pulse','lower body','quads','strength',2,ARRAY['barbell'],ARRAY['quads','glutes'],ARRAY['hamstrings','core'],true,'Barbell on upper back. Squat to parallel and hold. Pulse up and down by a few centimetres. Do not fully stand. Maintain constant tension.','Hold at parallel; pulse a few cm up and down; no full stand; constant tension'),
  ('ex-b2-012','Weighted Burpees','full body','cardiovascular','hiit',3,ARRAY['dumbbells'],ARRAY['cardiovascular','full body'],ARRAY['chest','shoulders','quads'],false,'Hold light dumbbells throughout. Squat, jump feet to plank, perform push-up, jump feet to hands, then stand and curl or press overhead. Continuous.','Hold dumbbells; squat to plank; push-up; jump up; curl or press; continuous'),
  ('ex-b2-013','Jump Lunges','lower body','quads','plyometric',2,ARRAY['bodyweight'],ARRAY['quads','glutes'],ARRAY['hamstrings','calves'],true,'Start in lunge position. Jump and switch legs in the air. Land softly in opposite lunge. Alternate each rep. Absorb landing gently.','Start in lunge; jump and switch; land softly in opposite lunge; alternate'),
  ('ex-b2-014','In and Out Jump Squats','lower body','quads','plyometric',2,ARRAY['bodyweight'],ARRAY['quads','glutes','adductors'],ARRAY['calves','core'],false,'Alternate between wide-stance jump squats (out) and narrow-stance jump squats (in). Land softly each time. Count in and out as separate reps.','Alternate wide and narrow stance; jump between; land softly; count each transition'),
  ('ex-b2-015','Lay Down Burpees','full body','cardiovascular','hiit',3,ARRAY['dumbbells'],ARRAY['cardiovascular','full body'],ARRAY['chest','core','quads'],false,'Full burpee where you lie completely flat on the floor face down. Press to plank, jump feet to hands, then jump up. Add light dumbbell if used.','Lie completely flat face down; press to plank; jump feet to hands; jump up'),
  ('ex-b2-016','Drop Push Ups','upper body','chest','strength',2,ARRAY['bodyweight'],ARRAY['chest','triceps','core'],ARRAY['shoulders'],true,'Start in push-up position with hands on an elevated surface. Drop hands to ground level, lower chest to floor, push up, then step or jump hands back up.','Hands elevated; drop to floor; push up; return hands to elevated; controlled'),
  ('ex-b2-017','Commandos','core','shoulders','strength',2,ARRAY['bodyweight'],ARRAY['shoulders','core','triceps'],ARRAY['chest','obliques'],false,'Start in high plank. Lower one arm to forearm, then the other. Return to high plank one arm at a time. Alternate which arm leads. Keep hips square.','High plank; lower to forearms one arm at a time; return; alternate lead arm; hips square'),
  ('ex-b2-018','Dumbbell Squat & Press','full body','quads','strength',2,ARRAY['dumbbells'],ARRAY['quads','glutes','shoulders'],ARRAY['core','triceps'],true,'Hold dumbbells at shoulder height. Squat deep. As you stand, press dumbbells directly overhead. Lower dumbbells as you descend into next squat.','Dumbbells at shoulders; squat deep; press overhead as you stand; lower on descent'),
  ('ex-b2-019','Medicine Ball Push Ups','upper body','chest','strength',2,ARRAY['medicine ball'],ARRAY['chest','triceps','core'],ARRAY['shoulders'],true,'One hand on medicine ball, one on floor. Perform push-up. Roll ball to other hand and repeat. Core tight to prevent rolling. Can use both hands on ball.','One hand on ball; push-up; roll to other hand; core tight; controlled movement'),
  ('ex-b2-020','Single Arm Squat & Press','full body','quads','strength',2,ARRAY['dumbbells'],ARRAY['quads','glutes','shoulders'],ARRAY['core','obliques'],true,'Hold one dumbbell at shoulder. Squat deep. Press overhead on the way up. Engage obliques to prevent lateral lean. Alternate arms each set.','One dumbbell at shoulder; squat; press overhead as you stand; obliques engaged; alternate arms'),
  ('ex-b2-021','Decline Push Ups','upper body','chest','strength',2,ARRAY['bodyweight','bench'],ARRAY['upper chest','shoulders','triceps'],ARRAY['core'],true,'Feet elevated on bench behind you. Hands on floor. Perform push-up as normal. Greater upper chest activation than flat push-ups.','Feet on bench; hands on floor; lower chest; press up; upper chest focus'),
  ('ex-b2-022','Weighted Sit Ups','core','abdominals','strength',1,ARRAY['weight plate'],ARRAY['abdominals','core'],ARRAY['hip flexors'],true,'Hold weight plate at chest or lightly behind head. Feet flat. Sit up fully. Lower with control. Do not yank the neck.','Weight at chest; sit up fully; lower with control; no neck yanking'),
  ('ex-b2-023','Weighted Russian Twist','core','obliques','strength',1,ARRAY['weight plate','dumbbells'],ARRAY['obliques','core'],ARRAY['hip flexors'],false,'Sit with feet off floor, knees bent at 90°. Hold weight at chest. Rotate torso side to side, tapping weight toward floor each side. Control the rotation.','Feet off floor; weight at chest; rotate side to side; tap toward floor; control rotation'),
  ('ex-b2-024','Split Jumps','lower body','quads','plyometric',2,ARRAY['bodyweight'],ARRAY['quads','glutes'],ARRAY['calves','core'],true,'Start with feet together. Jump feet wide apart then back together in a continuous rhythm. Arms assist the movement. Count out and in as separate reps.','Feet together; jump wide apart then back together; continuous; arms assist; count each'),
  ('ex-b2-025','Side Taps','core','obliques','strength',1,ARRAY['bodyweight'],ARRAY['obliques','core'],ARRAY[],false,'Lie on back, knees bent, arms at sides. Crunch sideways, reaching one hand toward the heel on that side. Alternate sides. Lower back stays on floor.','Lie on back; reach hand toward heel; crunch sideways; alternate; lower back stays down'),
  ('ex-b2-026','Push Ups','upper body','chest','strength',1,ARRAY['bodyweight'],ARRAY['chest','triceps','shoulders'],ARRAY['core'],true,'Hands shoulder-width, body in a straight line from head to heels. Lower chest to floor. Press up strongly. Core tight throughout. Full range of motion.','Shoulder-width hands; straight body line; lower chest to floor; press up; core tight')
ON CONFLICT (id) DO NOTHING;

-- Program
INSERT INTO training_programs (id, title, goal_category_id, duration_weeks, sessions_per_week, intensity_level, equipment_needed, tags, description, who_its_for, evidence_basis)
VALUES (
  'prog-hiit-circuit-2',
  '28-Minute Women''s HIIT Circuit — Level 2 (Intermediate)',
  'gc-002',
  12, 3, 7,
  ARRAY['bodyweight','dumbbells','barbell','bench','skipping rope','medicine ball','kettlebell'],
  ARRAY['hiit','circuit','women','fat loss','intermediate','plyometric','weighted','legs','arms','abs'],
  'AMRAP-style 28-minute circuits (4 × 7 min) done 3 days per week: Legs on Monday, Arms on Wednesday, Abs on Friday. Spans two 6-week blocks that progressively increase in complexity and load — introducing barbell movements, kettlebells, and weighted plyometrics. Each 7-minute circuit is performed twice with short rest between rounds. Designed to follow a beginner HIIT circuit program.',
  'Women who have completed a beginner circuit program and are ready to increase intensity with weighted equipment, barbell movements, and more complex plyometric exercises.',
  'High-intensity resistance training (HIRT) with circuit format combining plyometric and weighted resistance exercises. Progressive overload applied through increased reps, loads, and movement complexity across blocks.'
)
ON CONFLICT (id) DO NOTHING;

-- Phases
INSERT INTO program_phases (id, program_id, phase_number, title, phase_goal, week_start, week_end, rpe_target_min, rpe_target_max)
VALUES
  ('ph-hiit2-1','prog-hiit-circuit-2',1,'Block 1 (Weeks 1-6)','Introduce weighted circuits with barbells and dumbbells. Build capacity with moderate plyometrics. Each circuit is AMRAP 7 min × 2.',1,6,6,8),
  ('ph-hiit2-2','prog-hiit-circuit-2',2,'Block 2 (Weeks 7-12)','Advanced plyometric and weighted circuits. Higher rep counts and complex movement combinations. Peak program intensity.',7,12,7,9)
ON CONFLICT (id) DO NOTHING;

-- Workout Templates
INSERT INTO workout_templates (id, program_id, phase_id, day_label, title, estimated_duration_mins, session_number, session_type, warmup_notes, cooldown_notes, session_notes)
VALUES
  ('wt-hiit2-b1-legs','prog-hiit-circuit-2','ph-hiit2-1','Monday','Legs & Cardio — Block 1',30,1,'hiit','5 min warm-up walk or light jog','Cool down + stretch 5-10 min','AMRAP format: 7 min per circuit × 2 rounds. C1→C2→C1→C2. Rest 30 sec between exercises; 90 sec before repeating a circuit. Circuit 1: Broad Jumps 15 / Jump Squats 15 / Weighted Walking Lunges 30 / Skipping 50. Circuit 2: Barbell Close Squat 15 / Weighted Step Ups 15/side / Weighted Stationary Lunges 30 / Skipping 100. Progress load by 2.5-5 kg every 2 weeks.'),
  ('wt-hiit2-b1-arms','prog-hiit-circuit-2','ph-hiit2-1','Wednesday','Arms & Core — Block 1',30,2,'hiit','5 min warm-up walk or jog','Cool down + stretch 5-10 min','AMRAP format: 7 min per circuit × 2 rounds. Circuit 1: Push Ups 15 / Side Raises 15 / Tricep Dips 15 / Weighted Bent Leg Jackknifes 20. Circuit 2: Mountain Climbers 30 / Medicine Ball Squat & Press 15 / Skipping 50 / Lay Down Push Ups 15.'),
  ('wt-hiit2-b1-abs','prog-hiit-circuit-2','ph-hiit2-1','Friday','Abs & Cardio — Block 1',30,3,'hiit','5 min warm-up walk or jog','Cool down + stretch 5-10 min','AMRAP format: 7 min per circuit × 2 rounds. Circuit 1: Ab Bikes 40 / Snap Jumps 20 / X Mountain Climbers 40 / Weighted Bent Leg Jackknifes 20. Circuit 2: Side Crunches 30 / Skipping 50 / Weighted Toe Taps 30 / Straight Leg Sit Up + Twist 30.'),
  ('wt-hiit2-b2-legs','prog-hiit-circuit-2','ph-hiit2-2','Monday','Legs & Cardio — Block 2',30,4,'hiit','5 min warm-up walk or light jog','Cool down + stretch 5-10 min','AMRAP format: 7 min per circuit × 2 rounds. Higher intensity — fewer full rounds completed per circuit is normal. Circuit 1: Barbell Squat Pulse 30 / Jump Squats 15 / Weighted Burpees 15 / Jump Lunges 30. Circuit 2: Medicine Ball Squat & Press 15 / Broad Jumps 15 / In and Out Jump Squats 30 / Lay Down Burpees 15.'),
  ('wt-hiit2-b2-arms','prog-hiit-circuit-2','ph-hiit2-2','Wednesday','Arms & Core — Block 2',30,5,'hiit','5 min warm-up walk or jog','Cool down + stretch 5-10 min','AMRAP format: 7 min per circuit × 2 rounds. Circuit 1: Drop Push Ups 15 / Commandos 20 / Dumbbell Squat & Press 15 / Tricep Dips 10/side. Circuit 2: Medicine Ball Push Ups 20 / Snap Jumps 20 / Single Arm Squat & Press 20 (10/side) / Decline Push Ups 10.'),
  ('wt-hiit2-b2-abs','prog-hiit-circuit-2','ph-hiit2-2','Friday','Abs & Cardio — Block 2',30,6,'hiit','5 min warm-up walk or jog','Cool down + stretch 5-10 min','AMRAP format: 7 min per circuit × 2 rounds. Circuit 1: Weighted Sit Up 20 / Side Crunches On Back 40 / Weighted Russian Twist 40 / Split Jumps 40. Circuit 2: Side Crunches On Side 40 / Side Taps 40 / Snap Jumps 20 / Mountain Climbers 60.')
ON CONFLICT (id) DO NOTHING;

-- Workout Exercises
-- Each exercise row: sets=2 (circuit performed twice in AMRAP format)
-- Rest 30 sec between exercises; 90 sec at end of circuit before repeating
INSERT INTO workout_exercises (id, workout_id, exercise_id, order_index, sets, reps, rest_seconds, load_guidance, is_superset, superset_group)
VALUES
  -- Block 1 Legs (Monday)
  ('we-hiit2-001','wt-hiit2-b1-legs','ex-b2-001',1,2,'15',30,'Bodyweight',true,'Circuit 1'),
  ('we-hiit2-002','wt-hiit2-b1-legs','ex-b2-002',2,2,'15',30,'Bodyweight',true,'Circuit 1'),
  ('we-hiit2-003','wt-hiit2-b1-legs','ex-bbg-005',3,2,'30 (15/side)',30,'5-10 kg dumbbells',true,'Circuit 1'),
  ('we-hiit2-004','wt-hiit2-b1-legs','ex-bbg-003',4,2,'50',90,'Skipping rope',true,'Circuit 1'),
  ('we-hiit2-005','wt-hiit2-b1-legs','ex-b2-003',5,2,'15',30,'10-20 kg barbell',true,'Circuit 2'),
  ('we-hiit2-006','wt-hiit2-b1-legs','ex-bbg-007',6,2,'15 per side',30,'5-10 kg dumbbells',true,'Circuit 2'),
  ('we-hiit2-007','wt-hiit2-b1-legs','ex-bbg-002',7,2,'30 (15/side)',30,'5-10 kg dumbbells',true,'Circuit 2'),
  ('we-hiit2-008','wt-hiit2-b1-legs','ex-bbg-003',8,2,'100',90,'Skipping rope',true,'Circuit 2'),
  -- Block 1 Arms (Wednesday)
  ('we-hiit2-009','wt-hiit2-b1-arms','ex-b2-026',1,2,'15',30,'Bodyweight',true,'Circuit 1'),
  ('we-hiit2-010','wt-hiit2-b1-arms','ex-b2-004',2,2,'15',30,'2-4 kg dumbbells',true,'Circuit 1'),
  ('we-hiit2-011','wt-hiit2-b1-arms','ex-bbg-013',3,2,'15',30,'Bench',true,'Circuit 1'),
  ('we-hiit2-012','wt-hiit2-b1-arms','ex-b2-005',4,2,'20',90,'5-10 kg',true,'Circuit 1'),
  ('we-hiit2-013','wt-hiit2-b1-arms','ex-bbg-008',5,2,'30',30,'Bodyweight',true,'Circuit 2'),
  ('we-hiit2-014','wt-hiit2-b1-arms','ex-b2-010',6,2,'15',30,'6-12 kg medicine ball',true,'Circuit 2'),
  ('we-hiit2-015','wt-hiit2-b1-arms','ex-bbg-003',7,2,'50',30,'Skipping rope',true,'Circuit 2'),
  ('we-hiit2-016','wt-hiit2-b1-arms','ex-bbg-016',8,2,'15',90,'Bodyweight',true,'Circuit 2'),
  -- Block 1 Abs (Friday)
  ('we-hiit2-017','wt-hiit2-b1-abs','ex-bbg-014',1,2,'40 (20/side)',30,'Bodyweight',true,'Circuit 1'),
  ('we-hiit2-018','wt-hiit2-b1-abs','ex-b2-006',2,2,'20',30,'Bodyweight',true,'Circuit 1'),
  ('we-hiit2-019','wt-hiit2-b1-abs','ex-b2-007',3,2,'40 (20/side)',30,'Bodyweight',true,'Circuit 1'),
  ('we-hiit2-020','wt-hiit2-b1-abs','ex-b2-005',4,2,'20',90,'5-10 kg',true,'Circuit 1'),
  ('we-hiit2-021','wt-hiit2-b1-abs','ex-b2-008',5,2,'30',30,'Bodyweight — on side',true,'Circuit 2'),
  ('we-hiit2-022','wt-hiit2-b1-abs','ex-bbg-003',6,2,'50',30,'Skipping rope',true,'Circuit 2'),
  ('we-hiit2-023','wt-hiit2-b1-abs','ex-bbg-011',7,2,'30 (15/side)',30,'5-10 kg weight plate',true,'Circuit 2'),
  ('we-hiit2-024','wt-hiit2-b1-abs','ex-b2-009',8,2,'30 (15/side)',90,'Bodyweight',true,'Circuit 2'),
  -- Block 2 Legs (Monday)
  ('we-hiit2-025','wt-hiit2-b2-legs','ex-b2-011',1,2,'30',30,'10-20 kg barbell',true,'Circuit 1'),
  ('we-hiit2-026','wt-hiit2-b2-legs','ex-b2-002',2,2,'15',30,'Bodyweight',true,'Circuit 1'),
  ('we-hiit2-027','wt-hiit2-b2-legs','ex-b2-012',3,2,'15',30,'3-8 kg dumbbells',true,'Circuit 1'),
  ('we-hiit2-028','wt-hiit2-b2-legs','ex-b2-013',4,2,'30 (15/side)',90,'Bodyweight',true,'Circuit 1'),
  ('we-hiit2-029','wt-hiit2-b2-legs','ex-b2-010',5,2,'15',30,'6-12 kg medicine ball',true,'Circuit 2'),
  ('we-hiit2-030','wt-hiit2-b2-legs','ex-b2-001',6,2,'15',30,'Bodyweight',true,'Circuit 2'),
  ('we-hiit2-031','wt-hiit2-b2-legs','ex-b2-014',7,2,'30 (15 in / 15 out)',30,'Bodyweight',true,'Circuit 2'),
  ('we-hiit2-032','wt-hiit2-b2-legs','ex-b2-015',8,2,'15',90,'3-8 kg dumbbells',true,'Circuit 2'),
  -- Block 2 Arms (Wednesday)
  ('we-hiit2-033','wt-hiit2-b2-arms','ex-b2-016',1,2,'15',30,'Bodyweight',true,'Circuit 1'),
  ('we-hiit2-034','wt-hiit2-b2-arms','ex-b2-017',2,2,'20 (10/side)',30,'Bodyweight',true,'Circuit 1'),
  ('we-hiit2-035','wt-hiit2-b2-arms','ex-b2-018',3,2,'15',30,'3-8 kg dumbbells',true,'Circuit 1'),
  ('we-hiit2-036','wt-hiit2-b2-arms','ex-bbg-013',4,2,'10 per side',90,'Bench',true,'Circuit 1'),
  ('we-hiit2-037','wt-hiit2-b2-arms','ex-b2-019',5,2,'20',30,'Medicine ball',true,'Circuit 2'),
  ('we-hiit2-038','wt-hiit2-b2-arms','ex-b2-006',6,2,'20',30,'Bodyweight',true,'Circuit 2'),
  ('we-hiit2-039','wt-hiit2-b2-arms','ex-b2-020',7,2,'20 (10/side)',30,'3-8 kg dumbbell',true,'Circuit 2'),
  ('we-hiit2-040','wt-hiit2-b2-arms','ex-b2-021',8,2,'10',90,'Bench or box',true,'Circuit 2'),
  -- Block 2 Abs (Friday)
  ('we-hiit2-041','wt-hiit2-b2-abs','ex-b2-022',1,2,'20',30,'5-10 kg weight plate',true,'Circuit 1'),
  ('we-hiit2-042','wt-hiit2-b2-abs','ex-b2-008',2,2,'40 (20/side)',30,'Bodyweight — on back',true,'Circuit 1'),
  ('we-hiit2-043','wt-hiit2-b2-abs','ex-b2-023',3,2,'40 (20/side)',30,'5-10 kg weight plate',true,'Circuit 1'),
  ('we-hiit2-044','wt-hiit2-b2-abs','ex-b2-024',4,2,'40 (20 out / 20 in)',90,'Bodyweight',true,'Circuit 1'),
  ('we-hiit2-045','wt-hiit2-b2-abs','ex-b2-008',5,2,'40 (20/side)',30,'Bodyweight — on side',true,'Circuit 2'),
  ('we-hiit2-046','wt-hiit2-b2-abs','ex-b2-025',6,2,'40 (20/side)',30,'Bodyweight',true,'Circuit 2'),
  ('we-hiit2-047','wt-hiit2-b2-abs','ex-b2-006',7,2,'20',30,'Bodyweight',true,'Circuit 2'),
  ('we-hiit2-048','wt-hiit2-b2-abs','ex-bbg-008',8,2,'60 (30/side)',90,'Bodyweight',true,'Circuit 2')
ON CONFLICT (id) DO NOTHING;
