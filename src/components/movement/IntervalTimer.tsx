import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, X, Timer, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { haptic } from "@/hooks/use-mobile";
import { useWakeLock } from "@/hooks/useWakeLock";

// ── Audio beep using Web Audio API ──────────────────────────────────────────

let audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext {
  if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  return audioCtx;
}

function playBeep(frequency = 880, duration = 0.15, count = 1) {
  try {
    const ctx = getAudioCtx();
    if (ctx.state === "suspended") ctx.resume();
    for (let i = 0; i < count; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.25);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.25 + duration);
      osc.start(ctx.currentTime + i * 0.25);
      osc.stop(ctx.currentTime + i * 0.25 + duration);
    }
  } catch {
    // Audio not available
  }
}

function playFinishBeep() {
  playBeep(1046, 0.2, 3); // Higher pitch, triple beep
}

function playTransitionBeep() {
  playBeep(880, 0.15, 2); // Double beep for transition
}

// ── Parse time from reps string ─────────────────────────────────────────────

export function parseTimeFromReps(reps: string | null): number | null {
  if (!reps) return null;
  const r = reps.toLowerCase().trim();

  // Skip rep-based strings like "12 reps", "8 per side"
  if (/^\d+\s*(reps?|per\s)/.test(r)) return null;

  // "40s", "90s", "30s each", "90s each side", "30 sec", "45 sec per side"
  const secMatch = r.match(/^(\d+)\s*s(?:ec(?:onds?)?)?/);
  if (secMatch) return parseInt(secMatch[1]);

  // "hold 45 seconds", "hold 30s"
  const holdMatch = r.match(/hold\s+(\d+)\s*s(?:ec(?:onds?)?)?/);
  if (holdMatch) return parseInt(holdMatch[1]);

  // "3 min run", "5 min", "10 min", "25 min", "2 min walk"
  const minMatch = r.match(/^(\d+)\s*min/);
  if (minMatch) return parseInt(minMatch[1]) * 60;

  // "30 seconds", "45 seconds per side", "60 seconds"
  const secondsMatch = r.match(/(\d+)\s*seconds?/);
  if (secondsMatch) return parseInt(secondsMatch[1]);

  // Embedded seconds like "30s" not at start
  const embeddedSec = r.match(/(\d+)\s*s(?:ec(?:onds?)?)?/);
  if (embeddedSec && !r.includes("rep") && !r.includes("set")) return parseInt(embeddedSec[1]);

  return null;
}

export function isTimeBased(reps: string | null): boolean {
  if (!reps) return false;
  // Also detect compound patterns like "60s run then 90s walk"
  if (/\d+\s*(s|sec|min)\s+\w+\s+then\s+\d+\s*(s|sec|min)/i.test(reps)) return true;
  return parseTimeFromReps(reps) !== null;
}

// ── Format seconds to mm:ss ─────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ── Interval definition ─────────────────────────────────────────────────────

export interface TimerInterval {
  label: string;
  durationSec: number;
  type: "work" | "rest";
}

export function buildIntervalsForExercise(
  exerciseName: string,
  reps: string | null,
  sets: number | null,
  restSeconds: number | null,
): TimerInterval[] {
  if (!reps) return [];

  // Handle compound interval patterns like "60s run then 90s walk" or "3 min run then 90s walk"
  const compoundMatch = reps.match(/(\d+)\s*(s|sec|min)\s+\w+\s+then\s+(\d+)\s*(s|sec|min)\s+\w+/i);
  if (compoundMatch) {
    const workVal = parseInt(compoundMatch[1]);
    const workUnit = compoundMatch[2].toLowerCase();
    const restVal = parseInt(compoundMatch[3]);
    const restUnit = compoundMatch[4].toLowerCase();
    const workSec = workUnit.startsWith("min") ? workVal * 60 : workVal;
    const restSec = restUnit.startsWith("min") ? restVal * 60 : restVal;
    const totalSets = sets || 1;
    const intervals: TimerInterval[] = [];

    for (let i = 0; i < totalSets; i++) {
      intervals.push({
        label: totalSets > 1 ? `Work (${i + 1}/${totalSets})` : "Work",
        durationSec: workSec,
        type: "work",
      });
      // Always add the rest/recovery interval (it's part of the compound pattern)
      intervals.push({
        label: totalSets > 1 ? `Recovery (${i + 1}/${totalSets})` : "Recovery",
        durationSec: restSec,
        type: "rest",
      });
    }
    return intervals;
  }

  const workSec = parseTimeFromReps(reps);
  if (!workSec) return [];

  const totalSets = sets || 1;
  const rest = restSeconds || 0;
  const intervals: TimerInterval[] = [];

  for (let i = 0; i < totalSets; i++) {
    intervals.push({
      label: totalSets > 1 ? `${exerciseName} (${i + 1}/${totalSets})` : exerciseName,
      durationSec: workSec,
      type: "work",
    });
    if (rest > 0 && i < totalSets - 1) {
      intervals.push({
        label: "Rest",
        durationSec: rest,
        type: "rest",
      });
    }
  }

  return intervals;
}

