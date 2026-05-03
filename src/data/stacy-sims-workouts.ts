import { Workout } from "@/data/workouts";

// ── STACY SIMS WORKOUTS ──────────────────────────────────────────────
// Source: "ROAR" and "Next Level" by Dr. Stacy Sims
// Optimised for peri/menopausal women

// ── SIT CARDIO PROTOCOLS — Next Level Ch5 ───────────────────────────
const SS_SIT_PROTOCOLS: Workout = {
  id: "ss-sit-protocols",
  name: "SIT Cardio Protocols",
  category: "strength",
  duration: "20–35 min",
  durationMin: 25,
  equipment: "Bike / rower / treadmill or kettlebell",
  suitability: { menstrual: "rest", follicular: "suitable", ovulatory: "ideal", luteal: "rest" },
  description: "Sprint Interval Training — maximal all-out efforts. Choose one protocol per session. From Stacy Sims Next Level Ch5.",
  progressionNotes: [
    "Week 1–2: 4 blocks. Week 3–4: increase to 6 blocks.",
    "Rest 2–3 min between blocks. RPE must be 9–10 — truly maximal.",
    "Rotate across Tabata / 40-20 / 30-30 / Hill / Kettlebell week to week.",
  ],
  exercises: [
    {
      name: "Tabata Sprint",
      sets: "4–6",
      reps: "8 rounds",
      duration: "20 sec on / 10 sec off",
      formCue: "All-out effort. Bike / row / run. RPE 9–10. 2–3 min rest between blocks.",
      section: "Tabata SIT",
    },
    {
      name: "40/20 Sprint",
      sets: "1",
      reps: "8 rounds",
      duration: "40 sec on / 20 sec off",
      formCue: "Hard 40-sec effort. Maintain high output. RPE 8–9. Ideal on bike or rower.",
      section: "40/20 SIT",
    },
    {
      name: "30 On 30 Off Sprint",
      sets: "1",
      reps: "6–8 rounds",
      duration: "30 sec on / 30 sec off",
      formCue: "Equal work-to-rest. Drive hard, rest completely. Good entry-level SIT. RPE 8–9.",
      section: "30/30 SIT",
    },
    {
      name: "Uphill Sprint",
      sets: "1",
      reps: "6–8 repeats",
      duration: "30 sec",
      formCue: "Sprint hard uphill. Walk back down for full recovery. RPE 9–10.",
      section: "Hill Repeats SIT",
    },
    {
      name: "Kettlebell Swing",
      sets: "1",
      reps: "8 rounds",
      duration: "20 sec on / 10 sec off",
      formCue: "Two-handed swing. Power from hip snap only — not arms. Bell projects to chest height. RPE 9–10.",
      section: "Kettlebell SIT",
    },
  ],
};

// ── PELVIC FLOOR PROTOCOL — Next Level Ch6 ──────────────────────────
const SS_PELVIC_FLOOR: Workout = {
  id: "ss-pelvic-floor",
  name: "Pelvic Floor Protocol",
  category: "walk-restore",
  duration: "10–15 min",
  durationMin: 12,
  equipment: "None",
  suitability: { menstrual: "ideal", follicular: "ideal", ovulatory: "suitable", luteal: "ideal" },
  description: "Daily pelvic floor and deep core activation. Critical for perimenopausal and menopausal women. From Stacy Sims Next Level Ch6.",
  progressionNotes: [
    "Perform daily. Add kegels before every heavy lifting session.",
    "Progress from long holds to fast-twitch flicks once form is consistent.",
  ],
  exercises: [
    {
      name: "Kegels",
      sets: "2–3",
      reps: "10 long + 10 short",
      formCue: "Hold 10 sec then 10 quick flicks. Tighten as if stopping urine flow. Release fully between reps.",
      section: "Pelvic Floor",
    },
    {
      name: "Elevator Abs",
      sets: "1",
      reps: "3–5",
      duration: "5 breath cycles",
      formCue: "Inhale, belly expands. Exhale, draw navel toward spine (floor 1 to 10). Hold top briefly.",
      section: "Deep Core",
    },
    {
      name: "Child's Pose Breathing",
      sets: "1",
      reps: "5–8 breaths",
      formCue: "Hips back on heels. Breathe into lower back. Feel pelvic floor lift gently on each exhale.",
      section: "Coordination",
    },
  ],
};

