import type { Recipe } from "@/data/meal-plans";
import { KIDS_RECIPE_BANK, type KidsRecipe } from "@/data/kids-recipes";
import { ALL_RECIPES } from "@/lib/recipe-index";
import { facetsFor, type RecipeFacets } from "@/lib/recipe-facets";

/** Facets for a grown-up / family recipe (prep + cook time counted). */
export function adultFacets(r: Recipe): RecipeFacets {
  return facetsFor(`a:${r.id}`, {
    name: r.name, ingredients: r.ingredients, method: r.method, tags: r.tags,
    prepTime: r.prepTime, cookTime: r.cookTime, category: r.category,
  });
}

/** Facets for a kids-bank recipe. */
export function kidsFacets(r: KidsRecipe): RecipeFacets {
  return facetsFor(`k:${r.id}`, {
    name: r.name, ingredients: r.ingredients, method: r.method, tags: r.tags,
    prepTime: r.prepTime, mealType: r.mealType,
  });
}

export type LunchboxMain =
  | { kind: "kids"; recipe: KidsRecipe; facets: RecipeFacets }
  | { kind: "adult"; recipe: Recipe; facets: RecipeFacets };

/** Every recipe that meets the school-lunch rules, deduplicated by name. */
export function schoolLunchRecipes(): LunchboxMain[] {
  const seen = new Set<string>();
  const out: LunchboxMain[] = [];
  const add = (item: LunchboxMain) => {
    const key = item.recipe.name.toLowerCase().trim();
    if (seen.has(key)) return;
    seen.add(key);
    out.push(item);
  };
  for (const r of KIDS_RECIPE_BANK) {
    const f = kidsFacets(r);
    if (f.schoolLunch) add({ kind: "kids", recipe: r, facets: f });
  }
  for (const r of ALL_RECIPES) {
    const f = adultFacets(r);
    if (f.schoolLunch) add({ kind: "adult", recipe: r, facets: f });
  }
  return out;
}
