export type Phase = "menstrual" | "follicular" | "ovulatory" | "luteal";

export interface PhaseInfo {
  name: string;
  phase: Phase;
  day: number;
  cycleDay: number;
}

export const PHASE_COLORS: Record<Phase, string> = {
  menstrual: "phase-menstrual",
  follicular: "phase-follicular",
  ovulatory: "phase-ovulatory",
  luteal: "phase-luteal",
};

export const PHASE_COLORS_LIGHT: Record<Phase, string> = {
  menstrual: "phase-menstrual-light",
  follicular: "phase-follicular-light",
  ovulatory: "phase-ovulatory-light",
  luteal: "phase-luteal-light",
};

export const PHASE_LABELS: Record<Phase, string> = {
  menstrual: "Menstrual Phase",
  follicular: "Follicular Phase",
  ovulatory: "Ovulatory Phase",
  luteal: "Luteal Phase",
};

export const PHASE_SHORT: Record<Phase, string> = {
  menstrual: "Menstrual",
  follicular: "Follicular",
  ovulatory: "Ovulatory",
  luteal: "Luteal",
};

export const PHASE_DAYS: Record<Phase, [number, number]> = {
  menstrual: [1, 5],
  follicular: [6, 13],
  ovulatory: [14, 14],
  luteal: [15, 28],
};

export function getPhaseFromDay(cycleDay: number): Phase {
  if (cycleDay >= 1 && cycleDay <= 5) return "menstrual";
  if (cycleDay >= 6 && cycleDay <= 13) return "follicular";
  if (cycleDay === 14) return "ovulatory";
  return "luteal";
}

export function getWeekNumber(cycleDay: number): number {
  return Math.ceil(cycleDay / 7);
}

export function getCycleInfo(lastPeriodStart: string | null): PhaseInfo {
  if (!lastPeriodStart) {
    return { name: "Follicular Phase", phase: "follicular", day: 3, cycleDay: 8 };
  }
  const start = new Date(lastPeriodStart);
  const today = new Date();
  const diffTime = today.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  const cycleDay = ((diffDays - 1) % 28) + 1;
  const phase = getPhaseFromDay(cycleDay);
  const phaseStartDay = phase === "menstrual" ? 1 : phase === "follicular" ? 6 : phase === "ovulatory" ? 14 : 15;
  const dayInPhase = cycleDay - phaseStartDay + 1;

  return {
    name: PHASE_LABELS[phase],
    phase,
    day: dayInPhase,
    cycleDay,
  };
}

export function getCycleDayForDate(lastPeriodStart: string, date: Date): number {
  const start = new Date(lastPeriodStart);
  const diffTime = date.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return ((diffDays - 1) % 28) + 1;
}

export function getNextPhase(currentPhase: Phase): { phase: Phase; daysUntil: number; name: string } {
  const order: Phase[] = ["menstrual", "follicular", "ovulatory", "luteal"];
  const idx = order.indexOf(currentPhase);
  const nextPhase = order[(idx + 1) % 4];
  return { phase: nextPhase, daysUntil: 0, name: PHASE_LABELS[nextPhase] };
}

export function getDaysUntilNextPhase(cycleDay: number, currentPhase: Phase): number {
  const phaseEnds: Record<Phase, number> = { menstrual: 5, follicular: 13, ovulatory: 14, luteal: 28 };
  return phaseEnds[currentPhase] - cycleDay + 1;
}

// ─── Cycle Start Date (primary source of truth) ────────────
export function getLastPeriodStart(): string | null {
  // Check new key first, fallback to legacy
  return localStorage.getItem("cycleStartDate") || localStorage.getItem("mindcast_last_period");
}

export function setLastPeriodStart(date: string): void {
  localStorage.setItem("cycleStartDate", date);
  localStorage.setItem("mindcast_last_period", date); // backward compat
}

// ─── Period End ────────────────────────────────────────────
export function getPeriodEnd(monthKey: string): string | null {
  return localStorage.getItem(`periodEnd:${monthKey}`);
}

export function setPeriodEnd(monthKey: string, date: string): void {
  localStorage.setItem(`periodEnd:${monthKey}`, date);
}

