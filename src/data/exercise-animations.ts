/**
 * SIGNAL Exercise Animation Registry
 * 
 * Architecture:
 * - One reusable SVG rig (ExerciseRig component)
 * - Animations defined at the EXERCISE level (not workout level)
 * - Each animation = lightweight JSON pose keyframes
 * - Workouts reference animations by exercise name via mapping layer
 * 
 * Adding a new exercise:
 * 1. Define pose keyframes (JointPose objects)
 * 2. Add entry to ANIMATION_REGISTRY
 * 3. Add name mapping(s) to EXERCISE_NAME_MAP
 */

// ── Joint pose type ──────────────────────────────────────────────────

export interface JointPose {
  headX: number; headY: number;
  neckX: number; neckY: number;
  shoulderLX: number; shoulderLY: number;
  shoulderRX: number; shoulderRY: number;
  hipX: number; hipY: number;
  hipLX: number; hipLY: number;
  hipRX: number; hipRY: number;
  elbowLX: number; elbowLY: number;
  elbowRX: number; elbowRY: number;
  handLX: number; handLY: number;
  handRX: number; handRY: number;
  kneeLX: number; kneeLY: number;
  kneeRX: number; kneeRY: number;
  footLX: number; footLY: number;
  footRX: number; footRY: number;
}

export type MovementType = "squat" | "hinge" | "lunge" | "push" | "pull" | "core" | "plank" | "bridge" | "isolation" | "compound" | "locomotion";
export type BodyOrientation = "standing" | "supine" | "prone" | "side" | "quadruped" | "kneeling";
export type LoopType = "ping-pong" | "loop" | "hold";

export interface ExerciseAnimationDef {
  key: string;
  name: string;
  category: string;
  movementType: MovementType;
  orientation: BodyOrientation;
  loopType: LoopType;
  unilateral: boolean;
  holdable: boolean;
  defaultTempo?: string;
  keyframes: JointPose[];
  cycleDuration: number;
}

// ── Base poses ───────────────────────────────────────────────────────

const STANDING: JointPose = {
  headX: 100, headY: 35,
  neckX: 100, neckY: 52,
  shoulderLX: 78, shoulderLY: 60,
  shoulderRX: 122, shoulderRY: 60,
  hipX: 100, hipY: 145,
  hipLX: 88, hipLY: 148,
  hipRX: 112, hipRY: 148,
  elbowLX: 70, elbowLY: 100,
  elbowRX: 130, elbowRY: 100,
  handLX: 68, handLY: 135,
  handRX: 132, handRY: 135,
  kneeLX: 88, kneeLY: 205,
  kneeRX: 112, kneeRY: 205,
  footLX: 85, footLY: 270,
  footRX: 115, footRY: 270,
};

// Standing with dumbbells at sides
const STANDING_DB: JointPose = {
  ...STANDING,
  handLX: 72, handLY: 145,
  handRX: 128, handRY: 145,
};

// Prone plank base
const PLANK_BASE: JointPose = {
  headX: 40, headY: 140,
  neckX: 52, neckY: 148,
  shoulderLX: 62, shoulderLY: 155,
  shoulderRX: 62, shoulderRY: 145,
  hipX: 120, hipY: 160,
  hipLX: 118, hipLY: 163,
  hipRX: 122, hipRY: 157,
  elbowLX: 62, elbowLY: 190,
  elbowRX: 62, elbowRY: 190,
  handLX: 62, handLY: 260,
  handRX: 62, handRY: 260,
  kneeLX: 150, kneeLY: 168,
  kneeRX: 150, kneeRY: 168,
  footLX: 178, footLY: 175,
  footRX: 178, footRY: 175,
};

// Supine base (lying on back)
const SUPINE_BASE: JointPose = {
  headX: 40, headY: 220,
  neckX: 50, neckY: 225,
  shoulderLX: 55, shoulderLY: 235,
  shoulderRX: 55, shoulderRY: 218,
  hipX: 90, hipY: 240,
  hipLX: 88, hipLY: 243,
  hipRX: 92, hipRY: 237,
  elbowLX: 50, elbowLY: 252,
  elbowRX: 50, elbowRY: 205,
  handLX: 60, handLY: 260,
  handRX: 60, handRY: 200,
  kneeLX: 128, kneeLY: 200,
  kneeRX: 128, kneeRY: 200,
  footLX: 148, footLY: 260,
  footRX: 148, footRY: 260,
};

// Quadruped base (on all fours)
const QUADRUPED: JointPose = {
  headX: 55, headY: 155,
  neckX: 65, neckY: 165,
  shoulderLX: 72, shoulderLY: 175,
  shoulderRX: 72, shoulderRY: 168,
  hipX: 125, hipY: 180,
  hipLX: 122, hipLY: 183,
  hipRX: 128, hipRY: 177,
  elbowLX: 65, elbowLY: 210,
  elbowRX: 65, elbowRY: 210,
  handLX: 60, handLY: 260,
  handRX: 60, handRY: 260,
  kneeLX: 130, kneeLY: 230,
  kneeRX: 130, kneeRY: 230,
  footLX: 145, footLY: 260,
  footRX: 145, footRY: 260,
};

// ═══════════════════════════════════════════════════════════════════════
// POSE KEYFRAMES PER EXERCISE
// ═══════════════════════════════════════════════════════════════════════

// ── GOBLET SQUAT ─────────────────────────────────────────────────────
const gobletSquatTop: JointPose = {
  ...STANDING,
  handLX: 88, handLY: 80, handRX: 112, handRY: 80,
  elbowLX: 72, elbowLY: 90, elbowRX: 128, elbowRY: 90,
};
const gobletSquatBottom: JointPose = {
  headX: 100, headY: 65, neckX: 100, neckY: 80,
  shoulderLX: 78, shoulderLY: 88, shoulderRX: 122, shoulderRY: 88,
  hipX: 100, hipY: 160, hipLX: 85, hipLY: 163, hipRX: 115, hipRY: 163,
  elbowLX: 72, elbowLY: 115, elbowRX: 128, elbowRY: 115,
  handLX: 88, handLY: 100, handRX: 112, handRY: 100,
  kneeLX: 68, kneeLY: 200, kneeRX: 132, kneeRY: 200,
  footLX: 78, footLY: 270, footRX: 122, footRY: 270,
};

