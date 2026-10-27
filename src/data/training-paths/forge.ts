import type { Exercise, Session, Superset, Week, TrainingPath } from "./types";
import { block, ex, restDay, walkDay, DOUBLE_PROGRESSION } from "./build";

// ─────────────────────────────────────────────────────────────────
// THE FORGE – 8‑Week Muscle Building (Hypertrophy) · 4 gym days, ≤50 min
//
// Upper/lower split so every muscle is trained twice a week (Schoenfeld 2016) with
// roughly 10–15 hard sets per muscle per week (Schoenfeld 2017; Pelland 2026), sets
// taken to 1–3 reps in reserve (Robinson 2024), 90–120 s rest on compound lifts
// (Singer 2024), accessories as antagonist supersets to keep sessions short
// (Zhang 2025), and lighter weeks 4 and 8 (Bell 2023). No max testing.
// ─────────────────────────────────────────────────────────────────

type Role = "main" | "acc";
interface Slot { role: Role; rest: number; moves: Exercise[]; label?: string }

const main = (rest: number, move: Exercise): Slot => ({ role: "main", rest, moves: [move] });
const acc = (rest: number, moves: Exercise[], label?: string): Slot => ({ role: "acc", rest, moves, label });

const LOWER_A: Slot[] = [
  main(120, ex("Barbell Squat", "", { cue: "Brace, sit down between your hips, drive the floor away. Set the safeties.", alt: "Goblet squat or leg press" })),
  main(90, ex("Barbell Romanian Deadlift", "", { cue: "Bar close to your legs, hips back until the hamstrings stretch, then stand tall.", alt: "Dumbbell Romanian deadlift" })),
  acc(60, [
    ex("Walking Lunge", "10 each side", { weight: "Two dumbbells", cue: "Long steps, back knee kisses the floor." }),
    ex("Standing Calf Raise", "10–15", { cue: "Pause at the top and the bottom.", alt: "Single-leg calf raise on a step" }),
  ]),
  acc(75, [ex("Leg Press", "10–15", { cue: "Lower until your hips want to tuck, then press without locking out.", alt: "Heels-elevated goblet squat" })]),
];

const UPPER_A: Slot[] = [
  main(120, ex("Barbell Bench Press", "", { cue: "Shoulder blades tucked, feet planted. Touch low chest, press up and back.", alt: "Dumbbell bench press" })),
  main(90, ex("Lat Pulldown", "", { cue: "Pull the bar to your upper chest, elbows down to your ribs.", alt: "Band lat pulldown" })),
  acc(90, [
    ex("Chest-Supported Row", "8–12", { cue: "Chest on an incline bench, row your elbows towards your hips.", alt: "Single-arm dumbbell row" }),
    ex("Seated Dumbbell Shoulder Press", "8–10", { cue: "Ribs down, press up and slightly in." }),
  ]),
  acc(60, [
    ex("Lateral Raise", "12–20", { weight: "Light dumbbells. Add reps before weight", cue: "Lead with the elbows to shoulder height, lower for 2 s." }),
    ex("Face Pull", "12–15", { cue: "Rope to your face, elbows high and wide.", alt: "Band face pull" }),
  ]),
];

const LOWER_B: Slot[] = [
  main(120, ex("Barbell Hip Thrust", "", { cue: "Upper back on the bench, chin tucked, drive through your heels and pause at the top.", alt: "Dumbbell hip thrust" })),
  main(90, ex("Dumbbell Bulgarian Split Squat", "", { cue: "Back foot on the bench, drop straight down. A slight lean puts more into the glutes.", alt: "Split squat, back foot on the floor" })),
  acc(60, [
    ex("Seated Leg Curl", "10–12", { cue: "Lean forward slightly, curl and pause, lower for 2–3 s.", alt: "Swiss-ball hamstring curl" }),
    ex("Back Extension", "12–15", { cue: "Hinge at the hips, squeeze your glutes to come up. No over-arching.", alt: "Glute bridge" }),
  ]),
  acc(45, [
    ex("Seated Hip Abduction", "15–20", { cue: "Lean forward slightly, push the pads out and pause.", alt: "Banded clamshell" }),
    ex("Dead Bug", "6–8 each side", { cue: "Low back heavy, exhale as you reach long." }),
  ]),
];

