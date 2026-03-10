import { Phase, getPhaseFromDay, getCycleInfo, getLastPeriodStart, PHASE_DAYS } from "./cycle-utils";
import { PHASE_MEAL_PLANS, Recipe } from "@/data/meal-plans";
import { findRecipeByName, findRecipeById, ALL_MEAL_RECIPES } from "./recipe-index";
import { parseIngredient } from "./ingredient-parser";

// ─── Types ─────────────────────────────────────────────────
export type BreakfastPref = "batch" | "rotate" | "variety";
export type LunchPref = "batch" | "rotate" | "variety";
export type DinnerPref = "double" | "fresh" | "mix";

export interface PrepPreferences {
  breakfast: BreakfastPref;
  lunch: LunchPref;
  dinner: DinnerPref;
  prepDays: string[];
  adults: number;
  kids: number;
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

// ─── Plan Generation ───────────────────────────────────────
export function generateWeeklyPlan(prefs: PrepPreferences): WeeklyPlan {
  const { dates, start, end } = getWeekDates();
  const info = getCycleInfo(getLastPeriodStart());
  const phase = info.phase;
  const plan = PHASE_MEAL_PLANS[phase];
  const [phaseStart] = PHASE_DAYS[phase];

  const days: PlannedDay[] = dates.map((date, i) => {
    const dayPlan = plan.days[i % plan.days.length];
    const dayName = DAY_NAMES[i];

    // Breakfast
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

    // Lunch
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

    // Dinner
    let dinner: PlannedMeal;
    if (prefs.dinner === "double") {
      const dinnerIdx = Math.floor(i / 2);
      const dName = plan.days[dinnerIdx % plan.days.length].dinner.split(" — ")[0];
      const dMatch = matchRecipe(dName);
      dinner = {
        name: dMatch?.name || dName,
        recipeId: dMatch?.id,
        isLeftover: i % 2 === 1,
      };
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

    // Snacks
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

/**
 * Generate a shopping list from a weekly plan.
 * Uses canonical recipe index for ingredient lookups via recipeId.
 */
export function generateShoppingList(plan: WeeklyPlan): ShoppingCategory[] {
  const servingMultiplier = plan.prepPreferences.adults + plan.prepPreferences.kids * 0.6;
  const ingredientMap: Record<string, { name: string; totalQty: number; unit: string; category: string }> = {};

  // Count unique meals (by recipeId or name) and their repetitions
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

  // For each unique meal, find its recipe and add ingredients
  Object.entries(mealCounts).forEach(([mealKey, { count, recipeId }]) => {
    // Use recipeId for canonical lookup first, then fall back to name matching
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

  // Group by category
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
