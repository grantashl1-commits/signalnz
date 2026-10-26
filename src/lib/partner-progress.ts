/**
 * Partner series progress (8-week class-style programme in `@/data/partner-program`).
 *
 * Local-first: everything lives in localStorage under
 * `signal_partner_program_v1:<uid|guest>` as `{ completed, logs }` and the hub
 * mirrors finished sessions to `workout_logs` (notes prefix `Partner circuit · `).
 * Everything below the storage helpers is pure so it can be unit-tested.
 */
import { PARTNER_PROGRAM, getPartnerSession, type PartnerSession, type PartnerStation, type SessionStyle, type StationBlock } from "@/data/partner-program";
import type { Json, TablesInsert } from "@/integrations/supabase/types";

export type PartnerSlot = "A" | "B";
export type ClassMode = "pace" | "timer";

export const PARTNER_PROGRESS_EVENT = "signal:partner-program-changed";
export const PARTNER_NOTES_PREFIX = "Partner circuit · ";
const PROGRESS_KEY = "signal_partner_program_v1";
const SETTINGS_KEY = "signal_partner_settings_v1";
const LEGACY_KEY = "signal_partner_circuits_v1";

/** Fixed dumbbells in the home gym (4–25 kg). Used to pick the next available bell. */
export const DUMBBELL_LADDER_KG = [4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20, 22, 24, 25];
export const BARBELL_INCREMENT_KG = 2.5;

/** One worker turn at one station — this is also the `workout_logs.exercises[]` record shape. */
export interface PartnerTurnRecord {
  exercise_id: string;
  exercise_name: string;
  block: StationBlock;
  partner: PartnerSlot;
  partnerName: string;
  round: number;
  reps: string;
  weight: string;
  /** False when the worker skipped the station (left out of loads and summaries). */
  completed: boolean;
  /** Seconds the worker spent on this turn. */
  seconds?: number;
  session_id?: string;
  /** False when the reps field was left empty (the set is not treated as hitting a target). */
  repsLogged?: boolean;
  /** Session style, rep target and reps in reserve the set was done at (drives phase-aware suggestions). */
  style?: SessionStyle;
  target?: [number, number];
  rir?: string;
  /** Mirrors PartnerSessionLog.counted on the cloud row. */
  counted?: boolean;
  /** Reps and load are the plan's suggestion for the week, not typed in class. */
  planned?: boolean;
}

export interface PartnerHRSummary {
  avg: number;
  max: number;
  effortMinutes: number;
  /** Estimated calories for the whole class (heart rate where a strap was on, time-based otherwise). */
  kcal?: number;
}

export interface PartnerSessionLog {
  /** Also the `workout_logs.id` (upserted by id). */
  id: string;
  sessionId: string;
  title: string;
  date: string;
  /** Total class time in seconds. */
  elapsed: number;
  mode: ClassMode;
  partners: Record<PartnerSlot, string>;
  records: PartnerTurnRecord[];
  hr?: Partial<Record<PartnerSlot, PartnerHRSummary>>;
  turnsPlanned: number;
  synced: boolean;
  /** False when the member chose not to tick the session off in the 8-week plan. */
  counted?: boolean;
  /** The optional third round of the strength stations was added. */
  extraRound?: boolean;
}

export interface PartnerProgress {
  completed: Record<string, { date: string; logId: string }>;
  logs: PartnerSessionLog[];
}

export interface PartnerPerson {
  name: string;
  age: number | null;
  /** Body weight for the calorie estimate (optional). */
  weightKg?: number | null;
}
export interface PartnerSettings {
  A: PartnerPerson;
  B: PartnerPerson;
  mode: ClassMode;
  muted: boolean;
  /** Rack has safety arms or straps (null = not asked yet). `false` swaps the rack lifts for dumbbells. */
  safeties: boolean | null;
  /** Add a third round of the strength stations (+6 turns). */
  extraRound: boolean;
}

const EMPTY_PROGRESS: PartnerProgress = { completed: {}, logs: [] };
export const DEFAULT_PARTNER_SETTINGS: PartnerSettings = {
  A: { name: "", age: null, weightKg: null },
  B: { name: "", age: null, weightKg: null },
  mode: "pace",
  muted: false,
  safeties: null,
  extraRound: false,
};

