import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { CATALOG } from "@/lib/all-recipes";
import { dishForm, getRecipeIllustration } from "@/lib/category-illustrations";

const onDisk = (src: string) => existsSync(src.startsWith("/src/") ? "." + src : "public" + decodeURI(src));

describe("recipe illustrations", () => {
  it("points every catalogue recipe at a file that exists", () => {
    const broken = CATALOG.map(({ recipe }) => recipe.image || getRecipeIllustration(recipe.name, recipe.id))
      .filter((src): src is string => !!src && !onDisk(src));
    expect(broken).toEqual([]);
  });

  it("reads the kind of dish from the main part of the title", () => {
    expect(dishForm("Banana Pikelets")).toBe("pancake");
    expect(dishForm("Banana Cinnamon Muffins")).toBe("muffin");
    expect(dishForm("Beet and Mint Falafels in Flatbreads")).toBe("falafel");
    expect(dishForm("Banana Berry Smoothie Bowl")).toBe("smoothie bowl");
    expect(dishForm("Yoghurt Fruit Bowl")).toBe("yoghurt");
    expect(dishForm("Tomato Pepper and Cannellini Bean Pasta Bake")).toBe("pasta");
    expect(dishForm("Pumpkin & Kale Chilli")).toBe("stew");
    expect(dishForm("Smoked Chilli Lime Popcorn")).toBeNull();
    expect(dishForm("Spicy Mushroom and Tofu Shawarma with Cucumber Yoghurt")).toBeNull();
  });

  it("never shows a different dish", () => {
    expect(getRecipeIllustration("Banana Cinnamon Muffins") ?? "placeholder").not.toMatch(/pancake/);
    expect(getRecipeIllustration("Berry Puff Pancake") ?? "placeholder").not.toMatch(/smoothie/);
    expect(getRecipeIllustration("Beet and Mint Falafels in Flatbreads") ?? "placeholder").not.toMatch(/pizza/);
    expect(getRecipeIllustration("Lemon Herb Chutney") ?? "placeholder").not.toMatch(/salmon/);
    expect(getRecipeIllustration("Chicken & Sweet Potato Stew") ?? "placeholder").not.toMatch(/schnitzel/);
    expect(getRecipeIllustration("Buckwheat Soba with Stir-Fried Vegetables") ?? "placeholder").not.toMatch(/salmon/);
  });

  it("falls back to a placeholder rather than a guess", () => {
    expect(getRecipeIllustration("Jambalaya")).toBeNull();
  });
});
