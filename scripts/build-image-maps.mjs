/**
 * Scans public/images/* folders and emits slug→filename maps so the app can
 * look up illustrations at runtime by recipe/exercise/habit name without
 * having to edit each data entry by hand.
 *
 * Output:
 *   src/data/image-maps.json
 *
 * Re-run whenever a new batch of illustrations lands.
 *
 *   node scripts/build-image-maps.mjs
 */
import { readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const FOLDERS = {
  recipes: "public/images/recipes",
  exercises: "public/images/exercises",
  habits: "public/images/habits",
};

function listPngs(dir) {
  try {
    return readdirSync(dir).filter(f => f.endsWith(".png") && statSync(join(dir, f)).isFile());
  } catch {
    return [];
  }
}

function slug(name) {
  return name.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const result = {};
for (const [key, dir] of Object.entries(FOLDERS)) {
  const files = listPngs(dir);
  const map = {};
  for (const file of files) {
    map[slug(file.replace(/\.png$/, ""))] = `/${dir.replace(/^public\//, "")}/${file}`;
  }
  result[key] = map;
  console.log(`${key}: ${Object.keys(map).length} images`);
}

writeFileSync("src/data/image-maps.json", JSON.stringify(result, null, 2) + "\n");
console.log("Wrote src/data/image-maps.json");
