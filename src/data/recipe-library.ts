/**
 * The merged recipe library.
 *
 * The app had ~830 recipes sitting in 17 modules that nothing imported, so only
 * the 98 nourish + 216 SIGNAL recipes were ever reachable. This module wires the
 * orphaned banks back in, deduplicates them, and exposes one flat `Recipe[]`.
 *
 * Precedence matters: the long-standing live collections come first, so when an
 * orphaned bank contains a recipe the library already has, the existing entry
 * wins and the orphan is dropped. That keeps ids, images and nutrition stable for
 * anything already referenced (saved recipes, meal plans, shopping lists).
 *
 * Not included here, deliberately:
 *   - KIDS_RECIPE_BANK / nourish KIDS_RECIPES — surfaced by the kids mode of
 *     DiscoverTab and the KidsDinnerAlt picker, and they have no `phase`.
 *   - MATTHEW_KIDS_RECIPES / PLANT_BASED_FAMILY_RECIPES — surfaced by
 *     FamilyRecipesTab and use a different shape (prepMinutes, kidAlternative).
 * Adding them here would double-list children's recipes in the adult library.
 */
import type { Recipe } from "@/data/meal-plans";

import { NOURISH_RECIPES, TCM_AYURVEDA_RECIPES as NOURISH_TCM, BAKING_SNACKS_RECIPES } from "@/data/nourish-recipes";
import { SIGNAL_REWRITES } from "@/data/signal-rewrites";

import { BAKING_RECIPES } from "@/data/baking-recipes";
import { BOWL_MEAL_RECIPES } from "@/data/bowl-meal-recipes";
import { DOCTORS_KITCHEN_RECIPES } from "@/data/doctors-kitchen-recipes";
import { EXTRA_BATCH_MEAL_RECIPES, EXTRA_BATCH_SNACK_RECIPES } from "@/data/extra-batch-recipes";
import { GLUCOSE_REVOLUTION_RECIPES, GLUCOSE_REVOLUTION_SNACK_RECIPES } from "@/data/glucose-revolution-recipes";
import { HOW_NOT_TO_DIET_RECIPES, HOW_NOT_TO_DIET_SNACK_RECIPES } from "@/data/how-not-to-diet-recipes";
import { MEAL_PLAN_RECIPES } from "@/data/meal-plan-recipes";
import { EXPANDED_RECIPES } from "@/data/pdf-expanded-recipes";
import { LIBRARY_RECIPES } from "@/data/pdf-library-recipes";
import { PDF_RECIPES } from "@/data/pdf-recipes";
import { PLANT_POWERED_PLUS_RECIPES } from "@/data/plant-powered-plus-recipes";
import { PLANT_POWERED_RECIPES } from "@/data/plant-powered-recipes";
import { PROTEIN_15_RECIPES } from "@/data/protein-15-recipes";
import { SNACK_DESSERT_RECIPES } from "@/data/snack-dessert-recipes";
import { STORAGE_PDF_RECIPES } from "@/data/storage-pdf-recipes";
import { TCM_AYURVEDA_RECIPES } from "@/data/tcm-ayurveda-recipes";
import { VEGAN_BASICS_RECIPES } from "@/data/vegan-basics-recipes";

/** A bank plus the label used in provenance comments and duplicate reports. */
export interface RecipeSource {
  label: string;
  recipes: Recipe[];
}

/**
 * Live-first order. `NOURISH_RECIPES` and `SIGNAL_REWRITES` are the collections
 * the app has always shipped, so they win every collision.
 */
