import { Recipe } from "./meal-plans";

/**
 * SIGNAL Family Recipe Library — Volume I
 *
 * NZ-friendly adaptations of the "Forks Over Knives Family" cookbook.
 * Ingredients are metric and repeated through the method so quantities
 * survive a screen read. Nutrition values are preliminary per-serving
 * estimates and are NOT yet verified against a NZ nutrient database.
 *
 * Images are a first illustration batch — thematic, watercolour-washed,
 * and only assigned where the dish depicted matches the recipe.
 */
export const SIGNAL_FAMILY_RECIPES: Recipe[] = [
  {
    id: "fok-nz-coconut-choc-pancakes",
    name: "Coconut & Choc Buckwheat Pancakes",
    phase: "follicular",
    serves: 4,
    prepTime: "30 min",
    keyNutrients: ["Iron", "Fibre", "Magnesium"],
    ingredients: [
      "1 tbsp ground flaxseed",
      "3 tbsp water",
      "155 g buckwheat flour",
      "25 g rolled oats",
      "15 g desiccated coconut",
      "1 tbsp baking powder",
      "1 pinch salt",
      "250 mL unsweetened soy milk",
      "125 g unsweetened apple purée",
      "60 mL maple syrup",
      "1 tsp vanilla extract",
      "55 g dairy-free dark chocolate chips",
      "1 banana, sliced, to serve",
    ],
    method: [
      "Whisk 1 tbsp ground flaxseed with 3 tbsp water and leave for 5 minutes to thicken.",
      "In a large bowl mix 155 g buckwheat flour, 25 g rolled oats, 15 g desiccated coconut, 1 tbsp baking powder and 1 pinch salt.",
      "Whisk 250 mL soy milk with 125 g apple purée, 60 mL maple syrup, 1 tsp vanilla and the flax mixture; stir into the dry ingredients. Fold through 55 g dairy-free chocolate chips.",
      "Heat a non-stick frying pan on medium-low. Cook approximately 60 mL batter per pancake for 3–4 minutes per side until cooked through; repeat to make 8 pancakes. Serve 2 pancakes per person with slices from 1 banana.",
    ],
    phaseBenefit:
      "Energy is quietly rising, and this soft stack meets it with steady oats and buckwheat. Chocolate chips are the treat that keeps a slow morning bright.",
    nutrition: { calories: 375, protein: 10, carbs: 67, fat: 10 },
    category: "breakfast",
    tags: ["vegan", "family", "breakfast", "kid-friendly"],
    image: "/images/recipes/signal-family/berry-pancakes.png",
    kidAlternative:
      "Mini Choc Pancake Dippers — cook the same batter as mini pikelets and serve the banana as finger-sized pieces; add the chocolate chips to only some pancakes so children can choose. Uses the same soy-milk pancake batter; nutrition changes with serving size.",
  },
  {
    id: "fok-nz-savoury-potato-pikelets",
    name: "Golden Potato & Chickpea Pikelets",
    phase: "ovulatory",
    serves: 4,
    prepTime: "30 min",
    keyNutrients: ["Protein", "Fibre", "Iron"],
    ingredients: [
      "60 g chickpea flour",
      "60 g oat flour",
      "1 tbsp nutritional yeast",
      "1 tsp baking powder",
      "¼ tsp baking soda",
      "½ tsp onion powder",
      "¼ tsp salt",
      "¼ tsp black pepper",
      "250 mL unsweetened soy milk",
      "100 g potato, finely grated",
      "75 g leek, finely chopped",
      "2 tbsp fresh coriander, chopped",
      "1 garlic clove, crushed",
      "1 tbsp apple cider vinegar",
      "2 tsp reduced-salt soy sauce",
      "4 tbsp tomato sauce, to serve",
    ],
    method: [
      "Mix 60 g chickpea flour, 60 g oat flour, 1 tbsp nutritional yeast, 1 tsp baking powder, ¼ tsp baking soda, ½ tsp onion powder, ¼ tsp salt and ¼ tsp black pepper in a bowl.",
      "In a second bowl whisk 250 mL soy milk, 100 g grated potato, 75 g leek, 2 tbsp coriander, 1 crushed garlic clove, 1 tbsp cider vinegar and 2 tsp reduced-salt soy sauce.",
      "Combine the wet and dry mixtures and rest for 5 minutes. Spoon approximately 60 mL of batter per pikelet into a non-stick frying pan over medium-low heat; cook for 4–5 minutes per side until fully cooked.",
      "Divide the cooked pikelets between 4 plates and serve with 1 tbsp tomato sauce per person.",
    ],
    phaseBenefit:
      "A savoury, light beginning that keeps things moving. Chickpea flour and potato bring gentle protein and slow energy for a bright, capable day.",
    nutrition: { calories: 160, protein: 7, carbs: 26, fat: 3 },
    category: "breakfast",
    tags: ["vegan", "family", "breakfast", "savoury"],
    kidAlternative:
      "Plain Potato Mini Fritters — leave the coriander and leek out of half the batter, replacing the leek with 75 g more finely grated potato. Serve mini rounds with tomato sauce on the side. Chickpea flour and soy milk remain in the batter.",
  },
  {
    id: "fok-nz-warm-apple-couscous",
    name: "Warm Apple Pie Couscous",
    phase: "luteal",
    serves: 6,
    prepTime: "25 min",
    keyNutrients: ["Iron", "Fibre", "Vitamin C"],
    ingredients: [
      "375 mL unsweetened soy milk",
      "60 g pitted dates, blended with 40 mL hot water",
      "1 tsp vanilla extract",
      "170 g wholemeal couscous",
      "2 medium apples (about 300 g), diced",
      "125 mL unsweetened apple juice",
      "¼ tsp cinnamon",
      "¼ tsp ground cloves",
      "20 g sliced almonds",
      "1 tbsp fresh mint, chopped",
    ],
    method: [
      "Heat 375 mL unsweetened soy milk with the purée of 60 g dates and 40 mL hot water and 1 tsp vanilla until nearly boiling.",
      "Remove the pan from the heat and stir in 170 g wholemeal couscous. Cover for 5–10 minutes, then fluff with a fork.",
      "In a second pan simmer 300 g diced apple with 125 mL apple juice, ¼ tsp cinnamon and ¼ tsp cloves for 5–10 minutes until soft.",
      "Fold the spiced apples and their juice through the couscous. Divide into 6 bowls and finish each with a share of 20 g sliced almonds and 1 tbsp chopped mint.",
    ],
    phaseBenefit:
      "Warmth that holds you steady when you need it most. Cinnamon and soft apple wrap around slow couscous energy without a hint of a crash.",
    nutrition: { calories: 205, protein: 6, carbs: 41, fat: 3 },
    category: "breakfast",
    tags: ["vegan", "family", "breakfast", "warming"],
    kidAlternative:
      "Soft Cinnamon Apple Couscous — peel the apples before cooking, leave out the cloves and mint, and serve the almonds ground or omit them for children who dislike crunchy toppings. Nutrition changes if almonds are omitted.",
  },
  {
    id: "fok-nz-fig-walnut-granola",
    name: "Toasty Fig & Walnut Breakfast Crunch",
    phase: "menstrual",
    serves: 16,
    prepTime: "80 min",
    keyNutrients: ["Iron", "Magnesium", "Fibre"],
    ingredients: [
      "360 g rolled oats",
      "150 g dried figs, chopped",
      "115 g walnuts, chopped",
      "2 tbsp flaxseeds",
      "40 g raisins",
      "1 tsp cinnamon",
      "¼ tsp allspice",
      "1 pinch salt",
      "250 g unsweetened apple purée",
      "180 g pitted dates, soaked then blended with 100 mL water",
      "1 tsp vanilla extract",
    ],
    method: [
      "Preheat the oven to 150°C (130°C fan bake) and line two baking trays.",
      "Stir together 360 g rolled oats, 150 g chopped figs, 115 g walnuts, 2 tbsp flaxseeds, 40 g raisins, 1 tsp cinnamon, ¼ tsp allspice and 1 pinch salt.",
      "Mix 250 g apple purée, the paste made from 180 g dates and 100 mL water, and 1 tsp vanilla. Fold through the oat mixture until evenly coated.",
      "Spread thinly over two trays and bake for 60–75 minutes, stirring every 20 minutes. Cool completely until crisp before portioning into 16 servings.",
    ],
    phaseBenefit:
      "Figs and walnuts bring the iron and magnesium your body quietly asks for right now. A toasty crunch that feels like being looked after.",
    nutrition: { calories: 203, protein: 5, carbs: 34, fat: 7 },
    category: "breakfast",
    tags: ["vegan", "family", "breakfast", "iron"],
    image: "/images/recipes/signal-family/banana-granola-bowl.png",
    kidAlternative:
      "Apple Cinnamon Oat Crunch — serve as a softer topping over soy yoghurt, with dried fruit finely chopped. For younger children, use ground walnuts instead of large pieces. Serve with soy yoghurt to add protein.",
  },
  {
    id: "fok-nz-berry-quinoa-porridge",
    name: "Berry & Quinoa Baked Breakfast Slice",
    phase: "ovulatory",
    serves: 8,
    prepTime: "55 min",
    keyNutrients: ["Antioxidants", "Protein", "Fibre"],
    ingredients: [
      "150 g coarse polenta (cornmeal)",
      "250 mL water",
      "750 mL unsweetened soy milk",
      "170 g dry quinoa, rinsed",
      "60 g date paste",
      "1 tsp vanilla extract",
      "¼ tsp cinnamon",
      "1 pinch salt",
      "450 g mixed berries, fresh or frozen",
      "60 mL maple syrup",
      "30 g pumpkin seeds",
      "30 g sunflower seeds",
    ],
    method: [
      "Preheat the oven to 180°C (160°C fan bake). Whisk 150 g polenta with 250 mL water in a small bowl.",
      "Bring 750 mL soy milk to a simmer in a saucepan and stir in 170 g rinsed quinoa, 60 g date paste, 1 tsp vanilla, ¼ tsp cinnamon and 1 pinch salt.",
      "Gradually whisk in the polenta mixture. Cook gently for 15–20 minutes, stirring often, until the quinoa and polenta are almost tender.",
      "Toss 450 g mixed berries with 60 mL maple syrup. Spread half the porridge into a greased or lined 20 cm square dish, cover with the berries, then the remaining porridge. Scatter 30 g pumpkin seeds and 30 g sunflower seeds across the top.",
      "Bake for approximately 20 minutes until firm and lightly golden. Cut into 8 servings.",
    ],
    phaseBenefit:
      "Berries flood every bite with colour and antioxidants at your brightest. Quinoa and soy milk hold the protein so this slice carries you through a full morning.",
    nutrition: { calories: 275, protein: 9, carbs: 49, fat: 6 },
    category: "breakfast",
    tags: ["vegan", "family", "breakfast", "antioxidant"],
    image: "/images/recipes/signal-family/berry-apple-crumble.png",
    kidAlternative:
      "Soft Berry Breakfast Pudding — skip the whole seed topping on the child's portion. Serve the baked porridge warm and soft, with a little extra soy milk. The soy milk and quinoa remain in the recipe.",
  },
];
