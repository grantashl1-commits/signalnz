import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import RecipeImage from "@/components/nutrition/RecipeImage";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Lock, Unlock, RefreshCw, Loader2, ClipboardList } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MealPrepGuide from "./MealPrepGuide";
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
  attachKidsMeals,
  swapKidsMeal,
} from "@/lib/weekly-planner";
import PrepPreferences from "./PrepPreferences";
import SmartShoppingList from "./SmartShoppingList";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";

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

type Step = "prep" | "plan" | "shop" | "prepguide";

export default function MyWeekTab() {
  const { currentPhase, currentCycleDay, getCycleDayForDate } = useCycle();
  const { user } = useAuth();
  const { calorieTarget, proteinTargetG, carbTargetG, fatTargetG, dietaryDislikes, dietaryPreferences } = useProfile();
  const [weekOffset, setWeekOffset] = useState(0);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [aiPlan, setAiPlan] = useState<AIMealPlan | null>(getAIMealPlan);
  const [prefs, setPrefs] = useState<PrepPrefsType>(getSavedPreferences() || DEFAULT_PREFS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [regeneratingKey, setRegeneratingKey] = useState<string | null>(null);
  const [step, setStep] = useState<Step>(aiPlan ? "plan" : "prep");
  const supabasePlanLoaded = useRef(false);

  // Phase 4B: try to restore latest nutrition plan from Supabase on mount
  useEffect(() => {
    if (!user || supabasePlanLoaded.current || aiPlan) return;
    supabasePlanLoaded.current = true;
    (async () => {
      try {
        const { data } = await (supabase as any)
          .from("user_plans")
          .select("plan_data, generated_at")
          .eq("user_id", user.id)
          .eq("plan_type", "nutrition")
          .order("generated_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (data?.plan_data) {
          const restoredPlan = data.plan_data as AIMealPlan;
          // Backfill kids meals if the saved plan predates the kids-at-generation flow.
          const finalPlan = (restoredPlan.prepPreferences?.kids ?? 0) > 0
            ? attachKidsMeals(restoredPlan)
            : restoredPlan;
          setAiPlan(finalPlan);
          saveAIMealPlan(finalPlan);
          setStep("plan");
        }
      } catch (e) {
        console.error("Failed to restore plan from Supabase:", e);
      }
    })();
  }, [user, aiPlan]);

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

  // Phase 4B: save plan to Supabase user_plans table
  const savePlanToSupabase = useCallback(async (plan: AIMealPlan) => {
    if (!user) return;
    try {
      await (supabase as any)
        .from("user_plans")
        .insert({
          user_id: user.id,
          plan_type: "nutrition",
          week_number: Math.ceil(currentCycleDay / 7),
          cycle_week: Math.ceil(currentCycleDay / 7),
          plan_data: plan as any,
          cycle_phase_at_generation: currentPhase,
        });
    } catch (e) {
      console.error("Failed to save plan to Supabase:", e);
    }
  }, [user, currentCycleDay, currentPhase]);

  // Generate full plan via AI
  const handleBuildPlan = useCallback(async (preferences: PrepPrefsType) => {
    setPrefs(preferences);
    setIsGenerating(true);
    haptic("medium");

    try {
      // Generate in 4 batches of 7 days to avoid timeouts
      const batches = [
        { start: 1, end: 7 },
        { start: 8, end: 14 },
        { start: 15, end: 21 },
        { start: 22, end: 28 },
      ];

      let allDays: AIPlannedDay[] = [];

      // Phase 4A: pass user profile macro targets to Edge Function
      const profileExtras = {
        userCalorieTarget: calorieTarget ?? undefined,
        userProteinTargetG: proteinTargetG ?? undefined,
        userCarbTargetG: carbTargetG ?? undefined,
        userFatTargetG: fatTargetG ?? undefined,
        userDietaryDislikes: dietaryDislikes?.length ? dietaryDislikes : undefined,
        userDietaryPrefs: dietaryPreferences?.length ? dietaryPreferences : undefined,
      };

      for (const batch of batches) {
        const { data, error } = await supabase.functions.invoke("meal-plan-ai", {
          body: {
            preferences,
            mode: "full",
            lockedMeals: {},
            startCycleDay: batch.start,
            endCycleDay: batch.end,
            ...profileExtras,
          },
        });

        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        const days: AIPlannedDay[] = Array.isArray(data.plan) ? data.plan : [];
        if (days.length === 0) throw new Error(`No meals generated for days ${batch.start}-${batch.end}`);
        allDays = [...allDays, ...days];
      }

      const plan: AIMealPlan = {
        days: allDays,
        prepPreferences: preferences,
        createdAt: Date.now(),
        lockedMeals: {},
      };
      // Attach kid-friendly alternatives for each lunch/dinner so their
      // ingredients flow into the shopping list.
      const planWithKids = attachKidsMeals(plan);
      setAiPlan(planWithKids);
      saveAIMealPlan(planWithKids);
      setStep("plan");
      toast.success("Your personalised 4-week plan is ready!");

      // Phase 4B: persist to Supabase in background
      savePlanToSupabase(planWithKids);
    } catch (e: any) {
      console.error("AI plan generation failed:", e);
      toast.error(e.message || "Failed to generate plan. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }, [calorieTarget, proteinTargetG, carbTargetG, fatTargetG, dietaryDislikes, dietaryPreferences, savePlanToSupabase]);

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
      let updated = { ...aiPlan, days: updatedDays };
      // Re-attach kids meals if the regenerated slot was a lunch/dinner so the
      // kid alternative tracks the new parent meal and the shopping list updates.
      if (mealType === "lunch" || mealType === "dinner") {
        updated = attachKidsMeals(updated);
      }
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

  const handleSwapKidsMeal = useCallback((cycleDay: number, mealType: "lunch" | "dinner") => {
    if (!aiPlan) return;
    haptic("light");
    const { plan: updated, swapped } = swapKidsMeal(aiPlan, cycleDay, mealType);
    if (!swapped) {
      toast.info("No other compatible kids' recipes found.");
      return;
    }
    setAiPlan(updated);
    saveAIMealPlan(updated);
    toast.success("Swapped kids' meal — shopping list updated.");
  }, [aiPlan]);


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

  if (step === "prepguide" && aiPlan) {
    const currentWeek = Math.ceil(currentCycleDay / 7);
    const prepWeekDates = weekData.days.map(d => ({
      date: d.date,
      dateStr: d.dateStr,
      dayName: d.dayName,
    }));
    return (
      <MealPrepGuide
        plan={aiPlan}
        weekNumber={currentWeek}
        weekDates={prepWeekDates}
        phase={weekData.dominantPhase}
        onBack={() => { haptic("light"); setStep("plan"); }}
      />
    );
  }

  const { days, monday, dominantPhase } = weekData;
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const phaseColor = PHASE_HEX[dominantPhase];
  const headerLabel = `${dominantPhase.charAt(0).toUpperCase() + dominantPhase.slice(1)} Week`;
  const dateRangeLabel = `${formatDateShort(monday)} – ${formatDateShort(sunday)}`;

  const getMealName = (meal: string | AIMeal): string => {
    const raw = typeof meal === "string" ? meal : meal.name;
    return raw.replace(/^Signal\s+/i, "");
  };

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
              <p className="font-body text-[10px] text-muted-foreground mt-0.5">
                AI plan · Week {Math.min(4, Math.max(1, weekOffset + Math.ceil(currentCycleDay / 7)))} of 4
              </p>
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
          {/* Week quick-nav for AI plans */}
          {aiPlan && (
            <div className="flex items-center gap-1">
              {[0, 1, 2, 3].map(w => {
                const currentWeekNum = Math.ceil(currentCycleDay / 7) - 1;
                const isActive = weekOffset === (w - currentWeekNum);
                return (
                  <button
                    key={w}
                    onClick={() => { haptic("light"); setWeekOffset(w - (Math.ceil(currentCycleDay / 7) - 1)); setExpandedDay(null); }}
                    className={`font-body text-[10px] font-medium rounded-full px-2.5 py-1 transition-all ${
                      isActive ? "text-white" : "bg-secondary text-muted-foreground"
                    }`}
                    style={isActive ? { backgroundColor: phaseColor } : {}}
                  >
                    Wk {w + 1}
                  </button>
                );
              })}
            </div>
          )}
          {weekOffset !== 0 && !aiPlan && (
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
              onClick={() => { haptic("light"); setStep("prepguide"); }}
              className="font-body text-xs text-primary underline flex items-center gap-1"
            >
              <ClipboardList className="h-3 w-3" />
              Prep guide
            </button>
          )}
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
                                {(staticRecipe?.image || mealName) && (
                                  <RecipeImage recipeName={mealName} recipeImage={staticRecipe?.image} variant="thumb" />
                                )}
                                <div className="min-w-0 flex-1">
                                  <p className="font-body text-xs uppercase tracking-[0.15em] font-semibold" style={{ color: dayPhaseColor }}>{label}</p>
                                  <p className="font-body text-sm text-foreground mt-0.5">{mealName.replace(/^Signal\s+/i, "")}</p>
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
                                  <ol className="space-y-1 list-none">
                                    {aiMeal.method.map((step, idx) => (
                                      <li key={idx} className="font-body text-xs text-muted-foreground flex gap-2">
                                        <span className="font-semibold text-foreground flex-shrink-0">{idx + 1}.</span>
                                        <span>{step.replace(/^\d+\.\s*/, "")}</span>
                                      </li>
                                    ))}
                                  </ol>
                                </div>
                                {aiMeal.nutritionalNote && (
                                  <p className="font-body text-xs italic text-muted-foreground mt-1">
                                    {aiMeal.nutritionalNote}
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
                                  <ol className="space-y-1 list-none">
                                    {staticRecipe.method.map((step, idx) => (
                                      <li key={idx} className="font-body text-xs text-muted-foreground flex gap-2">
                                        <span className="font-semibold text-foreground flex-shrink-0">{idx + 1}.</span>
                                        <span>{step.replace(/^\d+\.\s*/, "")}</span>
                                      </li>
                                    ))}
                                  </ol>
                                </div>
                                {staticRecipe.phaseBenefit && (
                                  <p className="font-body text-xs italic text-muted-foreground mt-1">
                                    {staticRecipe.phaseBenefit}
                                  </p>
                                )}
                              </div>
                            )}
                            {/* Kids alternative — auto-attached at plan generation */}
                            {(key === "lunch" || key === "dinner") && (() => {
                              const kidsMeal = key === "lunch" ? (day as any).kidsLunch : (day as any).kidsDinner;
                              if (!kidsMeal) return null;
                              return (
                                <div
                                  className="mt-3 rounded-xl p-3"
                                  style={{
                                    borderLeft: `3px solid ${dayPhaseColor}`,
                                    backgroundColor: `${dayPhaseColor}08`,
                                  }}
                                >
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <span className="font-body text-[9px] uppercase tracking-wider font-semibold" style={{ color: dayPhaseColor }}>
                                      Kids' option
                                    </span>
                                    <span className="font-body text-[9px] text-muted-foreground">·</span>
                                    <span className="font-body text-[9px] text-muted-foreground">{kidsMeal.prepTime} · serves {kidsMeal.serves}</span>
                                  </div>
                                  <p className="font-hand text-base font-bold" style={{ color: dayPhaseColor }}>
                                    {kidsMeal.name}
                                  </p>
                                  <p className="font-body text-[10px] text-muted-foreground italic mt-1">
                                    Ingredients are already in your shopping list.
                                  </p>
                                </div>
                              );
                            })()}
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
