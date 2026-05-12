/**
 * Deterministic meal plan builder — assembles a 28-day cycle plan from the
 * NOURISH_RECIPES library (no AI, no edge calls).
 *
 * Same output shape as the previous AI builder so every downstream view —
 * MyWeekTab, shopping list, prep guide — keeps working unchanged.
 */
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

const DIET_TAG_REQUIRED: Record<string, string[]> = {
  vegan: ["vegan"],
  vegetarian: ["vegan", "vegetarian"],
  pescatarian: ["vegan", "vegetarian", "pescatarian"],
};

function matchesDiet(r: Recipe, dietTypes: string[] | undefined): boolean {
  if (!dietTypes || dietTypes.length === 0) return true;
  const lowered = dietTypes.map((d) => d.toLowerCase());
  for (const d of lowered) {
    const allowed = DIET_TAG_REQUIRED[d];
    if (!allowed) continue; // unknown diet (e.g. "dairy-free") falls through to ingredient filter
    if (!r.tags?.some((t) => allowed.includes(t.toLowerCase()))) return false;
  }
  return true;
}

function avoidIngredients(r: Recipe, avoid: string[]): boolean {
  if (avoid.length === 0) return true;
  const blob = r.ingredients.join(" ").toLowerCase() + " " + r.name.toLowerCase();
  return !avoid.some((w) => w && blob.includes(w));
}

function parseAvoid(prefs: PrepPreferences): string[] {
  const out: string[] = [];
  const split = (s?: string) =>
    (s || "")
      .split(/[,\n]/)
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 1);
  out.push(...split(prefs.allergies));
  out.push(...split(prefs.dislikes));
  // dairy-free / gluten-free meta dietTypes
  const meta = (prefs.dietTypes || []).map((d) => d.toLowerCase());
  if (meta.includes("dairy-free"))
    out.push("milk", "cheese", "yoghurt", "butter", "cream", "parmesan", "feta");
  if (meta.includes("gluten-free"))
    out.push("wheat", "pasta", "bread", "tortilla", "couscous", "barley", "soy sauce");
  return [...new Set(out)];
}

function pool(
  category: Recipe["category"],
  phase: Phase,
  prefs: PrepPreferences
): Recipe[] {
  const avoid = parseAvoid(prefs);
  const all = ALL_RECIPES.filter((r) => r.category === category);
  let phaseMatch = all.filter(
    (r) =>
      r.phase === phase &&
      matchesDiet(r, prefs.dietTypes) &&
      avoidIngredients(r, avoid)
  );
  if (phaseMatch.length === 0) {
    phaseMatch = all.filter(
      (r) => matchesDiet(r, prefs.dietTypes) && avoidIngredients(r, avoid)
    );
  }
  // last-resort: ignore diet filter rather than crash
  if (phaseMatch.length === 0) phaseMatch = all.filter((r) => r.phase === phase);
  if (phaseMatch.length === 0) phaseMatch = all;
  return phaseMatch;
}

function recipeToMeal(
  r: Recipe,
  mealType: AIMeal["mealType"],
  phase: Phase
): AIMeal {
  return {
    name: r.name,
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

function snackMeal(phase: Phase, slot: "morning" | "afternoon"): AIMeal {
  const t = PHASE_SNACK_TEMPLATES[phase][slot];
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
  pref: "batch" | "rotate" | "variety" | "double" | "fresh" | "mix"
): Record<Phase, Recipe[]> {
  const phases: Phase[] = ["menstrual", "follicular", "ovulatory", "luteal"];
  const out = {} as Record<Phase, Recipe[]>;
  for (const phase of phases) {
    const days =
      phase === "menstrual" ? 5 : phase === "follicular" ? 8 : phase === "ovulatory" ? 1 : 14;
    const p = pool(category, phase, prefs);
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
  const dietary = (prefs.kidsDietTypes || []).map((d) => d.toLowerCase());
  const allergies = (prefs.kidsAllergies || "")
    .toLowerCase()
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

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

  const candidates = KIDS_RECIPE_BANK.filter((k) => {
    if (protein && k.protein !== protein) return false;
    if (dietary.includes("vegan") && !k.tags.includes("vegan")) return false;
    if (
      dietary.includes("vegetarian") &&
      !k.tags.some((t) => t === "vegan" || t === "vegetarian")
    )
      return false;
    if (allergies.length) {
      const text = (k.name + " " + k.ingredients.join(" ")).toLowerCase();
      if (allergies.some((a) => a && text.includes(a))) return false;
    }
    return true;
  });
  return candidates[0] || KIDS_RECIPE_BANK.find((k) => k.protein === protein);
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
  const dinnerPicks = buildSlotPicks("meal", prefs, prefs.dinner);

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
    if (!bPool.length || !lPool.length || !dPool.length) continue;

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
      morningSnack: snackMeal(phase, "morning"),
      afternoonSnack: snackMeal(phase, "afternoon"),
    };

    if (prefs.kids > 0) {
      const kLunch = pickKidsMatch(lunchRecipe, prefs);
      const kDinner = pickKidsMatch(dinnerRecipe, prefs);
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
