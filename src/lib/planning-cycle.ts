const civilDay = (date: Date) => Date.UTC(date.getFullYear(),date.getMonth(),date.getDate()) / 86400000;
export function validCycleLength(value: unknown): number {
 const n = Number(value); return Number.isInteger(n) && n >= 15 && n <= 90 ? n : 28;
}
export function cyclePosition(start: string, date: Date, length = 28): number {
 const [year,month,day] = start.split('-').map(Number);
 const origin = new Date(year,month-1,day);
 const diff = civilDay(date)-civilDay(origin);
 return ((diff % length)+length)%length+1;
}
/** The library has 28 plan slots; a member's cycle length may differ. */
export function planningDay(start: string | null, date: Date, length = 28, tracking = true): number {
 if (!tracking || !start || !/^\d{4}-\d{2}-\d{2}$/.test(start)) return cyclePosition('2020-01-06',date,28);
 const actual = cyclePosition(start,date,validCycleLength(length));
 return Math.floor((actual-1)*28/validCycleLength(length))+1;
}
