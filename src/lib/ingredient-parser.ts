/**
 * Parses a recipe ingredient string into structured data.
 * e.g. "1 cup red lentils" → { quantity: "1", unit: "cup", name: "red lentils", searchTerm: "red lentils" }
 */

import { formatSmartQty, groupKey, parseQty, toBase } from "@/lib/smart-shopping-core";

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

// Prep notes come after a comma ("2 cloves garlic, minced"), so everything from the
// first comma outside brackets is dropped. Prep words *before* the noun stay in the
// name ("200g tinned diced tomatoes", "15g grated cheese").
const TRAILING_NOTES = /\s+(?:to taste|to serve|to wilt|for (?:serving|drizzling|topping|garnish)|as (?:a )?topping|optional)$/i;
const LABEL = /^(?:optional(?:\s+toppings?)?|marinade|dressing|sauce|toppings?|garnish|to serve|for the [^:]{1,30}):\s*/i;
const VAGUE = /^(?:a\s+)?(?:small|large|big|generous|good)?\s*(?:handful|drizzle|few|splash|sprinkle|knob|little)\s+(?:of\s+)?/i;
const SIZE_WORDS = /^(?:fresh|large|medium|small|extra[- ]large|xl|ripe|thick|thin|heaped|level|good[- ]quality|organic|raw|mini|free[- ]range|plain|unsweetened|natural|extra virgin|full[- ]fat|low[- ]fat|lean|boneless|skinless|hulled|massaged|rinsed and drained|drained and rinsed|drained|rinsed|(?:lightly|loosely|firmly|tightly)?\s*packed)\s+/i;
const PRODUCT_WORDS = /^(?:dried|frozen|cooked|canned|tinned|baby)\s+/i;

const toNumber = (q: string) => {
  const m = q.trim().match(/^(?:(\d+)\s+)?(\d+(?:\.\d+)?)(?:\s*\/\s*(\d+))?$/);
  if (!m) return NaN;
  return m[3] ? Number(m[1] ?? 0) + Number(m[2]) / Number(m[3]) : Number(m[2]);
};

/** "frozen or fresh strawberries" → "fresh strawberries"; "milk or plant milk" → "milk". */
function firstAlternative(name: string): string {
  const parts = name.split(/\s+or\s+/i);
  if (parts.length < 2) return name;
  return /^(fresh|frozen|dried|tinned|canned)$/i.test(parts[0]) ? parts.slice(1).join(" or ") : parts[0];
}

export function parseIngredient(raw: string): ParsedIngredient {
  const fractions: Record<string, string> = { "½": "1/2", "⅓": "1/3", "⅔": "2/3", "¼": "1/4", "¾": "3/4", "⅛": "1/8", "⅜": "3/8", "⅝": "5/8", "⅞": "7/8" };
  const text = raw.trim().replace(/([0-9])([½⅓⅔¼¾⅛⅜⅝⅞])/g, "$1 $2").replace(/[½⅓⅔¼¾⅛⅜⅝⅞]/g, c => fractions[c]);

  // Brackets first (they can hold commas), then cut the prep notes after the first comma.
  const parens = [...text.matchAll(/\(([^)]*)\)/g)].map(m => m[1].trim());
  let cleaned = text.replace(/\s*\([^)]*\)/g, "").split(",")[0].replace(TRAILING_NOTES, "").trim();
  cleaned = cleaned
    .replace(LABEL, "")
    .replace(/^(?:a\s+)?squeeze of\s+/i, "")
    .replace(/^(?:the\s+)?(?:zest and juice|juice and zest|zest|juice)\s+of\s+/i, "")
    .replace(/^(\d+(?:\s*\/\s*\d+)?)\s+an?\s+/i, "$1 ");
  if (!/^\d/.test(cleaned)) cleaned = cleaned.replace(VAGUE, "");

  // "1 x 400g can chickpeas", "1/2 x 400g tin beans", "1/3 of a 400g can tomatoes" → grams.
  const can = cleaned.match(/^(\d+(?:\s+\d+\/\d+|\s*\/\s*\d+|\.\d+)?)\s*(?:x|×|of(?:\s+an?)?)\s*(\d+(?:\.\d+)?)\s*(g|ml)\s+(?:(?:cans?|tins?|jars?|packets?|packs?|bags?)\s+)?(?:of\s+)?(.+)$/i);
  if (can && Number.isFinite(toNumber(can[1]))) {
    cleaned = `${Math.round(toNumber(can[1]) * Number(can[2]))}${can[3]} ${can[4]}`;
  }

  // A plain "(400 g)" bracket is a fallback weight; "(about 40g)" is only a hint.
  let parenQty = "";
  let parenUnit = "";
  for (const p of parens) {
    const m = p.match(/^([\d./\s-]+)\s*(g|gram|grams|kg|ml|l|cup|cups|tbsp|tsp)\b/i);
    if (m) { parenQty = m[1].trim(); parenUnit = m[2].toLowerCase(); break; }
  }

  // Match quantity (number, fraction, or range) at start
  const qtyMatch = cleaned.match(/^(\d+(?:\.\d+)?(?:\s+\d+\s*\/\s*\d+|\s*\/\s*\d+)?(?:\s*[-–]\s*\d+(?:\.\d+)?)?)\s*/);
  let quantity = "";
  let rest = cleaned;

  if (qtyMatch) {
    quantity = qtyMatch[1].trim();
    rest = cleaned.slice(qtyMatch[0].length).trim();
  }

  // Match unit ("1 large handful" → handful)
  const words = rest.split(/\s+/);
  if (words.length > 1 && /^(small|large|big|heaped|level|generous)$/i.test(words[0]) && UNITS.has(words[1].toLowerCase().replace(/s$/, ""))) words.shift();
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

  let name = words.slice(nameStart).join(" ").trim()
    .replace(/^(?:cans?|tins?|jars?)\s+(?:of\s+)?/i, "")
    .replace(/^(?:lightly|loosely|firmly|tightly)\s+packed\s+/i, "");

  // "2 garlic cloves" reads the same as "2 cloves garlic" on a shopping list.
  const cloveTail = !unit && name.match(/^(.+?)\s+(cloves?)$/i);
  if (cloveTail) {
    name = cloveTail[1];
    unit = cloveTail[2].toLowerCase();
  }

  // If no leading qty/unit was found but a "(400 g)" bracket was present,
  // promote it to be the canonical quantity + unit.
  if (!quantity && parenQty) {
    quantity = parenQty;
    unit = parenUnit;
  } else if (quantity && unit === "" && parenQty && parenUnit) {
    // e.g. "1 tin (400 g) tomatoes" → prefer the gram weight for shopping totals
    quantity = parenQty;
    unit = parenUnit;
  }

  // Guard: a name that is *only* a descriptor like "tinned" / "canned" /
  // "fresh" with no following noun is meaningless. Fall back to the raw
  // string so the shopping list never shows a row called "Tinned".
  const onlyDescriptor = /^(fresh|dried|frozen|organic|raw|cooked|canned|tinned|large|medium|small|baby|mini)$/i;
  if (!name || onlyDescriptor.test(name)) {
    name = raw.replace(/^[\d½⅓⅔¼¾⅛.\-–\s]+/, "").replace(/\s*\([^)]*\)/g, "").split(",")[0].trim() || raw;
  }

  // Search term: drop size, freshness and ripeness words, keep product words
  // (tinned, dried, frozen) only after the first, so "small ripe banana" → "banana".
  let searchTerm = firstAlternative(name);
  for (let i = 0; i < 4 && SIZE_WORDS.test(searchTerm); i++) searchTerm = searchTerm.replace(SIZE_WORDS, "");
  // Product form changes what must be bought: keep dried/cooked/tinned distinct.
  for (let i = 0; i < 2 && SIZE_WORDS.test(searchTerm); i++) searchTerm = searchTerm.replace(SIZE_WORDS, "");
  searchTerm = searchTerm.trim();

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