// ─── Storage ────────────────────────────────────────────────────────────────

export const partnerProgressKey = (userId?: string | null) => `${PROGRESS_KEY}:${userId || "guest"}`;
export const partnerSettingsKey = (userId?: string | null) => `${SETTINGS_KEY}:${userId || "guest"}`;
export const legacyPartnerKey = (userId?: string | null) => `${LEGACY_KEY}:${userId || "guest"}`;

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function normaliseProgress(value: unknown): PartnerProgress {
  if (!value || typeof value !== "object") return { ...EMPTY_PROGRESS, completed: {}, logs: [] };
  const v = value as Partial<PartnerProgress>;
  const completed = v.completed && typeof v.completed === "object" ? v.completed : {};
  const logs = Array.isArray(v.logs) ? v.logs.filter(l => l && typeof l.id === "string" && Array.isArray(l.records)) : [];
  return { completed, logs };
}

/** Read the member's partner-series progress (safe to call from anywhere, e.g. Training paths). */
export function getPartnerProgress(userId?: string | null): PartnerProgress {
  return normaliseProgress(readJson(partnerProgressKey(userId)));
}

/** Persist progress and notify listeners. Returns false when device storage is unavailable. */
export function savePartnerProgress(progress: PartnerProgress, userId?: string | null): boolean {
  try {
    localStorage.setItem(partnerProgressKey(userId), JSON.stringify(progress));
  } catch {
    return false;
  }
  try {
    window.dispatchEvent(new CustomEvent(PARTNER_PROGRESS_EVENT, { detail: { userId: userId || null } }));
  } catch { /* non-browser */ }
  return true;
}

export function getPartnerSettings(userId?: string | null): PartnerSettings {
  const stored = readJson<Partial<PartnerSettings>>(partnerSettingsKey(userId));
  return {
    A: { ...DEFAULT_PARTNER_SETTINGS.A, ...(stored?.A ?? {}) },
    B: { ...DEFAULT_PARTNER_SETTINGS.B, ...(stored?.B ?? {}) },
    mode: stored?.mode === "timer" ? "timer" : "pace",
    muted: !!stored?.muted,
    safeties: typeof stored?.safeties === "boolean" ? stored.safeties : null,
    extraRound: !!stored?.extraRound,
  };
}

export function savePartnerSettings(settings: PartnerSettings, userId?: string | null): void {
  try { localStorage.setItem(partnerSettingsKey(userId), JSON.stringify(settings)); } catch { /* private mode */ }
}

/** Sessions saved by the earlier 4-plan partner rotation (read-only history). */
export interface LegacyPartnerSession {
  id: string;
  planId: string;
  date: string;
  elapsed: number;
  records: Array<{ exercise_name: string; exercise_id: string; partner: string; round: number; reps: string; weight: string }>;
  synced?: boolean;
}

export function getLegacyPartnerHistory(userId?: string | null): LegacyPartnerSession[] {
  const stored = readJson<{ history?: LegacyPartnerSession[] }>(legacyPartnerKey(userId));
  return Array.isArray(stored?.history) ? stored!.history.filter(s => s && Array.isArray(s.records)) : [];
}

// ─── Programme order ────────────────────────────────────────────────────────

export function orderedSessions(sessions: PartnerSession[] = PARTNER_PROGRAM.sessions): PartnerSession[] {
  return [...sessions].sort((a, b) => a.week - b.week || a.index - b.index);
}

/** First session (in programme order) that hasn't been completed, or null when the series is finished. */
export function getNextSessionId(progress: PartnerProgress = getPartnerProgress(), sessions: PartnerSession[] = PARTNER_PROGRAM.sessions): string | null {
  return orderedSessions(sessions).find(s => !progress.completed[s.id])?.id ?? null;
}

export function markSessionDone(progress: PartnerProgress, sessionId: string, date: string, logId: string): PartnerProgress {
  return { ...progress, completed: { ...progress.completed, [sessionId]: { date, logId } } };
}

/** Upsert a finished session log (by id) and optionally tick the programme session. */
export function addSessionLog(progress: PartnerProgress, log: PartnerSessionLog, countAsDone = true): PartnerProgress {
  const logs = [...progress.logs.filter(l => l.id !== log.id), log].sort((a, b) => a.date.localeCompare(b.date));
  const next = { ...progress, logs };
  return countAsDone ? markSessionDone(next, log.sessionId, log.date, log.id) : next;
}

