import { Phase, getPhaseFromDay, getCycleInfo, getLastPeriodStart, PHASE_DAYS } from "./cycle-utils";
import { PHASE_MEAL_PLANS, MEAT_MEAL_PLANS, Recipe } from "@/data/meal-plans";
import { findRecipeByName, findRecipeById, ALL_MEAL_RECIPES } from "./recipe-index";
import { parseIngredient } from "./ingredient-parser";

// ─── Types ─────────────────────────────────────────────────
export type BreakfastPref = "batch" | "rotate" | "variety";
export type LunchPref = "batch" | "rotate" | "variety";
export type DinnerPref = "double" | "fresh" | "mix"; // double=same every day, fresh=2-3 rotate, mix=variety
export type CookingSkill = "beginner" | "confident" | "adventurous";
export type AvailableTime = "15" | "30" | "45" | "60+";

export interface PrepPreferences {
  breakfast: BreakfastPref;
  lunch: LunchPref;
  dinner: DinnerPref;
  prepDays: string[];
  adults: number;
  kids: number;
  dietType?: string;
  allergies?: string;
  dislikes?: string;
  calorieTarget?: string;
  cookingSkill?: CookingSkill;
  availableTime?: AvailableTime;
  equipment?: string[];
  bodyGoal?: string;
  bodyGoals?: string[];
  kidsDietType?: string;
  kidsAllergies?: string;
}

export interface AIMeal {
  name: string;
  phase: Phase;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  prepTime: string;
  serves: number;
  ingredients: string[];
  method: string[];
  nutritionalNote: string;
  keyNutrients?: string[];
  isLeftover?: boolean;
  leftoverFrom?: number; // cycle day reference
}

export interface AIPlannedDay {
  cycleDay: number;
  phase: Phase;
  breakfast: AIMeal;
  morningSnack: AIMeal;
  lunch: AIMeal;
  afternoonSnack: AIMeal;
  dinner: AIMeal;
  /** Kid-friendly alternative for lunch — auto-attached at plan generation when kids > 0 */
  kidsLunch?: AIMeal;
  /** Kid-friendly alternative for dinner — auto-attached at plan generation when kids > 0 */
  kidsDinner?: AIMeal;
}

export interface AIMealPlan {
  days: AIPlannedDay[];
  prepPreferences: PrepPreferences;
  createdAt: number;
  lockedMeals: Record<string, boolean>; // key: "{cycleDay}-{mealType}"
}

export interface PlannedMeal {
  name: string;
  recipeId?: string;
  isLeftover?: boolean;
}

export interface PlannedDay {
  date: string;
  dayName: string;
  breakfast: PlannedMeal;
  morningSnack: PlannedMeal;
  lunch: PlannedMeal;
  afternoonSnack: PlannedMeal;
  dinner: PlannedMeal;
  kidsDinner?: PlannedMeal | null;
}

export interface WeeklyPlan {
  weekLabel: string;
  dateRange: { start: string; end: string };
  phase: Phase;
  cycleDay: number;
  phaseDay: number;
  prepPreferences: PrepPreferences;
  days: PlannedDay[];
  createdAt: number;
}

export interface ShoppingCategory {
  name: string;
  emoji: string;
  items: ShoppingIngredient[];
}

export interface ShoppingIngredient {
  name: string;
  quantity: string;
  unit: string;
  checked: boolean;
}

// ─── Constants ─────────────────────────────────────────────
const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// ─── Default Preferences ───────────────────────────────────
export const DEFAULT_PREFS: PrepPreferences = {
  breakfast: "batch",
  lunch: "batch",
  dinner: "double",
  prepDays: ["Sunday"],
  adults: 2,
  kids: 0,
  cookingSkill: "confident",
  availableTime: "30",
  equipment: ["oven", "stovetop"],
};

// ─── Week Generation ───────────────────────────────────────
export function getWeekDates(): { start: Date; end: Date; dates: Date[] } {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
  monday.setHours(0, 0, 0, 0);

  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d);
  }
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { start: monday, end: sunday, dates };
}

