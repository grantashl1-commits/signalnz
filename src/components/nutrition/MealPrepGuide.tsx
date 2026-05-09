import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, ListPlus, Check, Calendar } from "lucide-react";
import { AIMealPlan } from "@/lib/weekly-planner";
import { generatePrepGuide, PrepDayPlan, PrepTask, prepTaskToTodoTitle } from "@/lib/prep-guide";
import { useTodos } from "@/hooks/useTodos";
import { haptic } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { Phase } from "@/lib/cycle-utils";
import {
  BatchPrepIcon,
  AdvancePrepIcon,
  MorningPrepIcon,
  DefrostIcon,
  NightPrepIcon,
  GeneralPrepIcon,
} from "./PrepIcons";

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#C4526E",
  follicular: "#5C4A9E",
  ovulatory: "#C47A8A",
  luteal: "#9B89B4",
};

const CATEGORY_ICON: Record<string, React.FC<{ className?: string; style?: React.CSSProperties; size?: number }>> = {
  batch: BatchPrepIcon,
  advance: AdvancePrepIcon,
  morning: MorningPrepIcon,
  defrost: DefrostIcon,
};

const CATEGORY_LABEL: Record<string, string> = {
  batch: "Batch prep",
  advance: "Advance prep",
  morning: "Morning prep",
  defrost: "Defrost",
};

interface Props {
  plan: AIMealPlan;
  weekNumber: number;
  weekDates: { date: Date; dateStr: string; dayName: string }[];
  phase: Phase;
  onBack: () => void;
}

