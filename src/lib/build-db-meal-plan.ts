/**
 * Deterministic meal plan builder — assembles a 28-day cycle plan from the
 * NOURISH_RECIPES library (no AI, no edge calls).
 *
 * Same output shape as the previous AI builder so every downstream view —
 * MyWeekTab, shopping list, prep guide — keeps working unchanged.
 */
import { mealMatchesPreferences, childPreferences } from "./meal-restrictions";
import { Phase } from "./cycle-utils";
import { Recipe } from "@/data/meal-plans";
import { ALL_RECIPES } from "@/lib/recipe-index";
import { KIDS_RECIPE_BANK, KidsRecipe } from "@/data/kids-recipes";
import {
  PrepPreferences,
  AIMeal,
  AIPlannedDay,
  AIMealPlan,
  KidsMeal,
} from "./weekly-planner";

function phaseFromCycleDay(cd: number): Phase {
  if (cd <= 5) return "menstrual";
  if (cd <= 13) return "follicular";
  if (cd === 14) return "ovulatory";
  return "luteal";
}

function pool(category: Recipe["category"], phase: Phase, prefs: PrepPreferences, excludeIds: Set<string> = new Set()): Recipe[] {
  const safe = ALL_RECIPES.filter(r => r.category === category && mealMatchesPreferences(r, prefs));
  const preferred = safe.filter(r => r.phase === phase && !excludeIds.has(r.id));
  if (preferred.length) return preferred;
  const varied = safe.filter(r => !excludeIds.has(r.id));
  return varied.length ? varied : safe;
}

function recipeToMeal(
  r: Recipe,
  mealType: AIMeal["mealType"],
  phase: Phase
): AIMeal {
  return {
    name: r.name,
    recipeId: r.id,
    phase,
    mealType,
    prepTime: r.prepTime || "—",
    serves: r.serves || 1,
    ingredients: r.ingredients,
    method: r.method,
    nutritionalNote: r.phaseBenefit || r.keyNutrients?.join(", ") || "",
    keyNutrients: r.keyNutrients,
  };
}

const PHASE_SNACK_TEMPLATES: Record<
  Phase,
  { morning: { name: string; ingredients: string[] }; afternoon: { name: string; ingredients: string[] } }
> = {
  menstrual: {
    morning: { name: "Dark chocolate & trail mix", ingredients: ["20g dark chocolate (70%)", "15g almonds", "10g pumpkin seeds"] },
    afternoon: { name: "Turmeric latte", ingredients: ["250ml oat milk", "½ tsp turmeric", "pinch black pepper", "1 tsp honey"] },
  },
  follicular: {
    morning: { name: "Coconut yoghurt & kiwi", ingredients: ["120g coconut yoghurt", "1 kiwi, sliced", "1 tsp chia seeds"] },
    afternoon: { name: "Edamame with sea salt", ingredients: ["100g edamame", "pinch sea salt"] },
  },
  ovulatory: {
    morning: { name: "Fresh fruit & mint", ingredients: ["1 cup mixed berries", "5 mint leaves"] },
    afternoon: { name: "Almonds & berries", ingredients: ["20g almonds", "½ cup blueberries"] },
  },
  luteal: {
    morning: { name: "Apple with tahini", ingredients: ["1 apple, sliced", "1 tbsp tahini"] },
    afternoon: { name: "Banana nice cream", ingredients: ["1 frozen banana", "1 tsp cacao", "1 tbsp almond butter"] },
  },
};

function snackMeal(phase: Phase, slot: "morning" | "afternoon", prefs: PrepPreferences): AIMeal {
  const preferred = PHASE_SNACK_TEMPLATES[phase][slot];
  const t = [preferred, ...Object.values(PHASE_SNACK_TEMPLATES).flatMap(s => [s.morning, s.afternoon])].find(s => mealMatchesPreferences(s, prefs));
  if (!t) {
    const recipe = pool("snack", phase, prefs)[0];
    if (recipe) return recipeToMeal(recipe, "snack", phase);
    throw new Error("No snacks match your dietary restrictions. Please review your preferences or add suitable recipes.");
  }
  return {
    name: t.name,
    phase,
    mealType: "snack",
    prepTime: "2 min",
    serves: 1,
    ingredients: t.ingredients,
    method: ["Combine and enjoy."],
    nutritionalNote: "Cycle-aware micro-fuel.",
  };
}

