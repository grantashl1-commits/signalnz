import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Zap, Moon, Sprout, Sun } from "lucide-react";
import GoalSelectionScreen from "./GoalSelectionScreen";
import ProgramOverview from "./ProgramOverview";
import WorkoutSessionView from "./WorkoutSessionView";
import RunIntervalPlayer from "./RunIntervalPlayer";
import WorkoutDayAccordion from "./WorkoutDayAccordion";
import { useTrainingProgram, type WorkoutTemplate, type WorkoutExercise, type WorkoutInterval } from "@/hooks/useTrainingProgram";
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

type View = "goal-select" | "program" | "phase-workouts" | "session" | "run-session";

export default function TrainingTab() {
  const { currentPhase, currentCycleDay } = useCycle();
  const {
    goals,
    goalCategoryId,
    program,
    phases,
    loading,
    selectGoal,
    fetchWorkouts,
    fetchWorkoutExercises,
    fetchWorkoutIntervals,
  } = useTrainingProgram();

  const [view, setView] = useState<View>("goal-select");
  const [selectedPhaseIdx, setSelectedPhaseIdx] = useState(0);
  const [workouts, setWorkouts] = useState<WorkoutTemplate[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<WorkoutTemplate | null>(null);
  const [activeExercises, setActiveExercises] = useState<WorkoutExercise[]>([]);
  const [activeIntervals, setActiveIntervals] = useState<WorkoutInterval[]>([]);
  const [loadingSub, setLoadingSub] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (goalCategoryId && program) setView("program");
    else setView("goal-select");
  }, [loading, goalCategoryId, program]);

  const handleSelectGoal = async (goalId: string) => {
    haptic("medium");
    localStorage.removeItem("signal_ai_workout_plan");
    localStorage.removeItem("signal_ai_active_session");
    setSelectedPhaseIdx(0);
    setWorkouts([]);
    setActiveWorkout(null);
    setActiveExercises([]);
    setActiveIntervals([]);
    await selectGoal(goalId);
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

  const handleStartSession = async (wt: WorkoutTemplate) => {
    haptic("medium");
    setLoadingSub(true);
    const [exs, ivs] = await Promise.all([
      fetchWorkoutExercises(wt.id),
      fetchWorkoutIntervals(wt.id),
    ]);
    setActiveWorkout(wt);
    setActiveExercises(exs);
    setActiveIntervals(ivs);
    if (ivs.length > 0 && exs.length === 0) setView("run-session");
    else setView("session");
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
  const isSessionView = view === "session" || view === "run-session";

  return (
    <div className="pb-8 space-y-4">
      {phaseGuidance && !isSessionView && (
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

      {view === "goal-select" && (
        <GoalSelectionScreen goals={goals} selectedGoalId={goalCategoryId} onSelect={handleSelectGoal} />
      )}

      {view === "program" && program && (
        <ProgramOverview
          program={program}
          phases={phases}
          onStartProgram={handleStartProgram}
          onChangeGoal={() => setView("goal-select")}
          onSelectPhase={handleSelectPhase}
        />
      )}

      {view === "phase-workouts" && (
        <div className="space-y-5">
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

          {phases[selectedPhaseIdx]?.phase_goal && (
            <p className="font-body text-sm text-muted-foreground leading-relaxed">
              {phases[selectedPhaseIdx].phase_goal}
            </p>
          )}

          {loadingSub ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-3">
              {workouts.map((wt, i) => (
                <WorkoutDayAccordion
                  key={wt.id}
                  workout={wt}
                  index={i}
                  onStartSession={handleStartSession}
                />
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

      {view === "session" && activeWorkout && (
        <WorkoutSessionView
          template={activeWorkout}
          exercises={activeExercises}
          phaseName={phases[selectedPhaseIdx]?.title}
          onBack={() => setView("phase-workouts")}
        />
      )}

      {view === "run-session" && activeWorkout && (
        <RunIntervalPlayer
          template={activeWorkout}
          intervals={activeIntervals}
          onBack={() => setView("phase-workouts")}
        />
      )}
    </div>
  );
}
