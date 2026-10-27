/**
 * Shrinks reformer illustrations for the web bundle.
 *
 * Reads  : a folder of PNGs (default src/assets/movement/reformer/library)
 * Writes : the same files, resized and palette-quantised in place
 *
 * Why this exists: generated art lands at ~900 kB–1 MB per image at 1024², which
 * is far more than an in-app illustration needs. Resizing to 512² and reducing to
 * a 128-colour adaptive palette takes each file to roughly 80 kB — an ~11x
 * reduction — with no visible loss at display size on line-art with soft shading.
 *
 * Uses Pillow via Python, because the project has no image library on the Node
 * side (no sharp/imagemin) and adding a native dependency for a one-off build
 * step is not worth it. Pillow is already used elsewhere in this repo
 * (scripts/make-transparent.py).
 *
 * Usage:
 *   node scripts/optimise-reformer-art.mjs
 *   node scripts/optimise-reformer-art.mjs --dir=src/assets/movement/reformer
 *   node scripts/optimise-reformer-art.mjs --size=384 --colors=64
 *   node scripts/optimise-reformer-art.mjs --dry-run
 *   node scripts/optimise-reformer-art.mjs --force     # re-optimise already-small files
 *
 * Skips files that already look optimised (palette mode at or below the target
 * size), so re-running is safe and does not degrade quality by quantising twice.
 */
import { execFileSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";

const args = new Map();
for (const raw of process.argv.slice(2)) {
  const [k, v] = raw.replace(/^--/, "").split("=");
  args.set(k, v ?? "true");
}

const DIR = args.get("dir") ?? "src/assets/movement/reformer/library";
const SIZE = Number(args.get("size") ?? 512);
const COLORS = Number(args.get("colors") ?? 128);
const DRY = args.has("dry-run");
const FORCE = args.has("force");
const PYTHON = args.get("python") ?? "python";

if (!existsSync(DIR) || !statSync(DIR).isDirectory()) {
  console.error(`No such directory: ${DIR}`);
  process.exit(2);
}

const PROGRAM = `
import io, os, sys
from PIL import Image

directory, size, colors = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
dry, force = sys.argv[4] == "1", sys.argv[5] == "1"

files = sorted(
    f for f in os.listdir(directory)
    if f.lower().endswith(".png") and not f.startswith(".")
)
if not files:
    print("No PNGs found.")
    sys.exit(0)

total_before = total_after = 0
done = skipped = 0

for name in files:
    path = os.path.join(directory, name)
    before = os.path.getsize(path)
    total_before += before
    with Image.open(path) as src:
        already = src.mode == "P" and max(src.size) <= size
        if already and not force:
            print("  {0}: already optimised ({1:.0f} kB)".format(name, before / 1024))
            skipped += 1
            total_after += before
            continue
        image = src.convert("RGB")

    reduced = image.resize((size, size), Image.LANCZOS).convert(
        "P", palette=Image.ADAPTIVE, colors=colors
    )
    buffer = io.BytesIO()
    reduced.save(buffer, "PNG", optimize=True)
    after = len(buffer.getvalue())

    if not dry:
        reduced.save(path, "PNG", optimize=True)

    total_after += after
    done += 1
    print("  {0}: {1:.0f} kB -> {2:.0f} kB".format(name, before / 1024, after / 1024))

verb = "would optimise" if dry else "optimised"
saved = total_before - total_after
pct = (saved / total_before * 100) if total_before else 0
print("")
print("{0} {1} file(s), skipped {2}".format(verb, done, skipped))
print(
    "Total {0:.1f} MB -> {1:.1f} MB ({2:.0f}% smaller)".format(
        total_before / 1048576, total_after / 1048576, pct
    )
)
`;

try {
  const out = execFileSync(
    PYTHON,
    ["-c", PROGRAM, DIR, String(SIZE), String(COLORS), DRY ? "1" : "0", FORCE ? "1" : "0"],
    { encoding: "utf8" },
  );
  process.stdout.write(out);
} catch (err) {
  if (err.code === "ENOENT") {
    console.error(
      `Could not run "${PYTHON}". Install Python 3 with Pillow (pip install pillow), or pass --python=<path>.`,
    );
    process.exit(2);
  }
  process.stderr.write(String(err.stdout ?? ""));
  console.error(String(err.stderr ?? err.message));
  process.exit(1);
}
