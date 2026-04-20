import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipForward, RotateCcw, ArrowLeft, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { haptic } from "@/hooks/use-mobile";
import { useWakeLock } from "@/hooks/useWakeLock";
import type { WorkoutInterval, WorkoutTemplate } from "@/hooks/useTrainingProgram";
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
  type TimerKind,
} from "@/lib/workout-timer-store";

interface FlatInterval {
  intervalId: string;
  block_label: string;
  kind: WorkoutInterval["kind"];
  duration_sec: number;
  target_pace: string | null;
  target_rpe: number | null;
  notes: string | null;
  rep: number;
  totalReps: number;
}

const KIND_COLORS: Record<WorkoutInterval["kind"], { bg: string; text: string; ring: string }> = {
  warmup:   { bg: "bg-amber-500/15",  text: "text-amber-400",  ring: "ring-amber-400/40" },
  cooldown: { bg: "bg-sky-500/15",    text: "text-sky-400",    ring: "ring-sky-400/40" },
  run:      { bg: "bg-rose-500/20",   text: "text-rose-400",   ring: "ring-rose-400/40" },
  jog:      { bg: "bg-rose-500/15",   text: "text-rose-300",   ring: "ring-rose-300/40" },
  sprint:   { bg: "bg-fuchsia-500/20",text: "text-fuchsia-400",ring: "ring-fuchsia-400/40" },
  work:     { bg: "bg-orange-500/20", text: "text-orange-400", ring: "ring-orange-400/40" },
  walk:     { bg: "bg-emerald-500/15",text: "text-emerald-400",ring: "ring-emerald-400/40" },
  rest:     { bg: "bg-slate-500/15",  text: "text-slate-300",  ring: "ring-slate-300/40" },
  recovery: { bg: "bg-teal-500/15",   text: "text-teal-400",   ring: "ring-teal-400/40" },
};

function flattenIntervals(intervals: WorkoutInterval[]): FlatInterval[] {
  const sorted = [...intervals].sort((a, b) => a.order_index - b.order_index);
  const steps: FlatInterval[] = [];
  let i = 0;
  while (i < sorted.length) {
    const cur = sorted[i];
    const next = sorted[i + 1];
    if (cur.repeat_count > 1 && next && next.repeat_count === cur.repeat_count) {
      for (let r = 0; r < cur.repeat_count; r++) {
        steps.push({
          intervalId: `${cur.id}-${r}`,
          block_label: cur.block_label,
          kind: cur.kind,
          duration_sec: cur.duration_sec,
          target_pace: cur.target_pace,
          target_rpe: cur.target_rpe,
          notes: cur.notes,
          rep: r + 1,
          totalReps: cur.repeat_count,
        });
        steps.push({
          intervalId: `${next.id}-${r}`,
          block_label: next.block_label,
          kind: next.kind,
          duration_sec: next.duration_sec,
          target_pace: next.target_pace,
          target_rpe: next.target_rpe,
          notes: next.notes,
          rep: r + 1,
          totalReps: next.repeat_count,
        });
      }
      i += 2;
    } else if (cur.repeat_count > 1) {
      for (let r = 0; r < cur.repeat_count; r++) {
        steps.push({
          intervalId: `${cur.id}-${r}`,
          block_label: cur.block_label,
          kind: cur.kind,
          duration_sec: cur.duration_sec,
          target_pace: cur.target_pace,
          target_rpe: cur.target_rpe,
          notes: cur.notes,
          rep: r + 1,
          totalReps: cur.repeat_count,
        });
      }
      i += 1;
    } else {
      steps.push({
        intervalId: cur.id,
        block_label: cur.block_label,
        kind: cur.kind,
        duration_sec: cur.duration_sec,
        target_pace: cur.target_pace,
        target_rpe: cur.target_rpe,
        notes: cur.notes,
        rep: 1,
        totalReps: 1,
      });
      i += 1;
    }
  }
  return steps;
}

