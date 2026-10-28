/**
 * Checks which of the duplicate image paths are actually referenced, so nothing
 * in use gets deleted. Read-only.
 *
 *   npx tsx scripts/check-duplicate-images.ts
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";

const IMG_ROOT = "public/images/recipes";
const dupJson = JSON.parse(readFileSync("handoff/recipe-duplicates.json", "utf8"));

// Every text source that could name an image path.
const SOURCES = [
  "src/data/image-maps.json",
  "src/data/recipe-image-files.json",
  "src/data/meal-plans.ts",
];
const blobs: { file: string; text: string }[] = [];
for (const f of SOURCES) if (existsSync(f)) blobs.push({ file: f, text: readFileSync(f, "utf8") });

// Recipe modules may set an explicit `image:` field.
for (const f of readdirSync("src/data")) {
  if (f.endsWith(".ts")) {
    const p = `src/data/${f}`;
    const t = readFileSync(p, "utf8");
    if (t.includes("/images/recipes/")) blobs.push({ file: p, text: t });
  }
}

function referenced(path: string): string[] {
  // Match with or without a leading slash; the maps key on the full path.
  const bare = path.replace(/^\.\//, "");
  const needles = [`/images/recipes/${bare}`, `images/recipes/${bare}`];
  const hits: string[] = [];
  for (const b of blobs) {
    if (needles.some((n) => b.text.includes(n))) hits.push(b.file);
  }
  return hits;
}

console.log(`scanned ${blobs.length} source files for image references\n`);

let safe = 0;
let risky = 0;

console.log("=== same recipe, multiple formats ===");
for (const group of dupJson.sameStemMultiExt as string[][]) {
  const info = group.map((p) => ({ p, refs: referenced(p) }));
  const refd = info.filter((x) => x.refs.length);
  console.log(`\n${group[0].split("/").pop()}`);
  for (const x of info) {
    console.log(`  ${x.refs.length ? "REFERENCED" : "unused    "} ${x.p}${x.refs.length ? "  <- " + x.refs.join(", ") : ""}`);
  }
  if (refd.length === 0) {
    console.log(`  -> NEITHER referenced: image unused by any recipe`);
  } else if (refd.length === info.length) {
    console.log(`  -> BOTH referenced: cannot delete either`);
  } else {
    safe++;
    console.log(`  -> safe to delete the unused one(s)`);
  }
  if (refd.length === info.length) risky++;
}

console.log("\n=== slug variants ===");
for (const group of dupJson.slugVariants as string[][]) {
  const info = group.map((p) => ({ p, refs: referenced(p) }));
  console.log(" ".repeat(0) + group.join("  <->  "));
  for (const x of info) {
    console.log(`  ${x.refs.length ? "REFERENCED" : "unused    "} ${x.p}${x.refs.length ? "  <- " + x.refs.join(", ") : ""}`);
  }
}

import { writeFileSync } from "node:fs";
writeFileSync(
  "handoff/duplicate-image-refs.json",
  JSON.stringify(
    {
      sameStemMultiExt: (dupJson.sameStemMultiExt as string[][]).map((g) => g.map((p) => ({ path: p, refs: referenced(p) }))),
      slugVariants: (dupJson.slugVariants as string[][]).map((g) => g.map((p) => ({ path: p, refs: referenced(p) }))),
    },
    null,
    1,
  ) + "\n",
);
console.log(`\nwrote handoff/duplicate-image-refs.json`);
