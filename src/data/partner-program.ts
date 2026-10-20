/**
 * Partner class-style series — 8 weeks, 24 sessions, two partners and one treadmill.
 *
 * Every session is 9 stations (3 Strength, 3 Reformer, 3 Core) done for 2 rounds.
 * Turn order: for each round, for each station, partner A works the station while
 * partner B walks the treadmill, then they swap — 9 × 2 × 2 = 36 turns.
 *
 * Weeks alternate Upper-Lower-Upper (odd) and Lower-Upper-Lower (even), so the
 * series has 12 upper and 12 lower sessions and each half of the body is trained
 * 3 times a fortnight. Main lifts stay the same within each 2-week block so the
 * saved weights can progress; accessories rotate so it stays fresh.
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
  tempo?: string;
  rir?: string;
  load: string;
  equipment: Array<'barbell' | 'rack' | 'dumbbell' | 'bench' | 'reformer' | 'yoga-ball' | 'bodyweight' | 'treadmill'>;
  cue: string;
  muscles: string[];
  imageKey?: string;
  alt?: string;
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
  workSeconds: number;
  transitionSeconds: number;
  warmup: string[];
  cooldown: string[];
  treadmill: string;
  coachNote: string;
  estMinutes: number;
}
export interface PartnerPhase { name: string; weeks: number[]; goal: string; reps: string; rir: string; notes: string }
export interface PartnerProgram { id: 'partner-bft-8wk'; name: string; summary: string; equipment: string[]; phases: PartnerPhase[]; sessions: PartnerSession[]; evidence: string[] }

/** 9 stations × 2 partners × 2 rounds. */
export const PARTNER_TURNS = 36;

type Equipment = PartnerStation['equipment'][number];
type Springs = 'light' | 'light–medium' | 'medium' | 'medium–heavy' | 'heavy';
type StationBase = Omit<PartnerStation, 'reps' | 'repRange' | 'rir' | 'tempo' | 'load'> & {
  /** How load is described: barbell/dumbbell text changes by phase; anything else is fixed. */
  kit: 'barbell' | 'dumbbell' | 'reformer' | 'fixed';
  fixedLoad?: string;
};
interface Rx { reps: string; repRange?: [number, number]; rir?: string; tempo?: string; load?: string; springs?: Springs }

// ── Timing ──────────────────────────────────────────────────────────────────
// Class-timer mode: each turn is workSeconds, then transitionSeconds to swap.
// The worker rests on the treadmill for the partner's turn (~80 s incl. swaps).
const TIMING: Record<SessionStyle, { work: number; transition: number }> = {
  Foundation: { work: 50, transition: 15 },
  Pump: { work: 50, transition: 15 },
  Strength: { work: 50, transition: 15 },
  Power: { work: 45, transition: 15 },
  Peak: { work: 50, transition: 15 },
  Deload: { work: 45, transition: 15 },
};
const WARMUP_MIN = 4.5;
const COOLDOWN_MIN = 2.5;

// ── Load guidance (prescribed by reps in reserve; kg are starting suggestions) ─
const BARBELL_LOAD: Record<SessionStyle, string> = {
  Foundation: 'Barbell: a weight you could lift 13–15 times (often the 20 kg bar + 2.5–10 kg a side). Log the total including the bar.',
  Pump: 'Barbell: start at your Week 2 weight; add 2.5–5 kg once every set reaches the top of the range with 2 left.',
  Strength: 'Barbell: a weight you could lift 8–10 times, usually Week 4 + 5–10 kg. Stop with 2 left.',
  Power: 'Barbell: about 10 % lighter than Week 5. Lift every rep fast; end the set before reps slow down.',
  Peak: 'Barbell: your heaviest clean 5–6 with 1–2 left, usually Week 5 + 2.5–5 kg. No grinding.',
  Deload: 'Barbell: about 70–80 % of your Week 7 weight. Crisp reps, 3–4 left.',
};
const DUMBBELL_LOAD: Record<SessionStyle, string> = {
  Foundation: 'Dumbbells (kg per hand): a weight you could lift 13–15 times. Log it.',
  Pump: 'Dumbbells: start at your Week 2 weight; go up 1–2 kg per hand once you hit the top of the range with 2 left.',
  Strength: 'Dumbbells: a weight you could lift 8–10 times. At 25 kg with 3+ left, lower for 4 s or add a 2-s pause instead.',
  Power: 'Dumbbells: moderate, about your Week 4 weight, moved fast.',
  Peak: 'Dumbbells: heaviest clean set with 1–2 left. Topped out at 25 kg? Add a 2-s pause or a 4-s lowering.',
  Deload: 'Dumbbells: about 70–80 % of your Week 7 weight.',
};
const springs = (level: Springs) => `Springs: ${level}. Brands differ, so log your setting.`;

// ── Station library ─────────────────────────────────────────────────────────
const base = (b: StationBase) => b;
const strength = (b: Omit<StationBase, 'block'>) => base({ ...b, block: 'Strength' });
const reformer = (b: Omit<StationBase, 'block' | 'kit' | 'equipment'>) => base({ ...b, block: 'Reformer', kit: 'reformer', equipment: ['reformer'] });
const core = (b: Omit<StationBase, 'block' | 'kit'> & { fixedLoad: string }) => base({ ...b, block: 'Core', kit: 'fixed' });
const eq = (...e: Equipment[]) => e;

