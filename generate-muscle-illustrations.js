/**
 * One-off dev script: generate hand-drawn watercolour exercise illustrations
 * via Google's Imagen API. Output goes to public/images/exercises/<slug>.png
 * so Vite serves them at /images/exercises/<slug>.png.
 *
 * Usage:
 *   GOOGLE_API_KEY=xxx node generate-muscle-illustrations.js              # all
 *   GOOGLE_API_KEY=xxx node generate-muscle-illustrations.js --limit 1   # first 1
 *   GOOGLE_API_KEY=xxx node generate-muscle-illustrations.js --exercise "Goblet Squat"
 *
 * Requires Node 18+ for native fetch.
 */
import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

// Load .env if present (Node 20.6+). Silent if file is missing.
try { process.loadEnvFile(".env"); } catch { /* no .env, fall through to process.env */ }

const API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("Set GOOGLE_API_KEY (or GEMINI_API_KEY) in .env or your shell environment.");
  process.exit(1);
}

const MODEL = process.env.IMAGEN_MODEL || "imagen-4.0-generate-001";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:predict?key=${API_KEY}`;

const OUT_DIR = join("public", "images", "exercises");
const PROMPTS_PATH = join("src", "exercise-prompts.json");
const RATE_LIMIT_MS = 2000;

function parseArgs(argv) {
  const args = { limit: Infinity, exercise: null, force: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--limit") args.limit = parseInt(argv[++i], 10);
    else if (argv[i] === "--exercise") args.exercise = argv[++i];
    else if (argv[i] === "--force") args.force = true;
  }
  return args;
}

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function generateOne({ name, prompt }) {
  const slug = slugify(name);
  const outPath = join(OUT_DIR, `${slug}.png`);

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: {
        sampleCount: 1,
        aspectRatio: "1:1",
        safetyFilterLevel: "block_only_high",
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`HTTP ${res.status} — ${body.slice(0, 400)}`);
  }

  const data = await res.json();
  const base64 = data?.predictions?.[0]?.bytesBase64Encoded;
  if (!base64) throw new Error(`No image bytes returned. Body: ${JSON.stringify(data).slice(0, 400)}`);

  writeFileSync(outPath, Buffer.from(base64, "base64"));
  return outPath;
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  mkdirSync(OUT_DIR, { recursive: true });

  const allPrompts = JSON.parse(readFileSync(PROMPTS_PATH, "utf8"));
  let prompts;
  if (args.exercise) {
    const match = allPrompts.find(p => p.name.toLowerCase() === args.exercise.toLowerCase());
    if (!match) {
      console.error(`No prompt found for "${args.exercise}" in ${PROMPTS_PATH}.`);
      process.exit(1);
    }
    prompts = [match];
  } else {
    prompts = Number.isFinite(args.limit) ? allPrompts.slice(0, args.limit) : allPrompts;
  }

  console.log(`Generating ${prompts.length} illustration(s) → ${OUT_DIR}`);
  let ok = 0, skipped = 0, failed = 0;

  for (const entry of prompts) {
    const slug = slugify(entry.name);
    const outPath = join(OUT_DIR, `${slug}.png`);
    if (!args.force && existsSync(outPath)) {
      console.log(`↷ ${entry.name} (already exists — pass --force to regenerate)`);
      skipped++;
      continue;
    }
    try {
      const path = await generateOne(entry);
      console.log(`✓ ${entry.name} → ${path}`);
      ok++;
    } catch (err) {
      console.error(`✗ ${entry.name}: ${err.message}`);
      failed++;
    }
    await new Promise(r => setTimeout(r, RATE_LIMIT_MS));
  }

  console.log(`\nDone. ${ok} generated, ${skipped} skipped, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
