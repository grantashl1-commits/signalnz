import type { Recipe } from "@/data/meal-plans";
import { setCustomMeal, type MealSlot } from "@/hooks/useCustomMealPlan";
import { getAIMealPlan } from "@/lib/weekly-planner";
export function addRecipeToMyWeek(recipe: Recipe, cycleDay: number, slot: MealSlot, date?: string) {
  setCustomMeal(cycleDay, slot, recipe.id, date);
  return { addedToAIPlan: Boolean(getAIMealPlan()) };
}
