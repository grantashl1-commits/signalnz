/**
 * ⚠️ ARCHIVED – replaced by the static-data TrainingTab in src/components/movement/TrainingTab.tsx,
 * which renders SIGNAL_TRAINING_PATHS from src/data/signal-training-paths.ts.
 * This Supabase-backed Goal → Program → Phase → Session flow is preserved for reference only.
 * DO NOT DELETE.
 *
 * Note: this file is intentionally not imported anywhere. The supporting components
 * (GoalSelectionScreen, ProgramOverview, WorkoutSessionView) and the
 * useTrainingProgram hook remain in place for now and may be removed in a later
 * rebuild pass once nothing else depends on them.
 */

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Zap, Moon, Sprout, Sun } from "lucide-react";
import GoalSelectionScreen from "./GoalSelectionScreen";
import ProgramOverview from "./ProgramOverview";
import WorkoutSessionView from "./WorkoutSessionView";
import { useTrainingProgram, type WorkoutTemplate, type WorkoutExercise } from "@/hooks/useTrainingProgram";
import { haptic } from "@/hooks/use-mobile";
import { useCycle } from "@/contexts/CycleContext";
import { cn } from "@/lib/utils";

// Cycle-phase training guidance
const PHASE_TRAINING_GUIDANCE: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string; color: string; note: string }> = {
  menstrual: {
    icon: Moon,
    label: "Menstrual — Rest & Restore",
    color: "text-rose-400",
    note: "Lower intensity right now. Yoga, walking, gentle strength. Prioritise rest and shorter sessions.",
  },
  follicular: {
    icon: Sprout,
    label: "Follicular — Build & Explore",
    color: "text-violet-400",
    note: "Energy is rising. Great time to try new movements, heavier lifting, and start HIIT.",
  },
  ovulatory: {
    icon: Zap,
    label: "Ovulatory — Peak Performance",
    color: "text-amber-400",
    note: "You're at peak strength and energy. Best time for personal bests and high-intensity cardio.",
  },
  luteal: {
    icon: Sun,
    label: "Luteal — Maintain & Wind Down",
    color: "text-indigo-400",
    note: "Energy drops during this phase. Maintain strength, reduce cardio intensity, and add extra rest days.",
  },
};

type View = "goal-select" | "program" | "phase-workouts" | "session";

