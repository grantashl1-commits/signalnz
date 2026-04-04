import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import GoalSelectionScreen from "./GoalSelectionScreen";
import ProgramOverview from "./ProgramOverview";
import WorkoutSessionView from "./WorkoutSessionView";
import { useTrainingProgram, type WorkoutTemplate, type WorkoutExercise } from "@/hooks/useTrainingProgram";
import { haptic } from "@/hooks/use-mobile";

type View = "goal-select" | "program" | "phase-workouts" | "session";

export default function TrainingTab() {
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

  return (
    <div className="pb-8">
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
          {phases[selectedPhaseIdx]?.focus && (
            <p className="font-body text-sm text-muted-foreground leading-relaxed">
              {phases[selectedPhaseIdx].focus}
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
                      <p className="font-mono text-[10px] text-primary uppercase tracking-[0.15em]">{wt.day_label}</p>
                      <h3 className="font-display text-base font-bold text-foreground mt-0.5">{wt.title}</h3>
                    </div>
                    <span className="font-body text-xs text-muted-foreground shrink-0">{wt.estimated_duration_min} min</span>
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
          phaseName={phases[selectedPhaseIdx]?.name}
          onBack={() => setView("phase-workouts")}
        />
      )}
    </div>
  );
}
