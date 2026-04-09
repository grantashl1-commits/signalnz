import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, X, ChevronDown, Sun, Moon as MoonIcon, Sunset, Leaf, Pill, Salad, Zap, Sparkles, Landmark } from "lucide-react";
import { WildStar } from "@/components/BotanicalElements";
import { GatedPage } from "@/components/FeatureGate";
import { SelfCareHandIcon } from "@/components/SelfCareIcons";
import HabitLibraryPicker from "@/components/HabitLibraryPicker";
import SleepCard from "@/components/practice/SleepCard";
import {
  getHabits, addHabit, removeHabit,
  getHabitLog, toggleHabitForDate,
  HABIT_CATEGORIES,
  SELF_CARE_RITUALS,
  type Habit, type HabitCategory,
} from "@/data/self-care-rituals";
import { HABIT_LIBRARY, type HabitTiming } from "@/data/habit-library";
import { useCycle } from "@/contexts/CycleContext";
import { haptic } from "@/hooks/use-mobile";

const PHASE_COLORS: Record<string, string> = {
  menstrual: "#C4526E",
  follicular: "#5C4A9E",
  ovulatory: "#C47A8A",
  luteal: "#9B89B4",
};

const TIMING_SECTIONS: { key: HabitTiming; label: string; icon: typeof Sun }[] = [
  { key: "morning", label: "Morning", icon: Sun },
  { key: "afternoon", label: "Afternoon", icon: Sunset },
  { key: "evening", label: "Evening", icon: MoonIcon },
  { key: "anytime", label: "Anytime", icon: Leaf },
];

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.45, ease: "easeOut" as const },
});

