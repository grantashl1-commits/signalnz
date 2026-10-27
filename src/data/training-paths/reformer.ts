import type { Exercise, Session, Week, TrainingPath } from "./types";
import { block, ex, restDay, walkDay } from "./build";

// SIGNAL Reformer Strength – 8 weeks on a home reformer, three ~40 min sessions a week.
// Pilates training improves muscular endurance, flexibility and posture in adults
// (Kloubec 2010; Bernardo 2007), and the springs let load progress like weights.
// Progression follows the studio method: learn the set-up, add reps and holds, then heavier springs for legs and
// arms with slower returns (lighter springs make core work harder), then a lighter week.
// Exercise names match the reformer illustrations used in the partner series.

type Spring = "heavy" | "medium–heavy" | "medium" | "light–medium" | "light";
type Kind = "reps" | "side" | "hold" | "fixed";
interface Move { name: string; spring: Spring; kind: Kind; fixed?: string; cue: string; alt?: string; core?: boolean; standing?: boolean }
interface Series { label: string; moves: Move[] }

const m = (name: string, spring: Spring, kind: Kind, cue: string, extra: Partial<Omit<Move, "name" | "spring" | "kind" | "cue">> = {}): Move => ({ name, spring, kind, cue, ...extra });

const STANDING = " Step on and off only with the carriage home and still; grip socks; hold the frame or foot bar.";

const LEGS: Series[] = [
  { label: "Footwork", moves: [
    m("Reformer Footwork", "medium–heavy", "reps", "Heels on the bar, feet parallel. Press out without locking your knees, resist home for 2 s.", { alt: "Wall sit" }),
    m("Reformer Calf Raise", "medium–heavy", "reps", "Balls of the feet on the bar, carriage out. Lower the heels under the bar, rise high."),
    m("Reformer Single-Leg Press", "medium", "side", "One foot centred on the bar, other knee in tabletop. Pelvis level as you press.", { alt: "Single-leg glute bridge" }),
  ] },
  { label: "Bridge & straps", moves: [
    m("Reformer Bridge", "medium", "reps", "Feet on the bar, lift into a bridge, press the carriage out a little and draw it home with your hamstrings.", { alt: "Glute bridge" }),
    m("Reformer Frog Press", "light–medium", "reps", "Feet in straps, heels together, knees open. Press long, bend back to the diamond, pelvis still."),
    m("Reformer Feet-in-Straps Leg Press-Down", "light–medium", "reps", "Legs long at about 60°, press down to 45° and resist back up."),
  ] },
  { label: "Side-lying & standing", moves: [
    m("Reformer Side-Lying Leg Press", "medium", "side", "Bottom foot on the bar, hips stacked, waist lifted. Press out and resist home.", { alt: "Side-lying leg lift" }),
    m("Reformer Scooter", "light–medium", "side", "Standing beside the frame, hands on the bar, push the carriage back with one foot. Spine still." + STANDING, { alt: "Donkey kick", standing: true }),
    m("Reformer Standing Lunge", "heavy", "side", "Front foot on the platform, back foot against the shoulder rest. Slide back as you bend the front knee." + STANDING, { alt: "Reverse lunge", standing: true }),
  ] },
  { label: "Core", moves: [
    m("Reformer Hundred", "light", "fixed", "Hold the straps, head up, legs in tabletop or long. Pump the arms; breathe in for 5, out for 5.", { fixed: "100 counts", alt: "Head down, knees bent", core: true }),
    m("Reformer Knee Stretch", "light–medium", "reps", "Kneel on the carriage, hands on the bar, back rounded. Push the carriage back with your knees, draw in with your abs.", { core: true, alt: "Bear hold" }),
  ] },
];