// ── HEAVY LIFTING PROGRAMME — Next Level Ch6 ────────────────────────
const SS_HEAVY_LIFTING: Workout = {
  id: "ss-heavy-lifting",
  name: "Heavy Lifting Programme",
  category: "strength",
  duration: "50–60 min",
  durationMin: 55,
  equipment: "Barbell, rack, bench",
  suitability: { menstrual: "rest", follicular: "ideal", ovulatory: "ideal", luteal: "suitable" },
  description: "Compound barbell lifts at heavy load — the most powerful stimulus for hormones and bone density in peri/menopausal women. From Stacy Sims Next Level Ch6.",
  progressionNotes: [
    "Progress load weekly when all sets are completed with good form.",
    "Work toward 85–90% 1RM on big lifts. 3–5 heavy reps > 10 moderate reps.",
    "Log every session. Bone density benefits require months of progressive overload.",
  ],
  exercises: [
    {
      name: "Squat",
      sets: "3–5",
      reps: "3–6",
      formCue: "Barbell on upper back. Thighs parallel or below. Chest tall, heels down. Drive through floor.",
      section: "Lower Body",
    },
    {
      name: "Split Squat",
      sets: "3",
      reps: "6–8 per leg",
      formCue: "Rear foot elevated (Bulgarian). Front shin vertical. Lower rear knee, drive front foot through floor.",
      section: "Lower Body",
    },
    {
      name: "Overhead Squat",
      sets: "3",
      reps: "5–8",
      formCue: "Barbell locked out overhead, wide grip. Full squat while keeping arms pressed up. Use lighter weight.",
      section: "Lower Body",
    },
    {
      name: "Deadlift",
      sets: "3–5",
      reps: "3–5",
      formCue: "Bar over mid-foot. Hip hinge to grip. Drive floor away, bar up shins. Lock out hips and knees together.",
      section: "Posterior Chain",
    },
    {
      name: "Sumo Deadlift",
      sets: "3",
      reps: "5–6",
      formCue: "Wide stance, toes out 30–45°. Grip inside legs. Chest tall, knees out over toes as you stand.",
      section: "Posterior Chain",
    },
    {
      name: "Single-Leg Deadlift",
      sets: "3",
      reps: "8 per leg",
      formCue: "Dumbbell or KB opposite hand. Hip hinge, free leg extends behind. Keep hips square throughout.",
      section: "Posterior Chain",
    },
    {
      name: "Bench Press",
      sets: "3–5",
      reps: "3–6",
      formCue: "Feet flat. Lower to mid-chest under control. Press explosively. Shoulder blades retracted throughout.",
      section: "Upper Body",
    },
    {
      name: "Pendlay Row",
      sets: "3–5",
      reps: "5–6",
      formCue: "Near-horizontal torso. Pull bar explosively from floor to lower rib. Return to floor between every rep.",
      section: "Upper Body",
    },
  ],
};

// ── BEGINNER PLYOMETRIC CIRCUIT — Next Level Ch7 ────────────────────
const SS_PLYO_BEGINNER: Workout = {
  id: "ss-plyo-beginner",
  name: "Beginner Plyometric Circuit",
  category: "strength",
  duration: "20–25 min",
  durationMin: 22,
  equipment: "None",
  suitability: { menstrual: "rest", follicular: "ideal", ovulatory: "ideal", luteal: "suitable" },
  description: "Entry-level plyometrics to build joint tolerance for impact. 3 rounds. Focus on quiet landings. From Stacy Sims Next Level Ch7.",
  progressionNotes: [
    "Rest 60–90 sec between rounds.",
    "Progress to intermediate circuit once all 4 exercises feel fully controlled.",
  ],
  exercises: [
    {
      name: "Squat Jump",
      sets: "3",
      reps: "10–12",
      formCue: "Full squat, explode vertically. Land soft with knees bent absorbing force.",
      section: "Circuit",
    },
    {
      name: "Jumping Jacks",
      sets: "3",
      reps: "20",
      formCue: "Coordinated arm and leg timing. Core engaged. Land lightly.",
      section: "Circuit",
    },
    {
      name: "Side Hops",
      sets: "3",
      reps: "10 per side",
      formCue: "Hop laterally over a line. Both feet. Land soft, control each landing before the next hop.",
      section: "Circuit",
    },
    {
      name: "Skipping",
      sets: "3",
      duration: "20–30 metres",
      formCue: "Emphasise height and arm drive. Rhythmic power and coordination.",
      section: "Circuit",
    },
  ],
};

