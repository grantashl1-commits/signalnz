import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import { Phase, PHASE_SHORT } from "@/lib/cycle-utils";
import { WeeklyPlan, formatDateShort } from "@/lib/weekly-planner";
import { findRecipeByName, findRecipeById } from "@/lib/recipe-index";
import { haptic } from "@/hooks/use-mobile";

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#C4526E",
  follicular: "#5C4A9E",
  ovulatory: "#C47A8A",
  luteal: "#9B89B4",
};

interface Props {
  plan: WeeklyPlan;
  phase: Phase;
  onProceedToShop: () => void;
  onStartFresh: () => void;
  onPlanSaved?: () => void;
}

export default function WeeklyPlanView({ plan, phase, onProceedToShop, onStartFresh }: Props) {
  const phaseColor = PHASE_HEX[phase];
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="font-display text-2xl font-bold italic text-foreground">Your week, simplified.</h2>
        <p className="font-body text-sm mt-1" style={{ color: phaseColor }}>
          {PHASE_SHORT[phase]} Week · {formatDateShort(new Date(plan.dateRange.start))} – {formatDateShort(new Date(plan.dateRange.end))}
        </p>
      </div>

      {/* Day cards */}
      <div className="space-y-3">
        {plan.days.map((day, i) => {
          const isToday = day.date === todayStr;
          const expanded = expandedDay === i;

          // Resolve recipes for illustration display
          const bRecipe = day.breakfast.recipeId ? findRecipeById(day.breakfast.recipeId) : findRecipeByName(day.breakfast.name);
          const lRecipe = day.lunch.recipeId ? findRecipeById(day.lunch.recipeId) : findRecipeByName(day.lunch.name);
          const dRecipe = day.dinner.recipeId ? findRecipeById(day.dinner.recipeId) : findRecipeByName(day.dinner.name);

          return (
            <div
              key={day.date}
              className="rounded-[18px] bg-card shadow-soft overflow-hidden relative"
              style={isToday ? { boxShadow: `0 4px 20px ${phaseColor}20` } : {}}
            >
              {isToday && (
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[18px]" style={{ backgroundColor: phaseColor }} />
              )}

              <button
                onClick={() => { haptic("light"); setExpandedDay(expanded ? null : i); }}
                className="touch-card w-full text-left p-4 md:p-5"
              >
                <div className="flex items-center justify-between">
                  <div className={isToday ? "pl-2" : ""}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-body text-sm font-bold text-foreground">{day.dayName}</span>
                      <span className="font-body text-xs text-muted-foreground">
                        {new Date(day.date).toLocaleDateString("en-NZ", { day: "numeric", month: "long" })}
                      </span>
                      {isToday && (
                        <span className="font-body text-[11px] font-bold rounded-full px-2.5 py-0.5" style={{ backgroundColor: `${phaseColor}15`, color: phaseColor }}>
                          Today
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="font-body text-sm text-foreground">
                        <span className="font-semibold text-muted-foreground w-[70px] inline-block">Breakfast</span> {day.breakfast.name}
                      </p>
                      <p className="font-body text-sm text-foreground">
                        <span className="font-semibold text-muted-foreground w-[70px] inline-block">Lunch</span> {day.lunch.name}
                        {day.lunch.isLeftover && <span className="text-muted-foreground italic"> (batch)</span>}
                      </p>
                      <p className="font-body text-sm text-foreground">
                        <span className="font-semibold text-muted-foreground w-[70px] inline-block">Dinner</span> {day.dinner.name}
                        {day.dinner.isLeftover && <span className="text-muted-foreground italic"> (leftover)</span>}
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
                    <div className="px-4 md:px-5 pb-4 pt-2 border-t border-border space-y-3">
                      {[
                        { label: "Breakfast", meal: day.breakfast, recipe: bRecipe },
                        { label: "Morning Snack", meal: day.morningSnack },
                        { label: "Lunch", meal: day.lunch, recipe: lRecipe },
                        { label: "Afternoon Snack", meal: day.afternoonSnack },
                        { label: "Dinner", meal: day.dinner, recipe: dRecipe },
                      ].map(({ label, meal, recipe }) => (
                        <div key={label} className="flex items-start gap-3">
                          {recipe?.image && (
                            <img src={recipe.image} alt={meal.name} className="h-12 w-12 rounded-lg object-contain bg-secondary/20 flex-shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="font-body text-xs uppercase tracking-[0.15em] font-semibold" style={{ color: phaseColor }}>{label}</p>
                            <p className="font-body text-sm text-foreground mt-0.5">{meal.name}</p>
                            {recipe && (
                              <p className="font-body text-xs text-muted-foreground mt-0.5">
                                {recipe.prepTime} · Serves {recipe.serves}
                              </p>
                            )}
                            {meal.isLeftover && (
                              <p className="font-body text-xs italic text-muted-foreground">Reheat from previous day</p>
                            )}
                          </div>
                        </div>
                      ))}
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
          Generate shopping list
        </button>
        <button
          onClick={onStartFresh}
          className="touch-btn w-full flex items-center justify-center gap-2 rounded-[14px] py-3 min-h-[44px] font-body text-sm text-muted-foreground bg-secondary transition-all active:opacity-90"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Start fresh
        </button>
      </div>
    </div>
  );
}
