import { describe, it, expect } from "vitest";
import { extractPlantsFromIngredients } from "../plant-extractor";

describe("extractPlantsFromIngredients", () => {
  it("extracts known plant foods from ingredient strings", () => {
    const ingredients = ["1 cup spinach", "2 cloves garlic", "chicken breast"];
    const plants = extractPlantsFromIngredients(ingredients);
    expect(plants).toContain("spinach");
    expect(plants).toContain("garlic");
    expect(plants).not.toContain("chicken");
  });

  it("handles compound plant names", () => {
    const ingredients = ["1 sweet potato, cubed", "2 tbsp chia seeds"];
    const plants = extractPlantsFromIngredients(ingredients);
    expect(plants).toContain("sweet potato");
    expect(plants).toContain("chia seeds");
  });

  it("returns empty array for no plants", () => {
    const plants = extractPlantsFromIngredients(["200g salmon", "1 tbsp butter"]);
    expect(plants).toHaveLength(0);
  });

  it("deduplicates plants", () => {
    const ingredients = ["1 cup spinach", "2 cups baby spinach"];
    const plants = extractPlantsFromIngredients(ingredients);
    const spinachCount = plants.filter(p => p === "spinach").length;
    expect(spinachCount).toBe(1);
  });

  it("finds herbs and spices", () => {
    const ingredients = ["1 tsp turmeric", "fresh basil leaves", "pinch of cumin"];
    const plants = extractPlantsFromIngredients(ingredients);
    expect(plants).toContain("turmeric");
    expect(plants).toContain("basil");
    expect(plants).toContain("cumin");
  });
});
