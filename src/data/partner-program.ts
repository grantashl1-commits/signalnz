/**
 * Partner class-style series — 8 weeks, 24 sessions, two partners and one treadmill.
 *
 * Every session is 9 stations (3 Strength, 3 Reformer, 3 Core) done for 2 rounds.
 * Turn order: for each round, for each station, partner A works the station while
 * partner B walks the treadmill, then they swap — 9 × 2 × 2 = 36 turns.
 *
 * Weeks alternate Upper-Lower-Upper (odd) and Lower-Upper-Lower (even), so the
 * series has 12 upper and 12 lower sessions and each half of the body is trained
 * 3 times a fortnight. Each session has a distinct combination in every block. Familiar movements
 * return later with their existing identities so saved weights can progress.
 *
 * One barbell is shared: each session has at most two barbell stations and at
 * most one that needs the rack (squat or bench), so the bar is re-set as little
 * as possible.
 *
 * `muscles` lists the prime mover first. Volume maths (see `fractionalSetsPerMuscle`)
 * counts the first muscle as 1 set and the rest as ½ for strength stations, and
 * halves both for reformer stations. Core stations are not counted for limbs.
 */
export type StationBlock = 'Strength' | 'Reformer' | 'Core';
export type BodyFocus = 'Upper' | 'Lower';
export type SessionStyle = 'Foundation' | 'Strength' | 'Pump' | 'Power' | 'Peak' | 'Deload';
export interface PartnerStation {
  id: string;
  name: string;
  shortLabel: string;
  block: StationBlock;
  reps: string;
  repRange?: [number, number];
  perSide?: boolean;
  timed?: boolean;
  /** Standing or lateral reformer work (stability matters more than speed). */
  standing?: boolean;
  tempo?: string;
  rir?: string;
  load: string;
  equipment: Array<'barbell' | 'rack' | 'dumbbell' | 'bench' | 'reformer' | 'yoga-ball' | 'bodyweight' | 'treadmill'>;
  cue: string;
  muscles: string[];
  imageKey?: string;
  alt?: string;
  /** Class-timer work window for this station, sized to its reps (falls back to the session's). */
  workSeconds?: number;
}
export interface PartnerSession {
  id: string;
  week: number;
  index: 1 | 2 | 3;
  focus: BodyFocus;
  style: SessionStyle;
  title: string;
  stations: PartnerStation[];
  rounds: 2;
  /** Default class-timer work window (stations may set their own). */
  workSeconds: number;
  transitionSeconds: number;
  warmup: string[];
  cooldown: string[];
  treadmill: string;
  coachNote: string;
  /** Estimated class length in minutes, worked out from each station's reps. */
  estMinutes: number;
}
export interface PartnerPhase { name: string; weeks: number[]; goal: string; reps: string; rir: string; notes: string }
export interface PartnerProgram { id: 'partner-strength-8wk'; name: string; summary: string; equipment: string[]; safety: string[]; phases: PartnerPhase[]; sessions: PartnerSession[]; evidence: string[] }

/** 9 stations × 2 partners × 2 rounds. */
export const PARTNER_TURNS = 36;

/** Shown at every treadmill swap. */
export const SWAP_SAFETY =
  'Swap safely: the walker slows to about 3 km/h, steps onto the side rails and unclips the key. The incoming partner stands on the side rails, clips the key to their clothing, holds the handrails, steps onto the moving belt and then builds pace.';

type Equipment = PartnerStation['equipment'][number];
type Springs = 'light' | 'light–medium' | 'medium' | 'medium–heavy' | 'heavy';
type StationBase = Omit<PartnerStation, 'reps' | 'repRange' | 'rir' | 'tempo' | 'load' | 'workSeconds'> & {
  /** How load is described: barbell/dumbbell text changes by phase; anything else is fixed. */
  kit: 'barbell' | 'dumbbell' | 'reformer' | 'fixed';
  fixedLoad?: string;
};
interface Rx { reps: string; repRange?: [number, number]; rir?: string; tempo?: string; load?: string; springs?: Springs }

// ── Timing ──────────────────────────────────────────────────────────────────
// Class-timer mode: each turn is the station's work window, then the swap.
// The worker rests on the treadmill for the partner's turn (~65–90 s incl. swaps).
const BASE_WORK: Record<SessionStyle, number> = { Foundation: 50, Pump: 50, Strength: 50, Power: 50, Peak: 50, Deload: 45 };
const TRANSITION_SECONDS = 15;
const WARMUP_MIN = 7;
const COOLDOWN_MIN = 2.5;
const MIN_WORK = 40;
const MAX_WORK = 75;

/**
 * Seconds a station's prescription takes: tempo-based seconds per rep (3 s, or
 * 3.5 s per unilateral rep, when no tempo is set), 6 s to switch sides and
 * 10 s to unrack and set up a barbell. Holds add 5 s to get into position.
 */
export function prescriptionSeconds(st: Pick<PartnerStation, 'reps' | 'repRange' | 'perSide' | 'timed' | 'tempo' | 'block' | 'equipment'>): number {
  const sides = st.perSide ? 2 : 1;
  const switchSides = st.perSide ? 6 : 0;
  if (st.timed) {
    const hold = Number(st.reps.match(/(\d+)\s*s/)?.[1] ?? 0);
    return hold * sides + switchSides + 5;
  }
  // Series ("8 heels · 8 toes") add up every number; otherwise the top of the range.
  const series: string[] = st.repRange ? [] : st.reps.match(/\d+/g) ?? [];
  const reps = (st.repRange ? st.repRange[1] : series.reduce((sum, n) => sum + Number(n), 0)) * sides;
  const tempo = st.tempo?.match(/^(\d)-(\d)-(\d|X)$/);
  const perRep = tempo
    ? Number(tempo[1]) + Number(tempo[2]) + (tempo[3] === 'X' ? 1 : Number(tempo[3]))
    : st.tempo ? 4 : st.perSide && st.block === 'Strength' ? 3.5 : 3;
  return reps * perRep + switchSides + (st.equipment.includes('barbell') ? 10 : 0);
}

const workWindow = (st: PartnerStation, base: number) =>
  Math.min(MAX_WORK, Math.max(MIN_WORK, base - 5, Math.ceil(prescriptionSeconds(st) / 5) * 5));

/** Work window for one station (class timer). */
export const stationWorkSeconds = (session: Pick<PartnerSession, 'workSeconds'>, station: Pick<PartnerStation, 'workSeconds'> | undefined) =>
  station?.workSeconds ?? session.workSeconds;

function estimateMinutes(stations: PartnerStation[], rounds: number, transition: number): number {
  const turnSeconds = stations.reduce((sum, st) => sum + 2 * ((st.workSeconds ?? 50) + transition), 0) * rounds;
  return Math.round(turnSeconds / 60 + WARMUP_MIN + COOLDOWN_MIN);
}

/** Extra minutes for an optional third round of the strength stations. */
export function extraStrengthRoundMinutes(session: PartnerSession): number {
  const strength = session.stations.filter((st) => st.block === 'Strength');
  return Math.round(strength.reduce((sum, st) => sum + 2 * (stationWorkSeconds(session, st) + session.transitionSeconds), 0) / 60);
}

// ── Load guidance (prescribed by reps in reserve; kg are starting suggestions) ─
const rirMin = (rir?: string) => Number(rir?.match(/\d+/)?.[0] ?? 2);
/** "a weight you could lift about N times" for this prescription (top reps + reps in reserve). */
const capacity = (rx: Rx) => (rx.repRange ? rx.repRange[1] + rirMin(rx.rir) : null);
const couldLift = (rx: Rx) => {
  const n = capacity(rx);
  return n ? `a weight you could lift about ${n} times` : 'a weight that leaves the target reps in reserve';
};

function barbellLoad(style: SessionStyle, rx: Rx): string {
  const left = rx.rir ?? '2';
  switch (style) {
    case 'Foundation': return `Barbell: ${couldLift(rx)}, so you stop with ${left} left (often the 20 kg bar + 2.5–10 kg a side). Log the total including the bar.`;
    case 'Pump': return `Barbell: start from your last log; add 2.5–5 kg once every set reaches the top of the range with ${left} left. New lift? Use the ramp-up to find ${couldLift(rx)}.`;
    case 'Strength': return `Barbell: fewer reps, so go heavier, usually your last log + 5–10 kg after the Pump block (the app suggests a number). New lift? Use the ramp-up sets to find ${couldLift(rx)}. Stop with ${left} left.`;
    case 'Power': return `Barbell: same as Week 5, or + 2.5 kg if you hit the top of the range with ${left} left. Lower under control, then lift each rep fast.`;
    case 'Peak': return `Barbell: your heaviest clean ${rx.reps} with ${left} left, usually Week 5 + 2.5–5 kg. No grinding.`;
    case 'Deload': return 'Barbell: about 70–80 % of your Week 7 weight. Crisp reps, 3–4 left.';
  }
}
function dumbbellLoad(style: SessionStyle, rx: Rx): string {
  const start = `Dumbbells (kg per hand): ${couldLift(rx)}.`;
  switch (style) {
    case 'Foundation': return `${start} Log it.`;
    case 'Pump': return `${start} Start from your last log; go up one dumbbell once you hit the top of the range with ${rx.rir ?? '2'} left.`;
    case 'Strength': return `${start} Start from your last log (the app suggests a number). At 25 kg with 3+ left, lower for 4 s or add a 2-s pause instead.`;
    case 'Power': return `${start} Same as Week 5, lowered under control and lifted fast.`;
    case 'Peak': return `${start} Heaviest clean set with ${rx.rir ?? '1–2'} left. Topped out at 25 kg? Add a 2-s pause or a 4-s lowering.`;
    case 'Deload': return 'Dumbbells: about 70–80 % of your Week 7 weight.';
  }
}
const springs = (level: Springs) => `Springs: ${level}. Brands differ, so log your setting.`;

