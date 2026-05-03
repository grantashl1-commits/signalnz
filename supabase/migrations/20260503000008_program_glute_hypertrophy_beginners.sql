-- ══════════════════════════════════════════════════════════════════
-- Migration 8: Glute & Lower Body Hypertrophy — 12-Week Beginner Plan
-- Program ID: prog-glute-hypertrophy-beginners
-- No brand names — descriptive naming only
-- ══════════════════════════════════════════════════════════════════

-- 18 new exercises (ex-glut-001 to ex-glut-018)
INSERT INTO exercises (id, name, body_region, primary_muscle_group, movement_pattern, difficulty_level, equipment_needed, primary_muscles, secondary_muscles, is_compound, coaching_cues, form_cues_short)
VALUES
  ('ex-glut-001','Barbell Hip Thrusts','lower body','glutes','strength',2,ARRAY['barbell','bench'],ARRAY['glutes','hamstrings'],ARRAY['core','hip flexors'],true,'Sit with upper back on bench, barbell across hips (use pad). Feet flat, knees bent. Drive hips up until body is flat. Squeeze glutes at top. Lower with control.','Upper back on bench; drive hips up; squeeze glutes at top; lower with control'),
  ('ex-glut-002','45-Degree Leg Press','lower body','quads','strength',1,ARRAY['leg press machine'],ARRAY['quads','glutes'],ARRAY['hamstrings','calves'],true,'Sit in leg press machine. Feet shoulder-width on platform. Push platform away until legs are extended (do not lock). Lower slowly to 90°.','Feet shoulder-width; press until near extension; lower to 90°; controlled'),
  ('ex-glut-003','Barbell Romanian Deadlift (RDL)','lower body','hamstrings','strength',2,ARRAY['barbell'],ARRAY['hamstrings','glutes'],ARRAY['lower back','core'],true,'Hold barbell at hip height. Hinge at hips, pushing them back while lowering bar along thighs. Keep back flat. Feel hamstring stretch. Drive hips forward to return.','Hinge at hips; push hips back; bar stays close to legs; flat back; drive hips forward'),
  ('ex-glut-004','Dumbbell Step Ups','lower body','quads','strength',1,ARRAY['dumbbells','bench'],ARRAY['quads','glutes'],ARRAY['hamstrings','calves'],true,'Hold dumbbells at sides. Step onto bench with one foot. Drive through heel to stand fully. Step down with control. Alternate or complete all reps one side at a time.','Dumbbells at sides; step up; drive through heel; stand fully; step down controlled'),
  ('ex-glut-005','Machine Seated Hip Abduction','lower body','glutes','strength',1,ARRAY['hip abduction machine'],ARRAY['glutes (abductors)','hip external rotators'],ARRAY[],false,'Sit in machine with pads on outer thighs. Push legs apart against resistance. Control the return. Do not swing. Focus on glute and outer hip contraction.','Push legs apart against resistance; control the return; no swinging; focus glute contraction'),
  ('ex-glut-006','Side Plank','core','obliques','strength',1,ARRAY['bodyweight'],ARRAY['obliques','core'],ARRAY['glutes','shoulders'],false,'Lie on side. Support on forearm and feet (or knees for beginner). Lift hips to form a straight line. Hold. Engage obliques and glutes throughout. Avoid sagging hips.','Forearm on floor; lift hips; straight line; engage obliques and glutes; no sagging'),
  ('ex-glut-007','Barbell Glute Bridges','lower body','glutes','strength',1,ARRAY['barbell'],ARRAY['glutes','hamstrings'],ARRAY['core'],true,'Lie on floor with barbell across hips (use pad). Feet flat, knees bent. Drive hips up by squeezing glutes. Hold 1-2 sec at top. Lower slowly.','Barbell across hips; drive up squeezing glutes; hold at top; lower slowly'),
  ('ex-glut-008','Dumbbell Romanian Deadlift','lower body','hamstrings','strength',1,ARRAY['dumbbells'],ARRAY['hamstrings','glutes'],ARRAY['lower back','core'],true,'Hold dumbbells in front of thighs. Hinge at hips, lowering dumbbells along thighs to mid-shin. Flat back throughout. Drive hips forward to return. Squeeze glutes at top.','Hinge at hips; dumbbells close to legs; flat back; drive hips forward; squeeze at top'),
  ('ex-glut-009','Single Leg Leg Press','lower body','quads','strength',2,ARRAY['leg press machine'],ARRAY['quads','glutes'],ARRAY['hamstrings'],true,'One foot centred on platform. Press through heel to extend leg. Lower slowly to 90°. Keep pelvis neutral. Heavier unilateral load than standard leg press typically needed.','One foot centred; press through heel; lower to 90°; pelvis neutral; controlled'),
  ('ex-glut-010','Glute-Focus Back Extensions','lower body','glutes','strength',1,ARRAY['back extension machine'],ARRAY['glutes','hamstrings'],ARRAY['lower back'],true,'Position hips at pad edge so you can round forward. Round upper back slightly and posteriorly tilt pelvis to emphasise glutes over lower back. Squeeze glutes to return.','Hips at pad edge; posteriorly tilt pelvis; round upper back slightly; squeeze glutes to rise'),
  ('ex-glut-011','Standing Hip Abduction Machine','lower body','glutes','strength',1,ARRAY['cable machine','hip abduction machine'],ARRAY['glutes (abductors)','hip external rotators'],ARRAY['core'],false,'Stand sideways to cable or machine. Attach ankle strap. Raise leg out to side against resistance. Control the return. Keep torso upright and stable.','Stand sideways; raise leg out to side; control return; torso upright; no lean'),
  ('ex-glut-012','Bird Dogs','core','lower back','strength',1,ARRAY['bodyweight'],ARRAY['lower back','glutes'],ARRAY['core','hamstrings'],false,'Start on hands and knees, neutral spine. Extend opposite arm and leg simultaneously. Hold 2-3 sec. Return with control. Avoid rotating the hips or arching the back.','Hands and knees; extend opposite arm and leg; hold; no hip rotation; neutral spine'),
  ('ex-glut-013','Smith Machine Squats','lower body','quads','strength',1,ARRAY['smith machine'],ARRAY['quads','glutes'],ARRAY['hamstrings','core'],true,'Set bar at shoulder height. Position feet slightly forward of hips. Unrack. Squat deep, keeping torso upright. Drive through heels to stand. Re-rack carefully.','Feet slightly forward; squat deep; torso upright; drive through heels; re-rack carefully'),
  ('ex-glut-014','Dead Bugs','core','abdominals','strength',1,ARRAY['bodyweight'],ARRAY['core','abdominals'],ARRAY['hip flexors'],false,'Lie on back. Raise arms to ceiling, knees to 90° above hips. Slowly lower opposite arm and leg toward floor. Keep lower back pressed to floor throughout. Return and alternate.','Lie on back; arms up; knees 90°; lower opposite arm and leg; lower back stays flat; alternate'),
  ('ex-glut-015','Dumbbell Bulgarian Split Squats','lower body','quads','strength',2,ARRAY['dumbbells','bench'],ARRAY['quads','glutes'],ARRAY['hamstrings','hip flexors'],true,'Rear foot elevated on bench. Front foot forward. Hold dumbbells at sides. Lower back knee toward floor. Drive through front heel to stand. Keep torso upright.','Rear foot on bench; front foot forward; lower back knee; drive through front heel; torso upright'),
  ('ex-glut-016','Donkey Kickbacks','lower body','glutes','strength',1,ARRAY['cable machine','resistance band'],ARRAY['glutes','hamstrings'],ARRAY['lower back'],false,'On hands and knees or standing at cable. Drive one heel back and up. Squeeze glute at top. Lower with control. Keep hips square and spine neutral.','Drive heel back and up; squeeze glute at top; lower controlled; hips square; neutral spine'),
  ('ex-glut-017','Seated Banded Hip Abduction','lower body','glutes','strength',1,ARRAY['resistance band','bench'],ARRAY['glutes (abductors)','hip external rotators'],ARRAY[],false,'Sit on bench, band looped around thighs just above knees. Push knees apart against band. Control the return. Stay seated upright. High rep activation work.','Sit tall; band above knees; push knees apart; control return; upright posture'),
  ('ex-glut-018','Weighted Crunches','core','abdominals','strength',1,ARRAY['weight plate','dumbbells'],ARRAY['abdominals','core'],ARRAY['hip flexors'],false,'Lie on back, knees bent. Hold weight at chest or behind head. Curl shoulders off floor, contracting abs. Lower slowly. Do not pull on neck.','Weight at chest; curl shoulders off floor; contract abs; lower slowly; no neck pulling')
