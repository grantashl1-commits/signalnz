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
];

// Default fallback
const DEFAULT_ILLUSTRATION = "/images/recipes/meals/nourish-buddha-bowl.png";

/**
 * Given a meal/recipe name, return the path to the best matching
 * category-level hand-drawn illustration.
 */
export function getCategoryIllustration(name: string): string {
  const lower = name.toLowerCase();

  // Try more-specific multi-word matches first, then single-word
  for (const cat of CATEGORY_ILLUSTRATIONS) {
    for (const kw of cat.keywords) {
      if (lower.includes(kw)) return cat.image;
    }
  }

  return DEFAULT_ILLUSTRATION;
}