// ── Cue add-ons ─────────────────────────────────────────────────────────────
const STANDING_SAFETY = ' Step on and off only with the carriage home and still; bare feet or grip socks; hold the frame or foot bar.';
const DOMING = ' Exhale on effort; if your midline domes or you feel pelvic heaviness, use the swap.';
const LONG_BOX = ' Needs the reformer box; no box? Do the swap.';

// ── Station library ─────────────────────────────────────────────────────────
const base = (b: StationBase) => b;
const strength = (b: Omit<StationBase, 'block'>) => base({ ...b, block: 'Strength' });
const reformer = (b: Omit<StationBase, 'block' | 'kit' | 'equipment'>) =>
  base({ ...b, block: 'Reformer', kit: 'reformer', equipment: ['reformer'], cue: b.standing ? b.cue + STANDING_SAFETY : b.cue });
const core = (b: Omit<StationBase, 'block' | 'kit'> & { fixedLoad: string }) => base({ ...b, block: 'Core', kit: 'fixed' });
const eq = (...e: Equipment[]) => e;

const L = {
  // Lower strength
  squat: strength({ id: 'barbell-back-squat', name: 'Barbell Squat', shortLabel: 'BACK SQUAT', kit: 'barbell', equipment: eq('barbell', 'rack'), muscles: ['quads', 'glutes', 'adductors', 'core'], imageKey: 'goblet-squat', cue: 'Back squat with the safeties just below the shorter partner’s lowest point. Brace, sit down between your hips with knees over toes, then drive the floor away.', alt: 'Goblet squat with one heavy dumbbell (heels on a small plate if your ankles are tight)' }),
  dbSquat: strength({ id: 'db-goblet-squat', name: 'Goblet Squat', shortLabel: 'GOBLET SQUAT', kit: 'dumbbell', equipment: eq('dumbbell'), muscles: ['quads', 'glutes', 'adductors', 'core'], imageKey: 'goblet-squat', cue: 'One dumbbell held at your chest (or two on your shoulders once one is too light). Sit down between your hips, chest tall, then drive up.', alt: 'Bodyweight box squat to the bench' }),
  rdl: strength({ id: 'barbell-rdl', name: 'Barbell Romanian Deadlift', shortLabel: 'BARBELL RDL', kit: 'barbell', equipment: eq('barbell'), muscles: ['hamstrings', 'glutes', 'lower back'], imageKey: 'romanian-deadlift', cue: 'Unrack from hooks at mid-thigh, or deadlift the bar up first. Soft knees, push your hips back and slide the bar down your thighs. Stop when your back wants to round, then squeeze your glutes to stand.', alt: 'Dumbbell Romanian deadlift' }),
  hipThrust: strength({ id: 'barbell-hip-thrust', name: 'Barbell Hip Thrust', shortLabel: 'HIP THRUST', kit: 'barbell', equipment: eq('barbell', 'bench'), muscles: ['glutes', 'hamstrings'], imageKey: 'hip-thrust', cue: 'Bench just under your shoulder blades, bar in your hip crease with a pad or folded mat on it. Chin tucked, ribs down, drive through your heels to a flat-top finish with no arching.', alt: 'Dumbbell hip thrust or single-leg glute bridge' }),
  reverseLunge: strength({ id: 'db-reverse-lunge', name: 'Reverse Lunge', shortLabel: 'REVERSE LUNGE', kit: 'dumbbell', equipment: eq('dumbbell'), perSide: true, muscles: ['glutes', 'quads', 'adductors'], imageKey: 'split-squat', cue: 'Step back long, drop the back knee straight down and push up through the front heel. Torso tall.', alt: 'Split squat holding the rack for balance' }),
  stepUp: strength({ id: 'db-step-up', name: 'Dumbbell Step-Up', shortLabel: 'STEP-UP', kit: 'dumbbell', equipment: eq('dumbbell', 'bench'), perSide: true, muscles: ['glutes', 'quads'], imageKey: 'step-up', cue: 'Whole foot on the bench, lean slightly forward and drive up through that heel. No push-off from the back foot.', alt: 'Step-up onto a lower step, bodyweight' }),
  bss: strength({ id: 'db-bulgarian-split-squat', name: 'Dumbbell Bulgarian Split Squat', shortLabel: 'BULGARIAN SPLIT SQUAT', kit: 'dumbbell', equipment: eq('dumbbell', 'bench'), perSide: true, muscles: ['quads', 'glutes', 'adductors'], imageKey: 'bulgarian-split-squat', cue: 'Back foot laces-down on the bench, front foot far enough forward to drop straight down. A slight forward lean puts more into the glutes.', alt: 'Split squat with the back foot on the floor' }),
  slRdl: strength({ id: 'db-single-leg-rdl', name: 'Single-Leg Romanian Deadlift', shortLabel: 'SINGLE-LEG RDL', kit: 'dumbbell', equipment: eq('dumbbell'), perSide: true, muscles: ['hamstrings', 'glutes'], imageKey: 'single-leg-deadlift', cue: 'Dumbbell in the opposite hand, hips square to the floor, reach the free leg back as you hinge. Touch the rack lightly if balance wobbles.', alt: 'Kickstand RDL (back toe lightly down)' }),
  dbRdl: strength({ id: 'db-rdl', name: 'Dumbbell Romanian Deadlift', shortLabel: 'DUMBBELL RDL', kit: 'dumbbell', equipment: eq('dumbbell'), muscles: ['hamstrings', 'glutes', 'lower back'], imageKey: 'romanian-deadlift', cue: 'Dumbbells close to your legs, hips back, long spine. Feel the hamstring stretch, then squeeze up.', alt: 'Single-leg RDL with one dumbbell, holding the rack' }),
  swing: strength({ id: 'db-swing', name: 'Dumbbell Swing', shortLabel: 'DB SWING', kit: 'fixed', fixedLoad: 'One dumbbell held by the head, about 8–16 kg to start.', equipment: eq('dumbbell'), muscles: ['glutes', 'hamstrings', 'lower back'], imageKey: 'romanian-deadlift', cue: 'Hike the dumbbell back between your thighs, then snap your hips forward so it floats to chest height. Arms only guide it. Stop the set when the swing slows.', alt: 'Fast-up hip thrust or glute bridge' }),
  squatJump: strength({ id: 'squat-jump', name: 'Squat Jump', shortLabel: 'SQUAT JUMP', kit: 'fixed', fixedLoad: 'Bodyweight.', equipment: eq('bodyweight'), muscles: ['quads', 'glutes', 'calves'], imageKey: 'sumo-squat', cue: 'Quarter-to-half squat, jump tall, land softly through the whole foot and reset before the next rep. Stop when the jumps get lower.', alt: 'Speed squat to calf raise: fast up, no jump (pelvic-floor friendly)' }),
  // Upper strength
  dbBench: strength({ id: 'db-bench-press', name: 'Dumbbell Bench Press', shortLabel: 'DB BENCH PRESS', kit: 'dumbbell', equipment: eq('dumbbell', 'bench'), muscles: ['chest', 'triceps', 'shoulders'], imageKey: 'bench-press', cue: 'Feet planted, shoulder blades tucked. Lower until your elbows are just below the bench, then press up and slightly in. No spotter needed: lower the dumbbells to your chest and sit up with them.', alt: 'Push-up with hands on the bench' }),
  bbBench: strength({ id: 'barbell-bench-press', name: 'Barbell Bench Press', shortLabel: 'BENCH PRESS', kit: 'barbell', equipment: eq('barbell', 'rack', 'bench'), muscles: ['chest', 'triceps', 'shoulders'], imageKey: 'bench-press', cue: 'Bench in the rack. Set the safety arms so the bar rests about 2–3 cm below where it touches your chest: lie down and lower an empty bar onto them to check. Collars on. Re-check for each partner. Grip just outside shoulders, lower to mid-chest, press back up over your shoulders.', alt: 'Dumbbell bench press' }),
  bbRow: strength({ id: 'barbell-bent-over-row', name: 'Barbell Bent-Over Row', shortLabel: 'BENT-OVER ROW', kit: 'barbell', equipment: eq('barbell'), muscles: ['back', 'biceps', 'shoulders', 'lower back'], imageKey: 'bent-over-row', cue: 'Unrack from low hooks or deadlift the bar up. Hinge to about 45° with the bar under your shoulders, pull to your lower ribs, squeeze your shoulder blades, lower under control.', alt: 'Chest-supported dumbbell row (kinder on a tired lower back)' }),
  csRow: strength({ id: 'chest-supported-db-row', name: 'Chest-Supported Row', shortLabel: 'CHEST-SUPPORTED ROW', kit: 'dumbbell', equipment: eq('dumbbell', 'bench'), muscles: ['back', 'shoulders', 'biceps'], imageKey: 'chest-supported-row', cue: 'Chest on an incline bench, arms long. Row your elbows towards your hips and pause a beat at the top.', alt: 'Single-arm dumbbell row on a flat bench' }),
  seatedPress: strength({ id: 'seated-db-shoulder-press', name: 'Seated Dumbbell Shoulder Press', shortLabel: 'SEATED DB PRESS', kit: 'dumbbell', equipment: eq('dumbbell', 'bench'), muscles: ['shoulders', 'triceps'], imageKey: 'overhead-press', cue: 'Bench upright (or sit tall on the flat bench), ribs down. Press up and slightly in until your biceps are by your ears; lower to chin height.', alt: 'Half-kneeling single-arm press' }),
  arnold: strength({ id: 'arnold-press', name: 'Arnold Press', shortLabel: 'ARNOLD PRESS', kit: 'dumbbell', equipment: eq('dumbbell', 'bench'), muscles: ['shoulders', 'triceps'], imageKey: 'arnold-press', cue: 'Start palms facing you at chin height and rotate as you press, so palms face forward at the top. Smooth, no leaning back.', alt: 'Seated dumbbell shoulder press' }),
  hkPress: strength({ id: 'half-kneeling-db-press', name: 'Half-Kneeling Single-Arm Press', shortLabel: 'HALF-KNEEL PRESS', kit: 'dumbbell', equipment: eq('dumbbell'), perSide: true, muscles: ['shoulders', 'triceps', 'core'], imageKey: 'overhead-press', cue: 'Down knee on the same side as the dumbbell. Squeeze that glute and press straight up without leaning away.', alt: 'Seated dumbbell shoulder press' }),
  incline: strength({ id: 'incline-db-press', name: 'Incline Dumbbell Bench Press', shortLabel: 'INCLINE DB PRESS', kit: 'dumbbell', equipment: eq('dumbbell', 'bench'), muscles: ['chest', 'shoulders', 'triceps'], imageKey: 'incline-dumbbell-press', cue: 'Bench at 30–45°. Lower the dumbbells to upper-chest level with elbows about 45° from your body, then press up.', alt: 'Flat dumbbell press if your bench does not incline' }),
  lateral: strength({ id: 'db-lateral-raise', name: 'Lateral Raise', shortLabel: 'LATERAL RAISE', kit: 'fixed', fixedLoad: 'Light dumbbells, about 4–8 kg. Add reps before weight.', equipment: eq('dumbbell'), muscles: ['shoulders'], imageKey: 'upright-row', cue: 'Soft elbows, lead with the elbows out to shoulder height, then lower for 2 s. No shrugging.', alt: 'Seated lateral raise with lighter dumbbells' }),
  pushUp: strength({ id: 'push-up', name: 'Push-Up', shortLabel: 'PUSH-UP', kit: 'fixed', fixedLoad: 'Bodyweight. Hands on the bench or rack bar to make it work for you.', equipment: eq('bodyweight'), muscles: ['chest', 'triceps', 'shoulders', 'core'], imageKey: 'push-up', cue: 'Hands just outside shoulders, body in one long line. Lower your chest to fist height, then push the floor away.', alt: 'Incline push-up on the bench or rack bar' }),
  bbOhp: strength({ id: 'barbell-overhead-press', name: 'Barbell Overhead Press', shortLabel: 'OVERHEAD PRESS', kit: 'barbell', equipment: eq('barbell', 'rack'), muscles: ['shoulders', 'triceps', 'core'], imageKey: 'overhead-press', cue: 'Unrack at collarbone height and squeeze your glutes. Press the bar up and bring your head through at the top. No leaning back.', alt: 'Seated dumbbell shoulder press' }),
  pushPress: strength({ id: 'db-push-press', name: 'Dumbbell Push Press', shortLabel: 'DB PUSH PRESS', kit: 'dumbbell', equipment: eq('dumbbell'), muscles: ['shoulders', 'triceps', 'quads'], imageKey: 'overhead-press', cue: 'Short dip at the knees, drive up through your legs and punch the dumbbells overhead. Lower under control to your shoulders. Stop when the dumbbells slow.', alt: 'Seated dumbbell press, as fast as you can lift it' }),

  // Lower reformer
  footwork: reformer({ id: 'reformer-footwork', name: 'Reformer Footwork', shortLabel: 'FOOTWORK', muscles: ['quads', 'glutes', 'calves'], imageKey: 'leg-press', cue: 'Lie supported with both heels on the footbar, feet parallel and hip-width apart, toes lifted. Keep your pelvis neutral. Press out without locking your knees, then resist the carriage home for 2–3 s. Begin with a familiar controlled spring setting before increasing resistance.', alt: 'Wall sit or goblet squat' }),
  slPress: reformer({ id: 'reformer-single-leg-press', name: 'Reformer Single-Leg Press', shortLabel: 'SINGLE-LEG PRESS', perSide: true, muscles: ['quads', 'glutes'], imageKey: 'leg-press', cue: 'Lie supported with one foot securely centred on the footbar and the other knee in tabletop. Keep your pelvis level as you press out without locking the knee, then resist the carriage home. Complete both sides.', alt: 'Single-leg glute bridge' }),
  bridge: reformer({ id: 'reformer-bridge', name: 'Reformer Bridge', shortLabel: 'REFORMER BRIDGE', muscles: ['hamstrings', 'glutes'], imageKey: 'bridge', cue: 'Headrest flat, shoulders supported, both feet on the bar. Lift into a comfortable bridge without loading your neck. Keeping your hips steady, press the carriage out a small distance, then bend your knees to draw it home. Shorten the range or use the swap if your back arches.', alt: 'Yoga-ball hamstring curl' }),
  pressDown: reformer({ id: 'reformer-feet-in-straps-press-down', name: 'Reformer Feet-in-Straps Leg Press-Down', shortLabel: 'LEG PRESS-DOWN', muscles: ['hamstrings', 'glutes'], imageKey: 'single-leg-circle', cue: 'Lie on your back, feet in the straps, legs straight at about 60°. Press them down to about 45° against the springs, then resist them back up. Pelvis still. Have a long box? The prone long-box hamstring curl (face down, heels to seat) works too.', alt: 'Yoga-ball hamstring curl' }),
  sideLeg: reformer({ id: 'reformer-side-lying-press', name: 'Reformer Side-Lying Leg Press', shortLabel: 'SIDE-LYING PRESS', perSide: true, muscles: ['glutes', 'quads'], imageKey: 'side-lying-leg-lift', cue: 'Lie on your side with the bottom foot on the bar. Press out with hips stacked and your waist lifted off the carriage.', alt: 'Side-lying leg lift' }),
  standingLunge: reformer({ id: 'reformer-standing-lunge', name: 'Reformer Standing Lunge', shortLabel: 'STANDING LUNGE', perSide: true, standing: true, muscles: ['glutes', 'quads', 'adductors'], imageKey: 'split-squat', cue: 'Front foot on the platform, back foot against the shoulder rest. Slide the carriage back as you bend the front knee, then draw it home with the front leg. Heavier springs are more stable here; go lighter only once it feels controlled.', alt: 'Reverse lunge, bodyweight' }),
  scooter: reformer({ id: 'reformer-scooter', name: 'Reformer Scooter', shortLabel: 'SCOOTER', perSide: true, standing: true, muscles: ['glutes', 'hamstrings'], imageKey: 'donkey-kick', cue: 'Stand beside the frame with one foot firmly on the floor and both hands on the footbar. Place the other forefoot against a shoulder block on the carriage. Push that leg back without moving your spine; draw it home slowly. Keep the floor knee softly bent.', alt: 'Donkey kick' }),
  sideSplits: reformer({ id: 'reformer-side-splits', name: 'Reformer Side Splits', shortLabel: 'SIDE SPLITS', standing: true, muscles: ['adductors', 'glutes'], imageKey: 'sumo-squat', cue: 'Stand astride the platform and carriage with soft knees. Open the carriage only a small range with control (use a carriage stopper if you have one), then squeeze your inner thighs to close it. Heavier springs are more stable.', alt: 'Sumo squat with a dumbbell' }),
  skater: reformer({ id: 'reformer-skater', name: 'Reformer Skater', shortLabel: 'SKATER', perSide: true, standing: true, muscles: ['glutes', 'adductors', 'quads'], imageKey: 'curtsy-lunge', cue: 'Stand side-on with the inside foot on the carriage. Sit into the standing hip as you push the carriage out sideways, then draw it back.', alt: 'Lateral lunge' }),
  calfRaise: reformer({ id: 'reformer-calf-raise', name: 'Reformer Calf Raise', shortLabel: 'CALF RAISE', muscles: ['calves'], imageKey: 'leg-press', cue: 'Lie supported with the balls of both feet on the footbar. Press the carriage out with knees softly unlocked; keep it still as you lower your heels a little below the bar and rise through the balls of your feet. Choose a familiar spring setting that lets you control the carriage.', alt: 'Standing calf raise holding the rack for balance' }),
  // Upper reformer
  seatedRow: reformer({ id: 'reformer-seated-row', name: 'Reformer Seated Row', shortLabel: 'SEATED ROW', muscles: ['back', 'biceps', 'shoulders'], imageKey: 'bent-over-row', cue: 'Sit tall facing the straps, arms long. Draw your elbows back past your ribs with shoulders down, then return slowly.', alt: 'Light dumbbell bent-over row' }),
  latPull: reformer({ id: 'reformer-kneeling-lat-pull', name: 'Reformer Kneeling Lat Pull-Down', shortLabel: 'LAT PULL-DOWN', muscles: ['back', 'triceps'], imageKey: 'lat-pulldown', cue: 'Kneel facing the pulleys with arms reaching up and forward. Pull the straps down to your sides, ribs knitted, no arching.', alt: 'Dumbbell pullover on the bench' }),
  longBox: reformer({ id: 'reformer-long-box-pull', name: 'Reformer Long Box Pull', shortLabel: 'LONG BOX PULL', muscles: ['back', 'shoulders', 'triceps'], imageKey: 'chest-supported-row', cue: 'Lie face down on the long box, chest just past the edge. Pull the straps back alongside your body as your chest lifts a little; return slowly.' + LONG_BOX, alt: 'Chest-supported dumbbell row' }),
  tPull: reformer({ id: 'reformer-long-box-t-pull', name: 'Reformer Long Box T-Pull', shortLabel: 'T-PULL', muscles: ['shoulders', 'back'], imageKey: 'face-pull', cue: 'Face down on the long box with arms hanging. Open the straps out wide into a T and squeeze between your shoulder blades.' + LONG_BOX, alt: 'Dumbbell reverse fly' }),
  chestPress: reformer({ id: 'reformer-chest-press', name: 'Reformer Seated Chest Press', shortLabel: 'CHEST PRESS', muscles: ['chest', 'triceps', 'shoulders'], imageKey: 'bench-press', cue: 'Sit facing away from the pulleys, straps at chest height. Press forward and slightly together, then let the straps open you slowly.', alt: 'Push-up with hands on the bench' }),
  hugTree: reformer({ id: 'reformer-hug-a-tree', name: 'Reformer Hug a Tree', shortLabel: 'HUG A TREE', muscles: ['chest', 'shoulders'], imageKey: 'incline-dumbbell-press', cue: 'Sit facing away from the pulleys with arms open wide and elbows softly bent. Hug the straps together in front of your chest, then open slowly.', alt: 'Dumbbell chest fly on the bench' }),
  chestExp: reformer({ id: 'reformer-chest-expansion', name: 'Reformer Kneeling Chest Expansion', shortLabel: 'CHEST EXPANSION', muscles: ['back', 'triceps', 'shoulders'], imageKey: 'tricep-kickback', cue: 'Kneel tall facing the pulleys, holding a handle in each hand. Draw straight arms beside or just behind your hips without leaning back; return slowly. Keep your neck quiet. If kneeling hurts or balance is uncertain, use the seated-row station instead.', alt: 'Seated reformer row or light dumbbell row' }),
  facePull: reformer({ id: 'reformer-face-pull', name: 'Reformer Kneeling Face Pull', shortLabel: 'FACE PULL', muscles: ['shoulders', 'back'], imageKey: 'face-pull', cue: 'Kneel facing the pulleys, straps at eye height. Pull towards your face with elbows high and wide, squeezing the back of the shoulders.', alt: 'Dumbbell reverse fly' }),
  curl: reformer({ id: 'reformer-biceps-curl', name: 'Reformer Biceps Curl', shortLabel: 'BICEPS CURL', muscles: ['biceps'], imageKey: 'bicep-curl', cue: 'Kneel or sit facing the pulleys with elbows by your ribs. Curl the straps up and lower for 3 s, elbows still.', alt: 'Dumbbell biceps curl' }),
  triOverhead: reformer({ id: 'reformer-overhead-triceps', name: 'Reformer Overhead Triceps Extension', shortLabel: 'OVERHEAD TRICEPS', muscles: ['triceps'], imageKey: 'tricep-overhead-extension', cue: 'Sit facing away from the pulleys, handles just behind your head and elbows pointing forward. With a small forward lean and steady ribs, extend your elbows diagonally up, then return slowly. Use the forehead-level salute variation if the overhead range is uncomfortable.', alt: 'Light dumbbell overhead triceps extension' }),
  triPress: reformer({ id: 'reformer-triceps-press', name: 'Reformer Kneeling Triceps Press', shortLabel: 'TRICEPS PRESS', muscles: ['triceps', 'shoulders'], imageKey: 'tricep-kickback', cue: 'Kneel facing the pulleys with arms by your sides. Press the straps back behind you with straight elbows and a lifted chest.', alt: 'Dumbbell triceps kickback' }),
  sideArm: reformer({ id: 'reformer-side-arm-raise', name: 'Reformer Kneeling Side Arm Raise', shortLabel: 'SIDE ARM RAISE', perSide: true, muscles: ['shoulders'], imageKey: 'upright-row', cue: 'Kneel side-on holding the far strap. Lift the arm out to shoulder height with the shoulder down, then lower slowly.', alt: 'Lateral raise' }),
  supineArms: reformer({ id: 'reformer-supine-arm-pull', name: 'Reformer Supine Arm Pull-Down', shortLabel: 'ARM PULL-DOWN', muscles: ['back', 'triceps'], imageKey: 'lat-pulldown', cue: 'Lie on your back, arms up to the ceiling. Pull the straps down beside your hips with soft ribs, then let them rise slowly.', alt: 'Dumbbell pullover' }),

  frog: reformer({ id: 'reformer-frog-press', name: 'Reformer Frog Press', shortLabel: 'FROG PRESS', muscles: ['adductors', 'glutes', 'hamstrings'], imageKey: 'leg-press', cue: 'Lie supported with both feet securely in straps. Heels together, knees comfortably open. Press both legs diagonally away, then bend back into the diamond without moving your pelvis. Keep the range small enough for a quiet lower back.', alt: 'Bodyweight sumo squat' }),

  // Core — progressive and diastasis-aware: exhale on effort, regress if you see doming along the midline.
  deadBug: core({ id: 'dead-bug', name: 'Dead Bug', shortLabel: 'DEAD BUG', fixedLoad: 'Bodyweight.', equipment: eq('bodyweight'), perSide: true, muscles: ['core'], imageKey: 'dead-bug', cue: 'Low back gently heavy on the floor. Exhale as you reach the opposite arm and leg long, only as far as you can without arching.', alt: 'Heel taps with knees bent' }),
  ballDeadBug: core({ id: 'ball-dead-bug', name: 'Dead Bug (yoga ball)', shortLabel: 'BALL DEAD BUG', fixedLoad: 'Yoga ball.', equipment: eq('yoga-ball'), perSide: true, muscles: ['core'], imageKey: 'dead-bug', cue: 'Squeeze the ball between one hand and the opposite knee while the other arm and leg reach long. Exhale, ribs down.', alt: 'Dead bug with heel taps' }),
  dbDeadBug: core({ id: 'dumbbell-dead-bug', name: 'Dead Bug (dumbbell)', shortLabel: 'WEIGHTED DEAD BUG', fixedLoad: 'One dumbbell, about 6–12 kg.', equipment: eq('dumbbell'), perSide: true, muscles: ['core'], imageKey: 'dead-bug', cue: 'Both hands press one dumbbell up over your chest. Lower one leg at a time to a hover while your back stays heavy.' + DOMING, alt: 'Dead bug without weight' }),
  sidePlankKnee: core({ id: 'side-plank-bent-knee', name: 'Side Plank (bent knee)', shortLabel: 'SIDE PLANK', fixedLoad: 'Bodyweight.', equipment: eq('bodyweight'), perSide: true, timed: true, muscles: ['obliques', 'core', 'glutes'], imageKey: 'side-plank', cue: 'Elbow under shoulder, knees bent. Lift your hips so ear, shoulder, hip and knee line up, and keep breathing.', alt: 'Side-lying leg lift' }),
  sidePlank: core({ id: 'side-plank', name: 'Side Plank', shortLabel: 'SIDE PLANK', fixedLoad: 'Bodyweight.', equipment: eq('bodyweight'), perSide: true, timed: true, muscles: ['obliques', 'core', 'glutes'], imageKey: 'side-plank', cue: 'Elbow under shoulder, feet stacked or staggered. Long line from head to heels, hips lifted, steady breath.', alt: 'Bent-knee side plank' }),
  sidePlankLift: core({ id: 'side-plank-hip-lift', name: 'Side Plank Hip Lift', shortLabel: 'SIDE PLANK HIP LIFT', fixedLoad: 'Bodyweight.', equipment: eq('bodyweight'), perSide: true, muscles: ['obliques', 'glutes', 'core'], imageKey: 'side-plank', cue: 'From a side plank, lower your hips a few centimetres and lift them back up just past neutral. Slow and controlled.', alt: 'Bent-knee side plank hold' }),
  copenhagen: core({ id: 'copenhagen-side-plank', name: 'Copenhagen Side Plank', shortLabel: 'COPENHAGEN PLANK', fixedLoad: 'Bodyweight, top knee on the bench.', equipment: eq('bench'), perSide: true, timed: true, muscles: ['adductors', 'obliques', 'core'], imageKey: 'side-plank', cue: 'Top knee (short lever) on the bench, bottom leg tucked under. Lift your hips level and hold; your inner thigh does the work.', alt: 'Side plank' }),
  birdDog: core({ id: 'bird-dog', name: 'Bird Dog', shortLabel: 'BIRD DOG', fixedLoad: 'Bodyweight.', equipment: eq('bodyweight'), perSide: true, muscles: ['core', 'glutes', 'lower back'], imageKey: 'bird-dog', cue: 'Hands under shoulders, knees under hips. Reach the opposite arm and leg long and hold 2 s without your hips rocking.', alt: 'Bird dog, arm or leg only' }),
  bearHold: core({ id: 'bear-hold', name: 'Bear Hold', shortLabel: 'BEAR HOLD', fixedLoad: 'Bodyweight.', equipment: eq('bodyweight'), timed: true, muscles: ['core', 'shoulders', 'quads'], imageKey: 'bear-hold', cue: 'On all fours, lift your knees a few centimetres off the floor. Flat back, steady breath.', alt: 'All-fours hold with knees down' }),
  plank: core({ id: 'forearm-plank', name: 'Forearm Plank', shortLabel: 'PLANK', fixedLoad: 'Bodyweight.', equipment: eq('bodyweight'), timed: true, muscles: ['core'], imageKey: 'plank', cue: 'Elbows under shoulders, glutes squeezed, ribs down. One long line from head to heels.', alt: 'Plank on your knees or with forearms on the bench' }),
  shoulderTap: core({ id: 'plank-shoulder-tap', name: 'Plank Shoulder Tap', shortLabel: 'SHOULDER TAPS', fixedLoad: 'Bodyweight.', equipment: eq('bodyweight'), perSide: true, muscles: ['core', 'shoulders', 'obliques'], imageKey: 'plank-shoulder-tap', cue: 'High plank with feet wide. Tap the opposite shoulder without your hips swaying.' + DOMING, alt: 'Incline plank shoulder taps (hands on the bench)' }),
  suitcase: core({ id: 'suitcase-carry', name: 'Suitcase Carry', shortLabel: 'SUITCASE CARRY', fixedLoad: 'One heavy dumbbell, about 12–25 kg.', equipment: eq('dumbbell'), perSide: true, timed: true, muscles: ['obliques', 'core', 'forearms'], imageKey: 'deadlift', cue: 'One heavy dumbbell at your side. Stand tall and walk slowly (or march on the spot) without leaning towards the weight.', alt: 'Suitcase hold, standing still' }),
  stirPot: core({ id: 'stir-the-pot', name: 'Stir the Pot (yoga ball)', shortLabel: 'STIR THE POT', fixedLoad: 'Yoga ball.', equipment: eq('yoga-ball'), perSide: true, muscles: ['core', 'shoulders'], imageKey: 'plank', cue: 'Forearms on the ball in a plank (knees down to start). Draw small circles with your elbows; your hips stay still.' + DOMING, alt: 'Incline forearm plank on the bench' }),
  kneeTuck: core({ id: 'ball-knee-tuck', name: 'Stability Ball Knee Tuck', shortLabel: 'BALL KNEE TUCK', fixedLoad: 'Yoga ball.', equipment: eq('yoga-ball'), muscles: ['core', 'hip flexors', 'shoulders'], imageKey: 'mountain-climbers', cue: 'Hands under shoulders, shins on the ball. Exhale and draw your knees to your chest, then roll back to a long plank without sagging.' + DOMING, alt: 'Bear hold, or incline plank with hands on the bench' }),
  pike: core({ id: 'ball-pike', name: 'Stability Ball Pike', shortLabel: 'BALL PIKE', fixedLoad: 'Yoga ball.', equipment: eq('yoga-ball'), muscles: ['core', 'shoulders', 'hip flexors'], imageKey: 'plank', cue: 'Plank with your toes on the ball. Exhale and lift your hips high with straight legs, then lower to plank with control.' + DOMING, alt: 'Ball knee tuck, or dead bug if you see doming' }),
  reverseCrunch: core({ id: 'reverse-crunch', name: 'Reverse Crunch', shortLabel: 'REVERSE CRUNCH', fixedLoad: 'Bodyweight.', equipment: eq('bodyweight'), muscles: ['core'], imageKey: 'dead-bug', cue: 'Knees bent over hips. Exhale and curl your pelvis gently off the mat, then lower slowly. No swinging.' + DOMING, alt: 'Dead bug heel taps' }),
  hollow: core({ id: 'hollow-body-hold', name: 'Hollow Body Hold (tuck)', shortLabel: 'HOLLOW HOLD', fixedLoad: 'Bodyweight.', equipment: eq('bodyweight'), timed: true, muscles: ['core'], imageKey: 'hollow-body-hold', cue: 'Low back pressed down, knees over hips, shoulders just lifted. Straighten your legs further only if your back stays down.' + DOMING, alt: 'Dead bug' }),
  renegade: core({ id: 'renegade-row', name: 'Renegade Row', shortLabel: 'RENEGADE ROW', fixedLoad: 'Two dumbbells, about 6–12 kg each.', equipment: eq('dumbbell'), perSide: true, muscles: ['core', 'back', 'obliques'], imageKey: 'renegade-row', cue: 'High plank on two dumbbells with feet wide. Row one to your hip without your hips twisting.' + DOMING, alt: 'Incline plank shoulder tap (hands on the bench)' }),
  pallof: core({ id: 'reformer-strap-pallof', name: 'Pallof Press (reformer strap)', shortLabel: 'PALLOF PRESS', fixedLoad: 'One reformer strap, light spring.', equipment: eq('reformer'), perSide: true, muscles: ['obliques', 'core'], imageKey: 'pallof-press', cue: 'Stand side-on to the pulleys holding one strap at your chest. Press it straight out and hold 2 s without twisting.', alt: 'Side plank' }),
};
type Key = keyof typeof L;

