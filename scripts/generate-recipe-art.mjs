/**
 * Generates illustrations for recipes that have none.
 *
 * Reads  : handoff/recipes-missing-images.json  (from list-recipes-missing-images.ts)
 * Writes : handoff/recipe-images-raw/<slug>.png   raw, opaque, white background
 *
 * Then cut out and register, which is what actually ships them:
 *   python scripts/make-transparent.py --dir handoff/recipe-images-raw \
 *          --out public/images/recipes --quantize 256 --overwrite
 *   node scripts/build-image-maps.mjs
 *
 * Files must be named by the same slug the app looks up (slugifyRecipeName in
 * src/lib/recipe-index.ts) and sit at the ROOT of public/images/recipes —
 * build-image-maps.mjs only scans that level, not the meals/ subfolder.
 *
 * Usage
 *   node scripts/generate-recipe-art.mjs --provider=gemini --limit=3
 *   node scripts/generate-recipe-art.mjs --provider=gemini --only=miso-tofu-soba-bowl
 *   node scripts/generate-recipe-art.mjs --provider=gemini --concurrency=3
 *   node scripts/generate-recipe-art.mjs --dry-run
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { resolveProvider, generateWithRetry, parseArgs } from "./lib/image-provider.mjs";

const args = parseArgs();
const INPUT = args.get("input") ?? "handoff/recipes-missing-images.json";
const RAW_DIR = args.get("raw") ?? "handoff/recipe-images-raw";
const PROVIDER = (args.get("provider") ?? "gemini").toLowerCase();
const ONLY = args.get("only")?.split(",").map((s) => s.trim()).filter(Boolean);
const CATEGORY = args.get("category")?.toLowerCase();
const LIMIT = args.get("limit") ? Number(args.get("limit")) : Infinity;
const FORCE = args.has("force");
const DRY = args.has("dry-run");
const CONCURRENCY = Number(args.get("concurrency") ?? 3);

/** Shared house style, matched to the 103 shipped recipe illustrations. */
const STYLE = [
  "Hand-drawn food illustration in a loose marker-and-ink style, square 1:1, on a plain flat white background.",
  "VIEW — one plated serving seen from directly above, or from a slight high three-quarter angle. The dish fills the middle of the frame. A single loose hand-drawn circular sketch line traces the rim of the plate, left deliberately sketchy and broken, not a perfect circle.",
  "STYLE — confident sketchy outlines in warm dark brown ink, filled with saturated but slightly muted watercolour-marker colour. Visible brush edges, a little hatching for shadow, warm and appetising. Gentle, human imperfection in the lines. Never photorealistic, never 3D-rendered, never a photograph.",
  "Keep it appetising and identifiable: the viewer should recognise the main ingredients listed below.",
  "ABSOLUTELY NO text anywhere. No labels, no letters, no numbers, no captions, no watermark — and specifically no writing, lettering, branding or decoration that resembles words on the plate, the bowl, the vessel or any surface. Vessels are plain and undecorated.",
  "FRAMING — the plate sits centred with generous empty white margin on every side, nothing cropped at the edges.",
].join("\n\n");

/** Strip leading quantities so the prompt reads as food, not a shopping list. */
function cleanIngredient(line) {
  return line
    .replace(/^\s*[\d.,/½¼¾]+\s*(g|kg|ml|l|cups?|tbsp|tsp|slices?|cloves?|cans?|small|medium|large|handful)\b\.?\s*/i, "")
    .replace(/^\s*[\d.,/½¼¾]+\s+/, "")
    .replace(/\s*\(.*?\)\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildPrompt(r) {
  const shown = r.ingredients
    .map(cleanIngredient)
    .filter((x) => x.length > 2)
    .slice(0, 6);

  const form =
    r.category === "breakfast"
      ? "a breakfast dish"
      : r.category === "snack"
        ? "a snack"
        : r.category === "baking"
          ? "a baked treat"
          : "a main meal";

  return [
    STYLE,
    `DISH — ${form} called "${r.name}". Visible ingredients include: ${shown.join(", ")}.`,
    "Depict the dish as the ingredients imply it is served — in a bowl, on a plate, or as a portion of the baked item — and choose a vessel that suits it.",
  ].join("\n\n");
}

const jobs = JSON.parse(readFileSync(INPUT, "utf8"));

let queue = jobs;
if (ONLY) {
  const set = new Set(ONLY);
  queue = queue.filter((j) => set.has(j.slug) || set.has(j.id));
}
if (CATEGORY) queue = queue.filter((j) => j.category === CATEGORY);

const already = [];
queue = queue.filter((j) => {
  if (!FORCE && existsSync(resolve(RAW_DIR, `${j.slug}.png`))) {
    already.push(j.slug);
    return false;
  }
  return true;
});

queue = queue.slice(0, LIMIT);

if (queue.length === 0) {
  console.log(`Nothing to generate. ${already.length} already staged.`);
  process.exit(0);
}

if (!DRY && !existsSync(RAW_DIR)) mkdirSync(RAW_DIR, { recursive: true });

console.log(
  `${DRY ? "[dry run] " : ""}${queue.length} to generate via ${PROVIDER} at 1024x1024` +
    (already.length ? ` (${already.length} already staged)` : "") +
    ` · concurrency ${CONCURRENCY}`,
);

if (DRY) {
  for (const j of queue.slice(0, 40)) console.log(`  ${j.slug}.png  <- ${j.name}`);
  if (queue.length > 40) console.log(`  … and ${queue.length - 40} more`);
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
      failures.push({ slug: item.slug, error });
      console.error(`  FAILED ${item.slug} — ${error}`);
      continue;
    }
    writeFileSync(resolve(RAW_DIR, `${item.slug}.png`), buffer);
    done++;
    console.log(`  [${done}] ${item.slug}.png (${(buffer.length / 1024).toFixed(0)} kB)`);
  }
}

await Promise.all(Array.from({ length: Math.min(CONCURRENCY, queue.length) }, (_, i) => worker(i + 1)));

console.log(`\nRaw images: ${done} written, ${failures.length} failed -> ${RAW_DIR}`);
if (done > 0) {
  console.log(`\nNext:`);
  console.log(`  python scripts/make-transparent.py --dir ${RAW_DIR} --out public/images/recipes --quantize 256 --overwrite`);
  console.log(`  node scripts/build-image-maps.mjs`);
}
if (failures.length) {
  console.log(`\nFailures:`);
  for (const f of failures) console.log(`  ${f.slug}: ${f.error}`);
  process.exit(1);
}
