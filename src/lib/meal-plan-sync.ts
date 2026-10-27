/**
 * A fresh device has no meal plan until this pulls her latest saved one, so
 * Today, Eat and the shopping list show her plan straight away rather than the
 * default meals. Called at app start (AuthContext) next to the training sync.
 */
import { supabase } from "@/integrations/supabase/client";
import { captureDeviceScope } from "@/lib/device-privacy";
import { normaliseMealPlan } from "@/lib/meal-plan-schema";
import { getAIMealPlan, saveAIMealPlan } from "@/lib/weekly-planner";

export const MEAL_PLAN_CHANGED = "signal:meal-plan-changed";

export async function restoreMealPlanFromCloud(): Promise<boolean> {
  if (getAIMealPlan()) return false;
  const scope = captureDeviceScope();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !scope.matches(user.id)) return false;
  const { data } = await supabase
    .from("user_plans")
    .select("plan_data, generated_at")
    .eq("user_id", user.id)
    .eq("plan_type", "nutrition")
    .not("plan_data->days", "is", null)
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  // Never apply a plan to another account, or over one she made meanwhile.
  if (!scope.matches(user.id) || getAIMealPlan()) return false;
  const plan = data?.plan_data ? normaliseMealPlan(data.plan_data) : null;
  if (!plan?.days?.length) return false;
  saveAIMealPlan(plan);
  window.dispatchEvent(new Event(MEAL_PLAN_CHANGED));
  return true;
}
