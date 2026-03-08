import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ChevronDown, ChevronUp, Dumbbell } from "lucide-react";
import PhaseBadge from "@/components/PhaseBadge";
import { getCycleInfo, getLastPeriodStart, getLoggedWorkouts, logWorkout, Phase, PHASE_SHORT } from "@/lib/cycle-utils";
import {
  WORKOUTS, PHASE_MOVEMENT_REC, TODAY_WORKOUT, SUIT_COLORS, CATEGORY_LABELS,
  FEELINGS, FEELING_REC, type Workout, type WorkoutCategory, type Suitability
} from "@/data/workouts";

export default function MovementPage() {
  const info = getCycleInfo(getLastPeriodStart());
  const [activeTab, setActiveTab] = useState<"today" | "library" | "log">("today");
  const [feeling, setFeeling] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<WorkoutCategory | "all">("all");
  const [phaseFilter, setPhaseFilter] = useState<Phase | "all">("all");
  const [timeFilter, setTimeFilter] = useState<string>("any");
  const [equipFilter, setEquipFilter] = useState<string>("any");
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [workoutComplete, setWorkoutComplete] = useState(false);

  const todayWorkoutData = WORKOUTS.find((w) => w.id === TODAY_WORKOUT[info.phase]);
  const rec = PHASE_MOVEMENT_REC[info.phase];
  const todayStr = new Date().toISOString().split("T")[0];

  const toggleExercise = (exerciseName: string) => {
    const next = new Set(completedExercises);
    if (next.has(exerciseName)) next.delete(exerciseName);
    else next.add(exerciseName);
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
    if (equipFilter === "none" && !w.equipment.toLowerCase().includes("no equipment")) return false;
    if (equipFilter === "mat" && !w.equipment.toLowerCase().includes("mat")) return false;
    if (equipFilter === "dumbbells" && !w.equipment.toLowerCase().includes("dumbbell")) return false;
    return true;
  });

  // Log data
  const today = new Date();
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    d.setDate(today.getDate() + mondayOffset + i);
    return d;
  });

  const weekWorkouts = weekDays.map((d) => getLoggedWorkouts(d.toISOString().split("T")[0]));
  const totalCompleted = weekWorkouts.filter((w) => w.length > 0).length;
  const totalMinutes = weekWorkouts.flat().reduce((sum, id) => {
    const w = WORKOUTS.find((x) => x.id === id);
    return sum + (w?.durationMin || 0);
  }, 0);

  const TABS = [
    { id: "today" as const, label: "Today" },
    { id: "library" as const, label: "Library" },
    { id: "log" as const, label: "My Log" },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-foreground">Movement</h1>
        <p className="text-muted-foreground mt-1">Train with your body, not against it</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <PhaseBadge phase={info.phase} cycleDay={info.cycleDay} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-muted p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
              activeTab === tab.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TODAY TAB */}
      {activeTab === "today" && (
        <div className="space-y-6">
          {/* Phase rec */}
          <div className="card-warm p-5">
            <h2 className="font-display text-xl font-semibold text-foreground">{PHASE_SHORT[info.phase].toUpperCase()} — {rec.title.toUpperCase()}</h2>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{rec.description}</p>
          </div>

          {/* Feeling check-in */}
          <div className="card-warm p-5 space-y-3">
            <p className="font-display text-lg text-foreground">How does your body feel right now?</p>
            <div className="flex flex-wrap gap-2">
              {FEELINGS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFeeling(f)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    feeling === f ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground hover:bg-accent/10"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            {feeling && (
              <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-foreground bg-accent/5 rounded-lg p-3">
                {FEELING_REC[feeling]}
              </motion.p>
            )}
          </div>

          {/* Today's workout */}
          {todayWorkoutData && (
            <div className="card-warm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-xl font-semibold text-foreground">{todayWorkoutData.name}</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className="text-[10px] bg-muted rounded-full px-2.5 py-1 text-muted-foreground">{todayWorkoutData.duration}</span>
                    <span className="text-[10px] bg-muted rounded-full px-2.5 py-1 text-muted-foreground">{todayWorkoutData.equipment}</span>
                    <span className={`text-[10px] rounded-full px-2.5 py-1 font-medium ${SUIT_COLORS[todayWorkoutData.suitability[info.phase]].bg} ${SUIT_COLORS[todayWorkoutData.suitability[info.phase]].text}`}>
                      {SUIT_COLORS[todayWorkoutData.suitability[info.phase]].label}
                    </span>
                  </div>
                </div>
              </div>

              {todayWorkoutData.warmup && <p className="text-xs text-muted-foreground">Warm up: {todayWorkoutData.warmup}</p>}

              {/* Progress bar */}
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all duration-300"
                  style={{ width: `${(completedExercises.size / todayWorkoutData.exercises.length) * 100}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">{completedExercises.size}/{todayWorkoutData.exercises.length} exercises complete</p>

              {/* Exercises */}
              <div className="space-y-2">
                {todayWorkoutData.exercises.map((ex, i) => {
                  const done = completedExercises.has(ex.name);
                  return (
                    <motion.div
                      key={ex.name}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className={`flex items-center gap-3 rounded-lg p-3 transition-all cursor-pointer ${done ? "bg-accent/10" : "bg-muted/40 hover:bg-muted/60"}`}
                      onClick={() => toggleExercise(ex.name)}
                    >
                      <div className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                        done ? "bg-accent border-accent" : "border-border"
                      }`}>
                        {done && <Check className="h-3 w-3 text-accent-foreground" />}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${done ? "text-muted-foreground line-through" : "text-foreground"}`}>{ex.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {ex.sets && `${ex.sets} sets`}
                          {ex.reps && ` × ${ex.reps}`}
                          {ex.duration && ` • ${ex.duration}`}
                        </p>
                      </div>
                      <p className="text-[10px] text-muted-foreground max-w-[120px] text-right hidden md:block">{ex.formCue}</p>
                    </motion.div>
                  );
                })}
              </div>

              {todayWorkoutData.cooldown && <p className="text-xs text-muted-foreground">Cool down: {todayWorkoutData.cooldown}</p>}

              {workoutComplete && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-4 bg-accent/10 rounded-xl"
                >
                  <p className="font-display text-2xl font-semibold text-foreground">🎉 Workout Complete!</p>
                  <p className="text-sm text-muted-foreground mt-1">Saved to your log</p>
                </motion.div>
              )}
            </div>
          )}
        </div>
      )}

      {/* LIBRARY TAB */}
      {activeTab === "library" && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="space-y-3">
            {/* Category */}
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setCategoryFilter("all")}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${categoryFilter === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
              >
                All
              </button>
              {(Object.keys(CATEGORY_LABELS) as WorkoutCategory[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${categoryFilter === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>

            {/* Phase */}
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setPhaseFilter("all")}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${phaseFilter === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
              >
                All Phases
              </button>
              {(["menstrual", "follicular", "ovulatory", "luteal"] as Phase[]).map((phase) => (
                <button
                  key={phase}
                  onClick={() => setPhaseFilter(phase)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${phaseFilter === phase ? `phase-${phase}` : `phase-${phase}-light`}`}
                >
                  {PHASE_SHORT[phase]}
                </button>
              ))}
            </div>

            {/* Time & Equipment */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { value: "any", label: "Any Time" },
                { value: "under20", label: "Under 20 min" },
                { value: "20-35", label: "20–35 min" },
                { value: "35-50", label: "35–50 min" },
              ].map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTimeFilter(t.value)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${timeFilter === t.value ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          <p className="text-xs text-muted-foreground">{filteredWorkouts.length} workouts</p>
          <div className="grid gap-4">
            {filteredWorkouts.map((w, i) => {
              const suit = w.suitability[info.phase];
              const sc = SUIT_COLORS[suit];
              const expanded = expandedWorkout === w.id;
              return (
                <motion.div
                  key={w.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="card-warm overflow-hidden"
                >
                  <div
                    className="p-5 cursor-pointer"
                    onClick={() => setExpandedWorkout(expanded ? null : w.id)}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <h3 className="font-display text-lg font-semibold text-foreground">{w.name}</h3>
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${sc.bg} ${sc.text}`}>{sc.label}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="rounded-full bg-muted px-2.5 py-1">{w.duration}</span>
                      <span className="rounded-full bg-muted px-2.5 py-1">{w.equipment}</span>
                      <span className="rounded-full bg-muted px-2.5 py-1">{CATEGORY_LABELS[w.category]}</span>
                    </div>
                    {w.description && <p className="text-xs text-muted-foreground mt-2">{w.description}</p>}
                  </div>
                  {expanded && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5 pb-5 border-t border-border pt-3 space-y-2">
                      {w.exercises.map((ex, j) => (
                        <div key={j} className="flex items-center justify-between bg-muted/40 rounded-lg p-2.5">
                          <div>
                            <p className="text-sm font-medium text-foreground">{ex.name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {ex.sets && `${ex.sets} sets`}{ex.reps && ` × ${ex.reps}`}{ex.duration && ` • ${ex.duration}`}
                            </p>
                          </div>
                          <p className="text-[10px] text-muted-foreground max-w-[140px] text-right">{ex.formCue}</p>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* LOG TAB */}
      {activeTab === "log" && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="card-warm p-4 text-center">
              <p className="text-2xl font-display font-semibold text-foreground">{totalCompleted}</p>
              <p className="text-xs text-muted-foreground">Workouts This Week</p>
            </div>
            <div className="card-warm p-4 text-center">
              <p className="text-2xl font-display font-semibold text-foreground">{totalMinutes}</p>
              <p className="text-xs text-muted-foreground">Minutes Moved</p>
            </div>
            <div className="card-warm p-4 text-center">
              <p className="text-2xl font-display font-semibold text-foreground">{totalCompleted > 0 ? Math.round((totalCompleted / 7) * 100) : 0}%</p>
              <p className="text-xs text-muted-foreground">Consistency</p>
            </div>
          </div>

          {/* Week calendar */}
          <div className="flex gap-2">
            {weekDays.map((date, i) => {
              const dateStr = date.toISOString().split("T")[0];
              const isToday = dateStr === todayStr;
              const logged = getLoggedWorkouts(dateStr);
              const workoutNames = logged.map((id) => WORKOUTS.find((w) => w.id === id)?.name || id);

              return (
                <div
                  key={i}
                  className={`flex-1 rounded-xl p-3 text-center ${
                    isToday ? "card-warm ring-2 ring-accent/40" : "bg-muted/50 rounded-xl"
                  }`}
                >
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
                  </p>
                  <p className="text-sm font-medium text-foreground mt-0.5">{date.getDate()}</p>
                  {logged.length > 0 ? (
                    <Dumbbell className="h-3 w-3 text-accent mx-auto mt-1" />
                  ) : (
                    <div className="h-3 mt-1" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
