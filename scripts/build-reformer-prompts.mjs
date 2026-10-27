/**
 * Builds reformer illustration prompts from the exercise catalogue.
 *
 * Reads  : src/data/reformer-exercises.json
 *          src/data/reformer-plan-extras.json  (plan exercises that aren't in the book)
 * Writes : src/reformer-exercise-prompts.json   (machine-readable, for the batch runner)
 *          src/assets/movement/reformer/PROMPTS.md  (human-readable paste sheet)
 *          src/assets/movement/reformer/PLAN-PROMPTS.md  (full prompts for the plan extras)
 *
 * Usage:
 *   node scripts/build-reformer-prompts.mjs
 *
 * The master style block is the source of truth for house style. Keep it in
 * sync with src/assets/movement/STYLE.md. Per-exercise pose and
 * highlight text lives in the catalogue, so tweaking one illustration never
 * means touching boilerplate.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const CATALOGUE = "src/data/reformer-exercises.json";
const OUT_JSON = "src/reformer-exercise-prompts.json";
const OUT_MD = "src/assets/movement/reformer/PROMPTS.md";
const OUT_MANIFEST = "src/assets/movement/reformer/MANIFEST.md";
const EXTRAS = "src/data/reformer-plan-extras.json";
const OUT_PLAN_MD = "src/assets/movement/reformer/PLAN-PROMPTS.md";
/** Plan extras are drawn straight into the folder the app reads (src/lib/corrected-exercise-art.ts). */
const LIBRARY_DIR = "library";
const ART_DIR = "src/assets/movement/reformer";

/**
 * Existing artwork that already covers a catalogue exercise but was drawn under
 * a legacy filename. These count as "covered" in the manifest and stay on disk
 * untouched — the generated <id>.png is what the new registry will read.
 */
const LEGACY_ART = {
  "footwork-parallel-heels": "parallel-heel-footwork.png",
  "footwork-calf-raises": "calf-raise.png",
  "footwork-single-leg-heel-toes": "single-leg-footwork.png",
  "supine-frog-extensions": "frog-press.png",
  "supine-lat-pulls": "supine-arm-pull-down.png",
  "supine-triceps-press": "overhead-triceps.png",
  "rowing-hug-a-tree": "hug-a-tree.png",
  "kneeling-chest-expansion": "chest-expansion.png",
  "knee-stretch-scooter": "scooter.png",
  "leg-pull-parallel": "feet-in-straps-press-down.png",
  "side-kneeling-overhead": "kneeling-side-arm-raise.png",
};

/** Art in the folder that is not from the book (invented for the partner programme). */
const NON_BOOK_ART = [
  "biceps-curl.png",
  "bridge.png",
  "seated-chest-press.png",
  "seated-row.png",
  "side-lying-press.png",
];

