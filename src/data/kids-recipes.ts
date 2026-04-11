/**
 * Kid-friendly recipe bank — curated from 25 reference cookbooks.
 * No macro information included (by design).
 * Each recipe tagged with protein type + dietary flags for matching & filtering.
 */

export interface KidsRecipe {
  id: string;
  name: string;
  mealType: ("lunch" | "dinner")[];
  protein: string; // chicken, beef, fish, tofu, beans, eggs, lentils, cheese, pork, shrimp, none
  prepTime: string;
  serves: number;
  ingredients: string[];
  method: string[];
  tags: string[]; // dietary: dairy-free, gluten-free, nut-free, egg-free, vegetarian, vegan
  image?: string;
}

export const KIDS_RECIPE_BANK: KidsRecipe[] = [
  // ── CHICKEN ──
  { id: "kids-chicken-strips", name: "Crispy Chicken Strips", mealType: ["lunch","dinner"], protein: "chicken", prepTime: "25 min", serves: 4, ingredients: ["500g chicken breast, sliced into strips","1 cup breadcrumbs","½ cup flour","1 egg, beaten","1 tsp paprika","salt to taste","cooking spray"], method: ["Preheat oven to 200°C","Coat strips in flour, dip in egg, press into breadcrumbs with paprika","Arrange on lined tray, spray lightly with oil","Bake 15-18 minutes until golden and cooked through"], tags: ["nut-free"] },
  { id: "kids-chicken-fried-rice", name: "Chicken Fried Rice", mealType: ["lunch","dinner"], protein: "chicken", prepTime: "20 min", serves: 4, ingredients: ["2 cups cooked rice (cold)","200g chicken breast, diced small","1 cup frozen peas and corn","2 eggs, beaten","2 tbsp soy sauce","1 tbsp sesame oil","1 carrot, finely diced"], method: ["Cook chicken in sesame oil until done, set aside","Scramble eggs in same pan, break into small pieces","Add vegetables, cook 2 minutes","Add rice and soy sauce, toss with chicken and egg"], tags: ["nut-free","dairy-free"] },
  { id: "kids-chicken-quesadilla", name: "Chicken & Cheese Quesadilla", mealType: ["lunch","dinner"], protein: "chicken", prepTime: "15 min", serves: 2, ingredients: ["2 flour tortillas","1 cup shredded cooked chicken","½ cup grated cheese","¼ cup corn kernels","2 tbsp mild salsa (optional)"], method: ["Lay tortilla flat, spread chicken, cheese and corn on one half","Fold in half","Cook in dry pan 2-3 minutes each side until golden and cheese melts","Cut into wedges"], tags: ["nut-free","egg-free"] },
  { id: "kids-chicken-nugget-bowl", name: "Chicken Nugget Rice Bowl", mealType: ["dinner"], protein: "chicken", prepTime: "25 min", serves: 4, ingredients: ["400g chicken thigh, cubed","1 cup breadcrumbs","1 egg","1 cup rice","1 cup steamed broccoli","2 tbsp teriyaki sauce"], method: ["Coat chicken in egg then breadcrumbs","Bake at 200°C for 15 minutes","Serve over rice with steamed broccoli","Drizzle with teriyaki sauce"], tags: ["nut-free","dairy-free"] },
  { id: "kids-chicken-pasta", name: "Creamy Chicken Pasta", mealType: ["dinner"], protein: "chicken", prepTime: "20 min", serves: 4, ingredients: ["300g pasta","200g chicken breast, diced","1 cup frozen peas","½ cup cream cheese","¼ cup milk","½ cup parmesan, grated"], method: ["Cook pasta per package, add peas in last 2 minutes","Cook chicken in a pan until golden","Mix cream cheese and milk, stir into chicken","Toss pasta and peas through sauce"], tags: ["nut-free","egg-free"] },

  // ── BEEF ──
  { id: "kids-beef-meatballs", name: "Mini Beef Meatballs", mealType: ["lunch","dinner"], protein: "beef", prepTime: "30 min", serves: 4, ingredients: ["500g beef mince","¼ cup breadcrumbs","1 egg","1 grated zucchini (squeezed dry)","1 tsp Italian herbs","1 jar passata","cooked pasta or rice"], method: ["Mix mince, breadcrumbs, egg, zucchini, herbs","Roll into small balls","Brown in pan, then simmer in passata 15 minutes","Serve over pasta or rice"], tags: ["nut-free","dairy-free"] },
  { id: "kids-beef-tacos", name: "Mild Beef Tacos", mealType: ["dinner"], protein: "beef", prepTime: "20 min", serves: 4, ingredients: ["400g beef mince","1 tsp cumin","½ tsp paprika","8 small taco shells","1 cup lettuce, shredded","½ cup grated cheese","¼ cup sour cream"], method: ["Brown mince with cumin and paprika","Warm taco shells per package","Let kids build their own tacos with toppings"], tags: ["nut-free","egg-free"] },
  { id: "kids-beef-bolognese", name: "Hidden Veggie Bolognese", mealType: ["dinner"], protein: "beef", prepTime: "30 min", serves: 4, ingredients: ["400g beef mince","1 carrot, grated","1 zucchini, grated","1 jar passata","1 tsp Italian herbs","300g spaghetti","parmesan to serve"], method: ["Brown mince in pan","Add grated vegetables, cook 3 minutes","Add passata and herbs, simmer 15 minutes","Serve over cooked spaghetti with parmesan"], tags: ["nut-free","egg-free"] },
  { id: "kids-beef-rice-bowl", name: "Teriyaki Beef Rice Bowl", mealType: ["dinner"], protein: "beef", prepTime: "20 min", serves: 4, ingredients: ["300g beef strips","2 tbsp soy sauce","1 tbsp honey","1 tsp ginger (grated)","2 cups rice","1 cup steamed edamame","1 carrot, sliced"], method: ["Cook rice","Stir-fry beef strips 3 minutes","Add soy sauce, honey, ginger","Serve over rice with edamame and carrot"], tags: ["nut-free","dairy-free","egg-free"] },

  // ── FISH ──
  { id: "kids-fish-fingers", name: "Homemade Fish Fingers", mealType: ["lunch","dinner"], protein: "fish", prepTime: "25 min", serves: 4, ingredients: ["400g firm white fish, cut into strips","½ cup breadcrumbs","¼ cup flour","1 egg, beaten","½ tsp paprika","lemon wedges"], method: ["Preheat oven to 200°C","Coat fish in flour, egg, then breadcrumbs with paprika","Bake on lined tray 12-15 minutes until golden","Serve with lemon wedges"], tags: ["nut-free","dairy-free"] },
  { id: "kids-salmon-pasta", name: "Salmon Pasta Bake", mealType: ["dinner"], protein: "fish", prepTime: "30 min", serves: 4, ingredients: ["300g pasta","200g canned salmon, drained","1 cup frozen peas","1 cup grated cheese","1 cup milk","2 tbsp butter","2 tbsp flour"], method: ["Cook pasta with peas","Make white sauce: melt butter, stir in flour, add milk gradually","Fold in salmon and half the cheese","Combine with pasta, top with remaining cheese, bake at 180°C for 15 minutes"], tags: ["nut-free","egg-free"] },
  { id: "kids-tuna-rice", name: "Tuna & Rice Bowl", mealType: ["lunch"], protein: "fish", prepTime: "15 min", serves: 2, ingredients: ["1 can tuna, drained","1 cup cooked rice","½ cup corn","¼ cup mayo","1 tbsp lemon juice","cucumber sticks"], method: ["Mix tuna, rice, corn, mayo and lemon","Serve in bowl with cucumber sticks on the side"], tags: ["nut-free","egg-free","dairy-free","gluten-free"] },

  // ── TOFU ──
  { id: "kids-tofu-nuggets", name: "Crispy Tofu Nuggets", mealType: ["lunch","dinner"], protein: "tofu", prepTime: "25 min", serves: 4, ingredients: ["400g firm tofu, pressed and cubed","½ cup breadcrumbs","2 tbsp soy sauce","1 tbsp maple syrup","1 tsp garlic powder","cooking spray"], method: ["Preheat oven to 200°C","Toss tofu in soy sauce and maple syrup","Coat in breadcrumbs with garlic powder","Bake 20 minutes, flipping halfway, until crispy"], tags: ["vegan","nut-free","dairy-free","egg-free"] },
  { id: "kids-tofu-stir-fry", name: "Sweet Tofu Stir Fry", mealType: ["dinner"], protein: "tofu", prepTime: "20 min", serves: 4, ingredients: ["300g firm tofu, cubed","1 cup broccoli florets","1 carrot, sliced","2 tbsp soy sauce","1 tbsp honey or maple syrup","1 tsp sesame oil","2 cups rice"], method: ["Pan-fry tofu until golden","Add vegetables, cook 3 minutes","Add soy sauce and honey, toss","Serve over rice"], tags: ["vegetarian","nut-free","dairy-free","egg-free"] },
  { id: "kids-tofu-peanut-noodles", name: "Peanut Butter Noodles with Tofu", mealType: ["lunch","dinner"], protein: "tofu", prepTime: "20 min", serves: 4, ingredients: ["300g noodles","200g firm tofu, cubed","2 tbsp peanut butter","1 tbsp soy sauce","1 tbsp lime juice","1 tsp honey","1 carrot, julienned","½ cucumber, julienned"], method: ["Cook noodles, pan-fry tofu until golden","Whisk peanut butter, soy sauce, lime, honey with 2 tbsp warm water","Toss noodles with sauce, top with tofu and vegetables"], tags: ["vegan","dairy-free","egg-free"] },

  // ── BEANS / LENTILS ──
  { id: "kids-bean-quesadilla", name: "Black Bean & Cheese Quesadilla", mealType: ["lunch","dinner"], protein: "beans", prepTime: "10 min", serves: 2, ingredients: ["2 flour tortillas","½ cup black beans, rinsed","½ cup grated cheese","¼ cup corn","pinch cumin"], method: ["Mash beans slightly, mix with corn and cumin","Spread on half of each tortilla, top with cheese","Fold and cook in dry pan 2-3 minutes each side"], tags: ["vegetarian","nut-free","egg-free"] },
  { id: "kids-lentil-pasta", name: "Lentil Bolognese", mealType: ["dinner"], protein: "lentils", prepTime: "25 min", serves: 4, ingredients: ["1 cup red lentils","1 jar passata","1 carrot, grated","1 zucchini, grated","1 tsp Italian herbs","300g pasta"], method: ["Simmer lentils in passata with grated veggies and herbs for 20 minutes","Blend slightly if kids prefer smooth texture","Serve over cooked pasta"], tags: ["vegan","nut-free","dairy-free","egg-free","gluten-free"] },
  { id: "kids-chickpea-curry", name: "Mild Coconut Chickpea Curry", mealType: ["dinner"], protein: "beans", prepTime: "20 min", serves: 4, ingredients: ["1 can chickpeas, drained","1 can coconut milk","1 tsp mild curry powder","½ tsp turmeric","1 cup rice","1 cup baby spinach"], method: ["Cook rice","Simmer chickpeas in coconut milk with curry powder and turmeric for 10 minutes","Stir in spinach until wilted","Serve over rice"], tags: ["vegan","nut-free","dairy-free","egg-free","gluten-free"] },
  { id: "kids-bean-nachos", name: "Bean & Cheese Nachos", mealType: ["dinner"], protein: "beans", prepTime: "15 min", serves: 4, ingredients: ["1 bag corn chips","1 can refried beans or black beans","1 cup grated cheese","½ cup corn","¼ cup sour cream","guacamole (optional)"], method: ["Spread corn chips on baking tray","Dollop beans and sprinkle cheese and corn","Bake at 180°C for 8-10 minutes until cheese melts","Serve with sour cream"], tags: ["vegetarian","nut-free","egg-free","gluten-free"] },

  // ── EGGS ──
  { id: "kids-egg-fried-rice", name: "Egg Fried Rice", mealType: ["lunch","dinner"], protein: "eggs", prepTime: "15 min", serves: 4, ingredients: ["2 cups cold cooked rice","3 eggs, beaten","1 cup frozen peas and corn","2 tbsp soy sauce","1 tbsp sesame oil","1 spring onion, sliced"], method: ["Scramble eggs in sesame oil, break into small pieces","Add rice and vegetables, cook 3 minutes","Add soy sauce, toss and serve"], tags: ["vegetarian","nut-free","dairy-free"] },
  { id: "kids-frittata", name: "Veggie Mini Frittatas", mealType: ["lunch"], protein: "eggs", prepTime: "25 min", serves: 6, ingredients: ["6 eggs","½ cup grated cheese","½ cup diced capsicum","½ cup corn","¼ cup milk","salt and pepper"], method: ["Preheat oven to 180°C, grease muffin tin","Whisk eggs with milk, salt and pepper","Divide vegetables and cheese into muffin cups","Pour egg mixture over, bake 15-18 minutes"], tags: ["vegetarian","nut-free","gluten-free"] },
  { id: "kids-french-toast", name: "French Toast Fingers", mealType: ["lunch"], protein: "eggs", prepTime: "15 min", serves: 2, ingredients: ["4 slices bread, cut into strips","2 eggs","¼ cup milk","½ tsp cinnamon","1 tsp butter","maple syrup or fruit to serve"], method: ["Whisk eggs, milk and cinnamon","Dip bread strips into egg mixture","Cook in buttered pan 2 minutes each side until golden","Serve with maple syrup or fruit"], tags: ["vegetarian","nut-free"] },

  // ── CHEESE / PASTA ──
  { id: "kids-mac-cheese", name: "Classic Mac & Cheese", mealType: ["lunch","dinner"], protein: "cheese", prepTime: "20 min", serves: 4, ingredients: ["300g macaroni","2 cups grated cheese","1 cup milk","2 tbsp butter","2 tbsp flour","pinch mustard powder"], method: ["Cook macaroni","Melt butter, stir in flour, gradually add milk","Stir in cheese until smooth","Combine with pasta and serve"], tags: ["vegetarian","nut-free","egg-free"] },
  { id: "kids-cheese-pizza", name: "Easy Cheese Pizza", mealType: ["dinner"], protein: "cheese", prepTime: "25 min", serves: 4, ingredients: ["4 pita breads or pizza bases","½ cup pizza sauce","2 cups grated mozzarella","toppings: corn, capsicum, mushroom, ham"], method: ["Preheat oven to 200°C","Spread sauce on bases, add cheese and toppings","Bake 10-12 minutes until cheese is bubbly","Let kids choose their own toppings"], tags: ["vegetarian","nut-free","egg-free"] },

  // ── PORK ──
  { id: "kids-pork-dumplings", name: "Pork & Veggie Dumplings", mealType: ["dinner"], protein: "pork", prepTime: "30 min", serves: 4, ingredients: ["250g pork mince","1 cup finely shredded cabbage","1 carrot, grated","1 tbsp soy sauce","1 tsp sesame oil","24 dumpling wrappers","dipping sauce: soy + rice vinegar"], method: ["Mix pork, cabbage, carrot, soy sauce, sesame oil","Place 1 tbsp filling in each wrapper, fold and seal","Steam for 10-12 minutes or pan-fry until golden","Serve with dipping sauce"], tags: ["nut-free","dairy-free"] },
  { id: "kids-pork-stir-fry", name: "Sweet & Sour Pork with Rice", mealType: ["dinner"], protein: "pork", prepTime: "20 min", serves: 4, ingredients: ["300g pork loin, sliced","1 capsicum, diced","1 cup pineapple chunks","2 tbsp tomato sauce","1 tbsp soy sauce","1 tbsp honey","2 cups rice"], method: ["Cook rice","Stir-fry pork until cooked","Add capsicum and pineapple","Mix tomato sauce, soy sauce and honey, add to pan","Serve over rice"], tags: ["nut-free","dairy-free","egg-free","gluten-free"] },

  // ── SHRIMP ──  
  { id: "kids-shrimp-pasta", name: "Garlic Butter Shrimp Pasta", mealType: ["dinner"], protein: "shrimp", prepTime: "20 min", serves: 4, ingredients: ["300g pasta","200g shrimp, peeled","2 tbsp butter","2 cloves garlic, minced","¼ cup parmesan","1 cup baby spinach"], method: ["Cook pasta","Sauté garlic in butter, add shrimp and cook 3 minutes","Add spinach until wilted","Toss with pasta and parmesan"], tags: ["nut-free","egg-free"] },
];

