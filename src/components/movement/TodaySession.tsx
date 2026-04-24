import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Dumbbell, Check, Save, PenLine, Heart, Activity, Bluetooth, Plus, ChevronDown, Lightbulb, TrendingUp, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { haptic } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCycle } from "@/contexts/CycleContext";
import { useGlobalHeartRate } from "@/contexts/HeartRateContext";
import { useTrainingProgram, type WorkoutTemplate, type WorkoutExercise } from "@/hooks/useTrainingProgram";
import ExerciseDemonstration from "@/components/ExerciseDemonstration";
import { TimerButton, isTimeBased, parseTimeFromReps } from "@/components/movement/IntervalTimer";

function parseRestSeconds(rest: string | null): number | null {
  if (!rest) return null;
  const sec = rest.match(/(\d+)\s*s/i);
  if (sec) return parseInt(sec[1]);
  const min = rest.match(/(\d+)\s*min/i);
  if (min) return parseInt(min[1]) * 60;
  return null;
}

/* ── Evidence-based technique tips by keyword ── */
const TECHNIQUE_TIPS: Record<string, { cue: string; why: string }[]> = {
  squat: [
    { cue: "Brace core before descent — breathe into your belly", why: "Intra-abdominal pressure protects the spine (McGill, 2010)" },
    { cue: "Drive knees outward in line with toes", why: "Reduces valgus stress on the knee (Schoenfeld, 2010)" },
    { cue: "Maintain neutral spine — avoid excessive forward lean", why: "Distributes load evenly across the posterior chain" },
  ],
  deadlift: [
    { cue: "Hinge at the hips — push them back first", why: "Maximises posterior-chain engagement (Contreras, 2014)" },
    { cue: "Keep bar / weight close to your body", why: "Reduces lumbar shear force by shortening the moment arm" },
    { cue: "Pack your shoulders — lats tight", why: "Prevents thoracic rounding under load" },
  ],
  "hip thrust": [
    { cue: "Tuck chin — look forward, not up", why: "Promotes posterior pelvic tilt for peak glute contraction" },
    { cue: "Drive through heels, squeeze glutes at the top", why: "Maximises gluteus maximus activation (Contreras, 2015)" },
    { cue: "Pause 1–2 sec at lockout", why: "Time under tension at peak contraction improves hypertrophy" },
  ],
  bench: [
    { cue: "Retract and depress scapulae", why: "Creates a stable base and protects shoulders" },
    { cue: "Grip width ~1.5× shoulder width", why: "Optimises pec activation and shoulder health" },
    { cue: "Control the eccentric — 2-3 sec down", why: "Eccentric control builds strength and reduces injury risk" },
  ],
  press: [
    { cue: "Brace core tight — avoid arching lower back", why: "Prevents lumbar hyperextension under overhead load" },
    { cue: "Full lockout overhead — stack joints", why: "Ensures deltoid and tricep complete the range of motion" },
  ],
  row: [
    { cue: "Initiate with scapular retraction", why: "Prioritises mid-back over biceps (Lehman, 2004)" },
    { cue: "Keep torso stable — minimise swinging", why: "Isolates the target musculature for better stimulus" },
  ],
  lunge: [
    { cue: "Step far enough to keep front knee behind toes", why: "Reduces patellofemoral stress (Escamilla, 2001)" },
    { cue: "Push through the heel of the front foot", why: "Increases glute and hamstring contribution" },
  ],
  curl: [
    { cue: "Keep elbows pinned to your sides", why: "Isolates biceps by preventing shoulder flexion compensation" },
    { cue: "Control the lowering phase — no swinging", why: "Eccentric loading is key for bicep growth" },
  ],
  plank: [
    { cue: "Create a straight line from head to heels", why: "Ensures full core engagement (McGill, 2010)" },
    { cue: "Actively push the floor away", why: "Engages serratus anterior for shoulder stability" },
  ],
  pullup: [
    { cue: "Initiate by depressing and retracting scapulae", why: "Engages lats before biceps for optimal pulling mechanics" },
    { cue: "Full extension at the bottom — no half reps", why: "Complete ROM increases lat stretch and growth stimulus" },
  ],
  "hip abduction": [
    { cue: "Control the movement — don't let the weight snap back", why: "Eccentric control is vital for gluteus medius development" },
    { cue: "Sit upright with neutral spine", why: "Reduces compensatory hip flexor engagement" },
  ],
};

