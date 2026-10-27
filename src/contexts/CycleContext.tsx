import { planningDay, cyclePosition, validCycleLength } from "@/lib/planning-cycle";
import { captureDeviceScope } from "@/lib/device-privacy";
import { useAuth } from "@/contexts/AuthContext";
import { createContext, useContext, useState, useCallback, useMemo, useEffect, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logPeriodStart, pullPeriodHistory, PERIOD_HISTORY_EVENT } from "@/lib/period-history";

// ─── Types ─────────────────────────────────────────────────
export type Phase = "menstrual" | "follicular" | "ovulatory" | "luteal";

export interface CycleState {
  cycleLength: number;
  actualCycleDay: number | null;
  isCycleTrackingEnabled: boolean;
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

// ─── Default fallback values (no period logged) ────────────
const DEFAULT_CYCLE_DAY = 8;
const DEFAULT_PHASE: Phase = "follicular";
const DEFAULT_WEEK = 2;

// ─── Context ───────────────────────────────────────────────
const CycleContext = createContext<CycleState | null>(null);

export function CycleProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cycleLength,setCycleLength] = useState(() => validCycleLength(localStorage.getItem("signal_cycle_length")));
  const [cycleMode,setCycleMode] = useState(() => localStorage.getItem("cycleMode") || localStorage.getItem("signal_cycle_mode") || "cycling");
  const tracking = ["cycling", "regular", "irregular"].includes(cycleMode);
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
    const scope = captureDeviceScope();
    let cancelled = false;
    const syncFromProfile = async (userId: string) => {
      // Full period history first (every past month), then the legacy single date.
      await pullPeriodHistory(userId);
      if (cancelled || !scope.matches(userId)) return;
      const local = readStartDate();
      if (local) setStartDate(local);
      const { data } = await supabase
        .from("profiles")
        .select("last_period_date, cycle_length, cycle_mode")
        .eq("user_id", userId)
        .maybeSingle();
      if (cancelled || !scope.matches(userId)) return;
      if (data) {
        const length = validCycleLength(data.cycle_length);
        setCycleLength(length);
        localStorage.setItem("signal_cycle_length", String(length));
        setCycleMode(data.cycle_mode || "cycling");
        localStorage.setItem("cycleMode", data.cycle_mode || "cycling");
      }
      const cloudDate = (data as any)?.last_period_date as string | null;
      if (cloudDate && !local) {
        logPeriodStart(cloudDate);
        setStartDate(cloudDate);
      }
    };

    if (user) void syncFromProfile(user.id);
    return () => { cancelled = true; };
  }, [user?.id]);

  const setCycleStartDate = useCallback((date: string) => {
    // Adds to the period history (local + Supabase cycle_logs/profile) instead
    // of overwriting — previous months are kept.
    logPeriodStart(date);
    setStartDate(readStartDate());
  }, []);

  // Any period logged elsewhere (calendar day sheet, onboarding) updates the cycle.
  useEffect(() => {
    const onChange = () => setStartDate(readStartDate());
    window.addEventListener(PERIOD_HISTORY_EVENT, onChange);
    return () => window.removeEventListener(PERIOD_HISTORY_EVENT, onChange);
  }, []);

  const refresh = useCallback(() => {
    const fresh = readStartDate();
    setStartDate(fresh);
    setTodayStr(todayLocalStr());
    setCycleMode(localStorage.getItem("cycleMode") || localStorage.getItem("signal_cycle_mode") || "cycling");
    setTick((t) => t + 1);
  }, []);

  const currentCycleDay = useMemo(
    () => planningDay(startDate, new Date(), cycleLength, tracking),
    [startDate, todayStr, cycleLength, tracking],
  );

  const currentPhase = useMemo(() => getPhaseFromDay(currentCycleDay), [currentCycleDay]);
  const currentWeekNumber = useMemo(() => computeWeekNumber(currentCycleDay), [currentCycleDay]);

  const getCycleDayForDate = useCallback(
    (date: Date) => {
      return planningDay(startDate, date, cycleLength, tracking);
    },
    [startDate, cycleLength, tracking],
  );

  const getCalendarDateForCycleDay = useCallback(
    (cycleDay: number): Date | null => {
      if (!startDate) return null;
      const start = localMidnight(startDate);
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
      cycleLength, isCycleTrackingEnabled: tracking && !!startDate,
      actualCycleDay: tracking && startDate ? cyclePosition(startDate,new Date(),cycleLength) : null,
      currentCycleDay,
      currentWeekNumber,
      currentPhase,
      setCycleStartDate,
      getCycleDayForDate,
      getCalendarDateForCycleDay,
      refresh,
    }),
    [startDate, cycleLength, tracking, currentCycleDay, currentWeekNumber, currentPhase, setCycleStartDate, getCycleDayForDate, getCalendarDateForCycleDay, refresh],
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