// ── ROMANIAN DEADLIFT ────────────────────────────────────────────────
const rdlTop: JointPose = { ...STANDING_DB };
const rdlBottom: JointPose = {
  headX: 100, headY: 80,
  neckX: 100, neckY: 92,
  shoulderLX: 80, shoulderLY: 100, shoulderRX: 120, shoulderRY: 100,
  hipX: 100, hipY: 155, hipLX: 90, hipLY: 158, hipRX: 110, hipRY: 158,
  elbowLX: 78, elbowLY: 130, elbowRX: 122, elbowRY: 130,
  handLX: 80, handLY: 160, handRX: 120, handRY: 160,
  kneeLX: 88, kneeLY: 210, kneeRX: 112, kneeRY: 210,
  footLX: 85, footLY: 270, footRX: 115, footRY: 270,
};

// ── REVERSE LUNGE ────────────────────────────────────────────────────
const reverseLungeTop: JointPose = { ...STANDING_DB };
const reverseLungeBottom: JointPose = {
  headX: 100, headY: 55,
  neckX: 100, neckY: 70,
  shoulderLX: 80, shoulderLY: 78, shoulderRX: 120, shoulderRY: 78,
  hipX: 100, hipY: 155, hipLX: 90, hipLY: 158, hipRX: 110, hipRY: 158,
  elbowLX: 72, elbowLY: 115, elbowRX: 128, elbowRY: 115,
  handLX: 72, handLY: 150, handRX: 128, handRY: 150,
  kneeLX: 88, kneeLY: 200, kneeRX: 105, kneeRY: 250,
  footLX: 85, footLY: 270, footRX: 115, footRY: 270,
};

// ── STEP-UP ──────────────────────────────────────────────────────────
const stepUpBottom: JointPose = {
  ...STANDING_DB,
  kneeLX: 88, kneeLY: 195, kneeRX: 112, kneeRY: 210,
  footLX: 85, footLY: 245, footRX: 115, footRY: 270,
};
const stepUpTop: JointPose = {
  headX: 100, headY: 25,
  neckX: 100, neckY: 42,
  shoulderLX: 78, shoulderLY: 50, shoulderRX: 122, shoulderRY: 50,
  hipX: 100, hipY: 135, hipLX: 88, hipLY: 138, hipRX: 112, hipRY: 138,
  elbowLX: 70, elbowLY: 90, elbowRX: 130, elbowRY: 90,
  handLX: 72, handLY: 135, handRX: 128, handRY: 135,
  kneeLX: 88, kneeLY: 190, kneeRX: 110, kneeRY: 170,
  footLX: 85, footLY: 245, footRX: 115, footRY: 245,
};

// ── GLUTE BRIDGE ─────────────────────────────────────────────────────
const gluteBridgeDown: JointPose = { ...SUPINE_BASE };
const gluteBridgeUp: JointPose = {
  ...SUPINE_BASE,
  hipX: 90, hipY: 205, hipLX: 88, hipLY: 208, hipRX: 92, hipRY: 202,
  shoulderLX: 55, shoulderLY: 232, shoulderRX: 55, shoulderRY: 218,
};

// ── FIRE HYDRANT ─────────────────────────────────────────────────────
const fireHydrantClosed: JointPose = { ...QUADRUPED };
const fireHydrantOpen: JointPose = {
  ...QUADRUPED,
  kneeRX: 155, kneeRY: 200,
  footRX: 170, footRY: 230,
};

// ── LATERAL BAND WALK ────────────────────────────────────────────────
const lateralWalkA: JointPose = {
  ...STANDING,
  kneeLX: 80, kneeLY: 208, kneeRX: 120, kneeRY: 208,
  footLX: 75, footLY: 270, footRX: 125, footRY: 270,
  hipY: 150, hipLX: 85, hipRX: 115,
};
const lateralWalkB: JointPose = {
  ...lateralWalkA,
  headX: 110, neckX: 110, hipX: 110,
  shoulderLX: 88, shoulderRX: 132,
  hipLX: 95, hipRX: 125,
  kneeLX: 90, kneeRX: 140,
  footLX: 85, footRX: 150,
  elbowLX: 80, elbowRX: 140,
  handLX: 78, handRX: 142,
};

// ── CHEST PRESS ON MAT ──────────────────────────────────────────────
const chestPressDown: JointPose = {
  ...SUPINE_BASE,
  elbowLX: 35, elbowLY: 225,
  elbowRX: 35, elbowRY: 210,
  handLX: 25, handLY: 210,
  handRX: 25, handRY: 195,
};
const chestPressUp: JointPose = {
  ...SUPINE_BASE,
  elbowLX: 50, elbowLY: 200,
  elbowRX: 50, elbowRY: 185,
  handLX: 50, handLY: 175,
  handRX: 50, handRY: 160,
};

// ── SINGLE-ARM DUMBBELL ROW ──────────────────────────────────────────
const singleArmRowDown: JointPose = {
  headX: 100, headY: 75,
  neckX: 100, neckY: 88,
  shoulderLX: 80, shoulderLY: 95, shoulderRX: 120, shoulderRY: 95,
  hipX: 100, hipY: 155, hipLX: 90, hipLY: 158, hipRX: 110, hipRY: 158,
  elbowLX: 78, elbowLY: 130, elbowRX: 125, elbowRY: 130,
  handLX: 80, handLY: 165, handRX: 128, handRY: 165,
  kneeLX: 88, kneeLY: 210, kneeRX: 112, kneeRY: 210,
  footLX: 85, footLY: 270, footRX: 115, footRY: 270,
};
const singleArmRowUp: JointPose = {
  ...singleArmRowDown,
  elbowRX: 140, elbowRY: 100,
  handRX: 135, handRY: 105,
};

// ── LATERAL RAISE ────────────────────────────────────────────────────
const lateralRaiseDown: JointPose = { ...STANDING_DB };
const lateralRaiseUp: JointPose = {
  ...STANDING_DB,
  elbowLX: 48, elbowLY: 65, elbowRX: 152, elbowRY: 65,
  handLX: 30, handLY: 62, handRX: 170, handRY: 62,
};

// ── BICEP CURL ───────────────────────────────────────────────────────
const bicepCurlDown: JointPose = { ...STANDING_DB };
const bicepCurlUp: JointPose = {
  ...STANDING_DB,
  elbowLX: 72, elbowLY: 100, elbowRX: 128, elbowRY: 100,
  handLX: 78, handLY: 72, handRX: 122, handRY: 72,
};