// ─── Turn order ─────────────────────────────────────────────────────────────

/** Turns in a class; `extraStations` adds a last round of just the first N (strength) stations. */
export function totalTurns(stationCount = 9, rounds = 2, extraStations = 0): number {
  return stationCount * 2 * rounds + extraStations * 2;
}

/** Turns spent at one station: an A/B pair per round, plus one more pair for the first `extraStations`. */
const turnsAtStation = (station: number, rounds: number, extraStations: number) => 2 * (rounds + (station < extraStations ? 1 : 0));

/** Index of the first turn at `station` (the station count when past the end). */
export function stationStartTurn(station: number, stationCount = 9, rounds = 2, extraStations = 0): number {
  let start = 0;
  for (let s = 0; s < Math.min(station, stationCount); s++) start += turnsAtStation(s, rounds, extraStations);
  return start;
}

/**
 * Turn order: both partners finish every round of a station before moving on —
 * A, B, A, B at station 1 (the other partner is on the treadmill each turn),
 * then station 2, and so on. With `extraStations`, the first N (strength)
 * stations get one more A/B pair.
 */
export function turnAt(index: number, stationCount = 9, rounds = 2, extraStations = 0): { round: number; station: number; worker: PartnerSlot; treadmill: PartnerSlot } {
  let start = 0;
  for (let s = 0; s < stationCount; s++) {
    const here = turnsAtStation(s, rounds, extraStations);
    if (index < start + here || s === stationCount - 1) {
      const k = Math.max(0, Math.min(index - start, here - 1));
      const worker: PartnerSlot = k % 2 === 0 ? "A" : "B";
      return { round: Math.floor(k / 2) + 1, station: s, worker, treadmill: worker === "A" ? "B" : "A" };
    }
    start += here;
  }
  return { round: 1, station: 0, worker: "A", treadmill: "B" };
}

// ─── Loads and double progression ───────────────────────────────────────────

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
/** "Partner A" / "Partner B" / empty: a slot placeholder rather than a person. */
export const isDefaultPartnerName = (name?: string | null) => !name?.trim() || /^partner\s*[ab]$/i.test(name.trim());

/**
 * Most recent completed record of this exercise for this person. Matches the
 * exercise by id (or by name for older logs) and the person by name, so loads
 * follow the person rather than the A/B slot. With no real name (or for older
 * records saved as "Partner A/B") it falls back to the slot.
 */
export function lastLogFor(
  logs: Array<{ records: PartnerTurnRecord[] }>,
  partner: PartnerSlot,
  exerciseId: string,
  exerciseName?: string,
  personName?: string,
): PartnerTurnRecord | undefined {
  const name = exerciseName ? norm(exerciseName) : null;
  const person = personName && !isDefaultPartnerName(personName) ? norm(personName) : null;
  for (let i = logs.length - 1; i >= 0; i--) {
    const records = logs[i].records;
    for (let j = records.length - 1; j >= 0; j--) {
      const r = records[j];
      if (!r || r.completed === false) continue;
      if (!(r.exercise_id === exerciseId || (name && r.exercise_name && norm(r.exercise_name) === name))) continue;
      if (person) {
        if (r.partnerName && norm(r.partnerName) === person) return r;
        if (r.partner === partner && isDefaultPartnerName(r.partnerName)) return r;
      } else if (r.partner === partner) return r;
    }
  }
  return undefined;
}

/**
 * Load in kg from free text: "40 kg" → 40, "12.5kg per DB" → 12.5, "2 x 10kg" → 10
 * (per dumbbell), "bar + 10 a side" → 40, and "bar" → 20 (barbell only).
 */
export function parseLoadKg(weight: string | undefined | null, barbell = false): number | null {
  if (!weight) return null;
  const w = weight.replace(/,/g, ".");
  const side = w.match(/(\d+(?:\.\d+)?)\s*(?:kg)?\s*(?:a|each|per)\s*side/i);
  if (side && (barbell || /\bbar\b/i.test(w))) return 20 + 2 * Number(side[1]);
  const times = w.match(/(\d+)\s*[x×]\s*(\d+(?:\.\d+)?)/i);
  if (times) return Number(times[2]);
  const m = w.match(/(\d+(?:\.\d+)?)/);
  if (m) return Number(m[1]);
  if (barbell && /\bbar\b/i.test(w)) return 20;
  return null;
}

