/**
 * Parses a recipe ingredient string into structured data.
 * e.g. "1 cup red lentils" → { quantity: "1", unit: "cup", name: "red lentils", searchTerm: "red lentils" }
 */

export interface ParsedIngredient {
  raw: string;
  quantity: string;
  unit: string;
  name: string;
  searchTerm: string;
}

const UNITS = new Set([
  "cup", "cups", "tbsp", "tsp", "tablespoon", "tablespoons", "teaspoon", "teaspoons",
  "oz", "ounce", "ounces", "lb", "lbs", "pound", "pounds",
  "g", "gram", "grams", "kg", "kilogram", "kilograms",
  "ml", "millilitre", "millilitres", "l", "litre", "litres",
  "can", "cans", "bunch", "bunches", "handful", "handfuls",
  "clove", "cloves", "slice", "slices", "piece", "pieces",
  "pinch", "dash", "sprig", "sprigs", "head", "heads",
]);

const PREP_WORDS = /,?\s*(diced|chopped|minced|sliced|grated|crushed|peeled|trimmed|halved|quartered|julienned|torn|roughly|finely|thinly|to taste|for serving|optional).*$/i;

export function parseIngredient(raw: string): ParsedIngredient {
  let text = raw.trim();

  // Remove prep instructions
  const cleaned = text.replace(PREP_WORDS, "").trim();

  // Match quantity (number, fraction, or range) at start
  const qtyMatch = cleaned.match(/^([\d½⅓⅔¼¾⅛]+(?:\s*[-–]\s*[\d½⅓⅔¼¾⅛]+)?(?:\s*\/\s*\d+)?)\s*/);
  let quantity = "";
  let rest = cleaned;

  if (qtyMatch) {
    quantity = qtyMatch[1].trim();
    rest = cleaned.slice(qtyMatch[0].length).trim();
  }

  // Match unit
  const words = rest.split(/\s+/);
  let unit = "";
  let nameStart = 0;

  if (words.length > 0 && UNITS.has(words[0].toLowerCase().replace(/s$/, "")) || UNITS.has(words[0].toLowerCase())) {
    unit = words[0].toLowerCase();
    nameStart = 1;
    // Handle "of" after unit: "cup of flour"
    if (words[nameStart]?.toLowerCase() === "of") {
      nameStart++;
    }
  }

  const name = words.slice(nameStart).join(" ").trim();

  // Build a clean search term (strip minor descriptors)
  const searchTerm = name
    .replace(/^(fresh|dried|frozen|organic|raw|cooked|canned|tinned)\s+/i, "")
    .replace(/\s*\(.*?\)\s*/g, "")
    .trim();

  return { raw, quantity, unit, name: name || cleaned, searchTerm: searchTerm || name || cleaned };
}

export function getWoolworthsSearchUrl(ingredient: ParsedIngredient): string {
  return `https://www.woolworths.co.nz/shop/searchproducts?search=${encodeURIComponent(ingredient.searchTerm)}`;
}

export interface ShoppingItem extends ParsedIngredient {
  recipeId: string;
  recipeName: string;
  checked: boolean;
}

const STORAGE_KEY = "mindcast-shopping-list";

export function getShoppingList(): ShoppingItem[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch { return []; }
}

export function saveShoppingList(items: ShoppingItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function addRecipeToShoppingList(recipeId: string, recipeName: string, ingredients: string[]): ShoppingItem[] {
  const existing = getShoppingList().filter((i) => i.recipeId !== recipeId);
  const newItems: ShoppingItem[] = ingredients.map((raw) => ({
    ...parseIngredient(raw),
    recipeId,
    recipeName,
    checked: false,
  }));
  const merged = [...existing, ...newItems];
  saveShoppingList(merged);
  return merged;
}

export function removeRecipeFromShoppingList(recipeId: string): ShoppingItem[] {
  const items = getShoppingList().filter((i) => i.recipeId !== recipeId);
  saveShoppingList(items);
  return items;
}

export function toggleShoppingItem(index: number): ShoppingItem[] {
  const items = getShoppingList();
  if (items[index]) items[index].checked = !items[index].checked;
  saveShoppingList(items);
  return items;
}

export function clearShoppingList(): ShoppingItem[] {
  saveShoppingList([]);
  return [];
}

export function addManualItem(text: string): ShoppingItem[] {
  const items = getShoppingList();
  const parsed = parseIngredient(text);
  items.push({
    ...parsed,
    recipeId: "manual",
    recipeName: "Manual",
    checked: false,
  });
  saveShoppingList(items);
  return items;
}

export function removeItem(index: number): ShoppingItem[] {
  const items = getShoppingList();
  items.splice(index, 1);
  saveShoppingList(items);
  return items;
}

export function formatShoppingListText(items: ShoppingItem[]): string {
  const lines = items.map((i) => `${i.checked ? "✓" : "☐"} ${i.quantity ? i.quantity + " " : ""}${i.unit ? i.unit + " " : ""}${i.name}`);
  return `Shopping List\n${"—".repeat(20)}\n${lines.join("\n")}`;
}