// ── INTERMEDIATE PLYOMETRIC CIRCUIT — Next Level Ch7 ────────────────
const SS_PLYO_INTERMEDIATE: Workout = {
  id: "ss-plyo-intermediate",
  name: "Intermediate Plyometric Circuit",
  category: "strength",
  duration: "20–25 min",
  durationMin: 22,
  equipment: "None",
  suitability: { menstrual: "rest", follicular: "suitable", ovulatory: "ideal", luteal: "rest" },
  description: "Builds single-leg power and core stability under dynamic load. 3 rounds. From Stacy Sims Next Level Ch7.",
  exercises: [
    {
      name: "Switch Leg Lunges",
      sets: "3",
      reps: "10 per leg",
      formCue: "Lunge down, explode up switching legs in mid-air. Absorb landing softly.",
      section: "Circuit",
    },
    {
      name: "Mountain Climber",
      sets: "3",
      reps: "20 (10 per leg)",
      formCue: "High plank. Drive knee to chest and switch rapidly. Hips level, core braced.",
      section: "Circuit",
    },
    {
      name: "Sumo Squat Jumps",
      sets: "3",
      reps: "10",
      formCue: "Wide sumo stance. Squat then explode up. Land back in wide stance, immediate next rep.",
      section: "Circuit",
    },
  ],
};

// ── ADVANCED PLYOMETRIC CIRCUIT — Next Level Ch7 ────────────────────
const SS_PLYO_ADVANCED: Workout = {
  id: "ss-plyo-advanced",
  name: "Advanced Plyometric Circuit",
  category: "strength",
  duration: "25–30 min",
  durationMin: 27,
  equipment: "Plyo box (6–24 inch)",
  suitability: { menstrual: "rest", follicular: "suitable", ovulatory: "ideal", luteal: "rest" },
  description: "Highest-intensity plyometric work builds reactive strength lost with menopause. 3 rounds. From Stacy Sims Next Level Ch7.",
  progressionNotes: [
    "Master intermediate circuit first.",
    "Depth jump: start with 6-inch box only. Never jump DOWN from box in early training.",
  ],
  exercises: [
    {
      name: "Tuck Jump",
      sets: "3",
      reps: "8–10",
      formCue: "Jump high, pull both knees to chest at apex. Land soft and rebound. Can combine with burpee.",
      section: "Circuit",
    },
    {
      name: "Speed Skater",
      sets: "3",
      reps: "10 per side",
      formCue: "Bound laterally landing on one foot. Touch opposite hand to floor. Drive off stance leg.",
      section: "Circuit",
    },
    {
      name: "Depth Jump",
      sets: "3",
      reps: "6–8",
      formCue: "Step off low box (6–12 inch). Land on both feet and immediately re-jump as fast as possible.",
      section: "Circuit",
    },
    {
      name: "Box Jump",
      sets: "3",
      reps: "6–8",
      formCue: "Swing arms, jump onto box landing in partial squat. Step back down — do NOT jump down.",
      section: "Circuit",
    },
  ],
};

