import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronRight, ChevronDown, Loader2, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ExerciseDemonstration from "@/components/ExerciseDemonstration";
import { haptic } from "@/hooks/use-mobile";
import { useGatedExpand } from "@/hooks/useGatedExpand";
import QuickWorkoutSession, { getExercisePrescription } from "@/components/movement/QuickWorkoutSession";

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

  const filteredWorkouts = useMemo(() => {
    if (filter === "all") return QUICK_WORKOUTS;
    return QUICK_WORKOUTS.filter(w => w.bodyFilter === filter);
  }, [filter]);

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
    if (!guardExpand()) return;
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
        <div className="space-y-1.5">
          {filtered.length === 0 && (
            <p className="py-8 text-center font-body text-sm text-muted-foreground">No exercises found.</p>
          )}
          {filtered.slice(0, 50).map((ex, i) => (
            <motion.div
              key={ex.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.02, 0.5) }}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-2.5 transition-colors hover:bg-card/80"
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
            </motion.div>
          ))}
          {filtered.length > 50 && (
            <p className="py-4 text-center font-body text-xs text-muted-foreground">
              Showing 50 of {filtered.length} exercises. Use search to narrow results.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredWorkouts.map((w, i) => {
            const expanded = expandedWorkout === w.id;
            const wExercises = workoutExercises[w.id] || [];
            return (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="overflow-hidden rounded-xl border border-border bg-card"
              >
                <button
                  onClick={() => handleExpandWorkout(w)}
                  className="flex w-full items-center gap-3 p-4 text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-sm font-bold text-foreground">{w.title}</h3>
                      <span className={`font-body text-[9px] uppercase tracking-wider ${INTENSITY_COLORS[w.intensity]}`}>
                        {w.intensity}
                      </span>
                    </div>
                    <p className="mt-0.5 font-body text-xs text-muted-foreground">{w.description}</p>
                  </div>
                  <span className="shrink-0 font-body text-xs text-muted-foreground">{w.duration}</span>
                  <ChevronRight className={`h-4 w-4 shrink-0 text-muted-foreground/50 transition-transform ${expanded ? "rotate-90" : ""}`} />
                </button>
                {expanded && (
                  <div className="border-t border-border px-4 pb-4 pt-3 space-y-3">
                    {wExercises.length === 0 ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      </div>
                    ) : (
                      <>
                        <div className="space-y-1.5">
                          {wExercises.map(ex => {
                            const rx = getExercisePrescription(w.intensity, ex.category);
                            return (
                              <div key={ex.id} className="flex items-center gap-2.5 rounded-xl bg-secondary/50 p-2">
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

                        {/* Start Workout button */}
                        <button
                          onClick={() => {
                            haptic("medium");
                            setActiveSession({ workout: w, exercises: wExercises });
                          }}
                          className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-primary-foreground font-body text-sm font-semibold transition-colors hover:bg-primary/90"
                        >
                          <Play className="h-4 w-4" />
                          Start Workout
                        </button>
                      </>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
