import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import RECIPE_IMAGE_FILES from "@/data/recipe-image-files.json";
import { findRecipeImageByTitle } from "@/lib/category-illustrations";

const MANIFEST: Array<{ id: string; slug: string; name: string }> = JSON.parse(
  readFileSync("src/data/recipe-art-manifest.json", "utf8"),
);

/**
 * A recipe picks its picture up by id: `findRecipeImageByTitle` checks the id
 * key before any fuzzy title matching, so a registered id always beats a
 * look-alike dish. These tests hold both halves of that: the manifest recipes
 * resolve to their own drawing, and nothing in the map points at a missing file.
 */
describe("recipe art registration", () => {
  it("pins every drawn recipe to its own illustration", () => {
    const problems: string[] = [];
    for (const job of MANIFEST) {
      const expected = `/images/recipes/meals/${job.slug}.png`;
      if (!existsSync(`public${expected}`)) problems.push(`${job.id}: missing file ${expected}`);
      const resolved = findRecipeImageByTitle(job.name, job.id);
      // The id key must win, so a fuzzy match can never hand it another dish.
      if (resolved !== expected) problems.push(`${job.id}: resolves to ${resolved}, expected ${expected}`);
    }
    expect(problems).toEqual([]);
  });

  it("only maps illustrations that exist on disk", () => {
    const missing = Object.entries(RECIPE_IMAGE_FILES as Record<string, string>)
      .filter(([, path]) => path.startsWith("/images/"))
      .filter(([, path]) => !existsSync(`public${path}`))
      .map(([key, path]) => `${key} -> ${path}`);
    expect(missing).toEqual([]);
  });
});
