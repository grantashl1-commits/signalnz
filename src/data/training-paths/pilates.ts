import type { Exercise, Session, Week, TrainingPath } from "./types";
import { block, ex, restDay, walkDay } from "./build";

// SIGNAL Mat Sculpt – 8 weeks of 30-minute mat pilates, four classes a week.
// Modern sculpt style: slow, controlled, high-rep series with small pulses and holds,
// low impact, light kit (ankle weights, a mini ball, 1–2 kg dumbbells) added from week 3.
// Every class has the same shape: 3 min warm-up · four ~5 min series · 3 min stretch.
// Progression comes from reps → pulses → holds → light load, the way a studio programme
// builds, and mat pilates improves core endurance, posture and flexibility in women
// (Kloubec 2010; Bernardo 2007 review). Lower-impact, pelvic-floor friendly by default.

type Kind = "reps" | "side" | "hold" | "fixed";
interface Move { name: string; kind: Kind; fixed?: string; cue?: string; alt?: string }
interface Series { label: string; moves: Move[]; kit?: "legs" | "arms" | "ball" }

const m = (name: string, kind: Kind, extra: Omit<Move, "name" | "kind"> = {}): Move => ({ name, kind, ...extra });

interface Phase {
  reps: string;
  hold: string;
  /** Ankle weights / ball / dumbbells join from week 3. */
  kit: boolean;
  note: string;
}

const PHASES: Record<number, Phase & { theme: string; progression: string; feel: string }> = {
  1: { theme: "Foundations · breath and neutral spine", progression: "Bodyweight only. 12–15 slow reps, 20 s holds. Learn to breathe out on the effort and keep your low back quiet.", reps: "12–15", hold: "20 s", kit: false, feel: "Quietly awake", note: "Slow is the point. If you feel it in your low back, make the movement smaller." },
  2: { theme: "Foundations · control", progression: "Bodyweight. 15 reps + 5 small pulses at the end of each set, 20–30 s holds.", reps: "15 + 5 pulses", hold: "25 s", kit: false, feel: "Steady", note: "Pulses are tiny: a couple of centimetres at the hardest point." },
  3: { theme: "Build · add light kit", progression: "Add ankle weights (0.5–1 kg) on leg series and a mini ball for bridges if you have them. 15 reps + 10 pulses, 30 s holds.", reps: "15 + 10 pulses", hold: "30 s", kit: true, feel: "Warm and working", note: "No ankle weights? Slow the lowering to 3 s instead." },
  4: { theme: "Build · longer sets", progression: "15 reps + 10 pulses, 30–35 s holds. Light kit if you have it.", reps: "15 + 10 pulses", hold: "35 s", kit: true, feel: "Building heat", note: "Same moves, a little longer under tension." },
  5: { theme: "Burn · pulses and holds", progression: "15 reps + 15 pulses + a 10 s hold to finish each set. 40 s holds. 1–2 kg dumbbells for arms.", reps: "15 + 15 pulses + 10 s hold", hold: "40 s", kit: true, feel: "Shaky in a good way", note: "Shaking means the muscle is working. Breathe through it." },
  6: { theme: "Burn · slow tempo", progression: "Lower for 3 s every rep. 15 reps + 15 pulses + 10 s hold, 40 s holds.", reps: "15 slow + 15 pulses + 10 s hold", hold: "40 s", kit: true, feel: "Deep burn", note: "Three seconds down makes light weights feel heavy." },
  7: { theme: "Peak · longest sets", progression: "16 reps + 16 pulses, 45 s holds. Your strongest classes of the block.", reps: "16 + 16 pulses", hold: "45 s", kit: true, feel: "Proud", note: "Take a breath between moves if you need it; keep the form." },
  8: { theme: "Integrate · lighter week", progression: "12 reps + 10 pulses, 30 s holds, extra stretch time.", reps: "12 + 10 pulses", hold: "30 s", kit: true, feel: "Long and light", note: "Lighter on purpose. Notice how your posture feels after eight weeks." },
};

