/**
 * Pure state machine for a partner class: 36 alternating turns (42 with the
 * optional third strength round), an optional class timer (work → swap → next
 * turn) and per-partner heart-rate tallies. The component persists
 * `ActiveClass` to localStorage every tick so a reload resumes at the same
 * turn (paused).
 */
import { stationWorkSeconds, type PartnerSession, type PartnerStation } from "@/data/partner-program";
import { getZoneForBPM } from "@/data/workouts";
import {
  lastLogFor, repTarget, suggestNext, totalTurns, turnAt,
  type ClassMode, type PartnerSlot, type PartnerTurnRecord,
} from "@/lib/partner-progress";

export interface HRAcc { sum: number; count: number; max: number; effortSeconds: number }
export interface TurnDraft { turn: number; reps: string; weight: string; skipped?: boolean }

export interface ActiveClass {
  id: string;
  sessionId: string;
  date: string;
  mode: ClassMode;
  turn: number;
  phase: "work" | "swap";
  phaseElapsed: number;
  turnElapsed: number;
  elapsed: number;
  running: boolean;
  records: PartnerTurnRecord[];
  draft: TurnDraft | null;
  partners: Record<PartnerSlot, string>;
  hr: Record<PartnerSlot, HRAcc>;
  /** Third round of the strength stations (+6 turns). */
  extraRound?: boolean;
}

export interface ClassContext {
  session: PartnerSession;
  /** Prefill for a turn's quick log (last logged load for that worker). */
  prefill?: (turn: number, records: PartnerTurnRecord[]) => TurnDraft;
}

const emptyAcc = (): HRAcc => ({ sum: 0, count: 0, max: 0, effortSeconds: 0 });

/** Strength stations repeated by the optional third round (they lead every session). */
export const extraStationsFor = (session: PartnerSession, extraRound?: boolean) =>
  extraRound ? session.stations.filter(st => st.block === "Strength").length : 0;

export const classTurns = (session: PartnerSession, a?: Pick<ActiveClass, "extraRound"> | null) =>
  totalTurns(session.stations.length, session.rounds, extraStationsFor(session, a?.extraRound));

/** Who works which station on turn `index` of this class. */
export const classTurnAt = (session: PartnerSession, index: number, extraRound?: boolean) =>
  turnAt(index, session.stations.length, session.rounds, extraStationsFor(session, extraRound));

export function createActiveClass(
  ctx: ClassContext,
  opts: { id: string; date: string; mode: ClassMode; partners: Record<PartnerSlot, string>; extraRound?: boolean },
): ActiveClass {
  return {
    id: opts.id, sessionId: ctx.session.id, date: opts.date, mode: opts.mode,
    turn: 0, phase: "work", phaseElapsed: 0, turnElapsed: 0, elapsed: 0, running: true,
    records: [], draft: ctx.prefill?.(0, []) ?? null, partners: opts.partners,
    hr: { A: emptyAcc(), B: emptyAcc() },
    ...(opts.extraRound ? { extraRound: true } : {}),
  };
}

/**
 * Quick-log prefill. Reps start empty (the target shows as a placeholder) so an
 * untouched field is never logged as "hit the top of the range". Load comes from
 * the person's own entry earlier in this class, else their last logged set of
 * the same exercise; when the phase changes the load (deload, fewer reps) the
 * adjusted load is prefilled instead.
 */
export function buildPrefill(
  session: PartnerSession,
  history: Array<{ records: PartnerTurnRecord[] }>,
  opts: { partners?: Record<PartnerSlot, string>; extraRound?: boolean } = {},
) {
  return (turn: number, records: PartnerTurnRecord[]): TurnDraft => {
    const t = classTurnAt(session, turn, opts.extraRound);
    const station = session.stations[t.station];
    if (!station) return { turn, reps: "", weight: "" };
    const person = opts.partners?.[t.worker];
    const earlier = lastLogFor([{ records }], t.worker, station.id, station.name, person);
    if (earlier) return { turn, reps: earlier.repsLogged === false ? "" : earlier.reps, weight: earlier.weight };
    const prior = lastLogFor(history, t.worker, station.id, station.name, person);
    const suggestion = suggestNext(station, prior, { style: session.style });
    const weight = suggestion?.kind === "adjust" && suggestion.weight ? suggestion.weight : prior?.weight ?? "";
    return { turn, reps: "", weight };
  };
}

export const isClassComplete = (a: ActiveClass, session: PartnerSession) => a.turn >= classTurns(session, a);
const isLastTurn = (a: ActiveClass, session: PartnerSession) => a.turn >= classTurns(session, a) - 1;

function currentStation(a: ActiveClass, session: PartnerSession): PartnerStation | undefined {
  const t = classTurnAt(session, Math.min(a.turn, classTurns(session, a) - 1), a.extraRound);
  return session.stations[t.station];
}

/** Work window for the current turn (stations size their own). */
export const workSecondsFor = (a: ActiveClass, session: PartnerSession) => stationWorkSeconds(session, currentStation(a, session));

/** Seconds left in the current timer phase (class-timer mode only). */
export function remainingSeconds(a: ActiveClass, session: PartnerSession): number | null {
  if (a.mode !== "timer") return null;
  const total = a.phase === "work" ? workSecondsFor(a, session) : session.transitionSeconds;
  return Math.max(0, total - a.phaseElapsed);
}

