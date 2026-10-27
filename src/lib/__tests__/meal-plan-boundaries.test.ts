import { beforeEach, describe, expect, it, vi } from 'vitest';
import { buildDbMealPlanFull } from '../build-db-meal-plan';
import { DEFAULT_PREFS, getAIMealPlan, saveAIMealPlan } from '../weekly-planner';
import { normaliseMealPlan } from '../meal-plan-schema';
import { mealMatchesPreferences } from '../meal-restrictions';
import { containsNuts } from '../recipe-facets';

describe('meal-plan persistence and exclusions', () => {
 beforeEach(() => localStorage.clear());
 it('round trips a complete library plan', () => {
  const plan = buildDbMealPlanFull(DEFAULT_PREFS);
  saveAIMealPlan(plan);
  expect(getAIMealPlan()?.days).toHaveLength(28);
  expect(getAIMealPlan()?.days[0].breakfast.recipeId).toBeTruthy();
 });
 it('migrates the onboarding envelope and retains ingredients', () => {
  const plan = buildDbMealPlanFull(DEFAULT_PREFS);
  localStorage.setItem('signal_meal_plan', JSON.stringify({plan: plan.days, generatedAt:'2026-10-27T00:00:00Z'}));
  expect(getAIMealPlan()?.days[0].dinner.ingredients).toEqual(plan.days[0].dinner.ingredients);
  expect(JSON.parse(localStorage.getItem('signal_meal_plan')!).days).toHaveLength(28);
 });
 it('rejects malformed and duplicate days without crashing readers', () => {
  localStorage.setItem('signal_meal_plan', JSON.stringify({days:[{cycleDay:1}]}));
  expect(getAIMealPlan()).toBeNull();
  const plan = buildDbMealPlanFull(DEFAULT_PREFS);
  expect(normaliseMealPlan({...plan,days:[plan.days[0],plan.days[0]]})).toBeNull();
 });
 it('excludes nuts from all adult meals and snacks across 28 days', () => {
  const plan = buildDbMealPlanFull({...DEFAULT_PREFS, allergies:'nuts'});
  for (const day of plan.days) for (const slot of ['breakfast','lunch','dinner','morningSnack','afternoonSnack'] as const) {
   expect(containsNuts(day[slot].ingredients,day[slot].name),day[slot].name).toBe(false);
  }
 });
 it('honours legacy diets and children restrictions as well as adult preferences', () => {
  const plan = buildDbMealPlanFull({...DEFAULT_PREFS,dietType:'Vegan', kids:1,kidsDietType:'Vegetarian',kidsAllergies:'nuts'});
  for (const day of plan.days) {
   for (const slot of ['breakfast','lunch','dinner','morningSnack','afternoonSnack'] as const) expect(mealMatchesPreferences(day[slot],{...DEFAULT_PREFS,dietType:'Vegan'})).toBe(true);
   for (const slot of ['kidsLunch','kidsDinner'] as const) expect(containsNuts(day[slot]!.ingredients,day[slot]!.name)).toBe(false);
  }
 });
 it('fails explicitly when restrictions eliminate all recipes', () => {
  expect(() => buildDbMealPlanFull({...DEFAULT_PREFS,dislikes:'a, e, i, o, u'})).toThrow(/restrictions/);
  expect(() => buildDbMealPlanFull({...DEFAULT_PREFS,kids:1,kidsAllergies:'a, e, i, o, u'})).toThrow(/children/);
 });
 it('reports storage failure instead of claiming a plan was saved', () => {
  const plan = buildDbMealPlanFull(DEFAULT_PREFS);
  const write = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota'); });
  const log = vi.spyOn(console, 'error').mockImplementation(() => {});
  try { expect(() => saveAIMealPlan(plan)).toThrow(/could not be saved/); }
  finally { write.mockRestore(); log.mockRestore(); }
 });
 it('does not treat animal alternatives or optional garnishes as vegan', () => {
  expect(mealMatchesPreferences({name:'Bowl',ingredients:['honey or maple syrup']},{...DEFAULT_PREFS,dietType:'vegan'})).toBe(false);
  expect(mealMatchesPreferences({name:'Bowl',ingredients:['parmesan (optional)']},{...DEFAULT_PREFS,dietType:'vegan'})).toBe(false);
  expect(mealMatchesPreferences({name:'Bowl',ingredients:['coconut milk','peanut butter']},{...DEFAULT_PREFS,dietTypes:['Dairy-free']})).toBe(true);
 });
});
