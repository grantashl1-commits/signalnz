import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronRight, ChevronDown, Loader2, Play, BookOpen, Dumbbell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ExerciseDemonstration from "@/components/ExerciseDemonstration";
import { haptic } from "@/hooks/use-mobile";
import { useGatedExpand } from "@/hooks/useGatedExpand";
import QuickWorkoutSession, { getExercisePrescription } from "@/components/movement/QuickWorkoutSession";
import { STACY_SIMS_WORKOUTS } from "@/data/stacy-sims-workouts";
import type { Workout } from "@/data/workouts";
import { getAllPathExercises } from "@/lib/training-path-utils";

type BodyFilter = "all" | "full-body" | "upper" | "lower" | "rehabilitation";

const UPPER_PARTS = new Set(["chest", "shoulders", "biceps", "triceps", "lats", "middle back", "traps", "forearms", "neck"]);
const LOWER_PARTS = new Set(["quadriceps", "hamstrings", "glutes", "calves", "abductors", "adductors", "hip flexors"]);

interface DBExercise {
  id: string;
  name: string;
  body_part: string | null;
  target: string | null;
  category: string | null;
  difficulty: number | null;
  illustration_url: string | null;
  instructions: string | null;
  cues: string[] | null;
  equipment: string[] | null;
  primary_muscles: string[] | null;
}

interface QuickWorkout {
  id: string;
  title: string;
  description: string;
  duration: string;
  intensity: "low" | "moderate" | "high";
  bodyFilter: BodyFilter;
  exerciseFilters: { bodyParts?: string[]; categories?: string[]; limit: number };
}

const QUICK_WORKOUTS: QuickWorkout[] = [
  { id: "fb-strength-mod", title: "Full Body Strength", description: "Compound movements hitting every major group", duration: "40 min", intensity: "moderate", bodyFilter: "full-body", exerciseFilters: { categories: ["strength"], limit: 8 } },
  { id: "fb-hiit", title: "Full Body HIIT", description: "High intensity circuit with minimal rest", duration: "25 min", intensity: "high", bodyFilter: "full-body", exerciseFilters: { categories: ["power", "cardio", "strength"], limit: 8 } },
  { id: "fb-gentle", title: "Full Body Gentle", description: "Low impact movement for recovery days", duration: "30 min", intensity: "low", bodyFilter: "full-body", exerciseFilters: { categories: ["mobility", "stretch", "yoga"], limit: 8 } },
  { id: "upper-push", title: "Upper Body Push", description: "Chest, shoulders and triceps focus", duration: "35 min", intensity: "moderate", bodyFilter: "upper", exerciseFilters: { bodyParts: ["chest", "shoulders", "triceps"], categories: ["strength"], limit: 8 } },
  { id: "upper-pull", title: "Upper Body Pull", description: "Back, biceps and rear delts", duration: "35 min", intensity: "moderate", bodyFilter: "upper", exerciseFilters: { bodyParts: ["lats", "middle back", "biceps", "traps"], categories: ["strength"], limit: 8 } },
  { id: "upper-light", title: "Upper Body Light", description: "Gentle upper body mobility and toning", duration: "25 min", intensity: "low", bodyFilter: "upper", exerciseFilters: { bodyParts: ["chest", "shoulders", "lats", "middle back"], categories: ["mobility", "stretch", "pilates"], limit: 8 } },
  { id: "lower-strength", title: "Lower Body Strength", description: "Squats, lunges and hip work", duration: "40 min", intensity: "moderate", bodyFilter: "lower", exerciseFilters: { bodyParts: ["quadriceps", "hamstrings", "glutes", "calves"], categories: ["strength"], limit: 8 } },
  { id: "lower-power", title: "Lower Body Power", description: "Explosive leg training", duration: "30 min", intensity: "high", bodyFilter: "lower", exerciseFilters: { bodyParts: ["quadriceps", "glutes", "hamstrings", "calves"], categories: ["power", "strength"], limit: 8 } },
  { id: "lower-mobility", title: "Lower Body Mobility", description: "Hip openers, ankle work and stretching", duration: "25 min", intensity: "low", bodyFilter: "lower", exerciseFilters: { bodyParts: ["quadriceps", "hamstrings", "glutes", "adductors", "calves"], categories: ["mobility", "stretch"], limit: 8 } },
  { id: "rehab-upper", title: "Upper Body Rehab", description: "Shoulder, neck and chest rehabilitation", duration: "20 min", intensity: "low", bodyFilter: "rehabilitation", exerciseFilters: { bodyParts: ["shoulders", "neck", "chest"], categories: ["rehabilitation"], limit: 8 } },
  { id: "rehab-lower", title: "Lower Body Rehab", description: "Knee, hip and ankle physiotherapy", duration: "20 min", intensity: "low", bodyFilter: "rehabilitation", exerciseFilters: { bodyParts: ["quadriceps", "hamstrings", "glutes", "calves", "adductors"], categories: ["rehabilitation"], limit: 8 } },
  { id: "rehab-back", title: "Back & Core Rehab", description: "Spinal stability and core activation", duration: "20 min", intensity: "low", bodyFilter: "rehabilitation", exerciseFilters: { bodyParts: ["lower back", "abdominals"], categories: ["rehabilitation"], limit: 8 } },
];