// ── BIRD DOG ─────────────────────────────────────────────────────────
const birdDogCenter: JointPose = { ...QUADRUPED };
const birdDogExtended: JointPose = {
  ...QUADRUPED,
  // Right arm forward
  elbowRX: 35, elbowRY: 170,
  handRX: 15, handRY: 160,
  // Left leg back
  kneeLX: 158, kneeLY: 185,
  footLX: 185, footLY: 180,
};

// ── PUSH-UP ──────────────────────────────────────────────────────────
const pushUpUp: JointPose = { ...PLANK_BASE };
const pushUpDown: JointPose = {
  headX: 40, headY: 185,
  neckX: 52, neckY: 192,
  shoulderLX: 62, shoulderLY: 198, shoulderRX: 62, shoulderRY: 190,
  hipX: 120, hipY: 200, hipLX: 118, hipLY: 203, hipRX: 122, hipRY: 197,
  elbowLX: 48, elbowLY: 230, elbowRX: 78, elbowRY: 230,
  handLX: 48, handLY: 260, handRX: 78, handRY: 260,
  kneeLX: 150, kneeLY: 205, kneeRX: 150, kneeRY: 205,
  footLX: 178, footLY: 210, footRX: 178, footRY: 210,
};

// ── DEAD BUG ─────────────────────────────────────────────────────────
const deadBugA: JointPose = {
  headX: 40, headY: 215, neckX: 52, neckY: 222,
  shoulderLX: 60, shoulderLY: 230, shoulderRX: 60, shoulderRY: 215,
  hipX: 100, hipY: 235, hipLX: 98, hipLY: 238, hipRX: 102, hipRY: 232,
  elbowLX: 42, elbowLY: 195, elbowRX: 60, elbowRY: 250,
  handLX: 30, handLY: 170, handRX: 65, handRY: 260,
  kneeLX: 130, kneeLY: 260, kneeRX: 120, kneeRY: 200,
  footLX: 145, footLY: 270, footRX: 140, footRY: 180,
};
const deadBugB: JointPose = {
  ...deadBugA,
  elbowLX: 60, elbowLY: 250, elbowRX: 42, elbowRY: 195,
  handLX: 65, handLY: 260, handRX: 30, handRY: 170,
  kneeLX: 120, kneeLY: 200, kneeRX: 130, kneeRY: 260,
  footLX: 140, footLY: 180, footRX: 145, footRY: 270,
};

// ── PLANK SHOULDER TAPS ──────────────────────────────────────────────
const plankTapCenter: JointPose = { ...PLANK_BASE };
const plankTapLeft: JointPose = {
  ...PLANK_BASE,
  elbowRX: 72, elbowRY: 160,
  handRX: 68, handRY: 155,
};
const plankTapRight: JointPose = {
  ...PLANK_BASE,
  elbowLX: 52, elbowLY: 160,
  handLX: 55, handLY: 155,
};

// ── MOUNTAIN CLIMBERS ────────────────────────────────────────────────
const mountainClimberA: JointPose = {
  ...PLANK_BASE,
  kneeLX: 100, kneeLY: 190,
  footLX: 95, footLY: 200,
};
const mountainClimberB: JointPose = {
  ...PLANK_BASE,
  kneeRX: 100, kneeRY: 180,
  footRX: 95, footRY: 190,
};

// ── SIDE PLANK ───────────────────────────────────────────────────────
const sidePlankHold: JointPose = {
  headX: 50, headY: 130,
  neckX: 58, neckY: 142,
  shoulderLX: 65, shoulderLY: 152, shoulderRX: 52, shoulderRY: 118,
  hipX: 110, hipY: 168, hipLX: 108, hipLY: 172, hipRX: 112, hipRY: 165,
  elbowLX: 65, elbowLY: 195, elbowRX: 45, elbowRY: 100,
  handLX: 65, handLY: 260, handRX: 40, handRY: 82,
  kneeLX: 145, kneeLY: 200, kneeRX: 145, kneeRY: 195,
  footLX: 175, footLY: 230, footRX: 175, footRY: 225,
};

// ── PLANK (static hold) ──────────────────────────────────────────────
const forearmPlank: JointPose = {
  ...PLANK_BASE,
  elbowLX: 55, elbowLY: 200,
  elbowRX: 55, elbowRY: 200,
  handLX: 40, handLY: 210,
  handRX: 40, handRY: 210,
};

// ── HOLLOW BODY HOLD ─────────────────────────────────────────────────
const hollowBody: JointPose = {
  headX: 55, headY: 215,
  neckX: 65, neckY: 225,
  shoulderLX: 70, shoulderLY: 232, shoulderRX: 70, shoulderRY: 220,
  hipX: 100, hipY: 245, hipLX: 98, hipLY: 248, hipRX: 102, hipRY: 242,
  elbowLX: 42, elbowLY: 210, elbowRX: 42, elbowRY: 200,
  handLX: 30, handLY: 195, handRX: 30, handRY: 185,
  kneeLX: 135, kneeLY: 235, kneeRX: 135, kneeRY: 230,
  footLX: 168, footLY: 225, footRX: 168, footRY: 220,
};

// ── BEAR HOLD ────────────────────────────────────────────────────────
const bearHold: JointPose = {
  ...QUADRUPED,
  kneeLX: 128, kneeLY: 220,
  kneeRX: 128, kneeRY: 220,
  footLX: 140, footLY: 252,
  footRX: 140, footRY: 252,
};

// ── INCHWORM ─────────────────────────────────────────────────────────
const inchwormStanding: JointPose = { ...STANDING };
const inchwormPlank: JointPose = { ...PLANK_BASE };

// ── BURPEES ──────────────────────────────────────────────────────────
const burpeeStand: JointPose = {
  ...STANDING,
  handLX: 60, handLY: 40, handRX: 140, handRY: 40,
  elbowLX: 65, elbowLY: 55, elbowRX: 135, elbowRY: 55,
};
const burpeeDown: JointPose = { ...pushUpDown };

// ── DONKEY KICK ──────────────────────────────────────────────────────
const donkeyKickDown: JointPose = { ...QUADRUPED };
const donkeyKickUp: JointPose = {
  ...QUADRUPED,
  kneeRX: 155, kneeRY: 168,
  footRX: 178, footRY: 155,
};

