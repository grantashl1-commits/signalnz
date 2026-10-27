import { captureDeviceScope } from "./device-privacy";
/**
 * Period history — every logged period, kept month after month.
 *
 * Before this, the app stored a single "last period" date, so logging a new
 * period erased the previous one. Now each period is an entry in a local
 * history (instant, offline-friendly) mirrored to Supabase `cycle_logs`
 * (period_start rows, plus a `period_end` note row for the end date) so it
 * follows the member across devices.
 *
 * The latest start still drives the app-wide cycle day via CycleContext.
 */
import { supabase } from "@/integrations/supabase/client";

export interface PeriodEntry {
  /** First day of bleeding, YYYY-MM-DD (local). */
  start: string;
  /** Last day of bleeding, YYYY-MM-DD (local), if logged. */
  end?: string;
}

const KEY = "signal_period_history_v1";
const START_KEY = "cycleStartDate";
const START_KEY_LEGACY = "mindcast_last_period";
export const PERIOD_HISTORY_EVENT = "signal:period-history-changed";

/** Entries closer together than this are treated as the same period (an edit). */
const SAME_PERIOD_DAYS = 10;
const DEFAULT_PERIOD_DAYS = 5;
const DEFAULT_CYCLE_DAYS = 28;

/* ── Date helpers (local, no UTC drift) ─────────────────────────── */

export function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function fromDateStr(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}
export function daysBetween(a: string, b: string): number {
  return Math.round((fromDateStr(b).getTime() - fromDateStr(a).getTime()) / 86_400_000);
}
export function addDays(s: string, n: number): string {
  const d = fromDateStr(s);
  d.setDate(d.getDate() + n);
  return toDateStr(d);
}

/* ── Storage ────────────────────────────────────────────────────── */

function sortAndDedupe(list: PeriodEntry[]): PeriodEntry[] {
  const sorted = [...list].filter((p) => /^\d{4}-\d{2}-\d{2}$/.test(p.start)).sort((a, b) => a.start.localeCompare(b.start));
  const out: PeriodEntry[] = [];
  for (const p of sorted) {
    const prev = out[out.length - 1];
    if (prev && daysBetween(prev.start, p.start) < SAME_PERIOD_DAYS) {
      // Same period logged twice — keep the later edit, preserve any end date.
      out[out.length - 1] = { start: p.start, end: p.end ?? prev.end };
    } else {
      out.push({ ...p });
    }
  }
  // An end date must fall on/after its start and before the next start.
  return out.map((p, i) => {
    const next = out[i + 1];
    if (!p.end) return p;
    if (p.end < p.start || (next && p.end >= next.start)) return { start: p.start };
    return p;
  });
}

function readRaw(): PeriodEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as PeriodEntry[];
  } catch {
    /* fall through to migration */
  }
  // One-time migration from the single-date model.
  const legacy = localStorage.getItem(START_KEY) || localStorage.getItem(START_KEY_LEGACY);
  if (!legacy) return [];
  const end = localStorage.getItem(`periodEnd:${legacy.slice(0, 7)}`) || undefined;
  return [{ start: legacy, end: end && end >= legacy ? end : undefined }];
}

export function getPeriodHistory(): PeriodEntry[] {
  return sortAndDedupe(readRaw());
}

function save(list: PeriodEntry[]) {
  const clean = sortAndDedupe(list);
  try {
    localStorage.setItem(KEY, JSON.stringify(clean));
    const latest = clean[clean.length - 1];
    if (latest) {
      localStorage.setItem(START_KEY, latest.start);
      localStorage.setItem(START_KEY_LEGACY, latest.start);
    } else {
      localStorage.removeItem(START_KEY);
      localStorage.removeItem(START_KEY_LEGACY);
    }
  } catch {
    /* storage full / disabled */
  }
  if (typeof window !== "undefined") window.dispatchEvent(new Event(PERIOD_HISTORY_EVENT));
  return clean;
}

/* ── Mutations (local first, then cloud) ────────────────────────── */

export function logPeriodStart(date: string): PeriodEntry[] {
  const list = getPeriodHistory().filter((p) => Math.abs(daysBetween(p.start, date)) >= SAME_PERIOD_DAYS);
  const replaced = getPeriodHistory().find((p) => Math.abs(daysBetween(p.start, date)) < SAME_PERIOD_DAYS);
  const next = save([...list, { start: date, end: replaced?.end && replaced.end >= date ? replaced.end : undefined }]);
  void syncStart(date, replaced?.start);
  return next;
}

/** Mark the end of the period that contains (or most recently precedes) `date`. */
export function logPeriodEnd(date: string): PeriodEntry[] {
  const list = getPeriodHistory();
  let idx = -1;
  for (let i = list.length - 1; i >= 0; i--) {
    if (list[i].start <= date) { idx = i; break; }
  }
  if (idx === -1) return list;
  list[idx] = { ...list[idx], end: date };
  const next = save(list);
  void syncEnd(list[idx].start, date);
  return next;
}

export function removePeriod(start: string): PeriodEntry[] {
  const next = save(getPeriodHistory().filter((p) => p.start !== start));
  void syncRemove(start);
  return next;
}

/* ── Derived stats ──────────────────────────────────────────────── */

export interface CycleStats {
  periods: PeriodEntry[];
  /** Lengths between consecutive starts, oldest first. */
  cycleLengths: number[];
  avgCycleLength: number;
  avgPeriodLength: number;
  nextPredictedStart: string | null;
}

