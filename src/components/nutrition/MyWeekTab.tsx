import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import RecipeImage from "@/components/nutrition/RecipeImage";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Lock, Unlock, RefreshCw, Loader2, ClipboardList, Baby, Pencil, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MealPrepGuide from "./MealPrepGuide";
import { useCycle } from "@/contexts/CycleContext";
import { Phase } from "@/lib/cycle-utils";
import { PHASE_MEAL_PLANS, type Recipe } from "@/data/meal-plans";
import { findRecipeByName, findRecipeById } from "@/lib/recipe-index";
import { useCustomMealPlan, type MealSlot } from "@/hooks/useCustomMealPlan";
import RecipePickerSheet from "./RecipePickerSheet";
import { buildCustomShoppingPlan } from "@/lib/build-custom-shopping-plan";
import { haptic } from "@/hooks/use-mobile";
import {
  formatDateShort,
  PrepPreferences as PrepPrefsType,
  AIMealPlan,
  AIPlannedDay,
  AIMeal,
  KidsMeal,
  getAIMealPlan,
  saveAIMealPlan,
  clearAIMealPlan,
  getSavedPreferences,
  DEFAULT_PREFS,
} from "@/lib/weekly-planner";
import PrepPreferences from "./PrepPreferences";
import SmartShoppingList from "./SmartShoppingList";
import KidsDinnerAlt from "./KidsDinnerAlt";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { buildDbMealPlanFull, regenerateMealFromDb } from "@/lib/build-db-meal-plan";

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
  kidsLunch?: KidsMeal;
  kidsDinner?: KidsMeal;
  isToday: boolean;
  isAI: boolean;
}

type Step = "prep" | "plan" | "shop" | "prepguide";