// ── HIP THRUST ───────────────────────────────────────────────────────
const hipThrustDown: JointPose = {
  headX: 40, headY: 195,
  neckX: 48, neckY: 205,
  shoulderLX: 52, shoulderLY: 215, shoulderRX: 52, shoulderRY: 200,
  hipX: 95, hipY: 245, hipLX: 93, hipLY: 248, hipRX: 97, hipRY: 242,
  elbowLX: 48, elbowLY: 232, elbowRX: 48, elbowRY: 188,
  handLX: 55, handLY: 240, handRX: 55, handRY: 182,
  kneeLX: 130, kneeLY: 210, kneeRX: 130, kneeRY: 210,
  footLX: 148, footLY: 260, footRX: 148, footRY: 260,
};
const hipThrustUp: JointPose = {
  ...hipThrustDown,
  hipX: 95, hipY: 210, hipLX: 93, hipLY: 213, hipRX: 97, hipRY: 207,
};

// ── KETTLEBELL SWING ─────────────────────────────────────────────────
const kbSwingBottom: JointPose = {
  headX: 100, headY: 88,
  neckX: 100, neckY: 100,
  shoulderLX: 82, shoulderLY: 110, shoulderRX: 118, shoulderRY: 110,
  hipX: 100, hipY: 160, hipLX: 88, hipLY: 163, hipRX: 112, hipRY: 163,
  elbowLX: 92, elbowLY: 148, elbowRX: 108, elbowRY: 148,
  handLX: 94, handLY: 172, handRX: 106, handRY: 172,
  kneeLX: 86, kneeLY: 212, kneeRX: 114, kneeRY: 212,
  footLX: 82, footLY: 270, footRX: 118, footRY: 270,
};
const kbSwingTop: JointPose = {
  ...STANDING,
  elbowLX: 78, elbowLY: 75, elbowRX: 122, elbowRY: 75,
  handLX: 82, handLY: 58, handRX: 118, handRY: 58,
};

// ── JUMPING JACKS ────────────────────────────────────────────────────
const jacksClose: JointPose = {
  ...STANDING,
  footLX: 93, footLY: 270, footRX: 107, footRY: 270,
  kneeLX: 93, kneeLY: 205, kneeRX: 107, kneeRY: 205,
  hipLX: 93, hipRX: 107,
};
const jacksOpen: JointPose = {
  ...STANDING,
  footLX: 65, footLY: 270, footRX: 135, footRY: 270,
  kneeLX: 73, kneeLY: 205, kneeRX: 127, kneeRY: 205,
  hipLX: 82, hipRX: 118,
  elbowLX: 50, elbowLY: 38, elbowRX: 150, elbowRY: 38,
  handLX: 48, handLY: 15, handRX: 152, handRY: 15,
};

// ── SPEED SKATER ─────────────────────────────────────────────────────
const speedSkaterRight: JointPose = {
  headX: 108, headY: 72,
  neckX: 108, neckY: 86,
  shoulderLX: 88, shoulderLY: 96, shoulderRX: 128, shoulderRY: 96,
  hipX: 108, hipY: 162, hipLX: 96, hipLY: 165, hipRX: 120, hipRY: 165,
  elbowLX: 92, elbowLY: 135, elbowRX: 130, elbowRY: 110,
  handLX: 96, handLY: 185, handRX: 138, handRY: 92,
  kneeLX: 125, kneeLY: 185, kneeRX: 110, kneeRY: 215,
  footLX: 135, footLY: 220, footRX: 108, footRY: 260,
};
const speedSkaterLeft: JointPose = {
  headX: 92, headY: 72,
  neckX: 92, neckY: 86,
  shoulderLX: 72, shoulderLY: 96, shoulderRX: 112, shoulderRY: 96,
  hipX: 92, hipY: 162, hipLX: 80, hipLY: 165, hipRX: 104, hipRY: 165,
  elbowLX: 70, elbowLY: 110, elbowRX: 108, elbowRY: 135,
  handLX: 62, handLY: 92, handRX: 104, handRY: 185,
  kneeLX: 90, kneeLY: 215, kneeRX: 75, kneeRY: 185,
  footLX: 92, footLY: 260, footRX: 65, footRY: 220,
};

// ── BALL SLAM ────────────────────────────────────────────────────────
const ballSlamTop: JointPose = {
  ...STANDING,
  elbowLX: 80, elbowLY: 28, elbowRX: 120, elbowRY: 28,
  handLX: 90, handLY: 8, handRX: 110, handRY: 8,
};
const ballSlamDown: JointPose = {
  headX: 100, headY: 88,
  neckX: 100, neckY: 100,
  shoulderLX: 82, shoulderLY: 110, shoulderRX: 118, shoulderRY: 110,
  hipX: 100, hipY: 162, hipLX: 88, hipLY: 165, hipRX: 112, hipRY: 165,
  elbowLX: 86, elbowLY: 150, elbowRX: 114, elbowRY: 150,
  handLX: 90, handLY: 185, handRX: 110, handRY: 185,
  kneeLX: 88, kneeLY: 210, kneeRX: 112, kneeRY: 210,
  footLX: 85, footLY: 270, footRX: 115, footRY: 270,
};

// ── HALF GET UP (Turkish Get Up partial) ─────────────────────────────
const halfGetUpDown: JointPose = {
  ...SUPINE_BASE,
  elbowRX: 50, elbowRY: 175,
  handRX: 50, handRY: 142,
  kneeRX: 125, kneeRY: 195,
  footRX: 142, footRY: 248,
};
const halfGetUpUp: JointPose = {
  headX: 58, headY: 172,
  neckX: 65, neckY: 185,
  shoulderLX: 68, shoulderLY: 196, shoulderRX: 60, shoulderRY: 178,
  hipX: 102, hipY: 242, hipLX: 100, hipLY: 245, hipRX: 104, hipRY: 239,
  elbowLX: 52, elbowLY: 258, elbowRX: 50, elbowRY: 148,
  handLX: 45, handLY: 268, handRX: 50, handRY: 118,
  kneeLX: 130, kneeLY: 212, kneeRX: 128, kneeRY: 200,
  footLX: 148, footLY: 268, footRX: 145, footRY: 242,
};

