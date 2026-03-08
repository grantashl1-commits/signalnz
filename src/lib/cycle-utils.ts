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
  ovulatory: [14, 16],
  luteal: [17, 28],
};

export function getPhaseFromDay(cycleDay: number): Phase {
  if (cycleDay >= 1 && cycleDay <= 5) return "menstrual";
  if (cycleDay >= 6 && cycleDay <= 13) return "follicular";
  if (cycleDay >= 14 && cycleDay <= 16) return "ovulatory";
  return "luteal";
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
  const phaseStartDay = phase === "menstrual" ? 1 : phase === "follicular" ? 6 : phase === "ovulatory" ? 14 : 17;
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
  const phaseEnds: Record<Phase, number> = { menstrual: 5, follicular: 13, ovulatory: 16, luteal: 28 };
  return phaseEnds[currentPhase] - cycleDay + 1;
}

export function getLastPeriodStart(): string | null {
  return localStorage.getItem("mindcast_last_period");
}

export function setLastPeriodStart(date: string): void {
  localStorage.setItem("mindcast_last_period", date);
}

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

export function getWaterCount(): number {
  const today = new Date().toISOString().split("T")[0];
  return parseInt(localStorage.getItem(`mindcast_water_${today}`) || "0", 10);
}

export function setWaterCount(count: number): void {
  const today = new Date().toISOString().split("T")[0];
  localStorage.setItem(`mindcast_water_${today}`, count.toString());
}

export function getSeedCyclingDay(cycleDay: number): { seeds: string; phase: string } {
  if (cycleDay <= 14) {
    return { seeds: "Pumpkin + Flaxseeds", phase: "Days 1–14" };
  }
  return { seeds: "Sunflower + Sesame seeds", phase: "Days 15–28" };
}

export function logSymptom(date: string, symptoms: Record<string, any>): void {
  const key = `mindcast_symptoms_${date}`;
  const existing = JSON.parse(localStorage.getItem(key) || "{}");
  localStorage.setItem(key, JSON.stringify({ ...existing, ...symptoms }));
}

export function getSymptoms(date: string): Record<string, any> {
  return JSON.parse(localStorage.getItem(`mindcast_symptoms_${date}`) || "{}");
}

export function logWorkout(date: string, workoutId: string): void {
  const key = `mindcast_workouts_${date}`;
  const existing = JSON.parse(localStorage.getItem(key) || "[]");
  if (!existing.includes(workoutId)) existing.push(workoutId);
  localStorage.setItem(key, JSON.stringify(existing));
}

export function getLoggedWorkouts(date: string): string[] {
  return JSON.parse(localStorage.getItem(`mindcast_workouts_${date}`) || "[]");
}

export function getSeedsTaken(date: string): boolean {
  return localStorage.getItem(`mindcast_seeds_${date}`) === "true";
}

export function setSeedsTaken(date: string, taken: boolean): void {
  localStorage.setItem(`mindcast_seeds_${date}`, taken.toString());
}
