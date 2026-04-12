import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, X, ChevronDown, Sun, Moon as MoonIcon, Sunset, Leaf, Pill, Salad, Zap, Sparkles, Landmark, Copy, Check } from "lucide-react";
import { WildStar } from "@/components/BotanicalElements";
import { GatedPage } from "@/components/FeatureGate";
import { SelfCareHandIcon } from "@/components/SelfCareIcons";
import HabitLibraryPicker from "@/components/HabitLibraryPicker";
import SleepCard from "@/components/practice/SleepCard";
import {
  getHabits, addHabit, removeHabit,
  HABIT_CATEGORIES,
  SELF_CARE_RITUALS,
  type Habit, type HabitCategory,
} from "@/data/self-care-rituals";
import { HABIT_LIBRARY, type HabitTiming } from "@/data/habit-library";
import { useCycle } from "@/contexts/CycleContext";
import { haptic } from "@/hooks/use-mobile";
import { useHabitCompletions } from "@/hooks/useHabitCompletions";

const PHASE_COLORS: Record<string, string> = {
  menstrual: "#C4526E",
  follicular: "#5C4A9E",
  ovulatory: "#C47A8A",
  luteal: "#9B89B4",
};

// ── Phase 5C: 4-week heatmap helpers ────────────────────────────────────────

function getLast28Days(): string[] {
  return Array.from({ length: 28 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (27 - i));
    return d.toISOString().split("T")[0];
  });
}

function generateSummaryText(
  habits: { id: string; name: string }[],
  history: Record<string, Set<string>>
): string {
  const days = getLast28Days();
  const lines: string[] = ["My 4-Week Habit Summary\n" + "─".repeat(30)];
  habits.forEach((habit) => {
    const count = days.filter((d) => history[d]?.has(habit.id)).length;
    const pct = Math.round((count / 28) * 100);
    if (count >= 21) {
      lines.push(`✅ ${habit.name}: ${count}/28 days (${pct}%) — consistently strong`);
    } else if (count < 8) {
      lines.push(`🌱 ${habit.name}: ${count}/28 days (${pct}%) — still building`);
    } else {
      lines.push(`📈 ${habit.name}: ${count}/28 days (${pct}%)`);
    }
  });
  return lines.join("\n");
}

interface HeatmapProps {
  habits: { id: string; name: string }[];
  history: Record<string, Set<string>>;
  loading: boolean;
  phaseColor: string;
  copiedSummary: boolean;
  onCopy: () => void;
}

