/**
 * SIGNAL Exercise Animation System — SVG Skeletal Rig POC
 * 
 * A single reusable female figure driven by joint positions.
 * Each exercise defines keyframes as arrays of joint poses.
 * The rig interpolates between poses using requestAnimationFrame.
 */

import { useEffect, useRef, useState, useCallback } from "react";

// ── Joint-based pose system ──────────────────────────────────────────
// All coordinates are in a 200×300 viewBox (normalised)

interface JointPose {
  // Head
  headX: number; headY: number;
  // Torso
  neckX: number; neckY: number;
  shoulderLX: number; shoulderLY: number;
  shoulderRX: number; shoulderRY: number;
  hipX: number; hipY: number;
  hipLX: number; hipLY: number;
  hipRX: number; hipRY: number;
  // Arms
  elbowLX: number; elbowLY: number;
  elbowRX: number; elbowRY: number;
  handLX: number; handLY: number;
  handRX: number; handRY: number;
  // Legs
  kneeLX: number; kneeLY: number;
  kneeRX: number; kneeRY: number;
  footLX: number; footLY: number;
  footRX: number; footRY: number;
}

export interface ExerciseAnimation {
  id: string;
  name: string;
  keyframes: JointPose[];
  /** ms per full cycle (all keyframes + return) */
  cycleDuration: number;
}

// ── Pose definitions for test exercises ──────────────────────────────

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

// ── GOBLET SQUAT ─────────────────────────────────────────────────────
const gobletSquatDown: JointPose = {
  headX: 100, headY: 65,
  neckX: 100, neckY: 80,
  shoulderLX: 78, shoulderLY: 88,
  shoulderRX: 122, shoulderRY: 88,
  hipX: 100, hipY: 160,
  hipLX: 85, hipLY: 163,
  hipRX: 115, hipRY: 163,
  elbowLX: 72, elbowLY: 115,
  elbowRX: 128, elbowRY: 115,
  handLX: 88, handLY: 100,
  handRX: 112, handRY: 100,
  kneeLX: 68, kneeLY: 200,
  kneeRX: 132, kneeRY: 200,
  footLX: 78, footLY: 270,
  footRX: 122, footRY: 270,
};

const gobletSquatTop: JointPose = {
  ...STANDING,
  handLX: 88, handLY: 80,
  handRX: 112, handRY: 80,
  elbowLX: 72, elbowLY: 90,
  elbowRX: 128, elbowRY: 90,
};

