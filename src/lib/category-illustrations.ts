import RECIPE_IMAGE_FILES from "@/data/recipe-image-files.json";
/**
 * Picks the illustration for a recipe that names none of its own.
 *
 * Order: a drawing made for this dish (by id, then by title), then a stand-in of
 * the same kind of dish (any soup for a soup, any muffin for a muffins recipe),
 * then nothing, so the card shows a neutral placeholder. A picture of a
 * different dish is never shown: muffins don't get pancakes, a pancake doesn't
 * get a smoothie because it has berries in it.
 */

const M = "/images/recipes/meals/";
const B = "/images/recipes/baking/";

/**
 * Kinds of dish, each with the words that name it and a stand-in drawing.
 * Words match whole words, singular or plural. When a title names several,
 * the main one wins (see dishForm). A kind with no stand-in (image null) still
 * stops a different dish's drawing being matched to it.
 */
const DISH_FORMS: { form: string; words: string[]; image: string | null }[] = [
  { form: "smoothie bowl", words: ["smoothie bowl", "acai bowl", "açaí bowl"], image: M + "iron-power-smoothie-bowl.png" },
  { form: "smoothie", words: ["smoothie", "shake", "milkshake", "lassi", "frappe"], image: M + "coconut-berry-smoothie.png" },
  { form: "hot drink", words: ["latte", "golden milk", "hot chocolate", "hot cacao", "cocoa", "chai", "tea", "tonic", "elixir"], image: M + "signal-adaptogen-hot-cacao.png" },
  { form: "chia pudding", words: ["chia pudding", "chia pot", "chia parfait", "chia jam"], image: M + "mixed-berry-chia-pudding.png" },
  { form: "yoghurt", words: ["yoghurt", "yogurt", "parfait"], image: M + "greek-yoghurt-berries.png" },
  { form: "granola", words: ["granola", "muesli", "bircher"], image: M + "bircher-muesli-apple.png" },
  { form: "porridge", words: ["porridge", "oats", "oatmeal", "overnight oats", "baked oats"], image: "/images/recipes/spiced-porridge-with-dates-and-almonds.png" },
  { form: "congee", words: ["congee", "jook", "rice porridge"], image: M + "warming-ginger-congee.png" },
  { form: "pancake", words: ["pancake", "pikelet", "hotcake", "blini"], image: B + "banana-cinnamon-pancakes.png" },
  { form: "waffle", words: ["waffle"], image: M + "buckwheat-waffles-berries.png" },
  { form: "muffin", words: ["muffin", "cupcake"], image: "/images/recipes/matthew-kids/Mini Blueberry Muffins.png" },
  { form: "cookie", words: ["cookie", "biscuit", "shortbread"], image: B + "chocolate-chip-chickpea-cookies.png" },
  { form: "bar", words: ["bar", "square", "flapjack", "brownie", "blondie", "fudge"], image: B + "healthy-caramel-slice.png" },
  { form: "bliss ball", words: ["bliss ball", "energy ball", "protein ball", "bliss bite", "energy bite", "truffle", "cookie dough"], image: M + "date-cacao-coconut-bliss-balls.png" },
  { form: "cake", words: ["cake", "banana bread", "zucchini bread", "courgette bread", "banana loaf", "chocolate loaf", "lemon loaf", "date loaf", "fruit loaf", "tea loaf"], image: B + "easy-banana-cake.png" },
  { form: "dessert", words: ["nice cream", "ice cream", "mousse", "sorbet"], image: M + "chocolate-banana-nice-cream.png" },
  { form: "crumble", words: ["crumble", "cobbler", "fruit crisp", "apple crisp"], image: M + "signal-autumn-crumble.png" },
  { form: "pudding", words: ["pudding"], image: "/images/recipes/plant-based-family/warm-sticky-date-and-toffee-pudding.png" },
  { form: "soup", words: ["soup", "broth", "chowder", "minestrone", "bisque"], image: M + "turmeric-lentil-soup.png" },
  { form: "ramen", words: ["ramen", "laksa", "pho"], image: M + "signal-warming-miso-ramen.png" },
  { form: "dhal", words: ["dhal", "dal", "daal", "dahl"], image: M + "warming-lentil-dhal.png" },
  { form: "green curry", words: ["green curry"], image: M + "tofu-thai-green-curry.png" },
  { form: "curry", words: ["curry", "korma", "tikka", "masala", "sabzi", "rendang", "vindaloo"], image: M + "chickpea-spinach-curry.png" },
  { form: "tagine", words: ["tagine"], image: "/images/recipes/plant-based-family/moroccan-spiced-vegetable-tagine.png" },
  { form: "stroganoff", words: ["stroganoff"], image: "/images/recipes/plant-based-family/creamy-mushroom-stroganoff.png" },
  { form: "stew", words: ["stew", "chilli", "chili", "casserole", "goulash", "hotpot"], image: M + "p15-butternut-lentil-stew.png" },
  { form: "stir-fry", words: ["stir fry", "stir-fry", "stirfry", "wok"], image: M + "ginger-tempeh-stir-fry.png" },
  { form: "salad", words: ["salad", "slaw", "tabbouleh", "toss"], image: "/images/recipes/big-leafy-salad-with-seeds-and-tahini.png" },
  { form: "taco", words: ["taco", "fajita", "enchilada", "quesadilla"], image: M + "chimichurri-black-bean-tacos.png" },
  { form: "wrap", words: ["wrap", "burrito", "flatbread", "pita", "pitta"], image: M + "falafel-sauerkraut-wrap.png" },
  { form: "nachos", words: ["nachos"], image: M + "healthy-nachos.png" },
  { form: "pizza", words: ["pizza"], image: M + "gluten-free-vegan-pizza.png" },
  { form: "sushi", words: ["sushi", "nori roll", "rice paper roll", "hand roll"], image: M + "avocado-mango-sushi.png" },
  { form: "burger", words: ["burger", "slider"], image: M + "kids-atk-smash-burgers.png" },
  { form: "meatball", words: ["meatball"], image: M + "kids-beef-meatballs.png" },
  { form: "falafel", words: ["falafel"], image: M + "falafel-quinoa-bowl-avocado.png" },
  { form: "fritter", words: ["fritter", "patty", "patties", "rissole", "fish cake", "croquette", "rosti", "hash brown", "potato pancake", "latke"], image: M + "green-pea-fritters.png" },
  { form: "kofta", words: ["kofta", "kebab", "skewer", "souvlaki"], image: M + "kids-hp-lamb-kofta.png" },
  { form: "san choy bau", words: ["san choy bau", "lettuce cup", "lettuce wrap"], image: M + "kids-hp-pork-san-choy-bau.png" },
  { form: "pasta", words: ["pasta", "spaghetti", "linguine", "penne", "fusilli", "lasagne", "lasagna", "macaroni", "mac and cheese", "gnocchi", "cannelloni", "bolognese"], image: M + "chickpea-pumpkin-pasta.png" },
  { form: "pad thai", words: ["pad thai"], image: "/images/recipes/plant-based-family/family-favourite-vegetable-pad-thai.png" },
  { form: "noodles", words: ["noodle", "soba", "udon", "zoodle"], image: M + "p15-soba-noodle-edamame.png" },
  { form: "fried rice", words: ["fried rice", "fried brown rice", "nasi goreng"], image: M + "fried-rice-bowl.png" },
  { form: "risotto", words: ["risotto", "pilaf", "paella", "biryani"], image: M + "creamy-mushroom-risotto.png" },
  { form: "frittata", words: ["frittata", "quiche", "egg muffin", "egg bake"], image: M + "roasted-veg-frittata.png" },
  { form: "omelette", words: ["omelette", "omelet"], image: M + "egg-spinach-omelette.png" },
  { form: "scramble", words: ["scramble", "scrambled egg"], image: M + "scrambled-tofu-vegetables.png" },
  { form: "pie", words: ["shepherd's pie", "shepherds pie", "cottage pie", "pot pie", "lentil pie"], image: M + "lentil-shepherds-pie.png" },
  { form: "french toast", words: ["french toast"], image: null },
  { form: "sandwich", words: ["sandwich", "toastie", "toasted sandwich"], image: "/images/recipes/matthew-kids/Cinnamon Raisin Peanut Butter and Jelly.png" },
  { form: "toast", words: ["toast", "bruschetta", "bagel", "crostini"], image: M + "buckwheat-bread-smashed-avocado.png" },
  { form: "traybake", words: ["traybake", "tray bake", "sheet pan", "sheet-pan"], image: M + "sheet-pan-roasted-spring-veggies.png" },
  { form: "dip", words: ["chutney", "dip", "hummus", "salsa", "raita", "guacamole", "dressing", "spread"], image: null },
  { form: "bowl", words: ["bowl", "buddha bowl", "grain bowl", "power bowl", "burrito bowl", "taco bowl"], image: M + "signal-spring-grain-bowl.png" },
];

