#!/usr/bin/env node
/**
 * Shrink new reformer illustrations before they are committed.
 *
 * Full-size PNGs (~1.2 MB each) would add well over 100 MB to the repo forever.
 * This makes a WebP copy of each one at app size (640 px wide, ~30–80 KB) in
 * src/assets/movement/reformer/library/, named after the exercise, which the app
 * picks up automatically (src/lib/corrected-exercise-art.ts). Originals are never
 * deleted; pass --move-originals <folder> to move them out of the repo.
 *
 * One-time setup (does not change package.json or the lockfiles):
 *   npm install --no-save sharp@0.33.5
 *
 * Usage:
 *   node scripts/optimise-reformer-art.mjs                 # untracked PNGs in src/assets/movement/reformer
 *   node scripts/optimise-reformer-art.mjs "D:/art/reformer"  # every PNG in another folder
 *   node scripts/optimise-reformer-art.mjs --move-originals "../signalnz-art-originals"
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, renameSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "src/assets/movement/reformer/library");
const WIDTH = 640;
const QUALITY = 80;

const args = process.argv.slice(2);
const moveIdx = args.indexOf("--move-originals");
const moveTo = moveIdx >= 0 ? resolve(args[moveIdx + 1] ?? "") : null;
const source = args.find((a, i) => !a.startsWith("--") && i !== moveIdx + 1) ?? null;

/** "Arms in Straps: Lower & Lift.png" → "arms-in-straps-lower-and-lift" (the app matches exercise names the same way). */
export const slug = (name) =>
  name.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

function pngsToConvert() {
  if (source) {
    const dir = resolve(source);
    return readdirSync(dir).filter(f => /\.png$/i.test(f)).map(f => join(dir, f));
  }
  // Default: only the PNGs git doesn't know about yet, i.e. the new set.
  // Untracked PNGs, including ones .gitignore keeps out of commits.
  const out = execFileSync("git", ["ls-files", "--others", "--", "src/assets/movement/reformer"], { cwd: ROOT, encoding: "utf8" });
  return out.split(/\r?\n/).filter(f => /\.png$/i.test(f) && !f.includes("/library/")).map(f => join(ROOT, f));
}

let sharp;
try {
  sharp = (await import("sharp")).default;
} catch {
  console.error("sharp isn't installed. Run this once, then try again:\n  npm install --no-save sharp@0.33.5");
  process.exit(1);
}

const files = pngsToConvert();
if (!files.length) {
  console.log("No new PNGs found. Pass a folder to convert every PNG in it.");
  process.exit(0);
}
mkdirSync(OUT, { recursive: true });
if (moveTo) mkdirSync(moveTo, { recursive: true });

let before = 0;
let after = 0;
const made = [];
for (const file of files) {
  const name = slug(basename(file, extname(file)));
  const target = join(OUT, `${name}.webp`);
  await sharp(file).resize({ width: WIDTH, withoutEnlargement: true }).webp({ quality: QUALITY, alphaQuality: 90 }).toFile(target);
  const a = statSync(file).size;
  const b = statSync(target).size;
  before += a;
  after += b;
  made.push(name);
  console.log(`${(a / 1024).toFixed(0).padStart(6)} KB → ${(b / 1024).toFixed(0).padStart(4)} KB  ${name}.webp`);
  if (moveTo) renameSync(file, join(moveTo, basename(file)));
}

writeFileSync(join(OUT, "names.txt"), `${made.sort().join("\n")}\n`);
console.log(`\n${made.length} images: ${(before / 1048576).toFixed(1)} MB → ${(after / 1048576).toFixed(1)} MB in src/assets/movement/reformer/library/`);
console.log(moveTo
  ? `Originals moved to ${moveTo}.`
  : "Originals left in place. Move them out of the repo (or pass --move-originals <folder>) before committing.");
console.log("Commit only src/assets/movement/reformer/library/.");
if (!existsSync(join(ROOT, ".git"))) console.warn("(Not a git checkout: nothing was detected as untracked.)");