export default function TrainingTab() {
  const { currentPhase, currentWeekNumber, currentCycleDay } = useCycle();
  const {
    goals,
    goalCategoryId,
    program,
    phases,
    loading,
    selectGoal,
    fetchWorkouts,
    fetchWorkoutExercises,
  } = useTrainingProgram();

  const [view, setView] = useState<View>("goal-select");
  const [selectedPhaseIdx, setSelectedPhaseIdx] = useState(0);
  const [workouts, setWorkouts] = useState<WorkoutTemplate[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<WorkoutTemplate | null>(null);
  const [activeExercises, setActiveExercises] = useState<WorkoutExercise[]>([]);
  const [loadingSub, setLoadingSub] = useState(false);

  // Determine initial view based on whether user has a goal
  useEffect(() => {
    if (loading) return;
    if (goalCategoryId && program) {
      setView("program");
    } else {
      setView("goal-select");
    }
  }, [loading, goalCategoryId, program]);

  const handleSelectGoal = async (goalId: string) => {
    haptic("medium");
    // Clear any cached AI training plan so user starts fresh
    localStorage.removeItem("signal_ai_workout_plan");
    localStorage.removeItem("signal_ai_active_session");
    // Reset UI state to beginning
    setSelectedPhaseIdx(0);
    setWorkouts([]);
    setActiveWorkout(null);
    setActiveExercises([]);
    await selectGoal(goalId);
    // View will update via the effect above when program loads
  };

  const handleStartProgram = async () => {
    haptic("medium");
    if (phases.length === 0) return;
    setLoadingSub(true);
    const wts = await fetchWorkouts(phases[0].id);
    setWorkouts(wts);
    setSelectedPhaseIdx(0);
    setView("phase-workouts");
    setLoadingSub(false);
  };

  const handleSelectPhase = async (idx: number) => {
    haptic("light");
    setLoadingSub(true);
    setSelectedPhaseIdx(idx);
    const wts = await fetchWorkouts(phases[idx].id);
    setWorkouts(wts);
    setView("phase-workouts");
    setLoadingSub(false);
  };

  const handleOpenWorkout = async (wt: WorkoutTemplate) => {
    haptic("medium");
    setLoadingSub(true);
    const exs = await fetchWorkoutExercises(wt.id);
    setActiveWorkout(wt);
    setActiveExercises(exs);
    setView("session");
    setLoadingSub(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const phaseGuidance = PHASE_TRAINING_GUIDANCE[currentPhase];
  const PhaseIcon = phaseGuidance?.icon;

  return (
    <div className="pb-8 space-y-4">
      {/* Cycle phase training context banner */}
      {phaseGuidance && view !== "session" && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-card border border-border p-3.5 flex items-start gap-3"
        >
          {PhaseIcon && (
            <div className="shrink-0 mt-0.5 h-8 w-8 rounded-full bg-muted/40 flex items-center justify-center">
              <PhaseIcon className={cn("h-4 w-4", phaseGuidance.color)} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className={cn("font-body text-[10px] uppercase tracking-[0.15em] font-semibold", phaseGuidance.color)}>
                {phaseGuidance.label}
              </p>
              <span className="font-body text-[10px] text-muted-foreground">· Cycle Day {currentCycleDay || "—"}</span>
            </div>
            <p className="font-body text-xs text-muted-foreground leading-relaxed mt-0.5">{phaseGuidance.note}</p>
          </div>
        </motion.div>
      )}

      {/* Goal selection */}
      {view === "goal-select" && (
        <GoalSelectionScreen
          goals={goals}
          selectedGoalId={goalCategoryId}
          onSelect={handleSelectGoal}
        />
      )}

      {/* Program overview */}
      {view === "program" && program && (
        <ProgramOverview
          program={program}
          phases={phases}
          onStartProgram={handleStartProgram}
          onChangeGoal={() => setView("goal-select")}
          onSelectPhase={handleSelectPhase}
        />
      )}

      {/* Phase workouts list */}
      {view === "phase-workouts" && (
        <div className="space-y-5">
          {/* Phase tabs */}
          {phases.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {phases.map((ph, idx) => (
                <button
                  key={ph.id}
                  onClick={() => handleSelectPhase(idx)}
                  className={`shrink-0 rounded-full px-4 py-1.5 font-body text-sm font-medium border transition-all ${
                    idx === selectedPhaseIdx
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-muted-foreground border-border hover:bg-muted/30"
                  }`}
                >
                  Phase {ph.phase_number}: {ph.title}
                </button>
              ))}
            </div>
          )}

          {/* Phase focus */}
          {phases[selectedPhaseIdx]?.phase_goal && (
            <p className="font-body text-sm text-muted-foreground leading-relaxed">
              {phases[selectedPhaseIdx].phase_goal}
            </p>
          )}

          {/* Workout cards */}
          {loadingSub ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-3">
              {workouts.map((wt, i) => (
                <motion.button
                  key={wt.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => handleOpenWorkout(wt)}
                  className="w-full rounded-xl bg-card border border-border p-4 text-left hover:bg-card/80 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-body text-[10px] text-primary uppercase tracking-[0.15em]">{wt.day_label}</p>
                      <h3 className="font-display text-base font-bold text-foreground mt-0.5">{wt.title}</h3>
                    </div>
                    <span className="font-body text-xs text-muted-foreground shrink-0">{wt.estimated_duration_mins} min</span>
                  </div>
                  {wt.session_notes && (
                    <p className="font-body text-xs text-muted-foreground mt-1.5 line-clamp-2">{wt.session_notes}</p>
                  )}
                </motion.button>
              ))}
            </div>
          )}

          <button
            onClick={() => { haptic("light"); setView("program"); }}
            className="w-full text-center font-body text-sm text-muted-foreground hover:text-foreground transition-colors pt-2"
          >
            Back to program overview
          </button>
        </div>
      )}

      {/* Active workout session */}
      {view === "session" && activeWorkout && (
        <WorkoutSessionView
          template={activeWorkout}
          exercises={activeExercises}
          phaseName={phases[selectedPhaseIdx]?.title}
          onBack={() => setView("phase-workouts")}
        />
      )}
    </div>
  );
}