// ── FULL BODY FOAM ROLLING — Next Level Ch14 ────────────────────────
const SS_FOAM_ROLLING: Workout = {
  id: "ss-foam-rolling",
  name: "Full Body Foam Rolling",
  category: "walk-restore",
  duration: "15–20 min",
  durationMin: 17,
  equipment: "Foam roller, lacrosse ball (optional)",
  suitability: { menstrual: "ideal", follicular: "suitable", ovulatory: "suitable", luteal: "ideal" },
  description: "Systematic soft-tissue release from feet to lower back. Perform daily or pre-workout. From Stacy Sims Next Level Ch14.",
  exercises: [
    {
      name: "Plantar Roll",
      sets: "1",
      duration: "30–60 sec per foot",
      formCue: "Roller or lacrosse ball under foot. Roll from heel to ball. Releases fascial chain up the leg.",
      section: "Foot / Calf",
    },
    {
      name: "Calf Smash",
      sets: "1",
      duration: "60–90 sec per leg",
      formCue: "Roller under calf. Cross opposite ankle for pressure. Roll heel to behind knee. Pause on tender spots.",
      section: "Foot / Calf",
    },
    {
      name: "Hamstring Roll",
      sets: "1",
      duration: "60–90 sec per leg",
      formCue: "Roller under hamstrings. Roll from glute to behind knee. Rotate hip inward and outward.",
      section: "Posterior Chain",
    },
    {
      name: "Quad Roll",
      sets: "1",
      duration: "60–90 sec per leg",
      formCue: "Face down. Roll from hip crease to above knee. Bend and straighten knee as you roll.",
      section: "Anterior",
    },
    {
      name: "Anterior Hip Smash",
      sets: "1",
      duration: "60–90 sec per side",
      formCue: "Face down, roller on hip flexor below hip crease. Small oscillations. Powerful release for desk workers.",
      section: "Anterior",
    },
    {
      name: "Adductor Smash",
      sets: "1",
      duration: "60–90 sec per leg",
      formCue: "Face down, leg rotated out. Roller along inner thigh from groin to above knee.",
      section: "Inner Thigh",
    },
    {
      name: "Glute Smash",
      sets: "1",
      duration: "60–90 sec per side",
      formCue: "Sit on roller in figure-four. Lean toward side being rolled. Releases piriformis and deep glutes.",
      section: "Glutes",
    },
    {
      name: "Lower-Back Smash",
      sets: "1",
      duration: "60–90 sec",
      formCue: "Roller perpendicular to spine at lower back. Knees bent. Gently rock side to side.",
      section: "Lower Back",
    },
  ],
};

// ── JOINT MOBILITY SESSION — Next Level Ch14 ────────────────────────
const SS_MOBILITY: Workout = {
  id: "ss-mobility",
  name: "Joint Mobility Session",
  category: "walk-restore",
  duration: "15 min",
  durationMin: 15,
  equipment: "Foam roller or wall / rack",
  suitability: { menstrual: "ideal", follicular: "suitable", ovulatory: "suitable", luteal: "ideal" },
  description: "Targeted joint mobility for the SI joint, thoracic spine, and hips. From Stacy Sims Next Level Ch14.",
  exercises: [
    {
      name: "SI Joint Glide",
      sets: "1",
      reps: "8–10 per side",
      formCue: "Lying on back, knees bent. Oscillate one knee forward and other back in small pattern. Restores SI joint mobility.",
      section: "Pelvis",
    },
    {
      name: "Foam Roll with Lat Rotation",
      sets: "1",
      reps: "8–10 per side",
      formCue: "Roller at mid-thoracic spine. Arms overhead. Rotate torso gently side to side.",
      section: "Thoracic",
    },
    {
      name: "Lat Gliding",
      sets: "1",
      reps: "8–10 per side",
      duration: "30 sec hold",
      formCue: "Arm overhead on rack or wall. Shift hips away. Breathe into the stretch.",
      section: "Thoracic",
    },
    {
      name: "Lateral Step and Reach",
      sets: "1",
      reps: "10 per side",
      formCue: "Step broadly to side, reach opposite arm overhead and across. Full lateral chain stretch.",
      section: "Hips / Lateral Chain",
    },
    {
      name: "Lateral Step and Step Behind",
      sets: "1",
      reps: "10 per side",
      formCue: "Step to side then cross foot behind. Several steps one direction then reverse. Hip rotator control.",
      section: "Hips / Lateral Chain",
    },
  ],
};

