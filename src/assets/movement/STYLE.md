# Movement Illustration Styles

Single entry point for how every exercise illustration in this app is generated.

There are **two deliberate styles**, and they must not be mixed.

| | Strength & Core | Reformer |
|---|---|---|
| **Exercises** | 66 | 117 |
| **Look** | Minimalist hand-drawn watercolour | Detailed anatomical medical illustration |
| **Muscle marking** | Soft sage / dusty-rose / terracotta **washes** | Saturated **coral-red** striated muscle |
| **Equipment** | Dumbbells, barbells, benches, balls | Fully rendered wooden reformer |
| **Background** | White | Pure flat white |
| **Prompt source** | `src/data/strength-core-exercises.json` | `src/data/reformer-exercises.json` |
| **Builder** | `scripts/build-exercise-prompts.mjs` | `scripts/build-reformer-prompts.mjs` |
| **Assembled prompts** | `src/exercise-prompts.json` | `src/reformer-exercise-prompts.json` |
| **Prompt sheet** | [`PROMPTS-strength-core.md`](./PROMPTS-strength-core.md) | [`reformer/PROMPTS.md`](./reformer/PROMPTS.md) |
| **Artwork status** | — | [`reformer/MANIFEST.md`](./reformer/MANIFEST.md) |

Why two styles: a member should be able to tell at a glance whether they are
looking at a mat/weight movement or a machine movement. The reformer set is
richer because the apparatus *is* the exercise — the pose only makes sense
against the carriage, footbar and straps.

---

# Style 1 — Strength & Core (watercolour)

```text
A hand-drawn, minimalist watercolour illustration. A woman with a cream-coloured
face, closed eyes, small nose, neutral expression <BODY>. Warm earthy colours:
terracotta, sage green, dusty rose. Gentle imperfect lines. White background. No text.
```

- Thin hand-drawn pen outlines in warm brown/sienna.
- Mostly white with subtle watercolour washes, one or two colour accents.
- Centred, single subject, minimal detail — suggest rather than render.
- Muscle work indicated by a *soft wash* in sage green, dusty rose or terracotta.
  One wash colour per illustration.
- Passive stretches and rest poses get no muscle wash at all.

Brand/journal artwork follows a separate guide: `src/data/image-style-guide.md`.

---

# Style 2 — Reformer (anatomical)

Tuned over several test rounds on Gemini 2.5 Flash Image.

## Block order is decisive

Image models weight early tokens heavily, so the prompt is ordered
**pose → apparatus → muscle restriction → styling**. Style-first produced
beautiful illustrations of the wrong exercise.

### 1. Preamble + pose

```text
Draw ONE anatomically accurate Pilates reformer exercise illustration. Getting the body
position and its relationship to the equipment exactly right matters more than making the
picture beautiful — if the pose and the styling conflict, the pose wins. Her weight must sit
physically believably on the machine: whatever part of her body is supported — back, hips,
knees, feet, hands — rests flush and heavy against the carriage, footbar, straps or floor,
with no floating and no gaps. Follow the hand and foot placements in the pose literally: if
her feet are on the footbar then both feet are clearly on the footbar, and if her hands grip
the footbar then both hands are clearly wrapped around it. Never leave a limb dangling,
resting on the floor, or tucked behind her body unless the pose says so.

POSE — she <per-exercise pose>
```

### 2. Apparatus (injected from the catalogue's `equipment` field)

Without this the model silently omits the boxes.

```text
APPARATUS — this exercise uses <long box / short box / footbar / platform / straps>.
Every item listed must be clearly visible in the drawing, and she must be in correct
physical contact with it.
```

### 3. Muscle restriction (graded)

Catalogue `highlight` text is written `"<primary>, with <secondary>"`, so the red is
graded. Left ungraded the model paints the entire body red.

```text
HIGHLIGHT — the ONLY muscles drawn in strong coral red are: <primary>.
If they are visible in this view, a lighter, softer coral tint may sit on: <secondary> —
clearly paler than the primary area, never the same strength.
Nothing else is red. Her neck, face, arms, hands, torso, hips, legs, feet and all other
musculature stay plain illustrated skin in its normal tone, with no red tint whatsoever.
Most of her body must be un-highlighted — expect a small, localised red area, not an
anatomy chart.
```

### 4. Style block (last)

