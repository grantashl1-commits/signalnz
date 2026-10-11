import { it, expect, vi } from 'vitest';
import { addRecipeToMyWeek } from '../add-to-my-week';
import { getTodayMeals } from '../today-meals';
import { buildCustomShoppingPlan } from '../build-custom-shopping-plan';
import { ALL_RECIPES } from '../recipe-index';
import { parseIngredient } from '../ingredient-parser';
import { aggregateShoppingItems } from '../smart-shopping-core';
vi.mock('@/integrations/supabase/client', () => ({ supabase: { auth: { getUser: vi.fn(async () => ({ data: { user: null } })) } } }));
it('publishes recipe picks to listeners and includes their ingredients in the dated plan', async () => {
 vi.useFakeTimers(); localStorage.clear(); const recipe=ALL_RECIPES[0]; const changed=vi.fn(); window.addEventListener('signal:custom-meal-plan-changed', changed);
 addRecipeToMyWeek(recipe, 6, 'dinner', '2026-10-12'); await Promise.resolve();
 expect(changed).toHaveBeenCalled(); expect(Number(localStorage.getItem('signal_custom_meal_plan_updated_at'))).toBeGreaterThan(0);
 const picks=JSON.parse(localStorage.getItem('signal_custom_meal_plan_v1')!); const plan=buildCustomShoppingPlan([6], picks, { adults: 2 }, null, ['2026-10-12']);
 expect(getTodayMeals(6, '2026-10-12').meals.find(m => m.slot==='dinner')?.recipe?.id).toBe(recipe.id); expect(plan.days[0].dinner.ingredients).toEqual(recipe.ingredients);
 const items=Object.values(aggregateShoppingItems({ meals: [plan.days[0].dinner], servingMultiplier: 2 }, parseIngredient)).flat(); expect(items.length).toBeGreaterThan(0); expect(items.every(i => Number.isFinite(i.totalQty))).toBe(true);
 window.removeEventListener('signal:custom-meal-plan-changed', changed); await vi.runAllTimersAsync(); vi.useRealTimers(); localStorage.clear();
});