// ── Prescriptions by phase ──────────────────────────────────────────────────
// Week 6 ("Power") keeps the Week 5 lifts and reps, lifted fast, behind a power opener.
const MAIN: Record<SessionStyle, Rx> = {
  Foundation: { reps: '10–12', repRange: [10, 12], rir: '3', tempo: '3-0-1' },
  Pump: { reps: '10–12', repRange: [10, 12], rir: '2', tempo: '2-1-1' },
  Strength: { reps: '6–8', repRange: [6, 8], rir: '2', tempo: '3-0-1' },
  Power: { reps: '6–8', repRange: [6, 8], rir: '2', tempo: '2-0-X' },
  Peak: { reps: '5–6', repRange: [5, 6], rir: '1–2', tempo: '3-0-1' },
  Deload: { reps: '8', repRange: [8, 8], rir: '3–4', tempo: '2-0-1' },
};
const ACC: Record<SessionStyle, Rx> = {
  Foundation: { reps: '10–12', repRange: [10, 12], rir: '3', tempo: '3-0-1' },
  Pump: { reps: '12–15', repRange: [12, 15], rir: '1–2', tempo: '2-0-1' },
  Strength: { reps: '8–10', repRange: [8, 10], rir: '2', tempo: '3-0-1' },
  Power: { reps: '8–10', repRange: [8, 10], rir: '2', tempo: '2-0-X' },
  Peak: { reps: '6–8', repRange: [6, 8], rir: '1–2', tempo: '3-0-1' },
  Deload: { reps: '8–10', repRange: [8, 10], rir: '3–4' },
};
const SIDE: Record<SessionStyle, Rx> = {
  Foundation: { reps: '6–8 each side', repRange: [6, 8], rir: '3' },
  Pump: { reps: '6–8 each side', repRange: [6, 8], rir: '1–2' },
  Strength: { reps: '6–8 each side', repRange: [6, 8], rir: '2' },
  Power: { reps: '6 each side', repRange: [6, 6], rir: '2' },
  Peak: { reps: '6–8 each side', repRange: [6, 8], rir: '1–2' },
  Deload: { reps: '6 each side', repRange: [6, 6], rir: '3–4' },
};
const REF: Record<SessionStyle, Rx> = {
  Foundation: { reps: '10–12', repRange: [10, 12], rir: '3' },
  Pump: { reps: '12–15', repRange: [12, 15], rir: '1–2' },
  Strength: { reps: '10–12', repRange: [10, 12], rir: '2' },
  Power: { reps: '10', repRange: [10, 10], rir: '3', tempo: 'fast out, 3 s home' },
  Peak: { reps: '10–12', repRange: [10, 12], rir: '1–2' },
  Deload: { reps: '10', repRange: [10, 10], rir: '3–4' },
};
const REF_SIDE: Record<SessionStyle, Rx> = {
  Foundation: { reps: '8 each side', repRange: [8, 8], rir: '3' },
  Pump: { reps: '8–10 each side', repRange: [8, 10], rir: '1–2' },
  Strength: { reps: '8 each side', repRange: [8, 8], rir: '2' },
  Power: { reps: '8 each side', repRange: [8, 8], rir: '3', tempo: 'fast out, 3 s home' },
  Peak: { reps: '8 each side', repRange: [8, 8], rir: '1–2' },
  Deload: { reps: '6 each side', repRange: [6, 6], rir: '3–4' },
};
/** Standing reformer work is never rushed: steady out and home. */
const STANDING_TEMPO = '2-0-2';