export default function MyWeekTab() {
  const { currentPhase, currentCycleDay, getCycleDayForDate } = useCycle();
  const { user } = useAuth();
  const { calorieTarget, proteinTargetG, carbTargetG, fatTargetG, dietaryDislikes, movementGoals: profileMovementGoals } = useProfile();
  const [weekOffset, setWeekOffset] = useState(0);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [aiPlan, setAiPlan] = useState<AIMealPlan | null>(getAIMealPlan);
  const [prefs, setPrefs] = useState<PrepPrefsType>(getSavedPreferences() || DEFAULT_PREFS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [regeneratingKey, setRegeneratingKey] = useState<string | null>(null);
  // AI meal plan generation is deprecated — every user now lands directly on
  // the static cycle-aware plan. Manual recipe selection from the new
  // nourish-recipes library will replace AI generation in a future iteration.
  const [step, setStep] = useState<Step>("plan");
  // Tracks which lunch/dinner slots are showing the kids alternative view
  const [kidsViewSlots, setKidsViewSlots] = useState<Set<string>>(new Set());
  const supabasePlanLoaded = useRef(false);

  // Manual meal picks — overrides the static plan per cycleDay/slot.
  const { plan: customPlan, setMeal: setCustomMeal, removeMeal: removeCustomMeal, getMeal: getCustomMealId } = useCustomMealPlan();
  const [picker, setPicker] = useState<{ cycleDay: number; slot: MealSlot; phase: Phase } | null>(null);

  const toggleKidsView = useCallback((slotKey: string) => {
    haptic("light");
    setKidsViewSlots(prev => {
      const next = new Set(prev);
      if (next.has(slotKey)) next.delete(slotKey);
      else next.add(slotKey);
      return next;
    });
  }, []);

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
          if (Array.isArray(restoredPlan?.days) && restoredPlan.days.length > 0) {
            setAiPlan(restoredPlan);
            saveAIMealPlan(restoredPlan);
            setStep("plan");
          }
        }
      } catch {
        // silent fallback to localStorage plan
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
    } catch {
      // silent — plan is already persisted in localStorage
    }
  }, [user, currentCycleDay, currentPhase]);

  // Build full plan from the Nourish recipe library — no AI, no edge call.
  const handleBuildPlan = useCallback(async (preferences: PrepPrefsType) => {
    setPrefs(preferences);
    setIsGenerating(true);
    haptic("medium");

    try {
      const plan = buildDbMealPlanFull(preferences);
      if (!plan.days.length) throw new Error("No matching recipes — try widening your dietary filters.");
      setAiPlan(plan);
      saveAIMealPlan(plan);
      setStep("plan");
      toast.success("Your four-week plan is here.");
      // Persist to Supabase in background
      savePlanToSupabase(plan);
    } catch (e: any) {
      toast.error(e.message || "The plan didn't come through — try again in a moment.");
    } finally {
      setIsGenerating(false);
    }
  }, [savePlanToSupabase]);

  // Swap a single meal slot for another DB recipe.
  const handleRegenerateMeal = useCallback(async (cycleDay: number, mealType: string) => {
    if (!aiPlan) return;
    if (mealType !== "breakfast" && mealType !== "lunch" && mealType !== "dinner") return;
    const key = `${cycleDay}-${mealType}`;
    setRegeneratingKey(key);
    haptic("medium");
    try {
      const newMeal = regenerateMealFromDb(aiPlan, cycleDay, mealType as "breakfast" | "lunch" | "dinner");
      if (!newMeal) throw new Error("No alternative found");
      const updatedDays = aiPlan.days.map(d =>
        d.cycleDay === cycleDay ? { ...d, [mealType]: newMeal } : d
      );
      const updated = { ...aiPlan, days: updatedDays };
      setAiPlan(updated);
      saveAIMealPlan(updated);
      toast.success("A new one — held.");
    } catch (e: any) {
      toast.error(e.message || "That didn't land — try again in a moment.");
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

  // Rebuild the entire 4-week plan from the full recipe library, keeping
  // current preferences and any meals the user has locked.
  const handleRegenerateWeek = useCallback(async () => {
    setIsGenerating(true);
    haptic("medium");
    try {
      const fresh = buildDbMealPlanFull(prefs);
      if (!fresh.days.length) throw new Error("No matching recipes — try widening your dietary filters.");

      // Preserve locked meals from the existing plan
      const locked = aiPlan?.lockedMeals || {};
      if (aiPlan && Object.values(locked).some(Boolean)) {
        const oldByDay = new Map(aiPlan.days.map(d => [d.cycleDay, d]));
        fresh.days = fresh.days.map(d => {
          const old = oldByDay.get(d.cycleDay);
          if (!old) return d;
          const next = { ...d };
          (["breakfast", "lunch", "dinner"] as const).forEach(slot => {
            if (locked[`${d.cycleDay}-${slot}`]) (next as any)[slot] = (old as any)[slot];
          });
          return next;
        });
        fresh.lockedMeals = { ...locked };
      }

      setAiPlan(fresh);
      saveAIMealPlan(fresh);
      setStep("plan");
      toast.success("Your week — held anew.");
      savePlanToSupabase(fresh);
    } catch (e: any) {
      toast.error(e.message || "That didn't land — try again in a moment.");
    } finally {
      setIsGenerating(false);
    }
  }, [prefs, aiPlan, savePlanToSupabase]);


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
      const aiDay = aiPlan?.days?.find(d => d.cycleDay === cycleDay);

      if (aiDay) {
        days.push({
          date, dateStr, dayName: DAY_NAMES[i], cycleDay,
          phase: aiDay.phase || getPhaseFromCycleDay(cycleDay),
          breakfast: aiDay.breakfast,
          lunch: aiDay.lunch,
          dinner: aiDay.dinner,
          morningSnack: aiDay.morningSnack,
          afternoonSnack: aiDay.afternoonSnack,
          kidsLunch: aiDay.kidsLunch,
          kidsDinner: aiDay.kidsDinner,
          isToday: dateStr === todayStr,
          isAI: true,
        });
      } else {
        const meals = getStaticMeals(cycleDay);
        // Apply user's manual picks on top of the static plan.
        const pickB = getCustomMealId(cycleDay, "breakfast");
        const pickL = getCustomMealId(cycleDay, "lunch");
        const pickD = getCustomMealId(cycleDay, "dinner");
        const recB = pickB ? findRecipeById(pickB) : undefined;
        const recL = pickL ? findRecipeById(pickL) : undefined;
        const recD = pickD ? findRecipeById(pickD) : undefined;
        days.push({
          date, dateStr, dayName: DAY_NAMES[i], cycleDay,
          phase: meals.phase,
          breakfast: recB?.name ?? meals.breakfast,
          lunch: recL?.name ?? meals.lunch,
          dinner: recD?.name ?? meals.dinner,
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
  }, [weekOffset, getCycleDayForDate, todayStr, aiPlan, customPlan, getCustomMealId]);

  // Note: the AI prep/build step has been removed. Users land directly on the
  // static cycle plan. PrepPreferences and handleBuildPlan are retained as
  // dead code only because legacy aiPlan data still renders for users who
  // generated one before. A new manual recipe-picker will replace this whole
  // flow in a follow-up.

  if (step === "shop") {
    const currentWeek = Math.ceil(currentCycleDay / 7);
    // Use the legacy AI plan if it exists; otherwise synthesize a plan from
    // the user's manual picks plus the static phase fallback so the shopping
    // list reflects exactly what the visible week will be eating.
    const planForShop = aiPlan ?? buildCustomShoppingPlan(
      weekData.days.map(d => d.cycleDay),
      customPlan
    );
    return (
      <div className="space-y-4">
        <button
          onClick={() => { haptic("light"); setStep("plan"); }}
          className="font-body text-xs text-muted-foreground underline"
        >
          ← Back to plan
        </button>
        <SmartShoppingList plan={planForShop} weekNumber={currentWeek} />
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

  const getMealName = (meal: string | AIMeal | null | undefined): string => {
    if (!meal) return "—";
    const raw = typeof meal === "string" ? meal : meal.name;
    return (raw || "").replace(/^Signal\s+/i, "");
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
                Week {Math.min(4, Math.max(1, weekOffset + Math.ceil(currentCycleDay / 7)))} of 4
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
          {/* Week quick-nav */}
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
          {aiPlan && (
            <button
              onClick={handleStartFresh}
              className="font-body text-xs text-muted-foreground underline"
            >
              Clear plan
            </button>
          )}
          {aiPlan && (
            <button
              onClick={() => { haptic("light"); setStep("prepguide"); }}
              className="font-body text-xs text-primary underline flex items-center gap-1"
            >
              <ClipboardList className="h-3 w-3" />
              Prep guide
            </button>
          )}
          <button
            onClick={() => { haptic("light"); setStep("shop"); }}
            className="font-body text-xs text-primary underline"
          >
            Shopping list →
          </button>
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
                        {typeof day.dinner !== "string" && (day.dinner as AIMeal | undefined)?.isLeftover && (
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

                              {/* Pick / reset for static plans */}
                              {!day.isAI && (key === "breakfast" || key === "lunch" || key === "dinner") && (
                                <div className="flex items-center gap-1 flex-shrink-0 mt-1">
                                  {getCustomMealId(day.cycleDay, key as MealSlot) && (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); haptic("light"); removeCustomMeal(day.cycleDay, key as MealSlot); }}
                                      className="p-1.5 rounded-full hover:bg-secondary transition-colors"
                                      title="Reset to static plan"
                                    >
                                      <RotateCcw className="h-3 w-3 text-muted-foreground" />
                                    </button>
                                  )}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      haptic("light");
                                      setPicker({ cycleDay: day.cycleDay, slot: key as MealSlot, phase: day.phase });
                                    }}
                                    className="p-1.5 rounded-full hover:bg-secondary transition-colors"
                                    title="Pick a recipe from the library"
                                  >
                                    <Pencil className="h-3 w-3 text-muted-foreground" />
                                  </button>
                                </div>
                              )}

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

                            {/* Kids alternative for breakfast or non-AI plans */}
                            {prefs.kids > 0 && key === "breakfast" && mealName && (
                              <KidsDinnerAlt mealName={mealName} mealType={key as any} phase={day.phase} />
                            )}

                            {/* Kids meal toggle — only for lunch/dinner on AI plans with kids */}
                            {day.isAI && (key === "lunch" || key === "dinner") &&
                              (aiPlan?.prepPreferences?.kids ?? 0) > 0 &&
                              (key === "lunch" ? day.kidsLunch : day.kidsDinner) && (() => {
                                const kidsMeal = key === "lunch" ? day.kidsLunch : day.kidsDinner;
                                const slotKey = `${day.dateStr}-${key}`;
                                const showingKids = kidsViewSlots.has(slotKey);
                                return (
                                  <div className="mt-3">
                                    <button
                                      onClick={(e) => { e.stopPropagation(); toggleKidsView(slotKey); }}
                                      className="font-body text-xs text-primary flex items-center gap-1.5 py-1"
                                    >
                                      <Baby className="h-3 w-3" />
                                      {showingKids ? "← Back to adult meal" : "My kids won't eat that →"}
                                    </button>
                                    {showingKids && kidsMeal && (
                                      <div className="mt-2 bg-primary/5 rounded-xl p-3 space-y-2">
                                        <div className="flex items-center gap-2">
                                          <Baby className="h-3.5 w-3.5 text-primary/50 flex-shrink-0" />
                                          <p className="font-body text-sm font-semibold text-foreground">{kidsMeal.name}</p>
                                        </div>
                                        <p className="font-body text-xs text-muted-foreground">
                                          {kidsMeal.prepTime} · Serves {kidsMeal.serves}
                                        </p>
                                        {kidsMeal.proteinMatch && (
                                          <p className="font-body text-xs italic text-muted-foreground">
                                            Uses the same {kidsMeal.proteinMatch} as the adult meal
                                          </p>
                                        )}
                                        <div>
                                          <p className="font-body text-xs font-semibold text-foreground mb-1">Ingredients</p>
                                          <ul className="space-y-0.5">
                                            {kidsMeal.ingredients.map((ing, idx) => (
                                              <li key={idx} className="font-body text-xs text-muted-foreground">• {ing}</li>
                                            ))}
                                          </ul>
                                        </div>
                                        <div>
                                          <p className="font-body text-xs font-semibold text-foreground mb-1">Method</p>
                                          <ol className="space-y-1 list-none">
                                            {kidsMeal.method.map((s, idx) => (
                                              <li key={idx} className="font-body text-xs text-muted-foreground flex gap-2">
                                                <span className="font-semibold text-foreground flex-shrink-0">{idx + 1}.</span>
                                                <span>{s.replace(/^\d+\.\s*/, "")}</span>
                                              </li>
                                            ))}
                                          </ol>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })()
                            }
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

      <AnimatePresence>
        {picker && (
          <RecipePickerSheet
            phase={picker.phase}
            title={`Pick ${picker.slot} for cycle day ${picker.cycleDay}`}
            onClose={() => setPicker(null)}
            onPick={(recipe: Recipe) => {
              setCustomMeal(picker.cycleDay, picker.slot, recipe.id);
              setPicker(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
