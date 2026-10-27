/**
 * Compares the habit library against the illustrations on disk.
 *
 *   npx tsx scripts/analyse-habit-images.ts
 *
 * Writes handoff/habits-missing-images.json for the generator.
 */
import { readdirSync, writeFileSync } from "node:fs";

import { HABIT_LIBRARY } from "@/data/habit-library";

const DIR = "public/images/habits";
const files = new Set(
  readdirSync(DIR)
    .filter((f) => f.endsWith(".png"))
    .map((f) => f.replace(/\.png$/, "")),
);

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[''`]/g, "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

type H = {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  frequency?: string;
};

const habits = HABIT_LIBRARY as unknown as H[];

/** Hand-mapped because habit ids and illustration filenames came from different eras. */
const ALIASES: Record<string, string> = {
  "daily-steps": "daily-steps",
  "eat-30-plants": "eat-30-plants",
  "fermented-food": "fermented-food",
  "leafy-greens": "leafy-greens",
  "movement-break": "movement-break",
  "oily-fish": "oily-fish",
  "protein-breakfast": "protein-breakfast",
  "stretching-mobility": "stretching-mobility",
  "yoga-pilates": "yoga-pilates",
};

const rows: { id: string; name: string; slug: string; category: string; subcategory?: string; description: string; image: string | null }[] = [];
for (const h of habits) {
  const byId = files.has(h.id) ? h.id : null;
  const byAlias = ALIASES[h.id] && files.has(ALIASES[h.id]) ? ALIASES[h.id] : null;
  const bySlug = files.has(slug(h.name)) ? slug(h.name) : null;
  rows.push({
    id: h.id,
    name: h.name,
    slug: slug(h.name),
    category: h.category,
    subcategory: h.subcategory,
    description: h.description,
    image: byId ?? byAlias ?? bySlug,
  });
}

const have = rows.filter((r) => r.image);
const missing = rows.filter((r) => !r.image);
const usedFiles = new Set(have.map((r) => r.image));
const unusedFiles = [...files].filter((f) => !usedFiles.has(f) && !f.startsWith("category-"));

writeFileSync("handoff/habits-missing-images.json", JSON.stringify(missing, null, 1) + "\n");

console.log(`habits in library: ${habits.length}`);
console.log(`have an image    : ${have.length}`);
console.log(`missing an image : ${missing.length}`);
console.log(`image files      : ${files.size} (incl. category-*)`);
console.log(`unused files     : ${unusedFiles.length}${unusedFiles.length ? " -> " + unusedFiles.join(", ") : ""}`);

const byCat = new Map<string, { have: number; missing: number }>();
for (const r of rows) {
  const e = byCat.get(r.category) ?? { have: 0, missing: 0 };
  if (r.image) e.have++;
  else e.missing++;
  byCat.set(r.category, e);
}
console.log("\nby category:");
for (const [c, e] of [...byCat.entries()].sort((a, b) => b[1].missing - a[1].missing)) {
  console.log(`  ${c.padEnd(16)} have ${String(e.have).padStart(3)}  missing ${String(e.missing).padStart(3)}`);
}

console.log("\nmissing (first 40):");
for (const r of missing.slice(0, 40)) console.log(`  ${r.id.padEnd(36)} ${r.name}`);
