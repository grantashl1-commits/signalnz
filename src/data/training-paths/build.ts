import type { Exercise, Session, Superset } from "./types";

// Small builders shared by the evidence-based paths (strength, muscle, glutes,
// pilates, reformer). Every exercise in a block runs for the block's rounds, so
// "sets" always matches "rounds" and the renderer never shows a mismatch.

export const ex = (name: string, reps: number | string, extra: Partial<Omit<Exercise, "name" | "reps">> = {}): Exercise => ({
  name,
  sets: 1,
  reps,
  ...extra,
});

export function block(rounds: number, rest: number, exercises: Exercise[], label?: string): Superset {
  return {
    rounds,
    restAfterSuperset: rest,
    exercises: exercises.map(e => ({ ...e, sets: rounds })),
    ...(label ? { label } : {}),
  };
}

/** Optional easy walk: shows in the week but never blocks "next session". */
export const walkDay = (day: number, minutes = 25, coachingNote = "Easy pace you could chat at. It counts, and it helps you recover."): Session => ({
  day,
  name: "Walk",
  focus: "Easy walk",
  durationMin: minutes,
  equipment: "Shoes",
  feel: "Easy",
  optional: true,
  structure: [`${minutes} min easy walk, chatty pace`],
  coachingNote,
});

export const restDay = (day: number): Session => ({
  day,
  name: "Rest",
  durationMin: 0,
  isRestDay: true,
  structure: ["Rest"],
});

/** The double-progression rule written once, so every path says it the same way. */
export const DOUBLE_PROGRESSION =
  "Work in the rep range. When every set reaches the top of the range with the reps in reserve shown, go up one weight step next time.";
