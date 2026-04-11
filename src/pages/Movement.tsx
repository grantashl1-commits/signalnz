import { useState, useMemo, lazy, Suspense, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { GatedPage } from "@/components/FeatureGate";
import { AtmosphericHero, ContentSection } from "@/components/AtmosphericSection";
import SignalPulse from "@/components/SignalPulse";
import { Check, Dumbbell, Bluetooth, Activity, ChevronDown, ChevronRight, PenLine, Flame, Moon, Heart, Save, X, Plus } from "lucide-react";
import PhaseBadge from "@/components/PhaseBadge";
import { CymatiSketch, SacredSpiral, PhaseIndicator } from "@/components/BotanicalElements";
import { useCycle } from "@/contexts/CycleContext";
import { getLoggedWorkouts, logWorkout, Phase, PHASE_SHORT } from "@/lib/cycle-utils";
import {
  WORKOUTS, PHASE_WORKOUTS, PHASE_MOVEMENT_LABEL, PHASE_MOVEMENT_REC, SUIT_COLORS, CATEGORY_LABELS,
  FEELINGS, FEELING_REC, WEEK_LABELS, getTrainingWeek, setTrainingWeek,
  getAllSessions, saveWorkoutSession, getWorkoutSession, HR_ZONES, getZoneForBPM, getMaxHR, getUserAge,
  type WorkoutCategory, type Exercise, type WorkoutSession,
} from "@/data/workouts";
import { haptic } from "@/hooks/use-mobile";
import LiveHRView from "@/components/movement/LiveHRView";
import MovementCalendar from "@/components/movement/MovementCalendar";
import ProgressTab from "@/components/movement/ProgressTab";
import ExerciseRig from "@/components/movement/ExerciseRig";
import ExerciseDemonstration from "@/components/ExerciseDemonstration";
import BodyVisualiser from "@/components/movement/BodyVisualiser";
import ExerciseDetailDrawer from "@/components/movement/ExerciseDetailDrawer";
import AISessionLog from "@/components/movement/AISessionLog";
import { getAnimationForExercise } from "@/data/exercise-animations";
import TrainingTab from "@/components/movement/TrainingTab";
import LibraryTab from "@/components/movement/LibraryTab";
import TodaySession from "@/components/movement/TodaySession";
import { getFitnessProfile } from "@/lib/fitness-profile";
import { getWeeklyRotation, getTodayAssignment, PHASE_GUIDANCE } from "@/lib/workout-rotation";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";
import { useGlobalHeartRate } from "@/contexts/HeartRateContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTrainingProgram } from "@/hooks/useTrainingProgram";

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#C4526E", follicular: "#5C4A9E", ovulatory: "#C47A8A", luteal: "#9B89B4",
};

const cardVariant = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.08 * i, duration: 0.35, ease: "easeOut" as const } }),
};