const KIT_WEIGHT = {
  legs: "Ankle weights 0.5–1 kg (optional)",
  arms: "1–2 kg dumbbells or water bottles",
  ball: "Mini pilates ball or a cushion between the knees",
} as const;

// Two versions of each class alternate week to week so the moves stay fresh.
const CLASSES: Record<"full" | "lower" | "core" | "glute", [Series[], Series[]]> = {
  full: [
    [
      { label: "Glutes on all fours", kit: "legs", moves: [m("Donkey Kick", "side", { cue: "Knee bent at 90°, press your heel to the ceiling without arching." }), m("Fire Hydrant", "side", { cue: "Lift the bent knee out to the side, hips stay square." }), m("Bird Dog", "side", { cue: "Reach opposite arm and leg long, pause 2 s." })] },
      { label: "Core", moves: [m("The Hundred", "fixed", { fixed: "100 counts", cue: "Knees in tabletop, head up, pump the arms. Breathe in for 5, out for 5.", alt: "Head down" }), m("Single Leg Stretch", "reps", { cue: "Pull one knee in, the other reaches long. Low back stays down." }), m("Criss-Cross", "reps", { cue: "Rotate from the ribs, elbow wide, slow." })] },
      { label: "Arms", kit: "arms", moves: [m("Bicep Curl", "reps", { cue: "Elbows glued to your sides." }), m("Tricep Kickback", "reps", { cue: "Hinge forward, upper arms still, straighten fully." }), m("Lateral Raise", "reps", { cue: "Small range to shoulder height, no shrugging." })] },
      { label: "Standing", kit: "legs", moves: [m("Plié Squat", "reps", { cue: "Toes turned out, knees track over toes, tailbone down." }), m("Curtsy Lunge", "side", { cue: "Step back and across, front knee over the ankle." }), m("Standing Kickback", "side", { cue: "Hold a chair, squeeze the glute as the leg goes back." })] },
    ],
    [
      { label: "Standing", kit: "legs", moves: [m("Squat to Calf Raise", "reps", { cue: "Sit back, stand tall, lift the heels." }), m("Curtsy Lunge", "side", { cue: "Pulse at the bottom in the later weeks." }), m("Standing Side Leg Lift", "side", { cue: "Hold a chair, lift the leg out, hips level." })] },
      { label: "Core", moves: [m("Dead Bug", "side", { cue: "Low back heavy, exhale as you reach." }), m("Rolling Like a Ball", "reps", { cue: "Tuck tight, roll to the shoulder blades and balance back up.", alt: "Seated balance hold" }), m("Teaser Prep", "reps", { cue: "Feet down, roll up to a V and back with control.", alt: "Half roll-back" })] },
      { label: "Arms", kit: "arms", moves: [m("Overhead Press", "reps", { cue: "Ribs down, press up and slightly in." }), m("Bent-Over Row", "reps", { cue: "Hinge forward, row elbows back past your ribs." }), m("Arm Circles", "hold", { cue: "Arms at shoulder height, tiny circles forwards then back." })] },
      { label: "Glutes on all fours", kit: "legs", moves: [m("Kneeling Kickback", "side", { cue: "Straight leg back and up, toe pointed down." }), m("Fire Hydrant", "side", { cue: "Small range, steady pelvis." }), m("Bird Dog", "side", { cue: "Elbow to knee under you, then reach long." })] },
    ],
  ],
  lower: [
    [
      { label: "Bridge series", kit: "ball", moves: [m("Glute Bridge", "reps", { cue: "Ribs down, squeeze the ball, peel up one vertebra at a time." }), m("Single-Leg Glute Bridge", "side", { cue: "Hips stay level." }), m("Bridge Pulse", "hold", { cue: "Hold the top and pulse a centimetre." })] },
      { label: "Side-lying series", kit: "legs", moves: [m("Side-Lying Leg Lift", "side", { cue: "Top leg long, lift from the hip, toes forward." }), m("Clamshell", "side", { cue: "Feet together, open the top knee, pelvis still." }), m("Inner Thigh Lift", "side", { cue: "Top leg in front, lift the bottom leg a few centimetres." })] },
      { label: "All fours", kit: "legs", moves: [m("Donkey Kick", "side", { cue: "Heel to the ceiling, low back still." }), m("Fire Hydrant", "side", { cue: "Knee out to the side, hips square." }), m("Kneeling Kickback", "side", { cue: "Straight leg back, squeeze at the top." })] },
      { label: "Standing burn", moves: [m("Sumo Squat Pulse", "reps", { cue: "Wide stance, sit low, pulse at the bottom." }), m("Reverse Lunge", "side", { cue: "Step back, drop the knee straight down." }), m("Wall Sit", "hold", { cue: "Back flat on the wall, knees over ankles.", alt: "Higher wall sit" })] },
    ],
    [
      { label: "Bridge series", kit: "ball", moves: [m("Glute Bridge", "reps", { cue: "Squeeze the ball, slow on the way down." }), m("Bridge March", "side", { cue: "Lift one foot at a time, hips do not drop." }), m("Bridge Pulse", "hold", { cue: "Small, steady pulses at the top." })] },
      { label: "Side-lying series", kit: "legs", moves: [m("Side Kick Front and Back", "side", { cue: "Swing the top leg front and back, torso still." }), m("Side-Lying Leg Lift", "side", { cue: "Lift and lower for 2 s each way." }), m("Clamshell", "side", { cue: "Pause at the top." })] },
      { label: "All fours", kit: "legs", moves: [m("Kneeling Kickback", "side", { cue: "Straight leg, toe down." }), m("Donkey Kick", "side", { cue: "Bent knee, press up." }), m("Bird Dog", "side", { cue: "Reach long, pause." })] },
      { label: "Standing burn", moves: [m("Plié Squat", "reps", { cue: "Lift the heels for an extra burn in later weeks." }), m("Curtsy Lunge", "side", { cue: "Step back and across." }), m("Squat Hold", "hold", { cue: "Sit low, chest tall, breathe." })] },
    ],
  ],
  core: [
    [
      { label: "Classic core", moves: [m("The Hundred", "fixed", { fixed: "100 counts", cue: "Breathe in for 5, out for 5. Head down if your neck tires." }), m("Roll-Up", "reps", { cue: "Peel up one vertebra at a time, reach, roll down slowly.", alt: "Half roll-back" }), m("Single Leg Circles", "side", { cue: "Small circles, hips still." })] },
      { label: "Obliques", moves: [m("Criss-Cross", "reps", { cue: "Rotate from the ribs, slow." }), m("Side Plank", "side", { cue: "Knee down to start. Lift the hips and dip a few centimetres.", alt: "Bent-knee side plank" }), m("Toe Taps", "side", { cue: "Knees in tabletop, tap one toe down, low back stays heavy." })] },
      { label: "Arms on the mat", kit: "arms", moves: [m("Push-Up", "reps", { cue: "On your knees is perfect. Elbows back towards your ribs." }), m("Overhead Press", "reps", { cue: "Kneeling tall, ribs down." }), m("Bicep Curl", "reps", { cue: "Pulse at the halfway point in later weeks." })] },
      { label: "Plank", moves: [m("Forearm Plank", "hold", { cue: "Glutes squeezed, ribs down, long line.", alt: "Knees down" }), m("Plank Shoulder Tap", "reps", { cue: "Feet wide, hips still." }), m("Swimming", "hold", { cue: "Face down, flutter opposite arm and leg, long neck." })] },
    ],
    [
      { label: "Classic core", moves: [m("The Hundred", "fixed", { fixed: "100 counts", cue: "Legs higher for less load on your back." }), m("Single Leg Stretch", "reps", { cue: "Switch legs smoothly." }), m("Scissors", "side", { cue: "Straight legs, pull one towards you, the other hovers." })] },
      { label: "Obliques", moves: [m("Side Plank", "side", { cue: "Elbow under shoulder, lift and lower the hips.", alt: "Bent-knee side plank" }), m("Mermaid Side Bend", "side", { cue: "Seated, reach up and over, long through the waist." }), m("Criss-Cross", "reps", { cue: "Elbow wide, rotate slowly." })] },
      { label: "Arms on the mat", kit: "arms", moves: [m("Tricep Push-Up", "reps", { cue: "On your knees, elbows brush your ribs." }), m("Tricep Kickback", "reps", { cue: "Upper arms still." }), m("Lateral Raise", "reps", { cue: "To shoulder height, slow." })] },
      { label: "Plank", moves: [m("Bear Hold", "hold", { cue: "Knees hover a few centimetres, flat back." }), m("Plank Leg Lift", "side", { cue: "Lift one leg a few centimetres, hips level.", alt: "Forearm plank" }), m("Swimming", "hold", { cue: "Long neck, small fast flutters." })] },
    ],
  ],
  glute: [
    [
      { label: "Bridge with ball", kit: "ball", moves: [m("Glute Bridge", "reps", { cue: "Squeeze the ball the whole time." }), m("Bridge March", "side", { cue: "Hips level as each foot lifts." }), m("Bridge Pulse", "hold", { cue: "Top of the bridge, tiny pulses." })] },
      { label: "Side-lying", kit: "legs", moves: [m("Side-Lying Leg Lift", "side", { cue: "Toes forward, lift from the hip." }), m("Clamshell", "side", { cue: "Open slowly, close slowly." }), m("Side Kick Front and Back", "side", { cue: "Torso still." })] },
      { label: "Abs", moves: [m("Double Leg Stretch", "reps", { cue: "Reach arms and legs long, circle back in.", alt: "Single leg stretch" }), m("Toe Taps", "side", { cue: "Low back stays heavy." }), m("Reverse Crunch", "reps", { cue: "Curl the pelvis up gently, no swinging." })] },
      { label: "Face down", kit: "legs", moves: [m("Swimming", "hold", { cue: "Long neck, opposite arm and leg." }), m("Frog Heel Squeeze", "reps", { cue: "Face down, knees wide, heels together, squeeze and lift." }), m("Prone Leg Lift", "side", { cue: "Straight leg lifts a few centimetres, hips down." })] },
    ],
    [
      { label: "Bridge with ball", kit: "ball", moves: [m("Single-Leg Glute Bridge", "side", { cue: "Hips level." }), m("Glute Bridge", "reps", { cue: "Pause and squeeze at the top." }), m("Bridge Pulse", "hold", { cue: "Small and steady." })] },
      { label: "Side-lying", kit: "legs", moves: [m("Inner Thigh Lift", "side", { cue: "Lift the bottom leg a few centimetres." }), m("Side-Lying Leg Lift", "side", { cue: "Pulse at the top in later weeks." }), m("Clamshell", "side", { cue: "Pelvis still." })] },
      { label: "Abs", moves: [m("Single Leg Stretch", "reps", { cue: "Switch smoothly." }), m("Dead Bug", "side", { cue: "Exhale as you reach long." }), m("Criss-Cross", "reps", { cue: "Slow rotation." })] },
      { label: "All fours", kit: "legs", moves: [m("Donkey Kick", "side", { cue: "Heel to the ceiling." }), m("Fire Hydrant", "side", { cue: "Hips square." }), m("Bird Dog", "side", { cue: "Pause 2 s at full reach." })] },
    ],
  ],
};