export const RECIPE_SOURCES: RecipeSource[] = [
  { label: "nourish", recipes: NOURISH_RECIPES },
  { label: "signal-rewrites", recipes: SIGNAL_REWRITES },
  { label: "meal-plan", recipes: MEAL_PLAN_RECIPES as Recipe[] },
  { label: "doctors-kitchen", recipes: DOCTORS_KITCHEN_RECIPES as Recipe[] },
  { label: "how-not-to-diet", recipes: HOW_NOT_TO_DIET_RECIPES as Recipe[] },
  { label: "how-not-to-diet-snacks", recipes: HOW_NOT_TO_DIET_SNACK_RECIPES as Recipe[] },
  { label: "protein-15", recipes: PROTEIN_15_RECIPES as Recipe[] },
  { label: "pdf", recipes: PDF_RECIPES as Recipe[] },
  { label: "storage-pdf", recipes: STORAGE_PDF_RECIPES as Recipe[] },
  { label: "baking-snacks", recipes: BAKING_SNACKS_RECIPES as unknown as Recipe[] },
  { label: "plant-powered-plus", recipes: PLANT_POWERED_PLUS_RECIPES as Recipe[] },
  { label: "pdf-expanded", recipes: EXPANDED_RECIPES as Recipe[] },
  { label: "tcm-ayurveda", recipes: TCM_AYURVEDA_RECIPES as Recipe[] },
  { label: "tcm-ayurveda-nourish", recipes: NOURISH_TCM as unknown as Recipe[] },
  { label: "snack-dessert", recipes: SNACK_DESSERT_RECIPES as Recipe[] },
  { label: "vegan-basics", recipes: VEGAN_BASICS_RECIPES as Recipe[] },
  { label: "plant-powered", recipes: PLANT_POWERED_RECIPES as Recipe[] },
  { label: "baking", recipes: BAKING_RECIPES as Recipe[] },
  { label: "pdf-library", recipes: LIBRARY_RECIPES as Recipe[] },
  { label: "bowl-meal", recipes: BOWL_MEAL_RECIPES as Recipe[] },
  { label: "glucose-revolution", recipes: GLUCOSE_REVOLUTION_RECIPES as Recipe[] },
  { label: "glucose-revolution-snacks", recipes: GLUCOSE_REVOLUTION_SNACK_RECIPES as Recipe[] },
  { label: "extra-batch", recipes: EXTRA_BATCH_MEAL_RECIPES as Recipe[] },
  { label: "extra-batch-snacks", recipes: EXTRA_BATCH_SNACK_RECIPES as Recipe[] },
];

