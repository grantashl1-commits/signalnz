import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Clock, Dumbbell, ChevronDown, ChevronUp, Target, Flame, MessageCircle, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { haptic } from "@/hooks/use-mobile";
import type { WorkoutTemplate, WorkoutExercise } from "@/hooks/useTrainingProgram";

interface Props {
  template: WorkoutTemplate;
  exercises: WorkoutExercise[];
  onBack: () => void;
  phaseName?: string;
}

export default function WorkoutSessionView({ template, exercises, onBack, phaseName }: Props) {
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());

  const toggleComplete = (id: string) => {
    haptic("light");
    setCompletedExercises((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allComplete = exercises.length > 0 && completedExercises.size === exercises.length;

  // Group exercises by superset
  const groupedExercises: (WorkoutExercise | WorkoutExercise[])[] = [];
  let i = 0;
  while (i < exercises.length) {
    const ex = exercises[i];
    if (ex.is_superset && ex.superset_group) {
      const group = [ex];
      let j = i + 1;
      while (j < exercises.length && exercises[j].superset_group === ex.superset_group) {
        group.push(exercises[j]);
        j++;
      }
      groupedExercises.push(group);
      i = j;
    } else {
      groupedExercises.push(ex);
      i++;
    }
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
          <p className="font-mono text-[10px] text-primary uppercase tracking-[0.15em]">
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
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.15em]">Warm-up</p>
          <div className="rounded-xl bg-card border border-border p-3.5">
            <p className="font-body text-sm text-muted-foreground leading-relaxed">{template.warmup_notes}</p>
          </div>
        </div>
      )}

      {/* Exercises */}
      <div className="space-y-2">
        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.15em]">Exercises</p>
        
        {groupedExercises.map((item, idx) => {
          if (Array.isArray(item)) {
            return (
              <div key={`superset-${idx}`} className="rounded-xl border-2 border-primary/20 overflow-hidden">
                <div className="bg-primary/5 px-3.5 py-1.5">
                  <span className="font-mono text-[10px] text-primary uppercase tracking-wider">Superset</span>
                </div>
                {item.map((ex) => (
                  <ExerciseCard
                    key={ex.id}
                    ex={ex}
                    completed={completedExercises.has(ex.id)}
                    expanded={expandedExercise === ex.id}
                    onToggleExpand={() => setExpandedExercise(expandedExercise === ex.id ? null : ex.id)}
                    onToggleComplete={() => toggleComplete(ex.id)}
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
            />
          );
        })}
      </div>

      {/* Cooldown */}
      {template.cooldown_notes && (
        <div className="space-y-1.5">
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.15em]">Cool-down</p>
          <div className="rounded-xl bg-card border border-border p-3.5">
            <p className="font-body text-sm text-muted-foreground leading-relaxed">{template.cooldown_notes}</p>
          </div>
        </div>
      )}

      {/* Completion state */}
      {allComplete && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-primary/5 border border-primary/20 p-5 text-center space-y-2"
        >
          <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Flame className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-display text-lg font-bold text-foreground">Session complete</h3>
          <p className="font-body text-sm text-muted-foreground">Great work. Your body is adapting.</p>
        </motion.div>
      )}
    </div>
  );
}

function ExerciseCard({
  ex,
  completed,
  expanded,
  onToggleExpand,
  onToggleComplete,
}: {
  ex: WorkoutExercise;
  completed: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
  onToggleComplete: () => void;
}) {
  const exercise = ex.exercise;
  if (!exercise) return null;

  const instructions = exercise.instructions ? [exercise.instructions] : [];
  const cues = Array.isArray(exercise.cues) ? exercise.cues : [];

  return (
    <div className={cn(
      "rounded-xl bg-card border transition-all",
      completed ? "border-primary/30 bg-primary/3" : "border-border"
    )}>
      <button
        onClick={onToggleExpand}
        className="w-full p-3.5 text-left"
      >
        <div className="flex items-start gap-3">
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
            <h4 className={cn(
              "font-display text-sm font-bold",
              completed ? "text-primary" : "text-foreground"
            )}>
              {exercise.name}
            </h4>
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
                <span className="font-mono text-[10px] text-primary uppercase">RPE {ex.rpe_target}</span>
              )}
            </div>
          </div>

          <div className="shrink-0 mt-1">
            {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
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
            <div className="px-3.5 pb-4 pt-1 space-y-3 pl-[3.25rem]">
              {ex.load_guidance && (
                <div className="flex items-start gap-2">
                  <Dumbbell className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  <p className="font-body text-xs text-foreground leading-relaxed">{ex.load_guidance}</p>
                </div>
              )}

              {instructions.length > 0 && (
                <div>
                  <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider mb-1">How to</p>
                  {instructions.map((inst: string, j: number) => (
                    <p key={j} className="font-body text-xs text-muted-foreground leading-relaxed">{inst}</p>
                  ))}
                </div>
              )}

              {cues.length > 0 && (
                <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <MessageCircle className="h-3 w-3 text-primary" />
                    <p className="font-mono text-[9px] text-primary uppercase tracking-wider font-semibold">Coaching cues</p>
                  </div>
                  <ul className="space-y-1.5">
                    {cues.map((cue: string, j: number) => (
                      <li key={j} className="font-body text-xs text-foreground leading-relaxed flex gap-2">
                        <span className="text-primary shrink-0">·</span>
                        {cue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {ex.progression_notes && (
                <div className="flex items-start gap-2">
                  <Target className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <p className="font-body text-[11px] text-muted-foreground italic leading-relaxed">
                    {ex.progression_notes}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
