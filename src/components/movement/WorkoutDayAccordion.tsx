import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Loader2, Play, Timer, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";
import { haptic } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import type { WorkoutTemplate, WorkoutExercise, WorkoutInterval } from "@/hooks/useTrainingProgram";

interface Props {
  workout: WorkoutTemplate;
  index: number;
  onStartSession: (wt: WorkoutTemplate) => void;
}

function fmt(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function WorkoutDayAccordion({ workout, index, onStartSession }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [intervals, setIntervals] = useState<WorkoutInterval[]>([]);
  const [loaded, setLoaded] = useState(false);

  const handleToggle = async () => {
    haptic("light");
    const next = !open;
    setOpen(next);
    if (next && !loaded) {
      setLoading(true);
      const [exRes, ivRes] = await Promise.all([
        supabase.from("workout_exercises").select(`*, exercise:exercises(*)`).eq("workout_id", workout.id).order("order_index"),
        supabase.from("workout_intervals" as any).select("*").eq("workout_id", workout.id).order("order_index"),
      ]);
      setExercises((exRes.data as unknown as WorkoutExercise[]) || []);
      setIntervals(((ivRes.data as any) as WorkoutInterval[]) || []);
      setLoaded(true);
      setLoading(false);
    }
  };

  const isRunSession = workout.session_type === "cardio" || (loaded && intervals.length > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="rounded-xl bg-card border border-border overflow-hidden"
    >
      <button
        onClick={handleToggle}
        className="w-full p-4 text-left hover:bg-card/80 transition-colors"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-body text-[10px] text-primary uppercase tracking-[0.15em]">{workout.day_label || `Day ${workout.session_number || index + 1}`}</p>
            <h3 className="font-display text-base font-bold text-foreground mt-0.5 truncate">{workout.title}</h3>
            <div className="flex items-center gap-3 mt-1.5 text-[11px] font-body text-muted-foreground">
              <span className="flex items-center gap-1"><Timer className="h-3 w-3" /> {workout.estimated_duration_mins} min</span>
              {isRunSession && <span className="text-rose-400">Run</span>}
            </div>
          </div>
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground shrink-0 transition-transform", open && "rotate-180")} />
        </div>
        {workout.session_notes && !open && (
          <p className="font-body text-xs text-muted-foreground mt-2 line-clamp-1">{workout.session_notes}</p>
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-border"
          >
            <div className="p-4 space-y-3">
              {workout.session_notes && (
                <p className="font-body text-xs text-muted-foreground italic">{workout.session_notes}</p>
              )}

              {loading && (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
              )}

              {/* Run intervals preview */}
              {!loading && intervals.length > 0 && (
                <div className="space-y-1.5">
                  <p className="font-body text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Interval breakdown</p>
                  {intervals.map((iv) => (
                    <div key={iv.id} className="flex items-center justify-between text-xs font-body py-1.5 px-2.5 rounded bg-muted/20">
                      <div className="flex-1 min-w-0">
                        <span className="text-foreground font-medium">{iv.block_label}</span>
                        {iv.repeat_count > 1 && <span className="text-muted-foreground"> × {iv.repeat_count}</span>}
                        {iv.target_pace && <span className="text-muted-foreground"> · {iv.target_pace}</span>}
                      </div>
                      <span className="tabular-nums text-muted-foreground shrink-0">{fmt(iv.duration_sec)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Exercise list */}
              {!loading && exercises.length > 0 && (
                <div className="space-y-2">
                  <p className="font-body text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{exercises.length} exercises</p>
                  {exercises.map((we, i) => (
                    <div key={we.id} className="flex gap-3 p-2.5 rounded-lg bg-muted/20">
                      {we.exercise?.gif_url || we.exercise?.illustration_url ? (
                        <img
                          src={we.exercise.gif_url || we.exercise.illustration_url || ""}
                          alt={we.exercise.name}
                          loading="lazy"
                          className="w-14 h-14 rounded-md object-cover bg-background shrink-0"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-md bg-background shrink-0 flex items-center justify-center">
                          <Dumbbell className="h-5 w-5 text-muted-foreground/50" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-display text-sm font-bold text-foreground truncate">
                          <span className="text-muted-foreground mr-1.5">{i + 1}.</span>
                          {we.exercise?.name || "Exercise"}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-[11px] font-body text-muted-foreground">
                          {we.sets && we.reps && <span><span className="text-foreground">{we.sets}×{we.reps}</span></span>}
                          {we.rest_seconds != null && <span>· rest {we.rest_seconds}s</span>}
                          {we.rpe_target != null && <span>· RPE {we.rpe_target}</span>}
                          {we.weight_kg_min != null && we.weight_kg_max != null && (we.weight_kg_min > 0 || we.weight_kg_max > 0) && (
                            <span>· {we.weight_kg_min}–{we.weight_kg_max} kg</span>
                          )}
                        </div>
                        {we.tip && (
                          <p className="font-body text-[11px] text-foreground/70 mt-1 italic line-clamp-2">{we.tip}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loading && exercises.length === 0 && intervals.length === 0 && (
                <p className="font-body text-xs text-muted-foreground py-3 text-center">No detail available for this session yet.</p>
              )}

              {/* Action buttons */}
              {!loading && (exercises.length > 0 || intervals.length > 0) && (
                <button
                  onClick={() => onStartSession(workout)}
                  className="w-full mt-2 flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground py-2.5 font-body text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  <Play className="h-4 w-4" /> Start session
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
