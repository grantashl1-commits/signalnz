#!/usr/bin/env python
"""
Give every recipe illustration a transparent background.

Most recipe art arrived as an opaque square on white or cream paper, which shows
as a white box on the recipe cards. This cuts each one out with the same
edge-inward flood fill as scripts/make-transparent.py, so a white plate or
yoghurt inside the dish stays, and leaves art that is already transparent alone.

  * PNG (public/images/recipes/**): rewritten in place under the same name, as a
    256-colour palette PNG like the exercise set (roughly 10x smaller).
  * JPG (src/assets/kids-recipes, a few meals): JPG has no transparency, so each
    becomes a .webp beside it, the .jpg is removed and references in src/ are
    updated to the new name.
  * Art on a solid coloured card (green, black) loses the card, then any white
    paper under it.
  * Art that fills its frame edge to edge has no background; it is left as is
    (a JPG of it still becomes .webp so every reference uses one extension).

Usage
    python scripts/make-recipe-images-transparent.py --check   # report only; exits 1 if any need doing
    python scripts/make-recipe-images-transparent.py           # convert
"""
import argparse
import glob
import importlib.util
import os
import re
import sys
from multiprocessing import Pool

import numpy as np
from PIL import Image, ImageDraw

_spec = importlib.util.spec_from_file_location(
    "make_transparent", os.path.join(os.path.dirname(__file__), "make-transparent.py")
)
mt = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(mt)

ROOTS = ["public/images/recipes", "src/assets/kids-recipes"]
SENTINEL = (255, 0, 255)


def recipe_images():
    files = []
    for root in ROOTS:
        for ext in ("png", "jpg", "jpeg"):
            files += glob.glob(os.path.join(root, "**", f"*.{ext}"), recursive=True)
    return sorted(files)


def border(rgba):
    return np.concatenate([rgba[0], rgba[-1], rgba[:, 0], rgba[:, -1]])


def classify(img):
    """'transparent', 'light' (white/cream paper), 'solid' (one flat colour) or 'full-bleed'."""
    edge = border(np.asarray(img.convert("RGBA")).astype(int))
    if (edge[:, 3] < 10).mean() > 0.9:
        return "transparent"
    rgb = edge[:, :3]
    if (rgb.min(axis=1) >= 225).mean() > 0.9:
        return "light"
    if (np.abs(rgb - np.median(rgb, axis=0)).max(axis=1) <= 24).mean() > 0.9:
        return "solid"
    return "full-bleed"


def remove_solid_card(img, tolerance=40):
    """Paint a flat coloured border white so the white cut-out can take it, and the paper under it."""
    rgb = img.convert("RGB")
    work = rgb.copy()
    w, h = work.size
    card = tuple(int(v) for v in np.median(border(np.asarray(rgb).astype(int)), axis=0))
    px = work.load()
    for x, y in [(x, 0) for x in range(0, w, 4)] + [(x, h - 1) for x in range(0, w, 4)] + \
                [(0, y) for y in range(0, h, 4)] + [(w - 1, y) for y in range(0, h, 4)]:
        if max(abs(a - b) for a, b in zip(px[x, y], card)) <= tolerance:
            ImageDraw.floodfill(work, (x, y), SENTINEL, thresh=tolerance)
    arr = np.asarray(rgb).copy()
    arr[np.all(np.asarray(work) == SENTINEL, axis=-1)] = 255
    return Image.fromarray(arr)


def convert(path):
    img = Image.open(path)
    img.load()
    kind = classify(img)
    is_jpg = path.lower().endswith((".jpg", ".jpeg"))
    dest = re.sub(r"\.jpe?g$", ".webp", path, flags=re.I) if is_jpg else path
    before = os.path.getsize(path)

    if kind == "transparent" or (kind == "full-bleed" and not is_jpg):
        return dict(path=path, kind=kind, changed=False)

    tol, pct = None, 0.0
    if kind == "full-bleed":
        out = img.convert("RGB")
    else:
        source = remove_solid_card(img) if kind == "solid" else img
        # Palette PNG for the public set (served as-is, no bundler); full colour for WebP.
        out, tol, pct = mt.cutout_auto(source, quantize=0 if is_jpg else 256)

    if is_jpg:
        out.save(dest, "WEBP", quality=88, method=6)
        os.remove(path)
    else:
        mt.write_png(out, dest)

    check = Image.open(dest).convert("RGBA")
    alpha = check.getchannel("A").histogram()
    return dict(
        path=path, dest=dest, kind=kind, changed=True, tolerance=tol,
        transparent=100 * alpha[0] / sum(alpha), corner=check.getpixel((0, 0))[3],
        before=before, after=os.path.getsize(dest),
    )


