import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Clock, Dumbbell, ChevronDown, ChevronUp, Target, Flame,
  MessageCircle, Check, BookOpen, Zap, Wind, Shield, ArrowLeftRight,
  X, PenLine, Save, Heart, Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { haptic } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCycle } from "@/contexts/CycleContext";
import { useGlobalHeartRate } from "@/contexts/HeartRateContext";
import { useProfile } from "@/hooks/useProfile";
import ExerciseDemonstration from "@/components/ExerciseDemonstration";
import MuscleIllustration from "@/components/movement/MuscleIllustration";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { TimerButton, WorkoutIntervalButton, isTimeBased, StructuredIntervalButton, type StructuredInterval } from "@/components/movement/IntervalTimer";
import type { WorkoutTemplate, WorkoutExercise } from "@/hooks/useTrainingProgram";
import {
  HR_ZONES, getZoneForBPM, getMaxHR, estimateCalories,
} from "@/data/workouts";
import {
  ComposedChart, Line, XAxis, YAxis, ResponsiveContainer,
  ReferenceArea, ReferenceLine,
} from "recharts";

interface Props {
  template: WorkoutTemplate;
  exercises: WorkoutExercise[];
  onBack: () => void;
  phaseName?: string;
}

// ─── Stretch colour coding ────────────────────────────────────────────────────

const STRETCH_COLORS: Record<string, string> = {
  "str-001": "#4A90D9", "str-002": "#4A90D9", "str-003": "#4A90D9", "str-004": "#4A90D9", "str-005": "#4A90D9", "str-006": "#4A90D9",
  "str-007": "#8B5CF6", "str-008": "#8B5CF6", "str-009": "#8B5CF6", "str-010": "#8B5CF6", "str-011": "#8B5CF6", "str-012": "#8B5CF6",
  "str-013": "#EC4899", "str-014": "#EC4899", "str-015": "#EC4899", "str-016": "#EC4899", "str-017": "#EC4899", "str-018": "#EC4899",
  "str-019": "#10B981", "str-020": "#10B981", "str-021": "#10B981", "str-022": "#10B981", "str-023": "#10B981", "str-024": "#10B981",
  "str-025": "#F97316", "str-026": "#F97316", "str-027": "#F97316", "str-028": "#F97316", "str-029": "#F97316", "str-030": "#F97316",
  "str-031": "#EF4444", "str-032": "#EF4444", "str-033": "#EF4444", "str-034": "#EF4444", "str-035": "#EF4444", "str-036": "#EF4444",
  "str-037": "#F59E0B", "str-038": "#F59E0B", "str-039": "#F59E0B", "str-040": "#F59E0B", "str-041": "#F59E0B", "str-042": "#F59E0B", "str-043": "#F59E0B", "str-044": "#F59E0B",
  "str-045": "#14B8A6", "str-046": "#14B8A6", "str-047": "#14B8A6", "str-048": "#14B8A6", "str-049": "#14B8A6", "str-050": "#14B8A6", "str-051": "#14B8A6", "str-052": "#14B8A6",
};

const STRETCH_SECTION_NAMES: Record<string, string> = {
  "#4A90D9": "Neck & Forearms",
  "#8B5CF6": "Upper Back & Triceps",
  "#EC4899": "Chest & Biceps",
  "#10B981": "Spine & Lower Back",
  "#F97316": "Lower Leg & Feet",
  "#EF4444": "Glutes & Hammies",
  "#F59E0B": "Inner Thighs & Lunges",
  "#14B8A6": "Hip Flexors",
};

