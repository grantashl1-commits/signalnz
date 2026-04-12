import { describe, it, expect } from "vitest";
import { parseIngredient } from "../ingredient-parser";

describe("parseIngredient", () => {
  it("parses quantity, unit, and name", () => {
    const result = parseIngredient("1 cup red lentils");
    expect(result.quantity).toBe("1");
    expect(result.unit).toBe("cup");
    expect(result.name).toBe("red lentils");
  });

  it("parses fractional quantities", () => {
    const result = parseIngredient("½ tsp turmeric");
    expect(result.quantity).toBe("½");
    expect(result.unit).toBe("tsp");
    expect(result.name).toBe("turmeric");
  });

  it("handles no quantity", () => {
    const result = parseIngredient("spinach");
    expect(result.quantity).toBe("");
    expect(result.unit).toBe("");
    expect(result.name).toBe("spinach");
  });

  it("strips prep words", () => {
    const result = parseIngredient("2 cloves garlic, minced");
    expect(result.name).toBe("garlic");
    expect(result.unit).toBe("cloves");
    expect(result.quantity).toBe("2");
  });

  it("handles 'of' after unit", () => {
    const result = parseIngredient("1 cup of flour");
    expect(result.unit).toBe("cup");
    expect(result.name).toBe("flour");
  });

  it("strips descriptors from search term", () => {
    const result = parseIngredient("1 can organic chickpeas");
    expect(result.unit).toBe("can");
    expect(result.searchTerm).toBe("chickpeas");
  });

  it("handles plural units", () => {
    const result = parseIngredient("3 cups oats");
    expect(result.unit).toBe("cups");
    expect(result.name).toBe("oats");
  });

  it("preserves raw string", () => {
    const raw = "2 tbsp olive oil, for drizzling";
    const result = parseIngredient(raw);
    expect(result.raw).toBe(raw);
  });
});
