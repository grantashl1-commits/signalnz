import { Recipe } from "./meal-plans";

/**
 * SIGNAL Nourish Recipe Library
 *
 * Every recipe is written for one woman, right here, right now.
 * Ingredients are metric, scaled for a single serve, and chosen
 * so they can be found in any New Zealand supermarket.
 *
 * When the app needs to feed a family, it will multiply from here.
 */
export const NOURISH_RECIPES: Recipe[] = [
  // ═══════════════════════════════════════════════════════════
  // BREAKFASTS
  // ═══════════════════════════════════════════════════════════
  {
    id: "spiced-porridge-dates",
    name: "Spiced Porridge with Dates & Almonds",
    phase: "menstrual",
    serves: 1,
    prepTime: "2 min",
    cookTime: "8 min",
    keyNutrients: ["Iron", "Magnesium", "Slow‑release carbs"],
    ingredients: [
      "50g rolled oats",
      "250ml oat milk",
      "3 medjool dates (about 40g), pitted and chopped",
      "15g almonds, roughly chopped",
      "½ tsp ground cinnamon",
      "¼ tsp ground cardamom"
    ],
    method: [
      "Place 50g oats, 250ml oat milk, ½ tsp cinnamon and ¼ tsp cardamom in a small saucepan.",
      "Bring to a gentle simmer, stirring occasionally, and cook for 8 minutes until creamy.",
      "Pour into your favourite bowl. Scatter the 40g chopped dates and 15g almonds on top."
    ],
    phaseBenefit:
      "Your body is doing quiet, deep work right now. Oats and dates bring iron and steady energy; cinnamon wraps around you like a warm blanket. There’s no rush.",
    nutrition: { calories: 430, protein: 12, carbs: 68, fat: 14, fibre: 9 },
    category: "breakfast",
    tags: ["vegan", "menstrual", "warming", "iron"]
  },
  {
    id: "bircher-apple-cinnamon",
    name: "Bircher Muesli with Apple & Cinnamon",
    phase: "follicular",
    serves: 1,
    prepTime: "5 min + overnight soak",
    cookTime: "0 min",
    keyNutrients: ["Probiotics", "Fibre", "Vitamin C"],
    ingredients: [
      "40g rolled oats",
      "100ml oat milk",
      "80g plain yoghurt (or coconut yoghurt)",
      "1 small apple (about 120g), grated",
      "10g sunflower seeds",
      "½ tsp ground cinnamon",
      "1 tsp honey (optional)"
    ],
    method: [
      "The night before, mix 40g oats, 100ml oat milk, 80g yoghurt, the grated apple (120g), and ½ tsp cinnamon in a jar.",
      "Refrigerate overnight. In the morning, stir, then top with 10g sunflower seeds and a drizzle of honey if you like."
    ],
    phaseBenefit:
      "Energy is quietly rising — your body is ready to build. This cool, creamy bowl feeds your gut bacteria as deftly as it feeds you, and the apple’s sweetness needs no convincing.",
    nutrition: { calories: 350, protein: 11, carbs: 52, fat: 10, fibre: 8 },
    category: "breakfast",
    tags: ["vegetarian", "follicular", "probiotic"]
  },
  {
    id: "rainbow-smoothie-bowl",
    name: "Rainbow Smoothie Bowl",
    phase: "ovulatory",
    serves: 1,
    prepTime: "5 min",
    cookTime: "0 min",
    keyNutrients: ["Antioxidants", "Zinc", "Vitamin C"],
    ingredients: [
      "100g frozen açai purée (or 1 sachet)",
      "1 small ripe banana (about 100g), frozen",
      "60ml oat milk",
      "15g hemp seeds",
      "25g granola",
      "50g mixed fresh berries"
    ],
    method: [
      "Blend the 100g açai, 100g frozen banana, and 60ml oat milk until thick and smooth.",
      "Spoon into a bowl, then scatter over 15g hemp seeds, 25g granola, and 50g berries."
    ],
    phaseBenefit:
      "You’re at your brightest — your body craves colour and lightness. Hemp seeds offer zinc for the egg’s journey, and every berry is a tiny promise of protection.",
    nutrition: { calories: 380, protein: 12, carbs: 52, fat: 14, fibre: 10 },
    category: "breakfast",
    tags: ["vegan", "ovulatory", "antioxidant"]
  },
  {
    id: "banana-oat-pancakes",
    name: "Banana Oat Pancakes with Tahini",
    phase: "luteal",
    serves: 1,
    prepTime: "5 min",
    cookTime: "10 min",
    keyNutrients: ["B6", "Magnesium", "Slow carbs"],
    ingredients: [
      "50g rolled oats",
      "1 small ripe banana (about 100g)",
      "1 large egg",
      "½ tsp baking powder",
      "¼ tsp ground cinnamon",
      "1 tsp coconut oil (for cooking)",
      "1 tbsp tahini (about 15g)",
      "1 tsp maple syrup (optional)"
    ],
    method: [
      "Blitz 50g oats, 100g banana, 1 egg, ½ tsp baking powder, and ¼ tsp cinnamon in a blender until smooth.",
      "Warm 1 tsp coconut oil in a non‑stick pan over medium heat. Pour in the batter and cook for about 3 minutes each side until golden.",
      "Slide onto a plate, drizzle with 15g tahini and a whisper of maple syrup if you wish."
    ],
    phaseBenefit:
      "Progesterone asks for B6 and magnesium; banana and tahini answer softly. This is the pancake that holds your hand when your body feels heavy — no crash, just quiet steadiness.",
    nutrition: { calories: 420, protein: 14, carbs: 52, fat: 16, fibre: 6 },
    category: "breakfast",
    tags: ["vegetarian", "luteal", "magnesium"]
  },
  {
    id: "scrambled-eggs-sourdough",
    name: "Scrambled Eggs on Sourdough with Spinach",
    phase: "menstrual",
    serves: 1,
    prepTime: "2 min",
    cookTime: "8 min",
    keyNutrients: ["Iron", "B12", "Complete protein"],
    ingredients: [
      "2 large eggs",
      "1 tsp butter",
      "30g baby spinach",
      "1 thick slice sourdough bread (about 50g)",
      "Salt and black pepper"
    ],
    method: [
      "Toast the sourdough slice. Whisk 2 eggs with a pinch of salt and pepper.",
      "Melt 1 tsp butter in a small pan over low heat. Add 30g spinach and let it wilt for 1 minute.",
      "Pour the 2 large eggs into the same pan, stirring gently until just set. Pile onto the toast."
    ],
    phaseBenefit:
      "Eggs carry iron and B12 — exactly what your body is losing — and the spinach adds more iron without fuss. Warm, simple, and enough.",
    nutrition: { calories: 340, protein: 18, carbs: 28, fat: 16, fibre: 3 },
    category: "breakfast",
    tags: ["vegetarian", "menstrual", "iron"]
  },
  {
    id: "buckwheat-porridge-banana",
    name: "Buckwheat Porridge with Banana",
    phase: "follicular",
    serves: 1,
    prepTime: "2 min",
    cookTime: "10 min",
    keyNutrients: ["Magnesium", "Rutin", "Slow carbs"],
    ingredients: [
      "50g buckwheat groats, rinsed",
      "200ml oat milk",
      "1 small banana (about 100g), sliced",
      "1 tsp honey",
      "½ tsp ground cinnamon",
      "10g walnuts, chopped"
    ],
    method: [
      "Simmer 50g buckwheat groats in 200ml oat milk for 8–10 minutes until tender and creamy.",
      "Pour into a bowl. Top with sliced banana, 10g walnuts, ½ tsp cinnamon, and a drizzle of honey."
    ],
    phaseBenefit:
      "Buckwheat’s magnesium and rutin support healthy circulation, gently feeding the energy that’s building inside you. No rush — just warmth and quiet.",
    nutrition: { calories: 380, protein: 10, carbs: 60, fat: 10, fibre: 5 },
    category: "breakfast",
    tags: ["vegan", "follicular", "magnesium"]
  },
  {
    id: "omelette-feta-spinach",
    name: "Omelette with Feta & Spinach",
    phase: "follicular",
    serves: 1,
    prepTime: "2 min",
    cookTime:  "8 min",
    keyNutrients: ["Complete protein", "Calcium", "Iron"],
    ingredients: [
      "2 large eggs",
      "30g feta cheese, crumbled",
      "30g baby spinach",
      "1 tsp olive oil",
      "30g red onion, thinly sliced",
      "Salt and pepper"
    ],
    method: [
      "Whisk the eggs with a pinch of salt and pepper. Heat 1 tsp oil in a small non‑stick pan over medium heat. Sauté 30g onion for 2 minutes, then add 30g spinach and cook until wilted.",
      "Pour the eggs over the vegetables. Cook for 3 minutes until the edges are set, then scatter 30g feta over half the omelette and fold. Slide onto a plate."
    ],
    phaseBenefit:
      "Your body is building — new cells, new energy. Eggs give complete protein; spinach and feta bring iron and calcium, quietly feeding the creation happening inside you.",
    nutrition: { calories: 320, protein: 22, carbs: 6, fat: 24, fibre: 2 },
    category: "breakfast",
    tags: ["vegetarian", "follicular", "protein"]
  },
  {
    id: "greek-yoghurt-berries",
    name: "Greek Yoghurt with Berries & Almonds",
    phase: "ovulatory",
    serves: 1,
    prepTime: "2 min",
    cookTime: "0 min",
    keyNutrients: ["Protein", "Calcium", "Antioxidants"],
    ingredients: [
      "150g Greek yoghurt",
      "60g mixed fresh berries",
      "15g almonds, sliced",
      "1 tsp honey"
    ],
    method: [
      "Spoon 150g yoghurt into a bowl. Top with 60g berries, 15g almonds, and a drizzle of honey."
    ],
    phaseBenefit:
      "Light, high‑protein, and effortlessly beautiful — like your body at its peak. Almonds add vitamin E to support egg quality; berries bring antioxidant protection.",
    nutrition: { calories: 250, protein: 18, carbs: 18, fat: 12, fibre: 3 },
    category: "breakfast",
    tags: ["vegetarian", "ovulatory", "protein"]
  },
  {
    id: "avocado-rye-toast",
    name: "Avocado on Rye with Hemp Seeds",
    phase: "menstrual",
    serves: 1,
    prepTime: "3 min",
    cookTime: "3 min",
    keyNutrients: ["Healthy fats", "Omega‑3", "Magnesium"],
    ingredients: [
      "2 slices dark rye bread (about 80g total)",
      "½ ripe avocado (about 60g)",
      "1 tbsp hemp seeds (10g)",
      "½ lemon, juiced",
      "Pinch sea salt and chilli flakes"
    ],
    method: [
      "Toast the 2 slices rye bread. Mash the avocado with the ½ lemon juice and a pinch of salt.",
      "Spread onto the toast. Sprinkle with 10g hemp seeds and chilli flakes."
    ],
    phaseBenefit:
      "Hemp seeds offer omega‑3 and zinc; avocado calms with magnesium. This is a five‑minute act of care when even simple things feel heavy.",
    nutrition: { calories: 380, protein: 12, carbs: 36, fat: 22, fibre: 10 },
    category: "breakfast",
    tags: ["vegan", "menstrual", "omega-3"]
  },
  {
    id: "warm-oat-porridge-banana",
    name: "Warm Oat Porridge with Banana & Almond Butter",
    phase: "luteal",
    serves: 1,
    prepTime: "2 min",
    cookTime: "8 min",
    keyNutrients: ["B6", "Magnesium", "Slow carbs"],
    ingredients: [
      "50g rolled oats",
      "200ml oat milk",
      "1 small banana (about 100g), sliced",
      "1 tbsp almond butter (about 15g)",
      "½ tsp ground cinnamon",
      "1 tbsp chia seeds (10g)"
    ],
    method: [
      "Cook 50g oats in 200ml oat milk for 8 minutes, stirring occasionally.",
      "Pour into a bowl. Top with sliced banana, 15g almond butter, ½ tsp cinnamon, and 10g chia seeds."
    ],
    phaseBenefit:
      "Your blood sugar needs a gentle hand right now — oats, banana, and chia provide it. Almond butter’s magnesium eases the tension that’s been building. A bowl of quiet strength.",
    nutrition: { calories: 450, protein: 14, carbs: 60, fat: 18, fibre: 10 },
    category: "breakfast",
    tags: ["vegan", "luteal", "magnesium"]
  },

  // ═══════════════════════════════════════════════════════════
  // LUNCHES (50+)
  // ═══════════════════════════════════════════════════════════

  // ── MENSTRUAL LUNCHES ──
  {
    id: "lunch-m1",
    name: "Red Lentil & Spinach Soup with Sourdough",
    phase: "menstrual",
    serves: 1,
    prepTime: "5 min",
    cookTime: "25 min",
    keyNutrients: ["Iron", "Folate", "Warming fibre"],
    ingredients: [
      "60g dried red lentils",
      "1 tbsp olive oil",
      "50g brown onion, finely chopped",
      "1 garlic clove, minced",
      "1 tsp ground cumin",
      "400ml vegetable stock",
      "30g baby spinach",
      "1 slice sourdough bread (about 50g)",
      "Salt and pepper"
    ],
    method: [
      "Warm 1 tbsp olive oil in a saucepan. Add 50g onion and cook for 3 minutes until soft. Stir in the garlic and 1 tsp cumin for 30 seconds.",
      "Add 60g lentils and 400ml stock. Bring to a boil, then simmer for 20 minutes until the lentils are tender.",
      "Stir in 30g spinach until wilted. Season and serve with the sourdough toast on the side."
    ],
    phaseBenefit:
      "Red lentils restore iron gently; warm broth soothes the cramping. A bowl that says: you don’t have to be productive today — just be here.",
    nutrition: { calories: 420, protein: 20, carbs: 56, fat: 12, fibre: 14 },
    category: "meal",
    tags: ["vegan", "menstrual", "iron", "soup"],
    kidAlternative: "Blend the soup smooth and serve with buttered toast soldiers for dipping."
  },
  {
    id: "lunch-m2",
    name: "Tuna & White Bean Salad",
    phase: "menstrual",
    serves: 1,
    prepTime: "5 min",
    cookTime: "0 min",
    keyNutrients: ["Protein", "Iron", "Omega‑3"],
    ingredients: [
      "95g tin tuna in olive oil, drained",
      "100g tinned cannellini beans, drained and rinsed",
      "30g red onion, thinly sliced",
      "30g rocket leaves",
      "1 tsp capers",
      "1 tbsp olive oil",
      "1 tsp lemon juice"
    ],
    method: [
      "Toss the tuna, 100g beans, onion, rocket, and 1 tsp capers together in a bowl.",
      "Drizzle with 1 tbsp olive oil and 1 tsp lemon juice. Season with salt and pepper."
    ],
    phaseBenefit:
      "Tuna brings omega‑3 and iron; white beans add fibre and more iron. A five‑minute lunch that restores without asking much of you.",
    nutrition: { calories: 380, protein: 28, carbs: 28, fat: 18, fibre: 8 },
    category: "meal",
    tags: ["pescatarian", "menstrual", "iron", "quick"],
    kidAlternative: "Serve tuna and beans separately. Kids often prefer them as finger food with toast on the side."
  },
  {
    id: "lunch-m3",
    name: "Chicken & Vegetable Soup",
    phase: "menstrual",
    serves: 1,
    prepTime: "5 min",
    cookTime: "25 min",
    keyNutrients: ["Protein", "Iron", "B12"],
    ingredients: [
      "120g boneless chicken thigh, diced",
      "1 tsp olive oil",
      "50g carrot, diced",
      "50g celery, diced",
      "50g brown onion, diced",
      "400ml chicken stock",
      "30g baby spinach",
      "Salt, pepper, thyme"
    ],
    method: [
      "Warm 1 tsp oil. Sauté onion, carrot, and celery for 5 minutes. Add chicken and cook until no longer pink.",
      "Pour in 400ml stock and a pinch of thyme. Simmer for 15 minutes. Stir in 30g spinach until wilted. Season."
    ],
    phaseBenefit:
      "Chicken and vegetables offer iron and B12 — the exact nutrients your body is losing. This soup is a warm, gentle way to refill.",
    nutrition: { calories: 320, protein: 28, carbs: 18, fat: 14, fibre: 5 },
    category: "meal",
    tags: ["menstrual", "iron", "soup"],
    kidAlternative: "Strain the broth and serve with small pasta shapes instead of vegetables for picky eaters."
  },
  {
    id: "lunch-m4",
    name: "Miso Tofu Broth",
    phase: "menstrual",
    serves: 1,
    prepTime: "3 min",
    cookTime: "8 min",
    keyNutrients: ["Probiotics", "Phytoestrogens", "Iron"],
    ingredients: [
      "1 tbsp white miso paste",
      "350ml water",
      "80g silken tofu, cubed",
      "1 tsp dried wakame (about 2g)",
      "1 spring onion, sliced",
      "½ tsp tamari"
    ],
    method: [
      "Soak the wakame in warm water for 5 minutes. Heat 350ml water to a gentle simmer — not boiling. Whisk in 1 tbsp miso.",
      "Add the tofu, drained wakame, and spring onion. Simmer for 2 minutes. Season with ½ tsp tamari."
    ],
    phaseBenefit:
      "Miso feeds the gut bacteria that support your hormones; tofu adds gentle iron and protein. A quiet, warming bowl for the days that ask you to slow down.",
    nutrition: { calories: 140, protein: 12, carbs: 10, fat: 6, fibre: 2 },
    category: "meal",
    tags: ["vegan", "menstrual", "probiotic"],
    kidAlternative: "Omit the wakame and serve miso broth with soft tofu cubes — most kids enjoy the mild, savoury flavour."
  },
  {
    id: "lunch-m5",
    name: "Black Bean Tacos with Avocado",
    phase: "menstrual",
    serves: 1,
    prepTime: "5 min",
    cookTime: "5 min",
    keyNutrients: ["Iron", "Fibre", "Magnesium"],
    ingredients: [
      "100g tinned black beans, drained and rinsed",
      "½ tsp ground cumin",
      "½ tsp smoked paprika",
      "2 small corn tortillas",
      "¼ avocado (about 30g), sliced",
      "2 tbsp fresh salsa",
      "Fresh coriander",
      "Squeeze of lime"
    ],
    method: [
      "Warm the 100g beans in a small pan with ½ tsp cumin and paprika. Warm the 2 small tortillas in a dry pan.",
      "Fill 2 small tortillas with 100g beans, avocado, salsa, and coriander. Squeeze lime over the top."
    ],
    phaseBenefit:
      "Black beans are rich in iron and magnesium — the minerals your body is releasing. These tacos offer deep, grounding nourishment wrapped in something that feels like a treat.",
    nutrition: { calories: 380, protein: 16, carbs: 48, fat: 14, fibre: 14 },
    category: "meal",
    tags: ["vegan", "menstrual", "iron", "quick"],
    kidAlternative: "Serve beans and tortillas separately with cheese and let them build their own."
  },
  {
    id: "lunch-m6",
    name: "Warm Quinoa & Roasted Beetroot Salad",
    phase: "menstrual",
    serves: 1,
    prepTime: "5 min",
    cookTime: "30 min",
    keyNutrients: ["Iron", "Folate", "Nitrates"],
    ingredients: [
      "40g quinoa, rinsed",
      "1 medium beetroot (about 120g), wrapped in foil",
      "30g rocket leaves",
      "1 tbsp pumpkin seeds (10g)",
      "20g feta cheese, crumbled",
      "1 tbsp olive oil",
      "1 tsp balsamic vinegar"
    ],
    method: [
      "Roast the foil‑wrapped beetroot at 200°C for 30 minutes until tender. Cook 40g quinoa in 120ml water.",
      "Peel and slice the 1 medium beetroot. Toss rocket with 1 tbsp oil and vinegar. Top with 40g quinoa, beetroot, 1 tbsp pumpkin seeds, and feta."
    ],
    phaseBenefit:
      "Beetroot supports blood production; quinoa offers complete protein. The deep red is the colour of restoration — your body is making new blood, and this salad honours that work.",
    nutrition: { calories: 420, protein: 14, carbs: 44, fat: 20, fibre: 8 },
    category: "meal",
    tags: ["vegetarian", "menstrual", "iron"],
    kidAlternative: "Serve quinoa and beetroot cubes separately — kids enjoy the bright colours. Offer feta on the side."
  },
  {
    id: "lunch-m7",
    name: "Lamb & Lentil Soup",
    phase: "menstrual",
    serves: 1,
    prepTime: "5 min",
    cookTime: "35 min",
    keyNutrients: ["Haem iron", "Protein", "Zinc"],
    ingredients: [
      "100g lamb shoulder, diced",
      "1 tsp olive oil",
      "50g brown onion, chopped",
      "1 garlic clove, minced",
      "50g carrot, diced",
      "300ml beef stock",
      "60g tinned brown lentils, drained",
      "Fresh parsley to serve"
    ],
    method: [
      "Brown the lamb in 1 tsp oil, set aside. Sauté onion, garlic, and carrot for 5 minutes.",
      "Return lamb, add 300ml stock. Simmer 25 minutes. Add lentils, warm through. Season and scatter parsley."
    ],
    phaseBenefit:
      "Lamb is one of the best sources of haem iron — exactly what your body needs right now. Lentils add fibre and more iron. Deep, slow nourishment.",
    nutrition: { calories: 420, protein: 30, carbs: 28, fat: 20, fibre: 8 },
    category: "meal",
    tags: ["menstrual", "iron", "soup"],
    kidAlternative: "Strain the broth and serve with small pasta — kids get the nourishing stock without the texture of lentils."
  },

  // ── FOLLICULAR LUNCHES ──
  {
    id: "lunch-f1",
    name: "Chicken & Quinoa Bowl with Hummus",
    phase: "follicular",
    serves: 1,
    prepTime: "5 min",
    cookTime: "25 min",
    keyNutrients: ["Complete protein", "B6", "Iron"],
    ingredients: [
      "120g chicken breast",
      "40g quinoa, rinsed",
      "100g broccoli florets",
      "80g red capsicum, sliced",
      "30g hummus",
      "1 tsp olive oil",
      "Salt and pepper"
    ],
    method: [
      "Cook 40g quinoa in 120ml water. Season chicken and pan‑fry in 1 tsp oil for 6 min each side. Slice.",
      "Steam broccoli and capsicum 4 min. Arrange everything in a bowl with hummus alongside."
    ],
    phaseBenefit:
      "Your energy is climbing — your body craves protein and colour. Chicken and quinoa give complete amino acids; broccoli helps your body handle rising oestrogen with ease.",
    nutrition: { calories: 480, protein: 38, carbs: 42, fat: 14, fibre: 8 },
    category: "meal",
    tags: ["follicular", "high-protein"],
    kidAlternative: "Serve deconstructed — chicken pieces, plain quinoa, steamed veg, and hummus for dipping."
  },
  {
    id: "lunch-f2",
    name: "Tempeh & Broccoli Stir‑Fry",
    phase: "follicular",
    serves: 1,
    prepTime: "5 min",
    cookTime: "15 min",
    keyNutrients: ["Probiotics", "Phytoestrogens", "Complete protein"],
    ingredients: [
      "120g tempeh, cubed",
      "1 tbsp sesame oil",
      "100g broccoli florets",
      "80g carrot, julienned",
      "1 garlic clove, minced",
      "1 tsp grated ginger",
      "1 tbsp tamari",
      "50g brown rice (dry weight), cooked"
    ],
    method: [
      "Cook 50g rice. Warm 1 tbsp oil, cook tempeh until golden. Add garlic, ginger, broccoli, carrot; stir‑fry 3 min.",
      "Add 1 tbsp tamari, toss, and serve over rice."
    ],
    phaseBenefit:
      "Fermented tempeh feeds your microbiome while it feeds your muscles. Broccoli’s sulforaphane helps your body process oestrogen — a perfect follicular‑phase meal.",
    nutrition: { calories: 520, protein: 28, carbs: 54, fat: 20, fibre: 10 },
    category: "meal",
    tags: ["vegan", "follicular", "probiotic"],
    kidAlternative: "Swap tempeh for plain cubed tofu; serve rice and veg separately with a drizzle of soy sauce."
  },
  {
    id: "lunch-f3",
    name: "Lentil & Roasted Capsicum Bowl",
    phase: "follicular",
    serves: 1,
    prepTime: "5 min",
    cookTime: "20 min",
    keyNutrients: ["Iron", "Folate", "Zinc"],
    ingredients: [
      "60g dried green lentils",
      "1 red capsicum (about 150g)",
      "50g cucumber, diced",
      "2 tbsp tahini (30g)",
      "1 tbsp lemon juice",
      "1 small garlic clove, minced",
      "1 tbsp olive oil"
    ],
    method: [
      "Cook lentils 18‑20 min until tender; drain. Roast capsicum under grill until charred, peel and slice.",
      "Whisk 2 tbsp tahini, lemon juice, garlic, 1 tbsp oil. Toss 60g lentils with capsicum, 50g cucumber, and dressing."
    ],
    phaseBenefit:
      "Lentils bring plant iron and folate; tahini adds zinc — three nutrients your body is calling for as oestrogen climbs. Tastes like a fresh start.",
    nutrition: { calories: 480, protein: 20, carbs: 44, fat: 24, fibre: 14 },
    category: "meal",
    tags: ["vegan", "follicular", "zinc"],
    kidAlternative: "Serve lentils plain alongside cucumber sticks and capsicum strips with tahini dip."
  },
  {
    id: "lunch-f4",
    name: "Soba Noodle Salad with Sesame",
    phase: "follicular",
    serves: 1,
    prepTime: "5 min",
    cookTime: "8 min",
    keyNutrients: ["Complex carbs", "Zinc", "Magnesium"],
    ingredients: [
      "75g soba noodles",
      "50g edamame (shelled)",
      "50g carrot, julienned",
      "50g cucumber, julienned",
      "1 tbsp tamari",
      "1 tsp sesame oil",
      "1 tsp rice wine vinegar",
      "½ tsp grated ginger",
      "1 tsp sesame seeds"
    ],
    method: [
      "Cook 75g noodles according to packet, rinse under cold water. Cook 50g edamame if frozen.",
      "Whisk 1 tbsp tamari, sesame oil, 1 tsp vinegar, ginger. Toss 75g noodles, edamame, carrot, 50g cucumber with dressing. Top with 1 tsp sesame seeds."
    ],
    phaseBenefit:
      "Soba noodles bring magnesium and buckwheat goodness; edamame adds phytoestrogens and zinc. Light, fast, and quietly energising.",
    nutrition: { calories: 420, protein: 18, carbs: 54, fat: 14, fibre: 6 },
    category: "meal",
    tags: ["vegan", "follicular", "zinc"],
    kidAlternative: "Serve plain soba noodles with a drizzle of soy sauce alongside raw carrot and cucumber sticks."
  },
  {
    id: "lunch-f5",
    name: "Tuna Poke Bowl",
    phase: "follicular",
    serves: 1,
    prepTime: "10 min",
    cookTime: "0 min (use pre‑cooked rice)",
    keyNutrients: ["Omega‑3", "Protein", "Zinc"],
    ingredients: [
      "120g sashimi‑grade tuna (or tinned tuna), cubed",
      "100g cooked sushi rice (about 40g dry)",
      "50g edamame (shelled)",
      "30g avocado, sliced",
      "50g cucumber, diced",
      "1 tsp tamari",
      "½ tsp sesame oil",
      "1 tsp pickled ginger",
      "½ nori sheet, sliced",
      "1 tsp sesame seeds"
    ],
    method: [
      "Season 120g tuna with tamari and ½ tsp sesame oil. Arrange 100g rice in a bowl. Top with tuna, 50g edamame, avocado, cucumber, 1 tsp ginger, nori, and 1 tsp sesame seeds."
    ],
    phaseBenefit:
      "Omega‑3‑rich tuna supports the hormones your body is building; edamame adds zinc and phytoestrogens. Fresh, vibrant, and full of life.",
    nutrition: { calories: 460, protein: 34, carbs: 44, fat: 16, fibre: 6 },
    category: "meal",
    tags: ["pescatarian", "follicular", "omega-3"],
    kidAlternative: "Serve plain rice with cucumber and avocado slices; offer small pieces of tinned tuna on the side."
  },
  {
    id: "lunch-f6",
    name: "Turkey & Avocado Wrap",
    phase: "follicular",
    serves: 1,
    prepTime: "5 min",
    cookTime: "0 min",
    keyNutrients: ["Lean protein", "B vitamins", "Healthy fats"],
    ingredients: [
      "100g sliced turkey breast (deli style)",
      "1 wholemeal wrap (about 40g)",
      "30g avocado, sliced",
      "20g mixed salad leaves",
      "1 tbsp cranberry sauce"
    ],
    method: [
      "Spread 1 tbsp cranberry sauce on the 1 wrap. Layer turkey, avocado, and 20g salad leaves. Roll tightly, slice in half."
    ],
    phaseBenefit:
      "Lean turkey brings tryptophan and B6; avocado adds the healthy fats your body uses to build hormones. A quick, portable lunch for days on the go.",
    nutrition: { calories: 380, protein: 28, carbs: 34, fat: 14, fibre: 5 },
    category: "meal",
    tags: ["follicular", "protein", "quick"],
    kidAlternative: "Serve turkey slices, avocado wedges, and a tortilla separately — let them build their own roll‑up."
  },
  {
    id: "lunch-f7",
    name: "Chicken Caesar Wrap",
    phase: "follicular",
    serves: 1,
    prepTime: "5 min",
    cookTime: "12 min",
    keyNutrients: ["Protein", "Calcium", "B vitamins"],
    ingredients: [
      "120g chicken breast",
      "1 tsp olive oil",
      "1 wholemeal wrap (about 40g)",
      "20g cos lettuce, chopped",
      "1 tbsp Caesar dressing",
      "10g Parmesan cheese, shaved"
    ],
    method: [
      "Cook chicken in 1 tsp oil, 6 min each side, slice. Spread dressing on wrap, layer lettuce, chicken, Parmesan, roll tightly."
    ],
    phaseBenefit:
      "Lean protein supports the rising energy of this phase; Parmesan adds calcium for cellular signalling. A wrap you can eat with one hand.",
    nutrition: { calories: 420, protein: 34, carbs: 28, fat: 18 },
    category: "meal",
    tags: ["follicular", "protein", "quick"],
    kidAlternative: "Make a simpler version: plain chicken, a little cheese, and a tortilla — no dressing."
  },
  {
    id: "lunch-f8",
    name: "Prawn & Mango Salad",
    phase: "follicular",
    serves: 1,
    prepTime: "5 min",
    cookTime: "5 min",
    keyNutrients: ["Zinc", "Vitamin C", "Lean protein"],
    ingredients: [
      "120g cooked prawns",
      "80g mango, sliced",
      "30g mixed salad leaves",
      "20g red onion, sliced",
      "1 tbsp lime juice",
      "1 tsp olive oil",
      "10g cashews, chopped",
      "Fresh coriander"
    ],
    method: [
      "Toss leaves with 1 tbsp lime juice and oil. Top with 120g prawns, mango, onion, cashews, and coriander."
    ],
    phaseBenefit:
      "Prawns are rich in zinc — essential for egg development — and mango adds vitamin C. A light, sunny salad that feeds the building momentum inside you.",
    nutrition: { calories: 320, protein: 24, carbs: 24, fat: 14, fibre: 4 },
    category: "meal",
    tags: ["pescatarian", "follicular", "zinc"],
    kidAlternative: "Serve prawns, mango slices, and cashews separately — kids love finger foods."
  },
  {
    id: "lunch-f9",
    name: "Roasted Vegetable & Quinoa Salad",
    phase: "follicular",
    serves: 1,
    prepTime: "5 min",
    cookTime: "20 min",
    keyNutrients: ["Complete protein", "Fibre", "Vitamin C"],
    ingredients: [
      "40g quinoa, rinsed",
      "100g mixed vegetables (capsicum, zucchini, red onion), diced",
      "1 tbsp olive oil",
      "1 tsp lemon juice",
      "1 tbsp pumpkin seeds (10g)",
      "Salt and pepper"
    ],
    method: [
      "Cook quinoa. Toss vegetables in ½ tbsp oil, roast at 200°C 15 min. Combine quinoa, veg, remaining oil, lemon juice, and pumpkin seeds."
    ],
    phaseBenefit:
      "Quinoa is a complete protein; rainbow vegetables provide the antioxidants your rising oestrogen needs. This bowl is a canvas for growth.",
    nutrition: { calories: 400, protein: 14, carbs: 46, fat: 18, fibre: 8 },
    category: "meal",
    tags: ["vegan", "follicular", "high-fibre"],
    kidAlternative: "Serve roasted veg and quinoa separately — most kids prefer components they can see and choose."
  },
  {
    id: "lunch-f10",
    name: "Grilled Fish Tacos with Slaw",
    phase: "follicular",
    serves: 1,
    prepTime: "5 min",
    cookTime: "8 min",
    keyNutrients: ["Omega‑3", "Vitamin C", "Lean protein"],
    ingredients: [
      "120g firm white fish fillet",
      "½ tsp ground cumin",
      "2 small corn tortillas",
      "50g red cabbage, shredded",
      "30g carrot, grated",
      "1 tbsp Greek yoghurt",
      "1 tsp lime juice",
      "Fresh coriander"
    ],
    method: [
      "Season fish with cumin, grill or pan‑fry 3‑4 min each side. Warm tortillas.",
      "Mix 50g cabbage and carrot with 1 tbsp yoghurt and lime juice. Flake fish into 2 small tortillas, top with slaw and coriander."
    ],
    phaseBenefit:
      "Light, fresh protein with vitamin C from cabbage — exactly what your body wants as energy rises. The lime and coriander taste like possibility.",
    nutrition: { calories: 360, protein: 28, carbs: 32, fat: 12, fibre: 6 },
    category: "meal",
    tags: ["pescatarian", "follicular", "omega-3"],
    kidAlternative: "Serve fish pieces, tortilla, and raw veg separately; skip the slaw dressing for little ones."
  },

  // ── OVULATORY LUNCHES ──
  {
    id: "lunch-o1",
    name: "Zucchini Noodles with Pesto & Cherry Tomatoes",
    phase: "ovulatory",
    serves: 1,
    prepTime: "10 min",
    cookTime: "2 min",
    keyNutrients: ["Folate", "Zinc", "Light energy"],
    ingredients: [
      "1 large zucchini (about 200g), spiralised",
      "30g basil pesto",
      "80g cherry tomatoes, halved",
      "15g pine nuts",
      "1 tbsp nutritional yeast (optional)"
    ],
    method: [
      "Toss zucchini noodles with pesto. Warm briefly in a pan for 1‑2 min. Top with tomatoes, pine nuts, and nutritional yeast if using."
    ],
    phaseBenefit:
      "Appetite is naturally lighter now — raw, fresh food feels right. Basil brings folate; pine nuts add zinc. A dish that celebrates the peak of you.",
    nutrition: { calories: 340, protein: 10, carbs: 14, fat: 28, fibre: 5 },
    category: "meal",
    tags: ["vegetarian", "ovulatory", "light"],
    kidAlternative: "Serve plain spiralised zucchini (or cucumber sticks) with a dollop of pesto and cherry tomatoes on the side."
  },
  {
    id: "lunch-o2",
    name: "Mango & Avocado Sushi Bowl",
    phase: "ovulatory",
    serves: 1,
    prepTime: "15 min",
    cookTime: "0 min (use pre‑cooked rice)",
    keyNutrients: ["Folate", "Healthy fats", "Vitamin C"],
    ingredients: [
      "100g cooked sushi rice (about 40g dry)",
      "60g avocado, sliced",
      "80g mango, sliced",
      "50g cucumber, julienned",
      "1 tsp rice wine vinegar",
      "1 tsp tamari",
      "½ tsp sesame oil",
      "½ nori sheet, sliced",
      "1 tsp sesame seeds"
    ],
    method: [
      "Season 100g rice with vinegar. Arrange 60g avocado, mango, cucumber, and nori over rice. Drizzle 1 tsp tamari and sesame oil, scatter 1 tsp seeds."
    ],
    phaseBenefit:
      "Ovulation is a celebration — vibrant mango and creamy avocado honour that. The nori whispers iodine to your thyroid; the colours feed your spirit as much as your cells.",
    nutrition: { calories: 420, protein: 8, carbs: 58, fat: 18, fibre: 8 },
    category: "meal",
    tags: ["vegan", "ovulatory", "light"],
    kidAlternative: "Serve rice and fruit separately — kids love deconstructed bowls where they can pick and choose."
  },
  {
    id: "lunch-o3",
    name: "Big Leafy Salad with Seeds & Tahini",
    phase: "ovulatory",
    serves: 1,
    prepTime: "10 min",
    cookTime: "0 min",
    keyNutrients: ["Zinc", "Selenium", "Folate"],
    ingredients: [
      "60g mixed salad leaves (spinach, rocket, cos)",
      "1 tbsp pumpkin seeds (10g)",
      "1 tbsp sunflower seeds (10g)",
      "1 tbsp tahini (15g)",
      "½ lemon, juiced",
      "1 tbsp olive oil",
      "30g avocado, sliced",
      "50g cucumber, sliced"
    ],
    method: [
      "Arrange leaves, 1 tbsp seeds, avocado, and 50g cucumber in a bowl. Whisk 1 tbsp tahini with lemon juice, 1 tbsp oil, and a splash of water. Drizzle over."
    ],
    phaseBenefit:
      "Zinc from seeds supports the egg’s release; everything about this salad feels light and alive — exactly how you feel at ovulation.",
    nutrition: { calories: 340, protein: 10, carbs: 14, fat: 28, fibre: 6 },
    category: "meal",
    tags: ["vegan", "ovulatory", "zinc"],
    kidAlternative: "Serve salad components in little piles — seeds, cucumber, avocado — with tahini as a dip."
  },
  {
    id: "lunch-o4",
    name: "Grilled Chicken & Mango Salad",
    phase: "ovulatory",
    serves: 1,
    prepTime: "5 min",
    cookTime: "12 min",
    keyNutrients: ["Protein", "Vitamin C", "Folate"],
    ingredients: [
      "120g chicken breast",
      "80g mango, sliced",
      "30g mixed salad leaves",
      "20g red onion, sliced",
      "1 tbsp lime juice",
      "1 tsp olive oil",
      "10g cashews, chopped",
      "Fresh coriander"
    ],
    method: [
      "Grill chicken 6 min each side, slice. Toss leaves with lime juice and oil. Top with chicken, mango, onion, cashews, coriander."
    ],
    phaseBenefit:
      "Lean protein with vitamin C‑rich mango — light, fresh, and perfectly timed for peak energy. The colours on this plate mirror how alive you feel right now.",
    nutrition: { calories: 380, protein: 30, carbs: 24, fat: 16, fibre: 4 },
    category: "meal",
    tags: ["ovulatory", "protein"],
    kidAlternative: "Serve chicken strips, mango slices, and cashews as finger food alongside plain salad leaves."
  },
  {
    id: "lunch-o5",
    name: "Prawn & Avocado Rice Paper Rolls",
    phase: "ovulatory",
    serves: 1,
    prepTime: "15 min",
    cookTime: "0 min",
    keyNutrients: ["Zinc", "Iodine", "Hydration"],
    ingredients: [
      "4 large cooked prawns (about 80g)",
      "2 rice paper sheets",
      "30g avocado, sliced",
      "50g cucumber, julienned",
      "40g carrot, julienned",
      "Fresh mint and coriander",
      "1 tbsp sweet chilli sauce for dipping"
    ],
    method: [
      "Dip rice paper in warm water until pliable. Layer 4 large prawns, avocado, cucumber, 40g carrot, and herbs. Roll tightly.",
      "Serve with sweet 1 tbsp chilli sauce."
    ],
    phaseBenefit:
      "Light, fresh, and cool — exactly what your body craves at ovulation. Prawns bring zinc and iodine to support thyroid health and egg quality.",
    nutrition: { calories: 280, protein: 18, carbs: 34, fat: 8, fibre: 4 },
    category: "meal",
    tags: ["pescatarian", "ovulatory", "zinc"],
    kidAlternative: "Serve the fillings deconstructed — prawns, avocado slices, cucumber and carrot sticks — with dipping sauce."
  },
  {
    id: "lunch-o6",
    name: "Quinoa Tabbouleh with Fresh Herbs",
    phase: "ovulatory",
    serves: 1,
    prepTime: "15 min",
    cookTime: "12 min",
    keyNutrients: ["Folate", "Zinc", "Antioxidants"],
    ingredients: [
      "40g quinoa, rinsed",
      "50g cucumber, diced",
      "50g cherry tomatoes, halved",
      "15g flat‑leaf parsley, finely chopped",
      "10g fresh mint, finely chopped",
      "1 spring onion, sliced",
      "1 tbsp lemon juice",
      "1 tbsp olive oil"
    ],
    method: [
      "Cook 40g quinoa, let cool. Combine with 50g cucumber, tomatoes, herbs, and 1 onion. Dress with 1 tbsp lemon juice and oil."
    ],
    phaseBenefit:
      "Quinoa provides complete protein and zinc; fresh herbs bring folate — the nutrient your body needs for egg health. A celebration in a bowl.",
    nutrition: { calories: 340, protein: 10, carbs: 36, fat: 16, fibre: 6 },
    category: "meal",
    tags: ["vegan", "ovulatory", "folate"],
    kidAlternative: "Serve quinoa and diced cucumber separately — many kids prefer plain quinoa and raw veggie sticks."
  },
  {
    id: "lunch-o7",
    name: "Zucchini Fritters with Tzatziki",
    phase: "ovulatory",
    serves: 1,
    prepTime: "10 min",
    cookTime: "10 min",
    keyNutrients: ["Zinc", "B vitamins", "Protein"],
    ingredients: [
      "1 medium zucchini (about 150g), grated and squeezed dry",
      "20g chickpea flour",
      "1 large egg",
      "1 tbsp fresh dill, chopped",
      "1 tsp olive oil",
      "50g Greek yoghurt",
      "50g cucumber, grated",
      "1 small garlic clove, minced"
    ],
    method: [
      "Mix 1 medium zucchini, flour, 1 large egg, and dill. Form into two fritters and fry in 1 tsp oil until golden. Make tzatziki with 50g yoghurt, cucumber, and garlic."
    ],
    phaseBenefit:
      "Chickpea flour brings protein and folate; yoghurt adds probiotics. Light, satisfying, and full of the energy that defines this phase.",
    nutrition: { calories: 300, protein: 16, carbs: 22, fat: 16, fibre: 5 },
    category: "meal",
    tags: ["vegetarian", "ovulatory", "zinc"],
    kidAlternative: "Make smaller fritters and serve with yoghurt dip — kids love anything dippable."
  },
  {
    id: "lunch-o8",
    name: "Stuffed Capsicums with Quinoa & Black Beans",
    phase: "ovulatory",
    serves: 1,
    prepTime: "10 min",
    cookTime: "25 min",
    keyNutrients: ["Folate", "Zinc", "Antioxidants"],
    ingredients: [
      "1 large red capsicum, halved and deseeded",
      "40g quinoa, cooked",
      "50g tinned black beans, drained",
      "20g corn kernels",
      "½ tsp ground cumin",
      "15g grated cheese"
    ],
    method: [
      "Mix 40g quinoa, beans, corn, and ½ tsp cumin. Fill 1 large capsicum halves. Top with 15g cheese.",
      "Bake at 190°C for 25 min until tender."
    ],
    phaseBenefit:
      "Colourful capsicums are rich in vitamin C and antioxidants — protecting egg quality at ovulation. Quinoa and beans add zinc and complete protein.",
    nutrition: { calories: 320, protein: 16, carbs: 44, fat: 10, fibre: 10 },
    category: "meal",
    tags: ["vegetarian", "ovulatory", "zinc"],
    kidAlternative: "Serve the filling and cheese on top of plain rice instead of in a capsicum — kids often prefer it that way."
  },

  // ── LUTEAL LUNCHES ──
  {
    id: "lunch-l1",
    name: "Sweet Potato & Black Bean Soup",
    phase: "luteal",
    serves: 1,
    prepTime: "5 min",
    cookTime: "25 min",
    keyNutrients: ["B6", "Magnesium", "Complex carbs"],
    ingredients: [
      "150g sweet potato, peeled and cubed",
      "100g tinned black beans, drained",
      "1 tsp olive oil",
      "50g brown onion, chopped",
      "1 garlic clove, minced",
      "½ tsp ground cumin",
      "250ml vegetable stock",
      "Fresh coriander and lime"
    ],
    method: [
      "Sauté onion in oil, add garlic and cumin. Add sweet potato, beans, and stock. Simmer 20 min until tender.",
      "Blend roughly, leaving some texture. Serve with coriander and lime."
    ],
    phaseBenefit:
      "Sweet potato brings B6 — the vitamin that helps progesterone do its work. Black beans add magnesium to quiet cramping and steady your blood sugar. A warm exhale in a bowl.",
    nutrition: { calories: 380, protein: 14, carbs: 58, fat: 8, fibre: 14 },
    category: "meal",
    tags: ["vegan", "luteal", "magnesium"],
    kidAlternative: "Blend the soup completely smooth and serve with a swirl of yoghurt."
  },
  {
    id: "lunch-l2",
    name: "Chickpea & Pumpkin Curry",
    phase: "luteal",
    serves: 1,
    prepTime: "5 min",
    cookTime: "25 min",
    keyNutrients: ["Magnesium", "B6", "Iron"],
    ingredients: [
      "100g tinned chickpeas, drained",
      "150g pumpkin, cubed",
      "1 tsp coconut oil",
      "50g brown onion, chopped",
      "1 garlic clove, minced",
      "1 tsp mild curry powder",
      "150ml light coconut milk",
      "50g baby spinach",
      "50g basmati rice (dry weight), cooked"
    ],
    method: [
      "Cook rice. Sauté onion and garlic in oil, add curry powder. Add pumpkin, chickpeas, coconut milk; simmer 20 min.",
      "Stir in 50g spinach until wilted. Serve over 50g rice."
    ],
    phaseBenefit:
      "Your body craves warmth and substance now. Chickpeas bring magnesium and iron; pumpkin offers beta‑carotene and B6. The spice soothes, and the coconut milk holds you.",
    nutrition: { calories: 520, protein: 18, carbs: 64, fat: 18, fibre: 12 },
    category: "meal",
    tags: ["vegan", "luteal", "magnesium"],
    kidAlternative: "Serve plain rice with chickpeas and a little coconut milk sauce — leave out the spices."
  },
  {
    id: "lunch-l3",
    name: "Minestrone Soup",
    phase: "luteal",
    serves: 1,
    prepTime: "5 min",
    cookTime: "25 min",
    keyNutrients: ["Fibre", "Vitamin C", "Complex carbs"],
    ingredients: [
      "1 tsp olive oil",
      "50g brown onion, chopped",
      "50g carrot, diced",
      "50g celery, diced",
      "50g zucchini, diced",
      "1 garlic clove, minced",
      "200g tinned diced tomatoes",
      "200ml vegetable stock",
      "50g tinned cannellini beans, drained",
      "30g small pasta shapes (dry weight)",
      "1 tsp dried oregano",
      "1 tbsp Parmesan (optional)"
    ],
    method: [
      "Sauté onion, carrot, celery, zucchini in oil. Add garlic, tomatoes, stock, beans, oregano. Simmer 15 min.",
      "Add pasta, cook until tender. Serve with 1 tbsp Parmesan if using."
    ],
    phaseBenefit:
      "Fibre‑rich and sustaining; complex carbs help manage the heightened appetite of this phase. A warm, familiar bowl that feels like a grandmother’s kitchen.",
    nutrition: { calories: 420, protein: 16, carbs: 58, fat: 10, fibre: 14 },
    category: "meal",
    tags: ["vegetarian", "luteal", "high-fibre"],
    kidAlternative: "Cook the pasta separately and serve with a little of the tomato broth — kids prefer simpler soups."
  },
  {
    id: "lunch-l4",
    name: "Baked Potato with Hummus & Salad",
    phase: "luteal",
    serves: 1,
    prepTime: "2 min",
    cookTime: "50 min",
    keyNutrients: ["Complex carbs", "Fibre", "Magnesium"],
    ingredients: [
      "1 large baking potato (about 250g)",
      "40g hummus",
      "30g mixed salad leaves",
      "50g cucumber, diced",
      "50g tomato, diced",
      "1 tsp olive oil",
      "1 tsp lemon juice"
    ],
    method: [
      "Pierce potato and bake at 200°C for 45‑50 min until soft. Cut open and top with hummus.",
      "Serve with 30g salad dressed in oil and lemon."
    ],
    phaseBenefit:
      "Starchy potato offers the complex carbs your body craves; hummus adds magnesium and protein. A simple, grounding meal.",
    nutrition: { calories: 380, protein: 12, carbs: 60, fat: 10, fibre: 10 },
    category: "meal",
    tags: ["vegan", "luteal", "comfort"],
    kidAlternative: "Serve with a small portion of plain buttered potato and hummus on the side."
  },
  {
    id: "lunch-l5",
    name: "Chicken & Sweet Potato Soup",
    phase: "luteal",
    serves: 1,
    prepTime: "5 min",
    cookTime: "25 min",
    keyNutrients: ["Protein", "B6", "Complex carbs"],
    ingredients: [
      "100g chicken breast, diced",
      "150g sweet potato, cubed",
      "50g brown onion, chopped",
      "1 garlic clove, minced",
      "1 tsp olive oil",
      "300ml chicken stock",
      "½ tsp smoked paprika",
      "30ml coconut cream"
    ],
    method: [
      "Sauté onion and garlic in oil. Add sweet potato, stock, paprika. Simmer 15 min.",
      "Add chicken, cook 8 min. Stir in coconut cream, season."
    ],
    phaseBenefit:
      "Sweet potato brings B6 for progesterone support; chicken adds protein. A warm, sustaining bowl that asks very little of you.",
    nutrition: { calories: 380, protein: 28, carbs: 38, fat: 12 },
    category: "meal",
    tags: ["luteal", "protein"],
    kidAlternative: "Blend the soup smooth and serve with crusty bread for dipping."
  },
  {
    id: "lunch-l6",
    name: "Stuffed Sweet Potato with Tahini Slaw",
    phase: "luteal",
    serves: 1,
    prepTime: "5 min",
    cookTime: "35 min",
    keyNutrients: ["B6", "Complex carbs", "Fibre"],
    ingredients: [
      "1 medium sweet potato (about 200g)",
      "50g red cabbage, shredded",
      "30g carrot, grated",
      "1 tbsp tahini (15g)",
      "1 tsp lemon juice",
      "1 tsp olive oil",
      "1 tbsp pumpkin seeds (10g)"
    ],
    method: [
      "Bake sweet potato at 200°C for 35 min. Massage cabbage and carrot with tahini, lemon juice, and oil.",
      "Split sweet 1 medium potato, fill with slaw, top with 1 tbsp pumpkin seeds."
    ],
    phaseBenefit:
      "Sweet potato is rich in B6 for progesterone; tahini adds calcium and magnesium. A bowl that holds you steady.",
    nutrition: { calories: 350, protein: 10, carbs: 48, fat: 14, fibre: 10 },
    category: "meal",
    tags: ["vegan", "luteal", "magnesium"],
    kidAlternative: "Serve the sweet potato mashed with a little butter, and raw carrot and cabbage sticks on the side."
  },
  {
    id: "lunch-l7",
    name: "Tuna Melt on Sourdough",
    phase: "luteal",
    serves: 1,
    prepTime: "5 min",
    cookTime: "5 min",
    keyNutrients: ["Protein", "Calcium", "Omega‑3"],
    ingredients: [
      "95g tin tuna in spring water, drained",
      "2 slices sourdough bread (about 100g total)",
      "1 tbsp mayonnaise",
      "20g red onion, diced",
      "30g cheddar cheese, sliced",
      "Salt, pepper, lemon juice"
    ],
    method: [
      "Mix tuna with mayo, 20g onion, lemon juice, salt, and pepper. Pile onto one slice of sourdough, top with 30g cheese.",
      "Grill or toast until the 30g cheese melts and the 2 slices bread is golden."
    ],
    phaseBenefit:
      "Comfort food that answers the luteal craving without the crash. Tuna brings omega‑3; cheese adds calcium — both help your body through the pre‑menstrual days.",
    nutrition: { calories: 460, protein: 30, carbs: 34, fat: 22, fibre: 4 },
    category: "meal",
    tags: ["pescatarian", "luteal", "comfort"],
    kidAlternative: "Make a plain cheese toastie — kids often prefer it without the tuna."
  },

  // ── MORE LUNCHES to reach 50+ ──
  {
    id: "lunch-x1",
    name: "Lentil Bolognese with Spaghetti",
    phase: "follicular",
    serves: 1,
    prepTime: "5 min",
    cookTime: "25 min",
    keyNutrients: ["Iron", "Fibre", "Plant protein"],
    ingredients: [
      "60g dried brown lentils",
      "1 tsp olive oil",
      "50g brown onion, chopped",
      "1 garlic clove, minced",
      "50g carrot, grated",
      "200g tinned diced tomatoes",
      "1 tsp dried oregano",
      "60g wholemeal spaghetti (dry weight)",
      "1 tbsp nutritional yeast (optional)"
    ],
    method: [
      "Cook spaghetti. Sauté onion, garlic, carrot in oil. Add lentils, tomatoes, oregano, and 150ml water. Simmer 20 min until thick.",
      "Serve sauce over 60g spaghetti, top with 1 tbsp nutritional yeast if using."
    ],
    phaseBenefit:
      "Iron‑rich lentils with vitamin C from tomatoes for absorption. A plant‑based bolognese that builds you up from the inside.",
    nutrition: { calories: 480, protein: 24, carbs: 68, fat: 8, fibre: 14 },
    category: "meal",
    tags: ["vegan", "follicular", "iron"],
    kidAlternative: "Serve plain spaghetti with a little tomato sauce on the side — blend the lentil sauce smooth for picky eaters."
  },
  {
    id: "lunch-x2",
    name: "Pumpkin & Kale Chilli",
    phase: "luteal",
    serves: 1,
    prepTime: "5 min",
    cookTime: "30 min",
    keyNutrients: ["Magnesium", "Iron", "B6"],
    ingredients: [
      "150g pumpkin, cubed",
      "100g tinned kidney beans, drained",
      "1 tsp olive oil",
      "50g brown onion, chopped",
      "1 garlic clove, minced",
      "200g tinned diced tomatoes",
      "½ tsp ground cumin",
      "½ tsp smoked paprika",
      "30g kale, chopped"
    ],
    method: [
      "Sauté onion and garlic in oil. Add pumpkin, beans, tomatoes, cumin, paprika, and 100ml water. Simmer 25 min.",
      "Stir in 30g kale until wilted. Season."
    ],
    phaseBenefit:
      "Pumpkin brings B6 for progesterone; kidney beans add magnesium to ease PMS. Warming, hearty, and deeply comforting.",
    nutrition: { calories: 360, protein: 16, carbs: 50, fat: 8, fibre: 16 },
    category: "meal",
    tags: ["vegan", "luteal", "magnesium"],
    kidAlternative: "Serve chilli over rice and let them top with grated cheese."
  },
  {
    id: "lunch-x3",
    name: "Mushroom & Lentil Shepherd's Pie",
    phase: "menstrual",
    serves: 1,
    prepTime: "10 min",
    cookTime: "40 min",
    keyNutrients: ["Iron", "B vitamins", "Comfort"],
    ingredients: [
      "50g dried brown lentils, cooked",
      "80g mushrooms, sliced",
      "50g brown onion, chopped",
      "1 garlic clove, minced",
      "1 tsp tomato paste",
      "100ml vegetable stock",
      "½ tsp dried thyme",
      "200g potato, boiled and mashed with 1 tsp butter"
    ],
    method: [
      "Sauté onion and mushrooms. Add garlic, lentils, tomato paste, stock, and thyme; simmer 10 min.",
      "Transfer to a small baking dish, top with mash. Bake at 200°C for 20 min until golden."
    ],
    phaseBenefit:
      "Lentils bring iron; mushrooms add B vitamins. Deeply nourishing comfort food for days when your body asks for rest.",
    nutrition: { calories: 420, protein: 20, carbs: 56, fat: 12, fibre: 12 },
    category: "meal",
    tags: ["vegan", "menstrual", "iron"],
    kidAlternative: "Serve the mashed potato separately alongside a simple lentil soup."
  },
  {
    id: "lunch-x4",
    name: "Egg & Avocado Rice Bowl",
    phase: "follicular",
    serves: 1,
    prepTime: "5 min",
    cookTime: "15 min",
    keyNutrients: ["Protein", "Choline", "Healthy fats"],
    ingredients: [
      "2 large eggs",
      "30g avocado, sliced",
      "50g brown rice (dry weight), cooked",
      "80g steamed broccoli",
      "1 tsp tamari",
      "½ tsp sesame oil",
      "1 tsp sesame seeds"
    ],
    method: [
      "Boil eggs 7 min, cool, peel, halve. Arrange rice, eggs, avocado, and broccoli in a bowl.",
      "Drizzle with 1 tsp tamari and sesame oil, sprinkle with 1 tsp sesame seeds."
    ],
    phaseBenefit:
      "Eggs bring choline and complete protein; broccoli supports oestrogen metabolism. A simple bowl that builds.",
    nutrition: { calories: 460, protein: 22, carbs: 48, fat: 18, fibre: 6 },
    category: "meal",
    tags: ["vegetarian", "follicular", "protein"],
    kidAlternative: "Serve soft‑boiled eggs with toast soldiers, rice, and broccoli on the side."
  },
  {
    id: "lunch-x5",
    name: "Tomato & Lentil Soup",
    phase: "luteal",
    serves: 1,
    prepTime: "5 min",
    cookTime: "25 min",
    keyNutrients: ["Iron", "Lycopene", "Fibre"],
    ingredients: [
      "60g dried red lentils",
      "1 tsp olive oil",
      "50g brown onion, chopped",
      "1 garlic clove, minced",
      "200g tinned diced tomatoes",
      "200ml vegetable stock",
      "½ tsp dried basil",
      "1 tsp balsamic vinegar (optional)"
    ],
    method: [
      "Sauté onion and garlic in oil. Add lentils, tomatoes, stock, and basil. Simmer 20 min.",
      "Blend roughly. Stir in balsamic if using. Season."
    ],
    phaseBenefit:
      "Lentils bring iron; roasted tomato flavour grounds you. A warm, familiar soup for the days when your body asks for simplicity.",
    nutrition: { calories: 340, protein: 18, carbs: 48, fat: 6, fibre: 14 },
    category: "meal",
    tags: ["vegan", "luteal", "iron"],
    kidAlternative: "Serve with buttered toast cut into soldiers for dipping."
  },
  {
    id: "lunch-x6",
    name: "Salmon & Rocket Salad",
    phase: "follicular",
    serves: 1,
    prepTime: "5 min",
    cookTime: "10 min",
    keyNutrients: ["Omega‑3", "Protein", "Iron"],
    ingredients: [
      "130g salmon fillet",
      "30g rocket leaves",
      "20g red onion, sliced",
      "1 tsp capers",
      "1 tbsp olive oil",
      "1 tsp lemon juice",
      "Salt and pepper"
    ],
    method: [
      "Pan‑fry salmon skin‑side down 4 min, flip 3 min. Toss rocket with oil, lemon juice, onion, and capers. Flake salmon over."
    ],
    phaseBenefit:
      "Salmon’s omega‑3s support rising oestrogen; rocket adds iron. Light, fresh, and full of the energy your body is building.",
    nutrition: { calories: 380, protein: 30, carbs: 4, fat: 28, fibre: 2 },
    category: "meal",
    tags: ["pescatarian", "follicular", "omega-3"],
    kidAlternative: "Serve salmon fillet alongside plain pasta or rice."
  },
  {
    id: "lunch-x7",
    name: "Chicken & Beetroot Salad with Feta",
    phase: "ovulatory",
    serves: 1,
    prepTime: "5 min",
    cookTime: "30 min (beetroot)",
    keyNutrients: ["Protein", "Nitric oxide", "Antioxidants"],
    ingredients: [
      "100g chicken breast, grilled and sliced",
      "1 medium beetroot (about 120g), roasted and quartered",
      "30g mixed salad leaves",
      "20g feta cheese, crumbled",
      "10g walnuts, chopped",
      "1 tbsp olive oil",
      "1 tsp balsamic vinegar"
    ],
    method: [
      "Roast beetroot in foil at 200°C for 30 min. Grill chicken 6 min each side. Slice.",
      "Toss leaves with 1 tbsp oil and vinegar. Top with chicken, 1 medium beetroot, feta, and 10g walnuts."
    ],
    phaseBenefit:
      "Beetroot supports nitric oxide production — helping blood flow to the uterus. Light and antioxidant‑rich for ovulation.",
    nutrition: { calories: 420, protein: 30, carbs: 20, fat: 24, fibre: 6 },
    category: "meal",
    tags: ["ovulatory", "protein"],
    kidAlternative: "Serve beetroot wedges (they look like lollies!) alongside plain chicken pieces."
  },
  {
    id: "lunch-x8",
    name: "Tofu Pad Thai",
    phase: "follicular",
    serves: 1,
    prepTime: "5 min",
    cookTime: "12 min",
    keyNutrients: ["Phytoestrogens", "Protein", "Complex carbs"],
    ingredients: [
      "100g firm tofu, cubed",
      "80g flat rice noodles (dry weight)",
      "50g bean sprouts",
      "1 tbsp tamari",
      "1 tsp maple syrup",
      "1 tbsp peanut butter",
      "1 tsp lime juice",
      "1 tsp sesame oil",
      "10g crushed peanuts",
      "Fresh coriander"
    ],
    method: [
      "Cook 80g noodles. Whisk tamari, maple, 1 tbsp peanut butter, lime juice. Pan‑fry 100g tofu in sesame oil until golden.",
      "Toss 80g noodles and 100g tofu with sauce. Top with 50g bean sprouts, peanuts, and coriander."
    ],
    phaseBenefit:
      "Tofu’s phytoestrogens complement rising oestrogen. This is the noodle bowl that tastes like a Friday night but feeds your follicular phase.",
    nutrition: { calories: 520, protein: 24, carbs: 56, fat: 22, fibre: 6 },
    category: "meal",
    tags: ["vegan", "follicular", "phytoestrogen"],
    kidAlternative: "Serve plain rice noodles with a drizzle of soy sauce and a few pieces of plain tofu."
  },
  {
    id: "lunch-x9",
    name: "Warm Lentil Dhal with Turmeric",
    phase: "menstrual",
    serves: 1,
    prepTime: "5 min",
    cookTime: "25 min",
    keyNutrients: ["Iron", "Anti‑inflammatory", "Magnesium"],
    ingredients: [
      "60g dried red lentils",
      "1 tsp coconut oil",
      "50g brown onion, chopped",
      "1 garlic clove, minced",
      "1 tsp ground turmeric",
      "½ tsp ground cumin",
      "200ml light coconut milk",
      "100ml water",
      "Fresh coriander"
    ],
    method: [
      "Sauté onion and garlic in oil. Add turmeric and cumin, stir 30 sec. Add lentils, coconut milk, and water. Simmer 20 min.",
      "Serve with coriander."
    ],
    phaseBenefit:
      "Turmeric soothes the inflammation that causes cramping; lentils restore iron. A golden bowl of quiet love.",
    nutrition: { calories: 380, protein: 18, carbs: 42, fat: 14, fibre: 14 },
    category: "meal",
    tags: ["vegan", "menstrual", "anti-inflammatory"],
    kidAlternative: "Serve with plain rice — the mild coconut flavour is usually kid‑friendly."
  },
  {
    id: "lunch-x10",
    name: "Roasted Cauliflower & Chickpea Bowl",
    phase: "luteal",
    serves: 1,
    prepTime: "5 min",
    cookTime: "25 min",
    keyNutrients: ["Sulforaphane", "Magnesium", "Fibre"],
    ingredients: [
      "150g cauliflower florets",
      "80g tinned chickpeas, drained",
      "1 tsp olive oil",
      "½ tsp ground cumin",
      "½ tsp smoked paprika",
      "1 tbsp tahini (15g)",
      "1 tsp lemon juice",
      "30g rocket leaves"
    ],
    method: [
      "Toss cauliflower and chickpeas with oil, cumin, and paprika. Roast at 200°C for 25 min.",
      "Whisk 1 tbsp tahini with lemon juice and a splash of water. Serve over 30g rocket, drizzled with dressing."
    ],
    phaseBenefit:
      "Cauliflower supports oestrogen clearance; chickpeas bring magnesium to ease PMS. A warm, grounding bowl.",
    nutrition: { calories: 340, protein: 14, carbs: 28, fat: 18, fibre: 12 },
    category: "meal",
    tags: ["vegan", "luteal", "magnesium"],
    kidAlternative: "Serve roasted cauliflower and plain chickpeas as finger food — no dressing needed."
  },

  // ═══════════════════════════════════════════════════════════
  // DINNERS (50+)
  // ═══════════════════════════════════════════════════════════

  {
    id: "dinner-m1",
    name: "Slow‑Cooked Beef & Sweet Potato Stew",
    phase: "menstrual",
    serves: 1,
    prepTime: "10 min",
    cookTime: "1 hr 45 min",
    keyNutrients: ["Haem iron", "B12", "Slow carbs"],
    ingredients: [
      "120g beef chuck, cubed",
      "1 tbsp olive oil",
      "50g brown onion, chopped",
      "1 garlic clove, minced",
      "150g sweet potato, cubed",
      "80g carrot, sliced",
      "1 tbsp tomato paste",
      "300ml beef stock",
      "1 sprig fresh thyme"
    ],
    method: [
      "Brown beef in 1 tbsp oil. Sauté onion. Add garlic, 150g sweet potato, carrot, 1 tbsp tomato paste, stock, thyme. Bring to simmer.",
      "Cover, cook on low heat 1½ hours until beef is tender. Season."
    ],
    phaseBenefit:
      "Beef brings haem iron — the most absorbable kind — and sweet potato offers the grounding comfort that only root vegetables can. Let it cook while you rest.",
    nutrition: { calories: 450, protein: 30, carbs: 38, fat: 18, fibre: 6 },
    category: "meal",
    tags: ["menstrual", "iron", "comfort"],
    kidAlternative: "Serve the beef and vegetables over mashed potato — a deconstructed stew they can explore."
  },
  {
    id: "dinner-m2",
    name: "Lamb Shanks with Root Vegetables",
    phase: "menstrual",
    serves: 1,
    prepTime: "10 min",
    cookTime: "2 hr",
    keyNutrients: ["Haem iron", "Zinc", "Collagen"],
    ingredients: [
      "1 lamb shank (about 250g)",
      "1 tbsp olive oil",
      "50g brown onion, chopped",
      "1 garlic clove, minced",
      "100g parsnip, chopped",
      "80g carrot, chopped",
      "200ml beef stock",
      "100g tinned diced tomatoes",
      "1 tsp fresh rosemary, chopped"
    ],
    method: [
      "Brown lamb in 1 tbsp oil. Sauté onion and garlic. Add 100g parsnip, carrot, stock, 100g tomatoes, and rosemary.",
      "Return lamb, cover, and simmer 2 hours until meat falls off the bone."
    ],
    phaseBenefit:
      "Lamb is rich in haem iron and zinc — both depleted during menstruation. Slow cooking makes the nutrients deeply available to your body.",
    nutrition: { calories: 520, protein: 38, carbs: 28, fat: 26, fibre: 6 },
    category: "meal",
    tags: ["menstrual", "iron", "comfort"],
    kidAlternative: "Pull the meat off the bone and serve with mashed potato and a few carrot rounds."
  },
  {
    id: "dinner-m3",
    name: "Salmon with Roasted Veg & Quinoa",
    phase: "menstrual",
    serves: 1,
    prepTime: "5 min",
    cookTime: "20 min",
    keyNutrients: ["Omega‑3", "Complete protein", "Iron"],
    ingredients: [
      "130g salmon fillet",
      "40g quinoa, rinsed",
      "100g mixed vegetables (capsicum, zucchini, red onion), diced",
      "1 tbsp olive oil",
      "1 tsp lemon juice",
      "Salt and pepper"
    ],
    method: [
      "Cook quinoa. Toss veg with ½ tbsp oil, roast at 200°C 15 min. Pan‑fry salmon skin‑side down 4 min, flip 3 min.",
      "Serve salmon over 40g quinoa with roasted veg and a squeeze of lemon."
    ],
    phaseBenefit:
      "Salmon’s omega‑3s calm the inflammation that drives cramps; quinoa brings iron for blood building. A plate that restores.",
    nutrition: { calories: 520, protein: 36, carbs: 40, fat: 22, fibre: 6 },
    category: "meal",
    tags: ["pescatarian", "menstrual", "omega-3"],
    kidAlternative: "Serve salmon, quinoa, and veg in separate piles — let them explore."
  },
  {
    id: "dinner-m4",
    name: "Chicken Thigh Curry with Brown Rice",
    phase: "menstrual",
    serves: 1,
    prepTime: "5 min",
    cookTime: "30 min",
    keyNutrients: ["Protein", "Iron", "Anti‑inflammatory"],
    ingredients: [
      "150g boneless chicken thigh, diced",
      "1 tsp coconut oil",
      "50g brown onion, chopped",
      "1 garlic clove, minced",
      "1 tsp mild curry powder",
      "½ tsp ground turmeric",
      "150ml light coconut milk",
      "50g brown rice (dry weight), cooked",
      "Fresh coriander"
    ],
    method: [
      "Cook 50g rice. Sauté 50g onion and garlic in 1 tsp oil, add curry powder and ½ tsp turmeric. Add chicken, brown lightly.",
      "Pour in coconut milk, simmer 20 min. Serve over rice with coriander."
    ],
    phaseBenefit:
      "Iron from chicken thighs with anti‑inflammatory turmeric. The warmth of the curry comforts your cramping body.",
    nutrition: { calories: 520, protein: 32, carbs: 48, fat: 20, fibre: 5 },
    category: "meal",
    tags: ["menstrual", "anti-inflammatory"],
    kidAlternative: "Serve plain rice with a small amount of the chicken and sauce — keep the spices mild."
  },
  {
    id: "dinner-m5",
    name: "Beef Bolognese with Spaghetti",
    phase: "menstrual",
    serves: 1,
    prepTime: "5 min",
    cookTime: "25 min",
    keyNutrients: ["Haem iron", "B12", "Complete protein"],
    ingredients: [
      "120g beef mince (lean)",
      "1 tsp olive oil",
      "50g brown onion, chopped",
      "1 garlic clove, minced",
      "50g carrot, grated",
      "200g tinned diced tomatoes",
      "1 tsp dried oregano",
      "60g wholemeal spaghetti (dry weight)",
      "1 tbsp Parmesan cheese (optional)"
    ],
    method: [
      "Cook spaghetti. Sauté onion, garlic, carrot in oil. Add mince, brown. Add tomatoes and oregano, simmer 20 min.",
      "Serve sauce over 60g spaghetti, top with Parmesan if using."
    ],
    phaseBenefit:
      "Beef is the richest source of haem iron and B12 — essential for menstrual recovery. A classic that never stops giving.",
    nutrition: { calories: 520, protein: 32, carbs: 54, fat: 18, fibre: 8 },
    category: "meal",
    tags: ["menstrual", "iron"],
    kidAlternative: "Serve plain spaghetti with a little mince and tomato sauce — no herbs if they prefer."
  },
  {
    id: "dinner-m6",
    name: "Chickpea & Sweet Potato Curry",
    phase: "menstrual",
    serves: 1,
    prepTime: "5 min",
    cookTime: "25 min",
    keyNutrients: ["Iron", "B6", "Complex carbs"],
    ingredients: [
      "100g tinned chickpeas, drained",
      "150g sweet potato, cubed",
      "1 tsp coconut oil",
      "50g brown onion, chopped",
      "1 garlic clove, minced",
      "1 tsp mild curry powder",
      "150ml light coconut milk",
      "50g brown rice (dry weight), cooked"
    ],
    method: [
      "Cook rice. Sauté onion and garlic in oil, add curry powder. Add sweet potato and coconut milk, simmer 20 min.",
      "Add 100g chickpeas, warm through. Serve over 50g rice."
    ],
    phaseBenefit:
      "Chickpeas bring iron and protein; sweet potato offers B6 and complex carbs. Warming, satisfying, and deeply restoring.",
    nutrition: { calories: 500, protein: 18, carbs: 62, fat: 18, fibre: 14 },
    category: "meal",
    tags: ["vegan", "menstrual", "iron"],
    kidAlternative: "Serve rice with chickpeas and a little coconut milk — leave out the curry powder for sensitive palates."
  },
  {
    id: "dinner-m7",
    name: "Pan‑Seared Salmon with Mashed Potato & Greens",
    phase: "menstrual",
    serves: 1,
    prepTime: "5 min",
    cookTime: "20 min",
    keyNutrients: ["Omega‑3", "Iron", "Complex carbs"],
    ingredients: [
      "130g salmon fillet",
      "200g potato, peeled and cubed",
      "1 tsp butter",
      "2 tbsp milk",
      "80g green beans, trimmed",
      "1 tsp olive oil",
      "Lemon wedge"
    ],
    method: [
      "Boil potato 15 min, drain, mash with butter and milk. Steam beans 4 min.",
      "Pan‑fry salmon skin‑side down 4 min, flip 3 min. Serve on mash with beans and lemon."
    ],
    phaseBenefit:
      "Salmon’s omega‑3s ease inflammation; potatoes offer the comfort your body craves. A plate that feels like a hug.",
    nutrition: { calories: 520, protein: 34, carbs: 44, fat: 22, fibre: 6 },
    category: "meal",
    tags: ["pescatarian", "menstrual", "omega-3"],
    kidAlternative: "Serve salmon, mash, and beans separately — most kids love mashed potato."
  },
  {
    id: "dinner-m8",
    name: "Tofu & Vegetable Thai Green Curry",
    phase: "menstrual",
    serves: 1,
    prepTime: "5 min",
    cookTime: "20 min",
    keyNutrients: ["Anti‑inflammatory", "Phytoestrogens", "Protein"],
    ingredients: [
      "120g firm tofu, cubed",
      "1 tsp coconut oil",
      "1 tbsp green curry paste",
      "150ml light coconut milk",
      "80g mixed vegetables (capsicum, zucchini, green beans), sliced",
      "50g jasmine rice (dry weight), cooked",
      "Fresh Thai basil (or regular basil)"
    ],
    method: [
      "Cook rice. Sauté curry paste in oil 1 min. Add coconut milk and vegetables, simmer 10 min.",
      "Add tofu, cook 5 min. Serve over rice with basil."
    ],
    phaseBenefit:
      "Coconut milk brings warming fats; green curry paste is packed with anti‑inflammatory ginger and lemongrass. This curry eases your cramping while it fills your belly.",
    nutrition: { calories: 480, protein: 20, carbs: 50, fat: 22, fibre: 6 },
    category: "meal",
    tags: ["vegan", "menstrual", "anti-inflammatory"],
    kidAlternative: "Serve plain rice with a little coconut milk and plain tofu — leave out the curry paste."
  },

  // ── FOLLICULAR DINNERS ──
  {
    id: "dinner-f1",
    name: "Lemon Herb Salmon with Asparagus",
    phase: "follicular",
    serves: 1,
    prepTime: "5 min",
    cookTime: "15 min",
    keyNutrients: ["Omega‑3", "Folate", "Protein"],
    ingredients: [
      "130g salmon fillet",
      "80g asparagus spears, trimmed",
      "1 tbsp olive oil",
      "1 lemon, juiced and zested",
      "1 garlic clove, minced",
      "Fresh dill"
    ],
    method: [
      "Place salmon and asparagus on a lined tray. Drizzle with 1 tbsp oil, lemon zest, garlic, and dill.",
      "Bake at 200°C for 12‑15 min. Squeeze fresh lemon over before serving."
    ],
    phaseBenefit:
      "Salmon’s omega‑3s support oestrogen synthesis; asparagus is rich in folate — the vitamin your body uses to build new cells. A dinner that feels like spring.",
    nutrition: { calories: 420, protein: 34, carbs: 8, fat: 28, fibre: 4 },
    category: "meal",
    tags: ["pescatarian", "follicular", "omega-3"],
    kidAlternative: "Serve salmon alongside plain pasta with butter — asparagus may be a stretch, but offer a piece."
  },
  {
    id: "dinner-f2",
    name: "Chicken Stir‑Fry with Broccoli & Brown Rice",
    phase: "follicular",
    serves: 1,
    prepTime: "5 min",
    cookTime: "15 min",
    keyNutrients: ["Lean protein", "Sulforaphane", "Complex carbs"],
    ingredients: [
      "120g chicken breast, sliced",
      "1 tbsp sesame oil",
      "100g broccoli florets",
      "80g carrot, julienned",
      "1 garlic clove, minced",
      "1 tsp grated ginger",
      "1 tbsp tamari",
      "50g brown rice (dry weight), cooked"
    ],
    method: [
      "Cook rice. Stir‑fry chicken in oil, set aside. Add garlic, ginger, broccoli, carrot; cook 3 min.",
      "Return chicken, add 1 tbsp tamari, toss. Serve over 50g rice."
    ],
    phaseBenefit:
      "Lean protein with cruciferous broccoli — your body can use the sulforaphane to process oestrogen efficiently. Fast, fresh, and full of energy.",
    nutrition: { calories: 480, protein: 34, carbs: 50, fat: 14, fibre: 6 },
    category: "meal",
    tags: ["follicular", "high-protein"],
    kidAlternative: "Serve chicken, rice, and steamed broccoli separately with a drizzle of soy sauce."
  },
  {
    id: "dinner-f3",
    name: "Baked Fish with Lemon Butter & Greens",
    phase: "follicular",
    serves: 1,
    prepTime: "5 min",
    cookTime: "18 min",
    keyNutrients: ["Omega‑3", "Vitamin D", "Lean protein"],
    ingredients: [
      "150g firm white fish fillet",
      "1 tbsp butter, melted",
      "1 lemon, juiced",
      "80g green beans, trimmed",
      "1 tsp olive oil",
      "Fresh dill",
      "Salt and pepper"
    ],
    method: [
      "Place fish in a small baking dish. Pour melted 1 tbsp butter and lemon juice over. Sprinkle with dill.",
      "Bake at 200°C for 15 min. Steam beans 4 min, toss with oil. Serve with fish."
    ],
    phaseBenefit:
      "White fish is lean and easily digestible — perfect for the building follicular phase. The greens add folate and iron.",
    nutrition: { calories: 350, protein: 32, carbs: 10, fat: 20, fibre: 4 },
    category: "meal",
    tags: ["pescatarian", "follicular", "omega-3"],
    kidAlternative: "Serve fish with tartare sauce and plain green beans on the side."
  },
  {
    id: "dinner-f4",
    name: "Lamb Cutlets with Roasted Vegetables",
    phase: "follicular",
    serves: 1,
    prepTime: "5 min",
    cookTime: "25 min",
    keyNutrients: ["Haem iron", "Zinc", "Protein"],
    ingredients: [
      "2 lamb cutlets (about 150g total)",
      "1 tbsp olive oil",
      "100g mixed vegetables (kumara, capsicum, red onion, zucchini), diced",
      "1 tsp fresh rosemary, chopped",
      "Salt and pepper"
    ],
    method: [
      "Toss vegetables with ½ tbsp oil and rosemary, roast at 200°C 20 min.",
      "Season lamb, pan‑fry 3 min each side. Rest 5 min. Serve with vegetables."
    ],
    phaseBenefit:
      "Lamb provides haem iron and zinc — excellent for follicular development. The rosemary and roasted veg make it feel special.",
    nutrition: { calories: 480, protein: 32, carbs: 28, fat: 26, fibre: 6 },
    category: "meal",
    tags: ["follicular", "iron"],
    kidAlternative: "Serve cutlets (kids love eating with their hands) alongside plain roasted kumara."
  },
  {
    id: "dinner-f5",
    name: "Lentil Bolognese with Pasta",
    phase: "follicular",
    serves: 1,
    prepTime: "5 min",
    cookTime: "25 min",
    keyNutrients: ["Iron", "Fibre", "Plant protein"],
    ingredients: [
      "60g dried brown lentils",
      "1 tsp olive oil",
      "50g brown onion, chopped",
      "1 garlic clove, minced",
      "50g carrot, grated",
      "200g tinned diced tomatoes",
      "1 tsp dried oregano",
      "60g wholemeal spaghetti (dry weight)",
      "1 tbsp nutritional yeast (optional)"
    ],
    method: [
      "Cook spaghetti. Sauté onion, garlic, carrot in oil. Add lentils, tomatoes, oregano, and 150ml water. Simmer 20 min until thick.",
      "Serve over 60g spaghetti, top with 1 tbsp nutritional yeast."
    ],
    phaseBenefit:
      "Plant‑based and iron‑rich — the tomatoes add vitamin C for absorption. A dinner that builds you up.",
    nutrition: { calories: 480, protein: 24, carbs: 68, fat: 8, fibre: 14 },
    category: "meal",
    tags: ["vegan", "follicular", "iron"],
    kidAlternative: "Blend the lentil sauce smooth and serve over plain spaghetti — they won't notice the lentils."
  },
  {
    id: "dinner-f6",
    name: "Chicken Schnitzel with Sweet Potato Mash",
    phase: "follicular",
    serves: 1,
    prepTime: "10 min",
    cookTime: "20 min",
    keyNutrients: ["Protein", "B6", "Complex carbs"],
    ingredients: [
      "120g chicken breast, butterflied",
      "1 large egg, beaten",
      "30g breadcrumbs",
      "1 tbsp olive oil",
      "200g sweet potato, boiled and mashed with 1 tsp butter",
      "80g green beans, steamed",
      "Lemon wedge"
    ],
    method: [
      "Dip chicken in egg, then breadcrumbs. Pan‑fry in oil 4‑5 min each side until golden and cooked through.",
      "Serve with 200g sweet potato mash and green beans, and a squeeze of lemon."
    ],
    phaseBenefit:
      "Lean protein with B6‑rich sweet potato — fuel for the building energy of this phase. Crispy, comforting, and satisfying.",
    nutrition: { calories: 500, protein: 36, carbs: 48, fat: 16, fibre: 8 },
    category: "meal",
    tags: ["follicular", "protein"],
    kidAlternative: "This is already a kid‑favourite — just cut the schnitzel into strips and serve with mash."
  },
  {
    id: "dinner-f7",
    name: "Grilled Fish Tacos with Slaw",
    phase: "follicular",
    serves: 1,
    prepTime: "10 min",
    cookTime: "8 min",
    keyNutrients: ["Omega‑3", "Vitamin C", "Lean protein"],
    ingredients: [
      "120g firm white fish fillet",
      "½ tsp ground cumin",
      "2 small corn tortillas",
      "50g red cabbage, shredded",
      "30g carrot, grated",
      "1 tbsp Greek yoghurt",
      "1 tsp lime juice",
      "Fresh coriander"
    ],
    method: [
      "Season fish with cumin, grill 3‑4 min each side. Warm tortillas.",
      "Mix 50g cabbage and carrot with 1 tbsp yoghurt and lime juice. Flake fish into 2 small tortillas, top with slaw and coriander."
    ],
    phaseBenefit:
      "Light, fresh protein with vitamin C from cabbage — energising for the follicular phase. A dinner that feels like summer.",
    nutrition: { calories: 360, protein: 28, carbs: 32, fat: 12, fibre: 6 },
    category: "meal",
    tags: ["pescatarian", "follicular", "omega-3"],
    kidAlternative: "Serve fish pieces, tortillas, and raw veg separately — let them build their own."
  },
  {
    id: "dinner-f8",
    name: "Tempeh & Broccoli Stir‑Fry",
    phase: "follicular",
    serves: 1,
    prepTime: "5 min",
    cookTime: "15 min",
    keyNutrients: ["Probiotics", "Phytoestrogens", "Protein"],
    ingredients: [
      "120g tempeh, cubed",
      "1 tbsp sesame oil",
      "100g broccoli florets",
      "80g carrot, julienned",
      "1 garlic clove, minced",
      "1 tsp grated ginger",
      "1 tbsp tamari",
      "50g brown rice (dry weight), cooked"
    ],
    method: [
      "Cook rice. Warm oil, cook tempeh until golden. Add garlic, ginger, broccoli, carrot; stir‑fry 3 min.",
      "Add 1 tbsp tamari, toss, serve over 50g rice."
    ],
    phaseBenefit:
      "Fermented tempeh feeds your gut while feeding your muscles. Broccoli helps your body handle rising oestrogen. A dinner that works as hard as you do.",
    nutrition: { calories: 520, protein: 28, carbs: 54, fat: 20, fibre: 10 },
    category: "meal",
    tags: ["vegan", "follicular", "probiotic"],
    kidAlternative: "Swap tempeh for cubed tofu and serve with plain rice."
  },
  {
    id: "dinner-f9",
    name: "Miso‑Glazed Tofu with Soba Noodles",
    phase: "follicular",
    serves: 1,
    prepTime: "5 min",
    cookTime: "20 min",
    keyNutrients: ["Probiotics", "Phytoestrogens", "Complete protein"],
    ingredients: [
      "120g firm tofu, pressed and cubed",
      "1 tbsp white miso paste",
      "1 tsp mirin (or honey)",
      "1 tsp tamari",
      "75g soba noodles",
      "1 head bok choy, halved lengthwise",
      "1 tsp sesame oil",
      "1 tsp sesame seeds"
    ],
    method: [
      "Mix miso, mirin, tamari into a glaze. Coat tofu. Bake at 200°C for 15‑18 min.",
      "Cook soba noodles. Steam bok choy 3 min. Serve tofu over noodles with bok choy, drizzle sesame oil, scatter seeds."
    ],
    phaseBenefit:
      "Miso feeds the gut bacteria that metabolise oestrogen; tofu adds phytoestrogens. This bowl supports your follicular rise with every bite.",
    nutrition: { calories: 480, protein: 24, carbs: 56, fat: 16, fibre: 8 },
    category: "meal",
    tags: ["vegan", "follicular", "probiotic"],
    kidAlternative: "Serve plain soba noodles with a few cubes of plain tofu — kids often enjoy the noodles alone."
  },
  {
    id: "dinner-f10",
    name: "Chicken & Quinoa Bowl with Roasted Veg",
    phase: "follicular",
    serves: 1,
    prepTime: "5 min",
    cookTime: "25 min",
    keyNutrients: ["Complete protein", "Iron", "B vitamins"],
    ingredients: [
      "120g chicken breast",
      "40g quinoa, rinsed",
      "100g mixed vegetables (capsicum, zucchini, red onion), diced",
      "1 tbsp olive oil",
      "1 tbsp lemon juice",
      "20g hummus"
    ],
    method: [
      "Cook quinoa. Toss vegetables in ½ tbsp oil, roast at 200°C 15 min. Grill chicken 6 min each side, slice.",
      "Assemble bowl with 40g quinoa, chicken, veg, and 20g hummus. Drizzle with 1 tbsp lemon juice."
    ],
    phaseBenefit:
      "Quinoa and chicken together form a complete protein — ideal for the building follicular phase. The hummus adds zinc and fibre.",
    nutrition: { calories: 480, protein: 38, carbs: 40, fat: 16, fibre: 8 },
    category: "meal",
    tags: ["follicular", "high-protein"],
    kidAlternative: "Serve components separately — kids love dipping chicken and veg into hummus."
  },

  // ── OVULATORY DINNERS ──
  {
    id: "dinner-o1",
    name: "Grilled Asparagus & Quinoa Salad",
    phase: "ovulatory",
    serves: 1,
    prepTime: "5 min",
    cookTime: "12 min",
    keyNutrients: ["Folate", "Zinc", "Complete protein"],
    ingredients: [
      "80g asparagus spears",
      "40g quinoa, rinsed",
      "50g cherry tomatoes, halved",
      "50g cucumber, diced",
      "1 tbsp tahini (15g)",
      "1 tsp lemon juice",
      "1 tbsp olive oil"
    ],
    method: [
      "Cook 40g quinoa. Grill asparagus until tender. Toss quinoa, asparagus, 50g tomatoes, cucumber with 1 tbsp tahini, lemon juice, and 1 tbsp oil."
    ],
    phaseBenefit:
      "Asparagus is rich in folate — essential for egg development. Quinoa adds complete protein and zinc. Light, fresh, and exactly right for this phase.",
    nutrition: { calories: 380, protein: 14, carbs: 38, fat: 20, fibre: 8 },
    category: "meal",
    tags: ["vegan", "ovulatory", "folate"],
    kidAlternative: "Serve quinoa and grilled asparagus separately — kids may enjoy the asparagus 'soldiers'."
  },
  {
    id: "dinner-o2",
    name: "Seared Tuna with Quinoa & Asian Greens",
    phase: "ovulatory",
    serves: 1,
    prepTime: "5 min",
    cookTime: "10 min",
    keyNutrients: ["Omega‑3", "Protein", "Iron"],
    ingredients: [
      "130g tuna steak",
      "40g quinoa, rinsed",
      "80g Asian greens (bok choy, choy sum)",
      "1 tsp tamari",
      "1 tsp sesame oil",
      "½ tsp grated ginger",
      "1 tsp sesame seeds",
      "Lime wedge"
    ],
    method: [
      "Cook quinoa. Sear tuna 2 min each side (pink in the middle), slice.",
      "Stir‑fry greens in sesame oil and ginger 2 min. Serve tuna over quinoa and greens, drizzle with tamari, scatter seeds, squeeze lime."
    ],
    phaseBenefit:
      "Tuna is packed with omega‑3 and protein; Asian greens add iron. Fast, fresh, and celebratory — like the ovulatory phase itself.",
    nutrition: { calories: 460, protein: 40, carbs: 34, fat: 16, fibre: 5 },
    category: "meal",
    tags: ["pescatarian", "ovulatory", "omega-3"],
    kidAlternative: "Serve tuna (cooked through if preferred) alongside plain rice and cucumber sticks."
  },
  {
    id: "dinner-o3",
    name: "Grilled Fish with Roasted Capsicum & Couscous",
    phase: "ovulatory",
    serves: 1,
    prepTime: "5 min",
    cookTime: "15 min",
    keyNutrients: ["Vitamin C", "Lean protein", "Complex carbs"],
    ingredients: [
      "150g firm white fish fillet",
      "1 red capsicum, roasted and sliced",
      "50g couscous (dry weight)",
      "1 tbsp olive oil",
      "1 tbsp lemon juice",
      "1 tbsp fresh parsley, chopped"
    ],
    method: [
      "Roast capsicum under grill until charred, peel and slice. Pour boiling water over couscous, cover 5 min, fluff.",
      "Grill fish 3‑4 min each side. Toss couscous with capsicum, oil, lemon, and parsley. Serve with fish."
    ],
    phaseBenefit:
      "Light and fresh; capsicum is packed with vitamin C for antioxidant protection. The couscous cooks in minutes — a meal that honours your peak energy.",
    nutrition: { calories: 440, protein: 32, carbs: 44, fat: 14, fibre: 6 },
    category: "meal",
    tags: ["pescatarian", "ovulatory", "light"],
    kidAlternative: "Serve plain couscous with a little butter, alongside the fish and capsicum strips."
  },
  {
    id: "dinner-o4",
    name: "Salmon Teriyaki with Stir‑Fried Vegetables",
    phase: "ovulatory",
    serves: 1,
    prepTime: "5 min + 10 min marinate",
    cookTime: "12 min",
    keyNutrients: ["Omega‑3", "Protein", "Antioxidants"],
    ingredients: [
      "130g salmon fillet",
      "1 tbsp teriyaki sauce",
      "80g bok choy, halved",
      "50g red capsicum, sliced",
      "50g carrot, julienned",
      "1 tsp sesame oil",
      "50g jasmine rice (dry weight), cooked"
    ],
    method: [
      "Marinate salmon in teriyaki 10 min. Cook rice.",
      "Pan‑fry salmon 4 min each side. Stir‑fry vegetables in sesame oil 3 min. Serve together."
    ],
    phaseBenefit:
      "Salmon’s omega‑3s support fertility at the ovulatory peak; colourful vegetables add antioxidants that protect egg quality.",
    nutrition: { calories: 480, protein: 32, carbs: 46, fat: 18, fibre: 4 },
    category: "meal",
    tags: ["pescatarian", "ovulatory", "omega-3"],
    kidAlternative: "Serve rice with plain pan‑fried salmon and a few vegetable pieces on the side."
  },
  {
    id: "dinner-o5",
    name: "Stuffed Capsicums with Quinoa & Black Beans",
    phase: "ovulatory",
    serves: 1,
    prepTime: "10 min",
    cookTime: "25 min",
    keyNutrients: ["Folate", "Zinc", "Antioxidants"],
    ingredients: [
      "1 large red capsicum, halved",
      "40g quinoa, cooked",
      "50g tinned black beans, drained",
      "20g corn kernels",
      "½ tsp ground cumin",
      "15g grated cheese"
    ],
    method: [
      "Mix 40g quinoa, beans, corn, and ½ tsp cumin. Fill 1 large capsicum halves. Top with 15g cheese.",
      "Bake at 190°C for 25 min until tender."
    ],
    phaseBenefit:
      "Colourful vegetables protect egg quality with antioxidants; quinoa adds zinc. A dinner that looks as vibrant as you feel.",
    nutrition: { calories: 320, protein: 16, carbs: 44, fat: 10, fibre: 10 },
    category: "meal",
    tags: ["vegetarian", "ovulatory", "zinc"],
    kidAlternative: "Serve the filling and cheese on top of plain rice instead of inside a capsicum."
  },
  {
    id: "dinner-o6",
    name: "Prawn & Mango Tacos",
    phase: "ovulatory",
    serves: 1,
    prepTime: "10 min",
    cookTime: "5 min",
    keyNutrients: ["Zinc", "Vitamin C", "Lean protein"],
    ingredients: [
      "120g raw prawns, peeled",
      "1 tsp olive oil",
      "1 garlic clove, minced",
      "Pinch smoked paprika",
      "2 small corn tortillas",
      "30g avocado, sliced",
      "40g mango, diced",
      "1 tbsp Greek yoghurt",
      "1 tsp lime juice"
    ],
    method: [
      "Cook prawns in oil with garlic and paprika 2‑3 min each side. Warm tortillas.",
      "Fill 2 small tortillas with 120g prawns, avocado, and mango. Top with a dollop of 1 tbsp yoghurt and a squeeze of lime."
    ],
    phaseBenefit:
      "Prawns are rich in zinc — the mineral that triggers ovulation — and the mango adds vitamin C. Light, fresh, and exactly right.",
    nutrition: { calories: 380, protein: 26, carbs: 34, fat: 14, fibre: 6 },
    category: "meal",
    tags: ["pescatarian", "ovulatory", "zinc"],
    kidAlternative: "Serve prawns, avocado, and mango as finger food — let them dip into yoghurt."
  },
  {
    id: "dinner-o7",
    name: "Zucchini Fritters with Tzatziki",
    phase: "ovulatory",
    serves: 1,
    prepTime: "10 min",
    cookTime: "10 min",
    keyNutrients: ["Zinc", "B vitamins", "Probiotics"],
    ingredients: [
      "1 medium zucchini (about 150g), grated and squeezed dry",
      "20g chickpea flour",
      "1 large egg",
      "1 tbsp fresh dill, chopped",
      "1 tsp olive oil",
      "50g Greek yoghurt",
      "50g cucumber, grated",
      "1 small garlic clove, minced"
    ],
    method: [
      "Mix 1 medium zucchini, flour, 1 large egg, and dill. Form two fritters. Fry in 1 tsp oil until golden.",
      "Make tzatziki with 50g yoghurt, cucumber, and garlic. Serve fritters with tzatziki."
    ],
    phaseBenefit:
      "Chickpea flour brings protein and folate; yoghurt adds probiotics. Light, satisfying, and easy to digest — perfect for ovulation.",
    nutrition: { calories: 300, protein: 16, carbs: 22, fat: 16, fibre: 5 },
    category: "meal",
    tags: ["vegetarian", "ovulatory", "zinc"],
    kidAlternative: "Small fritters + dipping sauce = instant kid‑pleaser."
  },
  {
    id: "dinner-o8",
    name: "Mushroom Risotto",
    phase: "ovulatory",
    serves: 1,
    prepTime: "5 min",
    cookTime: "30 min",
    keyNutrients: ["B vitamins", "Complex carbs", "Zinc"],
    ingredients: [
      "60g arborio rice",
      "1 tsp olive oil",
      "50g brown onion, finely chopped",
      "1 garlic clove, minced",
      "100g mixed mushrooms, sliced",
      "350ml vegetable stock, warmed",
      "1 tbsp nutritional yeast (or Parmesan)",
      "Fresh parsley"
    ],
    method: [
      "Sauté onion, garlic, and mushrooms in oil until golden. Add rice, stir 1 min.",
      "Gradually add stock, stirring, until rice is creamy and tender (about 20 min). Stir in nutritional yeast and parsley."
    ],
    phaseBenefit:
      "Mushrooms are rich in B vitamins and zinc; the creamy rice is comforting without being heavy. A bowl of slow, deliberate nourishment.",
    nutrition: { calories: 420, protein: 12, carbs: 58, fat: 14, fibre: 4 },
    category: "meal",
    tags: ["vegan", "ovulatory", "zinc"],
    kidAlternative: "Plain risotto with Parmesan — most kids love creamy rice."
  },
  {
    id: "dinner-o9",
    name: "Thai Seafood Broth with Rice Noodles",
    phase: "ovulatory",
    serves: 1,
    prepTime: "5 min",
    cookTime: "15 min",
    keyNutrients: ["Zinc", "Iodine", "Protein"],
    ingredients: [
      "80g raw prawns",
      "80g firm white fish, cubed",
      "1 tsp sesame oil",
      "1 garlic clove, minced",
      "1 tsp grated ginger",
      "1 tsp fish sauce (or tamari)",
      "1 tsp lime juice",
      "300ml fish or vegetable stock",
      "60g flat rice noodles (dry weight)",
      "Fresh coriander"
    ],
    method: [
      "Cook 60g noodles. Sauté garlic and 1 tsp ginger in 1 tsp oil. Add stock, 80g fish sauce, lime juice. Bring to simmer.",
      "Add fish and prawns, cook 4‑5 min until just done. Pour over noodles, top with coriander."
    ],
    phaseBenefit:
      "Zinc from prawns and iodine from the broth support thyroid and ovulatory health. Light, fragrant, and deeply nourishing.",
    nutrition: { calories: 420, protein: 32, carbs: 44, fat: 10, fibre: 2 },
    category: "meal",
    tags: ["pescatarian", "ovulatory", "zinc"],
    kidAlternative: "Serve plain rice noodles with mild broth and a few pieces of fish."
  },
  {
    id: "dinner-o10",
    name: "Rainbow Sushi Bowl",
    phase: "ovulatory",
    serves: 1,
    prepTime: "15 min",
    cookTime: "0 min (use pre‑cooked rice)",
    keyNutrients: ["Antioxidants", "Zinc", "Folate"],
    ingredients: [
      "100g cooked sushi rice (about 40g dry)",
      "30g avocado, sliced",
      "40g mango, sliced",
      "50g cucumber, diced",
      "50g edamame (shelled)",
      "1 tsp rice wine vinegar",
      "1 tsp tamari",
      "½ tsp sesame oil",
      "1 tsp pickled ginger",
      "½ nori sheet, sliced",
      "1 tsp sesame seeds"
    ],
    method: [
      "Season 100g rice with vinegar. Arrange all toppings over rice. Drizzle 1 tsp tamari and sesame oil, scatter 1 tsp sesame seeds."
    ],
    phaseBenefit:
      "Colourful, light, and full of life — like the ovulatory phase. Edamame brings zinc; mango and avocado add antioxidants and healthy fats.",
    nutrition: { calories: 420, protein: 14, carbs: 56, fat: 16, fibre: 8 },
    category: "meal",
    tags: ["vegan", "ovulatory", "zinc"],
    kidAlternative: "Serve rice with separate piles of toppings — let them build their own bowl."
  },

  // ── LUTEAL DINNERS ──
  {
    id: "dinner-l1",
    name: "Slow‑Cooked Beef Casserole with Root Veg",
    phase: "luteal",
    serves: 1,
    prepTime: "10 min",
    cookTime: "2 hr",
    keyNutrients: ["Iron", "Protein", "Complex carbs"],
    ingredients: [
      "120g beef chuck, cubed",
      "1 tbsp olive oil",
      "50g brown onion, chopped",
      "100g potato, cubed",
      "80g carrot, chopped",
      "80g parsnip, chopped",
      "1 tbsp tomato paste",
      "300ml beef stock",
      "1 tsp fresh thyme"
    ],
    method: [
      "Brown beef in 1 tbsp oil. Sauté onion. Add vegetables, 1 tbsp tomato paste, stock, thyme. Return beef.",
      "Cover, cook on low heat 2 hours until tender."
    ],
    phaseBenefit:
      "Ultimate luteal comfort food. Beef brings iron; root vegetables ground you with slow, steady energy. Let it cook while you rest.",
    nutrition: { calories: 480, protein: 32, carbs: 40, fat: 18, fibre: 8 },
    category: "meal",
    tags: ["luteal", "iron", "comfort"],
    kidAlternative: "Serve beef and veg over mashed potato — a deconstructed stew."
  },
  {
    id: "dinner-l2",
    name: "Salmon with Kumara Mash & Greens",
    phase: "luteal",
    serves: 1,
    prepTime: "5 min",
    cookTime: "20 min",
    keyNutrients: ["Omega‑3", "B6", "Beta‑carotene"],
    ingredients: [
      "130g salmon fillet",
      "200g kumara (orange sweet potato), boiled and mashed with 1 tsp butter",
      "80g green beans, steamed",
      "1 tsp olive oil",
      "Lemon wedge"
    ],
    method: [
      "Boil kumara 12 min, mash with butter. Pan‑fry salmon 4 min each side.",
      "Steam beans 4 min. Serve salmon on mash with beans and lemon."
    ],
    phaseBenefit:
      "Kumara brings B6 for progesterone; salmon’s omega‑3s soothe the inflammation that rises before your period. A grounding, golden plate.",
    nutrition: { calories: 520, protein: 34, carbs: 44, fat: 20, fibre: 8 },
    category: "meal",
    tags: ["pescatarian", "luteal", "omega-3"],
    kidAlternative: "Serve salmon, mash, and beans separately — comfort food for all ages."
  },
  {
    id: "dinner-l3",
    name: "Chicken Tikka Masala with Rice",
    phase: "luteal",
    serves: 1,
    prepTime: "5 min + 10 min marinate",
    cookTime: "25 min",
    keyNutrients: ["Protein", "B6", "Anti‑inflammatory"],
    ingredients: [
      "120g chicken breast, cubed",
      "2 tbsp Greek yoghurt",
      "1 tbsp tikka masala paste",
      "1 tsp olive oil",
      "50g brown onion, chopped",
      "100ml tomato passata",
      "50g basmati rice (dry weight), cooked",
      "Fresh coriander"
    ],
    method: [
      "Marinate chicken in yoghurt and half the paste for 10 min. Cook rice.",
      "Cook chicken in oil until golden. Add onion, remaining paste, and passata. Simmer 15 min. Serve over rice with coriander."
    ],
    phaseBenefit:
      "Warming spices aid digestion; chicken provides protein. The creamy sauce satisfies the luteal‑phase craving for comfort.",
    nutrition: { calories: 500, protein: 34, carbs: 52, fat: 14, fibre: 4 },
    category: "meal",
    tags: ["luteal", "protein"],
    kidAlternative: "Serve plain rice with a small amount of mild chicken — skip the spices if needed."
  },
  {
    id: "dinner-l4",
    name: "Beef & Mushroom Stroganoff",
    phase: "luteal",
    serves: 1,
    prepTime: "5 min",
    cookTime: "20 min",
    keyNutrients: ["Protein", "Iron", "B vitamins"],
    ingredients: [
      "120g beef scotch fillet, sliced",
      "1 tsp butter",
      "100g mushrooms, sliced",
      "50g brown onion, sliced",
      "1 garlic clove, minced",
      "100ml beef stock",
      "2 tbsp sour cream",
      "1 tsp Dijon mustard",
      "80g egg noodles (dry weight), cooked"
    ],
    method: [
      "Cook 80g noodles. Sear beef in 1 tsp butter, set aside. Sauté 50g onion and 100g mushrooms. Add stock, 2 tbsp sour cream, mustard.",
      "Return beef, warm through. Serve over 80g noodles."
    ],
    phaseBenefit:
      "Rich and comforting; beef brings iron and B12. The mushrooms add B vitamins — all supporting your body through the pre‑menstrual days.",
    nutrition: { calories: 520, protein: 34, carbs: 44, fat: 22, fibre: 4 },
    category: "meal",
    tags: ["luteal", "iron"],
    kidAlternative: "Serve plain noodles with a few slices of beef and a mild cream sauce."
  },
  {
    id: "dinner-l5",
    name: "Fish Pie with Mashed Potato",
    phase: "luteal",
    serves: 1,
    prepTime: "10 min",
    cookTime: "30 min",
    keyNutrients: ["Omega‑3", "Protein", "Complex carbs"],
    ingredients: [
      "100g mixed fish (salmon and white fish), cubed",
      "200g potato, boiled and mashed with 1 tsp butter",
      "100ml milk",
      "1 tsp butter",
      "1 tsp plain flour",
      "30g frozen peas",
      "30g leek, sliced",
      "Salt, pepper, dill"
    ],
    method: [
      "Make a white sauce: melt 1 tsp butter, stir in flour, add milk gradually until thickened.",
      "Add fish, peas, and sautéed leek to the sauce. Pour into a small dish, top with mash. Bake at 200°C for 15 min until golden."
    ],
    phaseBenefit:
      "Comforting and packed with omega‑3 — salmon eases inflammation, and the potato mash satisfies the luteal need for warmth.",
    nutrition: { calories: 480, protein: 30, carbs: 44, fat: 18, fibre: 6 },
    category: "meal",
    tags: ["pescatarian", "luteal", "comfort"],
    kidAlternative: "Serve mashed potato and white fish separately — the pie deconstruction works well for kids."
  },
  {
    id: "dinner-l6",
    name: "Roast Chicken with Roasted Vegetables",
    phase: "luteal",
    serves: 1,
    prepTime: "10 min",
    cookTime: "50 min",
    keyNutrients: ["Protein", "B6", "Complex carbs"],
    ingredients: [
      "1 chicken thigh and 1 drumstick (skin on, about 200g total)",
      "150g potato, cubed",
      "80g carrot, chopped",
      "80g kumara, cubed",
      "50g brown onion, quartered",
      "1 tbsp olive oil",
      "1 tsp dried rosemary",
      "Salt and pepper"
    ],
    method: [
      "Toss all vegetables with 1 tbsp oil and rosemary. Place in a small roasting dish with chicken.",
      "Roast at 200°C for 45‑50 min until chicken is cooked through and vegetables are golden."
    ],
    phaseBenefit:
      "Classic comfort food. Chicken provides protein and B6; the roasted root vegetables offer the slow carbs your luteal body craves.",
    nutrition: { calories: 560, protein: 38, carbs: 44, fat: 24, fibre: 8 },
    category: "meal",
    tags: ["luteal", "protein"],
    kidAlternative: "Serve chicken and roasted veg separately — kids love roast kumara."
  },
  {
    id: "dinner-l7",
    name: "Slow‑Cooked Lamb Curry",
    phase: "luteal",
    serves: 1,
    prepTime: "10 min",
    cookTime: "1 hr 30 min",
    keyNutrients: ["Iron", "Protein", "Anti‑inflammatory"],
    ingredients: [
      "150g lamb shoulder, cubed",
      "1 tsp olive oil",
      "50g brown onion, chopped",
      "1 garlic clove, minced",
      "1 tsp mild curry powder",
      "½ tsp ground turmeric",
      "150ml light coconut milk",
      "50g basmati rice (dry weight), cooked",
      "Fresh coriander"
    ],
    method: [
      "Brown lamb in oil. Sauté onion, garlic, spices. Add coconut milk and lamb. Cover, simmer 1½ hours until tender.",
      "Serve over 50g rice with coriander."
    ],
    phaseBenefit:
      "Lamb brings haem iron; turmeric is anti‑inflammatory. The slow cooking makes the nutrients deeply available — and fills your home with warmth.",
    nutrition: { calories: 540, protein: 34, carbs: 48, fat: 22, fibre: 4 },
    category: "meal",
    tags: ["luteal", "iron"],
    kidAlternative: "Serve plain rice with a little mild lamb — the coconut flavour is usually kid‑friendly."
  },
  {
    id: "dinner-l8",
    name: "Lentil & Vegetable Casserole",
    phase: "luteal",
    serves: 1,
    prepTime: "5 min",
    cookTime: "30 min",
    keyNutrients: ["Magnesium", "B6", "Iron"],
    ingredients: [
      "60g dried brown lentils",
      "1 tsp olive oil",
      "50g brown onion, chopped",
      "1 garlic clove, minced",
      "80g carrot, diced",
      "80g celery, diced",
      "200g tinned diced tomatoes",
      "150ml vegetable stock",
      "1 tsp dried thyme",
      "Salt and pepper"
    ],
    method: [
      "Sauté onion, carrot, celery in oil. Add garlic, lentils, tomatoes, stock, thyme. Simmer 25 min until thick."
    ],
    phaseBenefit:
      "Warming, sustaining, and rich in magnesium and B6 — everything your luteal body needs. A simple, hearty bowl.",
    nutrition: { calories: 360, protein: 18, carbs: 50, fat: 6, fibre: 16 },
    category: "meal",
    tags: ["vegan", "luteal", "magnesium"],
    kidAlternative: "Serve over rice or with crusty bread — the texture is approachable for most kids."
  },
  {
    id: "dinner-l9",
    name: "Black Bean Chilli with Rice",
    phase: "luteal",
    serves: 1,
    prepTime: "5 min",
    cookTime: "25 min",
    keyNutrients: ["Magnesium", "Iron", "B6"],
    ingredients: [
      "100g tinned black beans, drained",
      "100g tinned kidney beans, drained",
      "1 tsp olive oil",
      "50g brown onion, chopped",
      "1 garlic clove, minced",
      "200g tinned diced tomatoes",
      "½ tsp ground cumin",
      "½ tsp smoked paprika",
      "50g brown rice (dry weight), cooked"
    ],
    method: [
      "Cook rice. Sauté onion and garlic in oil. Add beans, tomatoes, cumin, paprika. Simmer 20 min.",
      "Serve over 50g rice."
    ],
    phaseBenefit:
      "Black beans and kidney beans bring magnesium and iron; the warming spices aid digestion. A grounding, satisfying bowl.",
    nutrition: { calories: 460, protein: 20, carbs: 66, fat: 8, fibre: 18 },
    category: "meal",
    tags: ["vegan", "luteal", "magnesium"],
    kidAlternative: "Serve chilli over rice with grated cheese — kids often love mild bean chilli."
  },
  {
    id: "dinner-l10",
    name: "Coconut Dhal with Spinach & Rice",
    phase: "luteal",
    serves: 1,
    prepTime: "5 min",
    cookTime: "25 min",
    keyNutrients: ["Magnesium", "Iron", "Anti‑inflammatory"],
    ingredients: [
      "60g dried yellow lentils",
      "1 tsp coconut oil",
      "50g brown onion, chopped",
      "1 garlic clove, minced",
      "½ tsp ground turmeric",
      "½ tsp ground cumin",
      "150ml light coconut milk",
      "50g baby spinach",
      "50g basmati rice (dry weight), cooked"
    ],
    method: [
      "Cook rice. Sauté onion and garlic in oil. Add turmeric, cumin, lentils, coconut milk. Simmer 20 min.",
      "Stir in 50g spinach until wilted. Serve over 50g rice."
    ],
    phaseBenefit:
      "Comforting and packed with magnesium — the luteal phase's most‑needed mineral. The coconut milk wraps around you like a soft blanket.",
    nutrition: { calories: 480, protein: 20, carbs: 60, fat: 16, fibre: 14 },
    category: "meal",
    tags: ["vegan", "luteal", "magnesium"],
    kidAlternative: "Serve plain rice with a little lentil dhal — the mild coconut flavour is usually accepted."
  },
  {
    id: "dinner-l11",
    name: "Tempeh & Mushroom Stew with Crusty Bread",
    phase: "luteal",
    serves: 1,
    prepTime: "5 min",
    cookTime: "25 min",
    keyNutrients: ["Probiotics", "B vitamins", "Magnesium"],
    ingredients: [
      "100g tempeh, cubed",
      "1 tsp olive oil",
      "100g mushrooms, sliced",
      "50g brown onion, chopped",
      "1 garlic clove, minced",
      "200ml vegetable stock",
      "1 tbsp tamari",
      "1 tbsp tomato paste",
      "½ tsp dried thyme",
      "1 thick slice of crusty bread (about 50g)"
    ],
    method: [
      "Brown tempeh in oil. Sauté onion, garlic, mushrooms. Add stock, tamari, tomato paste, thyme. Simmer 15 min.",
      "Return tempeh, cook 5 min. Serve with crusty bread."
    ],
    phaseBenefit:
      "Mushrooms bring B vitamins; tempeh adds protein and probiotics. A warming stew for cooler evenings, with bread to mop up every drop.",
    nutrition: { calories: 420, protein: 24, carbs: 36, fat: 16, fibre: 8 },
    category: "meal",
    tags: ["vegan", "luteal", "magnesium"],
    kidAlternative: "Serve the stew with plain bread — the mushroom flavour is mild and comforting."
  },
  {
    id: "dinner-l12",
    name: "Tofu & Pumpkin Curry",
    phase: "luteal",
    serves: 1,
    prepTime: "5 min",
    cookTime: "25 min",
    keyNutrients: ["Phytoestrogens", "Beta‑carotene", "B6"],
    ingredients: [
      "120g firm tofu, cubed",
      "150g pumpkin, cubed",
      "1 tsp coconut oil",
      "50g brown onion, chopped",
      "1 garlic clove, minced",
      "1 tsp mild curry powder",
      "150ml light coconut milk",
      "50g brown rice (dry weight), cooked"
    ],
    method: [
      "Cook rice. Sauté onion and garlic in oil, add curry powder. Add pumpkin and coconut milk, simmer 20 min.",
      "Add tofu, cook 5 min. Serve over rice."
    ],
    phaseBenefit:
      "Pumpkin brings beta‑carotene and B6 — both needed for progesterone production. Tofu adds gentle phytoestrogens. A warm, golden curry.",
    nutrition: { calories: 500, protein: 22, carbs: 56, fat: 20, fibre: 10 },
    category: "meal",
    tags: ["vegan", "luteal", "protein"],
    kidAlternative: "Serve rice with plain tofu and a little coconut milk — leave out the curry powder."
  },
  {
    id: "dinner-l13",
    name: "Veg Lasagne with Cashew Béchamel",
    phase: "luteal",
    serves: 1,
    prepTime: "15 min",
    cookTime: "35 min",
    keyNutrients: ["Magnesium", "Protein", "Complex carbs"],
    ingredients: [
      "2 sheets pre‑cooked lasagne (about 40g total)",
      "30g cashews, soaked 20 min, blended with 60ml water to make cream",
      "80g mushrooms, sliced",
      "80g spinach",
      "100ml tomato passata",
      "1 tsp nutritional yeast",
      "Salt and pepper"
    ],
    method: [
      "Sauté 80g mushrooms and spinach until soft. Layer in a small dish: 100ml passata, 2 lasagne sheet, vegetables, cashew cream.",
      "Repeat, finish with passata. Bake at 180°C for 30 min."
    ],
    phaseBenefit:
      "Cashews deliver magnesium; mushrooms add B vitamins. A warming, nurturing bake that feeds the luteal body everything it's asking for.",
    nutrition: { calories: 420, protein: 18, carbs: 40, fat: 20, fibre: 8 },
    category: "meal",
    tags: ["vegan", "luteal", "magnesium"],
    kidAlternative: "Make a simpler version with just pasta, tomato sauce, and grated cheese."
  },

  // ── MORE DINNERS to reach 50+ ──
  {
    id: "dinner-x1",
    name: "Chicken Thighs with Paprika & Kumara",
    phase: "luteal",
    serves: 1,
    prepTime: "5 min",
    cookTime: "35 min",
    keyNutrients: ["Protein", "B6", "Iron"],
    ingredients: [
      "2 boneless chicken thighs (about 150g)",
      "150g kumara, cubed",
      "1 tbsp olive oil",
      "1 tsp smoked paprika",
      "1 garlic clove, minced",
      "Salt and pepper"
    ],
    method: [
      "Toss chicken and 150g kumara with oil, paprika, garlic, salt, and pepper.",
      "Roast at 200°C for 35 min until chicken is cooked through and kumara is tender."
    ],
    phaseBenefit:
      "Chicken thighs bring iron; kumara adds B6 for progesterone support. One tray, minimal washing up — a dinner that respects your energy.",
    nutrition: { calories: 480, protein: 34, carbs: 36, fat: 22, fibre: 6 },
    category: "meal",
    tags: ["luteal", "protein"],
    kidAlternative: "Serve chicken and kumara separately — kids love roasted kumara wedges."
  },
  {
    id: "dinner-x2",
    name: "Pork Chops with Cannellini Beans & Greens",
    phase: "luteal",
    serves: 1,
    prepTime: "5 min",
    cookTime: "15 min",
    keyNutrients: ["Protein", "B vitamins", "Fibre"],
    ingredients: [
      "1 pork chop (about 150g)",
      "1 tsp olive oil",
      "100g tinned cannellini beans, drained",
      "50g Swiss chard or spinach",
      "1 garlic clove, minced",
      "Lemon wedge"
    ],
    method: [
      "Season pork chop, pan‑fry in oil 4‑5 min each side. Rest.",
      "In the same pan, sauté garlic, add 100g beans and greens. Warm through. Serve with pork and lemon."
    ],
    phaseBenefit:
      "Pork and beans provide sustained protein and B vitamins for luteal energy and mood. Quick and satisfying.",
    nutrition: { calories: 460, protein: 38, carbs: 28, fat: 20, fibre: 8 },
    category: "meal",
    tags: ["luteal", "protein"],
    kidAlternative: "Serve pork and beans separately — the beans can be mashed for younger kids."
  },
  {
    id: "dinner-x3",
    name: "Moroccan‑Spiced Lamb with Butternut & Couscous",
    phase: "menstrual",
    serves: 1,
    prepTime: "5 min",
    cookTime: "30 min",
    keyNutrients: ["Haem iron", "Zinc", "Warming spices"],
    ingredients: [
      "120g lamb leg steak, diced",
      "1 tsp olive oil",
      "100g butternut squash, cubed",
      "¼ tsp ground cinnamon",
      "¼ tsp ground cumin",
      "¼ tsp ground coriander",
      "50g couscous (dry weight)",
      "Fresh mint"
    ],
    method: [
      "Toss lamb and squash with oil and spices. Roast at 200°C for 25‑30 min.",
      "Cook 50g couscous. Serve lamb and 100g squash over couscous with fresh mint."
    ],
    phaseBenefit:
      "Lamb brings haem iron; warming spices ease cramping. The butternut adds beta‑carotene — gentle nourishment for bleeding days.",
    nutrition: { calories: 480, protein: 32, carbs: 44, fat: 18, fibre: 6 },
    category: "meal",
    tags: ["menstrual", "iron"],
    kidAlternative: "Serve lamb and butternut separately over plain couscous — leave out the spices for sensitive palates."
  },
  {
    id: "dinner-x4",
    name: "Garlic Butter Salmon with Potatoes & Greens",
    phase: "follicular",
    serves: 1,
    prepTime: "5 min",
    cookTime: "20 min",
    keyNutrients: ["Omega‑3", "Vitamin D", "Protein"],
    ingredients: [
      "130g salmon fillet",
      "150g baby potatoes, halved and boiled",
      "80g broccolini",
      "1 tbsp butter",
      "1 garlic clove, minced",
      "1 tbsp chopped parsley",
      "Lemon wedge"
    ],
    method: [
      "Boil potatoes 12 min. Pan‑fry salmon 4 min each side. Steam broccolini 4 min.",
      "Melt 1 tbsp butter with garlic and 1 tbsp parsley, drizzle over 150g potatoes, broccolini, and salmon. Serve with lemon."
    ],
    phaseBenefit:
      "Salmon’s omega‑3s support oestrogen synthesis; the potatoes and butter make this feel like a restaurant meal — but it’s just you, caring for yourself.",
    nutrition: { calories: 520, protein: 36, carbs: 40, fat: 22, fibre: 6 },
    category: "meal",
    tags: ["pescatarian", "follicular", "omega-3"],
    kidAlternative: "Serve salmon, potatoes, and broccoli separately — most kids love baby potatoes."
  },
  {
    id: "dinner-x5",
    name: "Steak with Parmesan Mash & Garlic Butter Cabbage",
    phase: "menstrual",
    serves: 1,
    prepTime: "5 min",
    cookTime: "20 min",
    keyNutrients: ["Haem iron", "B12", "Calcium"],
    ingredients: [
      "120g sirloin steak",
      "200g potato, boiled and mashed with 1 tsp butter and 15g grated Parmesan",
      "100g cabbage, sliced into wedges",
      "1 tbsp butter",
      "1 garlic clove, minced",
      "Salt and pepper"
    ],
    method: [
      "Season steak, pan‑fry 2‑3 min each side (medium‑rare). Rest 5 min.",
      "Roast cabbage wedges at 220°C for 10 min, brush with garlic butter, roast 5 more min. Serve steak with mash and cabbage."
    ],
    phaseBenefit:
      "Steak delivers haem iron and protein to support recovery; Parmesan mash adds calcium. A dinner that feels like a reward for simply being here.",
    nutrition: { calories: 560, protein: 38, carbs: 42, fat: 26, fibre: 6 },
    category: "meal",
    tags: ["menstrual", "iron"],
    kidAlternative: "Serve steak strips with mashed potato — kids love mash."
  },
  {
    id: "dinner-x6",
    name: "Creamy Mushroom & Chickpea Stroganoff",
    phase: "luteal",
    serves: 1,
    prepTime: "5 min",
    cookTime: "20 min",
    keyNutrients: ["Plant protein", "Magnesium", "B vitamins"],
    ingredients: [
      "80g dried pasta (penne or tagliatelle)",
      "100g mushrooms, sliced",
      "80g tinned chickpeas, drained",
      "1 tsp olive oil",
      "50g brown onion, chopped",
      "1 garlic clove, minced",
      "½ tsp smoked paprika",
      "100ml vegetable stock",
      "2 tbsp sour cream (or plant‑based alternative)",
      "Fresh parsley"
    ],
    method: [
      "Cook pasta. Sauté onion, garlic, mushrooms in oil. Add paprika, chickpeas, stock; simmer 10 min.",
      "Stir in 2 tbsp sour cream off the heat. Toss with 80g pasta, top with parsley."
    ],
    phaseBenefit:
      "Mushrooms bring B vitamins; chickpeas add magnesium to ease PMS. The creamy sauce answers the luteal craving without the crash.",
    nutrition: { calories: 500, protein: 20, carbs: 60, fat: 18, fibre: 10 },
    category: "meal",
    tags: ["vegetarian", "luteal", "magnesium"],
    kidAlternative: "Serve plain pasta with a mild cream sauce — leave out the mushrooms if they’re a texture issue."
  },
  {
    id: "dinner-x7",
    name: "Lamb & Lentil Stew",
    phase: "luteal",
    serves: 1,
    prepTime: "5 min",
    cookTime: "40 min",
    keyNutrients: ["Iron", "Protein", "Magnesium"],
    ingredients: [
      "100g lamb shoulder, diced",
      "60g dried brown lentils",
      "1 tsp olive oil",
      "50g brown onion, chopped",
      "1 garlic clove, minced",
      "80g carrot, diced",
      "200ml beef stock",
      "100g tinned diced tomatoes",
      "½ tsp ground cumin",
      "Fresh parsley"
    ],
    method: [
      "Brown lamb in oil. Sauté onion, garlic, carrot. Add lentils, stock, tomatoes, cumin. Simmer 35 min until lamb and lentils are tender.",
      "Serve with fresh parsley."
    ],
    phaseBenefit:
      "Hearty and sustaining; lamb provides iron and B12. The lentils add magnesium — a one‑pot meal that holds you steady.",
    nutrition: { calories: 480, protein: 34, carbs: 40, fat: 18, fibre: 12 },
    category: "meal",
    tags: ["luteal", "iron"],
    kidAlternative: "Serve over rice or with crusty bread — the lentils blend into the stew nicely."
  },
  {
    id: "dinner-x8",
    name: "Chicken & Chickpea Tagine",
    phase: "follicular",
    serves: 1,
    prepTime: "5 min",
    cookTime: "30 min",
    keyNutrients: ["Protein", "Iron", "Fibre"],
    ingredients: [
      "120g chicken thigh, diced",
      "1 tsp olive oil",
      "50g brown onion, chopped",
      "1 garlic clove, minced",
      "½ tsp ground cinnamon",
      "½ tsp ground cumin",
      "¼ tsp ground turmeric",
      "100g tinned chickpeas, drained",
      "200g tinned diced tomatoes",
      "50g couscous (dry weight)",
      "Fresh coriander"
    ],
    method: [
      "Sauté onion and garlic in oil. Add spices, chicken, chickpeas, tomatoes. Simmer 25 min.",
      "Cook 50g couscous. Serve tagine over couscous with coriander."
    ],
    phaseBenefit:
      "Chicken and chickpeas together deliver a broad amino acid profile to fuel follicular growth. The warming spices aid digestion.",
    nutrition: { calories: 520, protein: 36, carbs: 52, fat: 14, fibre: 10 },
    category: "meal",
    tags: ["follicular", "protein"],
    kidAlternative: "Serve over plain couscous — the cinnamon flavour is mild and often kid‑friendly."
  },
  {
    id: "dinner-x9",
    name: "Herb‑Crusted Cod with Cannellini Bean Mash",
    phase: "follicular",
    serves: 1,
    prepTime: "5 min",
    cookTime: "15 min",
    keyNutrients: ["Lean protein", "Plant protein", "B vitamins"],
    ingredients: [
      "150g cod fillet",
      "20g breadcrumbs",
      "1 tsp dried thyme",
      "1 tsp Dijon mustard",
      "100g tinned cannellini beans, drained",
      "1 tsp olive oil",
      "50ml vegetable stock",
      "Salt and pepper",
      "Lemon wedge"
    ],
    method: [
      "Brush cod with mustard, coat with breadcrumbs and thyme. Bake at 220°C for 12‑14 min.",
      "Warm 100g beans in stock, mash roughly with 1 tsp olive oil. Serve fish on mash with lemon."
    ],
    phaseBenefit:
      "Cod is light and easily digestible; cannellini beans add plant protein and B vitamins. Clean, fresh, and building.",
    nutrition: { calories: 380, protein: 36, carbs: 32, fat: 10, fibre: 8 },
    category: "meal",
    tags: ["pescatarian", "follicular", "protein"],
    kidAlternative: "Serve fish with plain mash — kids enjoy the crispy coating."
  },
  {
    id: "dinner-x10",
    name: "Creamy Coconut Chicken Curry",
    phase: "luteal",
    serves: 1,
    prepTime: "5 min",
    cookTime: "25 min",
    keyNutrients: ["Protein", "Healthy fats", "Magnesium"],
    ingredients: [
      "120g chicken breast, cubed",
      "1 tsp coconut oil",
      "50g brown onion, chopped",
      "1 garlic clove, minced",
      "1 tsp mild curry powder",
      "150ml light coconut milk",
      "50g brown rice (dry weight), cooked",
      "Fresh coriander"
    ],
    method: [
      "Cook rice. Sauté onion and garlic in oil. Add curry powder, chicken, coconut milk. Simmer 20 min.",
      "Serve over 50g rice with coriander."
    ],
    phaseBenefit:
      "Coconut milk brings comforting fats; chicken adds protein. Warming and sustaining for the luteal phase.",
    nutrition: { calories: 500, protein: 32, carbs: 48, fat: 18, fibre: 4 },
    category: "meal",
    tags: ["luteal", "protein"],
    kidAlternative: "Serve rice with plain chicken and a little coconut sauce."
  },
  {
    id: "dinner-x11",
    name: "Teriyaki Tempeh with Jasmine Rice",
    phase: "follicular",
    serves: 1,
    prepTime: "5 min + 10 min marinate",
    cookTime: "15 min",
    keyNutrients: ["Probiotics", "Phytoestrogens", "Protein"],
    ingredients: [
      "120g tempeh, sliced",
      "1 tbsp teriyaki sauce",
      "1 tsp sesame oil",
      "50g jasmine rice (dry weight), cooked",
      "80g broccoli florets, steamed",
      "1 tsp sesame seeds"
    ],
    method: [
      "Marinate tempeh in teriyaki 10 min. Pan‑fry in sesame oil until caramelised.",
      "Cook 50g rice. Steam broccoli. Serve 120g tempeh over rice with broccoli and 1 tsp sesame seeds."
    ],
    phaseBenefit:
      "Tempeh is fermented soy — complete protein and live probiotics for the follicular gut‑hormone axis. Fast and full of life.",
    nutrition: { calories: 480, protein: 24, carbs: 54, fat: 16, fibre: 8 },
    category: "meal",
    tags: ["vegan", "follicular", "probiotic"],
    kidAlternative: "Serve tempeh with rice and a drizzle of teriyaki — kids usually warm to it."
  }
];