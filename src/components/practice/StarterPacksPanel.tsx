import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Plus, Check, ChevronDown } from "lucide-react";
import { STARTER_PACKS, HABIT_LIBRARY, type StarterPack } from "@/data/habit-library";
import { getHabits, addHabit, type Habit } from "@/data/self-care-rituals";
import { haptic } from "@/hooks/use-mobile";

interface Props {
  onAdded: () => void;
}

export default function StarterPacksPanel({ onAdded }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const handleAddPack = (pack: StarterPack) => {
    haptic("medium");
    const existing = getHabits();
    const existingNames = new Set(existing.map(h => h.name));

    pack.habitIds.forEach(hid => {
      const libHabit = HABIT_LIBRARY.find(h => h.id === hid);
      if (!libHabit || existingNames.has(libHabit.name)) return;

      const habit: Habit = {
        id: `${libHabit.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: libHabit.name,
        category: libHabit.category,
        duration: libHabit.frequency,
        timing: libHabit.timing || "anytime",
        notes: libHabit.description,
        createdAt: new Date().toISOString(),
      };
      addHabit(habit);
    });

    onAdded();
  };

  return (
    <div className="space-y-3">
      <h3 className="font-display text-lg font-bold text-foreground">Starter Packs</h3>
      <p className="font-body text-sm text-muted-foreground mb-4">
        Add an entire practice with one tap.
      </p>

      {STARTER_PACKS.map(pack => {
        const isExpanded = expanded === pack.id;
        const habits = getHabits();
        const allAdded = pack.habitIds.every(hid => {
          const lib = HABIT_LIBRARY.find(h => h.id === hid);
          return lib && habits.some(h => h.name === lib.name);
        });

        return (
          <motion.div
            key={pack.id}
            className="rounded-[16px] bg-card border border-border shadow-soft overflow-hidden"
          >
            <button
              onClick={() => setExpanded(isExpanded ? null : pack.id)}
              className="touch-btn w-full p-4 flex items-center gap-3 text-left"
            >
              <Package className="h-5 w-5 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-display text-base font-semibold text-foreground">{pack.name}</p>
                <p className="font-body text-xs text-muted-foreground mt-0.5">{pack.description}</p>
              </div>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-2">
                    {pack.habitIds.map(hid => {
                      const lib = HABIT_LIBRARY.find(h => h.id === hid);
                      if (!lib) return null;
                      const added = habits.some(h => h.name === lib.name);
                      return (
                        <div key={hid} className="flex items-center gap-2 font-body text-sm">
                          {added ? (
                            <Check className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                          ) : (
                            <div className="h-3.5 w-3.5 rounded-full border border-border flex-shrink-0" />
                          )}
                          <span className={added ? "text-muted-foreground" : "text-foreground"}>
                            {lib.name}
                          </span>
                        </div>
                      );
                    })}

                    <button
                      onClick={() => handleAddPack(pack)}
                      disabled={allAdded}
                      className={`mt-3 w-full rounded-full py-2.5 font-body text-sm font-medium transition-all ${
                        allAdded
                          ? "bg-primary/10 text-primary/50"
                          : "bg-primary text-primary-foreground hover:bg-primary/90"
                      }`}
                    >
                      {allAdded ? "All added" : "Add all habits"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
