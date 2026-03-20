/**
 * Enhanced animated SVG silhouette for exercises without mapped animations.
 * Renders a stylised human figure with smooth joint movement based on
 * exercise name keyword matching (squat, push, pull, lunge, plank, etc.)
 */

import { useEffect, useRef, useState, useCallback, useMemo } from "react";

// ── Pose type (simplified silhouette joints) ─────────────────────────
interface SilhouettePose {
  headY: number;
  neckY: number;
  shoulderLX: number; shoulderLY: number;
  shoulderRX: number; shoulderRY: number;
  elbowLX: number; elbowLY: number;
  elbowRX: number; elbowRY: number;
  handLX: number; handLY: number;
  handRX: number; handRY: number;
  hipY: number;
  kneeLX: number; kneeLY: number;
  kneeRX: number; kneeRY: number;
  footLX: number; footLY: number;
  footRX: number; footRY: number;
}

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function easeInOut(t: number) { return -(Math.cos(Math.PI * t) - 1) / 2; }

function lerpPose(a: SilhouettePose, b: SilhouettePose, t: number): SilhouettePose {
  const r = {} as SilhouettePose;
  for (const k of Object.keys(a) as (keyof SilhouettePose)[]) {
    r[k] = lerp(a[k], b[k], t);
  }
  return r;
}

// ── Base standing pose ───────────────────────────────────────────────
const STAND: SilhouettePose = {
  headY: 32,
  neckY: 50,
  shoulderLX: 74, shoulderLY: 58,
  shoulderRX: 126, shoulderRY: 58,
  elbowLX: 66, elbowLY: 95,
  elbowRX: 134, elbowRY: 95,
  handLX: 64, handLY: 130,
  handRX: 136, handRY: 130,
  hipY: 142,
  kneeLX: 86, kneeLY: 200,
  kneeRX: 114, kneeRY: 200,
  footLX: 82, footLY: 268,
  footRX: 118, footRY: 268,
};

// ── Movement-specific keyframes ──────────────────────────────────────
const SQUAT_DOWN: SilhouettePose = {
  ...STAND,
  headY: 62, neckY: 78,
  shoulderLX: 68, shoulderLY: 86, shoulderRX: 132, shoulderRY: 86,
  elbowLX: 54, elbowLY: 72, elbowRX: 146, elbowRY: 72,
  handLX: 50, handLY: 62, handRX: 150, handRY: 62,
  hipY: 165,
  kneeLX: 72, kneeLY: 210, kneeRX: 128, kneeRY: 210,
  footLX: 78, footLY: 268, footRX: 122, footRY: 268,
};

const PUSH_DOWN: SilhouettePose = {
  ...STAND,
  headY: 46, neckY: 60,
  shoulderLX: 68, shoulderLY: 66, shoulderRX: 132, shoulderRY: 66,
  elbowLX: 52, elbowLY: 52, elbowRX: 148, elbowRY: 52,
  handLX: 44, handLY: 38, handRX: 156, handRY: 38,
  hipY: 142,
};

const PULL_UP: SilhouettePose = {
  ...STAND,
  elbowLX: 54, elbowLY: 68, elbowRX: 146, elbowRY: 68,
  handLX: 62, handLY: 52, handRX: 138, handRY: 52,
};

const LUNGE_DOWN: SilhouettePose = {
  ...STAND,
  headY: 55, neckY: 70,
  shoulderLY: 78, shoulderRY: 78,
  elbowLY: 110, elbowRY: 110,
  handLY: 145, handRY: 145,
  hipY: 162,
  kneeLX: 80, kneeLY: 220, kneeRX: 128, kneeRY: 195,
  footLX: 75, footLY: 268, footRX: 135, footRY: 268,
};

const CORE_CRUNCH: SilhouettePose = {
  ...STAND,
  headY: 48, neckY: 62,
  shoulderLY: 70, shoulderRY: 70,
  elbowLX: 60, elbowLY: 58, elbowRX: 140, elbowRY: 58,
  handLX: 80, handLY: 42, handRX: 120, handRY: 42,
  hipY: 148,
  kneeLX: 82, kneeLY: 195, kneeRX: 118, kneeRY: 195,
};

const ARMS_RAISE: SilhouettePose = {
  ...STAND,
  elbowLX: 58, elbowLY: 48, elbowRX: 142, elbowRY: 48,
  handLX: 54, handLY: 22, handRX: 146, handRY: 22,
};

// ── Classify exercise name into a movement pattern ───────────────────
type Pattern = "squat" | "push" | "pull" | "lunge" | "core" | "raise" | "generic";

function classifyExercise(name: string): Pattern {
  const n = name.toLowerCase();
  if (/squat|wall.?sit|goblet|thruster/i.test(n)) return "squat";
  if (/push|press|dip|bench|chest/i.test(n)) return "push";
  if (/pull|row|curl|face.?pull|chin/i.test(n)) return "pull";
  if (/lunge|split|step|bulgarian/i.test(n)) return "lunge";
  if (/crunch|sit.?up|plank|core|dead.?bug|hollow|v.?up|twist|ab|hundred/i.test(n)) return "core";
  if (/raise|fly|lateral|front.?raise|y.?raise/i.test(n)) return "raise";
  return "generic";
}

const PATTERN_FRAMES: Record<Pattern, SilhouettePose[]> = {
  squat: [STAND, SQUAT_DOWN, STAND],
  push: [STAND, PUSH_DOWN, STAND],
  pull: [STAND, PULL_UP, STAND],
  lunge: [STAND, LUNGE_DOWN, STAND],
  core: [STAND, CORE_CRUNCH, STAND],
  raise: [STAND, ARMS_RAISE, STAND],
  generic: [STAND, { ...STAND, headY: 38, hipY: 148, kneeLY: 205, kneeRY: 205 }, STAND],
};

