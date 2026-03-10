import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, HelpCircle } from "lucide-react";
import { getLibraryHabitsForCategory, SUPPLEMENT_DISCLAIMER, type LibraryHabit } from "@/data/habit-library";
import { addHabit, getHabits, type Habit, type HabitCategory } from "@/data/self-care-rituals";
import { haptic } from "@/hooks/use-mobile";

interface HabitLibraryPickerProps {
  open: boolean;
  category: HabitCategory;
  onClose: () => void;
  onAdded: () => void;
}

const CATEGORY_TITLES: Partial<Record<HabitCategory, string>> = {
  supplements: "Supplements",
  "self-care": "Self Care",
  nutrition: "Nutrition",
  movement: "Movement",
};

export default function HabitLibraryPicker({ open, category, onClose, onAdded }: HabitLibraryPickerProps) {
  const [justAdded, setJustAdded] = useState<Set<string>>(new Set());
  const [expandedInfo, setExpandedInfo] = useState<string | null>(null);
  const [customName, setCustomName] = useState("");
  const libraryHabits = getLibraryHabitsForCategory(category);
  const existingHabits = getHabits();

  const handleInstantAdd = (libHabit: LibraryHabit) => {
    haptic("medium");
    const habit: Habit = {
      id: `${category}-${libHabit.id}-${Date.now()}`,
      name: libHabit.name,
      category,
      duration: libHabit.frequency,
      notes: libHabit.description,
      createdAt: new Date().toISOString(),
    };
    addHabit(habit);
    setJustAdded(prev => new Set(prev).add(libHabit.id));
    onAdded();
  };

  const handleCustomAdd = () => {
    if (!customName.trim()) return;
    haptic("medium");
    const habit: Habit = {
      id: `${category}-custom-${Date.now()}`,
      name: customName.trim(),
      category,
      createdAt: new Date().toISOString(),
    };
    addHabit(habit);
    setCustomName("");
    onAdded();
  };

  const isAlreadyAdded = (habit: LibraryHabit) =>
    existingHabits.some(h => h.name === habit.name) || justAdded.has(habit.id);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[70] bg-foreground/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="bottom-sheet z-[71]"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        style={{ maxHeight: "85vh" }}
      >
        <div className="bottom-sheet-handle" />
        <div className="px-5 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg italic font-bold text-foreground">
                {CATEGORY_TITLES[category] || "Choose"} habits.
              </h2>
              <p className="font-hand text-sm text-bloom">Tap to add to your daily list.</p>
            </div>
            <button onClick={onClose} className="touch-btn p-2 rounded-full bg-secondary">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto px-5 pb-6" style={{ maxHeight: "60vh" }}>
          {/* Supplement disclaimer */}
          {category === "supplements" && (
            <p className="font-display text-xs italic text-muted-foreground/70 mt-2 mb-3 px-1">
              {SUPPLEMENT_DISCLAIMER}
            </p>
          )}

          <div className="space-y-2.5 mt-2">
            {libraryHabits.map(habit => {
              const added = isAlreadyAdded(habit);
              const showInfo = expandedInfo === habit.id;

              return (
                <div key={habit.id}>
                  <button
                    onClick={() => !added && handleInstantAdd(habit)}
                    disabled={added}
                    className={`touch-btn w-full flex items-start gap-3 rounded-[14px] p-3 text-left transition-all border ${
                      added
                        ? "bg-secondary/50 border-border"
                        : "bg-card border-border shadow-sm active:shadow-md active:border-bloom/30"
                    }`}
                  >
                    {/* Illustration */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center overflow-hidden">
                      <img
                        src={habit.image}
                        alt={habit.name}
                        className="w-10 h-10 object-contain"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-body text-sm font-semibold text-foreground">
                          {habit.name}
                        </span>
                        {habit.womenBadge && (
                          <span className="inline-flex items-center rounded-full bg-sage-mist/20 px-2 py-0.5 font-hand text-[9px] font-bold text-sage-mist">
                            women
                          </span>
                        )}
                        {added && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center gap-0.5 font-hand text-[10px] text-bloom"
                          >
                            <Check className="h-3 w-3" /> added
                          </motion.span>
                        )}
                      </div>
                      <p className="font-body text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {habit.description}
                      </p>
                      <span className="font-mono text-[10px] text-primary mt-0.5 inline-block">{habit.frequency}</span>
                    </div>

                    {/* Info button for supplements */}
                    {(habit.nzBrands || habit.note) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedInfo(showInfo ? null : habit.id);
                        }}
                        className="touch-btn flex-shrink-0 mt-1 h-6 w-6 rounded-full bg-secondary flex items-center justify-center"
                      >
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    )}
                  </button>

                  {/* Expanded info panel */}
                  <AnimatePresence>
                    {showInfo && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mx-3 mt-1 mb-1 rounded-xl bg-secondary/60 p-3 space-y-1.5">
                          {habit.note && (
                            <p className="font-display text-[11px] italic text-muted-foreground">
                              {habit.note}
                            </p>
                          )}
                          {habit.nzBrands && (
                            <div>
                              <p className="font-hand text-[10px] font-bold text-primary mb-0.5">NZ brands</p>
                              <p className="font-body text-[11px] text-muted-foreground leading-relaxed">
                                {habit.nzBrands}
                              </p>
                            </div>
                          )}
                          {habit.evidenceNote && (
                            <p className="font-display text-[10px] italic text-muted-foreground/60">
                              {habit.evidenceNote}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Custom free-text input */}
          <div className="mt-5 pt-4 border-t border-border">
            <p className="font-hand text-xs font-bold text-muted-foreground mb-2">or add your own habit...</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleCustomAdd()}
                placeholder="Add your own habit..."
                className="flex-1 rounded-xl bg-secondary px-4 py-2.5 font-body text-[16px] text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                onClick={handleCustomAdd}
                disabled={!customName.trim()}
                className="touch-btn rounded-full px-4 py-2.5 font-hand text-sm font-bold text-primary-foreground bg-primary active:opacity-90 transition-opacity disabled:opacity-30 whitespace-nowrap"
              >
                Add →
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
