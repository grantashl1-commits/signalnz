/**
 * Lists live recipes with no resolvable illustration, and emits the slugs the
 * generator should write to. Read-only against src.
 *
 *   npx tsx scripts/list-recipes-missing-images.ts
 *
 * Writes handoff/recipes-missing-images.json
 */
import { writeFileSync } from "node:fs";
import { ALL_RECIPES, getRecipeImage } from "@/lib/recipe-index";

/** Must mirror slugifyRecipeName in src/lib/recipe-index.ts so filenames resolve. */
function slugFor(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[''`]/g, "")
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const missing = ALL_RECIPES.filter((r) => !getRecipeImage(r.id));

const rows = missing.map((r) => ({
  id: r.id,
  name: r.name,
  slug: slugFor(r.name),
  category: r.category ?? "meal",
  mealType: r.mealType ?? [],
  phase: r.phase,
  serves: r.serves,
  protein: (r as { protein?: string }).protein ?? "",
  ingredients: r.ingredients.slice(0, 8),
}));

// Duplicate slugs would make two recipes fight over one file.
const bySlug = new Map<string, string[]>();
for (const r of rows) {
  const arr = bySlug.get(r.slug);
  if (arr) arr.push(r.name);
  else bySlug.set(r.slug, [r.name]);
}
const collisions = [...bySlug.entries()].filter(([, v]) => v.length > 1);

writeFileSync("handoff/recipes-missing-images.json", JSON.stringify(rows, null, 1) + "\n");

console.log(`live recipes:        ${ALL_RECIPES.length}`);
console.log(`have an image:       ${ALL_RECIPES.length - missing.length}`);
console.log(`missing an image:    ${missing.length}`);
console.log(`unique slugs:        ${bySlug.size}`);
console.log(`slug collisions:     ${collisions.length}`);
for (const [slug, names] of collisions.slice(0, 10)) console.log(`  ${slug}: ${names.join(" | ")}`);

const byCat = new Map<string, number>();
for (const r of rows) byCat.set(r.category, (byCat.get(r.category) ?? 0) + 1);
console.log("\nmissing by category:", Object.fromEntries([...byCat.entries()].sort((a, b) => b[1] - a[1])));

console.log("\nfirst 8:");
for (const r of rows.slice(0, 8)) console.log(`  ${r.slug}.png  <-  ${r.name}`);
