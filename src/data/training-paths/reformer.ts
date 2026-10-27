import type { Exercise, Session, Week, TrainingPath } from "./types";
import { block, ex, restDay, walkDay } from "./build";

// SIGNAL Reformer Strength – 8 weeks on a home reformer, three ~30–45 min classes a week.
// Pilates training improves muscular endurance, flexibility and posture in adults
// (Kloubec 2010; Bernardo 2007), and the springs let load progress like weights.
//
// Every class follows the same order a studio teacher uses (the BASI Block System and
// the classic Footwork → Arms in Straps → Feet in Straps → Standing flow): warm-up,
// footwork, abdominals, hip work, spinal articulation, full-body integration, arm work,
// leg work, side bend or rotation, back extension, then a stretch. Each block is short,
// so all planes of movement are covered in one session. Progression: learn the set-ups,
// add reps and holds, then heavier springs with slow returns, then a lighter week.
// Exercise names match the reformer illustrations (corrected-exercise-art and the
// reformer library folder), so new artwork shows up by name.

type Spring = "heavy" | "medium–heavy" | "medium" | "light–medium" | "light" | "none";
type Kind = "reps" | "side" | "hold" | "fixed";
interface Move { name: string; spring: Spring; kind: Kind; fixed?: string; cue: string; alt?: string; core?: boolean; standing?: boolean }
interface Series { label: string; moves: Move[]; strength?: boolean }

const m = (name: string, spring: Spring, kind: Kind, cue: string, extra: Partial<Omit<Move, "name" | "spring" | "kind" | "cue">> = {}): Move => ({ name, spring, kind, cue, ...extra });

const STANDING = " Step on and off only with the carriage home and still; grip socks; hold the frame or foot bar.";
const BOX = " Needs the long box; no box? Do the swap.";

// ── The moves, by block ──────────────────────────────────────────
const FOOTWORK = {
  arches: m("Footwork Arches", "medium–heavy", "reps", "Arches on the bar, feet together. Press out without locking your knees, resist home for 2 s, pelvis still."),
  vee: m("Footwork Balls of Feet", "medium–heavy", "reps", "Balls of the feet in a small Pilates V, heels together. Press out and back with even legs."),
  heels: m("Footwork Heels", "medium–heavy", "reps", "Heels on the bar, feet parallel and hip-width, toes lifted. Push through the heels."),
  calf: m("Reformer Calf Raise", "medium–heavy", "reps", "Carriage out, balls of the feet on the bar. Lower the heels under the bar, then rise high."),
  single: m("Reformer Single-Leg Press", "medium", "side", "One foot centred on the bar, other knee in tabletop. Keep the pelvis level.", { alt: "Single-leg glute bridge" }),
};

const ABS = {
  hundred: m("Hundreds", "light", "fixed", "Hold the straps, legs in tabletop, head and chest lifted. Pump the arms; breathe in for 5, out for 5.", { fixed: "100 counts", alt: "Head down, feet on the carriage", core: true }),
  toeDips: m("Toe Dips", "light", "side", "Legs in tabletop, arms long by your sides. Dip one toe towards the springs without the other leg moving.", { core: true, alt: "Smaller dips, knees bent" }),
  lowerLift: m("Arms in Straps: Lower & Lift", "light", "reps", "Lying on your back, legs in tabletop, arms long above the carriage. Press the straps down to your sides, then let them rise slowly.", { core: true }),
};

const HIPS = {
  frog: m("Feet in Straps: Frog", "light–medium", "reps", "Feet in the straps, heels together, knees open. Press long, bend back to the diamond, pelvis still."),
  circles: m("Feet in Straps: Leg Circles", "light–medium", "reps", "Legs long at 45°. Open, circle down and around, close at the top. Reverse halfway. Small enough for a quiet pelvis."),
  lowers: m("Feet in Straps: Leg Lowers", "light–medium", "reps", "Legs straight up at about 60°. Press down to 45° and resist back up."),
};

const SPINE = {
  bridge: m("Reformer Bridge", "medium", "reps", "Feet on the bar, peel up into a bridge, press the carriage out a little and draw it home with your hamstrings.", { alt: "Glute bridge on the floor" }),
};

const FULL_BODY = {
  kneeStretch: m("Knee Stretch", "light–medium", "reps", "Kneel on the carriage, hands on the bar, back rounded. Push the carriage back with your knees, draw in with your abs.", { core: true, alt: "Bear hold" }),
  elephant: m("Elephant", "light–medium", "reps", "Hands on the bar, heels down against the shoulder rests, hips high. Push the carriage back with your legs, pull it in with your abs.", { core: true, alt: "Downward dog" }),
  longStretch: m("Long Stretch", "light–medium", "hold", "Hands on the bar, feet against the shoulder rests, long plank. Move the carriage a little from your shoulders.", { core: true, alt: "Forearm plank" }),
};

