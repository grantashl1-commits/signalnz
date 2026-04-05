export type FitnessGoal = "general" | "strength" | "flexibility" | "weight-loss" | "stress-relief";
export type FitnessLevel = "beginner" | "intermediate" | "advanced";
export type Equipment = "none" | "home" | "gym";

export interface FitnessProfile {
  goal: FitnessGoal;
  equipment: Equipment[];
  level: FitnessLevel;
  injuries: string;
}

export interface SupermarketPreference {
  name: string;
  url: string;
}

export interface NutritionTarget {
  proteinMin: number; // g/kg/day
  proteinMax: number;
  carbEmphasis: "high" | "moderate" | "lower";
  calorieNote: string;
}

const FITNESS_KEY = "signal_fitness_profile";
const SUPERMARKET_KEY = "signal_supermarket";

export const GOAL_LABELS: Record<FitnessGoal, string> = {
  general: "General Fitness",
  strength: "Strength",
  flexibility: "Flexibility",
  "weight-loss": "Weight Loss",
  "stress-relief": "Stress Relief",
};

export const LEVEL_LABELS: Record<FitnessLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  none: "No Equipment",
  home: "Home Equipment",
  gym: "Full Gym",
};

export const SUPERMARKET_OPTIONS: SupermarketPreference[] = [
  { name: "Woolworths NZ", url: "https://www.woolworths.co.nz" },
  { name: "New World", url: "https://www.newworld.co.nz" },
  { name: "Pak'nSave", url: "https://www.paknsave.co.nz" },
  { name: "Four Square", url: "https://www.foursquare.co.nz" },
];

const NUTRITION_TARGETS: Record<string, NutritionTarget> = {
  muscle_building: { proteinMin: 1.6, proteinMax: 2.2, carbEmphasis: "moderate", calorieNote: "Maintenance or small surplus" },
  strength_power: { proteinMin: 1.6, proteinMax: 2.0, carbEmphasis: "moderate", calorieNote: "Maintenance" },
  glute_foundation: { proteinMin: 1.4, proteinMax: 1.8, carbEmphasis: "moderate", calorieNote: "Maintenance" },
  body_recomposition: { proteinMin: 1.6, proteinMax: 2.0, carbEmphasis: "moderate", calorieNote: "Small deficit if desired" },
  fat_loss_cardio: { proteinMin: 1.6, proteinMax: 2.0, carbEmphasis: "lower", calorieNote: "Moderate deficit" },
  hiit_performance: { proteinMin: 1.4, proteinMax: 1.8, carbEmphasis: "high", calorieNote: "Maintenance to surplus" },
  walk_to_run: { proteinMin: 1.2, proteinMax: 1.6, carbEmphasis: "moderate", calorieNote: "Maintenance" },
  functional_fitness: { proteinMin: 1.2, proteinMax: 1.6, carbEmphasis: "moderate", calorieNote: "Maintenance" },
  gentle_movement: { proteinMin: 1.0, proteinMax: 1.4, carbEmphasis: "moderate", calorieNote: "Intuitive" },
  nervous_system: { proteinMin: 1.0, proteinMax: 1.4, carbEmphasis: "moderate", calorieNote: "Anti-inflammatory focus" },
  hormonal_support: { proteinMin: 1.2, proteinMax: 1.6, carbEmphasis: "moderate", calorieNote: "Cycle-synced" },
};

export function getNutritionTargetForGoal(goalSlug: string, weightKg?: number, cycleMode?: string): NutritionTarget & { dailyProteinMin?: number; dailyProteinMax?: number } {
  const target = NUTRITION_TARGETS[goalSlug] || NUTRITION_TARGETS.hormonal_support;
  let result = { ...target } as NutritionTarget & { dailyProteinMin?: number; dailyProteinMax?: number };

  // Perimenopause override: minimum 30g protein per meal (Sims — Next Level)
  if (cycleMode === "perimenopause" || cycleMode === "post_menopause") {
    result.proteinMin = Math.max(result.proteinMin, 1.6);
    result.proteinMax = Math.max(result.proteinMax, 2.0);
  }

  if (weightKg) {
    result.dailyProteinMin = Math.round(weightKg * result.proteinMin);
    result.dailyProteinMax = Math.round(weightKg * result.proteinMax);
  }

  return result;
}

export function getLatestBodyMetrics(): { weight: number; height: number; bodyFat?: number } | null {
  try {
    const history = JSON.parse(localStorage.getItem("signal_measurement_history") || "[]");
    if (!history.length) return null;
    const sorted = history.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const latest = sorted[0];
    if (!latest.weight) return null;
    return {
      weight: parseFloat(latest.weight),
      height: latest.height ? parseFloat(latest.height) : 0,
      bodyFat: latest.bodyFat ? parseFloat(latest.bodyFat) : undefined,
    };
  } catch { return null; }
}

export function getFitnessProfile(): FitnessProfile | null {
  try {
    const raw = localStorage.getItem(FITNESS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function saveFitnessProfile(profile: FitnessProfile): void {
  localStorage.setItem(FITNESS_KEY, JSON.stringify(profile));
}

export function getSupermarket(): SupermarketPreference {
  try {
    const raw = localStorage.getItem(SUPERMARKET_KEY);
    return raw ? JSON.parse(raw) : SUPERMARKET_OPTIONS[0];
  } catch { return SUPERMARKET_OPTIONS[0]; }
}

export function saveSupermarket(pref: SupermarketPreference): void {
  localStorage.setItem(SUPERMARKET_KEY, JSON.stringify(pref));
}

export function getDislikedRecipes(): string[] {
  try {
    return JSON.parse(localStorage.getItem("disliked_recipes") || "[]");
  } catch { return []; }
}

export function addDislikedRecipe(recipeId: string): void {
  const list = getDislikedRecipes();
  if (!list.includes(recipeId)) {
    list.push(recipeId);
    localStorage.setItem("disliked_recipes", JSON.stringify(list));
  }
}

export function removeDislikedRecipe(recipeId: string): void {
  const list = getDislikedRecipes().filter(id => id !== recipeId);
  localStorage.setItem("disliked_recipes", JSON.stringify(list));
}

export function getPantryStaples(): string[] {
  try {
    return JSON.parse(localStorage.getItem("pantry_staples") || "[]");
  } catch { return []; }
}

export function savePantryStaples(items: string[]): void {
  localStorage.setItem("pantry_staples", JSON.stringify(items));
}