// ── RUSSIAN TWIST ────────────────────────────────────────────────────
const russianTwistA: JointPose = {
  headX: 60, headY: 180,
  neckX: 68, neckY: 192,
  shoulderLX: 72, shoulderLY: 200, shoulderRX: 72, shoulderRY: 188,
  hipX: 100, hipY: 240, hipLX: 98, hipLY: 243, hipRX: 102, hipRY: 237,
  elbowLX: 48, elbowLY: 200, elbowRX: 50, elbowRY: 188,
  handLX: 38, handLY: 195, handRX: 42, handRY: 183,
  kneeLX: 125, kneeLY: 210, kneeRX: 125, kneeRY: 210,
  footLX: 140, footLY: 250, footRX: 140, footRY: 250,
};
const russianTwistB: JointPose = {
  ...russianTwistA,
  headX: 80,
  neckX: 85,
  shoulderLX: 88, shoulderRX: 88,
  elbowLX: 100, elbowRX: 98,
  handLX: 108, handRX: 106,
};

// ══════════════════════════════════════════════════════════════════════
// ANIMATION REGISTRY
// ══════════════════════════════════════════════════════════════════════

export const ANIMATION_REGISTRY: ExerciseAnimationDef[] = [
  // ── LOWER BODY ──
  {
    key: "goblet-squat", name: "Goblet Squat", category: "lower-body",
    movementType: "squat", orientation: "standing", loopType: "ping-pong",
    unilateral: false, holdable: false, defaultTempo: "3-1-2",
    keyframes: [gobletSquatTop, gobletSquatBottom, gobletSquatTop],
    cycleDuration: 3000,
  },
  {
    key: "romanian-deadlift", name: "Romanian Deadlift", category: "lower-body",
    movementType: "hinge", orientation: "standing", loopType: "ping-pong",
    unilateral: false, holdable: false, defaultTempo: "3-1-2",
    keyframes: [rdlTop, rdlBottom, rdlTop],
    cycleDuration: 3200,
  },
  {
    key: "reverse-lunge", name: "Reverse Lunge", category: "lower-body",
    movementType: "lunge", orientation: "standing", loopType: "ping-pong",
    unilateral: true, holdable: false, defaultTempo: "3-1-2",
    keyframes: [reverseLungeTop, reverseLungeBottom, reverseLungeTop],
    cycleDuration: 3000,
  },
  {
    key: "step-up", name: "Step-Up", category: "lower-body",
    movementType: "lunge", orientation: "standing", loopType: "ping-pong",
    unilateral: true, holdable: false, defaultTempo: "3-1-2",
    keyframes: [stepUpBottom, stepUpTop, stepUpBottom],
    cycleDuration: 2800,
  },

  // ── GLUTES ──
  {
    key: "glute-bridge", name: "Glute Bridge", category: "glutes",
    movementType: "bridge", orientation: "supine", loopType: "ping-pong",
    unilateral: false, holdable: true, defaultTempo: "1-1-3",
    keyframes: [gluteBridgeDown, gluteBridgeUp, gluteBridgeDown],
    cycleDuration: 2800,
  },
  {
    key: "hip-thrust", name: "Hip Thrust", category: "glutes",
    movementType: "bridge", orientation: "supine", loopType: "ping-pong",
    unilateral: false, holdable: true,
    keyframes: [hipThrustDown, hipThrustUp, hipThrustDown],
    cycleDuration: 2800,
  },
  {
    key: "fire-hydrant", name: "Fire Hydrant", category: "glutes",
    movementType: "isolation", orientation: "quadruped", loopType: "ping-pong",
    unilateral: true, holdable: false,
    keyframes: [fireHydrantClosed, fireHydrantOpen, fireHydrantClosed],
    cycleDuration: 2400,
  },
  {
    key: "donkey-kick", name: "Donkey Kick", category: "glutes",
    movementType: "isolation", orientation: "quadruped", loopType: "ping-pong",
    unilateral: true, holdable: false,
    keyframes: [donkeyKickDown, donkeyKickUp, donkeyKickDown],
    cycleDuration: 2400,
  },
  {
    key: "lateral-band-walk", name: "Lateral Band Walk", category: "glutes",
    movementType: "isolation", orientation: "standing", loopType: "loop",
    unilateral: false, holdable: false,
    keyframes: [lateralWalkA, lateralWalkB, lateralWalkA],
    cycleDuration: 2000,
  },

  // ── UPPER BODY PUSH ──
  {
    key: "push-up", name: "Push-Up", category: "upper-push",
    movementType: "push", orientation: "prone", loopType: "ping-pong",
    unilateral: false, holdable: false, defaultTempo: "3-1-2",
    keyframes: [pushUpUp, pushUpDown, pushUpUp],
    cycleDuration: 2400,
  },
  {
    key: "chest-press-on-mat", name: "Chest Press On Mat", category: "upper-push",
    movementType: "push", orientation: "supine", loopType: "ping-pong",
    unilateral: false, holdable: false, defaultTempo: "3-1-2",
    keyframes: [chestPressDown, chestPressUp, chestPressDown],
    cycleDuration: 2600,
  },

  // ── UPPER BODY PULL ──
  {
    key: "single-arm-dumbbell-row", name: "Single-Arm Dumbbell Row", category: "upper-pull",
    movementType: "pull", orientation: "standing", loopType: "ping-pong",
    unilateral: true, holdable: false, defaultTempo: "2-1-3",
    keyframes: [singleArmRowDown, singleArmRowUp, singleArmRowDown],
    cycleDuration: 2800,
  },

  // ── SHOULDERS / ARMS ──
  {
    key: "lateral-raise", name: "Lateral Raise", category: "shoulders-arms",
    movementType: "isolation", orientation: "standing", loopType: "ping-pong",
    unilateral: false, holdable: false, defaultTempo: "2-2-3",
    keyframes: [lateralRaiseDown, lateralRaiseUp, lateralRaiseDown],
    cycleDuration: 3000,
  },
  {
    key: "bicep-curl", name: "Bicep Curl", category: "shoulders-arms",
    movementType: "isolation", orientation: "standing", loopType: "ping-pong",
    unilateral: false, holdable: false, defaultTempo: "2-1-3",
    keyframes: [bicepCurlDown, bicepCurlUp, bicepCurlDown],
    cycleDuration: 2600,
  },

  // ── CORE / CONDITIONING ──
  {
    key: "dead-bug", name: "Dead Bug", category: "core",
    movementType: "core", orientation: "supine", loopType: "ping-pong",
    unilateral: true, holdable: false,
    keyframes: [deadBugA, deadBugB, deadBugA],
    cycleDuration: 3200,
  },
  {
    key: "bird-dog", name: "Bird Dog", category: "core",
    movementType: "core", orientation: "quadruped", loopType: "ping-pong",
    unilateral: true, holdable: true,
    keyframes: [birdDogCenter, birdDogExtended, birdDogCenter],
    cycleDuration: 3000,
  },
  {
    key: "plank-shoulder-taps", name: "Plank Shoulder Taps", category: "core",
    movementType: "core", orientation: "prone", loopType: "loop",
    unilateral: true, holdable: false,
    keyframes: [plankTapCenter, plankTapRight, plankTapCenter, plankTapLeft, plankTapCenter],
    cycleDuration: 3000,
  },
  {
    key: "mountain-climbers", name: "Mountain Climbers", category: "core",
    movementType: "locomotion", orientation: "prone", loopType: "loop",
    unilateral: true, holdable: false,
    keyframes: [mountainClimberA, mountainClimberB, mountainClimberA],
    cycleDuration: 1200,
  },
  {
    key: "side-plank", name: "Side Plank", category: "core",
    movementType: "plank", orientation: "side", loopType: "hold",
    unilateral: true, holdable: true,
    keyframes: [sidePlankHold, sidePlankHold],
    cycleDuration: 2000,
  },
  {
    key: "forearm-plank", name: "Forearm Plank", category: "core",
    movementType: "plank", orientation: "prone", loopType: "hold",
    unilateral: false, holdable: true,
    keyframes: [forearmPlank, forearmPlank],
    cycleDuration: 2000,
  },
  {
    key: "plank", name: "Plank", category: "core",
    movementType: "plank", orientation: "prone", loopType: "hold",
    unilateral: false, holdable: true,
    keyframes: [PLANK_BASE, PLANK_BASE],
    cycleDuration: 2000,
  },
  {
    key: "russian-twist", name: "Russian Twist", category: "core",
    movementType: "core", orientation: "supine", loopType: "loop",
    unilateral: false, holdable: false,
    keyframes: [russianTwistA, russianTwistB, russianTwistA],
    cycleDuration: 2000,
  },
  {
    key: "hollow-body-hold", name: "Hollow Body Hold", category: "core",
    movementType: "core", orientation: "supine", loopType: "hold",
    unilateral: false, holdable: true,
    keyframes: [hollowBody, hollowBody],
    cycleDuration: 2000,
  },
  {
    key: "bear-hold", name: "Bear Hold", category: "core",
    movementType: "plank", orientation: "quadruped", loopType: "hold",
    unilateral: false, holdable: true,
    keyframes: [bearHold, bearHold],
    cycleDuration: 2000,
  },
  {
    key: "inchworm", name: "Inchworm", category: "core",
    movementType: "locomotion", orientation: "standing", loopType: "loop",
    unilateral: false, holdable: false,
    keyframes: [inchwormStanding, inchwormPlank, inchwormStanding],
    cycleDuration: 3600,
  },
  {
    key: "burpees", name: "Burpees", category: "core",
    movementType: "compound", orientation: "standing", loopType: "loop",
    unilateral: false, holdable: false,
    keyframes: [burpeeStand, burpeeDown, burpeeStand],
    cycleDuration: 2400,
  },

  // ── STACY SIMS ADDITIONS ──
  {
    key: "kettlebell-swing", name: "Kettlebell Swing", category: "lower-body",
    movementType: "hinge", orientation: "standing", loopType: "ping-pong",
    unilateral: false, holdable: false,
    keyframes: [kbSwingBottom, kbSwingTop, kbSwingBottom],
    cycleDuration: 2000,
  },
  {
    key: "jumping-jacks", name: "Jumping Jacks", category: "core",
    movementType: "locomotion", orientation: "standing", loopType: "ping-pong",
    unilateral: false, holdable: false,
    keyframes: [jacksClose, jacksOpen, jacksClose],
    cycleDuration: 1400,
  },
  {
    key: "speed-skater", name: "Speed Skater", category: "lower-body",
    movementType: "locomotion", orientation: "standing", loopType: "loop",
    unilateral: true, holdable: false,
    keyframes: [speedSkaterRight, speedSkaterLeft, speedSkaterRight],
    cycleDuration: 1800,
  },
  {
    key: "ball-slam", name: "Ball Slam", category: "core",
    movementType: "compound", orientation: "standing", loopType: "ping-pong",
    unilateral: false, holdable: false,
    keyframes: [ballSlamTop, ballSlamDown, ballSlamTop],
    cycleDuration: 2000,
  },
  {
    key: "half-get-up", name: "Half Get Up", category: "core",
    movementType: "compound", orientation: "supine", loopType: "ping-pong",
    unilateral: true, holdable: false,
    keyframes: [halfGetUpDown, halfGetUpUp, halfGetUpDown],
    cycleDuration: 3200,
  },
];