/** Station spec: library key + prescription override (defaults come from the phase tables). */
type Spec = [Key, Partial<Rx>?] | Key;
type Role = 'main' | 'acc';

function build(style: SessionStyle, spec: Spec, role: Role): PartnerStation {
  const [key, over = {}] = Array.isArray(spec) ? spec : [spec];
  const { kit, fixedLoad, ...b } = L[key];
  let rx: Rx;
  if (b.block === 'Reformer') rx = { ...(b.perSide ? REF_SIDE : REF)[style], ...over };
  else if (b.block === 'Strength') rx = { ...(b.perSide ? SIDE : role === 'main' ? MAIN : ACC)[style], ...over };
  else rx = { reps: over.reps ?? '', ...over };
  if (b.standing) {
    // Heavier springs are more stable for standing and lateral work, and no fast tempo.
    if (!rx.springs || rx.springs === 'light' || rx.springs === 'light–medium') rx.springs = 'medium';
    if (rx.tempo && !/^\d-\d-\d$/.test(rx.tempo)) rx.tempo = STANDING_TEMPO;
  }
  const load = rx.load
    ?? (kit === 'barbell' ? barbellLoad(style, rx)
      : kit === 'dumbbell' ? dumbbellLoad(style, rx)
        : kit === 'reformer' ? springs(rx.springs ?? 'medium')
          : fixedLoad ?? 'Bodyweight.');
  const station: PartnerStation = { ...b, reps: rx.reps, load };
  if (rx.repRange) station.repRange = rx.repRange;
  if (rx.tempo) station.tempo = rx.tempo;
  if (rx.rir) station.rir = rx.rir;
  return station;
}