const MASTER = [
  "EQUIPMENT — a classical Pilates reformer drawn accurately and fully coloured: a pale honey maple and beech wood frame with visible straight grain and mortise-and-tenon joints, four chunky square-section wooden legs, small black caster wheels at the base, a stack of silver coiled metal springs running beneath the carriage, a black rope-and-pulley riser assembly at the head end with grey metal pulleys and rope loops, a padded charcoal-grey footbar on grey metal uprights at the foot end, and a dark teal upholstered sliding carriage with a small rectangular headrest and two shoulder blocks. Warm honey wood, muted teal padding, cool grey and black metal. No branding, no numbers, no coloured springs.",
  "CAMERA — a pure side elevation, exactly like a technical illustration. The camera sits perpendicular to the long axis of the reformer, at chest height, looking straight at its side. The reformer's full length runs perfectly horizontally across the frame, left to right. Do NOT rotate the view into three-quarter, oblique, perspective or foreshortened angles. Both the head end and the foot end are visible in profile, at the same scale.",
  "FIGURE — a slim athletic adult woman, warm cream skin with soft gradient shading, brown hair in a neat low bun, wearing a muted sage-green fitted sports bra and charcoal-grey leggings, barefoot. She is drawn in fine dark ink line art with smooth airbrushed shading: naturalistic anatomy, clearly an illustration rather than a photograph. Calm neutral face, eyes open. Her limbs and spine are anatomically correct and her weight sits believably on the equipment, in profile.",
  "MUSCLE HIGHLIGHT — only the specific muscles named in the HIGHLIGHT line are rendered in vivid coral-red, as anatomically accurate skeletal muscle bellies with visible fibre striations and ivory-white tendons marking their attachments, layered semi-transparently over the body. This is the most important restraint in the image: highlight ONLY those named groups, typically two to four, and leave every other visible muscle in normal un-highlighted skin tone. Do not paint the whole body red. Do not add red to the neck, face, forearms, hands, feet, or any muscle not named. The un-highlighted body reads as ordinary illustrated skin.",
  "RENDERING — detailed medical-illustration technique: crisp fine outlines, smooth gradient shading, soft specular highlights on skin and on the varnished wood and metal, gentle ambient occlusion where the body meets the upholstery. No cast shadow on the ground, no floor, no background scenery, no frame, no border, no vignette.",
  "ABSOLUTELY NO text, no labels, no letters, no arrows, no leader lines, no callouts, no captions, no watermark, no signature.",
  "FRAMING — square 1:1, pure flat white background. The entire reformer plus the woman's whole body sits inside the frame with an even white margin, nothing cropped at any edge. Clean horizontal composition.",
].join("\n\n");

/** Pose leads the prompt — image models weight early tokens most heavily. */
const POSE_PREAMBLE =
  "Draw ONE anatomically accurate Pilates reformer exercise illustration. Getting the body position and its relationship to the equipment exactly right matters more than making the picture beautiful — if the pose and the styling conflict, the pose wins. Her weight must sit physically believably on the machine: whatever part of her body is supported — back, hips, knees, feet, hands — rests flush and heavy against the carriage, footbar, straps or floor, with no floating and no gaps. Follow the hand and foot placements in the pose literally: if her feet are on the footbar then both feet are clearly on the footbar, and if her hands grip the footbar then both hands are clearly wrapped around it. Never leave a limb dangling, resting on the floor, or tucked behind her body unless the pose says so.";

/**
 * Highlight restraint sits high in the prompt because this is the failure mode
 * that matters most: left to itself the model paints the entire body red.
 *
 * Catalogue highlights are written as "<primary>, with <secondary>" so the red
 * can be graded: primary muscles get the strong coral wash, the supporting ones
 * a softer tint. Ungraded lists made the model redden the whole body.
 */
const highlightBlock = (highlight) => {
  const [primary, ...rest] = highlight.split(/,\s*with\s+/);
  const secondary = rest.join(", ").replace(/\.$/, "").trim();
  const lines = [`HIGHLIGHT — the ONLY muscles drawn in strong coral red are: ${primary.replace(/\.$/, "")}.`];
  if (secondary) {
    lines.push(
      `If they are visible in this view, a lighter, softer coral tint may sit on: ${secondary} — clearly paler than the primary area, never the same strength.`,
    );
  }
  lines.push(
    "Nothing else is red. Her neck, face, arms, hands, torso, hips, legs, feet and all other musculature stay plain illustrated skin in its normal tone, with no red tint whatsoever. Most of her body must be un-highlighted — expect a small, localised red area, not an anatomy chart.",
  );
  return lines.join(" ");
};


const catalogue = JSON.parse(readFileSync(CATALOGUE, "utf8"));

if (catalogue.length !== 117) {
  console.error(`Expected 117 exercises, got ${catalogue.length}.`);
  process.exit(1);
}

for (const ex of catalogue) {
  if (!ex.pose || !ex.highlight) {
    console.error(`Exercise "${ex.id}" is missing pose or highlight text.`);
    process.exit(1);
  }
}