// Build a lookup map
const _registryMap = new Map<string, ExerciseAnimationDef>();
ANIMATION_REGISTRY.forEach(a => _registryMap.set(a.key, a));

export function getAnimationByKey(key: string): ExerciseAnimationDef | undefined {
  return _registryMap.get(key);
}

// ══════════════════════════════════════════════════════════════════════
// EXERCISE NAME → ANIMATION KEY MAPPING
// ══════════════════════════════════════════════════════════════════════

const EXERCISE_NAME_MAP: Record<string, string> = {
  // Direct matches
  "Goblet Squat": "goblet-squat",
  "Romanian Deadlift": "romanian-deadlift",
  "Romanian Deadlift Slow": "romanian-deadlift",
  "Reverse Lunge Alternating": "reverse-lunge",
  "Reverse Lunge Tempo": "reverse-lunge",
  "Reverse Lunge To Bicep Curl": "reverse-lunge",
  "Reverse Lunge To Curl": "reverse-lunge",
  "Step-Up": "step-up",
  "Glute Bridge": "glute-bridge",
  "Glute Bridge With Band": "glute-bridge",
  "Glute Bridge Fast": "glute-bridge",
  "Glute Bridge March": "glute-bridge",
  "Banded Glute Bridge": "glute-bridge",
  "Bridge Pulse": "glute-bridge",
  "Single-Leg Bridge": "glute-bridge",
  "Single-Leg Glute Bridge": "glute-bridge",
  "Hip Thrust With Dumbbell": "hip-thrust",
  "Hip Thrust With 4-Sec Hold": "hip-thrust",
  "Hip Thrust Single Leg": "hip-thrust",
  "Single-Leg Hip Thrust": "hip-thrust",
  "Fire Hydrant": "fire-hydrant",
  "Fire Hydrant Pulse": "fire-hydrant",
  "Donkey Kicks With Band": "donkey-kick",
  "Donkey Kick With Band": "donkey-kick",
  "Lateral Band Walk": "lateral-band-walk",
  "Push-Up": "push-up",
  "Push-Up Full Or Modified": "push-up",
  "Push-Up To Downward Dog": "push-up",
  "Push-Up Tempo": "push-up",
  "Pike Push-Up": "push-up",
  "Single-Arm Push-Up Prep": "push-up",
  "Plank To Push-Up": "push-up",
  "Plank Jack To Push-Up": "push-up",
  "Chest Press On Mat": "chest-press-on-mat",
  "Tempo Chest Press": "chest-press-on-mat",
  "Single-Arm Floor Press": "chest-press-on-mat",
  "Chest Fly On Mat": "chest-press-on-mat",
  "Chest Fly Heavy": "chest-press-on-mat",
  "Chest Fly With Long Eccentric": "chest-press-on-mat",
  "Single-Arm Chest Fly On Mat": "chest-press-on-mat",
  "Single-Arm Dumbbell Row": "single-arm-dumbbell-row",
  "Single-Arm Row To Rotation": "single-arm-dumbbell-row",
  "Single-Arm Row Stable": "single-arm-dumbbell-row",
  "Single-Arm Row In Side Plank": "single-arm-dumbbell-row",
  "Renegade Row": "single-arm-dumbbell-row",
  "Bent-Over Row Bilateral": "single-arm-dumbbell-row",
  "Heavy Bent-Over Row": "single-arm-dumbbell-row",
  "Tempo Bent-Over Row": "single-arm-dumbbell-row",
  "Underhand Row Supinated Grip": "single-arm-dumbbell-row",
  "Lateral Raise": "lateral-raise",
  "Tempo Lateral Raise": "lateral-raise",
  "Lateral Lunge To Lateral Raise": "lateral-raise",
  "Rear Delt Fly": "lateral-raise",
  "Y-T-W Raises": "lateral-raise",
  "Bicep Curl": "bicep-curl",
  "Bicep Curl 21s": "bicep-curl",
  "Slow Bicep Curl": "bicep-curl",
  "Hammer Curl": "bicep-curl",
  "Tricep Overhead Extension": "bicep-curl",
  "Tricep Overhead Extension Slow": "bicep-curl",
  "Tricep Kickback": "bicep-curl",
  "Dead Bug": "dead-bug",
  "Dead Bug Slow": "dead-bug",
  "Dead Bug With Dumbbell Press": "dead-bug",
  "Dead Bug With Band": "dead-bug",
  "Bird Dog": "bird-dog",
  "Bird Dog Row": "bird-dog",
  "Bird Dog Slow": "bird-dog",
  "Bird Dog Hold": "bird-dog",
  "Plank Shoulder Taps": "plank-shoulder-taps",
  "Bear Hold Shoulder Tap": "plank-shoulder-taps",
  "Mountain Climbers": "mountain-climbers",
  "Mountain Climber Sprint": "mountain-climbers",
  "Mountain Climber Cross-Body": "mountain-climbers",
  "Side Plank": "side-plank",
  "Side Plank With Hip Dip": "side-plank",
  "Copenhagen Side Plank": "side-plank",
  "Forearm Plank": "forearm-plank",
  "Plank": "plank",
  "Plank Row Hold": "plank",
  "Russian Twist": "russian-twist",
  "Hollow Body Hold": "hollow-body-hold",
  "Hollow Body Flutter Kicks": "hollow-body-hold",
  "Hollow Body Rock": "hollow-body-hold",
  "Bear Hold": "bear-hold",
  "Inchworm": "inchworm",
  "Burpee": "burpees",
  "Renegade Row To Burpee": "burpees",
  "Dumbbell Deadlift": "romanian-deadlift",
  "Dumbbell Deadlift Slow": "romanian-deadlift",
  "Single-Leg Romanian Deadlift": "romanian-deadlift",
  "Single-Leg Deadlift": "romanian-deadlift",
  "Sumo Deadlift": "romanian-deadlift",
  "Split Squat": "reverse-lunge",
  "Rear Foot Elevated Split Squat": "reverse-lunge",
  "Walking Lunge": "reverse-lunge",
  "Curtsy Lunge Alternating": "reverse-lunge",
  "Curtsy Lunge To Knee Drive": "reverse-lunge",
  "Lateral Lunge": "reverse-lunge",
  "Power Lunge Alternating": "reverse-lunge",
  "Sumo Squat": "goblet-squat",
  "Sumo Squat Pulse": "goblet-squat",
  "Sumo Squat Hold": "goblet-squat",
  "Goblet Squat To Press": "goblet-squat",
  "Goblet Squat Pulse": "goblet-squat",
  "Goblet Squat To Pause": "goblet-squat",
  "Tempo Goblet Squat": "goblet-squat",
  "Squat Pulse": "goblet-squat",
  "Squat Jump Or Squat Pulse": "goblet-squat",
  "Jump Squat": "goblet-squat",
  "Suitcase Carry Squat": "goblet-squat",
  "Dumbbell Power Clean": "romanian-deadlift",
  "Push Press": "lateral-raise",
  "Strict Press": "lateral-raise",
  "Arnold Press": "lateral-raise",
  "Single-Arm Overhead Press": "lateral-raise",
  "Overhead Press Seated": "lateral-raise",
  "Dumbbell Thruster": "goblet-squat",
  "Good Morning": "romanian-deadlift",
  "Banded Clamshell": "fire-hydrant",
  "Clam": "fire-hydrant",
  "Clam With Band": "fire-hydrant",
  "Face Pull With Band": "single-arm-dumbbell-row",
  "Band Pull-Apart": "lateral-raise",
  "Upright Row": "bicep-curl",
  "Bear Crawl Forward And Back": "bear-hold",
  "Frog Bridge": "glute-bridge",
  "Box Step-Up Jump": "step-up",
  "Squat Jump With Dumbbells": "goblet-squat",
  "Broad Jump To Squat": "goblet-squat",
  "Lateral Bound": "reverse-lunge",
  "Lateral Bound Stick": "reverse-lunge",
  "Skater Jump": "reverse-lunge",
  "Tuck Jump": "goblet-squat",
  "V-Up": "hollow-body-hold",
  "Pallof Press Hold": "forearm-plank",
  "Plank To Down Dog Tap": "plank-shoulder-taps",
  "Plank To Knee Tap": "plank-shoulder-taps",
  "Prone Y Raise": "bird-dog",
  "Superman Hold": "bird-dog",
  "Swimming": "bird-dog",
  "Teaser Prep": "hollow-body-hold",
  "The Hundred": "hollow-body-hold",
  "Roll-Up": "hollow-body-hold",
  "Single-Leg Circle": "hollow-body-hold",
  "Half-Kneeling Chop": "russian-twist",
  "Thoracic Rotation Half-Kneeling": "russian-twist",
  "Lying Hamstring Curl With Band": "glute-bridge",
  "Sprint In Place": "mountain-climbers",
  "Calf Raise With Dumbbells": "step-up",
  "Single-Leg Calf Raise": "step-up",
  "Wall Sit": "goblet-squat",
  "Wall Sit Hold": "goblet-squat",
  "Tricep Dip On Chair": "push-up",
  "Pull-Up Negative Or Band-Assisted": "single-arm-dumbbell-row",
  "Side-Lying Leg Lift Series": "fire-hydrant",
  "Side-Lying Leg Raise": "fire-hydrant",
  "Single-Leg Balance Eyes Closed": "step-up",

  // ── Stacy Sims — SIT / Cardio ──
  "Tabata Sprint": "mountain-climbers",
  "40/20 Sprint": "mountain-climbers",
  "30 On 30 Off Sprint": "mountain-climbers",
  "Uphill Sprint": "step-up",
  "Kettlebell Swing": "kettlebell-swing",
  "HIIT Hard Effort": "mountain-climbers",
  "SIT All-Out Sprint": "mountain-climbers",

  // ── Stacy Sims — Heavy Lifting ──
  "Squat": "goblet-squat",
  "Overhead Squat": "goblet-squat",
  "Deadlift": "romanian-deadlift",
  "Bench Press": "chest-press-on-mat",
  "Pendlay Row": "single-arm-dumbbell-row",

  // ── Stacy Sims — Plyometrics ──
  "Squat Jump": "goblet-squat",
  "Jumping Jacks": "jumping-jacks",
  "Side Hops": "reverse-lunge",
  "Skipping": "step-up",
  "Switch Leg Lunges": "reverse-lunge",
  "Sumo Squat Jumps": "goblet-squat",
  "Speed Skater": "speed-skater",
  "Depth Jump": "step-up",
  "Box Jump": "step-up",
  "High-Knees Power Skip": "mountain-climbers",
  "Single-Leg Jumping Lunge": "reverse-lunge",

  // ── Stacy Sims — ROAR Body Weight ──
  "Body Weight Squat": "goblet-squat",
  "Pistol Squat": "goblet-squat",
  "X Lunge": "reverse-lunge",
  "Pushup Plank Jump": "burpees",

  // ── Stacy Sims — Medicine Ball ──
  "Medicine Ball Twist": "russian-twist",
  "Wall Ball": "goblet-squat",
  "Ball Slam": "ball-slam",
  "Medicine Ball Clean": "romanian-deadlift",
  "Medicine Ball Thruster": "goblet-squat",

  // ── Stacy Sims — Kettlebell ──
  "Kettlebell Single-Leg Deadlift": "romanian-deadlift",
  "Hang High Pull": "single-arm-dumbbell-row",
  "Snatch Pull and Push Press": "romanian-deadlift",
  "Half Get Up": "half-get-up",
  "Split Squat Kettlebell Pass": "reverse-lunge",

  // ── Stacy Sims — Foam Rolling ──
  "Plantar Roll": "step-up",
  "Calf Smash": "step-up",
  "Hamstring Roll": "glute-bridge",
  "Quad Roll": "push-up",
  "Anterior Hip Smash": "push-up",
  "Adductor Smash": "fire-hydrant",
  "Glute Smash": "donkey-kick",
  "Lower-Back Smash": "bird-dog",
  "IT Band Roll": "side-plank",

  // ── Stacy Sims — Mobility ──
  "SI Joint Glide": "dead-bug",
  "Foam Roll with Lat Rotation": "bird-dog",
  "Lat Gliding": "lateral-raise",
  "Lateral Step and Reach": "reverse-lunge",
  "Lateral Step and Step Behind": "lateral-band-walk",

  // ── Stacy Sims — Core ──
  "Windshield Wipers": "russian-twist",
  "Shoulder Bridge": "glute-bridge",
  "Superman": "bird-dog",
  "Sweeping Side Plank": "side-plank",
  "Mountain Climber": "mountain-climbers",

  // ── Stacy Sims — Pelvic Floor ──
  "Kegels": "glute-bridge",
  "Elevator Abs": "dead-bug",
  "Child's Pose Breathing": "bird-dog",

  // ── Stacy Sims — PEP Plan ──
  "Bridge with Alternating Hip Flexion": "glute-bridge",
  "Plank with Knee Dips": "plank-shoulder-taps",
  "Single Toe Raise": "step-up",
  "Neutral Spine Sequence": "dead-bug",
};

/**
 * Look up animation for an exercise name from a workout.
 * Returns undefined if no animation exists.
 */
export function getAnimationForExercise(exerciseName: string): ExerciseAnimationDef | undefined {
  const key = EXERCISE_NAME_MAP[exerciseName];
  if (key) return _registryMap.get(key);
  
  // Fuzzy fallback: normalise and try partial match
  const normalised = exerciseName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
  for (const [k, anim] of _registryMap) {
    if (normalised.includes(k) || k.includes(normalised)) return anim;
  }
  return undefined;
}
