/**
 * ⚠️ ARCHIVED – replaced by src/data/signal-training-paths.ts. Preserved for reference only.
 * DO NOT DELETE.
 *
 * Original purpose: static seed data for the "Lose Weight + Build Muscle" combo,
 * used as a fallback when AI generation was unavailable. The new SIGNAL Training Paths
 * are the canonical source. Type exports remain available for any transitional code paths.
 */

export interface WarmUpExercise {
  name: string;
  duration: string;
}

export interface BlockExercise {
  name: string;
  sets: number;
  reps_or_duration: string;
  rest: string;
  tempo?: string;
  form_cue: string;
}

export interface MainBlock {
  section_label: string;
  exercises: BlockExercise[];
}

export interface CoolDownExercise {
  name: string;
  duration: string;
}

export interface SessionDay {
  day: number;
  name: string;
  category: "strength" | "cardio" | "hiit" | "yoga" | "mobility" | "circuit" | "active-recovery" | "rest";
  durationMin: number;
  intensity: "low" | "moderate" | "high" | "very-high";
  warm_up: WarmUpExercise[];
  main_block: MainBlock[];
  cool_down: CoolDownExercise[];
  coaching_note: string;
}

export interface PlanWeek {
  week: number;
  theme: "Foundation" | "Build" | "Peak" | "Deload";
  days: SessionDay[];
}

export interface WorkoutPlan {
  id: string;
  goals: string[];
  summary: string;
  weeks: PlanWeek[];
}

// ── Goal modification rules ──
export interface GoalModification {
  goal: string;
  description: string;
  modifications: string[];
  extra_exercises?: { name: string; sets: string; purpose: string }[];
}

export const GOAL_MODIFICATIONS: GoalModification[] = [
  {
    goal: "Fix posture",
    description: "Add 15-min corrective block to Days 1, 3, 6",
    modifications: [
      "Add corrective block before main exercises on strength days",
      "Poor posture is a strength and mobility deficit, not a habit issue",
    ],
    extra_exercises: [
      { name: "Wall Angels", sets: "2 × 10", purpose: "Thoracic extension, scapular control" },
      { name: "Band Pull-Apart", sets: "2 × 15", purpose: "Posterior deltoid, rhomboid activation" },
      { name: "Face Pull", sets: "2 × 15", purpose: "External rotation, rotator cuff" },
      { name: "Dead Bug", sets: "2 × 8/side", purpose: "Deep core activation, lumbar stability" },
      { name: "Hip Flexor Stretch (kneeling)", sets: "60 sec/side", purpose: "Counteracts hip flexor tightness" },
      { name: "Thoracic Rotation (half kneeling)", sets: "8/side", purpose: "Thoracic mobility" },
      { name: "Chin Tuck (wall)", sets: "2 × 10", purpose: "Cervical alignment, deep neck flexors" },
    ],
  },
  {
    goal: "Improve flexibility",
    description: "Dynamic warm-ups + 15 min PNF stretching post-session",
    modifications: [
      "Replace static stretching in warm-ups with dynamic mobility",
      "Add 15 min PNF stretching after every session",
      "PNF protocol: Contract 5–7 sec (50%), relax, deepen stretch — 3× per muscle",
      "Replace 1 HIIT session with 45 min yoga flow",
    ],
  },
  {
    goal: "Stress relief",
    description: "Replace 1 HIIT with walk/yoga, add breathwork cool-downs",
    modifications: [
      "Replace 1 HIIT session per week with 40-min nature walk or yoga",
      "End every session with 8–10 min breathwork (box breathing 4-4-4-4)",
      "Reduce all sessions to RPE ≤ 7 during high-stress periods",
      "Prioritise sleep over training",
    ],
  },
  {
    goal: "Build endurance",
    description: "Progressive run/cycle programming with 10% rule",
    modifications: [
      "Week 1: 3 × 20 min easy (Zone 2) + 1 × 20 min threshold + 2 strength",
      "Week 2: 2 × 25 min easy + 1 × 30 min + 1 × interval session",
      "Week 3: 1 × 35 min + 1 × 30 min + 1 × 25 min + time trial",
      "Week 4: Deload — 2 × 20 min easy jog only",
      "Never increase weekly mileage by more than 10%",
    ],
  },
  {
    goal: "More energy",
    description: "Morning sessions, Zone 2 focus, no sessions over 60 min",
    modifications: [
      "Prioritise morning sessions (before 10am) — aligns with cortisol peak",
      "Emphasise Zone 2 cardio (improves mitochondrial density)",
      "No sessions over 60 min (diminishing returns, increases cortisol)",
      "Include 5 min sunlight exposure in Day 1",
      "Prioritise sleep quality",
    ],
  },
];

// ── Evidence references ──
export const EVIDENCE_REFERENCES = [
  { topic: "Progressive overload", citation: "Schoenfeld, B.J. (2010). Journal of Strength and Conditioning Research" },
  { topic: "Combination training for fat loss", citation: "Willis et al. (2012). American Journal of Physiology" },
  { topic: "EPOC and HIIT", citation: "Børsheim & Bahr (2003). Sports Medicine" },
  { topic: "Hip Thrust EMG", citation: "Contreras et al. (2015). Journal of Strength and Conditioning Research" },
  { topic: "Deload and supercompensation", citation: "Kiely, J. (2012). Sports Medicine" },
  { topic: "Zone 2 and mitochondria", citation: "Holloszy, J.O. (1967). Journal of Biological Chemistry" },
  { topic: "PNF stretching", citation: "Hindle et al. (2012). Journal of Human Kinetics" },
  { topic: "Corrective exercise for posture", citation: "Page, Frank & Lardner (2010). Assessment and Treatment of Muscle Imbalance" },
];

// ── LOSE WEIGHT + BUILD MUSCLE — Full 4-week plan ──

