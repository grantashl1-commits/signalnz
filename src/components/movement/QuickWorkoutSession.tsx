import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, Clock, Heart, Activity, Bluetooth, Play, Pause, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { haptic } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { useGlobalHeartRate } from "@/contexts/HeartRateContext";
import { useWakeLock } from "@/hooks/useWakeLock";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { useCycle } from "@/contexts/CycleContext";
import { supabase } from "@/integrations/supabase/client";
import ExerciseDemonstration from "@/components/ExerciseDemonstration";
import { getMaxHR, getZoneForBPM, HR_ZONES, estimateCalories } from "@/data/workouts";

interface QuickExercise {
  id: string;
  name: string;
  body_part: string | null;
  target: string | null;
  category: string | null;
  illustration_url: string | null;
}

export type WorkoutIntensity = "low" | "moderate" | "high";

interface Props {
  title: string;
  duration: string;
  intensity: WorkoutIntensity;
  exercises: QuickExercise[];
  onBack: () => void;
}

/** Get default reps/timing prescription based on intensity & category */
export function getExercisePrescription(
  intensity: WorkoutIntensity,
  category: string | null
): { sets: number; reps: string; rest: string } {
  const cat = (category || "").toLowerCase();

  if (cat.includes("stretch") || cat.includes("yoga") || cat.includes("mobility")) {
    return { sets: 1, reps: "60s hold each side", rest: "—" };
  }
  if (cat.includes("rehabilitation")) {
    return { sets: 2, reps: "15 reps", rest: "45s" };
  }

  switch (intensity) {
    case "high":
      return { sets: 3, reps: "40s work", rest: "20s" };
    case "moderate":
      return { sets: 3, reps: "12 reps", rest: "60s" };
    case "low":
      return { sets: 2, reps: "60s hold", rest: "30s" };
    default:
      return { sets: 3, reps: "12 reps", rest: "60s" };
  }
}

const ZONE_COLORS = ["#94a3b8", "#3b82f6", "#22c55e", "#f59e0b", "#ef4444"];

