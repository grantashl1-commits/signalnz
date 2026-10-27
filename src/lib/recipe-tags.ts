/**
 * Recipe tagging — a single taxonomy that every recipe (adult library, kids
 * bank and the three cookbook collections) is tagged against, so the Recipes
 * tab can filter the whole catalog with one consistent set of filters.
 *
 * Built on top of `recipe-facets.ts` (which already answers diet / nut-free /
 * quick / freezer / lunchbox) and adds the extra facets requested for Signal:
 * allergen detail, protein source, occasion, culinary tradition and nutrition.
 *
 * Everything is derived from the recipe's own content (name, ingredients,
 * method, tags, category) — no hand-tagging of 900+ records required, and the
 * heuristics are conservative (a tag is only applied when the content supports
 * it).
 */
import { getFacets, type FacetInput } from "./recipe-facets";

export type RecipeTag =
  // meal
  | "breakfast" | "lunch" | "dinner" | "snack" | "baking" | "dessert"
  // diet & allergens
  | "vegan" | "vegetarian" | "dairy-free" | "egg-free" | "gluten-free" | "nut-free" | "soy-free"
  // protein source
  | "chicken" | "beef" | "pork" | "seafood" | "eggs"
  | "legumes" | "tofu-tempeh" | "nuts-seeds" | "grains"
  // who / occasion
  | "kid-friendly" | "lunchbox" | "freezer-friendly" | "quick" | "one-pot" | "meal-prep"
  // style / tradition
  | "smoothie" | "tcm" | "ayurveda"
  // nutrition
  | "high-protein" | "high-fibre" | "iron-rich" | "magnesium-rich" | "omega-3";

export interface FilterOption {
  id: RecipeTag | "all";
  label: string;
}
export interface FilterGroup {
  id: string;
  label: string;
  options: FilterOption[];
}

/** The filter taxonomy rendered in the Recipes tab. */
export const FILTER_GROUPS: FilterGroup[] = [
  {
    id: "meal",
    label: "Meal",
    options: [
      { id: "all", label: "All" },
      { id: "breakfast", label: "Breakfast" },
      { id: "lunch", label: "Lunch" },
      { id: "dinner", label: "Dinner" },
      { id: "snack", label: "Snack" },
      { id: "baking", label: "Baking" },
      { id: "dessert", label: "Dessert" },
    ],
  },
  {
    id: "diet",
    label: "Diet & allergies",
    options: [
      { id: "vegan", label: "Vegan" },
      { id: "vegetarian", label: "Vegetarian" },
      { id: "gluten-free", label: "Gluten-free" },
      { id: "dairy-free", label: "Dairy-free" },
      { id: "egg-free", label: "Egg-free" },
      { id: "nut-free", label: "Nut-free" },
      { id: "soy-free", label: "Soy-free" },
    ],
  },
  {
    id: "protein",
    label: "Protein",
    options: [
      { id: "chicken", label: "Chicken" },
      { id: "beef", label: "Beef & lamb" },
      { id: "pork", label: "Pork" },
      { id: "seafood", label: "Seafood" },
      { id: "eggs", label: "Eggs" },
      { id: "legumes", label: "Legumes" },
      { id: "tofu-tempeh", label: "Tofu & tempeh" },
      { id: "nuts-seeds", label: "Nuts & seeds" },
      { id: "grains", label: "Grains" },
    ],
  },
  {
    id: "occasion",
    label: "Who it's for",
    options: [
      { id: "kid-friendly", label: "Kid-friendly" },
      { id: "lunchbox", label: "Lunchbox" },
      { id: "freezer-friendly", label: "Freezes well" },
      { id: "quick", label: "Quick (≤20 min)" },
      { id: "one-pot", label: "One-pot" },
      { id: "meal-prep", label: "Meal-prep" },
    ],
  },
  {
    id: "style",
    label: "Style",
    options: [
      { id: "smoothie", label: "Smoothie" },
      { id: "tcm", label: "TCM" },
      { id: "ayurveda", label: "Ayurveda" },
    ],
  },
  {
    id: "nutrition",
    label: "Nutrition",
    options: [
      { id: "high-protein", label: "High protein" },
      { id: "high-fibre", label: "High fibre" },
      { id: "iron-rich", label: "Iron-rich" },
      { id: "magnesium-rich", label: "Magnesium-rich" },
      { id: "omega-3", label: "Omega-3" },
    ],
  },
];

/* ── Detection helpers ─────────────────────────────────────────────── */