export function getISOWeek(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

export function formatDateShort(d: Date): string {
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

// ─── Recipe lookup helper ──────────────────────────────────
function matchRecipe(name: string): { id: string; name: string } | undefined {
  const recipe = findRecipeByName(name);
  return recipe ? { id: recipe.id, name: recipe.name } : undefined;
}

// ─── Plan Generation (static fallback) ────────────────────
export function generateWeeklyPlan(prefs: PrepPreferences): WeeklyPlan {
  const { dates, start, end } = getWeekDates();
  const info = getCycleInfo(getLastPeriodStart());
  const phase = info.phase;
  const useMeat = !prefs.dietType || prefs.dietType === "" || prefs.dietType === "No preference";
  const mealSource = useMeat ? MEAT_MEAL_PLANS : PHASE_MEAL_PLANS;
  const plan = mealSource[phase];
  const [phaseStart] = PHASE_DAYS[phase];

  const days: PlannedDay[] = dates.map((date, i) => {
    const dayPlan = plan.days[i % plan.days.length];
    const dayName = DAY_NAMES[i];

    let bName: string;
    if (prefs.breakfast === "batch") {
      bName = plan.days[0].breakfast.split(" — ")[0];
    } else if (prefs.breakfast === "rotate") {
      bName = plan.days[i % 3].breakfast.split(" — ")[0];
    } else {
      bName = dayPlan.breakfast.split(" — ")[0];
    }
    const bMatch = matchRecipe(bName);
    const breakfast: PlannedMeal = { name: bMatch?.name || bName, recipeId: bMatch?.id };

    let lName: string;
    if (prefs.lunch === "batch") {
      lName = plan.days[0].lunch.split(" — ")[0];
    } else if (prefs.lunch === "rotate") {
      lName = plan.days[i % 3].lunch.split(" — ")[0];
    } else {
      lName = dayPlan.lunch.split(" — ")[0];
    }
    const lMatch = matchRecipe(lName);
    const lunch: PlannedMeal = { name: lMatch?.name || lName, recipeId: lMatch?.id };

    let dinner: PlannedMeal;
    if (prefs.dinner === "double") {
      const dinnerIdx = Math.floor(i / 2);
      const dName = plan.days[dinnerIdx % plan.days.length].dinner.split(" — ")[0];
      const dMatch = matchRecipe(dName);
      dinner = { name: dMatch?.name || dName, recipeId: dMatch?.id, isLeftover: i % 2 === 1 };
    } else if (prefs.dinner === "mix") {
      if (i % 3 === 2) {
        const dName = plan.days[Math.floor((i - 1) / 2) % plan.days.length].dinner.split(" — ")[0];
        const dMatch = matchRecipe(dName);
        dinner = { name: dMatch?.name || dName, recipeId: dMatch?.id, isLeftover: true };
      } else {
        const dName = dayPlan.dinner.split(" — ")[0];
        const dMatch = matchRecipe(dName);
        dinner = { name: dMatch?.name || dName, recipeId: dMatch?.id };
      }
    } else {
      const dName = dayPlan.dinner.split(" — ")[0];
      const dMatch = matchRecipe(dName);
      dinner = { name: dMatch?.name || dName, recipeId: dMatch?.id };
    }

    const morningSnack: PlannedMeal = { name: "Fruit + seeds" };
    const afternoonSnack: PlannedMeal = { name: "Trail mix" };

    return {
      date: date.toISOString().split("T")[0],
      dayName,
      breakfast,
      morningSnack,
      lunch,
      afternoonSnack,
      dinner,
      kidsDinner: prefs.kids > 0 ? null : undefined,
    };
  });

  const weekLabel = `${info.phase.charAt(0).toUpperCase() + info.phase.slice(1)} Week`;

  return {
    weekLabel,
    dateRange: { start: start.toISOString().split("T")[0], end: end.toISOString().split("T")[0] },
    phase,
    cycleDay: info.cycleDay,
    phaseDay: info.day,
    prepPreferences: prefs,
    days,
    createdAt: Date.now(),
  };
}

// ─── Quantity Calculation ──────────────────────────────────
function parseQuantity(qty: string): number {
  if (!qty) return 1;
  qty = qty.trim();
  if (qty.includes("/")) {
    const parts = qty.split("/");
    if (parts.length === 2) return parseInt(parts[0]) / parseInt(parts[1]);
  }
  if (qty.includes("-")) {
    const parts = qty.split("-");
    return (parseFloat(parts[0]) + parseFloat(parts[1])) / 2;
  }
  const n = parseFloat(qty);
  return isNaN(n) ? 1 : n;
}

// ─── Ingredient Categorisation ─────────────────────────────
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  grains: ["oat", "rice", "quinoa", "pasta", "noodle", "bread", "flour", "buckwheat", "lentil", "chickpea", "bean", "soba", "cornmeal", "wrap"],
  produce: ["onion", "garlic", "ginger", "tomato", "spinach", "kale", "broccoli", "capsicum", "pepper", "carrot", "potato", "sweet potato", "kumara", "zucchini", "mushroom", "avocado", "banana", "apple", "berry", "berries", "lemon", "lime", "mango", "kiwi", "cucumber", "asparagus", "bok choy", "pumpkin", "beetroot", "cabbage", "spring onion", "coriander", "parsley", "mint", "basil", "chilli", "pear", "orange", "pomegranate", "fruit"],
  pantry: ["coconut milk", "coconut oil", "olive oil", "sesame oil", "tamari", "miso", "mirin", "maple syrup", "honey", "vinegar", "soy", "coconut aminos", "stock", "tomato paste", "canned", "can ", "date", "dried", "peanut butter", "almond butter", "tahini", "nutritional yeast", "chocolate", "cacao", "cocoa", "vanilla", "baking", "cornflour", "sugar", "stevia", "natvia"],
  dairy: ["milk", "yoghurt", "yogurt", "cream", "cheese", "tofu", "tempeh", "edamame"],
  herbs: ["turmeric", "cumin", "cinnamon", "paprika", "garam masala", "curry", "salt", "pepper", "cardamom", "nutmeg", "oregano", "thyme", "rosemary", "herb", "spice", "sesame seed", "pumpkin seed", "sunflower seed", "flaxseed", "chia seed", "hemp", "almond", "walnut", "cashew", "hazelnut", "peanut", "pine nut", "seed", "nut"],
};

function categoriseIngredient(name: string): string {
  const lower = name.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) return cat;
  }
  return "pantry";
}