function HabitHeatmap({ habits, history, loading, phaseColor, copiedSummary, onCopy }: HeatmapProps) {
  const days = useMemo(() => getLast28Days(), []);

  const habitStats = useMemo(() =>
    habits.map((h) => {
      const count = days.filter((d) => history[d]?.has(h.id)).length;
      return { ...h, count, pct: Math.round((count / 28) * 100) };
    }),
    [habits, history, days]
  );

  const sorted = [...habitStats].sort((a, b) => b.count - a.count);
  const strongest = sorted.slice(0, 3);
  const stillBuilding = sorted.slice(-3).reverse().filter(h => h.count < 21);

  // Day-of-week labels (7 across top)
  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];
  const firstDayIdx = (new Date(days[0]).getDay() + 6) % 7; // Monday=0

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mt-8 rounded-[22px] bg-card shadow-soft p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-bold text-foreground">My Consistency</h3>
        <span className="font-body text-xs text-muted-foreground">Last 28 days</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-5 w-5 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        </div>
      ) : (
        <>
          {/* Heatmap grid — habits as rows, days as columns */}
          <div className="overflow-x-auto pb-2">
            <div className="min-w-[320px]">
              {/* Day-of-week header */}
              <div className="flex gap-[3px] mb-1 ml-[72px]">
                {days.map((day, i) => {
                  const dow = (new Date(day).getDay() + 6) % 7;
                  const showLabel = i === 0 || dow === 0;
                  return (
                    <div key={day} className="w-[14px] flex-shrink-0 text-center">
                      {showLabel ? (
                        <span className="font-body text-[8px] text-muted-foreground/60">
                          {dayLabels[dow]}
                        </span>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              {/* Habit rows */}
              {habitStats.map((habit) => (
                <div key={habit.id} className="flex items-center gap-2 mb-[3px]">
                  <span className="font-body text-[10px] text-muted-foreground w-[68px] truncate text-right pr-1 flex-shrink-0">
                    {habit.name.split(" ").slice(0, 2).join(" ")}
                  </span>
                  {days.map((day) => {
                    const done = history[day]?.has(habit.id);
                    return (
                      <div
                        key={day}
                        className="w-[14px] h-[14px] rounded-[3px] flex-shrink-0 transition-colors"
                        style={{
                          backgroundColor: done
                            ? `${phaseColor}CC`
                            : "hsl(var(--border))",
                        }}
                        title={`${habit.name} — ${day}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Insights */}
          {habitStats.length > 0 && (
            <div className="mt-5 space-y-3">
              {strongest.length > 0 && (
                <div>
                  <p className="font-body text-xs font-semibold text-foreground mb-1.5">
                    Your strongest habits
                  </p>
                  {strongest.map((h) => (
                    <div key={h.id} className="flex items-center gap-2 mb-1">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: phaseColor }} />
                      <span className="font-body text-xs text-foreground flex-1">{h.name}</span>
                      <span className="font-body text-xs font-semibold" style={{ color: phaseColor }}>
                        {h.pct}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {stillBuilding.length > 0 && (
                <div>
                  <p className="font-body text-xs font-semibold text-muted-foreground mb-1.5">
                    Still building
                  </p>
                  {stillBuilding.map((h) => (
                    <div key={h.id} className="flex items-center gap-2 mb-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 flex-shrink-0" />
                      <span className="font-body text-xs text-muted-foreground flex-1">{h.name}</span>
                      <span className="font-body text-xs text-muted-foreground">{h.pct}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Copy summary */}
          <button
            onClick={onCopy}
            className="mt-4 w-full flex items-center justify-center gap-2 rounded-[14px] py-3 min-h-[44px] font-body text-xs font-medium bg-primary/8 text-primary active:bg-primary/15 transition-all"
          >
            {copiedSummary ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copiedSummary ? "Copied!" : "Copy my 4-week summary"}
          </button>
        </>
      )}
    </motion.div>
  );
}

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
  const [showLibraryPicker, setShowLibraryPicker] = useState(false);
  const [showCategoryChooser, setShowCategoryChooser] = useState(false);
  const [libraryPickerCategory, setLibraryPickerCategory] = useState<HabitCategory>("self-care");
  const [collapsedTiming, setCollapsedTiming] = useState<Set<HabitTiming>>(new Set());
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Phase 5B — Supabase-backed completions
  const { completedIds, toggle: toggleHabit, history, historyLoading } = useHabitCompletions();

  const refreshHabits = useCallback(() => {
    setHabits(getHabits());
  }, []);

  const handleToggle = (habitId: string) => {
    haptic("light");
    toggleHabit(habitId);
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

  const completedCount = completedIds.size;
  const totalHabits = habits.length;

  return (
    <GatedPage requiredTier="thriving">
      <div className="max-w-2xl mx-auto">

        {/* ═══ HERO BANNER ═══ */}
        <motion.div
          {...fadeUp(0)}
          className="relative overflow-hidden rounded-b-[28px] bg-primary px-6 md:px-8 mb-8"
          style={{ minHeight: '220px', paddingTop: '48px', paddingBottom: '32px', paddingLeft: '24px', paddingRight: '24px' }}
        >
          {/* Dots handled by global SignalAmbientDots layer */}
          <p className="font-body text-xs uppercase tracking-[0.3em] text-primary-foreground/40 mb-4 relative z-10">Practice</p>
          <h1 className="font-display text-[32px] md:text-4xl font-extrabold text-primary-foreground leading-tight relative z-10">
            Ritual
          </h1>
          <p className="font-body text-sm md:text-base text-primary-foreground/75 mt-2 max-w-md relative z-10">
            Build rituals that honour your cycle.
          </p>
        </motion.div>

        <div className="px-5 md:px-8 pb-8 md:pb-12">

        {/* Sleep Card */}
        <motion.div {...fadeUp(0.05)} className="mb-6">
          <SleepCard phaseColor={phaseColor} />
        </motion.div>

        {/* Progress Summary / Empty State */}
        {totalHabits === 0 ? (
          <motion.div {...fadeUp(0.1)} className="rounded-[22px] bg-card p-8 shadow-soft mb-6 flex flex-col items-center text-center">
            <div className="relative h-20 w-20 mb-5">
              <svg viewBox="0 0 80 80" className="h-20 w-20">
                <circle cx="40" cy="40" r="34" fill="none" stroke="hsl(var(--border))" strokeWidth="4" />
                <circle
                  cx="40" cy="40" r="34"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="0 213.628"
                  transform="rotate(-90 40 40)"
                  className="opacity-30"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center font-display text-lg font-bold text-muted-foreground/50">
                0%
              </span>
            </div>
            <h2 className="font-display text-xl font-bold text-foreground mb-1.5">
              Start building your ritual stack
            </h2>
            <p className="font-body text-sm text-muted-foreground max-w-xs mb-5">
              Consistent daily practices compound into transformation.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowCategoryChooser(true)}
              className="w-full rounded-full bg-primary py-3.5 flex items-center justify-center gap-2 text-primary-foreground shadow-soft"
            >
              <Sparkles className="h-4.5 w-4.5" />
              <span className="font-display text-base font-semibold">Add a habit</span>
            </motion.button>
          </motion.div>
        ) : (
          <>
            <motion.div
              {...fadeUp(0.1)}
              className="rounded-[22px] bg-card p-6 shadow-soft mb-6"
            >
              <div className="flex items-center gap-4">
                <div className="relative h-14 w-14 flex-shrink-0">
                  <svg viewBox="0 0 56 56" className="h-14 w-14">
                    <circle cx="28" cy="28" r="24" fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
                    <circle
                      cx="28" cy="28" r="24"
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={`${(completedCount / totalHabits) * 150.8} 150.8`}
                      transform="rotate(-90 28 28)"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center font-display text-sm font-bold text-foreground">
                    {Math.round((completedCount / totalHabits) * 100)}%
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-1.5">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={completedCount}
                        initial={{ y: -16, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 16, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="font-display text-3xl font-extrabold text-foreground"
                      >
                        {completedCount}
                      </motion.span>
                    </AnimatePresence>
                    <span className="font-body text-base text-muted-foreground">/ {totalHabits} complete</span>
                  </div>
                  {completedCount > 0 && completedCount === totalHabits && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="font-body text-sm text-primary flex items-center gap-1.5 mt-1"
                    >
                      <WildStar size={14} /> All habits complete!
                    </motion.p>
                  )}
                </div>
              </div>
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
          </>
        )}

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
                        const done = completedIds.has(habit.id);
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
                              className="touch-btn flex-shrink-0"
                            >
                              <span className={`h-9 w-9 rounded-full border-2 flex items-center justify-center transition-all ${
                                done ? "border-primary bg-primary/15" : "border-border hover:border-primary/40"
                              }`}>
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
                              </span>
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
                              className="touch-btn p-2 rounded-full hover:bg-secondary"
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground/40" />
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
                    {(() => {
                      const CATEGORY_META: Record<string, { icon: typeof Pill; tint: string; border: string }> = {
                        supplements: { icon: Pill, tint: "bg-[hsl(284_30%_96%)]", border: "border-[hsl(284_40%_80%)]" },
                        nutrition:   { icon: Salad, tint: "bg-[hsl(142_30%_95%)]", border: "border-[hsl(142_35%_78%)]" },
                        movement:    { icon: Zap, tint: "bg-[hsl(35_40%_95%)]", border: "border-[hsl(35_45%_78%)]" },
                        "self-care": { icon: Sparkles, tint: "bg-[hsl(330_30%_96%)]", border: "border-[hsl(330_35%_80%)]" },
                        foundations: { icon: Landmark, tint: "bg-[hsl(260_25%_95%)]", border: "border-[hsl(260_30%_80%)]" },
                      };
                      return [...HABIT_CATEGORIES, { id: "foundations" as HabitCategory, label: "Foundations", color: "hsl(var(--primary))" }].map(cat => {
                        const meta = CATEGORY_META[cat.id] || CATEGORY_META.foundations;
                        const Icon = meta.icon;
                        return (
                          <button
                            key={cat.id}
                            onClick={() => {
                              setShowCategoryChooser(false);
                              openPicker(cat.id === ("foundations" as string) ? "self-care" : cat.id as HabitCategory);
                            }}
                            className={`touch-btn rounded-[16px] h-[88px] flex flex-col items-center justify-center gap-2 border shadow-soft hover:shadow-medium hover:border-primary/20 ${meta.tint} ${meta.border}`}
                          >
                            <Icon className="h-6 w-6 text-foreground/70" />
                            <span className="font-display text-[13px] font-semibold text-foreground">{cat.label}</span>
                          </button>
                        );
                      });
                    })()}
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
      </div>
    </GatedPage>
  );
}
