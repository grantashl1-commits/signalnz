/**
 * Registers freshly drawn recipe illustrations in src/data/recipe-image-files.json.
 *
 * A recipe picks its picture up by id: `findRecipeImageByTitle` checks
 * `FILES[id]` before any fuzzy title matching, so an id key always wins over a
 * look-alike dish.
 *
 *   node scripts/register-recipe-art.mjs                 # add every staged job
 *   node scripts/register-recipe-art.mjs --dry-run
 *
 * Only adds entries whose PNG actually exists on disk, so it is safe to re-run.
 * Existing keys keep their original order and are never overwritten.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { parseArgs } from "./lib/image-provider.mjs";

const args = parseArgs();

const MAP = "src/data/recipe-image-files.json";
/** The committed record of every recipe the art pipeline has drawn. */
const JOBS = args.get("jobs") ?? "src/data/recipe-art-manifest.json";
const ART_DIR = "public/images/recipes/meals";

const DRY = args.has("dry-run");

const jobs = JSON.parse(readFileSync(JOBS, "utf8"));
const raw = readFileSync(MAP, "utf8");
const eol = raw.includes("\r\n") ? "\r\n" : "\n";
const files = JSON.parse(raw);

const added = [];
const skippedNoFile = [];
const skippedExisting = [];

for (const job of jobs) {
  const file = `${ART_DIR}/${job.slug}.png`;
  if (!existsSync(file)) {
    skippedNoFile.push(job.slug);
    continue;
  }
  if (files[job.id]) {
    skippedExisting.push(job.id);
    continue;
  }
  files[job.id] = `/images/recipes/meals/${job.slug}.png`;
  added.push(`${job.id} -> ${files[job.id]}`);
}

if (!DRY && added.length) {
  const body = Object.entries(files)
    .map(([k, v]) => `"${k}": "${v}"`)
    .join("," + eol);
  writeFileSync(MAP, `{${eol}${body}${eol}}${eol}`);
}

console.log(
  `${DRY ? "[dry run] " : ""}registered ${added.length}, ` +
    `already present ${skippedExisting.length}, no file yet ${skippedNoFile.length} ` +
    `(map now holds ${Object.keys(files).length})`,
);
if (skippedNoFile.length) {
  console.log("no file yet:");
  for (const s of skippedNoFile) console.log("  " + s);
}
