import type { Exercise, Session, Superset, Week, TrainingPath } from "./types";
import { block, ex, restDay, walkDay, DOUBLE_PROGRESSION } from "./build";

// ═══════════════════════════════════════════════════════════
// THE ANCHOR – 8-WEEK GLUTE POWER · 3 days, ~40 min
//
// One heavy glute lift first each day (hip thrust ≈ squat for glute growth, Plotkin 2023;
// deep squats, Kubo 2019), single-leg work paired with an upper-body move so the plan stays
// balanced, hamstring curls (Maeo 2021) and abduction for the side glutes. Loads are set by
// reps in reserve, not kg caps, so the hard sets are actually hard.
// ═══════════════════════════════════════════════════════════

const HEAVY = "Heavy enough to leave the reps in reserve shown. Most women hip thrust far more than they squat: a barbell, two heavy dumbbells or a heavy kettlebell";

interface DayPlan {
  name: string;
  focus: string;
  main: Exercise;
  mainRest: number;
  pair: Exercise[];
  finisher: Exercise[];
  warmup: string[];
}

const DRIVE: DayPlan = {
  name: "Drive",
  focus: "Hip thrust, deep squat, push",
  main: ex("Barbell Hip Thrust", "", { weight: HEAVY, cue: "Upper back on the bench, chin tucked, ribs down. Drive through your heels and pause 1 s at the top.", alt: "Dumbbell hip thrust or banded glute bridge" }),
  mainRest: 120,
  pair: [
    ex("Goblet Squat", "8–12", { weight: "One heavy dumbbell", cue: "Sit deep between your hips, chest tall." }),
    ex("Push-Up", "6–12", { weight: "Bodyweight, hands on a bench if needed", cue: "One long line, chest to fist height." }),
  ],
  finisher: [
    ex("Seated Banded Hip Abduction", "15–20", { weight: "Mini band above the knees", cue: "Sit tall or lean forward slightly and press your knees out." }),
    ex("Dead Bug", "6–8 each side", { cue: "Low back heavy, exhale as you reach long." }),
  ],
  warmup: ["Cat–cow ×8", "Glute bridge ×12", "Banded walk ×10 each way", "One light warm-up set of hip thrusts"],
};

const HINGE: DayPlan = {
  name: "Hinge",
  focus: "Romanian deadlift, split squat, row",
  main: ex("Dumbbell Romanian Deadlift", "", { weight: "Two heavy dumbbells or a barbell", cue: "Hips back until the hamstrings stretch, dumbbells close to your legs, then squeeze up.", alt: "Single-leg RDL holding a wall" }),
  mainRest: 120,
  pair: [
    ex("Dumbbell Bulgarian Split Squat", "8–12 each side", { weight: "Two dumbbells", cue: "Back foot on the bench, drop straight down, slight forward lean.", alt: "Reverse lunge" }),
    ex("Single-Arm Dumbbell Row", "8–12 each side", { weight: "One dumbbell", cue: "Row your elbow to your hip and pause." }),
  ],
  finisher: [
    ex("Swiss-Ball Hamstring Curl", "8–12", { weight: "Yoga ball", cue: "Hips up, curl the ball in with your heels, roll out slowly.", alt: "Slider hamstring curl" }),
    ex("Side Plank", "20–30 s each side", { cue: "Hips lifted, long line.", alt: "Bent-knee side plank" }),
  ],
  warmup: ["Hip circles ×5 each way", "Good morning with no weight ×10", "Glute bridge ×10", "One light warm-up set of RDLs"],
};

const SHAPE: DayPlan = {
  name: "Shape",
  focus: "Single-leg thrust, step-up, pull",
  main: ex("B-Stance Hip Thrust", "", { weight: "One heavy dumbbell on your hips", cue: "Working foot flat, other heel lightly down as a kickstand. Drive through the working heel.", alt: "Single-leg glute bridge" }),
  mainRest: 90,
  pair: [
    ex("Dumbbell Step-Up", "8–10 each side", { weight: "Two dumbbells, knee-height step", cue: "Whole foot on the step, drive through that heel, no push from the back foot." }),
    ex("Band Lat Pulldown", "10–12", { weight: "Long band anchored high", cue: "Elbows down to your ribs, chest proud.", alt: "Dumbbell pullover" }),
  ],
  finisher: [
    ex("Frog Pump", "15–20", { cue: "Soles together, knees out, short fast squeezes at the top." }),
    ex("Half-Kneeling Single-Arm Press", "10–12 each side", { weight: "One dumbbell", cue: "Squeeze the down-side glute and press straight up." }),
  ],
  warmup: ["Banded clamshell ×12 each side", "Bodyweight step-up ×5 each side", "Glute bridge ×10", "One light warm-up set of hip thrusts"],
};

interface WeekPlan {
  week: number;
  theme: string;
  progression: string;
  mainSets: number;
  mainReps: string;
  rir: string;
  otherSets: number;
  topSet?: boolean;
  minutes: number;
  feel: string;
  note: string;
}

