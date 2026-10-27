/**
 * Batch-generates reformer exercise illustrations.
 *
 * Reads  : src/reformer-exercise-prompts.json  (built by build-reformer-prompts.mjs)
 * Writes : src/assets/movement/reformer/<exercise-id>.png
 *
 * Providers
 *   openai   — gpt-image-1            (OPENAI_API_KEY)
 *   gemini   — gemini-2.5-flash-image (GEMINI_API_KEY / GOOGLE_API_KEY)
 *
 * Usage
 *   node scripts/generate-reformer-art.mjs --provider=gemini
 *   node scripts/generate-reformer-art.mjs --provider=openai --only=footwork-first-position
 *   node scripts/generate-reformer-art.mjs --provider=gemini --series=Footwork --force
 *   node scripts/generate-reformer-art.mjs --provider=gemini --level=beginner --limit=5
 *   node scripts/generate-reformer-art.mjs --dry-run
 *
 * Skips any exercise whose PNG already exists unless --force is passed, so it is
 * safe to re-run. Failures are collected and reported at the end with a non-zero
 * exit, and a re-run picks up only what is still missing.
 *
 * Keys may also come from an env file: put them in .env.local and they are read
 * automatically (the script parses the file directly, no dependency needed).
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";

// ─── args ──────────────────────────────────────────────────────────────
const args = new Map();
for (const raw of process.argv.slice(2)) {
  const [k, v] = raw.replace(/^--/, "").split("=");
  args.set(k, v ?? "true");
}
const PROVIDER = (args.get("provider") ?? env("IMAGE_PROVIDER") ?? "gemini").toLowerCase();
const ONLY = args.get("only")?.split(",").map((s) => s.trim()).filter(Boolean);
const SERIES = args.get("series")?.toLowerCase();
const LEVEL = args.get("level")?.toLowerCase();
const LIMIT = args.get("limit") ? Number(args.get("limit")) : Infinity;
const FORCE = args.has("force");
const DRY = args.has("dry-run");
const CONCURRENCY = Number(args.get("concurrency") ?? 3);
const OUT_DIR = "src/assets/movement/reformer";
const PROMPTS = "src/reformer-exercise-prompts.json";

// ─── env ───────────────────────────────────────────────────────────────
function env(name) {
  if (process.env[name]) return process.env[name];
  for (const file of [".env.local", ".env"]) {
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && m[1] === name) return m[2].replace(/^["']|["']$/g, "");
    }
  }
  return undefined;
}

// ─── providers ─────────────────────────────────────────────────────────
const MAX_ATTEMPTS = 4;

async function generateOpenAI(prompt) {
  const key = env("OPENAI_API_KEY");
  if (!key) throw new Error("OPENAI_API_KEY is not set");
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "high",
      output_format: "png",
    }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${body?.error?.message ?? JSON.stringify(body)}`);
  const b64 = body?.data?.[0]?.b64_json;
  if (!b64) throw new Error("OpenAI returned no image data");
  return Buffer.from(b64, "base64");
}

async function generateGemini(prompt) {
  const key = env("GEMINI_API_KEY") ?? env("GOOGLE_API_KEY");
  if (!key) throw new Error("GEMINI_API_KEY (or GOOGLE_API_KEY) is not set");
  const model = args.get("model") ?? "gemini-2.5-flash-image";
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ["IMAGE"] },
      }),
    },
  );
  const body = await res.json();
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${body?.error?.message ?? JSON.stringify(body)}`);
  const part = body?.candidates?.[0]?.content?.parts?.find((p) => p.inlineData ?? p.inline_data);
  const data = part?.inlineData ?? part?.inline_data;
  if (!data?.data) throw new Error("Gemini returned no image data");
  return Buffer.from(data.data, "base64");
}

const PROVIDERS = {
  openai: generateOpenAI,
  gemini: generateGemini,
};

// ─── main ──────────────────────────────────────────────────────────────
const generate = PROVIDERS[PROVIDER];
if (!generate) {
  console.error(`Unknown provider "${PROVIDER}". Use one of: ${Object.keys(PROVIDERS).join(", ")}`);
  process.exit(2);
}

const all = JSON.parse(readFileSync(PROMPTS, "utf8"));

let queue = all;
if (ONLY) queue = queue.filter((p) => ONLY.includes(p.id));
if (SERIES) queue = queue.filter((p) => p.series?.toLowerCase() === SERIES);
if (LEVEL) queue = queue.filter((p) => p.level === LEVEL);

const skipped = [];
queue = queue.filter((p) => {
  const target = resolve(OUT_DIR, p.outputFile);
  // Plan art may already have been shrunk to WebP (scripts/optimise-reformer-art.mjs).
  if (!FORCE && (existsSync(target) || existsSync(target.replace(/\.png$/i, ".webp")))) {
    skipped.push(p.id);
    return false;
  }
  return true;
});

queue = queue.slice(0, LIMIT);

if (queue.length === 0) {
  console.log(`Nothing to do — ${skipped.length} already on disk. Use --force to redraw.`);
  process.exit(0);
}

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

console.log(
  `${DRY ? "[dry run] " : ""}${queue.length} to generate via ${PROVIDER}` +
    (skipped.length ? ` (${skipped.length} already present, skipped)` : "") +
    ` · concurrency ${CONCURRENCY}`,
);

if (DRY) {
  for (const p of queue) console.log(`  ${p.outputFile}  ← ${p.name}`);
  process.exit(0);
}

const failures = [];
let done = 0;

async function worker(slot) {
  for (;;) {
    const item = queue.shift();
    if (!item) return;
    const target = resolve(OUT_DIR, item.outputFile);
    let lastErr;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const buf = await generate(item.prompt);
        writeFileSync(target, buf);
        done++;
        console.log(`  [${done}/${done + queue.length + failures.length}] ${item.outputFile} (${(buf.length / 1024).toFixed(0)} kB)`);
        lastErr = undefined;
        break;
      } catch (err) {
        lastErr = err;
        const msg = String(err?.message ?? err);
        // Don't hammer on quota or auth errors.
        if (/401|403|quota|billing|API_KEY is not set/i.test(msg)) break;
        if (attempt < MAX_ATTEMPTS) {
          const wait = 1500 * attempt * slot;
          console.warn(`  retry ${attempt}/${MAX_ATTEMPTS - 1} for ${item.id} in ${wait}ms — ${msg}`);
          await new Promise((r) => setTimeout(r, wait));
        }
      }
    }
    if (lastErr) {
      failures.push({ id: item.id, error: String(lastErr?.message ?? lastErr) });
      console.error(`  FAILED ${item.outputFile} — ${lastErr?.message ?? lastErr}`);
    }
  }
}

await Promise.all(Array.from({ length: Math.min(CONCURRENCY, queue.length) }, (_, i) => worker(i + 1)));

console.log(`\nDone: ${done} written, ${failures.length} failed, ${skipped.length} skipped.`);
if (failures.length) {
  console.log("\nFailures (re-run without --force to retry only these):");
  for (const f of failures) console.log(`  ${f.id}: ${f.error}`);
  process.exit(1);
}