/** Core rep helpers. */
const each = (n: number, unit = 'each side'): Partial<Rx> => ({ reps: `${n} ${unit}`, repRange: [n, n] });
const reps = (lo: number, hi = lo): Partial<Rx> => ({ reps: lo === hi ? `${lo}` : `${lo}–${hi}`, repRange: [lo, hi] });
const hold = (s: number, perSide = false): Partial<Rx> => ({ reps: perSide ? `${s} s each side` : `${s} s` });
/** Reformer series (several foot positions): no single rep range. */
const series = (text: string, level: Springs): Partial<Rx> => ({ reps: text, repRange: undefined, springs: level });
/** Power opener: fast, crisp, stop when speed drops. */
const opener = (n: number): Partial<Rx> => ({ reps: `${n}`, repRange: [n, n], rir: '4–5', tempo: '2-0-X' });

// ── Session furniture ───────────────────────────────────────────────────────
function warmupFor(focus: BodyFocus, style: SessionStyle, stations: PartnerStation[]): string[] {
  const label = (st: PartnerStation) => st.shortLabel.toLowerCase().replace(/\brdl\b/g, 'RDL').replace(/\bdb\b/g, 'DB');
  const first = label(stations[0]);
  const second = label(stations[1]);
  const ramp = style === 'Power'
    ? `Ramp-up: 2 easy, fast sets of ${first} (5 reps). Before starting the class, add 1–2 lighter ramp-up sets of ${second}. Both class rounds are working sets; ramp-ups are separate.`
    : `Ramp-up: 1–2 lighter sets of ${first} (e.g. 8 reps at half weight, then 4 reps near working weight). Before starting the class, add 1–2 lighter ramp-up sets of ${second}. Both class rounds are working sets; ramp-ups are separate.`;
  return focus === 'Upper'
    ? ['1 min easy treadmill walk or marching, building pace', 'Arm circles × 10 each way', 'Cat-cow × 6', 'Scapular push-ups × 8 (hands on the bench)', ramp]
    : ['1 min easy treadmill walk or marching, building pace', 'Bodyweight squat to calf raise × 10', 'Glute bridge × 10', 'Hip hinge with a broomstick × 8', ramp];
}
function cooldownFor(focus: BodyFocus): string[] {
  return focus === 'Upper'
    ? ['Easy walk 1 min to let your heart rate settle', 'Doorway chest opener 30 s', 'Thread the needle 30 s each side']
    : ['Easy walk 1 min to let your heart rate settle', 'Kneeling hip-flexor stretch 30 s each side', 'Child’s pose 30 s'];
}
const TREADMILL: Record<SessionStyle, Record<BodyFocus, string>> = {
  Foundation: {
    Upper: 'Brisk walk 5.5–6 km/h at 4–6 % incline. You can chat in full sentences (RPE 4, about zone 2).',
    Lower: 'Brisk walk 5–5.5 km/h at 2–4 % incline. Keep it easy (RPE 3–4, zone 2) so your legs are fresh for the next station.',
  },
  Pump: {
    Upper: 'Comfortable walk at a pace and incline that allow full sentences (RPE 2–3). Let breathing settle before the next lift; choose partner pace or pause for more recovery when needed.',
    Lower: 'Comfortable walk, flat or a gentle incline (RPE 2–3). Keep your legs fresh for the next working set; pause for more recovery when needed.',
  },
  Strength: {
    Upper: 'Brisk walk 5–5.5 km/h at 4–6 %. RPE 3–4: this is active rest between heavy sets, not extra cardio.',
    Lower: 'Easy walk 4.5–5 km/h, flat to 2 %. RPE 3 (zone 1–2), so every squat and RDL is your best rep.',
  },
  Power: {
    Upper: 'Easy walk about 5 km/h at 2–4 %. RPE 3. Fast lifting needs recovery: arrive at each station fresh.',
    Lower: 'Easy walk 4.5–5 km/h, flat. RPE 2–3. Fresh legs for every fast rep matter more than the walk.',
  },
  Peak: {
    Upper: 'Brisk walk 5–5.5 km/h at 3–5 %. RPE 3–4: rest for your heaviest sets.',
    Lower: 'Easy walk 4.5–5 km/h, flat. RPE 3 (zone 1–2). The walk is your rest between your heaviest lifts.',
  },
  Deload: {
    Upper: 'Your choice: an easy jog or a comfortable incline walk. Conversational (RPE 3–4).',
    Lower: 'Comfortable walk 5–5.5 km/h with a little incline. Conversational (RPE 3).',
  },
};
const BARBELL_SETUP = ' One bar, two set-ups: keep both partners’ plates on a plate tree or the floor by the rack, set the safeties for the shorter partner, and use partner pace if plate changes run over.';

