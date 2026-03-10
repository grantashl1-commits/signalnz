import { Phase } from "@/lib/cycle-utils";

export interface Meal {
  type: string;
  name: string;
  ingredients?: string;
  phaseBenefit: string;
  prepTime?: string;
  calories?: string;
  protein?: string;
}

export interface DayPlan {
  day: number;
  breakfast: string;
  lunch: string;
  dinner: string;
}

export const TODAY_MEALS: Record<Phase, Meal[]> = {
  follicular: [
    {
      type: "Breakfast",
      name: "Overnight Oats with Blueberries & Flaxseed",
      ingredients: "Rolled oats, oat milk, blueberries, flaxseed, maple syrup, chia seeds",
      phaseBenefit: "Complex carbs support rising estrogen. Flaxseed provides lignans for estrogen balance.",
      prepTime: "5 min (prep night before)",
      calories: "~380",
      protein: "12g",
    },
    {
      type: "Morning Snack",
      name: "Fermented Cashew Yoghurt with Kiwi",
      ingredients: "Cashew yoghurt, kiwi, granola",
      phaseBenefit: "Probiotics support the estrobolome — the gut bacteria responsible for metabolising estrogen.",
    },
    {
      type: "Lunch",
      name: "Lentil & Roasted Capsicum Bowl with Tahini Dressing",
      ingredients: "Green lentils, roasted red capsicum, cucumber, parsley, tahini, lemon, garlic, olive oil",
      phaseBenefit: "Lentils provide plant iron and folate. Tahini is rich in zinc — important for follicular development.",
      prepTime: "20 min",
      calories: "~520",
      protein: "22g",
    },
    {
      type: "Afternoon Snack",
      name: "Edamame with Sea Salt & Sesame",
      ingredients: "Edamame, sea salt, sesame seeds",
      phaseBenefit: "Soy isoflavones support estrogen activity. Perfect follicular phase snack.",
    },
    {
      type: "Dinner",
      name: "Miso-Glazed Tofu with Soba Noodles & Bok Choy",
      ingredients: "Firm tofu, white miso, mirin, tamari, soba noodles, bok choy, sesame oil, spring onions, nori",
      phaseBenefit: "Fermented miso supports gut health. Tofu provides complete protein and phytoestrogens.",
      prepTime: "25 min",
      calories: "~580",
      protein: "28g",
    },
  ],
  menstrual: [
    {
      type: "Breakfast",
      name: "Warm Spiced Oat Porridge with Dates & Almonds",
      ingredients: "Steel-cut oats, medjool dates, almonds, cinnamon, cardamom, oat milk",
      phaseBenefit: "Warming comfort food. Dates provide iron, almonds give magnesium for cramps.",
      prepTime: "10 min",
      calories: "~420",
      protein: "14g",
    },
    {
      type: "Morning Snack",
      name: "Dark Chocolate & Trail Mix",
      ingredients: "Dark chocolate (70%+), pumpkin seeds, dried apricots, walnuts",
      phaseBenefit: "Cacao is rich in magnesium. Pumpkin seeds provide zinc and iron.",
    },
    {
      type: "Lunch",
      name: "Red Lentil Soup with Sourdough",
      ingredients: "Red lentils, tomatoes, onion, garlic, cumin, turmeric, lemon, sourdough bread",
      phaseBenefit: "Iron-rich lentils with vitamin C from tomatoes and lemon for optimal absorption.",
      prepTime: "25 min",
      calories: "~480",
      protein: "20g",
    },
    {
      type: "Afternoon Snack",
      name: "Turmeric Latte",
      ingredients: "Oat milk, turmeric, ginger, black pepper, maple syrup",
      phaseBenefit: "Anti-inflammatory turmeric reduces prostaglandins that cause cramping.",
    },
    {
      type: "Dinner",
      name: "Chickpea & Sweet Potato Curry with Brown Rice",
      ingredients: "Chickpeas, sweet potato, coconut milk, ginger, turmeric, spinach, brown rice",
      phaseBenefit: "Iron from chickpeas and spinach. Sweet potato provides B6 and complex carbs for steady energy.",
      prepTime: "30 min",
      calories: "~560",
      protein: "18g",
    },
  ],
  ovulatory: [
    {
      type: "Breakfast",
      name: "Rainbow Smoothie Bowl",
      ingredients: "Acai, banana, mixed berries, hemp seeds, granola, coconut flakes",
      phaseBenefit: "Antioxidant-rich berries protect egg quality. Hemp seeds provide zinc for ovulation support.",
      prepTime: "5 min",
      calories: "~350",
      protein: "12g",
    },
    {
      type: "Morning Snack",
      name: "Fresh Fruit Salad with Mint & Hemp Seeds",
      ingredients: "Seasonal fruit, fresh mint, hemp seeds, lime juice",
      phaseBenefit: "Light and nutrient-dense. Appetite is naturally lower during ovulation.",
    },
    {
      type: "Lunch",
      name: "Raw Zucchini Noodles with Pesto & Cherry Tomatoes",
      ingredients: "Zucchini, basil pesto, cherry tomatoes, pine nuts, nutritional yeast",
      phaseBenefit: "Raw foods are easier to digest now. Folate from basil supports egg development.",
      prepTime: "15 min",
      calories: "~380",
      protein: "14g",
    },
    {
      type: "Afternoon Snack",
      name: "Handful of Almonds & Fresh Berries",
      ingredients: "Raw almonds, mixed berries",
      phaseBenefit: "Zinc from almonds. Antioxidants from berries protect cellular health.",
    },
    {
      type: "Dinner",
      name: "Grilled Asparagus & Quinoa Salad with Lemon Tahini",
      ingredients: "Asparagus, quinoa, cherry tomatoes, cucumber, tahini, lemon, olive oil",
      phaseBenefit: "Folate-rich asparagus. Quinoa provides complete protein and zinc.",
      prepTime: "20 min",
      calories: "~460",
      protein: "18g",
    },
  ],
  luteal: [
    {
      type: "Breakfast",
      name: "Warm Oat Porridge with Banana & Almond Butter",
      ingredients: "Rolled oats, banana, almond butter, cinnamon, oat milk, chia seeds",
      phaseBenefit: "Complex carbs stabilise blood sugar. Banana provides B6 to ease PMS symptoms.",
      prepTime: "10 min",
      calories: "~450",
      protein: "16g",
    },
    {
      type: "Morning Snack",
      name: "Apple Slices with Tahini & Cinnamon",
      ingredients: "Apple, tahini, cinnamon",
      phaseBenefit: "Steady glucose release. Never skip meals — progesterone needs stable blood sugar.",
    },
    {
      type: "Lunch",
      name: "Sweet Potato & Black Bean Soup",
      ingredients: "Sweet potato, black beans, onion, garlic, cumin, chilli, lime, coriander",
      phaseBenefit: "Nutrient-dense complex carbs. Higher calorie needs are normal and healthy in this phase.",
      prepTime: "25 min",
      calories: "~520",
      protein: "22g",
    },
    {
      type: "Afternoon Snack",
      name: "Chocolate Banana Nice Cream",
      ingredients: "Frozen banana, raw cacao, almond butter",
      phaseBenefit: "Cacao is one of the highest food sources of magnesium — key for reducing PMS.",
    },
    {
      type: "Dinner",
      name: "Lentil & Vegetable Casserole",
      ingredients: "Brown lentils, root vegetables, tomato paste, herbs, vegetable stock",
      phaseBenefit: "Warming, sustaining, and rich in magnesium and B6 for luteal phase support.",
      prepTime: "35 min",
      calories: "~540",
      protein: "24g",
    },
  ],
};