// ── SVG body path builder ────────────────────────────────────────────
function bodyPath(p: SilhouettePose): string {
  // Stylised silhouette: torso as smooth shape, limbs as tapered paths
  const cx = 100;
  return [
    // Head
    `M ${cx} ${p.headY - 12} A 11 13 0 1 1 ${cx} ${p.headY + 12} A 11 13 0 1 1 ${cx} ${p.headY - 12}`,
    // Neck
    `M ${cx - 4} ${p.headY + 11} L ${cx + 4} ${p.headY + 11} L ${cx + 5} ${p.neckY} L ${cx - 5} ${p.neckY} Z`,
    // Torso
    `M ${p.shoulderLX} ${p.shoulderLY} Q ${cx} ${p.shoulderLY - 6} ${p.shoulderRX} ${p.shoulderRY} L ${cx + 14} ${p.hipY} Q ${cx} ${p.hipY + 8} ${cx - 14} ${p.hipY} Z`,
  ].join(" ");
}

function limbPaths(p: SilhouettePose): string[] {
  return [
    // Left arm
    `M ${p.shoulderLX} ${p.shoulderLY} Q ${p.elbowLX - 2} ${p.elbowLY} ${p.elbowLX} ${p.elbowLY} Q ${p.handLX - 1} ${p.handLY - 5} ${p.handLX} ${p.handLY}`,
    // Right arm
    `M ${p.shoulderRX} ${p.shoulderRY} Q ${p.elbowRX + 2} ${p.elbowRY} ${p.elbowRX} ${p.elbowRY} Q ${p.handRX + 1} ${p.handRY - 5} ${p.handRX} ${p.handRY}`,
    // Left leg
    `M ${100 - 14} ${p.hipY} Q ${p.kneeLX - 2} ${p.kneeLY} ${p.kneeLX} ${p.kneeLY} Q ${p.footLX - 1} ${p.footLY - 8} ${p.footLX} ${p.footLY}`,
    // Right leg
    `M ${100 + 14} ${p.hipY} Q ${p.kneeRX + 2} ${p.kneeRY} ${p.kneeRX} ${p.kneeRY} Q ${p.footRX + 1} ${p.footRY - 8} ${p.footRX} ${p.footRY}`,
  ];
}

// ── Component ────────────────────────────────────────────────────────
interface Props {
  exerciseName: string;
  size?: number;
  playing?: boolean;
  className?: string;
}

export default function ExerciseSilhouette({ exerciseName, size = 200, playing = true, className = "" }: Props) {
  const pattern = useMemo(() => classifyExercise(exerciseName), [exerciseName]);
  const frames = PATTERN_FRAMES[pattern];
  const cycleDuration = 2400; // ms

  const rafRef = useRef(0);
  const startRef = useRef(0);
  const [pose, setPose] = useState<SilhouettePose>(frames[0]);

  const animate = useCallback((ts: number) => {
    if (!startRef.current) startRef.current = ts;
    const elapsed = ts - startRef.current;
    const segments = frames.length - 1;
    const segDur = cycleDuration / segments;
    const looped = elapsed % cycleDuration;
    const idx = Math.min(Math.floor(looped / segDur), segments - 1);
    const t = easeInOut((looped - idx * segDur) / segDur);
    setPose(lerpPose(frames[idx], frames[idx + 1], t));
    rafRef.current = requestAnimationFrame(animate);
  }, [frames]);

  useEffect(() => {
    if (playing) {
      startRef.current = 0;
      rafRef.current = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, animate]);

  const body = bodyPath(pose);
  const limbs = limbPaths(pose);

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg viewBox="0 0 200 290" width={size} height={size * 1.45} style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id="silhouette-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.85" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
          </linearGradient>
          <filter id="silhouette-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Subtle shadow beneath feet */}
        <ellipse cx={100} cy={275} rx={30} ry={4} fill="hsl(var(--primary))" opacity={0.1} />

        {/* Body silhouette */}
        <path d={body} fill="url(#silhouette-fill)" filter="url(#silhouette-glow)" />

        {/* Limbs — tapered strokes */}
        {limbs.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth={i < 2 ? 7 : 9}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.75}
          />
        ))}

        {/* Hands */}
        <circle cx={pose.handLX} cy={pose.handLY} r={4} fill="hsl(var(--primary))" opacity={0.7} />
        <circle cx={pose.handRX} cy={pose.handRY} r={4} fill="hsl(var(--primary))" opacity={0.7} />

        {/* Feet */}
        <ellipse cx={pose.footLX + 2} cy={pose.footLY + 2} rx={8} ry={4} fill="hsl(var(--primary))" opacity={0.6} />
        <ellipse cx={pose.footRX + 2} cy={pose.footRY + 2} rx={8} ry={4} fill="hsl(var(--primary))" opacity={0.6} />

        {/* Joint indicators */}
        {[
          [pose.shoulderLX, pose.shoulderLY], [pose.shoulderRX, pose.shoulderRY],
          [pose.elbowLX, pose.elbowLY], [pose.elbowRX, pose.elbowRY],
          [100, pose.hipY],
          [pose.kneeLX, pose.kneeLY], [pose.kneeRX, pose.kneeRY],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={2.5} fill="hsl(var(--primary-foreground))" opacity={0.3} />
        ))}
      </svg>
    </div>
  );
}
