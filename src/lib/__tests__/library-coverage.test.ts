import { describe, it, expect } from "vitest";
import { getAllPathExercises } from "@/lib/training-path-utils";
import { getExerciseImageByName } from "@/lib/exercise-image-lookup";
import { getCorrectedExerciseArt } from "@/lib/corrected-exercise-art";

/**
 * The Movement → Library tab lists every exercise any training path prescribes,
 * so every one of those names has to resolve to artwork. When this fails, the
 * tab silently falls back to a generic anatomy figure and the member sees the
 * same standing woman for dozens of different movements.
 *
 * Both resolution paths are checked because the app uses both:
 *   getCorrectedExerciseArt  — hand-mapped overrides (bundled assets)
 *   getExerciseImageByName   — slug lookup into public/images/exercises
 */
describe("exercise art coverage", () => {
  const exercises = getAllPathExercises();

  it("covers every exercise used by the training paths", () => {
    const unresolved = exercises.filter(
      ({ name }) => !getCorrectedExerciseArt(name) && !getExerciseImageByName(name),
    );

    expect(
      unresolved.map((e) => `${e.name}  [${e.paths.join(", ")}]`),
      `${unresolved.length} of ${exercises.length} path exercises have no illustration`,
    ).toEqual([]);
  });

  it("resolves plurals, apostrophes and known synonyms", () => {
    // Each of these appears in a path in a form that differs from its filename.
    expect(getExerciseImageByName("Goblet Squats")).toBeTruthy();
    expect(getExerciseImageByName("Farmer's Carry")).toBeTruthy();
    expect(getExerciseImageByName("Russian Twists")).toBeTruthy();
    expect(getExerciseImageByName("V-Up with Twist")).toBeTruthy();
    expect(getExerciseImageByName("Slow Bear Crawl")).toBeTruthy();
    expect(getExerciseImageByName("Bodyweight Squats")).toBeTruthy();
  });

  it("does not treat session descriptions as exercises", () => {
    const names = exercises.map((e) => e.name.toLowerCase());
    // "Circuit" is a block heading and "Easy 20 min run" a session note, not movements.
    expect(names).not.toContain("circuit");
    expect(names.some((n) => /^\d+ min/.test(n))).toBe(false);
  });
});