const GLUTEN_SOURCE =
  /\b(wheat|wholemeal|whole wheat|flour|bread|breadcrumbs?|pasta|spaghetti|macaroni|noodles?|udon|ramen|couscous|barley|rye|bulgur|farro|seitan|panko|tortillas?|wraps?|pita|pastry|filo|phyllo|crackers?|soy sauce|teriyaki|hoisin|semolina|spelt|bagels?|crumpets?|scones?|muffins?|loaf|cake|biscuits?|cookies?|granola|muesli|oats?|pikelets?|pancakes?|waffles?|pizza|sausage rolls?)\b/;
/**
 * "gluten-free flour" names its own exemption, so the whole phrase has to go
 * before the gluten scan — otherwise the trailing "flour" re-adds wheat.
 */
const GLUTEN_FREE_PHRASE = /\bgluten[- ]free(\s+\w+)?/g;

const SOY_SOURCE = /\b(soy|soya|tofu|tempeh|edamame|miso|tamari|soy sauce|silken tofu|firm tofu)\b/;
const SOY_SAFE = /\b(soy[- ]free|coconut aminos)\b/g;

const EGG_SOURCE = /\b(eggs?|yolks?|egg whites?|omelette|frittata|meringue|mayo|mayonnaise|aioli|custard)\b/;
const EGG_SAFE = /\b(flax|chia|aquafaba)\s+eggs?\b|\begg[- ]free\b|\begg replacer\b/g;

const DAIRY_SOURCE = /\b(milk|cheese|cheddar|butter|cream|yoghurt|yogurt|ghee|paneer|feta|parmesan|halloumi|ricotta|mozzarella|labneh|kefir|whey|buttermilk|quark|mascarpone|brie|camembert|gouda|pecorino|tzatziki)\b/;
const DAIRY_SAFE = /\b(coconut|oat|almond|soy|soya|rice|cashew|hemp|pea|nut|plant|dairy[- ]free|vegan|non[- ]dairy)\s+(milk|cream|yoghurt|yogurt|cheese|butter|feta|parmesan|sour cream)\b|\b(peanut|almond|cashew|nut|seed|sunflower|cocoa|cacao|apple|bean|vegan|plant)\s+butter\b|\bbutter\s?(beans?|nut)\b|\bnutritional yeast\b|\bcream of tartar\b/g;

const SMOOTHIE = /\bsmoothie\b|\bshake\b|\bblend(ed)? (until|to)\b/;
const TCM = /\b(tcm|traditional chinese|chinese medicine|qi|chi|spleen|damp(ness)?|warming stew|moxa|acupressure|five[- ]element)\b/;
const AYURVEDA = /\b(ayurveda|ayurvedic|dosha|vata|pitta|kapha|kitchari|ghee|tridoshic|agni)\b/;

/* ── Protein sources ──────────────────────────────────────────────────
 * Signal is plant-forward but not vegetarian-only: the library carries chicken,
 * beef, lamb, pork and seafood dishes, so the protein filter has to cover them
 * or a member looking for "something with chicken" is stuck.
 *
 * Bare "mince" and "sausage" are deliberately absent — both are ambiguous
 * ("chicken mince", "beef sausage"), and the qualified forms match the specific
 * rule anyway.
 */
const CHICKEN = /\b(chicken|turkey|poultry)\b/;
const BEEF = /\b(beef|steak|lamb|veal|mutton|brisket|oxtail)\b/;
const PORK = /\b(pork|bacon|ham|chorizo|prosciutto|pancetta|salami|gammon)\b/;
/** "fish sauce" is seasoning, not protein, so it is not listed here. */
const SEAFOOD =
  /\b(fish|salmon|tuna|sardines?|mackerel|cod|snapper|hoki|tarakihi|trout|anchov(y|ies)|prawns?|shrimps?|scallops?|mussels?|squid|calamari|oysters?|crab|lobster|seafood)\b/;
const PROTEIN_EGG = /\b(eggs?|yolks?|omelette|frittata|quiche)\b/;
/** Phrases that look like egg but aren't. */
const EGG_FREE_SAFE = /\b(flax|chia|aquafaba)\s+eggs?\b|\beggplant\b|\begg[- ]free\b|\begg replacer\b/g;