/** First whole number in a reps string: "10 each side" → 10, "30 s" → 30. */
export function parseReps(reps: string | undefined | null): number | null {
  if (!reps) return null;
  const m = reps.match(/(\d+)/);
  return m ? Number(m[1]) : null;
}

/** Prescribed range for a station: repRange, else "8–10" → [8, 10], "12" → [12, 12]. */
export function repTarget(station: Pick<PartnerStation, "reps" | "repRange">): [number, number] | null {
  if (station.repRange) return station.repRange;
  const range = station.reps.match(/(\d+)\s*[–—-]\s*(\d+)/);
  if (range) return [Number(range[1]), Number(range[2])];
  const one = parseReps(station.reps);
  return one == null ? null : [one, one];
}

/** Placeholder for the reps field: the target range, or the hold time. It is never logged by itself. */
export function repsPlaceholderFor(station: Pick<PartnerStation, "reps" | "repRange" | "timed">): string {
  const target = repTarget(station);
  if (!target) return station.reps;
  if (station.timed) return `${target[1]} s`;
  return target[0] === target[1] ? String(target[1]) : `${target[0]}–${target[1]}`;
}

export type LoadKind = "barbell" | "dumbbell" | "reformer" | "bodyweight";

export function loadKind(station: Pick<PartnerStation, "block" | "equipment">): LoadKind {
  if (station.block === "Reformer" || station.equipment.includes("reformer")) return "reformer";
  if (station.equipment.includes("barbell")) return "barbell";
  if (station.equipment.includes("dumbbell")) return "dumbbell";
  return "bodyweight";
}

export const formatKg = (kg: number) => `${Number.isInteger(kg) ? kg : Number(kg.toFixed(2))} kg`;

export function nextDumbbell(kg: number, ladder: number[] = DUMBBELL_LADDER_KG): number | null {
  return ladder.find(x => x > kg + 0.01) ?? null;
}

/** Nearest available dumbbell (ties go lighter). */
export function nearestDumbbell(kg: number, ladder: number[] = DUMBBELL_LADDER_KG): number {
  return ladder.reduce((best, x) => (Math.abs(x - kg) < Math.abs(best - kg) - 0.01 ? x : best), ladder[0]);
}

const roundBar = (kg: number, mode: "floor" | "nearest") => {
  const steps = mode === "floor" ? Math.floor(kg / BARBELL_INCREMENT_KG + 1e-6) : Math.round(kg / BARBELL_INCREMENT_KG);
  return Math.max(20, steps * BARBELL_INCREMENT_KG);
};
const rirNum = (rir?: string | null) => Number(rir?.match(/\d+/)?.[0] ?? 2);
/** Epley estimate with reps in reserve: the load you could lift once. */
const estimatedMax = (kg: number, reps: number, rir: number) => kg * (1 + (reps + rir) / 30);

/** Style, rep target and reps in reserve a record was done at (stored, or looked up from its session). */
export function recordContext(r: Partial<Pick<PartnerTurnRecord, "session_id" | "exercise_id" | "style" | "target" | "rir">>) {
  const session = r.session_id ? getPartnerSession(r.session_id) : undefined;
  const st = session?.stations.find(s => s.id === r.exercise_id);
  return {
    style: r.style ?? session?.style,
    target: r.target ?? (st ? repTarget(st) : null),
    rir: r.rir ?? st?.rir,
  };
}

export interface ProgressSuggestion {
  /** Short line for the quick log, e.g. "Last: 10 @ 40 kg · try 42.5 kg". */
  text: string;
  /** Load to apply with one tap. */
  weight?: string;
  /** Rep target to aim for this time. */
  reps?: string;
  /** "adjust" = the phase changed the load (deload, or fewer reps); it is also prefilled. */
  kind: "increase" | "repeat" | "technique" | "adjust";
}

type SuggestStation = Pick<PartnerStation, "reps" | "repRange" | "timed" | "block" | "equipment"> & Partial<Pick<PartnerStation, "rir">>;
type SuggestRecord = Pick<PartnerTurnRecord, "reps" | "weight"> & Partial<Pick<PartnerTurnRecord, "repsLogged" | "session_id" | "exercise_id" | "style" | "target" | "rir">>;

