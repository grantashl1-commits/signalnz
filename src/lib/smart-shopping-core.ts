/**
 * Shared shopping-list aggregation, NZ name translation, categorisation,
 * unit normalisation, and quantity formatting.
 *
 * Consumed by both the in-app SmartShoppingList component and the
 * printable PDF export, so the two always show the same categories,
 * the same NZ wording, and the same summed quantities.
 */

export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  produce: ["onion","garlic","ginger","tomato","spinach","kale","silverbeet","broccoli","broccolini","capsicum","pepper","carrot","potato","kumara","kūmara","courgette","zucchini","eggplant","aubergine","mushroom","avocado","banana","apple","berry","berries","lemon","lime","mango","kiwifruit","kiwi","cucumber","asparagus","bok choy","pak choi","pumpkin","beetroot","cabbage","rocket","spring onion","coriander","parsley","mint","basil","chilli","pear","orange","fruit","lettuce","celery","leek","fennel","radish"],
  protein: ["chicken","beef","mince","lamb","pork","fish","salmon","tuna","prawn","tofu","tempeh","egg","turkey","lentil","chickpea","bean","edamame"],
  dairy: ["milk","yoghurt","yogurt","cream","cheese","butter","feta","haloumi"],
  pantry: ["coconut milk","coconut oil","olive oil","sesame oil","tamari","soy sauce","miso","mirin","maple syrup","honey","vinegar","soy","stock","tomato paste","canned","tinned","peanut butter","almond butter","tahini","chocolate","cacao","vanilla","flour","sugar","rice","pasta","noodle","oat","quinoa","bread","wrap","wholemeal"],
  frozen: ["frozen"],
};

export const CATEGORY_META: Record<string, string> = {
  produce: "Produce",
  protein: "Protein",
  dairy: "Dairy / Alternatives",
  pantry: "Pantry",
  frozen: "Frozen",
  other: "Other",
};

export const CATEGORY_ORDER = ["produce", "protein", "dairy", "pantry", "frozen", "other"];

const NZ_SYNONYMS: Array<[RegExp, string]> = [
  [/\bbell pepper(s)?\b/gi, "capsicum"],
  [/\bcilantro\b/gi, "coriander"],
  [/\bscallion(s)?\b/gi, "spring onion"],
  [/\bgreen onion(s)?\b/gi, "spring onion"],
  [/\barugula\b/gi, "rocket"],
  [/\baubergine\b/gi, "eggplant"],
  [/\bcourgette(s)?\b/gi, "zucchini"],
  [/\bgarbanzo(s)?\b/gi, "chickpea"],
  [/\bsweet potato(es)?\b/gi, "kūmara"],
  [/\byogurt\b/gi, "yoghurt"],
  [/\bzucchini squash\b/gi, "zucchini"],
  [/\bswiss chard\b/gi, "silverbeet"],
  [/\bsnow pea(s)?\b/gi, "mangetout"],
  [/\bground beef\b/gi, "beef mince"],
  [/\bground lamb\b/gi, "lamb mince"],
  [/\bground turkey\b/gi, "turkey mince"],
  [/\bgreen bean(s)?\b/gi, "green beans"],
  [/\bgarbanzo bean(s)?\b/gi, "chickpeas"],
  [/\bbok ?choy\b/gi, "bok choy"],
  [/\beggplant\b/gi, "eggplant"],
];

export function toNZName(name: string): string {
  let n = name;
  for (const [re, rep] of NZ_SYNONYMS) n = n.replace(re, rep);
  return n;
}

export function categoriseItem(name: string): string {
  const lower = name.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) return cat;
  }
  return "other";
}

export function parseQty(qty: string): number {
  if (!qty) return 1;
  const q = qty.trim();
  if (q.includes("/")) {
    const [a, b] = q.split("/");
    return parseInt(a) / parseInt(b);
  }
  if (q.includes("-")) {
    const [a, b] = q.split("-");
    return (parseFloat(a) + parseFloat(b)) / 2;
  }
  const n = parseFloat(q);
  return isNaN(n) ? 1 : n;
}

const LIQUID_RE = /\b(milk|water|stock|broth|juice|oil|vinegar|sauce|tamari|soy sauce|mirin|cream|yoghurt|yogurt|kefir|wine|beer|coconut water|kombucha|honey|syrup|maple)\b/i;
const DRY_RE = /\b(seed|seeds|nut|nuts|walnut|almond|cashew|hazelnut|peanut|pine nut|pistachio|flour|oat|oats|granola|muesli|rice|quinoa|couscous|bulgur|barley|lentil|chickpea|bean|sugar|cocoa|cacao|coconut(?! milk| water| oil)|sesame|flax|chia|hemp|pumpkin seed|sunflower|cinnamon|turmeric|cumin|paprika|ginger powder|nutmeg|cardamom|coriander seed|fennel seed|garam masala|curry powder|spice|powder|ground|salt|pepper|baking|yeast|breadcrumb|polenta|semolina|chocolate|raisin|sultana|date|cranberry|berry powder|matcha|protein|collagen|bran|wheatgerm|psyllium|nutritional yeast|tahini|nut butter|peanut butter|almond butter|cashew butter|hazelnut butter|jam|preserve|paste)\b/i;
const COUNT_UNITS = new Set(["can","tin","jar","bunch","handful","clove","slice","piece","pinch","dash","sprig","head","packet","pack"]);

function isLiquid(name: string): boolean { return LIQUID_RE.test(name) && !DRY_RE.test(name.replace(LIQUID_RE, "")); }
function isDry(name: string): boolean { return DRY_RE.test(name); }

