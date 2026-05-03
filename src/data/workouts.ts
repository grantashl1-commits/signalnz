import { Phase } from "@/lib/cycle-utils";
import { STACY_SIMS_WORKOUTS } from "@/data/stacy-sims-workouts";

export type Suitability = "ideal" | "suitable" | "rest";
export type WorkoutCategory = "strength" | "walk-restore";

export interface Exercise {
  name: string;
  sets?: string;
  reps?: string;
  duration?: string;
  formCue: string;
  section?: string;
}

export interface Workout {
  id: string;
  name: string;
  category: WorkoutCategory;
  duration: string;
  durationMin: number;
  equipment: string;
  suitability: Record<Phase, Suitability>;
  description: string;
  exercises: Exercise[];
  progressionNotes?: string[];
  restOptions?: { id: string; name: string; duration: string; description: string }[];
}

// ─── Phase Movement Labels ──────────────────────────
export const PHASE_MOVEMENT_LABEL: Record<Phase, string> = {
  menstrual: "Restore",
  follicular: "Build",
  ovulatory: "Power",
  luteal: "Control",
};

// ─── Shared Rest Option ─────────────────────────────
const REST_WALK_RESTORE: Workout = {
  id: "rest-walk-restore",
  name: "Rest \u00b7 Walk \u00b7 Restore",
  category: "walk-restore",
  duration: "20\u201340 min",
  durationMin: 30,
  equipment: "None",
  suitability: { menstrual: "ideal", follicular: "suitable", ovulatory: "suitable", luteal: "ideal" },
  description: "Choose the option that honours how your body feels today.",
  restOptions: [
    { id: "mindful-walk", name: "Mindful Walk", duration: "30 min", description: "Walk at a pace that lets you breathe through your nose. No music. Notice 5 things you can see, 4 you can hear, 3 you can feel." },
    { id: "restorative-yoga", name: "Restorative Yoga", duration: "20\u201340 min", description: "Full body yin and restorative sequence. Hold each pose 2\u20134 minutes. Dragon, butterfly, caterpillar, sleeping swan, legs up the wall." },
    { id: "mobility-flow", name: "Mobility Flow", duration: "15 min", description: "Hip flexors, thoracic spine, hamstrings, shoulders. Slow and deliberate. 45 seconds minimum per stretch." },
  ],
  exercises: [],
};

// ─── MENSTRUAL WORKOUTS (3) ─────────────────────────
const MENSTRUAL_FULL_BODY_A: Workout = {
  id: "menstrual-full-body-a",
  name: "Full Body A",
  category: "strength",
  duration: "40 min",
  durationMin: 40,
  equipment: "8\u201310kg dumbbells",
  suitability: { menstrual: "suitable", follicular: "ideal", ovulatory: "ideal", luteal: "suitable" },
  description: "Compound movements. Most efficient session of the week \u2014 works everything at once.",
  exercises: [
    { name: "Dumbbell Deadlift", sets: "2", duration: "45 sec", reps: "tempo", formCue: "Tempo 3-1-2. Hinge, not squat.", section: "Circuit 1 \u2014 Big Movements" },
    { name: "Push-Up To Downward Dog", sets: "2", duration: "45 sec", reps: "tempo", formCue: "Push-up then press to down dog. Hold 2 sec.", section: "Circuit 1 \u2014 Big Movements" },
    { name: "Goblet Squat To Press", sets: "2", duration: "45 sec", reps: "tempo", formCue: "Squat, drive up, press overhead. Exhale on press.", section: "Circuit 1 \u2014 Big Movements" },
    { name: "Single-Arm Row To Rotation", sets: "2", duration: "45 sec each", reps: "tempo", formCue: "Row then rotate thoracic to ceiling.", section: "Circuit 2 \u2014 Control Focus" },
    { name: "Reverse Lunge To Bicep Curl", sets: "2", duration: "45 sec", reps: "tempo", formCue: "Lunge, drive up, curl at top.", section: "Circuit 2 \u2014 Control Focus" },
    { name: "Lateral Lunge To Lateral Raise", sets: "2", duration: "45 sec", reps: "tempo", formCue: "Lunge to side, drive up, arms raise.", section: "Circuit 2 \u2014 Control Focus" },
    { name: "Dead Bug With Dumbbell Press", sets: "2", duration: "45 sec", reps: "tempo", formCue: "One arm presses, opposite leg extends. Anti-extension core work.", section: "Circuit 3 \u2014 Core Integration" },
    { name: "Bird Dog Row", sets: "2", duration: "45 sec each", reps: "tempo", formCue: "On all fours. Row arm, extend opposite leg.", section: "Circuit 3 \u2014 Core Integration" },
    { name: "Plank To Push-Up", sets: "2", duration: "45 sec", reps: "tempo", formCue: "Forearm plank up to hand plank. Alternate leading arm.", section: "Circuit 3 \u2014 Core Integration" },
    { name: "Squat Pulse", sets: "1", reps: "\u00d720", formCue: "Small range, stay low.", section: "Finisher" },
    { name: "Mountain Climbers", sets: "1", reps: "\u00d720 alternating", formCue: "Fast but controlled.", section: "Finisher" },
    { name: "Inchworm", sets: "1", reps: "\u00d75 full length", formCue: "Walk hands out, walk feet in.", section: "Finisher" },
  ],
};

const MENSTRUAL_FULL_BODY_B: Workout = {
  id: "menstrual-full-body-b",
  name: "Full Body B",
  category: "strength",
  duration: "40 min",
  durationMin: 40,
  equipment: "5\u20138kg dumbbells",
  suitability: { menstrual: "suitable", follicular: "ideal", ovulatory: "ideal", luteal: "suitable" },
  description: "Unilateral focus. Single-side training reveals and corrects imbalances.",
  exercises: [
    { name: "Single-Leg Romanian Deadlift", sets: "2", duration: "45 sec each", reps: "tempo", formCue: "One dumbbell. Reach toward floor.", section: "Circuit 1" },
    { name: "Single-Arm Push-Up Prep", sets: "2", duration: "45 sec each", reps: "tempo", formCue: "Other arm behind back. Slow tempo.", section: "Circuit 1" },
    { name: "Suitcase Carry Squat", sets: "2", duration: "45 sec", reps: "tempo", formCue: "One dumbbell at side. Spine neutral. Anti-lateral flexion.", section: "Circuit 1" },
    { name: "Rear Foot Elevated Split Squat", sets: "2", duration: "45 sec each", reps: "tempo", formCue: "Back foot on chair. Tempo 4-0-2. Pilates posture.", section: "Circuit 2" },
    { name: "Single-Arm Overhead Press", sets: "2", duration: "45 sec each", reps: "tempo", formCue: "Challenges core stability. Do not side bend.", section: "Circuit 2" },
    { name: "Single-Arm Chest Fly On Mat", sets: "2", duration: "45 sec each", reps: "tempo", formCue: "Core works to resist rotation.", section: "Circuit 2" },
    { name: "Single-Leg Hip Thrust", sets: "2", duration: "45 sec each", reps: "tempo", formCue: "Drive through heel, squeeze at top.", section: "Circuit 3" },
    { name: "Single-Arm Row In Side Plank", sets: "2", duration: "45 sec each", reps: "tempo", formCue: "Side plank. Top arm rows light dumbbell.", section: "Circuit 3" },
    { name: "Half-Kneeling Chop", sets: "2", duration: "45 sec each", reps: "tempo", formCue: "One knee down. Dumbbell chops diagonally. Rotational control.", section: "Circuit 3" },
    { name: "Bear Hold", sets: "2", duration: "30 sec", reps: "hold", formCue: "All fours, knees 2cm off mat. Still.", section: "Finisher" },
    { name: "Hollow Body Hold", sets: "2", duration: "30 sec", reps: "hold", formCue: "Press lower back down, legs extended.", section: "Finisher" },
  ],
};

