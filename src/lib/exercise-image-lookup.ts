/**
 * Look up watercolour exercise illustrations from a free-form structure line.
 *
 * Training plan sessions store exercises as plain strings inside
 * `DaySession.structure[]`, e.g. `"Goblet Squat – 3×12 (tempo 3‑1‑2)"`.
 * The exercise name lives before the first dash separator. This module
 * parses the name out, slugifies it, and looks it up in the build-time
 * `image-maps.json` map populated by `scripts/build-image-maps.mjs`.
 */
import imageMaps from "@/data/image-maps.json";

const EXERCISE_BY_SLUG = imageMaps.exercises as Record<string, string>;

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[‐‑‒–—―]/g, "-")
    .replace(/&/g, " and ")
    .replace(/\bdb\b/g, "dumbbell")
    .trim();
}

/** Pull the exercise name out of a structure line, or return null for descriptive lines (warm-ups, stretches). */
export function extractExerciseName(line: string): string | null {
  const trimmed = line.trim();
  // Common dashes used as the separator between exercise name and prescription
  const separators = [" – ", " — ", " - "];
  for (const sep of separators) {
    const idx = trimmed.indexOf(sep);
    if (idx > 0) return trimmed.slice(0, idx).trim();
  }
  return null;
}

/** Slugify like build-image-maps.mjs does so lookups match. */
function slugify(name: string): string {
  return normalizeName(name)
    .replace(/[‑–—]/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function getExerciseNameVariants(name: string): string[] {
  const raw = name.trim();
  const normalized = normalizeName(raw);
  const candidates = new Set<string>([
    raw,
    raw.replace(/\(.*?\)/g, " ").trim(),
    normalized,
  ]);

  if (/\bpush ?up\b/.test(normalized)) candidates.add("Push-Up");
  if (/\bdecline push up\b/.test(normalized)) candidates.add("Decline Push-Up");
  if (/\bsingle arm dumbbell row\b/.test(normalized) || /\bsingle arm row\b/.test(normalized) || /\bdumbbell row\b/.test(normalized)) {
    candidates.add("Single-Arm Dumbbell Row");
    candidates.add("Dumbbell Row");
  }
  if (/\bdb row\b/.test(raw.toLowerCase())) {
    candidates.add("Single-Arm Dumbbell Row");
    candidates.add("Dumbbell Row");
  }
  if (/\brenegade row\b/.test(normalized) || (/\bplank\b/.test(normalized) && /\brow\b/.test(normalized))) {
    candidates.add("Renegade Row");
  }
  if (/\bplank\b/.test(normalized) && /\bshoulder\b/.test(normalized) && /\btap/.test(normalized)) {
    candidates.add("Plank Shoulder Taps");
  }
  if (/\bplank\b/.test(normalized) && /\bknee\b/.test(normalized) && /\b(dip|dips|tap|taps)\b/.test(normalized)) {
    candidates.add("Plank To Knee Tap");
  }
  if (/\bforearm plank\b/.test(normalized)) candidates.add("Forearm Plank");
  if (/\bside plank\b/.test(normalized)) candidates.add("Side Plank");
  if (/\bplank\b/.test(normalized)) candidates.add("Plank");

  return Array.from(candidates).filter(Boolean);
}

/** Resolve the illustration path for an exercise name (e.g. `"Goblet Squat"`). */
export function getExerciseImageByName(name: string): string | undefined {
  const variants = getExerciseNameVariants(name);
  for (const variant of variants) {
    const slug = slugify(variant);
    if (EXERCISE_BY_SLUG[slug]) return EXERCISE_BY_SLUG[slug];
  }
  return undefined;
}

/** Convenience: pull the exercise name from a structure line and resolve the illustration in one call. */
export function getExerciseImageForStructureLine(line: string): string | undefined {
  const name = extractExerciseName(line);
  if (!name) return undefined;
  return getExerciseImageByName(name);
}