// ── CORE STABILITY — Next Level Ch14 ────────────────────────────────
const SS_CORE_STABILITY: Workout = {
  id: "ss-core-stability",
  name: "Core Stability",
  category: "strength",
  duration: "25 min",
  durationMin: 25,
  equipment: "None",
  suitability: { menstrual: "suitable", follicular: "ideal", ovulatory: "ideal", luteal: "suitable" },
  description: "Anti-rotation, anti-extension, and back-extension core work. From Stacy Sims Next Level Ch14.",
  exercises: [
    {
      name: "Windshield Wipers",
      sets: "3",
      reps: "10–15",
      formCue: "On back, legs at 90°. Lower both legs slowly to each side without touching floor. Shoulders stay flat.",
      section: "Rotational",
    },
    {
      name: "Plank",
      sets: "3–4",
      duration: "20–60 sec",
      formCue: "Forearms under shoulders. Body straight head to heels. Hips level. Breathe steadily.",
      section: "Anti-Extension",
    },
    {
      name: "Shoulder Bridge",
      sets: "3",
      reps: "10–12",
      formCue: "Knees bent, feet flat. Drive hips up, squeeze glutes. Hold 2–3 sec. Progress to single-leg.",
      section: "Posterior Chain",
    },
    {
      name: "Superman",
      sets: "3",
      reps: "10–12",
      formCue: "Face down, arms overhead. Lift arms and legs simultaneously. Hold 2–3 sec. Lower with control.",
      section: "Back Extension",
    },
    {
      name: "Sweeping Side Plank",
      sets: "3",
      reps: "8–10 per side",
      formCue: "Side plank on forearm. Sweep free arm under torso in a rotation, then open back up.",
      section: "Anti-Rotation",
    },
    {
      name: "V-Up",
      sets: "3",
      reps: "8–12",
      formCue: "Lying flat. Raise both legs and upper body simultaneously. Reach hands toward feet. Control descent.",
      section: "Full Core",
    },
  ],
};

// ── ROAR PEP INJURY PREVENTION WARM-UP — ROAR Ch6 ───────────────────
const SS_PEP_PLAN: Workout = {
  id: "ss-pep-plan",
  name: "PEP Injury Prevention Warm-Up",
  category: "strength",
  duration: "15 min",
  durationMin: 15,
  equipment: "None",
  suitability: { menstrual: "suitable", follicular: "ideal", ovulatory: "ideal", luteal: "suitable" },
  description: "Prevent Injury and Enhance Performance protocol. Perform before every run, game, or heavy session. From Stacy Sims ROAR Ch6.",
  exercises: [
    {
      name: "Walking Lunge",
      sets: "3",
      reps: "10 per leg",
      formCue: "Step forward, lower rear knee, push off front foot. Continuous walking pattern. ACL prevention essential.",
      section: "Warm-Up",
    },
    {
      name: "Single Toe Raise",
      sets: "3",
      reps: "15 per leg",
      formCue: "Stand on one foot. Raise heel as high as possible, lower with control. Wall for balance if needed.",
      section: "Warm-Up",
    },
    {
      name: "Bridge with Alternating Hip Flexion",
      sets: "3",
      reps: "10 per leg",
      formCue: "Hold bridge. Lift one foot, bring knee toward chest then return. Demands unilateral glute control.",
      section: "Warm-Up",
    },
    {
      name: "Plank with Knee Dips",
      sets: "3",
      reps: "10 per side",
      formCue: "Forearm plank. Lower one knee toward floor without touching then return. Anti-rotation core.",
      section: "Core Activation",
    },
    {
      name: "Side Plank",
      sets: "3",
      duration: "20–45 sec per side",
      formCue: "On one forearm. Body straight. Lateral core stiffness critical for knee alignment in running.",
      section: "Core Activation",
    },
    {
      name: "Neutral Spine Sequence",
      sets: "1",
      reps: "6-step sequence",
      formCue: "Tilt pelvis to max anterior and posterior. Find midpoint neutral. Deep breath then gently brace core. Perform before every strength session.",
      section: "Core Activation",
    },
  ],
};