interface SessionInput {
  week: number;
  index: 1 | 2 | 3;
  focus: BodyFocus;
  style: SessionStyle;
  strength: [Spec, Spec, Spec];
  reformer: [Spec, Spec, Spec];
  core: [Spec, Spec, Spec];
  coachNote: string;
  /** Number of leading strength stations prescribed as main lifts (default 2). */
  mainLifts?: number;
}

/** Barbell stations in a session (one bar is shared, so this drives set-up time). */
export const barbellStations = (s: Pick<PartnerSession, 'stations'>) => s.stations.filter((st) => st.equipment.includes('barbell'));

function withTiming(stations: PartnerStation[], style: SessionStyle): PartnerStation[] {
  return stations.map((st) => ({ ...st, workSeconds: workWindow(st, BASE_WORK[style]) }));
}

function session(s: SessionInput): PartnerSession {
  const mainLifts = s.mainLifts ?? 2;
  const stations = withTiming([
    ...s.strength.map((spec, i) => build(s.style, spec, i < mainLifts ? 'main' : 'acc')),
    ...s.reformer.map((spec) => build(s.style, spec, 'acc')),
    ...s.core.map((spec) => build(s.style, spec, 'acc')),
  ], s.style);
  const twoBars = barbellStations({ stations }).length >= 2;
  return {
    id: `w${s.week}-s${s.index}`,
    week: s.week,
    index: s.index,
    focus: s.focus,
    style: s.style,
    title: `Week ${s.week} · ${s.focus} · ${s.style}`,
    stations,
    rounds: 2,
    workSeconds: BASE_WORK[s.style],
    transitionSeconds: TRANSITION_SECONDS,
    warmup: warmupFor(s.focus, s.style, stations),
    cooldown: cooldownFor(s.focus),
    treadmill: TREADMILL[s.style][s.focus],
    coachNote: s.coachNote + (twoBars ? BARBELL_SETUP : ''),
    estMinutes: estimateMinutes(stations, 2, TRANSITION_SECONDS),
  };
}

