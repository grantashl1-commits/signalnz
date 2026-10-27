/**
 * The one recipe catalog the Recipes tab browses.
 *
 * Signal ships recipes in five separate shapes:
 *   - `ALL_RECIPES`            the Nourish library + SIGNAL rewrites (443)
 *   - `KIDS_RECIPE_BANK`       the kid-approved bank              (370)
 *   - `PLANT_BASED_FAMILY_RECIPES`  the plant-based family cookbook (61)
 *   - `MATTHEW_KIDS_RECIPES`   Matthew's kids cookbook             (34)
 *   - `NZ_AU_FAMILY_RECIPES`   the NZ & AU cookbook                (28)
 *
 * That is 936 recipes, and the brief is that the Recipes tab shows *all* of
 * them and narrows with filters rather than making the member guess which
 * "book" a dish lives in. The cookbook tab keeps the three curated books as
 * books; this module exists so browse is one list.
 *
 * Everything is normalised to `Recipe` so a single card, a single detail sheet
 * and a single set of filters work across all five sources. The Cookbook tab's
 * own grouping is unaffected — it reads the source modules directly.
 */
import type { Recipe, RecipeCategory } from "@/data/meal-plans";
import { KIDS_RECIPE_BANK, type KidsMealType, type KidsRecipe } from "@/data/kids-recipes";
import type { FamilyRecipe, FamilyRecipeCategory } from "@/data/plant-based-family-recipes";
import { PLANT_BASED_FAMILY_RECIPES } from "@/data/plant-based-family-recipes";
import { MATTHEW_KIDS_RECIPES } from "@/data/matthew-kids-recipes";
import { NZ_AU_FAMILY_RECIPES } from "@/data/nz-au-family-recipes";
import { ALL_RECIPES } from "@/lib/recipe-index";
import { tagsFor, type RecipeTag } from "@/lib/recipe-tags";

const KIDS_MEAL_TO_CATEGORY: Record<KidsMealType, RecipeCategory> = {
  breakfast: "breakfast",
  lunch: "meal",
  dinner: "meal",
  snack: "snack",
  baking: "baking",
  dessert: "snack",
};

const FAMILY_TO_CATEGORY: Record<FamilyRecipeCategory, RecipeCategory> = {
  breakfast: "breakfast",
  lunch: "meal",
  dinner: "meal",
  snack: "snack",
  baking: "baking",
  dessert: "snack",
};