function fmt(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function RunIntervalPlayer({
  template,
  intervals,
  onBack,
}: {
  template: WorkoutTemplate;
  intervals: WorkoutInterval[];
  onBack: () => void;
}) {
  const flatSteps = useMemo(() => flattenIntervals(intervals), [intervals]);
  const totalDurationSec = useMemo(() => flatSteps.reduce((s, x) => s + x.duration_sec, 0), [flatSteps]);
  const session = useWorkoutTimer();
  const location = useLocation();
  const wakeLock = useWakeLock();

  // Initialise the global session if not already running this workout.
  useEffect(() => {
    if (!flatSteps.length) return;
    const stepsForStore: TimerStep[] = flatSteps.map((s) => ({
      id: s.intervalId,
      label: `${s.block_label}${s.totalReps > 1 ? ` (${s.rep}/${s.totalReps})` : ""}`,
      durationSec: s.duration_sec,
      kind: s.kind as TimerKind,
    }));
    const sameSession =
      session &&
      session.title === template.title &&
      session.steps.length === stepsForStore.length &&
      session.steps[0]?.id === stepsForStore[0]?.id;
    if (!sameSession) {
      startWorkoutTimer({
        title: template.title,
        returnPath: location.pathname,
        steps: stepsForStore,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template.id, flatSteps.length]);

  // Wake lock while running.
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

  const stepIdx = session?.stepIdx ?? 0;
  const cur = flatSteps[stepIdx];
  const completed = session?.finished ?? false;
  const running = session?.running ?? false;
  const muted = session?.muted ?? false;
  const remaining = session ? getDisplayRemaining(session) : (cur?.duration_sec ?? 0);
  const colors = cur ? KIND_COLORS[cur.kind] : KIND_COLORS.run;

  const elapsedTotal = useMemo(() => {
    return flatSteps.slice(0, stepIdx).reduce((s, x) => s + x.duration_sec, 0) + (cur ? cur.duration_sec - remaining : 0);
  }, [flatSteps, stepIdx, remaining, cur]);
  const overallPct = totalDurationSec > 0 ? (elapsedTotal / totalDurationSec) * 100 : 0;
  const stepPct = cur && cur.duration_sec > 0 ? ((cur.duration_sec - remaining) / cur.duration_sec) * 100 : 0;

  const handlePlayPause = () => {
    if (completed) return;
    haptic("light");
    if (running) pauseWorkoutTimer();
    else resumeWorkoutTimer();
  };
  const handleSkip = () => { haptic("medium"); skipWorkoutStep(); };
  const handleReset = () => { haptic("medium"); resetWorkoutTimer(); };
  const handleBack = () => { onBack(); };
  const handleEnd = () => { stopWorkoutTimer(); onBack(); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={handleBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="flex items-center gap-2">
          {session && (
            <button
              onClick={handleEnd}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1"
            >
              End session
            </button>
          )}
          <button
            onClick={() => setWorkoutTimerMuted(!muted)}
            className="p-2 rounded-full bg-card border border-border text-muted-foreground hover:text-foreground"
            aria-label={muted ? "Unmute cues" : "Mute cues"}
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div>
        <p className="font-body text-[10px] text-primary uppercase tracking-[0.15em]">{template.day_label || "Run Session"}</p>
        <h2 className="font-display text-xl font-bold text-foreground mt-0.5">{template.title}</h2>
        <p className="font-body text-xs text-muted-foreground mt-1">
          Total {fmt(totalDurationSec)} · {flatSteps.length} blocks
        </p>
      </div>

      {/* Overall progress */}
      <div className="space-y-1">
        <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${overallPct}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground font-body">
          <span>{fmt(elapsedTotal)} elapsed</span>
          <span>{fmt(Math.max(0, totalDurationSec - elapsedTotal))} remaining</span>
        </div>
      </div>

      {/* Current block */}
      <AnimatePresence mode="wait">
        {cur && !completed && (
          <motion.div
            key={cur.intervalId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={cn("rounded-2xl border-2 p-6 text-center", colors.bg, "border-border", "ring-2", colors.ring)}
          >
            <p className={cn("font-body text-[10px] uppercase tracking-[0.2em] font-semibold", colors.text)}>
              {cur.kind} · {cur.totalReps > 1 ? `Rep ${cur.rep}/${cur.totalReps}` : "Block"} {stepIdx + 1}/{flatSteps.length}
            </p>
            <h3 className="font-display text-lg font-bold text-foreground mt-1">{cur.block_label}</h3>
            <div className="font-display text-6xl font-bold text-foreground mt-3 tabular-nums">{fmt(remaining)}</div>
            {cur.target_pace && (
              <p className="font-body text-xs text-muted-foreground mt-2">Pace: {cur.target_pace}</p>
            )}
            {cur.target_rpe != null && (
              <p className="font-body text-xs text-muted-foreground">RPE {cur.target_rpe}</p>
            )}
            {cur.notes && (
              <p className="font-body text-xs text-foreground/70 mt-3 italic">{cur.notes}</p>
            )}
            <div className="mt-4 h-1 rounded-full bg-background/40 overflow-hidden">
              <div className="h-full bg-foreground/60 transition-all duration-1000" style={{ width: `${stepPct}%` }} />
            </div>
          </motion.div>
        )}
        {completed && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/40 p-8 text-center"
          >
            <p className="font-display text-2xl font-bold text-emerald-400">Session complete</p>
            <p className="font-body text-sm text-muted-foreground mt-2">Nice work — {fmt(totalDurationSec)} done.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 pt-2">
        <button
          onClick={handleReset}
          className="p-3 rounded-full bg-card border border-border text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Reset"
        >
          <RotateCcw className="h-5 w-5" />
        </button>
        <button
          onClick={handlePlayPause}
          disabled={completed}
          className="p-5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          aria-label={running ? "Pause" : "Play"}
        >
          {running ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7 ml-0.5" />}
        </button>
        <button
          onClick={handleSkip}
          disabled={completed}
          className="p-3 rounded-full bg-card border border-border text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          aria-label="Skip"
        >
          <SkipForward className="h-5 w-5" />
        </button>
      </div>

      {!completed && stepIdx + 1 < flatSteps.length && (
        <div className="rounded-xl bg-card border border-border p-3">
          <p className="font-body text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Up next</p>
          <p className="font-body text-sm font-medium text-foreground mt-1">
            {flatSteps[stepIdx + 1].block_label} · {fmt(flatSteps[stepIdx + 1].duration_sec)}
          </p>
        </div>
      )}

      <details className="rounded-xl bg-card/60 border border-border">
        <summary className="cursor-pointer font-body text-xs font-medium text-muted-foreground p-3 hover:text-foreground">
          View all {flatSteps.length} blocks
        </summary>
        <ul className="px-3 pb-3 space-y-1.5">
          {flatSteps.map((s, i) => (
            <li
              key={s.intervalId}
              className={cn(
                "flex items-center justify-between text-xs font-body py-1 px-2 rounded",
                i === stepIdx && "bg-primary/10 text-foreground",
                i < stepIdx && "text-muted-foreground/60 line-through",
              )}
            >
              <span>
                <span className={cn("inline-block w-2 h-2 rounded-full mr-2", KIND_COLORS[s.kind].text.replace("text-", "bg-"))} />
                {s.block_label}
                {s.totalReps > 1 && <span className="text-muted-foreground"> · {s.rep}/{s.totalReps}</span>}
              </span>
              <span className="tabular-nums">{fmt(s.duration_sec)}</span>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
