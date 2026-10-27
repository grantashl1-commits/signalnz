/**
 * Builds the strength & core illustration prompts from data.
 *
 * Reads  : src/data/strength-core-exercises.json   (the original 66)
 *          src/data/exercise-art/*.json           (the rest of the library)
 * Writes : src/exercise-prompts.json                (consumed by the app)
 *          src/assets/movement/PROMPTS-strength-core.md   (human-readable paste sheet)
 *
 * Usage:
 *   node scripts/build-exercise-prompts.mjs
 *
 * These illustrations are deliberately a DIFFERENT style from the reformer
 * set — minimalist watercolour rather than anatomical red-muscle rendering.
 * See src/assets/movement/STYLE.md for both, side by side.
 *
 * Each catalogue `body` slots grammatically after FACE, e.g. "stands holding…",
 * so a full prompt is: `${HEAD} ${FACE} ${body} ${TAIL}`.
 *
 * The library batches exist because the training paths use far more movements
 * than the original 66: the Movement → Library tab lists every exercise in every
 * path, so every one of them needs artwork in the same style.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";

const CATALOGUE = "src/data/strength-core-exercises.json";
const EXTRA_DIR = "src/data/exercise-art";
const OUT_JSON = "src/exercise-prompts.json";
const OUT_MD = "src/assets/movement/PROMPTS-strength-core.md";
const ORIGINAL_COUNT = 66;

/**
 * Match the line endings already in the file. This checkout has
 * core.autocrlf=true, so committed files sit as CRLF on disk; writing LF makes
 * git report a phantom modification even though the normalised content is
 * identical. Preserving the existing EOL keeps regeneration diff-free.
 */
function eol(file) {
  if (!existsSync(file)) return "\n";
  const buf = readFileSync(file, "latin1");
  return buf.includes("\r\n") ? "\r\n" : "\n";
}

const jsonEol = eol(OUT_JSON);
const mdEol = eol(OUT_MD);

const toDisk = (text, e) => (e === "\r\n" ? text.replace(/\n/g, "\r\n") : text);

const HEAD = "A hand-drawn, minimalist watercolour illustration.";
const FACE =
  "A woman with a cream-coloured face, closed eyes, small nose, neutral expression, brown hair in a neat low bun, dressed in a dusty-rose short-sleeve crop top and sage-green leggings, barefoot.";
/**
 * Two things the first batches got wrong, fixed in the shared tail rather than
 * in 128 individual entries:
 *  - with no clothing described the model rendered her as a flayed anatomical
 *    figure, so the outfit is now named in FACE and muscle striations are banned
 *  - with no pose-fidelity clause the model drew the exercise it recognised from
 *    the name instead of the pose in the text
 */
const TAIL =
  "Follow the described pose exactly, especially the position of her arms, hands and feet. " +
  "Draw her body in simple smooth flat colour: do NOT draw individual muscles, striations, tendons, veins or anatomical detail. " +
  "Any muscle colour wash is a single soft flat watercolour tint with feathered edges, painted directly onto the working muscle group of her body, never as separate shapes, blobs or lines floating beside her, and never as detailed anatomy. " +
  "Warm earthy colours: terracotta, sage green, dusty rose. Gentle imperfect lines. " +
  "Plain flat white background with nothing else in the frame. Show exactly one figure — never a sequence, strip or repeated poses. No shoes. No text.";

const catalogue = JSON.parse(readFileSync(CATALOGUE, "utf8"));

/** Additional library batches, kept separate so the documented 66 stay recognisable. */
const extra = [];
if (existsSync(EXTRA_DIR)) {
  for (const file of readdirSync(EXTRA_DIR).filter((f) => f.endsWith(".json")).sort()) {
    const batch = JSON.parse(readFileSync(`${EXTRA_DIR}/${file}`, "utf8"));
    for (const entry of batch) extra.push({ ...entry, batch: file });
  }
}

const slug = (s) =>
  s
    .toLowerCase()
    .replace(/[()]/g, " ")
    .replace(/['’.]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const merged = [];
const seen = new Map();
for (const entry of [...catalogue, ...extra]) {
  if (!entry.name || !entry.body) {
    console.error(`Entry missing name or body: ${JSON.stringify(entry).slice(0, 80)}`);
    process.exit(1);
  }
  const key = slug(entry.name);
  if (seen.has(key)) {
    // A duplicate slug would silently overwrite artwork, so fail loudly.
    console.error(`Duplicate exercise "${entry.name}" (slug ${key}) — first seen in ${seen.get(key)}`);
    process.exit(1);
  }
  seen.set(key, entry.batch ?? "strength-core-exercises.json");
  merged.push(entry);
}

const buildPrompt = (body) => `${HEAD} ${FACE} ${body.trim()} ${TAIL}`;

const out = merged.map((entry) => ({
  name: entry.name,
  prompt: buildPrompt(entry.body),
}));

if (catalogue.length !== ORIGINAL_COUNT) {
  console.error(`Expected ${ORIGINAL_COUNT} original prompts, got ${catalogue.length}.`);
  process.exit(1);
}

console.log(`Prompts: ${catalogue.length} original + ${extra.length} library = ${out.length}`);

writeFileSync(OUT_JSON, toDisk(JSON.stringify(out, null, 2) + "\n", jsonEol));

// ─── human-readable paste sheet ────────────────────────────────────────
let md = `# Strength & Core Exercise Prompts\n\n`;
md += `Generated by \`scripts/build-exercise-prompts.mjs\` from \`src/data/strength-core-exercises.json\`.\n`;
md += `Do not edit by hand — edit the catalogue and re-run.\n\n`;
md += `**${out.length} exercises.** These are bodies only: every prompt is assembled as\n`;
md += "```text\n" + `${HEAD}\n${FACE} <body>\n${TAIL}` + "\n```\n\n";
md += `> **Style note.** This set is deliberately different from the 117 reformer\n`;
md += `> illustrations. These are minimalist watercolour with soft sage/dusty-rose muscle\n`;
md += `> washes; reformer work is detailed anatomical illustration with saturated coral-red\n`;
md += `> muscle. See [\`STYLE.md\`](./STYLE.md) for both styles and why they differ.\n\n`;
md += `---\n\n`;

md += `| # | Exercise |\n|--:|---|\n`;
out.forEach((p, i) => {
  md += `| ${i + 1} | ${p.name} |\n`;
});
md += `\n---\n\n## Prompts\n`;

for (const p of out) {
  md += `\n### ${p.name}\n\n`;
  md += "```text\n" + p.prompt + "\n```\n\n";
}

writeFileSync(OUT_MD, toDisk(md, mdEol));

console.log(`Wrote ${out.length} prompts → ${OUT_JSON}`);
console.log(`Wrote prompt sheet   → ${OUT_MD}`);
