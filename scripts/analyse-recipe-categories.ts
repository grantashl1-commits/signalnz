/**
 * Categorisation health check for the live recipe library.
 *
 *   npx tsx scripts/analyse-recipe-categories.ts
 */
import { ALL_RECIPES, getRecipeImage } from "@/lib/recipe-index";
import { KIDS_RECIPE_BANK } from "@/data/kids-recipes";
import { getFacets } from "@/lib/recipe-facets";

const tally = (xs: (string | undefined)[]) => {
  const m = new Map<string, number>();
  for (const x of xs) m.set(x ?? "(missing)", (m.get(x ?? "(missing)") ?? 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
};

console.log(`LIVE ADULT RECIPES: ${ALL_RECIPES.length}\n`);

console.log("category:");
for (const [k, v] of tally(ALL_RECIPES.map((r) => r.category))) console.log(`  ${String(k).padEnd(14)} ${v}`);

console.log("\nphase:");
for (const [k, v] of tally(ALL_RECIPES.map((r) => r.phase))) console.log(`  ${String(k).padEnd(14)} ${v}`);

console.log("\nprotein:");
for (const [k, v] of tally(ALL_RECIPES.map((r) => r.protein))) console.log(`  ${String(k).padEnd(14)} ${v}`);

const noTags = ALL_RECIPES.filter((r) => !r.tags?.length);
const noProtein = ALL_RECIPES.filter((r) => !r.protein);
const noMealType = ALL_RECIPES.filter((r) => !r.mealType?.length);
const noImage = ALL_RECIPES.filter((r) => !getRecipeImage(r.id));
const noNutrition = ALL_RECIPES.filter((r) => !r.nutrition);
const noCategory = ALL_RECIPES.filter((r) => !r.category);

console.log("\ngaps in the live library:");
console.log(`  missing category   ${noCategory.length}`);
console.log(`  missing protein    ${noProtein.length}`);
console.log(`  missing tags       ${noTags.length}`);
console.log(`  missing mealType   ${noMealType.length}`);
console.log(`  missing nutrition  ${noNutrition.length}`);
console.log(`  no resolvable image ${noImage.length}`);

// diet spread, reusing the app's own detector
const diets = new Map<string, number>();
const minutes: number[] = [];
for (const r of ALL_RECIPES) {
  const f = getFacets({ name: r.name, ingredients: r.ingredients, tags: r.tags });
  diets.set(f.diet, (diets.get(f.diet) ?? 0) + 1);
  if (f.minutes) minutes.push(f.minutes);
}
console.log("\ndetected diet:");
for (const [k, v] of [...diets.entries()].sort((a, b) => b[1] - a[1])) console.log(`  ${k.padEnd(14)} ${v}`);

minutes.sort((a, b) => a - b);
if (minutes.length) {
  const p = (q: number) => minutes[Math.floor(q * (minutes.length - 1))];
  console.log(`\ntotal time: median ${p(0.5)} min, p90 ${p(0.9)} min, max ${minutes[minutes.length - 1]} min`);
}

// category x phase matrix — spots phases with a thin pool for a slot
console.log("\ncategory x phase:");
const catPhase = new Map<string, number>();
for (const r of ALL_RECIPES) {
  const k = `${r.category ?? "?"} / ${r.phase}`;
  catPhase.set(k, (catPhase.get(k) ?? 0) + 1);
}
for (const [k, v] of [...catPhase.entries()].sort()) console.log(`  ${k.padEnd(28)} ${v}`);

const kidsNoCat = KIDS_RECIPE_BANK.filter((r: { mealType?: string[] }) => !r.mealType?.length);
console.log(`\nkids bank: ${KIDS_RECIPE_BANK.length} recipes, ${kidsNoCat.length} missing mealType`);

const src = ALL_RECIPES.filter((r) => !getRecipeImage(r.id)).slice(0, 20);
if (src.length) {
  console.log("\nrecipes with no image (first 20):");
  for (const r of src) console.log(`  ${r.id}  —  ${r.name}`);
}
