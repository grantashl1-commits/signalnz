#!/usr/bin/env python
"""
Convert a white-background illustration into a cut-out with real transparency,
matching the existing exercises set (opaque figure, transparent background,
soft 1-2px edge).

Why this exists: the image generator returns opaque images on flat white, but
the house convention for public/images/exercises is a transparent cut-out
(see src/assets/movement/STYLE.md — "transparent PNG, never white squares").
Overwriting the set with opaque white squares would be a regression.

Usage
    python scripts/make-transparent.py --dir <raw> --out <dest>
    python scripts/make-transparent.py --selftest

--selftest composites known-transparent images onto white, runs the same
cut-out, and reports how closely the recovered alpha matches the original.
Run that after touching the algorithm.
"""
import argparse
import glob
import os
import sys

from PIL import Image, ImageDraw, ImageFilter

SENTINEL = (255, 0, 255)


def background_mask(rgb, tolerance):
    """Flood-fill inward from every border pixel that looks like background.

    Returns an 'L' mask: 255 where background, 0 where subject. Starting from
    all four edges means an interior white area (a sock, a highlight) is only
    removed if it is actually connected to the outside.
    """
    work = rgb.copy()
    w, h = work.size
    px = work.load()

    seeds = []
    step = 4
    for x in range(0, w, step):
        seeds += [(x, 0), (x, h - 1)]
    for y in range(0, h, step):
        seeds += [(0, y), (w - 1, y)]

    for xy in seeds:
        r, g, b = px[xy[0], xy[1]]
        # Only flood from pixels that are already near-white.
        if r > 255 - tolerance and g > 255 - tolerance and b > 255 - tolerance:
            try:
                ImageDraw.floodfill(work, xy, SENTINEL, thresh=tolerance)
            except Exception:
                pass

    mask = Image.new("L", (w, h), 0)
    mpx = mask.load()
    wpx = work.load()
    for y in range(h):
        for x in range(w):
            if wpx[x, y] == SENTINEL:
                mpx[x, y] = 255
    return mask


def cutout(img, tolerance=20, shrink=1, feather=1.2, quantize=0):
    """Opaque-white illustration -> RGBA cut-out, optionally palette-quantised."""
    rgb = img.convert("RGB")
    bg = background_mask(rgb, tolerance)

    # Subject alpha is the inverse of the background mask.
    alpha = bg.point(lambda v: 0 if v else 255)

    # Pull the edge in slightly so the residual white halo from anti-aliased
    # watercolour edges does not survive, then soften so it is not a hard cut.
    if shrink > 0:
        alpha = alpha.filter(ImageFilter.MinFilter(shrink * 2 + 1))
    if feather > 0:
        alpha = alpha.filter(ImageFilter.GaussianBlur(feather))

    out = rgb.convert("RGBA")
    out.putalpha(alpha)

    # Flat watercolour art quantises to a 256-colour palette with no visible
    # loss and roughly 14x smaller files, which matters because these are
    # served straight out of public/ with no bundler optimisation.
    if quantize > 0:
        out = out.quantize(colors=quantize, method=Image.FASTOCTREE)
    return out


def selftest(tolerance=20, shrink=1, feather=1.2):
    files = sorted(glob.glob("public/images/exercises/*.png"))[:8]
    if not files:
        print("no test images found")
        return 1

    print(f"selftest on {len(files)} images (tol={tolerance} shrink={shrink} feather={feather})\n")
    total_agree = 0
    total_px = 0
    for f in files:
        orig = Image.open(f).convert("RGBA")
        truth = orig.getchannel("A")

        # Composite onto white = what the generator gives us.
        white = Image.new("RGBA", orig.size, (255, 255, 255, 255))
        flat = Image.alpha_composite(white, orig).convert("RGB")

        got = cutout(flat, tolerance, shrink, feather).getchannel("A")

        tp = fp = fn = tn = 0
        tpx, gpx = truth.load(), got.load()
        w, h = orig.size
        for y in range(0, h, 3):
            for x in range(0, w, 3):
                t = tpx[x, y] > 127
                g = gpx[x, y] > 127
                if t and g:
                    tp += 1
                elif not t and g:
                    fp += 1
                elif t and not g:
                    fn += 1
                else:
                    tn += 1
        n = tp + fp + fn + tn
        agree = (tp + tn) / n
        iou = tp / (tp + fp + fn) if (tp + fp + fn) else 1.0
        total_agree += tp + tn
        total_px += n
        print(f"  {os.path.basename(f):34s} agree {agree*100:5.1f}%  subject-IoU {iou*100:5.1f}%")

    print(f"\noverall pixel agreement: {total_agree/total_px*100:.2f}%")
    return 0


