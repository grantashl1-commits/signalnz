import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipForward, RotateCcw, ArrowLeft, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { haptic } from "@/hooks/use-mobile";
import type { WorkoutInterval, WorkoutTemplate } from "@/hooks/useTrainingProgram";

interface Step {
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

function flattenIntervals(intervals: WorkoutInterval[]): Step[] {
  const sorted = [...intervals].sort((a, b) => a.order_index - b.order_index);
  // Group sequential repeating blocks: e.g. run(reps=8) + walk(reps=8) means alternate run/walk for 8 cycles.
  // We'll detect by adjacent rows with repeat_count > 1 sharing the same repeat count.
  const steps: Step[] = [];
  let i = 0;
  while (i < sorted.length) {
    const cur = sorted[i];
    const next = sorted[i + 1];
    if (cur.repeat_count > 1 && next && next.repeat_count === cur.repeat_count) {
      // Pair: alternate cur/next for repeat_count cycles
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

// Audio cue helpers
function beep(freq = 880, durationMs = 200, volume = 0.3) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = "sine";
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);
    osc.start();
    osc.stop(ctx.currentTime + durationMs / 1000);
  } catch {}
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
  const steps = useMemo(() => flattenIntervals(intervals), [intervals]);
  const totalDurationSec = useMemo(() => steps.reduce((s, x) => s + x.duration_sec, 0), [steps]);

  const [stepIdx, setStepIdx] = useState(0);
  const [remaining, setRemaining] = useState(steps[0]?.duration_sec ?? 0);
  const [running, setRunning] = useState(false);
  const [muted, setMuted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const tickRef = useRef<number | null>(null);

  // Reset when intervals change
  useEffect(() => {
    setStepIdx(0);
    setRemaining(steps[0]?.duration_sec ?? 0);
    setRunning(false);
    setCompleted(false);
  }, [intervals, steps]);

  // Tick
  useEffect(() => {
    if (!running) return;
    tickRef.current = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          // Step finished
          setStepIdx((idx) => {
            const next = idx + 1;
            if (next >= steps.length) {
              // Workout complete
              if (!muted) beep(523, 600, 0.4);
              haptic("medium");
              setRunning(false);
              setCompleted(true);
              return idx;
            }
            const nextStep = steps[next];
            if (!muted) beep(880, 250, 0.4);
            haptic("medium");
            // Set remaining via micro-task to next step's duration
            setTimeout(() => setRemaining(nextStep.duration_sec), 0);
            return next;
          });
          return 0;
        }
        if (r <= 4 && !muted) beep(660, 100, 0.2); // 3-2-1 countdown
        return r - 1;
      });
    }, 1000);
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, [running, steps, muted]);

  const cur = steps[stepIdx];
  const colors = cur ? KIND_COLORS[cur.kind] : KIND_COLORS.run;
  const elapsedTotal = useMemo(() => {
    return steps.slice(0, stepIdx).reduce((s, x) => s + x.duration_sec, 0) + (cur ? cur.duration_sec - remaining : 0);
  }, [steps, stepIdx, remaining, cur]);
  const overallPct = totalDurationSec > 0 ? (elapsedTotal / totalDurationSec) * 100 : 0;
  const stepPct = cur && cur.duration_sec > 0 ? ((cur.duration_sec - remaining) / cur.duration_sec) * 100 : 0;

  const handlePlayPause = () => {
    if (completed) return;
    haptic("light");
    setRunning((r) => !r);
  };
  const handleSkip = () => {
    haptic("medium");
    if (stepIdx + 1 >= steps.length) {
      setCompleted(true);
      setRunning(false);
      return;
    }
    const next = stepIdx + 1;
    setStepIdx(next);
    setRemaining(steps[next].duration_sec);
  };
  const handleReset = () => {
    haptic("medium");
    setStepIdx(0);
    setRemaining(steps[0]?.duration_sec ?? 0);
    setRunning(false);
    setCompleted(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button
          onClick={() => setMuted((m) => !m)}
          className="p-2 rounded-full bg-card border border-border text-muted-foreground hover:text-foreground"
          aria-label={muted ? "Unmute cues" : "Mute cues"}
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
      </div>

      <div>
        <p className="font-body text-[10px] text-primary uppercase tracking-[0.15em]">{template.day_label || "Run Session"}</p>
        <h2 className="font-display text-xl font-bold text-foreground mt-0.5">{template.title}</h2>
        <p className="font-body text-xs text-muted-foreground mt-1">
          Total {fmt(totalDurationSec)} · {steps.length} blocks
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
              {cur.kind} · {cur.totalReps > 1 ? `Rep ${cur.rep}/${cur.totalReps}` : "Block"} {stepIdx + 1}/{steps.length}
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
            {/* Step progress */}
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

      {/* Up next */}
      {!completed && stepIdx + 1 < steps.length && (
        <div className="rounded-xl bg-card border border-border p-3">
          <p className="font-body text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Up next</p>
          <p className="font-body text-sm font-medium text-foreground mt-1">
            {steps[stepIdx + 1].block_label} · {fmt(steps[stepIdx + 1].duration_sec)}
          </p>
        </div>
      )}

      {/* Block list */}
      <details className="rounded-xl bg-card/60 border border-border">
        <summary className="cursor-pointer font-body text-xs font-medium text-muted-foreground p-3 hover:text-foreground">
          View all {steps.length} blocks
        </summary>
        <ul className="px-3 pb-3 space-y-1.5">
          {steps.map((s, i) => (
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