ON CONFLICT (id) DO NOTHING;

-- Program
INSERT INTO training_programs (id, title, goal_category_id, duration_weeks, sessions_per_week, intensity_level, equipment_needed, tags, description, who_its_for, evidence_basis)
VALUES (
  'prog-glute-hypertrophy-beginners',
  'Glute & Lower Body Hypertrophy — 12-Week Beginner Plan',
  'gc-001',
  12, 2, 4,
  ARRAY['barbell','dumbbells','leg press machine','smith machine','back extension machine','resistance band','cable machine','bench'],
  ARRAY['glutes','lower body','hypertrophy','beginners','women','hip dominant','posterior chain','strength'],
  'A structured 12-week beginner program focused on building glute and lower body muscle. Two sessions per week alternate between hip-dominant and posterior chain patterns. Phase 1 (Weeks 1-6) establishes the foundation with barbell hip thrusts, leg press, RDL, and abductor work. Phase 2 (Weeks 7-12) progresses to compound movements and unilateral exercises. Warm-up every session: 3 min light bike or jog, foam roll hamstrings/quads/TFL, glute band activation.',
  'Women new to resistance training who want a beginner-friendly, gym-based program specifically targeting glute and lower body development.',
  'Progressive overload via sets and weight. Hip hinge and glute bridge patterns drive posterior chain development. Unilateral progressions in Phase 2 address imbalances and increase difficulty without excessive load on the spine.'
)
ON CONFLICT (id) DO NOTHING;