/** Normalise unit to canonical form for comparison */
function normUnit(u: string): string {
  const s = u.toLowerCase().replace(/s$/, "");
  const MAP: Record<string, string> = {
    tbsp: "tbsp", tablespoon: "tbsp",
    tsp: "tsp", teaspoon: "tsp",
    cup: "cup", g: "g", gram: "g", kg: "kg", kilogram: "kg",
    ml: "ml", millilitre: "ml", l: "l", litre: "l",
    can: "can", tin: "can", jar: "can", packet: "can", pack: "can",
    bunch: "bunch", handful: "handful",
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

/** Merge flat shopping items into grouped display items (same units and wording as the week list). */
export function mergeShoppingItems(items: ShoppingItem[]): MergedShoppingItem[] {
  const groups = new Map<string, { indices: number[]; items: ShoppingItem[]; total: number; unit: string }>();

  items.forEach((item, idx) => {
    const base = item.quantity ? toBase(parseQty(item.quantity), item.unit, item.name) : { qty: 0, unit: "none" };
    const key = `${groupKey(item.searchTerm || normName(item.name))}::${base.unit || normUnit(item.unit) || "unit"}`;
    if (!groups.has(key)) groups.set(key, { indices: [], items: [], total: 0, unit: base.unit });
    const g = groups.get(key)!;
    g.indices.push(idx);
    g.items.push(item);
    g.total += base.qty;
  });

  const result: MergedShoppingItem[] = [];
  groups.forEach((group, key) => {
    const first = group.items[0];
    const totalStr = group.total > 0
      ? formatSmartQty(group.total, group.unit, first.name)
      : group.items.length > 1 ? `×${group.items.length}` : "";

    const recipes = [...new Set(group.items.filter(i => i.recipeName !== "Manual").map(i => i.recipeName))];
    const recipeIds = [...new Set(group.items.map(i => i.recipeId))];
    const allChecked = group.items.every(i => i.checked);

    result.push({
      key,
      name: first.name,
      totalQuantity: totalStr,
      // The formatted total already carries its unit ("125 ml (½ cup)", "3 cloves").
      unit: "",
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

/** Scale the full recipe to the number of portions being cooked. */
export function scaleIngredientAmount(raw: string, factor: number): string {
 const parsed = parseIngredient(raw);
 if (!parsed.quantity || factor === 1) return raw;
 const quantity = parseQty(parsed.quantity) * factor;
 const notes = raw.includes(',') ? raw.slice(raw.indexOf(',')) : '';
 return [Number(quantity.toFixed(2)).toString(), parsed.unit, parsed.name].filter(Boolean).join(' ') + notes;
}