export const PHASE_MEAL_PLANS: Record<Phase, { theme: string; days: DayPlan[] }> = {
  menstrual: {
    theme: "Iron-rich, anti-inflammatory, comforting",
    days: [
      { day: 1, breakfast: "Warm spiced oat porridge with dates and almonds", lunch: "Red lentil soup with sourdough", dinner: "Chickpea and sweet potato curry with brown rice" },
      { day: 2, breakfast: "Smoothie bowl — spinach, banana, hemp seeds, cacao", lunch: "Black bean tacos with avocado and salsa", dinner: "Lentil dhal with turmeric and coconut milk" },
      { day: 3, breakfast: "Chia pudding with pomegranate and walnuts", lunch: "Quinoa and roasted beet salad with pumpkin seeds", dinner: "Mushroom and lentil shepherd's pie" },
      { day: 4, breakfast: "Overnight oats with goji berries and flaxseed", lunch: "Miso soup with tofu and wakame", dinner: "Tempeh stir-fry with broccoli and ginger" },
      { day: 5, breakfast: "Avocado toast on rye with hemp seeds", lunch: "White bean and kale soup", dinner: "Sweet potato and black bean burrito bowl" },
      { day: 6, breakfast: "Buckwheat pancakes with maple syrup", lunch: "Hummus and roasted veg wrap", dinner: "Tofu and vegetable Thai green curry" },
      { day: 7, breakfast: "Acai bowl with granola and berries", lunch: "Lentil and spinach salad", dinner: "Chickpea shakshuka with crusty bread" },
    ],
  },
  follicular: {
    theme: "Light, energising, fermented foods, complex carbs",
    days: [
      { day: 1, breakfast: "Overnight oats with blueberries and flaxseed", lunch: "Lentil and roasted capsicum bowl", dinner: "Miso tofu with soba noodles" },
      { day: 2, breakfast: "Fermented cashew yoghurt with granola and kiwi", lunch: "Brown rice sushi bowl with edamame", dinner: "Tempeh and broccoli stir-fry" },
      { day: 3, breakfast: "Green smoothie — spinach, apple, ginger, flaxseed", lunch: "Roasted veg and quinoa salad", dinner: "Chickpea and spinach curry" },
      { day: 4, breakfast: "Sourdough with smashed avocado and microgreens", lunch: "Soba noodle salad with sesame dressing", dinner: "Lentil bolognese with pasta" },
      { day: 5, breakfast: "Bircher muesli with apple and cinnamon", lunch: "Miso soup with rice and pickled veg", dinner: "Teriyaki tempeh with jasmine rice" },
      { day: 6, breakfast: "Chia parfait with mango and coconut", lunch: "Falafel wrap with fermented cabbage", dinner: "Tofu pad thai" },
      { day: 7, breakfast: "Buckwheat porridge with banana", lunch: "Vietnamese rice paper rolls", dinner: "Mushroom risotto" },
    ],
  },
  ovulatory: {
    theme: "Light, raw, antioxidant-rich, zinc and folate focus",
    days: [
      { day: 1, breakfast: "Rainbow smoothie bowl — acai, banana, mixed berries", lunch: "Raw zucchini noodles with pesto", dinner: "Grilled asparagus and quinoa salad" },
      { day: 2, breakfast: "Fresh fruit salad with mint and hemp seeds", lunch: "Avocado and mango sushi rolls", dinner: "Stuffed capsicums with quinoa and black beans" },
      { day: 3, breakfast: "Green juice and a handful of almonds", lunch: "Large leafy salad with pumpkin seeds, sunflower seeds, and tahini", dinner: "Zucchini fritters with cucumber tzatziki" },
    ],
  },
  luteal: {
    theme: "Warming, sustaining, nutrient-dense, magnesium and B6 rich",
    days: [
      { day: 1, breakfast: "Warm oat porridge with banana and almond butter", lunch: "Sweet potato and black bean soup", dinner: "Lentil and vegetable casserole" },
      { day: 2, breakfast: "Banana oat pancakes with tahini", lunch: "Roasted chickpea and root vegetable bowl", dinner: "Tempeh and mushroom stew with crusty bread" },
      { day: 3, breakfast: "Smoothie — banana, almond milk, cacao, chia", lunch: "Baked potato with hummus and salad", dinner: "Chickpea tikka masala with rice" },
      { day: 4, breakfast: "Avocado toast with sunflower seeds", lunch: "Minestrone soup", dinner: "Tofu and pumpkin curry" },
      { day: 5, breakfast: "Warm chia pudding with poached pear", lunch: "Roasted tomato and lentil soup", dinner: "Veg lasagne with cashew béchamel" },
      { day: 6, breakfast: "Buckwheat waffles with berries", lunch: "Stuffed sweet potato with tahini slaw", dinner: "Black bean chilli with cornbread" },
      { day: 7, breakfast: "Cinnamon oat granola with oat milk", lunch: "Roasted veg frittata (vegan, chickpea flour)", dinner: "Coconut dhal with spinach and rice" },
    ],
  },
};