export default function PracticePage() {
  const { currentPhase, currentCycleDay } = useCycle();
  const todayStr = new Date().toISOString().split("T")[0];
  const phaseColor = PHASE_COLORS[currentPhase] || PHASE_COLORS.follicular;

  const [habits, setHabits] = useState(getHabits());
  const [todayLog, setTodayLog] = useState(getHabitLog(todayStr));
  const [showLibraryPicker, setShowLibraryPicker] = useState(false);
  const [showCategoryChooser, setShowCategoryChooser] = useState(false);
  const [libraryPickerCategory, setLibraryPickerCategory] = useState<HabitCategory>("self-care");
  const [collapsedTiming, setCollapsedTiming] = useState<Set<HabitTiming>>(new Set());

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

  const openPicker = (category: HabitCategory) => {
    setLibraryPickerCategory(category);
    setShowLibraryPicker(true);
  };

  const toggleTimingCollapse = (timing: HabitTiming) => {
    setCollapsedTiming(prev => {
      const next = new Set(prev);
      next.has(timing) ? next.delete(timing) : next.add(timing);
      return next;
    });
  };

  const getHabitTiming = (habit: Habit): HabitTiming => {
    const libHabit = HABIT_LIBRARY.find(h => h.name === habit.name);
    if (libHabit?.timing) return libHabit.timing;
    const t = habit.timing?.toLowerCase() || "";
    if (t.includes("morning")) return "morning";
    if (t.includes("evening") || t.includes("night")) return "evening";
    if (t.includes("afternoon")) return "afternoon";
    return "anytime";
  };

  const completedToday = Object.values(todayLog).filter(Boolean).length;
  const totalHabits = habits.length;

  return (
    <GatedPage requiredTier="thriving">
      <div className="max-w-2xl mx-auto px-5 md:px-8 py-8 md:py-12">

        {/* ═══ PAGE HEADER ═══ */}
        <motion.div {...fadeUp(0)} className="mb-8">
          <h1 className="font-display text-4xl md:text-5xl font-extrabold text-foreground leading-tight">
            My Practice
          </h1>
          <p className="font-body text-base md:text-lg text-muted-foreground mt-3 max-w-md">
            Build rituals that honour your cycle.
          </p>
        </motion.div>

        {/* Sleep Card */}
        <motion.div {...fadeUp(0.05)} className="mb-6">
          <SleepCard phaseColor={phaseColor} />
        </motion.div>

        {/* Progress Summary */}
        <motion.div
          {...fadeUp(0.1)}
          className="rounded-[22px] bg-card p-6 shadow-soft mb-6"
        >
          <div className="flex items-baseline gap-2">
            <AnimatePresence mode="wait">
              <motion.span
                key={completedToday}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="font-display text-4xl font-extrabold text-foreground"
              >
                {completedToday}
              </motion.span>
            </AnimatePresence>
            <span className="font-body text-lg text-muted-foreground">/ {totalHabits} complete</span>
          </div>
          {completedToday > 0 && completedToday === totalHabits && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-body text-sm text-primary flex items-center gap-1.5 mt-2"
            >
              <WildStar size={14} /> All habits complete!
            </motion.p>
          )}
        </motion.div>

        {/* Add habit button */}
        <motion.button
          {...fadeUp(0.15)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCategoryChooser(true)}
          className="w-full rounded-[18px] bg-card p-5 shadow-soft flex items-center justify-center gap-3 text-foreground hover:shadow-medium transition-all mb-6"
        >
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
            <Plus className="h-5 w-5 text-primary" />
          </div>
          <span className="font-display text-base font-semibold">Add a habit</span>
        </motion.button>

        {/* ═══ HABITS BY TIME OF DAY ═══ */}
        <div className="space-y-6">
          {TIMING_SECTIONS.map(section => {
            const sectionHabits = habits.filter(h => getHabitTiming(h) === section.key);
            if (sectionHabits.length === 0) return null;
            const isCollapsed = collapsedTiming.has(section.key);
            const Icon = section.icon;

            return (
              <motion.div key={section.key} {...fadeUp(0.2)}>
                <button
                  onClick={() => toggleTimingCollapse(section.key)}
                  className="touch-btn flex items-center gap-2 mb-3 w-full text-left"
                >
                  <Icon className="h-4 w-4" style={{ color: phaseColor }} />
                  <h3 className="font-display text-lg font-bold text-foreground flex-1">
                    {section.label}
                  </h3>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isCollapsed ? "" : "rotate-180"}`} />
                </button>

                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-2 overflow-hidden"
                    >
                      {sectionHabits.map(habit => {
                        const done = todayLog[habit.id] || false;
                        const catInfo = HABIT_CATEGORIES.find(c => c.id === habit.category) ||
                          HABIT_CATEGORIES.find(c => c.id === "self-care");

                        return (
                          <motion.div
                            key={habit.id}
                            whileTap={{ scale: 1.02 }}
                            className={`rounded-[16px] p-5 flex items-center gap-4 shadow-soft transition-all ${
                              done ? "border border-primary/10" : "border border-transparent"
                            }`}
                            style={{
                              backgroundColor: done ? "hsl(284 30% 96%)" : "hsl(var(--card))",
                            }}
                          >
                            <button
                              onClick={() => handleToggle(habit.id)}
                              className={`touch-btn flex-shrink-0 h-9 w-9 rounded-full border-2 flex items-center justify-center transition-all ${
                                done ? "border-primary bg-primary/15" : "border-border hover:border-primary/40"
                              }`}
                            >
                              <AnimatePresence>
                                {done && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                  >
                                    <WildStar size={16} color="hsl(var(--primary))" />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </button>

                            <div className="flex-1 min-w-0">
                              <p className={`font-display text-base font-semibold leading-snug transition-all ${
                                done ? "line-through text-muted-foreground" : "text-foreground"
                              }`}>
                                {habit.name}
                              </p>
                              <span
                                className="font-body text-xs font-medium uppercase tracking-wide"
                                style={{ color: catInfo?.color }}
                              >
                                {catInfo?.label || "Habit"}
                              </span>
                            </div>

                            <button
                              onClick={() => handleDelete(habit.id)}
                              className="touch-btn p-1.5 rounded-full hover:bg-secondary"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-muted-foreground/40" />
                            </button>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}

          {/* No habits state */}
          {habits.length === 0 && (
            <div className="rounded-[22px] bg-card p-10 text-center shadow-soft">
              <SelfCareHandIcon size={48} color="hsl(var(--muted-foreground))" />
              <p className="font-body text-base text-muted-foreground mt-4">
                No habits yet. Add your first ritual to get started.
              </p>
            </div>
          )}
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
                    <h3 className="font-display text-xl font-bold text-foreground">Add a habit</h3>
                    <button onClick={() => setShowCategoryChooser(false)} className="touch-btn p-2.5 rounded-full bg-secondary">
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {[...HABIT_CATEGORIES, { id: "foundations" as HabitCategory, label: "Foundations", color: "hsl(var(--primary))" }].map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setShowCategoryChooser(false);
                          openPicker(cat.id === ("foundations" as string) ? "self-care" : cat.id as HabitCategory);
                        }}
                        className="touch-btn rounded-[16px] p-5 text-center border border-border bg-card shadow-soft hover:shadow-medium hover:border-primary/20"
                      >
                        <span className="font-display text-base font-semibold text-foreground">{cat.label}</span>
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
