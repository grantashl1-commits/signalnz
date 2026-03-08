import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Dumbbell } from "lucide-react";
import PhaseBadge from "@/components/PhaseBadge";
import CymaticPattern from "@/components/CymaticPatterns";
import NetworkBackground from "@/components/NetworkBackground";
import { getCycleInfo, getLastPeriodStart, getLoggedWorkouts, logWorkout, Phase, PHASE_SHORT } from "@/lib/cycle-utils";
import {
  WORKOUTS, PHASE_MOVEMENT_REC, TODAY_WORKOUT, SUIT_COLORS, CATEGORY_LABELS,
  FEELINGS, FEELING_REC, type WorkoutCategory
} from "@/data/workouts";

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#8B1A4A", follicular: "#00C9A7", ovulatory: "#FFD166", luteal: "#4A3F7A",
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
    const next = new Set(completedExercises);
    next.has(name) ? next.delete(name) : next.add(name);
    setCompletedExercises(next);
    if (todayWorkoutData && next.size === todayWorkoutData.exercises.length) {
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
    <div className="max-w-3xl mx-auto space-y-8 relative">
      <div className="fixed inset-0 -z-10"><NetworkBackground opacity={0.2} /></div>

      <div>
        <p className="ui-label mb-2">movement data</p>
        <h1 className="font-display text-4xl font-light italic text-foreground">Movement</h1>
      </div>

      <PhaseBadge phase={info.phase} cycleDay={info.cycleDay} />

      <div className="flex gap-1 rounded-lg bg-secondary p-1">
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 rounded-md px-3 py-2 font-body text-xs font-medium uppercase tracking-widest transition-all ${
              activeTab === tab.id ? "bg-card text-cyan shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >{tab.label}</button>
        ))}
      </div>

      {activeTab === "today" && (
        <div className="space-y-6">
          <div className="card-deep p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 -translate-y-4 translate-x-4 pointer-events-none">
              <CymaticPattern phase={info.phase} size={96} opacity={0.1} />
            </div>
            <h2 className="font-display text-xl italic text-foreground">{PHASE_SHORT[info.phase]} — {rec.title}</h2>
            <p className="font-body text-sm text-muted-foreground mt-1">{rec.description}</p>
          </div>

          <div className="card-deep p-5 space-y-3">
            <p className="font-display text-lg italic text-foreground">what frequency is your body at?</p>
            <div className="flex flex-wrap gap-2">
              {FEELINGS.map((f) => (
                <button key={f} onClick={() => setFeeling(f)}
                  className={`rounded-full px-4 py-2 font-body text-xs font-medium transition-all ${feeling === f ? "bg-cyan text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}
                >{f}</button>
              ))}
            </div>
            {feeling && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-body text-sm text-foreground/80 bg-cyan/5 rounded-lg p-3">{FEELING_REC[feeling]}</motion.p>}
          </div>

          {todayWorkoutData && (
            <div className="card-deep p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-xl italic text-foreground">{todayWorkoutData.name}</h3>
                  <div className="flex gap-2 mt-1">
                    <span className="font-mono text-[10px] text-cyan">{todayWorkoutData.duration}</span>
                    <span className="font-body text-[10px] text-muted-foreground">{todayWorkoutData.equipment}</span>
                  </div>
                </div>
                <span className={`rounded-full px-3 py-1 font-body text-[10px] font-medium ${SUIT_COLORS[todayWorkoutData.suitability[info.phase]].bg} ${SUIT_COLORS[todayWorkoutData.suitability[info.phase]].text}`}>
                  {SUIT_COLORS[todayWorkoutData.suitability[info.phase]].label}
                </span>
              </div>

              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-cyan rounded-full transition-all" style={{ width: `${(completedExercises.size / todayWorkoutData.exercises.length) * 100}%` }} />
              </div>
              <p className="font-mono text-[10px] text-muted-foreground">{completedExercises.size}/{todayWorkoutData.exercises.length}</p>

              <div className="space-y-1.5">
                {todayWorkoutData.exercises.map((ex, i) => {
                  const done = completedExercises.has(ex.name);
                  return (
                    <motion.div key={ex.name} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                      className={`flex items-center gap-3 rounded-lg p-3 cursor-pointer transition-all ${done ? "bg-cyan/5" : "bg-secondary/50 hover:bg-secondary"}`}
                      onClick={() => toggleExercise(ex.name)}
                    >
                      <div className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border transition-all ${done ? "bg-cyan border-cyan" : "border-muted-foreground/30"}`}>
                        {done && <Check className="h-3 w-3 text-primary-foreground" />}
                      </div>
                      <div className="flex-1">
                        <p className={`font-body text-sm ${done ? "text-muted-foreground line-through" : "text-foreground"}`}>{ex.name}</p>
                        <p className="font-mono text-[9px] text-muted-foreground">{ex.sets && `${ex.sets}×`}{ex.reps}{ex.duration && ` ${ex.duration}`}</p>
                      </div>
                      <p className="font-display text-[10px] italic text-muted-foreground max-w-[100px] text-right hidden md:block">{ex.formCue}</p>
                    </motion.div>
                  );
                })}
              </div>

              {workoutComplete && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6 bg-cyan/5 rounded-xl">
                  <p className="font-display text-2xl italic text-foreground">signal complete</p>
                  <p className="font-mono text-xs text-muted-foreground mt-1">saved to your log</p>
                </motion.div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "library" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setCategoryFilter("all")} className={`rounded-full px-3 py-1.5 font-body text-[10px] font-bold uppercase tracking-widest transition-all ${categoryFilter === "all" ? "bg-cyan text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>All</button>
              {(Object.keys(CATEGORY_LABELS) as WorkoutCategory[]).map((cat) => (
                <button key={cat} onClick={() => setCategoryFilter(cat)} className={`rounded-full px-3 py-1.5 font-body text-[10px] font-bold uppercase tracking-widest transition-all ${categoryFilter === cat ? "bg-cyan text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>{CATEGORY_LABELS[cat]}</button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(["menstrual", "follicular", "ovulatory", "luteal"] as Phase[]).map((phase) => (
                <button key={phase} onClick={() => setPhaseFilter(phaseFilter === phase ? "all" : phase)} className={`rounded-full px-3 py-1.5 font-body text-[10px] font-medium transition-all ${phaseFilter === phase ? `phase-${phase}` : `phase-${phase}-light`}`}>{PHASE_SHORT[phase]}</button>
              ))}
            </div>
          </div>

          <p className="font-mono text-[10px] text-muted-foreground">{filteredWorkouts.length} workouts</p>

          {filteredWorkouts.map((w, i) => {
            const suit = w.suitability[info.phase];
            const sc = SUIT_COLORS[suit];
            const expanded = expandedWorkout === w.id;
            return (
              <motion.div key={w.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="card-deep overflow-hidden"
              >
                <div className="p-4 cursor-pointer flex items-center gap-4" onClick={() => setExpandedWorkout(expanded ? null : w.id)}>
                  <span className="font-mono text-lg text-cyan font-bold min-w-[60px]">{w.duration.replace(" min", ":00")}</span>
                  <div className="flex-1">
                    <h3 className="font-display text-base italic text-foreground">{w.name}</h3>
                    <div className="flex gap-2 mt-0.5">
                      <span className="font-body text-[9px] text-muted-foreground">{w.equipment}</span>
                      <span className="font-body text-[9px] text-muted-foreground">{CATEGORY_LABELS[w.category]}</span>
                    </div>
                  </div>
                  {/* Suitability node */}
                  <div className={`h-4 w-4 rounded-full ${suit === "ideal" ? "animate-node-pulse" : ""}`}
                    style={{
                      backgroundColor: suit === "ideal" ? PHASE_HEX[info.phase] : suit === "suitable" ? "rgba(255,255,255,0.15)" : "transparent",
                      border: suit === "rest" ? "1px solid rgba(255,255,255,0.15)" : "none",
                      boxShadow: suit === "ideal" ? `0 0 8px ${PHASE_HEX[info.phase]}60` : "none",
                    }}
                  />
                </div>
                {expanded && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 pb-4 border-t border-border pt-3 space-y-1.5">
                    {w.exercises.map((ex, j) => (
                      <div key={j} className="flex items-center justify-between bg-secondary/50 rounded-lg p-2.5">
                        <div>
                          <p className="font-body text-sm text-foreground">{ex.name}</p>
                          <p className="font-mono text-[9px] text-cyan">{ex.sets && `${ex.sets}×`}{ex.reps}{ex.duration && ` ${ex.duration}`}</p>
                        </div>
                        <p className="font-display text-[10px] italic text-muted-foreground max-w-[120px] text-right">{ex.formCue}</p>
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
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-3">
            {[{ val: totalCompleted, label: "Workouts" }, { val: totalMinutes, label: "Minutes" }, { val: totalCompleted > 0 ? Math.round((totalCompleted / 7) * 100) + "%" : "0%", label: "Consistency" }].map(({ val, label }) => (
              <div key={label} className="card-deep p-4 text-center">
                <p className="font-mono text-2xl text-foreground">{val}</p>
                <p className="font-body text-[9px] uppercase tracking-widest text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            {weekDays.map((date, i) => {
              const dateStr = date.toISOString().split("T")[0];
              const isToday = dateStr === todayStr;
              const logged = getLoggedWorkouts(dateStr);
              return (
                <div key={i} className={`flex-1 rounded-lg p-2.5 text-center ${isToday ? "bg-secondary ring-1 ring-cyan/30" : "bg-secondary/30"}`}>
                  <p className="font-body text-[9px] uppercase tracking-widest text-muted-foreground">{["M", "T", "W", "T", "F", "S", "S"][i]}</p>
                  <p className="font-mono text-xs text-foreground mt-0.5">{date.getDate()}</p>
                  {logged.length > 0 ? <Dumbbell className="h-3 w-3 text-cyan mx-auto mt-1" /> : <div className="h-3 mt-1" />}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
