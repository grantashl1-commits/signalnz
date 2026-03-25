import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, X, ChevronDown } from "lucide-react";
import { WildStar } from "@/components/BotanicalElements";
import { GatedPage } from "@/components/FeatureGate";
import { SelfCareHandIcon } from "@/components/SelfCareIcons";
import HabitLibraryPicker from "@/components/HabitLibraryPicker";
import {
  getHabits, addHabit, removeHabit,
  getHabitLog, toggleHabitForDate,
  HABIT_CATEGORIES, PHASE_RITUAL_SUGGESTIONS,
  SELF_CARE_RITUALS,
  type Habit, type HabitCategory,
} from "@/data/self-care-rituals";
import { useCycle } from "@/contexts/CycleContext";
import { haptic } from "@/hooks/use-mobile";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.45, ease: "easeOut" as const },
});

export default function PracticePage() {
  const { currentPhase, currentCycleDay } = useCycle();
  const info = { phase: currentPhase, cycleDay: currentCycleDay };
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
    toggleHabitForDate(todayStr, habitId);
    setTodayLog(prev => ({ ...prev, [habitId]: !prev[habitId] }));
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

  const mapCategory = (cat: string): string => {
    if (cat === "wellness" || cat === "mindset" || cat === "custom") return "self-care";
    return cat;
  };

  const filtered = activeCategory === "all"
    ? habits
    : habits.filter(h => mapCategory(h.category) === activeCategory);

  const completedToday = Object.values(todayLog).filter(Boolean).length;
  const totalHabits = habits.length;
  const phaseSuggestions = PHASE_RITUAL_SUGGESTIONS[info.phase];

  return (
    <GatedPage requiredTier="thriving">
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-8 md:py-12">

        {/* ═══ PAGE HEADER ═══ */}
        <motion.div {...fadeUp(0)} className="mb-10 md:mb-14">
          <h1 className="font-display text-4xl md:text-5xl font-extrabold text-foreground leading-tight">
            My Practice
          </h1>
          <p className="font-body text-base md:text-lg text-muted-foreground mt-3 max-w-md">
            Build rituals that honour your cycle.
          </p>
        </motion.div>

        {/* ═══ PROGRESS CARD ═══ */}
        <motion.div
          {...fadeUp(0.1)}
          className="rounded-[22px] bg-card p-7 md:p-8 shadow-soft mb-10 md:mb-14 max-w-md"
          style={{ backgroundColor: "hsl(var(--card))", color: "hsl(var(--card-foreground))" }}
        >
          <p className="font-body text-sm uppercase tracking-[0.15em] mb-2" style={{ color: "hsl(var(--muted-foreground))" }}>
            Today
          </p>
          <div className="flex items-baseline gap-2">
            <AnimatePresence mode="wait">
              <motion.span
                key={completedToday}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="font-display text-4xl md:text-5xl font-extrabold inline-block"
                style={{ color: "hsl(var(--foreground))" }}
              >
                {completedToday}
              </motion.span>
            </AnimatePresence>
            <span className="font-body text-lg" style={{ color: "hsl(var(--muted-foreground))" }}>
              / {totalHabits} complete
            </span>
          </div>
          {completedToday > 0 && completedToday === totalHabits && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-3 space-y-2"
            >
              <p className="font-body text-sm text-primary flex items-center gap-1.5">
                <WildStar size={14} /> All habits complete! 🌿
              </p>
              {/* Confetti burst */}
              <div className="flex justify-center gap-1 relative h-6">
                {["🌿", "✨", "🌸", "💜", "🌱"].map((emoji, i) => (
                  <motion.span
                    key={i}
                    initial={{ scale: 0, y: 0, rotate: 0 }}
                    animate={{
                      scale: [0, 1.3, 0],
                      y: [0, -20 - i * 5, -40],
                      x: [(i - 2) * 8, (i - 2) * 20],
                      rotate: [0, (i - 2) * 40],
                    }}
                    transition={{ duration: 1.2, delay: i * 0.08, ease: "easeOut" }}
                    className="text-lg absolute"
                  >
                    {emoji}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* ═══ CATEGORY FILTERS ═══ */}
        <motion.div {...fadeUp(0.15)} className="flex flex-wrap gap-3 mb-8 md:mb-10">
          {[{ id: "all" as const, label: "All" }, ...HABIT_CATEGORIES].map(cat => {
            const active = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as HabitCategory | "all")}
                className={`touch-btn rounded-full px-6 py-3 font-body text-sm font-medium transition-all shadow-soft ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-card hover:bg-card hover:text-foreground"
                }`}
                style={active
                  ? { backgroundColor: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }
                  : { backgroundColor: "hsl(var(--card))", color: "hsl(var(--muted-foreground))" }
                }
              >
                {cat.label}
              </button>
            );
          })}
        </motion.div>

        {/* ═══ MAIN CONTENT — TWO COLUMNS ON DESKTOP ═══ */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-10 md:gap-14">

          {/* LEFT COLUMN — Today's Habits */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Today's habits
              </h2>
            </div>

            {filtered.length === 0 && (
              <div className="rounded-[22px] bg-card p-10 text-center shadow-soft">
                <SelfCareHandIcon size={48} color="hsl(var(--muted-foreground))" />
                <p className="font-body text-base text-muted-foreground mt-4">
                  No habits yet. Add your first ritual to begin.
                </p>
              </div>
            )}

            <div className="space-y-3">
              {filtered.map((habit, i) => {
                const done = todayLog[habit.id] || false;
                const mappedCat = mapCategory(habit.category);
                const catInfo = HABIT_CATEGORIES.find(c => c.id === mappedCat);

                return (
                  <motion.div
                    key={habit.id}
                    {...fadeUp(0.05 + i * 0.04)}
                    className={`rounded-[18px] p-6 md:p-7 flex items-center gap-5 transition-all shadow-soft ${
                      done
                        ? "border border-primary/10"
                        : "border border-transparent"
                    }`}
                    style={{
                      backgroundColor: done ? "hsl(var(--primary) / 0.05)" : "hsl(var(--card))",
                      color: "hsl(var(--card-foreground))",
                    }}
                  >
                    <button
                      onClick={() => handleToggle(habit.id)}
                      className={`touch-btn flex-shrink-0 h-10 w-10 rounded-full border-2 flex items-center justify-center transition-all ${
                        done
                          ? "border-primary bg-primary/15"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      {done && <WildStar size={18} color="hsl(var(--primary))" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-display text-lg md:text-xl font-semibold leading-snug ${
                          done ? "line-through text-muted-foreground" : "text-foreground"
                        }`}
                      >
                        {habit.name}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className="font-body text-sm font-medium uppercase tracking-wide"
                          style={{ color: catInfo?.color }}
                        >
                          {catInfo?.label || "Habit"}
                        </span>
                        <span className="font-body text-sm text-muted-foreground">
                          · Daily
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(habit.id)}
                      className="touch-btn p-2 rounded-full hover:bg-secondary transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground/40" />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* RIGHT COLUMN — Add Habit + Phase Suggestions */}
          <div className="space-y-8">

            {/* Add habit button */}
            <motion.button
              {...fadeUp(0.2)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                haptic("light");
                setShowCategoryChooser(true);
              }}
              className="w-full rounded-[18px] bg-card p-6 shadow-soft flex items-center justify-center gap-3 text-foreground hover:shadow-medium transition-all"
            >
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Plus className="h-5 w-5 text-primary" />
              </div>
              <span className="font-display text-base font-semibold">Add a habit</span>
            </motion.button>

            {/* Phase-specific suggestions */}
            <motion.div
              {...fadeUp(0.25)}
              className="rounded-[22px] p-6 md:p-7 shadow-soft"
              style={{ backgroundColor: "hsl(var(--card))", color: "hsl(var(--card-foreground))" }}
            >
              <p className="font-body text-xs uppercase tracking-[0.2em] mb-2" style={{ color: "hsl(var(--muted-foreground))" }}>
                Suggested for you
              </p>
              <h3 className="font-display text-lg font-bold mb-5" style={{ color: "hsl(var(--foreground))" }}>
                Rituals for your {info.phase} phase
              </h3>

              <div className="space-y-4">
                {phaseSuggestions.map(suggestion => {
                  const ritual = SELF_CARE_RITUALS.find(r => r.id === suggestion.ritualId);
                  if (!ritual) return null;
                  const alreadyAdded = habits.some(h => h.name === ritual.name);

                  return (
                    <div key={suggestion.ritualId}>
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-body text-base font-medium text-foreground">
                          {ritual.name}
                        </span>
                        <button
                          onClick={() => !alreadyAdded && handleAddSuggestion(suggestion.ritualId)}
                          disabled={alreadyAdded}
                          className={`touch-btn rounded-full px-4 py-2 font-body text-xs font-medium transition-all flex-shrink-0 ${
                            alreadyAdded
                              ? "bg-primary/10 text-primary/50"
                              : "bg-primary/10 text-primary hover:bg-primary/20"
                          }`}
                        >
                          {alreadyAdded ? "Added" : "Add"}
                        </button>
                      </div>
                      <button
                        onClick={() =>
                          setExpandedReason(
                            expandedReason === suggestion.ritualId ? null : suggestion.ritualId
                          )
                        }
                        className="flex items-center gap-1 font-body text-xs text-muted-foreground mt-1.5 hover:text-foreground transition-colors"
                      >
                        Why now?
                        <ChevronDown
                          className={`h-3 w-3 transition-transform ${
                            expandedReason === suggestion.ritualId ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      <AnimatePresence>
                        {expandedReason === suggestion.ritualId && (
                          <motion.p
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="font-body text-sm text-muted-foreground mt-2 overflow-hidden leading-relaxed"
                          >
                            {suggestion.reason}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>

        {/* ═══ CATEGORY CHOOSER SHEET ═══ */}
        <AnimatePresence>
          {showCategoryChooser && (
            <>
              <motion.div
                className="fixed inset-0 z-[60] bg-foreground/30"
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
                <div className="px-6 py-5 space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-xl font-bold text-foreground">
                      Add a habit
                    </h3>
                    <button
                      onClick={() => setShowCategoryChooser(false)}
                      className="touch-btn p-2.5 rounded-full bg-secondary"
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                  <p className="font-body text-sm text-muted-foreground">
                    Choose a category
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {HABIT_CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setShowCategoryChooser(false);
                          openPicker(cat.id);
                        }}
                        className="touch-btn rounded-[16px] p-5 text-center transition-all border border-border bg-card shadow-soft hover:shadow-medium hover:border-primary/20"
                      >
                        <span className="font-display text-base font-semibold text-foreground">
                          {cat.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Library picker */}
        <HabitLibraryPicker
          open={showLibraryPicker}
          category={libraryPickerCategory}
          onClose={() => setShowLibraryPicker(false)}
          onAdded={refreshHabits}
        />
      </div>
    </GatedPage>
  );
}