-- Phases
INSERT INTO program_phases (id, program_id, phase_number, title, phase_goal, week_start, week_end, rpe_target_min, rpe_target_max)
VALUES
  ('ph-glut-1','prog-glute-hypertrophy-beginners',1,'Phase 1 — Foundation (Weeks 1-6)','Establish movement patterns: hip thrust, RDL, leg press, abductor work. Build a base of glute and hamstring strength. 3 sets per exercise; increase weight each week.',1,6,5,7),
  ('ph-glut-2','prog-glute-hypertrophy-beginners',2,'Phase 2 — Progression (Weeks 7-12)','Progress to compound barbell movements and unilateral exercises. Add sets in final 3 weeks (4 sets on key exercises). Focus on mind-muscle connection and load progression.',7,12,6,8)
ON CONFLICT (id) DO NOTHING;

-- Workout Templates
INSERT INTO workout_templates (id, program_id, phase_id, day_label, title, estimated_duration_mins, session_number, session_type, warmup_notes, cooldown_notes, session_notes)
VALUES
  ('wt-glut-1a','prog-glute-hypertrophy-beginners','ph-glut-1','Day 1','Phase 1 — Hip Dominant Session',50,1,'strength','3 min easy bike/jog + foam roll hamstrings, quads, TFL + glute band walks 2×15','Stretch hamstrings, hip flexors, and glutes 5-10 min','Hip dominant focus. Rest 60-90 sec between sets. Aim to increase load each week. Weeks 4-6: add a 4th set on Hip Thrusts, Leg Press, and RDL. Log your weights to track progression.'),
  ('wt-glut-1b','prog-glute-hypertrophy-beginners','ph-glut-1','Day 2','Phase 1 — Posterior Chain Session',50,2,'strength','3 min easy bike/jog + foam roll hamstrings, quads, TFL + glute band walks 2×15','Stretch hamstrings, hip flexors, and glutes 5-10 min','Posterior chain focus. Slower eccentric on all movements (2-3 sec lowering). Bird dogs and bridge activations are neuromuscular — focus on control over load. Rest 60-90 sec between sets.'),
  ('wt-glut-2a','prog-glute-hypertrophy-beginners','ph-glut-2','Day 1','Phase 2 — Compound Focus Session',55,3,'strength','3 min easy bike/jog + foam roll hamstrings, quads, TFL + glute band walks 2×15','Stretch hamstrings, hip flexors, and glutes 5-10 min','Compound movements with heavier loads. Aim for 8 reps at an RPE of 7-8. Rest 90 sec between sets. Weeks 10-12: increase to 4 sets on Hip Thrusts and Smith Machine Squats.'),
  ('wt-glut-2b','prog-glute-hypertrophy-beginners','ph-glut-2','Day 2','Phase 2 — Unilateral Focus Session',55,4,'strength','3 min easy bike/jog + foam roll hamstrings, quads, TFL + glute band walks 2×15','Stretch hamstrings, hip flexors, and glutes 5-10 min','Unilateral and isolation exercises. Bulgarian split squats will be challenging — use a lighter dumbbell initially. Rest 90 sec between sets. Weeks 10-12: increase to 4 sets on Glute Bridges and Split Squats.')
ON CONFLICT (id) DO NOTHING;