/** Build intervals from multiple exercises (e.g. run/walk alternating) */
export function buildIntervalsForWorkout(
  exercises: { name: string; reps: string | null; sets: number | null; restSeconds: number | null }[]
): TimerInterval[] {
  // Check if we have alternating time-based exercises (like run/walk)
  const timeExercises = exercises.filter(e => isTimeBased(e.reps));
  if (timeExercises.length < 2) return [];

  // Detect if sets match — use the first exercise's sets as round count
  const rounds = timeExercises[0].sets || 1;
  const intervals: TimerInterval[] = [];

  for (let r = 0; r < rounds; r++) {
    for (let i = 0; i < timeExercises.length; i++) {
      const ex = timeExercises[i];
      const workSec = parseTimeFromReps(ex.reps)!;
      intervals.push({
        label: `${ex.name} (${r + 1}/${rounds})`,
        durationSec: workSec,
        type: "work",
      });
    }
    // Rest between rounds if specified
    const rest = timeExercises[0].restSeconds || 0;
    if (rest > 0 && r < rounds - 1) {
      intervals.push({
        label: "Rest",
        durationSec: rest,
        type: "rest",
      });
    }
  }

  return intervals;
}

// ── Timer Component ─────────────────────────────────────────────────────────

interface IntervalTimerProps {
  intervals: TimerInterval[];
  onClose: () => void;
  onComplete?: () => void;
  accentColor?: string;
}

