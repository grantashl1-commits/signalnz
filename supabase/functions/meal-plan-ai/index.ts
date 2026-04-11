import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ═══ COMPLETE RECIPE BANK (from reference PDFs) ═══
interface Recipe {
  name: string;
  phase: string[];
  mealType: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prepTime: string;
  serves: number;
  ingredients: string[];
  method: string[];
  keyNutrients: string[];
  nutritionalNote: string;
  tags: string[];
}

const RECIPE_BANK: Recipe[] = [
  // ── MENSTRUAL PHASE ──
  { name: "Signal Sunrise Bowl", phase: ["menstrual"], mealType: ["breakfast"], calories: 340, protein: 12, carbs: 42, fat: 15, prepTime: "10 min", serves: 1, ingredients: ["½ cup rolled oats","¼ cup mixed berries","1 tbsp peanut butter","1 tbsp chia seeds","1 cup oat milk","1 tsp honey"], method: ["1. Cook oats with oat milk for 5 minutes","2. Top with berries, peanut butter, and chia seeds","3. Drizzle with honey"], keyNutrients: ["Iron","Fibre","Magnesium"], nutritionalNote: "Warming oats with iron-supporting chia and magnesium from peanut butter — ideal for early menstrual phase.", tags: ["vegetarian","quick"] },
  { name: "Signal Iron Restore Bowl", phase: ["menstrual"], mealType: ["lunch"], calories: 380, protein: 20, carbs: 44, fat: 14, prepTime: "20 min", serves: 1, ingredients: ["1 cup cooked lentils","2 cups baby spinach","½ beetroot, roasted","1 orange, segmented","1 tbsp tahini","1 tsp lemon juice"], method: ["1. Arrange spinach as base","2. Top with warm lentils and roasted beetroot","3. Add orange segments","4. Drizzle with tahini and lemon juice"], keyNutrients: ["Iron","Vitamin C","Folate","Protein 20g"], nutritionalNote: "Iron-rich lentils and spinach paired with vitamin C from orange for maximum absorption.", tags: ["vegan","iron-rich"] },
  { name: "Signal Golden Immunity Soup", phase: ["menstrual"], mealType: ["dinner"], calories: 360, protein: 14, carbs: 46, fat: 14, prepTime: "30 min", serves: 2, ingredients: ["1 large kumara, cubed","1 cup red lentils","1 can coconut milk","2 tsp turmeric","1 tsp ginger, grated","4 cups vegetable stock","1 tbsp olive oil"], method: ["1. Sauté ginger in olive oil for 1 minute","2. Add kumara and cook 3 minutes","3. Add lentils, stock, turmeric, and coconut milk","4. Simmer 20 minutes until tender","5. Blend until smooth"], keyNutrients: ["Turmeric","Iron","Vitamin A","Protein 14g"], nutritionalNote: "Anti-inflammatory turmeric and warming kumara support comfort during menstruation.", tags: ["vegan","warming","anti-inflammatory"] },
  { name: "Signal Warming Miso Ramen", phase: ["menstrual"], mealType: ["dinner"], calories: 440, protein: 22, carbs: 52, fat: 16, prepTime: "25 min", serves: 1, ingredients: ["200g ramen noodles","150g firm tofu, cubed","2 cups bok choy","2 tbsp miso paste","4 cups dashi or veg stock","1 tbsp sesame oil","1 spring onion, sliced"], method: ["1. Dissolve miso in warm stock","2. Cook noodles per package instructions","3. Pan-fry tofu in sesame oil until golden","4. Blanch bok choy in broth","5. Assemble bowl: noodles, broth, tofu, bok choy, spring onion"], keyNutrients: ["Iron","Protein 22g","Magnesium","B12"], nutritionalNote: "Warming miso broth with plant protein — comforting and easily digestible during menstrual phase.", tags: ["vegetarian","warming"] },
  { name: "Signal Anti-Inflammatory Curry", phase: ["menstrual"], mealType: ["dinner"], calories: 420, protein: 16, carbs: 46, fat: 18, prepTime: "35 min", serves: 2, ingredients: ["1 can chickpeas","1 small cauliflower, florets","1 can coconut milk","2 tbsp curry paste","2 tsp turmeric","1 cup brown rice","1 tbsp coconut oil"], method: ["1. Sauté curry paste and turmeric in coconut oil","2. Add cauliflower and cook 5 minutes","3. Add chickpeas and coconut milk","4. Simmer 20 minutes","5. Serve over brown rice"], keyNutrients: ["Turmeric","Iron","Fibre","Protein 16g"], nutritionalNote: "Turmeric and chickpeas provide anti-inflammatory and iron support.", tags: ["vegan","anti-inflammatory"] },
  { name: "Signal Omega-3 Breakfast Bowl", phase: ["menstrual"], mealType: ["breakfast"], calories: 420, protein: 14, carbs: 52, fat: 18, prepTime: "5 min (overnight)", serves: 1, ingredients: ["½ cup rolled oats","1 tbsp chia seeds","1 tbsp hemp hearts","2 tbsp walnuts, crushed","1 cup almond milk","1 tbsp maple syrup","¼ cup blueberries"], method: ["1. Combine oats, chia, hemp, walnuts, and milk in jar","2. Refrigerate overnight","3. Top with blueberries and maple syrup"], keyNutrients: ["Omega-3","Magnesium","Iron","Fibre"], nutritionalNote: "Triple omega-3 sources support prostaglandin balance during menstruation.", tags: ["vegan","overnight","omega-3"] },
  { name: "Signal Date Cacao Bliss Balls", phase: ["menstrual","follicular","ovulatory","luteal"], mealType: ["snack"], calories: 120, protein: 2, carbs: 14, fat: 6, prepTime: "15 min", serves: 10, ingredients: ["1 cup medjool dates, pitted","½ cup almonds","2 tbsp cacao powder","1 tbsp coconut oil","pinch sea salt"], method: ["1. Blend all ingredients in food processor","2. Roll into 10 balls","3. Refrigerate 30 minutes"], keyNutrients: ["Magnesium","Iron","Antioxidants"], nutritionalNote: "Magnesium-rich cacao and natural sugars from dates for a quick energy boost.", tags: ["vegan","batch-prep","snack"] },
  { name: "Signal Carrot Cake Bliss Balls", phase: ["menstrual","follicular","ovulatory","luteal"], mealType: ["snack"], calories: 110, protein: 2, carbs: 16, fat: 4, prepTime: "15 min", serves: 10, ingredients: ["1 cup oats","½ cup grated carrot","¼ cup dates","2 tbsp coconut","1 tsp cinnamon","1 tbsp maple syrup"], method: ["1. Pulse oats in blender until flour-like","2. Mix all ingredients","3. Roll into 10 balls","4. Refrigerate"], keyNutrients: ["Vitamin A","Fibre","Cinnamon"], nutritionalNote: "Naturally sweet with fibre and beta-carotene from carrots.", tags: ["vegan","batch-prep","snack"] },

  // ── FOLLICULAR PHASE ──
  { name: "Signal Garden Frittata", phase: ["follicular"], mealType: ["breakfast"], calories: 243, protein: 18, carbs: 3, fat: 18, prepTime: "20 min", serves: 2, ingredients: ["4 large eggs","2 cups baby spinach","4 rashers streaky bacon, chopped","½ cup cherry tomatoes","¼ cup feta cheese","1 tbsp olive oil","salt and pepper"], method: ["1. Preheat oven to 180°C","2. Sauté bacon in olive oil until crisp","3. Add spinach and cook until wilted","4. Pour beaten eggs over, add tomatoes and feta","5. Bake 12-15 minutes until set"], keyNutrients: ["Protein 18g","B12","Iron","Zinc"], nutritionalNote: "High-protein start with zinc and B12 to match rising energy in follicular phase.", tags: ["high-protein","keto-friendly"] },
  { name: "Signal Spring Grain Bowl", phase: ["follicular"], mealType: ["lunch"], calories: 460, protein: 20, carbs: 48, fat: 22, prepTime: "25 min", serves: 1, ingredients: ["1 cup cooked quinoa","½ cup edamame","½ avocado, sliced","2 tbsp kimchi","1 tbsp sesame seeds","1 tbsp soy sauce","1 tsp sesame oil"], method: ["1. Arrange quinoa as base","2. Top with edamame, avocado, kimchi","3. Sprinkle sesame seeds","4. Drizzle soy sauce and sesame oil"], keyNutrients: ["Protein 20g","Probiotics","Omega-3","Zinc"], nutritionalNote: "Fermented kimchi supports oestrogen metabolism, quinoa provides complete protein.", tags: ["vegetarian","fermented"] },
  { name: "Signal Citrus Tempeh Salad", phase: ["follicular"], mealType: ["lunch"], calories: 420, protein: 24, carbs: 34, fat: 20, prepTime: "20 min", serves: 1, ingredients: ["200g tempeh, sliced","1 orange, segmented","2 cups mixed greens","2 tbsp tahini","1 tbsp lemon juice","1 tsp maple syrup","1 tbsp olive oil"], method: ["1. Pan-fry tempeh in olive oil until golden","2. Arrange greens with orange segments","3. Top with warm tempeh","4. Whisk tahini, lemon, maple for dressing","5. Drizzle over salad"], keyNutrients: ["Protein 24g","Phytoestrogens","Vitamin C","Iron"], nutritionalNote: "Tempeh provides phytoestrogens supporting the follicular phase, vitamin C aids iron absorption.", tags: ["vegan","phytoestrogen"] },
  { name: "Signal Herbed Chickpea Flatbread", phase: ["follicular"], mealType: ["lunch","dinner"], calories: 380, protein: 16, carbs: 36, fat: 18, prepTime: "25 min", serves: 2, ingredients: ["1 cup chickpea flour","1 cup water","2 tbsp olive oil","¼ cup hummus","1 cup rocket","½ cup cherry tomatoes","salt, herbs"], method: ["1. Whisk chickpea flour, water, 1 tbsp oil, salt","2. Rest batter 15 minutes","3. Cook in oiled pan like a pancake, 3 min each side","4. Top with hummus, rocket, tomatoes"], keyNutrients: ["Protein 16g","Iron","Fibre","Folate"], nutritionalNote: "Chickpea flour provides plant protein and iron for the energising follicular phase.", tags: ["vegan","high-fibre"] },
  { name: "Signal Hormone Balance Smoothie", phase: ["follicular"], mealType: ["breakfast","snack"], calories: 340, protein: 14, carbs: 40, fat: 14, prepTime: "5 min", serves: 1, ingredients: ["1 cup frozen berries","1 tbsp ground flaxseed","1 cup soy milk","1 banana","1 tbsp almond butter","1 tsp maca powder"], method: ["1. Blend all ingredients until smooth","2. Pour into glass and serve immediately"], keyNutrients: ["Phytoestrogens","Omega-3","Fibre","Protein 14g"], nutritionalNote: "Flaxseed and soy provide phytoestrogens to support rising oestrogen in follicular phase.", tags: ["vegan","quick","smoothie"] },
  { name: "Signal Seed Cycling Granola", phase: ["follicular","ovulatory","luteal","menstrual"], mealType: ["snack","breakfast"], calories: 220, protein: 6, carbs: 24, fat: 12, prepTime: "30 min", serves: 8, ingredients: ["2 cups rolled oats","¼ cup pumpkin seeds","¼ cup sunflower seeds","¼ cup flaxseed","2 tbsp honey","2 tbsp coconut oil","1 tsp cinnamon"], method: ["1. Mix oats, seeds, cinnamon","2. Melt coconut oil with honey","3. Combine and spread on baking tray","4. Bake at 160°C for 20 minutes, stirring halfway","5. Cool completely before storing"], keyNutrients: ["Zinc","Selenium","Omega-3","Fibre"], nutritionalNote: "Seed cycling granola with phase-supporting seeds for hormonal balance.", tags: ["vegan","batch-prep"] },

  // ── OVULATORY PHASE ──
  { name: "Signal Rainbow Nourish Plate", phase: ["ovulatory"], mealType: ["lunch"], calories: 420, protein: 14, carbs: 48, fat: 20, prepTime: "20 min", serves: 1, ingredients: ["1 cup cooked quinoa","½ mango, diced","½ avocado, sliced","2 tbsp pumpkin seeds","1 cup mixed salad greens","1 tbsp lime juice","1 tbsp olive oil"], method: ["1. Arrange quinoa on plate","2. Top with greens, mango, avocado","3. Sprinkle pumpkin seeds","4. Dress with lime juice and olive oil"], keyNutrients: ["Vitamin C","Vitamin E","Antioxidants","Protein 14g"], nutritionalNote: "Antioxidant-rich plate supporting ovulation with vitamin E from pumpkin seeds.", tags: ["vegan","raw-friendly"] },
  { name: "Signal Green Goddess Wrap", phase: ["ovulatory"], mealType: ["lunch"], calories: 360, protein: 14, carbs: 34, fat: 20, prepTime: "10 min", serves: 1, ingredients: ["1 large wholemeal wrap","½ avocado, mashed","1 cup sprouts","2 tbsp hemp seeds","½ cup grated carrot","1 tbsp lemon juice","pinch salt"], method: ["1. Spread mashed avocado on wrap","2. Layer sprouts, carrot, hemp seeds","3. Squeeze lemon juice, season","4. Roll tightly and slice"], keyNutrients: ["Omega-3","Fibre","Folate","Protein 14g"], nutritionalNote: "Light and raw-leaning wrap perfect for peak digestive capacity during ovulation.", tags: ["vegan","quick","raw-friendly"] },
  { name: "Signal Protein Recovery Bowl", phase: ["ovulatory"], mealType: ["dinner"], calories: 460, protein: 22, carbs: 44, fat: 20, prepTime: "25 min", serves: 1, ingredients: ["1 cup cooked quinoa","½ cup edamame","100g grilled chicken breast","½ cup roasted capsicum","2 tbsp tahini","1 tbsp soy sauce","1 cup baby spinach"], method: ["1. Arrange quinoa as base","2. Top with spinach, chicken, edamame, capsicum","3. Drizzle tahini and soy sauce"], keyNutrients: ["Protein 22g","Iron","Zinc","Complete amino acids"], nutritionalNote: "High-protein recovery bowl to support peak training during ovulatory phase.", tags: ["high-protein","post-workout"] },
  { name: "Signal Mango Cashew Sushi Bowl", phase: ["ovulatory"], mealType: ["lunch","dinner"], calories: 440, protein: 14, carbs: 58, fat: 18, prepTime: "20 min", serves: 1, ingredients: ["1 cup sushi rice, cooked","½ mango, sliced","¼ cup cashews","½ avocado","1 tbsp rice vinegar","1 sheet nori, shredded","1 tbsp soy sauce"], method: ["1. Season rice with rice vinegar","2. Arrange rice in bowl","3. Top with mango, avocado, cashews, nori","4. Drizzle soy sauce"], keyNutrients: ["Vitamin C","Vitamin E","Healthy fats","Manganese"], nutritionalNote: "Light, antioxidant-rich bowl for ovulatory phase when appetite is naturally lower.", tags: ["vegan","light"] },

  // ── LUTEAL PHASE ──
  { name: "Signal Magnesium Power Bowl", phase: ["luteal"], mealType: ["lunch","dinner"], calories: 480, protein: 18, carbs: 58, fat: 20, prepTime: "30 min", serves: 1, ingredients: ["1 cup cooked brown rice","1 medium kumara, roasted","2 cups kale, massaged","2 tbsp tahini","1 tbsp lemon juice","1 tbsp pumpkin seeds","pinch sea salt"], method: ["1. Roast kumara at 200°C for 25 minutes","2. Massage kale with lemon juice and salt","3. Arrange rice, kale, kumara in bowl","4. Drizzle tahini, sprinkle pumpkin seeds"], keyNutrients: ["Magnesium","Vitamin A","Iron","Protein 18g"], nutritionalNote: "Magnesium-rich tahini and pumpkin seeds help ease PMS symptoms in the luteal phase.", tags: ["vegan","magnesium-rich"] },
  { name: "Signal Comfort Dhal", phase: ["luteal"], mealType: ["dinner"], calories: 400, protein: 18, carbs: 42, fat: 18, prepTime: "30 min", serves: 2, ingredients: ["1 cup yellow lentils","1 can coconut milk","2 cups baby spinach","2 tsp cumin","1 tsp turmeric","1 onion, diced","2 cloves garlic","1 tbsp coconut oil"], method: ["1. Sauté onion and garlic in coconut oil","2. Add cumin and turmeric, cook 1 minute","3. Add lentils and coconut milk with 2 cups water","4. Simmer 20 minutes until lentils soft","5. Stir in spinach until wilted","6. Season with salt"], keyNutrients: ["Protein 18g","Iron","Magnesium","B6"], nutritionalNote: "Warming, sustaining dhal with magnesium and B6 to support progesterone and ease PMS.", tags: ["vegan","warming","batch-friendly"] },
  { name: "Signal PMS Ease Stew", phase: ["luteal"], mealType: ["dinner"], calories: 340, protein: 16, carbs: 48, fat: 6, prepTime: "35 min", serves: 2, ingredients: ["1 small pumpkin, cubed","1 can black beans","1 can diced tomatoes","1 tsp cumin","1 tsp smoked paprika","1 onion, diced","2 cups vegetable stock"], method: ["1. Sauté onion with spices","2. Add pumpkin, beans, tomatoes, stock","3. Simmer 25 minutes until pumpkin tender","4. Season and serve"], keyNutrients: ["Magnesium","Fibre","Vitamin A","Iron"], nutritionalNote: "Low-fat, high-fibre stew with magnesium-rich pumpkin and iron from black beans.", tags: ["vegan","low-fat","batch-friendly"] },
  { name: "Signal Adaptogen Hot Cacao", phase: ["luteal"], mealType: ["snack"], calories: 180, protein: 4, carbs: 28, fat: 6, prepTime: "5 min", serves: 1, ingredients: ["1 cup oat milk","2 tbsp raw cacao powder","1 tsp maca powder","1 tsp honey","pinch cinnamon"], method: ["1. Heat oat milk gently","2. Whisk in cacao, maca, cinnamon","3. Sweeten with honey","4. Pour and enjoy warm"], keyNutrients: ["Magnesium","Antioxidants","Adaptogens","Iron"], nutritionalNote: "Warming cacao with maca adaptogen helps manage luteal phase stress and cravings.", tags: ["vegan","warming","quick"] },
  { name: "Signal Berry Bircher", phase: ["luteal"], mealType: ["breakfast"], calories: 380, protein: 12, carbs: 52, fat: 14, prepTime: "5 min (overnight)", serves: 1, ingredients: ["½ cup rolled oats","½ cup Greek yoghurt","½ cup almond milk","¼ cup mixed berries","1 tbsp chia seeds","1 tbsp maple syrup","1 tbsp sliced almonds"], method: ["1. Combine oats, yoghurt, milk, chia in jar","2. Refrigerate overnight","3. Top with berries, almonds, maple syrup"], keyNutrients: ["Calcium","Magnesium","Protein 12g","Fibre"], nutritionalNote: "Calcium and magnesium support luteal phase, complex carbs stabilise blood sugar.", tags: ["vegetarian","overnight"] },
  { name: "Signal Savoury Egg Bites", phase: ["luteal"], mealType: ["breakfast","snack"], calories: 280, protein: 20, carbs: 8, fat: 18, prepTime: "25 min", serves: 6, ingredients: ["6 large eggs","½ cup diced capsicum","¼ cup feta cheese","¼ cup chopped spinach","1 tbsp olive oil","salt and pepper"], method: ["1. Preheat oven to 180°C","2. Grease muffin tin with olive oil","3. Whisk eggs, fold in vegetables and feta","4. Pour into 6 muffin cups","5. Bake 15-18 minutes until set"], keyNutrients: ["Protein 20g","B12","Vitamin D","Choline"], nutritionalNote: "High-protein egg bites provide sustained energy and choline for luteal phase brain fog.", tags: ["high-protein","batch-prep","keto-friendly"] },
];

