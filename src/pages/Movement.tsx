import { useState } from "react";
import { motion } from "framer-motion";
import { AtmosphericHero, ContentSection } from "@/components/AtmosphericSection";
import { Check, Dumbbell, Bluetooth, Activity } from "lucide-react";
import PhaseBadge from "@/components/PhaseBadge";
import { CymatiSketch, SacredSpiral, PhaseIndicator } from "@/components/BotanicalElements";
import { getCycleInfo, getLastPeriodStart, getLoggedWorkouts, logWorkout, Phase, PHASE_SHORT } from "@/lib/cycle-utils";
import {
  WORKOUTS, PHASE_WORKOUTS, PHASE_MOVEMENT_LABEL, PHASE_MOVEMENT_REC, TODAY_WORKOUT, SUIT_COLORS, CATEGORY_LABELS,
  FEELINGS, FEELING_REC, WEEKLY_SCHEDULE, WEEK_LABELS, getTrainingWeek, setTrainingWeek,
  getAllSessions, type WorkoutCategory, type Exercise,
} from "@/data/workouts";
import { haptic } from "@/hooks/use-mobile";
import LiveHRView from "@/components/movement/LiveHRView";
import MovementCalendar from "@/components/movement/MovementCalendar";
import ProgressTab from "@/components/movement/ProgressTab";
import ExerciseRig from "@/components/movement/ExerciseRig";
import ExerciseDetailDrawer from "@/components/movement/ExerciseDetailDrawer";
import { getAnimationForExercise } from "@/data/exercise-animations";
import SignalContextChips from "@/components/signal/SignalContextChips";
import { useSignalPanel } from "@/hooks/useSignalPanel";

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#C4526E", follicular: "#5C4A9E", ovulatory: "#C47A8A", luteal: "#9B89B4",
};

const cardVariant = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.08 * i, duration: 0.35, ease: "easeOut" as const } }),
};