export function generateShoppingList(plan: WeeklyPlan): ShoppingCategory[] {
  const servingMultiplier = plan.prepPreferences.adults + plan.prepPreferences.kids * 0.6;
  const ingredientMap: Record<string, { name: string; totalQty: number; unit: string; category: string }> = {};

  const mealCounts: Record<string, { count: number; recipeId?: string }> = {};
  plan.days.forEach((day) => {
    [day.breakfast, day.lunch, day.dinner].forEach((meal) => {
      if (!meal.isLeftover) {
        const key = meal.recipeId || meal.name.toLowerCase();
        if (!mealCounts[key]) {
          mealCounts[key] = { count: 0, recipeId: meal.recipeId };
        }
        mealCounts[key].count++;
      }
    });
  });

  Object.entries(mealCounts).forEach(([mealKey, { count, recipeId }]) => {
    let recipe: Recipe | undefined;
    if (recipeId) {
      recipe = findRecipeById(recipeId);
    }
    if (!recipe) {
      recipe = findRecipeByName(mealKey);
    }

    if (recipe) {
      recipe.ingredients.forEach((ingStr) => {
        const parsed = parseIngredient(ingStr);
        const baseQty = parseQuantity(parsed.quantity);
        const totalQty = baseQty * servingMultiplier * count / (recipe!.serves || 1);
        const mapKey = parsed.searchTerm.toLowerCase();
        const cat = categoriseIngredient(parsed.name);

        if (ingredientMap[mapKey]) {
          ingredientMap[mapKey].totalQty += totalQty;
        } else {
          ingredientMap[mapKey] = { name: parsed.name, totalQty, unit: parsed.unit, category: cat };
        }
      });
    }
  });

  const categories: Record<string, ShoppingIngredient[]> = {
    grains: [],
    produce: [],
    pantry: [],
    dairy: [],
    herbs: [],
  };

  const CATEGORY_META: Record<string, { name: string; emoji: string }> = {
    grains: { name: "Grains & Legumes", emoji: "·" },
    produce: { name: "Fresh Produce", emoji: "·" },
    pantry: { name: "Pantry & Condiments", emoji: "·" },
    dairy: { name: "Dairy Alternatives", emoji: "·" },
    herbs: { name: "Herbs, Spices & Seeds", emoji: "·" },
  };

  Object.values(ingredientMap).forEach((item) => {
    const cat = item.category;
    const displayQty = item.totalQty < 1 ? `${Math.round(item.totalQty * 100) / 100}` :
      item.totalQty > 10 ? `${Math.round(item.totalQty)}` :
        `${Math.round(item.totalQty * 10) / 10}`;

    if (!categories[cat]) categories[cat] = [];
    categories[cat].push({
      name: item.name.charAt(0).toUpperCase() + item.name.slice(1),
      quantity: displayQty,
      unit: item.unit,
      checked: false,
    });
  });

  return Object.entries(CATEGORY_META).map(([key, meta]) => ({
    name: meta.name,
    emoji: meta.emoji,
    items: categories[key] || [],
  })).filter((c) => c.items.length > 0);
}