export function getPeriodLength(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

// ─── Daily Check-in ────────────────────────────────────────
export function getCheckin(): string | null {
  const today = new Date().toISOString().split("T")[0];
  return localStorage.getItem(`mindcast_checkin_${today}`);
}

export function setCheckin(feeling: string): void {
  const today = new Date().toISOString().split("T")[0];
  localStorage.setItem(`mindcast_checkin_${today}`, feeling);
}

export function getCheckinStreak(): number {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 90; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    if (localStorage.getItem(`mindcast_checkin_${key}`)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

// ─── Water ─────────────────────────────────────────────────
export function getWaterCount(): number {
  const today = new Date().toISOString().split("T")[0];
  return parseInt(localStorage.getItem(`mindcast_water_${today}`) || "0", 10);
}

export function setWaterCount(count: number): void {
  const today = new Date().toISOString().split("T")[0];
  localStorage.setItem(`mindcast_water_${today}`, count.toString());
}

// ─── Seed Cycling ──────────────────────────────────────────
export function getSeedCyclingDay(cycleDay: number): { seeds: string; phase: string } {
  if (cycleDay <= 14) {
    return { seeds: "Pumpkin + Flaxseeds", phase: "Days 1–14" };
  }
  return { seeds: "Sunflower + Sesame seeds", phase: "Days 15–28" };
}

export function getSeedsTaken(date: string): boolean {
  return localStorage.getItem(`seedCycling:${date}`) === "true" || localStorage.getItem(`mindcast_seeds_${date}`) === "true";
}

export function setSeedsTaken(date: string, taken: boolean): void {
  localStorage.setItem(`seedCycling:${date}`, taken.toString());
  localStorage.setItem(`mindcast_seeds_${date}`, taken.toString());
}

// ─── Weight ────────────────────────────────────────────────
export function getWeight(date: string): number | null {
  const val = localStorage.getItem(`weight:${date}`);
  return val ? parseFloat(val) : null;
}

export function setWeight(date: string, kg: number): void {
  localStorage.setItem(`weight:${date}`, kg.toString());
}

export function getWeightUnit(): "kg" | "lbs" {
  return (localStorage.getItem("weightUnit") as "kg" | "lbs") || "kg";
}

export function setWeightUnit(unit: "kg" | "lbs"): void {
  localStorage.setItem("weightUnit", unit);
}

export function getWeightHistory(days: number = 7): { date: string; value: number }[] {
  const results: { date: string; value: number }[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const w = getWeight(dateStr);
    if (w !== null) results.push({ date: dateStr, value: w });
  }
  return results;
}

// ─── Mood ──────────────────────────────────────────────────
export function getMoods(date: string): string[] {
  const val = localStorage.getItem(`mood:${date}`);
  return val ? JSON.parse(val) : [];
}

export function setMoods(date: string, moods: string[]): void {
  localStorage.setItem(`mood:${date}`, JSON.stringify(moods));
}

// ─── Symptoms (new format) ─────────────────────────────────
export function getSymptomsNew(date: string): string[] {
  const val = localStorage.getItem(`symptoms:${date}`);
  return val ? JSON.parse(val) : [];
}

export function setSymptomsNew(date: string, symptoms: string[]): void {
  localStorage.setItem(`symptoms:${date}`, JSON.stringify(symptoms));
}

// ─── Notes ─────────────────────────────────────────────────
export function getNotes(date: string): string {
  return localStorage.getItem(`notes:${date}`) || "";
}

export function setNotes(date: string, text: string): void {
  localStorage.setItem(`notes:${date}`, text);
}

// ─── Legacy symptom logging (backward compat) ──────────────
export function logSymptom(date: string, symptoms: Record<string, any>): void {
  const key = `mindcast_symptoms_${date}`;
  const existing = JSON.parse(localStorage.getItem(key) || "{}");
  localStorage.setItem(key, JSON.stringify({ ...existing, ...symptoms }));
}

export function getSymptoms(date: string): Record<string, any> {
  return JSON.parse(localStorage.getItem(`mindcast_symptoms_${date}`) || "{}");
}

// ─── Workouts ──────────────────────────────────────────────
export function logWorkout(date: string, workoutId: string): void {
  const key = `mindcast_workouts_${date}`;
  const existing = JSON.parse(localStorage.getItem(key) || "[]");
  if (!existing.includes(workoutId)) existing.push(workoutId);
  localStorage.setItem(key, JSON.stringify(existing));
}

export function getLoggedWorkouts(date: string): string[] {
  return JSON.parse(localStorage.getItem(`mindcast_workouts_${date}`) || "[]");
}

// ─── Daily Signal (cached AI response) ─────────────────────
export function getDailySignal(date: string): string | null {
  return localStorage.getItem(`dailySignal:${date}`);
}

export function setDailySignal(date: string, signal: string): void {
  localStorage.setItem(`dailySignal:${date}`, signal);
}

// ─── Recent Data Helpers ───────────────────────────────────
export function getRecentSymptoms(days: number = 3): { date: string; symptoms: string[] }[] {
  const results: { date: string; symptoms: string[] }[] = [];
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const symptoms = getSymptomsNew(dateStr);
    if (symptoms.length > 0) results.push({ date: dateStr, symptoms });
  }
  return results;
}

export function getRecentMoods(days: number = 2): { date: string; moods: string[] }[] {
  const results: { date: string; moods: string[] }[] = [];
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const moods = getMoods(dateStr);
    if (moods.length > 0) results.push({ date: dateStr, moods });
  }
  return results;
}

// ─── Calendar Summary Helpers ──────────────────────────────
export function getMonthLogSummary(year: number, month: number): { periodDays: number; symptomsLogged: number; moodsLogged: number } {
  let periodDays = 0;
  let symptomsLogged = 0;
  let moodsLogged = 0;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const lastPeriod = getLastPeriodStart();

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const dateStr = date.toISOString().split("T")[0];
    if (lastPeriod) {
      const cycleDay = getCycleDayForDate(lastPeriod, date);
      if (cycleDay >= 1 && cycleDay <= 5) periodDays++;
    }
    if (getSymptomsNew(dateStr).length > 0) symptomsLogged++;
    if (getMoods(dateStr).length > 0) moodsLogged++;
  }

  return { periodDays, symptomsLogged, moodsLogged };
}