const CLASS_META = {
  full: { name: "Full Body Sculpt", focus: "Glutes, core, arms, legs", warmup: ["Breathing with pelvic tilts ×8", "Cat–cow ×6", "Roll down and back up ×3"] },
  lower: { name: "Lower Body Burn", focus: "Glutes, outer and inner thighs", warmup: ["Glute bridge ×10", "Hip circles on all fours ×5 each way", "Bodyweight squat ×10"] },
  core: { name: "Core & Arms", focus: "Deep core, obliques, shoulders, arms", warmup: ["Breathing ×5", "Pelvic tilt to small bridge ×6", "Arm circles ×10"] },
  glute: { name: "Glutes & Abs", focus: "Glutes, hamstrings, abs", warmup: ["Cat–cow ×6", "Glute bridge ×10", "Dead bug ×5 each side"] },
} as const;

const COOLDOWN = ["Pigeon stretch · 45 s each side", "Supine twist · 30 s each side", "Child's pose · 1 min"];

function toExercise(move: Move, phase: Phase, kit?: Series["kit"]): Exercise {
  const reps = move.kind === "fixed" ? move.fixed ?? "" : move.kind === "hold" ? phase.hold : move.kind === "side" ? `${phase.reps} each side` : phase.reps;
  return ex(move.name, reps, {
    ...(phase.kit && kit ? { weight: KIT_WEIGHT[kit] } : {}),
    ...(move.cue ? { cue: move.cue } : {}),
    ...(move.alt ? { alt: move.alt } : {}),
  });
}