// ─── FOLLICULAR WORKOUTS (7) ────────────────────────
const FOLLICULAR_UPPER_A: Workout = {
  id: "upper-body-a",
  name: "Upper Body A",
  category: "strength",
  duration: "35 min",
  durationMin: 35,
  equipment: "5\u20138kg dumbbells",
  suitability: { menstrual: "rest", follicular: "ideal", ovulatory: "ideal", luteal: "suitable" },
  description: "Chest, back, and shoulders. Three circuits repeated twice with pilates tempo control. 45 seconds on, 15 seconds rest.",
  progressionNotes: [
    "Week 2: Add 1 rep per circuit or increase weight 2kg if form allows.",
    "Week 3: Slow all tempos by 1 count.",
    "Week 4: Deload \u2014 drop reps 20%.",
  ],
  exercises: [
    { name: "Single-Arm Dumbbell Row", sets: "2", duration: "45 sec each side", reps: "tempo", formCue: "Tempo 2-1-3. Drive elbow to hip.", section: "Circuit 1" },
    { name: "Chest Press On Mat", sets: "2", duration: "45 sec", reps: "tempo", formCue: "Tempo 3-1-2. Exhale on press.", section: "Circuit 1" },
    { name: "Rear Delt Fly", sets: "2", duration: "45 sec", reps: "tempo", formCue: "Hinge 45\u00b0, slow arc to shoulder height.", section: "Circuit 1" },
    { name: "Bicep Curl", sets: "2", duration: "45 sec", reps: "tempo", formCue: "Tempo 2-1-3. Elbows pinned, no swing.", section: "Circuit 2" },
    { name: "Tricep Overhead Extension", sets: "2", duration: "45 sec", reps: "tempo", formCue: "Tempo 3-1-3. Ribs down, core braced.", section: "Circuit 2" },
    { name: "Lateral Raise", sets: "2", duration: "45 sec", reps: "tempo", formCue: "Tempo 2-2-3. Lead with pinky finger.", section: "Circuit 2" },
    { name: "Arnold Press", sets: "2", duration: "45 sec", reps: "tempo", formCue: "Rotate palms from facing you to facing out.", section: "Circuit 3" },
    { name: "Bent-Over Row Bilateral", sets: "2", duration: "45 sec", reps: "tempo", formCue: "Tempo 2-1-3. Full range of motion.", section: "Circuit 3" },
    { name: "Push-Up Full Or Modified", sets: "2", duration: "45 sec", reps: "tempo", formCue: "Tempo 3-1-2. Straight line neck to heel.", section: "Circuit 3" },
    { name: "Plank Shoulder Taps", sets: "1", reps: "\u00d720 alternating", formCue: "Minimise hip rotation.", section: "Finisher" },
    { name: "Dead Bug", sets: "1", reps: "\u00d710 each side", formCue: "Slow and controlled.", section: "Finisher" },
    { name: "Thoracic Rotation Half-Kneeling", sets: "1", reps: "\u00d78 each", formCue: "Open chest, follow hand with eyes.", section: "Finisher" },
  ],
};

const FOLLICULAR_UPPER_B: Workout = {
  id: "upper-body-b",
  name: "Upper Body B",
  category: "strength",
  duration: "35 min",
  durationMin: 35,
  equipment: "5\u20138kg dumbbells, resistance band",
  suitability: { menstrual: "rest", follicular: "ideal", ovulatory: "ideal", luteal: "suitable" },
  description: "Different exercises, same muscle groups. Keeps adaptation happening.",
  exercises: [
    { name: "Renegade Row", sets: "2", duration: "45 sec alternating", reps: "tempo", formCue: "Plank position, hips perfectly square.", section: "Circuit 1" },
    { name: "Chest Fly On Mat", sets: "2", duration: "45 sec", reps: "tempo", formCue: "Tempo 4-1-2. Feel the full stretch.", section: "Circuit 1" },
    { name: "Face Pull With Band", sets: "2", duration: "45 sec", reps: "tempo", formCue: "Pull to ears, elbows high and wide. Hold 1 sec at peak.", section: "Circuit 1" },
    { name: "Hammer Curl", sets: "2", duration: "45 sec", reps: "tempo", formCue: "Palms facing each other. Tempo 3-1-3.", section: "Circuit 2" },
    { name: "Tricep Kickback", sets: "2", duration: "45 sec each side", reps: "tempo", formCue: "Upper arm still, full extension, hold 2 sec at top.", section: "Circuit 2" },
    { name: "Upright Row", sets: "2", duration: "45 sec", reps: "tempo", formCue: "Lead with elbows to chin height. Tempo 2-1-3.", section: "Circuit 2" },
    { name: "Single-Arm Overhead Press", sets: "2", duration: "45 sec each", reps: "tempo", formCue: "Ribs down. Do not arch lower back.", section: "Circuit 3" },
    { name: "Underhand Row Supinated Grip", sets: "2", duration: "45 sec", reps: "tempo", formCue: "Palms face ceiling. Targets lower lats.", section: "Circuit 3" },
    { name: "Band Pull-Apart", sets: "2", duration: "45 sec", reps: "tempo", formCue: "Arms straight, squeeze shoulder blades.", section: "Circuit 3" },
    { name: "Pike Push-Up", sets: "1", reps: "\u00d710", formCue: "Hips high, press through shoulders.", section: "Finisher" },
    { name: "Hollow Body Hold", sets: "2", duration: "30 sec", reps: "hold", formCue: "Press lower back into floor.", section: "Finisher" },
    { name: "Superman Hold", sets: "2", duration: "30 sec", reps: "hold", formCue: "Lift arms and legs, squeeze glutes.", section: "Finisher" },
  ],
};