export default function MealPrepGuide({ plan, weekNumber, weekDates, phase, onBack }: Props) {
  const phaseColor = PHASE_HEX[phase];
  const { addTodo } = useTodos();
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [addedTasks, setAddedTasks] = useState<Set<string>>(new Set());

  const prepDays = useMemo(
    () => generatePrepGuide(plan, weekNumber, weekDates),
    [plan, weekNumber, weekDates]
  );

  const daysWithTasks = prepDays.filter(d => d.tasks.length > 0);
  const totalTasks = daysWithTasks.reduce((sum, d) => sum + d.tasks.length, 0);

  const handleAddToTodo = async (task: PrepTask) => {
    haptic("medium");
    const title = prepTaskToTodoTitle(task);
    await addTodo(title);
    setAddedTasks(prev => new Set(prev).add(task.id));
    toast.success("Held — added to your to-do list.");
  };

  const handleAddAllForDay = async (tasks: PrepTask[]) => {
    haptic("medium");
    const toAdd = tasks.filter(t => !addedTasks.has(t.id));
    for (const task of toAdd) {
      await addTodo(prepTaskToTodoTitle(task));
    }
    setAddedTasks(prev => {
      const next = new Set(prev);
      toAdd.forEach(t => next.add(t.id));
      return next;
    });
    toast.success(`Added ${toAdd.length} tasks to your to-do list`);
  };

  const handleAddAll = async () => {
    haptic("medium");
    const allTasks = daysWithTasks.flatMap(d => d.tasks).filter(t => !addedTasks.has(t.id));
    for (const task of allTasks) {
      await addTodo(prepTaskToTodoTitle(task));
    }
    setAddedTasks(prev => {
      const next = new Set(prev);
      allTasks.forEach(t => next.add(t.id));
      return next;
    });
    toast.success(`Added ${allTasks.length} prep tasks to your to-do list ✨`);
  };

  if (totalTasks === 0) {
    return (
      <div className="space-y-4">
        <button onClick={onBack} className="font-body text-xs text-muted-foreground underline">
          ← Back to plan
        </button>
        <div className="card-warm py-8 text-center">
          <Calendar className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-display text-lg italic text-foreground">No prep needed this week</p>
          <p className="font-body text-xs text-muted-foreground mt-1">
            Your meals are quick enough to make fresh each day.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="font-body text-xs text-muted-foreground underline">
        ← Back to plan
      </button>

      {/* Header */}
      <div>
        <h2 className="font-display text-2xl font-bold italic text-foreground">Prep Guide</h2>
        <p className="font-body text-sm mt-1" style={{ color: phaseColor }}>
          Week {weekNumber} · {totalTasks} prep tasks
        </p>
        <p className="font-body text-xs text-muted-foreground mt-0.5">
          Based on your {plan.prepPreferences.prepDays?.join(" & ") || "Sunday"} prep day
        </p>
      </div>

      {/* Add all button */}
      <button
        onClick={handleAddAll}
        className="touch-btn w-full rounded-[14px] py-3 min-h-[48px] font-body text-sm font-bold text-white transition-all active:opacity-90 flex items-center justify-center gap-2"
        style={{ backgroundColor: phaseColor }}
      >
        <ListPlus className="h-4 w-4" />
        Add all prep tasks to To-Do
      </button>

      {/* Day cards */}
      <div className="space-y-3">
        {daysWithTasks.map((day, i) => {
          const expanded = expandedDay === i;
          const allDayAdded = day.tasks.every(t => addedTasks.has(t.id));

          return (
            <div
              key={day.date}
              className="rounded-[18px] bg-card shadow-soft overflow-hidden relative"
            >
              {day.isPrepDay && (
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[18px]" style={{ backgroundColor: phaseColor }} />
              )}

              <button
                onClick={() => { haptic("light"); setExpandedDay(expanded ? null : i); }}
                className="touch-card w-full text-left p-4"
              >
                <div className="flex items-center justify-between">
                  <div className={day.isPrepDay ? "pl-2" : ""}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-body text-sm font-bold text-foreground">{day.dayName}</span>
                      {day.isPrepDay && (
                        <span
                          className="font-body text-[11px] font-bold rounded-full px-2.5 py-0.5"
                          style={{ backgroundColor: `${phaseColor}15`, color: phaseColor }}
                        >
                          Prep Day
                        </span>
                      )}
                      <span className="font-body text-xs text-muted-foreground">
                        {day.tasks.length} task{day.tasks.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      {day.tasks.slice(0, expanded ? undefined : 3).map(task => {
                        const Icon = CATEGORY_ICON[task.category] || GeneralPrepIcon;
                        return (
                          <p key={task.id} className="font-body text-xs text-muted-foreground flex items-center gap-1.5">
                            <Icon className="h-3 w-3 flex-shrink-0" style={{ color: phaseColor }} />
                            <span className="truncate">{task.description}</span>
                          </p>
                        );
                      })}
                      {!expanded && day.tasks.length > 3 && (
                        <p className="font-body text-[10px] text-muted-foreground/60">
                          +{day.tasks.length - 3} more
                        </p>
                      )}
                    </div>
                  </div>
                  {expanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}
                </div>
              </button>

              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-2 border-t border-border space-y-3">
                      {/* Add all for this day */}
                      {!allDayAdded && (
                        <button
                          onClick={() => handleAddAllForDay(day.tasks)}
                          className="touch-btn w-full rounded-xl py-2.5 min-h-[40px] font-body text-xs font-medium bg-secondary text-foreground transition-all active:opacity-90 flex items-center justify-center gap-1.5"
                        >
                          <ListPlus className="h-3.5 w-3.5" />
                          Add all {day.dayName} tasks to To-Do
                        </button>
                      )}

                      {day.tasks.map(task => {
                        const Icon = CATEGORY_ICON[task.category] || GeneralPrepIcon;
                        const isAdded = addedTasks.has(task.id);

                        return (
                          <div key={task.id} className="flex items-start gap-3">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                              style={{ backgroundColor: `${phaseColor}12` }}
                            >
                              <Icon className="h-4 w-4" style={{ color: phaseColor }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-body text-xs uppercase tracking-[0.12em] font-semibold" style={{ color: phaseColor }}>
                                {CATEGORY_LABEL[task.category]}
                              </p>
                              <p className="font-body text-sm text-foreground mt-0.5">
                                {task.description}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <p className="font-body text-[10px] text-muted-foreground">
                                  {task.timeHint} · For {task.servingDay}
                                </p>
                                {task.hoursInAdvance > 0 && (
                                  <span className="font-body text-[10px] text-muted-foreground/60">
                                    ({task.hoursInAdvance}h before)
                                  </span>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => !isAdded && handleAddToTodo(task)}
                              disabled={isAdded}
                              className="flex-shrink-0 p-2 rounded-full transition-colors"
                              style={isAdded ? {} : { backgroundColor: `${phaseColor}12` }}
                            >
                              {isAdded ? (
                                <Check className="h-4 w-4 text-primary" />
                              ) : (
                                <ListPlus className="h-4 w-4" style={{ color: phaseColor }} />
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