const WEEKS: WeekPlan[] = [
  { week: 1, theme: "Activation · learn the patterns", progression: `Main lift 3×12 at about 3–4 reps in reserve (RIR 3–4). Everything else 2 sets. ${DOUBLE_PROGRESSION}`, mainSets: 3, mainReps: "12", rir: "3–4", otherSets: 2, minutes: 32, feel: "Curious", note: "Feel the glutes do the work. Find a hip-thrust weight that is steady for 12." },
  { week: 2, theme: "Groove · add a set", progression: "Main lift 3×10–12 at RIR 3. Everything else 3 sets.", mainSets: 3, mainReps: "10–12", rir: "3", otherSets: 3, minutes: 38, feel: "Steady", note: "Same weights, one more set on the pairs." },
  { week: 3, theme: "Build · double progression", progression: `Main lift 3×8–12 at RIR 2–3. ${DOUBLE_PROGRESSION}`, mainSets: 3, mainReps: "8–12", rir: "2–3", otherSets: 3, minutes: 38, feel: "Building", note: "When every set reaches 12, the next weight step is yours." },
  { week: 4, theme: "Build · heavier", progression: "Main lift 3×8–12 at RIR 2. Push the weight, not the range.", mainSets: 3, mainReps: "8–12", rir: "2", otherSets: 3, minutes: 38, feel: "Strong", note: "Most of your progress comes from adding weight to the first lift." },
  { week: 5, theme: "Strength · four heavy sets", progression: "Main lift 4×8–10 at RIR 2.", mainSets: 4, mainReps: "8–10", rir: "2", otherSets: 3, minutes: 42, feel: "Powerful", note: "Four sets now. Rest the full two minutes." },
  { week: 6, theme: "Strength · closer to the edge", progression: "Main lift 4×8–10 at RIR 1–2. Beat week 5 by a rep or a weight step.", mainSets: 4, mainReps: "8–10", rir: "1–2", otherSets: 3, minutes: 42, feel: "Driven", note: "One more rep than last week is a win." },
  { week: 7, theme: "Peak · top set + back-offs", progression: "One top set of 5–6 at RIR 1–2, then 2 back-off sets of 8–10 about 10–15% lighter.", mainSets: 2, mainReps: "8–10", rir: "1–2", otherSets: 3, topSet: true, minutes: 40, feel: "Proud", note: "Your heaviest clean set of the block. No max attempts." },
  { week: 8, theme: "Integrate · lighter week", progression: "Two sets of everything at your week 5 weights, RIR 3–4.", mainSets: 2, mainReps: "10", rir: "3–4", otherSets: 2, minutes: 30, feel: "Settled", note: "Let the work land. Notice how stairs and lifting the kids feel now." },
];

const COOLDOWN = ["Pigeon or figure-four stretch · 45 s each side", "Couch stretch · 30 s each side", "Child's pose · 1 min"];

function session(day: number, plan: DayPlan, w: WeekPlan): Session {
  const mainBlocks: Superset[] = w.topSet
    ? [
      block(1, plan.mainRest + 30, [{ ...plan.main, reps: plan.main.name.startsWith("B-Stance") ? "6–8 each side" : "5–6", rir: w.rir }], "Top set"),
      block(2, plan.mainRest, [{ ...plan.main, reps: plan.main.name.startsWith("B-Stance") ? "10 each side" : w.mainReps, rir: "2", notes: "About 10–15% lighter than your top set" }], "Back-off sets"),
    ]
    : [block(w.mainSets, plan.mainRest, [{ ...plan.main, reps: plan.main.name.startsWith("B-Stance") ? `${w.mainReps} each side` : w.mainReps, rir: w.rir }], "Main lift")];
  const otherRir = w.week === 8 ? "3–4" : w.week >= 5 ? "1–2" : "2–3";
  return {
    day,
    name: plan.name,
    focus: plan.focus,
    durationMin: w.minutes,
    equipment: "Barbell or heavy dumbbells, bench, mini band, yoga ball, long band",
    feel: w.feel,
    warmup: plan.warmup,
    supersets: [
      ...mainBlocks,
      block(w.otherSets, 75, plan.pair.map(e => ({ ...e, rir: otherRir }))),
      block(w.otherSets, 45, plan.finisher.map(e => ({ ...e, rir: otherRir })), "Finisher"),
    ],
    cooldown: COOLDOWN,
    coachingNote: w.note,
  };
}

function week(w: WeekPlan): Week {
  return {
    week: w.week,
    theme: w.theme,
    progression: w.progression,
    sessions: [
      session(1, DRIVE, w),
      walkDay(2),
      session(3, HINGE, w),
      restDay(4),
      session(5, SHAPE, w),
      walkDay(6, 30),
      restDay(7),
    ],
  };
}

export const glutePower: TrainingPath = {
  id: "glute-power",
  name: "The Anchor",
  subtitle: "Glute-focused, with enough upper body to stay balanced",
  focus: "glute-power",
  description:
    "Three 30–40 minute sessions a week built around one heavy glute lift (hip thrust, Romanian deadlift or single-leg thrust), then single-leg work paired with an upper-body move and a short glute finisher. Loads go up by feel, so the hard sets stay hard.",
  whoItIsFor:
    "You want stronger glutes and hips, and a back that copes with lifting kids and shopping. You need a barbell or heavy dumbbells, a bench, a mini band and a yoga ball.",
  equipmentLevel: "home",
  daysPerWeek: 3,
  sessionMinutes: [30, 42],
  weeks: WEEKS.map(week),
};
