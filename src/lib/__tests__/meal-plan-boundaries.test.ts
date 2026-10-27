import { beforeEach, describe, expect, it, vi } from 'vitest';
import { buildDbMealPlanFull } from '../build-db-meal-plan';
import { DEFAULT_PREFS, getAIMealPlan, getHousehold, saveAIMealPlan, saveHousehold, savePreferences, getSavedPreferences } from '../weekly-planner';
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

describe('household size', () => {
 beforeEach(() => localStorage.clear());
 it('gives the List tab and the plan the same adults and kids', () => {
  expect(getHousehold()).toEqual({adults:1,kids:0});
  savePreferences({...DEFAULT_PREFS, adults:2, kids:1});
  saveAIMealPlan(buildDbMealPlanFull({...DEFAULT_PREFS, adults:2, kids:1}));
  expect(getHousehold()).toEqual({adults:2,kids:1});
  saveHousehold({adults:3,kids:2});
  expect(getSavedPreferences()).toMatchObject({adults:3,kids:2});
  expect(getAIMealPlan()?.prepPreferences).toMatchObject({adults:3,kids:2});
  expect(getHousehold()).toEqual({adults:3,kids:2});
 });
});

describe('meal variety settings', () => {
 it('cooks a different dinner each night when cooking double, so lunch never repeats that night', () => {
  const plan = buildDbMealPlanFull(DEFAULT_PREFS);
  const sameDay = plan.days.filter(d => d.lunch.name === d.dinner.name);
  expect(sameDay.map(d => d.cycleDay)).toEqual([]);
  const repeats = plan.days.slice(1).filter((d, i) => d.dinner.name === plan.days[i].dinner.name && d.phase === plan.days[i].phase);
  expect(repeats.map(d => d.cycleDay)).toEqual([]);
  // Leftovers: each lunch after the first is yesterday's dinner.
  expect(plan.days[1].lunch).toMatchObject({ name: plan.days[0].dinner.name, isLeftover: true });
 });
 it('keeps a batch breakfast for a week, then starts a new batch', () => {
  const plan = buildDbMealPlanFull(DEFAULT_PREFS);
  const luteal = plan.days.filter(d => d.phase === 'luteal').map(d => d.breakfast.name);
  expect(new Set(luteal.slice(0, 7)).size).toBe(1);
  expect(new Set(luteal).size).toBeGreaterThan(1);
 });
});
