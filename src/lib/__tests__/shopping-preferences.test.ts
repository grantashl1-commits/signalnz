import { beforeEach, expect, it } from 'vitest';
import { buildCustomShoppingPlan } from '../build-custom-shopping-plan';
import { getTodaySnacks } from '../today-meals';
import { DEFAULT_PREFS, savePreferences } from '../weekly-planner';

beforeEach(() => localStorage.clear());

it('shops for the same restricted snacks as Today when only household size is supplied', () => {
  savePreferences({ ...DEFAULT_PREFS, allergies: 'almond', adults: 2, kids: 0 });
  const plan = buildCustomShoppingPlan([1, 14, 15], {}, { adults: 3, kids: 0 });
  expect(plan.prepPreferences).toMatchObject({ allergies: 'almond', adults: 3 });
  for (const day of plan.days) {
    const today = getTodaySnacks(day.cycleDay);
    expect(day.morningSnack.ingredients).toEqual(today.morning.ingredients);
    expect(day.afternoonSnack.ingredients).toEqual(today.afternoon.ingredients);
    expect([...day.morningSnack.ingredients, ...day.afternoonSnack.ingredients].join(' ')).not.toMatch(/almond/i);
  }
});
