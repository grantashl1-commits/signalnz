import { describe, expect, it } from "vitest";
import { parseIngredient } from "../ingredient-parser";
import { aggregateShoppingItems, formatSmartQty, niceFraction } from "../smart-shopping-core";

const list = (...meals: string[][]) => Object.values(aggregateShoppingItems({ meals: meals.map(ingredients => ({ ingredients, serves: 1 })) }, parseIngredient)).flat();
const row = (items: ReturnType<typeof list>, name: RegExp) => items.find(i => name.test(i.name))!;

describe("shopping list units", () => {
  it("adds two ¼ cups of almond milk to 125 ml (½ cup)", () => {
    const milk = row(list(["¼ cup almond milk"], ["1/4 cup almond milk"]), /almond milk/i);
    expect(formatSmartQty(milk.totalQty, milk.unit, milk.name)).toBe("125 ml (½ cup)");
  });

  it("shows small amounts as spoons", () => {
    expect(formatSmartQty(3, "ml", "dried basil")).toBe("½ tsp");
    expect(formatSmartQty(15, "ml", "lemon juice")).toBe("1 tbsp");
    expect(formatSmartQty(2, "tsp", "ground cumin")).toBe("2 tsp");
    const oil = row(list(["1 tbsp olive oil"], ["2 tsp olive oil"], ["1 tsp olive oil"]), /olive oil/i);
    expect(formatSmartQty(oil.totalQty, oil.unit, oil.name)).toBe("2 tbsp");
  });

  it("keeps dry goods in cups and weights in g/kg", () => {
    expect(formatSmartQty(1.5, "cup", "rolled oats")).toBe("1½ cups");
    expect(formatSmartQty(1250, "g", "carrot")).toBe("1.3 kg");
    expect(formatSmartQty(62.5, "g", "feta")).toBe("65 g");
  });

  it("reads tins, cloves and prep words the way a shopper would", () => {
    const items = list(["200g tinned diced tomatoes", "2 garlic cloves", "15g grated cheese"], ["1 clove garlic, minced", "1 x 400g can chickpeas, rinsed and drained"]);
    expect(row(items, /tomatoes/).name).toBe("Tinned diced tomatoes");
    const garlic = row(items, /^garlic/i);
    expect(formatSmartQty(garlic.totalQty, garlic.unit, garlic.name)).toBe("3 cloves");
    expect(row(items, /cheese/).name).toBe("Grated cheese");
    const chickpeas = row(items, /chickpeas/i);
    expect(formatSmartQty(chickpeas.totalQty, chickpeas.unit, chickpeas.name)).toBe("400 g");
  });

  it("splits amount-less seasonings into their own rows and merges plurals", () => {
    const items = list(["Salt and pepper", "Fresh coriander"], ["1 handful coriander", "2 tomatoes"], ["1 tomato"]);
    expect(items.filter(i => /^(salt|pepper)$/i.test(i.name))).toHaveLength(2);
    expect(items.filter(i => /coriander/i.test(i.name))).toHaveLength(1);
    const tomato = items.filter(i => /tomato/i.test(i.name));
    expect(tomato).toHaveLength(1);
    expect(formatSmartQty(tomato[0].totalQty, tomato[0].unit, tomato[0].name)).toBe("3");
  });

  it("writes friendly fractions", () => {
    expect(niceFraction(0.5)).toBe("½");
    expect(niceFraction(1.75)).toBe("1¾");
    expect(niceFraction(0.34)).toBe("⅓");
    expect(niceFraction(2)).toBe("2");
  });
});

describe("method amounts", async () => {
  const { withMethodAmounts } = await import("../recipe-method");
  it("adds amounts the first time a step names an ingredient without one", () => {
    const out = withMethodAmounts(
      ["1 brown onion, diced", "2 garlic cloves", "80g carrot", "1 tbsp olive oil", "1 tsp sesame oil", "250ml water"],
      ["Warm the olive oil. Sauté onion, garlic and carrot for 5 minutes.", "Add the carrot again and 250ml water.", "Finish with sesame oil and a splash of water."],
    );
    expect(out[0]).toBe("Warm the olive oil (1 tbsp). Sauté onion (1), garlic (2 cloves) and carrot (80 g) for 5 minutes.");
    expect(out[1]).toBe("Add the carrot again and 250ml water.");
    expect(out[2]).toBe("Finish with sesame oil (1 tsp) and a splash of water.");
  });

  it("leaves steps that already give the amount", () => {
    const method = ["Place 50g oats, 250ml oat milk and ½ tsp cinnamon in a pan."];
    expect(withMethodAmounts(["50g rolled oats", "250ml oat milk", "½ tsp ground cinnamon"], method)).toEqual(method);
  });
});

describe("method amounts next to other amounts", async () => {
  const { withMethodAmounts } = await import("../recipe-method");
  it("adds an amount after another ingredient's amount in the same clause", () => {
    const out = withMethodAmounts(["30g mixed salad leaves", "1 tsp olive oil", "1 tsp lemon juice", "2 slices rye bread"], ["Serve with 30g salad dressed in oil and lemon.", "Toast the 2 slices rye bread."]);
    expect(out[0]).toBe("Serve with 30g salad dressed in oil (1 tsp) and lemon (1 tsp).");
    expect(out[1]).toBe("Toast the 2 slices rye bread.");
  });
});

describe("shopping aisles and weights", () => {
  const rows = (ingredients: string[]) =>
    Object.entries(aggregateShoppingItems({ meals: [{ serves: 1, ingredients }], servingMultiplier: 1 }, parseIngredient))
      .flatMap(([category, items]) => items.map(i => ({ category, name: i.name, qty: formatSmartQty(i.totalQty, i.unit, i.name) })));

  it("shops a red pepper as capsicum in Produce but keeps pepper flakes in the Pantry", () => {
    const out = rows(["1 red pepper, sliced", "½ tsp red pepper flakes", "1 tsp black pepper"]);
    expect(out).toContainEqual({ category: "produce", name: "Red capsicum", qty: "1" });
    expect(out.find(r => r.name === "Red pepper flakes")?.category).toBe("pantry");
    expect(out.find(r => r.name === "Black pepper")?.category).toBe("pantry");
  });

  it("buys seeds and nuts by the grams the recipe states, in the Pantry", () => {
    const out = rows(["1 tbsp pumpkin seeds (10g)", "20g pumpkin seeds", "1 cup almond meal (150g)"]);
    expect(out).toContainEqual({ category: "pantry", name: "Pumpkin seeds", qty: "30 g" });
    expect(out).toContainEqual({ category: "pantry", name: "Almond meal", qty: "150 g" });
  });
});
