import { describe, expect, it } from "vitest";
import {
  REFORMER_EXERCISES,
  REFORMER_SERIES,
  buildBalancedPool,
  exercisesBySeries,
  exercisesLedBy,
  filterReformerExercises,
  getReformerExercise,
  reformerCounts,
} from "@/data/reformer-exercises";

describe("reformer exercise library", () => {
  it("holds the complete book repertoire", () => {
    expect(REFORMER_EXERCISES).toHaveLength(117);
    // The book's 15 series arrive as 16 here: its single supine series is split
    // into "Supine Arms" and "Supine Legs in Straps", which filter far better.
    expect(REFORMER_SERIES).toHaveLength(16);
    expect(REFORMER_SERIES).toContain("Supine Arms");
    expect(REFORMER_SERIES).toContain("Supine Legs in Straps");
  });

  it("gives every exercise a unique id and the fields a builder needs", () => {
    const ids = REFORMER_EXERCISES.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const ex of REFORMER_EXERCISES) {
      expect(ex.name.length).toBeGreaterThan(0);
      expect(ex.nameEs.length).toBeGreaterThan(0);
      expect(ex.focus.length).toBeGreaterThan(0);
      expect(ex.focus).toContain(ex.primary);
      expect(ex.page).toBeGreaterThan(60);
      expect(ex.pose.length).toBeGreaterThan(40);
      expect(ex.highlight.length).toBeGreaterThan(10);
    }
  });

  it("tags every exercise into at least one routine region", () => {
    const counts = reformerCounts();
    expect(counts.total).toBe(117);
    // Every region must be usable on its own, and core work dominates a
    // classical reformer repertoire.
    expect(counts.upper).toBeGreaterThan(30);
    expect(counts.core).toBeGreaterThan(60);
    expect(counts.lower).toBeGreaterThan(30);
  });

  it("covers all three levels", () => {
    const levels = new Set(REFORMER_EXERCISES.map((e) => e.level));
    expect(levels).toEqual(new Set(["beginner", "intermediate", "advanced"]));
  });

  it("looks exercises up by id consistently", () => {
    for (const ex of REFORMER_EXERCISES) {
      expect(getReformerExercise(ex.id)?.name).toBe(ex.name);
    }
    expect(getReformerExercise("does-not-exist")).toBeUndefined();
  });

  it("filters by focus without leaking untagged exercises", () => {
    for (const focus of ["upper", "core", "lower"] as const) {
      const found = filterReformerExercises({ focus });
      expect(found.length).toBeGreaterThan(0);
      expect(found.every((e) => e.focus.includes(focus))).toBe(true);
    }
  });

  it("separates dominant-region work from incidental mentions", () => {
    for (const focus of ["upper", "core", "lower"] as const) {
      const led = exercisesLedBy(focus);
      expect(led.length).toBeGreaterThan(0);
      expect(led.every((e) => e.primary === focus)).toBe(true);
      expect(led.length).toBeLessThanOrEqual(filterReformerExercises({ focus }).length);
    }
  });

  it("groups series in book order", () => {
    const footwork = exercisesBySeries("Footwork");
    expect(footwork).toHaveLength(10);
    expect(footwork.map((e) => e.page)).toEqual([...footwork.map((e) => e.page)].sort((a, b) => a - b));
  });

  it("builds a balanced pool covering every region", () => {
    const pool = buildBalancedPool({ perFocus: 4, level: "beginner", seed: 7 });
    for (const focus of ["upper", "core", "lower"] as const) {
      expect(pool[focus].length).toBe(4);
      expect(pool[focus].every((e) => e.focus.includes(focus))).toBe(true);
    }
    // No duplicates within a region.
    const ids = pool.core.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("is reproducible from a seed", () => {
    const a = buildBalancedPool({ perFocus: 3, seed: 42 });
    const b = buildBalancedPool({ perFocus: 3, seed: 42 });
    expect(a.upper.map((e) => e.id)).toEqual(b.upper.map((e) => e.id));
  });

  it("honours exclusions when building a pool", () => {
    const exclude = ["footwork-first-position", "supine-hundred"];
    const pool = buildBalancedPool({ perFocus: 3, exclude, seed: 1 });
    const used = [...pool.upper, ...pool.core, ...pool.lower].map((e) => e.id);
    for (const id of exclude) expect(used).not.toContain(id);
  });

  it("can restrict a circuit to carriage-only work", () => {
    const carriageOnly = filterReformerExercises({ carriageOnly: true });
    expect(carriageOnly.length).toBeGreaterThan(0);
    expect(carriageOnly.every((e) => !e.equipment.includes("long-box"))).toBe(true);
    expect(carriageOnly.every((e) => !e.equipment.includes("short-box"))).toBe(true);
  });
});
