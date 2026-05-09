/**
 * Local-first storage for the user's hand-picked weekly meal plan.
 *
 * Each entry is keyed by cycle day (1–28) and slot (breakfast/lunch/dinner)
 * and stores the recipe id from the nourish library. Slots without an entry
 * fall back to the static phase plan in the consumer.
 *
 * Shape kept tiny so syncing to Supabase later is trivial.
 */
import { useCallback, useEffect, useState } from "react";

export type MealSlot = "breakfast" | "lunch" | "dinner";

export type CustomMealPlan = Record<number, Partial<Record<MealSlot, string>>>;

const STORAGE_KEY = "signal_custom_meal_plan_v1";

function loadFromStorage(): CustomMealPlan {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveToStorage(plan: CustomMealPlan) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
  } catch {
    // localStorage full or disabled — silent
  }
}

export function useCustomMealPlan() {
  const [plan, setPlan] = useState<CustomMealPlan>(loadFromStorage);

  // Cross-tab sync — if another tab updates the plan, mirror here.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setPlan(loadFromStorage());
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const setMeal = useCallback((cycleDay: number, slot: MealSlot, recipeId: string) => {
    setPlan(prev => {
      const next: CustomMealPlan = {
        ...prev,
        [cycleDay]: { ...(prev[cycleDay] || {}), [slot]: recipeId },
      };
      saveToStorage(next);
      return next;
    });
  }, []);

  const removeMeal = useCallback((cycleDay: number, slot: MealSlot) => {
    setPlan(prev => {
      const day = { ...(prev[cycleDay] || {}) };
      delete day[slot];
      const next: CustomMealPlan = { ...prev };
      if (Object.keys(day).length === 0) delete next[cycleDay];
      else next[cycleDay] = day;
      saveToStorage(next);
      return next;
    });
  }, []);

  const clearWeek = useCallback((cycleDays: number[]) => {
    setPlan(prev => {
      const next = { ...prev };
      for (const d of cycleDays) delete next[d];
      saveToStorage(next);
      return next;
    });
  }, []);

  const getMeal = useCallback((cycleDay: number, slot: MealSlot): string | undefined => {
    return plan[cycleDay]?.[slot];
  }, [plan]);

  return { plan, setMeal, removeMeal, clearWeek, getMeal };
}
