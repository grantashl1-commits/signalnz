import { useMemo, useState } from 'react';
import { addDays, startOfWeek, format } from 'date-fns';
import { useCycle } from '@/contexts/CycleContext';
import { useCustomMealPlan } from '@/hooks/useCustomMealPlan';
import { getAIMealPlan, getHousehold, saveHousehold } from '@/lib/weekly-planner';
import { buildCustomShoppingPlan } from '@/lib/build-custom-shopping-plan';
import { toLocalDateStr } from '@/lib/local-date';
import { getShoppingList } from '@/lib/ingredient-parser';
import SmartShoppingList from './SmartShoppingList';
import { ShoppingListPanel } from '@/components/ShoppingList';
export default function WeekShoppingList() {
 const { currentCycleDay, getCycleDayForDate } = useCycle();
 const { plan: customPlan } = useCustomMealPlan();
 const [offset, setOffset] = useState(0);
 const [portions, setPortions] = useState(getHousehold);
 const monday = useMemo(() => addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), offset * 7), [offset]);
 const plan = useMemo(() => { const dates = Array.from({ length: 7 }, (_, i) => addDays(monday, i)); return buildCustomShoppingPlan(dates.map(getCycleDayForDate), customPlan, portions, getAIMealPlan(), dates.map(toLocalDateStr)); }, [customPlan, portions, monday, getCycleDayForDate]);
 function changePortions(field: 'adults' | 'kids', value: number) { if (!Number.isFinite(value)) return; const next = { ...portions, [field]: Math.max(field === 'adults' ? 1 : 0, Math.min(20, Math.round(value))) }; setPortions(next); saveHousehold(next); }
 return <div className="space-y-6">
  <div className="card-warm p-4 space-y-4"><div className="flex items-center justify-between gap-3"><button aria-label="Previous shopping week" onClick={() => setOffset(n => n - 1)} className="touch-btn p-3">←</button><p className="text-sm">{format(monday, 'd MMM')} – {format(addDays(monday, 6), 'd MMM')}</p><button aria-label="Next shopping week" onClick={() => setOffset(n => n + 1)} className="touch-btn p-3">→</button></div>
   <div className="flex gap-4">{(['adults', 'kids'] as const).map(field => <label key={field} className="text-sm capitalize">{field}<input type="number" min={field === 'adults' ? 1 : 0} max={20} value={portions[field]} onChange={e => changePortions(field, Number(e.target.value))} className="block w-24 border rounded-xl p-2 bg-background mt-1" /></label>)}</div><p className="text-xs text-muted-foreground">Quantities use recipe servings. Each child counts as 0.6 of an adult portion; adjust for your household.</p>
  </div>
  <SmartShoppingList key={toLocalDateStr(monday)} plan={plan} weekNumber={Math.ceil(currentCycleDay / 7)} allPlanDays weekStart={monday} />
  {getShoppingList().length > 0 && <div className="space-y-2"><p className="eyebrow text-muted-foreground">Added separately from recipes</p><ShoppingListPanel /></div>}
 </div>;
}