const FOLLICULAR_LOWER_A: Workout = {
  id: "lower-body-a",
  name: "Lower Body A",
  category: "strength",
  duration: "40 min",
  durationMin: 40,
  equipment: "8\u201310kg dumbbells, booty band",
  suitability: { menstrual: "rest", follicular: "ideal", ovulatory: "ideal", luteal: "suitable" },
  description: "Glutes, quads, and hamstrings. Time under tension is everything here.",
  exercises: [
    { name: "Romanian Deadlift", sets: "2", duration: "45 sec", reps: "tempo", formCue: "Tempo 3-1-2. Hamstrings load fully.", section: "Circuit 1 \u2014 Posterior Chain" },
    { name: "Glute Bridge With Band", sets: "2", duration: "45 sec", reps: "tempo", formCue: "Hold 1 sec at top. Tempo 1-1-3.", section: "Circuit 1 \u2014 Posterior Chain" },
    { name: "Single-Leg Deadlift", sets: "2", duration: "45 sec each", reps: "tempo", formCue: "Bodyweight or light. Balance and control.", section: "Circuit 1 \u2014 Posterior Chain" },
    { name: "Goblet Squat", sets: "2", duration: "45 sec", reps: "tempo", formCue: "Dumbbell at chest. Tempo 3-1-2.", section: "Circuit 2 \u2014 Quad Focus" },
    { name: "Reverse Lunge Alternating", sets: "2", duration: "45 sec", reps: "tempo", formCue: "Back knee taps mat. Tempo 3-1-2.", section: "Circuit 2 \u2014 Quad Focus" },
    { name: "Sumo Squat", sets: "2", duration: "45 sec", reps: "tempo", formCue: "Wide stance, toes out. Tempo 4-1-2.", section: "Circuit 2 \u2014 Quad Focus" },
    { name: "Lateral Band Walk", sets: "2", duration: "45 sec", reps: "10 steps each", formCue: "Low squat hold throughout.", section: "Circuit 3 \u2014 Accessory" },
    { name: "Donkey Kicks With Band", sets: "2", duration: "45 sec each", reps: "tempo", formCue: "Slow and controlled. No hip rotation.", section: "Circuit 3 \u2014 Accessory" },
    { name: "Side-Lying Leg Raise", sets: "2", duration: "45 sec each", reps: "tempo", formCue: "Ankle weight optional. Tempo 2-1-3.", section: "Circuit 3 \u2014 Accessory" },
    { name: "Bridge Pulse", sets: "1", reps: "\u00d730", formCue: "Small range, glute squeeze.", section: "Finisher" },
    { name: "Frog Bridge", sets: "1", reps: "\u00d715", formCue: "Soles together, knees wide.", section: "Finisher" },
    { name: "Fire Hydrant Pulse", sets: "1", reps: "\u00d720 each side", formCue: "Small pulses at top.", section: "Finisher" },
  ],
};

const FOLLICULAR_LOWER_B: Workout = {
  id: "lower-body-b",
  name: "Lower Body B",
  category: "strength",
  duration: "40 min",
  durationMin: 40,
  equipment: "8\u201310kg dumbbells, booty band",
  suitability: { menstrual: "rest", follicular: "ideal", ovulatory: "ideal", luteal: "suitable" },
  description: "Single-leg focus. Corrects imbalances and challenges stability.",
  exercises: [
    { name: "Split Squat", sets: "2", duration: "45 sec each side", reps: "tempo", formCue: "Tempo 3-1-2. Upright pilates posture.", section: "Circuit 1" },
    { name: "Hip Thrust With Dumbbell", sets: "2", duration: "45 sec", reps: "tempo", formCue: "Dumbbell on hip. Tempo 1-2-3.", section: "Circuit 1" },
    { name: "Good Morning", sets: "2", duration: "45 sec", reps: "tempo", formCue: "Flat back hinge. Feel hamstring stretch.", section: "Circuit 1" },
    { name: "Walking Lunge", sets: "2", duration: "45 sec", reps: "4 steps fwd/back", formCue: "Chest tall throughout.", section: "Circuit 2" },
    { name: "Sumo Deadlift", sets: "2", duration: "45 sec", reps: "tempo", formCue: "Wide stance, dumbbells between legs.", section: "Circuit 2" },
    { name: "Step-Up", sets: "2", duration: "45 sec each", reps: "tempo", formCue: "Drive through the heel on the step. Tempo 3-1-2.", section: "Circuit 2" },
    { name: "Single-Leg Glute Bridge", sets: "2", duration: "45 sec each", reps: "tempo", formCue: "Non-working leg extended. Tempo 1-1-3.", section: "Circuit 3" },
    { name: "Curtsy Lunge Alternating", sets: "2", duration: "45 sec", reps: "tempo", formCue: "Rear foot crosses behind and wide. Targets glute medius.", section: "Circuit 3" },
    { name: "Lying Hamstring Curl With Band", sets: "2", duration: "45 sec", reps: "tempo", formCue: "Face down. Curl heel to glute. Tempo 2-1-3.", section: "Circuit 3" },
    { name: "Glute Bridge Fast", sets: "1", reps: "\u00d720 bodyweight", formCue: "Quick, full squeeze at top.", section: "Finisher" },
    { name: "Single-Leg Bridge", sets: "1", reps: "\u00d715 each", formCue: "Control the descent.", section: "Finisher" },
    { name: "Clam With Band", sets: "1", reps: "\u00d720 each side", formCue: "Keep feet together, open knees.", section: "Finisher" },
  ],
};

const FOLLICULAR_FULL_A: Workout = {
  id: "full-body-a",
  name: "Full Body A",
  category: "strength",
  duration: "40 min",
  durationMin: 40,
  equipment: "8\u201310kg dumbbells",
  suitability: { menstrual: "suitable", follicular: "ideal", ovulatory: "ideal", luteal: "suitable" },
  description: "Compound movements. Most efficient session of the week \u2014 works everything at once.",
  exercises: [
    { name: "Dumbbell Deadlift", sets: "2", duration: "45 sec", reps: "tempo", formCue: "Tempo 3-1-2. Hinge, not squat.", section: "Circuit 1 \u2014 Big Movements" },
    { name: "Push-Up To Downward Dog", sets: "2", duration: "45 sec", reps: "tempo", formCue: "Push-up then press to down dog. Hold 2 sec.", section: "Circuit 1 \u2014 Big Movements" },
    { name: "Goblet Squat To Press", sets: "2", duration: "45 sec", reps: "tempo", formCue: "Squat, drive up, press overhead. Exhale on press.", section: "Circuit 1 \u2014 Big Movements" },
    { name: "Single-Arm Row To Rotation", sets: "2", duration: "45 sec each", reps: "tempo", formCue: "Row then rotate thoracic to ceiling.", section: "Circuit 2 \u2014 Control Focus" },
    { name: "Reverse Lunge To Bicep Curl", sets: "2", duration: "45 sec", reps: "tempo", formCue: "Lunge, drive up, curl at top.", section: "Circuit 2 \u2014 Control Focus" },
    { name: "Lateral Lunge To Lateral Raise", sets: "2", duration: "45 sec", reps: "tempo", formCue: "Lunge to side, drive up, arms raise.", section: "Circuit 2 \u2014 Control Focus" },
    { name: "Dead Bug With Dumbbell Press", sets: "2", duration: "45 sec", reps: "tempo", formCue: "One arm presses, opposite leg extends. Anti-extension core work.", section: "Circuit 3 \u2014 Core Integration" },
    { name: "Bird Dog Row", sets: "2", duration: "45 sec each", reps: "tempo", formCue: "On all fours. Row arm, extend opposite leg.", section: "Circuit 3 \u2014 Core Integration" },
    { name: "Plank To Push-Up", sets: "2", duration: "45 sec", reps: "tempo", formCue: "Forearm plank up to hand plank. Alternate leading arm.", section: "Circuit 3 \u2014 Core Integration" },
    { name: "Squat Jump Or Squat Pulse", sets: "1", reps: "\u00d710 jumps or \u00d720 pulse", formCue: "Land soft, drive through heels.", section: "Finisher" },
    { name: "Mountain Climbers", sets: "1", reps: "\u00d720 alternating", formCue: "Fast but controlled.", section: "Finisher" },
    { name: "Inchworm", sets: "1", reps: "\u00d75 full length", formCue: "Walk hands out, walk feet in.", section: "Finisher" },
  ],
};

