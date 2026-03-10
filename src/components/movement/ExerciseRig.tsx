/**
 * SIGNAL Exercise Rig — Reusable SVG female figure
 * Renders a single animated figure driven by JointPose keyframe data.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import type { JointPose, ExerciseAnimationDef } from "@/data/exercise-animations";

// ── Interpolation ────────────────────────────────────────────────────

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
  if (keyframes.length < 2) return keyframes[0];
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
const TOP = "hsl(270, 25%, 55%)";
const BOTTOM = "hsl(270, 20%, 35%)";
const STROKE_C = "hsl(270, 20%, 40%)";
const SHOE = "hsl(270, 15%, 50%)";

// ── Component ────────────────────────────────────────────────────────

interface ExerciseRigProps {
  animation: ExerciseAnimationDef;
  size?: number;
  playing?: boolean;
  className?: string;
  /** If true, mirror the SVG horizontally */
  mirrored?: boolean;
}

export default function ExerciseRig({ animation, size = 200, playing = true, className = "", mirrored = false }: ExerciseRigProps) {
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const [pose, setPose] = useState<JointPose>(animation.keyframes[0]);

  const animate = useCallback((timestamp: number) => {
    if (!startRef.current) startRef.current = timestamp;
    const elapsed = timestamp - startRef.current;
    setPose(getPoseAtTime(animation.keyframes, animation.cycleDuration, elapsed));
    rafRef.current = requestAnimationFrame(animate);
  }, [animation]);

  useEffect(() => {
    if (playing) {
      startRef.current = 0;
      rafRef.current = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, animate]);

  const p = pose;
  const sw = 2.5;

  return (
    <svg
      viewBox="0 0 200 300"
      width={size}
      height={size * 1.5}
      className={className}
      style={{ overflow: "visible", transform: mirrored ? "scaleX(-1)" : undefined }}
    >
      <ellipse cx={p.headX} cy={p.headY - 2} rx={14} ry={16} fill={HAIR} opacity={0.85} />
      <circle cx={p.headX} cy={p.headY} r={11} fill={SKIN} stroke={STROKE_C} strokeWidth={sw * 0.6} />
      <line x1={p.neckX} y1={p.neckY} x2={p.shoulderLX} y2={p.shoulderLY} stroke={TOP} strokeWidth={sw * 3} strokeLinecap="round" />
      <line x1={p.neckX} y1={p.neckY} x2={p.shoulderRX} y2={p.shoulderRY} stroke={TOP} strokeWidth={sw * 3} strokeLinecap="round" />
      <line x1={p.shoulderLX} y1={p.shoulderLY} x2={p.hipLX} y2={p.hipLY} stroke={TOP} strokeWidth={sw * 2.5} strokeLinecap="round" />
      <line x1={p.shoulderRX} y1={p.shoulderRY} x2={p.hipRX} y2={p.hipRY} stroke={TOP} strokeWidth={sw * 2.5} strokeLinecap="round" />
      <line x1={p.neckX} y1={p.neckY} x2={p.hipX} y2={p.hipY} stroke={TOP} strokeWidth={sw * 2.8} strokeLinecap="round" />
      <line x1={p.headX} y1={p.headY + 9} x2={p.neckX} y2={p.neckY} stroke={SKIN} strokeWidth={sw * 1.5} strokeLinecap="round" />
      <line x1={p.shoulderLX} y1={p.shoulderLY} x2={p.elbowLX} y2={p.elbowLY} stroke={SKIN} strokeWidth={sw * 1.6} strokeLinecap="round" />
      <line x1={p.shoulderRX} y1={p.shoulderRY} x2={p.elbowRX} y2={p.elbowRY} stroke={SKIN} strokeWidth={sw * 1.6} strokeLinecap="round" />
      <line x1={p.elbowLX} y1={p.elbowLY} x2={p.handLX} y2={p.handLY} stroke={SKIN} strokeWidth={sw * 1.4} strokeLinecap="round" />
      <line x1={p.elbowRX} y1={p.elbowRY} x2={p.handRX} y2={p.handRY} stroke={SKIN} strokeWidth={sw * 1.4} strokeLinecap="round" />
      <circle cx={p.handLX} cy={p.handLY} r={3.5} fill={SKIN} />
      <circle cx={p.handRX} cy={p.handRY} r={3.5} fill={SKIN} />
      <line x1={p.hipLX} y1={p.hipLY} x2={p.kneeLX} y2={p.kneeLY} stroke={BOTTOM} strokeWidth={sw * 2.2} strokeLinecap="round" />
      <line x1={p.hipRX} y1={p.hipRY} x2={p.kneeRX} y2={p.kneeRY} stroke={BOTTOM} strokeWidth={sw * 2.2} strokeLinecap="round" />
      <line x1={p.kneeLX} y1={p.kneeLY} x2={p.footLX} y2={p.footLY} stroke={SKIN} strokeWidth={sw * 1.8} strokeLinecap="round" />
      <line x1={p.kneeRX} y1={p.kneeRY} x2={p.footRX} y2={p.footRY} stroke={SKIN} strokeWidth={sw * 1.8} strokeLinecap="round" />
      <ellipse cx={p.footLX + 3} cy={p.footLY + 2} rx={7} ry={4} fill={SHOE} />
      <ellipse cx={p.footRX + 3} cy={p.footRY + 2} rx={7} ry={4} fill={SHOE} />
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

// Legacy compat export
export { type ExerciseAnimationDef as ExerciseAnimation };
