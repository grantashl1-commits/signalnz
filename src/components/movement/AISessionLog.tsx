import { useState } from "react";
import { PenLine, Save, Check, Activity, Dumbbell, Plus } from "lucide-react";
import { haptic } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCycle } from "@/contexts/CycleContext";
import AISessionCard from "./AISessionCard";
import type { Phase } from "@/lib/cycle-utils";

interface AISessionLogProps {
  session: any;
  trainingWeek: number;
  weekTheme?: string;
  phase: Phase;
  completedExercises: Set<string>;
  onToggleExercise: (name: string) => void;
  onOpenExercise: (ex: any) => void;
  onOpenHR: () => void;
  onOpenTraining: () => void;
  onOpenManualLog: () => void;
}

export default function AISessionLog({
  session, trainingWeek, weekTheme, phase,
  completedExercises, onToggleExercise, onOpenExercise,
  onOpenHR, onOpenTraining, onOpenManualLog,
}: AISessionLogProps) {
  const { user } = useAuth();
  const { currentPhase } = useCycle();
  const [sessionNotes, setSessionNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [sessionLogged, setSessionLogged] = useState(false);
  const [sessionLogging, setSessionLogging] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  const allExercises = session.main_block
    ? session.main_block.flatMap((b: any) => b.exercises || [])
    : session.exercises || [];

  const handleLogSession = async () => {
    if (!user || sessionLogged || sessionLogging) return;
    setSessionLogging(true);

    const exercisesPayload = allExercises.map((ex: any) => ({
      exercise_name: ex.name,
      sets: ex.sets,
      reps: ex.reps_or_duration || ex.reps,
      completed: completedExercises.has(ex.name),
    }));

    const { error } = await (supabase as any)
      .from("workout_logs")
      .insert({
        user_id: user.id,
        workout_template_id: null,
        exercises: exercisesPayload,
        duration_minutes: session.durationMin || session.duration_minutes || null,
        notes: sessionNotes.trim() || `AI plan: ${session.name}`,
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
      toast.success("AI session logged! 🎉");
    }
  };

  return (
    <div className="space-y-4">
      <AISessionCard
        session={session}
        trainingWeek={trainingWeek}
        weekTheme={weekTheme}
        phase={phase}
        completedExercises={completedExercises}
        onToggleExercise={onToggleExercise}
        onOpenExercise={onOpenExercise}
      />

      {/* Log session controls */}
      <div className="card-warm p-4 space-y-3">
        {!sessionLogged ? (
          <>
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
          </>
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
