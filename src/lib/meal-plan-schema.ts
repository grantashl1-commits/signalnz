import { z } from 'zod';
import type { AIMealPlan } from './weekly-planner';

const phase = z.enum(['menstrual', 'follicular', 'ovulatory', 'luteal']);
const meal = z.object({
  name: z.string().min(1),
  ingredients: z.array(z.string()).min(1),
  method: z.array(z.string()).min(1),
  serves: z.coerce.number().positive().finite().default(1),
  prepTime: z.string().default(''),
  nutritionalNote: z.string().default(''),
}).passthrough();
const prefs = z.object({
  breakfast: z.enum(['batch', 'rotate', 'variety']).default('rotate'),
  lunch: z.enum(['batch', 'rotate', 'variety']).default('rotate'),
  dinner: z.enum(['double', 'fresh', 'mix']).default('mix'),
  prepDays: z.array(z.string()).default([]),
  adults: z.number().int().min(1).max(20).default(1),
  kids: z.number().int().min(0).max(20).default(0),
}).passthrough();
const emptySnack = (p: string) => ({ name: 'No snack planned', phase: p, mealType: 'snack', prepTime: '', serves: 1, ingredients: [], method: [], nutritionalNote: '' });
const phaseForDay = (day: number) => day <= 5 ? 'menstrual' : day <= 13 ? 'follicular' : day === 14 ? 'ovulatory' : 'luteal';

/** Validate at every persistence boundary, including the old onboarding envelope. */
export function normaliseMealPlan(input: unknown): AIMealPlan | null {
  if (!input || typeof input !== 'object') return null;
  const source = input as Record<string, unknown>;
  const rawDays = source.days ?? source.plan;
  if (!Array.isArray(rawDays) || !rawDays.length) return null;
  const preferences = prefs.safeParse(source.prepPreferences ?? {});
  if (!preferences.success) return null;
  const seen = new Set<number>();
  const days = [];
  for (const raw of rawDays) {
    if (!raw || typeof raw !== 'object') return null;
    const cd = raw.cycleDay;
    if (!Number.isInteger(cd) || cd < 1 || cd > 28 || seen.has(cd)) return null;
    seen.add(cd);
    const p = phase.safeParse(raw.phase ?? phaseForDay(cd));
    if (!p.success) return null;
    const day: Record<string, unknown> = { ...raw, cycleDay: cd, phase: p.data };
    for (const slot of ['breakfast', 'lunch', 'dinner', 'morningSnack', 'afternoonSnack'] as const) {
      const snack = slot.endsWith('Snack');
      if (snack && (!raw[slot] || (raw[slot].ingredients?.length === 0 && raw[slot].method?.length === 0))) {
        day[slot] = emptySnack(p.data);
        continue;
      }
      const parsed = meal.safeParse(raw[slot]);
      if (!parsed.success) return null;
      day[slot] = { ...parsed.data, phase: p.data, mealType: snack ? 'snack' : slot };
    }
    for (const slot of ['kidsLunch', 'kidsDinner'] as const) {
      if (!raw[slot]) continue;
      const parsed = meal.safeParse(raw[slot]);
      if (!parsed.success) return null;
      day[slot] = parsed.data;
    }
    days.push(day);
  }
  const created = typeof source.createdAt === 'number' ? source.createdAt : Date.parse(String(source.generatedAt ?? ''));
  const locks = z.record(z.boolean()).safeParse(source.lockedMeals ?? {});
  return {
    ...source, days, prepPreferences: preferences.data,
    createdAt: Number.isFinite(created) ? created : 0,
    lockedMeals: locks.success ? locks.data : {},
  } as unknown as AIMealPlan;
}
