/**
 * Generates the stretch illustrations (the watercolour muscle-group set).
 *
 * Reads  : src/stretch-prompts.json        (built by build-stretch-prompts.mjs)
 * Writes : handoff/stretch-images-raw/<id>.png   raw, opaque, white background
 *
 * Then run the cut-out step, which is what actually updates the shipped artwork:
 *   python scripts/make-transparent.py --dir handoff/stretch-images-raw \
 *          --out public/images/stretches --overwrite
 *
 * The two steps stay separate for the same reason as the strength & core set:
 * public/images/stretches holds transparent cut-outs, so writing raw opaque
 * output straight over them would replace cut-outs with white squares.
 *
 * Usage
 *   node scripts/generate-stretch-art.mjs --provider=gemini
 *   node scripts/generate-stretch-art.mjs --provider=gemini --only=hamstrings,glutes
 *   node scripts/generate-stretch-art.mjs --provider=gemini --force
 *   node scripts/generate-stretch-art.mjs --dry-run
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { resolveProvider, generateWithRetry, parseArgs } from "./lib/image-provider.mjs";

const PROMPTS = "src/stretch-prompts.json";
const RAW_DIR = "handoff/stretch-images-raw";

const args = parseArgs();
const PROVIDER = (args.get("provider") ?? "gemini").toLowerCase();
const ONLY = args.get("only")?.split(",").map((s) => s.trim()).filter(Boolean);
const LIMIT = args.get("limit") ? Number(args.get("limit")) : Infinity;
const FORCE = args.has("force");
const DRY = args.has("dry-run");
const CONCURRENCY = Number(args.get("concurrency") ?? 3);

let providerFn;
try {
  providerFn = resolveProvider(PROVIDER);
} catch (err) {
  console.error(err.message);
  process.exit(2);
}

const prompts = JSON.parse(readFileSync(PROMPTS, "utf8"));

let queue = prompts.map((p) => ({
  id: p.id,
  name: p.name,
  file: `${p.id}.png`,
  prompt: p.prompt,
}));

if (ONLY) {
  const set = new Set(ONLY);
  queue = queue.filter((j) => set.has(j.id));
}

const already = [];
queue = queue.filter((j) => {
  if (!FORCE && existsSync(resolve(RAW_DIR, j.file))) {
    already.push(j.id);
    return false;
  }
  return true;
});

queue = queue.slice(0, LIMIT);

if (queue.length === 0) {
  console.log(`Nothing to do — ${already.length} already staged. Use --force to redraw.`);
  process.exit(0);
}

if (!existsSync(RAW_DIR)) mkdirSync(RAW_DIR, { recursive: true });

console.log(
  `${DRY ? "[dry run] " : ""}${queue.length} to generate via ${PROVIDER} at 1024x1024` +
    (already.length ? ` (${already.length} already staged, skipped)` : "") +
    ` · concurrency ${CONCURRENCY}`,
);

if (DRY) {
  for (const j of queue) console.log(`  ${j.file}  <- ${j.name}`);
  process.exit(0);
}

const failures = [];
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
    done++;
    console.log(`  [${done}/${done + queue.length + failures.length}] ${item.file} (${(buffer.length / 1024).toFixed(0)} kB)`);
  }
}

await Promise.all(Array.from({ length: Math.min(CONCURRENCY, queue.length) }, (_, i) => worker(i + 1)));

console.log(`\nDone: ${done} written, ${failures.length} failed, ${already.length} skipped -> ${RAW_DIR}`);
if (done > 0) {
  console.log(`\nNext, cut out the background onto the shipped set:`);
  console.log(`  python scripts/make-transparent.py --dir ${RAW_DIR} --out public/images/stretches --overwrite`);
}
if (failures.length) {
  for (const f of failures) console.log(`  ${f.id}: ${f.error}`);
  process.exit(1);
}