def cutout_auto(img, tolerance=20, shrink=1, feather=1.0, quantize=0, min_transparent=40.0):
    """Cut out, escalating tolerance if the background did not come away.

    Most generated images sit on pure white (border min-channel ~251-255) and
    clear at tolerance 20. A minority keep a cream paper texture (border
    min-channel ~235-249), where a low tolerance stalls and the result would be
    an opaque white square. Rather than hard-code a high tolerance everywhere,
    retry upward only for the images that need it, and report which those were.

    Escalating is safe because the flood fill starts at the border and the dark
    ink outline stops it reaching light-coloured areas inside the figure.
    """
    tried = []
    for tol in (tolerance, 40, 52):
        if tol in tried:
            continue
        tried.append(tol)
        out = cutout(img, tol, shrink, feather, quantize)
        alpha = out.convert("RGBA").getchannel("A").histogram()
        pct = 100 * alpha[0] / sum(alpha)
        if pct >= min_transparent:
            return out, tol, pct
    return out, tried[-1], pct


def write_png(img, dest, attempts=5):
    """Save atomically, retrying transient Windows file locks."""
    import time

    tmp = dest + ".tmp"
    last = None
    for i in range(attempts):
        try:
            img.save(tmp, "PNG", optimize=True, compress_level=9)
            os.replace(tmp, dest)
            return
        except (OSError, PermissionError) as exc:
            last = exc
            time.sleep(0.4 * (i + 1))
    # Clean up a stranded temp file so the folder stays tidy.
    if os.path.exists(tmp):
        try:
            os.remove(tmp)
        except OSError:
            pass
    raise RuntimeError(f"could not write {dest} after {attempts} attempts: {last}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dir", help="directory of raw white-background PNGs")
    ap.add_argument("--out", help="destination directory")
    ap.add_argument("--tolerance", type=int, default=20)
    ap.add_argument("--shrink", type=int, default=1)
    ap.add_argument("--feather", type=float, default=1.0)
    ap.add_argument(
        "--quantize",
        type=int,
        default=256,
        help="palette size; 0 disables quantisation (default 256, ~14x smaller)",
    )
    ap.add_argument("--selftest", action="store_true")
    ap.add_argument("--overwrite", action="store_true")
    args = ap.parse_args()

    if args.selftest:
        return selftest(args.tolerance, args.shrink, args.feather)

    if not args.dir or not args.out:
        ap.error("--dir and --out are required unless --selftest")

    os.makedirs(args.out, exist_ok=True)
    files = sorted(glob.glob(os.path.join(args.dir, "*.png")))
    if not files:
        print(f"no PNGs in {args.dir}")
        return 1

    done = skipped = 0
    for f in files:
        dest = os.path.join(args.out, os.path.basename(f))
        if os.path.exists(dest) and not args.overwrite:
            skipped += 1
            continue
        img = Image.open(f)
        out, used_tol, pct = cutout_auto(
            img, args.tolerance, args.shrink, args.feather, args.quantize
        )

        # Write to a temp file next to the target, then swap it in. Windows
        # intermittently refuses to open a freshly written PNG for write
        # (EINVAL) when a scanner or watcher has it open, and a partial write
        # would leave a broken asset in public/. Retry, then give up loudly.
        write_png(out, dest)
        done += 1

        # Re-open what we actually wrote, so a silent alpha loss would show up.
        check = Image.open(dest)
        a = check.convert("RGBA").getchannel("A").histogram()
        pct = 100 * a[0] / sum(a)
        corner = check.convert("RGBA").getpixel((0, 0))[3]
        kb = os.path.getsize(dest) / 1024
        note = f" (tolerance {used_tol})" if used_tol != args.tolerance else ""
        flag = ""
        if pct < 40:
            flag += "  <-- WARNING: little transparency"
        if corner != 0:
            flag += "  <-- WARNING: corner not transparent"
        print(f"  {os.path.basename(f):34s} {kb:6.0f} kB  transparent {pct:5.1f}%{note}{flag}")

    print(f"\n{done} written, {skipped} skipped -> {args.out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
