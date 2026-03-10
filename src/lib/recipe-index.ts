/**
 * Canonical Recipe Index — single source of truth for all recipe lookups.
 * Every tab (Today, Plans, My Week, Recipes, Shop) should use these helpers.
 */
import { Recipe, RECIPES } from "@/data/meal-plans";
import { PDF_RECIPES } from "@/data/pdf-recipes";
import { BAKING_RECIPES } from "@/data/baking-recipes";

/** All meal recipes (not baking) */
export const ALL_MEAL_RECIPES: Recipe[] = [...RECIPES, ...PDF_RECIPES];

/** All recipes including baking */
export const ALL_RECIPES: Recipe[] = [...ALL_MEAL_RECIPES, ...BAKING_RECIPES];

/** Lookup by exact recipeId — fast O(1) */
const RECIPE_BY_ID = new Map<string, Recipe>();
ALL_RECIPES.forEach((r) => RECIPE_BY_ID.set(r.id, r));

export function findRecipeById(id: string): Recipe | undefined {
  return RECIPE_BY_ID.get(id);
}

/** Fuzzy lookup by meal name — tries exact match first, then substring */
export function findRecipeByName(mealName: string): Recipe | undefined {
  const lower = mealName.toLowerCase();
  return ALL_MEAL_RECIPES.find((r) => r.name.toLowerCase() === lower) ||
    ALL_MEAL_RECIPES.find((r) =>
      lower.includes(r.name.toLowerCase()) || r.name.toLowerCase().includes(lower)
    );
}

/** Get recipe image or undefined (single source of truth for illustrations) */
export function getRecipeImage(recipeIdOrName: string): string | undefined {
  const byId = findRecipeById(recipeIdOrName);
  if (byId) return byId.image;
  const byName = findRecipeByName(recipeIdOrName);
  return byName?.image;
}
