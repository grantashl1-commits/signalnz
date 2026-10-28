/**
 * How much image coverage is being lost because the resolver only reads one of
 * the two image maps? Read-only.
 *
 *   npx tsx scripts/measure-image-coverage.ts
 */
import { readFileSync } from "node:fs";
import { ALL_RECIPES, getRecipeImage } from "@/lib/recipe-index";

const maps = JSON.parse(readFileSync("src/data/image-maps.json", "utf8")).recipes as Record<string, string>;
const files = JSON.parse(readFileSync("src/data/recipe-image-files.json", "utf8")) as Record<string, string>;

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/['']/g, "")
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const fileKeys = new Set(Object.keys(files));
const mapKeys = new Set(Object.keys(maps));

let current = 0;
let recoverable = 0;
let stillMissing = 0;
const examples: string[] = [];

for (const r of ALL_RECIPES) {
  const has = Boolean(getRecipeImage(r.id));
  if (has) {
    current++;
    continue;
  }
  // Would the bigger map have covered it?
  const s = slug(r.name);
  let hit = fileKeys.has(s) ? files[s] : undefined;
  if (!hit) {
    // try matching any file key whose words are all in the recipe name
    const words = s.split("-").filter(Boolean);
    for (const k of fileKeys) {
      const kw = k.split("-");
      if (words.every((w) => kw.includes(w))) {
        hit = files[k];
        break;
      }
    }
  }
  if (hit) {
    recoverable++;
    if (examples.length < 5) examples.push(`${r.name} -> ${hit}`);
  } else {
    stillMissing++;
  }
}

console.log(`live recipes:                 ${ALL_RECIPES.length}`);
console.log(`image-maps.json recipes keys: ${mapKeys.size}`);
console.log(`recipe-image-files.json keys: ${fileKeys.size}`);
console.log(`key overlap:                  ${[...mapKeys].filter((k) => fileKeys.has(k)).length}`);
console.log("");
console.log(`has image today:              ${current}`);
console.log(`missing today:                ${ALL_RECIPES.length - current}`);
console.log(`  recoverable from the big map: ${recoverable}`);
console.log(`  genuinely absent:             ${stillMissing}`);
console.log("");
if (examples.length) {
  console.log("recoverable examples:");
  for (const e of examples) console.log(`  ${e}`);
}
