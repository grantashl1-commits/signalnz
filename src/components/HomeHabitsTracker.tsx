import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Check, Trash2, X, Search, Zap } from "lucide-react";
import {
  getHabits,
  addHabit,
  removeHabit,
  CATEGORY_DOT_CLASSES,
  HABIT_CATEGORIES,
  SELF_CARE_RITUALS,
  type Habit,
  type HabitCategory,
} from "@/data/self-care-rituals";
import { HABIT_LIBRARY, getLibraryHabitsForCategory, type LibraryHabit } from "@/data/habit-library";
import { haptic } from "@/hooks/use-mobile";
import SleepCard from "@/components/practice/SleepCard";
import { useHabitCompletions } from "@/hooks/useHabitCompletions";
import { SUPPLEMENT_GUIDE } from "@/data/nutrition-insights";
import { useCycle } from "@/contexts/CycleContext";
import { ChevronDown, ChevronUp } from "lucide-react";

const PHASE_COLORS: Record<string, string> = {
  menstrual: "#C4526E",
  follicular: "#5C4A9E",
  ovulatory: "#C47A8A",
  luteal: "#9B89B4",
};

// ── Phase 5D: Smart habit nudges ────────────────────────────────────────────
const PHASE_NUDGE_IDS: Record<string, string[]> = {
  menstrual:  ["lib-herbal-tea", "lib-stretching", "lib-warm-lemon-water", "lib-magnesium", "lib-morning-journal"],
  follicular: ["lib-morning-sunlight", "lib-cold-exposure", "lib-protein-breakfast", "lib-fermented-food", "lib-movement-snack"],
  ovulatory:  ["lib-movement-snack", "lib-water-2l", "lib-protein-lunch", "lib-midday-walk", "lib-morning-sunlight"],
  luteal:     ["lib-magnesium", "lib-screen-break-20-20-20", "lib-stretching", "lib-herbal-tea", "lib-consistent-sleep-time"],
};

function getSmartNudges(
  phase: string,
  completedIds: Set<string>,
  userHabitIds: Set<string>
): { id: string; name: string; timing: string; category: string }[] {
  const hour = new Date().getHours();
  const timingPref = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";

  // Preferred IDs for this phase — filter out already-done and already-added habits
  const phaseIds = PHASE_NUDGE_IDS[phase] || PHASE_NUDGE_IDS.follicular;
  const candidates = HABIT_LIBRARY.filter(
    h => phaseIds.includes(h.id) && !completedIds.has(h.id) && !userHabitIds.has(h.id)
  );

  // Sort: matching timing first
  const sorted = [
    ...candidates.filter(h => h.timing === timingPref),
    ...candidates.filter(h => h.timing !== timingPref),
  ];

  return sorted.slice(0, 3).map(h => ({
    id: h.id, name: h.name, timing: h.timing, category: h.category,
  }));
}

