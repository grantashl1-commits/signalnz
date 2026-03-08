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

export function getNextPhase(currentPhase: Phase): { phase: Phase; daysUntil: number; name: string } {
  const order: Phase[] = ["menstrual", "follicular", "ovulatory", "luteal"];
  const idx = order.indexOf(currentPhase);
  const nextPhase = order[(idx + 1) % 4];
  const phaseEnds: Record<Phase, number> = { menstrual: 5, follicular: 13, ovulatory: 16, luteal: 28 };
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
