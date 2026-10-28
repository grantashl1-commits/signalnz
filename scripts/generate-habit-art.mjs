/**
 * Generates illustrations for habits that have none.
 *
 * Reads  : src/data/habit-art-map.json  (hand-reviewed mapping)
 * Writes : handoff/habit-images-raw/<habit-id>.png   raw, opaque, white background
 *
 * Then cut out and register:
 *   python scripts/make-transparent.py --dir handoff/habit-images-raw \
 *          --out public/images/habits --quantize 256 --overwrite
 *   node scripts/build-image-maps.mjs
 *
 * New files are named by habit id (e.g. lib-magnesium.png) rather than by a
 * concept slug: ids are unique so a new illustration can never collide with or
 * silently override an existing one the way a concept name could.
 *
 * Usage
 *   node scripts/generate-habit-art.mjs --provider=gemini --limit=3
 *   node scripts/generate-habit-art.mjs --provider=gemini --only=lib-magnesium
 *   node scripts/generate-habit-art.mjs --provider=gemini --concurrency=3
 *   node scripts/generate-habit-art.mjs --dry-run
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { resolveProvider, generateWithRetry, parseArgs } from "./lib/image-provider.mjs";

const MAP = "src/data/habit-art-map.json";
const RITUAL_MAP = "src/data/ritual-art-map.json";
const RITUAL20_MAP = "src/data/ritual20-art-map.json";
const RAW_DIR = "handoff/habit-images-raw";

const args = parseArgs();
const PROVIDER = (args.get("provider") ?? "gemini").toLowerCase();
const ONLY = args.get("only")?.split(",").map((s) => s.trim()).filter(Boolean);
const LIMIT = args.get("limit") ? Number(args.get("limit")) : Infinity;
const FORCE = args.has("force");
const DRY = args.has("dry-run");
const CONCURRENCY = Number(args.get("concurrency") ?? 3);

/**
 * House style for habit art, matched to the 61 shipped files: soft minimal
 * watercolour, one object, warm palette, lots of white space. Deliberately a
 * different family from the recipe illustrations (which are detailed plated
 * food seen from above).
 */
const STYLE = [
  "Soft minimal watercolour illustration of a single object, square 1:1, on a plain flat white background.",
  "SUBJECT — one simple object or small still-life grouping, centred, occupying roughly the middle third of the frame. Plenty of empty white space all around it. It should read instantly as an icon.",
  "STYLE — loose, gentle watercolour washes in a warm palette: soft peach, cream, amber, terracotta, muted sage and dusty rose. A thin, slightly wobbly hand-drawn ink outline in warm brown, not black. Soft edges where the colour bleeds slightly past the line. Gentle, human, calming. Never photorealistic, never 3D, never a photograph, no harsh shadows.",
  "MOOD — quiet, warm, encouraging. This illustrates a small daily wellbeing habit, so keep it friendly and uncluttered rather than clinical.",
  "ABSOLUTELY NO text anywhere: no labels, no letters, no numbers, no captions, no watermark, and no writing on any object.",
  "FRAMING — centred with generous white margin on every side, nothing cropped at the edges, no border or frame.",
].join("\n\n");

/**
 * All three illustration maps share one shape and one output folder: habits come
 * from HABIT_LIBRARY (ids prefixed lib-), rituals from SELF_CARE_RITUALS (plain
 * ids) and the 20-day challenge from RITUAL20_ITEMS (ids prefixed r20-). The sets
 * don't overlap, so they can be merged safely.
 */
const map = {
  ...JSON.parse(readFileSync(MAP, "utf8")).map,
  ...JSON.parse(readFileSync(RITUAL_MAP, "utf8")).map,
  ...JSON.parse(readFileSync(RITUAL20_MAP, "utf8")).map,
};

const jobs = Object.entries(map)
  .filter(([, v]) => v && !v.image && v.prompt)
  .map(([id, v]) => ({ id, prompt: v.prompt }));

let queue = jobs;
if (ONLY) {
  const set = new Set(ONLY);
  queue = queue.filter((j) => set.has(j.id));
}

const already = [];
queue = queue.filter((j) => {
  if (!FORCE && existsSync(resolve(RAW_DIR, `${j.id}.png`))) {
    already.push(j.id);
    return false;
  }
  return true;
});
queue = queue.slice(0, LIMIT);

if (queue.length === 0) {
  console.log(`Nothing to generate. ${jobs.length} need art, ${already.length} already staged.`);
  process.exit(0);
}

if (!DRY && !existsSync(RAW_DIR)) mkdirSync(RAW_DIR, { recursive: true });

console.log(
  `${DRY ? "[dry run] " : ""}${queue.length} habit illustrations via ${PROVIDER} at 1024x1024` +
    (already.length ? ` (${already.length} already staged)` : "") +
    ` · concurrency ${CONCURRENCY}`,
);

const buildPrompt = (j) => `${STYLE}\n\nSUBJECT — ${j.prompt}.`;

if (DRY) {
  for (const j of queue) console.log(`  ${j.id}.png  <- ${j.prompt}`);
  process.exit(0);
}

let providerFn;
try {
  providerFn = resolveProvider(PROVIDER);
} catch (err) {
  console.error(err.message);
  process.exit(2);
}

const failures = [];
let done = 0;

async function worker(slot) {
  for (;;) {
    const item = queue.shift();
    if (!item) return;
    const { buffer, error } = await generateWithRetry(providerFn, buildPrompt(item), { slot });
    if (error) {
      failures.push({ id: item.id, error });
      console.error(`  FAILED ${item.id} — ${error}`);
      continue;
    }
    writeFileSync(resolve(RAW_DIR, `${item.id}.png`), buffer);
    done++;
    console.log(`  [${done}] ${item.id}.png (${(buffer.length / 1024).toFixed(0)} kB)`);
  }
}

await Promise.all(Array.from({ length: Math.min(CONCURRENCY, queue.length) }, (_, i) => worker(i + 1)));

console.log(`\nRaw images: ${done} written, ${failures.length} failed -> ${RAW_DIR}`);
if (done > 0) {
  console.log(`\nNext:`);
  console.log(`  python scripts/make-transparent.py --dir ${RAW_DIR} --out public/images/habits --quantize 256 --overwrite`);
  console.log(`  node scripts/build-image-maps.mjs`);
}
if (failures.length) {
  for (const f of failures) console.log(`  ${f.id}: ${f.error}`);
  process.exit(1);
}