// ═══ KIDS RECIPE BANK ═══
interface KidsRecipe {
  id: string;
  name: string;
  mealType: string[];
  protein: string;
  prepTime: string;
  serves: number;
  ingredients: string[];
  method: string[];
  tags: string[];
}

const KIDS_RECIPE_BANK: KidsRecipe[] = [
  { id: "kids-chicken-strips", name: "Crispy Chicken Strips", mealType: ["lunch","dinner"], protein: "chicken", prepTime: "25 min", serves: 4, ingredients: ["500g chicken breast, sliced","1 cup breadcrumbs","½ cup flour","1 egg","1 tsp paprika"], method: ["Coat in flour, egg, breadcrumbs","Bake 200°C 15-18 min"], tags: ["nut-free"] },
  { id: "kids-chicken-fried-rice", name: "Chicken Fried Rice", mealType: ["lunch","dinner"], protein: "chicken", prepTime: "20 min", serves: 4, ingredients: ["2 cups rice","200g chicken","1 cup peas/corn","2 eggs","2 tbsp soy sauce"], method: ["Cook chicken, scramble eggs, add rice and veg"], tags: ["nut-free","dairy-free"] },
  { id: "kids-chicken-quesadilla", name: "Chicken & Cheese Quesadilla", mealType: ["lunch","dinner"], protein: "chicken", prepTime: "15 min", serves: 2, ingredients: ["2 tortillas","1 cup chicken","½ cup cheese","¼ cup corn"], method: ["Fill, fold, pan-fry 2-3 min each side"], tags: ["nut-free","egg-free"] },
  { id: "kids-chicken-nugget-bowl", name: "Chicken Nugget Rice Bowl", mealType: ["dinner"], protein: "chicken", prepTime: "25 min", serves: 4, ingredients: ["400g chicken thigh","1 cup breadcrumbs","1 egg","rice","broccoli"], method: ["Coat and bake chicken, serve over rice"], tags: ["nut-free","dairy-free"] },
  { id: "kids-chicken-pasta", name: "Creamy Chicken Pasta", mealType: ["dinner"], protein: "chicken", prepTime: "20 min", serves: 4, ingredients: ["300g pasta","200g chicken","½ cup cream cheese","¼ cup milk","peas"], method: ["Cook pasta, cook chicken, mix with cream sauce"], tags: ["nut-free","egg-free"] },
  { id: "kids-beef-meatballs", name: "Mini Beef Meatballs", mealType: ["lunch","dinner"], protein: "beef", prepTime: "30 min", serves: 4, ingredients: ["500g beef mince","breadcrumbs","1 egg","1 zucchini","passata"], method: ["Mix, roll, brown, simmer in sauce 15 min"], tags: ["nut-free","dairy-free"] },
  { id: "kids-beef-tacos", name: "Mild Beef Tacos", mealType: ["dinner"], protein: "beef", prepTime: "20 min", serves: 4, ingredients: ["400g mince","cumin","taco shells","lettuce","cheese"], method: ["Brown mince with spices, build tacos"], tags: ["nut-free","egg-free"] },
  { id: "kids-beef-bolognese", name: "Hidden Veggie Bolognese", mealType: ["dinner"], protein: "beef", prepTime: "30 min", serves: 4, ingredients: ["400g mince","carrot","zucchini","passata","spaghetti"], method: ["Brown mince, add grated veg and sauce, simmer"], tags: ["nut-free","egg-free"] },
  { id: "kids-beef-rice-bowl", name: "Teriyaki Beef Rice Bowl", mealType: ["dinner"], protein: "beef", prepTime: "20 min", serves: 4, ingredients: ["300g beef strips","soy sauce","honey","ginger","rice","edamame"], method: ["Stir-fry beef, add sauce, serve over rice"], tags: ["nut-free","dairy-free","egg-free"] },
  { id: "kids-fish-fingers", name: "Homemade Fish Fingers", mealType: ["lunch","dinner"], protein: "fish", prepTime: "25 min", serves: 4, ingredients: ["400g white fish","breadcrumbs","flour","1 egg","paprika"], method: ["Coat and bake 200°C 12-15 min"], tags: ["nut-free","dairy-free"] },
  { id: "kids-salmon-pasta", name: "Salmon Pasta Bake", mealType: ["dinner"], protein: "fish", prepTime: "30 min", serves: 4, ingredients: ["300g pasta","200g canned salmon","peas","cheese","milk","butter","flour"], method: ["Make white sauce, fold in salmon, bake with cheese"], tags: ["nut-free","egg-free"] },
  { id: "kids-tuna-rice", name: "Tuna & Rice Bowl", mealType: ["lunch"], protein: "fish", prepTime: "15 min", serves: 2, ingredients: ["1 can tuna","1 cup rice","corn","mayo","lemon"], method: ["Mix and serve"], tags: ["nut-free","egg-free","dairy-free","gluten-free"] },
  { id: "kids-tofu-nuggets", name: "Crispy Tofu Nuggets", mealType: ["lunch","dinner"], protein: "tofu", prepTime: "25 min", serves: 4, ingredients: ["400g firm tofu","breadcrumbs","soy sauce","maple syrup","garlic powder"], method: ["Coat and bake 200°C 20 min"], tags: ["vegan","nut-free","dairy-free","egg-free"] },
  { id: "kids-tofu-stir-fry", name: "Sweet Tofu Stir Fry", mealType: ["dinner"], protein: "tofu", prepTime: "20 min", serves: 4, ingredients: ["300g tofu","broccoli","carrot","soy sauce","honey","rice"], method: ["Fry tofu, add veg and sauce, serve over rice"], tags: ["vegetarian","nut-free","dairy-free","egg-free"] },
  { id: "kids-bean-quesadilla", name: "Black Bean & Cheese Quesadilla", mealType: ["lunch","dinner"], protein: "beans", prepTime: "10 min", serves: 2, ingredients: ["2 tortillas","black beans","cheese","corn","cumin"], method: ["Fill, fold, pan-fry"], tags: ["vegetarian","nut-free","egg-free"] },
  { id: "kids-lentil-pasta", name: "Lentil Bolognese", mealType: ["dinner"], protein: "lentils", prepTime: "25 min", serves: 4, ingredients: ["1 cup red lentils","passata","carrot","zucchini","pasta"], method: ["Simmer lentils in sauce 20 min, serve over pasta"], tags: ["vegan","nut-free","dairy-free","egg-free","gluten-free"] },
  { id: "kids-chickpea-curry", name: "Mild Coconut Chickpea Curry", mealType: ["dinner"], protein: "beans", prepTime: "20 min", serves: 4, ingredients: ["chickpeas","coconut milk","curry powder","turmeric","rice","spinach"], method: ["Simmer chickpeas in coconut milk, serve over rice"], tags: ["vegan","nut-free","dairy-free","egg-free","gluten-free"] },
  { id: "kids-bean-nachos", name: "Bean & Cheese Nachos", mealType: ["dinner"], protein: "beans", prepTime: "15 min", serves: 4, ingredients: ["corn chips","beans","cheese","corn","sour cream"], method: ["Top chips with beans and cheese, bake 8-10 min"], tags: ["vegetarian","nut-free","egg-free","gluten-free"] },
  { id: "kids-egg-fried-rice", name: "Egg Fried Rice", mealType: ["lunch","dinner"], protein: "eggs", prepTime: "15 min", serves: 4, ingredients: ["2 cups rice","3 eggs","peas/corn","soy sauce","sesame oil"], method: ["Scramble eggs, add rice and veg, toss with sauce"], tags: ["vegetarian","nut-free","dairy-free"] },
  { id: "kids-frittata", name: "Veggie Mini Frittatas", mealType: ["lunch"], protein: "eggs", prepTime: "25 min", serves: 6, ingredients: ["6 eggs","cheese","capsicum","corn","milk"], method: ["Whisk eggs, pour into muffin tin, bake 15-18 min"], tags: ["vegetarian","nut-free","gluten-free"] },
  { id: "kids-mac-cheese", name: "Classic Mac & Cheese", mealType: ["lunch","dinner"], protein: "cheese", prepTime: "20 min", serves: 4, ingredients: ["300g macaroni","cheese","milk","butter","flour"], method: ["Make cheese sauce, combine with pasta"], tags: ["vegetarian","nut-free","egg-free"] },
  { id: "kids-pork-stir-fry", name: "Sweet & Sour Pork with Rice", mealType: ["dinner"], protein: "pork", prepTime: "20 min", serves: 4, ingredients: ["300g pork","capsicum","pineapple","tomato sauce","soy sauce","rice"], method: ["Stir-fry pork, add veg and sauce, serve over rice"], tags: ["nut-free","dairy-free","egg-free","gluten-free"] },
  { id: "kids-shrimp-pasta", name: "Garlic Butter Shrimp Pasta", mealType: ["dinner"], protein: "shrimp", prepTime: "20 min", serves: 4, ingredients: ["300g pasta","200g shrimp","butter","garlic","parmesan","spinach"], method: ["Cook pasta, sauté shrimp in garlic butter, combine"], tags: ["nut-free","egg-free"] },
];

