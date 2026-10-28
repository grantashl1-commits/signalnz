/**
 * Lists recipes missing `phase` or `category`, grouped by source bank, so gaps
 * can be fixed at the source rather than invented at merge time.
 *
 *   npx tsx scripts/find-recipe-gaps.ts
 */
import { RECIPE_SOURCES } from "@/data/recipe-library";

const missingPhase: Record<string, string[]> = {};
const missingCat: Record<string, string[]> = {};
const catValues = new Map<string, number>();
const phaseValues = new Map<string, number>();

for (const src of RECIPE_SOURCES) {
  for (const r of src.recipes) {
    const ph = (r as { phase?: string }).phase;
    const cat = (r as { category?: string }).category;
    if (!ph) (missingPhase[src.label] ??= []).push(`${r.id} (${r.name})`);
    else phaseValues.set(ph, (phaseValues.get(ph) ?? 0) + 1);
    if (!cat) (missingCat[src.label] ??= []).push(r.id);
    else catValues.set(cat, (catValues.get(cat) ?? 0) + 1);
  }
}

console.log("=== missing phase ===");
for (const [bank, ids] of Object.entries(missingPhase)) {
  console.log(`${bank}: ${ids.length}`);
  for (const x of ids.slice(0, 20)) console.log(`   ${x}`);
}

console.log("\n=== missing category (count by bank) ===");
for (const [bank, ids] of Object.entries(missingCat)) {
  console.log(`${bank}: ${ids.length}   e.g. ${ids.slice(0, 4).join(", ")}`);
}

console.log("\nphase values in use:", Object.fromEntries(phaseValues));
console.log("category values in use:", Object.fromEntries(catValues));