/**
 * Apparatus that must physically appear. The model silently omits the boxes
 * unless they are named up front, so this is injected per exercise.
 */
const APPARATUS_LABEL = {
  "long-box": "the long box — a long padded rectangular box sitting lengthways on top of the carriage, which she lies or sits on",
  "short-box": "the short box — a squat square padded box standing on the carriage, which she sits or lies on",
  footbar: "the footbar — the padded charcoal-grey bar on grey metal uprights at the foot end, which she grips or puts her feet against",
  platform: "the fixed wooden platform at the head end of the frame",
  carriage: "the sliding teal carriage",
  straps: "the black hand straps running from her hands back to the pulleys",
};

const apparatusBlock = (equipment, override) => {
  if (override) return `APPARATUS — this exercise uses ${override.trim()}`;
  const parts = (equipment ?? []).map((e) => APPARATUS_LABEL[e]).filter(Boolean);
  if (parts.length === 0) return null;
  return (
    "APPARATUS — this exercise uses " +
    parts.join("; and ") +
    ". Every item listed must be clearly visible in the drawing, and she must be in correct physical contact with it."
  );
};

const buildPrompt = (ex) => {
  const blocks = [
    POSE_PREAMBLE,
    `POSE — she ${ex.pose.trim()}`,
    apparatusBlock(ex.equipment, ex.apparatus),
    highlightBlock(ex.highlight.trim()),
    MASTER,
  ].filter(Boolean);
  return blocks.join("\n\n");
};

const out = catalogue.map((ex) => ({
  id: ex.id,
  name: ex.name,
  nameEs: ex.nameEs,
  series: ex.series,
  level: ex.level,
  page: ex.page,
  focus: ex.focus,
  muscles: ex.muscles,
  springs: ex.springs,
  outputFile: `${ex.id}.png`,
  prompt: buildPrompt(ex),
}));

// Exercises the Signal reformer plan uses that the book doesn't have. They are named
// after the plan exercise, so the app matches the artwork by name once it lands.
const extras = existsSync(EXTRAS) ? JSON.parse(readFileSync(EXTRAS, "utf8")) : [];
for (const ex of extras) {
  if (!ex.pose || !ex.highlight) {
    console.error(`Plan extra "${ex.id}" is missing pose or highlight text.`);
    process.exit(1);
  }
  if (catalogue.some((c) => c.id === ex.id)) {
    console.error(`Plan extra "${ex.id}" clashes with a catalogue id.`);
    process.exit(1);
  }
  out.push({
    id: ex.id,
    name: ex.name,
    series: ex.series,
    level: ex.level,
    outputFile: `${LIBRARY_DIR}/${ex.id}.png`,
    prompt: buildPrompt(ex),
  });
}

writeFileSync(OUT_JSON, JSON.stringify(out, null, 2) + "\n");

const extraHasArt = (ex) =>
  ["png", "webp"].some((ext) => existsSync(`${ART_DIR}/${LIBRARY_DIR}/${ex.id}.${ext}`));

let plan = `# Reformer Plan Prompts\n\n`;
plan += `Generated by \`scripts/build-reformer-prompts.mjs\` from \`src/data/reformer-plan-extras.json\`.\n`;
plan += `Do not edit by hand — edit the extras file and re-run.\n\n`;
plan += `These are exercises in the Reformer Strength plan that the book catalogue doesn't cover.\n`;
plan += `Each prompt below is complete and ready to paste into an image model, in the house style\n`;
plan += `from [\`../STYLE.md\`](../STYLE.md).\n\n`;
plan += `Save each image as \`src/assets/movement/reformer/library/<file>\` with the file name shown.\n`;
plan += `The app matches it to the exercise by name straight away. Then run\n`;
plan += `\`node scripts/optimise-reformer-art.mjs\` to make the small WebP copy the app prefers.\n`;
plan += `Or draw them all with \`node scripts/generate-reformer-art.mjs --provider=gemini --series="Signal plan"\`.\n\n`;
plan += `| Exercise | File | Artwork |\n|---|---|---|\n`;
for (const ex of extras) plan += `| ${ex.name} | \`${ex.id}.png\` | ${extraHasArt(ex) ? "done" : "to draw"} |\n`;
for (const ex of extras) {
  plan += `\n---\n\n## ${ex.name}\n\n**File:** \`library/${ex.id}.png\`\n\n`;
  plan += "```text\n" + buildPrompt(ex) + "\n```\n";
}
writeFileSync(OUT_PLAN_MD, plan);