const FOLLICULAR_FULL_B: Workout = {
  id: "full-body-b",
  name: "Full Body B",
  category: "strength",
  duration: "40 min",
  durationMin: 40,
  equipment: "5\u20138kg dumbbells",
  suitability: { menstrual: "suitable", follicular: "ideal", ovulatory: "ideal", luteal: "suitable" },
  description: "Unilateral focus. Single-side training reveals and corrects imbalances.",
  exercises: [
    { name: "Single-Leg Romanian Deadlift", sets: "2", duration: "45 sec each", reps: "tempo", formCue: "One dumbbell. Reach toward floor.", section: "Circuit 1" },
    { name: "Single-Arm Push-Up Prep", sets: "2", duration: "45 sec each", reps: "tempo", formCue: "Other arm behind back. Slow tempo.", section: "Circuit 1" },
    { name: "Suitcase Carry Squat", sets: "2", duration: "45 sec", reps: "tempo", formCue: "One dumbbell at side. Spine neutral. Anti-lateral flexion.", section: "Circuit 1" },
    { name: "Rear Foot Elevated Split Squat", sets: "2", duration: "45 sec each", reps: "tempo", formCue: "Back foot on chair. Tempo 4-0-2. Pilates posture.", section: "Circuit 2" },
    { name: "Single-Arm Overhead Press", sets: "2", duration: "45 sec each", reps: "tempo", formCue: "Challenges core stability. Do not side bend.", section: "Circuit 2" },
    { name: "Single-Arm Chest Fly On Mat", sets: "2", duration: "45 sec each", reps: "tempo", formCue: "Core works to resist rotation.", section: "Circuit 2" },
    { name: "Single-Leg Hip Thrust", sets: "2", duration: "45 sec each", reps: "tempo", formCue: "Drive through heel, squeeze at top.", section: "Circuit 3" },
    { name: "Single-Arm Row In Side Plank", sets: "2", duration: "45 sec each", reps: "tempo", formCue: "Side plank. Top arm rows light dumbbell.", section: "Circuit 3" },
    { name: "Half-Kneeling Chop", sets: "2", duration: "45 sec each", reps: "tempo", formCue: "One knee down. Dumbbell chops diagonally. Rotational control.", section: "Circuit 3" },
    { name: "Bear Hold", sets: "2", duration: "30 sec", reps: "hold", formCue: "All fours, knees 2cm off mat. Still.", section: "Finisher" },
    { name: "Hollow Body Hold", sets: "2", duration: "30 sec", reps: "hold", formCue: "Press lower back down, legs extended.", section: "Finisher" },
  ],
};

// ─── OVULATORY WORKOUTS (7 unique) ──────────────────
const OVU_POWER_FULL_BODY: Workout = {
  id: "ovu-power-full-body",
  name: "Power Full Body",
  category: "strength",
  duration: "40 min",
  durationMin: 40,
  equipment: "8\u201310kg dumbbells",
  suitability: { menstrual: "rest", follicular: "suitable", ovulatory: "ideal", luteal: "rest" },
  description: "Explosive compound training. High energy and athletic output.",
  exercises: [
    { name: "Dumbbell Power Clean", sets: "3", reps: "\u00d78", formCue: "Explosive hip drive, catch at shoulders.", section: "Circuit 1 \u2014 Power" },
    { name: "Push Press", sets: "3", reps: "\u00d78", formCue: "Slight dip, drive through legs. Lock out overhead.", section: "Circuit 1 \u2014 Power" },
    { name: "Squat Jump With Dumbbells", sets: "3", reps: "\u00d76", formCue: "Hold dumbbells at sides. Land soft, reset each rep.", section: "Circuit 1 \u2014 Power" },
    { name: "Box Step-Up Jump", sets: "3", reps: "\u00d76 each", formCue: "Step up, drive knee, add small jump at top.", section: "Circuit 2 \u2014 Athletic" },
    { name: "Renegade Row To Burpee", sets: "3", reps: "\u00d76", formCue: "Row each side, jump feet in, stand.", section: "Circuit 2 \u2014 Athletic" },
    { name: "Lateral Lunge To Overhead Press", sets: "3", reps: "\u00d76 each", formCue: "Lunge to side, drive up, press.", section: "Circuit 2 \u2014 Athletic" },
    { name: "Dumbbell Thruster", sets: "2", reps: "\u00d710", formCue: "Deep squat to overhead press in one fluid motion.", section: "Circuit 3 \u2014 Conditioning" },
    { name: "Mountain Climber Sprint", sets: "2", duration: "30 sec", reps: "max", formCue: "Fast, controlled, hips level.", section: "Circuit 3 \u2014 Conditioning" },
    { name: "Plank Jack To Push-Up", sets: "2", reps: "\u00d78", formCue: "Jack feet out, perform push-up, jack feet in.", section: "Circuit 3 \u2014 Conditioning" },
    { name: "Hollow Body Flutter Kicks", sets: "1", duration: "30 sec", reps: "max", formCue: "Lower back pressed into floor.", section: "Finisher" },
  ],
};

const OVU_LOWER_POWER: Workout = {
  id: "ovu-lower-power",
  name: "Lower Body Power",
  category: "strength",
  duration: "35 min",
  durationMin: 35,
  equipment: "10kg dumbbells",
  suitability: { menstrual: "rest", follicular: "suitable", ovulatory: "ideal", luteal: "rest" },
  description: "Lower-body strength and power with explosive emphasis.",
  exercises: [
    { name: "Jump Squat", sets: "3", reps: "\u00d78", formCue: "Full depth, explode up, land soft.", section: "Circuit 1 \u2014 Explosive" },
    { name: "Power Lunge Alternating", sets: "3", reps: "\u00d76 each", formCue: "Lunge down, drive up with jump switch.", section: "Circuit 1 \u2014 Explosive" },
    { name: "Broad Jump To Squat", sets: "3", reps: "\u00d75", formCue: "Jump forward, land in squat, stand, walk back.", section: "Circuit 1 \u2014 Explosive" },
    { name: "Hip Thrust Single Leg", sets: "3", reps: "\u00d78 each", formCue: "Dumbbell on hip. Drive through heel. Explosive up, slow down.", section: "Circuit 2 \u2014 Strength" },
    { name: "Goblet Squat Pulse", sets: "3", reps: "\u00d712", formCue: "Stay low, pulse bottom third, then stand.", section: "Circuit 2 \u2014 Strength" },
    { name: "Curtsy Lunge To Knee Drive", sets: "3", reps: "\u00d78 each", formCue: "Curtsy back, drive knee up explosively.", section: "Circuit 2 \u2014 Strength" },
    { name: "Calf Raise With Dumbbells", sets: "2", reps: "\u00d715", formCue: "Slow up, hold 2 sec, slow down.", section: "Circuit 3 \u2014 Accessory" },
    { name: "Lateral Bound", sets: "2", reps: "\u00d78 each", formCue: "Stick each landing. Control the deceleration.", section: "Circuit 3 \u2014 Accessory" },
    { name: "Wall Sit Hold", sets: "2", duration: "30 sec", reps: "hold", formCue: "Back flat against wall, thighs parallel.", section: "Finisher" },
    { name: "Glute Bridge March", sets: "1", reps: "\u00d720 alternating", formCue: "Bridge position, alternate lifting knees.", section: "Finisher" },
  ],
};

