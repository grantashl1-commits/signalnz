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
  if (/frozen/.test(lower)) return "frozen";
  if (/\b(seed|seeds|tinned|canned|salt|pepper|spice|tahini|nut butter|peanut butter|almond butter)\b/.test(lower)) return "pantry";
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) return cat;
  }
  return "other";
}

export function parseQty(qty: string): number {
  if (!qty) return 1;
  const q = qty.trim();
  if (/[-–]/.test(q)) return Math.max(...q.split(/[-–]/).map(parseQty));
  const mixed = q.match(/^(?:(\d+)\s+)?(\d+)\s*\/\s*(\d+)$/);
  if (mixed) return Number(mixed[1] ?? 0) + Number(mixed[2]) / Number(mixed[3] || 1);
  const n = Number(q); return Number.isFinite(n) && n >= 0 ? n : 1;
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
    return { qty: ml, unit: "ml" };
  }

  if (u === "g" || u === "gram") {
    return { qty, unit: "g" };
  }
  if (u === "kg" || u === "kilogram") {
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

// ── Kitchen-friendly display ────────────────────────────────────
// Small amounts read as spoons, liquids as "125 ml (½ cup)", dry goods
// measured by volume as cups, weights as g/kg and counts as "8 cloves".

const FRACTIONS: Array<[number, string]> = [[0, ""], [0.25, "¼"], [1 / 3, "⅓"], [0.5, "½"], [2 / 3, "⅔"], [0.75, "¾"], [1, ""]];

/** 1.5 → "1½", 0.33 → "⅓", 2 → "2". */
export function niceFraction(x: number): string {
  const whole = Math.floor(x + 1e-6);
  const frac = x - whole;
  let best = FRACTIONS[0];
  for (const f of FRACTIONS) if (Math.abs(frac - f[0]) < Math.abs(frac - best[0])) best = f;
  const w = best[0] === 1 ? whole + 1 : whole;
  if (w === 0) return best[1] || "¼";
  return `${w}${best[0] === 1 ? "" : best[1]}`;
}

function spoons(ml: number): string {
  if (ml < 1) return "pinch";
  // Spoons come in quarters, never thirds.
  if (ml < 14) return `${niceFraction(Math.max(0.25, Math.round((ml / 5) * 4) / 4))} tsp`;
  return `${niceFraction(Math.round((ml / 15) * 2) / 2)} tbsp`;
}

function cups(ml: number): string {
  const c = ml / 250;
  const label = niceFraction(c);
  return `${label} cup${c > 1.1 ? "s" : ""}`;
}

const roundMl = (ml: number) => (ml < 250 ? Math.round(ml / 5) * 5 : ml < 1000 ? Math.round(ml / 25) * 25 : Math.round(ml / 50) * 50);
const roundG = (g: number) => (g < 20 ? Math.round(g) : g < 100 ? Math.round(g / 5) * 5 : Math.round(g / 10) * 10);

const PLURAL: Record<string, string> = { clove: "cloves", can: "cans", tin: "tins", jar: "jars", bunch: "bunches", handful: "handfuls", slice: "slices", piece: "pieces", sprig: "sprigs", head: "heads", packet: "packets", pack: "packs" };

export function formatSmartQty(totalQty: number, unit: string, name: string): string {
  if (!totalQty) return "";
  const base = toBase(totalQty, unit, name);
  if (base.unit === "ml") {
    const ml = base.qty;
    if (ml < 60) return spoons(ml);
    // Liquids (almond milk, stock, oil) get ml and cups; spinach, oats and seeds just cups.
    const pourable = LIQUID_RE.test(name) && !/\b(powder|flakes?|seeds?|butter|paste)\b/i.test(name);
    if (!pourable) return cups(ml);
    if (ml >= 1000) return `${Math.round(ml / 100) / 10} L`;
    return `${roundMl(ml)} ml (${cups(ml)})`;
  }
  if (base.unit === "g") {
    return base.qty >= 1000 ? `${Math.round(base.qty / 100) / 10} kg` : `${roundG(base.qty)} g`;
  }
  const u = base.unit.replace(/s$/, "");
  const n = base.qty;
  const count = n >= 10 ? `${Math.round(n)}` : niceFraction(n);
  if (!u) return count;
  if (u === "pinch" || u === "dash") return u;
  return `${count} ${n > 1.1 ? PLURAL[u] ?? `${u}s` : u}`;
}

/** Grouping key so "tomato" and "tomatoes", "chickpea" and "chickpeas" share a row. */
export function groupKey(searchTerm: string): string {
  return searchTerm.toLowerCase().replace(/\s+/g, " ").trim()
    .replace(/(\w{3,}?)(oes|ies|s)$/, (_m, stem: string, suf: string) => (suf === "ies" ? `${stem}y` : suf === "oes" ? `${stem}o` : stem));
}

const SIZE_PREFIX = /^(?:(?:small|medium|large|extra[- ]large|ripe|thick|thin|fresh)\s+)+/i;

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
  meals: Array<{ ingredients: string[]; serves?: number; servingsNeeded?: number } | null | undefined>;
  servingMultiplier?: number;
}

