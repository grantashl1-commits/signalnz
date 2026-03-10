import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Check } from "lucide-react";
import { getLibraryHabitsForCategory, type LibraryHabit } from "@/data/habit-library";
import { addHabit, getHabits, type Habit, type HabitCategory } from "@/data/self-care-rituals";
import { haptic } from "@/hooks/use-mobile";

interface HabitLibraryPickerProps {
  open: boolean;
  category: HabitCategory;
  onClose: () => void;
  onAdded: () => void;
}

const CATEGORY_TITLES: Partial<Record<HabitCategory, string>> = {
  "self-care": "Self Care",
  nutrition: "Nutrition",
  movement: "Movement",
};

export default function HabitLibraryPicker({ open, category, onClose, onAdded }: HabitLibraryPickerProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const libraryHabits = getLibraryHabitsForCategory(category);
  const existingHabits = getHabits();

  const toggleSelect = (id: string) => {
    haptic("light");
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAdd = () => {
    haptic("medium");
    selected.forEach(id => {
      const libHabit = libraryHabits.find(h => h.id === id);
      if (libHabit) {
        const habit: Habit = {
          id: `${category}-${libHabit.id}-${Date.now()}`,
          name: libHabit.name,
          category,
          duration: libHabit.frequency,
          notes: libHabit.description,
          createdAt: new Date().toISOString(),
        };
        addHabit(habit);
      }
    });
    setSelected(new Set());
    onAdded();
    onClose();
  };

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
              <p className="font-hand text-sm text-bloom">Select one or more to add.</p>
            </div>
            <button onClick={onClose} className="touch-btn p-2 rounded-full bg-secondary">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto px-5 pb-6" style={{ maxHeight: "60vh" }}>
          <div className="space-y-3 mt-3">
            {libraryHabits.map(habit => {
              const isSelected = selected.has(habit.id);
              const alreadyAdded = existingHabits.some(h => h.name === habit.name);

              return (
                <button
                  key={habit.id}
                  onClick={() => !alreadyAdded && toggleSelect(habit.id)}
                  disabled={alreadyAdded}
                  className={`touch-btn w-full flex items-start gap-3 rounded-[14px] p-3 text-left transition-all border ${
                    alreadyAdded
                      ? "bg-secondary/50 border-border opacity-60"
                      : isSelected
                      ? "bg-bloom/10 border-bloom ring-1 ring-bloom/30 shadow-md"
                      : "bg-card border-border shadow-sm"
                  }`}
                >
                  {/* Illustration */}
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-secondary/50 flex items-center justify-center overflow-hidden">
                    <img
                      src={habit.image}
                      alt={habit.name}
                      className="w-12 h-12 object-contain"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-body text-sm font-semibold text-foreground">
                        {habit.name}
                      </span>
                      {alreadyAdded && (
                        <span className="flex items-center gap-0.5 font-hand text-[10px] text-bloom">
                          <Check className="h-3 w-3" /> Added
                        </span>
                      )}
                    </div>
                    <p className="font-body text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {habit.description}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="font-mono text-[10px] text-primary">{habit.frequency}</span>
                    </div>
                    <p className="font-display text-[10px] italic text-muted-foreground/70 mt-1 line-clamp-2">
                      {habit.evidenceNote}
                    </p>
                  </div>

                  {/* Selection indicator */}
                  {!alreadyAdded && (
                    <div className={`flex-shrink-0 mt-1 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected ? "border-bloom bg-bloom/20" : "border-border"
                    }`}>
                      {isSelected && <Check className="h-3 w-3 text-bloom" />}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Add selected */}
        {selected.size > 0 && (
          <div className="sticky bottom-0 px-5 py-4 bg-card border-t border-border pb-safe">
            <button
              onClick={handleAdd}
              className="touch-btn w-full rounded-[14px] py-3 min-h-[52px] font-body text-sm font-bold text-card bg-bloom active:opacity-90 transition-opacity"
            >
              Add {selected.size} habit{selected.size > 1 ? "s" : ""} →
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