const PROTEIN_ALIASES: Record<string, string[]> = {
  chicken: ["chicken"],
  beef: ["beef", "steak", "mince"],
  fish: ["fish", "salmon", "tuna", "cod", "snapper"],
  tofu: ["tofu", "tempeh"],
  beans: ["bean", "chickpea", "lentil"],
  lentils: ["lentil"],
  eggs: ["egg", "frittata"],
  cheese: ["cheese", "mac"],
  pork: ["pork", "bacon", "ham", "sausage"],
  shrimp: ["shrimp", "prawn"],
  none: ["vegan", "plant"],
};

function findKidsRecipe(adultRecipeName: string, mealType: string, kidsAllergies: string[], kidsDietType: string, exclude: string[], seed: number): KidsRecipe | null {
  const lower = adultRecipeName.toLowerCase();
  let detectedProtein = "";
  for (const [protein, aliases] of Object.entries(PROTEIN_ALIASES)) {
    if (aliases.some(a => lower.includes(a))) { detectedProtein = protein; break; }
  }

  let candidates = KIDS_RECIPE_BANK.filter(r => {
    if (!r.mealType.includes(mealType === "lunch" ? "lunch" : "dinner")) return false;
    if (exclude.includes(r.id)) return false;
    for (const allergy of kidsAllergies) {
      const al = allergy.toLowerCase().trim();
      if (!al) continue;
      const tagMap: Record<string, string> = { dairy: "dairy-free", gluten: "gluten-free", nut: "nut-free", peanut: "nut-free", egg: "egg-free", nuts: "nut-free" };
      const requiredTag = tagMap[al] || `${al}-free`;
      if (!r.tags.includes(requiredTag)) {
        if (r.ingredients.join(" ").toLowerCase().includes(al)) return false;
      }
    }
    if (kidsDietType) {
      const dt = kidsDietType.toLowerCase();
      if (dt.includes("vegan") && !r.tags.includes("vegan")) return false;
      if (dt.includes("vegetarian") && !r.tags.includes("vegan") && !r.tags.includes("vegetarian")) return false;
      if (dt.includes("dairy-free") && !r.tags.includes("dairy-free")) return false;
      if (dt.includes("gluten-free") && !r.tags.includes("gluten-free")) return false;
      if (dt.includes("nut-free") && !r.tags.includes("nut-free")) return false;
      if (dt.includes("egg-free") && !r.tags.includes("egg-free")) return false;
    }
    return true;
  });

  if (detectedProtein) {
    const proteinMatches = candidates.filter(r => r.protein === detectedProtein);
    if (proteinMatches.length > 0) candidates = proteinMatches;
  }
  if (candidates.length === 0) return null;
  return candidates[seed % candidates.length];
}

