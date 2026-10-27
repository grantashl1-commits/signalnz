import { describe, it, expect } from "vitest";
import { CATALOG, CATALOG_COUNTS, CATALOG_TAGS } from "@/lib/all-recipes";

/**
 * The Recipes tab promises "all 936 recipes, narrowed by filters". These tests
 * hold that promise to the data: every source is present exactly once, every
 * recipe carries tags, and no single tag swallows the catalog (a filter that
 * matches everything is not a filter).
 */
describe("recipe catalog", () => {
  it("includes every source exactly once", () => {
    // The kids bank and the three cookbooks are fixed, hand-curated collections.
    expect(CATALOG_COUNTS).toMatchObject({
      kids: 370,
      plantBasedFamily: 61,
      matthewKids: 34,
      nzAu: 28,
    });
    // The main library is the merged, deduplicated result of every recipe bank
    // in the repo, so it grows as banks are wired back in — it must never shrink
    // below the 443 that were reachable before the merge.
    expect(CATALOG_COUNTS.library).toBeGreaterThanOrEqual(443);
    expect(CATALOG_COUNTS.total).toBe(
      CATALOG_COUNTS.library +
        CATALOG_COUNTS.kids +
        CATALOG_COUNTS.plantBasedFamily +
        CATALOG_COUNTS.matthewKids +
        CATALOG_COUNTS.nzAu,
    );
    expect(CATALOG_COUNTS.total).toBe(CATALOG.length);

    const ids = new Set(CATALOG.map((e) => e.recipe.id));
    expect(ids.size).toBe(CATALOG.length);
  });

  it("gives every recipe a meal slot", () => {
    for (const entry of CATALOG) {
      const tags = CATALOG_TAGS.get(entry.recipe.id) ?? [];
      const hasMeal = ["breakfast", "lunch", "dinner", "snack", "baking", "dessert"].some((m) =>
        tags.includes(m as never),
      );
      expect(hasMeal, `${entry.recipe.id} has no meal tag`).toBe(true);
    }
  });

  it("tags every recipe, without a tag matching everything", () => {
    const counts = new Map<string, number>();
    for (const entry of CATALOG) {
      const tags = CATALOG_TAGS.get(entry.recipe.id);
      expect(tags, `${entry.recipe.id} is untagged`).toBeDefined();
      expect(tags!.length).toBeGreaterThan(0);
      for (const tag of tags!) counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }

    const report = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([tag, n]) => `  ${tag.padEnd(18)} ${n}`)
      .join("\n");
    console.log(`\ntag distribution over ${CATALOG.length} recipes:\n${report}\n`);

    for (const [tag, n] of counts) {
      // 99% is the ceiling: a filter that hides almost nothing is broken.
      expect(n, `"${tag}" matches ${n}/${CATALOG.length}`).toBeLessThan(CATALOG.length * 0.99);
    }
  });

  it("finds the kid collections through the kid-friendly filter", () => {
    const kidFriendly = CATALOG.filter((e) => (CATALOG_TAGS.get(e.recipe.id) ?? []).includes("kid-friendly"));
    // Both children's collections are trusted wholesale (370 + 34).
    expect(kidFriendly.length).toBeGreaterThanOrEqual(404);
  });

  it("finds animal protein dishes without mistagging vegan ones", () => {
    const ANIMAL = ["chicken", "beef", "pork", "seafood"] as const;
    const conflicts: string[] = [];

    for (const entry of CATALOG) {
      const tags = CATALOG_TAGS.get(entry.recipe.id) ?? [];
      if (!tags.includes("vegan")) continue;
      for (const animal of ANIMAL) {
        if (tags.includes(animal)) conflicts.push(`${entry.recipe.id} (${animal})`);
      }
    }

    // No vegan recipe may also be tagged with an animal protein — the two
    // filters would otherwise contradict each other.
    console.log(`\nvegan recipes also tagged with an animal protein: ${conflicts.length}`);
    expect(conflicts).toEqual([]);

    // The filters must actually find the meat dishes the user asked for.
    const count = (tag: string) => CATALOG.filter((e) => (CATALOG_TAGS.get(e.recipe.id) ?? []).includes(tag as never)).length;
    expect(count("chicken")).toBeGreaterThan(20);
    expect(count("beef")).toBeGreaterThan(10);
    expect(count("seafood")).toBeGreaterThan(20);
  });
});
