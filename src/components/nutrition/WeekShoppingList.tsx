import { useMemo } from "react";
import { addDays, startOfWeek } from "date-fns";
import { useCycle } from "@/contexts/CycleContext";
import { useCustomMealPlan } from "@/hooks/useCustomMealPlan";
import { getAIMealPlan } from "@/lib/weekly-planner";
import { buildCustomShoppingPlan } from "@/lib/build-custom-shopping-plan";
import { getShoppingList } from "@/lib/ingredient-parser";
import SmartShoppingList from "./SmartShoppingList";
import { ShoppingListPanel } from "@/components/ShoppingList";

/**
 * The List tab: this week's shopping list, built straight from the meal plan
 * (the member's own picks + the cycle plan). Recipes added one-by-one from
 * the library appear underneath.
 */
export default function WeekShoppingList() {
  const { currentCycleDay, getCycleDayForDate } = useCycle();
  const { plan: customPlan } = useCustomMealPlan();

  const plan = useMemo(() => {
    const ai = getAIMealPlan();
    if (ai) return ai;
    const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
    const cycleDays = Array.from({ length: 7 }, (_, i) => getCycleDayForDate(addDays(monday, i)));
    return buildCustomShoppingPlan(cycleDays, customPlan);
  }, [customPlan, getCycleDayForDate]);

  const hasExtraRecipes = getShoppingList().length > 0;

  return (
    <div className="space-y-6">
      <SmartShoppingList plan={plan} weekNumber={Math.ceil(currentCycleDay / 7)} />
      {hasExtraRecipes && (
        <div className="space-y-2">
          <p className="eyebrow text-muted-foreground">Added from recipes</p>
          <ShoppingListPanel />
        </div>
      )}
    </div>
  );
}
