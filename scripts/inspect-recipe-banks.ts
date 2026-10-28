/**
 * Inspects every recipe bank: export names, counts, and which Recipe fields are
 * present. Decides what it takes to wire each one back into ALL_RECIPES.
 *
 *   npx tsx scripts/inspect-recipe-banks.ts
 */
const BANKS = [
  "nourish-recipes", "signal-rewrites", "kids-recipes", "matthew-kids-recipes",
  "plant-based-family-recipes", "baking-recipes", "bowl-meal-recipes",
  "doctors-kitchen-recipes", "extra-batch-recipes", "glucose-revolution-recipes",
  "how-not-to-diet-recipes", "meal-plan-recipes", "pdf-expanded-recipes",
  "pdf-library-recipes", "pdf-recipes", "plant-powered-plus-recipes",
  "plant-powered-recipes", "protein-15-recipes", "snack-dessert-recipes",
  "storage-pdf-recipes", "tcm-ayurveda-recipes", "vegan-basics-recipes",
];

const REQUIRED = ["id", "name", "phase", "serves", "prepTime", "keyNutrients", "ingredients", "method", "phaseBenefit"];
const USEFUL = ["category", "image", "nutrition", "tags", "protein", "mealType", "cuisine", "equipment"];

const rows: string[] = [];
rows.push(`| Bank | Export | Count | Sample fields | Missing required |`);
rows.push(`|---|---|--:|---|--:|`);

for (const bank of BANKS) {
  let mod: Record<string, unknown>;
  try {
    mod = await import(`@/data/${bank}`);
  } catch (e) {
    rows.push(`| ${bank} | _import failed_ | | ${String((e as Error).message).slice(0, 60)} | |`);
    continue;
  }
  const entries = Object.entries(mod).filter(
    ([, v]) => Array.isArray(v) && v.length && typeof v[0] === "object",
  );
  if (!entries.length) {
    rows.push(`| ${bank} | _no array export_ | 0 | | |`);
    continue;
  }
  for (const [name, value] of entries) {
    const arr = value as Record<string, unknown>[];
    const keys = new Set<string>();
    for (const r of arr.slice(0, 40)) for (const k of Object.keys(r ?? {})) keys.add(k);
    const present = [...keys];
    const missing = REQUIRED.filter((f) => !present.includes(f));
    rows.push(
      `| ${bank} | ${name} | ${arr.length} | ${present.slice(0, 12).join(", ")}${present.length > 12 ? "…" : ""} | ${missing.length ? missing.join(", ") : "—"} |`,
    );
  }
}

console.log(rows.join("\n"));
console.log(`\nRecipe requires: ${REQUIRED.join(", ")}`);
console.log(`Also useful for filters: ${USEFUL.join(", ")}`);
