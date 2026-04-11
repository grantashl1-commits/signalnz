import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Clock, Dumbbell, Check, Save, PenLine, Heart, Activity, Bluetooth, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { haptic } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCycle } from "@/contexts/CycleContext";
import { useGlobalHeartRate } from "@/contexts/HeartRateContext";
import { useTrainingProgram, type WorkoutTemplate, type WorkoutExercise } from "@/hooks/useTrainingProgram";
import ExerciseDemonstration from "@/components/ExerciseDemonstration";

interface Props {
  onOpenTraining: () => void;
  onOpenHR: () => void;
  onOpenManualLog: () => void;
}

export default function TodaySession({ onOpenTraining, onOpenHR, onOpenManualLog }: Props) {
  const { user } = useAuth();
  const { currentPhase } = useCycle();
  const hr = useGlobalHeartRate();
  const { goalCategoryId, program, phases, fetchWorkouts, fetchWorkoutExercises } = useTrainingProgram();

  const [todayWorkout, setTodayWorkout] = useState<WorkoutTemplate | null>(null);
  const [todayExercises, setTodayExercises] = useState<WorkoutExercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [sessionLogged, setSessionLogged] = useState(false);
  const [sessionLogging, setSessionLogging] = useState(false);
  const [sessionNotes, setSessionNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  // Check if today's session already logged
  useEffect(() => {
    if (!user) return;
    supabase
      .from("workout_logs")
      .select("id")
      .eq("user_id", user.id)
      .eq("session_date", todayStr)
      .eq("completed", true)
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) setSessionLogged(true);
      });
  }, [user, todayStr]);

  // Load today's workout from training program
  useEffect(() => {
    if (!goalCategoryId || !program || phases.length === 0) return;
    
    setLoading(true);
    // Determine which phase/session to show based on day of week
    const dayOfWeek = new Date().getDay(); // 0=Sun, 1=Mon...
    const sessionIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Mon=0...Sun=6

    // Get first phase's workouts
    const currentPhaseObj = phases[0]; // TODO: track user's current phase
    fetchWorkouts(currentPhaseObj.id).then(async (wts) => {
      if (wts.length === 0) { setLoading(false); return; }
      // Pick today's session (cycle through available sessions)
      const todayWt = wts[sessionIndex % wts.length];
      setTodayWorkout(todayWt);
      
      const exs = await fetchWorkoutExercises(todayWt.id);
      setTodayExercises(exs);
      setLoading(false);
    });
  }, [goalCategoryId, program, phases, fetchWorkouts, fetchWorkoutExercises]);

  const toggleComplete = (id: string) => {
    haptic("light");
    setCompletedExercises(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allComplete = todayExercises.length > 0 && completedExercises.size === todayExercises.length;

  const handleLogSession = async () => {
    if (!user || sessionLogged || sessionLogging || !todayWorkout) return;
    setSessionLogging(true);

    const exercisesPayload = todayExercises.map(ex => ({
      exercise_id: ex.exercise?.id,
      exercise_name: ex.exercise?.name,
      sets: ex.sets,
      reps: ex.reps,
      completed: completedExercises.has(ex.id),
    }));

    const { error } = await (supabase as any)
      .from("workout_logs")
      .insert({
        user_id: user.id,
        workout_template_id: todayWorkout.id,
        exercises: exercisesPayload,
        duration_minutes: todayWorkout.estimated_duration_mins,
        notes: sessionNotes.trim() || null,
        completed: true,
        cycle_phase: currentPhase,
        session_date: todayStr,
      });

    setSessionLogging(false);
    if (error) {
      toast.error("Couldn't save session. Try again.");
    } else {
      setSessionLogged(true);
      haptic("success");
      toast.success("Session logged! 🎉");
    }
  };

  // No training program selected
  if (!goalCategoryId || !program) {
    return (
      <div className="space-y-3">
        <div
          onClick={() => { haptic("light"); onOpenTraining(); }}
          className="card-warm p-5 text-center space-y-3 cursor-pointer active:bg-secondary/50 transition-colors"
        >
          <Dumbbell className="h-8 w-8 text-muted-foreground/30 mx-auto" />
          <div>
            <p className="font-display text-base font-bold text-foreground">Choose a training plan</p>
            <p className="font-body text-xs text-muted-foreground mt-1">Select a goal and we'll build your programme.</p>
          </div>
          <span className="inline-block font-body text-sm font-semibold text-primary">Browse plans →</span>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => { haptic("light"); onOpenHR(); }}
            className="flex-1 card-warm p-3 flex items-center justify-center gap-2"
          >
            <Activity className="h-4 w-4 text-primary" />
            <span className="font-body text-xs font-medium text-foreground">HR Monitor</span>
          </button>
          <button
            onClick={() => { haptic("light"); onOpenManualLog(); }}
            className="flex-1 card-warm p-3 flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4 text-primary" />
            <span className="font-body text-xs font-medium text-foreground">Log workout</span>
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="card-warm p-8 flex items-center justify-center">
        <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!todayWorkout) {
    return (
      <div className="card-warm p-5 text-center space-y-2">
        <p className="font-display text-base font-bold text-foreground">Rest day</p>
        <p className="font-body text-xs text-muted-foreground">No session scheduled. Enjoy your recovery!</p>
        <div className="flex gap-2 pt-2">
          <button onClick={() => { haptic("light"); onOpenHR(); }} className="flex-1 rounded-full bg-secondary px-3 py-2 font-body text-xs text-muted-foreground">
            <Activity className="h-3.5 w-3.5 inline mr-1" />HR Monitor
          </button>
          <button onClick={() => { haptic("light"); onOpenManualLog(); }} className="flex-1 rounded-full bg-secondary px-3 py-2 font-body text-xs text-muted-foreground">
            <Plus className="h-3.5 w-3.5 inline mr-1" />Log workout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Today's session card */}
      <div className="card-warm p-4 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-body text-[10px] text-primary uppercase tracking-[0.15em]">
              {program.title} · {todayWorkout.day_label}
            </p>
            <h3 className="font-display text-lg font-bold text-foreground mt-0.5">{todayWorkout.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="font-body text-xs text-muted-foreground">{todayWorkout.estimated_duration_mins} min</span>
              {todayWorkout.session_type && (
                <span className="font-body text-xs text-muted-foreground">· {todayWorkout.session_type}</span>
              )}
            </div>
          </div>
          <Dumbbell className="h-5 w-5 text-primary shrink-0" />
        </div>

        {todayWorkout.session_notes && (
          <p className="font-body text-xs text-muted-foreground leading-relaxed">{todayWorkout.session_notes}</p>
        )}

        {/* HR monitor connection */}
        {hr.connected ? (
          <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2">
            <Heart className="h-3.5 w-3.5 text-emerald-600" />
            <span className="font-body text-xs text-emerald-600 font-medium">{hr.deviceName} · {hr.bpm || "—"} bpm</span>
          </div>
        ) : (
          <button
            onClick={() => { haptic("light"); hr.connect(); }}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-secondary px-3 py-2"
          >
            <Bluetooth className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-body text-xs text-muted-foreground">Connect HR monitor (optional)</span>
          </button>
        )}

        {/* Exercise checklist */}
        {todayExercises.length > 0 && (
          <div className="space-y-1.5">
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(completedExercises.size / todayExercises.length) * 100}%` }} />
            </div>
            <p className="font-body text-[10px] text-muted-foreground">{completedExercises.size}/{todayExercises.length} exercises</p>

            <div className="space-y-1">
              {todayExercises.map(ex => {
                const done = completedExercises.has(ex.id);
                return (
                  <div
                    key={ex.id}
                    onClick={() => toggleComplete(ex.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl p-2.5 cursor-pointer transition-all",
                      done ? "bg-primary/5" : "bg-secondary/50 active:bg-secondary"
                    )}
                  >
                    <div className={cn(
                      "h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                      done ? "bg-primary border-primary" : "border-muted-foreground/25"
                    )}>
                      {done && <Check className="h-3 w-3 text-primary-foreground" />}
                    </div>
                    <div className="flex-shrink-0">
                      <ExerciseDemonstration exerciseName={ex.exercise?.name || ""} size={32} className="rounded-lg" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("font-body text-sm", done ? "text-muted-foreground line-through" : "text-foreground")}>
                        {ex.exercise?.name}
                      </p>
                      <p className="font-body text-[10px] text-muted-foreground">
                        {ex.sets && `${ex.sets}×`}{ex.reps}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* All complete celebration */}
        {allComplete && !sessionLogged && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-3 rounded-xl bg-primary/5"
          >
            <p className="font-display text-sm font-bold text-foreground">All exercises done! 🔥</p>
          </motion.div>
        )}

        {/* Log session */}
        {!sessionLogged ? (
          <div className="space-y-2">
            {showNotes ? (
              <textarea
                value={sessionNotes}
                onChange={e => setSessionNotes(e.target.value)}
                placeholder="How did it feel?"
                rows={2}
                className="w-full rounded-xl bg-background border border-border px-3 py-2 font-body text-sm text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            ) : (
              <button onClick={() => setShowNotes(true)} className="flex items-center gap-1.5 text-muted-foreground">
                <PenLine className="h-3 w-3" />
                <span className="font-body text-xs">Add a note</span>
              </button>
            )}
            <button
              onClick={handleLogSession}
              disabled={sessionLogging}
              className="w-full h-11 rounded-full bg-primary text-primary-foreground font-display text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60 transition-colors"
            >
              {sessionLogging ? (
                <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <><Save className="h-4 w-4" /> Log this session</>
              )}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
            <Check className="h-4 w-4 text-emerald-600" />
            <span className="font-body text-sm text-emerald-600 font-medium">Session logged ✓</span>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="flex gap-2">
        <button
          onClick={() => { haptic("light"); onOpenTraining(); }}
          className="flex-1 card-warm p-3 flex items-center justify-center gap-2"
        >
          <Dumbbell className="h-4 w-4 text-primary" />
          <span className="font-body text-xs font-medium text-foreground">Full programme</span>
        </button>
        <button
          onClick={() => { haptic("light"); onOpenHR(); }}
          className="flex-1 card-warm p-3 flex items-center justify-center gap-2"
        >
          <Activity className="h-4 w-4 text-primary" />
          <span className="font-body text-xs font-medium text-foreground">HR Monitor</span>
        </button>
        <button
          onClick={() => { haptic("light"); onOpenManualLog(); }}
          className="flex-1 card-warm p-3 flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4 text-primary" />
          <span className="font-body text-xs font-medium text-foreground">Log extra</span>
        </button>
      </div>
    </div>
  );
}
