/**
 * Category-level illustration mapper.
 * Maps any meal/recipe name to one of the existing hand-drawn PNG illustrations,
 * ensuring visual consistency across all recipe cards.
 */

const CATEGORY_ILLUSTRATIONS: { keywords: string[]; image: string }[] = [
  {
    keywords: ["oat", "porridge", "muesli", "granola", "bircher", "overnight"],
    image: "/images/recipes/meals/peanut-butter-maple-overnight-oats.png",
  },
  {
    keywords: ["chia", "pudding"],
    image: "/images/recipes/meals/everyday-chia-pudding.png",
  },
  {
    keywords: ["smoothie", "shake"],
    image: "/images/recipes/meals/coconut-berry-smoothie.png",
  },
  {
    keywords: ["smoothie bowl", "acai", "iron power"],
    image: "/images/recipes/meals/iron-power-smoothie-bowl.png",
  },
  {
    keywords: ["soup"],
    image: "/images/recipes/meals/turmeric-lentil-soup.png",
  },
  {
    keywords: ["dhal", "dal", "daal"],
    image: "/images/recipes/meals/warming-lentil-dhal.png",
  },
  {
    keywords: ["curry", "tikka", "masala", "thai curry"],
    image: "/images/recipes/meals/chickpea-spinach-curry.png",
  },
  {
    keywords: ["stir fry", "stir-fry", "wok"],
    image: "/images/recipes/meals/ginger-tempeh-stir-fry.png",
  },
  {
    keywords: ["salad"],
    image: "/images/recipes/meals/big-leafy-salad-seeds.png",
  },
  {
    keywords: ["wrap", "burrito"],
    image: "/images/recipes/meals/falafel-sauerkraut-wrap.png",
  },
  {
    keywords: ["taco", "fajita", "mexican"],
    image: "/images/recipes/meals/chimichurri-black-bean-tacos.png",
  },
  {
    keywords: ["sushi", "rice paper", "roll"],
    image: "/images/recipes/meals/rainbow-sushi-bowl.png",
  },
  {
    keywords: ["pasta", "lasagne", "lasagna", "noodle", "soba", "pad thai"],
    image: "/images/recipes/meals/chickpea-pumpkin-pasta.png",
  },
  {
    keywords: ["risotto", "rice"],
    image: "/images/recipes/meals/creamy-mushroom-risotto.png",
  },
  {
    keywords: ["bowl", "buddha", "nourish", "power bowl", "grain bowl", "macro"],
    image: "/images/recipes/meals/nourish-buddha-bowl.png",
  },
  {
    keywords: ["pizza", "flatbread"],
    image: "/images/recipes/meals/gluten-free-vegan-pizza.png",
  },
  {
    keywords: ["fritter", "patties", "pattie", "cake"],
    image: "/images/recipes/meals/green-pea-fritters.png",
  },
  {
    keywords: ["sandwich", "toast", "bread"],
    image: "/images/recipes/meals/buckwheat-bread-smashed-avocado.png",
  },
  {
    keywords: ["scramble", "tofu scramble", "egg"],
    image: "/images/recipes/meals/scrambled-tofu-vegetables.png",
  },
  {
    keywords: ["chilli", "chili", "stew", "casserole"],
    image: "/images/recipes/meals/pumpkin-kale-chilli.png",
  },
  {
    keywords: ["pie", "shepherd", "cottage"],
    image: "/images/recipes/meals/lentil-shepherds-pie.png",
  },
  {
    keywords: ["nachos", "loaded"],
    image: "/images/recipes/meals/healthy-nachos.png",
  },
  {
    keywords: ["nice cream", "ice cream", "mousse", "dessert"],
    image: "/images/recipes/meals/chocolate-banana-nice-cream.png",
  },
  {
    keywords: ["bliss ball", "energy ball", "protein ball", "bar", "energy bar", "snack ball"],
    image: "/images/recipes/meals/date-cacao-coconut-bliss-balls.png",
  },
  {
    keywords: ["falafel"],
    image: "/images/recipes/meals/falafel-quinoa-bowl-avocado.png",
  },
  {
    keywords: ["bake", "roast", "sheet pan", "one pan", "tray"],
    image: "/images/recipes/meals/sheet-pan-roasted-spring-veggies.png",
  },
  {
    keywords: ["pancake", "waffle", "crepe"],
    image: "/images/recipes/baking/banana-cinnamon-pancakes.png",
  },
  {
    keywords: ["cookie", "biscuit"],
    image: "/images/recipes/baking/chocolate-chip-chickpea-cookies.png",
  },
  {
    keywords: ["chocolate", "choc", "fudge", "brownie"],
    image: "/images/recipes/baking/chocolate-fudge.png",
  },
  {
    keywords: ["muffin", "loaf", "banana bread", "zucchini bread"],
    image: "/images/recipes/meals/chocolate-chip-banana-zucchini-bread.png",
  },
  {
    keywords: ["slice", "caramel"],
    image: "/images/recipes/baking/healthy-caramel-slice.png",
  },
  {
    keywords: ["lentil"],
    image: "/images/recipes/meals/colourful-lentil-salad-bowl.png",
  },
  {
    keywords: ["tofu", "miso", "tempeh"],
    image: "/images/recipes/meals/miso-tofu-soba-bowl.png",
  },
  {
    keywords: ["chickpea", "bean", "legume"],
    image: "/images/recipes/meals/chickpea-spinach-curry.png",
  },
  {
    keywords: ["sweet potato", "pumpkin", "potato"],
    image: "/images/recipes/meals/hummus-sweet-potato-bowl.png",
  },
  {
    keywords: ["quinoa", "tabbouleh"],
    image: "/images/recipes/meals/quinoa-tabbouleh.png",
  },
  // ── Meat & burger fallbacks (matched after more specific keywords above) ──
  {
    keywords: ["burger", "rissole", "patty", "smash"],
    image: "/images/recipes/meals/kids-atk-smash-burgers.png",
  },
  {
    keywords: ["roast chicken", "chicken thigh", "chicken breast", "chicken"],
    image: "/images/recipes/meals/roast-chicken-roasted-veg.png",
  },
  {
    keywords: ["fish pie"],
    image: "/images/recipes/meals/kids-sp-fish-pie.png",
  },
  {
    keywords: ["lamb kofta", "lamb cutlet", "lamb chop", "lamb"],
    image: "/images/recipes/meals/kids-hp-lamb-kofta.png",
  },
  {
    keywords: ["pulled pork", "san choy bau", "pork"],
    image: "/images/recipes/meals/kids-hp-pork-san-choy-bau.png",
  },
  {
    keywords: ["meatball", "beef stroganoff", "beef stew", "beef mince", "beef"],
    image: "/images/recipes/meals/kids-beef-meatballs.png",
  },
  {
    keywords: ["dumpling", "san choy"],
    image: "/images/recipes/meals/kids-pork-stir-fry.png",
  },
];

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

// Default fallback
const DEFAULT_ILLUSTRATION = "/images/recipes/meals/nourish-buddha-bowl.png";

/**
 * Given a meal/recipe name, return the path to the best matching
 * category-level hand-drawn illustration.
 */
/**
 * Given a meal/recipe name (or id), return the path to the best matching illustration.
 * TCM/Ayurveda recipes have dedicated illustrations; others use keyword matching.
 */
export function getCategoryIllustration(name: string, id?: string): string {
  // Check for dedicated TCM/Ayurveda illustration by recipe id
  if (id && TCM_AYURVEDA_ILLUSTRATIONS[id]) {
    return TCM_AYURVEDA_ILLUSTRATIONS[id];
  }

  const lower = name.toLowerCase();

  // Try more-specific multi-word matches first, then single-word
  for (const cat of CATEGORY_ILLUSTRATIONS) {
    for (const kw of cat.keywords) {
      if (lower.includes(kw)) return cat.image;
    }
  }

  return DEFAULT_ILLUSTRATION;
}
