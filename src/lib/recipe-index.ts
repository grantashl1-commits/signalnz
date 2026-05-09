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

/** All recipes — single canonical source. */
export const ALL_RECIPES: Recipe[] = NOURISH_RECIPES;

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

/** Get recipe image or undefined (single source of truth for illustrations) */
export function getRecipeImage(recipeIdOrName: string): string | undefined {
  const byId = findRecipeById(recipeIdOrName);
  if (byId) return byId.image;
  const byName = findRecipeByName(recipeIdOrName);
  return byName?.image;
}

/** Get all recipes for a given cycle phase */
export function getRecipesForPhase(phase: Recipe["phase"]): Recipe[] {
  return ALL_RECIPES.filter((r) => r.phase === phase);
}

/** Get all recipes for a given category (breakfast, meal, snack, baking) */
export function getRecipesByCategory(category: NonNullable<Recipe["category"]>): Recipe[] {
  return ALL_RECIPES.filter((r) => r.category === category);
}