-- Workout Exercises
INSERT INTO workout_exercises (id, workout_id, exercise_id, order_index, sets, reps, rest_seconds, load_guidance, is_superset, superset_group)
VALUES
  -- Phase 1 Day 1 — Hip Dominant (wt-glut-1a)
  ('we-glut-001','wt-glut-1a','ex-glut-001',1,3,'12',90,'Start with empty bar + pad. Add 5 kg/week as form permits. Weeks 4-6: 4 sets.',false,NULL),
  ('we-glut-002','wt-glut-1a','ex-glut-002',2,3,'12',90,'Moderate load. Feet shoulder-width. Weeks 4-6: 4 sets.',false,NULL),
  ('we-glut-003','wt-glut-1a','ex-glut-003',3,3,'12',90,'Light-moderate load. Focus on hamstring stretch. Weeks 4-6: 4 sets.',false,NULL),
  ('we-glut-004','wt-glut-1a','ex-glut-004',4,3,'12 per side',90,'Hold light dumbbells. Step onto a stable box or bench at knee height.',false,NULL),
  ('we-glut-005','wt-glut-1a','ex-glut-005',5,3,'15',60,'Light-moderate resistance. Focus on glute abductor contraction.',false,NULL),
  ('we-glut-006','wt-glut-1a','ex-glut-006',6,3,'20 sec per side',30,'Bodyweight. For beginner, drop to knees.',false,NULL),
  -- Phase 1 Day 2 — Posterior Chain (wt-glut-1b)
  ('we-glut-007','wt-glut-1b','ex-glut-007',1,3,'8',90,'Barbell with pad. Heavy enough to feel glutes working. 2 sec hold at top.',false,NULL),
  ('we-glut-008','wt-glut-1b','ex-glut-008',2,3,'10',90,'Light-moderate dumbbells. Focus on hamstring stretch and hip hinge.',false,NULL),
  ('we-glut-009','wt-glut-1b','ex-glut-009',3,3,'10 per side',90,'Moderate load. One foot centred on platform.',false,NULL),
  ('we-glut-010','wt-glut-1b','ex-glut-010',4,3,'12',90,'Use bodyweight first. Posteriorly tilt pelvis to emphasise glutes.',false,NULL),
  ('we-glut-011','wt-glut-1b','ex-glut-011',5,3,'10 per side',60,'Light cable or machine. Stand tall throughout.',false,NULL),
  ('we-glut-012','wt-glut-1b','ex-glut-012',6,3,'6 per side',30,'Bodyweight. Slow and controlled. 2-3 sec hold at extension.',false,NULL),
  -- Phase 2 Day 1 — Compound Focus (wt-glut-2a)
  ('we-glut-013','wt-glut-2a','ex-glut-001',1,3,'8',90,'Heavier than Phase 1. Weeks 10-12: 4 sets.',false,NULL),
  ('we-glut-014','wt-glut-2a','ex-glut-013',2,3,'10',90,'Moderate barbell load on Smith machine.',false,NULL),
  ('we-glut-015','wt-glut-2a','ex-glut-008',3,3,'10',90,'Heavier than Phase 1 dumbbell RDL.',false,NULL),
  ('we-glut-016','wt-glut-2a','ex-glut-009',4,3,'10 per side',90,'Heavier single leg load than Phase 1.',false,NULL),
  ('we-glut-017','wt-glut-2a','ex-glut-005',5,3,'15',60,'Slightly more resistance than Phase 1.',false,NULL),
  ('we-glut-018','wt-glut-2a','ex-glut-014',6,3,'8 per side',30,'Bodyweight. Very slow and controlled. Exhale on extension.',false,NULL),
  -- Phase 2 Day 2 — Unilateral Focus (wt-glut-2b)
  ('we-glut-019','wt-glut-2b','ex-glut-007',1,3,'10',90,'Heavier barbell. Weeks 10-12: 4 sets.',false,NULL),
  ('we-glut-020','wt-glut-2b','ex-glut-003',2,3,'10',90,'Barbell RDL, heavier load than Phase 1 dumbbell version.',false,NULL),
  ('we-glut-021','wt-glut-2b','ex-glut-015',3,3,'10 per side',90,'Light dumbbells to start — this is challenging. Weeks 10-12: 4 sets.',false,NULL),
  ('we-glut-022','wt-glut-2b','ex-glut-016',4,3,'15 per side',60,'Cable or band around ankle. Focus on glute squeeze at top.',false,NULL),
  ('we-glut-023','wt-glut-2b','ex-glut-017',5,3,'20',60,'Light resistance band. High reps for activation and pump.',false,NULL),
  ('we-glut-024','wt-glut-2b','ex-glut-018',6,3,'15',60,'Light weight plate at chest. Focus on abs, not hip flexors.',false,NULL)
ON CONFLICT (id) DO NOTHING;