// ─── AI Meal Plan Shopping List ────────────────────────────
export function generateAIShoppingList(plan: AIMealPlan, weekNumber: number): ShoppingCategory[] {
  const startDay = (weekNumber - 1) * 7 + 1;
  const endDay = weekNumber * 7;
  const weekDays = plan.days.filter(d => d.cycleDay >= startDay && d.cycleDay <= endDay);
  
  const ingredientMap: Record<string, { name: string; totalQty: number; unit: string; category: string }> = {};
  const servingMultiplier = plan.prepPreferences.adults + plan.prepPreferences.kids * 0.6;

  weekDays.forEach(day => {
    const meals: (AIMeal | undefined)[] = [day.breakfast, day.lunch, day.dinner, day.kidsLunch, day.kidsDinner];
    meals.forEach(meal => {
      if (!meal || meal.isLeftover) return;
      meal.ingredients.forEach(ingStr => {
        const parsed = parseIngredient(ingStr);
        const baseQty = parseQuantity(parsed.quantity);
        const totalQty = baseQty * servingMultiplier / (meal.serves || 2);
        const mapKey = parsed.searchTerm.toLowerCase();
        const cat = categoriseIngredient(parsed.name);
        if (ingredientMap[mapKey]) {
          ingredientMap[mapKey].totalQty += totalQty;
        } else {
          ingredientMap[mapKey] = { name: parsed.name, totalQty, unit: parsed.unit, category: cat };
        }
      });
    });
  });

  const categories: Record<string, ShoppingIngredient[]> = {};
  const CATEGORY_META: Record<string, { name: string; emoji: string }> = {
    grains: { name: "Grains & Legumes", emoji: "·" },
    produce: { name: "Fresh Produce", emoji: "·" },
    pantry: { name: "Pantry & Condiments", emoji: "·" },
    dairy: { name: "Dairy Alternatives", emoji: "·" },
    herbs: { name: "Herbs, Spices & Seeds", emoji: "·" },
  };

  Object.values(ingredientMap).forEach(item => {
    const cat = item.category;
    const displayQty = item.totalQty < 1 ? `${Math.round(item.totalQty * 100) / 100}` :
      item.totalQty > 10 ? `${Math.round(item.totalQty)}` :
        `${Math.round(item.totalQty * 10) / 10}`;
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push({
      name: item.name.charAt(0).toUpperCase() + item.name.slice(1),
      quantity: displayQty,
      unit: item.unit,
      checked: false,
    });
  });

  return Object.entries(CATEGORY_META).map(([key, meta]) => ({
    name: meta.name,
    emoji: meta.emoji,
    items: categories[key] || [],
  })).filter(c => c.items.length > 0);
}

// ─── localStorage Persistence ──────────────────────────────
export function saveWeeklyPlan(plan: WeeklyPlan): void {
  const key = `weeklyPlan:${getISOWeek(new Date(plan.dateRange.start))}`;
  localStorage.setItem(key, JSON.stringify(plan));
}

export function getWeeklyPlan(weekKey?: string): WeeklyPlan | null {
  const key = weekKey || `weeklyPlan:${getISOWeek(new Date())}`;
  const val = localStorage.getItem(key);
  return val ? JSON.parse(val) : null;
}

export function savePreferences(prefs: PrepPreferences): void {
  localStorage.setItem("mealPrepPreferences", JSON.stringify(prefs));
}

export function getSavedPreferences(): PrepPreferences | null {
  const val = localStorage.getItem("mealPrepPreferences");
  return val ? JSON.parse(val) : null;
}

// ─── AI Plan Persistence ──────────────────────────────────
const AI_PLAN_KEY = "signal_ai_meal_plan";

export function saveAIMealPlan(plan: AIMealPlan): void {
  localStorage.setItem(AI_PLAN_KEY, JSON.stringify(plan));
}

export function getAIMealPlan(): AIMealPlan | null {
  try {
    const val = localStorage.getItem(AI_PLAN_KEY);
    return val ? JSON.parse(val) : null;
  } catch { return null; }
}

