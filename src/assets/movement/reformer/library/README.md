# Reformer illustration library

Drop reformer illustrations here as **WebP** files named after the exercise, e.g.
`footwork-arches.webp` or `arms-in-straps-t-press.webp`. The app matches them to
exercises by name automatically (`src/lib/corrected-exercise-art.ts`), so a plan
exercise called "Footwork Arches" shows `footwork-arches.webp`.

Don't commit full-size PNGs: at ~1.2 MB each they bloat the repo forever. Make the
WebPs (640 px wide, usually 30–80 KB) with:

```
npm install --no-save sharp@0.33.5
node scripts/optimise-reformer-art.mjs --move-originals ../signalnz-art-originals
```

Then commit only this folder.

## Exercises in the Reformer plan still waiting for artwork

Name a file like this and it appears in the plan straight away (word order and
"reformer" don't matter, so `skater-reformer.webp` works for "Reformer Skater"):

- footwork-arches.webp
- footwork-balls-of-feet.webp
- hundreds.webp
- toe-dips.webp
- arms-in-straps-triceps-press.webp
- arms-in-straps-t-press.webp
- feet-in-straps-leg-circles.webp
- knee-stretch.webp
- elephant.webp
- long-stretch.webp
- skater.webp
- side-splits.webp
- standing-lunge.webp
- mermaid.webp
- long-box-pull.webp
- long-box-t-pull.webp
- reverse-frog-kicks.webp
- longbox-hip-stretch.webp
- longbox-hamstring-stretch.webp
- longbox-shoulder-stretch.webp
- butterfly-stretch.webp
