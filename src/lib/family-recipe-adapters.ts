/**
 * The main recipe library and the kids' recipe bank in the cookbook's FamilyRecipe
 * shape, so the Cookbook tab can browse every collection the same way.
 */
import { ALL_RECIPES } from "@/lib/recipe-index";
import { KIDS_RECIPE_BANK, type KidsMealType } from "@/data/kids-recipes";
import type { FamilyRecipe, FamilyRecipeCategory } from "@/data/plant-based-family-recipes";
import type { Recipe } from "@/data/meal-plans";

/** "20 min", "1 hr 10 min", "45 minutes" → minutes; 0 when unknown. */
function minutes(text?: string): number {
  if (!text) return 0;
  const hours = Number(/(\d+(?:\.\d+)?)\s*h/i.exec(text)?.[1] ?? 0);
  const mins = Number(/(\d+)\s*m/i.exec(text)?.[1] ?? (hours ? 0 : /(\d+)/.exec(text)?.[1] ?? 0));
  return Math.round(hours * 60 + mins);
}

function libraryCategory(r: Recipe): FamilyRecipeCategory {
  if (r.category === "baking") return "baking";
  if (r.category === "snack") return "snack";
  if (r.category === "breakfast" || r.mealType?.includes("breakfast")) return "breakfast";
  if (r.mealType?.includes("lunch") && !r.mealType.includes("dinner")) return "lunch";
  return "dinner";
}

const kidsCategory = (types: KidsMealType[]): FamilyRecipeCategory =>
  (["breakfast", "lunch", "dinner", "snack", "baking", "dessert"] as const).find(t => types.includes(t)) ?? "dinner";

export const MAIN_LIBRARY_RECIPES: FamilyRecipe[] = ALL_RECIPES.map(r => ({
  id: r.id,
  name: r.name,
  category: libraryCategory(r),
  serves: r.serves || 1,
  prepMinutes: minutes(r.prepTime),
  cookMinutes: minutes(r.cookTime),
  ingredients: r.ingredients,
  method: r.method,
  kidAlternative: r.kidAlternative,
  image: r.image ?? "",
}));

export const KIDS_BANK_RECIPES: FamilyRecipe[] = KIDS_RECIPE_BANK.map(r => ({
  id: r.id,
  name: r.name,
  category: kidsCategory(r.mealType),
  serves: r.serves || 1,
  prepMinutes: minutes(r.prepTime),
  cookMinutes: 0,
  ingredients: r.ingredients,
  method: r.method,
  image: r.image ?? "",
}));