const ARMS = {
  tricepPress: m("Arms in Straps: Triceps Press", "light", "reps", "On your back, legs in tabletop, elbows by your sides. Straighten the arms to press the straps down, bend slowly."),
  tPress: m("Arms in Straps: T Press", "light", "reps", "On your back, arms out in a T. Sweep the straps down to your hips, then open slowly. Shoulders stay down."),
  row: m("Reformer Seated Row", "light–medium", "reps", "Sit tall facing the straps. Draw your elbows back past your ribs, return slowly.", { alt: "Dumbbell bent-over row" }),
  chestPress: m("Reformer Seated Chest Press", "light–medium", "reps", "Facing away from the pulleys, press forward and slightly together, open slowly.", { alt: "Push-up on the bench" }),
  hug: m("Reformer Hug a Tree", "light", "reps", "Arms wide, elbows soft. Hug the straps together in front of your chest.", { alt: "Dumbbell chest fly" }),
  biceps: m("Reformer Biceps Curl", "light", "reps", "Elbows by your ribs, curl up and lower for 3 s.", { alt: "Dumbbell biceps curl" }),
  overhead: m("Reformer Overhead Triceps Extension", "light", "reps", "Facing away, elbows forward by your ears, extend up on a diagonal.", { alt: "Dumbbell overhead triceps extension" }),
  expansion: m("Reformer Kneeling Chest Expansion", "light", "reps", "Kneel tall facing the pulleys, draw straight arms beside your hips, neck quiet.", { alt: "Reformer seated row" }),
  sideRaise: m("Reformer Kneeling Side Arm Raise", "light", "side", "Kneel side-on holding the far strap, lift to shoulder height, shoulder down.", { alt: "Lateral raise" }),
};

const LEGS = {
  sideLying: m("Reformer Side-Lying Leg Press", "medium", "side", "Bottom foot on the bar, hips stacked, waist lifted. Press out and resist home.", { alt: "Side-lying leg lift" }),
  scooter: m("Reformer Scooter", "light–medium", "side", "Standing beside the frame, hands on the bar, push the carriage back with one foot. Spine still." + STANDING, { alt: "Donkey kick", standing: true }),
  skater: m("Reformer Skater", "medium", "side", "Inside foot on the carriage, sit into the standing hip as you push out sideways." + STANDING, { alt: "Lateral lunge", standing: true }),
  sideSplits: m("Reformer Side Splits", "heavy", "reps", "Stand astride platform and carriage, soft knees. Open a small range, squeeze your inner thighs to close." + STANDING, { alt: "Sumo squat", standing: true }),
  lunge: m("Reformer Standing Lunge", "heavy", "side", "Front foot on the platform, back foot against the shoulder rest. Slide back as you bend the front knee." + STANDING, { alt: "Reverse lunge", standing: true }),
};

const SIDE = {
  mermaid: m("Mermaid", "light", "side", "Sit side-on, hand on the bar. Slide out into a long side bend and breathe into the ribs.", { core: true, alt: "Seated side bend" }),
  sideRaise: ARMS.sideRaise,
};

const EXTENSION = {
  pull: m("Reformer Long Box Pull", "light–medium", "reps", "Face down on the box, chest past the edge. Pull the straps back alongside your body." + BOX, { alt: "Reformer seated row" }),
  tPull: m("Reformer Long Box T-Pull", "light", "reps", "Face down on the box, open the straps out into a T and squeeze between your shoulder blades." + BOX, { alt: "Dumbbell reverse fly" }),
  frogKicks: m("Reverse Frog Kicks", "light", "side", "Face down on the box, one foot in a loop, knee turned out. Kick the leg out to the side, return to the frog." + BOX, { alt: "Prone frog heel squeeze" }),
};

const STRETCH = {
  hip: m("Longbox Hip Stretch", "none", "hold", "One foot on the box, back leg long. Lunge forward with square hips.", { alt: "Low lunge on the floor" }),
  hamstring: m("Longbox Hamstring Stretch", "none", "hold", "Front heel on the box, leg straight. Hinge forward with a long spine.", { alt: "Seated hamstring stretch" }),
  shoulder: m("Longbox Shoulder Stretch", "none", "hold", "Hands on the box, feet wide. Step back and let the chest sink between your arms.", { alt: "Child's pose with long arms" }),
  butterfly: m("Butterfly Stretch", "none", "hold", "Feet in the straps, soles together, knees open. Let gravity open the hips.", { alt: "Butterfly on the floor" }),
};