export default function IntervalTimer({ intervals, onClose, onComplete, accentColor }: IntervalTimerProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(intervals[0]?.durationSec || 0);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [muted, setMuted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const accent = accentColor || "hsl(var(--primary))";

  const current = intervals[currentIdx];
  const totalIntervals = intervals.length;
  const progress = current ? 1 - timeLeft / current.durationSec : 1;

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Tick
  useEffect(() => {
    if (!running || finished) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Interval complete
          if (currentIdx < totalIntervals - 1) {
            // Move to next interval
            const nextIdx = currentIdx + 1;
            setCurrentIdx(nextIdx);
            if (!muted) playTransitionBeep();
            haptic("medium");
            return intervals[nextIdx].durationSec;
          } else {
            // All done
            setRunning(false);
            setFinished(true);
            if (!muted) playFinishBeep();
            haptic("medium");
            onComplete?.();
            return 0;
          }
        }
        // Warning beep at 3 seconds
        if (prev === 4 && !muted) playBeep(660, 0.1, 1);
        return prev - 1;
      });
    }, 1000);

    return clearTimer;
  }, [running, finished, currentIdx, totalIntervals, intervals, muted, clearTimer, onComplete]);

  const handlePlayPause = () => {
    haptic("light");
    // Resume audio context on first user interaction
    if (!running) {
      try { getAudioCtx().resume(); } catch {}
    }
    setRunning(!running);
  };

  const handleReset = () => {
    haptic("light");
    clearTimer();
    setCurrentIdx(0);
    setTimeLeft(intervals[0]?.durationSec || 0);
    setRunning(false);
    setFinished(false);
  };

  if (!current && !finished) return null;

  // Circumference for progress ring
  const radius = 90;
  const circumference = 2 * Math.PI * radius;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center p-6"
    >
      {/* Close & mute buttons */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <button
          onClick={() => { haptic("light"); setMuted(!muted); }}
          className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground"
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
        <button
          onClick={() => { clearTimer(); onClose(); }}
          className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Interval counter */}
      <p className="font-body text-xs text-muted-foreground uppercase tracking-[0.15em] mb-2">
        {finished ? "Complete!" : `${currentIdx + 1} / ${totalIntervals}`}
      </p>

      {/* Current interval label */}
      <h2 className={cn(
        "font-display text-xl font-bold text-center mb-8",
        finished ? "text-primary" : current?.type === "rest" ? "text-muted-foreground" : "text-foreground"
      )}>
        {finished ? "All intervals done!" : current?.label}
      </h2>

      {/* Progress ring */}
      <div className="relative h-56 w-56 mb-8">
        <svg viewBox="0 0 200 200" className="h-56 w-56 -rotate-90">
          <circle
            cx="100" cy="100" r={radius}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="6"
          />
          {!finished && (
            <circle
              cx="100" cy="100" r={radius}
              fill="none"
              stroke={current?.type === "rest" ? "hsl(var(--muted-foreground))" : accent}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              className="transition-all duration-1000 ease-linear"
            />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn(
            "font-display text-5xl font-bold tabular-nums",
            finished ? "text-primary" : current?.type === "rest" ? "text-muted-foreground" : "text-foreground"
          )}>
            {finished ? "✓" : formatTime(timeLeft)}
          </span>
          {!finished && current?.type === "rest" && (
            <span className="font-body text-xs text-muted-foreground mt-1 uppercase tracking-wider">rest</span>
          )}
        </div>
      </div>

      {/* Type indicator pill */}
      {!finished && (
        <div className={cn(
          "rounded-full px-4 py-1.5 mb-6 font-body text-xs font-bold uppercase tracking-wider",
          current?.type === "rest"
            ? "bg-secondary text-muted-foreground"
            : "text-primary-foreground"
        )}
        style={current?.type !== "rest" ? { backgroundColor: accent } : undefined}
        >
          {current?.type === "rest" ? "Rest" : "Work"}
        </div>
      )}

      {/* Up next */}
      {!finished && currentIdx < totalIntervals - 1 && (
        <p className="font-body text-xs text-muted-foreground mb-6">
          Next: <span className="font-medium text-foreground">{intervals[currentIdx + 1].label}</span>
          {" · "}{formatTime(intervals[currentIdx + 1].durationSec)}
        </p>
      )}

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleReset}
          className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <RotateCcw className="h-5 w-5" />
        </button>

        {!finished ? (
          <button
            onClick={handlePlayPause}
            className="h-16 w-16 rounded-full flex items-center justify-center text-primary-foreground shadow-lg"
            style={{ backgroundColor: accent }}
          >
            {running
              ? <Pause className="h-7 w-7" />
              : <Play className="h-7 w-7 ml-0.5" />
            }
          </button>
        ) : (
          <button
            onClick={() => { clearTimer(); onClose(); }}
            className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg"
          >
            <X className="h-7 w-7" />
          </button>
        )}

        {/* Skip forward (placeholder space for symmetry) */}
        <div className="h-12 w-12" />
      </div>
    </motion.div>
  );
}

// ── Inline Timer Button (for exercise cards) ────────────────────────────────

