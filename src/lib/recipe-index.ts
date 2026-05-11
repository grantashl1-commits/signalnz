/**
 * Canonical Recipe Index — single source of truth for all recipe lookups.
 * Every tab (Today, Plans, My Week, Recipes, Shop) should use these helpers.
 *
 * As of the SIGNAL rebrand, this index is backed entirely by
 * src/data/nourish-recipes.ts. The previous AI-generated recipe files are
 * archived in src/data/ but no longer imported here.
 */
import { Recipe } from "@/data/meal-plans";
import { NOURISH_RECIPES } from "@/data/nourish-recipes";
import { SIGNAL_REWRITES } from "@/data/signal-rewrites";
import imageMaps from "@/data/image-maps.json";

/** All recipes — handcrafted nourish library + 216 SIGNAL rewrites. */
const _seen = new Set<string>();
export const ALL_RECIPES: Recipe[] = [...NOURISH_RECIPES, ...SIGNAL_REWRITES].filter(r => {
  if (_seen.has(r.id)) return false;
  _seen.add(r.id);
  return true;
});

/**
 * Backwards-compatible alias.
 * Some older callers split "meal" recipes from baking/snacks. The new library
 * already covers every category, so meal lookups simply read from ALL_RECIPES.
 */
export const ALL_MEAL_RECIPES: Recipe[] = ALL_RECIPES;

/** Lookup by exact recipeId — fast O(1) */
const RECIPE_BY_ID = new Map<string, Recipe>();
ALL_RECIPES.forEach((r) => RECIPE_BY_ID.set(r.id, r));

export function findRecipeById(id: string): Recipe | undefined {
  return RECIPE_BY_ID.get(id);
}

/** Normalize "&" / "and" and common punctuation for comparison */
function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[''`\-–—]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Extract meaningful words (drop filler words) */
function keywords(s: string): string[] {
  const STOP = new Set(["with", "and", "the", "a", "an", "of", "in", "on", "for", "to"]);
  return norm(s)
    .split(" ")
    .filter((w) => w.length > 1 && !STOP.has(w));
}

/** Word-overlap score: how many keywords from query appear in candidate */
function overlapScore(query: string, candidate: string): number {
  const qWords = keywords(query);
  const cWords = keywords(candidate);
  if (qWords.length === 0 || cWords.length === 0) return 0;
  const cSet = new Set(cWords);
  let matches = 0;
  for (const w of qWords) {
    if (cSet.has(w)) {
      matches++;
    } else {
      // Partial word match (e.g. "lentil" matches "lentils")
      for (const c of cSet) {
        if (c.startsWith(w) || w.startsWith(c)) {
          matches += 0.8;
          break;
        }
      }
    }
  }
  // Score = matched fraction of query words * matched fraction of candidate words
  return (matches / qWords.length) * (matches / Math.max(cWords.length, qWords.length));
}

/** Fuzzy lookup by recipe name — exact normalized → substring → word-overlap */
export function findRecipeByName(mealName: string): Recipe | undefined {
  const n = norm(mealName);

  // 1. Exact normalized match
  const exact = ALL_RECIPES.find((r) => norm(r.name) === n);
  if (exact) return exact;

  // 2. Substring match (either direction)
  const sub = ALL_RECIPES.find(
    (r) => n.includes(norm(r.name)) || norm(r.name).includes(n)
  );
  if (sub) return sub;

  // 3. Word-overlap scoring — pick best match above threshold
  let bestScore = 0;
  let bestRecipe: Recipe | undefined;
  const THRESHOLD = 0.35;

  for (const r of ALL_RECIPES) {
    const score = overlapScore(mealName, r.name);
    if (score > bestScore) {
      bestScore = score;
      bestRecipe = r;
    }
  }

  return bestScore >= THRESHOLD ? bestRecipe : undefined;
}

/**
 * Slugify recipe name to match the conventions used by Lovable's image filenames
 * (lowercase, hyphenated, no apostrophes/punctuation, "&"→"and").
 */
function slugifyRecipeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[''`]/g, "")
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const RECIPE_IMAGE_SLUGS = new Set<string>(Object.keys(imageMaps.recipes ?? {}));
const recipeImageBySlug = imageMaps.recipes as Record<string, string>;

/**
 * Resolve the illustration path for a recipe.
 * Order of preference:
 *   1. Recipe entry's explicit `image` field (overrides everything)
 *   2. Direct slug match against /public/images/recipes/<slug>.png
 *   3. Fuzzy: any image slug that contains every keyword from the recipe name
 */
export function getRecipeImage(recipeIdOrName: string): string | undefined {
  const recipe = findRecipeById(recipeIdOrName) ?? findRecipeByName(recipeIdOrName);
  if (!recipe) return undefined;
  if (recipe.image) return recipe.image;

  const directSlug = slugifyRecipeName(recipe.name);
  if (recipeImageBySlug[directSlug]) return recipeImageBySlug[directSlug];

  const recipeWords = keywords(recipe.name);
  if (recipeWords.length === 0) return undefined;
  let bestSlug: string | undefined;
  let bestScore = 0;
  for (const candidate of RECIPE_IMAGE_SLUGS) {
    const candidateWords = candidate.split("-");
    const matched = recipeWords.filter(w => candidateWords.includes(w)).length;
    const score = (matched / recipeWords.length) * (matched / candidateWords.length);
    if (matched === recipeWords.length && score > bestScore) {
      bestScore = score;
      bestSlug = candidate;
    }
  }
  return bestSlug ? recipeImageBySlug[bestSlug] : undefined;
}

/** Get all recipes for a given cycle phase */
export function getRecipesForPhase(phase: Recipe["phase"]): Recipe[] {
  return ALL_RECIPES.filter((r) => r.phase === phase);
}

/** Get all recipes for a given category (breakfast, meal, snack, baking) */
export function getRecipesByCategory(category: NonNullable<Recipe["category"]>): Recipe[] {
  return ALL_RECIPES.filter((r) => r.category === category);
}