const OVU_UPPER_STRENGTH: Workout = {
  id: "ovu-upper-strength",
  name: "Upper Body Strength",
  category: "strength",
  duration: "35 min",
  durationMin: 35,
  equipment: "8\u201310kg dumbbells",
  suitability: { menstrual: "rest", follicular: "suitable", ovulatory: "ideal", luteal: "suitable" },
  description: "Strong controlled upper-body pushing and pulling.",
  exercises: [
    { name: "Heavy Bent-Over Row", sets: "3", reps: "\u00d78", formCue: "Hinge 45\u00b0, pull to ribcage. Tempo 2-1-2.", section: "Circuit 1 \u2014 Pull" },
    { name: "Single-Arm Floor Press", sets: "3", reps: "\u00d78 each", formCue: "Press from floor, core braced against rotation.", section: "Circuit 1 \u2014 Push" },
    { name: "Strict Press", sets: "3", reps: "\u00d78", formCue: "No leg drive. Press straight up, ribs down.", section: "Circuit 1 \u2014 Push" },
    { name: "Pull-Up Negative Or Band-Assisted", sets: "3", reps: "\u00d75", formCue: "Jump to top, lower for 4 seconds.", section: "Circuit 2 \u2014 Vertical" },
    { name: "Chest Fly Heavy", sets: "3", reps: "\u00d710", formCue: "Wide arc, deep stretch, squeeze at top.", section: "Circuit 2 \u2014 Horizontal" },
    { name: "Y-T-W Raises", sets: "2", reps: "\u00d76 each shape", formCue: "Light weight. Scapular control and shoulder health.", section: "Circuit 2 \u2014 Stability" },
    { name: "Bicep Curl 21s", sets: "2", reps: "7-7-7", formCue: "7 bottom half, 7 top half, 7 full range.", section: "Circuit 3 \u2014 Arms" },
    { name: "Tricep Dip On Chair", sets: "2", reps: "\u00d710", formCue: "Elbows track back, not flare. Tempo 3-1-2.", section: "Circuit 3 \u2014 Arms" },
    { name: "Plank Row Hold", sets: "2", duration: "20 sec each", reps: "hold", formCue: "Hold top of row position in plank.", section: "Finisher" },
  ],
};

const OVU_ATHLETIC_CONDITIONING: Workout = {
  id: "ovu-athletic-conditioning",
  name: "Athletic Conditioning",
  category: "strength",
  duration: "30 min",
  durationMin: 30,
  equipment: "Bodyweight",
  suitability: { menstrual: "rest", follicular: "suitable", ovulatory: "ideal", luteal: "rest" },
  description: "Fast-paced athletic conditioning and coordination.",
  exercises: [
    { name: "Burpee", sets: "3", reps: "\u00d78", formCue: "Chest to floor, jump at top.", section: "Circuit 1 \u2014 Full Body" },
    { name: "Bear Crawl Forward And Back", sets: "3", duration: "30 sec", reps: "continuous", formCue: "Knees hover 2cm off ground. Opposite hand-foot.", section: "Circuit 1 \u2014 Full Body" },
    { name: "Lateral Bound Stick", sets: "3", reps: "\u00d76 each", formCue: "Jump sideways, land on one foot, hold 2 sec.", section: "Circuit 1 \u2014 Full Body" },
    { name: "Mountain Climber Cross-Body", sets: "3", duration: "30 sec", reps: "max", formCue: "Drive knee to opposite elbow.", section: "Circuit 2 \u2014 Agility" },
    { name: "Skater Jump", sets: "3", reps: "\u00d78 each", formCue: "Wide lateral bound, touch floor each side.", section: "Circuit 2 \u2014 Agility" },
    { name: "Tuck Jump", sets: "3", reps: "\u00d76", formCue: "Jump high, pull knees to chest. Land soft.", section: "Circuit 2 \u2014 Agility" },
    { name: "Plank To Down Dog Tap", sets: "2", reps: "\u00d710 alternating", formCue: "Pike hips up, tap opposite ankle.", section: "Circuit 3 \u2014 Core" },
    { name: "V-Up", sets: "2", reps: "\u00d710", formCue: "Hands and feet meet at top. Control the descent.", section: "Circuit 3 \u2014 Core" },
    { name: "Sprint In Place", sets: "2", duration: "20 sec", reps: "max", formCue: "High knees, arm drive, maximal effort.", section: "Finisher" },
  ],
};

const OVU_CORE_STABILITY: Workout = {
  id: "ovu-core-stability",
  name: "Core & Stability",
  category: "strength",
  duration: "25 min",
  durationMin: 25,
  equipment: "None",
  suitability: { menstrual: "suitable", follicular: "suitable", ovulatory: "ideal", luteal: "suitable" },
  description: "Core control, anti-rotation, and balance.",
  exercises: [
    { name: "Pallof Press Hold", sets: "3", duration: "20 sec each", reps: "hold", formCue: "Press hands out from chest. Resist the rotation.", section: "Anti-Rotation" },
    { name: "Side Plank With Hip Dip", sets: "3", reps: "\u00d78 each", formCue: "Dip hip down, lift back up. Control the motion.", section: "Anti-Rotation" },
    { name: "Dead Bug Slow", sets: "3", reps: "\u00d76 each", formCue: "Opposite arm and leg extend. 4 sec out, 4 sec back.", section: "Anti-Extension" },
    { name: "Bird Dog Hold", sets: "3", duration: "15 sec each", reps: "hold", formCue: "Extend opposite arm and leg. Perfectly still.", section: "Anti-Extension" },
    { name: "Single-Leg Balance Eyes Closed", sets: "2", duration: "30 sec each", reps: "hold", formCue: "Find stillness. Micro-adjustments only.", section: "Balance" },
    { name: "Copenhagen Side Plank", sets: "2", duration: "15 sec each", reps: "hold", formCue: "Top leg on bench. Adductor engagement.", section: "Balance" },
    { name: "Hollow Body Rock", sets: "2", duration: "20 sec", reps: "continuous", formCue: "Arms overhead, legs extended. Rock gently.", section: "Integration" },
    { name: "Bear Hold Shoulder Tap", sets: "2", reps: "\u00d710 each", formCue: "Knees hover. Tap shoulder, resist rotation.", section: "Integration" },
  ],
};

const OVU_MOBILITY_FLOW: Workout = {
  id: "ovu-mobility-flow",
  name: "Mobility Flow",
  category: "walk-restore",
  duration: "20 min",
  durationMin: 20,
  equipment: "None",
  suitability: { menstrual: "ideal", follicular: "suitable", ovulatory: "ideal", luteal: "ideal" },
  description: "Dynamic mobility and opening work.",
  exercises: [
    { name: "World\u2019s Greatest Stretch", sets: "2", reps: "\u00d75 each", formCue: "Lunge, rotate, reach. Breathe into each position.", section: "Full Body" },
    { name: "Cat-Cow Flow", sets: "1", duration: "60 sec", reps: "continuous", formCue: "Initiate from pelvis, wave through spine.", section: "Spine" },
    { name: "90-90 Hip Switch", sets: "2", reps: "\u00d78", formCue: "Sit tall, rotate hips side to side.", section: "Hips" },
    { name: "Thread The Needle", sets: "2", reps: "\u00d76 each", formCue: "Reach under and through, then open to ceiling.", section: "Thoracic" },
    { name: "Pigeon Pose", sets: "1", duration: "60 sec each", reps: "hold", formCue: "Settle into the stretch. Breathe deeply.", section: "Hips" },
    { name: "Standing Forward Fold With Clasp", sets: "1", duration: "45 sec", reps: "hold", formCue: "Hands clasped behind back. Let gravity open shoulders.", section: "Shoulders" },
    { name: "Ankle Circles And Calf Stretch", sets: "1", duration: "30 sec each", reps: "continuous", formCue: "Gentle circles both directions, then wall stretch.", section: "Lower Leg" },
    { name: "Child\u2019s Pose Breathing", sets: "1", duration: "60 sec", reps: "hold", formCue: "Wide knees, arms extended. Breathe into lower back.", section: "Cool Down" },
  ],
};