export default function HomeHabitsTracker({ phase }: { phase: string }) {
  const todayStr = new Date().toISOString().split("T")[0];
  const [habits, setHabits] = useState<Habit[]>(getHabits());
  const phaseColor = PHASE_COLORS[phase] || PHASE_COLORS.follicular;

  // Phase 5B — Supabase-backed completions
  const { completedIds, toggle: toggleHabit } = useHabitCompletions();

  // Add-habit panel state
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<HabitCategory | null>(null);
  const [search, setSearch] = useState("");
  const [customName, setCustomName] = useState("");
  const [editMode, setEditMode] = useState(false);

  const refreshHabits = useCallback(() => {
    setHabits(getHabits());
  }, []);

  const handleToggle = useCallback((habitId: string) => {
    haptic("light");
    toggleHabit(habitId);
  }, [toggleHabit]);

  const handleDelete = (habitId: string) => {
    haptic("medium");
    removeHabit(habitId);
    refreshHabits();
    if (getHabits().length === 0) setEditMode(false);
  };

  const handleAddFromLibrary = (name: string, id: string, category: HabitCategory) => {
    if (habits.some(h => h.name === name)) return;
    haptic("medium");
    const habit: Habit = {
      id: `${category}-${id}-${Date.now()}`,
      name,
      category,
      createdAt: new Date().toISOString(),
    };
    addHabit(habit);
    refreshHabits();
  };

  const handleCustomAdd = () => {
    if (!customName.trim() || !selectedCategory) return;
    haptic("medium");
    const habit: Habit = {
      id: `${selectedCategory}-custom-${Date.now()}`,
      name: customName.trim(),
      category: selectedCategory,
      createdAt: new Date().toISOString(),
    };
    addHabit(habit);
    setCustomName("");
    refreshHabits();
  };

  const completedCount = habits.filter(h => completedIds.has(h.id)).length;

  // Phase 5D: smart nudges (shown when user has habits but none are nudge-worthy, or has no habits)
  const userHabitIds = useMemo(() => new Set(habits.map(h => h.id)), [habits]);
  const smartNudges = useMemo(
    () => getSmartNudges(phase, completedIds, userHabitIds),
    [phase, completedIds, userHabitIds]
  );

  // Get library items for selected category
  const getLibraryItems = (): { id: string; name: string }[] => {
    if (!selectedCategory) return [];
    if (selectedCategory === "self-care") {
      return SELF_CARE_RITUALS.map(r => ({ id: r.id, name: r.name }));
    }
    return getLibraryHabitsForCategory(selectedCategory).map(h => ({ id: h.id, name: h.name }));
  };

  const libraryItems = getLibraryItems().filter(item =>
    !search || item.name.toLowerCase().includes(search.toLowerCase())
  );

  const existingNames = new Set(habits.map(h => h.name));

  return (
    <div className="space-y-4">
      {/* ── Habit tracker card ── */}
      <div className="card-warm">
        <div className="flex items-center justify-between mb-4">
          <p className="font-body text-section-label uppercase" style={{ color: 'hsl(var(--label-color))' }}>
            today's habits
          </p>
          <div className="flex items-center gap-2">
            {habits.length > 0 && (
              <>
                <span className="font-body text-xs text-muted-foreground">
                  {completedCount}/{habits.length}
                </span>
                <button
                  onClick={() => { setEditMode(!editMode); setShowAddPanel(false); }}
                  className="font-body text-[11px] text-primary font-medium min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  {editMode ? "Done" : "Edit"}
                </button>
              </>
            )}
          </div>
        </div>

        {habits.length === 0 && !showAddPanel ? (
          <div className="flex flex-col items-center text-center py-8 px-4">
            <p className="font-display text-lg italic text-foreground/60 mb-1">Build your daily ritual</p>
            <p className="text-sm text-muted-foreground mb-5 max-w-[220px]">
              Add habits to track your practice every morning.
            </p>
            <button
              onClick={() => { setShowAddPanel(true); setSelectedCategory(null); }}
              className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-5 py-2.5 text-primary font-body text-sm font-medium hover:bg-primary/10 transition-colors min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              Add habits
            </button>
          </div>
        ) : (
          <>
            {/* Habit list */}
            <div className="space-y-1">
              {habits.map((habit) => {
                const done = completedIds.has(habit.id);
                const dotClass = CATEGORY_DOT_CLASSES[habit.category] || "bg-primary";
                return (
                  <div key={habit.id} className="flex items-center gap-1">
                    {editMode && (
                      <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        onClick={() => handleDelete(habit.id)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-destructive/70 hover:text-destructive hover:bg-destructive/10 flex-shrink-0 min-w-[44px] min-h-[44px]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </motion.button>
                    )}
                    <motion.button
                      onClick={() => !editMode && handleToggle(habit.id)}
                      className="flex-1 flex items-center gap-3 rounded-xl px-3 py-3 min-h-[44px] transition-colors hover:bg-secondary/30 text-left"
                      whileTap={editMode ? {} : { scale: 0.98 }}
                    >
                      <div
                        className="w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200"
                        style={{
                          borderColor: done ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                          backgroundColor: done ? 'hsl(var(--primary))' : 'transparent',
                        }}
                      >
                        {done && <Check className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={3} />}
                      </div>
                      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dotClass}`} />
                      <span
                        className={`font-body text-sm flex-1 transition-all duration-200 ${
                          done ? "line-through text-muted-foreground/60" : "text-foreground"
                        }`}
                      >
                        {habit.name}
                      </span>
                    </motion.button>
                  </div>
                );
              })}
            </div>

            {/* Add more button */}
            {!showAddPanel && (
              <button
                onClick={() => { setShowAddPanel(true); setSelectedCategory(null); setEditMode(false); }}
                className="mt-3 flex items-center gap-2 text-primary font-body text-xs font-medium hover:underline min-h-[44px] px-3"
              >
                <Plus className="w-3.5 h-3.5" />
                Add more habits
              </button>
            )}
          </>
        )}
      </div>

      {/* Phase 5D — Smart habit nudges (3 phase+time-aware suggestions) */}
      {smartNudges.length > 0 && !showAddPanel && (
        <div className="card-warm">
          <div className="flex items-center gap-1.5 mb-3">
            <Zap className="h-3.5 w-3.5" style={{ color: phaseColor }} />
            <p className="font-body text-section-label uppercase" style={{ color: 'hsl(var(--label-color))' }}>
              suggested today
            </p>
          </div>
          <div className="space-y-1">
            {smartNudges.map((nudge) => {
              const isDone = completedIds.has(nudge.id);
              return (
                <motion.button
                  key={nudge.id}
                  onClick={() => { haptic("light"); toggleHabit(nudge.id); }}
                  className="flex-1 w-full flex items-center gap-3 rounded-xl px-3 py-3 min-h-[44px] transition-colors hover:bg-secondary/30 text-left"
                  whileTap={{ scale: 0.98 }}
                >
                  <div
                    className="w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200"
                    style={{
                      borderColor: isDone ? phaseColor : 'hsl(var(--border))',
                      backgroundColor: isDone ? `${phaseColor}20` : 'transparent',
                    }}
                  >
                    {isDone && <Check className="w-3.5 h-3.5" style={{ color: phaseColor }} strokeWidth={3} />}
                  </div>
                  <span className={`font-body text-sm flex-1 transition-all duration-200 ${isDone ? "line-through text-muted-foreground/60" : "text-foreground"}`}>
                    {nudge.name}
                  </span>
                  <span className="font-body text-[9px] uppercase tracking-wider text-muted-foreground/50 flex-shrink-0">
                    {nudge.timing}
                  </span>
                </motion.button>
              );
            })}
          </div>
          <p className="font-body text-[10px] text-muted-foreground/50 mt-2 px-1">
            Based on your {phase} phase — tap to complete without opening My Practice
          </p>
        </div>
      )}

      {/* ── Inline add panel ── */}
      <AnimatePresence>
        {showAddPanel && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="card-warm">
              <div className="flex items-center justify-between mb-3">
                <p className="font-body text-xs font-semibold text-foreground/70 uppercase tracking-wide">
                  {selectedCategory ? "Choose habits" : "Pick a category"}
                </p>
                <button
                  onClick={() => { setShowAddPanel(false); setSelectedCategory(null); setSearch(""); }}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground min-w-[44px] min-h-[44px]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

                {!selectedCategory ? (
                  /* Category grid */
                  <div className="grid grid-cols-2 gap-2">
                    {HABIT_CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => { haptic("light"); setSelectedCategory(cat.id); setSearch(""); }}
                        className="flex items-center gap-2.5 rounded-2xl px-4 py-3.5 min-h-[44px] text-left transition-colors hover:bg-secondary/40"
                        style={{ backgroundColor: 'hsl(var(--secondary) / 0.2)' }}
                      >
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="font-body text-sm font-medium text-foreground">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  /* Habit browser for selected category */
                  <div>
                    {/* Back + search */}
                    <div className="flex items-center gap-2 mb-3">
                      <button
                        onClick={() => { setSelectedCategory(null); setSearch(""); }}
                        className="font-body text-xs text-primary font-medium min-h-[44px] min-w-[44px] flex items-center"
                      >
                        ← Back
                      </button>
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Search..."
                          value={search}
                          onChange={e => setSearch(e.target.value)}
                          className="w-full rounded-full bg-secondary/30 border-0 pl-9 pr-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                        />
                      </div>
                    </div>

                    {/* Library list */}
                    <div className="max-h-[240px] overflow-y-auto space-y-0.5 -mx-1 px-1">
                      {libraryItems.map(item => {
                        const alreadyAdded = existingNames.has(item.name);
                        return (
                          <button
                            key={item.id}
                            onClick={() => !alreadyAdded && handleAddFromLibrary(item.name, item.id, selectedCategory)}
                            disabled={alreadyAdded}
                            className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 min-h-[44px] text-left transition-colors ${
                              alreadyAdded
                                ? "opacity-40 cursor-default"
                                : "hover:bg-secondary/30"
                            }`}
                          >
                            {alreadyAdded ? (
                              <Check className="w-4 h-4 text-primary flex-shrink-0" />
                            ) : (
                              <Plus className="w-4 h-4 text-primary flex-shrink-0" />
                            )}
                            <span className="font-body text-sm text-foreground">{item.name}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom habit input */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/15">
                      <input
                        type="text"
                        placeholder="Or type a custom habit..."
                        value={customName}
                        onChange={e => setCustomName(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleCustomAdd()}
                        className="flex-1 rounded-full bg-secondary/30 border-0 px-4 py-2.5 text-sm font-body text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30 min-h-[44px]"
                      />
                      <button
                        onClick={handleCustomAdd}
                        disabled={!customName.trim()}
                        className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-30 transition-opacity min-w-[44px] min-h-[44px]"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Sleep tracker ── */}
      <SleepCard phaseColor={phaseColor} />

      {/* ── Phase Supports (supplements) ── */}
      <PhaseSupplementsCard phase={phase} phaseColor={phaseColor} />
    </div>
  );
}

/* ── Phase Supplements Card ── */
function PhaseSupplementsCard({ phase, phaseColor }: { phase: string; phaseColor: string }) {
  const [expanded, setExpanded] = useState(false);
  const supplements = SUPPLEMENT_GUIDE[phase] || SUPPLEMENT_GUIDE.follicular;

  if (!supplements || supplements.length === 0) return null;

  return (
    <div className="card-warm">
      <button
        onClick={() => { haptic("light"); setExpanded(!expanded); }}
        className="w-full flex items-center justify-between min-h-[44px]"
      >
        <p className="font-body text-section-label uppercase" style={{ color: 'hsl(var(--label-color))' }}>
          phase supports
        </p>
        {expanded
          ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
          : <ChevronDown className="h-4 w-4 text-muted-foreground" />
        }
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-2 pt-3">
              {supplements.map((s) => (
                <div key={s.name} className="flex items-start gap-3 rounded-xl px-3 py-2.5" style={{ backgroundColor: `${phaseColor}08` }}>
                  <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: phaseColor }} />
                  <div className="min-w-0">
                    <p className="font-body text-sm font-medium text-foreground">{s.name}</p>
                    <p className="font-body text-xs text-muted-foreground mt-0.5">{s.reason}</p>
                  </div>
                </div>
              ))}
              <p className="font-body text-[10px] text-muted-foreground/50 px-1 pt-1">
                Always consult your GP before starting supplements.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