function formatMuscle(m: string): string {
  return m.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Strip AI filler text */
function sanitizeText(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .replace(/\b(point!\s*)+/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/[,\s]+$/, "")
    .trim();
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface SwapExercise {
  id: string;
  name: string;
  primary_muscles: string[] | null;
  target: string | null;
  gif_url: string | null;
  equipment: string[] | null;
}

// ─── Exercise Swap Sheet ──────────────────────────────────────────────────────

function ExerciseSwapSheet({
  open,
  targetMuscles,
  excludeId,
  onSwap,
  onClose,
}: {
  open: boolean;
  targetMuscles: string[];
  excludeId: string;
  onSwap: (ex: SwapExercise) => void;
  onClose: () => void;
}) {
  const [results, setResults] = useState<SwapExercise[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!open || targetMuscles.length === 0) return;
    setSearching(true);
    setResults([]);

    const muscle = targetMuscles[0];
    supabase
      .from("exercises")
      .select("id, name, primary_muscles, target, gif_url, equipment")
      .contains("primary_muscles", [muscle])
      .neq("id", excludeId)
      .limit(20)
      .then(({ data }) => {
        // If no results by primary_muscles, fall back to target field
        if (!data?.length) {
          return supabase
            .from("exercises")
            .select("id, name, primary_muscles, target, gif_url, equipment")
            .ilike("target", `%${muscle}%`)
            .neq("id", excludeId)
            .limit(20);
        }
        return { data };
      })
      .then((res) => {
        const d = (res as any)?.data ?? [];
        setResults(d as SwapExercise[]);
        setSearching(false);
      });
  }, [open, targetMuscles, excludeId]);

  return (
    <Drawer open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DrawerContent className="max-h-[80vh]">
        <DrawerHeader className="relative pb-0">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 h-8 w-8 rounded-full bg-secondary flex items-center justify-center"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
          <DrawerTitle className="font-display text-lg font-bold text-foreground pr-10">
            Swap exercise
          </DrawerTitle>
          {targetMuscles.length > 0 && (
            <p className="font-body text-xs text-muted-foreground mt-1">
              Same muscle group: {targetMuscles.map(formatMuscle).join(", ")}
            </p>
          )}
        </DrawerHeader>

        <div className="px-4 pb-6 pt-3 overflow-y-auto space-y-2">
          {searching && (
            <div className="flex justify-center py-8">
              <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!searching && results.length === 0 && (
            <p className="font-body text-sm text-muted-foreground text-center py-8">
              No alternatives found for this muscle group.
            </p>
          )}

          {results.map((ex) => (
            <button
              key={ex.id}
              onClick={() => { haptic("medium"); onSwap(ex); }}
              className="w-full flex items-center gap-3 rounded-xl bg-card border border-border p-3 hover:bg-muted/30 transition-colors text-left"
            >
              <div className="shrink-0">
                <ExerciseDemonstration exerciseName={ex.name} size={56} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display text-sm font-bold text-foreground truncate">{ex.name}</p>
                {ex.primary_muscles && ex.primary_muscles.length > 0 && (
                  <p className="font-body text-xs text-muted-foreground mt-0.5">
                    {ex.primary_muscles.slice(0, 2).map(formatMuscle).join(" · ")}
                  </p>
                )}
                {ex.equipment && ex.equipment.length > 0 && (
                  <p className="font-body text-[10px] text-muted-foreground/60 italic">
                    {ex.equipment[0].replace(/_/g, " ")}
                  </p>
                )}
              </div>
              <ArrowLeftRight className="h-4 w-4 text-primary shrink-0" />
            </button>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function WorkoutSessionView({ template, exercises, onBack, phaseName }: Props) {
  const { user } = useAuth();
  const { currentPhase } = useCycle();
  const hr = useGlobalHeartRate();
  const profile = useProfile();

  // Derive age from profile
  const profileAge = useMemo(() => {
    if (profile.dateOfBirth) {
      const dob = new Date(profile.dateOfBirth);
      const today = new Date();
      let a = today.getFullYear() - dob.getFullYear();
      if (today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) a--;
      return a;
    }
    return null;
  }, [profile.dateOfBirth]);
  const userAge = profileAge || 30;
  const userWeight = profile.weightKg || 65;
  const maxHR = getMaxHR(userAge);
  const currentZone = hr.bpm > 0 ? getZoneForBPM(hr.bpm, maxHR) : HR_ZONES[0];
  // Session started state
  const [sessionStarted, setSessionStarted] = useState(false);

  // ── Inline HR tracking ──
  const [hrRunning, setHrRunning] = useState(false);
  const [hrElapsed, setHrElapsed] = useState(0);
  const [hrData, setHrData] = useState<{ time: number; bpm: number }[]>([]);
  const hrStartRef = useRef<number>(0);
  const hrIntervalRef = useRef<number | null>(null);
  const hrSampleRef = useRef<number | null>(null);
  const hrElapsedRef = useRef(0);
  const bpmRef = useRef(0);

  useEffect(() => { hrElapsedRef.current = hrElapsed; }, [hrElapsed]);
  useEffect(() => { bpmRef.current = hr.bpm; }, [hr.bpm]);

  // Auto-start HR tracking when session starts and HR connected
  useEffect(() => {
    if (sessionStarted && hr.connected && !hrRunning) {
      setHrRunning(true);
      hrStartRef.current = Date.now();
    }
  }, [sessionStarted, hr.connected]);

  // Timer
  useEffect(() => {
    if (!hrRunning) return;
    hrStartRef.current = Date.now() - hrElapsedRef.current * 1000;
    hrIntervalRef.current = window.setInterval(() => {
      setHrElapsed(Math.floor((Date.now() - hrStartRef.current) / 1000));
    }, 1000);
    return () => { if (hrIntervalRef.current) clearInterval(hrIntervalRef.current); };
  }, [hrRunning]);

  // HR sampling every 2s
  useEffect(() => {
    if (!hrRunning) { if (hrSampleRef.current) clearInterval(hrSampleRef.current); return; }
    const sample = () => {
      const b = bpmRef.current;
      if (b <= 0) return;
      const t = hrStartRef.current > 0 ? Math.floor((Date.now() - hrStartRef.current) / 1000) : hrElapsedRef.current;
      setHrData(prev => [...prev, { time: t, bpm: b }]);
    };
    sample();
    hrSampleRef.current = window.setInterval(sample, 2000);
    return () => { if (hrSampleRef.current) clearInterval(hrSampleRef.current); };
  }, [hrRunning]);

  // Derived HR stats
  const zone2PlusMins = hrData.filter(d => getZoneForBPM(d.bpm, maxHR).zone >= 2).length * 2 / 60;
  const zone2Goal = 21;
  const avgBPM = hrData.length > 0 ? Math.round(hrData.reduce((s, d) => s + d.bpm, 0) / hrData.length) : 0;
  const liveCals = estimateCalories(avgBPM, hrElapsed / 60, userWeight, userAge);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Local exercises — can be modified by swaps
  const [localExercises, setLocalExercises] = useState<WorkoutExercise[]>(exercises);
  useEffect(() => { setLocalExercises(exercises); }, [exercises]);

  // Structured intervals (from workout_intervals table — for C25K/run programs)
  const [structuredIntervals, setStructuredIntervals] = useState<StructuredInterval[]>([]);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await (supabase as any)
        .from("workout_intervals")
        .select("block_label, kind, duration_sec, repeat_count, target_pace, order_index")
        .eq("workout_id", template.id)
        .order("order_index");
      if (!cancelled && data) setStructuredIntervals(data as StructuredInterval[]);
    })();
    return () => { cancelled = true; };
  }, [template.id]);

  // Exercise completion
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);

  // Swap
  const [swapTargetId, setSwapTargetId] = useState<string | null>(null);
  const [swapSheetOpen, setSwapSheetOpen] = useState(false);

  // Session logging
  const [sessionLogged, setSessionLogged] = useState(false);
  const [sessionLogging, setSessionLogging] = useState(false);
  const [sessionNotes, setSessionNotes] = useState("");
  const [showNotesInput, setShowNotesInput] = useState(false);

  const toggleComplete = (id: string) => {
    haptic("light");
    setCompletedExercises((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allComplete = localExercises.length > 0 && completedExercises.size === localExercises.length;

  // ── Swap logic ──
  const swapTargetExercise = swapTargetId
    ? localExercises.find((e) => e.id === swapTargetId)
    : null;

  const swapTargetMuscles: string[] = swapTargetExercise?.exercise
    ? (Array.isArray(swapTargetExercise.exercise.primary_muscles)
        ? swapTargetExercise.exercise.primary_muscles
        : swapTargetExercise.exercise.target
        ? [swapTargetExercise.exercise.target]
        : [])
    : [];

  const handleOpenSwap = (id: string) => {
    haptic("light");
    setSwapTargetId(id);
    setSwapSheetOpen(true);
  };

  const handleSwapConfirm = (swapped: SwapExercise) => {
    if (!swapTargetId) return;
    setLocalExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== swapTargetId) return ex;
        return {
          ...ex,
          exercise: {
            ...ex.exercise,
            id: swapped.id,
            name: swapped.name,
            primary_muscles: swapped.primary_muscles ?? ex.exercise?.primary_muscles,
            target: swapped.target ?? ex.exercise?.target,
            gif_url: swapped.gif_url,
            equipment: swapped.equipment ?? ex.exercise?.equipment,
          } as typeof ex.exercise,
        };
      })
    );
    setSwapSheetOpen(false);
    setSwapTargetId(null);
    toast.success("Exercise swapped for today");
  };

  // ── Session logging ──
  const handleLogSession = async () => {
    if (!user || sessionLogged || sessionLogging) return;
    setSessionLogging(true);

    const exercisesPayload = localExercises.map((ex) => ({
      exercise_id: ex.exercise?.id,
      exercise_name: ex.exercise?.name,
      sets: ex.sets,
      reps: ex.reps,
      rest_seconds: ex.rest_seconds,
      completed: completedExercises.has(ex.id),
    }));

    // Calculate HR stats if available
    const sessionAvgBPM = hrData.length > 0
      ? Math.round(hrData.reduce((s, d) => s + d.bpm, 0) / hrData.length)
      : null;
    const sessionMaxBPM = hrData.length > 0
      ? Math.max(...hrData.map(d => d.bpm))
      : null;
    const sessionCalories = sessionAvgBPM && hrElapsed > 0
      ? estimateCalories(sessionAvgBPM, hrElapsed / 60, userWeight, userAge)
      : null;
    const sessionZone2Pct = hrData.length > 0
      ? Math.round((hrData.filter(d => getZoneForBPM(d.bpm, maxHR).zone >= 2).length / hrData.length) * 100)
      : null;

    // Save HR session if we have HR data
    let hrSessionId: string | null = null;
    if (hrData.length > 0 && sessionAvgBPM) {
      try {
        const { data: hrSessionData } = await (supabase as any)
          .from("hr_sessions")
          .insert({
            user_id: user.id,
            session_date: new Date().toISOString().split("T")[0],
            workout_name: template.title,
            avg_bpm: sessionAvgBPM,
            max_bpm: sessionMaxBPM,
            calories: sessionCalories,
            duration_minutes: Math.round(hrElapsed / 60),
            bpm_trace: hrData,
            zones_summary: {},
            zone2_plus_percent: sessionZone2Pct,
            cycle_phase: currentPhase,
          })
          .select("id")
          .single();
        if (hrSessionData) hrSessionId = hrSessionData.id;
      } catch {}
    }

    const { error } = await (supabase as any)
      .from("workout_logs")
      .insert({
        user_id: user.id,
        workout_template_id: template.id,
        exercises: exercisesPayload,
        duration_minutes: hrElapsed > 0 ? Math.round(hrElapsed / 60) : template.estimated_duration_mins,
        notes: sessionNotes.trim() || null,
        completed: true,
        cycle_phase: currentPhase,
        hr_session_id: hrSessionId,
        avg_bpm: sessionAvgBPM,
        max_bpm: sessionMaxBPM,
        calories: sessionCalories,
        zone2_plus_percent: sessionZone2Pct,
      });

    setSessionLogging(false);
    if (error) {
      toast.error("Couldn't save session. Try again.");
    } else {
      setSessionLogged(true);
      toast.success("Session logged!");
    }
  };

  // ── Group exercises by superset ──
  const groupedExercises: (WorkoutExercise | WorkoutExercise[])[] = [];
  let i = 0;
  while (i < localExercises.length) {
    const ex = localExercises[i];
    if (ex.is_superset && ex.superset_group) {
      const group = [ex];
      let j = i + 1;
      while (j < localExercises.length && localExercises[j].superset_group === ex.superset_group) {
        group.push(localExercises[j]);
        j++;
      }
      groupedExercises.push(group);
      i = j;
    } else {
      groupedExercises.push(ex);
      i++;
    }
  }

  // Pre-session screen
  if (!sessionStarted) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => { haptic("light"); onBack(); }}
            className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-body text-[10px] text-primary uppercase tracking-[0.15em]">
              {template.day_label || `Session ${template.session_number || ""}`} · {phaseName || ""}
            </p>
            <h2 className="font-display text-xl font-extrabold text-foreground truncate">{template.title}</h2>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-body text-xs text-muted-foreground">{template.estimated_duration_mins} min</span>
          </div>
        </div>

        {template.session_notes && (
          <div className="rounded-xl bg-primary/5 border border-primary/10 p-3.5">
            <p className="font-body text-sm text-foreground leading-relaxed">{template.session_notes}</p>
          </div>
        )}

        <div className="rounded-xl bg-card border border-border p-4 space-y-2">
          <p className="font-body text-[10px] text-muted-foreground uppercase tracking-[0.15em]">This session</p>
          <p className="font-display text-2xl font-bold text-foreground">{localExercises.length} exercises</p>
          <p className="font-body text-xs text-muted-foreground">{template.estimated_duration_mins} min · {template.session_type || "Strength"}</p>
        </div>

        {hr.connected ? (
          <div className="flex items-center gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3.5">
            <Heart className="h-4 w-4 text-emerald-600 shrink-0" />
            <div>
              <p className="font-body text-sm font-medium text-emerald-700">{hr.deviceName || "Heart rate monitor"} connected</p>
              <p className="font-body text-xs text-emerald-600/70">Your zones will be tracked automatically</p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-card border border-border p-3.5 flex items-center justify-between gap-3">
            <div>
              <p className="font-body text-sm font-medium text-foreground">Heart rate monitor</p>
              <p className="font-body text-xs text-muted-foreground">Connect a Bluetooth HR monitor (optional)</p>
            </div>
            <button
              onClick={() => { haptic("light"); hr.connect(); }}
              className="shrink-0 rounded-full bg-secondary px-3 py-1.5 font-body text-xs text-primary font-medium"
            >
              Connect
            </button>
          </div>
        )}

        <button
          onClick={() => { haptic("medium"); setSessionStarted(true); }}
          className="w-full h-12 rounded-full bg-primary text-primary-foreground font-display text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
        >
          Start session
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => { haptic("light"); onBack(); }}
          className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-body text-[10px] text-primary uppercase tracking-[0.15em]">
            {template.day_label || `Session ${template.session_number || ""}`} · {phaseName || ""}
          </p>
          <h2 className="font-display text-xl font-extrabold text-foreground truncate">
            {template.title}
          </h2>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-body text-xs text-muted-foreground">{template.estimated_duration_mins} min</span>
        </div>
      </div>

      {/* Session notes */}
      {template.session_notes && (
        <div className="rounded-xl bg-primary/5 border border-primary/10 p-3.5">
          <p className="font-body text-sm text-foreground leading-relaxed">{template.session_notes}</p>
        </div>
      )}

      {/* Warmup */}
      {template.warmup_notes && (
        <div className="space-y-1.5">
          <p className="font-body text-[10px] text-muted-foreground uppercase tracking-[0.15em]">Warm-up</p>
          <div className="rounded-xl bg-card border border-border p-3.5">
            <p className="font-body text-sm text-muted-foreground leading-relaxed">{template.warmup_notes}</p>
          </div>
        </div>
      )}

      {/* ── Inline HR Stats Panel ── */}
      {hr.connected && (
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
          {/* BPM + Zone + Timer row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                className="rounded-2xl px-4 py-2 text-center transition-colors duration-500"
                style={{ backgroundColor: currentZone.color + "18" }}
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
              >
                <p className="font-body text-3xl font-bold leading-none" style={{ color: currentZone.color }}>
                  {hr.bpm || "—"}
                </p>
                <p className="font-body text-[9px] uppercase tracking-wider mt-0.5" style={{ color: currentZone.color }}>bpm</p>
              </motion.div>
              <div>
                <div
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1"
                  style={{ backgroundColor: currentZone.color }}
                >
                  <span className="font-body text-[10px] font-bold text-white">
                    Z{currentZone.zone} · {currentZone.label}
                  </span>
                </div>
                <p className="font-body text-xs text-muted-foreground mt-1">
                  {liveCals > 0 && <><Flame className="h-3 w-3 inline mr-1" />{liveCals} cal</>}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-body text-2xl text-foreground tabular-nums">{formatTime(hrElapsed)}</p>
              <p className="font-body text-[9px] text-muted-foreground uppercase tracking-wider">elapsed</p>
            </div>
          </div>

          {/* Zone 2+ ring */}
          {(() => {
            const ringSize = 64;
            const strokeW = 6;
            const radius = (ringSize - strokeW) / 2;
            const circ = 2 * Math.PI * radius;
            const progress = Math.min(zone2PlusMins / zone2Goal, 1);
            return (
              <div className="flex items-center gap-3">
                <div className="relative shrink-0" style={{ width: ringSize, height: ringSize }}>
                  <svg width={ringSize} height={ringSize} className="-rotate-90">
                    <circle cx={ringSize/2} cy={ringSize/2} r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth={strokeW} />
                    <circle cx={ringSize/2} cy={ringSize/2} r={radius} fill="none" stroke={currentZone.color} strokeWidth={strokeW}
                      strokeDasharray={circ} strokeDashoffset={circ - circ * progress} strokeLinecap="round"
                      className="transition-all duration-1000" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-body text-[10px] font-bold text-foreground">{Math.round(zone2PlusMins)}</span>
                    <span className="font-body text-[8px] text-muted-foreground">/{zone2Goal}m</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-body text-xs text-foreground">Zone 2+ progress</p>
                  <div className="flex gap-1 mt-1">
                    {HR_ZONES.map(z => {
                      const count = hrData.filter(d => getZoneForBPM(d.bpm, maxHR).zone === z.zone).length;
                      const mins = Math.round(count * 2 / 60 * 10) / 10;
                      return mins > 0 ? (
                        <span key={z.zone} className="rounded-full px-1.5 py-0.5 font-body text-[9px] text-white font-medium" style={{ backgroundColor: z.color }}>
                          Z{z.zone} {mins}m
                        </span>
                      ) : null;
                    })}
                  </div>
                  {avgBPM > 0 && (
                    <p className="font-body text-[10px] text-muted-foreground mt-1">Avg {avgBPM} bpm</p>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Mini HR graph */}
          {hrData.length >= 4 && (
            <div className="h-24 rounded-xl overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={hrData.filter((_, i) => i % 3 === 0 || i === hrData.length - 1).map(d => ({
                  mins: parseFloat((d.time / 60).toFixed(2)), bpm: d.bpm
                }))} margin={{ top: 2, right: 4, bottom: 0, left: 0 }}>
                  {/* Zone bands */}
                  <ReferenceArea y1={40} y2={Math.round(maxHR * 0.6)} fill={HR_ZONES[0].color} fillOpacity={0.08} ifOverflow="extendDomain" />
                  <ReferenceArea y1={Math.round(maxHR * 0.6)} y2={Math.round(maxHR * 0.7)} fill={HR_ZONES[1].color} fillOpacity={0.1} ifOverflow="extendDomain" />
                  <ReferenceArea y1={Math.round(maxHR * 0.7)} y2={Math.round(maxHR * 0.8)} fill={HR_ZONES[2].color} fillOpacity={0.1} ifOverflow="extendDomain" />
                  <ReferenceArea y1={Math.round(maxHR * 0.8)} y2={maxHR + 10} fill={HR_ZONES[3].color} fillOpacity={0.1} ifOverflow="extendDomain" />
                  <XAxis dataKey="mins" type="number" domain={["dataMin", "dataMax"]} hide />
                  <YAxis domain={["dataMin - 10", maxHR + 10]} hide />
                  <ReferenceLine y={Math.round(maxHR * 0.6)} stroke={HR_ZONES[1].color} strokeDasharray="3 3" strokeWidth={0.5} />
                  <ReferenceLine y={Math.round(maxHR * 0.7)} stroke={HR_ZONES[2].color} strokeDasharray="3 3" strokeWidth={0.5} />
                  <Line type="monotone" dataKey="bpm" stroke="hsl(var(--primary))" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {(() => {
        const timeExercises = localExercises.filter(e => e.exercise && isTimeBased(e.reps));
        if (timeExercises.length >= 2) {
          return (
            <WorkoutIntervalButton
              exercises={timeExercises.map(e => ({
                name: e.exercise?.name || "",
                reps: e.reps,
                sets: e.sets,
                restSeconds: e.rest_seconds,
              }))}
            />
          );
        }
        return null;
      })()}

      {/* Exercises */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="font-body text-[10px] text-muted-foreground uppercase tracking-[0.15em]">Exercises</p>
          <p className="font-body text-[10px] text-muted-foreground">
            {completedExercises.size}/{localExercises.length} done
          </p>
        </div>

        {groupedExercises.map((item, idx) => {
          if (Array.isArray(item)) {
            return (
              <div key={`superset-${idx}`} className="rounded-xl border-2 border-primary/20 overflow-hidden">
                <div className="bg-primary/5 px-3.5 py-1.5">
                  <span className="font-body text-[10px] text-primary uppercase tracking-wider">Superset</span>
                </div>
                {item.map((ex) => (
                  <ExerciseCard
                    key={ex.id}
                    ex={ex}
                    completed={completedExercises.has(ex.id)}
                    expanded={expandedExercise === ex.id}
                    onToggleExpand={() => setExpandedExercise(expandedExercise === ex.id ? null : ex.id)}
                    onToggleComplete={() => toggleComplete(ex.id)}
                    onSwap={() => handleOpenSwap(ex.id)}
                  />
                ))}
              </div>
            );
          }
          return (
            <ExerciseCard
              key={item.id}
              ex={item}
              completed={completedExercises.has(item.id)}
              expanded={expandedExercise === item.id}
              onToggleExpand={() => setExpandedExercise(expandedExercise === item.id ? null : item.id)}
              onToggleComplete={() => toggleComplete(item.id)}
              onSwap={() => handleOpenSwap(item.id)}
            />
          );
        })}
      </div>

      {/* Cooldown */}
      {template.cooldown_notes && (
        <div className="space-y-1.5">
          <p className="font-body text-[10px] text-muted-foreground uppercase tracking-[0.15em]">Cool-down</p>
          <div className="rounded-xl bg-card border border-border p-3.5">
            <p className="font-body text-sm text-muted-foreground leading-relaxed">{template.cooldown_notes}</p>
          </div>
        </div>
      )}

      {/* Session completion celebration */}
      {allComplete && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-primary/5 border border-primary/20 p-4 text-center space-y-1"
        >
          <div className="mx-auto h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Flame className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-display text-base font-bold text-foreground">All exercises complete!</h3>
          <p className="font-body text-xs text-muted-foreground">Great work. Log your session below.</p>
        </motion.div>
      )}

      {/* Always-visible session log */}
      {!sessionLogged ? (
        <div className="rounded-2xl bg-card border border-border p-4 space-y-3">
          {showNotesInput ? (
            <textarea
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              placeholder="How did it feel? Any notes..."
              rows={2}
              className="w-full rounded-xl bg-background border border-border px-3 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
          ) : (
            <button
              onClick={() => setShowNotesInput(true)}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors w-full"
            >
              <PenLine className="h-3.5 w-3.5" />
              <span className="font-body text-xs">Add a note (optional)</span>
            </button>
          )}
          <button
            onClick={handleLogSession}
            disabled={sessionLogging}
            className="w-full h-11 rounded-full bg-primary text-primary-foreground font-display text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-60 transition-colors"
          >
            {sessionLogging ? (
              <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="h-4 w-4" />
                Log this session
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
          <div className="h-5 w-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <Check className="h-3 w-3 text-emerald-600" />
          </div>
          <span className="font-body text-sm text-emerald-600 font-medium">Session logged</span>
        </div>
      )}

      {/* Swap sheet */}
      <ExerciseSwapSheet
        open={swapSheetOpen}
        targetMuscles={swapTargetMuscles}
        excludeId={swapTargetExercise?.exercise?.id ?? ""}
        onSwap={handleSwapConfirm}
        onClose={() => { setSwapSheetOpen(false); setSwapTargetId(null); }}
      />
    </div>
  );
}

// ─── Exercise Card ────────────────────────────────────────────────────────────

function ExerciseCard({
  ex,
  completed,
  expanded,
  onToggleExpand,
  onToggleComplete,
  onSwap,
}: {
  ex: WorkoutExercise;
  completed: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
  onToggleComplete: () => void;
  onSwap: () => void;
}) {
  const exercise = ex.exercise;
  if (!exercise) return null;

  const isStretch = exercise.id?.startsWith("str-");
  const stretchColor = isStretch ? STRETCH_COLORS[exercise.id] : null;
  const sectionName = stretchColor ? STRETCH_SECTION_NAMES[stretchColor] : null;

  const instructions = exercise.instructions ? [exercise.instructions] : [];
  const cues = Array.isArray(exercise.cues) ? exercise.cues : [];
  const primaryMuscles = Array.isArray(exercise.primary_muscles) ? exercise.primary_muscles : [];
  const secondaryMuscles = exercise.secondary_muscles || [];
  const equipment = Array.isArray(exercise.equipment) ? exercise.equipment : [];

  return (
    <div
      className={cn(
        "rounded-xl bg-card border transition-all",
        completed ? "border-primary/30 bg-primary/3" : "border-border"
      )}
      style={stretchColor ? { borderLeftWidth: 3, borderLeftColor: stretchColor } : undefined}
    >
      <button
        onClick={onToggleExpand}
        className="w-full p-3.5 text-left"
      >
        <div className="flex items-start gap-3">
          {/* Completion circle */}
          <button
            onClick={(e) => { e.stopPropagation(); onToggleComplete(); }}
            className={cn(
              "mt-0.5 h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
              completed
                ? "bg-primary border-primary text-primary-foreground"
                : "border-muted-foreground/30 hover:border-primary/50"
            )}
          >
            {completed && <Check className="h-3.5 w-3.5" />}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className={cn(
                "font-display text-sm font-bold",
                completed ? "text-primary" : "text-foreground"
              )}>
                {sanitizeText(exercise.name)}
              </h4>
              {exercise.is_low_impact && (
                <Shield className="h-3 w-3 text-emerald-500 shrink-0" />
              )}
              {exercise.is_somatic && (
                <Wind className="h-3 w-3 text-sky-500 shrink-0" />
              )}
            </div>

            {/* Muscle illustration */}
            {primaryMuscles.length > 0 && (
              <div className="flex items-center gap-1 mt-0.5">
                <MuscleIllustration targetMuscle={primaryMuscles[0]} size={18} />
              </div>
            )}

            {sectionName && (
              <span className="font-body text-[10px] font-medium" style={{ color: stretchColor || undefined }}>
                {sectionName}
              </span>
            )}

            <div className="flex flex-wrap gap-3 mt-1 items-center">
              {ex.sets && (
                <span className="font-body text-xs text-muted-foreground">{ex.sets} sets</span>
              )}
              {ex.reps && (
                <span className="font-body text-xs text-muted-foreground">{ex.reps} reps</span>
              )}
              {ex.rest_seconds != null && ex.rest_seconds > 0 && (
                <span className="font-body text-xs text-muted-foreground">{ex.rest_seconds}s rest</span>
              )}
              {ex.rpe_target != null && (
                <span className="font-body text-[10px] text-primary uppercase">RPE {ex.rpe_target}</span>
              )}
            </div>

            {/* Timer button for time-based exercises */}
            {isTimeBased(ex.reps) && (
              <div className="mt-2">
                <TimerButton
                  exerciseName={exercise.name}
                  reps={ex.reps}
                  sets={ex.sets}
                  restSeconds={ex.rest_seconds}
                  onComplete={() => onToggleComplete()}
                />
              </div>
            )}
          </div>

          {/* Swap + expand icons */}
          <div className="flex items-center gap-1 shrink-0 mt-0.5">
            <button
              onClick={(e) => { e.stopPropagation(); onSwap(); }}
              className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              title="Swap exercise"
            >
              <ArrowLeftRight className="h-3.5 w-3.5" />
            </button>
            {expanded
              ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
              : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </div>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3.5 pb-4 pt-1 space-y-3">
              {/* GIF demonstration */}
              <div className="flex justify-center py-2">
                <ExerciseDemonstration exerciseName={exercise.name} size={160} className="rounded-xl" />
              </div>

              <div className="pl-[2.75rem] space-y-3">
                {ex.load_guidance && (
                  <div className="flex items-start gap-2">
                    <Dumbbell className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                    <p className="font-body text-xs text-foreground leading-relaxed">{sanitizeText(ex.load_guidance)}</p>
                  </div>
                )}

                {instructions.length > 0 && (
                  <div>
                    <p className="font-body text-[9px] text-muted-foreground uppercase tracking-wider mb-1">How to</p>
                    {instructions.map((inst: string, j: number) => (
                      <p key={j} className="font-body text-xs text-muted-foreground leading-relaxed">{sanitizeText(inst)}</p>
                    ))}
                  </div>
                )}

                {cues.length > 0 && (
                  <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <MessageCircle className="h-3 w-3 text-primary" />
                      <p className="font-body text-[9px] text-primary uppercase tracking-wider font-semibold">Coaching cues</p>
                    </div>
                    <ul className="space-y-1.5">
                      {cues.map((cue: string, j: number) => (
                        <li key={j} className="font-body text-xs text-foreground leading-relaxed flex gap-2">
                          <span className="text-primary shrink-0">·</span>
                          {sanitizeText(cue)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Muscles & equipment */}
                {(primaryMuscles.length > 0 || equipment.length > 0) && (
                  <div className="flex flex-wrap gap-1.5">
                    {primaryMuscles.map((m) => (
                      <span key={m} className="rounded-full bg-primary/8 px-2 py-0.5 font-body text-[10px] text-primary font-medium">
                        {formatMuscle(m)}
                      </span>
                    ))}
                    {(secondaryMuscles as string[]).map((m) => (
                      <span key={m} className="rounded-full bg-muted/30 px-2 py-0.5 font-body text-[10px] text-muted-foreground">
                        {formatMuscle(m)}
                      </span>
                    ))}
                    {equipment.map((eq) => (
                      <span key={eq} className="rounded-full bg-muted/20 px-2 py-0.5 font-body text-[10px] text-muted-foreground italic">
                        {eq.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                )}

                {/* Difficulty */}
                {exercise.difficulty && exercise.difficulty > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="font-body text-[10px] text-muted-foreground">Difficulty:</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className={`w-2 h-2 rounded-full ${i < exercise.difficulty! ? 'bg-primary' : 'bg-muted/30'}`} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}