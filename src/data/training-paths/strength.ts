import type { Exercise, Session, Week, TrainingPath } from "./types";
import { block, ex, restDay, walkDay, DOUBLE_PROGRESSION } from "./build";

// Strength from the Ground Up · 3 full-body days a week, 30–45 min, dumbbells + a band.
// Built on the 2026 ACSM resistance-training position stand: every major muscle twice a
// week, ~10 hard sets per muscle, effort set by reps in reserve (RIR), load progressed by
// double progression, antagonist supersets to save time, carries for bone and grip
// (LIFTMOR), and a lighter week 8. Days 1/3/5 are lifting days; walks are optional.

type Slot = "squat" | "row" | "hinge" | "push" | "carryA" | "coreA" | "bridge" | "pull" | "lunge" | "press" | "carryB" | "coreB";

const MOVES: Record<Slot, (reps: string) => Exercise> = {
  squat: reps => ex("Goblet Squat", reps, { weight: "One dumbbell, about 6–12 kg to start", cue: "Sit down between your hips, chest tall, then drive the floor away.", alt: "Bodyweight box squat to a chair" }),
  row: reps => ex("Single-Arm Dumbbell Row", `${reps} each side`, { weight: "One dumbbell, about 6–12 kg", cue: "Hand and knee on a bench or chair. Row your elbow to your hip and pause.", alt: "Band row" }),
  hinge: reps => ex("Dumbbell Romanian Deadlift", reps, { weight: "Two dumbbells, about 6–12 kg each", cue: "Soft knees, hips back, dumbbells close to your legs. Feel the hamstrings, then stand tall.", alt: "Single-leg RDL holding a wall" }),
  push: reps => ex("Push-Up", reps, { weight: "Bodyweight. Hands on a bench until 12 on the floor feel easy", cue: "One long line from head to heels. Lower your chest to fist height, push the floor away.", alt: "Dumbbell floor press" }),
  carryA: () => ex("Farmer's Carry", "30–40 s", { weight: "Your two heaviest dumbbells", cue: "Tall, shoulders down, slow steps.", alt: "Farmer's hold, standing still" }),
  coreA: () => ex("Dead Bug", "6–8 each side", { weight: "Bodyweight", cue: "Low back heavy on the floor. Exhale as the opposite arm and leg reach long." }),
  bridge: reps => ex("Dumbbell Hip Thrust", reps, { weight: "One heavy dumbbell on your hips, about 10–20 kg", cue: "Upper back on a couch or bench edge, chin tucked. Drive through your heels, ribs down at the top.", alt: "Glute bridge on the floor" }),
  pull: reps => ex("Band Lat Pulldown", reps, { weight: "Long band anchored high (door anchor)", cue: "Pull your elbows down to your ribs, chest proud, no shrugging.", alt: "Dumbbell pullover on the floor" }),
  lunge: reps => ex("Reverse Lunge", `${reps} each side`, { weight: "Two dumbbells, about 4–10 kg each", cue: "Step back long, drop the back knee straight down, push up through the front heel." }),
  press: reps => ex("Half-Kneeling Single-Arm Press", `${reps} each side`, { weight: "One dumbbell, about 4–8 kg", cue: "Down knee on the dumbbell side. Squeeze that glute and press straight up.", alt: "Seated dumbbell shoulder press" }),
  carryB: () => ex("Suitcase Carry", "30 s each side", { weight: "One heavy dumbbell", cue: "Walk tall without leaning towards the weight." }),
  coreB: () => ex("Side Plank", "20–30 s each side", { weight: "Bodyweight", cue: "Elbow under shoulder, hips lifted, steady breath.", alt: "Bent-knee side plank" }),
};

interface WeekPlan {
  week: number;
  theme: string;
  progression: string;
  rounds: number;
  reps: string;
  /** Unilateral moves (rows, lunges, presses) in the heavier weeks. */
  sideReps?: string;
  rir: string;
  tempo?: string;
  rest: number;
  minutes: number;
  power?: boolean;
  feel: string;
  note: string;
}

