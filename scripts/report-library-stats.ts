/**
 * Reports the merged-library build stats: what each bank contributed and what
 * deduplication dropped.
 *
 *   npx tsx scripts/report-library-stats.ts
 */
import { ALL_RECIPES, RECIPE_LIBRARY_STATS } from "@/lib/recipe-index";

const s = RECIPE_LIBRARY_STATS;

console.log(`MERGED LIBRARY: ${ALL_RECIPES.length} recipes\n`);
console.log(`source recipes scanned: ${s.total}`);
console.log(`kept:                  ${s.kept}`);
console.log(`dropped (same id):     ${s.droppedById}`);
console.log(`dropped (same name):   ${s.droppedByName}\n`);

console.log(`${"bank".padEnd(30)} ${"in".padStart(5)} ${"kept".padStart(6)}`);
for (const p of s.perSource) {
  console.log(`${p.label.padEnd(30)} ${String(p.count).padStart(5)} ${String(p.kept).padStart(6)}`);
}

if (s.collisions.length) {
  console.log(`\nname collisions resolved (first ${Math.min(25, s.collisions.length)} of ${s.collisions.length}):`);
  for (const c of s.collisions.slice(0, 25)) {
    console.log(`  "${c.key}"  kept ${c.keptId}  dropped ${c.droppedIds.join(", ")}`);
  }
}

// Sanity: every kept recipe must be usable by the app.
const noPhase = ALL_RECIPES.filter((r) => !r.phase);
const noCat = ALL_RECIPES.filter((r) => !r.category);
const noIng = ALL_RECIPES.filter((r) => !r.ingredients?.length);
const noMethod = ALL_RECIPES.filter((r) => !r.method?.length);
const noServes = ALL_RECIPES.filter((r) => !r.serves);
console.log(`\nintegrity:`);
console.log(`  missing phase    ${noPhase.length}`);
console.log(`  missing category ${noCat.length}`);
console.log(`  missing serves   ${noServes.length}`);
console.log(`  no ingredients   ${noIng.length}`);
console.log(`  no method        ${noMethod.length}`);

const ids = ALL_RECIPES.map((r) => r.id);
console.log(`  duplicate ids    ${ids.length - new Set(ids).size}`);
