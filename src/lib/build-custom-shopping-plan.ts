/**
 * Synthesize an `AIMealPlan`-shaped object from the user's custom recipe
 * picks + the static phase fallback, so the existing `SmartShoppingList`
 * component can ingest it without modification.
 *
 * For each cycle day in the requested range:
 *   1. If the user has picked a recipe for breakfast/lunch/dinner, use it.
 *   2. Otherwise fall back to the static phase plan for that day.
 *   3. Snacks come from the static phase snacks (handled by SmartShoppingList already).
 */
import { Phase, getPhaseFromDay } from "./cycle-utils";
import { findRecipeById, findRecipeByName } from "./recipe-index";
import { PHASE_MEAL_PLANS } from "@/data/meal-plans";
import {
  AIMeal,
  AIMealPlan,
  AIPlannedDay,
  PrepPreferences,
} from "./weekly-planner";
import { CustomMealPlan, MealSlot } from "@/hooks/useCustomMealPlan";
import type { Recipe } from "@/data/meal-plans";

const STATIC_PREFS: PrepPreferences = {
  breakfast: "rotate",
  lunch: "rotate",
  dinner: "mix",
  prepDays: [],
  adults: 1,
  kids: 0,
};

function recipeToAIMeal(recipe: Recipe, mealType: AIMeal["mealType"]): AIMeal {
  return {
    name: recipe.name,
    phase: recipe.phase,
    mealType,
    prepTime: recipe.prepTime,
    serves: recipe.serves,
    ingredients: recipe.ingredients,
    method: recipe.method,
    nutritionalNote: recipe.phaseBenefit || "",
    keyNutrients: recipe.keyNutrients,
  };
}

function fallbackStaticMeal(cycleDay: number, slot: MealSlot, phase: Phase): AIMeal {
  const phaseRanges: Record<Phase, [number, number]> = {
    menstrual: [1, 7],
    follicular: [8, 14],
    ovulatory: [15, 21],
    luteal: [22, 28],
  };
  const [start] = phaseRanges[phase];
  const plan = PHASE_MEAL_PLANS[phase];
  const dayIndex = Math.max(0, (cycleDay - start) % plan.days.length);
  const dayPlan = plan.days[dayIndex] || plan.days[plan.days.length - 1];
  const rawName =
    slot === "breakfast" ? dayPlan.breakfast :
    slot === "lunch" ? dayPlan.lunch :
    dayPlan.dinner;
  const cleanName = (rawName || "").split(" — ")[0];
  const recipe = findRecipeByName(cleanName);
  if (recipe) return recipeToAIMeal(recipe, slot);
  // Last-ditch placeholder so the type stays valid even if a name doesn't resolve.
  return {
    name: cleanName || `${slot[0].toUpperCase()}${slot.slice(1)}`,
    phase,
    mealType: slot,
    prepTime: "",
    serves: 1,
    ingredients: [],
    method: [],
    nutritionalNote: "",
  };
}

function snackPlaceholder(phase: Phase, when: "morningSnack" | "afternoonSnack"): AIMeal {
  return {
    name: when === "morningSnack" ? "Morning snack" : "Afternoon snack",
    phase,
    mealType: "snack",
    prepTime: "",
    serves: 1,
    ingredients: [],
    method: [],
    nutritionalNote: "",
  };
}

/**
 * Build an AIMealPlan covering the supplied cycle days using the user's
 * custom picks where present and the static plan elsewhere.
 */
export function buildCustomShoppingPlan(
  cycleDays: number[],
  customPlan: CustomMealPlan,
  prepPreferences: Partial<PrepPreferences> = {}
): AIMealPlan {
  const days: AIPlannedDay[] = cycleDays.map(cycleDay => {
    const phase = getPhaseFromDay(cycleDay);
    const picks = customPlan[cycleDay] || {};
    const resolveSlot = (slot: MealSlot): AIMeal => {
      const recipeId = picks[slot];
      if (recipeId) {
        const recipe = findRecipeById(recipeId);
        if (recipe) return recipeToAIMeal(recipe, slot);
      }
      return fallbackStaticMeal(cycleDay, slot, phase);
    };
    return {
      cycleDay,
      phase,
      breakfast: resolveSlot("breakfast"),
      morningSnack: snackPlaceholder(phase, "morningSnack"),
      lunch: resolveSlot("lunch"),
      afternoonSnack: snackPlaceholder(phase, "afternoonSnack"),
      dinner: resolveSlot("dinner"),
    };
  });

  return {
    days,
    prepPreferences: { ...STATIC_PREFS, ...prepPreferences },
    createdAt: Date.now(),
    lockedMeals: {},
  };
}
