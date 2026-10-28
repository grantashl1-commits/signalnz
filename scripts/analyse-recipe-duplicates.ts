/**
 * Finds duplicate and near-duplicate recipes across the app's recipe banks.
 *
 *   npx tsx scripts/analyse-recipe-duplicates.ts
 *
 * Writes:
 *   handoff/recipe-duplicates.md    human-readable report
 *   handoff/recipe-duplicates.json  machine-readable, for the removal step
 *
 * Detects three kinds of duplication, because "duplicate" means different
 * things in this codebase:
 *   1. Same name, different id  — a straight duplicate entry.
 *   2. Same name once qualifiers are stripped — "Chicken & Quinoa Bowl with
 *      Hummus" vs "…with Roasted Veg". Same dish, different garnish.
 *   3. Near-identical ingredient sets — different names, same recipe.
 *
 * It also reports image-side duplicates, which is where a lot of the mess is:
 * the same recipe with a slug that gained or lost "and", an apostrophe split
 * ("shepherd-s-pie"), or that shipped as both .jpg and .png.
 */
import { readdirSync } from "node:fs";
import { ALL_RECIPES } from "@/lib/recipe-index";
import { NOURISH_RECIPES } from "@/data/nourish-recipes";
import { SIGNAL_REWRITES } from "@/data/signal-rewrites";
import { KIDS_RECIPE_BANK } from "@/data/kids-recipes";

type AnyRecipe = {
  id: string;
  name: string;
  ingredients?: string[];
  category?: string;
  mealType?: string[];
  tags?: string[];
  protein?: string;
  phase?: string;
};

const STOP = new Set([
  "with", "and", "the", "a", "an", "of", "in", "on", "for", "to", "w",
  "bowl", "plate", "style", "served", "fresh", "easy", "quick", "simple",
]);