const L = {
  // Lower strength
  squat: strength({ id: 'barbell-back-squat', name: 'Barbell Squat', shortLabel: 'BACK SQUAT', kit: 'barbell', equipment: eq('barbell', 'rack'), muscles: ['quads', 'glutes', 'adductors', 'core'], cue: 'Back squat with the safeties just below your lowest point. Brace, sit down between your hips with knees over toes, then drive the floor away.', alt: 'Goblet squat with one heavy dumbbell (heels on a small plate if your ankles are tight)' }),
  rdl: strength({ id: 'barbell-rdl', name: 'Barbell Romanian Deadlift', shortLabel: 'BARBELL RDL', kit: 'barbell', equipment: eq('barbell'), muscles: ['hamstrings', 'glutes', 'lower back'], imageKey: 'romanian-deadlift', cue: 'Soft knees, push your hips back and slide the bar down your thighs. Stop when your back wants to round, then squeeze your glutes to stand.', alt: 'Dumbbell Romanian deadlift' }),
  hipThrust: strength({ id: 'barbell-hip-thrust', name: 'Barbell Hip Thrust', shortLabel: 'HIP THRUST', kit: 'barbell', equipment: eq('barbell', 'bench'), muscles: ['glutes', 'hamstrings'], imageKey: 'hip-thrust', cue: 'Bench just under your shoulder blades, padded bar in your hip crease. Chin tucked, ribs down, drive through your heels to a flat-top finish with no arching.', alt: 'Dumbbell hip thrust or single-leg glute bridge' }),
  reverseLunge: strength({ id: 'db-reverse-lunge', name: 'Reverse Lunge', shortLabel: 'REVERSE LUNGE', kit: 'dumbbell', equipment: eq('dumbbell'), perSide: true, muscles: ['glutes', 'quads', 'adductors'], cue: 'Step back long, drop the back knee straight down and push up through the front heel. Torso tall.', alt: 'Split squat holding the rack for balance' }),
  stepUp: strength({ id: 'db-step-up', name: 'Dumbbell Step-Up', shortLabel: 'STEP-UP', kit: 'dumbbell', equipment: eq('dumbbell', 'bench'), perSide: true, muscles: ['glutes', 'quads'], imageKey: 'step-up', cue: 'Whole foot on the bench, lean slightly forward and drive up through that heel. No push-off from the back foot.', alt: 'Step-up onto a lower step, bodyweight' }),
  bss: strength({ id: 'db-bulgarian-split-squat', name: 'Dumbbell Bulgarian Split Squat', shortLabel: 'BULGARIAN SPLIT SQUAT', kit: 'dumbbell', equipment: eq('dumbbell', 'bench'), perSide: true, muscles: ['quads', 'glutes', 'adductors'], imageKey: 'bulgarian-split-squat', cue: 'Back foot laces-down on the bench, front foot far enough forward to drop straight down. A slight forward lean puts more into the glutes.', alt: 'Split squat with the back foot on the floor' }),
  slRdl: strength({ id: 'db-single-leg-rdl', name: 'Single-Leg Romanian Deadlift', shortLabel: 'SINGLE-LEG RDL', kit: 'dumbbell', equipment: eq('dumbbell'), perSide: true, muscles: ['hamstrings', 'glutes'], imageKey: 'single-leg-deadlift', cue: 'Dumbbell in the opposite hand, hips square to the floor, reach the free leg back as you hinge. Touch the rack lightly if balance wobbles.', alt: 'Kickstand RDL (back toe lightly down)' }),
  dbRdl: strength({ id: 'db-rdl', name: 'Dumbbell Romanian Deadlift', shortLabel: 'DUMBBELL RDL', kit: 'dumbbell', equipment: eq('dumbbell'), muscles: ['hamstrings', 'glutes', 'lower back'], imageKey: 'romanian-deadlift', cue: 'Dumbbells close to your legs, hips back, long spine. Feel the hamstring stretch, then squeeze up.', alt: 'Barbell Romanian deadlift' }),
  swing: strength({ id: 'db-swing', name: 'Dumbbell Swing', shortLabel: 'DB SWING', kit: 'fixed', fixedLoad: 'One dumbbell held by the head, about 8–16 kg to start.', equipment: eq('dumbbell'), muscles: ['glutes', 'hamstrings', 'lower back'], cue: 'Hike the dumbbell back between your thighs, then snap your hips forward so it floats to chest height. Arms only guide it.', alt: 'Fast-up hip thrust or glute bridge' }),
  squatJump: strength({ id: 'squat-jump', name: 'Squat Jump', shortLabel: 'SQUAT JUMP', kit: 'fixed', fixedLoad: 'Bodyweight.', equipment: eq('bodyweight'), muscles: ['quads', 'glutes', 'calves'], cue: 'Quarter-to-half squat, jump tall, land softly through the whole foot and reset before the next rep.', alt: 'Speed squat to calf raise: fast up, no jump (pelvic-floor friendly)' }),
  // Upper strength
  dbBench: strength({ id: 'db-bench-press', name: 'Dumbbell Bench Press', shortLabel: 'DB BENCH PRESS', kit: 'dumbbell', equipment: eq('dumbbell', 'bench'), muscles: ['chest', 'triceps', 'shoulders'], imageKey: 'bench-press', cue: 'Feet planted, shoulder blades tucked. Lower until your elbows are just below the bench, then press up and slightly in.', alt: 'Push-up with hands on the bench' }),
  bbBench: strength({ id: 'barbell-bench-press', name: 'Barbell Bench Press', shortLabel: 'BENCH PRESS', kit: 'barbell', equipment: eq('barbell', 'rack', 'bench'), muscles: ['chest', 'triceps', 'shoulders'], imageKey: 'bench-press', cue: 'Bench in the rack with safeties just below chest height. Grip just outside shoulders, lower to mid-chest, press back up over your shoulders.', alt: 'Dumbbell bench press' }),
  bbRow: strength({ id: 'barbell-bent-over-row', name: 'Barbell Bent-Over Row', shortLabel: 'BENT-OVER ROW', kit: 'barbell', equipment: eq('barbell'), muscles: ['back', 'biceps', 'shoulders', 'lower back'], imageKey: 'bent-over-row', cue: 'Hinge to about 45° with the bar under your shoulders. Pull to your lower ribs, squeeze your shoulder blades, lower under control.', alt: 'Chest-supported dumbbell row (kinder on a tired lower back)' }),
  csRow: strength({ id: 'chest-supported-db-row', name: 'Chest-Supported Row', shortLabel: 'CHEST-SUPPORTED ROW', kit: 'dumbbell', equipment: eq('dumbbell', 'bench'), muscles: ['back', 'shoulders', 'biceps'], imageKey: 'chest-supported-row', cue: 'Chest on an incline bench, arms long. Row your elbows towards your hips and pause a beat at the top.', alt: 'Single-arm dumbbell row on a flat bench' }),
  seatedPress: strength({ id: 'seated-db-shoulder-press', name: 'Seated Dumbbell Shoulder Press', shortLabel: 'SEATED DB PRESS', kit: 'dumbbell', equipment: eq('dumbbell', 'bench'), muscles: ['shoulders', 'triceps'], imageKey: 'overhead-press', cue: 'Bench upright, ribs down. Press up and slightly in until your biceps are by your ears; lower to chin height.', alt: 'Half-kneeling single-arm press' }),
  arnold: strength({ id: 'arnold-press', name: 'Arnold Press', shortLabel: 'ARNOLD PRESS', kit: 'dumbbell', equipment: eq('dumbbell', 'bench'), muscles: ['shoulders', 'triceps'], imageKey: 'arnold-press', cue: 'Start palms facing you at chin height and rotate as you press, so palms face forward at the top. Smooth, no leaning back.', alt: 'Seated dumbbell shoulder press' }),
  hkPress: strength({ id: 'half-kneeling-db-press', name: 'Half-Kneeling Single-Arm Press', shortLabel: 'HALF-KNEEL PRESS', kit: 'dumbbell', equipment: eq('dumbbell'), perSide: true, muscles: ['shoulders', 'triceps', 'core'], cue: 'Down knee on the same side as the dumbbell. Squeeze that glute and press straight up without leaning away.', alt: 'Seated dumbbell shoulder press' }),
  incline: strength({ id: 'incline-db-press', name: 'Incline Dumbbell Bench Press', shortLabel: 'INCLINE DB PRESS', kit: 'dumbbell', equipment: eq('dumbbell', 'bench'), muscles: ['chest', 'shoulders', 'triceps'], imageKey: 'incline-dumbbell-press', cue: 'Bench at 30–45°. Lower the dumbbells to upper-chest level with elbows about 45° from your body, then press up.', alt: 'Flat dumbbell press if your bench does not incline' }),
  lateral: strength({ id: 'db-lateral-raise', name: 'Lateral Raise', shortLabel: 'LATERAL RAISE', kit: 'fixed', fixedLoad: 'Light dumbbells, about 4–8 kg. Add reps before weight.', equipment: eq('dumbbell'), muscles: ['shoulders'], cue: 'Soft elbows, lead with the elbows out to shoulder height, then lower for 2 s. No shrugging.', alt: 'Seated lateral raise with lighter dumbbells' }),
  pushUp: strength({ id: 'push-up', name: 'Push-Up', shortLabel: 'PUSH-UP', kit: 'fixed', fixedLoad: 'Bodyweight. Hands on the bench or rack bar to make it work for you.', equipment: eq('bodyweight'), muscles: ['chest', 'triceps', 'shoulders', 'core'], imageKey: 'push-up', cue: 'Hands just outside shoulders, body in one long line. Lower your chest to fist height, then push the floor away.', alt: 'Incline push-up on the bench or rack bar' }),
  bbOhp: strength({ id: 'barbell-overhead-press', name: 'Barbell Overhead Press', shortLabel: 'OVERHEAD PRESS', kit: 'barbell', equipment: eq('barbell', 'rack'), muscles: ['shoulders', 'triceps', 'core'], imageKey: 'overhead-press', cue: 'Unrack at collarbone height and squeeze your glutes. Press the bar up and bring your head through at the top. No leaning back.', alt: 'Seated dumbbell shoulder press' }),
  pushPress: strength({ id: 'db-push-press', name: 'Dumbbell Push Press', shortLabel: 'DB PUSH PRESS', kit: 'dumbbell', equipment: eq('dumbbell'), muscles: ['shoulders', 'triceps', 'quads'], cue: 'Short dip at the knees, drive up through your legs and punch the dumbbells overhead. Lower under control to your shoulders.', alt: 'Seated dumbbell press, as fast as you can lift it' }),

  // Lower reformer
  footwork: reformer({ id: 'reformer-footwork', name: 'Reformer Footwork', shortLabel: 'FOOTWORK', muscles: ['quads', 'glutes', 'calves'], imageKey: 'leg-press', cue: 'Neutral pelvis. Press out to long legs without locking your knees, then resist the carriage home for 2–3 s.', alt: 'Wall sit or goblet squat' }),
  slPress: reformer({ id: 'reformer-single-leg-press', name: 'Reformer Single-Leg Press', shortLabel: 'SINGLE-LEG PRESS', perSide: true, muscles: ['quads', 'glutes'], imageKey: 'leg-press', cue: 'One foot centred on the bar, the other knee in tabletop. Keep the pelvis level as you press, and return slowly.', alt: 'Single-leg glute bridge' }),
  bridge: reformer({ id: 'reformer-bridge', name: 'Reformer Bridge', shortLabel: 'REFORMER BRIDGE', muscles: ['hamstrings', 'glutes'], imageKey: 'bridge', cue: 'Feet on the bar, peel up into a bridge, then press the carriage out and in with your hips high. Hamstrings do the work.', alt: 'Yoga-ball hamstring curl' }),
  hamCurl: reformer({ id: 'reformer-hamstring-curl', name: 'Reformer Hamstring Curl', shortLabel: 'HAMSTRING CURL', muscles: ['hamstrings', 'glutes'], cue: 'Feet in the straps, legs long at about 45°. Pull your heels towards your seat without lifting your pelvis, then return slowly.', alt: 'Yoga-ball hamstring curl' }),
  sideLeg: reformer({ id: 'reformer-side-lying-press', name: 'Reformer Side-Lying Leg Press', shortLabel: 'SIDE-LYING PRESS', perSide: true, muscles: ['glutes', 'quads'], cue: 'Lie on your side with the bottom foot on the bar. Press out with hips stacked and your waist lifted off the carriage.', alt: 'Side-lying leg lift' }),
  standingLunge: reformer({ id: 'reformer-standing-lunge', name: 'Reformer Standing Lunge', shortLabel: 'STANDING LUNGE', perSide: true, muscles: ['glutes', 'quads', 'adductors'], cue: 'Front foot on the platform, back foot against the shoulder rest. Slide the carriage back as you bend the front knee, then draw it home with the front leg. Hold the frame.', alt: 'Reverse lunge, bodyweight' }),
  scooter: reformer({ id: 'reformer-scooter', name: 'Reformer Scooter', shortLabel: 'SCOOTER', perSide: true, muscles: ['glutes', 'hamstrings'], cue: 'Hands on the bar, standing foot on the platform, other foot on the shoulder rest. Push the carriage back through your heel, glute on, spine still.', alt: 'Donkey kick' }),
  sideSplits: reformer({ id: 'reformer-side-splits', name: 'Reformer Side Splits', shortLabel: 'SIDE SPLITS', muscles: ['adductors', 'glutes'], cue: 'Stand astride the platform and carriage with soft knees. Open the carriage out with control, then squeeze your inner thighs to close it.', alt: 'Sumo squat with a dumbbell' }),
  skater: reformer({ id: 'reformer-skater', name: 'Reformer Skater', shortLabel: 'SKATER', perSide: true, muscles: ['glutes', 'adductors', 'quads'], cue: 'Stand side-on with the inside foot on the carriage. Sit into the standing hip as you push the carriage out sideways, then draw it back.', alt: 'Lateral lunge' }),
  // Upper reformer
  seatedRow: reformer({ id: 'reformer-seated-row', name: 'Reformer Seated Row', shortLabel: 'SEATED ROW', muscles: ['back', 'biceps', 'shoulders'], cue: 'Sit tall facing the straps, arms long. Draw your elbows back past your ribs with shoulders down, then return slowly.', alt: 'Light dumbbell bent-over row' }),
  latPull: reformer({ id: 'reformer-kneeling-lat-pull', name: 'Reformer Kneeling Lat Pull-Down', shortLabel: 'LAT PULL-DOWN', muscles: ['back', 'triceps'], imageKey: 'lat-pulldown', cue: 'Kneel facing the pulleys with arms reaching up and forward. Pull the straps down to your sides, ribs knitted, no arching.', alt: 'Dumbbell pullover on the bench' }),
  longBox: reformer({ id: 'reformer-long-box-pull', name: 'Reformer Long Box Pull', shortLabel: 'LONG BOX PULL', muscles: ['back', 'shoulders', 'triceps'], cue: 'Lie face down on the long box, chest just past the edge. Pull the straps back alongside your body as your chest lifts a little; return slowly.', alt: 'Chest-supported dumbbell row' }),
  tPull: reformer({ id: 'reformer-long-box-t-pull', name: 'Reformer Long Box T-Pull', shortLabel: 'T-PULL', muscles: ['shoulders', 'back'], cue: 'Face down on the long box with arms hanging. Open the straps out wide into a T and squeeze between your shoulder blades.', alt: 'Dumbbell reverse fly' }),
  chestPress: reformer({ id: 'reformer-chest-press', name: 'Reformer Seated Chest Press', shortLabel: 'CHEST PRESS', muscles: ['chest', 'triceps', 'shoulders'], cue: 'Sit facing away from the pulleys, straps at chest height. Press forward and slightly together, then let the straps open you slowly.', alt: 'Push-up with hands on the bench' }),
  hugTree: reformer({ id: 'reformer-hug-a-tree', name: 'Reformer Hug a Tree', shortLabel: 'HUG A TREE', muscles: ['chest', 'shoulders'], cue: 'Sit facing away from the pulleys with arms open wide and elbows softly bent. Hug the straps together in front of your chest, then open slowly.', alt: 'Dumbbell chest fly on the bench' }),
  chestExp: reformer({ id: 'reformer-chest-expansion', name: 'Reformer Kneeling Chest Expansion', shortLabel: 'CHEST EXPANSION', muscles: ['shoulders', 'back', 'triceps'], cue: 'Kneel facing the pulleys, arms forward. Press the straps back behind your hips and open your chest, then return slowly.', alt: 'Dumbbell reverse fly' }),
  facePull: reformer({ id: 'reformer-face-pull', name: 'Reformer Kneeling Face Pull', shortLabel: 'FACE PULL', muscles: ['shoulders', 'back'], imageKey: 'face-pull', cue: 'Kneel facing the pulleys, straps at eye height. Pull towards your face with elbows high and wide, squeezing the back of the shoulders.', alt: 'Dumbbell reverse fly' }),
  curl: reformer({ id: 'reformer-biceps-curl', name: 'Reformer Biceps Curl', shortLabel: 'BICEPS CURL', muscles: ['biceps'], imageKey: 'bicep-curl', cue: 'Kneel or sit facing the pulleys with elbows by your ribs. Curl the straps up and lower for 3 s, elbows still.', alt: 'Dumbbell biceps curl' }),
  triOverhead: reformer({ id: 'reformer-overhead-triceps', name: 'Reformer Overhead Triceps Extension', shortLabel: 'OVERHEAD TRICEPS', muscles: ['triceps'], imageKey: 'tricep-overhead-extension', cue: 'Kneel facing away with hands behind your head, elbows pointing forward. Straighten your arms up and forward without flaring the elbows.', alt: 'Dumbbell overhead triceps extension' }),
  triPress: reformer({ id: 'reformer-triceps-press', name: 'Reformer Kneeling Triceps Press', shortLabel: 'TRICEPS PRESS', muscles: ['triceps', 'shoulders'], cue: 'Kneel facing the pulleys with arms by your sides. Press the straps back behind you with straight elbows and a lifted chest.', alt: 'Dumbbell triceps kickback' }),
  sideArm: reformer({ id: 'reformer-side-arm-raise', name: 'Reformer Kneeling Side Arm Raise', shortLabel: 'SIDE ARM RAISE', perSide: true, muscles: ['shoulders'], cue: 'Kneel side-on holding the far strap. Lift the arm out to shoulder height with the shoulder down, then lower slowly.', alt: 'Lateral raise' }),
  supineArms: reformer({ id: 'reformer-supine-arm-pull', name: 'Reformer Supine Arm Pull-Down', shortLabel: 'ARM PULL-DOWN', muscles: ['back', 'triceps'], cue: 'Lie on your back, arms up to the ceiling. Pull the straps down beside your hips with soft ribs, then let them rise slowly.', alt: 'Dumbbell pullover' }),

  // Core — progressive and diastasis-aware: exhale on effort, regress if you see doming along the midline.
  deadBug: core({ id: 'dead-bug', name: 'Dead Bug', shortLabel: 'DEAD BUG', fixedLoad: 'Bodyweight.', equipment: eq('bodyweight'), perSide: true, muscles: ['core'], imageKey: 'dead-bug', cue: 'Low back gently heavy on the floor. Exhale as you reach the opposite arm and leg long, only as far as you can without arching.', alt: 'Heel taps with knees bent' }),
  ballDeadBug: core({ id: 'ball-dead-bug', name: 'Dead Bug (yoga ball)', shortLabel: 'BALL DEAD BUG', fixedLoad: 'Yoga ball.', equipment: eq('yoga-ball'), perSide: true, muscles: ['core'], imageKey: 'dead-bug', cue: 'Squeeze the ball between one hand and the opposite knee while the other arm and leg reach long. Exhale, ribs down.', alt: 'Dead bug with heel taps' }),
  dbDeadBug: core({ id: 'dumbbell-dead-bug', name: 'Dead Bug (dumbbell)', shortLabel: 'WEIGHTED DEAD BUG', fixedLoad: 'One dumbbell, about 6–12 kg.', equipment: eq('dumbbell'), perSide: true, muscles: ['core'], imageKey: 'dead-bug', cue: 'Both hands press one dumbbell up over your chest. Lower one leg at a time to a hover while your back stays heavy.', alt: 'Dead bug without weight' }),
  sidePlankKnee: core({ id: 'side-plank-bent-knee', name: 'Side Plank (bent knee)', shortLabel: 'SIDE PLANK', fixedLoad: 'Bodyweight.', equipment: eq('bodyweight'), perSide: true, timed: true, muscles: ['obliques', 'core', 'glutes'], imageKey: 'side-plank', cue: 'Elbow under shoulder, knees bent. Lift your hips so ear, shoulder, hip and knee line up, and keep breathing.', alt: 'Side-lying leg lift' }),
  sidePlank: core({ id: 'side-plank', name: 'Side Plank', shortLabel: 'SIDE PLANK', fixedLoad: 'Bodyweight.', equipment: eq('bodyweight'), perSide: true, timed: true, muscles: ['obliques', 'core', 'glutes'], imageKey: 'side-plank', cue: 'Elbow under shoulder, feet stacked or staggered. Long line from head to heels, hips lifted, steady breath.', alt: 'Bent-knee side plank' }),
  sidePlankLift: core({ id: 'side-plank-hip-lift', name: 'Side Plank Hip Lift', shortLabel: 'SIDE PLANK HIP LIFT', fixedLoad: 'Bodyweight.', equipment: eq('bodyweight'), perSide: true, muscles: ['obliques', 'glutes', 'core'], imageKey: 'side-plank', cue: 'From a side plank, lower your hips a few centimetres and lift them back up just past neutral. Slow and controlled.', alt: 'Bent-knee side plank hold' }),
  copenhagen: core({ id: 'copenhagen-side-plank', name: 'Copenhagen Side Plank', shortLabel: 'COPENHAGEN PLANK', fixedLoad: 'Bodyweight, top knee on the bench.', equipment: eq('bench'), perSide: true, timed: true, muscles: ['adductors', 'obliques', 'core'], cue: 'Top knee (short lever) on the bench, bottom leg tucked under. Lift your hips level and hold; your inner thigh does the work.', alt: 'Side plank' }),
  birdDog: core({ id: 'bird-dog', name: 'Bird Dog', shortLabel: 'BIRD DOG', fixedLoad: 'Bodyweight.', equipment: eq('bodyweight'), perSide: true, muscles: ['core', 'glutes', 'lower back'], imageKey: 'bird-dog', cue: 'Hands under shoulders, knees under hips. Reach the opposite arm and leg long and hold 2 s without your hips rocking.', alt: 'Bird dog, arm or leg only' }),
  bearHold: core({ id: 'bear-hold', name: 'Bear Hold', shortLabel: 'BEAR HOLD', fixedLoad: 'Bodyweight.', equipment: eq('bodyweight'), timed: true, muscles: ['core', 'shoulders', 'quads'], imageKey: 'bear-hold', cue: 'On all fours, lift your knees a few centimetres off the floor. Flat back, steady breath.', alt: 'All-fours hold with knees down' }),
  plank: core({ id: 'forearm-plank', name: 'Forearm Plank', shortLabel: 'PLANK', fixedLoad: 'Bodyweight.', equipment: eq('bodyweight'), timed: true, muscles: ['core'], imageKey: 'plank', cue: 'Elbows under shoulders, glutes squeezed, ribs down. One long line from head to heels.', alt: 'Plank on your knees or with forearms on the bench' }),
  shoulderTap: core({ id: 'plank-shoulder-tap', name: 'Plank Shoulder Tap', shortLabel: 'SHOULDER TAPS', fixedLoad: 'Bodyweight.', equipment: eq('bodyweight'), perSide: true, muscles: ['core', 'shoulders', 'obliques'], imageKey: 'plank-shoulder-tap', cue: 'High plank with feet wide. Tap the opposite shoulder without your hips swaying.', alt: 'Shoulder taps from your knees or with hands on the bench' }),
  suitcase: core({ id: 'suitcase-carry', name: 'Suitcase Carry', shortLabel: 'SUITCASE CARRY', fixedLoad: 'One heavy dumbbell, about 12–25 kg.', equipment: eq('dumbbell'), perSide: true, timed: true, muscles: ['obliques', 'core', 'forearms'], cue: 'One heavy dumbbell at your side. Stand tall and walk slowly (or march on the spot) without leaning towards the weight.', alt: 'Suitcase hold, standing still' }),
  stirPot: core({ id: 'stir-the-pot', name: 'Stir the Pot (yoga ball)', shortLabel: 'STIR THE POT', fixedLoad: 'Yoga ball.', equipment: eq('yoga-ball'), perSide: true, muscles: ['core', 'shoulders'], cue: 'Forearms on the ball in a plank (knees down to start). Draw small circles with your elbows; your hips stay still.', alt: 'Still forearm plank on the ball' }),
  kneeTuck: core({ id: 'ball-knee-tuck', name: 'Stability Ball Knee Tuck', shortLabel: 'BALL KNEE TUCK', fixedLoad: 'Yoga ball.', equipment: eq('yoga-ball'), muscles: ['core', 'hip flexors', 'shoulders'], cue: 'Hands under shoulders, shins on the ball. Exhale and draw your knees to your chest, then roll back to a long plank without sagging.', alt: 'Slow mountain climbers' }),
  pike: core({ id: 'ball-pike', name: 'Stability Ball Pike', shortLabel: 'BALL PIKE', fixedLoad: 'Yoga ball.', equipment: eq('yoga-ball'), muscles: ['core', 'shoulders', 'hip flexors'], cue: 'Plank with your toes on the ball. Exhale and lift your hips high with straight legs, then lower to plank with control.', alt: 'Stability ball knee tuck' }),
  reverseCrunch: core({ id: 'reverse-crunch', name: 'Reverse Crunch', shortLabel: 'REVERSE CRUNCH', fixedLoad: 'Bodyweight.', equipment: eq('bodyweight'), muscles: ['core'], cue: 'Knees bent over hips. Exhale and curl your pelvis gently off the mat, then lower slowly. No swinging.', alt: 'Dead bug heel taps' }),
  hollow: core({ id: 'hollow-body-hold', name: 'Hollow Body Hold (tuck)', shortLabel: 'HOLLOW HOLD', fixedLoad: 'Bodyweight.', equipment: eq('bodyweight'), timed: true, muscles: ['core'], imageKey: 'hollow-body-hold', cue: 'Low back pressed down, knees over hips, shoulders just lifted. Straighten your legs further only if your back stays down.', alt: 'Dead bug' }),
  renegade: core({ id: 'renegade-row', name: 'Renegade Row', shortLabel: 'RENEGADE ROW', fixedLoad: 'Two dumbbells, about 6–12 kg each.', equipment: eq('dumbbell'), perSide: true, muscles: ['core', 'back', 'obliques'], imageKey: 'renegade-row', cue: 'High plank on two dumbbells with feet wide. Row one to your hip without your hips twisting.', alt: 'Plank shoulder tap' }),
  pallof: core({ id: 'reformer-strap-pallof', name: 'Pallof Press (reformer strap)', shortLabel: 'PALLOF PRESS', fixedLoad: 'One reformer strap, light spring.', equipment: eq('reformer'), perSide: true, muscles: ['obliques', 'core'], imageKey: 'pallof-press', cue: 'Stand side-on to the pulleys holding one strap at your chest. Press it straight out and hold 2 s without twisting.', alt: 'Side plank' }),
};
type Key = keyof typeof L;

