/**
 * Canonical Recipe Index — single source of truth for all recipe lookups.
 * Every tab (Today, Plans, My Week, Recipes, Shop) should use these helpers.
 */
import { Recipe, RECIPES } from "@/data/meal-plans";
import { PDF_RECIPES } from "@/data/pdf-recipes";
import { BAKING_RECIPES } from "@/data/baking-recipes";
import { LIBRARY_RECIPES } from "@/data/pdf-library-recipes";
import { STORAGE_PDF_RECIPES } from "@/data/storage-pdf-recipes";
import { EXPANDED_RECIPES } from "@/data/pdf-expanded-recipes";
import { PLANT_POWERED_RECIPES } from "@/data/plant-powered-recipes";
import { PLANT_POWERED_PLUS_RECIPES } from "@/data/plant-powered-plus-recipes";
import { TCM_AYURVEDA_RECIPES } from "@/data/tcm-ayurveda-recipes";
import { MEAL_PLAN_RECIPES } from "@/data/meal-plan-recipes";
import { BOWL_MEAL_RECIPES } from "@/data/bowl-meal-recipes";
import { SNACK_DESSERT_RECIPES } from "@/data/snack-dessert-recipes";
import { VEGAN_BASICS_RECIPES } from "@/data/vegan-basics-recipes";
import { PROTEIN_15_RECIPES } from "@/data/protein-15-recipes";
import { EXTRA_BATCH_MEAL_RECIPES, EXTRA_BATCH_SNACK_RECIPES } from "@/data/extra-batch-recipes";

/** All meal recipes (not baking) */
export const ALL_MEAL_RECIPES: Recipe[] = [...RECIPES, ...PDF_RECIPES, ...LIBRARY_RECIPES, ...STORAGE_PDF_RECIPES, ...EXPANDED_RECIPES, ...PLANT_POWERED_RECIPES, ...PLANT_POWERED_PLUS_RECIPES, ...TCM_AYURVEDA_RECIPES, ...MEAL_PLAN_RECIPES, ...BOWL_MEAL_RECIPES, ...VEGAN_BASICS_RECIPES, ...PROTEIN_15_RECIPES, ...EXTRA_BATCH_MEAL_RECIPES];

/** All recipes including baking and snacks */
export const ALL_RECIPES: Recipe[] = [...ALL_MEAL_RECIPES, ...BAKING_RECIPES, ...SNACK_DESSERT_RECIPES, ...EXTRA_BATCH_SNACK_RECIPES];

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

/**
 * Manual alias map: maps common meal-plan names to recipe IDs.
 * This catches names that differ significantly from the recipe DB name.
 */
const MEAL_ALIASES: Record<string, string> = {
  "overnight oats with blueberries and flaxseed": "overnight-oats-blueberry",
  "overnight oats with goji berries and flaxseed": "overnight-oats-blueberry",
  "miso glazed tofu with soba noodles and bok choy": "miso-tofu-soba",
  "miso tofu with soba noodles": "miso-tofu-soba",
  "lentil and roasted capsicum bowl with tahini dressing": "lentil-capsicum-bowl",
  "lentil and roasted capsicum bowl": "lentil-capsicum-bowl",
  "fermented cashew yoghurt with granola and kiwi": "fermented-bowl",
  "tempeh and broccoli stir fry": "tempeh-stirfry",
  "chickpea and spinach curry": "chickpea-curry",
  "chickpea and sweet potato curry with brown rice": "chickpea-curry",
  "mushroom and lentil shepherds pie": "mushroom-shepherds",
  "mushroom and lentil shepherd's pie": "mushroom-shepherds",
  "lentil dhal with turmeric and coconut milk": "lentil-dhal",
  "lentil and vegetable casserole": "coconut-dhal",
  "sweet potato and black bean soup": "sweet-potato-soup",
  "tofu pad thai": "pad-thai",
  "mushroom risotto": "mushroom-risotto",
  "chickpea tikka masala with rice": "tikka-masala",
  "chickpea tikka masala": "tikka-masala",
  "black bean chilli with cornbread": "black-bean-chilli",
  "coconut dhal with spinach and rice": "coconut-dhal",
  "coconut dhal with spinach": "coconut-dhal",
  "veg lasagne with cashew bechamel": "cashew-lasagne",
  "veg lasagne with cashew béchamel": "cashew-lasagne",
  "grilled asparagus and quinoa salad": "rainbow-sushi-bowl",
  "stuffed capsicums with quinoa and black beans": "stuffed-capsicums",
  "zucchini fritters with cucumber tzatziki": "zucchini-fritters",
  "raw zucchini noodles with pesto": "raw-pad-thai",
  "red lentil soup with sourdough": "turmeric-lentil-soup",
  "green smoothie spinach apple ginger flaxseed": "green-smoothie",
  "falafel wrap with fermented cabbage": "falafel-wrap",
  "chocolate banana nice cream": "chocolate-nice-cream",
};

/** Fuzzy lookup by meal name — tries alias → exact → word-overlap */
export function findRecipeByName(mealName: string): Recipe | undefined {
  const n = norm(mealName);

  // 1. Check alias map
  const aliasId = MEAL_ALIASES[n];
  if (aliasId) {
    const recipe = RECIPE_BY_ID.get(aliasId);
    if (recipe) return recipe;
  }

  // 2. Exact normalized match
  const exact = ALL_MEAL_RECIPES.find((r) => norm(r.name) === n);
  if (exact) return exact;

  // 3. Substring match (either direction)
  const sub = ALL_MEAL_RECIPES.find(
    (r) => n.includes(norm(r.name)) || norm(r.name).includes(n)
  );
  if (sub) return sub;

  // 4. Word-overlap scoring — pick best match above threshold
  let bestScore = 0;
  let bestRecipe: Recipe | undefined;
  const THRESHOLD = 0.35;

  for (const r of ALL_MEAL_RECIPES) {
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