/** Normalise a name for duplicate comparison. */
export function recipeNameKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[''`]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Fill the fields some older banks omit, so every entry is a valid, filterable
 * Recipe. Done here rather than by editing 17 data files: one documented rule
 * set, applied uniformly, and it covers any bank added later.
 */

/* ── Phase ────────────────────────────────────────────────────────────── */

/**
 * `phase` is cycle-specific marketing metadata. A snack bank written before the
 * cycle feature simply has none, and inventing a phase would drop the recipe into
 * the wrong part of a member's cycle. `"any"` is already an established value
 * (4 recipes use it), so that is the honest default.
 */
function derivePhase(r: Recipe): Recipe["phase"] {
  return (r as { phase?: Recipe["phase"] }).phase ?? "any";
}

/* ── Category ─────────────────────────────────────────────────────────── */

/** Breakfast formats — a bowl of oats is never dinner. */
const BREAKFAST_RE =
  /\b(porridge|oats?|overnight oats|muesli|bircher|granola|pancakes?|pikelets?|waffles?|toast|toastie|smoothie|smoothie bowl|yoghurt|yogurt|chia pudding|scrambled eggs?|omelette|frittata|shakshuka|acai|benedict)\b/i;

/** Sweet snack / dessert formats. */
const SNACK_RE =
  /\b(bliss balls?|energy balls?|energy bites?|protein balls?|muesli bars?|oat bars?|slice|brownie|blondie|cookies?|biscuits?|fudge|truffles?|mousse|ice cream|nice cream|sorbet|meringue|custard|crumble|cobbler|pudding|tart|cheesecake|chips?|crisps?|crackers?|popcorn|bark|leather|hummus|dip|trail mix|nut mix|bites)\b/i;

/** Things baked in an oven and filed as baking. */
const BAKING_RE = /\b(bread|loaf|cake|cupcakes?|muffins?|scones?|cornbread|flatbread|pizza dough)\b/i;

/** Explicit category hints in the id. */
const ID_CATEGORY: [RegExp, Recipe["category"]][] = [
  [/^snack-/, "snack"],
  [/^dessert-/, "snack"],
  [/^baking-/, "baking"],
  [/^breakfast-/, "breakfast"],
];

const MEAL_TYPE_TO_CATEGORY: Record<string, NonNullable<Recipe["category"]>> = {
  breakfast: "breakfast",
  lunch: "meal",
  dinner: "meal",
  snack: "snack",
  dessert: "snack",
  baking: "baking",
};

/**
 * Derive `category` when a bank omits it. Order of preference: an explicit
 * hint in the id, then the recipe's own `mealType`, then the name.
 */
export function deriveCategory(r: Recipe): NonNullable<Recipe["category"]> {
  const explicit = (r as { category?: Recipe["category"] }).category;
  if (explicit) return explicit;

  const id = r.id.toLowerCase();
  for (const [re, cat] of ID_CATEGORY) if (re.test(id)) return cat!;

  const mt = (r as { mealType?: string[] }).mealType ?? [];
  for (const m of mt) {
    const cat = MEAL_TYPE_TO_CATEGORY[m.toLowerCase()];
    if (cat) return cat;
  }

  const name = r.name.toLowerCase();
  if (BREAKFAST_RE.test(name)) return "breakfast";
  if (BAKING_RE.test(name)) return "baking";
  if (SNACK_RE.test(name)) return "snack";
  return "meal";
}

/* ── Meal type ────────────────────────────────────────────────────────── */

/**
 * `mealType` answers "which slot does this suit?" — the distinction the data
 * model never had, since `category` lumps lunch and dinner together as "meal".
 * The id prefix is the one reliable signal: this library has always encoded
 * lunch-/dinner- there. Unprefixed mains get both slots so they stay usable.
 */
export function deriveMealType(r: Recipe): string[] {
  const existing = (r as { mealType?: string[] }).mealType;
  if (existing?.length) return existing;

  const id = r.id.toLowerCase();
  const cat = deriveCategory(r);
  if (id.startsWith("lunch-")) return ["lunch"];
  if (id.startsWith("dinner-")) return ["dinner"];
  if (cat === "breakfast") return ["breakfast"];
  if (cat === "snack") return ["snack"];
  if (cat === "baking") return ["baking"];
  return ["lunch", "dinner"];
}

/* ── Protein ──────────────────────────────────────────────────────────── */

/**
 * `protein` is the main protein source, and it drives the "Protein source"
 * filter in DiscoverTab. Most of the older banks never set it, so it is derived
 * from the ingredient list using the same vocabulary the live recipes already
 * use (chicken, beef, lamb, salmon, tuna, prawns, tofu, tempeh, eggs,
 * chickpeas, lentils, beans, nuts, cheese, yoghurt, none).
 *
 * Order matters: the first match wins, so a chicken-and-bean dish reads as
 * chicken rather than legumes.
 */
const PROTEIN_RULES: [RegExp, string][] = [
  [/\b(chicken|turkey)\b/, "chicken"],
  [/\b(beef|steak|mince|brisket|veal)\b/, "beef"],
  [/\b(lamb|mutton)\b/, "lamb"],
  [/\b(pork|bacon|ham|chorizo|sausage|prosciutto|pancetta)\b/, "pork"],
  [/\bsalmon\b/, "salmon"],
  [/\b(tuna)\b/, "tuna"],
  [/\b(prawns?|shrimps?|scallops?|mussels?|squid|calamari)\b/, "prawns"],
  [/\b(fish|cod|snapper|hoki|tarakihi|sardines?|mackerel|trout|anchov(y|ies))\b/, "fish"],
  [/\b(tofu)\b/, "tofu"],
  [/\b(tempeh)\b/, "tempeh"],
  [/\b(eggs?|yolks?)\b/, "eggs"],
  [/\b(lentils?|red lentil|dal|dhal|daal)\b/, "lentils"],
  [/\b(chickpeas?)\b/, "chickpeas"],
  [/\b(beans?|cannellini|black bean|kidney bean|butter bean|haricot)\b/, "beans"],
  [/\b(cheese|feta|halloumi|parmesan|cheddar|mozzarella|ricotta)\b/, "cheese"],
  [/\b(yoghurt|yogurt|greek yoghurt)\b/, "yoghurt"],
  [/\b(almonds?|cashews?|walnuts?|pecans?|hazelnuts?|peanuts?|pistachios?|nut butter|tahini|seeds?)\b/, "nuts"],
];

export function deriveProtein(r: Recipe): string | undefined {
  const existing = (r as { protein?: string }).protein;
  if (existing) return existing;

  const haystack = `${r.name} ${(r.ingredients ?? []).join(" ")}`.toLowerCase();
  // Strip plant-milk / plant-butter phrases so "coconut milk" isn't dairy.
  const cleaned = haystack
    .replace(/\b(coconut|oat|almond|soy|soya|rice|cashew|hemp|pea|plant)\s+(milk|cream|yoghurt|yogurt|cheese|butter)\b/g, " ")
    .replace(/\b(peanut|almond|cashew|nut|seed|sunflower|cocoa|cacao|apple|bean|vegan|plant)\s+butter\b/g, " ")
    .replace(/\b(eggplant|egg[- ]free|egg replacer)\b/g, " ");

  for (const [re, value] of PROTEIN_RULES) if (re.test(cleaned)) return value;
  return "none";
}

function normalise(r: Recipe, source: string): Recipe {
  const missing: string[] = [];
  if (!(r as { keyNutrients?: unknown }).keyNutrients) missing.push("keyNutrients");
  if (!(r as { phaseBenefit?: string }).phaseBenefit) missing.push("phaseBenefit");
  if (!(r as { category?: string }).category) missing.push("category");
  if (!(r as { phase?: string }).phase) missing.push("phase");
  if (missing.length && process.env.RECIPE_LIBRARY_DEBUG) {
    console.warn(`[recipe-library] ${source}/${r.id} missing ${missing.join(", ")} — derived`);
  }
  return {
    ...r,
    phase: derivePhase(r),
    category: deriveCategory(r),
    mealType: deriveMealType(r),
    protein: deriveProtein(r),
    keyNutrients: (r as { keyNutrients?: string[] }).keyNutrients ?? [],
    phaseBenefit: (r as { phaseBenefit?: string }).phaseBenefit ?? "",
  } as Recipe;
}

export interface DedupeStats {
  total: number;
  kept: number;
  droppedById: number;
  droppedByName: number;
  perSource: { label: string; count: number; kept: number }[];
  /** name key -> the ids that collided, for auditing. */
  collisions: { key: string; keptId: string; droppedIds: string[] }[];
}

/**
 * Merge every source, dropping later entries whose id or normalised name is
 * already present. Returns the flat list plus stats so the duplicate report and
 * tests can assert on what happened.
 */
export function buildMergedRecipes(sources: RecipeSource[] = RECIPE_SOURCES): {
  recipes: Recipe[];
  stats: DedupeStats;
} {
  const byId = new Set<string>();
  const byName = new Map<string, string>(); // nameKey -> kept id
  const out: Recipe[] = [];
  const collisions: DedupeStats["collisions"] = [];
  const perSource = sources.map((s) => ({ label: s.label, count: s.recipes.length, kept: 0 }));
  let droppedById = 0;
  let droppedByName = 0;

  sources.forEach((source, sourceIndex) => {
    for (const raw of source.recipes) {
      if (!raw?.id || !raw?.name) continue;
      const recipe = normalise(raw, source.label);

      if (byId.has(recipe.id)) {
        droppedById++;
        continue;
      }
      const key = recipeNameKey(recipe.name);
      const clash = byName.get(key);
      if (clash) {
        droppedByName++;
        const existing = collisions.find((c) => c.key === key);
        if (existing) existing.droppedIds.push(recipe.id);
        else collisions.push({ key, keptId: clash, droppedIds: [recipe.id] });
        continue;
      }
      byId.add(recipe.id);
      byName.set(key, recipe.id);
      out.push(recipe);
      perSource[sourceIndex].kept++;
    }
  });

  return {
    recipes: out,
    stats: {
      total: sources.reduce((n, s) => n + s.recipes.length, 0),
      kept: out.length,
      droppedById,
      droppedByName,
      perSource,
      collisions,
    },
  };
}

export const MERGED_RECIPE_BUILD = buildMergedRecipes();