// ── ROAR PRE-TRAINING MOBILITY — ROAR Ch6 ───────────────────────────
const SS_ROAR_FOAM_ROLLING: Workout = {
  id: "ss-roar-foam-rolling",
  name: "ROAR Pre-Training Mobility",
  category: "walk-restore",
  duration: "12–15 min",
  durationMin: 13,
  equipment: "Foam roller",
  suitability: { menstrual: "ideal", follicular: "suitable", ovulatory: "suitable", luteal: "ideal" },
  description: "Pre-training soft-tissue release. Prepares the posterior chain before loading. From Stacy Sims ROAR Ch6.",
  exercises: [
    {
      name: "Plantar Roll",
      sets: "1",
      duration: "30–60 sec per foot",
      formCue: "Roll heel to ball of foot. Releases fascial tension up the posterior chain.",
      section: "Foot",
    },
    {
      name: "Lower-Back Smash",
      sets: "1",
      duration: "60–90 sec",
      formCue: "Roller at lower back. Rock gently side to side. Relieves compression from sitting or lifting.",
      section: "Lower Back",
    },
    {
      name: "Glute Smash",
      sets: "1",
      duration: "60–90 sec per side",
      formCue: "Figure-four on roller. Lean toward side being rolled. Releases piriformis and deep glutes.",
      section: "Glutes",
    },
    {
      name: "IT Band Roll",
      sets: "1",
      duration: "60–90 sec per leg",
      formCue: "Side-lying, roller under lateral thigh. Roll from just below hip to just above knee. Focus on TFL at top.",
      section: "Lateral",
    },
    {
      name: "Quad Roll",
      sets: "1",
      duration: "60–90 sec per leg",
      formCue: "Face down. Roll hip crease to above knee. Bend and straighten knee for deeper release.",
      section: "Anterior",
    },
    {
      name: "Hamstring Roll",
      sets: "1",
      duration: "60–90 sec per leg",
      formCue: "Sitting, roller under hamstrings. Roll from glute to behind knee. Rotate hip to target different fibres.",
      section: "Posterior",
    },
  ],
};

// ── ROAR BODY WEIGHT POWER MATRIX — ROAR Ch7 ───────────────────────
const SS_ROAR_BW_POWER: Workout = {
  id: "ss-roar-bw-power",
  name: "Body Weight Power Matrix",
  category: "strength",
  duration: "25–30 min",
  durationMin: 27,
  equipment: "None (TRX optional for pistol squat)",
  suitability: { menstrual: "rest", follicular: "suitable", ovulatory: "ideal", luteal: "rest" },
  description: "Week 1 of ROAR Power Move Matrix. Body-weight explosive movements. From Stacy Sims ROAR Ch7.",
  exercises: [
    {
      name: "Body Weight Squat",
      sets: "3",
      reps: "12–15",
      formCue: "Feet shoulder-width, toes slightly out. Thighs parallel. Heels down. Foundation for pistol squat.",
      section: "Lower Body",
    },
    {
      name: "Pistol Squat",
      sets: "3",
      reps: "6–8 per leg",
      formCue: "One leg extended in front. Lower until glute nearly touches heel. Hold TRX or touch box to regress.",
      section: "Lower Body",
    },
    {
      name: "X Lunge",
      sets: "3",
      reps: "10 per leg",
      formCue: "Step diagonally forward and across into curtsy lunge position. Lower rear knee, drive back up.",
      section: "Lower Body",
    },
    {
      name: "Pushup Plank Jump",
      sets: "3",
      reps: "8–10",
      formCue: "Push-up then explosively jump feet to hands and stand. Combines upper strength and lower power.",
      section: "Full Body",
    },
    {
      name: "Burpee",
      sets: "3",
      reps: "8–12",
      formCue: "Squat, hands to floor, jump back to plank. Push-up optional. Jump up with arms overhead.",
      section: "Full Body",
    },
  ],
};

