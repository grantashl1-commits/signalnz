import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Phase, PHASE_SHORT, getCycleInfo, getLastPeriodStart, PHASE_DAYS } from "@/lib/cycle-utils";
import { PHASE_MEAL_PLANS, DayPlan } from "@/data/meal-plans";
import { haptic } from "@/hooks/use-mobile";

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#C4526E",
  follicular: "#7D9E82",
  ovulatory: "#E8A030",
  luteal: "#9B89B4",
};

interface PlansTabProps {
  phase: Phase;
  cycleDay: number;
}

export default function PlansTab({ phase, cycleDay }: PlansTabProps) {
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const plan = PHASE_MEAL_PLANS[phase];
  const phaseColor = PHASE_HEX[phase];
  const [phaseStart, phaseEnd] = PHASE_DAYS[phase];

  // Which day in the plan corresponds to today?
  const dayInPhase = cycleDay - phaseStart + 1;

  return (
    <div className="space-y-4">
      {/* Phase header */}
      <div>
        <span
          className={`inline-block rounded-full px-3 py-1.5 font-hand text-sm font-bold phase-${phase}-light`}
        >
          your {PHASE_SHORT[phase].toLowerCase()} plan · days {phaseStart}–{phaseEnd}
        </span>
        <p className="font-body text-xs italic text-muted-foreground mt-2" style={{ fontWeight: 300 }}>
          plans update automatically as your cycle moves
        </p>
      </div>

      {/* Theme */}
      <p className="font-display text-sm italic text-foreground">{plan.theme}</p>

      {/* Day cards */}
      <div className="space-y-2">
        {plan.days.map((day) => {
          const isToday = day.day === dayInPhase;
          const expanded = expandedDay === day.day;

          return (
            <div
              key={day.day}
              className="card-warm overflow-hidden relative"
              style={isToday ? { boxShadow: `0 4px 20px ${phaseColor}20` } : {}}
            >
              {/* Today highlight bar */}
              {isToday && (
                <div
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[18px]"
                  style={{ backgroundColor: phaseColor }}
                />
              )}

              <button
                onClick={() => {
                  haptic("light");
                  setExpandedDay(expanded ? null : day.day);
                }}
                className="touch-card w-full text-left p-4 min-h-[56px]"
              >
                <div className="flex items-center justify-between">
                  <div className={isToday ? "pl-2" : ""}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[11px] font-bold" style={{ color: phaseColor }}>
                        day {day.day}
                      </span>
                      {isToday && (
                        <span className="font-hand text-[10px] font-bold text-muted-foreground bg-secondary rounded-full px-2 py-0.5">
                          today
                        </span>
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-body text-xs text-foreground">
                        <span className="font-bold text-foreground/60">B:</span> {day.breakfast.split(" — ")[0]}
                      </p>
                      <p className="font-body text-xs text-foreground">
                        <span className="font-bold text-foreground/60">L:</span> {day.lunch.split(" — ")[0]}
                      </p>
                      <p className="font-body text-xs text-foreground">
                        <span className="font-bold text-foreground/60">D:</span> {day.dinner.split(" — ")[0]}
                      </p>
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
                      <div>
                        <p className="font-hand text-sm font-bold" style={{ color: phaseColor }}>Breakfast</p>
                        <p className="font-body text-xs text-muted-foreground">{day.breakfast}</p>
                      </div>
                      <div>
                        <p className="font-hand text-sm font-bold" style={{ color: phaseColor }}>Lunch</p>
                        <p className="font-body text-xs text-muted-foreground">{day.lunch}</p>
                      </div>
                      <div>
                        <p className="font-hand text-sm font-bold" style={{ color: phaseColor }}>Dinner</p>
                        <p className="font-body text-xs text-muted-foreground">{day.dinner}</p>
                      </div>
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