const ARMS: Series[] = [
  { label: "Lying arms", moves: [
    m("Reformer Supine Arm Pull-Down", "light", "reps", "Arms up to the ceiling, pull the straps down beside your hips with soft ribs, let them rise slowly.", { alt: "Dumbbell pullover" }),
    m("Reformer Hundred", "light", "fixed", "Head up if your neck is happy; legs higher makes it easier.", { fixed: "100 counts", core: true }),
  ] },
  { label: "Seated arms", moves: [
    m("Reformer Seated Row", "light–medium", "reps", "Sit tall facing the straps. Draw your elbows back past your ribs, return slowly.", { alt: "Dumbbell bent-over row" }),
    m("Reformer Seated Chest Press", "light–medium", "reps", "Facing away from the pulleys, press forward and slightly together, open slowly.", { alt: "Push-up on the bench" }),
    m("Reformer Hug a Tree", "light", "reps", "Arms wide, elbows soft. Hug the straps together in front of your chest.", { alt: "Dumbbell chest fly" }),
  ] },
  { label: "Kneeling arms", moves: [
    m("Reformer Kneeling Lat Pull-Down", "light", "reps", "Kneel facing the pulleys, pull the straps down to your sides, ribs knitted.", { alt: "Band lat pulldown" }),
    m("Reformer Kneeling Side Arm Raise", "light", "side", "Kneel side-on holding the far strap, lift to shoulder height, shoulder down.", { alt: "Lateral raise" }),
    m("Reformer Biceps Curl", "light", "reps", "Elbows by your ribs, curl up and lower for 3 s.", { alt: "Dumbbell biceps curl" }),
    m("Reformer Overhead Triceps Extension", "light", "reps", "Facing away, elbows forward by your ears, extend up on a diagonal.", { alt: "Dumbbell overhead triceps extension" }),
  ] },
  { label: "Core", moves: [
    m("Pallof Press (reformer strap)", "light", "side", "Stand side-on holding one strap at your chest. Press it straight out and hold 2 s without twisting.", { core: true, standing: true, alt: "Side plank" }),
    m("Reformer Knee Stretch", "light–medium", "reps", "Round back, knees drive the carriage, abs draw it home.", { core: true }),
    m("Reformer Mermaid", "light", "side", "Sit side-on, hand on the bar. Slide out into a long side bend and breathe into the ribs.", { core: true, alt: "Seated side bend" }),
  ] },
];

const FLOW: Series[] = [
  { label: "Footwork", moves: [
    m("Reformer Footwork", "medium–heavy", "reps", "Parallel heels, then toes, then a small V. Smooth out, slower in."),
    m("Reformer Calf Raise", "medium–heavy", "reps", "Full range under the bar."),
  ] },
  { label: "Standing", moves: [
    m("Reformer Side Splits", "heavy", "reps", "Stand astride platform and carriage, soft knees. Open a small range, squeeze your inner thighs to close." + STANDING, { alt: "Sumo squat", standing: true }),
    m("Reformer Skater", "medium", "side", "Inside foot on the carriage, sit into the standing hip as you push out sideways." + STANDING, { alt: "Lateral lunge", standing: true }),
    m("Reformer Standing Lunge", "heavy", "side", "Slow and low, front heel heavy." + STANDING, { standing: true, alt: "Reverse lunge" }),
  ] },
  { label: "Long box", moves: [
    m("Reformer Long Box Pull", "light–medium", "reps", "Face down on the box, chest past the edge. Pull the straps back alongside your body. No box? Do the seated row.", { alt: "Reformer seated row" }),
    m("Reformer Long Box T-Pull", "light", "reps", "Face down on the box, open the straps out into a T and squeeze between your shoulder blades.", { alt: "Dumbbell reverse fly" }),
    m("Reformer Kneeling Chest Expansion", "light", "reps", "Kneel tall facing the pulleys, draw straight arms beside your hips, neck quiet.", { alt: "Reformer seated row" }),
  ] },
  { label: "Plank & core", moves: [
    m("Reformer Long Stretch", "light–medium", "hold", "Hands on the bar, feet against the shoulder rests, long plank. Push the carriage a little back and forth from your shoulders.", { core: true, alt: "Forearm plank" }),
    m("Reformer Elephant", "light–medium", "reps", "Hands on the bar, heels down against the shoulder rests, hips high. Push the carriage back with your legs, draw it in with your abs.", { core: true, alt: "Downward dog" }),
    m("Reformer Knee Stretch", "light–medium", "reps", "Round back, smooth and controlled.", { core: true }),
  ] },
];

interface Phase {
  theme: string;
  progression: string;
  reps: string;
  hold: string;
  rounds: number;
  heavier?: boolean;
  tempo?: string;
  minutes: number;
  feel: string;
  note: string;
}