// ── Three classes, each through every block ──────────────────────
type ClassType = "legs" | "arms" | "flow";

const CLASSES: Record<ClassType, { name: string; focus: string; equipment: string; series: Series[] }> = {
  legs: {
    name: "Legs & Glutes",
    focus: "Footwork, feet in straps, bridging, single leg",
    equipment: "Reformer (long box for the stretch), grip socks",
    series: [
      { label: "Footwork", moves: [FOOTWORK.arches, FOOTWORK.vee, FOOTWORK.heels, FOOTWORK.calf] },
      { label: "Abdominals", moves: [ABS.hundred] },
      { label: "Feet in straps", moves: [HIPS.frog, HIPS.circles] },
      { label: "Bridging", moves: [SPINE.bridge] },
      { label: "Leg work", moves: [FOOTWORK.single, LEGS.sideLying, LEGS.scooter], strength: true },
      { label: "Side bend", moves: [SIDE.mermaid] },
      { label: "Stretch", moves: [STRETCH.hip, STRETCH.hamstring] },
    ],
  },
  arms: {
    name: "Arms, Back & Core",
    focus: "Arms in straps, seated and kneeling arms, back extension",
    equipment: "Reformer (long box if you have one), grip socks",
    series: [
      { label: "Footwork", moves: [FOOTWORK.heels, FOOTWORK.vee, FOOTWORK.calf] },
      { label: "Arms in straps", moves: [ABS.lowerLift, ARMS.tricepPress, ARMS.tPress, ABS.hundred] },
      { label: "Full body", moves: [FULL_BODY.kneeStretch] },
      { label: "Seated arms", moves: [ARMS.row, ARMS.chestPress, ARMS.hug, ARMS.biceps, ARMS.overhead], strength: true },
      { label: "Back extension", moves: [EXTENSION.pull, EXTENSION.tPull] },
      { label: "Side bend", moves: [SIDE.sideRaise] },
      { label: "Stretch", moves: [STRETCH.shoulder] },
    ],
  },
  flow: {
    name: "Full Body Flow",
    focus: "Footwork, plank work, standing legs, back extension",
    equipment: "Reformer (long box if you have one), grip socks",
    series: [
      { label: "Footwork", moves: [FOOTWORK.arches, FOOTWORK.heels, FOOTWORK.calf] },
      { label: "Abdominals", moves: [ABS.toeDips] },
      { label: "Feet in straps", moves: [HIPS.lowers, HIPS.frog] },
      { label: "Full body", moves: [FULL_BODY.elephant, FULL_BODY.longStretch] },
      { label: "Kneeling arms", moves: [ARMS.expansion, ARMS.sideRaise] },
      { label: "Standing legs", moves: [LEGS.skater, LEGS.sideSplits, LEGS.lunge], strength: true },
      { label: "Back extension", moves: [EXTENSION.frogKicks] },
      { label: "Stretch", moves: [STRETCH.butterfly, STRETCH.shoulder] },
    ],
  },
};

interface Phase {
  theme: string;
  progression: string;
  reps: string;
  hold: string;
  /** Rounds of the main strength block; the other blocks are done once. */
  rounds: number;
  heavier?: boolean;
  tempo?: string;
  minutes: number;
  feel: string;
  note: string;
}

