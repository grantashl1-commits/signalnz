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
  "can", "cans", "tin", "tins", "jar", "jars", "packet", "packets", "pack", "packs",
  "bunch", "bunches", "handful", "handfuls",
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

  // Build a clean search term (strip size and quality descriptors for grouping)
  const searchTerm = name
    .replace(/^(fresh|dried|frozen|organic|raw|cooked|canned|tinned|large|medium|small|baby|mini|extra-large|xl|extra large)\s+/i, "")
    .replace(/\s*\(.*?\)\s*/g, "")
    .trim();

  return { raw, quantity, unit, name: name || cleaned, searchTerm: searchTerm || name || cleaned };
}

const SUPERMARKET_SEARCH_URLS: Record<string, string> = {
  "Woolworths NZ": "https://www.woolworths.co.nz/shop/searchproducts?search=",
  "New World": "https://www.newworld.co.nz/shop/search?q=",
  "Pak'nSave": "https://www.paknsave.co.nz/shop/search?q=",
  "Four Square": "https://www.foursquare.co.nz/shop/search?q=",
};

export function getWoolworthsSearchUrl(ingredient: ParsedIngredient): string {
  // Legacy name kept for backward compat — actually reads user's preferred supermarket
  try {
    const raw = localStorage.getItem("signal_supermarket");
    if (raw) {
      const pref = JSON.parse(raw);
      const base = SUPERMARKET_SEARCH_URLS[pref.name];
      if (base) return `${base}${encodeURIComponent(ingredient.searchTerm)}`;
    }
  } catch {}
  return `https://www.woolworths.co.nz/shop/searchproducts?search=${encodeURIComponent(ingredient.searchTerm)}`;
}

export interface ShoppingItem extends ParsedIngredient {
  recipeId: string;
  recipeName: string;
  checked: boolean;
}

/** Merged item for display — groups same ingredient across recipes */
export interface MergedShoppingItem {
  key: string;            // normalised ingredient name
  name: string;           // display name
  totalQuantity: string;  // combined quantity string
  unit: string;
  recipes: string[];      // recipe names that use this ingredient
  recipeIds: string[];
  checked: boolean;
  searchTerm: string;
  raw: string;
  /** Original indices in the flat list (for toggling) */
  sourceIndices: number[];
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

export function toggleMergedItem(indices: number[]): ShoppingItem[] {
  const items = getShoppingList();
  // If all are checked, uncheck all; otherwise check all
  const allChecked = indices.every(i => items[i]?.checked);
  indices.forEach(i => { if (items[i]) items[i].checked = !allChecked; });
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

export function removeMergedItem(indices: number[]): ShoppingItem[] {
  const items = getShoppingList();
  // Remove from highest index first to avoid shifting
  const sorted = [...indices].sort((a, b) => b - a);
  sorted.forEach(i => items.splice(i, 1));
  saveShoppingList(items);
  return items;
}

/* ── Quantity parsing & merging helpers ── */

/** Convert fraction chars to decimal */
function fracToNum(s: string): number {
  const FRACS: Record<string, number> = { "½": 0.5, "⅓": 0.333, "⅔": 0.667, "¼": 0.25, "¾": 0.75, "⅛": 0.125 };
  let val = 0;
  let rest = s.trim();
  // handle "1 ½" style
  const parts = rest.split(/\s+/);
  for (const p of parts) {
    if (FRACS[p]) { val += FRACS[p]; }
    else if (p.includes("/")) {
      const [n, d] = p.split("/").map(Number);
      if (d) val += n / d;
    } else {
      const n = parseFloat(p);
      if (!isNaN(n)) val += n;
    }
  }
  return val;
}

function numToDisplay(n: number): string {
  if (n === 0) return "";
  if (n % 1 === 0) return String(n);
  // common fractions
  const frac = n % 1;
  const whole = Math.floor(n);
  const CLOSE = (a: number, b: number) => Math.abs(a - b) < 0.05;
  let fracStr = "";
  if (CLOSE(frac, 0.25)) fracStr = "¼";
  else if (CLOSE(frac, 0.333)) fracStr = "⅓";
  else if (CLOSE(frac, 0.5)) fracStr = "½";
  else if (CLOSE(frac, 0.667)) fracStr = "⅔";
  else if (CLOSE(frac, 0.75)) fracStr = "¾";
  else return n.toFixed(1);
  return whole > 0 ? `${whole} ${fracStr}` : fracStr;
}

/** Normalise unit to canonical form for comparison */
function normUnit(u: string): string {
  const s = u.toLowerCase().replace(/s$/, "");
  const MAP: Record<string, string> = {
    tbsp: "tbsp", tablespoon: "tbsp",
    tsp: "tsp", teaspoon: "tsp",
    cup: "cup", g: "g", gram: "g", kg: "kg", kilogram: "kg",
    ml: "ml", millilitre: "ml", l: "l", litre: "l",
    can: "can", bunch: "bunch", handful: "handful",
    clove: "clove", slice: "slice", piece: "piece",
    pinch: "pinch", dash: "dash", sprig: "sprig", head: "head",
  };
  return MAP[s] || s;
}

/** Normalise ingredient name for grouping — strips size/quality descriptors */
function normName(name: string): string {
  return name.toLowerCase()
    .replace(/^(fresh|dried|frozen|organic|raw|cooked|canned|tinned|large|medium|small|baby|mini|extra-large|xl|extra large)\s+/i, "")
    .replace(/\s*\(.*?\)\s*/g, "")
    .replace(/[''`\-–—]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Merge flat shopping items into grouped display items */
export function mergeShoppingItems(items: ShoppingItem[]): MergedShoppingItem[] {
  const groups = new Map<string, { indices: number[]; items: ShoppingItem[] }>();

  items.forEach((item, idx) => {
    const key = `${normName(item.name)}::${normUnit(item.unit)}`;
    if (!groups.has(key)) groups.set(key, { indices: [], items: [] });
    groups.get(key)!.indices.push(idx);
    groups.get(key)!.items.push(item);
  });

  const result: MergedShoppingItem[] = [];
  groups.forEach((group, key) => {
    const first = group.items[0];
    // Sum quantities
    let total = 0;
    let allHaveQty = true;
    for (const it of group.items) {
      if (it.quantity) {
        total += fracToNum(it.quantity);
      } else {
        allHaveQty = false;
      }
    }
    const totalStr = allHaveQty && total > 0 ? numToDisplay(total) : (group.items.length > 1 ? `×${group.items.length}` : first.quantity);

    const recipes = [...new Set(group.items.filter(i => i.recipeName !== "Manual").map(i => i.recipeName))];
    const recipeIds = [...new Set(group.items.map(i => i.recipeId))];
    const allChecked = group.items.every(i => i.checked);

    result.push({
      key,
      name: first.name,
      totalQuantity: totalStr,
      unit: first.unit,
      recipes,
      recipeIds,
      checked: allChecked,
      searchTerm: first.searchTerm,
      raw: first.raw,
      sourceIndices: group.indices,
    });
  });

  return result;
}

export function formatShoppingListText(items: ShoppingItem[]): string {
  const merged = mergeShoppingItems(items);
  const lines = merged.map(m => {
    const qty = m.totalQuantity ? `${m.totalQuantity} ` : "";
    const unit = m.unit ? `${m.unit} ` : "";
    return `${m.checked ? "✓" : "☐"} ${qty}${unit}${m.name}${m.recipes.length ? ` (${m.recipes.join(", ")})` : ""}`;
  });
  return `Shopping List\n${"—".repeat(20)}\n${lines.join("\n")}`;
}
