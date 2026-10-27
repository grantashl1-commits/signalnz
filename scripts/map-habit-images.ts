/**
 * Full habit -> illustration mapping using token overlap, not exact slugs.
 * Prints every habit so the mapping can be eyeballed.
 *
 *   npx tsx scripts/map-habit-images.ts
 *
 * Writes handoff/habit-image-map.json and handoff/habits-missing-images.json
 */
import { readdirSync, writeFileSync } from "node:fs";
import { HABIT_LIBRARY } from "@/data/habit-library";

const DIR = "public/images/habits";
const files = readdirSync(DIR).filter((f) => f.endsWith(".png")).map((f) => f.replace(/\.png$/, ""));

const STOP = new Set([
  "lib", "daily", "today", "this", "week", "the", "a", "an", "of", "in", "on", "for", "to",
  "and", "or", "with", "your", "min", "mins", "minutes", "session", "practice", "practices",
  "g", "mg", "mcg", "iu", "plus", "per", "day",
]);

/** Normalise numbers and words so "10,000" == "10000" == "10k", "2L" == "2l". */
function tokens(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/(\d),(\d{3})/g, "$1$2")
    .replace(/(\d+)\s*k\b/g, (_, n) => String(Number(n) * 1000))
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter((w) => w && !STOP.has(w));
}

type H = {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
};

const habits = HABIT_LIBRARY as unknown as H[];
const fileTokens = new Map(files.map((f) => [f, new Set(tokens(f))]));

/** Extra credit: the habit's name shares a distinctive word with the file. */
function score(habit: H): { file: string; s: number } | null {
  const hTok = new Set(tokens(`${habit.name} ${habit.description}`));
  const hNameTok = new Set(tokens(habit.name));
  let best: { file: string; s: number } | null = null;
  for (const f of files) {
    const fTok = fileTokens.get(f)!;
    if (fTok.size === 0) continue;
    let inName = 0;
    for (const t of fTok) if (hNameTok.has(t)) inName++;
    let inAll = 0;
    for (const t of fTok) if (hTok.has(t)) inAll++;
    // Weight name matches much higher than description matches.
    const s = (inName / fTok.size) * 0.8 + (inAll / fTok.size) * 0.2;
    if (!best || s > best.s) best = { file: f, s };
  }
  return best;
}

const ACCEPT = 0.5;
const assigned = new Map<string, string[]>();
const result: { id: string; name: string; category: string; file: string | null; score: number }[] = [];

for (const h of habits) {
  const b = score(h);
  const file = b && b.s >= ACCEPT ? b.file : null;
  result.push({ id: h.id, name: h.name, category: h.category, file, score: b ? Number(b.s.toFixed(2)) : 0 });
  if (file) {
    const arr = assigned.get(file);
    if (arr) arr.push(h.id);
    else assigned.set(file, [h.id]);
  }
}

console.log(`habits: ${habits.length} | files: ${files.length}\n`);
for (const r of result) {
  const mark = r.file ? (assigned.get(r.file)!.length > 1 ? "SHARED" : "match ") : "MISSING";
  console.log(`  ${mark} ${r.id.padEnd(34)} -> ${(r.file ?? "—").padEnd(32)} (${r.score})  ${r.file ? "" : r.name}`);
}

const shared = [...assigned.entries()].filter(([, v]) => v.length > 1);
const usedFiles = new Set(assigned.keys());
const unused = files.filter((f) => !usedFiles.has(f));
const missing = result.filter((r) => !r.file);

console.log(`\nmatched: ${result.length - missing.length} | missing: ${missing.length}`);
console.log(`shared files: ${shared.length}`);
for (const [f, ids] of shared) console.log(`  ${f}: ${ids.join(", ")}`);
console.log(`unused files (${unused.length}): ${unused.join(", ") || "none"}`);

writeFileSync(
  "handoff/habit-image-map.json",
  JSON.stringify({ mapping: result, shared, unused }, null, 1) + "\n",
);
writeFileSync(
  "handoff/habits-missing-images.json",
  JSON.stringify(missing.map((m) => ({ id: m.id, name: m.name, category: habits.find((h) => h.id === m.id)!.category })), null, 1) + "\n",
);
console.log("\nwrote handoff/habit-image-map.json and handoff/habits-missing-images.json");
