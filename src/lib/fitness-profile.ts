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
