/**
 * Recipe facets — one place that answers "what kind of recipe is this?"
 * for both the grown-up library and the kids bank.
 *
 *  - Diet is read from ingredients, not tags (tags are sparse and sometimes
 *    wrong). "honey or maple syrup" counts as plant-based: the member can
 *    choose the vegan option.
 *  - A school lunch, per the client brief, must: need no reheating, pack
 *    into a lunchbox section, and be make-ahead or freezer-friendly so it
 *    can be batch-made on Sunday.
 */

export type Diet = "vegan" | "vegetarian" | "pescatarian" | "omnivore";
export type LunchRole = "main" | "snack";

export interface FacetInput {
  name: string;
  ingredients: string[];
  method?: string[];
  tags?: string[];
  prepTime?: string;
  cookTime?: string;
  /** Adult library category or kids mealType list. */
  category?: string;
  mealType?: string[];
}

export interface RecipeFacets {
  diet: Diet;
  vegan: boolean;
  vegetarian: boolean;
  nutFree: boolean;
  quick: boolean;
  minutes: number | null;
  noReheat: boolean;
  packable: boolean;
  makeAhead: boolean;
  freezer: boolean;
  schoolLunch: boolean;
  lunchRole: LunchRole | null;
}

/* ── Diet ─────────────────────────────────────────────────────────── */

/** Phrases that look animal-derived but aren't. Removed before matching. */
const PLANT_SAFE = [
  /\b(coconut|oat|almond|soy|soya|rice|cashew|hemp|pea|plant[- ]based|plant|macadamia|dairy[- ]free|vegan)\s+(milk|cream|yoghurt|yogurt|cheese|butter|mayo|mayonnaise|feta|parmesan|cream cheese|sour cream|custard|ice cream)\b/g,
  /\b(peanut|almond|cashew|nut|seed|sunflower|cocoa|cacao|apple|bean|vegan|plant)\s+butter\b/g,
  /\bbutter\s?(beans?|nut|lettuce|milk powder-free)\b/g,
  /\b(lentil|plant|vegan|soy|soya|tofu|mushroom|walnut)\s+mince\b/g,
  /\b(vegan|plant[- ]based|veggie|vegetarian)\s+(sausages?|nuggets?|burgers?|cheese|mayo)\b/g,
  /\b(flax|chia)\s+eggs?\b/g,
  /\beggplant\b/g,
  /\begg[- ]free\b/g,
  /\bnutritional yeast\b/g,
  /\b(milk|dairy)[- ]free\b/g,
  /\bcoconut\s+(yoghurt|yogurt|cream|milk)\b/g,
  /\bnice cream\b/g,
  /\bcream of tartar\b/g,
];

const MEAT = /\b(chicken|beef|lamb|pork|bacon|ham|prosciutto|salami|chorizo|pepperoni|sausages?|mince|turkey|venison|steaks?|meatballs?|veal|duck|gelatine?|bone broth|lard|pancetta)\b/;
const SEAFOOD = /\b(fish|salmon|tuna|cod|snapper|tarakihi|hoki|terakihi|sardines?|mackerel|prawns?|shrimps?|mussels?|scallops?|squid|calamari|crab|anchov(y|ies)|fish sauce|seafood|trout|kahawai|whitebait|oysters?|sea bass|bass|barramundi|kingfish|hapuku|groper|ling|sole|plaice|halibut|bream|tilapia)\b/;
const EGG = /\b(eggs?|yolks?|egg whites?|omelette|frittata|meringue|mayo|mayonnaise|aioli)\b/;
const DAIRY = /\b(milk|cheese|cheddar|butter|cream|yoghurt|yogurt|ghee|paneer|feta|parmesan|halloumi|ricotta|mozzarella|labneh|kefir|whey|custard|ice cream|buttermilk|quark|mascarpone|bocconcini|brie|camembert|gouda|pecorino|tzatziki)\b/;
const HONEY = /\bhoney\b/;

/** "honey or maple syrup", "milk or oat milk" — a plant option is offered. */
const PLANT_ALTERNATIVE = /\bor\s+(maple|agave|rice malt|date syrup|plant|oat|soy|coconut|almond|vegan|dairy[- ]free|tofu|chickpeas?|beans|lentils)/;

function scrub(text: string): string {
  let t = ` ${text.toLowerCase()} `;
  for (const re of PLANT_SAFE) t = t.replace(re, " ");
  return t;
}

/** A line that names itself plant-based ("vegan Greek-style cheese", "plant milk"). */
const SELF_DECLARED_PLANT = /\b(vegan|plant[- ]based|plant milk|dairy[- ]free|egg[- ]free|meat[- ]free)\b/;