export function TimerButton({
  exerciseName,
  reps,
  sets,
  restSeconds,
  onComplete,
}: {
  exerciseName: string;
  reps: string | null;
  sets: number | null;
  restSeconds: number | null;
  onComplete?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const intervals = buildIntervalsForExercise(exerciseName, reps, sets, restSeconds);

  if (intervals.length === 0) return null;

  const totalSec = intervals.reduce((sum, i) => sum + i.durationSec, 0);

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          haptic("medium");
          setOpen(true);
        }}
        className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 font-body text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
      >
        <Timer className="h-3.5 w-3.5" />
        Start timer · {formatTime(totalSec)}
      </button>

      <AnimatePresence>
        {open && (
          <IntervalTimer
            intervals={intervals}
            onClose={() => setOpen(false)}
            onComplete={onComplete}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ── Workout-level Interval Button (for run/walk alternating) ────────────────

export function WorkoutIntervalButton({
  exercises,
  onComplete,
}: {
  exercises: { name: string; reps: string | null; sets: number | null; restSeconds: number | null }[];
  onComplete?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const intervals = buildIntervalsForWorkout(exercises);

  if (intervals.length === 0) return null;

  const totalSec = intervals.reduce((sum, i) => sum + i.durationSec, 0);
  const totalMin = Math.round(totalSec / 60);

  return (
    <>
      <button
        onClick={() => {
          haptic("medium");
          setOpen(true);
        }}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary/10 border border-primary/20 py-3 font-body text-sm font-medium text-primary hover:bg-primary/15 transition-colors"
      >
        <Timer className="h-4 w-4" />
        Start interval timer · {totalMin} min
      </button>

      <AnimatePresence>
        {open && (
          <IntervalTimer
            intervals={intervals}
            onClose={() => setOpen(false)}
            onComplete={onComplete}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ── Structured Interval Button (for run/walk programs from DB) ──────────────

export interface StructuredInterval {
  block_label: string;
  kind: string; // 'warmup' | 'run' | 'walk' | 'cooldown' | 'rest' | string
  duration_sec: number;
  repeat_count: number;
  target_pace?: string | null;
}

/** Expand DB workout_intervals rows into a flat list, repeating run/walk pairs. */
export function expandStructuredIntervals(rows: StructuredInterval[]): TimerInterval[] {
  if (!rows || rows.length === 0) return [];

  const out: TimerInterval[] = [];
  let i = 0;
  while (i < rows.length) {
    const row = rows[i];
    const isRest = row.kind === "walk" || row.kind === "rest" || row.kind === "cooldown" || row.kind === "warmup";

    // If this is a run with repeat_count > 1 followed by a walk with the same repeat_count,
    // alternate them (run/walk × N).
    const next = rows[i + 1];
    if (
      row.repeat_count > 1 &&
      next &&
      next.repeat_count === row.repeat_count &&
      (row.kind === "run" || row.kind === "work") &&
      (next.kind === "walk" || next.kind === "rest")
    ) {
      const total = row.repeat_count;
      for (let r = 0; r < total; r++) {
        out.push({
          label: `${row.block_label} (${r + 1}/${total})`,
          durationSec: row.duration_sec,
          type: "work",
        });
        out.push({
          label: `${next.block_label} (${r + 1}/${total})`,
          durationSec: next.duration_sec,
          type: "rest",
        });
      }
      i += 2;
      continue;
    }

    // Otherwise expand by repeat_count linearly
    const reps = Math.max(1, row.repeat_count || 1);
    for (let r = 0; r < reps; r++) {
      out.push({
        label: reps > 1 ? `${row.block_label} (${r + 1}/${reps})` : row.block_label,
        durationSec: row.duration_sec,
        type: isRest ? "rest" : "work",
      });
    }
    i++;
  }
  return out;
}

export function StructuredIntervalButton({
  rows,
  onComplete,
}: {
  rows: StructuredInterval[];
  onComplete?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const intervals = expandStructuredIntervals(rows);

  if (intervals.length === 0) return null;

  const totalSec = intervals.reduce((s, i) => s + i.durationSec, 0);
  const totalMin = Math.max(1, Math.round(totalSec / 60));

  return (
    <>
      <button
        onClick={() => { haptic("medium"); setOpen(true); }}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary/10 border border-primary/20 py-3 font-body text-sm font-medium text-primary hover:bg-primary/15 transition-colors"
      >
        <Timer className="h-4 w-4" />
        Start session timer · {totalMin} min · {intervals.length} blocks
      </button>

      <AnimatePresence>
        {open && (
          <IntervalTimer
            intervals={intervals}
            onClose={() => setOpen(false)}
            onComplete={onComplete}
          />
        )}
      </AnimatePresence>
    </>
  );
}