// ── GLUTE BRIDGE ─────────────────────────────────────────────────────
const gluteBridgeDown: JointPose = {
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

const gluteBridgeUp: JointPose = {
  ...gluteBridgeDown,
  hipX: 90, hipY: 205,
  hipLX: 88, hipLY: 208,
  hipRX: 92, hipRY: 202,
  shoulderLX: 55, shoulderLY: 232,
  shoulderRX: 55, shoulderRY: 218,
};

// ── PUSH-UP ──────────────────────────────────────────────────────────
const pushUpUp: JointPose = {
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

const pushUpDown: JointPose = {
  headX: 40, headY: 185,
  neckX: 52, neckY: 192,
  shoulderLX: 62, shoulderLY: 198,
  shoulderRX: 62, shoulderRY: 190,
  hipX: 120, hipY: 200,
  hipLX: 118, hipLY: 203,
  hipRX: 122, hipRY: 197,
  elbowLX: 48, elbowLY: 230,
  elbowRX: 78, elbowRY: 230,
  handLX: 48, handLY: 260,
  handRX: 78, handRY: 260,
  kneeLX: 150, kneeLY: 205,
  kneeRX: 150, kneeRY: 205,
  footLX: 178, footLY: 210,
  footRX: 178, footRY: 210,
};

// ── DEAD BUG ─────────────────────────────────────────────────────────
const deadBugA: JointPose = {
  headX: 40, headY: 215,
  neckX: 52, neckY: 222,
  shoulderLX: 60, shoulderLY: 230,
  shoulderRX: 60, shoulderRY: 215,
  hipX: 100, hipY: 235,
  hipLX: 98, hipLY: 238,
  hipRX: 102, hipRY: 232,
  // Left arm up, right arm down
  elbowLX: 42, elbowLY: 195,
  elbowRX: 60, elbowRY: 250,
  handLX: 30, handLY: 170,
  handRX: 65, handRY: 260,
  // Right leg up, left leg down
  kneeLX: 130, kneeLY: 260,
  kneeRX: 120, kneeRY: 200,
  footLX: 145, footLY: 270,
  footRX: 140, footRY: 180,
};

const deadBugB: JointPose = {
  ...deadBugA,
  // Swap: right arm up, left arm down
  elbowLX: 60, elbowLY: 250,
  elbowRX: 42, elbowRY: 195,
  handLX: 65, handLY: 260,
  handRX: 30, handRY: 170,
  // Swap: left leg up, right leg down
  kneeLX: 120, kneeLY: 200,
  kneeRX: 130, kneeRY: 260,
  footLX: 140, footLY: 180,
  footRX: 145, footRY: 270,
};

// ── Export exercise data ─────────────────────────────────────────────

export const EXERCISE_ANIMATIONS: ExerciseAnimation[] = [
  {
    id: "goblet-squat",
    name: "Goblet Squat",
    keyframes: [gobletSquatTop, gobletSquatDown, gobletSquatTop],
    cycleDuration: 3000,
  },
  {
    id: "glute-bridge",
    name: "Glute Bridge",
    keyframes: [gluteBridgeDown, gluteBridgeUp, gluteBridgeDown],
    cycleDuration: 2800,
  },
  {
    id: "push-up",
    name: "Push-Up",
    keyframes: [pushUpUp, pushUpDown, pushUpUp],
    cycleDuration: 2400,
  },
  {
    id: "dead-bug",
    name: "Dead Bug",
    keyframes: [deadBugA, deadBugB, deadBugA],
    cycleDuration: 3200,
  },
];

// ── Interpolation helper ─────────────────────────────────────────────

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpPose(a: JointPose, b: JointPose, t: number): JointPose {
  const result = {} as JointPose;
  for (const key of Object.keys(a) as (keyof JointPose)[]) {
    result[key] = lerp(a[key], b[key], t);
  }
  return result;
}

function easeInOutSine(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

function getPoseAtTime(keyframes: JointPose[], cycleDuration: number, elapsed: number): JointPose {
  const segments = keyframes.length - 1;
  const segDuration = cycleDuration / segments;
  const looped = elapsed % cycleDuration;
  const segIndex = Math.min(Math.floor(looped / segDuration), segments - 1);
  const segT = easeInOutSine((looped - segIndex * segDuration) / segDuration);
  return lerpPose(keyframes[segIndex], keyframes[segIndex + 1], segT);
}

// ── Colours ──────────────────────────────────────────────────────────
const SKIN = "hsl(25, 40%, 82%)";
const HAIR = "hsl(22, 30%, 30%)";
const TOP = "hsl(270, 25%, 55%)";       // Signal violet
const BOTTOM = "hsl(270, 20%, 35%)";
const STROKE_C = "hsl(270, 20%, 40%)";
const SHOE = "hsl(270, 15%, 50%)";

// ── SVG Rig Component ────────────────────────────────────────────────

interface ExerciseRigProps {
  exercise: ExerciseAnimation;
  size?: number;
  playing?: boolean;
  className?: string;
}

export default function ExerciseRig({ exercise, size = 200, playing = true, className = "" }: ExerciseRigProps) {
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const [pose, setPose] = useState<JointPose>(exercise.keyframes[0]);

  const animate = useCallback((timestamp: number) => {
    if (!startRef.current) startRef.current = timestamp;
    const elapsed = timestamp - startRef.current;
    setPose(getPoseAtTime(exercise.keyframes, exercise.cycleDuration, elapsed));
    rafRef.current = requestAnimationFrame(animate);
  }, [exercise]);

  useEffect(() => {
    if (playing) {
      startRef.current = 0;
      rafRef.current = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, animate]);

  const p = pose;
  const sw = 2.5; // stroke width

  return (
    <svg
      viewBox="0 0 200 300"
      width={size}
      height={size * 1.5}
      className={className}
      style={{ overflow: "visible" }}
    >
      {/* Hair (behind head) */}
      <ellipse cx={p.headX} cy={p.headY - 2} rx={14} ry={16} fill={HAIR} opacity={0.85} />

      {/* Head */}
      <circle cx={p.headX} cy={p.headY} r={11} fill={SKIN} stroke={STROKE_C} strokeWidth={sw * 0.6} />

      {/* Torso - top */}
      <line x1={p.neckX} y1={p.neckY} x2={p.shoulderLX} y2={p.shoulderLY} stroke={TOP} strokeWidth={sw * 3} strokeLinecap="round" />
      <line x1={p.neckX} y1={p.neckY} x2={p.shoulderRX} y2={p.shoulderRY} stroke={TOP} strokeWidth={sw * 3} strokeLinecap="round" />

      {/* Torso body */}
      <line x1={p.shoulderLX} y1={p.shoulderLY} x2={p.hipLX} y2={p.hipLY} stroke={TOP} strokeWidth={sw * 2.5} strokeLinecap="round" />
      <line x1={p.shoulderRX} y1={p.shoulderRY} x2={p.hipRX} y2={p.hipRY} stroke={TOP} strokeWidth={sw * 2.5} strokeLinecap="round" />
      <line x1={p.neckX} y1={p.neckY} x2={p.hipX} y2={p.hipY} stroke={TOP} strokeWidth={sw * 2.8} strokeLinecap="round" />

      {/* Neck */}
      <line x1={p.headX} y1={p.headY + 9} x2={p.neckX} y2={p.neckY} stroke={SKIN} strokeWidth={sw * 1.5} strokeLinecap="round" />

      {/* Arms - upper */}
      <line x1={p.shoulderLX} y1={p.shoulderLY} x2={p.elbowLX} y2={p.elbowLY} stroke={SKIN} strokeWidth={sw * 1.6} strokeLinecap="round" />
      <line x1={p.shoulderRX} y1={p.shoulderRY} x2={p.elbowRX} y2={p.elbowRY} stroke={SKIN} strokeWidth={sw * 1.6} strokeLinecap="round" />

      {/* Arms - lower */}
      <line x1={p.elbowLX} y1={p.elbowLY} x2={p.handLX} y2={p.handLY} stroke={SKIN} strokeWidth={sw * 1.4} strokeLinecap="round" />
      <line x1={p.elbowRX} y1={p.elbowRY} x2={p.handRX} y2={p.handRY} stroke={SKIN} strokeWidth={sw * 1.4} strokeLinecap="round" />

      {/* Hands */}
      <circle cx={p.handLX} cy={p.handLY} r={3.5} fill={SKIN} />
      <circle cx={p.handRX} cy={p.handRY} r={3.5} fill={SKIN} />

      {/* Legs - upper */}
      <line x1={p.hipLX} y1={p.hipLY} x2={p.kneeLX} y2={p.kneeLY} stroke={BOTTOM} strokeWidth={sw * 2.2} strokeLinecap="round" />
      <line x1={p.hipRX} y1={p.hipRY} x2={p.kneeRX} y2={p.kneeRY} stroke={BOTTOM} strokeWidth={sw * 2.2} strokeLinecap="round" />

      {/* Legs - lower */}
      <line x1={p.kneeLX} y1={p.kneeLY} x2={p.footLX} y2={p.footLY} stroke={SKIN} strokeWidth={sw * 1.8} strokeLinecap="round" />
      <line x1={p.kneeRX} y1={p.kneeRY} x2={p.footRX} y2={p.footRY} stroke={SKIN} strokeWidth={sw * 1.8} strokeLinecap="round" />

      {/* Shoes */}
      <ellipse cx={p.footLX + 3} cy={p.footLY + 2} rx={7} ry={4} fill={SHOE} />
      <ellipse cx={p.footRX + 3} cy={p.footRY + 2} rx={7} ry={4} fill={SHOE} />

      {/* Joint dots (sketch accent) */}
      {[
        [p.shoulderLX, p.shoulderLY], [p.shoulderRX, p.shoulderRY],
        [p.elbowLX, p.elbowLY], [p.elbowRX, p.elbowRY],
        [p.hipLX, p.hipLY], [p.hipRX, p.hipRY],
        [p.kneeLX, p.kneeLY], [p.kneeRX, p.kneeRY],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={2} fill={STROKE_C} opacity={0.3} />
      ))}
    </svg>
  );
}
