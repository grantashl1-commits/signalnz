/**
 * Side-by-side comparison of the duplicate recipe pairs, to decide which of
 * each pair to keep.
 *
 *   npx tsx scripts/compare-recipe-duplicates.ts
 */
import { ALL_RECIPES } from "@/lib/recipe-index";

const PAIRS: [string, string][] = [
  ["lunch-f1", "dinner-chicken-quinoa-bowl"],
  ["lunch-o7", "dinner-zucchini-fritters"],
  ["lunch-l2", "dinner-chickpea-pumpkin-curry"],
  ["lunch-x1", "dinner-lentil-bolognese"],
  ["lunch-x2", "dinner-pumpkin-kale-chilli"],
  ["lunch-x3", "dinner-mushroom-lentil-shepherds-pie"],
  ["lunch-x8", "dinner-vegan-pad-thai"],
  ["lunch-x10", "dinner-cauliflower-chickpea-bowl"],
  ["dinner-m5", "dinner-beef-bolognese"],
  ["dinner-m8", "dinner-tofu-thai-green-curry"],
  // suspected extra duplicates from the ingredient-overlap pass
  ["lunch-f2", "dinner-tempeh-broccoli-stirfry"],
  ["lunch-f9", "dinner-roasted-veg-quinoa"],
  ["lunch-l5", "dinner-chicken-sweet-potato-stew"],
  ["dinner-m4", "dinner-chicken-curry"],
];

const byId = new Map(ALL_RECIPES.map((r) => [r.id, r]));
const FIELDS = ["name", "phase", "category", "protein", "serves", "prepTime", "cookTime", "image"] as const;

const out: string[] = [];
for (const [aId, bId] of PAIRS) {
  const a = byId.get(aId);
  const b = byId.get(bId);
  if (!a || !b) {
    out.push(`## ${aId} / ${bId}\n**MISSING** a=${!!a} b=${!!b}\n`);
    continue;
  }
  out.push(`## ${a.name}`);
  out.push(``);
  const diffs: string[] = [];
  for (const f of FIELDS) {
    const av = String((a as Record<string, unknown>)[f] ?? "—");
    const bv = String((b as Record<string, unknown>)[f] ?? "—");
    const mark = av === bv ? "  " : "≠ ";
    if (av !== bv) diffs.push(f);
    out.push(`| ${mark}${f} | ${av} | ${bv} |`);
  }
  out.push(``);
  out.push(`- ${aId}: phase=${a.phase} category=${a.category ?? "—"} protein=${a.protein ?? "—"} servings=${a.serves} ing=${a.ingredients.length} method=${a.method.length} tags=${(a.tags ?? []).join(",") || "—"}`);
  out.push(`- ${bId}: phase=${b.phase} category=${b.category ?? "—"} protein=${b.protein ?? "—"} servings=${b.serves} ing=${b.ingredients.length} method=${b.method.length} tags=${(b.tags ?? []).join(",") || "—"}`);
  out.push(``);
  out.push(`differing fields: ${diffs.join(", ") || "none"}`);
  if (diffs.includes("phase")) {
    out.push(`PHASE DIFFERS -> both may be needed by the cycle plan`);
  } else if (diffs.length === 0) {
    out.push(`IDENTICAL on these fields -> one is redundant`);
  }
  out.push(``);

  // ingredient diff
  const setA = new Set(a.ingredients.map((s) => s.toLowerCase()));
  const setB = new Set(b.ingredients.map((s) => s.toLowerCase()));
  const onlyA = [...setA].filter((x) => !setB.has(x));
  const onlyB = [...setB].filter((x) => !setA.has(x));
  if (onlyA.length || onlyB.length) {
    out.push(`ingredients only in ${aId}: ${onlyA.join(" | ") || "—"}`);
    out.push(`ingredients only in ${bId}: ${onlyB.join(" | ") || "—"}`);
    out.push(``);
  } else {
    out.push(`ingredients identical\n`);
  }
}

import { writeFileSync } from "node:fs";
writeFileSync("handoff/recipe-pair-compare.md", out.join("\n"));
console.log(out.join("\n"));