const PHASES: Record<number, Phase> = {
  1: { theme: "Foundations · set-up and springs", progression: "2 rounds of each series, 8–10 smooth reps. Learn each set-up and note the springs that feel right on your machine.", reps: "8–10", hold: "20 s", rounds: 2, minutes: 36, feel: "Curious", note: "Brands differ, so write down your spring settings. Controlled returns matter more than load." },
  2: { theme: "Foundations · control", progression: "2 rounds, 10 reps. Resist the carriage home for 2 s every rep.", reps: "10", hold: "25 s", rounds: 2, tempo: "2‑0‑2", minutes: 38, feel: "Steady", note: "The return is where the strength is built." },
  3: { theme: "Build · more reps", progression: "2 rounds, 10–12 reps. Same springs.", reps: "10–12", hold: "30 s", rounds: 2, minutes: 40, feel: "Building", note: "Same springs, more reps. Notice how much steadier the carriage feels." },
  4: { theme: "Build · holds", progression: "2 rounds, 12 reps with a 3 s hold on the last rep of each set.", reps: "12 + 3 s hold", hold: "30 s", rounds: 2, minutes: 40, feel: "Strong", note: "Holds at the hardest point build control you can feel." },
  5: { theme: "Strength · heavier springs", progression: "Legs and arms one spring step heavier, 8–10 reps, 3 s returns. Core springs stay light.", reps: "8–10", hold: "35 s", rounds: 2, heavier: true, tempo: "2‑0‑3", minutes: 42, feel: "Powerful", note: "Heavier springs for strength; lighter springs keep core work honest." },
  6: { theme: "Strength · own the heavier springs", progression: "Same heavier springs, 10 reps, 3 s returns.", reps: "10", hold: "40 s", rounds: 2, heavier: true, tempo: "2‑0‑3", minutes: 42, feel: "Confident", note: "If the carriage bangs home, go back a spring." },
  7: { theme: "Challenge · three rounds", progression: "3 rounds of the two middle series, 2 of the rest, 10–12 reps on your heavier springs.", reps: "10–12", hold: "45 s", rounds: 2, heavier: true, minutes: 45, feel: "Proud", note: "Your strongest sessions of the block." },
  8: { theme: "Integrate · lighter week", progression: "1 round of each series at week 3 springs, longer stretch.", reps: "10", hold: "30 s", rounds: 1, minutes: 28, feel: "Light", note: "Lighter on purpose. Notice your posture and how stairs feel now." },
};

function springText(move: Move, phase: Phase): string {
  const heavier = phase.heavier && !move.core && !move.standing;
  return `Springs: ${move.spring}${heavier ? ", one step heavier" : ""}`;
}

function toExercise(move: Move, phase: Phase): Exercise {
  const reps = move.kind === "fixed" ? move.fixed ?? "" : move.kind === "hold" ? phase.hold : move.kind === "side" ? `${phase.reps} each side` : phase.reps;
  return ex(move.name, reps, {
    weight: springText(move, phase),
    cue: move.cue,
    ...(move.alt ? { alt: move.alt } : {}),
    ...(phase.tempo && move.kind !== "fixed" && move.kind !== "hold" ? { tempo: phase.tempo } : {}),
  });
}

const META = {
  legs: { name: "Legs & Glutes", focus: "Footwork, bridging, single leg, core", warmup: ["Breathing with pelvic tilts on the carriage ×8", "Bridge on the carriage, no movement ×6", "Knee sways ×6 each side"] },
  arms: { name: "Arms, Back & Core", focus: "Pull, push, shoulders, obliques", warmup: ["Seated breathing, arms floating up ×5", "Shoulder rolls ×10", "Cat–cow kneeling on the carriage ×6"] },
  flow: { name: "Full Body Flow", focus: "Standing legs, back, plank", warmup: ["Light footwork ×10 each position", "Cat–cow ×6", "Standing roll-down ×3"] },
} as const;

const SERIES = { legs: LEGS, arms: ARMS, flow: FLOW };

const COOLDOWN = ["Reformer Mermaid · 3 each side", "Hamstring stretch in the straps · 45 s each side", "Child's pose on the carriage · 1 min"];

function session(day: number, type: keyof typeof SERIES, n: number): Session {
  const phase = PHASES[n];
  const meta = META[type];
  const list = SERIES[type];
  return {
    day,
    name: meta.name,
    focus: meta.focus,
    durationMin: phase.minutes,
    equipment: type === "flow" ? "Reformer (long box if you have one), grip socks" : "Reformer, grip socks",
    feel: phase.feel,
    warmup: [...meta.warmup],
    supersets: list.map((s, i) => {
      // Week 7: an extra round of the two middle series.
      const rounds = n === 7 && (i === 1 || i === 2) ? 3 : phase.rounds;
      return block(rounds, 20, s.moves.map(mv => toExercise(mv, phase)), s.label);
    }),
    cooldown: COOLDOWN,
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
    "Three 30–45 minute reformer sessions a week: legs and glutes, arms and back, and a full-body flow. You learn each set-up first, then build reps and holds, then move to heavier springs with slow returns, finishing with a lighter week.",
  whoItIsFor:
    "You have a reformer at home (a long box helps but isn't essential) and want strength and tone without lifting heavy. Wear grip socks and keep the carriage home and still when stepping on or off.",
  equipmentLevel: "studio",
  daysPerWeek: 3,
  sessionMinutes: [28, 45],
  weeks: [1, 2, 3, 4, 5, 6, 7, 8].map(week),
};
