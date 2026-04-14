# Signal Visual Style Guide

## Illustration Style: Minimalist Hand-Drawn Watercolor

### Core Characteristics
- **Line work**: Thin, hand-drawn pen outlines in warm brown/sienna tone
- **Fill**: Mostly white/empty with subtle watercolor washes
- **Color**: One or two pops of color per illustration aligned to brand palette
- **Background**: Transparent (PNG) — never white squares
- **Composition**: Centered, simple, single subject
- **Texture**: Slight hand-drawn imperfection, organic feel
- **Detail level**: Minimal — suggest rather than render photorealistically

### Brand Color Palette (HSL)
- **Primary**: 270 30% 55% (soft purple)
- **Menstrual phase**: Warm reds, deep rose (#C4526E)
- **Follicular phase**: Deep purple (#5C4A9E)
- **Ovulatory phase**: Warm pink (#C47A8A)
- **Luteal phase**: Muted lavender (#9B89B4)
- **Accent earthy**: Warm terracotta, sage green, soft amber

---

## Year of Coming Home (YOCH) Journal Reference

Reference images stored in `src/assets/reference/`:

| File | Description |
|------|-------------|
| `yoch-weekly-spread.png` | Open book spread — left page: intention/mantra/gratitude; right page: daily blocks |
| `yoch-colouring.png` | Mindful colouring page — line art with celestial/botanical motifs |
| `yoch-trust-page.png` | Prose page — centered text with stars/moon line art header |
| `yoch-weekly-reflection.png` | Weekly reflection — boxed prompts with hand-drawn sun/flower icons |
| `yoch-reflection-prompts.png` | Reflection prompts — dotted borders, hand-drawn celestial icons |
| `yoch-warm-hug.png` | Activity page — woman illustration with flowers, writable heart space |
| `yoch-return-to-body.png` | Body check-in — woman with flowers, reflective prompt lines |

### Key Visual Elements to Replicate
1. **Hand-drawn borders**: Thin line borders with rounded corners, slightly imperfect/organic
2. **Dotted separators**: Rows of small circles as section dividers (○ ○ ○ ○ ○)
3. **Celestial motifs**: Stars (✦ ✧), crescent moons, suns with radiating lines
4. **Botanical motifs**: Simple leaf sprigs, small flowers, branch elements
5. **Line-art illustrations**: Women with flowers, embracing figures, nature scenes
6. **Typography**: Mix of clean serif headings + handwritten (Caveat) for prompts/notes

### Prompt Template for YOCH-Style Illustrations
```
Minimalist hand-drawn line art illustration of [SUBJECT] in the style of a wellness journal.
Thin brown/warm gray pen outlines only, no fill colors, delicate botanical and celestial
accents (small stars, moons, flowers, leaves). Clean white background, gentle and feminine
aesthetic. Suitable for a mindful journaling page.
```

### Prompt Template for Brand-Colored Watercolor
```
Hand-drawn minimalist watercolor illustration of [SUBJECT] on a solid white background.
Thin brown pen outlines with subtle [BRAND COLOR] watercolor accents. Transparent background.
Simple, elegant illustration with organic hand-drawn quality. No text, no labels.
```

---

## SVG Hand-Drawn Borders

For UI elements, use the `JournalBorders` component (`src/components/JournalBorders.tsx`)
which provides organic, slightly imperfect border SVGs matching the YOCH aesthetic.

Available variants:
- `HandDrawnBox` — Rounded rectangle with organic wobble
- `DottedDivider` — Row of hand-drawn circles
- `CelestialHeader` — Stars and moon decorative header
- `BotanicalCorner` — Small leaf/flower corner accent
- `JournalSection` — Full section wrapper with hand-drawn border + optional title