function gramsPerMl(name: string): number {
  const l = name.toLowerCase();
  if (/flour/.test(l)) return 0.55;
  if (/sugar/.test(l)) return 0.85;
  if (/oat|granola|muesli/.test(l)) return 0.40;
  if (/coconut(?! milk| water| oil)/.test(l)) return 0.35;
  if (/rice|quinoa|lentil|chickpea|bean/.test(l)) return 0.80;
  if (/seed|nut|almond|cashew|walnut|hazelnut|sunflower|pumpkin|sesame|flax|chia/.test(l)) return 0.60;
  if (/cinnamon|turmeric|cumin|paprika|spice|powder|ground|nutmeg|cardamom/.test(l)) return 0.50;
  if (/butter|tahini|nut butter|jam|paste/.test(l)) return 0.95;
  return 0.65;
}

export function toBase(qty: number, unit: string, name: string): { qty: number; unit: string } {
  const u = unit.toLowerCase().replace(/s$/, "").replace(/\.$/, "").trim();
  const liquid = isLiquid(name);
  const dry = isDry(name);

  let ml = 0;
  if (u === "tsp" || u === "teaspoon") ml = qty * 5;
  else if (u === "tbsp" || u === "tablespoon") ml = qty * 15;
  else if (u === "cup") ml = qty * 250;
  else if (u === "ml" || u === "millilitre") ml = qty;
  else if (u === "l" || u === "litre") ml = qty * 1000;

  if (ml > 0) {
    if (liquid) return { qty: ml, unit: "ml" };
    if (dry) return { qty: ml * gramsPerMl(name), unit: "g" };
    return { qty: ml, unit: "ml" };
  }

  if (u === "g" || u === "gram") {
    if (liquid) return { qty: qty / gramsPerMl(name), unit: "ml" };
    return { qty, unit: "g" };
  }
  if (u === "kg" || u === "kilogram") {
    if (liquid) return { qty: (qty * 1000) / gramsPerMl(name), unit: "ml" };
    return { qty: qty * 1000, unit: "g" };
  }
  if (u === "oz" || u === "ounce") return { qty: qty * 28.35, unit: "g" };
  if (u === "lb" || u === "pound") return { qty: qty * 453.6, unit: "g" };

  if (COUNT_UNITS.has(u)) return { qty, unit: u };
  return { qty, unit: u || "" };
}

export function displayUnit(qty: number, unit: string): { qty: number; unit: string } {
  if (unit === "g") {
    if (qty >= 1000) return { qty: Math.round(qty / 100) / 10, unit: "kg" };
    return { qty: Math.round(qty), unit: "g" };
  }
  if (unit === "ml") {
    if (qty >= 1000) return { qty: Math.round(qty / 100) / 10, unit: "L" };
    return { qty: Math.round(qty), unit: "ml" };
  }
  if (unit === "tsp") {
    if (qty >= 3) return { qty: Math.round((qty / 3) * 10) / 10, unit: "tbsp" };
    return { qty, unit };
  }
  return { qty, unit };
}

export function smartUnit(qty: number, unit: string, name: string): { qty: number; unit: string } {
  const base = toBase(qty, unit, name);
  return displayUnit(base.qty, base.unit);
}

export function formatSmartQty(totalQty: number, unit: string, name: string): string {
  const c = smartUnit(totalQty, unit, name);
  const q = c.qty;
  const display = q < 1 ? `${Math.round(q * 10) / 10}` :
    q > 10 ? `${Math.round(q)}` :
      `${Math.round(q * 10) / 10}`;
  return c.unit ? `${display} ${c.unit}` : `${display}`;
}

export interface AggregatedItem {
  name: string;
  totalQty: number;
  unit: string;
  category: string;
  searchTerm: string;
  isPantryStaple?: boolean;
  isCustom?: boolean;
}

/**
 * Aggregate ingredient strings from a set of meals into grouped, summed,
 * NZ-named, smart-unit items — the same logic SmartShoppingList uses.
 *
 * `servingMultiplier` lets callers scale for household size
 * (e.g. adults + kids * 0.6).
 */
export interface AggregateInput {
  meals: Array<{ ingredients: string[]; serves?: number } | null | undefined>;
  servingMultiplier?: number;
}

export function aggregateShoppingItems(
  input: AggregateInput,
  parseIngredient: (s: string) => { quantity: string; unit: string; name: string; searchTerm: string },
): Record<string, AggregatedItem[]> {
  const mult = input.servingMultiplier ?? 1;
  const ingredientMap: Record<string, AggregatedItem> = {};

  for (const meal of input.meals) {
    if (!meal || !meal.ingredients?.length) continue;
    const serves = meal.serves || 2;
    for (const ingStr of meal.ingredients) {
      const parsed = parseIngredient(ingStr);
      const nzName = toNZName(parsed.name);
      const nzSearch = toNZName(parsed.searchTerm);
      const baseQty = parseQty(parsed.quantity);
      const totalQty = (baseQty * mult) / serves;
      const mapKey = nzSearch.toLowerCase();
      const cat = categoriseItem(nzName);
      const base = toBase(totalQty, parsed.unit, nzName);
      const unitKey = base.unit || "unit";
      const fullKey = `${mapKey}::${unitKey}`;
      if (ingredientMap[fullKey]) {
        ingredientMap[fullKey].totalQty += base.qty;
      } else {
        ingredientMap[fullKey] = {
          name: nzName.charAt(0).toUpperCase() + nzName.slice(1),
          totalQty: base.qty,
          unit: base.unit,
          category: cat,
          searchTerm: nzSearch,
        };
      }
    }
  }

  const groups: Record<string, AggregatedItem[]> = {};
  for (const item of Object.values(ingredientMap)) {
    if (!groups[item.category]) groups[item.category] = [];
    groups[item.category].push(item);
  }
  return groups;
}
