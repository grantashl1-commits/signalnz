import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, X, Timer, Volume2, VolumeX, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";
import { haptic } from "@/hooks/use-mobile";
import { useWakeLock } from "@/hooks/useWakeLock";
import {
  useWorkoutTimer,
  startWorkoutTimer,
  pauseWorkoutTimer,
  resumeWorkoutTimer,
  resetWorkoutTimer,
  skipWorkoutStep,
  stopWorkoutTimer,
  setWorkoutTimerMuted,
  getDisplayRemaining,
  type TimerStep,
} from "@/lib/workout-timer-store";

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

// ── Timer Component (uses global store) ─────────────────────────────────────

interface IntervalTimerProps {
  intervals: TimerInterval[];
  /** Friendly title for the floating bar (e.g. "Walk/Run Intervals"). */
  title?: string;
  /** Path to navigate back to from the floating bar — defaults to current. */
  returnPath?: string;
  onClose: () => void;
  onComplete?: () => void;
  accentColor?: string;
}

function intervalsToSteps(intervals: TimerInterval[]): TimerStep[] {
  return intervals.map((iv, i) => ({
    id: `step-${i}-${iv.label}`,
    label: iv.label,
    durationSec: iv.durationSec,
    kind: iv.type === "rest" ? "rest" : "work",
  }));
}

export default function IntervalTimer({ intervals, title, returnPath, onClose, onComplete, accentColor }: IntervalTimerProps) {
  const session = useWorkoutTimer();
  const location = useLocation();
  const wakeLock = useWakeLock();
  const accent = accentColor || "hsl(var(--primary))";

  // If the visible session doesn't match these intervals (different ids), start fresh on mount.
  useEffect(() => {
    const steps = intervalsToSteps(intervals);
    const matchingTitle = title || intervals[0]?.label || "Workout timer";
    const path = returnPath ?? location.pathname;
    if (!session || session.title !== matchingTitle || session.steps.length !== steps.length) {
      startWorkoutTimer({ title: matchingTitle, returnPath: path, steps });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Acquire wake lock while running.
  useEffect(() => {
    if (session?.running && !wakeLock.isActive && wakeLock.isSupported) {
      wakeLock.toggle();
    }
    if (!session?.running && wakeLock.isActive) {
      wakeLock.release();
    }
    return () => {
      if (wakeLock.isActive) wakeLock.release();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.running]);

  // Fire onComplete once when finished.
  useEffect(() => {
    if (session?.finished) onComplete?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.finished]);

  if (!session) return null;

  const current = session.steps[session.stepIdx];
  const finished = session.finished;
  const totalIntervals = session.steps.length;
  const isRest = current?.kind === "rest";
  const timeLeft = getDisplayRemaining(session);
  const progress = current ? 1 - timeLeft / current.durationSec : 1;

  const handlePlayPause = () => {
    haptic("light");
    if (session.running) pauseWorkoutTimer();
    else resumeWorkoutTimer();
  };
  const handleReset = () => { haptic("light"); resetWorkoutTimer(); };
  const handleSkip = () => { haptic("medium"); skipWorkoutStep(); };
  const handleClose = () => { stopWorkoutTimer(); onClose(); };
  const handleMute = () => { haptic("light"); setWorkoutTimerMuted(!session.muted); };

  const radius = 90;
  const circumference = 2 * Math.PI * radius;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center p-6"
    >
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <button
          onClick={handleMute}
          className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground"
        >
          {session.muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
        <button
          onClick={handleClose}
          className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <p className="font-body text-xs text-muted-foreground uppercase tracking-[0.15em] mb-2">
        {finished ? "Complete!" : `${session.stepIdx + 1} / ${totalIntervals}`}
      </p>

      <h2 className={cn(
        "font-display text-xl font-bold text-center mb-8",
        finished ? "text-primary" : isRest ? "text-muted-foreground" : "text-foreground"
      )}>
        {finished ? "All intervals done!" : current?.label}
      </h2>

      <div className="relative h-56 w-56 mb-8">
        <svg viewBox="0 0 200 200" className="h-56 w-56 -rotate-90">
          <circle cx="100" cy="100" r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
          {!finished && (
            <circle
              cx="100" cy="100" r={radius}
              fill="none"
              stroke={isRest ? "hsl(var(--muted-foreground))" : accent}
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
            finished ? "text-primary" : isRest ? "text-muted-foreground" : "text-foreground"
          )}>
            {finished ? "✓" : formatTime(timeLeft)}
          </span>
          {!finished && isRest && (
            <span className="font-body text-xs text-muted-foreground mt-1 uppercase tracking-wider">rest</span>
          )}
        </div>
      </div>

      {!finished && (
        <div className={cn(
          "rounded-full px-4 py-1.5 mb-6 font-body text-xs font-bold uppercase tracking-wider",
          isRest ? "bg-secondary text-muted-foreground" : "text-primary-foreground"
        )}
        style={!isRest ? { backgroundColor: accent } : undefined}
        >
          {isRest ? "Rest" : "Work"}
        </div>
      )}

      {!finished && session.stepIdx < totalIntervals - 1 && (
        <p className="font-body text-xs text-muted-foreground mb-6">
          Next: <span className="font-medium text-foreground">{session.steps[session.stepIdx + 1].label}</span>
          {" · "}{formatTime(session.steps[session.stepIdx + 1].durationSec)}
        </p>
      )}

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
            {session.running ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7 ml-0.5" />}
          </button>
        ) : (
          <button
            onClick={handleClose}
            className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg"
          >
            <X className="h-7 w-7" />
          </button>
        )}

        <button
          onClick={handleSkip}
          disabled={finished}
          className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
        >
          <SkipForward className="h-5 w-5" />
        </button>
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
            title={exerciseName}
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
            title={exercises[0]?.name || "Interval workout"}
            onClose={() => setOpen(false)}
            onComplete={onComplete}
          />
        )}
      </AnimatePresence>
    </>
  );
}

