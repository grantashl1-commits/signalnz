import { snackMeal } from "./build-db-meal-plan";
import { DEFAULT_PREFS, getSavedPreferences } from "./weekly-planner";
import { toLocalDateStr } from "@/lib/local-date";
import type { Phase } from "@/lib/cycle-utils";
import { PHASE_MEAL_PLANS, type Recipe } from "@/data/meal-plans";
import { ALL_RECIPES, findRecipeById, findRecipeByName } from "@/lib/recipe-index";
import { getAIMealPlan, type AIMeal } from "@/lib/weekly-planner";

export type MealSlot = "breakfast" | "lunch" | "dinner";

export interface TodayMeal {
  slot: MealSlot;
  label: string;
  name: string;
  recipe?: Recipe;
  aiMeal?: AIMeal;
}

/** First cycle day of each phase — matches CycleContext (1–5 / 6–13 / 14 / 15–28). */
const PHASE_START: Record<Phase, number> = { menstrual: 1, follicular: 6, ovulatory: 14, luteal: 15 };

function phaseForCycleDay(cycleDay: number): Phase {
  if (cycleDay <= 5) return "menstrual";
  if (cycleDay <= 13) return "follicular";
  if (cycleDay === 14) return "ovulatory";
  return "luteal";
}

/**
 * The phase meal-plan day for a cycle day. Uses the same phase boundaries as
 * the rest of the app, so the meals always match the phase on screen and
 * consecutive days get different meals.
 */
export function getPhasePlanDay(cycleDay: number) {
  const phase = phaseForCycleDay(cycleDay);
  const plan = PHASE_MEAL_PLANS[phase];
  const dayIndex = (cycleDay - PHASE_START[phase]) % plan.days.length;
  const original = plan.days[Math.max(0, dayIndex)];
  const day = { ...original };
  for (const slot of ['breakfast', 'lunch', 'dinner'] as const) {
    const existing = findRecipeByName(original[slot].split(' — ')[0]);
    const pool = ALL_RECIPES.filter(r => r.phase === phase && r.category === (slot === 'breakfast' ? 'breakfast' : 'meal'));
    const recipe = existing ?? pool[(Math.max(0, dayIndex) + (slot === 'dinner' ? 1 : 0)) % pool.length];
    day[slot] = recipe?.name ?? original[slot];
  }
  return { phase, day };
}

const CUSTOM_PLAN_KEY = "signal_custom_meal_plan_v1";

/** Hand-picked recipe ids for a cycle day (see useCustomMealPlan). */
function readCustomDay(cycleDay: number, date: string): Partial<Record<MealSlot, string>> {
  try {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(CUSTOM_PLAN_KEY) : null;
    if (!raw) return {};
    const plan = JSON.parse(raw) as Record<string, Partial<Record<MealSlot, string>>>;
    return plan?.[date] ?? plan?.[cycleDay] ?? {};
  } catch {
    return {};
  }
}

/** Apply the member's own picks on top of the generated plan. */
function withCustomPicks(meals: TodayMeal[], cycleDay: number, date: string): TodayMeal[] {
  const custom = readCustomDay(cycleDay, date);
  return meals.map((m) => {
    const id = custom[m.slot];
    const recipe = id ? findRecipeById(id) : undefined;
    return recipe ? { ...m, name: recipe.name, recipe, aiMeal: undefined } : m;
  });
}

/**
 * The day's three meals: the member's own picks first, then their AI plan
 * for this cycle day, otherwise the phase meal plan. Shared by Today, the
 * Eat tab and the family week planner so every screen agrees.
 */
export function getTodayMeals(cycleDay: number, date = toLocalDateStr()): { meals: TodayMeal[]; isAI: boolean } {
  const aiToday = getAIMealPlan()?.days.find((d) => d.cycleDay === cycleDay) ?? null;
  if (aiToday) {
    const meals = (["breakfast", "lunch", "dinner"] as const)
      .map((slot) => {
        const ai = aiToday[slot];
        const name = ai?.name ?? "";
        return { slot, label: slot[0].toUpperCase() + slot.slice(1), name, recipe: (ai.recipeId ? findRecipeById(ai.recipeId) : undefined) ?? findRecipeByName(name), aiMeal: ai };
      })
      .filter((m) => m.name);
    return { meals: withCustomPicks(meals, cycleDay, date), isAI: true };
  }

  const { day: dayPlan } = getPhasePlanDay(cycleDay);
  if (!dayPlan) return { meals: withCustomPicks([], cycleDay, date), isAI: false };
  const meals: TodayMeal[] = (["breakfast", "lunch", "dinner"] as const).map((slot) => ({
    slot,
    label: slot[0].toUpperCase() + slot.slice(1),
    name: dayPlan[slot],
    recipe: findRecipeByName(dayPlan[slot]),
  }));
  return { meals: withCustomPicks(meals, cycleDay, date), isAI: false };
}

export function getTodaySnacks(cycleDay: number) {
 const day = getAIMealPlan()?.days.find(d => d.cycleDay === cycleDay);
 const phase = phaseForCycleDay(cycleDay);
 const prefs = getSavedPreferences() ?? DEFAULT_PREFS;
 const fallback = (slot: 'morning' | 'afternoon'): AIMeal => {
  try { return snackMeal(phase, slot, prefs); }
  catch { return {name:'No matching snack planned',ingredients:[],method:[],serves:1,phase,mealType:'snack',prepTime:'',nutritionalNote:'Choose a suitable snack in your meal plan.'}; }
 };
 return {morning: day?.morningSnack ?? fallback('morning'), afternoon: day?.afternoonSnack ?? fallback('afternoon')};
}