// ─── LUTEAL WORKOUTS (7 unique) ─────────────────────
const LUT_LOWER_STRENGTH: Workout = {
  id: "lut-lower-strength",
  name: "Lower Body Strength",
  category: "strength",
  duration: "35 min",
  durationMin: 35,
  equipment: "8\u201310kg dumbbells",
  suitability: { menstrual: "suitable", follicular: "suitable", ovulatory: "suitable", luteal: "ideal" },
  description: "Slower lower-body strength with time under tension.",
  exercises: [
    { name: "Tempo Goblet Squat", sets: "3", reps: "\u00d78", formCue: "4 sec down, 1 sec pause, 2 sec up.", section: "Circuit 1 \u2014 Compound" },
    { name: "Romanian Deadlift Slow", sets: "3", reps: "\u00d78", formCue: "4 sec eccentric. Feel the stretch through hamstrings.", section: "Circuit 1 \u2014 Compound" },
    { name: "Reverse Lunge Tempo", sets: "3", reps: "\u00d76 each", formCue: "3 sec down, pause at bottom, 2 sec up.", section: "Circuit 1 \u2014 Compound" },
    { name: "Hip Thrust With 4-Sec Hold", sets: "3", reps: "\u00d78", formCue: "Drive up, squeeze glutes, hold 4 sec at top.", section: "Circuit 2 \u2014 Glutes" },
    { name: "Sumo Squat Pulse", sets: "3", reps: "\u00d712", formCue: "Wide stance. Pulse bottom third, then stand.", section: "Circuit 2 \u2014 Glutes" },
    { name: "Wall Sit", sets: "2", duration: "40 sec", reps: "hold", formCue: "Back flat, thighs parallel. Breathe steadily.", section: "Circuit 2 \u2014 Isometric" },
    { name: "Single-Leg Calf Raise", sets: "2", reps: "\u00d712 each", formCue: "Slow up, hold 2 sec, slow down.", section: "Accessory" },
    { name: "Glute Bridge With Band", sets: "2", reps: "\u00d715", formCue: "Band above knees. Push out against band at top.", section: "Accessory" },
    { name: "Lying Quad Stretch", sets: "1", duration: "30 sec each", reps: "hold", formCue: "Side-lying. Pull heel to glute gently.", section: "Cool Down" },
  ],
};

const LUT_UPPER_STRENGTH: Workout = {
  id: "lut-upper-strength",
  name: "Upper Body Strength",
  category: "strength",
  duration: "35 min",
  durationMin: 35,
  equipment: "8kg dumbbells",
  suitability: { menstrual: "suitable", follicular: "suitable", ovulatory: "suitable", luteal: "ideal" },
  description: "Controlled upper-body work with stable tempo.",
  exercises: [
    { name: "Tempo Bent-Over Row", sets: "3", reps: "\u00d78", formCue: "3 sec up, hold 1 sec, 3 sec down.", section: "Circuit 1 \u2014 Pull" },
    { name: "Tempo Chest Press", sets: "3", reps: "\u00d78", formCue: "3 sec down, pause at chest, 2 sec up.", section: "Circuit 1 \u2014 Push" },
    { name: "Tempo Lateral Raise", sets: "3", reps: "\u00d78", formCue: "2 sec up, hold 2 sec at top, 3 sec down.", section: "Circuit 1 \u2014 Shoulders" },
    { name: "Slow Bicep Curl", sets: "2", reps: "\u00d710", formCue: "3 sec up, 4 sec down. No momentum.", section: "Circuit 2 \u2014 Arms" },
    { name: "Tricep Overhead Extension Slow", sets: "2", reps: "\u00d710", formCue: "4 sec eccentric. Elbows stay close.", section: "Circuit 2 \u2014 Arms" },
    { name: "Chest Fly With Long Eccentric", sets: "2", reps: "\u00d78", formCue: "4 sec opening, 1 sec pause at stretch, 2 sec close.", section: "Circuit 2 \u2014 Chest" },
    { name: "Face Pull With Band", sets: "2", reps: "\u00d712", formCue: "Pull to ears, external rotate, hold 1 sec.", section: "Postural" },
    { name: "Prone Y Raise", sets: "2", reps: "\u00d78", formCue: "Lie face down. Arms in Y. Lift slowly, hold 2 sec.", section: "Postural" },
    { name: "Cat-Cow", sets: "1", duration: "30 sec", reps: "continuous", formCue: "Slow wave through spine.", section: "Cool Down" },
  ],
};

const LUT_FULL_BODY_STRENGTH: Workout = {
  id: "lut-full-body-strength",
  name: "Full Body Strength",
  category: "strength",
  duration: "40 min",
  durationMin: 40,
  equipment: "8kg dumbbells",
  suitability: { menstrual: "suitable", follicular: "suitable", ovulatory: "suitable", luteal: "ideal" },
  description: "Full-body strength without explosive demand.",
  exercises: [
    { name: "Dumbbell Deadlift Slow", sets: "3", reps: "\u00d78", formCue: "3 sec hinge, 1 sec pause, 2 sec up.", section: "Circuit 1" },
    { name: "Goblet Squat To Pause", sets: "3", reps: "\u00d78", formCue: "Full squat, hold 2 sec at bottom, stand.", section: "Circuit 1" },
    { name: "Push-Up Tempo", sets: "3", reps: "\u00d78", formCue: "3 sec down, 1 sec hold at bottom, 2 sec up.", section: "Circuit 1" },
    { name: "Single-Arm Row Stable", sets: "3", reps: "\u00d78 each", formCue: "Hinge position. Slow and controlled pull.", section: "Circuit 2" },
    { name: "Reverse Lunge To Curl", sets: "3", reps: "\u00d76 each", formCue: "Lunge back, drive up, curl at top. Smooth.", section: "Circuit 2" },
    { name: "Overhead Press Seated", sets: "3", reps: "\u00d78", formCue: "Sit on floor or chair. Press with no leg drive.", section: "Circuit 2" },
    { name: "Bird Dog Slow", sets: "2", reps: "\u00d76 each", formCue: "Extend opposite arm and leg. 3 sec out, 3 sec back.", section: "Core" },
    { name: "Dead Bug", sets: "2", reps: "\u00d78 each", formCue: "Opposite arm and leg extend. Press lower back down.", section: "Core" },
    { name: "Child\u2019s Pose Breathing", sets: "1", duration: "45 sec", reps: "hold", formCue: "Wide knees, arms extended. Breathe into back.", section: "Cool Down" },
  ],
};

