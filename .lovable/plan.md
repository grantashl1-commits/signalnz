

# Movement Page — Phase-Specific Workouts and Hand-Drawn Indicators

## Overview

Refactor the Movement page so each cycle phase has its own distinct workout library with unique exercises, and add elegant hand-drawn SVG phase indicator icons used consistently across chips, cards, and headers.

## 1. Hand-Drawn Phase Indicator SVGs

Add a new `PhaseIndicator` component to `BotanicalElements.tsx` — four small SVG icons (~16–24px) with organic hand-drawn line quality:

- **Menstrual** — crescent moon: single curved arc with a small inner crescent, slightly imperfect stroke
- **Follicular** — sprouting leaf: a rising stem with two small unfurling leaves
- **Ovulatory** — radiant sunburst: small circle with radiating organic rays of varied length
- **Luteal** — soft wave/closing petal: two gentle wave curves or a seed-petal closing shape

All use the existing `PHASE_SKETCH_COLORS` palette. Consistent 1px stroke, rounded linecaps.

## 2. Phase Sublabels

Add a constant mapping each phase to its movement label:

```
menstrual → "Restore"
follicular → "Build"  
ovulatory → "Power"
luteal → "Control"
```

These appear as elegant italic sublabels next to phase names on chips/cards.

## 3. New Workout Data (`src/data/workouts.ts`)

Add a new data structure: `PHASE_WORKOUTS: Record<Phase, Workout[]>` that maps each phase to its specific workout set.

**Menstrual (3):** Full Body A, Full Body B, Rest · Walk · Restore (reuse existing)

**Follicular (7):** All existing — Upper A, Upper B, Lower A, Lower B, Full Body A, Full Body B, Rest · Walk · Restore

**Ovulatory (7 new):**
1. Power Full Body — 40min, strength, 8–10kg, 3 circuits of explosive compound moves (squat jumps, push press, power cleans with DBs, box step-up jumps, etc.)
2. Lower Body Power — 35min, strength, 10kg, explosive lower emphasis (jump squats, power lunges, broad jumps, hip thrust singles)
3. Upper Body Strength — 35min, strength, 8–10kg (heavy rows, chest press, strict press, pull-up prep)
4. Athletic Conditioning — 30min, strength (bodyweight), fast-paced circuits (burpees, bear crawls, lateral bounds, mountain climbers)
5. Core & Stability — 25min, strength (none), anti-rotation and balance work
6. Mobility Flow — 20min, walk-restore (none), dynamic mobility
7. Rest · Walk · Restore — reuse existing entry

**Luteal (7 new):**
1. Lower Body Strength — 35min, strength, 8–10kg, slow tempo lower (tempo squats, RDLs, hip thrusts with 4-sec eccentrics)
2. Upper Body Strength — 35min, strength, 8kg, controlled upper (tempo rows, press, flies with long eccentrics)
3. Full Body Strength — 40min, strength, 8kg, compound without explosive demand
4. Glutes & Core — 30min, strength, 8–10kg + booty band, activation focus
5. Pilates Strength — 30min, strength (none), pilates-style control work
6. Mobility Flow — 20min, walk-restore (none), gentle release
7. Rest · Walk · Restore — reuse existing entry

Each new workout gets full exercise arrays (8–12 exercises with sets, reps, duration, formCue, section groupings).

## 4. Movement Page Updates (`src/pages/Movement.tsx`)

**Library tab filtering:**
- Replace the current `filteredWorkouts` logic (which filters the flat `WORKOUTS` array by suitability) with phase-based lookup from `PHASE_WORKOUTS`
- When `phaseFilter` is set, show that phase's specific workouts
- When "all", show a combined view grouped by phase
- Category filter still applies on top

**Phase chips in library:**
- Add the `PhaseIndicator` SVG inline before each phase name
- Add the sublabel ("Restore", "Build", etc.) in italic after the phase name
- Selected state keeps current styling

**Workout cards:**
- Add tiny `PhaseIndicator` icon in the card metadata area
- Add phase sublabel as a small italic label below the workout title

**Today tab:**
- Use `PHASE_WORKOUTS[info.phase]` to determine available workouts
- Phase banner gets the `PhaseIndicator` icon next to heading

**Remove emoji:** Replace the completion message's leaf emoji with a `WildStar` or `PhaseIndicator` SVG.

## 5. Responsive

- Phase indicator SVGs are 14–16px on mobile, 18–20px on desktop
- Phase chips remain horizontally scrollable with generous touch targets
- Sublabels use `text-[9px]` italic, do not add clutter

## Files Changed

| File | Change |
|------|--------|
| `src/components/BotanicalElements.tsx` | Add `PhaseIndicator` component (4 SVG icons) |
| `src/data/workouts.ts` | Add 14 new workout entries (ovulatory + luteal), add `PHASE_WORKOUTS` mapping, add `PHASE_MOVEMENT_LABEL` constant |
| `src/pages/Movement.tsx` | Refactor library filtering to use `PHASE_WORKOUTS`, add indicators to chips/cards/headers, remove emoji |