export default function QuickWorkoutSession({ title, duration, intensity, exercises, onBack }: Props) {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { phase, cycleDay } = useCycle();
  const { bpm, connected, connecting, connect, isSupported } = useGlobalHeartRate();
  useWakeLock();

  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [finished, setFinished] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bpmTraceRef = useRef<{ time: number; bpm: number }[]>([]);

  // Timer
  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => setElapsed(p => p + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [running]);

  // Record HR trace
  useEffect(() => {
    if (running && bpm > 0) {
      bpmTraceRef.current.push({ time: elapsed, bpm });
    }
  }, [running, bpm, elapsed]);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  const age = profile?.date_of_birth
    ? Math.floor((Date.now() - new Date(profile.date_of_birth).getTime()) / 31557600000)
    : 30;
  const maxHR = getMaxHR(age);
  const zone = bpm > 0 ? getZoneForBPM(bpm, maxHR) : null;
  const zoneColor = zone ? ZONE_COLORS[zone.index] : undefined;

  const toggleExercise = useCallback((id: string) => {
    haptic("light");
    setCompleted(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const handleStart = () => {
    haptic("medium");
    setRunning(true);
    toast.success("Workout started!");
  };

  const handlePause = () => {
    haptic("light");
    setRunning(false);
  };

  const handleFinish = async () => {
    haptic("success");
    setRunning(false);
    setFinished(true);

    const trace = bpmTraceRef.current;
    const avgBpm = trace.length > 0 ? Math.round(trace.reduce((s, t) => s + t.bpm, 0) / trace.length) : null;
    const maxBpm = trace.length > 0 ? Math.max(...trace.map(t => t.bpm)) : null;

    if (user?.id) {
      await supabase.from("hr_sessions").insert({
        user_id: user.id,
        workout_name: title,
        duration_minutes: Math.round(elapsed / 60),
        avg_bpm: avgBpm,
        max_bpm: maxBpm,
        bpm_trace: trace,
        zones_summary: {},
        cycle_phase: phase || null,
        cycle_day: cycleDay || null,
        calories: avgBpm ? estimateCalories(avgBpm, Math.round(elapsed / 60), profile?.weight_kg || 60) : null,
      });
    }

    toast.success(`${title} complete — ${minutes}:${seconds.toString().padStart(2, "0")} elapsed`);
  };

  const progress = exercises.length > 0 ? (completed.size / exercises.length) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="touch-btn h-9 w-9 rounded-full bg-secondary flex items-center justify-center">
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="font-display text-lg font-bold text-foreground">{title}</h2>
          <p className="font-body text-xs text-muted-foreground">{duration} · {intensity}</p>
        </div>
      </div>

      {/* Timer + HR strip */}
      <div className="card-warm p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-primary" />
            <span className="font-display text-2xl font-bold tabular-nums text-foreground">
              {minutes}:{seconds.toString().padStart(2, "0")}
            </span>
          </div>

          {/* HR display */}
          <div className="flex items-center gap-2">
            {connected && bpm > 0 ? (
              <div className="flex items-center gap-1.5">
                <Heart className="h-4 w-4 animate-pulse" style={{ color: zoneColor }} />
                <span className="font-display text-xl font-bold tabular-nums" style={{ color: zoneColor }}>
                  {bpm}
                </span>
                <span className="font-body text-[9px] text-muted-foreground">bpm</span>
                {zone && (
                  <span className="rounded-full px-1.5 py-0.5 font-body text-[8px] font-bold text-white" style={{ backgroundColor: zoneColor }}>
                    Z{zone.index + 1}
                  </span>
                )}
              </div>
            ) : isSupported ? (
              <button
                onClick={() => connect()}
                disabled={connecting}
                className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5"
              >
                <Bluetooth className={cn("h-3.5 w-3.5", connecting ? "animate-pulse text-primary" : "text-muted-foreground")} />
                <span className="font-body text-[10px] text-muted-foreground">
                  {connecting ? "Connecting…" : "Connect HR"}
                </span>
              </button>
            ) : null}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {!running && !finished ? (
            <button onClick={handleStart} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-primary-foreground font-body text-sm font-semibold">
              <Play className="h-4 w-4" /> Start Workout
            </button>
          ) : running ? (
            <>
              <button onClick={handlePause} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-secondary py-3 text-foreground font-body text-sm font-semibold">
                <Pause className="h-4 w-4" /> Pause
              </button>
              <button onClick={handleFinish} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-primary-foreground font-body text-sm font-semibold">
                <Square className="h-4 w-4" /> Finish
              </button>
            </>
          ) : (
            <div className="flex-1 text-center font-body text-sm text-primary font-semibold py-3">
              ✓ Workout complete!
            </div>
          )}
        </div>

        {/* Progress bar */}
        {exercises.length > 0 && (
          <div className="space-y-1">
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <p className="font-body text-[10px] text-muted-foreground">{completed.size}/{exercises.length} exercises</p>
          </div>
        )}
      </div>

      {/* Exercise list with reps */}
      <div className="space-y-1.5">
        {exercises.map((ex, i) => {
          const done = completed.has(ex.id);
          const rx = getExercisePrescription(intensity, ex.category);
          return (
            <motion.div
              key={ex.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={cn(
                "flex items-center gap-3 rounded-xl p-3 transition-all min-h-[56px]",
                done ? "bg-primary/5" : "bg-secondary/50"
              )}
            >
              <button
                onClick={() => toggleExercise(ex.id)}
                className={cn(
                  "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border transition-all",
                  done ? "bg-primary border-primary" : "border-muted-foreground/30"
                )}
              >
                {done && <Check className="h-3.5 w-3.5 text-primary-foreground" />}
              </button>

              <ExerciseDemonstration
                exerciseName={ex.name}
                imageUrl={ex.illustration_url}
                size={42}
                className="shrink-0 rounded-lg"
              />

              <div className="flex-1 min-w-0">
                <p className={cn("font-body text-sm", done ? "text-muted-foreground line-through" : "text-foreground")}>
                  {ex.name}
                </p>
                <div className="flex gap-2 mt-0.5 flex-wrap">
                  <span className="font-body text-[10px] text-primary font-medium">
                    {rx.sets} × {rx.reps}
                  </span>
                  {rx.rest !== "—" && (
                    <span className="font-body text-[10px] text-muted-foreground">Rest {rx.rest}</span>
                  )}
                </div>
                {ex.target && (
                  <span className="font-body text-[9px] text-muted-foreground">{ex.target}</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
