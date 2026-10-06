import type { Phase } from "@/lib/cycle-utils";
import { PHASE_MEAL_PLANS, type Recipe } from "@/data/meal-plans";
import { findRecipeByName } from "@/lib/recipe-index";
import { getAIMealPlan, type AIMeal } from "@/lib/weekly-planner";

export type MealSlot = "breakfast" | "lunch" | "dinner";

export interface TodayMeal {
  slot: MealSlot;
  label: string;
  name: string;
  recipe?: Recipe;
  aiMeal?: AIMeal;
}

function getPlanDayForCycleDay(cycleDay: number) {
  if (cycleDay <= 7) return { phase: "menstrual" as Phase, dayIndex: cycleDay - 1 };
  if (cycleDay <= 14) return { phase: "follicular" as Phase, dayIndex: cycleDay - 8 };
  if (cycleDay <= 21) return { phase: "ovulatory" as Phase, dayIndex: cycleDay - 15 };
  return { phase: "luteal" as Phase, dayIndex: cycleDay - 22 };
}

/**
 * Today's three meals: the member's AI plan when one exists for this cycle day,
 * otherwise the phase meal plan. Shared by Today and the Eat tab.
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
    return { meals, isAI: true };
  }

  const { phase, dayIndex } = getPlanDayForCycleDay(cycleDay);
  const plan = PHASE_MEAL_PLANS[phase];
  const dayPlan = plan.days[Math.min(dayIndex, plan.days.length - 1)];
  if (!dayPlan) return { meals: [], isAI: false };
  const meals: TodayMeal[] = (["breakfast", "lunch", "dinner"] as const).map((slot) => ({
    slot,
    label: slot[0].toUpperCase() + slot.slice(1),
    name: dayPlan[slot],
    recipe: findRecipeByName(dayPlan[slot]),
  }));
  return { meals, isAI: false };
}