/**
 * Next load for a station from the person's last set of it.
 *
 * Phase-aware first: in the deload week the load drops to about 75 % and never
 * goes up; when the rep target drops (Pump 10–12 → Strength 6–8, or Week 6
 * 6–8 → Peak 5–6) the load is converted through an estimated max so the
 * lower reps are done heavier. Otherwise double progression: stay at a load
 * until the top of the range is hit, then add the smallest available
 * increment (barbell +2.5 kg, next dumbbell, or a spring / slower tempo).
 */
export function suggestNext(
  station: SuggestStation,
  last: SuggestRecord | undefined | null,
  opts: { style?: SessionStyle } = {},
): ProgressSuggestion | null {
  if (!last) return null;
  const kind = loadKind(station);
  const target = repTarget(station);
  if (!target) return null;
  const done = last.repsLogged === false ? null : parseReps(last.reps);
  const top = target[1];
  const kg = parseLoadKg(last.weight, kind === "barbell");
  const unit = station.timed ? " s" : "";
  const shownLoad = last.weight?.trim() ? (kg != null && kind !== "reformer" ? formatKg(kg) : last.weight.trim()) : "";
  const lastText = done == null ? `Last: ${shownLoad ? `${shownLoad} (reps not logged)` : "reps not logged"}` : `Last: ${done}${unit}${shownLoad ? ` @ ${shownLoad}` : ""}`;
  const ctx = recordContext(last);
  const weighted = (kind === "barbell" || kind === "dumbbell") && kg != null && !station.timed;

  // Deload: lighter, never heavier.
  if (opts.style === "Deload") {
    if (weighted && ctx.style && ctx.style !== "Deload") {
      const next = kind === "barbell" ? roundBar(kg * 0.75, "nearest") : nearestDumbbell(kg * 0.75);
      return { text: `${lastText} · deload week: about 75 %, try ${formatKg(next)}`, weight: formatKg(next), reps: String(target[0]), kind: "adjust" };
    }
    return { text: `${lastText} · deload week: same or lighter, 3–4 in reserve`, weight: last.weight || undefined, kind: "repeat" };
  }

  // Fewer reps than last time's target: go heavier via the estimated max.
  if (weighted && done != null && ctx.target && ctx.target[1] > top) {
    const raw = estimatedMax(kg, done, rirNum(ctx.rir ?? station.rir)) / (1 + (target[0] + rirNum(station.rir)) / 30);
    const next = Math.max(kg, kind === "barbell" ? roundBar(raw, "floor") : nearestDumbbell(raw));
    const topBell = kind === "dumbbell" && next >= DUMBBELL_LADDER_KG[DUMBBELL_LADDER_KG.length - 1] && raw > next;
    return {
      text: `${lastText} · fewer reps now: try ${formatKg(next)}${topBell ? " and slow the lowering" : ""}`,
      weight: formatKg(next), reps: String(target[0]), kind: next > kg ? "adjust" : "repeat",
    };
  }

  if (done == null) {
    return last.weight?.trim() ? { text: `${lastText} · same load, log your reps this time`, weight: last.weight, kind: "repeat" } : null;
  }
  const hitTop = done >= top;

  if (!hitTop) {
    const aim = Math.min(top, done + (station.timed ? 5 : 1));
    return { text: `${lastText} · same load, aim for ${aim}${unit}`, reps: `${aim}${unit}`, weight: last.weight || undefined, kind: "repeat" };
  }
  if (station.timed) {
    return { text: `${lastText} · try ${done + 5} s`, reps: `${done + 5} s`, weight: last.weight || undefined, kind: "increase" };
  }
  if (kind === "reformer") {
    return { text: `${lastText} · add a spring / slow the tempo`, reps: String(target[0]), kind: "technique" };
  }
  if (kind === "barbell" && kg != null) {
    const next = formatKg(kg + BARBELL_INCREMENT_KG);
    return { text: `${lastText} · try ${next}`, weight: next, reps: String(target[0]), kind: "increase" };
  }
  if (kind === "dumbbell" && kg != null) {
    const next = nextDumbbell(kg);
    if (next == null) return { text: `${lastText} · top dumbbell — slow the lowering to 3 s`, kind: "technique" };
    return { text: `${lastText} · try ${formatKg(next)}`, weight: formatKg(next), reps: String(target[0]), kind: "increase" };
  }
  return { text: `${lastText} · top of the range — slow the tempo or add a pause`, kind: "technique" };
}

