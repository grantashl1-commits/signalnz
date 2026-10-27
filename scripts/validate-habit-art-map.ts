/**
 * Validates src/data/habit-art-map.json against the real habit library:
 * no bogus habit ids, no unmapped habits, no image names missing from disk.
 *
 *   npx tsx scripts/validate-habit-art-map.ts
 */
import { readdirSync, readFileSync } from "node:fs";
import { HABIT_LIBRARY } from "@/data/habit-library";

const map = JSON.parse(readFileSync("src/data/habit-art-map.json", "utf8")).map as Record<
  string,
  { image: string | null; prompt: string | null }
>;

const habits = HABIT_LIBRARY as unknown as { id: string; name: string; category: string }[];
const ids = new Set(habits.map((h) => h.id));
const files = new Set(
  readdirSync("public/images/habits")
    .filter((f) => f.endsWith(".png"))
    .map((f) => f.replace(/\.png$/, "")),
);

const bogus = Object.keys(map).filter((k) => !ids.has(k));
const unmapped = habits.filter((h) => !map[h.id]).map((h) => `${h.id} (${h.name})`);

const brokenRefs: string[] = [];
const missingArt: { id: string; name: string; category: string }[] = [];
for (const h of habits) {
  const e = map[h.id];
  if (!e) continue;
  if (e.image) {
    if (!files.has(e.image)) brokenRefs.push(`${h.id} -> ${e.image}.png (not on disk)`);
  } else {
    missingArt.push({ id: h.id, name: h.name, category: h.category });
  }
}

// Any illustration on disk that nothing points at.
const used = new Set(Object.values(map).map((v) => v.image).filter(Boolean) as string[]);
const unused = [...files].filter((f) => !used.has(f) && !f.startsWith("category-"));

console.log(`habits:        ${habits.length}`);
console.log(`map entries:   ${Object.keys(map).length}`);
console.log(`with art:      ${habits.length - missingArt.length}`);
console.log(`need art:      ${missingArt.length}`);
console.log("");
console.log(`bogus keys     : ${bogus.length ? bogus.join(", ") : "none"}`);
console.log(`unmapped habits: ${unmapped.length ? unmapped.join(", ") : "none"}`);
console.log(`broken refs    : ${brokenRefs.length ? brokenRefs.join(", ") : "none"}`);
console.log(`unused files   : ${unused.length}${unused.length ? " -> " + unused.join(", ") : ""}`);

const byCat = new Map<string, number>();
for (const m of missingArt) byCat.set(m.category, (byCat.get(m.category) ?? 0) + 1);
console.log("\nneed art by category:", Object.fromEntries([...byCat.entries()].sort((a, b) => b[1] - a[1])));
for (const m of missingArt) console.log(`  ${m.id.padEnd(32)} ${m.name}`);
