/**
 * Generates the strength & core exercise illustrations (the watercolour set).
 *
 * Reads  : src/exercise-prompts.json          (built by build-exercise-prompts.mjs)
 * Writes : handoff/exercise-images-raw/<file>.png   raw, opaque, white background
 *
 * Then run the cut-out step, which is what actually updates the shipped artwork:
 *   python scripts/make-transparent.py --dir handoff/exercise-images-raw \
 *          --out public/images/exercises --overwrite
 *
 * The two steps are separate on purpose. The generator returns opaque images on
 * flat white, but public/images/exercises holds transparent cut-outs (see
 * src/assets/movement/STYLE.md). Writing raw output straight over the shipped
 * files would replace cut-outs with white squares. Generating into a staging
 * directory means the shipped artwork is only touched by the cut-out step, and
 * only when that succeeds.
 *
 * Usage
 *   node scripts/generate-exercise-art.mjs --provider=gemini
 *   node scripts/generate-exercise-art.mjs --provider=gemini --only=goblet-squat
 *   node scripts/generate-exercise-art.mjs --provider=gemini --limit=3
 *   node scripts/generate-exercise-art.mjs --continue-missing
 *   node scripts/generate-exercise-art.mjs --dry-run
 *
 * Only exercises that already have a file in public/images/exercises are drawn,
 * so names line up exactly with what the app ships. Pass --continue-missing to
 * also draw the five catalogue exercises that have no artwork yet.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { resolveProvider, generateWithRetry, parseArgs } from "./lib/image-provider.mjs";

const PROMPTS = "src/exercise-prompts.json";
const SHIPPED = "public/images/exercises";
const RAW_DIR = "handoff/exercise-images-raw";

const args = parseArgs();
const PROVIDER = (args.get("provider") ?? "gemini").toLowerCase();
const ONLY = args.get("only")?.split(",").map((s) => s.trim()).filter(Boolean);
const LIMIT = args.get("limit") ? Number(args.get("limit")) : Infinity;
const FORCE = args.has("force");
const DRY = args.has("dry-run");
const CONCURRENCY = Number(args.get("concurrency") ?? 3);
const CONTINUE_MISSING = args.has("continue-missing");
/**
 * Draw only the exercises that have no shipped file yet. This is what the
 * library back-fill needs: --continue-missing would also redraw the 61
 * illustrations that already exist.
 */
const ONLY_MISSING = args.has("only-missing");

/** Prompt name -> shipped filename, where the slug does not match. */
const FILENAME_OVERRIDES = {
  "bridge-pilates": "bridge",
  "swan-yin": "swan",
};

const slug = (s) =>
  s
    .toLowerCase()
    .replace(/[()]/g, " ")
    .replace(/['’.]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

let providerFn;
try {
  providerFn = resolveProvider(PROVIDER);
} catch (err) {
  console.error(err.message);
  process.exit(2);
}

const prompts = JSON.parse(readFileSync(PROMPTS, "utf8"));
const shipped = new Set(readdirSync(SHIPPED).filter((f) => f.endsWith(".png")));

const jobs = [];
const skippedNoArt = [];
for (const p of prompts) {
  const s = slug(p.name);
  const stem = FILENAME_OVERRIDES[s] ?? s;
  const file = `${stem}.png`;

  if (ONLY_MISSING) {
    if (shipped.has(file)) continue;
    jobs.push({ name: p.name, id: stem, file, prompt: p.prompt });
    continue;
  }
  if (!shipped.has(file) && !CONTINUE_MISSING) {
    skippedNoArt.push({ name: p.name, file });
    continue;
  }
  jobs.push({ name: p.name, id: stem, file, prompt: p.prompt });
}

let queue = jobs;
if (ONLY) {
  const set = new Set(ONLY);
  queue = queue.filter((j) => set.has(j.id) || set.has(j.file.replace(/\.png$/, "")));
}

// Skip ones already staged unless --force.
const already = [];
queue = queue.filter((j) => {
  const staged = resolve(RAW_DIR, j.file);
  if (!FORCE && existsSync(staged)) {
    already.push(j.id);
    return false;
  }
  return true;
});

queue = queue.slice(0, LIMIT);

if (skippedNoArt.length) {
  console.log(
    `Not drawing ${skippedNoArt.length} catalogue exercises with no artwork yet ` +
      `(use --continue-missing to add them):\n  ` +
      skippedNoArt.map((s) => s.name).join(", "),
  );
}

if (queue.length === 0) {
  console.log(`Nothing to generate. ${already.length} already staged, ${skippedNoArt.length} have no artwork.`);
  process.exit(0);
}

if (!existsSync(RAW_DIR)) mkdirSync(RAW_DIR, { recursive: true });

console.log(
  `${DRY ? "[dry run] " : ""}${queue.length} to generate via ${PROVIDER} at 1024x1024` +
    (already.length ? ` (${already.length} already staged)` : "") +
    ` · concurrency ${CONCURRENCY}`,
);

if (DRY) {
  for (const j of queue) console.log(`  ${j.file}  <- ${j.name}`);
  process.exit(0);
}

const failures = [];
const written = [];
let done = 0;

async function worker(slot) {
  for (;;) {
    const item = queue.shift();
    if (!item) return;
    const { buffer, error } = await generateWithRetry(providerFn, item.prompt, { slot });
    if (error) {
      failures.push({ id: item.id, error });
      console.error(`  FAILED ${item.file} — ${error}`);
      continue;
    }
    writeFileSync(resolve(RAW_DIR, item.file), buffer);
    written.push(item.file);
    done++;
    console.log(`  [${done}] ${item.file} (${(buffer.length / 1024).toFixed(0)} kB)`);
  }
}

await Promise.all(Array.from({ length: Math.min(CONCURRENCY, queue.length) }, (_, i) => worker(i + 1)));

console.log(`\nRaw images: ${done} written, ${failures.length} failed -> ${RAW_DIR}`);
if (done > 0) {
  console.log(`\nNext, cut out the background onto the shipped set:`);
  console.log(`  python scripts/make-transparent.py --dir ${RAW_DIR} --out ${SHIPPED} --overwrite`);
}
if (failures.length) {
  console.log("\nFailures (re-run without --force to retry):");
  for (const f of failures) console.log(`  ${f.id}: ${f.error}`);
  process.exit(1);
}