function getTechniqueTips(exerciseName: string): { cue: string; why: string }[] {
  const lower = exerciseName.toLowerCase();
  for (const [keyword, tips] of Object.entries(TECHNIQUE_TIPS)) {
    if (lower.includes(keyword)) return tips;
  }
  // Generic fallback
  return [
    { cue: "Focus on controlled tempo — 2 sec up, 2 sec down", why: "Time under tension drives hypertrophy and reduces injury risk" },
    { cue: "Breathe out on exertion, in on the eccentric", why: "Proper breathing pattern stabilises the core" },
  ];
}

/* ── Expandable exercise row ── */
function ExerciseRow({
  exercise,
  exId,
  done,
  onToggle,
  sets,
  reps,
  restSeconds,
  rpeTarget,
  loadGuidance,
  progressionNotes,
}: {
  exercise: WorkoutExercise["exercise"];
  exId: string;
  done: boolean;
  onToggle: () => void;
  sets?: number | null;
  reps?: string | null;
  restSeconds?: number | null;
  rpeTarget?: number | null;
  loadGuidance?: string | null;
  progressionNotes?: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const name = exercise?.name || "Exercise";
  const tips = getTechniqueTips(name);

  return (
    <div className={cn("rounded-xl transition-all", done ? "bg-primary/5" : "bg-secondary/50")}>
      {/* Main row */}
      <div
        className="flex items-center gap-3 p-2.5 cursor-pointer active:bg-secondary"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
      >
        <div className={cn(
          "h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
          done ? "bg-primary border-primary" : "border-muted-foreground/25"
        )}>
          {done && <Check className="h-3 w-3 text-primary-foreground" />}
        </div>
        <div className="flex-shrink-0">
          <ExerciseDemonstration exerciseName={name} size={36} className="rounded-lg" />
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn("font-body text-sm", done ? "text-muted-foreground line-through" : "text-foreground")}>
            {name}
          </p>
          <p className="font-body text-[10px] text-muted-foreground">
            {sets && `${sets}×`}{reps}
            {rpeTarget ? ` · RPE ${rpeTarget}` : ""}
            {restSeconds ? ` · ${restSeconds}s rest` : ""}
          </p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); haptic("light"); }}
          className="p-1.5 rounded-full hover:bg-secondary/80 transition-colors"
        >
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", expanded && "rotate-180")} />
        </button>
      </div>

      {/* Expanded detail panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-1 space-y-2.5 border-t border-border/30 mx-2.5">
              {/* Bigger demo image */}
              <div className="flex justify-center py-2">
                <ExerciseDemonstration exerciseName={name} size={120} className="rounded-xl" showLabel />
              </div>

              {/* Load guidance */}
              {loadGuidance && (
                <div className="flex items-start gap-2 rounded-lg bg-accent/50 px-2.5 py-2">
                  <Target className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  <p className="font-body text-xs text-foreground">{loadGuidance}</p>
                </div>
              )}

              {/* Target muscles */}
              {exercise?.target && (
                <div className="flex items-center gap-2">
                  <span className="font-body text-[10px] text-muted-foreground uppercase tracking-wider">Target</span>
                  <span className="font-body text-xs text-foreground capitalize">{exercise.target}</span>
                </div>
              )}

              {/* Technique tips */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                  <span className="font-display text-xs font-semibold text-foreground">Technique tips</span>
                </div>
                {tips.map((tip, i) => (
                  <div key={i} className="pl-5 space-y-0.5">
                    <p className="font-body text-xs text-foreground">• {tip.cue}</p>
                    <p className="font-body text-[10px] text-muted-foreground italic">{tip.why}</p>
                  </div>
                ))}
              </div>

              {/* Cues from DB */}
              {exercise?.cues && exercise.cues.length > 0 && (
                <div className="space-y-1">
                  <span className="font-body text-[10px] text-muted-foreground uppercase tracking-wider">Coaching cues</span>
                  {exercise.cues.map((c, i) => (
                    <p key={i} className="font-body text-xs text-foreground pl-2">→ {c}</p>
                  ))}
                </div>
              )}

              {/* Instructions */}
              {exercise?.instructions && (
                <div className="space-y-1">
                  <span className="font-body text-[10px] text-muted-foreground uppercase tracking-wider">Instructions</span>
                  <p className="font-body text-xs text-muted-foreground leading-relaxed">{exercise.instructions}</p>
                </div>
              )}

              {/* Progression notes */}
              {progressionNotes && (
                <div className="flex items-start gap-2 rounded-lg bg-primary/5 px-2.5 py-2">
                  <TrendingUp className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  <p className="font-body text-xs text-foreground">{progressionNotes}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── AI session exercise row (simpler, no DB data) ── */
function AIExerciseRow({
  ex,
  exKey,
  done,
  onToggle,
}: {
  ex: any;
  exKey: string;
  done: boolean;
  onToggle: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const tips = getTechniqueTips(ex.name || "");

  return (
    <div className={cn("rounded-xl transition-all", done ? "bg-primary/5" : "bg-secondary/50")}>
      <div
        className="flex items-center gap-3 p-2.5 cursor-pointer active:bg-secondary"
        onClick={onToggle}
      >
        <div className={cn(
          "h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
          done ? "bg-primary border-primary" : "border-muted-foreground/25"
        )}>
          {done && <Check className="h-3 w-3 text-primary-foreground" />}
        </div>
        <div className="flex-shrink-0">
          <ExerciseDemonstration exerciseName={ex.name || ""} size={36} className="rounded-lg" />
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn("font-body text-sm", done ? "text-muted-foreground line-through" : "text-foreground")}>{ex.name}</p>
          <p className="font-body text-[10px] text-muted-foreground">{ex.sets}×{ex.reps_or_duration}{ex.rpe ? ` · RPE ${ex.rpe}` : ""}</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); haptic("light"); }}
          className="p-1.5 rounded-full hover:bg-secondary/80 transition-colors"
        >
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", expanded && "rotate-180")} />
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-1 space-y-2.5 border-t border-border/30 mx-2.5">
              <div className="flex justify-center py-2">
                <ExerciseDemonstration exerciseName={ex.name || ""} size={120} className="rounded-xl" showLabel />
              </div>

              {ex.form_cue && (
                <div className="flex items-start gap-2 rounded-lg bg-accent/50 px-2.5 py-2">
                  <Target className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  <p className="font-body text-xs text-foreground">{ex.form_cue}</p>
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                  <span className="font-display text-xs font-semibold text-foreground">Technique tips</span>
                </div>
                {tips.map((tip, i) => (
                  <div key={i} className="pl-5 space-y-0.5">
                    <p className="font-body text-xs text-foreground">• {tip.cue}</p>
                    <p className="font-body text-[10px] text-muted-foreground italic">{tip.why}</p>
                  </div>
                ))}
              </div>

              {ex.progression && (
                <div className="flex items-start gap-2 rounded-lg bg-primary/5 px-2.5 py-2">
                  <TrendingUp className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  <p className="font-body text-xs text-foreground">{ex.progression}</p>
                </div>
              )}

              {/* Timer for time-based exercises */}
              {isTimeBased(ex.reps_or_duration) && (
                <div className="mt-1">
                  <TimerButton
                    exerciseName={ex.name}
                    reps={ex.reps_or_duration}
                    sets={ex.sets}
                    restSeconds={ex.rest ? parseRestSeconds(ex.rest) : null}
                    onComplete={onToggle}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Main component ── */
interface Props {
  onOpenTraining: () => void;
  onOpenHR: () => void;
  onOpenManualLog: () => void;
  onSessionLogged?: () => void;
}

export default function TodaySession({ onOpenTraining, onOpenHR, onOpenManualLog, onSessionLogged }: Props) {
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
  const [aiSession, setAiSession] = useState<any>(null);
  // NZ-safe local date — avoids UTC drift logging "today" as yesterday
  const todayStr = (() => {
    const parts = new Intl.DateTimeFormat("en-NZ", {
      timeZone: "Pacific/Auckland",
      year: "numeric", month: "2-digit", day: "2-digit",
    }).formatToParts(new Date());
    const get = (t: string) => parts.find(p => p.type === t)?.value || "";
    return `${get("year")}-${get("month")}-${get("day")}`;
  })();

  const [todayLogCount, setTodayLogCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("workout_logs")
      .select("id")
      .eq("user_id", user.id)
      .eq("session_date", todayStr)
      .eq("completed", true)
      .then(({ data }) => {
        const count = data?.length || 0;
        setTodayLogCount(count);
        if (count > 0) setSessionLogged(true);
      });
  }, [user, todayStr]);

  useEffect(() => {
    if (!goalCategoryId || !program || phases.length === 0) return;
    setLoading(true);
    const dayOfWeek = new Date().getDay();
    const sessionIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    const currentPhaseObj = phases[0];
    fetchWorkouts(currentPhaseObj.id).then(async (wts) => {
      if (wts.length === 0) { setLoading(false); return; }
      const nextIdx = (sessionIndex + todayLogCount) % wts.length;
      const todayWt = wts[nextIdx];
      setTodayWorkout(todayWt);
      const exs = await fetchWorkoutExercises(todayWt.id);
      setTodayExercises(exs);
      setLoading(false);
    });
  }, [goalCategoryId, program, phases, fetchWorkouts, fetchWorkoutExercises, todayLogCount]);

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

    // Save HR session data if HR was connected
    let hrSessionId: string | null = null;
    if (hr.connected && hr.bpm > 0) {
      try {
        const { data: hrData } = await (supabase as any)
          .from("hr_sessions")
          .insert({
            user_id: user.id,
            session_date: todayStr,
            workout_name: todayWorkout.title,
            bpm_trace: [],
            zones_summary: {},
            cycle_phase: currentPhase,
          })
          .select("id")
          .single();
        if (hrData) hrSessionId = hrData.id;
      } catch {}
    }

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
        hr_session_id: hrSessionId,
        avg_bpm: hr.connected && hr.bpm > 0 ? hr.bpm : null,
      });

    setSessionLogging(false);
    if (error) {
      toast.error("Couldn't save session. Try again.");
    } else {
      setSessionLogged(true);
      haptic("success");
      toast.success("Session logged! 🎉");
      onSessionLogged?.();
      setTimeout(() => {
        setTodayLogCount(c => c + 1);
        setSessionLogged(false);
        setCompletedExercises(new Set());
        setSessionNotes("");
        setShowNotes(false);
      }, 2000);
    }
  };

  // Load AI plan session — either from explicit "Start this session" or auto-detect from DB plan
  useEffect(() => {
    const stored = localStorage.getItem("signal_ai_active_session");
    if (stored) {
      try { setAiSession(JSON.parse(stored)); } catch {}
      return;
    }

    // Auto-detect today's session from saved AI plan using current_session_index
    async function loadTodayFromAIPlan() {
      if (!user) return;
      const { data } = await supabase
        .from("user_plans")
        .select("plan_data, current_session_index")
        .eq("user_id", user.id)
        .eq("plan_type", "ai_training")
        .order("generated_at", { ascending: false })
        .limit(1);

      if (!data || data.length === 0) return;

      const plan = (data[0] as any).plan_data as any;
      const sessionIndex = (data[0] as any).current_session_index || 0;
      if (!plan?.weeks?.length) return;

      // Flatten all training days across all weeks
      const allDays: any[] = [];
      for (const week of plan.weeks) {
        if (!week.days) continue;
        for (const day of week.days) {
          if (day.session_type !== "rest" && !day.title?.toLowerCase().includes("rest") && day.exercises?.length > 0) {
            allDays.push(day);
          }
        }
      }

      if (allDays.length === 0) return;

      // Check if today's session was already logged
      const { data: todayLogs } = await supabase
        .from("workout_logs")
        .select("id")
        .eq("user_id", user.id)
        .eq("session_date", todayStr)
        .eq("completed", true);
      
      if (todayLogs && todayLogs.length > 0) return; // Already logged today

      // Use session index to pick the right day (wraps around)
      const todayDay = allDays[sessionIndex % allDays.length];
      if (todayDay) {
        setAiSession(todayDay);
      }
    }

    loadTodayFromAIPlan();
  }, [user, todayStr]);

  // No training program AND no AI session
  const hasManualProgram = !!(goalCategoryId && program && todayWorkout);
  const hasAiSession = !!aiSession;
  const hasNothing = !hasManualProgram && !hasAiSession && !loading;

  if (hasNothing) {
    return (
      <div className="space-y-3">
        <div
          onClick={() => { haptic("light"); onOpenTraining(); }}
          className="card-warm p-5 text-center space-y-3 cursor-pointer active:bg-secondary/50 transition-colors"
        >
          <Dumbbell className="h-8 w-8 text-muted-foreground/30 mx-auto" />
          <div>
            <p className="font-display text-base font-bold text-foreground">Choose a training plan</p>
            <p className="font-body text-xs text-muted-foreground mt-1">Select a goal or generate an AI plan.</p>
          </div>
          <span className="inline-block font-body text-sm font-semibold text-primary">Browse plans →</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { haptic("light"); onOpenHR(); }} className="flex-1 card-warm p-3 flex items-center justify-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <span className="font-body text-xs font-medium text-foreground">HR Monitor</span>
          </button>
          <button onClick={() => { haptic("light"); onOpenManualLog(); }} className="flex-1 card-warm p-3 flex items-center justify-center gap-2">
            <Plus className="h-4 w-4 text-primary" />
            <span className="font-body text-xs font-medium text-foreground">Log workout</span>
          </button>
        </div>
      </div>
    );
  }

  if (loading && !hasAiSession) {
    return (
      <div className="card-warm p-8 flex items-center justify-center">
        <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  /* ── Render AI + Manual side-by-side ── */
  const aiExercises = aiSession?.exercises || [];
  const aiAllComplete = aiExercises.length > 0 && completedExercises.size >= aiExercises.length;
  // For the manual program, count only non-AI completed keys
  const manualCompletedCount = todayExercises.filter(ex => completedExercises.has(ex.id)).length;

  return (
    <div className="space-y-6">
      {/* AI Session card */}
      {hasAiSession && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-primary/20" />
            <span className="font-display text-[10px] font-bold text-primary uppercase tracking-[0.2em]">✦ AI Training Plan</span>
            <div className="h-px flex-1 bg-primary/20" />
          </div>
        <div className="card-warm p-4 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-display text-lg font-bold text-foreground mt-0.5">{aiSession.title || "Session"}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="font-body text-xs text-muted-foreground">{aiSession.duration_minutes || 45} min</span>
                {aiSession.session_type && <span className="font-body text-xs text-muted-foreground">· {aiSession.session_type}</span>}
              </div>
            </div>
            <Dumbbell className="h-5 w-5 text-primary shrink-0" />
          </div>

          {hr.connected ? (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2">
              <Heart className="h-3.5 w-3.5 text-emerald-600" />
              <span className="font-body text-xs text-emerald-600 font-medium">{hr.deviceName} · {hr.bpm || "—"} bpm</span>
            </div>
          ) : (
            <button onClick={() => { haptic("light"); hr.connect(); }} className="w-full flex items-center justify-center gap-2 rounded-lg bg-secondary px-3 py-2">
              <Bluetooth className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-body text-xs text-muted-foreground">Connect HR monitor (optional)</span>
            </button>
          )}

          {aiExercises.length > 0 && (
            <div className="space-y-1.5">
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(aiExercises.filter((_: any, i: number) => completedExercises.has(`ai-${i}`)).length / aiExercises.length) * 100}%` }} />
              </div>
              <p className="font-body text-[10px] text-muted-foreground">{aiExercises.filter((_: any, i: number) => completedExercises.has(`ai-${i}`)).length}/{aiExercises.length} exercises</p>
              <div className="space-y-1">
                {aiExercises.map((ex: any, idx: number) => {
                  const exKey = `ai-${idx}`;
                  const done = completedExercises.has(exKey);
                  return (
                    <AIExerciseRow key={idx} ex={ex} exKey={exKey} done={done} onToggle={() => toggleComplete(exKey)} />
                  );
                })}
              </div>
            </div>
          )}

          {aiAllComplete && (
            <div className="text-center py-3 rounded-xl bg-primary/5">
              <p className="font-display text-sm font-bold text-foreground">All exercises done! 🔥</p>
            </div>
          )}

          <button
            onClick={async () => {
              // Log the AI session to workout_logs
              if (user) {
                const exercisesPayload = aiExercises.map((ex: any) => ({
                  exercise_name: ex.name,
                  sets: ex.sets,
                  reps: ex.reps_or_duration || ex.reps,
                  completed: true,
                }));
                await (supabase as any).from("workout_logs").insert({
                  user_id: user.id,
                  workout_template_id: null,
                  exercises: exercisesPayload,
                  duration_minutes: aiSession.duration_minutes || 45,
                  notes: `AI plan: ${aiSession.title || "Session"}`,
                  completed: true,
                  cycle_phase: currentPhase,
                  session_date: todayStr,
                  avg_bpm: hr.connected && hr.bpm > 0 ? hr.bpm : null,
                });

                // Advance current_session_index in user_plans
                const { data: planData } = await supabase
                  .from("user_plans")
                  .select("id, current_session_index")
                  .eq("user_id", user.id)
                  .eq("plan_type", "ai_training")
                  .order("generated_at", { ascending: false })
                  .limit(1);
                if (planData && planData.length > 0) {
                  const currentIdx = (planData[0] as any).current_session_index || 0;
                  await (supabase as any)
                    .from("user_plans")
                    .update({ current_session_index: currentIdx + 1 })
                    .eq("id", planData[0].id);
                }
              }

              localStorage.removeItem("signal_ai_active_session");
              setAiSession(null);
              haptic("success");
              toast.success("Session logged! 🎉");
              onSessionLogged?.();
            }}
            className="w-full h-11 rounded-full bg-primary text-primary-foreground font-display text-sm font-semibold flex items-center justify-center gap-2"
          >
            <Save className="h-4 w-4" /> Finish & log session
          </button>
        </div>
        </div>
      )}

      {/* Manual program card */}
      {hasManualProgram && todayWorkout && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-primary/20" />
            <span className="font-display text-[10px] font-bold text-primary uppercase tracking-[0.2em]">✦ Training Programme</span>
            <div className="h-px flex-1 bg-primary/20" />
          </div>
        <div className="card-warm p-4 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-body text-[10px] text-primary uppercase tracking-[0.15em]">
                {program?.title} · {todayWorkout.day_label}
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

          {/* Only show HR in manual card if AI card isn't already showing it */}
          {!hasAiSession && (
            hr.connected ? (
              <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2">
                <Heart className="h-3.5 w-3.5 text-emerald-600" />
                <span className="font-body text-xs text-emerald-600 font-medium">{hr.deviceName} · {hr.bpm || "—"} bpm</span>
              </div>
            ) : (
              <button onClick={() => { haptic("light"); hr.connect(); }} className="w-full flex items-center justify-center gap-2 rounded-lg bg-secondary px-3 py-2">
                <Bluetooth className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-body text-xs text-muted-foreground">Connect HR monitor (optional)</span>
              </button>
            )
          )}

          {todayExercises.length > 0 && (
            <div className="space-y-1.5">
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(manualCompletedCount / todayExercises.length) * 100}%` }} />
              </div>
              <p className="font-body text-[10px] text-muted-foreground">{manualCompletedCount}/{todayExercises.length} exercises</p>
              <div className="space-y-1">
                {todayExercises.map(ex => {
                  const done = completedExercises.has(ex.id);
                  return (
                    <ExerciseRow
                      key={ex.id}
                      exercise={ex.exercise}
                      exId={ex.id}
                      done={done}
                      onToggle={() => toggleComplete(ex.id)}
                      sets={ex.sets}
                      reps={ex.reps}
                      restSeconds={ex.rest_seconds}
                      rpeTarget={ex.rpe_target}
                      loadGuidance={ex.load_guidance}
                      progressionNotes={ex.progression_notes}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {allComplete && !sessionLogged && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center py-3 rounded-xl bg-primary/5">
              <p className="font-display text-sm font-bold text-foreground">All exercises done! 🔥</p>
            </motion.div>
          )}

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
        </div>
      )}

      {/* Rest day — only show when manual program exists but no workout today AND no AI session */}
      {!hasManualProgram && !hasAiSession && !loading && (
        <div className="card-warm p-5 text-center space-y-2">
          <p className="font-display text-base font-bold text-foreground">Rest day</p>
          <p className="font-body text-xs text-muted-foreground">No session scheduled. Enjoy your recovery!</p>
        </div>
      )}

      {/* Bottom action bar */}
      <div className="flex gap-2">
        <button onClick={() => { haptic("light"); onOpenTraining(); }} className="flex-1 card-warm p-3 flex items-center justify-center gap-2">
          <Dumbbell className="h-4 w-4 text-primary" />
          <span className="font-body text-xs font-medium text-foreground">Full programme</span>
        </button>
        <button onClick={() => { haptic("light"); onOpenHR(); }} className="flex-1 card-warm p-3 flex items-center justify-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <span className="font-body text-xs font-medium text-foreground">HR Monitor</span>
        </button>
        <button onClick={() => { haptic("light"); onOpenManualLog(); }} className="flex-1 card-warm p-3 flex items-center justify-center gap-2">
          <Plus className="h-4 w-4 text-primary" />
          <span className="font-body text-xs font-medium text-foreground">Log extra</span>
        </button>
      </div>
    </div>
  );
}
