/**
 * Reformer exercise library — the full Ellie Herman repertoire, tagged for
 * circuit and plan building.
 *
 * Source: Ellie Herman, *Pilates Reformer* (Spanish edition), 117 exercises
 * across 15 series. Names are given in English with the original Spanish, and
 * the page number points back to the book for the full teaching notes.
 *
 * Every exercise carries `focus` tags (upper / core / lower) so a routine
 * builder can assemble a balanced series without hard-coding names. `primary`
 * marks which region does the dominant work when tags overlap.
 *
 * Artwork lives at `src/assets/movement/reformer/<id>.png` once generated —
 * see `scripts/build-reformer-prompts.mjs` and `scripts/generate-reformer-art.mjs`.
 */
import catalogue from "./reformer-exercises.json";

/** Body region tag used for routine construction. */
export type ReformerFocus = "upper" | "core" | "lower";

export type ReformerLevel = "beginner" | "intermediate" | "advanced";

export interface ReformerExercise {
  /** Stable slug. Also the artwork filename stem. */
  id: string;
  name: string;
  /** Original Spanish name from the book. */
  nameEs: string;
  series: string;
  level: ReformerLevel;
  /** Page in the source book, for full teaching notes. */
  page: number;
  /** All regions this exercise trains. */
  focus: ReformerFocus[];
  /** Dominant region when `focus` has more than one entry. */
  primary: ReformerFocus;
  muscles: string[];
  springs: string;
  footbar: string;
  straps: string;
  headrest: string;
  equipment: string[];
  /** Illustration prompt text. */
  pose: string;
  highlight: string;
}

export const REFORMER_EXERCISES: ReformerExercise[] = catalogue as unknown as ReformerExercise[];

const byId = new Map(REFORMER_EXERCISES.map((e) => [e.id, e]));

export function getReformerExercise(id: string): ReformerExercise | undefined {
  return byId.get(id);
}

/** Human label for a focus tag, for UI chips. */
export const FOCUS_LABEL: Record<ReformerFocus, string> = {
  upper: "Upper body",
  core: "Core",
  lower: "Lower body",
};

/** Short label for tight spaces (badges, chips). */
export const FOCUS_SHORT: Record<ReformerFocus, string> = {
  upper: "Upper",
  core: "Core",
  lower: "Lower",
};

/** Every distinct series, in book order. */
export const REFORMER_SERIES: string[] = [
  ...new Set(REFORMER_EXERCISES.map((e) => e.series)),
];

export function exercisesBySeries(series: string): ReformerExercise[] {
  return REFORMER_EXERCISES.filter((e) => e.series === series);
}

export interface ReformerFilter {
  focus?: ReformerFocus | ReformerFocus[];
  series?: string;
  level?: ReformerLevel | ReformerLevel[];
  equipment?: string;
  /** Only exercises needing no box or other attachment. */
  carriageOnly?: boolean;
}

function toArray<T>(v: T | T[] | undefined): T[] | undefined {
  if (v === undefined) return undefined;
  return Array.isArray(v) ? v : [v];
}

export function filterReformerExercises(filter: ReformerFilter): ReformerExercise[] {
  const focus = toArray(filter.focus);
  const levels = toArray(filter.level);
  return REFORMER_EXERCISES.filter((e) => {
    if (focus && !focus.some((f) => e.focus.includes(f))) return false;
    if (levels && !levels.includes(e.level)) return false;
    if (filter.series && e.series !== filter.series) return false;
    if (filter.equipment && !e.equipment.includes(filter.equipment)) return false;
    if (filter.carriageOnly && e.equipment.some((x) => x === "long-box" || x === "short-box")) {
      return false;
    }
    return true;
  });
}

/**
 * Exercises whose *dominant* region matches — the right pool when you want a
 * genuine lower-body block rather than something that merely mentions legs.
 */
export function exercisesLedBy(focus: ReformerFocus): ReformerExercise[] {
  return REFORMER_EXERCISES.filter((e) => e.primary === focus);
}

/**
 * Picks an even spread across regions for a balanced circuit.
 *
 * Returns up to `perFocus` exercises for each region, preferring exercises the
 * caller has not already used and quietly widening the level range if the
 * requested one is too thin.
 */
export function buildBalancedPool(opts: {
  perFocus?: number;
  level?: ReformerLevel | ReformerLevel[];
  exclude?: string[];
  seed?: number;
} = {}): Record<ReformerFocus, ReformerExercise[]> {
  const perFocus = opts.perFocus ?? 6;
  const exclude = new Set(opts.exclude ?? []);
  const levels = toArray(opts.level);
  const rand = mulberry32(opts.seed ?? 1);

  const pick = (focus: ReformerFocus): ReformerExercise[] => {
    let pool = REFORMER_EXERCISES.filter(
      (e) => e.focus.includes(focus) && !exclude.has(e.id) && (!levels || levels.includes(e.level)),
    );
    // Widen if the level filter starved the pool.
    if (pool.length < perFocus) {
      pool = REFORMER_EXERCISES.filter((e) => e.focus.includes(focus) && !exclude.has(e.id));
    }
    return shuffle(pool, rand).slice(0, perFocus);
  };

  return { upper: pick("upper"), core: pick("core"), lower: pick("lower") };
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Deterministic PRNG so generated circuits are reproducible from a seed. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Counts per region, handy for a library overview screen. */
export function reformerCounts(): Record<ReformerFocus, number> & { total: number } {
  const counts = { upper: 0, core: 0, lower: 0 };
  for (const e of REFORMER_EXERCISES) for (const f of e.focus) counts[f]++;
  return { ...counts, total: REFORMER_EXERCISES.length };
}
