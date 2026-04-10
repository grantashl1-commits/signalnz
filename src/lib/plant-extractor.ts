/**
 * Extracts plant-based ingredients from a recipe's ingredient list.
 * Used to auto-calculate the "30 plants a week" diversity goal.
 */

const PLANT_FOODS = new Set([
  // Vegetables
  "spinach", "kale", "broccoli", "cauliflower", "cabbage", "carrot", "capsicum",
  "pepper", "tomato", "onion", "garlic", "ginger", "potato", "sweet potato",
  "kumara", "pumpkin", "zucchini", "courgette", "eggplant", "aubergine",
  "asparagus", "celery", "leek", "spring onion", "mushroom", "beetroot",
  "cucumber", "lettuce", "rocket", "watercress", "bok choy", "pak choi",
  "corn", "peas", "green beans", "snow peas", "edamame", "artichoke",
  "fennel", "radish", "turnip", "parsnip", "celeriac", "avocado",

  // Fruits
  "apple", "banana", "blueberry", "blueberries", "raspberry", "raspberries",
  "strawberry", "strawberries", "mango", "pineapple", "orange", "lemon", "lime",
  "grapefruit", "kiwi", "kiwifruit", "pomegranate", "fig", "date", "dates",
  "cranberry", "cranberries", "cherry", "cherries", "grape", "grapes",
  "peach", "pear", "plum", "melon", "watermelon", "coconut", "passionfruit",
  "dragonfruit", "papaya", "goji", "acai",

  // Legumes
  "lentil", "lentils", "chickpea", "chickpeas", "black bean", "black beans",
  "kidney bean", "kidney beans", "cannellini", "butter bean", "lima bean",
  "navy bean", "pinto bean", "mung bean", "adzuki", "tempeh", "tofu",
  "soybean", "soybeans",

  // Grains & pseudograins
  "oats", "oat", "quinoa", "brown rice", "rice", "buckwheat", "millet",
  "amaranth", "barley", "spelt", "rye", "freekeh", "farro", "bulgur",
  "sorghum", "teff", "wild rice", "corn",

  // Nuts & seeds
  "almond", "almonds", "walnut", "walnuts", "cashew", "cashews",
  "pistachio", "pistachios", "pecan", "pecans", "hazelnut", "hazelnuts",
  "macadamia", "brazil nut", "pine nut", "pine nuts", "peanut", "peanuts",
  "chia", "chia seeds", "flaxseed", "flaxseeds", "linseed", "linseeds",
  "hemp seeds", "hemp", "sunflower seeds", "pumpkin seeds", "pepitas",
  "sesame", "sesame seeds", "tahini", "poppy seeds",

  // Herbs & spices (each counts as a plant)
  "basil", "coriander", "cilantro", "parsley", "mint", "dill", "thyme",
  "rosemary", "oregano", "sage", "chives", "tarragon", "bay leaf",
  "turmeric", "cumin", "cinnamon", "paprika", "cayenne", "nutmeg",
  "cardamom", "clove", "cloves", "star anise", "saffron", "vanilla",
  "lemongrass", "galangal",

  // Other plant foods
  "seaweed", "nori", "dulse", "kelp", "wakame", "spirulina",
  "cacao", "cocoa", "chocolate", "coffee", "tea", "matcha",
  "olive", "olives", "kimchi", "sauerkraut", "miso",
]);

/**
 * Given a list of ingredient strings, return unique plant names found.
 */
export function extractPlantsFromIngredients(ingredients: string[]): string[] {
  const found = new Set<string>();

  for (const ing of ingredients) {
    const lower = ing.toLowerCase();

    for (const plant of PLANT_FOODS) {
      if (lower.includes(plant)) {
        // Normalize to singular base form
        const base = plant.replace(/s$/, "").replace(/ies$/, "y");
        found.add(plant);
      }
    }
  }

  return Array.from(found);
}