// ═══ DETERMINISTIC PLAN BUILDER ═══

function getPhaseForDay(cycleDay: number): string {
  if (cycleDay <= 5) return "menstrual";
  if (cycleDay <= 13) return "follicular";
  if (cycleDay <= 16) return "ovulatory";
  return "luteal";
}

function filterRecipes(phase: string, mealType: string, dislikes: string[], dietType: string, exclude: string[]): Recipe[] {
  return RECIPE_BANK.filter(r => {
    if (!r.phase.includes(phase) && !r.phase.includes("menstrual") && !r.phase.includes("follicular") && !r.phase.includes("ovulatory") && !r.phase.includes("luteal")) return false;
    // Prefer phase-specific, but allow universal snacks
    const phaseMatch = r.phase.includes(phase) || r.phase.length === 4;
    if (!phaseMatch) return false;
    if (!r.mealType.includes(mealType)) return false;
    if (exclude.includes(r.name)) return false;
    // Filter dislikes
    const nameLower = r.name.toLowerCase();
    const ingredientsLower = r.ingredients.join(" ").toLowerCase();
    for (const d of dislikes) {
      const dl = d.toLowerCase().trim();
      if (dl && (nameLower.includes(dl) || ingredientsLower.includes(dl))) return false;
    }
    // Filter diet type
    if (dietType) {
      const dt = dietType.toLowerCase();
      if (dt.includes("vegan") && !r.tags.includes("vegan")) return false;
      if (dt.includes("vegetarian") && !r.tags.includes("vegan") && !r.tags.includes("vegetarian")) return false;
      if (dt.includes("keto") && !r.tags.includes("keto-friendly") && r.carbs > 20) return false;
    }
    return true;
  });
}