/** Pulses only — tofu and tempeh have their own filter. */
const LEGUME = /\b(lentils?|chickpeas?|black beans?|kidney beans?|cannellini|butter beans?|haricot|pinto beans?|split peas?|dhal|dal|daal|hummus|falafel|peas?)\b/;
const TOFU_TEMPEH = /\b(tofu|tempeh|edamame|natto|seitan)\b/;
const NUTS_SEEDS = /\b(almonds?|cashews?|walnuts?|pecans?|hazelnuts?|pistachios?|macadamias?|brazil nuts?|pine nuts?|peanuts?|sesame|tahini|sunflower|pumpkin seeds?|chia|flax|hemp|seeds?|nut butter)\b/;
const GRAINS = /\b(rice|quinoa|brown rice|basmati|oats?|barley|buckwheat|millet|couscous|bulgur|pasta|noodles?|bread|wholemeal|polenta|cornmeal|spelt|wheat)\b/;

/**
 * Which rule backs which protein tag — used by the catalog tests to explain a
 * tag, and deliberately declared after every pattern it references.
 */
export const PROTEIN_MATCHERS: Record<string, RegExp> = {
  chicken: CHICKEN,
  beef: BEEF,
  pork: PORK,
  seafood: SEAFOOD,
  eggs: PROTEIN_EGG,
  legumes: LEGUME,
  "tofu-tempeh": TOFU_TEMPEH,
  "nuts-seeds": NUTS_SEEDS,
  grains: GRAINS,
};

const HIGH_PROTEIN = /\b(lentils?|chickpeas?|beans?|tofu|tempeh|edamame|seitan|nutritional yeast|peanut butter|almonds?|cashews?|pumpkin seeds?|hemp|protein powder)\b/;
const HIGH_FIBRE = /\b(lentils?|chickpeas?|beans?|oats?|barley|quinoa|wholemeal|brown rice|broccoli|spinach|kale|carrot|pumpkin|kumara|sweet potato|peas?|berries|apple|pear|chia|flax)\b/;
const IRON_RICH = /\b(spinach|kale|lentils?|chickpeas?|beans?|tofu|tempeh|pumpkin seeds?|sesame|tahini|quinoa|oats?|dried apricots?|figs?|cashews?|broccoli|molasses|dark chocolate)\b/;
const MAGNESIUM_RICH = /\b(spinach|kale|lentils?|chickpeas?|beans?|almonds?|cashews?|pumpkin seeds?|sunflower|sesame|tahini|oats?|quinoa|brown rice|dark chocolate|cacao|avocado|banana|tofu)\b/;
const OMEGA3 = /\b(flax|flaxseed|chia|hemp|walnuts?|walnut oil|edamame|omega[- ]?3|algae oil|salmon|tuna|sardines?|mackerel)\b/;

/**
 * How many ingredient lines mention a nutrient source.
 *
 * A single match is not a claim: nearly every Signal recipe has *an* oat or *a*
 * carrot in it, so "high fibre" would match three quarters of the catalog and
 * filter nothing. Requiring several distinct sources keeps these tags honest.
 */
function sourceCount(ingredients: string[], re: RegExp): number {
  const flags = re.flags.includes("g") ? re.flags : `${re.flags}g`;
  const global = new RegExp(re.source, flags);
  let n = 0;
  for (const line of ingredients) {
    global.lastIndex = 0;
    if (global.test(line)) n++;
  }
  return n;
}


const ONE_POT = /\b(one[- ]pot|one[- ]pan|single pot|slow[- ]cooker|slow cooker|casserole dish|skillet)\b/;
const MEAL_PREP = /\b(make[- ]ahead|meal prep|batch|keeps? (for )?\d|store in (an )?airtight|freeze[sd]? (well|for))\b/;

const KID_WORDS = /\b(kid|kids|child|children|toddler|family|little ones|school)\b/;

function stripAll(text: string, ...safes: RegExp[]): string {
  let t = text.toLowerCase();
  for (const re of safes) t = t.replace(re, " ");
  return t;
}

/**
 * Compute every tag that applies to a recipe. Conservative: a tag is only
 * included when the recipe's own content supports it.
 */
