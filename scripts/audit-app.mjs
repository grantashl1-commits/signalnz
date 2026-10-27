// Read-only source/data probes for the October 2026 app audit.
import { createServer } from 'vite';
import { writeFileSync } from 'node:fs';
const memory = new Map();
globalThis.localStorage = { getItem: key => memory.get(key) ?? null, setItem: (key,value) => memory.set(key,value), removeItem: key => memory.delete(key) };
const server = await createServer({ cacheDir: 'node_modules/.vite-audit', server: { middlewareMode: true }, appType: 'custom' });
try {
  const { ALL_RECIPES, findRecipeByName } = await server.ssrLoadModule('/src/lib/recipe-index.ts');
  const { PHASE_MEAL_PLANS } = await server.ssrLoadModule('/src/data/meal-plans.ts');
  const { buildDbMealPlanFull } = await server.ssrLoadModule('/src/lib/build-db-meal-plan.ts');
  const { parseIngredient } = await server.ssrLoadModule('/src/lib/ingredient-parser.ts');
  const { aggregateShoppingItems } = await server.ssrLoadModule('/src/lib/smart-shopping-core.ts');
  const { getTodayMeals, getPhasePlanDay } = await server.ssrLoadModule('/src/lib/today-meals.ts');
  const prefs = { breakfast:'rotate', lunch:'rotate', dinner:'mix', prepDays:[], adults:2, kids:0, allergies:'almond', dietTypes:['Vegan'] };
  const plan = buildDbMealPlanFull(prefs);
  const almondMeals = plan.days.flatMap(d => ['breakfast','lunch','dinner','morningSnack','afternoonSnack'].flatMap(slot => d[slot].ingredients.some(i => /almond/i.test(i)) ? [{day:d.cycleDay,slot,name:d[slot].name,ingredients:d[slot].ingredients}] : []));
  const unresolved = Object.entries(PHASE_MEAL_PLANS).flatMap(([phase,p]) => p.days.flatMap((d,i) => ['breakfast','lunch','dinner'].flatMap(slot => { const name=d[slot].split(' — ')[0]; const r=findRecipeByName(name); return !r ? [{phase,day:i+1,slot,name}] : []; })));
  const ingredientExamples = ALL_RECIPES.flatMap(r => r.ingredients.filter(i => /\d\s*[x×]|\(\d+\s*g\)|^.*\bground\b/i.test(i)).map(raw=>({recipe:r.name,...parseIngredient(raw)}))).slice(0,15);
  const empty = ALL_RECIPES.filter(r=>!r.ingredients?.length || !r.method?.length).map(r=>r.name);
  const allIngredientCount=ALL_RECIPES.reduce((n,r)=>n+r.ingredients.length,0);
  const activeUnresolved = Array.from({length:28},(_,i)=>i+1).flatMap(cd => { const {day}=getPhasePlanDay(cd); return ['breakfast','lunch','dinner'].flatMap(slot => { const name=day[slot].split(' — ')[0]; return findRecipeByName(name) ? [] : [{cycleDay:cd,slot,name}]; }); });
  const todayUnresolved = Array.from({length:28},(_,i)=>i+1).flatMap(cd => getTodayMeals(cd).meals.filter(m=>!m.recipe).map(m=>({cycleDay:cd,slot:m.slot,name:m.name})));
  localStorage.setItem('signal_meal_plan',JSON.stringify({plan:[{cycleDay:1}],generatedAt:new Date().toISOString(),cycleDay:1}));
  let onboardingMealRead;
  try { getTodayMeals(1); onboardingMealRead='No error'; } catch(e) { onboardingMealRead=e.message; }
  memory.clear();
  const leftoverPlan=buildDbMealPlanFull({...prefs,allergies:'',dinner:'double'});
  const firstDinner=leftoverPlan.days[0].dinner;
  const evidence={recipeCount:ALL_RECIPES.length,allIngredientCount,emptyRecipes:empty,unresolvedStaticMeals:unresolved,activeUnresolved,activeUnresolvedCount:activeUnresolved.length,onboardingMealRead,almondAllergyViolations:almondMeals.length,almondExamples:almondMeals.slice(0,3),recipesWithoutNutrition:ALL_RECIPES.filter(r=>!r.nutrition).length,ingredientExamples,parseSamples:['2 x 400g tins chickpeas','400g tinned chopped tomatoes','2 tbsp ground flaxseed','1 cup dried chickpeas','1 cup cooked chickpeas'].map(parseIngredient),mergedDryAndCooked:aggregateShoppingItems({meals:[{serves:1,ingredients:['1 cup dried chickpeas','1 cup cooked chickpeas']}],servingMultiplier:1},parseIngredient),leftover:{dinner:firstDinner,nextLunch:leftoverPlan.days[1].lunch,ingredientsCountedByShopping:[firstDinner,leftoverPlan.days[1].lunch].filter(m=>!m.isLeftover).length}};
  evidence.todayUnresolved=todayUnresolved;
  evidence.todayUnresolvedCount=todayUnresolved.length;
  writeFileSync('docs/app-audit-evidence-2026-10-27.json',JSON.stringify(evidence,null,2)+'\n');
  console.log(JSON.stringify({recipeCount:evidence.recipeCount,activeUnresolvedCount:evidence.activeUnresolvedCount,todayUnresolvedCount:evidence.todayUnresolvedCount,onboardingMealRead,almondAllergyViolations:evidence.almondAllergyViolations,recipesWithoutNutrition:evidence.recipesWithoutNutrition},null,2));
} finally { await server.close(); }