/** Map protein keywords to match adult recipe proteins */
export const PROTEIN_ALIASES: Record<string, string[]> = {
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

/** Find the best kids recipe matching a protein type and dietary restrictions */
export function findKidsRecipe(
  adultRecipeName: string,
  mealType: "lunch" | "dinner",
  kidsAllergies: string[],
  kidsDietType: string,
  exclude: string[] = [],
  seed: number = 0,
): KidsRecipe | null {
  // Detect protein from adult recipe name/ingredients
  const lower = adultRecipeName.toLowerCase();
  let detectedProtein = "";
  for (const [protein, aliases] of Object.entries(PROTEIN_ALIASES)) {
    if (aliases.some(a => lower.includes(a))) {
      detectedProtein = protein;
      break;
    }
  }

  // Filter candidates
  let candidates = KIDS_RECIPE_BANK.filter(r => {
    if (!r.mealType.includes(mealType)) return false;
    if (exclude.includes(r.id)) return false;
    // Check allergies
    for (const allergy of kidsAllergies) {
      const al = allergy.toLowerCase().trim();
      if (!al) continue;
      const tagMap: Record<string, string> = {
        dairy: "dairy-free", gluten: "gluten-free", nut: "nut-free",
        peanut: "nut-free", egg: "egg-free", nuts: "nut-free",
      };
      const requiredTag = tagMap[al] || `${al}-free`;
      if (!r.tags.includes(requiredTag)) {
        // Also check ingredients
        const ingLower = r.ingredients.join(" ").toLowerCase();
        if (ingLower.includes(al)) return false;
      }
    }
    // Check diet type
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

  // Prefer matching protein
  if (detectedProtein) {
    const proteinMatches = candidates.filter(r => r.protein === detectedProtein);
    if (proteinMatches.length > 0) candidates = proteinMatches;
  }

  if (candidates.length === 0) return null;
  return candidates[seed % candidates.length];
}
