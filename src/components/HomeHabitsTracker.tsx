import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getHabits,
  getHabitLog,
  toggleHabitForDate,
  CATEGORY_DOT_CLASSES,
  type Habit,
} from "@/data/self-care-rituals";
import { haptic } from "@/hooks/use-mobile";
import EmptyState from "@/components/EmptyState";
import SleepCard from "@/components/practice/SleepCard";

const PHASE_COLORS: Record<string, string> = {
  menstrual: "#C4526E",
  follicular: "#5C4A9E",
  ovulatory: "#C47A8A",
  luteal: "#9B89B4",
};

export default function HomeHabitsTracker({ phase }: { phase: string }) {
  const navigate = useNavigate();
  const todayStr = new Date().toISOString().split("T")[0];
  const [habits, setHabits] = useState<Habit[]>(getHabits());
  const [todayLog, setTodayLog] = useState<Record<string, boolean>>(getHabitLog(todayStr));
  const phaseColor = PHASE_COLORS[phase] || PHASE_COLORS.follicular;

  const handleToggle = useCallback((habitId: string) => {
    haptic("light");
    toggleHabitForDate(todayStr, habitId);
    setTodayLog(prev => ({ ...prev, [habitId]: !prev[habitId] }));
  }, [todayStr]);

  const completedCount = habits.filter(h => todayLog[h.id]).length;

  if (habits.length === 0) {
    return (
      <div className="space-y-4">
        <div className="card-warm">
          <EmptyState
            title="Build your daily ritual"
            message="Tap to add habits and track your practice every morning."
            action={{
              label: "+ Add habits",
              onClick: () => navigate("/my-practice"),
            }}
          />
        </div>
        <SleepCard phaseColor={phaseColor} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card-warm">
        <div className="flex items-center justify-between mb-4">
          <p className="font-body text-section-label uppercase" style={{ color: 'hsl(var(--label-color))' }}>
            today's habits
          </p>
          <span className="font-body text-xs text-muted-foreground">
            {completedCount}/{habits.length}
          </span>
        </div>

        <div className="space-y-1">
          {habits.map((habit) => {
            const done = !!todayLog[habit.id];
            const dotClass = CATEGORY_DOT_CLASSES[habit.category] || "bg-primary";
            return (
              <motion.button
                key={habit.id}
                onClick={() => handleToggle(habit.id)}
                className="w-full flex items-center gap-3 rounded-xl px-3 py-3 min-h-[44px] transition-colors hover:bg-secondary/30 text-left"
                whileTap={{ scale: 0.98 }}
              >
                {/* Checkbox */}
                <div
                  className="w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200"
                  style={{
                    borderColor: done ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                    backgroundColor: done ? 'hsl(var(--primary))' : 'transparent',
                  }}
                >
                  {done && <Check className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={3} />}
                </div>

                {/* Category dot */}
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dotClass}`} />

                {/* Label */}
                <span
                  className={`font-body text-sm flex-1 transition-all duration-200 ${
                    done ? "line-through text-muted-foreground/60" : "text-foreground"
                  }`}
                >
                  {habit.name}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Add more button */}
        <button
          onClick={() => navigate("/my-practice")}
          className="mt-3 flex items-center gap-2 text-primary font-body text-xs font-medium hover:underline min-h-[44px] px-3"
        >
          <Plus className="w-3.5 h-3.5" />
          Add more habits
        </button>
      </div>

      <SleepCard phaseColor={phaseColor} />
    </div>
  );
}