// ── ROAR PLYOMETRIC POWER MATRIX — ROAR Ch7 ─────────────────────────
const SS_ROAR_PLYO_POWER: Workout = {
  id: "ss-roar-plyo-power",
  name: "Plyometric Power Matrix",
  category: "strength",
  duration: "25–30 min",
  durationMin: 27,
  equipment: "Plyo box (18–24 inch)",
  suitability: { menstrual: "rest", follicular: "suitable", ovulatory: "ideal", luteal: "rest" },
  description: "Week 2 emphasis of ROAR Power Matrix. Explosive jump training for reactive strength. From Stacy Sims ROAR Ch7.",
  exercises: [
    {
      name: "Single-Leg Jumping Lunge",
      sets: "3",
      reps: "8 per leg",
      formCue: "Start in lunge. Explode off front foot, land same leg. Stance leg does not switch. High unilateral demand.",
      section: "Jumps",
    },
    {
      name: "High-Knees Power Skip",
      sets: "3",
      duration: "20 metres",
      formCue: "Skip with maximal vertical height. Drive each knee up forcefully with strong arm drive.",
      section: "Jumps",
    },
    {
      name: "Tuck Jump",
      sets: "3",
      reps: "8–10",
      formCue: "Jump explosively and pull both knees to chest at apex. Land softly and rebound.",
      section: "Jumps",
    },
    {
      name: "Jump Squat",
      sets: "3",
      reps: "10–12",
      formCue: "Partial squat then explode vertically. Land through balls of feet to heels. Immediate next rep.",
      section: "Jumps",
    },
    {
      name: "Box Jump",
      sets: "3",
      reps: "6–8",
      formCue: "Swing arms, jump onto box. Land in partial squat. Step down — do NOT jump down.",
      section: "Jumps",
    },
  ],
};

// ── ROAR MEDICINE BALL POWER MATRIX — ROAR Ch7 ──────────────────────
const SS_ROAR_MB_POWER: Workout = {
  id: "ss-roar-mb-power",
  name: "Medicine Ball Power Matrix",
  category: "strength",
  duration: "25–30 min",
  durationMin: 27,
  equipment: "Medicine ball (4–8 kg)",
  suitability: { menstrual: "rest", follicular: "suitable", ovulatory: "ideal", luteal: "rest" },
  description: "Week 3 emphasis of ROAR Power Matrix. Rotational and ballistic medicine ball power. From Stacy Sims ROAR Ch7.",
  exercises: [
    {
      name: "Medicine Ball Twist",
      sets: "3",
      reps: "12 per side",
      formCue: "Russian twist position. Rotate explosively side to side, touch ball to floor each side.",
      section: "Rotational",
    },
    {
      name: "Wall Ball",
      sets: "3",
      reps: "10–12",
      formCue: "Stand 2–3 ft from wall. Squat then drive upward throwing ball at a high target. Catch and repeat.",
      section: "Full Body",
    },
    {
      name: "Ball Slam",
      sets: "3",
      reps: "10",
      formCue: "Hold ball overhead. Violently slam to floor using full body — extension then rapid flexion. Builds explosive lat strength.",
      section: "Full Body",
    },
    {
      name: "Medicine Ball Clean",
      sets: "3",
      reps: "8",
      formCue: "Ball at knee height in hip-hinge. Drive hips and pull ball to chest height in a clean motion. Triple extension.",
      section: "Power",
    },
    {
      name: "Medicine Ball Thruster",
      sets: "3",
      reps: "10",
      formCue: "Ball at chest. Deep squat then drive up pressing ball overhead in one continuous motion.",
      section: "Power",
    },
  ],
};

// ── ROAR KETTLEBELL POWER MATRIX — ROAR Ch7 ─────────────────────────
const SS_ROAR_KB_POWER: Workout = {
  id: "ss-roar-kb-power",
  name: "Kettlebell Power Matrix",
  category: "strength",
  duration: "30–35 min",
  durationMin: 32,
  equipment: "Kettlebell (12–24 kg)",
  suitability: { menstrual: "rest", follicular: "suitable", ovulatory: "ideal", luteal: "suitable" },
  description: "Week 4 emphasis of ROAR Power Matrix. Kettlebell-specific power and coordination. From Stacy Sims ROAR Ch7.",
  exercises: [
    {
      name: "Kettlebell Single-Leg Deadlift",
      sets: "3",
      reps: "8 per leg",
      formCue: "KB in opposite hand from working leg. Hip hinge, hips square. Drive through standing glute.",
      section: "Hinge",
    },
    {
      name: "Hang High Pull",
      sets: "3",
      reps: "8–10",
      formCue: "KB at hip height. Drive hips and shrug explosively, pull to chin height. Elbows flare wide.",
      section: "Pull",
    },
    {
      name: "Snatch Pull and Push Press",
      sets: "3",
      reps: "6 per arm",
      formCue: "Single-arm snatch pull then transition to push press overhead. Learn snatch separately first.",
      section: "Complex",
    },
    {
      name: "Half Get Up",
      sets: "3",
      reps: "5 per side",
      formCue: "Lie back, press KB to ceiling. Roll to supported side-sit keeping bell locked out overhead. Return with control.",
      section: "Complex",
    },
    {
      name: "Kettlebell Swing",
      sets: "3–4",
      reps: "15–20",
      formCue: "Hike KB back between legs then hip snap forward. Power entirely from hip — not arms. Bell projects to chest height.",
      section: "Power",
    },
    {
      name: "Split Squat Kettlebell Pass",
      sets: "3",
      reps: "8 per leg",
      formCue: "Split squat stance. At bottom of squat pass KB under front thigh to other hand. Anti-rotation core demand.",
      section: "Coordination",
    },
  ],
};