// ── The 24 sessions ─────────────────────────────────────────────────────────
// Odd weeks: Upper · Lower · Upper. Even weeks: Lower · Upper · Lower.
const SESSIONS: PartnerSession[] = [
  session({
    week: 1, index: 1, focus: 'Upper', style: 'Foundation',
    strength: ['dbBench', 'bbRow', 'seatedPress'],
    reformer: [['seatedRow', { springs: 'light–medium' }], ['chestPress', { springs: 'light–medium' }], ['curl', { springs: 'light' }]],
    core: [['birdDog', each(6)], ['suitcase', hold(20, true)], ['plank', hold(30)]],
    coachNote: 'A different upper mix today. Familiar movements keep their own weight history; a new movement begins with a lighter practice set. Choose the lesson effort target, log both working rounds and keep the treadmill easy enough to return steady.',
  }),
  session({
    week: 1, index: 2, focus: 'Lower', style: 'Foundation',
    strength: ['dbRdl', 'squat', 'reverseLunge'],
    reformer: [['slPress', { springs: 'medium–heavy' }], ['bridge', { springs: 'medium' }], ['scooter', { springs: 'medium' }]],
    core: [['deadBug', each(8)], ['sidePlankKnee', hold(20, true)], ['bearHold', hold(30)]],
    coachNote: 'A different lower mix today. Familiar movements keep their own weight history; a new movement begins with a lighter practice set. Choose the lesson effort target, log both working rounds and keep the treadmill easy enough to return steady.',
  }),
  session({
    week: 1, index: 3, focus: 'Upper', style: 'Foundation',
    strength: ['incline', 'bbRow', 'pushUp'],
    reformer: [['chestExp', { springs: 'light' }], ['triOverhead', { springs: 'light' }], ['sideArm', { springs: 'light' }]],
    core: [['deadBug', each(6)], ['pallof', each(6)], ['bearHold', hold(25)]],
    coachNote: 'A different upper mix today. Familiar movements keep their own weight history; a new movement begins with a lighter practice set. Choose the lesson effort target, log both working rounds and keep the treadmill easy enough to return steady.',
  }),
  session({
    week: 2, index: 1, focus: 'Lower', style: 'Foundation',
    strength: ['slRdl', 'dbSquat', 'stepUp'],
    reformer: [['footwork', { springs: 'medium–heavy' }], ['frog', { springs: 'medium' }], ['calfRaise', { springs: 'medium–heavy' }]],
    core: [['birdDog', each(6)], ['suitcase', hold(20, true)], ['reverseCrunch', reps(8)]],
    coachNote: 'A different lower mix today. Familiar movements keep their own weight history; a new movement begins with a lighter practice set. Choose the lesson effort target, log both working rounds and keep the treadmill easy enough to return steady.',
  }),
  session({
    week: 2, index: 2, focus: 'Upper', style: 'Foundation',
    strength: ['dbBench', 'csRow', 'arnold'],
    reformer: [['seatedRow', { springs: 'light–medium' }], ['hugTree', { springs: 'light' }], ['curl', { springs: 'light' }]],
    core: [['ballDeadBug', each(6)], ['sidePlankKnee', hold(20, true)], ['shoulderTap', each(6)]],
    coachNote: 'A different upper mix today. Familiar movements keep their own weight history; a new movement begins with a lighter practice set. Choose the lesson effort target, log both working rounds and keep the treadmill easy enough to return steady.',
  }),
  session({
    week: 2, index: 3, focus: 'Lower', style: 'Foundation',
    strength: ['dbRdl', 'reverseLunge', 'hipThrust'],
    reformer: [['slPress', { springs: 'medium–heavy' }], ['bridge', { springs: 'medium' }], ['sideLeg', { springs: 'medium' }]],
    core: [['ballDeadBug', each(6)], ['plank', hold(30)], ['pallof', each(6)]],
    coachNote: 'A different lower mix today. Familiar movements keep their own weight history; a new movement begins with a lighter practice set. Choose the lesson effort target, log both working rounds and keep the treadmill easy enough to return steady.',
  }),
  session({
    week: 3, index: 1, focus: 'Upper', style: 'Pump',
    strength: ['incline', 'bbRow', 'lateral'],
    reformer: [['chestPress', { springs: 'light–medium' }], ['triOverhead', { springs: 'light' }], ['sideArm', { springs: 'light' }]],
    core: [['stirPot', each(6, 'each way')], ['suitcase', hold(20, true)], ['reverseCrunch', reps(10)]],
    coachNote: 'A different upper mix today. Familiar movements keep their own weight history; a new movement begins with a lighter practice set. Choose the lesson effort target, log both working rounds and keep the treadmill easy enough to return steady.',
  }),
  session({
    week: 3, index: 2, focus: 'Lower', style: 'Pump',
    strength: ['slRdl', 'squat', 'bss'],
    reformer: [['footwork', { springs: 'medium–heavy' }], ['scooter', { springs: 'medium' }], ['calfRaise', { springs: 'medium–heavy' }]],
    core: [['sidePlank', hold(20, true)], ['reverseCrunch', reps(10)], ['shoulderTap', each(8)]],
    coachNote: 'A different lower mix today. Familiar movements keep their own weight history; a new movement begins with a lighter practice set. Choose the lesson effort target, log both working rounds and keep the treadmill easy enough to return steady.',
  }),
  session({
    week: 3, index: 3, focus: 'Upper', style: 'Pump',
    strength: ['csRow', 'pushUp', 'seatedPress'],
    reformer: [['seatedRow', { springs: 'light–medium' }], ['chestExp', { springs: 'light' }], ['curl', { springs: 'light' }]],
    core: [['birdDog', each(8)], ['pallof', each(8)], ['sidePlank', hold(20, true)]],
    coachNote: 'A different upper mix today. Familiar movements keep their own weight history; a new movement begins with a lighter practice set. Choose the lesson effort target, log both working rounds and keep the treadmill easy enough to return steady.',
  }),
  session({
    week: 4, index: 1, focus: 'Lower', style: 'Pump',
    strength: ['dbRdl', 'stepUp', 'reverseLunge'],
    reformer: [['slPress', { springs: 'medium–heavy' }], ['bridge', { springs: 'medium' }], ['frog', { springs: 'medium' }]],
    core: [['birdDog', each(8)], ['stirPot', each(6, 'each way')], ['suitcase', hold(20, true)]],
    coachNote: 'A different lower mix today. Familiar movements keep their own weight history; a new movement begins with a lighter practice set. Choose the lesson effort target, log both working rounds and keep the treadmill easy enough to return steady.',
  }),
  session({
    week: 4, index: 2, focus: 'Upper', style: 'Pump',
    strength: ['dbBench', 'bbRow', 'arnold'],
    reformer: [['hugTree', { springs: 'light' }], ['triOverhead', { springs: 'light' }], ['supineArms', { springs: 'light–medium' }]],
    core: [['ballDeadBug', each(8)], ['shoulderTap', each(8)], ['plank', hold(40)]],
    coachNote: 'A different upper mix today. Familiar movements keep their own weight history; a new movement begins with a lighter practice set. Choose the lesson effort target, log both working rounds and keep the treadmill easy enough to return steady.',
  }),
  session({
    week: 4, index: 3, focus: 'Lower', style: 'Pump',
    strength: ['slRdl', 'dbSquat', 'hipThrust'],
    reformer: [['footwork', { springs: 'medium–heavy' }], ['scooter', { springs: 'medium' }], ['sideLeg', { springs: 'medium' }]],
    core: [['kneeTuck', reps(8)], ['pallof', each(8)], ['bearHold', hold(35)]],
    coachNote: 'A different lower mix today. Familiar movements keep their own weight history; a new movement begins with a lighter practice set. Choose the lesson effort target, log both working rounds and keep the treadmill easy enough to return steady.',
  }),
  session({
    week: 5, index: 1, focus: 'Upper', style: 'Strength',
    strength: ['bbBench', 'csRow', 'seatedPress'],
    reformer: [['seatedRow', { springs: 'light–medium' }], ['chestPress', { springs: 'light–medium' }], ['sideArm', { springs: 'light' }]],
    core: [['renegade', each(6)], ['hollow', hold(25)], ['suitcase', hold(20, true)]],
    coachNote: 'A different upper mix today. Familiar movements keep their own weight history; a new movement begins with a lighter practice set. Choose the lesson effort target, log both working rounds and keep the treadmill easy enough to return steady.',
  }),
  session({
    week: 5, index: 2, focus: 'Lower', style: 'Strength',
    strength: ['rdl', 'squat', 'bss'],
    reformer: [['slPress', { springs: 'medium–heavy' }], ['frog', { springs: 'medium' }], ['calfRaise', { springs: 'medium–heavy' }]],
    core: [['sidePlankLift', each(8)], ['dbDeadBug', each(6)], ['sidePlankKnee', hold(20, true)]],
    coachNote: 'A different lower mix today. Familiar movements keep their own weight history; a new movement begins with a lighter practice set. Choose the lesson effort target, log both working rounds and keep the treadmill easy enough to return steady.',
  }),
  session({
    week: 5, index: 3, focus: 'Upper', style: 'Strength',
    strength: ['bbRow', 'lateral', 'pushUp'],
    reformer: [['hugTree', { springs: 'light' }], ['curl', { springs: 'light' }], ['supineArms', { springs: 'light–medium' }]],
    core: [['stirPot', each(8, 'each way')], ['pallof', each(6)], ['reverseCrunch', reps(12)]],
    coachNote: 'A different upper mix today. Familiar movements keep their own weight history; a new movement begins with a lighter practice set. Choose the lesson effort target, log both working rounds and keep the treadmill easy enough to return steady.',
  }),
  session({
    week: 6, index: 1, focus: 'Lower', style: 'Power',
    strength: [['swing', opener(10)], 'dbSquat', 'dbRdl'],
    reformer: [['footwork', { springs: 'medium–heavy' }], ['bridge', { springs: 'medium' }], ['sideLeg', { springs: 'medium' }]],
    core: [['stirPot', each(6, 'each way')], ['copenhagen', hold(15, true)], ['hollow', hold(20)]],
    mainLifts: 3,
    coachNote: 'A different lower mix today. Familiar movements keep their own weight history; a new movement begins with a lighter practice set. Choose the lesson effort target, log both working rounds and keep the treadmill easy enough to return steady. Keep the opening power reps crisp; stop when speed drops. Reformer work stays controlled, never rushed.',
  }),
  session({
    week: 6, index: 2, focus: 'Upper', style: 'Power',
    strength: [['pushPress', opener(6)], 'csRow', 'dbBench'],
    reformer: [['seatedRow', { springs: 'light–medium' }], ['chestExp', { springs: 'light' }], ['triOverhead', { springs: 'light' }]],
    core: [['bearHold', hold(30)], ['sidePlankLift', each(6)], ['dbDeadBug', each(6)]],
    mainLifts: 3,
    coachNote: 'A different upper mix today. Familiar movements keep their own weight history; a new movement begins with a lighter practice set. Choose the lesson effort target, log both working rounds and keep the treadmill easy enough to return steady. Keep the opening power reps crisp; stop when speed drops. Reformer work stays controlled, never rushed.',
  }),
  session({
    week: 6, index: 3, focus: 'Lower', style: 'Power',
    strength: [['squatJump', opener(5)], 'squat', 'slRdl'],
    reformer: [['slPress', { springs: 'medium–heavy' }], ['scooter', { springs: 'medium' }], ['calfRaise', { springs: 'medium–heavy' }]],
    core: [['ballDeadBug', each(8)], ['shoulderTap', each(8)], ['suitcase', hold(20, true)]],
    mainLifts: 3,
    coachNote: 'A different lower mix today. Familiar movements keep their own weight history; a new movement begins with a lighter practice set. Choose the lesson effort target, log both working rounds and keep the treadmill easy enough to return steady. Keep the opening power reps crisp; stop when speed drops. Reformer work stays controlled, never rushed.',
  }),
  session({
    week: 7, index: 1, focus: 'Upper', style: 'Peak',
    strength: ['bbBench', 'bbRow', 'lateral'],
    reformer: [['chestPress', { springs: 'light–medium' }], ['hugTree', { springs: 'light' }], ['sideArm', { springs: 'light' }]],
    core: [['renegade', each(8)], ['plank', hold(45)], ['pallof', each(8)]],
    coachNote: 'A different upper mix today. Familiar movements keep their own weight history; a new movement begins with a lighter practice set. Choose the lesson effort target, log both working rounds and keep the treadmill easy enough to return steady.',
  }),
  session({
    week: 7, index: 2, focus: 'Lower', style: 'Peak',
    strength: ['rdl', 'stepUp', 'hipThrust'],
    reformer: [['footwork', { springs: 'medium–heavy' }], ['bridge', { springs: 'medium' }], ['frog', { springs: 'medium' }]],
    core: [['pike', reps(6)], ['copenhagen', hold(15, true)], ['dbDeadBug', each(8)]],
    coachNote: 'A different lower mix today. Familiar movements keep their own weight history; a new movement begins with a lighter practice set. Choose the lesson effort target, log both working rounds and keep the treadmill easy enough to return steady.',
  }),
  session({
    week: 7, index: 3, focus: 'Upper', style: 'Peak',
    strength: ['incline', 'csRow', 'arnold'],
    reformer: [['seatedRow', { springs: 'light–medium' }], ['triOverhead', { springs: 'light' }], ['supineArms', { springs: 'light–medium' }]],
    core: [['stirPot', each(8, 'each way')], ['hollow', hold(30)], ['shoulderTap', each(8)]],
    coachNote: 'A different upper mix today. Familiar movements keep their own weight history; a new movement begins with a lighter practice set. Choose the lesson effort target, log both working rounds and keep the treadmill easy enough to return steady.',
  }),
  session({
    week: 8, index: 1, focus: 'Lower', style: 'Deload',
    strength: ['slRdl', 'dbSquat', 'reverseLunge'],
    reformer: [['slPress', { springs: 'medium–heavy' }], ['scooter', { springs: 'medium' }], ['sideLeg', { springs: 'medium' }]],
    core: [['deadBug', each(6)], ['sidePlank', hold(20, true)], ['birdDog', each(6)]],
    coachNote: 'A different lower mix today. Familiar movements keep their own weight history; a new movement begins with a lighter practice set. Choose the lesson effort target, log both working rounds and keep the treadmill easy enough to return steady. This is a recovery session: lighter loads and 3–4 good reps left, rather than a maximum test.',
  }),
  session({
    week: 8, index: 2, focus: 'Upper', style: 'Deload',
    strength: ['dbBench', 'csRow', 'seatedPress'],
    reformer: [['chestExp', { springs: 'light' }], ['chestPress', { springs: 'light–medium' }], ['curl', { springs: 'light' }]],
    core: [['birdDog', each(6)], ['deadBug', each(6)], ['sidePlankKnee', hold(20, true)]],
    coachNote: 'A different upper mix today. Familiar movements keep their own weight history; a new movement begins with a lighter practice set. Choose the lesson effort target, log both working rounds and keep the treadmill easy enough to return steady. This is a recovery session: lighter loads and 3–4 good reps left, rather than a maximum test.',
  }),
  session({
    week: 8, index: 3, focus: 'Lower', style: 'Deload',
    strength: ['dbRdl', 'squat', 'stepUp'],
    reformer: [['footwork', { springs: 'medium–heavy' }], ['bridge', { springs: 'medium' }], ['calfRaise', { springs: 'medium–heavy' }]],
    core: [['ballDeadBug', each(6)], ['sidePlankKnee', hold(20, true)], ['plank', hold(25)]],
    coachNote: 'A different lower mix today. Familiar movements keep their own weight history; a new movement begins with a lighter practice set. Choose the lesson effort target, log both working rounds and keep the treadmill easy enough to return steady. This is a recovery session: lighter loads and 3–4 good reps left, rather than a maximum test.',
  }),
];