const LOSE_WEIGHT_BUILD_MUSCLE: WorkoutPlan = {
  id: "lose-weight-build-muscle",
  goals: ["Lose weight", "Build muscle"],
  summary: "Your plan combines progressive strength training with metabolic conditioning to simultaneously build lean muscle and accelerate fat loss — the most evidence-supported approach for body recomposition. Weeks 1–2 establish your movement patterns and aerobic base. Week 3 peaks intensity with heavier lifts and high-output intervals. Week 4 consolidates gains with a strategic deload to prevent overtraining and lock in adaptation. Expect noticeable strength and body composition shifts by Week 3. Your first session is ready in the Today tab.",
  weeks: [
    // ══════════════════════════════════════
    // WEEK 1 — FOUNDATION
    // ══════════════════════════════════════
    {
      week: 1,
      theme: "Foundation",
      days: [
        {
          day: 1,
          name: "Full Body Strength (Foundation)",
          category: "strength",
          durationMin: 50,
          intensity: "moderate",
          warm_up: [
            { name: "Leg swings (forward + lateral)", duration: "1 min" },
            { name: "Hip circles", duration: "1 min" },
            { name: "Cat-cow thoracic mobility", duration: "1 min" },
            { name: "Arm circles + shoulder rolls", duration: "1 min" },
            { name: "Bodyweight squat (slow)", duration: "10 reps" },
            { name: "Glute bridges", duration: "10 reps" },
            { name: "Dead bug (controlled)", duration: "6 reps per side" },
          ],
          main_block: [
            {
              section_label: "Strength A",
              exercises: [
                { name: "Goblet Squat", sets: 3, reps_or_duration: "12", rest: "60 sec", form_cue: "Chest tall, knees track toes, hinge then squat" },
                { name: "Romanian Deadlift (DB)", sets: 3, reps_or_duration: "12", rest: "60 sec", form_cue: "Push hips back, soft knee, bar stays close to shins" },
                { name: "Incline DB Press", sets: 3, reps_or_duration: "10", rest: "75 sec", form_cue: "Retract shoulder blades, controlled descent" },
                { name: "Seated Cable Row", sets: 3, reps_or_duration: "12", rest: "60 sec", form_cue: "Drive elbows to hips, squeeze at end range" },
                { name: "Lateral Lunge", sets: 3, reps_or_duration: "10 per side", rest: "60 sec", form_cue: "Sit into the hip, grounded heel" },
              ],
            },
            {
              section_label: "Conditioning Finisher",
              exercises: [
                { name: "KB Swing", sets: 2, reps_or_duration: "40 sec", rest: "20 sec", form_cue: "Hip hinge power, not a squat; glutes fire at top" },
                { name: "Box Step-Up", sets: 2, reps_or_duration: "40 sec", rest: "20 sec", form_cue: "Drive through the heel, full hip extension at top" },
                { name: "Mountain Climbers", sets: 2, reps_or_duration: "40 sec", rest: "20 sec", form_cue: "Maintain plank position, don't let hips sag" },
              ],
            },
          ],
          cool_down: [
            { name: "90/90 hip stretch", duration: "90 sec per side" },
            { name: "Pigeon pose", duration: "60 sec per side" },
            { name: "Doorway chest stretch", duration: "45 sec per side" },
            { name: "Child's pose", duration: "60 sec" },
          ],
          coaching_note: "Week 1 is about quality over load. Focus on feeling each muscle work — this neural patterning is what drives long-term results.",
        },
        {
          day: 2,
          name: "Zone 2 Cardio + Core",
          category: "cardio",
          durationMin: 40,
          intensity: "low",
          warm_up: [
            { name: "Light walk building to brisk pace", duration: "3 min" },
          ],
          main_block: [
            {
              section_label: "Cardio Block",
              exercises: [
                { name: "Steady-state cardio (walk/jog/cycle)", sets: 1, reps_or_duration: "25 min at 60–70% max HR", rest: "–", form_cue: "You can hold a conversation but it feels slightly uncomfortable. Target 120–135 bpm." },
              ],
            },
            {
              section_label: "Core Block",
              exercises: [
                { name: "Dead Bug", sets: 3, reps_or_duration: "8 per side", rest: "30 sec", form_cue: "Lower back pressed to floor at all times" },
                { name: "Pallof Press", sets: 3, reps_or_duration: "10 per side", rest: "30 sec", form_cue: "Resist rotation through the core" },
                { name: "Plank", sets: 3, reps_or_duration: "30 sec", rest: "30 sec", form_cue: "Squeeze glutes, neutral spine, breathe" },
                { name: "Side Plank", sets: 2, reps_or_duration: "25 sec per side", rest: "30 sec", form_cue: "Hip stacked, don't let it sag" },
              ],
            },
          ],
          cool_down: [
            { name: "Seated hamstring stretch", duration: "45 sec per side" },
            { name: "Calf stretch", duration: "30 sec per side" },
            { name: "Standing quad pull", duration: "30 sec per side" },
          ],
          coaching_note: "Zone 2 cardio improves mitochondrial density — your body's ability to use fat as fuel. It is the foundation of all fat loss and endurance.",
        },
        {
          day: 3,
          name: "Upper Body Strength",
          category: "strength",
          durationMin: 50,
          intensity: "moderate",
          warm_up: [
            { name: "Band pull-aparts", duration: "15 reps" },
            { name: "Scapular push-ups", duration: "10 reps" },
            { name: "Arm across body stretch", duration: "30 sec per side" },
            { name: "Wall angels", duration: "10 reps" },
            { name: "Inchworm to hip flexor stretch", duration: "5 reps" },
          ],
          main_block: [
            {
              section_label: "Push",
              exercises: [
                { name: "DB Bench Press", sets: 3, reps_or_duration: "10", rest: "75 sec", form_cue: "Feet flat, arch not excessive, full ROM" },
                { name: "Overhead Press (DB)", sets: 3, reps_or_duration: "10", rest: "75 sec", form_cue: "Brace core, no lower back arch, lock out overhead" },
                { name: "Cable Lateral Raise", sets: 3, reps_or_duration: "15", rest: "45 sec", form_cue: "Lead with elbow, control the descent" },
              ],
            },
            {
              section_label: "Pull",
              exercises: [
                { name: "Lat Pulldown", sets: 3, reps_or_duration: "12", rest: "75 sec", form_cue: "Lean back slightly, drive elbows to hip pockets" },
                { name: "Single-Arm DB Row", sets: 3, reps_or_duration: "12 per side", rest: "60 sec", form_cue: "Row to hip, not armpit; rotate slightly" },
                { name: "Face Pull", sets: 3, reps_or_duration: "15", rest: "45 sec", form_cue: "Pull to eye level, thumbs back, crucial for shoulder health" },
              ],
            },
            {
              section_label: "Superset Finisher",
              exercises: [
                { name: "DB Bicep Curl", sets: 3, reps_or_duration: "12", rest: "30 sec", form_cue: "No swinging, controlled eccentric" },
                { name: "Tricep Overhead Extension", sets: 3, reps_or_duration: "12", rest: "30 sec", form_cue: "Keep elbows close to head, full extension" },
              ],
            },
          ],
          cool_down: [
            { name: "Doorway chest stretch", duration: "45 sec per side" },
            { name: "Lat stretch (doorframe)", duration: "30 sec per side" },
            { name: "Wrist/forearm extension", duration: "30 sec per side" },
          ],
          coaching_note: "Face pulls are non-negotiable. They counteract forward rounding from daily life and protect the rotator cuff — essential for long-term shoulder health.",
        },
        {
          day: 4,
          name: "Active Recovery / Mobility",
          category: "active-recovery",
          durationMin: 35,
          intensity: "low",
          warm_up: [
            { name: "Easy walk or light cycle", duration: "10 min" },
          ],
          main_block: [
            {
              section_label: "Mobility Flow",
              exercises: [
                { name: "Standing Hip CARs", sets: 1, reps_or_duration: "5 reps per side", rest: "–", form_cue: "Controlled articular rotations — max range, slow" },
                { name: "Thoracic Rotation (half kneeling)", sets: 1, reps_or_duration: "8 per side", rest: "–", form_cue: "Rotate through mid-back, not lower back" },
                { name: "World's Greatest Stretch", sets: 1, reps_or_duration: "5 per side", rest: "–", form_cue: "Lunge, rotate, reach — full body opener" },
                { name: "Deep Squat Hold with Rotation", sets: 1, reps_or_duration: "60 sec", rest: "–", form_cue: "Heels down, chest tall, rotate to each side" },
                { name: "Figure-4 Glute Stretch", sets: 1, reps_or_duration: "60 sec per side", rest: "–", form_cue: "Keep pelvis neutral, breathe into the stretch" },
                { name: "Supine Spinal Twist", sets: 1, reps_or_duration: "60 sec per side", rest: "–", form_cue: "Relax into the floor, let gravity do the work" },
              ],
            },
            {
              section_label: "Breathwork",
              exercises: [
                { name: "Diaphragmatic / Box Breathing", sets: 1, reps_or_duration: "5 min", rest: "–", form_cue: "Inhale 4 sec, hold 4 sec, exhale 4 sec, hold 4 sec" },
              ],
            },
          ],
          cool_down: [],
          coaching_note: "Recovery is where adaptation happens. Skipping this day is the most common mistake — it leads to overtraining and plateau.",
        },
        {
          day: 5,
          name: "HIIT Metabolic Circuit",
          category: "hiit",
          durationMin: 45,
          intensity: "high",
          warm_up: [
            { name: "Light jog or skip", duration: "5 min" },
            { name: "Leg swings + hip circles", duration: "2 min" },
            { name: "High knees + butt kicks", duration: "2 min" },
            { name: "Arm circles", duration: "1 min" },
          ],
          main_block: [
            {
              section_label: "Circuit A — Lower Body Metabolic (3 rounds, 40:20)",
              exercises: [
                { name: "Jump Squat (or Squat)", sets: 3, reps_or_duration: "40 sec", rest: "20 sec", form_cue: "Land softly, absorb through the whole foot" },
                { name: "Reverse Lunge to Knee Drive", sets: 3, reps_or_duration: "40 sec", rest: "20 sec", form_cue: "Drive knee up to hip height" },
                { name: "Lateral Band Walk", sets: 3, reps_or_duration: "40 sec", rest: "20 sec", form_cue: "Constant tension, don't let knees cave" },
                { name: "Sumo Squat Pulse", sets: 3, reps_or_duration: "40 sec", rest: "20 sec", form_cue: "Hips below parallel, heels down" },
              ],
            },
            {
              section_label: "Circuit B — Full Body Power (3 rounds, 40:20)",
              exercises: [
                { name: "Burpee (step or jump out)", sets: 3, reps_or_duration: "40 sec", rest: "20 sec", form_cue: "Plank position must be solid before jump" },
                { name: "KB or DB Swing", sets: 3, reps_or_duration: "40 sec", rest: "20 sec", form_cue: "Hip hinge power, not a squat; glutes fire at top" },
                { name: "Push-Up to Renegade Row", sets: 3, reps_or_duration: "40 sec", rest: "20 sec", form_cue: "Stable plank, no hip rotation on the row" },
                { name: "Skater Hop", sets: 3, reps_or_duration: "40 sec", rest: "20 sec", form_cue: "Land on single leg, load the hip" },
              ],
            },
          ],
          cool_down: [
            { name: "Slow walk", duration: "2 min" },
            { name: "Standing pigeon", duration: "60 sec per side" },
            { name: "Low lunge with twist", duration: "45 sec per side" },
            { name: "Seated forward fold", duration: "60 sec" },
            { name: "Supine knees-to-chest", duration: "60 sec" },
          ],
          coaching_note: "HIIT creates excess post-exercise oxygen consumption (EPOC) — your metabolism stays elevated for up to 24 hours. 2× per week is optimal; more reduces returns (Børsheim & Bahr, 2003).",
        },
        {
          day: 6,
          name: "Lower Body Strength",
          category: "strength",
          durationMin: 55,
          intensity: "high",
          warm_up: [
            { name: "Banded clamshells", duration: "15 reps" },
            { name: "Banded glute bridge", duration: "15 reps" },
            { name: "Single-leg hip thrust", duration: "8 per side" },
          ],
          main_block: [
            {
              section_label: "Primary Lifts",
              exercises: [
                { name: "Barbell Back Squat (or DB Goblet)", sets: 4, reps_or_duration: "8", rest: "90 sec", form_cue: "Break at hips and knees simultaneously; depth below parallel if mobility allows" },
                { name: "Romanian Deadlift", sets: 4, reps_or_duration: "10", rest: "90 sec", form_cue: "Hinge until hamstring tension, maintain neutral spine" },
                { name: "Bulgarian Split Squat", sets: 3, reps_or_duration: "10 per side", rest: "75 sec", form_cue: "Front foot far enough that shin stays vertical" },
              ],
            },
            {
              section_label: "Accessory",
              exercises: [
                { name: "Leg Press (or Step-Up)", sets: 3, reps_or_duration: "12", rest: "60 sec", form_cue: "Full ROM, don't lock knees at top" },
                { name: "Nordic Hamstring Curl (or Swiss Ball Curl)", sets: 3, reps_or_duration: "8", rest: "75 sec", form_cue: "Eccentric focused — resist the lowering phase" },
                { name: "Standing Calf Raise", sets: 3, reps_or_duration: "15", rest: "45 sec", form_cue: "Full plantar flexion, pause at top" },
              ],
            },
          ],
          cool_down: [
            { name: "Couch stretch", duration: "60 sec per side" },
            { name: "Pigeon pose", duration: "90 sec per side" },
            { name: "Supine hamstring stretch", duration: "45 sec per side" },
          ],
          coaching_note: "The Bulgarian split squat is one of the most effective single-leg exercises in evidence-based literature for lower body hypertrophy and injury prevention. Own it — it gets easier.",
        },
        {
          day: 7,
          name: "Rest or Gentle Walk",
          category: "rest",
          durationMin: 0,
          intensity: "low",
          warm_up: [],
          main_block: [
            {
              section_label: "Optional",
              exercises: [
                { name: "Easy walk (under 50% HR max)", sets: 1, reps_or_duration: "20–30 min", rest: "–", form_cue: "Gentle pace, enjoy it — no performance pressure" },
                { name: "Full-body light stretch", sets: 1, reps_or_duration: "10 min", rest: "–", form_cue: "Hold each stretch gently, no forcing" },
              ],
            },
          ],
          cool_down: [],
          coaching_note: "Rest is not optional — it's when your muscles actually grow. Sleep 7–9 hours tonight.",
        },
      ],
    },

    // ══════════════════════════════════════
    // WEEK 2 — BUILD
    // ══════════════════════════════════════
    {
      week: 2,
      theme: "Build",
      days: [
        {
          day: 1,
          name: "Full Body Strength (Build)",
          category: "strength",
          durationMin: 55,
          intensity: "high",
          warm_up: [
            { name: "Leg swings (forward + lateral)", duration: "1 min" },
            { name: "Hip circles", duration: "1 min" },
            { name: "Cat-cow thoracic mobility", duration: "1 min" },
            { name: "Arm circles + shoulder rolls", duration: "1 min" },
            { name: "Bodyweight squat (slow)", duration: "10 reps" },
            { name: "Glute bridges", duration: "10 reps" },
            { name: "Dead bug (controlled)", duration: "6 reps per side" },
          ],
          main_block: [
            {
              section_label: "Strength A (Progressed)",
              exercises: [
                { name: "Goblet Squat", sets: 4, reps_or_duration: "12", rest: "60 sec", form_cue: "Chest tall, knees track toes, hinge then squat" },
                { name: "Romanian Deadlift (DB)", sets: 4, reps_or_duration: "12", rest: "60 sec", form_cue: "Push hips back, soft knee, bar stays close to shins" },
                { name: "Incline DB Press", sets: 4, reps_or_duration: "10", rest: "75 sec", form_cue: "Retract shoulder blades, controlled descent" },
                { name: "Seated Cable Row", sets: 4, reps_or_duration: "12", rest: "60 sec", form_cue: "Drive elbows to hips, squeeze at end range" },
                { name: "Lateral Lunge", sets: 3, reps_or_duration: "12", rest: "60 sec", form_cue: "Sit into the hip, grounded heel" },
              ],
            },
            {
              section_label: "Conditioning Finisher (3 rounds)",
              exercises: [
                { name: "KB Swing", sets: 3, reps_or_duration: "40 sec", rest: "20 sec", form_cue: "Hip hinge power, explosive" },
                { name: "Box Step-Up", sets: 3, reps_or_duration: "40 sec", rest: "20 sec", form_cue: "Drive through heel, full extension" },
                { name: "Mountain Climbers", sets: 3, reps_or_duration: "40 sec", rest: "20 sec", form_cue: "Maintain plank, drive knees to chest" },
              ],
            },
          ],
          cool_down: [
            { name: "90/90 hip stretch", duration: "90 sec per side" },
            { name: "Pigeon pose", duration: "60 sec per side" },
            { name: "Doorway chest stretch", duration: "45 sec per side" },
            { name: "Child's pose", duration: "60 sec" },
          ],
          coaching_note: "Progressive overload is the single most validated principle in resistance training research. Small, consistent increases compound dramatically over months (Schoenfeld, 2010).",
        },
        {
          day: 2,
          name: "Zone 2 Cardio + Core (Build)",
          category: "cardio",
          durationMin: 45,
          intensity: "low",
          warm_up: [{ name: "Light walk building to brisk pace", duration: "3 min" }],
          main_block: [
            {
              section_label: "Cardio Block (Progressed)",
              exercises: [
                { name: "Steady-state cardio", sets: 1, reps_or_duration: "30 min at 60–70% max HR", rest: "–", form_cue: "Increased duration is the overload this week" },
              ],
            },
            {
              section_label: "Core Progression",
              exercises: [
                { name: "Dead Bug", sets: 3, reps_or_duration: "10 per side", rest: "30 sec", form_cue: "Lower back pressed to floor at all times" },
                { name: "Pallof Press", sets: 3, reps_or_duration: "12 per side", rest: "30 sec", form_cue: "Resist rotation through the core" },
                { name: "Plank", sets: 3, reps_or_duration: "40 sec", rest: "30 sec", form_cue: "Squeeze glutes, neutral spine" },
                { name: "Side Plank", sets: 3, reps_or_duration: "30 sec per side", rest: "30 sec", form_cue: "Hip stacked, don't let it sag" },
                { name: "Stir-the-Pot (stability ball)", sets: 3, reps_or_duration: "10 per direction", rest: "30 sec", form_cue: "Keep hips square, move from the core" },
              ],
            },
          ],
          cool_down: [
            { name: "Seated hamstring stretch", duration: "45 sec per side" },
            { name: "Calf stretch", duration: "30 sec per side" },
            { name: "Standing quad pull", duration: "30 sec per side" },
          ],
          coaching_note: "Zone 2 builds your aerobic base. The 5 extra minutes this week is progressive overload applied to cardio — same principle as adding reps.",
        },
        {
          day: 3,
          name: "Upper Body Strength (Build)",
          category: "strength",
          durationMin: 55,
          intensity: "high",
          warm_up: [
            { name: "Band pull-aparts", duration: "15 reps" },
            { name: "Scapular push-ups", duration: "10 reps" },
            { name: "Wall angels", duration: "10 reps" },
            { name: "Inchworm to hip flexor stretch", duration: "5 reps" },
          ],
          main_block: [
            {
              section_label: "Push (Progressed)",
              exercises: [
                { name: "DB Bench Press", sets: 4, reps_or_duration: "10", rest: "75 sec", form_cue: "Feet flat, arch not excessive, full ROM" },
                { name: "Overhead Press (DB)", sets: 4, reps_or_duration: "10", rest: "75 sec", form_cue: "Brace core, no lower back arch" },
                { name: "Cable Lateral Raise", sets: 3, reps_or_duration: "15 (+load)", rest: "45 sec", form_cue: "Lead with elbow, control the descent" },
              ],
            },
            {
              section_label: "Pull (Progressed)",
              exercises: [
                { name: "Lat Pulldown", sets: 4, reps_or_duration: "12", rest: "75 sec", form_cue: "Lean back slightly, drive elbows to hip pockets" },
                { name: "Single-Arm DB Row", sets: 4, reps_or_duration: "12 per side", rest: "60 sec", form_cue: "Row to hip, not armpit" },
                { name: "Face Pull", sets: 4, reps_or_duration: "15", rest: "45 sec", form_cue: "Pull to eye level, thumbs back" },
                { name: "Chest-Supported Row", sets: 3, reps_or_duration: "12", rest: "60 sec", form_cue: "Removes lower back compensation — focus on upper back squeeze" },
              ],
            },
          ],
          cool_down: [
            { name: "Doorway chest stretch", duration: "45 sec per side" },
            { name: "Lat stretch", duration: "30 sec per side" },
            { name: "Wrist/forearm extension", duration: "30 sec per side" },
          ],
          coaching_note: "Chest-supported row is new this week — it eliminates lower back fatigue and lets you focus purely on upper back contraction. Quality reps.",
        },
        {
          day: 4,
          name: "Active Recovery / Yoga Flow",
          category: "active-recovery",
          durationMin: 40,
          intensity: "low",
          warm_up: [],
          main_block: [
            {
              section_label: "Yoga Flow Sequence",
              exercises: [
                { name: "Cat-Cow", sets: 1, reps_or_duration: "10 reps", rest: "–", form_cue: "Breathe in on extension, out on flexion" },
                { name: "Thread the Needle", sets: 1, reps_or_duration: "8 per side", rest: "–", form_cue: "Rotate through the thoracic spine" },
                { name: "Downward Dog to Cobra Flow", sets: 1, reps_or_duration: "5 reps", rest: "–", form_cue: "Smooth transitions, synchronise with breath" },
                { name: "Low Lunge to Lizard", sets: 1, reps_or_duration: "60 sec per side", rest: "–", form_cue: "Sink hips forward, breathe into the stretch" },
                { name: "Pigeon Pose", sets: 1, reps_or_duration: "90 sec per side", rest: "–", form_cue: "Relax into it, don't force depth" },
                { name: "Supine Twist", sets: 1, reps_or_duration: "60 sec per side", rest: "–", form_cue: "Let gravity do the work" },
                { name: "Savasana with Breathwork", sets: 1, reps_or_duration: "5 min", rest: "–", form_cue: "Complete relaxation, diaphragmatic breathing" },
              ],
            },
          ],
          cool_down: [],
          coaching_note: "Active recovery enhances blood flow and nutrient delivery to recovering muscles. This is not laziness — it's strategic recovery.",
        },
        {
          day: 5,
          name: "HIIT Metabolic Circuit (Build)",
          category: "hiit",
          durationMin: 45,
          intensity: "high",
          warm_up: [
            { name: "Light jog or skip", duration: "5 min" },
            { name: "Dynamic mobility", duration: "5 min" },
          ],
          main_block: [
            {
              section_label: "Circuit A — Lower Body (4 rounds, 45:15)",
              exercises: [
                { name: "Jump Squat (or Squat)", sets: 4, reps_or_duration: "45 sec", rest: "15 sec", form_cue: "Land softly, absorb through the whole foot" },
                { name: "Reverse Lunge to Knee Drive", sets: 4, reps_or_duration: "45 sec", rest: "15 sec", form_cue: "Drive knee up to hip height" },
                { name: "Lateral Band Walk", sets: 4, reps_or_duration: "45 sec", rest: "15 sec", form_cue: "Constant tension, don't let knees cave" },
                { name: "Sumo Squat Pulse", sets: 4, reps_or_duration: "45 sec", rest: "15 sec", form_cue: "Hips below parallel, heels down" },
              ],
            },
            {
              section_label: "Circuit B — Full Body (4 rounds, 45:15)",
              exercises: [
                { name: "Burpee (step or jump)", sets: 4, reps_or_duration: "45 sec", rest: "15 sec", form_cue: "Plank position must be solid" },
                { name: "KB or DB Swing", sets: 4, reps_or_duration: "45 sec", rest: "15 sec", form_cue: "Hip hinge power, glutes fire at top" },
                { name: "Push-Up to Renegade Row", sets: 4, reps_or_duration: "45 sec", rest: "15 sec", form_cue: "Stable plank, no hip rotation" },
                { name: "Skater Hop", sets: 4, reps_or_duration: "45 sec", rest: "15 sec", form_cue: "Land on single leg, load the hip" },
                { name: "Tuck Jump (round finisher)", sets: 4, reps_or_duration: "15 sec", rest: "15 sec", form_cue: "Knees to chest, soft landing" },
              ],
            },
          ],
          cool_down: [
            { name: "Slow walk", duration: "2 min" },
            { name: "Standing pigeon", duration: "60 sec per side" },
            { name: "Low lunge with twist", duration: "45 sec per side" },
            { name: "Seated forward fold", duration: "60 sec" },
          ],
          coaching_note: "Work-to-rest ratio upgraded to 45:15 and rounds increased to 4. This is progressive overload for conditioning — your cardiovascular system adapts the same way muscles do.",
        },
        {
          day: 6,
          name: "Lower Body Strength (Build)",
          category: "strength",
          durationMin: 60,
          intensity: "high",
          warm_up: [
            { name: "Banded clamshells", duration: "15 reps" },
            { name: "Banded glute bridge", duration: "15 reps" },
            { name: "Single-leg hip thrust", duration: "8 per side" },
          ],
          main_block: [
            {
              section_label: "Primary Lifts (Progressed)",
              exercises: [
                { name: "Barbell Back Squat (or Goblet)", sets: 4, reps_or_duration: "8 (+2.5–5kg)", rest: "90 sec", form_cue: "Break at hips and knees simultaneously, depth below parallel" },
                { name: "Romanian Deadlift", sets: 4, reps_or_duration: "10 (+2.5kg)", rest: "90 sec", form_cue: "Hinge until hamstring tension, neutral spine" },
                { name: "Bulgarian Split Squat", sets: 4, reps_or_duration: "10 per side", rest: "75 sec", form_cue: "Shin stays vertical, drive through front heel" },
                { name: "Hip Thrust", sets: 4, reps_or_duration: "12", rest: "75 sec", form_cue: "Posterior pelvic tilt at top, full hip extension. Strongest glute activation exercise (Contreras et al., 2015)" },
              ],
            },
            {
              section_label: "Accessory",
              exercises: [
                { name: "Leg Press (or Step-Up)", sets: 3, reps_or_duration: "12", rest: "60 sec", form_cue: "Full ROM, don't lock knees at top" },
                { name: "Nordic Hamstring Curl", sets: 3, reps_or_duration: "8", rest: "75 sec", form_cue: "Eccentric focused — resist the lowering phase" },
                { name: "Standing Calf Raise", sets: 3, reps_or_duration: "15", rest: "45 sec", form_cue: "Full plantar flexion, pause at top" },
              ],
            },
          ],
          cool_down: [
            { name: "Couch stretch", duration: "60 sec per side" },
            { name: "Pigeon pose", duration: "90 sec per side" },
            { name: "Supine hamstring stretch", duration: "45 sec per side" },
          ],
          coaching_note: "Hip Thrust is new this week — it has the strongest glute activation of any exercise in the research literature (Contreras et al., 2015). Focus on the mind-muscle connection.",
        },
        {
          day: 7,
          name: "Rest or Walk",
          category: "rest",
          durationMin: 0,
          intensity: "low",
          warm_up: [],
          main_block: [
            {
              section_label: "Optional",
              exercises: [
                { name: "Easy walk", sets: 1, reps_or_duration: "20–30 min", rest: "–", form_cue: "Gentle pace, recovery focused" },
              ],
            },
          ],
          cool_down: [],
          coaching_note: "Your body builds strength during rest, not during training. Honour this day.",
        },
      ],
    },

    // ══════════════════════════════════════
    // WEEK 3 — PEAK
    // ══════════════════════════════════════
    {
      week: 3,
      theme: "Peak",
      days: [
        {
          day: 1,
          name: "Full Body Strength (Peak)",
          category: "strength",
          durationMin: 60,
          intensity: "high",
          warm_up: [
            { name: "Leg swings (forward + lateral)", duration: "1 min" },
            { name: "Hip circles", duration: "1 min" },
            { name: "Cat-cow thoracic mobility", duration: "1 min" },
            { name: "Bodyweight squat (slow)", duration: "10 reps" },
            { name: "Glute bridges", duration: "10 reps" },
          ],
          main_block: [
            {
              section_label: "Strength A — Tempo Reps (RPE 8–9)",
              exercises: [
                { name: "Goblet Squat", sets: 4, reps_or_duration: "10", rest: "75 sec", tempo: "3-1-1", form_cue: "3 sec down, 1 sec pause at bottom, explode up" },
                { name: "Romanian Deadlift", sets: 4, reps_or_duration: "10", rest: "75 sec", tempo: "3-1-1", form_cue: "3 sec hinge, controlled throughout" },
                { name: "Incline DB Press", sets: 4, reps_or_duration: "8", rest: "90 sec", tempo: "3-0-1", form_cue: "Heavier load, full ROM, retract blades" },
                { name: "Pendlay Row", sets: 4, reps_or_duration: "8", rest: "90 sec", tempo: "1-0-1", form_cue: "Explosive pull, dead stop each rep" },
                { name: "Lateral Lunge", sets: 4, reps_or_duration: "10 per side", rest: "60 sec", tempo: "2-1-1", form_cue: "Pause at bottom for 1 sec" },
              ],
            },
            {
              section_label: "Conditioning Finisher (4 rounds)",
              exercises: [
                { name: "KB Swing", sets: 4, reps_or_duration: "15 reps", rest: "30 sec", form_cue: "Explosive hip drive" },
                { name: "Box Jump (or Step-Up)", sets: 4, reps_or_duration: "10 reps", rest: "30 sec", form_cue: "Land softly, step down" },
                { name: "Battle Rope", sets: 4, reps_or_duration: "30 sec", rest: "30 sec", form_cue: "Full body engagement, maintain rhythm" },
              ],
            },
          ],
          cool_down: [
            { name: "90/90 hip stretch", duration: "90 sec per side" },
            { name: "Pigeon pose", duration: "60 sec per side" },
            { name: "Child's pose", duration: "90 sec" },
          ],
          coaching_note: "Week 3 peak. Tempo reps increase time under tension — the key driver of hypertrophy. This will feel harder than adding weight alone.",
        },
        {
          day: 2,
          name: "Zone 2 + Tempo Run Option",
          category: "cardio",
          durationMin: 45,
          intensity: "moderate",
          warm_up: [{ name: "Light walk", duration: "3 min" }],
          main_block: [
            {
              section_label: "Cardio Options",
              exercises: [
                { name: "Zone 2 Cardio", sets: 1, reps_or_duration: "35 min at 60–70% max HR", rest: "–", form_cue: "Option A: Full 35 min Zone 2" },
                { name: "Zone 2 + Threshold Intervals", sets: 1, reps_or_duration: "25 min Zone 2 + 2 × 5 min threshold", rest: "3 min easy between", form_cue: "Option B: Threshold = can't hold conversation" },
              ],
            },
            {
              section_label: "Core",
              exercises: [
                { name: "Dead Bug", sets: 3, reps_or_duration: "12 per side", rest: "30 sec", form_cue: "Lower back pressed to floor" },
                { name: "Plank", sets: 3, reps_or_duration: "45 sec", rest: "30 sec", form_cue: "Squeeze everything, neutral spine" },
              ],
            },
          ],
          cool_down: [
            { name: "Seated hamstring stretch", duration: "45 sec per side" },
            { name: "Calf stretch", duration: "30 sec per side" },
          ],
          coaching_note: "Optional threshold intervals introduce anaerobic stimulus above Zone 2. This builds lactate threshold — the point where fat burning shifts to carb burning.",
        },
        {
          day: 3,
          name: "Upper Body Strength (Peak)",
          category: "strength",
          durationMin: 60,
          intensity: "high",
          warm_up: [
            { name: "Band pull-aparts", duration: "15 reps" },
            { name: "Scapular push-ups", duration: "10 reps" },
            { name: "Wall angels", duration: "10 reps" },
          ],
          main_block: [
            {
              section_label: "Push (Compound Priority)",
              exercises: [
                { name: "Barbell Bench Press (or heavy DB)", sets: 4, reps_or_duration: "6", rest: "120 sec", tempo: "3-1-1", form_cue: "Tuck elbows 45°, not flared" },
                { name: "Arnold Press", sets: 4, reps_or_duration: "10", rest: "90 sec", tempo: "2-0-1", form_cue: "Rotate through full ROM" },
                { name: "Cable Fly", sets: 3, reps_or_duration: "15", rest: "60 sec", tempo: "2-0-2", form_cue: "Feel the stretch at the start" },
              ],
            },
            {
              section_label: "Pull (Upgraded)",
              exercises: [
                { name: "Weighted Pull-Up (or Band-Assisted)", sets: 4, reps_or_duration: "6–8", rest: "120 sec", tempo: "2-1-2", form_cue: "Full hang to chin over bar" },
                { name: "Chest-Supported T-Bar Row", sets: 4, reps_or_duration: "10", rest: "90 sec", tempo: "2-1-1", form_cue: "Chest on pad removes lower back stress" },
                { name: "Face Pull", sets: 4, reps_or_duration: "15", rest: "45 sec", tempo: "1-2-1", form_cue: "Hold contracted for 2 sec" },
              ],
            },
          ],
          cool_down: [
            { name: "Doorway chest stretch", duration: "45 sec per side" },
            { name: "Lat stretch", duration: "30 sec per side" },
          ],
          coaching_note: "Heavier compound movements at lower reps (6–8) recruit more motor units and develop maximal strength. This is the stimulus your body needs to break through plateaus.",
        },
        {
          day: 4,
          name: "Active Recovery (Extended)",
          category: "active-recovery",
          durationMin: 45,
          intensity: "low",
          warm_up: [{ name: "Easy walk", duration: "15 min" }],
          main_block: [
            {
              section_label: "Full Yoga / Mobility Flow",
              exercises: [
                { name: "Cat-Cow", sets: 1, reps_or_duration: "10 reps", rest: "–", form_cue: "Breathe in on extension, out on flexion" },
                { name: "Thread the Needle", sets: 1, reps_or_duration: "8 per side", rest: "–", form_cue: "Hold 15–20 sec longer than Week 2" },
                { name: "Downward Dog to Cobra Flow", sets: 1, reps_or_duration: "5 reps", rest: "–", form_cue: "Smooth transitions" },
                { name: "Low Lunge to Lizard", sets: 1, reps_or_duration: "75 sec per side", rest: "–", form_cue: "Sink deeper this week" },
                { name: "Pigeon Pose", sets: 1, reps_or_duration: "2 min per side", rest: "–", form_cue: "Extended hold — breathe into it" },
                { name: "Supine Twist", sets: 1, reps_or_duration: "75 sec per side", rest: "–", form_cue: "Let gravity do the work" },
              ],
            },
          ],
          cool_down: [],
          coaching_note: "Peak week demands peak recovery. Longer holds this week allow fascia and deep connective tissue to release — different from muscle stretching.",
        },
        {
          day: 5,
          name: "HIIT Peak Session",
          category: "hiit",
          durationMin: 50,
          intensity: "very-high",
          warm_up: [
            { name: "Light jog", duration: "5 min" },
            { name: "Dynamic mobility", duration: "5 min" },
          ],
          main_block: [
            {
              section_label: "Circuit A — Lower (4 rounds, 50:10)",
              exercises: [
                { name: "Jump Squat", sets: 4, reps_or_duration: "50 sec", rest: "10 sec", form_cue: "Max effort, soft landings" },
                { name: "Lateral Bound", sets: 4, reps_or_duration: "50 sec", rest: "10 sec", form_cue: "Stick each landing, load the hip" },
                { name: "Single-Leg Hip Thrust", sets: 4, reps_or_duration: "50 sec per side", rest: "10 sec", form_cue: "Full hip extension each rep" },
                { name: "Wall Sit Hold", sets: 4, reps_or_duration: "50 sec", rest: "10 sec", form_cue: "90° at knees, back flat against wall" },
              ],
            },
            {
              section_label: "Circuit B — Upper/Full (4 rounds, 50:10)",
              exercises: [
                { name: "Burpee with Push-Up", sets: 4, reps_or_duration: "50 sec", rest: "10 sec", form_cue: "Full push-up at bottom" },
                { name: "DB Thruster", sets: 4, reps_or_duration: "50 sec", rest: "10 sec", form_cue: "Squat to press in one fluid motion" },
                { name: "Renegade Row", sets: 4, reps_or_duration: "50 sec", rest: "10 sec", form_cue: "No hip rotation, strong plank base" },
                { name: "High Knees", sets: 4, reps_or_duration: "50 sec", rest: "10 sec", form_cue: "Knees to hip height, pump arms" },
              ],
            },
          ],
          cool_down: [
            { name: "Slow walk", duration: "3 min" },
            { name: "Standing pigeon", duration: "60 sec per side" },
            { name: "Supine knees-to-chest", duration: "60 sec" },
          ],
          coaching_note: "You're at Week 3 peak. This will be uncomfortable — that discomfort is the stimulus for adaptation. If form breaks down, reduce intensity not range of motion.",
        },
        {
          day: 6,
          name: "Lower Body Strength (Peak)",
          category: "strength",
          durationMin: 65,
          intensity: "high",
          warm_up: [
            { name: "Banded clamshells", duration: "15 reps" },
            { name: "Banded glute bridge", duration: "15 reps" },
            { name: "Single-leg hip thrust", duration: "8 per side" },
          ],
          main_block: [
            {
              section_label: "Heavy Compound Lifts",
              exercises: [
                { name: "Back Squat", sets: 5, reps_or_duration: "5 (heavy)", rest: "120 sec", tempo: "3-1-1", form_cue: "Break at hips and knees, below parallel" },
                { name: "Romanian Deadlift", sets: 4, reps_or_duration: "8 (+load)", rest: "90 sec", tempo: "3-1-1", form_cue: "Hinge until max hamstring tension" },
                { name: "Bulgarian Split Squat", sets: 4, reps_or_duration: "8 per side", rest: "90 sec", tempo: "2-1-1", form_cue: "Front foot far enough, shin vertical" },
                { name: "Hip Thrust", sets: 4, reps_or_duration: "10 (+load)", rest: "90 sec", tempo: "2-1-2", form_cue: "Posterior pelvic tilt, full extension" },
                { name: "Nordic Hamstring Curl", sets: 3, reps_or_duration: "6", rest: "90 sec", form_cue: "Slow eccentric — resist the lowering phase" },
                { name: "Standing Calf Raise", sets: 4, reps_or_duration: "15", rest: "45 sec", tempo: "2-1-2", form_cue: "Full plantar flexion, pause at top" },
              ],
            },
          ],
          cool_down: [
            { name: "Couch stretch", duration: "60 sec per side" },
            { name: "Pigeon pose", duration: "90 sec per side" },
            { name: "Supine hamstring stretch", duration: "60 sec per side" },
          ],
          coaching_note: "5 × 5 heavy squats is the gold standard for strength development. RPE 8–9 — these should feel challenging but form stays solid.",
        },
        {
          day: 7,
          name: "Mandatory Rest",
          category: "rest",
          durationMin: 0,
          intensity: "low",
          warm_up: [],
          main_block: [],
          cool_down: [],
          coaching_note: "No training. Sleep well, eat well, hydrate. Your body needs this after peak week — supercompensation happens here (Kiely, 2012).",
        },
      ],
    },

    // ══════════════════════════════════════
    // WEEK 4 — DELOAD
    // ══════════════════════════════════════
    {
      week: 4,
      theme: "Deload",
      days: [
        {
          day: 1,
          name: "Deload Full Body",
          category: "strength",
          durationMin: 40,
          intensity: "moderate",
          warm_up: [
            { name: "Leg swings", duration: "1 min" },
            { name: "Arm circles", duration: "1 min" },
            { name: "Bodyweight squat", duration: "10 reps" },
          ],
          main_block: [
            {
              section_label: "Deload Strength (RPE ≤ 6)",
              exercises: [
                { name: "Goblet Squat", sets: 2, reps_or_duration: "10", rest: "60 sec", form_cue: "Same weight as Week 3, fewer sets" },
                { name: "Romanian Deadlift", sets: 2, reps_or_duration: "10", rest: "60 sec", form_cue: "Smooth and controlled" },
                { name: "DB Bench Press", sets: 2, reps_or_duration: "10", rest: "60 sec", form_cue: "Full ROM, no grinding reps" },
                { name: "Cable Row", sets: 2, reps_or_duration: "12", rest: "60 sec", form_cue: "Focus on the squeeze" },
                { name: "Lateral Lunge", sets: 2, reps_or_duration: "10 per side", rest: "60 sec", form_cue: "Light and controlled" },
              ],
            },
          ],
          cool_down: [
            { name: "Full body stretch", duration: "5 min" },
          ],
          coaching_note: "Deload doesn't mean no training — it means strategic reduction. Same movements, lower volume. Your body gets stronger during this week (supercompensation).",
        },
        {
          day: 2,
          name: "Easy Walk + Mobility",
          category: "cardio",
          durationMin: 45,
          intensity: "low",
          warm_up: [],
          main_block: [
            {
              section_label: "Light Cardio",
              exercises: [
                { name: "Brisk walk", sets: 1, reps_or_duration: "30 min", rest: "–", form_cue: "Conversational pace, enjoy it" },
              ],
            },
            {
              section_label: "Full Body Stretch",
              exercises: [
                { name: "Full body stretch flow", sets: 1, reps_or_duration: "15 min", rest: "–", form_cue: "Hold each stretch gently, breathe deeply" },
              ],
            },
          ],
          cool_down: [],
          coaching_note: "Walking is underrated — it improves recovery, reduces cortisol, and burns fat without creating additional training stress.",
        },
        {
          day: 3,
          name: "Deload Upper Body",
          category: "strength",
          durationMin: 40,
          intensity: "moderate",
          warm_up: [
            { name: "Band pull-aparts", duration: "15 reps" },
            { name: "Wall angels", duration: "10 reps" },
          ],
          main_block: [
            {
              section_label: "Deload Upper (RPE ≤ 6)",
              exercises: [
                { name: "Incline DB Press", sets: 2, reps_or_duration: "10", rest: "60 sec", form_cue: "Light and controlled" },
                { name: "Overhead Press", sets: 2, reps_or_duration: "10", rest: "60 sec", form_cue: "No grinding, smooth reps" },
                { name: "Lat Pulldown", sets: 2, reps_or_duration: "12", rest: "60 sec", form_cue: "Focus on mind-muscle connection" },
                { name: "Face Pull", sets: 3, reps_or_duration: "15", rest: "45 sec", form_cue: "These stay — always protect your shoulders" },
                { name: "Lateral Raise", sets: 2, reps_or_duration: "15", rest: "45 sec", form_cue: "Light weight, full ROM" },
              ],
            },
          ],
          cool_down: [
            { name: "Chest and lat stretch", duration: "3 min" },
          ],
          coaching_note: "Face pulls keep their volume even in deload — shoulder health maintenance is non-negotiable year-round.",
        },
        {
          day: 4,
          name: "Yoga / Full Mobility Flow",
          category: "active-recovery",
          durationMin: 40,
          intensity: "low",
          warm_up: [],
          main_block: [
            {
              section_label: "Yoga Flow (same as Week 2 Day 4)",
              exercises: [
                { name: "Cat-Cow", sets: 1, reps_or_duration: "10 reps", rest: "–", form_cue: "Breathe in on extension, out on flexion" },
                { name: "Thread the Needle", sets: 1, reps_or_duration: "8 per side", rest: "–", form_cue: "Thoracic rotation" },
                { name: "Downward Dog to Cobra Flow", sets: 1, reps_or_duration: "5 reps", rest: "–", form_cue: "Smooth transitions" },
                { name: "Low Lunge to Lizard", sets: 1, reps_or_duration: "60 sec per side", rest: "–", form_cue: "Sink into the stretch" },
                { name: "Pigeon Pose", sets: 1, reps_or_duration: "90 sec per side", rest: "–", form_cue: "Relax completely" },
                { name: "Supine Twist", sets: 1, reps_or_duration: "60 sec per side", rest: "–", form_cue: "Let gravity do the work" },
                { name: "Savasana with Breathwork", sets: 1, reps_or_duration: "5 min", rest: "–", form_cue: "Complete relaxation" },
              ],
            },
          ],
          cool_down: [],
          coaching_note: "Deload week is the perfect time for deeper mobility work. Your nervous system recovers as much as your muscles.",
        },
        {
          day: 5,
          name: "Light Conditioning",
          category: "cardio",
          durationMin: 40,
          intensity: "low",
          warm_up: [],
          main_block: [
            {
              section_label: "Easy Cardio",
              exercises: [
                { name: "Brisk walk or light bike", sets: 1, reps_or_duration: "30 min", rest: "–", form_cue: "Easy pace, conversational" },
              ],
            },
            {
              section_label: "Core (Week 1 volumes)",
              exercises: [
                { name: "Dead Bug", sets: 3, reps_or_duration: "8 per side", rest: "30 sec", form_cue: "Lower back pressed to floor" },
                { name: "Plank", sets: 3, reps_or_duration: "30 sec", rest: "30 sec", form_cue: "Squeeze everything" },
                { name: "Side Plank", sets: 2, reps_or_duration: "25 sec per side", rest: "30 sec", form_cue: "Hip stacked, don't let it sag" },
              ],
            },
          ],
          cool_down: [
            { name: "Full body stretch", duration: "5 min" },
          ],
          coaching_note: "HIIT is replaced with easy cardio this week. Your cardiovascular system still gets stimulus without the neurological fatigue of high-intensity work.",
        },
        {
          day: 6,
          name: "Deload Lower Body",
          category: "strength",
          durationMin: 40,
          intensity: "moderate",
          warm_up: [
            { name: "Banded clamshells", duration: "15 reps" },
            { name: "Glute bridges", duration: "10 reps" },
          ],
          main_block: [
            {
              section_label: "Deload Lower (RPE ≤ 6)",
              exercises: [
                { name: "Back Squat (lighter)", sets: 2, reps_or_duration: "8", rest: "60 sec", form_cue: "Same depth, lighter load" },
                { name: "Romanian Deadlift", sets: 2, reps_or_duration: "10", rest: "60 sec", form_cue: "Smooth and controlled" },
                { name: "Hip Thrust", sets: 2, reps_or_duration: "12", rest: "60 sec", form_cue: "Full extension, mind-muscle focus" },
                { name: "Step-Up", sets: 2, reps_or_duration: "10 per side", rest: "60 sec", form_cue: "Drive through the heel" },
              ],
            },
          ],
          cool_down: [
            { name: "Couch stretch", duration: "60 sec per side" },
            { name: "Pigeon pose", duration: "90 sec per side" },
          ],
          coaching_note: "Last training day of the cycle. You should feel refreshed and hungry to train by Monday. That's the deload effect — supercompensation in action.",
        },
        {
          day: 7,
          name: "Rest",
          category: "rest",
          durationMin: 0,
          intensity: "low",
          warm_up: [],
          main_block: [],
          cool_down: [],
          coaching_note: "Cycle complete. If you repeat this program, increase all Week 1 loads by 5–10% from where you started. That's long-term progressive overload.",
        },
      ],
    },
  ],
};

// ── Exported plan library ──
export const FALLBACK_PLANS: WorkoutPlan[] = [LOSE_WEIGHT_BUILD_MUSCLE];

/**
 * Find the best matching fallback plan for a given set of goals.
 * Falls back to the Lose Weight + Build Muscle plan if no exact match.
 */
export function getFallbackPlan(goals: string[]): WorkoutPlan {
  const normalised = goals.map(g => g.toLowerCase());
  const match = FALLBACK_PLANS.find(p =>
    p.goals.every(g => normalised.includes(g.toLowerCase()))
  );
  return match || FALLBACK_PLANS[0];
}