/**
 * Build a sequence of meal picks for a slot across the 4 phases respecting
 * the user's repetition preference.
 */
function buildSlotPicks(
  category: Recipe["category"],
  prefs: PrepPreferences,
  pref: "batch" | "rotate" | "variety" | "double" | "fresh" | "mix",
  excludeIdsByPhase?: Record<Phase, Set<string>>
): Record<Phase, Recipe[]> {
  const phases: Phase[] = ["menstrual", "follicular", "ovulatory", "luteal"];
  const out = {} as Record<Phase, Recipe[]>;
  for (const phase of phases) {
    const days =
      phase === "menstrual" ? 5 : phase === "follicular" ? 8 : phase === "ovulatory" ? 1 : 14;
    const p = pool(category, phase, prefs, excludeIdsByPhase?.[phase]);
    if (p.length === 0) {
      out[phase] = [];
      continue;
    }
    let count: number;
    if (pref === "batch" || pref === "double") count = 1;
    else if (pref === "rotate" || pref === "fresh") count = Math.min(3, p.length);
    else count = Math.min(days, p.length); // variety / mix

    const picks: Recipe[] = [];
    for (let i = 0; i < count; i++) picks.push(p[i % p.length]);
    out[phase] = picks;
  }
  return out;
}

function pickKidsMatch(
  adult: Recipe,
  prefs: PrepPreferences
): KidsRecipe | undefined {
  // Detect protein in adult meal
  const blob = (adult.name + " " + adult.ingredients.join(" ")).toLowerCase();
  const proteinHints: { key: string; words: string[] }[] = [
    { key: "chicken", words: ["chicken"] },
    { key: "beef", words: ["beef", "mince"] },
    { key: "fish", words: ["salmon", "fish", "tuna"] },
    { key: "tofu", words: ["tofu"] },
    { key: "beans", words: ["bean", "chickpea"] },
    { key: "lentils", words: ["lentil"] },
    { key: "eggs", words: ["egg"] },
    { key: "pork", words: ["pork"] },
  ];
  let protein: string | undefined;
  for (const p of proteinHints) {
    if (p.words.some((w) => blob.includes(w))) {
      protein = p.key;
      break;
    }
  }

  const safe = KIDS_RECIPE_BANK.filter(k => mealMatchesPreferences(k, childPreferences(prefs)));
  return safe.find(k => k.protein === protein) || safe[0];
}

function kidsToMeal(k: KidsRecipe): KidsMeal {
  return {
    name: k.name,
    recipeId: k.id,
    prepTime: k.prepTime,
    serves: k.serves,
    ingredients: k.ingredients,
    method: k.method,
    proteinMatch: k.protein,
    isKidsMeal: true,
  };
}