const UPPER_B: Slot[] = [
  main(90, ex("Incline Dumbbell Bench Press", "", { cue: "Bench at 30–45°. Lower to upper chest, press up and in." })),
  acc(90, [
    ex("Single-Arm Dumbbell Row", "10–12 each side", { cue: "Row to your hip and pause." }),
    ex("Arnold Press", "8–10", { cue: "Palms face you at the bottom, rotate out as you press." }),
  ]),
  acc(60, [
    ex("Lateral Raise", "12–20", { weight: "Light dumbbells. Add reps before weight", cue: "Lead with the elbows, no shrugging." }),
    ex("Reverse Fly", "12–15", { cue: "Hinge forward, open your arms wide, squeeze between the shoulder blades.", alt: "Band pull-apart" }),
  ]),
  acc(60, [
    ex("Dumbbell Biceps Curl", "10–12", { cue: "Elbows still, lower for 3 s." }),
    ex("Overhead Triceps Extension", "10–12", { cue: "Elbows point forward, lower behind your head, extend fully." }),
  ]),
];

interface WeekPlan {
  week: number;
  theme: string;
  progression: string;
  mainSets: number;
  mainReps: string;
  accSets: number;
  rir: string;
  accRir: string;
  topSet?: boolean;
  deload?: boolean;
  minutes: number;
  feel: string;
  note: string;
}

const WEEKS: WeekPlan[] = [
  { week: 1, theme: "Foundation · learn the lifts", progression: `Main lifts 3×8–10, accessories 3 sets, about 3 reps in reserve (RIR 3). ${DOUBLE_PROGRESSION}`, mainSets: 3, mainReps: "8–10", accSets: 3, rir: "3", accRir: "3", minutes: 40, feel: "Curious and patient", note: "Pick starting weights you could lift 3 more times. Note them." },
  { week: 2, theme: "Build · double progression", progression: "Same lifts at RIR 2. Add a rep to each set, or a weight step where you topped the range.", mainSets: 3, mainReps: "8–10", accSets: 3, rir: "2", accRir: "2", minutes: 42, feel: "Steady and stronger", note: "Same exercises, a little more each time." },
  { week: 3, theme: "Volume · one more set", progression: "An extra set on the two main lifts, RIR 1–2.", mainSets: 4, mainReps: "8–10", accSets: 3, rir: "1–2", accRir: "1–2", minutes: 48, feel: "Full and pumped", note: "The hardest week of the first block. Eat and sleep for it." },
  { week: 4, theme: "Deload · half the sets", progression: "Two sets of everything, about 10% lighter, RIR 4.", mainSets: 2, mainReps: "8", accSets: 2, rir: "4", accRir: "4", deload: true, minutes: 30, feel: "Light and fresh", note: "Lighter on purpose. You come back stronger next week." },
  { week: 5, theme: "Strength-hypertrophy · heavier", progression: "Main lifts 4×6–8 at RIR 2. Accessories 3×8–12.", mainSets: 4, mainReps: "6–8", accSets: 3, rir: "2", accRir: "2", minutes: 48, feel: "Focused", note: "Heavier main lifts, same accessories." },
  { week: 6, theme: "Push · beat last week", progression: "Beat your week 5 numbers: +1–2 reps per set or a small weight step, RIR 1–2.", mainSets: 4, mainReps: "6–8", accSets: 3, rir: "1–2", accRir: "1", minutes: 48, feel: "Driven", note: "Small wins: one more rep counts." },
  { week: 7, theme: "Peak · heavy top sets", progression: "Main lifts: one top set of 5–6 at RIR 1–2, then 2 back-off sets of 8 about 10% lighter.", mainSets: 2, mainReps: "8", accSets: 3, rir: "1–2", accRir: "1–2", topSet: true, minutes: 45, feel: "Proud", note: "Your heaviest clean sets of the block. No max attempts needed." },
  { week: 8, theme: "Deload · consolidate", progression: "Two sets of everything at your week 5 weights, RIR 3–4.", mainSets: 2, mainReps: "8", accSets: 2, rir: "3–4", accRir: "3–4", deload: true, minutes: 30, feel: "Recovered", note: "Eight weeks of growing. Take stock and enjoy it." },
];

