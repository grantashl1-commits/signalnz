import { useMemo, useState, useEffect, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { getHabits, CATEGORY_DOT_CLASSES, type Habit, type HabitFrequencyType } from "@/data/self-care-rituals";
import { haptic } from "@/hooks/use-mobile";
import { useHabitCompletions } from "@/hooks/useHabitCompletions";
import { Link } from "react-router-dom";

export default function HomeHabitsDisplay() {
  const [habits, setHabits] = useState<Habit[]>(() => getHabits());

  useEffect(() => {
    const handler = () => setHabits(getHabits());
    window.addEventListener("storage", handler);
    // Also refresh on focus in case the user added habits in Practice
    window.addEventListener("focus", handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("focus", handler);
    };
  }, []);
  const { completedIds, toggle: toggleHabit } = useHabitCompletions();

  const completedCount = habits.filter(h => completedIds.has(h.id)).length;

  const habitsByFreq = useMemo(() => {
    const groups: Record<HabitFrequencyType, Habit[]> = { daily: [], weekly: [], monthly: [] };
    habits.forEach(h => {
      const ft = h.frequencyType || "daily";
      groups[ft].push(h);
    });
    return groups;
  }, [habits]);

  const handleToggle = (habitId: string) => {
    haptic("light");
    toggleHabit(habitId);
  };

  if (habits.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.5 }}
      className="card-warm"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="font-body text-section-label uppercase" style={{ color: 'hsl(var(--label-color))' }}>
          my habits
        </p>
        <div className="flex items-center gap-2">
          <span className="font-body text-xs text-muted-foreground">
            {completedCount}/{habits.length}
          </span>
          <Link to="/practice" className="font-body text-[11px] text-primary font-medium">
            Edit
          </Link>
        </div>
      </div>

      <div className="space-y-2">
        {(["daily", "weekly", "monthly"] as const).map(freqType => {
          const groupHabits = habitsByFreq[freqType];
          if (groupHabits.length === 0) return null;
          const label = freqType === "daily" ? "Daily" : freqType === "weekly" ? "This Week" : "This Month";
          return (
            <div key={freqType}>
              <p className="font-body text-[10px] uppercase tracking-wider text-muted-foreground/60 px-3 mb-0.5">
                {label}
              </p>
              <div className="space-y-0">
                {(() => {
                  // Group all supplement habits into a single combined row
                  const supplementHabits = groupHabits.filter(h => h.category === "supplements");
                  const otherHabits = groupHabits.filter(h => h.category !== "supplements");

                  const items: ReactNode[] = [];

                  if (supplementHabits.length > 0) {
                    const allDone = supplementHabits.every(h => completedIds.has(h.id));
                    const dotClass = CATEGORY_DOT_CLASSES["supplements"] || "bg-primary";
                    const names = supplementHabits.map(h => h.name).join(", ");
                    items.push(
                      <motion.button
                        key="__supplements_group"
                        onClick={() => {
                          haptic("light");
                          // Toggle all: if all done, uncheck all; otherwise check all that aren't done
                          supplementHabits.forEach(h => {
                            const isDone = completedIds.has(h.id);
                            if (allDone) {
                              if (isDone) toggleHabit(h.id);
                            } else {
                              if (!isDone) toggleHabit(h.id);
                            }
                          });
                        }}
                        className="flex-1 w-full flex items-center gap-3 rounded-xl px-3 py-2.5 min-h-[44px] transition-colors hover:bg-secondary/30 text-left"
                        whileTap={{ scale: 0.98 }}
                      >
                        <div
                          className="w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200"
                          style={{
                            borderColor: allDone ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                            backgroundColor: allDone ? 'hsl(var(--primary))' : 'transparent',
                          }}
                        >
                          {allDone && <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />}
                        </div>
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dotClass}`} />
                        <span className={`font-body text-sm flex-1 transition-all duration-200 ${allDone ? "line-through text-muted-foreground/60" : "text-foreground"}`}>
                          Supplements <span className="text-muted-foreground/70">({names})</span>
                        </span>
                      </motion.button>
                    );
                  }

                  otherHabits.forEach((habit) => {
                    const done = completedIds.has(habit.id);
                    const dotClass = CATEGORY_DOT_CLASSES[habit.category] || "bg-primary";
                    items.push(
                      <motion.button
                        key={habit.id}
                        onClick={() => handleToggle(habit.id)}
                        className="flex-1 w-full flex items-center gap-3 rounded-xl px-3 py-2.5 min-h-[44px] transition-colors hover:bg-secondary/30 text-left"
                        whileTap={{ scale: 0.98 }}
                      >
                        <div
                          className="w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200"
                          style={{
                            borderColor: done ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                            backgroundColor: done ? 'hsl(var(--primary))' : 'transparent',
                          }}
                        >
                          {done && <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />}
                        </div>
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dotClass}`} />
                        <span className={`font-body text-sm flex-1 transition-all duration-200 ${done ? "line-through text-muted-foreground/60" : "text-foreground"}`}>
                          {habit.name}
                        </span>
                      </motion.button>
                    );
                  });

                  return items;
                })()}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
