This is a large multi-part overhaul of the `/movement` area. I want to confirm the plan and a couple of decisions before I start, because some pieces (esp. video generation for Restore path) are slow/expensive.

## 1. Today tab — pressure removal & copy
- **Remove** the "DAYS YOU'VE RETURNED · X OF 36 · 3%" bar from the Today session card. The streak/return-count display contradicts SOUL ("days you returned, never break on rest") *as a progress bar*, so we'll just delete it from this card. Internal counter still records.
- "Mark held" button → **"Finish workout"**.
- On click toast: **"Marked as complete."** (Replaces current "Held." style toast for this surface only; other Held toasts elsewhere stay.)

## 2. Exercise illustrations — make them consistent
Right now Today/Library mix three styles: watercolour PNGs (Goblet/Glute Bridge), gray anatomy figures, and empty white circles. The user wants **all exercises to use the muscle-anatomy gray figures** (the consistent "DB" style) as the unified look.

Approach:
- `ExerciseDemonstration` will be switched so **anatomy illustration is the default**, watercolour is only used as a secondary/explicit fallback when no anatomy match exists.
- Or, if user prefers the watercolour style as canonical, I'll do the inverse. Pre-confirming below.

## 3. "Why is it showing Week 3?"
The next-session resolver auto-advances to the first uncompleted session. If earlier weeks were marked complete in localStorage from prior testing, you'll skip ahead. I'll add a small "Week X · Day Y" sub-label and a "Restart from Week 1" link on the Today card so it's clear and resettable.

## 4. Expandable week summaries (all paths)
On the Training tab, each week accordion will expand to show, per day:
- Day label · duration · focus
- A compact **bullet list of the exercises** in that session (names only, no sets/reps)
This applies across every `TrainingPath` driven by `signal-training-paths.ts`.

## 5. Superset grouping (all paths)
Today the renderer treats every exercise as its own block, so two paired exercises render as "Superset A" and "Superset B" instead of being grouped. Fix:
- Detect `superset` markers in the structure (e.g. `[SS-A]`, `Superset A:` prefixes, or pair tags) and **group consecutive exercises sharing the same superset id under a single block**: "Superset 1 · 2 exercises · 3 rounds".
- Sweep `signal-training-paths.ts`: any superset block currently containing only 1 exercise gets either a partner added (where the data clearly intends one — e.g. Glute Power Day 1 already has the pair, just mis-rendered) or demoted to a single-exercise block. Pure 1-exercise "supersets" will be relabelled "Main lift".

I'll do this as a renderer fix first (covers most cases), then a data sweep for the genuine 1-exercise stragglers.

## 6. Pilates illustrations
Pilates moves (Hundred, Roll-Up, Single-Leg Circles, Rolling Like a Ball, etc.) currently render the watercolour fallback. I'll **generate gray-anatomy versions in the same style** as the existing DB anatomy figures via the `generate-exercise-illustration` edge function for each Pilates exercise referenced in the paths. Stored in the existing `exercise-assets` bucket so they get picked up automatically.

## 7. Restore path — video?
The Restore path is mostly held postures / breathwork (Child's Pose, Savasana, Legs Up Wall, Yin holds) which are static — anatomy stills don't communicate them well. Two options:
- **(A) Short looping silent videos** (5s, 480p) per Restore exercise, generated via `videogen` and stored in Cloud, played as `<video autoplay loop muted>` in the same circle slot. Quality is decent but ~15–25 videos × ~1 min each to generate.
- **(B) Animated SVG / Lottie-style line drawings** — cheaper, faster, but I'd have to hand-define each.
- **(C) Same gray-anatomy stills as Pilates** — cheapest, consistent, but less expressive.

**I recommend C for v1** (consistency wins), and we add video later for the 5-6 most-watched restore moves. Want me to proceed with C, or commit to A (videos)?

## 8. Glute Power supersets
Audit the Glute Power path: every block labelled "Superset A/B/etc." must have exactly 2 exercises. If a block has 1, either pair it logically or relabel as "Main lift". If 3+, split.

## 9. Library tab — archived exercises restore + expandable
- Currently the Library tab shows the auto-extracted "From your training paths" list and below that a long list. The "archived" individual exercise tiles are not interactive.
- Restore: make every exercise tile **clickable to expand**, showing the anatomy illustration, target muscles, and a 1-line cue.
- "Quick Workouts (29)" tab currently routes to `/account` — wire it to the actual quick-workout list (from `archived-workouts.ts` / `stacy-sims-workouts.ts`). Each card opens the workout detail in-place.

## 10. Calendar carry-through
When `markSessionCompleted` fires, also write a row into the calendar/log store (the same one Cycle/Today uses to populate calendar entries) so the workout shows up on that date in the calendar grid. I'll hook into the existing `useTodos` / planner write-path.

---

## Questions before I proceed

I have 3 small decisions that change the work:

1. **Illustration canonical style** — anatomy gray (consistent, currently most populated) or watercolour (more on-brand but lots missing)?
2. **Restore path media** — gray anatomy stills (option C, fast) or generated videos (option A, slow/expensive)?
3. **Calendar entry label** — when a workout is marked complete, what should the calendar entry read? e.g. *"Held: Lower Body A"*, *"Workout · 50 min"*, or just the session title?

After answers I'll implement everything in this order: copy + streak removal → superset grouping renderer → expandable week summaries → illustration switch → Library/Quick Workouts fix → calendar log carry-through → Pilates illustration generation (background) → Restore media (per your choice).

Technical notes (for reference):
- Renderer changes live in `src/components/movement/SelectedPathTodayCard.tsx`, `TrainingTab.tsx`, and a new `SupersetBlock` component.
- Data parsing: extend `extractExerciseName` / add `extractSupersetGroup` in `src/lib/exercise-image-lookup.ts`.
- Calendar: `markSessionCompleted` in `src/lib/training-path-utils.ts` writes to the planner store.
- Pilates illustrations: batch invocation of `generate-exercise-illustration` edge function for the Pilates exercise list.
- No database migrations expected; all storage uses existing buckets.
