import { useState, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Lock, Unlock, RefreshCw, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCycle } from "@/contexts/CycleContext";
import { Phase } from "@/lib/cycle-utils";
import { PHASE_MEAL_PLANS } from "@/data/meal-plans";
import { findRecipeByName } from "@/lib/recipe-index";
import { haptic } from "@/hooks/use-mobile";
import {
  formatDateShort,
  PrepPreferences as PrepPrefsType,
  AIMealPlan,
  AIPlannedDay,
  AIMeal,
  getAIMealPlan,
  saveAIMealPlan,
  clearAIMealPlan,
  getSavedPreferences,
  DEFAULT_PREFS,
} from "@/lib/weekly-planner";
import PrepPreferences from "./PrepPreferences";
import SmartShoppingList from "./SmartShoppingList";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#C4526E",
  follicular: "#5C4A9E",
  ovulatory: "#C47A8A",
  luteal: "#9B89B4",
};

const PHASE_FOCUS: Record<Phase, string> = {
  menstrual: "Iron-rich, gentle and warming",
  follicular: "Light, energising, high fibre",
  ovulatory: "Antioxidant-rich, raw and vibrant",
  luteal: "Warming, sustaining, magnesium-rich",
};

const PHASE_SNACKS: Record<Phase, { morning: string; afternoon: string }> = {
  menstrual: { morning: "Dark chocolate & trail mix", afternoon: "Turmeric latte" },
  follicular: { morning: "Fermented cashew yoghurt with kiwi", afternoon: "Edamame with sea salt" },
  ovulatory: { morning: "Fresh fruit salad with mint", afternoon: "Almonds & fresh berries" },
  luteal: { morning: "Apple slices with tahini", afternoon: "Chocolate banana nice cream" },
};

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function getPhaseFromCycleDay(cycleDay: number): Phase {
  if (cycleDay >= 1 && cycleDay <= 5) return "menstrual";
  if (cycleDay >= 6 && cycleDay <= 13) return "follicular";
  if (cycleDay === 14) return "ovulatory";
  return "luteal";
}

function getStaticMeals(cycleDay: number) {
  const phase = getPhaseFromCycleDay(cycleDay);
  const plan = PHASE_MEAL_PLANS[phase];
  const phaseRanges: Record<Phase, [number, number]> = {
    menstrual: [1, 7], follicular: [8, 14], ovulatory: [15, 21], luteal: [22, 28],
  };
  const [start] = phaseRanges[phase];
  const dayIndex = (cycleDay - start) % plan.days.length;
  const dayPlan = plan.days[Math.max(0, dayIndex)];
  return {
    phase,
    breakfast: dayPlan.breakfast.split(" — ")[0],
    lunch: dayPlan.lunch.split(" — ")[0],
    dinner: dayPlan.dinner.split(" — ")[0],
  };
}

function getMondayOfWeek(date: Date, weekOffset: number = 0): Date {
  const d = new Date(date);
  const dayOfWeek = d.getDay();
  const diff = (dayOfWeek + 6) % 7;
  d.setDate(d.getDate() - diff + weekOffset * 7);
  d.setHours(0, 0, 0, 0);
  return d;
}

interface WeekDay {
  date: Date;
  dateStr: string;
  dayName: string;
  cycleDay: number;
  phase: Phase;
  breakfast: string | AIMeal;
  lunch: string | AIMeal;
  dinner: string | AIMeal;
  morningSnack?: string | AIMeal;
  afternoonSnack?: string | AIMeal;
  isToday: boolean;
  isAI: boolean;
}

type Step = "prep" | "plan" | "shop";