export default function MovementPage() {
  const info = getCycleInfo(getLastPeriodStart());
  const { openSignal } = useSignalPanel();
  const [activeTab, setActiveTab] = useState<"today" | "library" | "log" | "calendar" | "progress">("today");
  const [feeling, setFeeling] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<WorkoutCategory | "all">("all");
  const [phaseFilter, setPhaseFilter] = useState<Phase | "all">(info.phase);
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [workoutComplete, setWorkoutComplete] = useState(false);
  const [showHR, setShowHR] = useState(false);
  const [trainingWeek, setTrainingWeekState] = useState(getTrainingWeek());
  const [drawerExercise, setDrawerExercise] = useState<Exercise | null>(null);

  const todayStr = new Date().toISOString().split("T")[0];
  const dayOfWeek = new Date().getDay();
  const scheduleIdx = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const todaySchedule = WEEKLY_SCHEDULE[scheduleIdx];

  // Phase-aware today workout
  const phaseWorkouts = PHASE_WORKOUTS[info.phase];
  const todayWorkoutId = TODAY_WORKOUT[info.phase];
  const todayWorkoutData = phaseWorkouts.find(w => w.id === todayWorkoutId) || phaseWorkouts[0];
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

  const handleWeekChange = (week: number) => {
    haptic("light");
    setTrainingWeek(week);
    setTrainingWeekState(week);
  };

  const TABS = [
    { id: "today" as const, label: "Today" },
    { id: "library" as const, label: "Library" },
    { id: "log" as const, label: "My Log" },
    { id: "calendar" as const, label: "Calendar" },
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

  return (
    <div className="relative">
      {/* ═══ HERO ═══ */}
      <AtmosphericHero size="md">
        <div className="text-center">
          <p className="font-body text-xs uppercase tracking-[0.3em] text-primary-foreground/40 mb-4">Movement</p>
          <h1 className="font-display text-[3rem] md:text-[4rem] font-extrabold text-primary-foreground leading-[1.02] mb-4">Move</h1>
          <p className="font-display text-base md:text-lg italic text-primary-foreground/60 max-w-md mx-auto">
            {PHASE_MOVEMENT_LABEL[info.phase]}
          </p>
        </div>
      </AtmosphericHero>

      <ContentSection className="px-5 md:px-4 space-y-8 md:space-y-10">

      <SignalContextChips pageContext="movement" onOpenSignal={(p) => openSignal(p, "movement")} compact />

      <PhaseBadge phase={info.phase} cycleDay={info.cycleDay} />

      {/* Tab bar - scrollable */}
      <div className="scroll-snap-x flex gap-1 rounded-full bg-secondary p-1 -mx-1 px-1">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => { haptic("light"); setActiveTab(tab.id); }}
            className={`scroll-snap-item touch-tab flex-shrink-0 rounded-full px-3 py-2.5 min-h-[44px] font-body text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground active:text-foreground"
            }`}
          >{tab.label}</button>
        ))}
      </div>

      {/* TODAY TAB */}
      {activeTab === "today" && (
        <div className="space-y-4 md:space-y-6">
          {/* Phase banner */}
          <div className="card-warm p-4 md:p-5 relative overflow-hidden">
            <div className="absolute top-2 right-2 w-12 h-12 pointer-events-none">
              <CymatiSketch phase={info.phase} size={48} opacity={0.08} />
            </div>
            <div className="flex items-center gap-2 mb-1">
              <PhaseIndicator phase={info.phase} size={18} />
              <span className="font-body text-[10px] uppercase tracking-widest text-muted-foreground">{PHASE_MOVEMENT_LABEL[info.phase]}</span>
            </div>
            <h2 className="font-display text-lg italic text-foreground">{PHASE_SHORT[info.phase]} \u2014 {rec.title}</h2>
            <p className="font-body text-sm text-muted-foreground mt-1">{rec.description}</p>
          </div>

          {/* Training week badge */}
          <div className="card-warm p-3 flex items-center justify-between">
            <span className="font-hand text-sm text-primary">{WEEK_LABELS[trainingWeek]}</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4].map(w => (
                <button key={w} onClick={() => handleWeekChange(w)}
                  className={`touch-btn h-8 w-8 rounded-full font-mono text-xs ${trainingWeek === w ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
                >{w}</button>
              ))}
            </div>
          </div>

          {/* Phase workout options */}
          <div className="card-warm p-4 space-y-2">
            <p className="font-hand text-xs font-bold text-primary mb-2">
              {phaseWorkouts.length} workouts for {PHASE_SHORT[info.phase].toLowerCase()}
            </p>
            <div className="scroll-snap-x flex gap-2 pb-1 -mx-1 px-1">
              {phaseWorkouts.map(w => (
                <button key={w.id} onClick={() => { haptic("light"); }}
                  className={`scroll-snap-item flex-shrink-0 rounded-xl p-2.5 text-center min-w-[80px] ${w.id === todayWorkoutData?.id ? "bg-card ring-1 ring-primary/30 shadow-sm" : "bg-secondary/40"}`}
                >
                  <p className="font-hand text-[10px] font-bold text-foreground leading-tight">{w.name}</p>
                  <p className="font-mono text-[8px] text-muted-foreground mt-0.5">{w.duration}</p>
                </button>
              ))}
            </div>
          </div>

          {/* How do you feel */}
          <div className="card-warm p-4 space-y-3">
            <p className="font-display text-base italic text-foreground">How does your body feel right now?</p>
            <div className="scroll-snap-x flex gap-2 pb-1 -mx-1 px-1 sm:flex-wrap">
              {FEELINGS.map(f => (
                <button key={f} onClick={() => { haptic("light"); setFeeling(f); }}
                  className={`touch-btn scroll-snap-item rounded-full px-4 py-2.5 min-h-[44px] font-body text-xs font-medium transition-all whitespace-nowrap ${feeling === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
                >{f}</button>
              ))}
            </div>
            {feeling && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-body text-sm text-foreground/80 bg-primary/5 rounded-xl p-3">{FEELING_REC[feeling]}</motion.p>}
          </div>

          {/* Today's workout */}
          {todayWorkoutData && (
            <div className="card-warm p-4 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <PhaseIndicator phase={info.phase} size={16} />
                    <h3 className="font-display text-lg italic text-foreground">{todayWorkoutData.name}</h3>
                  </div>
                  <p className="font-body text-[9px] italic text-muted-foreground mt-0.5">{PHASE_MOVEMENT_LABEL[info.phase]}</p>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    <span className="font-mono text-[10px]" style={{ color: PHASE_HEX[info.phase] }}>{todayWorkoutData.duration}</span>
                    <span className="font-body text-[10px] text-muted-foreground">{todayWorkoutData.equipment}</span>
                  </div>
                  <p className="font-body text-xs text-muted-foreground mt-1">{todayWorkoutData.description}</p>
                </div>
                <span className={`flex-shrink-0 rounded-full px-3 py-1 font-hand text-[11px] font-bold ${SUIT_COLORS[todayWorkoutData.suitability[info.phase]].bg} ${SUIT_COLORS[todayWorkoutData.suitability[info.phase]].text}`}>
                  {SUIT_COLORS[todayWorkoutData.suitability[info.phase]].label}
                </span>
              </div>

              {/* Rest options */}
              {todayWorkoutData.restOptions && todayWorkoutData.restOptions.length > 0 && (
                <div className="space-y-2">
                  {todayWorkoutData.restOptions.map(opt => (
                    <div key={opt.id} className="bg-secondary/50 rounded-xl p-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-display text-sm italic text-foreground">{opt.name}</h4>
                        <span className="font-mono text-[9px] text-muted-foreground">{opt.duration}</span>
                      </div>
                      <p className="font-body text-xs text-muted-foreground mt-1">{opt.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Exercise list */}
              {todayWorkoutData.exercises.length > 0 && (
                <>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(completedExercises.size / todayWorkoutData.exercises.length) * 100}%` }} />
                  </div>
                  <p className="font-mono text-[10px] text-muted-foreground">{completedExercises.size}/{todayWorkoutData.exercises.length}</p>

                  <div className="space-y-1.5">
                    {todayWorkoutData.exercises.map((ex, i) => {
                      const done = completedExercises.has(ex.name);
                      const showSection = i === 0 || ex.section !== todayWorkoutData.exercises[i - 1]?.section;
                      return (
                        <div key={ex.name}>
                          {showSection && ex.section && (
                            <p className="font-hand text-xs font-bold text-primary mt-3 mb-1">{ex.section}</p>
                          )}
                          <motion.div custom={i} initial="hidden" animate="visible" variants={cardVariant}
                            className={`touch-card flex items-center gap-3 rounded-xl p-3 cursor-pointer transition-all min-h-[52px] ${done ? "bg-primary/5" : "bg-secondary/50 active:bg-secondary"}`}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div
                              className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border transition-all ${done ? "bg-primary border-primary" : "border-muted-foreground/30"}`}
                              onClick={(e) => { e.stopPropagation(); toggleExercise(ex.name); }}
                            >
                              {done && <Check className="h-3.5 w-3.5 text-primary-foreground" />}
                            </div>
                            {/* Mini animation preview */}
                            {(() => {
                              const anim = getAnimationForExercise(ex.name);
                              return anim ? (
                                <div className="flex-shrink-0 w-8 h-10 flex items-center justify-center"
                                  onClick={(e) => { e.stopPropagation(); haptic("light"); setDrawerExercise(ex); }}>
                                  <ExerciseRig animation={anim} size={22} playing={!done} />
                                </div>
                              ) : null;
                            })()}
                            <div className="flex-1 min-w-0" onClick={() => { haptic("light"); setDrawerExercise(ex); }}>
                              <p className={`font-body text-sm ${done ? "text-muted-foreground line-through" : "text-foreground"}`}>{ex.name}</p>
                              <p className="font-mono text-[9px]" style={{ color: PHASE_HEX[info.phase] }}>{ex.sets && `${ex.sets}\u00d7`}{ex.reps}{ex.duration && ` ${ex.duration}`}</p>
                            </div>
                            <p className="font-display text-[9px] italic text-muted-foreground max-w-[90px] text-right hidden sm:block">{ex.formCue}</p>
                          </motion.div>
                        </div>
                      );
                    })}
                  </div>

                  {workoutComplete && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6 bg-primary/5 rounded-xl">
                      <div className="flex items-center justify-center gap-2">
                        <PhaseIndicator phase={info.phase} size={24} />
                        <p className="font-display text-xl italic text-foreground">Workout complete</p>
                        <PhaseIndicator phase={info.phase} size={24} />
                      </div>
                      <p className="font-hand text-sm text-muted-foreground mt-1">Saved to your log.</p>
                    </motion.div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* LIBRARY TAB */}
      {activeTab === "library" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="scroll-snap-x flex gap-1.5 pb-1 -mx-1 px-1 sm:flex-wrap">
              <button onClick={() => setCategoryFilter("all")} className={`touch-btn scroll-snap-item rounded-full px-3 py-2 min-h-[40px] font-body text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${categoryFilter === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>All</button>
              {(Object.keys(CATEGORY_LABELS) as WorkoutCategory[]).map(cat => (
                <button key={cat} onClick={() => setCategoryFilter(cat)} className={`touch-btn scroll-snap-item rounded-full px-3 py-2 min-h-[40px] font-body text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${categoryFilter === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>{CATEGORY_LABELS[cat]}</button>
              ))}
            </div>
            <div className="scroll-snap-x flex gap-1.5 pb-1 -mx-1 px-1 sm:flex-wrap">
              {(["menstrual", "follicular", "ovulatory", "luteal"] as Phase[]).map(phase => (
                <button key={phase} onClick={() => { haptic("light"); setPhaseFilter(phaseFilter === phase ? "all" : phase); }}
                  className={`touch-btn scroll-snap-item rounded-full px-3 py-2 min-h-[40px] font-body text-[10px] font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${phaseFilter === phase ? `phase-${phase}` : `phase-${phase}-light`}`}
                >
                  <PhaseIndicator phase={phase} size={14} />
                  <span>{PHASE_SHORT[phase]}</span>
                  <span className="font-display text-[8px] italic opacity-70">{PHASE_MOVEMENT_LABEL[phase]}</span>
                </button>
              ))}
            </div>
          </div>

          <p className="font-mono text-[10px] text-muted-foreground">{filteredWorkouts.length} workouts{activePhase ? ` \u00b7 ${PHASE_MOVEMENT_LABEL[activePhase]}` : ""}.</p>

          {filteredWorkouts.map((w, i) => {
            const displayPhase = activePhase || getWorkoutPhase(w.id) || info.phase;
            const suit = w.suitability[displayPhase];
            const expanded = expandedWorkout === w.id;
            return (
              <motion.div key={w.id} custom={i} initial="hidden" animate="visible" variants={cardVariant} className="card-warm overflow-hidden">
                <div className="p-4 cursor-pointer touch-card flex items-center gap-3 min-h-[64px]" onClick={() => { haptic("light"); setExpandedWorkout(expanded ? null : w.id); }}>
                  <span className="font-mono text-base font-bold min-w-[50px]" style={{ color: PHASE_HEX[displayPhase] }}>{w.duration.replace(" min", ":00")}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <PhaseIndicator phase={displayPhase} size={14} />
                      <h3 className="font-display text-sm italic text-foreground truncate">{w.name}</h3>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-display text-[9px] italic" style={{ color: PHASE_HEX[displayPhase], opacity: 0.7 }}>{PHASE_MOVEMENT_LABEL[displayPhase]}</span>
                      <span className="font-body text-[9px] text-muted-foreground">{w.equipment}</span>
                    </div>
                  </div>
                  <div className={`h-4 w-4 rounded-full flex-shrink-0 ${suit === "ideal" ? "animate-node-pulse" : ""}`}
                    style={{
                      backgroundColor: suit === "ideal" ? PHASE_HEX[displayPhase] : suit === "suitable" ? "hsl(var(--border))" : "transparent",
                      border: suit === "rest" ? "1px solid hsl(var(--border))" : "none",
                      boxShadow: suit === "ideal" ? `0 0 8px ${PHASE_HEX[displayPhase]}60` : "none",
                    }}
                  />
                </div>
                {expanded && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 pb-4 border-t border-border pt-3 space-y-1.5">
                    <p className="font-body text-xs text-muted-foreground mb-2">{w.description}</p>
                    {w.restOptions && w.restOptions.map(opt => (
                      <div key={opt.id} className="bg-secondary/50 rounded-xl p-2.5">
                        <h4 className="font-display text-sm italic text-foreground">{opt.name} \u00b7 {opt.duration}</h4>
                        <p className="font-body text-xs text-muted-foreground mt-0.5">{opt.description}</p>
                      </div>
                    ))}
                    {w.exercises.map((ex, j) => {
                      const libAnim = getAnimationForExercise(ex.name);
                      return (
                        <div key={j}
                          className="flex items-center justify-between bg-secondary/50 rounded-xl p-2.5 gap-2 cursor-pointer active:bg-secondary"
                          onClick={() => { haptic("light"); setDrawerExercise(ex); }}
                        >
                          {libAnim && (
                            <div className="flex-shrink-0 w-7 h-9 flex items-center justify-center">
                              <ExerciseRig animation={libAnim} size={18} playing={true} />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="font-body text-sm text-foreground">{ex.name}</p>
                            <p className="font-mono text-[9px]" style={{ color: PHASE_HEX[displayPhase] }}>{ex.sets && `${ex.sets}\u00d7`}{ex.reps}{ex.duration && ` ${ex.duration}`}</p>
                          </div>
                          <p className="font-display text-[9px] italic text-muted-foreground max-w-[100px] text-right hidden sm:block">{ex.formCue}</p>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* MY LOG TAB */}
      {activeTab === "log" && (
        <div className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-3 gap-2">
            {[{ val: totalCompleted, label: "Workouts" }, { val: totalMinutes, label: "Minutes" }, { val: totalCompleted > 0 ? Math.round((totalCompleted / 7) * 100) + "%" : "0%", label: "Consistency" }].map(({ val, label }) => (
              <div key={label} className="card-warm p-3 text-center">
                <p className="font-mono text-xl text-foreground">{val}</p>
                <p className="font-body text-[9px] text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-1.5">
            {weekDays.map((date, i) => {
              const dateStr = date.toISOString().split("T")[0];
              const isToday = dateStr === todayStr;
              const logged = getLoggedWorkouts(dateStr);
              return (
                <div key={i} className={`flex-1 rounded-xl p-2 text-center ${isToday ? "bg-card ring-1 ring-primary/30 shadow-sm" : "bg-secondary/30"}`}>
                  <p className="font-body text-[9px] text-muted-foreground">{["M", "T", "W", "T", "F", "S", "S"][i]}</p>
                  <p className="font-mono text-xs text-foreground mt-0.5">{date.getDate()}</p>
                  {logged.length > 0 ? <Dumbbell className="h-3 w-3 text-primary mx-auto mt-1" /> : <div className="h-3 mt-1" />}
                </div>
              );
            })}
          </div>

          {/* Heart rate section */}
          <div className="card-warm p-5" style={{ backgroundColor: "hsl(36 47% 94%)" }}>
            <h3 className="font-display text-base italic text-foreground">Heart rate monitor.</h3>
            <p className="font-body text-xs italic text-muted-foreground mt-1">
              Connect a Bluetooth chest strap to track your zones in real time.
            </p>
            <p className="font-hand text-[10px] text-muted-foreground mt-1">
              Works with Polar H10, H9, Garmin chest strap, Wahoo TICKR via Bluetooth.
            </p>
            <button onClick={() => setShowHR(true)} className="touch-btn w-full mt-3 rounded-[14px] py-3 min-h-[48px] font-body text-sm font-bold text-primary-foreground bg-primary flex items-center justify-center gap-2">
              <Bluetooth className="h-4 w-4" /> Connect monitor
            </button>
          </div>

          {/* Training week selector */}
          <div className="card-warm p-4">
            <p className="font-body text-sm text-foreground mb-2">Which training week are you in?</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map(w => (
                <button key={w} onClick={() => handleWeekChange(w)}
                  className={`touch-btn flex-1 rounded-xl py-2.5 min-h-[44px] font-mono text-sm ${trainingWeek === w ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
                >{w}</button>
              ))}
            </div>
          </div>

          {/* Manual log */}
          <div className="card-warm p-4">
            <p className="font-hand text-sm text-muted-foreground">Log manually</p>
            <p className="font-body text-xs text-muted-foreground mt-1">
              No heart rate monitor? Log your workout effort manually.
            </p>
          </div>

          {/* Session history */}
          {sessions.length > 0 && (
            <div>
              <p className="font-hand text-sm font-bold text-primary mb-2">Past sessions</p>
              <div className="space-y-2">
                {sessions.slice(0, 10).map(s => (
                  <div key={s.id} className="card-warm p-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm text-foreground">{s.workoutName}</p>
                      <p className="font-mono text-[9px] text-muted-foreground">{s.date} \u00b7 {Math.round(s.duration / 60)} min \u00b7 Avg {s.avgHR} bpm</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm text-foreground">{s.zone2PlusPercent}%</p>
                      <p className="font-hand text-[9px] text-petal-gold">Zone 2+</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CALENDAR TAB */}
      {activeTab === "calendar" && <MovementCalendar />}

      {/* PROGRESS TAB */}
      {activeTab === "progress" && <ProgressTab />}

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
  );
}
