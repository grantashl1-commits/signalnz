/**
 * Habit illustrations.
 *
 * `public/images/habits` has held 61 watercolour illustrations since the
 * rebrand, and nothing in the app ever rendered one — `Practice.tsx` drew lucide
 * icons instead, so the artwork was shipped but unused.
 *
 * This module is the single lookup. It is driven by `src/data/habit-art-map.json`,
 * a hand-reviewed habit-id -> file mapping, rather than by guessing from names.
 * Name-guessing pairs the wrong pictures: "Vitamin D3 + K2" matched the vitamin C
 * pill, and morning-sunlight, morning-journal and screen-free-morning all matched
 * the meditation picture. Those habits are distinct and now have distinct art.
 *
 * Habits with no illustration yet simply get `undefined`, so the UI falls back to
 * its category icon — the same behaviour as before this existed.
 */
import HABIT_ART_MAP from "@/data/habit-art-map.json";
import RITUAL_ART_MAP from "@/data/ritual-art-map.json";

interface ArtEntry {
  image: string | null;
  prompt: string | null;
}

const MAP = (HABIT_ART_MAP as { map: Record<string, ArtEntry> }).map;
const RITUAL_MAP = (RITUAL_ART_MAP as { map: Record<string, ArtEntry> }).map;

/**
 * Resolve the illustration URL for a habit id.
 *
 * Newly generated files are named after the habit id (lib-magnesium.png); the
 * older ones keep their concept names (morning-walk.png) and are pointed at
 * explicitly in the map. Either way the URL comes from the map, so there is one
 * place to look.
 */
export function getHabitArt(habitId: string | null | undefined): string | undefined {
  if (!habitId) return undefined;
  const entry = MAP[habitId];
  if (!entry?.image) return undefined;
  return `/images/habits/${entry.image}.png`;
}

/** True when the habit has a real illustration rather than an icon fallback. */
export function hasHabitArt(habitId: string | null | undefined): boolean {
  return Boolean(getHabitArt(habitId));
}

/** Habits still waiting on an illustration. Used by the audit script only. */
export function habitsMissingArt(): string[] {
  return Object.entries(MAP)
    .filter(([, v]) => !v.image)
    .map(([id]) => id);
}

/**
 * Resolve the illustration for a self-care ritual.
 *
 * Rituals come from `SELF_CARE_RITUALS` (src/data/self-care-rituals.ts) and are a
 * different set from `HABIT_LIBRARY` — that is why ten of their pictures looked
 * like unused orphans in the habits folder. They are wired here, and the ones
 * that had no picture now have one generated into `<ritual-id>.png`.
 */
export function getRitualArt(ritualId: string | null | undefined): string | undefined {
  if (!ritualId) return undefined;
  const entry = RITUAL_MAP[ritualId];
  if (!entry?.image) return undefined;
  return `/images/habits/${entry.image}.png`;
}

export function hasRitualArt(ritualId: string | null | undefined): boolean {
  return Boolean(getRitualArt(ritualId));
}

/** Ritual coverage, for the validator and tests. */
export function ritualArtCoverage(): { total: number; illustrated: number } {
  const total = Object.keys(RITUAL_MAP).length;
  const illustrated = Object.values(RITUAL_MAP).filter((v) => v.image).length;
  return { total, illustrated };
}

/** How many habits are illustrated — handy for a coverage chip or a test. */
export function habitArtCoverage(): { total: number; illustrated: number } {
  const total = Object.keys(MAP).length;
  const illustrated = Object.values(MAP).filter((v) => v.image).length;
  return { total, illustrated };
}
