import { useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, Sparkles, Check } from "lucide-react";
import { HABIT_LIBRARY, type LibraryHabit } from "@/data/habit-library";
import { addHabit, type Habit, type HabitCategory } from "@/data/self-care-rituals";
import { useHabitList } from "@/hooks/useHabitList";
import type { Phase } from "@/lib/cycle-utils";
import { haptic } from "@/hooks/use-mobile";
import { toast } from "sonner";

interface Props {
  phase: Phase;
  phaseColor: string;
}

const PHASE_LABEL: Record<Phase, string> = {
  menstrual: "your bleed",
  follicular: "your rising phase",
  ovulatory: "your peak",
  luteal: "your inward turn",
};

/** Pick up to 3 library habits with a phaseNote for the current phase. */
function pickPhaseHabits(phase: Phase): LibraryHabit[] {
  const matched = HABIT_LIBRARY.filter(h => h.phaseNotes && h.phaseNotes[phase]);
  // Stable rotation using day-of-year so it shifts gently across days
  const day = Math.floor(Date.now() / 86_400_000);
  const start = matched.length ? day % matched.length : 0;
  const out: LibraryHabit[] = [];
  for (let i = 0; out.length < 3 && i < matched.length; i++) {
    out.push(matched[(start + i) % matched.length]);
  }
  return out;
}

export default function PhaseHabitSuggestions({ phase, phaseColor }: Props) {
  const { habits, refreshHabits } = useHabitList();
  const suggestions = useMemo(() => pickPhaseHabits(phase), [phase]);

  if (suggestions.length === 0) return null;

  const isAdded = (name: string) => habits.some(h => h.name === name);

  const handleAdd = (lib: LibraryHabit) => {
    if (isAdded(lib.name)) return;
    haptic("medium");
    const habit: Habit = {
      id: `${lib.category}-${lib.id}-${Date.now()}`,
      name: lib.name,
      category: lib.category as HabitCategory,
      createdAt: new Date().toISOString(),
    };
    addHabit(habit);
    refreshHabits();
    toast.success("Held for this phase.");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.18 }}
      className="rounded-[22px] bg-card shadow-soft p-5 mb-6"
    >
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="h-4 w-4" style={{ color: phaseColor }} />
        <p className="font-body text-[10px] uppercase tracking-[0.15em]" style={{ color: phaseColor }}>
          For {PHASE_LABEL[phase]}
        </p>
      </div>
      <p className="font-display text-base italic text-foreground/80 mb-4 leading-snug">
        A few small rituals that meet this season.
      </p>

      <div className="space-y-2">
        {suggestions.map((lib) => {
          const added = isAdded(lib.name);
          const note = lib.phaseNotes?.[phase];
          return (
            <div
              key={lib.id}
              className="flex items-start gap-3 rounded-[14px] bg-secondary/40 p-3"
            >
              <div className="flex-1 min-w-0">
                <p className="font-display text-sm font-semibold text-foreground leading-snug">
                  {lib.name}
                </p>
                {note && (
                  <p className="font-body text-[11px] text-muted-foreground leading-snug mt-0.5 line-clamp-2">
                    {note}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleAdd(lib)}
                disabled={added}
                className="touch-btn shrink-0 inline-flex items-center gap-1 rounded-full px-3 py-1.5 min-h-[36px] font-body text-[11px] font-semibold transition-all disabled:opacity-60"
                style={{
                  backgroundColor: added ? "transparent" : `${phaseColor}18`,
                  color: added ? "hsl(var(--muted-foreground))" : phaseColor,
                  border: added ? "1px solid hsl(var(--border))" : "1px solid transparent",
                }}
              >
                {added ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                {added ? "Held" : "Add"}
              </button>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
