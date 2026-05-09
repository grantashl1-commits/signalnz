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
  return name
    .toLowerCase()
    .replace(/[‑–—]/g, "-")
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Resolve the illustration path for an exercise name (e.g. `"Goblet Squat"`). */
export function getExerciseImageByName(name: string): string | undefined {
  const slug = slugify(name);
  if (EXERCISE_BY_SLUG[slug]) return EXERCISE_BY_SLUG[slug];
  // Try stripping common qualifiers in parens (e.g. "Push-Up (knees or full)" → "push-up")
  const stripped = slugify(name.replace(/\(.*?\)/g, ""));
  if (EXERCISE_BY_SLUG[stripped]) return EXERCISE_BY_SLUG[stripped];
  return undefined;
}

/** Convenience: pull the exercise name from a structure line and resolve the illustration in one call. */
export function getExerciseImageForStructureLine(line: string): string | undefined {
  const name = extractExerciseName(line);
  if (!name) return undefined;
  return getExerciseImageByName(name);
}