function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[''`]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function keywords(s: string): string[] {
  return norm(s).split(" ").filter((w) => w.length > 1 && !STOP.has(w));
}

/** Name with qualifiers stripped: keeps the first clause before "with". */
function stem(s: string): string {
  const n = norm(s);
  const cut = n.split(/\bwith\b|\band\b(?=.*\b)/)[0];
  return (cut || n).trim();
}

function keyOf(s: string): string {
  return keywords(s).sort().join(" ");
}

/** Jaccard similarity over ingredient keywords. */
function ingredientOverlap(a: string[] = [], b: string[] = []): number {
  const set = (l: string[]) => new Set(l.flatMap((x) => keywords(x)));
  const A = set(a);
  const B = set(b);
  if (A.size === 0 || B.size === 0) return 0;
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  return inter / (A.size + B.size - inter);
}

function groupBy<T>(items: T[], key: (t: T) => string): Map<string, T[]> {
  const m = new Map<string, T[]>();
  for (const it of items) {
    const k = key(it);
    if (!k) continue;
    const arr = m.get(k);
    if (arr) arr.push(it);
    else m.set(k, [it]);
  }
  return m;
}

const banks: { label: string; recipes: AnyRecipe[] }[] = [
  { label: "nourish", recipes: NOURISH_RECIPES as AnyRecipe[] },
  { label: "signal-rewrites", recipes: SIGNAL_REWRITES as AnyRecipe[] },
  { label: "kids", recipes: KIDS_RECIPE_BANK as AnyRecipe[] },
];

const bankOf = new Map<string, string>();
for (const b of banks) for (const r of b.recipes) if (!bankOf.has(r.id)) bankOf.set(r.id, b.label);

const all: AnyRecipe[] = ALL_RECIPES as AnyRecipe[];

// ── 1. same normalised name ────────────────────────────────────────────
const exactName = [...groupBy(all, (r) => norm(r.name)).entries()].filter(([, v]) => v.length > 1);

// ── 2. same stem (qualifiers stripped) ─────────────────────────────────
const stemGroups = [...groupBy(all, (r) => stem(r.name)).entries()].filter(([, v]) => v.length > 1);

// ── 3. near-identical ingredient sets ──────────────────────────────────
const loose: { a: AnyRecipe; b: AnyRecipe; score: number }[] = [];
for (let i = 0; i < all.length; i++) {
  for (let j = i + 1; j < all.length; j++) {
    const s = ingredientOverlap(all[i].ingredients, all[j].ingredients);
    if (s >= 0.75) loose.push({ a: all[i], b: all[j], score: s });
  }
}
loose.sort((x, y) => y.score - x.score);

// ── 4. image-side duplicates ───────────────────────────────────────────
const IMG_ROOT = "public/images/recipes";
function listImages(): { dir: string; name: string; stem: string }[] {
  const out: { dir: string; name: string; stem: string }[] = [];
  for (const entry of readdirSync(IMG_ROOT, { withFileTypes: true })) {
    if (entry.isFile() && /\.(png|jpe?g)$/i.test(entry.name)) {
      out.push({ dir: ".", name: entry.name, stem: entry.name.replace(/\.(png|jpe?g)$/i, "") });
    } else if (entry.isDirectory()) {
      for (const f of readdirSync(`${IMG_ROOT}/${entry.name}`)) {
        if (/\.(png|jpe?g)$/i.test(f)) {
          out.push({ dir: entry.name, name: f, stem: f.replace(/\.(png|jpe?g)$/i, "") });
        }
      }
    }
  }
  return out;
}
const images = listImages();

/** Same recipe, two formats. */
const sameStemMultiExt = [...groupBy(images, (i) => i.stem.toLowerCase()).entries()].filter(
  ([, v]) => v.length > 1,
);

/**
 * Slug variants of one recipe: "mushroom-and-lentil-shepherds-pie" and
 * "mushroom-and-lentil-shepherd-s-pie" collapse to the same skeleton.
 */
const slugSkeleton = (s: string): string =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "").replace(/s$/, "");

const slugVariants = [...groupBy(images, (i) => slugSkeleton(i.stem)).entries()].filter(
  ([, v]) => v.length > 1 && new Set(v.map((x) => x.stem)).size > 1,
);

// ── report ─────────────────────────────────────────────────────────────
const L: string[] = [];
const rel = (r: AnyRecipe) => `${r.name} [${bankOf.get(r.id) ?? "?"}:${r.id}]`;

L.push(`# Recipe duplicate analysis\n`);
L.push(`Generated by \`scripts/analyse-recipe-duplicates.ts\`.\n`);
L.push(`## Totals\n`);
L.push(`| Bank | Count |`);
L.push(`|---|--:|`);
for (const b of banks) L.push(`| ${b.label} | ${b.recipes.length} |`);
L.push(`| **ALL_RECIPES (canonical)** | **${all.length}** |`);
L.push(`| Images on disk | ${images.length} |\n`);

L.push(`## 1. Same name, different id — ${exactName.length} group(s)\n`);
if (!exactName.length) L.push(`_None._\n`);
for (const [k, v] of exactName) {
  L.push(`**"${v[0].name}"** (${k})`);
  for (const r of v) L.push(`- ${rel(r)}`);
  L.push("");
}

L.push(`## 2. Same dish once qualifiers are stripped — ${stemGroups.length} group(s)\n`);
if (!stemGroups.length) L.push(`_None._\n`);
for (const [k, v] of stemGroups) {
  if (v.length < 2) continue;
  if (new Set(v.map((r) => norm(r.name))).size < 2) continue; // already in section 1
  L.push(`**stem: "${k}"**`);
  for (const r of v) L.push(`- ${rel(r)}`);
  L.push("");
}

L.push(`## 3. Near-identical ingredient sets (>= 75%) — ${loose.length} pair(s)\n`);
if (!loose.length) L.push(`_None._\n`);
for (const { a, b, score } of loose.slice(0, 60)) {
  L.push(`- ${(score * 100).toFixed(0)}% — ${rel(a)}  ⟷  ${rel(b)}`);
}
L.push("");

L.push(`## 4. Image-side duplicates\n`);
L.push(`### Same recipe, multiple formats — ${sameStemMultiExt.length} group(s)\n`);
if (!sameStemMultiExt.length) L.push(`_None._\n`);
for (const [k, v] of sameStemMultiExt) {
  L.push(`- \`${k}\` → ${v.map((x) => `${x.dir}/${x.name}`).join(", ")}`);
}
L.push("");
L.push(`### Slug variants of one recipe — ${slugVariants.length} group(s)\n`);
if (!slugVariants.length) L.push(`_None._\n`);
for (const [, v] of slugVariants) {
  L.push(`- ${v.map((x) => `\`${x.dir}/${x.name}\``).join("  ⟷  ")}`);
}
L.push("");

import { writeFileSync, mkdirSync } from "node:fs";
mkdirSync("handoff", { recursive: true });
writeFileSync("handoff/recipe-duplicates.md", L.join("\n"));

writeFileSync(
  "handoff/recipe-duplicates.json",
  JSON.stringify(
    {
      totals: { all: all.length, images: images.length, banks: banks.map((b) => ({ bank: b.label, count: b.recipes.length })) },
      exactName: exactName.map(([k, v]) => ({ key: k, recipes: v.map((r) => ({ id: r.id, name: r.name, bank: bankOf.get(r.id) })) })),
      stemGroups: stemGroups.map(([k, v]) => ({ stem: k, recipes: v.map((r) => ({ id: r.id, name: r.name, bank: bankOf.get(r.id) })) })),
      ingredientPairs: loose.map(({ a, b, score }) => ({ a: { id: a.id, name: a.name }, b: { id: b.id, name: b.name }, score: Number(score.toFixed(3)) })),
      sameStemMultiExt: sameStemMultiExt.map(([, v]) => v.map((x) => `${x.dir}/${x.name}`)),
      slugVariants: slugVariants.map(([, v]) => v.map((x) => `${x.dir}/${x.name}`)),
    },
    null,
    1,
  ) + "\n",
);

console.log(`recipes: ${all.length} (nourish ${NOURISH_RECIPES.length}, signal ${SIGNAL_REWRITES.length}, kids ${KIDS_RECIPE_BANK.length})`);
console.log(`images: ${images.length}`);
console.log(`1 same-name groups:        ${exactName.length}`);
console.log(`2 same-stem groups:        ${stemGroups.length}`);
console.log(`3 ingredient pairs >=75%:  ${loose.length}`);
console.log(`4 multi-format image sets: ${sameStemMultiExt.length}`);
console.log(`5 image slug variants:     ${slugVariants.length}`);
console.log(`\nwrote handoff/recipe-duplicates.md and .json`);