export function computeTags(input: FacetInput & { kidContext?: boolean }): RecipeTag[] {
  const facets = getFacets(input);
  const name = input.name.toLowerCase();
  const allText = `${input.name} ${input.ingredients.join(" ")} ${(input.method ?? []).join(" ")}`.toLowerCase();
  const tagsLower = new Set((input.tags ?? []).map((t) => t.toLowerCase()));
  const out = new Set<RecipeTag>();

  /* meal / category */
  const cat = String(input.category ?? "").toLowerCase();
  const mealTypes = (input.mealType ?? []).map((m) => m.toLowerCase());
  const mealSet = new Set([cat, ...mealTypes].filter(Boolean));
  for (const m of ["breakfast", "lunch", "dinner", "snack", "baking", "dessert"] as const) {
    if (mealSet.has(m)) out.add(m);
  }
  if (mealSet.has("meal")) out.add("dinner");

  /* diet & allergens */
  if (facets.vegan) out.add("vegan");
  if (facets.vegetarian) out.add("vegetarian");

  const allergenText = stripAll(input.ingredients.join(" "), DAIRY_SAFE);
  if (!DAIRY_SOURCE.test(allergenText)) out.add("dairy-free");

  const eggText = stripAll(allText, EGG_SAFE);
  if (!EGG_SOURCE.test(eggText)) out.add("egg-free");

  const glutenText = stripAll(allText, GLUTEN_FREE_PHRASE);
  if (!GLUTEN_SOURCE.test(glutenText)) out.add("gluten-free");

  if (facets.nutFree) out.add("nut-free");

  const soyText = stripAll(allText, SOY_SAFE);
  if (!SOY_SOURCE.test(soyText)) out.add("soy-free");

  /* protein sources
   *
   * Animal protein is read from the shopping list only. Names and methods lie:
   * "Cauliflower Steak" contains no steak, "chickpea 'tuna'" contains no tuna,
   * and "fish out the bay leaves" is a verb. The ingredient list is the one
   * place a meat has to be named to actually be used. Lines flagged "optional"
   * are serving suggestions ("Optional: smoked salmon"), so they are dropped
   * too — otherwise every adaptable salad reads as seafood.
   */
  const ingredients = input.ingredients ?? [];
  const shoppingList = ingredients
    .filter((line) => !/^\s*optional\b|\(optional\)/i.test(line))
    .join(" ")
    .toLowerCase();

  if (CHICKEN.test(shoppingList)) out.add("chicken");
  if (BEEF.test(shoppingList)) out.add("beef");
  if (PORK.test(shoppingList)) out.add("pork");
  if (SEAFOOD.test(shoppingList)) out.add("seafood");
  if (PROTEIN_EGG.test(stripAll(shoppingList, EGG_FREE_SAFE))) out.add("eggs");
  if (LEGUME.test(allText)) out.add("legumes");
  if (TOFU_TEMPEH.test(allText)) out.add("tofu-tempeh");
  if (NUTS_SEEDS.test(allText)) out.add("nuts-seeds");
  if (GRAINS.test(allText)) out.add("grains");

  /* occasion */
  if (input.kidContext || KID_WORDS.test(allText) || tagsLower.has("kid-friendly") || tagsLower.has("kids")) {
    out.add("kid-friendly");
  }
  if (facets.schoolLunch || tagsLower.has("lunchbox") || tagsLower.has("portable")) out.add("lunchbox");
  if (facets.freezer || tagsLower.has("freezer") || tagsLower.has("freezer-friendly")) out.add("freezer-friendly");
  if (facets.quick) out.add("quick");
  if (ONE_POT.test(allText)) out.add("one-pot");
  if (facets.makeAhead || MEAL_PREP.test(allText)) out.add("meal-prep");

  /* style / tradition */
  if (SMOOTHIE.test(name) && /blend/.test(allText)) out.add("smoothie");
  if (TCM.test(allText) || tagsLower.has("tcm")) out.add("tcm");
  if (AYURVEDA.test(allText) || tagsLower.has("ayurveda") || tagsLower.has("ayurvedic")) out.add("ayurveda");

  /* nutrition — needs several distinct sources, see `sourceCount` */
  if (sourceCount(ingredients, HIGH_PROTEIN) >= 2) out.add("high-protein");
  if (sourceCount(ingredients, HIGH_FIBRE) >= 3) out.add("high-fibre");
  if (sourceCount(ingredients, IRON_RICH) >= 2) out.add("iron-rich");
  if (sourceCount(ingredients, MAGNESIUM_RICH) >= 3) out.add("magnesium-rich");
  if (sourceCount(ingredients, OMEGA3) >= 1) out.add("omega-3");

  return [...out];
}

/** Memoised by recipe id. */
const tagCache = new Map<string, RecipeTag[]>();
export function tagsFor(id: string, input: FacetInput & { kidContext?: boolean }): RecipeTag[] {
  let t = tagCache.get(id);
  if (!t) {
    t = computeTags(input);
    tagCache.set(id, t);
  }
  return t;
}