export function detectDiet(ingredients: string[], tags: string[] = []): Diet {
  let meat = false, fish = false, egg = false, honey = false, dairy = false;
  for (const raw of ingredients) {
    const line = raw.toLowerCase();
    // "honey or maple syrup" is a genuine either/or, so the plant option wins.
    // "450g beef mince (or tofu / plant-based mince)" is not: the recipe as
    // written uses the beef, so an animal named *before* the plant phrasing
    // still decides the diet.
    const plantSpots = [PLANT_ALTERNATIVE.exec(line)?.index, SELF_DECLARED_PLANT.exec(line)?.index].filter(
      (i): i is number => typeof i === "number",
    );
    if (plantSpots.length) {
      const first = Math.min(...plantSpots);
      const animalBefore = MEAT.test(line.slice(0, first)) || SEAFOOD.test(line.slice(0, first));
      if (!animalBefore) continue;
    }
    // Optional garnishes don't decide the diet ("parmesan to serve (optional)").
    if (/\(optional\)|optional:|to serve, optional/.test(line) && !MEAT.test(line)) continue;
    const t = scrub(line);
    if (MEAT.test(t)) meat = true;
    else if (SEAFOOD.test(t)) fish = true;
    else if (EGG.test(t)) egg = true;
    else if (HONEY.test(t)) honey = true;
    else if (DAIRY.test(t)) dairy = true;
  }
  if (meat) return "omnivore";
  if (fish) return "pescatarian";
  if (egg || honey) return "vegetarian";
  // A plant-based cookbook's "milk" or "butter" means the plant version.
  if (dairy) return tags.map((x) => x.toLowerCase()).includes("vegan") ? "vegan" : "vegetarian";
  return "vegan";
}

/* ── Nuts ─────────────────────────────────────────────────────────── */

const NUT_SAFE = /\b(coconut\w*|nutmeg|butternut|nutritional|water chestnuts?|doughnuts?|donuts?|nut[- ]free|chestnut mushrooms?)\b/g;
const NUTS = /\b(almonds?|cashews?|walnuts?|pecans?|hazelnuts?|pistachios?|macadamias?|brazil nuts?|pine nuts?|peanuts?|nut butter|nuts|praline|marzipan|frangipane|almond meal|ground almonds|nutella)\b/;

export function containsNuts(ingredients: string[], name = ""): boolean {
  const t = `${name} ${ingredients.join(" ")}`.toLowerCase().replace(NUT_SAFE, " ");
  return NUTS.test(t);
}

/* ── Time ─────────────────────────────────────────────────────────── */

export function parseMinutes(...times: (string | undefined)[]): number | null {
  let mins = 0;
  for (const raw of times) {
    if (!raw) continue;
    const t = raw.toLowerCase();
    if (/overnight/.test(t)) mins += 8 * 60;
    let matched = false;
    for (const m of t.matchAll(/(\d+(?:\.\d+)?)\s*(h|hr|hrs|hour|hours)\b/g)) { mins += parseFloat(m[1]) * 60; matched = true; }
    for (const m of t.matchAll(/(\d+)\s*(m|min|mins|minute|minutes)\b/g)) { mins += parseInt(m[1], 10); matched = true; }
    if (!matched) {
      const n = t.match(/(\d+)/);
      if (n) mins += parseInt(n[1], 10);
    }
  }
  return mins || null;
}

/* ── School lunch ─────────────────────────────────────────────────── */

/** Formats that are eaten hot or don't survive a lunchbox. */
const NEEDS_HEAT = /\b(rice bowls?|spaghetti|marinara|meatballs?|lentil loaf|meatloaf|polenta|soups?|stews?|curry|curries|casserole|bake\b|baked pasta|risotto|fried rice|mac\b|mac (and|&) cheese|macaroni cheese|bolognese|chilli|chili|dhal|dal|daal|porridge|oatmeal|stir[- ]?fry|lasagne|lasagna|roast(ed)? (chicken|lamb|beef|pork)|mash\b|mashed|shepherd|pot pie|nachos|tacos?|ramen|broth|gnocchi|pho|laksa|congee|hot chocolate|toastie|jacket potato|baked potato|enchiladas?|tagine|ragu|hotpot|carbonara|alfredo|stroganoff|schnitzel)\b/;
const SERVED_HOT = /\b(serve (hot|warm|immediately)|while (still )?(hot|warm)|eat (hot|warm|straight away))\b/;

