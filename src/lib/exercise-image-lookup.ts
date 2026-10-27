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
import { getCorrectedExerciseArt } from "@/lib/corrected-exercise-art";

const EXERCISE_BY_SLUG = imageMaps.exercises as Record<string, string>;

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[‐‑‒–—―]/g, "-")
    // Apostrophes are dropped from filenames ("Farmers Carry"), so they have to
    // be dropped here too or the slug gains a stray "-s-" and never matches.
    .replace(/[''`]/g, "")
    .replace(/&/g, " and ")
    .replace(/\bdb\b/g, "dumbbell")
    .trim();
}

/**
 * Structure lines that describe a session rather than name a movement.
 * These must not become library entries — "Easy 20 min run" is not an exercise
 * and has no pose to illustrate.
 */
const SESSION_NOT_EXERCISE =
  /^(rest\b|walk\b|circuit\b|easy \d|light session|whatever your body wants|choose \d+|week \d+ day \d+|optional\b|\d+ ?min\b)/i;

/**
 * Pull the exercise name out of a structure line, or return null for
 * descriptive lines (warm-ups, stretches, session notes).
 *
 * Two prefixes have to come off first, or every lookup misses:
 *  - block prefixes the renderer adds: "Warm up: Arm circles", "Cool down: …"
 *  - position numbers used by the flat-string paths: "1. Goblet Squats – 3×12"
 * Left in place they become part of the name, so "Goblet Squats" resolved as
 * "1. Goblet Squats" and found no illustration.
 */
export function extractExerciseName(line: string): string | null {
  let trimmed = (line ?? "").trim();
  if (!trimmed) return null;

  trimmed = trimmed.replace(/^(warm[\s-]?up|cool[\s-]?down)\s*:\s*/i, "");
  trimmed = trimmed.replace(/^\d+\s*[.)]\s*/, "");
  if (!trimmed || SESSION_NOT_EXERCISE.test(trimmed)) return null;

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

/**
 * Singularise a name so plurals resolve: "Goblet Squats" -> "Goblet Squat",
 * "Bicycle Crunches" -> "Bicycle Crunch". Training paths describe sets, so the
 * plural is more common in the data than the singular used for filenames.
 */
function singularise(name: string): string {
  return name
    .split(" ")
    .map((w) => {
      if (/(ches|shes|xes|sses|zes)$/i.test(w)) return w.slice(0, -2);
      if (/[a-z]{2,}s$/i.test(w) && !/(ss|us|is|as|os)$/i.test(w)) return w.slice(0, -1);
      return w;
    })
    .join(" ");
}

/** Names the paths use that differ from the illustration's own title. */
const SYNONYMS: Array<[RegExp, string]> = [
  [/\bclamshells?\b/i, "Clam"],
  [/\b(the )?hundred\b/i, "Pilates Hundred"],
  [/\bsingle leg circles?\b/i, "Single-Leg Circle"],
  [/\bbridge march\b/i, "Glute Bridge March"],
  [/\bsingle leg glute bridge\b/i, "Single-Leg Glute Bridge"],
  [/\bglute bridges?\b/i, "Glute Bridge"],
  [/\b(standing |seated )?shoulder press\b/i, "Overhead Press"],
  [/\bdumbbell biceps? curls?\b/i, "Bicep Curl"],
  [/\b(overhead |lying )?triceps? extensions?\b/i, "Tricep Overhead Extension"],
  [/\bstanding calf raises?\b/i, "Calf Raise"],
  [/\blateral raises?\b/i, "Lateral Raise"],
  [/\breverse lunges?\b/i, "Reverse Lunge"],
  [/\bstep ups?\b/i, "Step-Up"],
  // Variants the paths list separately but which share one illustration.
  [/\bsumo squats?( with)? pulse\b/i, "Sumo Squat"],
  [/\bpli[eé] squat\b/i, "Sumo Squat"],
  [/\bslow mountain climbers?\b/i, "Mountain Climbers"],
  [/\bmedicine ball slams?\b/i, "Med Ball Slam"],
  [/\bskipping or dancing\b/i, "Skipping"],
  [/\bbodyweight squats?\b/i, "Squat"],
  [/\bsupine leg lowering\b/i, "Leg Lower"],
  [/\bstanding toe taps?\b/i, "Toe Tap"],
  [/\btricep dips? with (knee raise|leg lift)\b/i, "Tricep Dip"],
  [/\bv[\s-]?up (with twist|to jackknife)\b/i, "V Up"],
  [/\bslow bear crawls?\b/i, "Bear Crawl"],
  [/\bcriss cross\b/i, "Criss Cross"],
];

function getExerciseNameVariants(name: string): string[] {
  const raw = name.trim();
  const normalized = normalizeName(raw);
  const candidates = new Set<string>([
    raw,
    raw.replace(/\(.*?\)/g, " ").trim(),
    normalized,
    singularise(raw),
    singularise(normalized),
    singularise(raw.replace(/\(.*?\)/g, " ").trim()),
  ]);

  for (const [pattern, alias] of SYNONYMS) {
    if (pattern.test(raw)) {
      candidates.add(alias);
      candidates.add(singularise(alias));
    }
  }

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
  const corrected = getCorrectedExerciseArt(name);
  if (corrected) return corrected;
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