// ─── Day Indicators ────────────────────────────────────────
export function getDayIndicators(dateStr: string, lastPeriod: string | null): {
  hasMood: boolean; hasSymptoms: boolean; hasWeight: boolean;
  hasNotes: boolean; hasSeeds: boolean; isPeriodDay: boolean;
} {
  const date = new Date(dateStr + "T12:00:00");
  let isPeriodDay = false;
  if (lastPeriod) {
    const cycleDay = getCycleDayForDate(lastPeriod, date);
    isPeriodDay = cycleDay >= 1 && cycleDay <= 5;
  }

  return {
    hasMood: getMoods(dateStr).length > 0,
    hasSymptoms: getSymptomsNew(dateStr).length > 0,
    hasWeight: getWeight(dateStr) !== null,
    hasNotes: getNotes(dateStr).length > 0,
    hasSeeds: getSeedsTaken(dateStr),
    isPeriodDay,
  };
}

// ─── Cycle History for month-on-month ──────────────────────
export function archiveCycle(monthKey: string, data: Record<string, any>): void {
  localStorage.setItem(`cycleHistory:${monthKey}`, JSON.stringify(data));
}

export function getCycleHistory(monthKey: string): Record<string, any> | null {
  const val = localStorage.getItem(`cycleHistory:${monthKey}`);
  return val ? JSON.parse(val) : null;
}

// ─── Symptom Frequency for Current Cycle ───────────────────
export function getSymptomFrequency(): Record<string, number> {
  const lastPeriod = getLastPeriodStart();
  if (!lastPeriod) return {};

  const freq: Record<string, number> = {};
  const start = new Date(lastPeriod);
  const today = new Date();

  for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0];
    const symptoms = getSymptomsNew(dateStr);
    symptoms.forEach((s) => {
      freq[s] = (freq[s] || 0) + 1;
    });
  }

  return freq;
}

// ─── Mood Frequency by Phase ───────────────────────────────
export function getMoodsByPhase(): Record<Phase, Record<string, number>> {
  const lastPeriod = getLastPeriodStart();
  if (!lastPeriod) return { menstrual: {}, follicular: {}, ovulatory: {}, luteal: {} };

  const result: Record<Phase, Record<string, number>> = {
    menstrual: {}, follicular: {}, ovulatory: {}, luteal: {},
  };

  const start = new Date(lastPeriod);
  const today = new Date();

  for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0];
    const moods = getMoods(dateStr);
    const cycleDay = getCycleDayForDate(lastPeriod, d);
    const phase = getPhaseFromDay(cycleDay);

    moods.forEach((m) => {
      result[phase][m] = (result[phase][m] || 0) + 1;
    });
  }

  return result;
}