// ─── Planned loads (no typing in class) ─────────────────────────────────────

/** What the pair already lift: 10 kg dumbbells and the 20 kg bar. Every suggestion builds from these. */
export const BASE_DUMBBELL_KG = 10;
export const BASE_BARBELL_KG = 20;

/** Bar load by programme week (index 0 = week 1). Lower-body lifts climb faster than presses and rows; week 8 is the deload. */
const BAR_LOWER_KG = [20, 25, 25, 30, 32.5, 35, 40, 27.5];
const BAR_UPPER_KG = [20, 20, 22.5, 25, 27.5, 27.5, 30, 20];
/** Dumbbell steps up the home ladder by week: same for the Foundation fortnight, then +1, +2, +3 for the peak, back to the start for the deload. */
const DB_STEPS = [0, 0, 1, 1, 2, 2, 3, 0];

const LOWER_BAR = /squat|deadlift|rdl|hip thrust|good morning|glute bridge/i;
const LIGHT_DB = /lateral|raise|curl|tricep|kickback|fly|rear delt|face pull|arnold|upright/i;
const HEAVY_DB = /goblet|swing|suitcase|farmer|single[- ]arm.*row|one[- ]arm/i;

export interface PlannedLoad {
  /** Rep target (or hold time) shown on the station, e.g. "10–12" or "30 s". */
  reps: string;
  /** Load line, e.g. "10 kg dumbbells", "20 kg bar", "Springs: medium"; null for bodyweight. */
  load: string | null;
  /** Kilograms when the load is a dumbbell or barbell. */
  kg: number | null;
  kind: LoadKind;
}

function stepDumbbell(baseKg: number, steps: number, ladder: number[] = DUMBBELL_LADDER_KG): number {
  let i = ladder.findIndex(x => x >= baseKg - 0.01);
  if (i < 0) i = ladder.length - 1;
  return ladder[Math.min(ladder.length - 1, Math.max(0, i + steps))];
}

/**
 * The reps and load to do at a station in a given programme week. Nothing is
 * typed in class, so progression comes from the plan: dumbbell work starts at
 * the 10 kg pair (lighter isolation moves at 6 kg, single-bell moves at 12 kg)
 * and the bar at 20 kg, then both climb week by week and drop back for the
 * week-8 deload.
 */
export function plannedLoad(station: Pick<PartnerStation, "name" | "reps" | "block" | "equipment" | "load">, week: number): PlannedLoad {
  const kind = loadKind(station);
  const w = Math.min(8, Math.max(1, Math.round(week))) - 1;
  if (kind === "barbell") {
    const kg = (LOWER_BAR.test(station.name) ? BAR_LOWER_KG : BAR_UPPER_KG)[w];
    return { reps: station.reps, load: kg <= BASE_BARBELL_KG ? `${formatKg(kg)} bar` : `${formatKg(kg)} total (incl. bar)`, kg, kind };
  }
  if (kind === "dumbbell") {
    const base = LIGHT_DB.test(station.name) ? 6 : HEAVY_DB.test(station.name) ? 12 : BASE_DUMBBELL_KG;
    const kg = stepDumbbell(base, DB_STEPS[w]);
    const single = /goblet|swing|suitcase|single[- ]arm|one[- ]arm/i.test(station.name);
    return { reps: station.reps, load: `${formatKg(kg)} ${single ? "dumbbell" : "dumbbells"}`, kg, kind };
  }
  if (kind === "reformer") {
    const level = station.load.match(/springs?:\s*([a-z–-]+)/i)?.[1];
    return { reps: station.reps, load: level ? `Springs: ${level}` : "Springs as set", kg: null, kind };
  }
  return { reps: station.reps, load: null, kg: null, kind };
}

/** Defaults when a partner hasn't given an age or weight. */
export const DEFAULT_CALORIE_AGE = 38;
export const DEFAULT_CALORIE_WEIGHT_KG = 70;
/** Strength circuit with treadmill walking between stations (Compendium of Physical Activities: circuit training, moderate). */
const CLASS_MET = 5;

