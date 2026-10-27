/** Count every planned serving, including the extra portions eaten as leftovers. */
type Meal = { ingredients: string[]; serves?: number };
export type ShoppingDay = Partial<Record<'breakfast'|'lunch'|'dinner'|'morningSnack'|'afternoonSnack'|'kidsLunch'|'kidsDinner', Meal | null>>;
export function shoppingMeals(days: ShoppingDay[], household: {adults: number; kids: number}) {
 return days.flatMap(day => {
  const meals: Array<Meal & {servingsNeeded: number}> = [];
  for (const slot of ['breakfast','lunch','dinner','morningSnack','afternoonSnack'] as const) {
   const meal = day[slot];
   const kidsMeal = slot === 'lunch' ? day.kidsLunch : slot === 'dinner' ? day.kidsDinner : null;
   if (meal) meals.push({...meal, servingsNeeded: household.adults + (kidsMeal ? 0 : household.kids * 0.6)});
   if (kidsMeal && household.kids > 0) meals.push({...kidsMeal, servingsNeeded: household.kids});
  }
  return meals;
 });
}
