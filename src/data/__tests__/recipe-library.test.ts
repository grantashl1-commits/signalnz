import { describe, expect, it } from "vitest";
import {
  RECIPE_SOURCES,
  buildMergedRecipes,
  deriveCategory,
  deriveMealType,
  deriveProtein,
  recipeNameKey,
} from "@/data/recipe-library";
import { ALL_RECIPES, RECIPE_LIBRARY_STATS } from "@/lib/recipe-index";
import type { Recipe } from "@/data/meal-plans";

const stub = (over: Partial<Recipe>): Recipe =>
  ({
    id: "x",
    name: "X",
    phase: "follicular",
    serves: 1,
    prepTime: "10 min",
    keyNutrients: [],
    ingredients: [],
    method: [],
    phaseBenefit: "",
    ...over,
  }) as Recipe;

describe("merged recipe library", () => {
  it("wires in the banks that used to be unreachable", () => {
    // The library was 314 before the orphaned banks were connected.
    expect(ALL_RECIPES.length).toBeGreaterThan(900);
    expect(RECIPE_SOURCES.length).toBeGreaterThanOrEqual(20);
  });

  it("keeps ids and names unique", () => {
    const ids = ALL_RECIPES.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);

    const names = ALL_RECIPES.map((r) => recipeNameKey(r.name));
    const dupes = names.filter((n, i) => names.indexOf(n) !== i);
    expect(dupes).toEqual([]);
  });

  it("gives every recipe the fields the filters rely on", () => {
    for (const r of ALL_RECIPES) {
      expect(r.phase, `${r.id} phase`).toBeTruthy();
      expect(r.category, `${r.id} category`).toBeTruthy();
      expect(r.serves, `${r.id} serves`).toBeGreaterThan(0);
      expect(r.ingredients.length, `${r.id} ingredients`).toBeGreaterThan(0);
      expect(r.method.length, `${r.id} method`).toBeGreaterThan(0);
      expect(Array.isArray(r.mealType) && r.mealType!.length > 0, `${r.id} mealType`).toBe(true);
      expect(r.protein, `${r.id} protein`).toBeTruthy();
    }
  });

  it("lets the long-standing collections win any collision", () => {
    // A recipe that exists in both nourish and an orphaned bank must keep the
    // nourish id, so saved recipes and meal plans don't break.
    const names = new Set(ALL_RECIPES.map((r) => recipeNameKey(r.name)));
    expect(names.size).toBe(ALL_RECIPES.length);

    const keepIds = new Set(ALL_RECIPES.map((r) => r.id));
    // lunch-l4 (nourish) beats meal-plan's "Baked Potato with Hummus and Salad".
    expect(keepIds.has("lunch-l4")).toBe(true);
    expect(keepIds.has("baked-potato-hummus")).toBe(false);
  });

  it("reports what dedupe dropped", () => {
    expect(RECIPE_LIBRARY_STATS.droppedById + RECIPE_LIBRARY_STATS.droppedByName).toBeGreaterThan(0);
    expect(RECIPE_LIBRARY_STATS.kept).toBe(ALL_RECIPES.length);
    expect(RECIPE_LIBRARY_STATS.collisions.length).toBeGreaterThan(0);
  });
});