export const PARTNER_PROGRAM: PartnerProgram = {
  id: 'partner-strength-8wk',
  name: 'Partner Strength Series · 8 weeks',
  summary:
    'An 8-week, class-style partner series for two people, one treadmill and a home gym. Each session has 9 stations (3 strength, 3 reformer, 3 core) done for 2 rounds. One partner works a station while the other walks the treadmill, then you swap: 36 turns in about 45–50 minutes. Weeks alternate Upper-Lower-Upper and Lower-Upper-Lower, giving 12 upper and 12 lower sessions, so each half of the body is trained 3 times a fortnight. Loads are set by reps in reserve and logged, so each session builds on the last. The two working rounds provide modest muscle-building volume, with chest, back, shoulder and arm work across the upper rotation, and a loaded hinge in every lower lesson. Calf work returns across the lower rotation. Every lesson has a different strength, reformer and core combination; exercises return later for progression. Volume varies by muscle and week; reformer sets are accessory estimates, not guaranteed equivalents to hard weight-training sets. An optional third strength round adds one set per strength exercise, not a universal ten-set target. Choose loads that leave the prescribed good reps possible, keep the walk easy, and allow recovery, food and sleep to support your training.',
  equipment: ['Squat rack with safety arms or straps', '20 kg barbell + plates and collars', 'Dumbbells 4–25 kg', 'Adjustable bench (incline helps; flat works with the swaps)', 'Yoga ball', 'Reformer (long box optional)', 'Treadmill with a safety key'],
  safety: [
    'The barbell bench press and back squat need the rack’s safety arms or straps set for each partner, because your spotter is on the treadmill. No safeties? The app swaps them for dumbbell versions.',
    'The rows, RDLs, hip thrusts, overhead and dumbbell presses need no spotter: lower the weight to the floor or your chest and step away.',
    SWAP_SAFETY,
    'Standing reformer work: step on and off only with the carriage home and still, in bare feet or grip socks.',
  ],
  phases: [
    { name: 'Foundation', weeks: [1, 2], goal: 'Learn the stations, groove technique and find your starting weights.', reps: '10–12 (unilateral 6–8 each side)', rir: '3', notes: 'Lower for 3 s on the main lifts. Log every weight. When every set reaches the top of the range with 3 left, add the next small step. Core: exhale on effort and choose the swap if you see doming along your midline.' },
    { name: 'Pump', weeks: [3, 4], goal: 'Build muscle with more reps and sets closer to failure.', reps: '10–12 main lifts · 12–15 accessories', rir: '2 (accessories 1–2)', notes: 'Familiar presses, rows, squats and hinges return among different combinations. Double progression: add reps until you reach the top of the range, then add load. A drop set on round 2 of the first station is an optional time-saver. Core: choose the swap if your midline domes.' },
    { name: 'Strength', weeks: [5], goal: 'Heavier compound lifts for fewer reps.', reps: '6–8', rir: '2', notes: 'The barbell bench and RDL join, so set the safeties. Keep the treadmill easy: it is active rest. At 25 kg dumbbells, progress with slower lowering, pauses or a barbell version. Core: choose the swap if your midline domes.' },
    { name: 'Power', weeks: [6], goal: 'A second strength week, lifted fast, behind a power opener.', reps: 'Opener 5–10 · main lifts 6–8, fast', rir: '2 (opener 4–5, stop when the speed drops)', notes: 'Use the last log for the same movement; unfamiliar variants begin lighter. Each session opens with swings, jumps or a push press while you are fresh; end that set when it slows. A no-jump swap is always fine. Core: choose the swap if your midline domes.' },
    { name: 'Peak', weeks: [7], goal: 'Your heaviest clean sets of the series.', reps: '5–6 main lifts · 6–8 accessories', rir: '1–2', notes: 'No max tests: heavy top sets with 1–2 in reserve, with the safeties set every time. Core: choose the swap if your midline domes.' },
    { name: 'Deload', weeks: [8], goal: 'Recover, consolidate and see your progress.', reps: '8–10', rir: '3–4', notes: 'About 70–80 % of your Week 7 loads. Keep the varied combinations easy; compare recorded loads only for the same movement.' },
  ],
  sessions: SESSIONS,
  evidence: [
    'ACSM Position Stand, resistance training for healthy adults (Med Sci Sports Exerc, 2026) advises training each muscle at least twice a week; here each half of the body is trained 3 times a fortnight, and Pelland 2026 finds frequency matters little for growth once weekly sets match.',
    'Pelland et al. 2026, Sports Med: fractional weekly sets predict muscle growth best, returns diminish as volume rises, and frequency adds little for growth once weekly sets are matched.',
    'Schoenfeld, Ogborn & Krieger 2017, J Sports Sci: more weekly sets build more muscle. Weekly volume has a dose-response relationship with muscle growth, with individual variation. This series offers modest, muscle-specific volume; an extra strength round adds one working set per strength exercise.',
    'Iversen et al. 2021, Sports Med (“No time to lift?”): 4 or more weekly sets per muscle at 6–15RM builds strength and muscle, and circuits and supersets cut session time.',
    'Robinson et al. 2024, Sports Med, and Refalo et al. 2024, J Sports Sci: sets that end closer to failure build slightly more muscle, and 1–2 reps in reserve works about as well as failure.',
    'Zourdos, Helms et al. 2016, J Strength Cond Res: the reps-in-reserve scale lets you set load by how you feel on the day.',
    'Singer et al. 2024, Front Sports Act Living: rest over 60 s slightly favours growth, with little extra beyond about 90 s. The partner turn separates consecutive stations; the same exercise repeats after the full circuit. Active walking is not equivalent to passive rest, so allow more recovery when needed.',
    'Schumann et al. 2022, Sports Med: aerobic work alongside lifting does not blunt muscle growth or maximal strength. Only explosive strength is slightly blunted in the same session, so treadmill turns stay easy in power and heavy weeks.',
    'Bell et al. 2023 (Delphi consensus) and Coleman et al. 2024, PeerJ: a deload cuts volume and effort for a week. Expect recovery, not extra growth.',
    'Plotkin et al. 2023: hip thrusts and squats grow the glutes about equally. Kubo et al. 2019: deeper squats grow the glutes and adductors more.',
    'Reformer Pilates: limited trial evidence (small 8-week studies in women) shows strength and endurance gains compared with no exercise, but not over weight training. Here it counts as half-sets of accessory volume.',
    'Diastasis recti: Gluppe, Engh & Bø 2021 (Braz J Phys Ther) and later reviews find weak evidence for any single ab programme. Graded core loading with breath control and easy swaps is a reasonable approach.',
    'Format: publicly described group-training formats (strength, pump and power days in 8–10 week blocks, numbered station grids). Used as format inspiration only.',
  ],
};

export function getPartnerSession(id: string): PartnerSession | undefined {
  return PARTNER_PROGRAM.sessions.find((s) => s.id === id);
}

export function getPartnerSessionsForWeek(week: number): PartnerSession[] {
  return PARTNER_PROGRAM.sessions.filter((s) => s.week === week);
}

// ── Kit adaptation ──────────────────────────────────────────────────────────
export interface PartnerKit {
  /** Does the rack have safety arms or straps? `false` swaps the rack lifts for dumbbells. */
  safeties?: boolean | null;
}

/** Rack lifts that need safeties when the spotter is on the treadmill → dumbbell swap. */
const NO_SAFETY_SWAP: Partial<Record<string, Key>> = {
  'barbell-back-squat': 'dbSquat',
  'barbell-bench-press': 'dbBench',
};

/**
 * The session as it should be trained with this kit. Without rack safeties the
 * back squat and barbell bench become dumbbell lifts, kept at 3+ reps in reserve.
 */
export function adaptForKit(session: PartnerSession, kit: PartnerKit = {}): PartnerSession {
  if (kit.safeties !== false || !session.stations.some((st) => NO_SAFETY_SWAP[st.id])) return session;
  const stations = withTiming(session.stations.map((st) => {
    const key = NO_SAFETY_SWAP[st.id];
    if (!key) return st;
    const rir = rirMin(st.rir) >= 3 ? st.rir : '3';
    // Bench keeps its reps; the goblet squat tops out sooner, so it takes accessory reps.
    if (key === 'dbSquat') return build(session.style, [key, { rir }], 'acc');
    return build(session.style, [key, { reps: st.reps, repRange: st.repRange, tempo: st.tempo, rir }], 'main');
  }), session.style);
  return {
    ...session,
    stations,
    warmup: warmupFor(session.focus, session.style, stations),
    estMinutes: estimateMinutes(stations, session.rounds, session.transitionSeconds),
  };
}

/**
 * Fractional sets per muscle across the given sessions (per partner).
 * Strength: prime mover (first muscle) = 1 per round, others = ½. Reformer: half of that.
 * Core stations are left out of limb volume.
 */
export function fractionalSetsPerMuscle(sessions: PartnerSession[]): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const s of sessions) {
    for (const st of s.stations) {
      if (st.block === 'Core') continue;
      const scale = st.block === 'Reformer' ? 0.5 : 1;
      st.muscles.forEach((m, i) => {
        totals[m] = (totals[m] ?? 0) + s.rounds * scale * (i === 0 ? 1 : 0.5);
      });
    }
  }
  return totals;
}
