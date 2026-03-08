import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Dumbbell } from "lucide-react";
import PhaseBadge from "@/components/PhaseBadge";
import { CymatiSketch, SacredSpiral } from "@/components/BotanicalElements";
import { getCycleInfo, getLastPeriodStart, getLoggedWorkouts, logWorkout, Phase, PHASE_SHORT } from "@/lib/cycle-utils";
import {
  WORKOUTS, PHASE_MOVEMENT_REC, TODAY_WORKOUT, SUIT_COLORS, CATEGORY_LABELS,
  FEELINGS, FEELING_REC, type WorkoutCategory
} from "@/data/workouts";
import { haptic } from "@/hooks/use-mobile";

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#C4526E", follicular: "#7D9E82", ovulatory: "#E8A030", luteal: "#9B89B4",
};

const cardVariant = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.08 * i, duration: 0.35, ease: "easeOut" as const } }),
};

export default function MovementPage() {
  const info = getCycleInfo(getLastPeriodStart());
  const [activeTab, setActiveTab] = useState<"today" | "library" | "log">("today");
  const [feeling, setFeeling] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<WorkoutCategory | "all">("all");
  const [phaseFilter, setPhaseFilter] = useState<Phase | "all">("all");
  const [timeFilter, setTimeFilter] = useState("any");
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [workoutComplete, setWorkoutComplete] = useState(false);

  const todayWorkoutData = WORKOUTS.find((w) => w.id === TODAY_WORKOUT[info.phase]);
  const rec = PHASE_MOVEMENT_REC[info.phase];
  const todayStr = new Date().toISOString().split("T")[0];

  const toggleExercise = (name: string) => {
    haptic("light");
    const next = new Set(completedExercises);
    next.has(name) ? next.delete(name) : next.add(name);
    setCompletedExercises(next);
    if (todayWorkoutData && next.size === todayWorkoutData.exercises.length) {
      haptic("success");
      setWorkoutComplete(true);
      logWorkout(todayStr, todayWorkoutData.id);
    }
  };

  const filteredWorkouts = WORKOUTS.filter((w) => {
    if (categoryFilter !== "all" && w.category !== categoryFilter) return false;
    if (phaseFilter !== "all" && w.suitability[phaseFilter] === "rest") return false;
    if (timeFilter === "under20" && w.durationMin > 20) return false;
    if (timeFilter === "20-35" && (w.durationMin < 20 || w.durationMin > 35)) return false;
    if (timeFilter === "35-50" && (w.durationMin < 35 || w.durationMin > 50)) return false;
    return true;
  });

  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const weekDays = Array.from({ length: 7 }, (_, i) => { const d = new Date(today); d.setDate(today.getDate() + mondayOffset + i); return d; });
  const weekWorkouts = weekDays.map((d) => getLoggedWorkouts(d.toISOString().split("T")[0]));
  const totalCompleted = weekWorkouts.filter((w) => w.length > 0).length;
  const totalMinutes = weekWorkouts.flat().reduce((s, id) => s + (WORKOUTS.find((x) => x.id === id)?.durationMin || 0), 0);

  const TABS = [
    { id: "today" as const, label: "Today" },
    { id: "library" as const, label: "Library" },
    { id: "log" as const, label: "My Log" },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 md:space-y-8 relative">
      <div className="absolute top-0 right-0 -translate-y-4 md:-translate-y-8 translate-x-4 md:translate-x-8 pointer-events-none">
        <SacredSpiral size={100} opacity={0.08} className="md:hidden" />
        <SacredSpiral size={140} opacity={0.1} className="hidden md:block" />
      </div>

      <div>
        <p className="font-hand text-sm font-bold text-primary">movement</p>
        <h1 className="font-display text-[1.75rem] md:text-4xl font-bold italic text-foreground">Movement</h1>
      </div>

      <PhaseBadge phase={info.phase} cycleDay={info.cycleDay} />

      <div className="flex gap-1 rounded-full bg-secondary p-1">
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => { haptic("light"); setActiveTab(tab.id); }}
            className={`touch-tab flex-1 rounded-full px-3 py-2.5 min-h-[44px] font-body text-xs font-medium transition-all ${
              activeTab === tab.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground active:text-foreground"
            }`}
          >{tab.label}</button>
        ))}
      </div>

      {activeTab === "today" && (
        <div className="space-y-4 md:space-y-6">
          <div className="card-warm p-4 md:p-5 relative overflow-hidden">
            <div className="absolute top-2 right-2 w-12 h-12 md:w-16 md:h-16 pointer-events-none">
              <CymatiSketch phase={info.phase} size={48} opacity={0.08} />
            </div>
            <h2 className="font-display text-lg md:text-xl italic text-foreground">{PHASE_SHORT[info.phase]} — {rec.title}</h2>
            <p className="font-body text-sm text-muted-foreground mt-1">{rec.description}</p>
          </div>

          <div className="card-warm p-4 md:p-5 space-y-3">
            <p className="font-display text-base md:text-lg italic text-foreground">how does your body feel right now?</p>
            <div className="scroll-snap-x flex gap-2 pb-1 -mx-1 px-1 sm:flex-wrap">
              {FEELINGS.map((f) => (
                <button key={f} onClick={() => { haptic("light"); setFeeling(f); }}
                  className={`touch-btn scroll-snap-item rounded-full px-4 py-2.5 min-h-[44px] font-body text-xs font-medium transition-all whitespace-nowrap ${feeling === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground active:bg-secondary/80"}`}
                >{f}</button>
              ))}
            </div>
            {feeling && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-body text-sm text-foreground/80 bg-primary/5 rounded-xl p-3">{FEELING_REC[feeling]}</motion.p>}
          </div>

          {todayWorkoutData && (
            <div className="card-warm p-4 md:p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-display text-lg md:text-xl italic text-foreground">{todayWorkoutData.name}</h3>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    <span className="font-mono text-[10px]" style={{ color: PHASE_HEX[info.phase] }}>{todayWorkoutData.duration}</span>
                    <span className="font-body text-[10px] text-muted-foreground">{todayWorkoutData.equipment}</span>
                  </div>
                </div>
                <span className={`flex-shrink-0 rounded-full px-3 py-1 font-hand text-[11px] font-bold ${SUIT_COLORS[todayWorkoutData.suitability[info.phase]].bg} ${SUIT_COLORS[todayWorkoutData.suitability[info.phase]].text}`}>
                  {SUIT_COLORS[todayWorkoutData.suitability[info.phase]].label}
                </span>
              </div>

              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(completedExercises.size / todayWorkoutData.exercises.length) * 100}%` }} />
              </div>
              <p className="font-mono text-[10px] text-muted-foreground">{completedExercises.size}/{todayWorkoutData.exercises.length}</p>

              <div className="space-y-1.5">
                {todayWorkoutData.exercises.map((ex, i) => {
                  const done = completedExercises.has(ex.name);
                  return (
                    <motion.div key={ex.name} custom={i} initial="hidden" animate="visible" variants={cardVariant}
                      className={`touch-card flex items-center gap-3 rounded-xl p-3 cursor-pointer transition-all min-h-[52px] ${done ? "bg-primary/5" : "bg-secondary/50 active:bg-secondary"}`}
                      onClick={() => toggleExercise(ex.name)}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border transition-all ${done ? "bg-primary border-primary" : "border-muted-foreground/30"}`}>
                        {done && <Check className="h-3.5 w-3.5 text-primary-foreground" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-body text-sm ${done ? "text-muted-foreground line-through" : "text-foreground"}`}>{ex.name}</p>
                        <p className="font-mono text-[9px] text-muted-foreground">{ex.sets && `${ex.sets}×`}{ex.reps}{ex.duration && ` ${ex.duration}`}</p>
                      </div>
                      <p className="font-display text-[10px] italic text-muted-foreground max-w-[80px] md:max-w-[100px] text-right hidden sm:block">{ex.formCue}</p>
                    </motion.div>
                  );
                })}
              </div>

              {workoutComplete && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6 bg-primary/5 rounded-xl">
                  <p className="font-display text-xl md:text-2xl italic text-foreground">workout complete 🌿</p>
                  <p className="font-hand text-sm text-muted-foreground mt-1">saved to your log</p>
                </motion.div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "library" && (
        <div className="space-y-4">
          <div className="space-y-2">
            {/* Horizontal scroll filters */}
            <div className="scroll-snap-x flex gap-1.5 pb-1 -mx-1 px-1 sm:flex-wrap">
              <button onClick={() => setCategoryFilter("all")} className={`touch-btn scroll-snap-item rounded-full px-3 py-2 min-h-[40px] font-body text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${categoryFilter === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>All</button>
              {(Object.keys(CATEGORY_LABELS) as WorkoutCategory[]).map((cat) => (
                <button key={cat} onClick={() => setCategoryFilter(cat)} className={`touch-btn scroll-snap-item rounded-full px-3 py-2 min-h-[40px] font-body text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${categoryFilter === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>{CATEGORY_LABELS[cat]}</button>
              ))}
            </div>
            <div className="scroll-snap-x flex gap-1.5 pb-1 -mx-1 px-1 sm:flex-wrap">
              {(["menstrual", "follicular", "ovulatory", "luteal"] as Phase[]).map((phase) => (
                <button key={phase} onClick={() => setPhaseFilter(phaseFilter === phase ? "all" : phase)} className={`touch-btn scroll-snap-item rounded-full px-3 py-2 min-h-[40px] font-body text-[10px] font-medium transition-all whitespace-nowrap ${phaseFilter === phase ? `phase-${phase}` : `phase-${phase}-light`}`}>{PHASE_SHORT[phase]}</button>
              ))}
            </div>
          </div>

          <p className="font-mono text-[10px] text-muted-foreground">{filteredWorkouts.length} workouts</p>

          {filteredWorkouts.map((w, i) => {
            const suit = w.suitability[info.phase];
            const sc = SUIT_COLORS[suit];
            const expanded = expandedWorkout === w.id;
            return (
              <motion.div key={w.id} custom={i} initial="hidden" animate="visible" variants={cardVariant}
                className="card-warm overflow-hidden"
              >
                <div className="p-4 cursor-pointer touch-card flex items-center gap-3 md:gap-4 min-h-[64px]" onClick={() => { haptic("light"); setExpandedWorkout(expanded ? null : w.id); }}>
                  <span className="font-mono text-base md:text-lg font-bold min-w-[50px] md:min-w-[60px]" style={{ color: PHASE_HEX[info.phase] }}>{w.duration.replace(" min", ":00")}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-sm md:text-base italic text-foreground truncate">{w.name}</h3>
                    <div className="flex gap-2 mt-0.5">
                      <span className="font-body text-[9px] text-muted-foreground">{w.equipment}</span>
                    </div>
                  </div>
                  <div className={`h-4 w-4 rounded-full flex-shrink-0 ${suit === "ideal" ? "animate-node-pulse" : ""}`}
                    style={{
                      backgroundColor: suit === "ideal" ? PHASE_HEX[info.phase] : suit === "suitable" ? "hsl(var(--border))" : "transparent",
                      border: suit === "rest" ? "1px solid hsl(var(--border))" : "none",
                      boxShadow: suit === "ideal" ? `0 0 8px ${PHASE_HEX[info.phase]}60` : "none",
                    }}
                  />
                </div>
                {expanded && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 pb-4 border-t border-border pt-3 space-y-1.5">
                    {w.exercises.map((ex, j) => (
                      <div key={j} className="flex items-center justify-between bg-secondary/50 rounded-xl p-2.5 gap-2">
                        <div className="min-w-0">
                          <p className="font-body text-sm text-foreground">{ex.name}</p>
                          <p className="font-mono text-[9px]" style={{ color: PHASE_HEX[info.phase] }}>{ex.sets && `${ex.sets}×`}{ex.reps}{ex.duration && ` ${ex.duration}`}</p>
                        </div>
                        <p className="font-display text-[10px] italic text-muted-foreground max-w-[100px] text-right hidden sm:block">{ex.formCue}</p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {activeTab === "log" && (
        <div className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            {[{ val: totalCompleted, label: "Workouts" }, { val: totalMinutes, label: "Minutes" }, { val: totalCompleted > 0 ? Math.round((totalCompleted / 7) * 100) + "%" : "0%", label: "Consistency" }].map(({ val, label }) => (
              <div key={label} className="card-warm p-3 md:p-4 text-center">
                <p className="font-mono text-xl md:text-2xl text-foreground">{val}</p>
                <p className="font-body text-[9px] text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-1.5 md:gap-2">
            {weekDays.map((date, i) => {
              const dateStr = date.toISOString().split("T")[0];
              const isToday = dateStr === todayStr;
              const logged = getLoggedWorkouts(dateStr);
              return (
                <div key={i} className={`flex-1 rounded-xl p-2 md:p-2.5 text-center ${isToday ? "bg-card ring-1 ring-primary/30 shadow-sm" : "bg-secondary/30"}`}>
                  <p className="font-body text-[9px] text-muted-foreground">{["M", "T", "W", "T", "F", "S", "S"][i]}</p>
                  <p className="font-mono text-xs text-foreground mt-0.5">{date.getDate()}</p>
                  {logged.length > 0 ? <Dumbbell className="h-3 w-3 text-primary mx-auto mt-1" /> : <div className="h-3 mt-1" />}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
