import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import { Phase, PHASE_SHORT, getCycleInfo, getLastPeriodStart } from "@/lib/cycle-utils";
import { WeeklyPlan, formatDateShort, saveWeeklyPlan } from "@/lib/weekly-planner";
import { haptic } from "@/hooks/use-mobile";

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#C4526E",
  follicular: "#7D9E82",
  ovulatory: "#E8A030",
  luteal: "#9B89B4",
};

interface Props {
  plan: WeeklyPlan;
  phase: Phase;
  onProceedToShop: () => void;
  onStartFresh: () => void;
}

export default function WeeklyPlanView({ plan, phase, onProceedToShop, onStartFresh }: Props) {
  const phaseColor = PHASE_HEX[phase];
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="font-display text-xl font-bold italic text-foreground">Your week, simplified.</h2>
        <p className="font-hand text-sm mt-1" style={{ color: phaseColor }}>
          {PHASE_SHORT[phase]} Week · {formatDateShort(new Date(plan.dateRange.start))} – {formatDateShort(new Date(plan.dateRange.end))}
        </p>
      </div>

      {/* Day cards */}
      <div className="space-y-2">
        {plan.days.map((day, i) => {
          const isToday = day.date === todayStr;
          const expanded = expandedDay === i;

          return (
            <div
              key={day.date}
              className="card-warm overflow-hidden relative"
              style={isToday ? { boxShadow: `0 4px 20px ${phaseColor}20` } : {}}
            >
              {isToday && (
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[18px]" style={{ backgroundColor: phaseColor }} />
              )}

              <button
                onClick={() => { haptic("light"); setExpandedDay(expanded ? null : i); }}
                className="touch-card w-full text-left p-3 min-h-[56px]"
              >
                <div className="flex items-center justify-between">
                  <div className={isToday ? "pl-2" : ""}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-body text-xs font-bold text-foreground">{day.dayName}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {new Date(day.date).getDate()}/{new Date(day.date).getMonth() + 1}
                      </span>
                      {isToday && (
                        <span className="font-hand text-[10px] font-bold rounded-full px-2 py-0.5" style={{ backgroundColor: `${phaseColor}15`, color: phaseColor }}>
                          Today
                        </span>
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-body text-[11px] text-foreground">
                        <span className="font-bold text-foreground/60">B:</span> {day.breakfast.name}
                      </p>
                      <p className="font-body text-[11px] text-foreground">
                        <span className="font-bold text-foreground/60">L:</span> {day.lunch.name}
                        {day.lunch.isLeftover && <span className="text-muted-foreground italic"> (batch)</span>}
                      </p>
                      <p className="font-body text-[11px] text-foreground">
                        <span className="font-bold text-foreground/60">D:</span> {day.dinner.name}
                        {day.dinner.isLeftover && (
                          <span className="text-muted-foreground italic"> ← leftover</span>
                        )}
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
                    <div className="px-3 pb-3 pt-2 border-t border-border space-y-2">
                      <div>
                        <p className="font-hand text-xs font-bold" style={{ color: phaseColor }}>Breakfast</p>
                        <p className="font-body text-xs text-muted-foreground">{day.breakfast.name}</p>
                      </div>
                      <div>
                        <p className="font-hand text-xs font-bold" style={{ color: phaseColor }}>Morning snack</p>
                        <p className="font-body text-xs text-muted-foreground">{day.morningSnack.name}</p>
                      </div>
                      <div>
                        <p className="font-hand text-xs font-bold" style={{ color: phaseColor }}>Lunch</p>
                        <p className="font-body text-xs text-muted-foreground">
                          {day.lunch.name}
                          {day.lunch.isLeftover && " (from batch prep)"}
                        </p>
                      </div>
                      <div>
                        <p className="font-hand text-xs font-bold" style={{ color: phaseColor }}>Afternoon snack</p>
                        <p className="font-body text-xs text-muted-foreground">{day.afternoonSnack.name}</p>
                      </div>
                      <div>
                        <p className="font-hand text-xs font-bold" style={{ color: phaseColor }}>Dinner</p>
                        <p className="font-body text-xs text-muted-foreground">
                          {day.dinner.name}
                          {day.dinner.isLeftover && " (reheat from yesterday)"}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <button
          onClick={onProceedToShop}
          className="touch-btn w-full rounded-[14px] py-3.5 min-h-[52px] font-body text-sm font-bold text-white transition-all active:opacity-90"
          style={{ backgroundColor: phaseColor }}
        >
          Proceed to shopping list →
        </button>
        <button
          onClick={onStartFresh}
          className="touch-btn w-full flex items-center justify-center gap-2 rounded-[14px] py-3 min-h-[44px] font-body text-xs text-muted-foreground bg-secondary transition-all active:opacity-90"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Start fresh
        </button>
      </div>
    </div>
  );
}