/** Log the current worker's turn (from the draft) and move to the next turn. */
export function commitTurn(a: ActiveClass, ctx: ClassContext): ActiveClass {
  const { session } = ctx;
  if (isClassComplete(a, session)) return a;
  const t = classTurnAt(session, a.turn, a.extraRound);
  const station = session.stations[t.station];
  const draft = a.draft?.turn === a.turn ? a.draft : null;
  const workSeconds = a.mode === "timer" ? Math.min(a.turnElapsed, stationWorkSeconds(session, station)) : a.turnElapsed;
  const reps = draft?.reps.trim() ?? "";
  const target = repTarget(station);
  const record: PartnerTurnRecord = {
    exercise_id: station.id,
    exercise_name: station.name,
    block: station.block,
    partner: t.worker,
    partnerName: a.partners[t.worker],
    round: t.round,
    reps,
    weight: draft?.weight.trim() ?? "",
    completed: !draft?.skipped,
    repsLogged: reps !== "",
    seconds: workSeconds,
    session_id: session.id,
    style: session.style,
    ...(target ? { target } : {}),
    ...(station.rir ? { rir: station.rir } : {}),
  };
  const turn = a.turn + 1;
  const done = turn >= classTurns(session, a);
  const records = [...a.records, record];
  return {
    ...a, turn, phase: "work", phaseElapsed: 0, turnElapsed: 0, records,
    draft: done ? null : ctx.prefill?.(turn, records) ?? null,
    running: done ? false : a.running,
  };
}

/** Undo the last logged turn; its values go back into the quick log. */
export function backTurn(a: ActiveClass): ActiveClass {
  if (a.turn === 0 || a.records.length === 0) return { ...a, phase: "work", phaseElapsed: 0, turnElapsed: 0 };
  const last = a.records[a.records.length - 1];
  return {
    ...a, turn: a.turn - 1, phase: "work", phaseElapsed: 0, turnElapsed: 0,
    records: a.records.slice(0, -1),
    draft: { turn: a.turn - 1, reps: last.reps, weight: last.weight, ...(last.completed === false ? { skipped: true } : {}) },
  };
}

/** Jump straight to the swap phase (class timer) or log the turn (partner pace, or the last turn). */
export function swapNow(a: ActiveClass, ctx: ClassContext): ActiveClass {
  if (a.mode === "timer" && a.phase === "work" && ctx.session.transitionSeconds > 0 && !isLastTurn(a, ctx.session)) {
    return { ...a, phase: "swap", phaseElapsed: 0 };
  }
  return commitTurn(a, ctx);
}

/**
 * Advance the clock by whole seconds. In class-timer mode the work phase rolls
 * into the swap phase (except on the last turn, which has no one to swap
 * with), and the swap phase commits the turn automatically.
 * Heart-rate samples (one per second) feed each partner's tallies.
 */
export function tickClass(
  a: ActiveClass,
  ctx: ClassContext,
  seconds = 1,
  hr?: { bpm: Partial<Record<PartnerSlot, number>>; maxHR: Record<PartnerSlot, number> },
): ActiveClass {
  let next = a;
  for (let i = 0; i < seconds; i++) {
    if (!next.running || isClassComplete(next, ctx.session)) break;
    next = { ...next, elapsed: next.elapsed + 1, turnElapsed: next.turnElapsed + 1, phaseElapsed: next.phaseElapsed + 1 };
    if (hr) next = { ...next, hr: tallyHR(next.hr, hr.bpm, hr.maxHR) };
    if (next.mode === "timer") {
      if (next.phase === "work" && next.phaseElapsed >= workSecondsFor(next, ctx.session)) {
        next = ctx.session.transitionSeconds > 0 && !isLastTurn(next, ctx.session) ? { ...next, phase: "swap", phaseElapsed: 0 } : commitTurn(next, ctx);
      } else if (next.phase === "swap" && next.phaseElapsed >= ctx.session.transitionSeconds) {
        next = commitTurn(next, ctx);
      }
    }
  }
  return next;
}

function tallyHR(acc: Record<PartnerSlot, HRAcc>, bpm: Partial<Record<PartnerSlot, number>>, maxHR: Record<PartnerSlot, number>) {
  const out = { ...acc };
  (["A", "B"] as PartnerSlot[]).forEach(slot => {
    const b = bpm[slot] ?? 0;
    if (b <= 30) return;
    const prev = out[slot];
    out[slot] = {
      sum: prev.sum + b,
      count: prev.count + 1,
      max: Math.max(prev.max, b),
      effortSeconds: prev.effortSeconds + (getZoneForBPM(b, maxHR[slot]).zone >= 3 ? 1 : 0),
    };
  });
  return out;
}

export function hrSummary(acc: HRAcc) {
  if (!acc.count) return null;
  return { avg: Math.round(acc.sum / acc.count), max: acc.max, effortMinutes: Math.round(acc.effortSeconds / 60) };
}

/** Restore a persisted class (always paused after a reload or navigation). */
export function restoreActiveClass(value: unknown, sessionExists: (id: string) => boolean): ActiveClass | null {
  if (!value || typeof value !== "object") return null;
  const a = value as ActiveClass;
  if (typeof a.id !== "string" || typeof a.sessionId !== "string" || !sessionExists(a.sessionId) || !Array.isArray(a.records)) return null;
  return {
    ...a,
    running: false,
    phase: a.phase === "swap" ? "swap" : "work",
    hr: { A: a.hr?.A ?? emptyAcc(), B: a.hr?.B ?? emptyAcc() },
    partners: { A: a.partners?.A ?? "Partner A", B: a.partners?.B ?? "Partner B" },
  };
}