export function buildDbMealPlan(
  prefs: PrepPreferences,
  startDay = 1,
  endDay = 28
): AIPlannedDay[] {
  const breakfastPicks = buildSlotPicks("breakfast", prefs, prefs.breakfast);
  const lunchPicks = buildSlotPicks("meal", prefs, prefs.lunch);

  // If the user wants variety (not batch lunch / not double dinner), keep
  // lunch and dinner pools disjoint so the same recipe never shows up as
  // both lunch and dinner across the cycle.
  const wantsDistinct = prefs.lunch !== "batch" && prefs.dinner !== "double";
  const dinnerExclude: Record<Phase, Set<string>> = {
    menstrual: new Set(),
    follicular: new Set(),
    ovulatory: new Set(),
    luteal: new Set(),
  };
  if (wantsDistinct) {
    (Object.keys(lunchPicks) as Phase[]).forEach((ph) => {
      lunchPicks[ph].forEach((r) => dinnerExclude[ph].add(r.id));
    });
  }
  const dinnerPicks = buildSlotPicks("meal", prefs, prefs.dinner, dinnerExclude);

  const days: AIPlannedDay[] = [];
  const phaseDayCounter: Record<Phase, number> = {
    menstrual: 0,
    follicular: 0,
    ovulatory: 0,
    luteal: 0,
  };

  for (let cd = 1; cd <= 28; cd++) {
    const phase = phaseFromCycleDay(cd);
    const idx = phaseDayCounter[phase]++;

    const bPool = breakfastPicks[phase];
    const lPool = lunchPicks[phase];
    const dPool = dinnerPicks[phase];

    if (cd < startDay || cd > endDay) continue;
    if (!bPool.length || !lPool.length || !dPool.length) throw new Error("Not enough recipes match your dietary restrictions. Please review your preferences or add suitable recipes.");

    const breakfast = recipeToMeal(bPool[idx % bPool.length], "breakfast", phase);
    const lunchRecipe = lPool[idx % lPool.length];
    const dinnerRecipe = dPool[(idx + 1) % dPool.length]; // offset so lunch ≠ dinner
    const lunch = recipeToMeal(lunchRecipe, "lunch", phase);
    const dinner = recipeToMeal(dinnerRecipe, "dinner", phase);

    const day: AIPlannedDay = {
      cycleDay: cd,
      phase,
      breakfast,
      lunch,
      dinner,
      morningSnack: snackMeal(phase, "morning", prefs),
      afternoonSnack: snackMeal(phase, "afternoon", prefs),
    };

    if (prefs.kids > 0) {
      const kLunch = pickKidsMatch(lunchRecipe, prefs);
      const kDinner = pickKidsMatch(dinnerRecipe, prefs);
      if (!kLunch || !kDinner) throw new Error("No children’s meals match their dietary restrictions. Please review their preferences or add suitable recipes.");
      if (kLunch) day.kidsLunch = kidsToMeal(kLunch);
      if (kDinner) day.kidsDinner = kidsToMeal(kDinner);
    }

    days.push(day);
  }
  return days;
}

/**
 * If prefs.dinner === "double", auto-fill next day's lunch as a leftover
 * pointing to the previous night's dinner. Skips locked slots is N/A here
 * because this runs at build-time before any locks exist.
 */
function applyLeftoversAutoFill(days: AIPlannedDay[], prefs: PrepPreferences): AIPlannedDay[] {
  if (prefs.dinner !== "double") return days;
  const byDay = new Map(days.map(d => [d.cycleDay, d]));
  for (const d of days) {
    const prev = byDay.get(d.cycleDay - 1);
    if (!prev?.dinner || prev.dinner.isLeftover) continue;
    // Replace today's lunch with a leftover-from-yesterday-dinner marker
    d.lunch = {
      ...prev.dinner,
      mealType: "lunch",
      isLeftover: true,
      leftoverFrom: prev.cycleDay,
      nutritionalNote: `Leftover from Day ${prev.cycleDay} dinner — same nourishment, no extra prep.`,
    };
  }
  return days;
}

export function buildDbMealPlanFull(prefs: PrepPreferences): AIMealPlan {
  const built = buildDbMealPlan(prefs, 1, 28);
  return {
    days: applyLeftoversAutoFill(built, prefs),
    prepPreferences: prefs,
    createdAt: Date.now(),
    lockedMeals: {},
  };
}

/** Pick a different recipe for a single slot. */
export function regenerateMealFromDb(
  plan: AIMealPlan,
  cycleDay: number,
  mealType: "breakfast" | "lunch" | "dinner"
): AIMeal | null {
  const phase = phaseFromCycleDay(cycleDay);
  const category: Recipe["category"] = mealType === "breakfast" ? "breakfast" : "meal";
  const p = pool(category, phase, plan.prepPreferences);
  if (p.length === 0) return null;
  const day = plan.days.find((d) => d.cycleDay === cycleDay);
  const currentName = day?.[mealType]?.name;
  const next = p.find((r) => r.name !== currentName) || p[0];
  return recipeToMeal(next, mealType, phase);
}