export default function MyWeekTab() {
  const { currentPhase, currentCycleDay, getCycleDayForDate } = useCycle();
  const [weekOffset, setWeekOffset] = useState(0);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [aiPlan, setAiPlan] = useState<AIMealPlan | null>(getAIMealPlan);
  const [prefs, setPrefs] = useState<PrepPrefsType>(getSavedPreferences() || DEFAULT_PREFS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [regeneratingKey, setRegeneratingKey] = useState<string | null>(null);
  const [step, setStep] = useState<Step>(aiPlan ? "plan" : "prep");

  const todayStr = new Date().toISOString().split("T")[0];

  // Lock state
  const lockedMeals = aiPlan?.lockedMeals || {};
  const toggleLock = useCallback((cycleDay: number, mealType: string) => {
    if (!aiPlan) return;
    haptic("light");
    const key = `${cycleDay}-${mealType}`;
    const updated = { ...aiPlan, lockedMeals: { ...aiPlan.lockedMeals, [key]: !aiPlan.lockedMeals[key] } };
    setAiPlan(updated);
    saveAIMealPlan(updated);
  }, [aiPlan]);

  // Generate full plan via AI
  const handleBuildPlan = useCallback(async (preferences: PrepPrefsType) => {
    setPrefs(preferences);
    setIsGenerating(true);
    haptic("medium");

    try {
      const { data, error } = await supabase.functions.invoke("meal-plan-ai", {
        body: { preferences, mode: "full", lockedMeals: {} },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const days: AIPlannedDay[] = Array.isArray(data.plan) ? data.plan : [];
      if (days.length === 0) throw new Error("No meals generated");

      const plan: AIMealPlan = {
        days,
        prepPreferences: preferences,
        createdAt: Date.now(),
        lockedMeals: {},
      };
      setAiPlan(plan);
      saveAIMealPlan(plan);
      setStep("plan");
      toast.success("Your personalised 28-day plan is ready!");
    } catch (e: any) {
      console.error("AI plan generation failed:", e);
      toast.error(e.message || "Failed to generate plan. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // Regenerate single meal
  const handleRegenerateMeal = useCallback(async (cycleDay: number, mealType: string) => {
    if (!aiPlan) return;
    const key = `${cycleDay}-${mealType}`;
    setRegeneratingKey(key);
    haptic("medium");

    try {
      const { data, error } = await supabase.functions.invoke("meal-plan-ai", {
        body: {
          preferences: aiPlan.prepPreferences,
          mode: "regenerate_meal",
          existingPlan: aiPlan,
          regenerateDay: cycleDay,
          regenerateMeal: mealType,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const newMeal = data.plan as AIMeal;
      const updatedDays = aiPlan.days.map(d => {
        if (d.cycleDay === cycleDay) {
          return { ...d, [mealType]: newMeal };
        }
        return d;
      });
      const updated = { ...aiPlan, days: updatedDays };
      setAiPlan(updated);
      saveAIMealPlan(updated);
      toast.success("Meal regenerated!");
    } catch (e: any) {
      toast.error(e.message || "Failed to regenerate meal");
    } finally {
      setRegeneratingKey(null);
    }
  }, [aiPlan]);

  const handleStartFresh = () => {
    haptic("light");
    clearAIMealPlan();
    setAiPlan(null);
    setStep("prep");
  };

  // Build week data
  const weekData = useMemo(() => {
    const monday = getMondayOfWeek(new Date(), weekOffset);
    const days: WeekDay[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const cycleDay = getCycleDayForDate(date);
      const dateStr = date.toISOString().split("T")[0];

      // Check if we have AI plan data for this cycle day
      const aiDay = aiPlan?.days.find(d => d.cycleDay === cycleDay);

      if (aiDay) {
        days.push({
          date, dateStr, dayName: DAY_NAMES[i], cycleDay,
          phase: aiDay.phase || getPhaseFromCycleDay(cycleDay),
          breakfast: aiDay.breakfast,
          lunch: aiDay.lunch,
          dinner: aiDay.dinner,
          morningSnack: aiDay.morningSnack,
          afternoonSnack: aiDay.afternoonSnack,
          isToday: dateStr === todayStr,
          isAI: true,
        });
      } else {
        const meals = getStaticMeals(cycleDay);
        days.push({
          date, dateStr, dayName: DAY_NAMES[i], cycleDay,
          phase: meals.phase,
          breakfast: meals.breakfast,
          lunch: meals.lunch,
          dinner: meals.dinner,
          isToday: dateStr === todayStr,
          isAI: false,
        });
      }
    }

    const phaseCounts: Record<Phase, number> = { menstrual: 0, follicular: 0, ovulatory: 0, luteal: 0 };
    days.forEach(d => phaseCounts[d.phase]++);
    const dominantPhase = (Object.entries(phaseCounts) as [Phase, number][])
      .sort((a, b) => b[1] - a[1])[0][0];

    return { days, monday, dominantPhase };
  }, [weekOffset, getCycleDayForDate, todayStr, aiPlan]);

  if (step === "prep") {
    return (
      <PrepPreferences
        initialPrefs={prefs}
        phase={currentPhase}
        onBuild={handleBuildPlan}
        isGenerating={isGenerating}
      />
    );
  }

  if (step === "shop" && aiPlan) {
    // Determine which cycle week we're in (1-4)
    const currentWeek = Math.ceil(currentCycleDay / 7);
    return (
      <div className="space-y-4">
        <button
          onClick={() => { haptic("light"); setStep("plan"); }}
          className="font-body text-xs text-muted-foreground underline"
        >
          ← Back to plan
        </button>
        <SmartShoppingList plan={aiPlan} weekNumber={currentWeek} />
      </div>
    );
  }

  const { days, monday, dominantPhase } = weekData;
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const phaseColor = PHASE_HEX[dominantPhase];
  const headerLabel = `${dominantPhase.charAt(0).toUpperCase() + dominantPhase.slice(1)} Week`;
  const dateRangeLabel = `${formatDateShort(monday)} – ${formatDateShort(sunday)}`;

  const getMealName = (meal: string | AIMeal): string =>
    typeof meal === "string" ? meal : meal.name;

  return (
    <div className="space-y-5">
      {/* Header with navigation */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <button
            onClick={() => { haptic("light"); setWeekOffset(o => o - 1); setExpandedDay(null); }}
            className="touch-btn p-2 rounded-full bg-secondary"
          >
            <ChevronLeft className="h-4 w-4 text-foreground" />
          </button>

          <div className="text-center">
            <h2 className="font-display text-2xl font-bold italic text-foreground">{headerLabel}</h2>
            <p className="font-body text-sm mt-0.5" style={{ color: phaseColor }}>{dateRangeLabel}</p>
            <p className="font-body text-xs text-muted-foreground mt-0.5">{PHASE_FOCUS[dominantPhase]}</p>
            {aiPlan && (
              <p className="font-body text-[10px] text-muted-foreground mt-0.5">✨ AI-personalised plan</p>
            )}
          </div>

          <button
            onClick={() => { haptic("light"); setWeekOffset(o => o + 1); setExpandedDay(null); }}
            className="touch-btn p-2 rounded-full bg-secondary"
          >
            <ChevronRight className="h-4 w-4 text-foreground" />
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 mt-1">
          {weekOffset !== 0 && (
            <button
              onClick={() => { haptic("light"); setWeekOffset(0); setExpandedDay(null); }}
              className="font-body text-xs text-muted-foreground underline"
            >
              Back to this week
            </button>
          )}
          <button
            onClick={handleStartFresh}
            className="font-body text-xs text-muted-foreground underline"
          >
            Rebuild plan
          </button>
          {aiPlan && (
            <button
              onClick={() => { haptic("light"); setStep("shop"); }}
              className="font-body text-xs text-primary underline"
            >
              Shopping list →
            </button>
          )}
        </div>
      </div>

      {/* Day cards */}
      <div className="space-y-3">
        {days.map((day, i) => {
          const expanded = expandedDay === i;
          const dayPhaseColor = PHASE_HEX[day.phase];

          const mealSlots = [
            { key: "breakfast", label: "Breakfast", meal: day.breakfast },
            { key: "morningSnack", label: "Morning Snack", meal: day.morningSnack || PHASE_SNACKS[day.phase].morning },
            { key: "lunch", label: "Lunch", meal: day.lunch },
            { key: "afternoonSnack", label: "Afternoon Snack", meal: day.afternoonSnack || PHASE_SNACKS[day.phase].afternoon },
            { key: "dinner", label: "Dinner", meal: day.dinner },
          ];

          return (
            <div
              key={day.dateStr}
              className="rounded-[18px] bg-card shadow-soft overflow-hidden relative"
              style={day.isToday ? { boxShadow: `0 4px 20px ${dayPhaseColor}20` } : {}}
            >
              {day.isToday && (
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[18px]" style={{ backgroundColor: dayPhaseColor }} />
              )}

              <button
                onClick={() => { haptic("light"); setExpandedDay(expanded ? null : i); }}
                className="touch-card w-full text-left p-4 md:p-5"
              >
                <div className="flex items-center justify-between">
                  <div className={day.isToday ? "pl-2" : ""}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-body text-sm font-bold text-foreground">{day.dayName}</span>
                      <span className="font-body text-xs text-muted-foreground">
                        {day.date.toLocaleDateString("en-NZ", { day: "numeric", month: "long" })}
                      </span>
                      {day.isToday && (
                        <span className="font-body text-[11px] font-bold rounded-full px-2.5 py-0.5"
                          style={{ backgroundColor: `${dayPhaseColor}15`, color: dayPhaseColor }}>
                          Today
                        </span>
                      )}
                      <span className="font-body text-[10px] font-medium rounded-full px-2 py-0.5 bg-secondary"
                        style={{ color: dayPhaseColor }}>
                        D{day.cycleDay}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="font-body text-sm text-foreground">
                        <span className="font-semibold text-muted-foreground w-[70px] inline-block">Breakfast</span> {getMealName(day.breakfast)}
                      </p>
                      <p className="font-body text-sm text-foreground">
                        <span className="font-semibold text-muted-foreground w-[70px] inline-block">Lunch</span> {getMealName(day.lunch)}
                      </p>
                      <p className="font-body text-sm text-foreground">
                        <span className="font-semibold text-muted-foreground w-[70px] inline-block">Dinner</span> {getMealName(day.dinner)}
                        {typeof day.dinner !== "string" && day.dinner.isLeftover && (
                          <span className="text-muted-foreground italic"> (leftover)</span>
                        )}
                      </p>
                    </div>
                  </div>
                  {expanded
                    ? <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    : <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  }
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
                    <div className="px-4 md:px-5 pb-4 pt-2 border-t border-border space-y-4">
                      {mealSlots.map(({ key, label, meal }) => {
                        const isAIMeal = typeof meal !== "string" && meal && typeof meal === "object" && "ingredients" in meal;
                        const aiMeal = isAIMeal ? (meal as AIMeal) : null;
                        const mealName = typeof meal === "string" ? meal : (meal as AIMeal)?.name || "";
                        const lockKey = `${day.cycleDay}-${key}`;
                        const isLocked = lockedMeals[lockKey];
                        const isRegenerating = regeneratingKey === lockKey;
                        const staticRecipe = !isAIMeal ? findRecipeByName(mealName) : null;

                        return (
                          <div key={key} className="space-y-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-3 flex-1 min-w-0">
                                {staticRecipe?.image && (
                                  <img src={staticRecipe.image} alt={mealName} className="h-12 w-12 rounded-lg object-contain bg-secondary/20 flex-shrink-0" />
                                )}
                                <div className="min-w-0 flex-1">
                                  <p className="font-body text-xs uppercase tracking-[0.15em] font-semibold" style={{ color: dayPhaseColor }}>{label}</p>
                                  <p className="font-body text-sm text-foreground mt-0.5">{mealName}</p>
                                  {aiMeal && (
                                    <p className="font-body text-xs text-muted-foreground mt-0.5">
                                      {aiMeal.prepTime} · Serves {aiMeal.serves}
                                    </p>
                                  )}
                                  {staticRecipe && (
                                    <p className="font-body text-xs text-muted-foreground mt-0.5">
                                      {staticRecipe.prepTime} · Serves {staticRecipe.serves}
                                    </p>
                                  )}
                                  {aiMeal?.isLeftover && aiMeal.leftoverFrom && (
                                    <p className="font-body text-xs italic text-muted-foreground">
                                      Leftover from Day {aiMeal.leftoverFrom}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Lock & Regenerate */}
                              {day.isAI && key !== "morningSnack" && key !== "afternoonSnack" && (
                                <div className="flex items-center gap-1 flex-shrink-0 mt-1">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); toggleLock(day.cycleDay, key); }}
                                    className="p-1.5 rounded-full hover:bg-secondary transition-colors"
                                    title={isLocked ? "Unlock meal" : "Lock meal"}
                                  >
                                    {isLocked
                                      ? <Lock className="h-3 w-3 text-foreground" />
                                      : <Unlock className="h-3 w-3 text-muted-foreground" />
                                    }
                                  </button>
                                  {!isLocked && (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleRegenerateMeal(day.cycleDay, key); }}
                                      disabled={isRegenerating}
                                      className="p-1.5 rounded-full hover:bg-secondary transition-colors disabled:opacity-50"
                                      title="Regenerate this meal"
                                    >
                                      {isRegenerating
                                        ? <Loader2 className="h-3 w-3 text-muted-foreground animate-spin" />
                                        : <RefreshCw className="h-3 w-3 text-muted-foreground" />
                                      }
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* AI Meal details */}
                            {aiMeal && !aiMeal.isLeftover && (
                              <div className="mt-2 space-y-2">
                                {aiMeal.keyNutrients && aiMeal.keyNutrients.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {aiMeal.keyNutrients.map(n => (
                                      <span key={n} className="font-body text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{n}</span>
                                    ))}
                                  </div>
                                )}
                                <div>
                                  <p className="font-body text-xs font-semibold text-foreground mb-1">Ingredients</p>
                                  <ul className="space-y-0.5">
                                    {aiMeal.ingredients.map((ing, idx) => (
                                      <li key={idx} className="font-body text-xs text-muted-foreground">• {ing}</li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <p className="font-body text-xs font-semibold text-foreground mb-1">Method</p>
                                  <ol className="space-y-1">
                                    {aiMeal.method.map((step, idx) => (
                                      <li key={idx} className="font-body text-xs text-muted-foreground">
                                        <span className="font-semibold text-foreground">{idx + 1}.</span> {step}
                                      </li>
                                    ))}
                                  </ol>
                                </div>
                                {aiMeal.nutritionalNote && (
                                  <p className="font-body text-xs italic text-muted-foreground mt-1">
                                    💡 {aiMeal.nutritionalNote}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Static recipe details */}
                            {staticRecipe && (
                              <div className="mt-2 space-y-2">
                                {staticRecipe.keyNutrients.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {staticRecipe.keyNutrients.map(n => (
                                      <span key={n} className="font-body text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{n}</span>
                                    ))}
                                  </div>
                                )}
                                <div>
                                  <p className="font-body text-xs font-semibold text-foreground mb-1">Ingredients</p>
                                  <ul className="space-y-0.5">
                                    {staticRecipe.ingredients.map((ing, idx) => (
                                      <li key={idx} className="font-body text-xs text-muted-foreground">• {ing}</li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <p className="font-body text-xs font-semibold text-foreground mb-1">Method</p>
                                  <ol className="space-y-1">
                                    {staticRecipe.method.map((step, idx) => (
                                      <li key={idx} className="font-body text-xs text-muted-foreground">
                                        <span className="font-semibold text-foreground">{idx + 1}.</span> {step}
                                      </li>
                                    ))}
                                  </ol>
                                </div>
                                {staticRecipe.phaseBenefit && (
                                  <p className="font-body text-xs italic text-muted-foreground mt-1">
                                    💡 {staticRecipe.phaseBenefit}
                                  </p>
                                )}
                              </div>
                            )}
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