export function getCycleStats(list = getPeriodHistory()): CycleStats {
  const cycleLengths: number[] = [];
  for (let i = 1; i < list.length; i++) {
    const len = daysBetween(list[i - 1].start, list[i].start);
    if (len >= 15 && len <= 60) cycleLengths.push(len); // ignore missed logs / typos
  }
  const recent = cycleLengths.slice(-6);
  const avgCycleLength = recent.length ? Math.round(recent.reduce((a, b) => a + b, 0) / recent.length) : DEFAULT_CYCLE_DAYS;
  const periodLens = list.filter((p) => p.end).map((p) => daysBetween(p.start, p.end!) + 1).filter((n) => n >= 1 && n <= 12);
  const avgPeriodLength = periodLens.length ? Math.round(periodLens.reduce((a, b) => a + b, 0) / periodLens.length) : DEFAULT_PERIOD_DAYS;
  const latest = list[list.length - 1];
  return {
    periods: list,
    cycleLengths,
    avgCycleLength,
    avgPeriodLength,
    nextPredictedStart: latest ? addDays(latest.start, avgCycleLength) : null,
  };
}

export type PeriodDayKind = "period" | "predicted" | null;

/** Is this calendar day a logged period day, a predicted one, or neither? */
export function periodDayKind(dateStr: string, stats: CycleStats, today = toDateStr(new Date())): PeriodDayKind {
  for (const p of stats.periods) {
    const end = p.end ?? addDays(p.start, stats.avgPeriodLength - 1);
    if (dateStr >= p.start && dateStr <= end) return "period";
  }
  // Predict the next few cycles forward from the latest logged period.
  const latest = stats.periods[stats.periods.length - 1];
  if (!latest || dateStr <= today) return null;
  for (let k = 1; k <= 3; k++) {
    const s = addDays(latest.start, stats.avgCycleLength * k);
    const e = addDays(s, stats.avgPeriodLength - 1);
    if (dateStr >= s && dateStr <= e) return "predicted";
  }
  return null;
}

/* ── Cloud sync (Supabase cycle_logs, RLS: own rows) ────────────── */

async function userId(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getUser();
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}

async function syncStart(date: string, replacedStart?: string) {
  const scope = captureDeviceScope();
  const uid = await userId();
  if (!scope.matches(uid)) return;
  try {
    if (replacedStart && replacedStart !== date) await syncRemove(replacedStart);
    await supabase.from("cycle_logs").delete().eq("user_id", uid).eq("log_date", date).eq("period_start", true);
    await supabase.from("cycle_logs").insert({ user_id: uid, log_date: date, period_start: true, cycle_day: 1, phase: "menstrual" });
    if (!scope.matches(uid)) return;
    await supabase.from("profiles").upsert({ user_id: uid, last_period_date: getPeriodHistory().slice(-1)[0]?.start ?? date } as never, { onConflict: "user_id" });
  } catch {
    /* offline — local history is the source of truth until next sync */
  }
}

async function syncEnd(start: string, end: string) {
  const uid = await userId();
  if (!uid) return;
  try {
    await supabase.from("cycle_logs").delete().eq("user_id", uid).eq("notes", `period_end:${start}`);
    await supabase.from("cycle_logs").insert({ user_id: uid, log_date: end, period_start: false, phase: "menstrual", notes: `period_end:${start}` });
  } catch {
    /* offline */
  }
}

async function syncRemove(start: string) {
  const uid = await userId();
  if (!uid) return;
  try {
    await supabase.from("cycle_logs").delete().eq("user_id", uid).eq("log_date", start).eq("period_start", true);
    await supabase.from("cycle_logs").delete().eq("user_id", uid).eq("notes", `period_end:${start}`);
  } catch {
    /* offline */
  }
}

/** Merge the member's cloud history into the local one (called on sign-in). */
const inFlight = new Map<string, Promise<void>>();
export function pullPeriodHistory(uid: string): Promise<void> {
  // Auth fires several events on load; only sync once per member per session.
  let p = inFlight.get(uid);
  if (!p) {
    p = doPull(uid);
    inFlight.set(uid, p);
    void p.finally(() => inFlight.delete(uid));
  }
  return p;
}

async function doPull(uid: string): Promise<void> {
  const scope = captureDeviceScope();
  if (!scope.matches(uid)) return;
  try {
    const [starts, ends] = await Promise.all([
      supabase.from("cycle_logs").select("log_date, period_start, notes").eq("user_id", uid).eq("period_start", true).order("log_date", { ascending: true }),
      supabase.from("cycle_logs").select("log_date, period_start, notes").eq("user_id", uid).like("notes", "period_end:%"),
    ]);
    if (!scope.matches(uid)) return;
    const error = starts.error || ends.error;
    const data = [...(starts.data ?? []), ...(ends.data ?? [])];
    if (error) return;
    if (!data?.length) {
      // Nothing in the cloud yet — push what this device knows.
      for (const p of getPeriodHistory()) {
        if (!scope.matches(uid)) return;
        await syncStart(p.start);
        if (p.end) await syncEnd(p.start, p.end);
      }
      return;
    }
    const cloud: PeriodEntry[] = data.filter((r) => r.period_start).map((r) => ({ start: r.log_date }));
    for (const r of data) {
      const m = /^period_end:(\d{4}-\d{2}-\d{2})$/.exec(r.notes ?? "");
      if (!m) continue;
      const p = cloud.find((c) => c.start === m[1]);
      if (p) p.end = r.log_date;
    }
    const local = getPeriodHistory();
    const merged = [...cloud];
    for (const p of local) {
      if (!merged.some((c) => Math.abs(daysBetween(c.start, p.start)) < SAME_PERIOD_DAYS)) merged.push(p);
    }
    save(merged);
  } catch {
    /* offline */
  }
}