const LUT_GLUTES_CORE: Workout = {
  id: "lut-glutes-core",
  name: "Glutes & Core",
  category: "strength",
  duration: "30 min",
  durationMin: 30,
  equipment: "8\u201310kg dumbbells, booty band",
  suitability: { menstrual: "suitable", follicular: "suitable", ovulatory: "suitable", luteal: "ideal" },
  description: "Glute activation and core stability emphasis.",
  exercises: [
    { name: "Banded Glute Bridge", sets: "3", reps: "\u00d712", formCue: "Band above knees. Push out at top. Hold 2 sec.", section: "Glute Activation" },
    { name: "Banded Clamshell", sets: "3", reps: "\u00d712 each", formCue: "Side-lying. Open knees against band resistance.", section: "Glute Activation" },
    { name: "Single-Leg Hip Thrust", sets: "3", reps: "\u00d78 each", formCue: "Dumbbell on hip. Drive through heel.", section: "Glute Strength" },
    { name: "Sumo Squat Hold", sets: "2", duration: "30 sec", reps: "hold", formCue: "Wide stance, hold at bottom. Engage inner thighs.", section: "Glute Strength" },
    { name: "Pallof Press Hold", sets: "2", duration: "20 sec each", reps: "hold", formCue: "Press out, resist rotation. Breathe.", section: "Core" },
    { name: "Side Plank", sets: "2", duration: "25 sec each", reps: "hold", formCue: "Stack shoulders. Straight line head to feet.", section: "Core" },
    { name: "Dead Bug With Band", sets: "2", reps: "\u00d78 each", formCue: "Band around feet. Extend leg against resistance.", section: "Core" },
    { name: "Donkey Kick With Band", sets: "2", reps: "\u00d710 each", formCue: "Slow and controlled. Squeeze at top.", section: "Accessory" },
    { name: "Supine Figure Four Stretch", sets: "1", duration: "30 sec each", reps: "hold", formCue: "Cross ankle over knee. Pull gently.", section: "Cool Down" },
  ],
};

const LUT_PILATES_STRENGTH: Workout = {
  id: "lut-pilates-strength",
  name: "Pilates Strength",
  category: "strength",
  duration: "30 min",
  durationMin: 30,
  equipment: "None",
  suitability: { menstrual: "ideal", follicular: "suitable", ovulatory: "suitable", luteal: "ideal" },
  description: "Lower impact pilates-style strength and control.",
  exercises: [
    { name: "The Hundred", sets: "1", reps: "100 pumps", formCue: "Legs at 45\u00b0. Pump arms, breathe 5 in, 5 out.", section: "Warm-Up" },
    { name: "Roll-Up", sets: "1", reps: "\u00d78", formCue: "Articulate through every vertebra. Slow and controlled.", section: "Spinal Mobility" },
    { name: "Single-Leg Circle", sets: "1", reps: "\u00d76 each direction", formCue: "Pelvis stable. Circle from the hip.", section: "Hip Mobility" },
    { name: "Swimming", sets: "2", duration: "30 sec", reps: "continuous", formCue: "Lie prone. Flutter opposite arm-leg. Long limbs.", section: "Back Strength" },
    { name: "Side-Lying Leg Lift Series", sets: "1", reps: "\u00d710 each variation", formCue: "Lift, circle, pulse. Keep top hip stacked.", section: "Hip Strength" },
    { name: "Clam", sets: "2", reps: "\u00d712 each", formCue: "Feet together, open knees. Slow and deliberate.", section: "Hip Strength" },
    { name: "Plank To Knee Tap", sets: "2", reps: "\u00d76 each", formCue: "High plank, tap knee to floor, return.", section: "Core Integration" },
    { name: "Teaser Prep", sets: "2", reps: "\u00d76", formCue: "V-sit with bent knees. Reach arms forward. Hold.", section: "Core Integration" },
    { name: "Spine Stretch Forward", sets: "1", reps: "\u00d76", formCue: "Seated, legs extended. Round forward, stack back up.", section: "Cool Down" },
  ],
};

const LUT_MOBILITY_FLOW: Workout = {
  id: "lut-mobility-flow",
  name: "Mobility Flow",
  category: "walk-restore",
  duration: "20 min",
  durationMin: 20,
  equipment: "None",
  suitability: { menstrual: "ideal", follicular: "suitable", ovulatory: "suitable", luteal: "ideal" },
  description: "Gentle mobility and release work.",
  exercises: [
    { name: "Cat-Cow Flow", sets: "1", duration: "60 sec", reps: "continuous", formCue: "Slow, initiate from pelvis.", section: "Spine" },
    { name: "Thread The Needle", sets: "1", reps: "\u00d76 each", formCue: "Reach under and through, then open.", section: "Thoracic" },
    { name: "90-90 Hip Switch", sets: "1", reps: "\u00d78", formCue: "Sit tall, rotate hips side to side.", section: "Hips" },
    { name: "Supine Twist", sets: "1", duration: "45 sec each", reps: "hold", formCue: "Knees to one side, arms wide. Let gravity work.", section: "Spine" },
    { name: "Pigeon Pose", sets: "1", duration: "60 sec each", reps: "hold", formCue: "Settle in. Breathe into the hip.", section: "Hips" },
    { name: "Child\u2019s Pose Sway", sets: "1", duration: "60 sec", reps: "gentle sway", formCue: "Wide knees. Gently sway side to side.", section: "Rest" },
    { name: "Legs Up The Wall", sets: "1", duration: "90 sec", reps: "hold", formCue: "Hips close to wall. Let blood flow reverse.", section: "Restore" },
  ],
};

// ─── PHASE WORKOUTS MAP ─────────────────────────────
export const PHASE_WORKOUTS: Record<Phase, Workout[]> = {
  menstrual: [MENSTRUAL_FULL_BODY_A, MENSTRUAL_FULL_BODY_B, REST_WALK_RESTORE],
  follicular: [FOLLICULAR_UPPER_A, FOLLICULAR_UPPER_B, FOLLICULAR_LOWER_A, FOLLICULAR_LOWER_B, FOLLICULAR_FULL_A, FOLLICULAR_FULL_B, REST_WALK_RESTORE],
  ovulatory: [OVU_POWER_FULL_BODY, OVU_LOWER_POWER, OVU_UPPER_STRENGTH, OVU_ATHLETIC_CONDITIONING, OVU_CORE_STABILITY, OVU_MOBILITY_FLOW, REST_WALK_RESTORE],
  luteal: [LUT_LOWER_STRENGTH, LUT_UPPER_STRENGTH, LUT_FULL_BODY_STRENGTH, LUT_GLUTES_CORE, LUT_PILATES_STRENGTH, LUT_MOBILITY_FLOW, REST_WALK_RESTORE],
};

// ─── Flat WORKOUTS array (all unique workouts for logs/calendar lookups) ─
export const WORKOUTS: Workout[] = [
  ...PHASE_WORKOUTS.menstrual,
  ...PHASE_WORKOUTS.follicular.filter(w => !PHASE_WORKOUTS.menstrual.includes(w)),
  ...PHASE_WORKOUTS.ovulatory.filter(w => w !== REST_WALK_RESTORE),
  ...PHASE_WORKOUTS.luteal.filter(w => w !== REST_WALK_RESTORE && w !== LUT_MOBILITY_FLOW),
  ...STACY_SIMS_WORKOUTS,
];

// Weekly schedule (follicular default)
export const WEEKLY_SCHEDULE: { day: string; workoutId: string; label: string }[] = [
  { day: "Mon", workoutId: "upper-body-a", label: "Upper A" },
  { day: "Tue", workoutId: "lower-body-a", label: "Lower A" },
  { day: "Wed", workoutId: "full-body-a", label: "Full Body A" },
  { day: "Thu", workoutId: "rest-walk-restore", label: "Rest \u00b7 Walk \u00b7 Restore" },
  { day: "Fri", workoutId: "upper-body-b", label: "Upper B" },
  { day: "Sat", workoutId: "lower-body-b", label: "Lower B" },
  { day: "Sun", workoutId: "full-body-b", label: "Full Body B" },
];