```text
EQUIPMENT — a classical Pilates reformer drawn accurately and fully coloured: a pale honey
maple and beech wood frame with visible straight grain and mortise-and-tenon joints, four
chunky square-section wooden legs, small black caster wheels at the base, a stack of silver
coiled metal springs running beneath the carriage, a black rope-and-pulley riser assembly at
the head end with grey metal pulleys and rope loops, a padded charcoal-grey footbar on grey
metal uprights at the foot end, and a dark teal upholstered sliding carriage with a small
rectangular headrest and two shoulder blocks. Warm honey wood, muted teal padding, cool grey
and black metal. No branding, no numbers, no coloured springs.

CAMERA — a pure side elevation, exactly like a technical illustration. The camera sits
perpendicular to the long axis of the reformer, at chest height, looking straight at its
side. The reformer's full length runs perfectly horizontally across the frame, left to
right. Do NOT rotate the view into three-quarter, oblique, perspective or foreshortened
angles. Both the head end and the foot end are visible in profile, at the same scale.

FIGURE — a slim athletic adult woman, warm cream skin with soft gradient shading, brown
hair in a neat low bun, wearing a muted sage-green fitted sports bra and charcoal-grey
leggings, barefoot. She is drawn in fine dark ink line art with smooth airbrushed shading:
naturalistic anatomy, clearly an illustration rather than a photograph. Calm neutral face,
eyes open. Her limbs and spine are anatomically correct and her weight sits believably on
the equipment, in profile.

MUSCLE HIGHLIGHT — only the specific muscles named in the HIGHLIGHT line are rendered in
vivid coral-red, as anatomically accurate skeletal muscle bellies with visible fibre
striations and ivory-white tendons marking their attachments, layered semi-transparently
over the body. Highlight ONLY those named groups, typically two to four, and leave every
other visible muscle in normal un-highlighted skin tone. Do not paint the whole body red.
Do not add red to the neck, face, forearms, hands, feet, or any muscle not named.

RENDERING — detailed medical-illustration technique: crisp fine outlines, smooth gradient
shading, soft specular highlights on skin and on the varnished wood and metal, gentle
ambient occlusion where the body meets the upholstery. No cast shadow on the ground, no
floor, no background scenery, no frame, no border, no vignette.

ABSOLUTELY NO text, no labels, no letters, no arrows, no leader lines, no callouts, no
captions, no watermark, no signature.

FRAMING — square 1:1, pure flat white background. The entire reformer plus the woman's whole
body sits inside the frame with an even white margin, nothing cropped at any edge. Clean
horizontal composition.
```

## Known failure modes

Learned the hard way — worth a QA pass after any batch.

1. **Three-quarter drift.** A prompt mentioning "three-quarter side view" anywhere produces
   3/4 perspective. The CAMERA block must be the only angle instruction. This was a real
   bug: EQUIPMENT said three-quarter while FRAMING said side-on, and the model followed the
   earlier wording.
2. **Whole-body red.** The most common error. Graded highlights plus "most of her body must
   be un-highlighted" largely fix it. Exercises whose real muscles span the trunk (knee
   stretch, stomach massage) still come out broad, which is anatomically fair.
3. **Apparatus vanishing.** Long and short boxes get silently dropped unless named. Fixed by
   the APPARATUS block.
4. **"Flat back" exercises get a rounded spine or a hovering plank.** The model reads the
   name, not the mechanics. Regenerate; if it persists, rewrite that exercise's `pose`
   geometrically. Elephant needed "her torso becomes a long horizontal table … NOT a plank,
   NOT a push-up and NOT a hover" before it came out right.
5. **Floating body parts.** Mitigated by the weight/contact sentence; still check hips and
   knees on kneeling work.
6. **Straps that go nowhere.** Handles must visibly connect by rope to the pulleys.

Reformer images come out 1024×1024 (Gemini's native size), not 1536².

---

## Regenerating

```powershell
# Strength & core
node scripts/build-exercise-prompts.mjs

# Reformer prompts + sheets + manifest
node scripts/build-reformer-prompts.mjs

# Reformer artwork (skips files that exist; --force to redraw)
node scripts/generate-reformer-art.mjs --provider=gemini
node scripts/generate-reformer-art.mjs --provider=gemini --force --only=elephant-flat-back
```

Image-generation keys live in `.env.local` (gitignored), unprefixed so Vite never
inlines them into the client bundle.