function blocksFor(slots: Slot[], w: WeekPlan): Superset[] {
  const out: Superset[] = [];
  for (const slot of slots) {
    // Main lifts (the first one or two of each session) carry the week's set changes.
    const sets = slot.role === "main" ? w.mainSets : w.accSets;
    if (slot.role === "main") {
      const move = slot.moves[0];
      if (w.topSet) {
        out.push(block(1, slot.rest + 30, [{ ...move, reps: "5–6", rir: w.rir }], "Top set"));
        out.push(block(2, slot.rest, [{ ...move, reps: "8", rir: "2", notes: "About 10% lighter than your top set" }], "Back-off sets"));
        continue;
      }
      out.push(block(sets, slot.rest, [{ ...move, reps: w.mainReps, rir: w.rir, ...(w.deload ? { notes: "About 10% lighter than last week" } : {}) }]));
      continue;
    }
    out.push(block(sets, slot.rest, slot.moves.map(m => ({ ...m, rir: w.accRir })), slot.label));
  }
  return out;
}

const WARMUP = (first: string) => ["5 min easy bike, row or brisk incline walk", "Leg swings or arm circles ×10", `Two ramp-up sets of ${first}: half weight ×8, then three-quarters ×4`];
const COOLDOWN = ["Easy walk · 2 min", "Stretch whatever feels tight · 2–3 min"];

function lift(day: number, name: string, focus: string, slots: Slot[], w: WeekPlan): Session {
  return {
    day,
    name,
    focus,
    durationMin: w.minutes,
    equipment: "Gym: barbell, rack, bench, dumbbells, cables, leg press",
    feel: w.feel,
    warmup: WARMUP(slots[0].moves[0].name.toLowerCase()),
    supersets: blocksFor(slots, w),
    cooldown: COOLDOWN,
    coachingNote: w.note,
  };
}

const conditioning = (day: number): Session => ({
  day,
  name: "Conditioning",
  focus: "Heart and lungs",
  durationMin: 20,
  equipment: "Bike, rower or treadmill",
  feel: "Breathless, then done",
  optional: true,
  structure: ["5 min easy", "8 rounds: 30 s hard / 90 s easy", "Easy to finish"],
  coachingNote: "Optional. Skip it if your legs are tired from Lower B: lifting comes first on this path.",
});

function week(w: WeekPlan): Week {
  return {
    week: w.week,
    theme: w.theme,
    progression: w.progression,
    sessions: [
      lift(1, "Lower A", "Squat, hinge, quads, calves", LOWER_A, w),
      lift(2, "Upper A", "Chest, back, shoulders", UPPER_A, w),
      walkDay(3),
      lift(4, "Lower B", "Glutes, hamstrings, single leg", LOWER_B, w),
      lift(5, "Upper B", "Shoulders, back, arms", UPPER_B, w),
      conditioning(6),
      restDay(7),
    ],
  };
}

export const theForge: TrainingPath = {
  id: "the-forge",
  name: "The Forge",
  subtitle: "Four gym days of intentional growth",
  focus: "muscle",
  description:
    "An eight-week muscle-building plan: four gym sessions of 30–50 minutes, upper and lower body twice each. Main lifts first, accessories paired in supersets, effort set by reps in reserve, and lighter weeks 4 and 8 so you keep growing.",
  whoItIsFor:
    "You have gym access and some lifting experience, and you want visible muscle and strength. Eat enough protein (about 1.6 g per kg of body weight a day) and sleep well to get the most from it.",
  equipmentLevel: "gym",
  daysPerWeek: 4,
  sessionMinutes: [30, 50],
  weeks: WEEKS.map(week),
};
