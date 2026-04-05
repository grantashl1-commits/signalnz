
# Cycle Tab Enhancement Plan

## Database Changes
1. **Add `cycle_mode` to profiles** — `TEXT DEFAULT 'cycling'` (values: cycling, perimenopause, post-menopause)
2. **No new tables needed** — symptom severity data stored in localStorage (matching existing pattern) with structured format `{symptom: string, severity: 0-3}`

## UI Components to Create

### 1. CycleModeSelector.tsx
- First-time modal: "Which best describes where you are right now?"
- Three mode cards: Cycling / Perimenopause / Post-menopause
- Stores to profile + localStorage

### 2. PhaseProgressStrip.tsx
- Horizontal coloured bar showing all 4 phases
- Current day marker with pulse animation
- Tap any phase to preview

### 3. PhaseDashboard.tsx
- Hero card with phase name, colour, day info
- One-line hormonal summary
- 3 quick-read tiles: Body / Mind / Train
- Expandable phase guide (training, nutrition, sleep, energy, coaching note)

### 4. EnhancedSymptomTracker.tsx
- Structured daily check-in with categories: Physical, Mental/Emotional, Sleep, Body Signals
- Each symptom rated 0–3 (none/mild/moderate/severe)
- Quick-tap icons, fast logging
- Free text note field

### 5. PerimenopauseMode.tsx
- Irregular cycle support (flexible period tracking)
- Additional perimenopause symptoms
- Rotating education cards with evidence citations
- Training integration links

### 6. HormoneEducationHub.tsx
- Scrollable cards for Oestrogen, Progesterone, Testosterone, Cortisol, Insulin
- 3–4 sentences each, conversational tone, source citations

### 7. CycleInsights.tsx
- Pattern analysis from logged data (after 2+ cycles)
- Auto-generated insights about luteal fatigue, energy peaks, symptom patterns

### 8. IrregularPeriodSupport.tsx
- Flag option for missing/irregular periods
- Compassionate education (HA, perimenopause, post-HBC)
- GP signposting
- Training adjustment suggestions

## Modified Files
- **Cycle.tsx** — Restructured with new tab layout, mode-aware rendering
- **InsightsTab.tsx** — Enhanced AI context with mode, symptoms, training data
- **cycle-utils.ts** — New helpers for structured symptoms, severity data
- **CycleContext.tsx** — Add cycle mode awareness

## Phase Colours (updated per prompt)
- Menstrual: Deep red/burgundy (#8B1A2B)
- Follicular: Spring green (#4CAF50)
- Ovulatory: Warm gold (#F4A63A)
- Luteal: Amber/deep orange (#D4722A)

## Build Order
1. DB migration (cycle_mode column)
2. Core components (PhaseProgressStrip, PhaseDashboard, CycleModeSelector)
3. Enhanced symptom tracker
4. Phase guides + Hormone hub
5. Perimenopause mode + Irregular period support
6. Enhanced AI context + Cycle insights
7. Wire everything into Cycle.tsx