const WEEKS: WeekPlan[] = [
  { week: 1, theme: "Grounding · learn the patterns", progression: `2 rounds of 10–12, about 3–4 reps left in the tank (RIR 3–4). Lower for 3 s. ${DOUBLE_PROGRESSION}`, rounds: 2, reps: "10–12", rir: "3–4", tempo: "3‑1‑1", rest: 75, minutes: 30, feel: "Curious and patient", note: "Find weights that feel steady for 12 with plenty left. Write them down." },
  { week: 2, theme: "Stability · own the bottom", progression: "3 rounds of 10–12 at RIR 3. Pause 2 s at the bottom of every squat, hinge and bridge.", rounds: 3, reps: "10–12", rir: "3", tempo: "3‑2‑1", rest: 75, minutes: 38, feel: "Slow and controlled", note: "Pauses make light weights honest. Same weights as week 1 are fine." },
  { week: 3, theme: "Build · add reps, then weight", progression: `3 rounds of 8–12 at RIR 2–3. ${DOUBLE_PROGRESSION}`, rounds: 3, reps: "8–12", rir: "2–3", rest: 75, minutes: 38, feel: "Building", note: "If every set hit 12 last week, take the next dumbbell up." },
  { week: 4, theme: "Load · heavier pairs", progression: "3 rounds of 8–10 at RIR 2. Longer rest on the first two pairs.", rounds: 3, reps: "8–10", rir: "2", rest: 90, minutes: 40, feel: "Strong and steady", note: "Fewer reps means a heavier dumbbell. Rest the full 90 s." },
  { week: 5, theme: "Strength · fewer, heavier reps", progression: "4 rounds of 6–8 at RIR 2 on the first two pairs. Carries stay at 2 rounds.", rounds: 4, reps: "6–8", rir: "2", rest: 120, minutes: 45, feel: "Focused", note: "This is where strength shows up. Heavy, clean, unhurried." },
  { week: 6, theme: "Power · move with intent", progression: "Swings first while you are fresh, then 3 rounds of 6: lower for 2–3 s, lift as fast as you can with control.", rounds: 3, reps: "6", rir: "2", tempo: "3‑0‑X", rest: 90, minutes: 42, power: true, feel: "Snappy", note: "Speed is the goal on the way up. Stop a set when the reps slow." },
  { week: 7, theme: "Peak · your heaviest clean sets", progression: "4 rounds of 5–6 at RIR 1–2 on the first two pairs, 2 min rest. No max testing.", rounds: 4, reps: "5–6", sideReps: "6–8", rir: "1–2", rest: 120, minutes: 45, feel: "Proud", note: "Heaviest weights of the block, still with a rep or two in reserve." },
  { week: 8, theme: "Integrate · lighter week", progression: "2 rounds of 8 with your week 5 weights at RIR 3–4. Day 5 has an optional rep check.", rounds: 2, reps: "8", rir: "3–4", rest: 60, minutes: 30, feel: "Light and proud", note: "Recovery is where the strength settles in." },
];

const WARMUP_A = ["Cat–cow ×8", "Bodyweight squat to reach ×10", "Glute bridge ×10", "One light warm-up set of the first lift"];
const WARMUP_B = ["Hip circles ×5 each way", "Band pull-apart ×15", "Reverse lunge reach ×5 each side", "One light warm-up set of the first lift"];
const COOLDOWN = ["Child's pose · 1 min", "Figure-four stretch · 30 s each side", "Doorway chest stretch · 30 s"];

function lift(day: number, kind: "A" | "B", w: WeekPlan, extra?: string): Session {
  // Unilateral moves (rows, lunges, presses) keep a slightly higher range in the heaviest weeks.
  const side = w.sideReps ?? w.reps;
  const rx = (e: Exercise): Exercise => ({ ...e, rir: w.rir, ...(w.tempo ? { tempo: w.tempo } : {}) });
  const pairs = kind === "A"
    ? [
      block(w.rounds, w.rest, [rx(MOVES.squat(w.reps)), rx(MOVES.row(side))]),
      block(w.rounds, w.rest, [rx(MOVES.hinge(w.reps)), rx(MOVES.push(w.reps))]),
      block(2, 45, [MOVES.carryA(""), MOVES.coreA("")], "Carry + core"),
    ]
    : [
      block(w.rounds, w.rest, [rx(MOVES.bridge(w.reps)), rx(MOVES.pull(w.reps))]),
      block(w.rounds, w.rest, [rx(MOVES.lunge(side)), rx(MOVES.press(side))]),
      block(2, 45, [MOVES.carryB(""), MOVES.coreB("")], "Carry + core"),
    ];
  const supersets = w.power
    ? [block(3, 60, [ex("Dumbbell Swing", "5", { weight: "One dumbbell held by the head, about 8–16 kg", cue: "Hike it back, snap your hips forward, let it float to chest height.", alt: "Fast-up glute bridge", rir: "4–5" })], "Power opener"), ...pairs]
    : pairs;
  return {
    day,
    name: `Full Body ${kind}`,
    focus: kind === "A" ? "Squat, row, hinge, push, carry" : "Bridge, pull, lunge, press, carry",
    durationMin: w.minutes,
    equipment: "Dumbbells, long band, mat",
    feel: w.feel,
    warmup: kind === "A" ? WARMUP_A : WARMUP_B,
    supersets,
    cooldown: COOLDOWN,
    coachingNote: extra ? `${w.note} ${extra}` : w.note,
  };
}

function week(w: WeekPlan): Week {
  // Day 5 alternates so A and B each get three sessions every fortnight.
  const third = w.week % 2 === 1 ? "A" : "B";
  return {
    week: w.week,
    theme: w.theme,
    progression: w.progression,
    sessions: [
      lift(1, "A", w),
      walkDay(2),
      lift(3, "B", w),
      restDay(4),
      lift(5, third, w, w.week === 8 ? "Optional check: with your week 1 weights, how many clean goblet squats and RDLs can you do now?" : undefined),
      walkDay(6, 30),
      restDay(7),
    ],
  };
}

export const strengthFromTheGroundUp: TrainingPath = {
  id: "strength-from-the-ground-up",
  name: "Strength from the Ground Up",
  subtitle: "Three full-body sessions a week",
  focus: "strength",
  description:
    "Three 30–45 minute full-body sessions a week with dumbbells and a band. Every session squats or bridges, hinges, pushes, pulls and carries, so each muscle is trained twice a week. You lift by feel (reps in reserve), add weight when the reps get easy, and finish with a lighter week.",
  whoItIsFor:
    "New to lifting, or coming back after a break, a baby or burnout. You need a few dumbbells (roughly 4–16 kg), a long resistance band and 30–45 minutes, three times a week.",
  equipmentLevel: "home",
  daysPerWeek: 3,
  sessionMinutes: [30, 45],
  weeks: WEEKS.map(week),
};
