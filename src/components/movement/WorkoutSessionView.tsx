import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Clock, Dumbbell, ChevronDown, ChevronUp, Target, Flame,
  MessageCircle, Check, BookOpen, Zap, Wind, Shield, ArrowLeftRight,
  X, PenLine, Save, Heart
} from "lucide-react";
import { cn } from "@/lib/utils";
import { haptic } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCycle } from "@/contexts/CycleContext";
import { useGlobalHeartRate } from "@/contexts/HeartRateContext";
import ExerciseDemonstration from "@/components/ExerciseDemonstration";
import MuscleIllustration from "@/components/movement/MuscleIllustration";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { TimerButton, WorkoutIntervalButton, isTimeBased } from "@/components/movement/IntervalTimer";
import type { WorkoutTemplate, WorkoutExercise } from "@/hooks/useTrainingProgram";

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
  const { connected: hrConnected, deviceName: hrDevice, connect: connectHR } = useGlobalHeartRate();

  // Session started state
  const [sessionStarted, setSessionStarted] = useState(false);

  // Local exercises — can be modified by swaps
  const [localExercises, setLocalExercises] = useState<WorkoutExercise[]>(exercises);
  useEffect(() => { setLocalExercises(exercises); }, [exercises]);

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

    const { error } = await (supabase as any)
      .from("workout_logs")
      .insert({
        user_id: user.id,
        workout_template_id: template.id,
        exercises: exercisesPayload,
        duration_minutes: template.estimated_duration_mins,
        notes: sessionNotes.trim() || null,
        completed: true,
        cycle_phase: currentPhase,
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

        {hrConnected ? (
          <div className="flex items-center gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3.5">
            <Heart className="h-4 w-4 text-emerald-600 shrink-0" />
            <div>
              <p className="font-body text-sm font-medium text-emerald-700">{hrDevice || "Heart rate monitor"} connected</p>
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
              onClick={() => { haptic("light"); connectHR(); }}
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

      {/* Workout-level interval timer for alternating time-based exercises (e.g. run/walk) */}
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

            <div className="flex flex-wrap gap-3 mt-1">
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