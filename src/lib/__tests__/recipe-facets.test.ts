import { describe, it, expect } from "vitest";
import { detectDiet, containsNuts, parseMinutes, getFacets } from "@/lib/recipe-facets";

describe("detectDiet", () => {
  it("reads plant alternatives and plant-qualified dairy as vegan", () => {
    expect(detectDiet(["1 tbsp honey or maple syrup", "400ml coconut milk", "2 tbsp peanut butter", "1 butternut pumpkin"])).toBe("vegan");
    expect(detectDiet(["200g vegan Greek-style cheese", "1 small eggplant", "1 cup lentil mince"])).toBe("vegan");
  });
  it("classifies animal products", () => {
    expect(detectDiet(["2 eggs", "1 cup flour"])).toBe("vegetarian");
    expect(detectDiet(["1 tsp honey", "tofu"])).toBe("vegetarian");
    expect(detectDiet(["200g salmon", "rice"])).toBe("pescatarian");
    expect(detectDiet(["500g chicken breast", "1 tbsp fish sauce"])).toBe("omnivore");
    expect(detectDiet(["2 cups chicken stock"])).toBe("omnivore");
  });
  it("trusts a vegan cookbook's generic milk, but not its honey", () => {
    expect(detectDiet(["½ cup milk", "1 banana"], ["vegan"])).toBe("vegan");
    expect(detectDiet(["1 tsp honey"], ["vegan"])).toBe("vegetarian");
  });
  it("ignores optional garnishes", () => {
    expect(detectDiet(["chickpeas", "parmesan to serve (optional)"])).toBe("vegan");
  });
});

describe("containsNuts", () => {
  it("ignores coconut, nutmeg, butternut and nutritional yeast", () => {
    expect(containsNuts(["coconut cream", "pinch nutmeg", "butternut squash", "nutritional yeast"])).toBe(false);
  });
  it("finds tree nuts and peanuts", () => {
    expect(containsNuts(["2 tbsp peanut butter"])).toBe(true);
    expect(containsNuts(["¼ cup chopped walnuts"])).toBe(true);
    expect(containsNuts([], "Almond crusted nuggets")).toBe(true);
  });
});

describe("parseMinutes", () => {
  it("adds prep and cook time and counts overnight", () => {
    expect(parseMinutes("15 min", "25 min")).toBe(40);
    expect(parseMinutes("5 min + 10 min marinate")).toBe(15);
    expect(parseMinutes("1 hr 10 mins")).toBe(70);
    expect(parseMinutes("5 min + overnight soak")).toBeGreaterThan(400);
    expect(parseMinutes(undefined)).toBeNull();
  });
});

describe("school lunch rules (no reheat · packable · make-ahead/freezer)", () => {
  const f = (name: string, extra: Partial<Parameters<typeof getFacets>[0]> = {}) =>
    getFacets({ name, ingredients: extra.ingredients ?? ["flour"], ...extra });

  it("accepts batch-friendly lunchbox formats", () => {
    expect(f("Veggie Mini Frittatas").lunchRole).toBe("main");
    expect(f("Zucchini & Corn Fritters").lunchRole).toBe("main");
    expect(f("Teriyaki Salmon Bites").lunchRole).toBe("main");
    expect(f("Date Cacao Coconut Bliss Balls").lunchRole).toBe("snack");
    expect(f("Chunky Monkey Chickpea Cookies").lunchRole).toBe("snack");
  });
  it("rejects anything that needs reheating or won't keep", () => {
    expect(f("Mild Coconut Chickpea Curry").schoolLunch).toBe(false);
    expect(f("Chicken Nugget Rice Bowl").schoolLunch).toBe(false);
    expect(f("Spaghetti Marinara with Lentil Balls").schoolLunch).toBe(false);
    expect(f("Egg Fried Rice").schoolLunch).toBe(false);
    expect(f("Banana smoothie").schoolLunch).toBe(false);
  });
  it("respects 'serve hot' in the method", () => {
    expect(f("Corn fritters", { method: ["Fry and serve hot with relish"] }).schoolLunch).toBe(false);
  });
});