export default function MovementPage() {
  const { currentPhase, currentCycleDay, currentWeekNumber } = useCycle();
  const globalHR = useGlobalHeartRate();
  const info = { phase: currentPhase, cycleDay: currentCycleDay };
  const fitnessProfile = getFitnessProfile();
  
  const [activeTab, setActiveTab] = useState<"today" | "training" | "library" | "log" | "progress" | "body">("today");
  const [feeling, setFeeling] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<WorkoutCategory | "all">("all");
  const [phaseFilter, setPhaseFilter] = useState<Phase | "all">(info.phase);
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [workoutComplete, setWorkoutComplete] = useState(false);
  const [showHR, setShowHR] = useState(false);
  const trainingWeek = currentWeekNumber;
  const [drawerExercise, setDrawerExercise] = useState<Exercise | null>(null);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [sessionNotes, setSessionNotes] = useState<Record<string, string>>({});

  // Training program context
  const { goalCategoryId } = useTrainingProgram();

  // Supabase workout logs
  const [supabaseLogs, setSupabaseLogs] = useState<Array<{
    id: string;
    session_date: string;
    workout_template_id: string | null;
    duration_minutes: number | null;
    notes: string | null;
    completed: boolean;
    exercises: any[];
  }>>([]);

  const todayStr = new Date().toISOString().split("T")[0];

  // Manual log form
  const [showManualLog, setShowManualLog] = useState(false);
  const [manualLogging, setManualLogging] = useState(false);
  const [manualLog, setManualLog] = useState({ date: todayStr, type: "Strength", duration: 45, notes: "" });
  const [logRefreshKey, setLogRefreshKey] = useState(0);
  const dayOfWeek = new Date().getDay();
  const defaultScheduleIdx = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const [scheduleIdx, setScheduleIdx] = useState(defaultScheduleIdx);

  // ── Body goals from BodyVisualiser ──
  const bodyGoals = useMemo<string[]>(() => {
    try {
      const raw = localStorage.getItem("signal_body_goals");
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }, [activeTab]);

  // ── Weekly rotation based on goals + phase ──
  const weeklyRotation = useMemo(
    () => getWeeklyRotation(info.phase, bodyGoals),
    [info.phase, bodyGoals],
  );
  const todayAssignment = weeklyRotation[scheduleIdx];

  // ── AI-generated workout plan ──
  const aiPlan = useMemo(() => {
    try {
      const raw = localStorage.getItem("signal_ai_workout_plan");
      if (raw) return JSON.parse(raw);
    } catch {}
    return null;
  }, [activeTab]);

  const aiTodayWorkout = useMemo(() => {
    if (!aiPlan?.weeks) return null;
    const dayNum = dayOfWeek === 0 ? 7 : dayOfWeek; // 1=Mon...7=Sun
    const weekData = aiPlan.weeks[trainingWeek - 1];
    if (!weekData?.days) return null;
    const dayData = weekData.days.find((d: any) => d.day === dayNum);
    return dayData || null;
  }, [aiPlan, trainingWeek, dayOfWeek]);

  // Phase-aware today workout — uses rotation, not static
  const phaseWorkouts = PHASE_WORKOUTS[info.phase];
  const allWorkoutsFlat = WORKOUTS;
  const todayWorkoutData = allWorkoutsFlat.find(w => w.id === todayAssignment.workoutId)
    || phaseWorkouts.find(w => w.id === todayAssignment.workoutId)
    || phaseWorkouts[0];
  const rec = PHASE_MOVEMENT_REC[info.phase];

  const toggleExercise = (name: string) => {
    haptic("light");
    const next = new Set(completedExercises);
    next.has(name) ? next.delete(name) : next.add(name);
    setCompletedExercises(next);
    if (todayWorkoutData && todayWorkoutData.exercises.length > 0 && next.size === todayWorkoutData.exercises.length) {
      haptic("success");
      setWorkoutComplete(true);
      logWorkout(todayStr, todayWorkoutData.id);
    }
  };

  // Phase-based library filtering
  const activePhase = phaseFilter === "all" ? null : phaseFilter;
  const filteredWorkouts = (() => {
    if (activePhase) {
      const pw = PHASE_WORKOUTS[activePhase];
      if (categoryFilter === "all") return pw;
      return pw.filter(w => w.category === categoryFilter);
    }
    // "all" — show all workouts grouped
    const all = Object.values(PHASE_WORKOUTS).flat();
    // deduplicate by id
    const seen = new Set<string>();
    const unique = all.filter(w => { if (seen.has(w.id)) return false; seen.add(w.id); return true; });
    if (categoryFilter === "all") return unique;
    return unique.filter(w => w.category === categoryFilter);
  })();

  const today = new Date();
  const mondayOffset = (dayOfWeek === 0 ? -6 : 1 - dayOfWeek);
  const weekDays = Array.from({ length: 7 }, (_, i) => { const d = new Date(today); d.setDate(today.getDate() + mondayOffset + i); return d; });
  const weekWorkouts = weekDays.map(d => getLoggedWorkouts(d.toISOString().split("T")[0]));
  const totalCompleted = weekWorkouts.filter(w => w.length > 0).length;
  const totalMinutes = weekWorkouts.flat().reduce((s, id) => s + (WORKOUTS.find(x => x.id === id)?.durationMin || 0), 0);
  const sessions = getAllSessions();

  const WEEK_PHASE_NOTES: Record<number, string> = {
    1: "Focus on consistency over intensity.",
    2: "Push harder — your energy is building.",
    3: "Peak performance week.",
    4: "Honour how you feel. Drop intensity if needed.",
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const TABS = [
    { id: "today" as const, label: "Today" },
    { id: "training" as const, label: "Training" },
    { id: "library" as const, label: "Library" },
    { id: "log" as const, label: "My Log" },
    { id: "body" as const, label: "Body" },
    { id: "progress" as const, label: "Progress" },
  ];

  if (showHR) {
    return <LiveHRView workoutName={todayWorkoutData?.name || "Workout"} onClose={() => setShowHR(false)} />;
  }

  // Helper: find which phase a workout belongs to (for library "all" view)
  const getWorkoutPhase = (workoutId: string): Phase | null => {
    for (const [phase, workouts] of Object.entries(PHASE_WORKOUTS)) {
      if (workouts.some(w => w.id === workoutId)) return phase as Phase;
    }
    return null;
  };

  // Load Supabase workout logs when My Log tab is active
  useEffect(() => {
    if (activeTab !== "log") return;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("workout_logs")
        .select("*")
        .eq("user_id", user.id)
        .eq("completed", true)
        .order("session_date", { ascending: false })
        .limit(20)
        .then(({ data }) => {
          if (data) setSupabaseLogs(data as any);
        });
    });
  }, [activeTab]);

  const handleManualLog = async () => {
    if (manualLogging) return;
    setManualLogging(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setManualLogging(false); return; }
    const { error } = await (supabase as any).from("workout_logs").insert({
      user_id: user.id,
      session_date: manualLog.date,
      workout_template_id: null,
      exercises: [{ exercise_name: manualLog.type, completed: true }],
      duration_minutes: manualLog.duration,
      notes: manualLog.notes.trim() || null,
      completed: true,
    });
    setManualLogging(false);
    if (!error) {
      setShowManualLog(false);
      setManualLog({ date: todayStr, type: "Strength", duration: 45, notes: "" });
      // Refresh supabase logs
      setActiveTab("today");
      setTimeout(() => setActiveTab("log"), 50);
      toast.success("Workout logged!");
    }
  };

  return (
    <GatedPage requiredTier="nourished">
    <div className="relative">
      {/* ═══ HERO ═══ */}
      <AtmosphericHero size="md">
        <SignalPulse />
        <div className="text-center relative z-10">
          <p className="font-body text-xs uppercase tracking-[0.3em] text-primary-foreground/40 mb-4">Movement</p>
          <h1 className="font-display text-[3rem] md:text-[4rem] font-extrabold text-primary-foreground leading-[1.02] mb-4">Move</h1>
          <p className="font-editorial text-base md:text-lg italic text-primary-foreground/60 max-w-md mx-auto">
            {PHASE_MOVEMENT_LABEL[info.phase]}
          </p>
        </div>
      </AtmosphericHero>

      <ContentSection className="px-5 md:px-4 space-y-8 md:space-y-10">

      {/* Tab bar - sticky at top */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm -mx-5 px-5 py-2 md:-mx-4 md:px-4">
        <div className="relative">
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => { haptic("light"); setActiveTab(tab.id); }}
                className={`touch-tab flex-shrink-0 rounded-full px-4 py-2 min-h-[40px] font-body text-xs font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-muted-foreground active:text-foreground"
                }`}
              >{tab.label}</button>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background to-transparent" />
        </div>
      </div>

      {/* TODAY TAB */}
      {activeTab === "today" && (
        <div className="space-y-8 md:space-y-10">
          {/* Phase + training week context */}
          <div className="card-warm p-4 md:p-5 relative overflow-hidden">
            <div className="absolute top-2 right-2 w-12 h-12 pointer-events-none">
              <CymatiSketch phase={info.phase} size={48} opacity={0.08} />
            </div>
            <div className="flex items-center gap-2 mb-1">
              <PhaseIndicator phase={info.phase} size={18} />
              <span className="font-hand text-sm text-primary">{WEEK_LABELS[trainingWeek]} · {PHASE_SHORT[info.phase]} phase</span>
            </div>
            <h2 className="font-display text-lg italic text-foreground">{PHASE_SHORT[info.phase]} — {rec.title}</h2>
            <p className="font-body text-sm text-muted-foreground mt-1">{rec.description}</p>
          </div>

          {/* Today's session from training program */}
          <TodaySession
            onOpenTraining={() => { haptic("light"); setActiveTab("training"); }}
            onOpenHR={() => setShowHR(true)}
            onOpenManualLog={() => { setShowManualLog(true); setActiveTab("log"); }}
            onSessionLogged={() => setLogRefreshKey(k => k + 1)}
          />
          {aiTodayWorkout && (
            <AISessionCard
              session={aiTodayWorkout}
              trainingWeek={trainingWeek}
              weekTheme={aiPlan?.weeks?.[trainingWeek - 1]?.theme}
              phase={info.phase}
              completedExercises={completedExercises}
              onToggleExercise={toggleExercise}
              onOpenExercise={(ex) => {
                haptic("light");
                setDrawerExercise({
                  name: ex.name,
                  sets: String(ex.sets || ""),
                  reps: ex.reps_or_duration || "",
                  duration: "",
                  formCue: ex.form_cue || "",
                  section: "",
                });
              }}
            />
          )}
        </div>
      )}

      {/* Floating HR indicator when connected but modal closed */}
      {!showHR && globalHR.connected && (
        <button
          onClick={() => setShowHR(true)}
          className="fixed bottom-24 right-4 z-50 flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 shadow-lg animate-pulse"
        >
          <Heart className="h-4 w-4 text-primary-foreground" />
          <span className="font-body text-sm font-bold text-primary-foreground">{globalHR.bpm || "—"}</span>
          <span className="font-body text-[9px] text-primary-foreground/70">bpm</span>
        </button>
      )}

      {/* LIBRARY TAB */}
      {activeTab === "library" && <LibraryTab />}

      {/* MY LOG TAB */}
      {activeTab === "log" && (
        <div className="space-y-8 md:space-y-10">
          {/* Monthly calendar with stats (workouts, minutes, zone 2+, consistency) */}
          <MovementCalendar />

          {/* Manual log */}
          {showManualLog ? (
            <div className="card-warm p-4 space-y-4">
              <div className="flex items-center justify-between">
                <p className="font-hand text-sm font-bold text-primary">Log a workout</p>
                <button onClick={() => setShowManualLog(false)} className="text-muted-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="font-body text-xs text-muted-foreground">Date</label>
                  <input
                    type="date"
                    value={manualLog.date}
                    onChange={e => setManualLog(prev => ({ ...prev, date: e.target.value }))}
                    max={todayStr}
                    className="w-full mt-1 rounded-xl border border-border bg-background px-3 py-2 font-body text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="font-body text-xs text-muted-foreground">Activity type</label>
                  <select
                    value={manualLog.type}
                    onChange={e => setManualLog(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full mt-1 rounded-xl border border-border bg-background px-3 py-2 font-body text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                  >
                    {["Strength", "Cardio", "Yoga", "Pilates", "Run", "Walk", "Swim", "Cycling", "HIIT", "Other"].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-body text-xs text-muted-foreground">Duration (minutes)</label>
                  <input
                    type="number"
                    min={1}
                    max={300}
                    value={manualLog.duration}
                    onChange={e => setManualLog(prev => ({ ...prev, duration: Number(e.target.value) }))}
                    className="w-full mt-1 rounded-xl border border-border bg-background px-3 py-2 font-body text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="font-body text-xs text-muted-foreground">Notes (optional)</label>
                  <textarea
                    value={manualLog.notes}
                    onChange={e => setManualLog(prev => ({ ...prev, notes: e.target.value }))}
                    rows={2}
                    placeholder="How did it feel?"
                    className="w-full mt-1 rounded-xl border border-border bg-background px-3 py-2 font-body text-sm text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-1 focus:ring-primary/30"
                  />
                </div>
                <button
                  onClick={handleManualLog}
                  disabled={manualLogging}
                  className="w-full h-11 rounded-full bg-primary text-primary-foreground font-display text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {manualLogging ? <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> : "Save workout"}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowManualLog(true)}
              className="card-warm p-4 w-full text-left flex items-center gap-3"
            >
              <Plus className="h-5 w-5 text-primary" />
              <div>
                <p className="font-body text-sm font-medium text-foreground">Log a workout manually</p>
                <p className="font-body text-xs text-muted-foreground mt-0.5">Add any session to your log.</p>
              </div>
            </button>
          )}

          {/* Workout history from Supabase */}
          {supabaseLogs.length > 0 && (
            <div>
              <p className="font-body text-[10px] text-muted-foreground uppercase tracking-[0.15em] mb-2">Workout history</p>
              <div className="space-y-2">
                {supabaseLogs.map(log => (
                  <div key={log.id} className="card-warm p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-body text-sm font-medium text-foreground">
                          {log.workout_template_id ? "Training session" : "Logged workout"}
                        </p>
                        <p className="font-body text-[9px] text-muted-foreground">
                          {log.session_date} · {log.duration_minutes ? `${log.duration_minutes} min` : ""}
                        </p>
                      </div>
                      <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                    </div>
                    {log.notes && (
                      <p className="font-body text-xs text-muted-foreground mt-1.5 italic">"{log.notes}"</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HR session history from localStorage */}
          {sessions.length > 0 && (
            <div>
              <p className="font-body text-[10px] text-muted-foreground uppercase tracking-[0.15em] mb-2">HR sessions</p>
              <div className="space-y-2">
                {sessions.slice(0, 10).map(s => {
                  const isExpanded = expandedSession === s.id;
                  const durationMin = Math.round(s.duration / 60);
                  const zoneChart = HR_ZONES.map((z, i) => ({
                    name: `Z${z.zone}`,
                    minutes: s.zoneMins[i] || 0,
                    color: z.color,
                    label: z.label,
                  }));

                  return (
                    <div key={s.id} className="card-warm overflow-hidden">
                      <div
                        className="p-3 flex items-center gap-3 cursor-pointer active:bg-secondary/50 transition-colors"
                        onClick={() => { haptic("light"); setExpandedSession(isExpanded ? null : s.id); }}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-body text-sm font-medium text-foreground">{s.workoutName}</p>
                          <p className="font-body text-[9px] text-muted-foreground">
                            {s.date} &middot; {durationMin} min &middot; Avg {s.avgHR} bpm
                          </p>
                        </div>
                        <div className="text-right flex items-center gap-2">
                          <div>
                            <p className="font-body text-sm text-foreground">{s.zone2PlusPercent}%</p>
                            {s.caloriesBurnt ? (
                              <div className="flex items-center gap-0.5 justify-end">
                                <Flame className="h-2.5 w-2.5 text-destructive" />
                                <p className="font-body text-[9px] text-destructive">{s.caloriesBurnt}</p>
                              </div>
                            ) : (
                              <p className="font-body text-[9px] text-primary">Zone 2+</p>
                            )}
                          </div>
                          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                        </div>
                      </div>

                      {isExpanded && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-3 pb-4 border-t border-border pt-3 space-y-3">
                          <div className="grid grid-cols-4 gap-2">
                            {[
                              { val: formatTime(s.duration), label: "Duration" },
                              { val: s.avgHR, label: "Avg HR" },
                              { val: s.maxHR, label: "Max HR" },
                              { val: s.caloriesBurnt || "—", label: "Calories" },
                            ].map(({ val, label }) => (
                              <div key={label} className="text-center">
                                <p className="font-body text-sm text-foreground">{val}</p>
                                <p className="font-body text-[9px] text-muted-foreground">{label}</p>
                              </div>
                            ))}
                          </div>

                          <div className="h-32 rounded-xl bg-card p-2">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={zoneChart} margin={{ top: 2, right: 2, bottom: 2, left: 0 }}>
                                <XAxis dataKey="name" tick={{ fontSize: 9, fontFamily: "Montserrat" }} stroke="hsl(var(--border))" />
                                <YAxis tick={{ fontSize: 8, fontFamily: "Montserrat" }} stroke="hsl(var(--border))" width={25} unit="m" />
                                <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
                                  {zoneChart.map((entry, idx) => (
                                    <Cell key={idx} fill={entry.color} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {zoneChart.map(z => z.minutes > 0 && (
                              <div key={z.name} className="flex items-center gap-1 rounded-full px-2 py-0.5" style={{ backgroundColor: z.color + "18" }}>
                                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: z.color }} />
                                <span className="font-body text-[9px] text-foreground">{z.name} {z.minutes}m</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty state */}
          {supabaseLogs.length === 0 && sessions.length === 0 && (
            <div className="card-warm p-8 text-center space-y-3">
              <Dumbbell className="h-8 w-8 text-muted-foreground/30 mx-auto" />
              <p className="font-display text-base font-bold text-foreground">No workouts logged yet</p>
              <p className="font-body text-xs text-muted-foreground">Complete a session or log one manually.</p>
            </div>
          )}
        </div>
      )}


      {/* BODY TAB */}
      {activeTab === "body" && (
        <div className="space-y-8 md:space-y-10">
          <BodyVisualiser />
        </div>
      )}

      {/* PROGRESS TAB */}
      {activeTab === "progress" && <ProgressTab />}

      {/* TRAINING TAB */}
      {activeTab === "training" && <TrainingTab />}

      {/* Floating HR button on today/library */}
      {(activeTab === "today" || activeTab === "library") && (
        <button
          onClick={() => setShowHR(true)}
          className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-40 touch-btn h-14 w-14 rounded-full bg-primary shadow-lg flex items-center justify-center"
        >
          <Activity className="h-6 w-6 text-primary-foreground" />
        </button>
      )}

      {/* Exercise Detail Drawer */}
      <ExerciseDetailDrawer
        exercise={drawerExercise}
        open={!!drawerExercise}
        onClose={() => setDrawerExercise(null)}
        phase={info.phase}
      />
      </ContentSection>
    </div>
    </GatedPage>
  );
}