/** `"25 min"` -> `25`. Returns 0 when there is no number. */
function minutesFrom(text?: string): number {
  const m = String(text ?? "").match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

function asPrep(minutes: number): string {
  return minutes > 0 ? `${minutes} min` : "";
}

/** Kids-bank recipe -> the shared `Recipe` shape. */
export function kidsToRecipe(r: KidsRecipe): Recipe {
  const meals = r.mealType ?? [];
  const primary = meals.find((m) => m !== "dessert") ?? meals[0];
  return {
    id: r.id,
    name: r.name,
    // Kids recipes were never assigned a cycle phase; inventing one would put a
    // fish finger in a luteal meal plan, so they stay phase-agnostic.
    phase: "any",
    serves: Number.isFinite(r.serves) ? r.serves : 4,
    prepTime: r.prepTime ?? "",
    keyNutrients: [],
    ingredients: r.ingredients ?? [],
    method: r.method ?? [],
    phaseBenefit: "",
    category: primary ? KIDS_MEAL_TO_CATEGORY[primary] : "snack",
    protein: r.protein,
    image: r.image,
    tags: r.tags ?? [],
    mealType: meals,
  };
}

/** Cookbook (`FamilyRecipe`) entry -> the shared `Recipe` shape. */
export function familyToRecipe(f: FamilyRecipe): Recipe {
  return {
    id: f.id,
    name: f.name,
    phase: "any",
    serves: Number.isFinite(f.serves) ? f.serves : 4,
    prepTime: asPrep(f.prepMinutes),
    cookTime: f.cookMinutes > 0 ? asPrep(f.cookMinutes) : undefined,
    keyNutrients: [],
    ingredients: f.ingredients ?? [],
    method: f.method ?? [],
    phaseBenefit: "",
    category: FAMILY_TO_CATEGORY[f.category] ?? "meal",
    image: f.image,
    kidAlternative: f.kidAlternative,
    tags: [],
    mealType: [f.category],
  };
}

/**
 * One catalog entry. `kidContext` marks recipes that come from a children's
 * collection, so the "Kid-friendly" filter can trust the source rather than
 * guessing from the name.
 */
export interface CatalogEntry {
  recipe: Recipe;
  kidContext: boolean;
  /** Which module the recipe came from — used for the Cookbook cross-link and debugging. */
  source: "library" | "kids" | "plant-based-family" | "matthew-kids" | "nz-au-family";
}

const library: CatalogEntry[] = ALL_RECIPES.map((recipe) => ({
  recipe,
  kidContext: false,
  source: "library" as const,
}));

const kids: CatalogEntry[] = KIDS_RECIPE_BANK.map((r) => ({
  recipe: kidsToRecipe(r),
  kidContext: true,
  source: "kids" as const,
}));

const plantBasedFamily: CatalogEntry[] = PLANT_BASED_FAMILY_RECIPES.map((f) => ({
  recipe: familyToRecipe(f),
  kidContext: false,
  source: "plant-based-family" as const,
}));

const matthewKids: CatalogEntry[] = MATTHEW_KIDS_RECIPES.map((f) => ({
  recipe: familyToRecipe(f),
  kidContext: true,
  source: "matthew-kids" as const,
}));

const nzAu: CatalogEntry[] = NZ_AU_FAMILY_RECIPES.map((f) => ({
  recipe: familyToRecipe(f),
  kidContext: false,
  source: "nz-au-family" as const,
}));

/**
 * Order matters for de-duplication only: the long-standing library wins, then
 * the kids bank, then the cookbooks. Ids are namespaced per source so a
 * collision would be a genuine bug, but the guard keeps the list unique.
 */
const RAW_CATALOG: CatalogEntry[] = [...library, ...kids, ...plantBasedFamily, ...matthewKids, ...nzAu];

const seenIds = new Set<string>();
/** Every recipe in the app, de-duplicated by id — 936 today. */
export const CATALOG: CatalogEntry[] = RAW_CATALOG.filter((entry) => {
  if (seenIds.has(entry.recipe.id)) return false;
  seenIds.add(entry.recipe.id);
  return true;
});

/** Just the recipes, for anything that only needs the list. */
export const CATALOG_RECIPES: Recipe[] = CATALOG.map((entry) => entry.recipe);

const ENTRY_BY_ID = new Map<string, CatalogEntry>(CATALOG.map((entry) => [entry.recipe.id, entry]));

export function catalogEntry(id: string): CatalogEntry | undefined {
  return ENTRY_BY_ID.get(id);
}

/** Every tag that applies to a catalog entry, memoised in `recipe-tags`. */
export function catalogTags(entry: CatalogEntry): RecipeTag[] {
  const r = entry.recipe;
  return tagsFor(r.id, {
    name: r.name,
    ingredients: r.ingredients,
    method: r.method,
    tags: r.tags,
    prepTime: r.prepTime,
    cookTime: r.cookTime,
    category: r.category,
    mealType: r.mealType,
    kidContext: entry.kidContext,
  });
}

/** Pre-computed `id -> tags`, so filtering never recomputes during a render. */
export const CATALOG_TAGS: Map<string, RecipeTag[]> = new Map(
  CATALOG.map((entry) => [entry.recipe.id, catalogTags(entry)]),
);

/** Counts per source, handy for the tab subtitle and for tests. */
export const CATALOG_COUNTS = {
  library: library.length,
  kids: kids.length,
  plantBasedFamily: plantBasedFamily.length,
  matthewKids: matthewKids.length,
  nzAu: nzAu.length,
  total: CATALOG.length,
};
