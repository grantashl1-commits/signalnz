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
import { supabase } from "@/integrations/supabase/client";

export type MealSlot = "breakfast" | "lunch" | "dinner";

export type CustomMealPlan = Record<number, Partial<Record<MealSlot, string>>>;

const STORAGE_KEY = "signal_custom_meal_plan_v1";
const UPDATED_KEY = "signal_custom_meal_plan_updated_at";
const CHANGE_EVENT = "signal:custom-meal-plan-changed";
/** Marker inside user_plans.plan_data (plan_type "nutrition") for the member's own picks. */
const CLOUD_KIND = "signal_custom_picks_v1";

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

function saveToStorage(plan: CustomMealPlan, updatedAt = Date.now()) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
    window.localStorage.setItem(UPDATED_KEY, String(updatedAt));
  } catch {
    // localStorage full or disabled — silent
  }
  // Async so listeners never setState while React is applying this update.
  queueMicrotask(() => window.dispatchEvent(new Event(CHANGE_EVENT)));
}

/* ── Cloud sync: one user_plans row per member holds their picks ── */

async function currentUserId(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getUser();
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}

async function findCloudRow(uid: string) {
  const { data } = await supabase
    .from("user_plans")
    .select("id, plan_data")
    .eq("user_id", uid)
    .eq("plan_type", "nutrition")
    .eq("plan_data->>kind", CLOUD_KIND)
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data as { id: string; plan_data: { picks?: CustomMealPlan; updatedAt?: number } } | null;
}

let pushTimer: ReturnType<typeof setTimeout> | null = null;
function pushToCloud(plan: CustomMealPlan) {
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(async () => {
    const uid = await currentUserId();
    if (!uid) return;
    try {
      const plan_data = { kind: CLOUD_KIND, picks: plan, updatedAt: Date.now() };
      const row = await findCloudRow(uid);
      if (row) await supabase.from("user_plans").update({ plan_data, generated_at: new Date().toISOString() }).eq("id", row.id);
      else await supabase.from("user_plans").insert({ user_id: uid, plan_type: "nutrition", plan_data });
    } catch {
      // offline — local copy stays the source of truth until the next change
    }
  }, 600);
}

let pullPromise: Promise<void> | null = null;
/** On first use per session, adopt the cloud copy if it's newer than this device's. */
function pullFromCloud(): Promise<void> {
  pullPromise ??= (async () => {
    const uid = await currentUserId();
    if (!uid) return;
    try {
      const row = await findCloudRow(uid);
      const localUpdated = Number(window.localStorage.getItem(UPDATED_KEY) || 0);
      const cloudUpdated = row?.plan_data?.updatedAt ?? 0;
      if (row?.plan_data?.picks && cloudUpdated > localUpdated) {
        saveToStorage(row.plan_data.picks, cloudUpdated);
      } else if (!row && localUpdated) {
        pushToCloud(loadFromStorage());
      }
    } catch {
      // offline
    }
  })();
  return pullPromise;
}

export function useCustomMealPlan() {
  const [plan, setPlan] = useState<CustomMealPlan>(loadFromStorage);

  // Cross-tab and same-page sync (another tab, or another hook instance /
  // the cloud pull updating the plan) — mirror here.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setPlan(loadFromStorage());
    };
    const local = () => setPlan(loadFromStorage());
    window.addEventListener("storage", handler);
    window.addEventListener(CHANGE_EVENT, local);
    void pullFromCloud();
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener(CHANGE_EVENT, local);
    };
  }, []);

  const setMeal = useCallback((cycleDay: number, slot: MealSlot, recipeId: string) => {
    setPlan(prev => {
      const next: CustomMealPlan = {
        ...prev,
        [cycleDay]: { ...(prev[cycleDay] || {}), [slot]: recipeId },
      };
      saveToStorage(next);
      pushToCloud(next);
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
      pushToCloud(next);
      return next;
    });
  }, []);

  const clearWeek = useCallback((cycleDays: number[]) => {
    setPlan(prev => {
      const next = { ...prev };
      for (const d of cycleDays) delete next[d];
      saveToStorage(next);
      pushToCloud(next);
      return next;
    });
  }, []);

  const getMeal = useCallback((cycleDay: number, slot: MealSlot): string | undefined => {
    return plan[cycleDay]?.[slot];
  }, [plan]);

  return { plan, setMeal, removeMeal, clearWeek, getMeal };
}
