import type { Phase } from "@/lib/cycle-utils";
import { PHASE_MEAL_PLANS, type Recipe } from "@/data/meal-plans";
import { findRecipeById, findRecipeByName } from "@/lib/recipe-index";
import { getAIMealPlan, type AIMeal } from "@/lib/weekly-planner";

export type MealSlot = "breakfast" | "lunch" | "dinner";

export interface TodayMeal {
  slot: MealSlot;
  label: string;
  name: string;
  recipe?: Recipe;
  aiMeal?: AIMeal;
}

/** First cycle day of each phase — matches CycleContext (1–5 / 6–13 / 14 / 15–28). */
const PHASE_START: Record<Phase, number> = { menstrual: 1, follicular: 6, ovulatory: 14, luteal: 15 };

function phaseForCycleDay(cycleDay: number): Phase {
  if (cycleDay <= 5) return "menstrual";
  if (cycleDay <= 13) return "follicular";
  if (cycleDay === 14) return "ovulatory";
  return "luteal";
}

/**
 * The phase meal-plan day for a cycle day. Uses the same phase boundaries as
 * the rest of the app, so the meals always match the phase on screen and
 * consecutive days get different meals.
 */
export function getPhasePlanDay(cycleDay: number) {
  const phase = phaseForCycleDay(cycleDay);
  const plan = PHASE_MEAL_PLANS[phase];
  const dayIndex = (cycleDay - PHASE_START[phase]) % plan.days.length;
  return { phase, day: plan.days[Math.max(0, dayIndex)] };
}

const CUSTOM_PLAN_KEY = "signal_custom_meal_plan_v1";

/** Hand-picked recipe ids for a cycle day (see useCustomMealPlan). */
function readCustomDay(cycleDay: number): Partial<Record<MealSlot, string>> {
  try {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(CUSTOM_PLAN_KEY) : null;
    if (!raw) return {};
    const plan = JSON.parse(raw) as Record<number, Partial<Record<MealSlot, string>>>;
    return plan?.[cycleDay] ?? {};
  } catch {
    return {};
  }
}

/** Apply the member's own picks on top of the generated plan. */
function withCustomPicks(meals: TodayMeal[], cycleDay: number): TodayMeal[] {
  const custom = readCustomDay(cycleDay);
  return meals.map((m) => {
    const id = custom[m.slot];
    const recipe = id ? findRecipeById(id) : undefined;
    return recipe ? { ...m, name: recipe.name, recipe, aiMeal: undefined } : m;
  });
}

/**
 * The day's three meals: the member's own picks first, then their AI plan
 * for this cycle day, otherwise the phase meal plan. Shared by Today, the
 * Eat tab and the family week planner so every screen agrees.
 */
export function getTodayMeals(cycleDay: number): { meals: TodayMeal[]; isAI: boolean } {
  const aiToday = getAIMealPlan()?.days.find((d) => d.cycleDay === cycleDay) ?? null;
  if (aiToday) {
    const meals = (["breakfast", "lunch", "dinner"] as const)
      .map((slot) => {
        const ai = aiToday[slot];
        const name = ai?.name ?? "";
        return { slot, label: slot[0].toUpperCase() + slot.slice(1), name, recipe: findRecipeByName(name), aiMeal: ai };
      })
      .filter((m) => m.name);
    return { meals: withCustomPicks(meals, cycleDay), isAI: true };
  }

  const { day: dayPlan } = getPhasePlanDay(cycleDay);
  if (!dayPlan) return { meals: withCustomPicks([], cycleDay), isAI: false };
  const meals: TodayMeal[] = (["breakfast", "lunch", "dinner"] as const).map((slot) => ({
    slot,
    label: slot[0].toUpperCase() + slot.slice(1),
    name: dayPlan[slot],
    recipe: findRecipeByName(dayPlan[slot]),
  }));
  return { meals: withCustomPicks(meals, cycleDay), isAI: false };
}
