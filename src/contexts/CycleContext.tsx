import { createContext, useContext, useState, useCallback, useMemo, useEffect, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

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

/**
 * Normalise a date string like "2025-03-01" to LOCAL midnight
 * to avoid the UTC-parsing pitfall of `new Date("YYYY-MM-DD")`.
 */
function localMidnight(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function todayLocalStr(): string {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
}

function computeCycleDay(startDate: string): number {
  const start = localMidnight(startDate);
  const today = localMidnight(todayLocalStr());
  const diffDays = Math.round((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return ((diffDays - 1) % 28) + 1;
}

function computeCycleDayForDate(startDate: string, date: Date): number {
  const start = localMidnight(startDate);
  // Normalise the target date to local midnight too
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((target.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
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
  // Track today's date string so cycle day updates if app stays open across midnight
  const [todayStr, setTodayStr] = useState(todayLocalStr);

  // Trigger to force dependents to re-derive
  const [, setTick] = useState(0);

  // Check for date rollover every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const now = todayLocalStr();
      setTodayStr((prev) => (prev !== now ? now : prev));
    }, 30_000);
    return () => clearInterval(interval);
  }, []);

  // Sync cycle start date with Supabase profiles on auth state change
  useEffect(() => {
    const syncFromProfile = async (userId: string) => {
      const local = readStartDate();
      const { data } = await supabase
        .from("profiles")
        .select("last_period_date")
        .eq("user_id", userId)
        .maybeSingle();
      const cloudDate = (data as any)?.last_period_date as string | null;
      if (cloudDate && !local) {
        writeStartDate(cloudDate);
        setStartDate(cloudDate);
      }
    };

    // Check current session immediately
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) syncFromProfile(user.id);
    });

    // Also sync on future sign-ins
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) syncFromProfile(session.user.id);
    });
    return () => subscription.unsubscribe();
  }, []);

  const setCycleStartDate = useCallback((date: string) => {
    writeStartDate(date);
    setStartDate(date);
    // Fire-and-forget save to Supabase profiles
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase
          .from("profiles")
          .upsert({ user_id: user.id, last_period_date: date } as any, { onConflict: "user_id" })
          .then(() => {}, () => {});
      }
    });
  }, []);

  const refresh = useCallback(() => {
    const fresh = readStartDate();
    setStartDate(fresh);
    setTodayStr(todayLocalStr());
    setTick((t) => t + 1);
  }, []);

  const currentCycleDay = useMemo(
    () => (startDate ? computeCycleDay(startDate) : DEFAULT_CYCLE_DAY),
    [startDate, todayStr],
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
