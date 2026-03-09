import { Phase } from "@/lib/cycle-utils";

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

export const WORKOUTS: Workout[] = [
  // WORKOUT 1 — UPPER BODY A
  {
    id: "upper-body-a",
    name: "Upper Body A",
    category: "strength",
    duration: "35 min",
    durationMin: 35,
    equipment: "5–8kg dumbbells",
    suitability: { menstrual: "rest", follicular: "ideal", ovulatory: "ideal", luteal: "suitable" },
    description: "Chest, back, and shoulders. Three circuits repeated twice with pilates tempo control. 45 seconds on, 15 seconds rest.",
    progressionNotes: [
      "Week 2: Add 1 rep per circuit or increase weight 2kg if form allows.",
      "Week 3: Slow all tempos by 1 count.",
      "Week 4: Deload — drop reps 20%.",
    ],
    exercises: [
      // Circuit 1
      { name: "Single-Arm Dumbbell Row", sets: "2", duration: "45 sec each side", reps: "tempo", formCue: "Tempo 2-1-3. Drive elbow to hip.", section: "Circuit 1" },
      { name: "Chest Press On Mat", sets: "2", duration: "45 sec", reps: "tempo", formCue: "Tempo 3-1-2. Exhale on press.", section: "Circuit 1" },
      { name: "Rear Delt Fly", sets: "2", duration: "45 sec", reps: "tempo", formCue: "Hinge 45°, slow arc to shoulder height.", section: "Circuit 1" },
      // Circuit 2
      { name: "Bicep Curl", sets: "2", duration: "45 sec", reps: "tempo", formCue: "Tempo 2-1-3. Elbows pinned, no swing.", section: "Circuit 2" },
      { name: "Tricep Overhead Extension", sets: "2", duration: "45 sec", reps: "tempo", formCue: "Tempo 3-1-3. Ribs down, core braced.", section: "Circuit 2" },
      { name: "Lateral Raise", sets: "2", duration: "45 sec", reps: "tempo", formCue: "Tempo 2-2-3. Lead with pinky finger.", section: "Circuit 2" },
      // Circuit 3
      { name: "Arnold Press", sets: "2", duration: "45 sec", reps: "tempo", formCue: "Rotate palms from facing you to facing out.", section: "Circuit 3" },
      { name: "Bent-Over Row Bilateral", sets: "2", duration: "45 sec", reps: "tempo", formCue: "Tempo 2-1-3. Full range of motion.", section: "Circuit 3" },
      { name: "Push-Up Full Or Modified", sets: "2", duration: "45 sec", reps: "tempo", formCue: "Tempo 3-1-2. Straight line neck to heel.", section: "Circuit 3" },
      // Finisher
      { name: "Plank Shoulder Taps", sets: "1", reps: "×20 alternating", formCue: "Minimise hip rotation.", section: "Finisher" },
      { name: "Dead Bug", sets: "1", reps: "×10 each side", formCue: "Slow and controlled.", section: "Finisher" },
      { name: "Thoracic Rotation Half-Kneeling", sets: "1", reps: "×8 each", formCue: "Open chest, follow hand with eyes.", section: "Finisher" },
    ],
  },

  // WORKOUT 2 — UPPER BODY B
  {
    id: "upper-body-b",
    name: "Upper Body B",
    category: "strength",
    duration: "35 min",
    durationMin: 35,
    equipment: "5–8kg dumbbells, resistance band",
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
      { name: "Pike Push-Up", sets: "1", reps: "×10", formCue: "Hips high, press through shoulders.", section: "Finisher" },
      { name: "Hollow Body Hold", sets: "2", duration: "30 sec", reps: "hold", formCue: "Press lower back into floor.", section: "Finisher" },
      { name: "Superman Hold", sets: "2", duration: "30 sec", reps: "hold", formCue: "Lift arms and legs, squeeze glutes.", section: "Finisher" },
    ],
  },

  // WORKOUT 3 — LOWER BODY A
  {
    id: "lower-body-a",
    name: "Lower Body A",
    category: "strength",
    duration: "40 min",
    durationMin: 40,
    equipment: "8–10kg dumbbells, booty band",
    suitability: { menstrual: "rest", follicular: "ideal", ovulatory: "ideal", luteal: "suitable" },
    description: "Glutes, quads, and hamstrings. Time under tension is everything here.",
    exercises: [
      { name: "Romanian Deadlift", sets: "2", duration: "45 sec", reps: "tempo", formCue: "Tempo 3-1-2. Hamstrings load fully.", section: "Circuit 1 — Posterior Chain" },
      { name: "Glute Bridge With Band", sets: "2", duration: "45 sec", reps: "tempo", formCue: "Hold 1 sec at top. Tempo 1-1-3.", section: "Circuit 1 — Posterior Chain" },
      { name: "Single-Leg Deadlift", sets: "2", duration: "45 sec each", reps: "tempo", formCue: "Bodyweight or light. Balance and control.", section: "Circuit 1 — Posterior Chain" },
      { name: "Goblet Squat", sets: "2", duration: "45 sec", reps: "tempo", formCue: "Dumbbell at chest. Tempo 3-1-2.", section: "Circuit 2 — Quad Focus" },
      { name: "Reverse Lunge Alternating", sets: "2", duration: "45 sec", reps: "tempo", formCue: "Back knee taps mat. Tempo 3-1-2.", section: "Circuit 2 — Quad Focus" },
      { name: "Sumo Squat", sets: "2", duration: "45 sec", reps: "tempo", formCue: "Wide stance, toes out. Tempo 4-1-2.", section: "Circuit 2 — Quad Focus" },
      { name: "Lateral Band Walk", sets: "2", duration: "45 sec", reps: "10 steps each", formCue: "Low squat hold throughout.", section: "Circuit 3 — Accessory" },
      { name: "Donkey Kicks With Band", sets: "2", duration: "45 sec each", reps: "tempo", formCue: "Slow and controlled. No hip rotation.", section: "Circuit 3 — Accessory" },
      { name: "Side-Lying Leg Raise", sets: "2", duration: "45 sec each", reps: "tempo", formCue: "Ankle weight optional. Tempo 2-1-3.", section: "Circuit 3 — Accessory" },
      { name: "Bridge Pulse", sets: "1", reps: "×30", formCue: "Small range, glute squeeze.", section: "Finisher" },
      { name: "Frog Bridge", sets: "1", reps: "×15", formCue: "Soles together, knees wide.", section: "Finisher" },
      { name: "Fire Hydrant Pulse", sets: "1", reps: "×20 each side", formCue: "Small pulses at top.", section: "Finisher" },
    ],
  },

  // WORKOUT 4 — LOWER BODY B
  {
    id: "lower-body-b",
    name: "Lower Body B",
    category: "strength",
    duration: "40 min",
    durationMin: 40,
    equipment: "8–10kg dumbbells, booty band",
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
      { name: "Glute Bridge Fast", sets: "1", reps: "×20 bodyweight", formCue: "Quick, full squeeze at top.", section: "Finisher" },
      { name: "Single-Leg Bridge", sets: "1", reps: "×15 each", formCue: "Control the descent.", section: "Finisher" },
      { name: "Clam With Band", sets: "1", reps: "×20 each side", formCue: "Keep feet together, open knees.", section: "Finisher" },
    ],
  },

  // WORKOUT 5 — FULL BODY A
  {
    id: "full-body-a",
    name: "Full Body A",
    category: "strength",
    duration: "40 min",
    durationMin: 40,
    equipment: "8–10kg dumbbells",
    suitability: { menstrual: "suitable", follicular: "ideal", ovulatory: "ideal", luteal: "suitable" },
    description: "Compound movements. Most efficient session of the week — works everything at once.",
    exercises: [
      { name: "Dumbbell Deadlift", sets: "2", duration: "45 sec", reps: "tempo", formCue: "Tempo 3-1-2. Hinge, not squat.", section: "Circuit 1 — Big Movements" },
      { name: "Push-Up To Downward Dog", sets: "2", duration: "45 sec", reps: "tempo", formCue: "Push-up then press to down dog. Hold 2 sec.", section: "Circuit 1 — Big Movements" },
      { name: "Goblet Squat To Press", sets: "2", duration: "45 sec", reps: "tempo", formCue: "Squat, drive up, press overhead. Exhale on press.", section: "Circuit 1 — Big Movements" },
      { name: "Single-Arm Row To Rotation", sets: "2", duration: "45 sec each", reps: "tempo", formCue: "Row then rotate thoracic to ceiling.", section: "Circuit 2 — Control Focus" },
      { name: "Reverse Lunge To Bicep Curl", sets: "2", duration: "45 sec", reps: "tempo", formCue: "Lunge, drive up, curl at top.", section: "Circuit 2 — Control Focus" },
      { name: "Lateral Lunge To Lateral Raise", sets: "2", duration: "45 sec", reps: "tempo", formCue: "Lunge to side, drive up, arms raise.", section: "Circuit 2 — Control Focus" },
      { name: "Dead Bug With Dumbbell Press", sets: "2", duration: "45 sec", reps: "tempo", formCue: "One arm presses, opposite leg extends. Anti-extension core work.", section: "Circuit 3 — Core Integration" },
      { name: "Bird Dog Row", sets: "2", duration: "45 sec each", reps: "tempo", formCue: "On all fours. Row arm, extend opposite leg.", section: "Circuit 3 — Core Integration" },
      { name: "Plank To Push-Up", sets: "2", duration: "45 sec", reps: "tempo", formCue: "Forearm plank up to hand plank. Alternate leading arm.", section: "Circuit 3 — Core Integration" },
      { name: "Squat Jump Or Squat Pulse", sets: "1", reps: "×10 jumps or ×20 pulse", formCue: "Land soft, drive through heels.", section: "Finisher" },
      { name: "Mountain Climbers", sets: "1", reps: "×20 alternating", formCue: "Fast but controlled.", section: "Finisher" },
      { name: "Inchworm", sets: "1", reps: "×5 full length", formCue: "Walk hands out, walk feet in.", section: "Finisher" },
    ],
  },

  // WORKOUT 6 — FULL BODY B
  {
    id: "full-body-b",
    name: "Full Body B",
    category: "strength",
    duration: "40 min",
    durationMin: 40,
    equipment: "5–8kg dumbbells",
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
  },

  // WORKOUT 7 — REST · WALK · RESTORE
  {
    id: "rest-walk-restore",
    name: "Rest · Walk · Restore",
    category: "walk-restore",
    duration: "20–40 min",
    durationMin: 30,
    equipment: "None",
    suitability: { menstrual: "ideal", follicular: "suitable", ovulatory: "suitable", luteal: "ideal" },
    description: "Choose the option that honours how your body feels today.",
    restOptions: [
      { id: "mindful-walk", name: "Mindful Walk", duration: "30 min", description: "Walk at a pace that lets you breathe through your nose. No music. Notice 5 things you can see, 4 you can hear, 3 you can feel." },
      { id: "restorative-yoga", name: "Restorative Yoga", duration: "20–40 min", description: "Full body yin and restorative sequence. Hold each pose 2–4 minutes. Dragon, butterfly, caterpillar, sleeping swan, legs up the wall." },
      { id: "mobility-flow", name: "Mobility Flow", duration: "15 min", description: "Hip flexors, thoracic spine, hamstrings, shoulders. Slow and deliberate. 45 seconds minimum per stretch." },
    ],
    exercises: [],
  },
];