function pickRecipe(phase: string, mealType: string, dislikes: string[], dietType: string, used: string[], seed: number): Recipe | null {
  const candidates = filterRecipes(phase, mealType, dislikes, dietType, used);
  if (candidates.length === 0) {
    // Fallback: try any phase
    const fallback = RECIPE_BANK.filter(r => r.mealType.includes(mealType) && !used.includes(r.name));
    if (fallback.length === 0) return null;
    return fallback[seed % fallback.length];
  }
  return candidates[seed % candidates.length];
}

function buildDayPlan(cycleDay: number, prefs: any, mealAssignments: Record<string, any>, daySeed: number, kidsCount: number, kidsDietType: string, kidsAllergies: string[]) {
  const phase = getPhaseForDay(cycleDay);

  const meals: Record<string, any> = {};
  const mealKeys = ["breakfast", "morningSnack", "lunch", "afternoonSnack", "dinner"];
  const usedKidsIds: string[] = [];

  for (const key of mealKeys) {
    const assigned = mealAssignments[`${cycleDay}-${key}`];
    if (assigned) {
      meals[key] = {
        name: assigned.name,
        phase,
        mealType: key,
        prepTime: assigned.prepTime,
        serves: assigned.serves,
        calories: `~${assigned.calories} kcal`,
        protein: `~${assigned.protein}g`,
        ingredients: assigned.ingredients,
        method: assigned.method,
        nutritionalNote: assigned.nutritionalNote,
        keyNutrients: assigned.keyNutrients,
        isLeftover: assigned.isLeftover || false,
      };

      // Add kids substitute for lunch and dinner
      if (kidsCount > 0 && (key === "lunch" || key === "dinner")) {
        const kidsRecipe = findKidsRecipe(assigned.name, key, kidsAllergies, kidsDietType, usedKidsIds, daySeed + cycleDay);
        if (kidsRecipe) {
          usedKidsIds.push(kidsRecipe.id);
          meals[`kids${key.charAt(0).toUpperCase() + key.slice(1)}`] = {
            name: kidsRecipe.name,
            recipeId: kidsRecipe.id,
            prepTime: kidsRecipe.prepTime,
            serves: kidsRecipe.serves,
            ingredients: kidsRecipe.ingredients,
            method: kidsRecipe.method,
            proteinMatch: kidsRecipe.protein,
            isKidsMeal: true,
          };
        }
      }
    }
  }

  const totalCal = Object.values(meals).reduce((sum: number, m: any) => {
    const cal = parseInt(String(m?.calories || "0").replace(/\D/g, "")) || 0;
    return sum + cal;
  }, 0);
  const totalProtein = Object.values(meals).reduce((sum: number, m: any) => {
    const p = parseInt(String(m?.protein || "0").replace(/\D/g, "")) || 0;
    return sum + p;
  }, 0);

  const deficiencyFlags: string[] = [];
  if (phase === "menstrual") deficiencyFlags.push("Iron — pair with vitamin C sources", "Magnesium for cramp relief");
  if (phase === "luteal") deficiencyFlags.push("Magnesium for PMS", "B6 for mood support", "Calcium 1000mg target");
  if (phase === "follicular") deficiencyFlags.push("Zinc for rising FSH", "B vitamins for energy");

  return {
    cycleDay,
    phase,
    dailyCalories: `~${totalCal} kcal`,
    dailyProtein: `~${totalProtein}g`,
    hydrationTarget: "2.0-2.5L",
    deficiencyFlags,
    preWorkoutNote: "If training: eat 1.5 hours before. Include 30g carbs + 15g protein.",
    postWorkoutNote: "Within 60 min post-workout: 30g protein + 40g carbs.",
    ...meals,
  };
}

