import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from "react";

// ─── Types ─────────────────────────────────────────────────
export type Phase = "menstrual" | "follicular" | "ovulatory" | "luteal";

export interface CycleState {
  cycleStartDate: string | null;
  currentCycleDay: number;
  currentWeekNumber: number;
  currentPhase: Phase;
  /** Set / update the cycle start date (persists to localStorage) */
  setCycleStartDate: (date: string) => void;
  /** Which cycle day does an arbitrary calendar date fall on? */
  getCycleDayForDate: (date: Date) => number;
  /** Which calendar date does a given cycle day map to? */
  getCalendarDateForCycleDay: (cycleDay: number) => Date | null;
  /** Force re-read from localStorage (e.g. after CalendarDaySheet edits) */
  refresh: () => void;
}

// ─── Pure helpers (no side-effects) ────────────────────────
function getPhaseFromDay(cycleDay: number): Phase {
  if (cycleDay >= 1 && cycleDay <= 5) return "menstrual";
  if (cycleDay >= 6 && cycleDay <= 13) return "follicular";
  if (cycleDay === 14) return "ovulatory";
  return "luteal"; // 15-28
}

function computeCycleDay(startDate: string): number {
  const start = new Date(startDate);
  const today = new Date();
  const diffMs = today.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
  return ((diffDays - 1) % 28) + 1;
}

function computeCycleDayForDate(startDate: string, date: Date): number {
  const start = new Date(startDate);
  const diffMs = date.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
  return ((diffDays - 1) % 28) + 1;
}

function computeWeekNumber(cycleDay: number): number {
  return Math.ceil(cycleDay / 7); // 1-7→1, 8-14→2, 15-21→3, 22-28→4
}

// ─── localStorage keys (shared with legacy cycle-utils) ───
const LS_KEY = "cycleStartDate";
const LS_KEY_LEGACY = "mindcast_last_period";

function readStartDate(): string | null {
  return localStorage.getItem(LS_KEY) || localStorage.getItem(LS_KEY_LEGACY);
}

function writeStartDate(date: string): void {
  localStorage.setItem(LS_KEY, date);
  localStorage.setItem(LS_KEY_LEGACY, date); // backward compat
}

// ─── Default fallback values (no period logged) ────────────
const DEFAULT_CYCLE_DAY = 8;
const DEFAULT_PHASE: Phase = "follicular";
const DEFAULT_WEEK = 2;

// ─── Context ───────────────────────────────────────────────
const CycleContext = createContext<CycleState | null>(null);

export function CycleProvider({ children }: { children: ReactNode }) {
  const [startDate, setStartDate] = useState<string | null>(readStartDate);

  // Trigger to force dependents to re-derive
  const [, setTick] = useState(0);

  const setCycleStartDate = useCallback((date: string) => {
    writeStartDate(date);
    setStartDate(date);
  }, []);

  const refresh = useCallback(() => {
    const fresh = readStartDate();
    setStartDate(fresh);
    setTick((t) => t + 1);
  }, []);

  const currentCycleDay = useMemo(
    () => (startDate ? computeCycleDay(startDate) : DEFAULT_CYCLE_DAY),
    [startDate],
  );

  const currentPhase = useMemo(() => getPhaseFromDay(currentCycleDay), [currentCycleDay]);
  const currentWeekNumber = useMemo(() => computeWeekNumber(currentCycleDay), [currentCycleDay]);

  const getCycleDayForDate = useCallback(
    (date: Date) => {
      if (!startDate) return DEFAULT_CYCLE_DAY;
      return computeCycleDayForDate(startDate, date);
    },
    [startDate],
  );

  const getCalendarDateForCycleDay = useCallback(
    (cycleDay: number): Date | null => {
      if (!startDate) return null;
      const start = new Date(startDate);
      const offset = cycleDay - 1; // cycle day 1 = start date
      const result = new Date(start);
      result.setDate(result.getDate() + offset);
      return result;
    },
    [startDate],
  );

  const value = useMemo<CycleState>(
    () => ({
      cycleStartDate: startDate,
      currentCycleDay,
      currentWeekNumber,
      currentPhase,
      setCycleStartDate,
      getCycleDayForDate,
      getCalendarDateForCycleDay,
      refresh,
    }),
    [startDate, currentCycleDay, currentWeekNumber, currentPhase, setCycleStartDate, getCycleDayForDate, getCalendarDateForCycleDay, refresh],
  );

  return <CycleContext.Provider value={value}>{children}</CycleContext.Provider>;
}

/**
 * Central hook every feature should use for cycle state.
 * Must be rendered inside <CycleProvider>.
 */
export function useCycle(): CycleState {
  const ctx = useContext(CycleContext);
  if (!ctx) throw new Error("useCycle must be used within <CycleProvider>");
  return ctx;
}