export type RecipeCategory = "meal" | "baking";

export interface Recipe {
  id: string;
  name: string;
  phase: Phase;
  serves: number;
  prepTime: string;
  keyNutrients: string[];
  ingredients: string[];
  method: string[];
  phaseBenefit: string;
  category?: RecipeCategory;
  image?: string;
}

export const RECIPES: Recipe[] = [
  {
    id: "turmeric-lentil-soup",
    name: "Turmeric Lentil Soup",
    image: "/images/recipes/meals/turmeric-lentil-soup.png",
    phase: "menstrual",
    serves: 4,
    prepTime: "25 min",
    keyNutrients: ["Iron", "Anti-inflammatory", "Magnesium"],
    ingredients: [
      "1 cup red lentils",
      "1 can coconut milk",
      "2 cups vegetable stock",
      "1 onion, diced",
      "3 cloves garlic",
      "1 tsp turmeric",
      "1 tsp cumin",
      "1 tsp ginger",
      "1 can diced tomatoes",
      "Handful of spinach",
      "Salt, lemon juice, olive oil",
    ],
    method: [
      "Sauté onion and garlic in olive oil until soft.",
      "Add spices and stir for 1 minute.",
      "Add lentils, tomatoes, and stock. Simmer 15 min until lentils are soft.",
      "Add coconut milk and spinach. Blend partially for texture.",
      "Finish with lemon juice and salt to taste.",
    ],
    phaseBenefit: "Turmeric reduces prostaglandins (cause of cramps). Lentils replace iron lost during menstruation.",
  },
  {
    id: "miso-tofu-soba",
    name: "Miso Tofu Soba Bowl",
    image: "/images/recipes/meals/miso-tofu-soba-bowl.png",
    phase: "follicular",
    serves: 2,
    prepTime: "25 min",
    keyNutrients: ["Probiotics", "Phytoestrogens", "Protein"],
    ingredients: [
      "200g firm tofu",
      "2 tbsp white miso",
      "1 tbsp mirin",
      "1 tbsp tamari",
      "150g soba noodles",
      "2 heads bok choy",
      "1 tsp sesame oil",
      "Spring onions, nori sheets, sesame seeds",
    ],
    method: [
      "Press and cube tofu.",
      "Mix miso, mirin, tamari into a glaze. Coat tofu.",
      "Bake at 200°C for 20 minutes.",
      "Cook soba noodles per packet instructions.",
      "Steam bok choy. Assemble bowl with sesame oil drizzle.",
      "Top with nori and sesame seeds.",
    ],
    phaseBenefit: "Fermented miso feeds gut bacteria that metabolise estrogen. Tofu provides phytoestrogens that gently support rising estrogen.",
  },
  {
    id: "rainbow-sushi-bowl",
    name: "Rainbow Sushi Bowl",
    image: "/images/recipes/meals/rainbow-sushi-bowl.png",
    phase: "ovulatory",
    serves: 2,
    prepTime: "20 min",
    keyNutrients: ["Zinc", "Antioxidants", "Folate"],
    ingredients: [
      "1 cup sushi rice",
      "1 avocado",
      "1 mango",
      "1 cucumber",
      "Edamame",
      "Pickled ginger",
      "Nori, tamari, sesame seeds, microgreens",
    ],
    method: [
      "Cook sushi rice with rice vinegar.",
      "Arrange all toppings in sections over rice.",
      "Serve with tamari and pickled ginger.",
    ],
    phaseBenefit: "Zinc from edamame supports ovulation. Mango and avocado provide antioxidants that protect egg quality.",
  },
  {
    id: "chocolate-nice-cream",
    name: "Chocolate Banana Nice Cream",
    image: "/images/recipes/meals/chocolate-banana-nice-cream.png",
    phase: "luteal",
    serves: 2,
    prepTime: "5 min + freeze",
    keyNutrients: ["Magnesium", "B6", "Potassium"],
    ingredients: [
      "4 frozen bananas",
      "2 tbsp raw cacao",
      "2 tbsp almond butter",
      "1 tsp vanilla",
      "Pinch salt",
      "Optional: dark chocolate chips",
    ],
    method: [
      "Blend frozen bananas in food processor until creamy.",
      "Add cacao, almond butter, vanilla, salt.",
      "Blend until smooth.",
      "Eat immediately as soft serve or freeze 1 hour for firmer texture.",
    ],
    phaseBenefit: "Cacao is one of the highest food sources of magnesium — the key luteal phase mineral for reducing PMS, improving sleep, and easing cramps.",
  },
  // Additional recipes per phase for the library
  { id: "iron-smoothie", name: "Iron Power Smoothie Bowl", phase: "menstrual", serves: 1, prepTime: "5 min", keyNutrients: ["Iron", "Vitamin C", "B12"], ingredients: ["Spinach", "Banana", "Hemp seeds", "Cacao", "Oat milk", "Goji berries"], method: ["Blend all until smooth.", "Top with seeds and berries."], phaseBenefit: "Spinach and hemp seeds provide plant-based iron. Vitamin C from goji aids absorption.", image: "/images/recipes/meals/iron-power-smoothie-bowl.png" },
  { id: "lentil-dhal", name: "Warming Lentil Dhal", phase: "menstrual", serves: 4, prepTime: "30 min", keyNutrients: ["Iron", "Fibre", "Anti-inflammatory"], ingredients: ["Red lentils", "Coconut milk", "Turmeric", "Ginger", "Garlic", "Spinach"], method: ["Cook lentils with spices.", "Add coconut milk and spinach.", "Serve with rice."], phaseBenefit: "Comforting and nourishing during menstruation. Ginger helps ease cramps.", image: "/images/recipes/meals/warming-lentil-dhal.png" },
  { id: "chickpea-curry", name: "Chickpea & Spinach Curry", phase: "menstrual", serves: 3, prepTime: "25 min", keyNutrients: ["Iron", "Protein", "Magnesium"], ingredients: ["Chickpeas", "Spinach", "Coconut milk", "Tomatoes", "Garam masala"], method: ["Sauté spices.", "Add chickpeas and tomatoes.", "Simmer and add spinach."], phaseBenefit: "Iron-rich chickpeas with magnesium from spinach ease menstrual symptoms.", image: "/images/recipes/meals/chickpea-spinach-curry.png" },
  { id: "mushroom-shepherds", name: "Mushroom Lentil Shepherd's Pie", phase: "menstrual", serves: 4, prepTime: "45 min", keyNutrients: ["Iron", "B vitamins", "Comfort"], ingredients: ["Brown lentils", "Mushrooms", "Sweet potato", "Onion", "Herbs"], method: ["Cook lentil filling.", "Top with mashed sweet potato.", "Bake until golden."], phaseBenefit: "Deeply nourishing comfort food rich in iron and B vitamins.", image: "/images/recipes/meals/mushroom-lentil-shepherds-pie.png" },
  { id: "tempeh-stirfry", name: "Ginger Tempeh Stir-Fry", phase: "menstrual", serves: 2, prepTime: "20 min", keyNutrients: ["Protein", "Anti-inflammatory", "Iron"], ingredients: ["Tempeh", "Broccoli", "Ginger", "Tamari", "Brown rice"], method: ["Marinate and fry tempeh.", "Stir-fry veggies.", "Serve over rice."], phaseBenefit: "Ginger reduces inflammation. Tempeh provides iron and complete protein.", image: "/images/recipes/meals/ginger-tempeh-stir-fry.png" },
  { id: "fermented-bowl", name: "Kimchi & Brown Rice Power Bowl", phase: "follicular", serves: 2, prepTime: "15 min", keyNutrients: ["Probiotics", "Complex carbs", "Zinc"], ingredients: ["Brown rice", "Kimchi", "Edamame", "Avocado", "Sesame"], method: ["Assemble bowl with warm rice.", "Top with fermented veg and toppings."], phaseBenefit: "Fermented foods support the estrobolome. Complex carbs fuel rising energy.", image: "/images/recipes/meals/kimchi-brown-rice-power-bowl.png" },
  { id: "falafel-wrap", name: "Falafel & Sauerkraut Wrap", phase: "follicular", serves: 2, prepTime: "20 min", keyNutrients: ["Protein", "Probiotics", "Fibre"], ingredients: ["Chickpea falafel", "Sauerkraut", "Tahini", "Lettuce", "Wholemeal wrap"], method: ["Warm falafel.", "Assemble wraps with toppings."], phaseBenefit: "Fermented sauerkraut supports gut-estrogen axis. Chickpeas provide plant protein." },
  { id: "green-smoothie", name: "Green Energy Smoothie", phase: "follicular", serves: 1, prepTime: "5 min", keyNutrients: ["Iron", "Vitamin C", "Complex carbs"], ingredients: ["Spinach", "Apple", "Ginger", "Flaxseed", "Oat milk"], method: ["Blend all until smooth."], phaseBenefit: "Light and energising. Flaxseed lignans support healthy estrogen metabolism." },
  { id: "pad-thai", name: "Tofu Pad Thai", phase: "follicular", serves: 2, prepTime: "25 min", keyNutrients: ["Phytoestrogens", "Protein", "Complex carbs"], ingredients: ["Rice noodles", "Firm tofu", "Bean sprouts", "Peanuts", "Lime", "Tamari"], method: ["Cook noodles.", "Stir-fry tofu and veggies.", "Toss with sauce and serve."], phaseBenefit: "Tofu phytoestrogens complement rising estrogen. Light yet satisfying." },
  { id: "mushroom-risotto", name: "Creamy Mushroom Risotto", phase: "follicular", serves: 3, prepTime: "35 min", keyNutrients: ["B vitamins", "Complex carbs", "Zinc"], ingredients: ["Arborio rice", "Mixed mushrooms", "Onion", "Garlic", "Nutritional yeast", "Vegetable stock"], method: ["Sauté onion.", "Toast rice.", "Add stock gradually.", "Stir in mushrooms and yeast."], phaseBenefit: "Complex carbs support rising energy. Mushrooms are rich in B vitamins." },
  { id: "stuffed-capsicums", name: "Stuffed Capsicums with Quinoa", phase: "ovulatory", serves: 2, prepTime: "30 min", keyNutrients: ["Folate", "Zinc", "Antioxidants"], ingredients: ["Capsicums", "Quinoa", "Black beans", "Corn", "Spices", "Avocado"], method: ["Cook quinoa filling.", "Stuff capsicums.", "Bake until tender."], phaseBenefit: "Folate and zinc support ovulation. Colourful vegetables provide antioxidants." },
  { id: "raw-pad-thai", name: "Raw Veggie Pad Thai", phase: "ovulatory", serves: 2, prepTime: "15 min", keyNutrients: ["Enzymes", "Antioxidants", "Zinc"], ingredients: ["Zucchini noodles", "Carrot", "Red cabbage", "Cashews", "Lime-tamari dressing"], method: ["Spiralize veggies.", "Toss with dressing.", "Top with cashews."], phaseBenefit: "Raw foods are easiest to digest now. Cashews provide zinc for ovulation." },
  { id: "mango-sushi", name: "Avocado Mango Sushi Rolls", phase: "ovulatory", serves: 2, prepTime: "25 min", keyNutrients: ["Folate", "Healthy fats", "Zinc"], ingredients: ["Sushi rice", "Nori", "Avocado", "Mango", "Cucumber", "Sesame"], method: ["Prepare sushi rice.", "Roll with fillings.", "Slice and serve."], phaseBenefit: "Avocado provides healthy fats for hormone production. Mango offers antioxidants." },
  { id: "leafy-salad", name: "Big Leafy Salad with Seeds", phase: "ovulatory", serves: 2, prepTime: "10 min", keyNutrients: ["Folate", "Zinc", "Fibre"], ingredients: ["Mixed greens", "Pumpkin seeds", "Sunflower seeds", "Tahini dressing", "Lemon"], method: ["Toss greens.", "Top with seeds and dressing."], phaseBenefit: "Seeds provide zinc for egg development. Light eating matches lower appetite." },
  { id: "zucchini-fritters", name: "Zucchini Fritters with Tzatziki", phase: "ovulatory", serves: 2, prepTime: "20 min", keyNutrients: ["Zinc", "B vitamins", "Antioxidants"], ingredients: ["Zucchini", "Chickpea flour", "Herbs", "Coconut yoghurt", "Cucumber"], method: ["Grate and squeeze zucchini.", "Mix with flour and herbs.", "Fry until golden.", "Serve with tzatziki."], phaseBenefit: "Light yet satisfying. Chickpea flour provides protein and folate." },
  { id: "sweet-potato-soup", name: "Sweet Potato & Black Bean Soup", phase: "luteal", serves: 4, prepTime: "30 min", keyNutrients: ["Magnesium", "B6", "Complex carbs"], ingredients: ["Sweet potato", "Black beans", "Onion", "Cumin", "Chilli", "Lime"], method: ["Sauté aromatics.", "Add sweet potato and beans.", "Simmer until tender.", "Blend partially."], phaseBenefit: "Sweet potato provides B6 for progesterone support. Black beans stabilise blood sugar." },
  { id: "cashew-lasagne", name: "Veg Lasagne with Cashew Béchamel", phase: "luteal", serves: 4, prepTime: "50 min", keyNutrients: ["Magnesium", "Protein", "Complex carbs"], ingredients: ["Lasagne sheets", "Cashews", "Mushrooms", "Spinach", "Tomato sauce"], method: ["Make cashew cream.", "Layer with veggies and pasta.", "Bake until golden."], phaseBenefit: "Nutrient-dense and warming. Cashews provide magnesium for PMS relief." },
  { id: "tikka-masala", name: "Chickpea Tikka Masala", phase: "luteal", serves: 3, prepTime: "30 min", keyNutrients: ["Protein", "B6", "Complex carbs"], ingredients: ["Chickpeas", "Coconut cream", "Tomatoes", "Tikka spices", "Rice"], method: ["Cook spice paste.", "Add chickpeas and cream.", "Simmer and serve with rice."], phaseBenefit: "Higher calorie needs are normal. Chickpeas provide protein and B6." },
  { id: "black-bean-chilli", name: "Black Bean Chilli with Cornbread", phase: "luteal", serves: 4, prepTime: "35 min", keyNutrients: ["Magnesium", "Iron", "B6"], ingredients: ["Black beans", "Tomatoes", "Peppers", "Spices", "Cornmeal"], method: ["Cook chilli.", "Bake cornbread.", "Serve together."], phaseBenefit: "Warming and sustaining. Beans provide magnesium, iron, and steady energy." },
  { id: "coconut-dhal", name: "Coconut Dhal with Spinach", phase: "luteal", serves: 3, prepTime: "25 min", keyNutrients: ["Magnesium", "Iron", "Anti-inflammatory"], ingredients: ["Yellow lentils", "Coconut milk", "Spinach", "Turmeric", "Cumin"], method: ["Cook lentils with spices.", "Add coconut and spinach.", "Serve with rice."], phaseBenefit: "Comforting and rich in minerals. Perfect for the inward energy of the luteal phase." },
];

export const NUTRIENT_FOCUS: Record<Phase, string[]> = {
  menstrual: ["Iron", "Vitamin C", "Magnesium", "Anti-inflammatory"],
  follicular: ["Iron", "Folate", "Zinc", "Probiotics"],
  ovulatory: ["Antioxidants", "Zinc", "Folate", "Raw foods"],
  luteal: ["Magnesium", "B6", "Complex carbs", "Protein"],
};