// Pre-assign meals for all days based on variety preferences
function assignMealsForWeek(dayStart: number, dayEnd: number, prefs: any, baseSeed: number): Record<string, any> {
  const assignments: Record<string, any> = {};
  const dislikes = [...(prefs.dislikes || "").split(",").map((s: string) => s.trim()), ...(prefs.userDietaryDislikes || [])].filter(Boolean);
  const dietType = prefs.dietType || "";
  const totalDays = dayEnd - dayStart + 1;

  // Helper: pick N unique recipes for a meal type across phase changes
  function pickNUnique(mealType: string, count: number, seed: number): Recipe[] {
    const results: Recipe[] = [];
    const usedNames: string[] = [];
    for (let i = 0; i < count; i++) {
      // Try each day's phase to get phase-appropriate recipes
      const phase = getPhaseForDay(dayStart + (i % totalDays));
      const recipe = pickRecipe(phase, mealType, dislikes, dietType, usedNames, seed + i * 17);
      if (recipe) {
        results.push(recipe);
        usedNames.push(recipe.name);
      }
    }
    return results;
  }

  // ── BREAKFAST ──
  const breakfastPref = prefs.breakfast || "batch";
  if (breakfastPref === "batch") {
    // Same breakfast every day
    const picks = pickNUnique("breakfast", 1, baseSeed);
    for (let d = dayStart; d <= dayEnd; d++) {
      if (picks[0]) assignments[`${d}-breakfast`] = picks[0];
    }
  } else if (breakfastPref === "rotate") {
    // 2-3 options rotated
    const picks = pickNUnique("breakfast", 3, baseSeed);
    for (let d = dayStart; d <= dayEnd; d++) {
      const idx = (d - dayStart) % Math.max(picks.length, 1);
      if (picks[idx]) assignments[`${d}-breakfast`] = picks[idx];
    }
  } else {
    // variety: different every day
    const picks = pickNUnique("breakfast", totalDays, baseSeed);
    for (let d = dayStart; d <= dayEnd; d++) {
      const idx = (d - dayStart) % Math.max(picks.length, 1);
      if (picks[idx]) assignments[`${d}-breakfast`] = picks[idx];
    }
  }

  // ── LUNCH ──
  const lunchPref = prefs.lunch || "batch";
  if (lunchPref === "batch") {
    const picks = pickNUnique("lunch", 1, baseSeed + 100);
    for (let d = dayStart; d <= dayEnd; d++) {
      if (picks[0]) assignments[`${d}-lunch`] = picks[0];
    }
  } else if (lunchPref === "rotate") {
    const picks = pickNUnique("lunch", 3, baseSeed + 100);
    for (let d = dayStart; d <= dayEnd; d++) {
      const idx = (d - dayStart) % Math.max(picks.length, 1);
      if (picks[idx]) assignments[`${d}-lunch`] = picks[idx];
    }
  } else {
    const picks = pickNUnique("lunch", totalDays, baseSeed + 100);
    for (let d = dayStart; d <= dayEnd; d++) {
      const idx = (d - dayStart) % Math.max(picks.length, 1);
      if (picks[idx]) assignments[`${d}-lunch`] = picks[idx];
    }
  }

  // ── DINNER ──
  // double = same every day, fresh = different every day, mix = 2-3 rotated
  const dinnerPref = prefs.dinner || "double";
  if (dinnerPref === "double") {
    const picks = pickNUnique("dinner", 1, baseSeed + 200);
    for (let d = dayStart; d <= dayEnd; d++) {
      if (picks[0]) assignments[`${d}-dinner`] = picks[0];
    }
  } else if (dinnerPref === "mix") {
    // mix = 2-3 options rotated (some leftovers)
    const picks = pickNUnique("dinner", 3, baseSeed + 200);
    for (let d = dayStart; d <= dayEnd; d++) {
      const idx = (d - dayStart) % Math.max(picks.length, 1);
      if (picks[idx]) {
        const isLeftover = (d - dayStart) > 0 && ((d - dayStart) % picks.length) === 0;
        assignments[`${d}-dinner`] = { ...picks[idx], isLeftover };
      }
    }
  } else {
    // fresh = different every day
    const picks = pickNUnique("dinner", totalDays, baseSeed + 200);
    for (let d = dayStart; d <= dayEnd; d++) {
      const idx = (d - dayStart) % Math.max(picks.length, 1);
      if (picks[idx]) assignments[`${d}-dinner`] = picks[idx];
    }
  }

  // ── SNACKS (always rotate) ──
  const snackPicks = pickNUnique("snack", 3, baseSeed + 300);
  for (let d = dayStart; d <= dayEnd; d++) {
    if (snackPicks.length > 0) {
      assignments[`${d}-morningSnack`] = snackPicks[(d - dayStart) % snackPicks.length];
      assignments[`${d}-afternoonSnack`] = snackPicks[((d - dayStart) + 1) % snackPicks.length];
    }
  }

  return assignments;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { preferences, mode, lockedMeals, existingPlan, regenerateDay, regenerateMeal,
      startCycleDay, endCycleDay, userDietaryDislikes } = body;

    // Credit check: deterministic plan costs 1 credit
    const userIdentifier = body.userIdentifier;
    if (userIdentifier) {
      const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      const { data: credits } = await sb.from("ai_credits").select("*").eq("user_identifier", userIdentifier).maybeSingle();
      const cost = 1;
      if (credits && (credits.credits_remaining || 0) < cost) {
        return new Response(JSON.stringify({ error: `You need ${cost} credit for meal plan generation.` }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (credits) {
        await sb.from("ai_credits").update({ credits_remaining: (credits.credits_remaining || 0) - cost, updated_at: new Date().toISOString() }).eq("user_identifier", userIdentifier);
      } else {
        await sb.from("ai_credits").insert({ user_identifier: userIdentifier, credits_remaining: 5 - cost, tier: "free" });
      }
      await sb.from("ai_usage").insert({ user_identifier: userIdentifier, function_name: "meal-plan-ai", tokens_used: cost });
    }

    const prefs = {
      ...(preferences || {}),
      userDietaryDislikes: userDietaryDislikes || [],
    };
    const kidsCount = prefs.kids || 0;
    const kidsDietType = prefs.kidsDietType || "";
    const kidsAllergies = (prefs.kidsAllergies || "").split(",").map((s: string) => s.trim()).filter(Boolean);

    const dayStart = startCycleDay || 1;
    const dayEnd = endCycleDay || Math.min(dayStart + 6, 28);
    if (mode === "regenerate_meal" && regenerateDay && regenerateMeal && existingPlan) {
      const phase = getPhaseForDay(regenerateDay);
      const dislikes = [...(prefs.dislikes || "").split(",").map((s: string) => s.trim()), ...(prefs.userDietaryDislikes || [])].filter(Boolean);
      const currentName = existingPlan.days?.find((d: any) => d.cycleDay === regenerateDay)?.[regenerateMeal]?.name || "";
      const recipe = pickRecipe(phase, regenerateMeal === "morningSnack" || regenerateMeal === "afternoonSnack" ? "snack" : regenerateMeal, dislikes, prefs.dietType || "", [currentName], Date.now());
      if (recipe) {
        return new Response(JSON.stringify({ name: recipe.name, phase, mealType: regenerateMeal, prepTime: recipe.prepTime, serves: recipe.serves, calories: `~${recipe.calories} kcal`, protein: `~${recipe.protein}g`, ingredients: recipe.ingredients, method: recipe.method, nutritionalNote: recipe.nutritionalNote, keyNutrients: recipe.keyNutrients }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Pre-assign all meals respecting variety preferences
    const baseSeed = Date.now();
    const mealAssignments = assignMealsForWeek(dayStart, dayEnd, prefs, baseSeed);

    const plan: any[] = [];
    for (let d = dayStart; d <= dayEnd; d++) {
      plan.push(buildDayPlan(d, prefs, mealAssignments, baseSeed + d * 13, kidsCount, kidsDietType, kidsAllergies));
    }

    return new Response(JSON.stringify({ plan, mode }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("meal-plan-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