const STOP = new Set(["with", "and", "the", "for", "your", "from", "style"]);
function titleSlug(s: string): string {
  return s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function tokens(s: string): string[] {
  return titleSlug(s).split("-").filter((t) => t.length > 2 && !STOP.has(t));
}

const FORM_PATTERNS = DISH_FORMS.flatMap((d) =>
  d.words.map((w) => ({ form: d, re: new RegExp("(?:^| )" + titleSlug(w).replace(/-/g, " ") + "(?:e?s)?(?= |$)", "g") })),
);

function matches(text: string) {
  return FORM_PATTERNS.flatMap(({ form, re }) =>
    [...text.matchAll(re)].map((m) => ({ form: form.form, word: m[0].trim(), end: (m.index ?? 0) + m[0].length, len: m[0].length })),
  );
}
const spaced = (s: string) => titleSlug(s).replace(/-/g, " ");
const byEnd = <T extends { end: number; len: number }>(a: T, b: T) => b.end - a.end || b.len - a.len;

/** Shape and serving words that end a title without naming the dish ("Chia Pudding Layers"). */
const TRAILING = /(?: (?:layers|pots|cups|jars|nests|stacks|parcels|boats|fingers|rounds|pieces|bites|sticks|platter|board))+$/;
/** Words that name a dish only as its last word: "Pumpkin Chilli" is chilli, "Chilli Lime Popcorn" isn't. */
const FLAVOURS = new Set(["chilli", "chili", "curry", "masala", "tikka", "yoghurt", "yogurt", "tea", "chai", "cocoa", "salsa"]);
/** What a bowl can hold: "Yoghurt Fruit Bowl" is yoghurt, "Rice Bowl" stays a bowl. */
const BOWL_FILLINGS = new Set(["yoghurt", "porridge", "granola", "congee", "salad", "soup", "ramen", "curry", "green curry", "dhal", "stew", "noodles", "pad thai", "fried rice", "risotto", "chia pudding", "smoothie bowl"]);

/**
 * The kind of dish a title names, read from the part before "with" / "in" /
 * "served": its last word ("Oat Cookies" is cookies, "Mushrooms on Toast"
 * is toast), else its last dish word that isn't just a flavour ("Pasta Bake" is
 * pasta, "Smoked Chilli Lime Popcorn" is no kind we draw), else pasta or noodles
 * named at the very end ("... with Chickpea Penne"). Ties go to the longer phrase.
 */
export function dishForm(title: string): string | null {
  const head = spaced(title).split(/ (?:with|in|served|plus|topped) /)[0].replace(TRAILING, "");
  const found = matches(head).sort(byEnd);
  const last = found.find((m) => m.end === head.length) ?? found.find((m) => !FLAVOURS.has(m.word.replace(/e?s$/, "")));
  if (last?.form === "bowl") return found.find((m) => BOWL_FILLINGS.has(m.form))?.form ?? "bowl";
  if (last) return last.form;
  const full = spaced(title);
  const tail = matches(full).filter((m) => m.end === full.length && (m.form === "pasta" || m.form === "noodles"));
  return tail[0]?.form ?? null;
}

/** Every kind a file name mentions anywhere: file names drop the "with". */
function formsIn(name: string): Set<string> {
  return new Set(matches(spaced(name)).map((m) => m.form));
}

/**
 * The same dish drawn under another name (often its cookbook title), checked by
 * eye: "Summer Berry Meringues" is the cookbook's Summer Berry Vegan Meringue Nests.
 */
const LINKED_ART: Record<string, string> = {
  "beetroot-carrot-warming-sip": "/images/recipes/meals/beetroot-carrot-soup.png", // Beetroot and Carrot Warming Sip
  "cinnamon-baked-apple-with-ginger": "/images/recipes/plant-based-kids/Orange & Cinnamon Baked Apples.png", // Cinnamon Baked Apple with Ginger
  "cinnamon-buckwheat-seed-crunch": "/images/recipes/plant-based-family/toasted-cinnamon-and-pecan-crunch.png", // Cinnamon Buckwheat Seed Crunch
  "dinner-chickpea-shakshuka": "/images/recipes/meals/chickpea-shakshuka.png", // Chickpea Shakshuka with Crusty Bread
  "kids-bfast-egg-toast-soldiers": "/images/recipes/meals/pp-boiled-eggs.png", // Boiled Eggs with Toast Soldiers
  "kids-fok-mac-n-cheese": "/images/recipes/matthew-kids/Smoky Mac ‘n Cheese.png", // Mac 'n Cheese
  "kids-pbf-asparagus-potato-and-pea-open-tart": "/images/recipes/plant-based-family/spring-greens-and-potato-puff-tart.png", // Asparagus Potato and Pea Open Tart
  "kids-pbf-bao-buns-with-sticky-glazed-eggplant": "/images/recipes/plant-based-family/sticky-aubergine-bao-buns.png", // Bao Buns with Sticky Glazed Eggplant
  "kids-pbf-butter-bean-and-mushroom-bake": "/images/recipes/plant-based-family/creamy-mushroom-and-butter-bean-bake.png", // Butter Bean and Mushroom Bake
  "kids-pbf-caramel-mini-bites": "/images/recipes/plant-based-family/little-caramel-and-chocolate-squares.png", // Caramel Mini Bites
  "kids-pbf-chocolate-and-ginger-no-bake-tart": "/images/recipes/plant-based-family/no-bake-chocolate-ginger-tart.png", // Chocolate and Ginger No-Bake Tart
  "kids-pbf-herby-sausage-and-mediterranean-vegetable-bake": "/images/recipes/plant-based-family/herby-sausage-and-roast-vegetable-bake.png", // Herby Sausage and Mediterranean Vegetable Bake
  "kids-pbf-kale-leek-and-potato-pastries": "/images/recipes/plant-based-family/flaky-leek-potato-and-greens-parcels.png", // Kale Leek and Potato Pastries
  "kids-pbf-leek-pea-and-cheese-scones": "/images/recipes/plant-based-family/savoury-leek-pea-and-cheese-scones.png", // Leek Pea and Cheese Scones
  "kids-pbf-no-bake-lemon-cheesecake-with-blueberry-compote": "/images/recipes/plant-based-family/zesty-lemon-and-blueberry-cheesecake.png", // No-Bake Lemon Cheesecake with Blueberry Compote
  "kids-pbf-quick-chocolate-orange-pots": "/images/recipes/plant-based-family/chocolate-and-orange-dessert-pots.png", // Quick Chocolate Orange Pots
  "kids-pbf-roasted-golden-vegetables-with-harissa-cauliflower": "/images/recipes/plant-based-family/golden-roast-vegetables-and-spiced-cauliflower.png", // Roasted Golden Vegetables with Harissa Cauliflower
  "kids-pbf-savory-buckwheat-galettes": "/images/recipes/plant-based-family/buckwheat-and-rocket-brunch-galettes.png", // Savory Buckwheat Galettes
  "kids-pbf-spinach-cre-pes": "/images/recipes/plant-based-family/garden-green-savoury-crepes.png", // Spinach Crêpes
  "kids-pbf-sticky-smoked-barbecue-cauliflower-wings": "/images/recipes/plant-based-family/smoky-bbq-cauliflower-bites.png", // Sticky Smoked Barbecue Cauliflower Wings
  "kids-pbf-summer-berry-meringues": "/images/recipes/plant-based-family/summer-berry-vegan-meringue-nests.png", // Summer Berry Meringues
  "kids-pbf-sweet-chili-ginger-tofu-with-vegetable-rice": "/images/recipes/plant-based-kids/Vegetable & Tofu Fried Rice.png", // Sweet Chili Ginger Tofu with Vegetable Rice
  "kids-pbf-warming-jerk-jackfruit-with-pineapple-and-sweet-potato": "/images/recipes/plant-based-family/tropical-jackfruit-and-kumara-traybake.png", // Warming Jerk Jackfruit with Pineapple and Sweet Potato
  "kids-pbf-zucchini-and-pea-carbonara": "/images/recipes/plant-based-family/creamy-courgette-and-pea-pasta.png", // Zucchini and Pea Carbonara
  "kiwi-passion-chia-softness": "/images/recipes/meals/signal-tropical-chia-pudding.png", // Tropical Chia with Macadamia Crunch
  "layered-beans-and-eggs-with-avocado": "/images/recipes/meals/poached-eggs-avocado.png", // Layered Beans and Eggs with Avocado
  "lemon-rosemary-toasted-nuts": "/images/recipes/plant-based-family/toasted-cinnamon-and-pecan-crunch.png", // Lemon Rosemary Pecan Crunch
  "lentil-and-kumara-shepherdess-pie": "/images/recipes/nz-au-family/Kumara & Lentil Shepherd's Pie.png", // Lentil and Kūmara Shepherdess Pie
  "miso-glazed-tofu-and-greens-with-brown-rice": "/images/recipes/meals/miso-tofu-greens.png", // Miso-Glazed Tofu and Greens with Brown Rice
  "mushroom-ginger-chicken-with-greens": "/images/recipes/meals/chicken-mushroom-stirfry.png", // Mushroom & Ginger Chicken with Greens
  "smoked-chilli-lime-popcorn": "/images/recipes/meals/pp-chili-lime-popcorn.png", // Smoked Chilli Lime Popcorn
  "wild-blueberry-chia-crisp-with-yoghurt": "/images/recipes/meals/pp-blueberry-chia-crisp.png", // Wild Blueberry and Chia Seed Crisp with Oats
};

// TCM & Ayurveda recipe-specific illustrations
const TCM_AYURVEDA_ILLUSTRATIONS: Record<string, string> = {
  "tcm-ginger-congee": "/images/recipes/meals/warming-ginger-congee.png",
  "tcm-beetroot-carrot-soup": "/images/recipes/meals/beetroot-carrot-soup.png",
  "tcm-chicken-mushroom-stirfry": "/images/recipes/meals/chicken-mushroom-stirfry.png",
  "tcm-salmon-greens-with-goji": "/images/recipes/meals/salmon-greens-goji.png",
  "tcm-pumpkin-ginger-millet": "/images/recipes/meals/pumpkin-ginger-millet.png",
  "tcm-black-bean-kumara-salad": "/images/recipes/meals/black-bean-kumara-salad.png",
  "tcm-tofu-veggie-broth": "/images/recipes/meals/tofu-veggie-broth.png",
  "tcm-egg-spinach-omelette": "/images/recipes/meals/egg-spinach-omelette.png",
  "tcm-mung-bean-apple-dessert": "/images/recipes/meals/mung-bean-apple-dessert.png",
  "tcm-five-spice-lamb-stirfry": "/images/recipes/meals/five-spice-lamb-stirfry.png",
  "ayurveda-ginger-turmeric-oats": "/images/recipes/meals/ginger-turmeric-oats.png",
  "ayurveda-kitchari-follicular": "/images/recipes/meals/tridoshic-kitchari.png",
  "ayurveda-pitta-balancing-salad": "/images/recipes/meals/pitta-balancing-salad.png",
  "ayurveda-vata-pacifying-soup": "/images/recipes/meals/kumara-coconut-soup.png",
  "ayurveda-golden-milk": "/images/recipes/meals/golden-milk.png",
  "ayurveda-lentil-dahl-spinach": "/images/recipes/meals/lentil-dahl-spinach.png",
  "ayurveda-mint-coriander-chutney": "/images/recipes/meals/mint-coriander-chutney.png",
  "ayurveda-gourd-sabzi": "/images/recipes/meals/courgette-mung-sabzi.png",
  "ayurveda-cinnamon-apple-digestive": "/images/recipes/meals/cinnamon-apple-bake.png",
  "ayurveda-broccoli-ginger-stirfry": "/images/recipes/meals/broccoli-ginger-stirfry.png",
  "ayurveda-cucumber-raita": "/images/recipes/meals/cucumber-raita.png",
  "ayurveda-masoor-dal-soup": "/images/recipes/meals/masoor-dal-soup.png",
  "ayurveda-pumpkin-semolina-porridge": "/images/recipes/meals/pumpkin-semolina-porridge.png",
};

const FILES = RECIPE_IMAGE_FILES as Record<string, string>;
const PROTEINS = new Set(["chicken", "beef", "lamb", "pork", "salmon", "tuna", "fish", "prawn", "prawns", "shrimp", "tofu", "tempeh", "egg", "eggs", "turkey", "mince", "sausage", "bacon", "ham", "steak"]);
const FILE_TOKENS = Object.entries(FILES).map(([base, path]) => ({ path, toks: new Set(tokens(base)), forms: formsIn(base) }));

/** Find an illustration drawn for this specific dish: exact id or title match, then a close title of the same kind of dish. */
export function findRecipeImageByTitle(name: string, id?: string): string | null {
  const s = titleSlug(name);
  if (FILES[s]) return FILES[s];
  if (id && FILES[id]) return FILES[id];
  const t = tokens(name);
  if (!t.length) return null;
  const form = dishForm(name);
  let best: string | null = null;
  let bestScore = 0;
  for (const f of FILE_TOKENS) {
    if (!f.toks.size) continue;
    // "Banana Cinnamon Muffins" shares two words with banana-cinnamon-pancakes: a different dish.
    // "Bowl" says little about the dish: a bowl recipe may also match a salad or an unnamed kind, never a soup.
    if (form && !f.forms.has(form) && !(form === "bowl" && [...f.forms].every((k) => k === "bowl" || k === "salad"))) continue;
    // Nor may the picture show a protein the recipe doesn't have (salmon on a bean salad).
    if ([...f.toks].some((x) => PROTEINS.has(x) && !t.includes(x))) continue;
    const hit = t.filter((x) => f.toks.has(x)).length;
    // Must cover most of the title and most of the file name, so a picture never shows a different dish.
    const score = Math.min(hit / t.length, hit / f.toks.size);
    if (score > bestScore) { bestScore = score; best = f.path; }
  }
  return bestScore >= 0.6 ? best : null;
}

/** The recipe's own drawing, else a stand-in of the same kind of dish, else null (show a placeholder). */
export function getRecipeIllustration(name: string, id?: string): string | null {
  if (id && LINKED_ART[id]) return LINKED_ART[id];
  if (id && TCM_AYURVEDA_ILLUSTRATIONS[id]) return TCM_AYURVEDA_ILLUSTRATIONS[id];
  const own = findRecipeImageByTitle(name, id);
  if (own) return own;
  const form = dishForm(name);
  return DISH_FORMS.find((d) => d.form === form)?.image ?? null;
}