function sculpt(day: number, type: keyof typeof CLASSES, week: number): Session {
  const phase = PHASES[week];
  const series = CLASSES[type][(week - 1) % 2];
  const meta = CLASS_META[type];
  return {
    day,
    name: meta.name,
    focus: meta.focus,
    durationMin: 30,
    equipment: phase.kit ? "Mat · ankle weights, mini ball and 1–2 kg dumbbells if you have them" : "Mat",
    feel: phase.feel,
    warmup: [...meta.warmup],
    supersets: series.map(s => block(1, 15, s.moves.map(mv => toExercise(mv, phase, s.kit)), s.label)),
    cooldown: COOLDOWN,
    coachingNote: phase.note,
  };
}

const stretch = (day: number): Session => ({
  day,
  name: "Stretch & Release",
  focus: "Hips, hamstrings, spine",
  durationMin: 15,
  equipment: "Mat",
  feel: "Soft",
  optional: true,
  structure: ["Cat–cow · 1 min", "Low lunge · 45 s each side", "Seated forward fold · 1 min", "Figure-four stretch · 45 s each side", "Supine twist · 45 s each side", "Legs up the wall · 3 min"],
  coachingNote: "Optional. A gentle reset for tight hips and a busy mind.",
});

function week(n: number): Week {
  const phase = PHASES[n];
  return {
    week: n,
    theme: phase.theme,
    progression: phase.progression,
    sessions: [
      sculpt(1, "full", n),
      sculpt(2, "lower", n),
      walkDay(3, 30),
      sculpt(4, "core", n),
      sculpt(5, "glute", n),
      stretch(6),
      restDay(7),
    ],
  };
}

export const pilatesPlan: TrainingPath = {
  id: "mat-pilates",
  name: "Mat Sculpt 30",
  subtitle: "30-minute mat pilates that burns, then lets you breathe",
  focus: "pilates",
  description:
    "Four 30-minute mat classes a week in the modern sculpt style: slow, controlled, high-rep series with small pulses and long holds. Low impact, done in your lounge, with ankle weights, a mini ball and light dumbbells joining from week 3.",
  whoItIsFor:
    "You want toned, strong legs, glutes and core without impact or a gym, and you have 30 minutes. Great after babies once you're cleared to exercise; make moves smaller if you notice doming or pelvic heaviness.",
  equipmentLevel: "home",
  daysPerWeek: 4,
  sessionMinutes: [30, 30],
  weeks: [1, 2, 3, 4, 5, 6, 7, 8].map(week),
};