const PHASES: Record<number, Phase> = {
  1: { theme: "Foundations · set-up and springs", progression: "Each block once, 8–10 smooth reps. Learn each set-up and note the springs that feel right on your machine.", reps: "8–10", hold: "20 s", rounds: 1, minutes: 30, feel: "Curious", note: "Brands differ, so write down your spring settings. Controlled returns matter more than load." },
  2: { theme: "Foundations · control", progression: "10 reps, resisting the carriage home for 2 s. Two rounds of the main strength block.", reps: "10", hold: "25 s", rounds: 2, tempo: "2‑0‑2", minutes: 34, feel: "Steady", note: "The return is where the strength is built." },
  3: { theme: "Build · more reps", progression: "10–12 reps, same springs, two rounds of the strength block.", reps: "10–12", hold: "30 s", rounds: 2, minutes: 36, feel: "Building", note: "Same springs, more reps. Notice how much steadier the carriage feels." },
  4: { theme: "Build · holds", progression: "12 reps with a 3 s hold on the last rep of each set.", reps: "12 + 3 s hold", hold: "30 s", rounds: 2, minutes: 38, feel: "Strong", note: "Holds at the hardest point build control you can feel." },
  5: { theme: "Strength · heavier springs", progression: "Legs and arms one spring step heavier, 8–10 reps, 3 s returns. Core springs stay light.", reps: "8–10", hold: "35 s", rounds: 2, heavier: true, tempo: "2‑0‑3", minutes: 38, feel: "Powerful", note: "Heavier springs for strength; lighter springs keep core work honest." },
  6: { theme: "Strength · own the heavier springs", progression: "Same heavier springs, 10 reps, 3 s returns.", reps: "10", hold: "40 s", rounds: 2, heavier: true, tempo: "2‑0‑3", minutes: 40, feel: "Confident", note: "If the carriage bangs home, go back a spring." },
  7: { theme: "Challenge · three rounds", progression: "Three rounds of the main strength block on your heavier springs, 10–12 reps.", reps: "10–12", hold: "45 s", rounds: 3, heavier: true, minutes: 44, feel: "Proud", note: "Your strongest classes of the block." },
  8: { theme: "Integrate · lighter week", progression: "Every block once at week 3 springs, longer stretch.", reps: "10", hold: "45 s", rounds: 1, minutes: 30, feel: "Light", note: "Lighter on purpose. Notice your posture and how stairs feel now." },
};

const WARMUP = ["Breathing with knees bent, hands on your ribs ×5", "Pelvic curl on the carriage, no movement ×6", "Supine spine twist, knees together ×4 each side"];

function springText(move: Move, phase: Phase): string | undefined {
  if (move.spring === "none") return undefined;
  const heavier = phase.heavier && !move.core && !move.standing;
  return `Springs: ${move.spring}${heavier ? ", one step heavier" : ""}`;
}

function toExercise(move: Move, phase: Phase, stretch: boolean): Exercise {
  const hold = stretch ? `${phase.hold} each side` : phase.hold;
  const reps = move.kind === "fixed" ? move.fixed ?? "" : move.kind === "hold" ? hold : move.kind === "side" ? `${phase.reps} each side` : phase.reps;
  const weight = springText(move, phase);
  return ex(move.name, reps, {
    ...(weight ? { weight } : {}),
    cue: move.cue,
    ...(move.alt ? { alt: move.alt } : {}),
    ...(phase.tempo && move.kind !== "fixed" && move.kind !== "hold" ? { tempo: phase.tempo } : {}),
  });
}

function session(day: number, type: ClassType, n: number): Session {
  const phase = PHASES[n];
  const c = CLASSES[type];
  return {
    day,
    name: c.name,
    focus: c.focus,
    durationMin: phase.minutes,
    equipment: c.equipment,
    feel: phase.feel,
    warmup: WARMUP,
    supersets: c.series.map(s => block(
      s.strength ? phase.rounds : 1,
      s.label === "Stretch" ? 10 : 20,
      s.moves.map(mv => toExercise(mv, phase, s.label === "Stretch" && mv.kind === "hold" && mv.name.startsWith("Longbox") && !mv.name.includes("Shoulder"))),
      s.label,
    )),
    cooldown: ["Child's pose on the carriage · 1 min"],
    coachingNote: phase.note,
  };
}

function week(n: number): Week {
  const phase = PHASES[n];
  return {
    week: n,
    theme: phase.theme,
    progression: phase.progression,
    sessions: [
      session(1, "legs", n),
      walkDay(2),
      session(3, "arms", n),
      restDay(4),
      session(5, "flow", n),
      walkDay(6, 30),
      restDay(7),
    ],
  };
}

export const reformerPath: TrainingPath = {
  id: "reformer-strength",
  name: "Reformer Strength",
  subtitle: "Your home reformer, three times a week",
  focus: "reformer",
  description:
    "Three 30–45 minute reformer classes a week, each in the order a studio teacher uses: footwork, abs, feet in straps, bridging, full-body, arms, legs, side bend, back extension and a stretch. You learn each set-up first, then build reps and holds, then move to heavier springs with slow returns, finishing with a lighter week.",
  whoItIsFor:
    "You have a reformer at home (a long box helps but isn't essential) and want strength and tone without lifting heavy. Wear grip socks and keep the carriage home and still when stepping on or off.",
  equipmentLevel: "studio",
  daysPerWeek: 3,
  sessionMinutes: [30, 45],
  weeks: [1, 2, 3, 4, 5, 6, 7, 8].map(week),
};