export function clearAIMealPlan(): void {
  localStorage.removeItem(AI_PLAN_KEY);
}

// ─── Kids meals — attach kid-friendly alternatives at plan generation ──────
import { findKidsRecipe, KIDS_RECIPE_BANK, type KidsRecipe } from "@/data/kids-recipes";

function kidsRecipeToAIMeal(recipe: KidsRecipe, mealType: "lunch" | "dinner", phase: Phase): AIMeal {
  return {
    name: recipe.name,
    phase,
    mealType,
    prepTime: recipe.prepTime,
    serves: recipe.serves,
    ingredients: recipe.ingredients,
    method: recipe.method,
    nutritionalNote: `Kid-friendly alternative — ingredients are added to your shopping list automatically.`,
    keyNutrients: recipe.tags.filter(t => t.endsWith("-free") || t === "vegetarian" || t === "vegan"),
  };
}

/**
 * Walk every day in the plan and attach a kid-friendly lunch + dinner.
 * Called once after the AI plan is generated so kids' ingredients flow into
 * the SmartShoppingList. Skipped when prefs.kids is 0.
 */
export function attachKidsMeals(plan: AIMealPlan): AIMealPlan {
  const prefs = plan.prepPreferences;
  if (!prefs.kids || prefs.kids < 1) return plan;

  const allergies = (prefs.kidsAllergies || "")
    .split(/[,;]/)
    .map(a => a.trim())
    .filter(Boolean);
  const dietType = prefs.kidsDietType || "";

  const updatedDays = plan.days.map(day => {
    const usedIds: string[] = [];
    let kidsLunch: AIMeal | undefined;
    let kidsDinner: AIMeal | undefined;

    const lunchPick = findKidsRecipe(day.lunch.name, "lunch", allergies, dietType, usedIds, day.cycleDay);
    if (lunchPick) {
      usedIds.push(lunchPick.id);
      kidsLunch = kidsRecipeToAIMeal(lunchPick, "lunch", day.phase);
    }

    const dinnerPick = findKidsRecipe(day.dinner.name, "dinner", allergies, dietType, usedIds, day.cycleDay);
    if (dinnerPick) {
      kidsDinner = kidsRecipeToAIMeal(dinnerPick, "dinner", day.phase);
    }

    return { ...day, kidsLunch, kidsDinner };
  });

  return { ...plan, days: updatedDays };
}

/**
 * Swap the kids' alternative for a single day's lunch or dinner with the next
 * compatible recipe from the curated bank. Returns a new plan with the swap
 * applied; if no alternative is available, returns the plan unchanged.
 */
export function swapKidsMeal(
  plan: AIMealPlan,
  cycleDay: number,
  mealType: "lunch" | "dinner",
): { plan: AIMealPlan; swapped: boolean } {
  const prefs = plan.prepPreferences;
  if (!prefs.kids || prefs.kids < 1) return { plan, swapped: false };

  const allergies = (prefs.kidsAllergies || "")
    .split(/[,;]/)
    .map(a => a.trim())
    .filter(Boolean);
  const dietType = prefs.kidsDietType || "";

  const dayIndex = plan.days.findIndex(d => d.cycleDay === cycleDay);
  if (dayIndex < 0) return { plan, swapped: false };
  const day = plan.days[dayIndex];

  const currentKey: keyof AIPlannedDay = mealType === "lunch" ? "kidsLunch" : "kidsDinner";
  const currentName = (day[currentKey] as AIMeal | undefined)?.name?.toLowerCase();

  // Exclude any bank entries matching the current kids' meal name so the swap
  // always returns a different recipe when possible.
  const exclude: string[] = [];
  if (currentName) {
    for (const r of KIDS_RECIPE_BANK) {
      if (r.name.toLowerCase() === currentName) exclude.push(r.id);
    }
  }

  const adultName = mealType === "lunch" ? day.lunch.name : day.dinner.name;
  // Use cycleDay + a rotating offset so repeated swaps cycle through options
  const seed = cycleDay + exclude.length + 1;
  const pick = findKidsRecipe(adultName, mealType, allergies, dietType, exclude, seed);
  if (!pick) return { plan, swapped: false };

  const newMeal = kidsRecipeToAIMeal(pick, mealType, day.phase);
  const newDay = { ...day, [currentKey]: newMeal };
  const updatedDays = plan.days.map((d, i) => (i === dayIndex ? newDay : d));
  return { plan: { ...plan, days: updatedDays }, swapped: true };
}