// ── Prescriptions by phase ──────────────────────────────────────────────────
const MAIN: Record<SessionStyle, Rx> = {
  Foundation: { reps: '10–12', repRange: [10, 12], rir: '3', tempo: '3-0-1' },
  Pump: { reps: '10–12', repRange: [10, 12], rir: '2', tempo: '2-1-1' },
  Strength: { reps: '6–8', repRange: [6, 8], rir: '2', tempo: '3-0-1' },
  Power: { reps: '5–6', repRange: [5, 6], rir: '2–3', tempo: '2-0-X' },
  Peak: { reps: '5–6', repRange: [5, 6], rir: '1–2', tempo: '3-0-1' },
  Deload: { reps: '8', repRange: [8, 8], rir: '3–4', tempo: '2-0-1' },
};
const ACC: Record<SessionStyle, Rx> = {
  Foundation: { reps: '10–12', repRange: [10, 12], rir: '3', tempo: '3-0-1' },
  Pump: { reps: '12–15', repRange: [12, 15], rir: '1–2', tempo: '2-0-1' },
  Strength: { reps: '8–10', repRange: [8, 10], rir: '2', tempo: '3-0-1' },
  Power: { reps: '6–8', repRange: [6, 8], rir: '2', tempo: '2-0-X' },
  Peak: { reps: '6–8', repRange: [6, 8], rir: '1–2', tempo: '3-0-1' },
  Deload: { reps: '8–10', repRange: [8, 10], rir: '3–4' },
};
const SIDE: Record<SessionStyle, Rx> = {
  Foundation: { reps: '8–10 each side', repRange: [8, 10], rir: '3' },
  Pump: { reps: '8–10 each side', repRange: [8, 10], rir: '1–2' },
  Strength: { reps: '6–8 each side', repRange: [6, 8], rir: '2' },
  Power: { reps: '6 each side', repRange: [6, 6], rir: '2' },
  Peak: { reps: '6–8 each side', repRange: [6, 8], rir: '1–2' },
  Deload: { reps: '8 each side', repRange: [8, 8], rir: '3–4' },
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
  Foundation: { reps: '10 each side', repRange: [10, 10], rir: '3' },
  Pump: { reps: '10 each side', repRange: [10, 10], rir: '1–2' },
  Strength: { reps: '8–10 each side', repRange: [8, 10], rir: '2' },
  Power: { reps: '8 each side', repRange: [8, 8], rir: '3', tempo: 'fast out, 3 s home' },
  Peak: { reps: '8–10 each side', repRange: [8, 10], rir: '1–2' },
  Deload: { reps: '8 each side', repRange: [8, 8], rir: '3–4' },
};

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
  const load = rx.load
    ?? (kit === 'barbell' ? BARBELL_LOAD[style]
      : kit === 'dumbbell' ? DUMBBELL_LOAD[style]
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

// ── Session furniture ───────────────────────────────────────────────────────
function warmupFor(focus: BodyFocus, style: SessionStyle, stations: PartnerStation[]): string[] {
  const label = (st: PartnerStation) => st.shortLabel.toLowerCase().replace(/\brdl\b/g, 'RDL').replace(/\bdb\b/g, 'DB');
  const first = label(stations[0]);
  const second = label(stations[1]);
  const ramp = style === 'Power'
    ? `Ramp-up: 2 easy, fast sets of ${first} (5 reps), then 1 lighter set of ${second}`
    : `Ramp-up: 1–2 lighter sets of ${first} and ${second} (e.g. 8 reps at half weight, then 4 reps near working weight)`;
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
    Upper: 'Incline walk 5.5–6 km/h at 8–10 %, or an easy jog at 7–8 km/h. Short sentences only (RPE 5, zone 2–3).',
    Lower: 'Incline walk 5–5.5 km/h at 4–6 %. Comfortably brisk (RPE 4, zone 2–3); your legs are doing the lifting today.',
  },
  Strength: {
    Upper: 'Brisk walk 5–5.5 km/h at 4–6 %. RPE 3–4: this is active rest between heavy sets, not extra cardio.',
    Lower: 'Easy walk 4.5–5 km/h, flat to 2 %. RPE 3 (zone 1–2), so every squat and RDL is your best rep.',
  },
  Power: {
    Upper: 'Easy walk about 5 km/h at 2–4 %. RPE 3. Power needs recovery: arrive at each station fresh.',
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

function session(s: SessionInput): PartnerSession {
  const mainLifts = s.mainLifts ?? 2;
  const stations = [
    ...s.strength.map((spec, i) => build(s.style, spec, i < mainLifts ? 'main' : 'acc')),
    ...s.reformer.map((spec) => build(s.style, spec, 'acc')),
    ...s.core.map((spec) => build(s.style, spec, 'acc')),
  ];
  const { work, transition } = TIMING[s.style];
  return {
    id: `w${s.week}-s${s.index}`,
    week: s.week,
    index: s.index,
    focus: s.focus,
    style: s.style,
    title: `Week ${s.week} · ${s.focus} · ${s.style}`,
    stations,
    rounds: 2,
    workSeconds: work,
    transitionSeconds: transition,
    warmup: warmupFor(s.focus, s.style, stations),
    cooldown: cooldownFor(s.focus),
    treadmill: TREADMILL[s.style][s.focus],
    coachNote: s.coachNote,
    estMinutes: Math.round((PARTNER_TURNS * (work + transition)) / 60 + WARMUP_MIN + COOLDOWN_MIN),
  };
}

// ── The 24 sessions ─────────────────────────────────────────────────────────
// Odd weeks: Upper · Lower · Upper. Even weeks: Lower · Upper · Lower.
const SESSIONS: PartnerSession[] = [
  // Weeks 1–2 · Foundation — DB bench + barbell row / back squat + barbell RDL
  session({
    week: 1, index: 1, focus: 'Upper', style: 'Foundation',
    strength: ['dbBench', 'bbRow', 'seatedPress'],
    reformer: [['seatedRow', { springs: 'light–medium' }], ['latPull', { springs: 'light–medium' }], ['chestPress', { springs: 'light–medium' }]],
    core: [['birdDog', each(6)], ['suitcase', hold(20, true)], ['plank', hold(30)]],
    coachNote: 'Session one is about finding your numbers. Choose weights that leave 3 reps in the tank, own the 3-second lowering and log every weight. Everything after this builds on today.',
  }),
  session({
    week: 1, index: 2, focus: 'Lower', style: 'Foundation',
    strength: ['squat', 'rdl', 'reverseLunge'],
    reformer: [['footwork', series('10 heels · 10 arches · 10 toes', 'heavy')], ['bridge', { springs: 'medium' }], ['sideLeg', { springs: 'light–medium' }]],
    core: [['deadBug', each(8)], ['sidePlankKnee', hold(20, true)], ['bearHold', hold(30)]],
    coachNote: 'Set the rack safeties before the first squat. Partners lift different weights, so keep 2.5 and 5 kg plates and collars by the rack and change them during the swap. Smooth reps, 3 in the tank.',
  }),
  session({
    week: 1, index: 3, focus: 'Upper', style: 'Foundation',
    strength: ['dbBench', 'bbRow', ['pushUp', { reps: '8–12', repRange: [8, 12], rir: '3' }]],
    reformer: [['longBox', { springs: 'light' }], ['hugTree', { springs: 'light' }], ['triOverhead', { springs: 'light' }]],
    core: [['birdDog', each(6)], ['pallof', each(6)], ['plank', hold(30)]],
    coachNote: 'Same press and row as session one. If every set reached 12 reps with 3 left, go up a small step next time: 1–2 kg per dumbbell or 2.5 kg on the bar. Push-ups: raise your hands on the bench until 12 reps leaves 3 in the tank.',
  }),
  session({
    week: 2, index: 1, focus: 'Lower', style: 'Foundation',
    strength: ['squat', 'rdl', 'stepUp'],
    reformer: [['slPress', { springs: 'medium–heavy' }], ['hamCurl', { springs: 'light–medium' }], ['scooter', { springs: 'light' }]],
    core: [['deadBug', each(10)], ['sidePlankKnee', hold(20, true)], ['reverseCrunch', reps(8, 10)]],
    coachNote: 'Beat last week’s log by a rep or a small plate on the squat and RDL, but only if your form looks the same. The step-up is new: drive through the whole front foot.',
  }),
  session({
    week: 2, index: 2, focus: 'Upper', style: 'Foundation',
    strength: ['dbBench', 'bbRow', 'arnold'],
    reformer: [['seatedRow', { springs: 'light–medium' }], ['chestPress', { springs: 'light–medium' }], ['sideArm', { springs: 'light' }]],
    core: [['birdDog', each(8)], ['suitcase', hold(20, true)], ['shoulderTap', each(8)]],
    coachNote: 'Last Foundation upper session. Aim for the top of the rep range on every set with 3 in reserve. That tells you you’re ready for the Pump block.',
  }),
  session({
    week: 2, index: 3, focus: 'Lower', style: 'Foundation',
    strength: ['squat', 'rdl', ['hipThrust', { ...ACC.Foundation, tempo: '2-1-1' }]],
    reformer: [['footwork', series('10 heels · 10 arches · 10 toes', 'heavy')], ['hamCurl', { springs: 'light–medium' }], ['sideLeg', { springs: 'light–medium' }]],
    core: [['deadBug', each(10)], ['sidePlankKnee', hold(20, true)], ['bearHold', hold(40)]],
    coachNote: 'Hip thrusts join today: bench under your shoulder blades and a pad on the bar. Finish Foundation by noting each lift’s weight, because Week 3 starts from there.',
  }),

  // Weeks 3–4 · Pump — incline DB press + chest-supported row / back squat + hip thrust
  session({
    week: 3, index: 1, focus: 'Upper', style: 'Pump',
    strength: ['incline', 'csRow', 'lateral'],
    reformer: [['latPull', { springs: 'medium' }], ['hugTree', { springs: 'light–medium' }], ['curl', { springs: 'light' }]],
    core: [['stirPot', each(6, 'each way')], ['suitcase', hold(20, true)], ['shoulderTap', each(10)]],
    coachNote: 'Pump block: a new press and row, more reps and 2 in the tank. Squeeze each rep for a second at the hardest point. Lighter than you expect is fine on the incline press.',
  }),
  session({
    week: 3, index: 2, focus: 'Lower', style: 'Pump',
    strength: ['squat', 'hipThrust', 'slRdl'],
    reformer: [['slPress', { springs: 'medium–heavy' }], ['hamCurl', { springs: 'light–medium' }], ['standingLunge', { springs: 'light' }]],
    core: [['ballDeadBug', each(8)], ['sidePlank', hold(20, true)], ['reverseCrunch', reps(10, 12)]],
    coachNote: 'Squats stay, and hip thrusts become your second big lift: pause a beat at the top of each one. On single-leg RDLs, touch the rack or a wall if your balance wobbles.',
  }),
  session({
    week: 3, index: 3, focus: 'Upper', style: 'Pump',
    strength: ['incline', 'csRow', 'arnold'],
    reformer: [['seatedRow', { springs: 'medium' }], ['chestPress', { springs: 'medium' }], ['facePull', { springs: 'light' }]],
    core: [['stirPot', each(6, 'each way')], ['pallof', each(6)], ['shoulderTap', each(10)]],
    coachNote: 'If you hit the top of the range with 2 in reserve on the incline press last time, add 1–2 kg per hand. The Arnold press replaces lateral raises today.',
  }),
  session({
    week: 4, index: 1, focus: 'Lower', style: 'Pump',
    strength: ['squat', 'hipThrust', 'bss'],
    reformer: [['footwork', series('10 heels · 10 toes · 10 wide V', 'heavy')], ['bridge', { springs: 'medium' }], ['skater', { springs: 'light' }]],
    core: [['ballDeadBug', each(10)], ['sidePlank', hold(20, true)], ['reverseCrunch', reps(10, 12)]],
    coachNote: 'Bulgarian split squats are tough, so start lighter than your lunge weight. Optional: on round 2 of the squat, drop about 20 % and keep going to 1 in reserve.',
  }),
  session({
    week: 4, index: 2, focus: 'Upper', style: 'Pump',
    strength: ['incline', 'csRow', ['pushUp', { reps: '8–15', repRange: [8, 15], rir: '1–2' }]],
    reformer: [['longBox', { springs: 'light–medium' }], ['chestPress', { springs: 'medium' }], ['tPull', { springs: 'light' }]],
    core: [['stirPot', each(8, 'each way')], ['suitcase', hold(20, true)], ['shoulderTap', each(10)]],
    coachNote: 'Push-ups take the third slot. Raise your hands on the bench or rack bar so you finish with 1–2 in reserve, and log your best set.',
  }),
  session({
    week: 4, index: 3, focus: 'Lower', style: 'Pump',
    strength: ['squat', 'hipThrust', 'dbRdl'],
    reformer: [['slPress', { springs: 'medium–heavy' }], ['hamCurl', { springs: 'light–medium' }], ['sideLeg', { springs: 'light–medium' }]],
    core: [['ballDeadBug', each(10)], ['sidePlank', hold(20, true)], ['kneeTuck', reps(6, 8)]],
    coachNote: 'Last Pump session. If you reached the top of every range with 2 or more left, go up next time, because Week 5 is heavier.',
  }),

  // Weeks 5–6 · Strength → Power — barbell bench + barbell row / back squat + barbell RDL
  session({
    week: 5, index: 1, focus: 'Upper', style: 'Strength',
    strength: ['bbBench', 'bbRow', ['bbOhp', MAIN.Strength]],
    reformer: [['latPull', { springs: 'medium' }], ['seatedRow', { springs: 'medium' }], ['hugTree', { springs: 'light–medium' }]],
    core: [['renegade', each(6)], ['hollow', hold(25)], ['suitcase', hold(20, true)]],
    coachNote: 'Strength week. The barbell bench joins with the safeties set just below chest height. Heavier weights and fewer reps (6–8, 2 in the tank): use the whole treadmill turn as rest.',
  }),
  session({
    week: 5, index: 2, focus: 'Lower', style: 'Strength',
    strength: ['squat', 'rdl', 'bss'],
    reformer: [['slPress', { springs: 'heavy' }], ['bridge', { springs: 'medium–heavy' }], ['sideSplits', { springs: 'light' }]],
    core: [['kneeTuck', reps(8, 10)], ['sidePlankLift', each(8)], ['dbDeadBug', each(6)]],
    coachNote: 'Your heaviest lower session so far. Keep the treadmill easy so your legs turn up for the squat. If 25 kg dumbbells feel light on the split squat, slow the lowering to 4 s.',
  }),
  session({
    week: 5, index: 3, focus: 'Upper', style: 'Strength',
    strength: ['bbBench', 'bbRow', 'incline'],
    reformer: [['longBox', { springs: 'light–medium' }], ['facePull', { springs: 'light–medium' }], ['triPress', { springs: 'light–medium' }]],
    core: [['stirPot', each(8, 'each way')], ['hollow', hold(25)], ['pallof', each(6)]],
    coachNote: 'Same bench and row as session one: beat it by a rep or a small plate. Incline dumbbell presses come third, so stop at 2 in reserve; your chest is already tired.',
  }),
  session({
    week: 6, index: 1, focus: 'Lower', style: 'Power',
    strength: [['swing', { reps: '10', repRange: [10, 10], rir: '3' }], 'squat', 'rdl'],
    reformer: [['footwork', { ...series('10 heels · 10 toes', 'heavy'), tempo: 'fast out, 3 s home', rir: '3' }], ['standingLunge', { springs: 'light' }], ['hamCurl', { springs: 'light–medium' }]],
    core: [['kneeTuck', reps(8)], ['sidePlankLift', each(8)], ['dbDeadBug', each(6)]],
    mainLifts: 3,
    coachNote: 'Power week: swings open the session while you’re fresh. Fast up, controlled down, and stop the set the moment speed drops. Squats and RDLs are about 10 % lighter and moved with intent.',
  }),
  session({
    week: 6, index: 2, focus: 'Upper', style: 'Power',
    strength: ['pushPress', 'bbBench', ['bbRow', { ...MAIN.Power, reps: '6–8', repRange: [6, 8] }]],
    reformer: [['seatedRow', { springs: 'medium' }], ['latPull', { springs: 'medium' }], ['chestPress', { springs: 'medium' }]],
    core: [['renegade', each(6)], ['hollow', hold(20)], ['suitcase', hold(20, true)]],
    mainLifts: 3,
    coachNote: 'Push press first: a short dip, drive with your legs and lock out overhead. Bench and row stay. Lift fast and lower under control.',
  }),
  session({
    week: 6, index: 3, focus: 'Lower', style: 'Power',
    strength: [['squatJump', { reps: '5', repRange: [5, 5], rir: '3' }], 'squat', 'rdl'],
    reformer: [['slPress', { springs: 'heavy' }], ['sideSplits', { springs: 'light' }], ['bridge', { springs: 'medium–heavy' }]],
    core: [['kneeTuck', reps(8)], ['sidePlankLift', each(8)], ['dbDeadBug', each(8)]],
    mainLifts: 3,
    coachNote: 'Squat jumps are optional. The speed-squat swap gives the same intent with no landing. If you notice pelvic-floor heaviness or leaking, choose the swap.',
  }),

  // Weeks 7–8 · Peak → Deload & test — barbell bench + barbell row / back squat + RDL + hip thrust
  session({
    week: 7, index: 1, focus: 'Upper', style: 'Peak',
    strength: ['bbBench', ['bbRow', ACC.Peak], ['bbOhp', MAIN.Peak]],
    reformer: [['latPull', { springs: 'medium–heavy' }], ['hugTree', { springs: 'light–medium' }], ['facePull', { springs: 'light–medium' }]],
    core: [['renegade', each(8)], ['hollow', hold(30)], ['suitcase', hold(20, true)]],
    coachNote: 'Peak week: your heaviest clean 5–6 on the bench with 1–2 in the tank. No grinding and no max tests. Set the safeties every time.',
  }),
  session({
    week: 7, index: 2, focus: 'Lower', style: 'Peak',
    strength: ['squat', ['rdl', { ...MAIN.Peak, reps: '6', repRange: [6, 6] }], ['hipThrust', ACC.Peak]],
    reformer: [['slPress', { springs: 'heavy' }], ['standingLunge', { springs: 'light–medium' }], ['sideSplits', { springs: 'light–medium' }]],
    core: [['pike', reps(6, 8)], ['copenhagen', hold(15, true)], ['dbDeadBug', each(8)]],
    coachNote: 'The heaviest squat of the series: 5–6 reps with 1–2 left. Hip thrusts are a heavy third lift. Keep the treadmill turns easy, because they are your rest.',
  }),
  session({
    week: 7, index: 3, focus: 'Upper', style: 'Peak',
    strength: ['bbBench', ['bbRow', ACC.Peak], ['incline', ACC.Peak]],
    reformer: [['longBox', { springs: 'medium' }], ['seatedRow', { springs: 'medium' }], ['curl', { springs: 'light–medium' }]],
    core: [['stirPot', each(10, 'each way')], ['hollow', hold(30)], ['pallof', each(8)]],
    coachNote: 'Last heavy upper session. Write down your bench and row numbers and compare them with Week 5 to see what you’ve built.',
  }),
  session({
    week: 8, index: 1, focus: 'Lower', style: 'Deload',
    strength: ['squat', 'rdl', ['hipThrust', { ...ACC.Deload, reps: '10', repRange: [10, 10] }]],
    reformer: [['footwork', series('10 heels · 10 arches · 10 toes', 'medium')], ['bridge', { springs: 'medium' }], ['sideLeg', { springs: 'light' }]],
    core: [['deadBug', each(8)], ['sidePlank', hold(20, true)], ['birdDog', each(6)]],
    coachNote: 'Deload: the same lifts at about 70–80 % of Week 7, with 3–4 in the tank. Leave feeling better than you arrived. That’s the point of this week.',
  }),
  session({
    week: 8, index: 2, focus: 'Upper', style: 'Deload',
    strength: ['bbBench', ['bbRow', { load: 'Optional rep test on round 1: your Week 1 bar weight for as many clean reps as you can, stopping with 1 in reserve (use partner pace). Round 2: 8 easy reps at about 70 % of Week 7.' }], ['seatedPress', ACC.Deload]],
    reformer: [['seatedRow', { springs: 'light–medium' }], ['supineArms', { springs: 'light–medium' }], ['chestPress', { springs: 'light–medium' }]],
    core: [['birdDog', each(6)], ['plank', hold(30)], ['suitcase', hold(20, true)]],
    coachNote: 'Rep test (optional): round 1 of the bent-over row uses your Week 1 weight for max clean reps, so compare it with Week 1. The bench stays light (no testing without a spotter). Everything else is easy.',
  }),
  session({
    week: 8, index: 3, focus: 'Lower', style: 'Deload',
    strength: [['squat', { load: 'Optional rep test on round 1: your Week 1 bar weight for as many clean reps as you can, stopping with 1 in reserve (use partner pace). Round 2: 8 easy reps at about 70 % of Week 7.' }], 'rdl', 'stepUp'],
    reformer: [['footwork', series('10 heels · 10 toes · 10 wide V', 'medium')], ['hamCurl', { springs: 'light' }], ['sideSplits', { springs: 'light' }]],
    core: [['deadBug', each(8)], ['sidePlank', hold(20, true)], ['bearHold', hold(30)]],
    coachNote: 'Rep test (optional): round 1 of the squat uses your Week 1 weight for max clean reps. Then start the series again from Week 1 with your new numbers, or repeat Weeks 3–8.',
  }),
];

export const PARTNER_PROGRAM: PartnerProgram = {
  id: 'partner-bft-8wk',
  name: 'Partner Strength Series · 8 weeks',
  summary:
    'An 8-week, class-style partner series for two people, one treadmill and a home gym. Each session has 9 stations (3 strength, 3 reformer, 3 core) done for 2 rounds. One partner works a station while the other walks the treadmill, then you swap: 36 turns in about 45 minutes. Weeks alternate Upper-Lower-Upper and Lower-Upper-Lower, giving 12 upper and 12 lower sessions. Loads are set by reps in reserve and logged, so each session builds on the last. Each half of the body is trained 3 times a fortnight; if you have about 7 spare minutes, a third round of the three strength stations is the best way to add muscle-building volume. Swap safely: keep the belt at walking pace, hold the rails and clip on the safety key.',
  equipment: ['Squat rack with safeties', '20 kg barbell + plates', 'Dumbbells 4–25 kg', 'Bench', 'Yoga ball', 'Reformer', 'Treadmill'],
  phases: [
    { name: 'Foundation', weeks: [1, 2], goal: 'Learn the stations, groove technique and find your starting weights.', reps: '10–12 (unilateral 8–10 each side)', rir: '3', notes: 'Lower for 3 s on the main lifts. Log every weight. When every set reaches the top of the range with 3 left, add the next small step. Core: exhale on effort and choose the swap if you see doming along your midline.' },
    { name: 'Pump', weeks: [3, 4], goal: 'Build muscle with more reps and sets closer to failure.', reps: '10–12 main lifts · 12–15 accessories', rir: '2 (accessories 1–2)', notes: 'Double progression: add reps until you reach the top of the range, then add load. A drop set on round 2 of the first station is an optional time-saver.' },
    { name: 'Strength', weeks: [5], goal: 'Heavier compound lifts for fewer reps.', reps: '6–8', rir: '2', notes: 'The barbell bench joins, so set the safeties. Keep the treadmill easy: it is active rest. At 25 kg dumbbells, progress with slower lowering, pauses or a barbell version.' },
    { name: 'Power', weeks: [6], goal: 'Move moderate loads fast to build power while holding strength.', reps: 'Power opener 5–10 · main lifts 5–6, fast', rir: '2–3', notes: 'About 10 % lighter than Week 5 on the main lifts. End each set when the speed drops. A no-jump swap is always fine.' },
    { name: 'Peak', weeks: [7], goal: 'Your heaviest clean sets of the series.', reps: '5–6 main lifts · 6–8 accessories', rir: '1–2', notes: 'No max tests: heavy top sets with 1–2 in reserve, with the safeties set every time.' },
    { name: 'Deload & test', weeks: [8], goal: 'Recover, consolidate and see your progress.', reps: '8–10', rir: '3–4', notes: 'About 70–80 % of your Week 7 loads. Optional rep tests with your Week 1 weights in sessions 2 and 3.' },
  ],
  sessions: SESSIONS,
  evidence: [
    'ACSM Position Stand, resistance training for healthy adults (Med Sci Sports Exerc, 2026): train every major muscle group at least 2 days a week, with load, volume and effort matched to the person.',
    'Pelland et al. 2026, Sports Med: fractional weekly sets predict muscle growth best, returns diminish as volume rises, and frequency adds little for growth once weekly sets are matched.',
    'Schoenfeld, Ogborn & Krieger 2017, J Sports Sci: more weekly sets build more muscle, with about 10 or more sets per muscle a useful target.',
    'Iversen et al. 2021, Sports Med (“No time to lift?”): 4 or more weekly sets per muscle at 6–15RM builds strength and muscle, and circuits and supersets cut session time.',
    'Robinson et al. 2024, Sports Med, and Refalo et al. 2024, J Sports Sci: sets that end closer to failure build slightly more muscle, and 1–2 reps in reserve works about as well as failure.',
    'Zourdos, Helms et al. 2016, J Strength Cond Res: the reps-in-reserve scale lets you set load by how you feel on the day.',
    'Singer et al. 2024, Front Sports Act Living: rest over 60 s slightly favours growth, with little extra beyond about 90 s. Each partner rests about 80 s on the treadmill.',
    'Schumann et al. 2022, Sports Med: aerobic work alongside lifting does not blunt muscle growth or maximal strength. Only explosive strength is slightly blunted in the same session, so treadmill turns stay easy in power and heavy weeks.',
    'Bell et al. 2023 (Delphi consensus) and Coleman et al. 2024, PeerJ: a deload cuts volume and effort for a week. Expect recovery, not extra growth.',
    'Plotkin et al. 2023: hip thrusts and squats grow the glutes about equally. Kubo et al. 2019: deeper squats grow the glutes and adductors more.',
    'Reformer Pilates: small 8-week trials in women show strength and endurance gains compared with no exercise, but not over weight training. Here it counts as half-sets of accessory volume.',
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