describe("derivations for banks with missing metadata", () => {
  it("defaults a missing phase to phase-agnostic", () => {
    const { recipes } = buildMergedRecipes([
      { label: "t", recipes: [stub({ id: "a", name: "A", phase: undefined as never })] },
    ]);
    expect(recipes[0].phase).toBe("any");
  });

  it("derives category from the id prefix, then mealType, then the name", () => {
    expect(deriveCategory(stub({ id: "snack-kale-chips", name: "Baked Kale Chips", category: undefined }))).toBe("snack");
    expect(deriveCategory(stub({ id: "whatever", name: "Overnight Oats", category: undefined }))).toBe("breakfast");
    expect(deriveCategory(stub({ id: "whatever2", name: "Sourdough Loaf", category: undefined }))).toBe("baking");
    expect(deriveCategory(stub({ id: "whatever3", name: "Chicken Curry", category: undefined }))).toBe("meal");
    expect(
      deriveCategory(stub({ id: "noprefix", name: "Something", category: undefined, mealType: ["lunch"] })),
    ).toBe("meal");
    // An explicit category always wins.
    expect(deriveCategory(stub({ category: "snack" }))).toBe("snack");
  });

  it("derives meal type, splitting lunch from dinner which category cannot", () => {
    expect(deriveMealType(stub({ id: "lunch-x1" }))).toEqual(["lunch"]);
    expect(deriveMealType(stub({ id: "dinner-m5" }))).toEqual(["dinner"]);
    expect(deriveMealType(stub({ id: "anything", category: "breakfast" }))).toEqual(["breakfast"]);
    // Unprefixed mains stay usable in either slot.
    expect(deriveMealType(stub({ id: "creamy-oats", category: "meal" }))).toEqual(["lunch", "dinner"]);
    // An explicit value is never overwritten.
    expect(deriveMealType(stub({ id: "x", mealType: ["dinner"] }))).toEqual(["dinner"]);
  });

  it("derives the main protein source from ingredients", () => {
    expect(deriveProtein(stub({ ingredients: ["200g chicken thigh"] }))).toBe("chicken");
    expect(deriveProtein(stub({ ingredients: ["400g beef mince"] }))).toBe("beef");
    expect(deriveProtein(stub({ ingredients: ["1 salmon fillet"] }))).toBe("salmon");
    expect(deriveProtein(stub({ ingredients: ["200g firm tofu"] }))).toBe("tofu");
    expect(deriveProtein(stub({ ingredients: ["2 eggs"] }))).toBe("eggs");
    expect(deriveProtein(stub({ ingredients: ["1 cup red lentils"] }))).toBe("lentils");
    expect(deriveProtein(stub({ ingredients: ["1 can chickpeas"] }))).toBe("chickpeas");
    // A chicken-and-bean dish reads as chicken, not legumes.
    expect(deriveProtein(stub({ ingredients: ["chicken breast", "black beans"] }))).toBe("chicken");
    // Plant milks must not read as dairy.
    expect(deriveProtein(stub({ ingredients: ["250ml coconut milk", "1 banana"] }))).toBe("none");
    // Eggplant is not egg.
    expect(deriveProtein(stub({ ingredients: ["1 eggplant"] }))).toBe("none");
    // An explicit value wins.
    expect(deriveProtein(stub({ ingredients: [], protein: "tempeh" }))).toBe("tempeh");
  });
});

describe("dedupe mechanics", () => {
  it("drops a later bank's copy of the same dish", () => {
    // The real collision pattern across banks: the same dish spelled with "&"
    // in one file and "and" in another. recipeNameKey normalises the ampersand.
    const { recipes, stats } = buildMergedRecipes([
      { label: "first", recipes: [stub({ id: "a", name: "Lamb & Lentil Soup" })] },
      { label: "second", recipes: [stub({ id: "b", name: "Lamb and Lentil Soup" })] },
    ]);
    expect(recipes).toHaveLength(1);
    expect(recipes[0].id).toBe("a");
    expect(stats.droppedByName).toBe(1);
  });

  it("does not merge dishes whose names genuinely differ", () => {
    // Dedupe is deliberately conservative on names: a differing word means a
    // differing dish, and these stay separate.
    const { recipes } = buildMergedRecipes([
      { label: "first", recipes: [stub({ id: "a", name: "Roasted Vegetable & Quinoa Salad" })] },
      { label: "second", recipes: [stub({ id: "b", name: "Roasted Vegetable & Quinoa Bowl" })] },
    ]);
    expect(recipes).toHaveLength(2);
  });

  it("drops duplicate ids even when names differ", () => {
    const { recipes, stats } = buildMergedRecipes([
      { label: "first", recipes: [stub({ id: "same", name: "One" })] },
      { label: "second", recipes: [stub({ id: "same", name: "Two" })] },
    ]);
    expect(recipes).toHaveLength(1);
    expect(stats.droppedById).toBe(1);
  });
});