// Weekly schedule
export const WEEKLY_SCHEDULE: { day: string; workoutId: string; label: string }[] = [
  { day: "Mon", workoutId: "upper-body-a", label: "Upper A" },
  { day: "Tue", workoutId: "lower-body-a", label: "Lower A" },
  { day: "Wed", workoutId: "full-body-a", label: "Full Body A" },
  { day: "Thu", workoutId: "rest-walk-restore", label: "Rest · Walk · Restore" },
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
    description: "Push if it feels good. You're at your physical peak.",
  },
  luteal: {
    title: "Honour How You Feel",
    description: "Drop intensity 20% if needed. Listen to your body.",
  },
};

export const TODAY_WORKOUT: Record<Phase, string> = {
  menstrual: "rest-walk-restore",
  follicular: "upper-body-a",
  ovulatory: "full-body-a",
  luteal: "full-body-a",
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
  Energised: "You're primed — try the scheduled strength session today.",
  Good: "A solid day for your programmed workout.",
  Moderate: "Listen in — consider the Rest · Walk · Restore option.",
  Low: "Your body is asking for gentleness. Try the Mindful Walk or Restorative Yoga.",
  Depleted: "Rest is not laziness. Stretch gently, drink water, and honour what your body needs.",
};

// Progressive overload
export const WEEK_LABELS: Record<number, string> = {
  1: "Week 1 · Learn the pattern.",
  2: "Week 2 · Add a rep or slow the tempo.",
  3: "Week 3 · Go heavier or slower.",
  4: "Week 4 · Deload. Form focus.",
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
}

export function saveWorkoutSession(session: WorkoutSession): void {
  const key = `workoutSession:${session.id}`;
  localStorage.setItem(key, JSON.stringify(session));
  // Add to index
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
