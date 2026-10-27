# Reformer illustration library

The app shows reformer artwork from this folder (`src/lib/corrected-exercise-art.ts`).
Files are matched to exercises by name: word order and "reformer" don't matter, so
`skater-reformer.png` works for "Reformer Skater". A `.webp` wins over a `.png` of the
same name.

- **Plan exercises the book doesn't cover** are the catalogue's "Signal plan" series
  (`src/data/reformer-exercises.json`). Draw them here with
  `node scripts/generate-reformer-art.mjs --provider=gemini --series="Signal plan" --out=src/assets/movement/reformer/library`,
  then shrink them with `node scripts/optimise-reformer-art.mjs`.
- **Book illustrations** (`../<catalogue id>.png`, ~1 MB each) are used through a small
  copy here named after the catalogue id, plus an entry in `libraryAlias` mapping the
  plan exercise name to it. Only poses checked against the class cue are mapped.

`names.txt` lists the WebP copies.