// ── ROAR HIIT PROTOCOL — ROAR Ch7 ───────────────────────────────────
const SS_HIIT_PROTOCOL: Workout = {
  id: "ss-hiit-protocol",
  name: "HIIT Training Protocol",
  category: "strength",
  duration: "30–40 min",
  durationMin: 35,
  equipment: "Bike / treadmill / rower",
  suitability: { menstrual: "rest", follicular: "ideal", ovulatory: "ideal", luteal: "suitable" },
  description: "5 rounds of 2 min hard / 2 min easy. Entry-level high-intensity cardio — less stress than SIT. Ideal for building aerobic power. From Stacy Sims ROAR Ch7.",
  progressionNotes: [
    "Work at 85–90% max HR during hard intervals. Walk or easy spin to recover.",
    "Total hard work = 10 min. Add warm-up and cool-down for a 30–40 min session.",
    "Progress to SIT protocol once HIIT feels fully manageable.",
  ],
  exercises: [
    {
      name: "HIIT Hard Effort",
      sets: "5",
      reps: "rounds",
      duration: "2 min on / 2 min off",
      formCue: "85–90% max HR. Walk or easy spin during recovery. Total work: 10 min. RPE 7–8.",
      section: "HIIT Protocol",
    },
  ],
};

// ── ROAR SIT SPRINT PROTOCOL — ROAR Ch7 ─────────────────────────────
const SS_SIT_ROAR: Workout = {
  id: "ss-sit-roar",
  name: "SIT Sprint Protocol",
  category: "strength",
  duration: "25–30 min",
  durationMin: 28,
  equipment: "Bike / treadmill / rower",
  suitability: { menstrual: "rest", follicular: "suitable", ovulatory: "ideal", luteal: "rest" },
  description: "5 × 30-second all-out sprints with 2-min easy recovery. Drives unique fat oxidation and power adaptations. Requires excellent aerobic base. From Stacy Sims ROAR Ch7.",
  progressionNotes: [
    "Truly maximal — RPE 10. Cannot maintain pace any longer at end of each sprint.",
    "2 min complete easy recovery between each. Total sprint work: 2.5 min.",
    "Build to this from the HIIT protocol first.",
  ],
  exercises: [
    {
      name: "SIT All-Out Sprint",
      sets: "5",
      reps: "rounds",
      duration: "30 sec all-out / 2 min easy",
      formCue: "Maximal effort RPE 10. Complete recovery between. 5 rounds. Bike / run / row.",
      section: "SIT Protocol",
    },
  ],
};

export const STACY_SIMS_WORKOUTS: Workout[] = [
  SS_SIT_PROTOCOLS,
  SS_PELVIC_FLOOR,
  SS_HEAVY_LIFTING,
  SS_PLYO_BEGINNER,
  SS_PLYO_INTERMEDIATE,
  SS_PLYO_ADVANCED,
  SS_FOAM_ROLLING,
  SS_MOBILITY,
  SS_CORE_STABILITY,
  SS_PEP_PLAN,
  SS_ROAR_FOAM_ROLLING,
  SS_ROAR_BW_POWER,
  SS_ROAR_PLYO_POWER,
  SS_ROAR_MB_POWER,
  SS_ROAR_KB_POWER,
  SS_HIIT_PROTOCOL,
  SS_SIT_ROAR,
];