// Phase adjustment banners
export const PHASE_MOVEMENT_REC: Record<Phase, { title: string; description: string }> = {
  menstrual: {
    title: "Rest Is Productive",
    description: "Your body is in its rest phase. All movement is optional today. Rest is productive.",
  },
  follicular: {
    title: "Your Strength Window Is Open",
    description: "Estrogen is rising which increases strength, stamina, and pain tolerance. Push harder.",
  },
  ovulatory: {
    title: "Peak Strength",
    description: "Push if it feels good. You\u2019re at your physical peak.",
  },
  luteal: {
    title: "Honour How You Feel",
    description: "Drop intensity 20% if needed. Listen to your body.",
  },
};

export const TODAY_WORKOUT: Record<Phase, string> = {
  menstrual: "rest-walk-restore",
  follicular: "upper-body-a",
  ovulatory: "ovu-power-full-body",
  luteal: "lut-full-body-strength",
};

export const SUIT_COLORS: Record<Suitability, { bg: string; text: string; label: string }> = {
  ideal: { bg: "bg-accent/15", text: "text-accent", label: "Ideal This Phase" },
  suitable: { bg: "bg-petal-gold/15", text: "text-petal-gold", label: "Suitable" },
  rest: { bg: "bg-muted", text: "text-muted-foreground", label: "Rest Phase" },
};

export const CATEGORY_LABELS: Record<WorkoutCategory, string> = {
  strength: "Strength",
  "walk-restore": "Walk & Restore",
};

export const FEELINGS = ["Energised", "Good", "Moderate", "Low", "Depleted"];

export const FEELING_REC: Record<string, string> = {
  Energised: "You\u2019re primed \u2014 try the scheduled strength session today.",
  Good: "A solid day for your programmed workout.",
  Moderate: "Listen in \u2014 consider the Rest \u00b7 Walk \u00b7 Restore option.",
  Low: "Your body is asking for gentleness. Try the Mindful Walk or Restorative Yoga.",
  Depleted: "Rest is not laziness. Stretch gently, drink water, and honour what your body needs.",
};

// Progressive overload
export const WEEK_LABELS: Record<number, string> = {
  1: "Week 1 \u00b7 Learn the pattern.",
  2: "Week 2 \u00b7 Add a rep or slow the tempo.",
  3: "Week 3 \u00b7 Go heavier or slower.",
  4: "Week 4 \u00b7 Deload. Form focus.",
};

export function getTrainingWeek(): number {
  const val = localStorage.getItem("mindcast_training_week");
  return val ? parseInt(val, 10) : 1;
}

export function setTrainingWeek(week: number): void {
  localStorage.setItem("mindcast_training_week", Math.max(1, Math.min(4, week)).toString());
}

// Heart rate helpers
export function getUserAge(): number | null {
  const val = localStorage.getItem("mindcast_user_age");
  return val ? parseInt(val, 10) : null;
}

export function setUserAge(age: number): void {
  localStorage.setItem("mindcast_user_age", age.toString());
}

export function getUserWeight(): number | null {
  const val = localStorage.getItem("signal_user_weight_kg");
  return val ? parseFloat(val) : null;
}

export function setUserWeight(weight: number): void {
  localStorage.setItem("signal_user_weight_kg", weight.toString());
}

export function getMaxHR(age: number): number {
  return Math.round(208 - 0.7 * age);
}

export interface HRZone {
  zone: number;
  label: string;
  minPct: number;
  maxPct: number;
  color: string;
}

export const HR_ZONES: HRZone[] = [
  { zone: 1, label: "Recovery", minPct: 50, maxPct: 60, color: "hsl(var(--sage-mist))" },
  { zone: 2, label: "Fat Burn", minPct: 60, maxPct: 70, color: "hsl(var(--petal-gold))" },
  { zone: 3, label: "Aerobic", minPct: 70, maxPct: 80, color: "hsl(var(--coral-flame))" },
  { zone: 4, label: "Threshold", minPct: 80, maxPct: 90, color: "hsl(340 50% 55%)" },
  { zone: 5, label: "Maximum", minPct: 90, maxPct: 100, color: "hsl(var(--lavender-dust))" },
];

export function getZoneForBPM(bpm: number, maxHR: number): HRZone {
  const pct = (bpm / maxHR) * 100;
  for (let i = HR_ZONES.length - 1; i >= 0; i--) {
    if (pct >= HR_ZONES[i].minPct) return HR_ZONES[i];
  }
  return HR_ZONES[0];
}

// Estimate calories burnt using HR-based formula
export function estimateCalories(avgHR: number, durationMin: number, weightKg: number, age: number, gender: "female" | "male" = "female"): number {
  if (avgHR === 0 || durationMin === 0 || weightKg === 0) return 0;
  // Keytel et al. (2005) formula
  if (gender === "female") {
    return Math.round(durationMin * (0.4472 * avgHR - 0.1263 * weightKg + 0.074 * age - 20.4022) / 4.184);
  }
  return Math.round(durationMin * (0.6309 * avgHR + 0.1988 * weightKg + 0.2017 * age - 55.0969) / 4.184);
}

export interface WorkoutSession {
  id: string;
  workoutName: string;
  duration: number; // seconds
  avgHR: number;
  maxHR: number;
  zoneMins: number[];
  zone2PlusPercent: number;
  phase: Phase;
  cycleDay: number;
  date: string;
  hrData: { time: number; bpm: number }[];
  manual?: boolean;
  notes?: string;
  caloriesBurnt?: number;
}

export function saveWorkoutSession(session: WorkoutSession): void {
  const key = `workoutSession:${session.id}`;
  localStorage.setItem(key, JSON.stringify(session));
  const index = getSessionIndex();
  if (!index.includes(session.id)) {
    index.push(session.id);
    localStorage.setItem("workoutSessions", JSON.stringify(index));
  }
}

export function getSessionIndex(): string[] {
  const val = localStorage.getItem("workoutSessions");
  return val ? JSON.parse(val) : [];
}

export function getWorkoutSession(id: string): WorkoutSession | null {
  const val = localStorage.getItem(`workoutSession:${id}`);
  return val ? JSON.parse(val) : null;
}

export function getAllSessions(): WorkoutSession[] {
  return getSessionIndex()
    .map(id => getWorkoutSession(id))
    .filter((s): s is WorkoutSession => s !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Measurements
export interface BodyMeasurements {
  date: string;
  height?: number;
  weight?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  upperArm?: number;
  thigh?: number;
}

export function saveMeasurements(m: BodyMeasurements): void {
  localStorage.setItem(`measurements:${m.date}`, JSON.stringify(m));
  const index = getMeasurementDates();
  if (!index.includes(m.date)) {
    index.push(m.date);
    index.sort();
    localStorage.setItem("measurementDates", JSON.stringify(index));
  }
}

export function getMeasurements(date: string): BodyMeasurements | null {
  const val = localStorage.getItem(`measurements:${date}`);
  return val ? JSON.parse(val) : null;
}

export function getMeasurementDates(): string[] {
  const val = localStorage.getItem("measurementDates");
  return val ? JSON.parse(val) : [];
}

export function getLatestMeasurements(): BodyMeasurements | null {
  const dates = getMeasurementDates();
  if (dates.length === 0) return null;
  return getMeasurements(dates[dates.length - 1]);
}

export function getFirstMeasurements(): BodyMeasurements | null {
  const dates = getMeasurementDates();
  if (dates.length === 0) return null;
  return getMeasurements(dates[0]);
}
