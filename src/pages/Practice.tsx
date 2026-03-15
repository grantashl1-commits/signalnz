import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, X } from "lucide-react";
import { SeedGeometry, BotanicalSprig, WildStar } from "@/components/BotanicalElements";
import { GatedPage } from "@/components/FeatureGate";
import { SelfCareHandIcon } from "@/components/SelfCareIcons";
import HabitLibraryPicker from "@/components/HabitLibraryPicker";
import {
  getHabits, addHabit, removeHabit,
  getHabitLog, toggleHabitForDate, getWeekHabitData,
  HABIT_CATEGORIES, CATEGORY_DOT_CLASSES, PHASE_RITUAL_SUGGESTIONS,
  SELF_CARE_RITUALS,
  type Habit, type HabitCategory,
} from "@/data/self-care-rituals";
import { getCycleInfo, getLastPeriodStart, type Phase } from "@/lib/cycle-utils";
import { haptic } from "@/hooks/use-mobile";

const DEEP_VIOLET = "hsl(284, 22%, 44%)";

const cardVariant = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: 0.06 * i, duration: 0.3, ease: "easeOut" as const },
  }),
};

export default function PracticePage() {
  const info = getCycleInfo(getLastPeriodStart());
  const todayStr = new Date().toISOString().split("T")[0];
  const [habits, setHabits] = useState(getHabits());
  const [todayLog, setTodayLog] = useState(getHabitLog(todayStr));
  const [activeCategory, setActiveCategory] = useState<HabitCategory | "all">("all");
  const [showLibraryPicker, setShowLibraryPicker] = useState(false);
  const [showCategoryChooser, setShowCategoryChooser] = useState(false);
  const [libraryPickerCategory, setLibraryPickerCategory] = useState<HabitCategory>("self-care");
  const [expandedReason, setExpandedReason] = useState<string | null>(null);

  const refreshHabits = useCallback(() => {
    setHabits(getHabits());
    setTodayLog(getHabitLog(todayStr));
  }, [todayStr]);

  const handleToggle = (habitId: string) => {
    haptic("light");
    const newVal = toggleHabitForDate(todayStr, habitId);
    setTodayLog(prev => ({ ...prev, [habitId]: newVal }));
  };

  const handleDelete = (habitId: string) => {
    haptic("medium");
    removeHabit(habitId);
    refreshHabits();
  };

  const handleAddSuggestion = (ritualId: string) => {
    haptic("medium");
    const ritual = SELF_CARE_RITUALS.find(r => r.id === ritualId);
    if (!ritual) return;
    if (habits.some(h => h.name === ritual.name)) return;
    const habit: Habit = {
      id: `selfcare-${ritual.id}-${Date.now()}`,
      name: ritual.name,
      category: "self-care",
      duration: ritual.suggestedDuration,
      timing: ritual.timing,
      notes: ritual.notesPlaceholder,
      createdAt: new Date().toISOString(),
    };
    addHabit(habit);
    refreshHabits();
  };

  const openPicker = (category: HabitCategory) => {
    setLibraryPickerCategory(category);
    setShowLibraryPicker(true);
  };

  // Map legacy categories to the 4 main ones for filtering
  const mapCategory = (cat: string): string => {
    if (cat === "wellness" || cat === "mindset" || cat === "custom") return "self-care";
    return cat;
  };

  const filtered = activeCategory === "all"
    ? habits
    : habits.filter(h => mapCategory(h.category) === activeCategory);

  const completedToday = Object.values(todayLog).filter(Boolean).length;
  const totalHabits = habits.length;

  // Week data for grid
  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + mondayOffset + i);
    return d;
  });
  const weekData = getWeekHabitData(weekDays);

  const phaseSuggestions = PHASE_RITUAL_SUGGESTIONS[info.phase];

  return (
    <GatedPage requiredTier="thriving">
    <div className="max-w-3xl mx-auto space-y-8 md:space-y-10 relative">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -translate-y-6 translate-x-6 pointer-events-none">
        <SeedGeometry size={130} opacity={0.06} className="md:hidden" />
        <SeedGeometry size={200} opacity={0.08} className="hidden md:block" />
      </div>

      {/* Header */}
      <div>
        <p className="font-hand text-sm font-bold text-primary">daily practice</p>
        <h1 className="font-display text-[1.75rem] md:text-4xl font-bold italic text-foreground">My Practice</h1>
        <p className="font-display text-sm italic text-muted-foreground mt-1">
          Build rituals that honour your cycle.
        </p>
        <BotanicalSprig width={180} className="mt-3 mx-auto md:hidden" />
        <BotanicalSprig width={250} className="mt-3 mx-auto hidden md:block" />
      </div>

      {/* Today's progress */}
      <div className="card-warm p-5">
        <p className="font-hand text-sm font-bold text-primary">Today</p>
        <div className="flex items-end gap-3 mt-1">
          <span className="font-mono text-3xl text-foreground">{completedToday}</span>
          <span className="font-mono text-sm text-muted-foreground mb-1">/ {totalHabits} complete</span>
        </div>
        {completedToday > 0 && completedToday === totalHabits && (
          <p className="font-hand text-sm text-bloom mt-2 flex items-center gap-1">
            <WildStar size={14} /> All rituals complete today.
          </p>
        )}
      </div>

      {/* Category chips — deep violet when selected */}
      <div className="scroll-snap-x flex gap-2 pb-1 -mx-1 px-1">
        <button
          onClick={() => setActiveCategory("all")}
          className={`scroll-snap-item touch-btn rounded-full px-3 py-1.5 font-hand text-xs font-bold whitespace-nowrap transition-all ${
            activeCategory === "all" ? "text-primary-foreground" : "bg-secondary text-muted-foreground"
          }`}
          style={activeCategory === "all" ? { backgroundColor: DEEP_VIOLET, color: "hsl(30, 33%, 98%)" } : undefined}
        >All</button>
        {HABIT_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`scroll-snap-item touch-btn rounded-full px-3 py-1.5 font-hand text-xs font-bold whitespace-nowrap transition-all ${
              activeCategory === cat.id ? "text-primary-foreground" : "bg-secondary text-muted-foreground"
            }`}
            style={activeCategory === cat.id ? { backgroundColor: DEEP_VIOLET, color: "hsl(30, 33%, 98%)" } : undefined}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Phase suggestions for self care */}
      {(activeCategory === "all" || activeCategory === "self-care") && (
        <section className="card-warm p-4">
          <p className="font-hand text-sm font-bold" style={{ color: "hsl(var(--bloom-blush))" }}>
            Rituals for your {info.phase} phase.
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {phaseSuggestions.map(suggestion => {
              const ritual = SELF_CARE_RITUALS.find(r => r.id === suggestion.ritualId);
              if (!ritual) return null;
              const alreadyAdded = habits.some(h => h.name === ritual.name);
              return (
                <div key={suggestion.ritualId} className="flex flex-col">
                  <button
                    onClick={() => !alreadyAdded && handleAddSuggestion(suggestion.ritualId)}
                    disabled={alreadyAdded}
                    className={`touch-btn rounded-full px-3 py-1.5 font-hand text-xs font-bold transition-all ${
                      alreadyAdded
                        ? "bg-bloom/20 text-bloom/60"
                        : "bg-bloom/15 text-bloom active:bg-bloom/30"
                    }`}
                  >
                    {alreadyAdded ? "✓ " : "+ "}{ritual.name}
                  </button>
                  <button
                    onClick={() => setExpandedReason(expandedReason === suggestion.ritualId ? null : suggestion.ritualId)}
                    className="font-body text-[10px] text-muted-foreground mt-0.5 ml-1 text-left"
                  >
                    why now?
                  </button>
                  <AnimatePresence>
                    {expandedReason === suggestion.ritualId && (
                      <motion.p
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="font-display text-xs italic text-muted-foreground mt-1 overflow-hidden"
                      >
                        {suggestion.reason}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Today's habits checklist */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <p className="font-hand text-sm font-bold text-primary">Today's habits</p>
          <button
            onClick={() => {
              haptic("light");
              setShowCategoryChooser(true);
            }}
            className="touch-btn flex items-center gap-1 rounded-full bg-secondary px-3 py-1.5 font-hand text-xs font-bold text-muted-foreground"
          >
            <Plus className="h-3 w-3" /> Add habit
          </button>
        </div>

        {filtered.length === 0 && (
          <div className="card-warm p-6 text-center">
            <SelfCareHandIcon size={40} color="#8B6F5E" />
            <p className="font-display text-sm italic text-muted-foreground mt-3">
              No habits yet. Add your first ritual to begin.
            </p>
          </div>
        )}

        <div className="space-y-2">
          {filtered.map((habit, i) => {
            const done = todayLog[habit.id] || false;
            const mappedCat = mapCategory(habit.category);
            const catInfo = HABIT_CATEGORIES.find(c => c.id === mappedCat);
            return (
              <motion.div
                key={habit.id}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={cardVariant}
                className={`frequency-panel flex items-center gap-3 p-3.5 transition-all ${
                  done ? "opacity-70" : ""
                }`}
                style={{ "--panel-color": catInfo?.color || "hsl(var(--bloom-blush))" } as React.CSSProperties}
              >
                <button
                  onClick={() => handleToggle(habit.id)}
                  className={`touch-btn flex-shrink-0 h-7 w-7 rounded-full border-2 flex items-center justify-center transition-all ${
                    done ? "border-bloom bg-bloom/20" : "border-border"
                  }`}
                >
                  {done && <WildStar size={14} />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`font-body text-sm font-medium ${done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {habit.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-hand text-[10px] font-bold" style={{ color: catInfo?.color }}>
                      {catInfo?.label}
                    </span>
                    {habit.duration && (
                      <span className="font-mono text-[9px] text-muted-foreground">{habit.duration}</span>
                    )}
                  </div>
                </div>
                <button onClick={() => handleDelete(habit.id)} className="touch-btn p-1.5 rounded-full">
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground/40" />
                </button>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Weekly habit grid */}
      {habits.length > 0 && (
        <section>
          <p className="font-hand text-sm font-bold text-primary mb-3">This week</p>
          <div className="card-warm p-4 overflow-x-auto">
            <div className="grid gap-1" style={{ gridTemplateColumns: `120px repeat(7, 1fr)`, minWidth: 400 }}>
              {/* Header row */}
              <div />
              {weekDays.map((d, i) => {
                const isToday = d.toISOString().split("T")[0] === todayStr;
                return (
                  <div key={i} className={`text-center py-1 ${isToday ? "bg-primary/10 rounded-lg" : ""}`}>
                    <p className="font-body text-[9px] text-muted-foreground">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
                    </p>
                    <p className="font-mono text-[10px] text-foreground">{d.getDate()}</p>
                  </div>
                );
              })}

              {/* Habit rows */}
              {habits.map(habit => {
                const mappedCat = mapCategory(habit.category);
                const dotClass = CATEGORY_DOT_CLASSES[mappedCat] || CATEGORY_DOT_CLASSES[habit.category] || "bg-bloom";
                return (
                  <div key={habit.id} className="contents">
                    <div className="flex items-center gap-1.5 pr-2 py-1.5">
                      <div className={`h-2 w-2 rounded-full flex-shrink-0 ${dotClass}`} />
                      <span className="font-body text-[10px] text-foreground truncate">{habit.name}</span>
                    </div>
                    {weekData.map((day, i) => {
                      const done = day.log[habit.id] || false;
                      const isToday = day.date === todayStr;
                      return (
                        <div
                          key={i}
                          className={`flex items-center justify-center py-1.5 ${isToday ? "bg-primary/10 rounded-lg" : ""}`}
                        >
                          {done ? (
                            <div className={`h-3 w-3 rounded-full ${dotClass}`} />
                          ) : (
                            <div className="h-3 w-3 rounded-full border border-border/50" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Category chooser sheet */}
      <AnimatePresence>
        {showCategoryChooser && (
          <>
            <motion.div
              className="fixed inset-0 z-[60] bg-foreground/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCategoryChooser(false)}
            />
            <motion.div
              className="bottom-sheet z-[61]"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              <div className="bottom-sheet-handle" />
              <div className="px-5 py-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg italic font-bold text-foreground">Add a habit.</h3>
                  <button onClick={() => setShowCategoryChooser(false)} className="touch-btn p-2 rounded-full bg-secondary">
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
                <p className="font-hand text-xs font-bold text-muted-foreground">Choose a category</p>
                <div className="grid grid-cols-2 gap-3">
                  {HABIT_CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setShowCategoryChooser(false);
                        openPicker(cat.id);
                      }}
                      className="touch-btn rounded-[14px] p-4 text-center transition-all border border-border bg-card shadow-sm active:shadow-md active:border-primary/30"
                    >
                      <span className="font-hand text-sm font-bold text-foreground">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Library picker for all categories */}
      <HabitLibraryPicker
        open={showLibraryPicker}
        category={libraryPickerCategory}
        onClose={() => setShowLibraryPicker(false)}
        onAdded={refreshHabits}
      />
    </div>
  );
}
