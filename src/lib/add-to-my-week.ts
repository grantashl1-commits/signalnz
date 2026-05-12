/**
 * Single entry-point for "Add to my week" from anywhere (Discover, etc).
 *
 * Writes to BOTH stores so the meal shows up regardless of which planner the
 * user is on:
 *   - signal_custom_meal_plan_v1 (used by static-plan users via useCustomMealPlan)
 *   - signal_ai_meal_plan        (used by AI-plan users — patches the slot in place)
 */
import type { Recipe } from "@/data/meal-plans";
import type { MealSlot } from "@/hooks/useCustomMealPlan";
import {
  AIMealPlan,
  AIMeal,
  getAIMealPlan,
  saveAIMealPlan,
} from "@/lib/weekly-planner";
import { getPhaseFromDay } from "@/lib/cycle-utils";

const CUSTOM_KEY = "signal_custom_meal_plan_v1";

function recipeToAIMeal(r: Recipe, slot: MealSlot, cycleDay: number): AIMeal {
  return {
    name: r.name,
    phase: getPhaseFromDay(cycleDay),
    mealType: slot,
    prepTime: r.prepTime || "—",
    serves: r.serves || 1,
    ingredients: r.ingredients,
    method: r.method,
    nutritionalNote: r.phaseBenefit || (r.keyNutrients || []).join(", ") || "",
    keyNutrients: r.keyNutrients,
  };
}

export function addRecipeToMyWeek(
  recipe: Recipe,
  cycleDay: number,
  slot: MealSlot
): { addedToAIPlan: boolean } {
  // 1. Always update the custom-pick store so static-plan view honours it
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(CUSTOM_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      const next = {
        ...parsed,
        [cycleDay]: { ...(parsed[cycleDay] || {}), [slot]: recipe.id },
      };
      window.localStorage.setItem(CUSTOM_KEY, JSON.stringify(next));
    } catch {
      // localStorage unavailable — silent
    }
  }

  // 2. If user has an AI plan, patch the matching day/slot too
  const aiPlan = getAIMealPlan();
  if (aiPlan) {
    const updatedDays = aiPlan.days.map(d =>
      d.cycleDay === cycleDay ? { ...d, [slot]: recipeToAIMeal(recipe, slot, cycleDay) } : d
    );
    const updated: AIMealPlan = { ...aiPlan, days: updatedDays };
    saveAIMealPlan(updated);
    return { addedToAIPlan: true };
  }

  return { addedToAIPlan: false };
}