// ─── human-readable paste sheet ────────────────────────────────────────
const bySeries = new Map();
for (const ex of catalogue) {
  if (!bySeries.has(ex.series)) bySeries.set(ex.series, []);
  bySeries.get(ex.series).push(ex);
}

const FOCUS_LABEL = { upper: "Upper body", core: "Core", lower: "Lower body" };
const FOCUS_ABBR = { upper: "U", core: "C", lower: "L" };

let md = `# Reformer Exercise Prompts\n\n`;
md += `Generated by \`scripts/build-reformer-prompts.mjs\` from \`src/data/reformer-exercises.json\`.\n`;
md += `Do not edit by hand — edit the catalogue and re-run.\n\n`;
md += `**${catalogue.length} exercises** across **${bySeries.size} series**. `;
md += `Fully-assembled prompts for the batch runner live in \`src/reformer-exercise-prompts.json\`.\n\n`;
md += `Style reference: [\`../STYLE.md\`](../STYLE.md).\n\n`;
md += `---\n\n`;

// ── preamble, once ──
md += `## How a prompt is assembled\n\n`;
md += `Order matters — image models weight early text most heavily, so the pose and the\n`;
md += `muscle restriction lead and the styling follows. Each full prompt is:\n\n`;
md +=
  "```text\n" +
  POSE_PREAMBLE +
  "\n\nPOSE — she <exercise pose>\n\n" +
  highlightBlock("<exercise muscles>") +
  "\n\n" +
  MASTER +
  "\n```\n\n";
md += `The batch runner assembles exactly this from \`src/reformer-exercise-prompts.json\`, so\n`;
md += `you only need to paste by hand if you are generating a single image in a chat UI.\n\n`;
md += `---\n\n`;

// ── master block, once ──
md += `## Style block\n\n`;
md += "```text\n" + MASTER + "\n```\n\n";
md += `---\n\n`;

// ── planning table ──
md += `## Planning table\n\n`;
md += `\`U\` = Upper body · \`C\` = Core · \`L\` = Lower body. **Bold** marks the dominant region\n`;
md += `(\`primary\`) where the tags overlap. Use this table to assemble circuits:\n`;
md += `pick a level, then read across for a balanced U / C / L mix.\n\n`;
md += `| # | Exercise | Series | Level | p. | Focus | Springs |\n`;
md += `|--:|---|---|---|--:|---|---|\n`;
catalogue.forEach((ex, i) => {
  const tags = ex.focus
    .map((f) => (f === ex.primary ? `**${FOCUS_ABBR[f]}**` : FOCUS_ABBR[f]))
    .join(" ");
  md += `| ${i + 1} | ${ex.name} | ${ex.series} | ${ex.level} | ${ex.page} | ${tags} | ${ex.springs} |\n`;
});
md += `\n---\n\n`;

// ── per-series detail ──
md += `## Per-exercise prompts\n\n`;
md += `Each exercise contributes the \`POSE\` line (placed first) and the \`HIGHLIGHT\` line\n`;
md += `(placed last). See "How a prompt is assembled" above for the full order.\n`;