/** Lunchbox formats that keep, travel and taste good cold. */
const SAVOURY_PACK = /\b(frittatas?|quiches?|egg muffins?|egg bites|fritters?|patt(y|ies)|falafels?|nuggets?|scrolls?|pinwheels?|sausage rolls?|savoury muffins?|cheese muffins?|corn muffins?|zucchini muffins?|veg(gie|etable)? muffins?|quesadillas?|hummus|dips?|roasted chickpeas|crackers|(pasta|quinoa|grain|noodle|couscous|bean|chickpea|lentil|orzo|rice noodle|soba) salad|sushi bake bites|bliss savoury|savoury (bites|balls))\b/;
const SWEET_PACK = /\b(muffins?|bliss balls?|energy (balls?|bites?)|protein (balls?|bites?)|bites|balls|bars?|slices?|flapjacks?|cookies?|biscuits?|loaf|banana bread|zucchini bread|pikelets?|pancakes?|granola bars?|muesli bars?|brownies?|blondies?|fruit leathers?|oat cups|crackles?)\b/;
/** Savoury words that turn a "bites/balls/muffins" format into a lunchbox main. */
const SAVOURY_WORDS = /\b(chicken|salmon|tuna|tofu|cauliflower|pizzas?|sausages?|cheese(?!cake)|cheesy|savoury|savory|veg(gie|etable)s?|pasta|rice|corn(bread)?|zucchini|spinach|beans?|lentils?|chickpeas?|ham|turkey|katsu|teriyaki|falafel|pumpkin|kumara|broccoli|pea)\b/;

const SWEET_WORDS = /\b(chocolate|choc|banana|honey|maple|cookies?|cake|brownies?|dates?|caramel|berr(y|ies)|apple|cinnamon|sweet(?! potato)|jam|coconut rough|fudge)\b/;

const FREEZES = /\b(muffins?|scrolls?|fritters?|patt(y|ies)|falafels?|nuggets?|pikelets?|pancakes?|bliss balls?|energy (balls?|bites?)|bites|balls|bars?|slices?|cookies?|biscuits?|loaf|banana bread|zucchini bread|sausage rolls?|quiches?|frittatas?|quesadillas?|brownies?|flapjacks?|egg muffins?)\b|\bfreez(e|er|es well)\b/;
const KEEPS_DAYS = /\b(hummus|dips?|roasted chickpeas|crackers|(pasta|quinoa|grain|noodle|couscous|bean|chickpea|lentil|orzo|soba) salad|pinwheels?)\b|\b(make[- ]ahead|keeps? (for )?\d|store in (an )?airtight|meal prep|batch)\b/;

export function getFacets(r: FacetInput): RecipeFacets {
  const diet = detectDiet(r.ingredients, r.tags);
  const name = r.name.toLowerCase();
  const method = (r.method ?? []).join(" ").toLowerCase();
  const tags = new Set((r.tags ?? []).map((t) => t.toLowerCase()));
  const minutes = parseMinutes(r.prepTime, r.cookTime);

  const noReheat = !NEEDS_HEAT.test(name) && !SERVED_HOT.test(method);
  const savoury = SAVOURY_PACK.test(name) || (SWEET_PACK.test(name) && SAVOURY_WORDS.test(name) && !SWEET_WORDS.test(name));
  const sweet = !savoury && SWEET_PACK.test(name);
  const packable = savoury || sweet || tags.has("lunchbox") || tags.has("portable");
  const freezer = FREEZES.test(name) || FREEZES.test(method) || tags.has("freezer") || tags.has("freezer-friendly");
  const makeAhead = freezer || KEEPS_DAYS.test(name) || KEEPS_DAYS.test(method) || tags.has("make-ahead") || tags.has("meal-prep");
  const schoolLunch = noReheat && packable && makeAhead;

  return {
    diet,
    vegan: diet === "vegan",
    vegetarian: diet === "vegan" || diet === "vegetarian",
    nutFree: !containsNuts(r.ingredients, r.name),
    quick: minutes !== null && minutes <= 20,
    minutes,
    noReheat,
    packable,
    makeAhead,
    freezer,
    schoolLunch,
    lunchRole: schoolLunch ? (savoury ? "main" : "snack") : null,
  };
}

/** Memoised per recipe id — facets are pure functions of static data. */
const cache = new Map<string, RecipeFacets>();
export function facetsFor(id: string, r: FacetInput): RecipeFacets {
  let f = cache.get(id);
  if (!f) {
    f = getFacets(r);
    cache.set(id, f);
  }
  return f;
}

export const DIET_LABEL: Record<Diet, string> = {
  vegan: "Vegan",
  vegetarian: "Vegetarian",
  pescatarian: "Pescatarian",
  omnivore: "Contains meat",
};
