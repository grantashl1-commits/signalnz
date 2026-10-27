# Reformer illustration library

The app shows reformer artwork from this folder (`src/lib/corrected-exercise-art.ts`).
Files are matched to exercises by name: word order and "reformer" don't matter, so
`skater-reformer.webp` works for "Reformer Skater".

- **New plan artwork:** save the PNG here under the file name listed in
  [`../PLAN-PROMPTS.md`](../PLAN-PROMPTS.md) (for example `toe-dips.png`). It shows in
  the plan straight away.
- **Make it small:** `node scripts/optimise-reformer-art.mjs` turns every PNG here
  into a 640 px WebP (~15 KB instead of ~1 MB), which the app prefers. Delete the PNG
  afterwards or pass `--move-originals <folder>`. One-time setup:
  `npm install --no-save sharp@0.33.5`.
- **Book catalogue artwork** (`../<catalogue id>.png`) is used through a WebP copy
  named after the catalogue id, plus an entry in `libraryAlias` mapping the plan
  exercise name to it. Only poses checked against the class cue are mapped.

`names.txt` lists the WebPs here; the script rewrites it.