def classify_file(path):
    with Image.open(path) as img:
        return path, classify(img)


def rewrite_references(renamed):
    """Point src/ at the new .webp files: public paths and relative/aliased asset imports."""
    pairs = []  # (old reference, new reference, only in files in this folder)
    for old, new in renamed:
        if old.startswith("public/"):
            pairs.append((old[len("public"):], new[len("public"):], None))
        else:
            pairs.append(("./" + os.path.basename(old), "./" + os.path.basename(new), os.path.dirname(old)))
            pairs.append(("@/" + old[len("src/"):], "@/" + new[len("src/"):], None))
    edited = 0
    for f in glob.glob("src/**/*.ts", recursive=True) + glob.glob("src/**/*.tsx", recursive=True) + \
             glob.glob("src/**/*.json", recursive=True):
        text = open(f, encoding="utf-8").read()
        new_text = text
        for old, new, folder in pairs:
            if folder is None or os.path.dirname(f) == folder:
                new_text = new_text.replace(f'"{old}"', f'"{new}"').replace(f"'{old}'", f"'{new}'")
        if new_text != text:
            open(f, "w", encoding="utf-8").write(new_text)
            edited += 1
    return edited


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true", help="report what would change; exit 1 if anything would")
    ap.add_argument("--jobs", type=int, default=os.cpu_count() or 2)
    args = ap.parse_args()

    files = recipe_images()
    with Pool(args.jobs) as pool:
        kinds = dict(pool.map(classify_file, files, chunksize=8))
    todo = [f for f in files if kinds[f] in ("light", "solid") or
            (kinds[f] == "full-bleed" and f.lower().endswith((".jpg", ".jpeg")))]
    counts = {k: sum(1 for v in kinds.values() if v == k) for k in ("transparent", "light", "solid", "full-bleed")}
    print(f"{len(files)} recipe images: {counts['transparent']} already transparent, "
          f"{counts['light']} on white/cream, {counts['solid']} on a coloured card, {counts['full-bleed']} edge to edge")
    for f in files:
        if kinds[f] == "full-bleed":
            print(f"  edge to edge, background left as is: {f}")

    if args.check:
        print(f"{len(todo)} to convert")
        return 1 if todo else 0

    with Pool(args.jobs) as pool:
        results = pool.map(convert, todo, chunksize=4)

    warnings = 0
    for r in results:
        if r["kind"] == "full-bleed" or not r["changed"]:
            continue
        if r["transparent"] < 15 or r["corner"] != 0:
            warnings += 1
            print(f"  check by eye: {r['dest']} ({r['transparent']:.0f}% transparent, corner alpha {r['corner']})")
    renamed = [(r["path"], r["dest"]) for r in results if r["changed"] and r["dest"] != r["path"]]
    edited = rewrite_references(renamed) if renamed else 0

    before = sum(r["before"] for r in results if r["changed"])
    after = sum(r["after"] for r in results if r["changed"])
    print(f"\n{sum(r['changed'] for r in results)} converted ({len(renamed)} JPG -> WebP, references updated in "
          f"{edited} files), {before / 1e6:.0f} MB -> {after / 1e6:.0f} MB, {warnings} to check by eye")

    missing = sorted({m for f in glob.glob("src/**/*.ts*", recursive=True) + glob.glob("src/**/*.json", recursive=True)
                      for m in re.findall(r'"(/images/recipes/[^"]+\.(?:png|jpe?g|webp))"', open(f, encoding="utf-8").read())
                      if not os.path.exists("public" + m)})
    for m in missing:
        print(f"  referenced but missing: {m}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