// Tag each Stacy Sims workout with the body region it primarily targets so
// the "All / Upper / Lower / Full Body / Rehabilitation" filter works on them.
const SS_BODY_FILTER: Record<string, BodyFilter> = {
  "ss-sit-protocols": "full-body",
  "ss-pelvic-floor": "rehabilitation",
  "ss-heavy-lifting": "full-body",
  "ss-plyo-beginner": "lower",
  "ss-plyo-intermediate": "lower",
  "ss-plyo-advanced": "lower",
  "ss-foam-rolling": "rehabilitation",
  "ss-mobility": "rehabilitation",
  "ss-core-stability": "full-body",
  "ss-pep-plan": "rehabilitation",
  "ss-roar-foam-rolling": "rehabilitation",
  "ss-roar-bw-power": "full-body",
  "ss-roar-plyo-power": "lower",
  "ss-roar-mb-power": "full-body",
  "ss-roar-kb-power": "full-body",
  "ss-hiit-protocol": "full-body",
  "ss-sit-roar": "full-body",
};

const INTENSITY_COLORS: Record<string, string> = {
  low: "text-emerald-500",
  moderate: "text-amber-500",
  high: "text-rose-500",
};

export default function LibraryTab() {
  const [filter, setFilter] = useState<BodyFilter>("all");
  const [search, setSearch] = useState("");
  const [exercises, setExercises] = useState<DBExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"exercises" | "workouts">("exercises");
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);
  const [expandedSSId, setExpandedSSId] = useState<string | null>(null);
  const [workoutExercises, setWorkoutExercises] = useState<Record<string, DBExercise[]>>({});
  const [activeSession, setActiveSession] = useState<{ workout: QuickWorkout; exercises: DBExercise[] } | null>(null);
  const { guard: guardExpand } = useGatedExpand("movement_browse");

  useEffect(() => {
    const fetchExercises = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("exercises")
        .select("id, name, body_part, target, category, difficulty, illustration_url, instructions, cues, equipment, primary_muscles")
        .order("name");
      if (data) setExercises(data as unknown as DBExercise[]);
      setLoading(false);
    };
    fetchExercises();
  }, []);

  const filtered = useMemo(() => {
    let result = exercises;

    if (filter === "upper") {
      result = result.filter(e => e.body_part && UPPER_PARTS.has(e.body_part));
    } else if (filter === "lower") {
      result = result.filter(e => e.body_part && LOWER_PARTS.has(e.body_part));
    } else if (filter === "full-body") {
      result = result.filter(e => e.body_part === "full body" || (!UPPER_PARTS.has(e.body_part || "") && !LOWER_PARTS.has(e.body_part || "")));
    } else if (filter === "rehabilitation") {
      result = result.filter(e => e.category === "rehabilitation");
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(e =>
        e.name.toLowerCase().includes(q) ||
        e.target?.toLowerCase().includes(q) ||
        e.body_part?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [exercises, filter, search]);

  type UnifiedWorkout =
    | { kind: "quick"; data: QuickWorkout; bodyFilter: BodyFilter }
    | { kind: "ss"; data: Workout; bodyFilter: BodyFilter };

  const allWorkouts: UnifiedWorkout[] = useMemo(() => {
    const quick: UnifiedWorkout[] = QUICK_WORKOUTS.map(w => ({
      kind: "quick", data: w, bodyFilter: w.bodyFilter,
    }));
    const ss: UnifiedWorkout[] = STACY_SIMS_WORKOUTS.map(w => ({
      kind: "ss", data: w, bodyFilter: SS_BODY_FILTER[w.id] || "full-body",
    }));
    return [...quick, ...ss];
  }, []);

  const filteredWorkouts = useMemo(() => {
    if (filter === "all") return allWorkouts;
    return allWorkouts.filter(w => w.bodyFilter === filter);
  }, [filter, allWorkouts]);

  const loadWorkoutExercises = async (workout: QuickWorkout) => {
    if (workoutExercises[workout.id]) return;

    let query = supabase
      .from("exercises")
      .select("id, name, body_part, target, category, difficulty, illustration_url, instructions, cues, equipment, primary_muscles");

    if (workout.exerciseFilters.categories?.length) {
      query = query.in("category", workout.exerciseFilters.categories);
    }
    if (workout.exerciseFilters.bodyParts?.length) {
      query = query.in("body_part", workout.exerciseFilters.bodyParts);
    }

    const { data } = await query.limit(workout.exerciseFilters.limit);
    if (data) {
      setWorkoutExercises(prev => ({ ...prev, [workout.id]: data as unknown as DBExercise[] }));
    }
  };

  const handleExpandWorkout = async (workout: QuickWorkout) => {
    haptic("light");
    if (expandedWorkout === workout.id) {
      setExpandedWorkout(null);
      return;
    }
    setExpandedWorkout(workout.id);
    await loadWorkoutExercises(workout);
  };

  const FILTERS: { id: BodyFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "full-body", label: "Full Body" },
    { id: "upper", label: "Upper Body" },
    { id: "lower", label: "Lower Body" },
    { id: "rehabilitation", label: "Rehabilitation" },
  ];

  // If a workout session is active, show the session view
  if (activeSession) {
    return (
      <QuickWorkoutSession
        title={activeSession.workout.title}
        duration={activeSession.workout.duration}
        intensity={activeSession.workout.intensity}
        exercises={activeSession.exercises}
        onBack={() => setActiveSession(null)}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search exercises..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
        />
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => { haptic("light"); setFilter(f.id); }}
            className={`shrink-0 rounded-full px-3.5 py-2 font-body text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              filter === f.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex gap-1 bg-secondary rounded-lg p-0.5">
        <button
          onClick={() => setView("exercises")}
          className={`flex-1 rounded-md py-1.5 font-body text-xs font-medium transition-all ${
            view === "exercises" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
          }`}
        >
          Exercises ({filtered.length})
        </button>
        <button
          onClick={() => setView("workouts")}
          className={`flex-1 rounded-md py-1.5 font-body text-xs font-medium transition-all ${
            view === "workouts" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
          }`}
        >
          Quick Workouts ({filteredWorkouts.length})
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      ) : view === "exercises" ? (
        <div className="space-y-5">
          {/* From your training paths — every unique exercise across all SIGNAL paths */}
          {filter === "all" && !search.trim() && <PathExercisesSection />}

          <div className="space-y-1.5">
          {filtered.length === 0 && (
            <p className="py-8 text-center font-body text-sm text-muted-foreground">No exercises found.</p>
          )}
          {filtered.slice(0, 50).map((ex, i) => {
            const isExpanded = expandedExerciseId === ex.id;
            return (
              <motion.div
                key={ex.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.5) }}
                className="overflow-hidden rounded-xl border border-border bg-card transition-colors hover:bg-card/80"
              >
                <button
                  onClick={() => {
                    haptic("light");
                    setExpandedExerciseId(isExpanded ? null : ex.id);
                  }}
                  className="flex w-full items-center gap-3 p-2.5 text-left"
                >
                  <ExerciseDemonstration
                    exerciseName={ex.name}
                    imageUrl={ex.illustration_url}
                    size={48}
                    className="shrink-0 rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm font-medium text-foreground truncate">{ex.name}</p>
                    <div className="mt-0.5 flex items-center gap-2">
                      {ex.target && (
                        <span className="font-body text-[9px] uppercase tracking-wider text-primary">{ex.target}</span>
                      )}
                      {ex.category && (
                        <span className={`font-body text-[9px] uppercase tracking-wider ${
                          ex.category === "rehabilitation" ? "text-emerald-500" : "text-muted-foreground"
                        }`}>{ex.category}</span>
                      )}
                      {ex.difficulty && (
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, d) => (
                            <div key={d} className={`h-1 w-1 rounded-full ${d < ex.difficulty! ? "bg-primary" : "bg-border"}`} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground/50 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-border px-3 pb-3 pt-3 space-y-2.5">
                        {ex.equipment && ex.equipment.length > 0 && (
                          <div>
                            <p className="font-body text-[9px] uppercase tracking-wider text-muted-foreground mb-1">Equipment</p>
                            <div className="flex flex-wrap gap-1">
                              {ex.equipment.map((eq, idx) => (
                                <span key={idx} className="rounded-full bg-secondary px-2 py-0.5 font-body text-[10px] text-foreground">
                                  {eq.replace(/_/g, " ")}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {ex.primary_muscles && ex.primary_muscles.length > 0 && (
                          <div>
                            <p className="font-body text-[9px] uppercase tracking-wider text-muted-foreground mb-1">Primary muscles</p>
                            <div className="flex flex-wrap gap-1">
                              {ex.primary_muscles.map((m, idx) => (
                                <span key={idx} className="rounded-full bg-primary/10 px-2 py-0.5 font-body text-[10px] text-primary">
                                  {m.replace(/_/g, " ")}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {ex.instructions && (
                          <div>
                            <p className="font-body text-[9px] uppercase tracking-wider text-muted-foreground mb-1">Instructions</p>
                            <p className="font-body text-xs text-foreground/80 leading-relaxed whitespace-pre-line">
                              {ex.instructions}
                            </p>
                          </div>
                        )}

                        {ex.cues && ex.cues.length > 0 && (
                          <div>
                            <p className="font-body text-[9px] uppercase tracking-wider text-muted-foreground mb-1">Form cues</p>
                            <ul className="space-y-1">
                              {ex.cues.map((c, idx) => (
                                <li key={idx} className="flex gap-1.5 font-body text-xs text-foreground/80">
                                  <span className="text-primary">•</span>
                                  <span>{c}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {!ex.instructions && (!ex.cues || ex.cues.length === 0) && (
                          <p className="font-body text-xs text-muted-foreground italic">
                            No detailed instructions available for this exercise.
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
          {filtered.length > 50 && (
            <p className="py-4 text-center font-body text-xs text-muted-foreground">
              Showing 50 of {filtered.length} exercises. Use search to narrow results.
            </p>
          )}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredWorkouts.length === 0 && (
            <p className="py-8 text-center font-body text-sm text-muted-foreground">
              Nothing here in this category yet.
            </p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredWorkouts.map((uw, i) => {
              const isQuick = uw.kind === "quick";
              const id = isQuick ? uw.data.id : uw.data.id;
              const title = isQuick ? uw.data.title : uw.data.name;
              const description = isQuick ? uw.data.description : uw.data.description;
              const duration = isQuick ? uw.data.duration : uw.data.duration;
              const intensity = isQuick
                ? uw.data.intensity
                : uw.data.category === "walk-restore" ? "low" : "moderate";
              const expanded = isQuick
                ? expandedWorkout === id
                : expandedSSId === id;
              const wExercises = isQuick ? (workoutExercises[id] || []) : [];
              const isSource = !isQuick;

              return (
                <React.Fragment key={`${uw.kind}-${id}`}>
                  <motion.button
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.4) }}
                    onClick={() => {
                      haptic("light");
                      if (isQuick) {
                        handleExpandWorkout(uw.data);
                      } else {
                        setExpandedSSId(expanded ? null : id);
                      }
                    }}
                    className={`relative flex flex-col items-start text-left rounded-xl border p-3 min-h-[140px] transition-all hover:shadow-md ${
                      isSource
                        ? "border-primary/20 bg-primary/[0.04]"
                        : "border-border bg-card"
                    } ${expanded ? "ring-2 ring-primary/40" : ""}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      {isSource ? (
                        <BookOpen className="h-3 w-3 text-primary/70 shrink-0" />
                      ) : (
                        <Dumbbell className="h-3 w-3 text-primary/70 shrink-0" />
                      )}
                      <span className={`font-body text-[8px] uppercase tracking-wider font-bold ${INTENSITY_COLORS[intensity] || "text-muted-foreground"}`}>
                        {intensity}
                      </span>
                    </div>
                    <h3 className="font-display text-sm font-bold text-foreground leading-tight line-clamp-2">
                      {title}
                    </h3>
                    <p className="mt-1 font-body text-[10px] text-muted-foreground line-clamp-2 flex-1">
                      {description}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5 w-full">
                      <span className="font-body text-[10px] text-foreground/70">{duration}</span>
                      <span className="font-body text-[9px] uppercase tracking-wider text-muted-foreground/70 capitalize ml-auto">
                        {uw.bodyFilter.replace("-", " ")}
                      </span>
                      <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
                    </div>
                  </motion.button>

                  <AnimatePresence initial={false}>
                    {expanded && (
                      <motion.div
                        key={`exp-${uw.kind}-${id}`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="col-span-2 md:col-span-3 lg:col-span-4 overflow-hidden"
                      >
                        <div className={`rounded-xl border p-4 space-y-3 ${
                          isSource
                            ? "border-primary/20 bg-primary/[0.04]"
                            : "border-border bg-secondary/30"
                        }`}>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-display text-base font-bold text-foreground">{title}</h4>
                              <p className="font-body text-xs text-muted-foreground mt-0.5">{description}</p>
                            </div>
                            <span className="shrink-0 font-body text-xs text-muted-foreground">{duration}</span>
                          </div>

                          {isQuick && wExercises.length === 0 && (
                            <div className="flex items-center justify-center py-4">
                              <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            </div>
                          )}

                          {isQuick && wExercises.length > 0 && (
                            <>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                                {wExercises.map(ex => {
                                  const rx = getExercisePrescription(uw.data.intensity, ex.category);
                                  return (
                                    <div key={ex.id} className="flex items-center gap-2.5 rounded-xl bg-card p-2">
                                      <ExerciseDemonstration
                                        exerciseName={ex.name}
                                        imageUrl={ex.illustration_url}
                                        size={36}
                                        className="shrink-0 rounded-lg"
                                      />
                                      <div className="min-w-0 flex-1">
                                        <p className="truncate font-body text-sm text-foreground">{ex.name}</p>
                                        <div className="flex gap-2 mt-0.5">
                                          <span className="font-body text-[10px] text-primary font-medium">
                                            {rx.sets} × {rx.reps}
                                          </span>
                                          {rx.rest !== "—" && (
                                            <span className="font-body text-[10px] text-muted-foreground">Rest {rx.rest}</span>
                                          )}
                                        </div>
                                        {ex.target && (
                                          <span className="font-body text-[9px] text-muted-foreground">{ex.target}</span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                              <button
                                onClick={() => {
                                  haptic("medium");
                                  setActiveSession({ workout: uw.data, exercises: wExercises });
                                }}
                                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-primary-foreground font-body text-sm font-semibold transition-colors hover:bg-primary/90"
                              >
                                <Play className="h-4 w-4" />
                                Start Workout
                              </button>
                            </>
                          )}

                          {!isQuick && (
                            <>
                              <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                                <BookOpen className="h-3 w-3" />
                                <span className="font-hand">Source · Dr. Stacy Sims — ROAR & Next Level</span>
                              </div>
                              {uw.data.equipment && (
                                <p className="font-body text-[11px] text-muted-foreground">
                                  Equipment: <span className="text-foreground">{uw.data.equipment}</span>
                                </p>
                              )}
                              {uw.data.progressionNotes && uw.data.progressionNotes.length > 0 && (
                                <div>
                                  <p className="font-body text-[9px] uppercase tracking-wider text-muted-foreground mb-1">Progression</p>
                                  <ul className="space-y-1">
                                    {uw.data.progressionNotes.map((note, idx) => (
                                      <li key={idx} className="flex gap-1.5 font-body text-xs text-foreground/80">
                                        <span className="text-primary">•</span>
                                        <span>{note}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              <div>
                                <p className="font-body text-[9px] uppercase tracking-wider text-muted-foreground mb-1.5">Exercises</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {uw.data.exercises.map((ex, idx) => (
                                    <div key={idx} className="rounded-lg bg-card/80 p-2.5">
                                      <div className="flex items-baseline justify-between gap-2 flex-wrap">
                                        <p className="font-body text-sm font-medium text-foreground">{ex.name}</p>
                                        <span className="font-body text-[10px] text-primary font-medium">
                                          {[ex.sets && `${ex.sets} sets`, ex.reps, ex.duration].filter(Boolean).join(" · ")}
                                        </span>
                                      </div>
                                      {ex.section && (
                                        <p className="mt-0.5 font-body text-[9px] uppercase tracking-wider text-muted-foreground">{ex.section}</p>
                                      )}
                                      <p className="mt-1 font-body text-xs text-foreground/75 leading-relaxed">{ex.formCue}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/** Section listing every unique exercise that appears in any SIGNAL training path. */
function PathExercisesSection() {
  const [open, setOpen] = useState(false);
  const items = useMemo(() => getAllPathExercises(), []);
  const visible = open ? items : items.slice(0, 8);

  if (items.length === 0) return null;

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/[0.04] p-4 space-y-3">
      <div className="flex items-baseline justify-between gap-2">
        <div>
          <p className="font-hand text-xs uppercase tracking-[0.2em] text-primary">From your training paths</p>
          <h3 className="font-display text-sm font-bold text-foreground mt-0.5">
            Every move across the SIGNAL paths
          </h3>
        </div>
        <span className="font-body text-[10px] text-muted-foreground shrink-0">{items.length} moves</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {visible.map(({ name, paths }) => (
          <div key={name} className="flex items-center gap-2 rounded-lg bg-card border border-border/60 p-2">
            <ExerciseDemonstration exerciseName={name} size={36} className="shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-body text-[11px] font-semibold text-foreground truncate leading-tight">{name}</p>
              <p className="font-body text-[9px] text-muted-foreground truncate">{paths[0]}</p>
            </div>
          </div>
        ))}
      </div>
      {items.length > 8 && (
        <button
          onClick={() => { haptic("light"); setOpen(o => !o); }}
          className="w-full font-body text-[11px] text-primary hover:underline"
        >
          {open ? "Show less" : `Show all ${items.length}`}
        </button>
      )}
    </div>
  );
}

