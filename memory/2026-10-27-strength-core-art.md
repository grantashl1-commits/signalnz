# 2026-10-27 — Strength/core artwork regeneration (61 images)

Companion note to `memory/2026-10-27.md`, which was being written concurrently by other
agents; kept separate so the record could not be lost to lock contention.

## What was asked

Redraw all 61 images in `public/images/exercises/` using the watercolour prompts in
`src/assets/movement/PROMPTS-strength-core.md` / `STYLE.md`, saving in place under the
same filenames.

## What I flagged before doing it

I A/B'd 6 exercises first. New won 2 (`goblet-squat` was standing instead of squatting,
`plank` cleaner), old won 3 (`push-up` lost the lowering read, `side-plank` became flat
side-lying, `savasana` became a standing figure), 1 tie. The old set was also softer and more
painterly with varied clothing; Gemini's output is flatter, more uniform, and the muscle wash
reads as patches rather than integrated colour.

**Owner chose "replace all 61 anyway"** — so the set is now consistent with the documented
prompt rather than with the previous rendering.

## New scripts

- `scripts/generate-exercise-art.mjs` — generates raw opaque PNGs into
  `handoff/exercise-images-raw/`. Maps the 66 prompt names to shipped filenames
  (`bridge-pilates` → `bridge.png`, `swan-yin` → `swan.png`). 61 have artwork; 5 do not
  (`reverse-lunge`, `lateral-raise`, `pilates-hundred`, `pigeon-pose`, `supine-twist`).
  `--continue-missing` would draw those too.
- `scripts/make-transparent.py` — white→transparent cut-out into `public/images/exercises/`.
- `scripts/lib/image-provider.mjs` — shared gemini/openai provider code, now used by both
  the reformer and strength/core generators.

Two steps on purpose: the generator emits opaque white, but the shipped convention is a
transparent cut-out. Writing raw output straight over the shipped files would ship white
squares.

## Three things that mattered

1. **Cut-out accuracy was proven, not assumed.** Composite an existing transparent PNG onto
   white, run the removal, compare the recovered alpha to the original:
   **99.07% agreement** at `tolerance 20, shrink 0, feather 1.0`. Re-run
   `python scripts/make-transparent.py --selftest` after touching the algorithm.
2. **Quantisation is the whole ballgame.** These are served straight from `public/` with no
   bundler optimisation. Raw RGBA cut-outs totalled 57.6 MB;
   `quantize(256, FASTOCTREE)` brought the set to **3.62 MB (from 19.82 MB originally)**
   with no visible difference at 2× zoom. Always pass `--quantize 256`.
3. **Auto-escalating tolerance.** Most images sit on pure white (border min-channel 251–255)
   and clear at tolerance 20. Two kept a cream paper texture (235–249) where a low tolerance
   stalls and yields an opaque white square. `cutout_auto()` retries at 40 then 52 and
   reports which files escalated. Safe because the flood fill starts at the border and the
   dark ink outline stops it reaching light areas inside the figure.

Also: Windows intermittently refuses to open a freshly written PNG for write
(`OSError: [Errno 22]`), so writes go to a temp file and are swapped in with retries.

## Prompt fixes found by QA

All now in `src/data/strength-core-exercises.json`:

- **Shared tail:** the muscle wash must sit ON the muscles (it was rendering as detached
  blobs floating beside her), and **exactly one figure** (walking-lunge came back as a
  3-pose sequence).
- `savasana` / `legs-up-the-wall`: needed "seen from the side so her whole body is
  horizontal", or the model drew a standing figure.
- `side-plank`: "lifted up onto her forearm, hips raised high, a held side plank not a
  relaxed lying position".
- `bench-press`: was seated on the bench; "lies flat on her back along a horizontal bench"
  fixed it.
- `goblet-squat`, `walking-lunge`, `single-arm-dumbbell-row`: fixed with explicit geometry.

## Known remaining problem

`hip-thrust` renders seated on the bench instead of hips-lifted. Three attempts with
escalating explicit geometry all failed. **The previously shipped image is wrong in the same
way** (she sits on the bench with the bar across her lap), so this is not a regression — it
needs a different generation approach or a hand-drawn asset.

Minor: `lat-pulldown` and `overhead-press` came out noticeably more muscular than the slim
figures elsewhere.

## Rollback

Pre-replacement set is at `handoff/exercise-images-backup/` (61 files, 19.82 MB), verified
byte-identical to what shipped before any overwrite.

## Note for later

`make-transparent.py --quantize` and the existing `scripts/optimise-reformer-art.mjs` now
both do palette reduction. Worth folding into one image-optimisation helper.

Separately, the reformer side needs the same treatment: `src/assets/movement/reformer` holds
127 entries' worth of ~1 MB PNGs. Running the quantise step over that folder is the big win
already identified in the main memory file.