export function aggregateShoppingItems(
  input: AggregateInput,
  parseIngredient: (s: string) => { quantity: string; unit: string; name: string; searchTerm: string },
): Record<string, AggregatedItem[]> {
  const mult = input.servingMultiplier ?? 1;
  const ingredientMap: Record<string, AggregatedItem> = {};

  const add = (key: string, item: AggregatedItem) => {
    if (ingredientMap[key]) ingredientMap[key].totalQty += item.totalQty;
    else ingredientMap[key] = item;
  };

  for (const meal of input.meals) {
    if (!meal || !meal.ingredients?.length) continue;
    const serves = meal.serves || 2;
    for (const ingStr of meal.ingredients) {
      const parsed = parseIngredient(ingStr);
      // "Salt, pepper and thyme" with no amount becomes three plain rows.
      if (!parsed.quantity) {
        for (const part of parsed.name.split(/\s*(?:,|&|\band\b)\s*/i).map(p => p.trim()).filter(Boolean)) {
          const nzName = toNZName(part.replace(SIZE_PREFIX, "")) || toNZName(part);
          const search = parseIngredient(part).searchTerm;
          add(`${groupKey(toNZName(search))}::none`, {
            name: nzName.charAt(0).toUpperCase() + nzName.slice(1),
            totalQty: 0,
            unit: "",
            category: categoriseItem(nzName),
            searchTerm: toNZName(search),
          });
        }
        continue;
      }
      // "Small ripe banana" shops as "Banana"; product words like tinned or dried stay.
      const nzName = toNZName(parsed.name.replace(SIZE_PREFIX, "")) || toNZName(parsed.name);
      const nzSearch = toNZName(parsed.searchTerm);
      const totalQty = (parseQty(parsed.quantity) * (meal.servingsNeeded ?? mult)) / serves;
      const base = toBase(totalQty, parsed.unit, nzName);
      add(`${groupKey(nzSearch)}::${base.unit || "unit"}`, {
        name: nzName.charAt(0).toUpperCase() + nzName.slice(1),
        totalQty: base.qty,
        unit: base.unit,
        category: categoriseItem(nzName),
        searchTerm: nzSearch,
      });
    }
  }

  // An amount-less row ("fresh coriander") is dropped when the same item has an amount elsewhere.
  for (const key of Object.keys(ingredientMap)) {
    if (!key.endsWith("::none")) continue;
    const stem = key.slice(0, -"::none".length);
    if (Object.keys(ingredientMap).some(k => k !== key && k.startsWith(`${stem}::`))) delete ingredientMap[key];
  }

  const groups: Record<string, AggregatedItem[]> = {};
  for (const item of Object.values(ingredientMap)) {
    if (!groups[item.category]) groups[item.category] = [];
    groups[item.category].push(item);
  }
  return groups;
}