for (const [series, exs] of bySeries) {
  md += `\n### ${series}\n\n`;
  for (const ex of exs) {
    const tags = ex.focus.map((f) => FOCUS_LABEL[f]).join(" · ");
    md += `#### ${ex.name}\n\n`;
    md += `*${ex.nameEs}* — p${ex.page} · ${ex.level} · **${tags}**\n\n`;
    md += `**File:** \`${ex.id}.png\` · **Springs:** ${ex.springs} · **Muscles:** ${ex.muscles.join(", ")}\n\n`;
    md += "```text\n";
    md += `POSE — she ${ex.pose.trim()}\n\n`;
    md += highlightBlock(ex.highlight.trim()) + "\n";
    md += "```\n\n";
  }
}

writeFileSync(OUT_MD, md);

// ─── artwork manifest ──────────────────────────────────────────────────
const hasArt = (ex) =>
  existsSync(`${ART_DIR}/${ex.id}.png`) || Boolean(LEGACY_ART[ex.id] && existsSync(`${ART_DIR}/${LEGACY_ART[ex.id]}`));

const covered = catalogue.filter(hasArt);
const missing = catalogue.filter((ex) => !hasArt(ex));
const pct = Math.round((covered.length / catalogue.length) * 100);

let man = `# Reformer Artwork Manifest\n\n`;
man += `Generated by \`scripts/build-reformer-prompts.mjs\`. Do not edit by hand.\n\n`;
man += `## Status\n\n`;
man += `| | Count |\n|--|--:|\n`;
man += `| Exercises in catalogue | ${catalogue.length} |\n`;
man += `| Artwork present | ${covered.length} (${pct}%) |\n`;
man += `| Still to draw | ${missing.length} |\n\n`;

man += `Run \`node scripts/generate-reformer-art.mjs --provider=gemini\` to draw everything missing.\n`;
man += `It skips files that already exist, so re-running is safe.\n\n`;

man += `## Covered\n\n`;
if (covered.length === 0) man += `_Nothing yet._\n`;
for (const ex of covered) {
  const src = LEGACY_ART[ex.id] ? `${ex.id}.png (currently \`${LEGACY_ART[ex.id]}\`)` : `${ex.id}.png`;
  man += `- **${ex.name}** — ${src}\n`;
}

man += `\n## Still to draw (${missing.length})\n\n`;
man += `| Exercise | Series | Level | Output file |\n|---|---|---|--|\n`;
for (const ex of missing) {
  man += `| ${ex.name} | ${ex.series} | ${ex.level} | \`${ex.id}.png\` |\n`;
}

man += `\n## Plan exercises not in the book (${extras.filter(extraHasArt).length} of ${extras.length} drawn)\n\n`;
man += `Prompts: [\`PLAN-PROMPTS.md\`](./PLAN-PROMPTS.md). Artwork goes in \`library/\`.\n\n`;
for (const ex of extras) man += `- ${extraHasArt(ex) ? "[x]" : "[ ]"} **${ex.name}** — \`library/${ex.id}.png\`\n`;

man += `\n## Files in this folder that are not from the book\n\n`;
man += `These were drawn for the partner programme and are kept as-is. They are not\n`;
man += `catalogue exercises, so they have no prompt and no tags — consider folding them\n`;
man += `into the nearest catalogue entry or retiring them.\n\n`;
for (const f of NON_BOOK_ART) {
  man += `- \`${f}\`${existsSync(`${ART_DIR}/${f}`) ? "" : " _(not present)_"}\n`;
}

man += `\nContact sheets (\`*-sheet.png\`, \`*-corrected.png\`) are proofs from earlier runs,\n`;
man += `not per-exercise art. They can be deleted once the individual files are drawn.\n`;

writeFileSync(OUT_MANIFEST, man);

console.log(`Wrote ${out.length} prompts → ${OUT_JSON} (${extras.length} plan extras)`);
console.log(`Wrote plan prompts   → ${OUT_PLAN_MD}`);
console.log(`Wrote prompt sheet   → ${OUT_MD}`);
console.log(`Wrote manifest       → ${OUT_MANIFEST} (${covered.length} covered, ${missing.length} to draw)`);