/**
 * Calories for one partner over a class. Minutes with a strap use the
 * heart-rate equation for women (Keytel et al. 2005); minutes without one use a
 * moderate circuit-training MET. Estimates, not measurements.
 */
export function partnerCalories(
  hr: { sum: number; count: number } | null | undefined,
  elapsedSeconds: number,
  person: { age?: number | null; weightKg?: number | null } = {},
): { kcal: number; fromHR: boolean } {
  const weight = person.weightKg && person.weightKg > 25 ? person.weightKg : DEFAULT_CALORIE_WEIGHT_KG;
  const age = person.age && person.age > 10 ? person.age : DEFAULT_CALORIE_AGE;
  const measured = Math.min(hr?.count ?? 0, Math.max(0, elapsedSeconds));
  let kcal = 0;
  if (hr && measured >= 60) {
    const avg = hr.sum / hr.count;
    const perMinute = (0.4472 * avg - 0.1263 * weight + 0.074 * age - 20.4022) / 4.184;
    kcal += Math.max(0, perMinute) * (measured / 60);
  }
  const unmeasured = Math.max(0, elapsedSeconds - (measured >= 60 ? measured : 0));
  kcal += (CLASS_MET * 3.5 * weight / 200) * (unmeasured / 60);
  return { kcal: Math.round(kcal), fromHR: measured >= 60 };
}

// ─── Summaries + cloud rows ─────────────────────────────────────────────────

export function summarisePartner(records: PartnerTurnRecord[], partner: PartnerSlot) {
  const mine = records.filter(r => r.partner === partner && r.completed !== false);
  const kg = mine.reduce((sum, r) => {
    const reps = parseReps(r.reps);
    const load = r.block === "Reformer" ? null : parseLoadKg(r.weight, /barbell/.test(r.exercise_id));
    return reps != null && load != null ? sum + reps * load : sum;
  }, 0);
  const seconds = mine.reduce((sum, r) => sum + (r.seconds ?? 0), 0);
  return { sets: mine.length, kg: Math.round(kg), seconds };
}

export function partnerNotes(session: Pick<PartnerSession, "week" | "index" | "focus" | "style">): string {
  return `${PARTNER_NOTES_PREFIX}Week ${session.week} · Session ${session.index} · ${session.focus} · ${session.style}`;
}

/** Recover the programme session from a `workout_logs.notes` value written by `partnerNotes`. */
export function parsePartnerNotes(notes: string | null | undefined): string | null {
  const m = notes?.match(/^Partner circuit · Week (\d+) · Session (\d)/);
  return m ? `w${m[1]}-s${m[2]}` : null;
}

export const NOT_COUNTED_SUFFIX = " · not counted";

/** Whether a restored `workout_logs` row ticks its session off (an unticked save stays unticked on every device). */
export function rowCounts(row: { notes?: string | null; exercises?: unknown }): boolean {
  if (row.notes?.endsWith(NOT_COUNTED_SUFFIX)) return false;
  const first = Array.isArray(row.exercises) ? (row.exercises[0] as { counted?: boolean } | undefined) : undefined;
  return first?.counted !== false;
}

/** `workout_logs` row for a finished class (upserted by id). Heart-rate columns describe partner A — the member. */
export function buildWorkoutLogRow(
  log: PartnerSessionLog,
  userId: string,
  session?: Pick<PartnerSession, "week" | "index" | "focus" | "style">,
): TablesInsert<"workout_logs"> {
  const own = log.hr?.A;
  const counted = log.counted !== false;
  return {
    id: log.id,
    user_id: userId,
    session_date: log.date,
    workout_template_id: null,
    duration_minutes: Math.max(1, Math.round(log.elapsed / 60)),
    exercises: log.records.map(r => ({ ...r, session_id: log.sessionId, counted })) as unknown as Json,
    notes: (session ? partnerNotes(session) : `${PARTNER_NOTES_PREFIX}${log.title}`) + (counted ? "" : NOT_COUNTED_SUFFIX),
    completed: true,
    ...(own && own.max > 0 ? { avg_bpm: own.avg, max_bpm: own.max } : {}),
    ...(own?.kcal ? { calories: own.kcal } : {}),
  };
}
