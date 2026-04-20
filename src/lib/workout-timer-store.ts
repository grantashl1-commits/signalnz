/**
 * Global workout-timer store.
 *
 * One shared, persisted timer that survives:
 *  • Page navigation (state lives in this module + localStorage, not React)
 *  • Tab backgrounding (remaining time is computed from Date.now() deltas,
 *    not decremented per-tick — so iOS/Android throttling doesn't drift it)
 *  • Refreshes (rehydrated from localStorage on load)
 *
 * Components subscribe via `useWorkoutTimer()` and start sessions via
 * `startWorkoutTimer({...})`. There is at most one active timer at a time.
 */
import { useSyncExternalStore } from "react";

export type TimerKind = "work" | "rest" | "warmup" | "cooldown" | "run" | "jog" | "sprint" | "walk" | "recovery";

export interface TimerStep {
  /** Stable id (used as React key). */
  id: string;
  /** What to display ("Walk/Run Intervals (1/8)", "Recovery", ...). */
  label: string;
  /** Total duration in seconds. */
  durationSec: number;
  /** Visual / semantic kind. */
  kind: TimerKind;
}

export interface TimerSession {
  /** Unique id for this session run (changes when a new timer starts). */
  sessionId: string;
  /** Friendly title shown in the floating bar (e.g. "Walk/Run Intervals"). */
  title: string;
  /** Route to navigate back to when tapping the floating bar. */
  returnPath: string;
  /** Ordered steps. */
  steps: TimerStep[];
  /** Index of the current step. */
  stepIdx: number;
  /**
   * Wall-clock timestamp (ms since epoch) at which the *current step* will end
   * if it keeps running. null when paused — paused state uses `remainingSec`.
   */
  endsAtMs: number | null;
  /** Remaining seconds in the current step when paused. */
  remainingSec: number;
  /** True when the timer is actively running. */
  running: boolean;
  /** True when all steps have completed. */
  finished: boolean;
  /** Mute audio cues. */
  muted: boolean;
}

const STORAGE_KEY = "signal_workout_timer_v1";

let state: TimerSession | null = loadFromStorage();
const listeners = new Set<() => void>();
let tickHandle: number | null = null;

function loadFromStorage(): TimerSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TimerSession;
    // If a finished session was persisted, drop it.
    if (parsed.finished) return null;
    return parsed;
  } catch {
    return null;
  }
}

function persist() {
  try {
    if (state) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

function notify() {
  for (const l of listeners) l();
}

function setState(next: TimerSession | null) {
  state = next;
  persist();
  notify();
}

// ── Audio cues ──────────────────────────────────────────────────────────────
let audioCtx: AudioContext | null = null;
function getAudioCtx(): AudioContext | null {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    return audioCtx;
  } catch {
    return null;
  }
}
function beep(freq: number, durationSec: number, count = 1) {
  const ctx = getAudioCtx();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  for (let i = 0; i < count; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.value = freq;
    const start = ctx.currentTime + i * 0.25;
    gain.gain.setValueAtTime(0.3, start);
    gain.gain.exponentialRampToValueAtTime(0.01, start + durationSec);
    osc.start(start);
    osc.stop(start + durationSec);
  }
}

/** Resume the audio context — must be called from a user gesture. */
export function unlockTimerAudio() {
  const ctx = getAudioCtx();
  if (ctx?.state === "suspended") ctx.resume().catch(() => {});
}

// ── Tick loop ───────────────────────────────────────────────────────────────
function ensureTicker() {
  if (tickHandle != null) return;
  tickHandle = window.setInterval(tick, 250);
}
function stopTicker() {
  if (tickHandle != null) {
    window.clearInterval(tickHandle);
    tickHandle = null;
  }
}

function tick() {
  if (!state || !state.running || state.endsAtMs == null) return;
  const now = Date.now();
  const remainingMs = state.endsAtMs - now;

  if (remainingMs > 1000) {
    // Still in this step — fire countdown beep at ~3s remaining.
    const remainingSec = Math.ceil(remainingMs / 1000);
    if (!state.muted && remainingSec === 3) beep(660, 0.1);
    // Just notify so subscribers re-render the displayed seconds.
    notify();
    return;
  }

  // Advance through any steps that have already elapsed (handles long
  // background gaps where multiple steps could have completed).
  let s = { ...state };
  let endsAt = s.endsAtMs!;
  let advanced = false;

  while (Date.now() >= endsAt) {
    advanced = true;
    const nextIdx = s.stepIdx + 1;
    if (nextIdx >= s.steps.length) {
      s = { ...s, stepIdx: s.stepIdx, endsAtMs: null, remainingSec: 0, running: false, finished: true };
      if (!s.muted) beep(1046, 0.2, 3);
      break;
    }
    const nextStep = s.steps[nextIdx];
    endsAt = endsAt + nextStep.durationSec * 1000;
    s = { ...s, stepIdx: nextIdx, endsAtMs: endsAt, remainingSec: nextStep.durationSec };
    if (!s.muted) beep(880, 0.15, 2);
  }

  if (advanced) {
    state = s;
    persist();
    notify();
    if (s.finished) stopTicker();
  }
}

// Re-validate when the tab becomes visible again (catches up after a long
// background period — e.g. the screen was off for 5 minutes).
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && state?.running) {
      tick();
    }
  });
}

// Start the ticker if we rehydrated a running session on page load.
if (state?.running) ensureTicker();

// ── Public API ──────────────────────────────────────────────────────────────

export function startWorkoutTimer(input: {
  title: string;
  returnPath: string;
  steps: TimerStep[];
  muted?: boolean;
}) {
  if (!input.steps.length) return;
  const first = input.steps[0];
  const session: TimerSession = {
    sessionId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: input.title,
    returnPath: input.returnPath,
    steps: input.steps,
    stepIdx: 0,
    endsAtMs: Date.now() + first.durationSec * 1000,
    remainingSec: first.durationSec,
    running: true,
    finished: false,
    muted: input.muted ?? false,
  };
  unlockTimerAudio();
  setState(session);
  ensureTicker();
}

export function pauseWorkoutTimer() {
  if (!state || !state.running) return;
  const remainingSec = state.endsAtMs
    ? Math.max(0, Math.ceil((state.endsAtMs - Date.now()) / 1000))
    : state.remainingSec;
  setState({ ...state, running: false, endsAtMs: null, remainingSec });
}

export function resumeWorkoutTimer() {
  if (!state || state.running || state.finished) return;
  unlockTimerAudio();
  const endsAtMs = Date.now() + state.remainingSec * 1000;
  setState({ ...state, running: true, endsAtMs });
  ensureTicker();
}

export function skipWorkoutStep() {
  if (!state || state.finished) return;
  const nextIdx = state.stepIdx + 1;
  if (nextIdx >= state.steps.length) {
    setState({ ...state, running: false, finished: true, endsAtMs: null, remainingSec: 0 });
    stopTicker();
    return;
  }
  const next = state.steps[nextIdx];
  const wasRunning = state.running;
  setState({
    ...state,
    stepIdx: nextIdx,
    remainingSec: next.durationSec,
    endsAtMs: wasRunning ? Date.now() + next.durationSec * 1000 : null,
  });
}

export function resetWorkoutTimer() {
  if (!state) return;
  const first = state.steps[0];
  setState({
    ...state,
    stepIdx: 0,
    remainingSec: first?.durationSec ?? 0,
    endsAtMs: null,
    running: false,
    finished: false,
  });
}

export function stopWorkoutTimer() {
  setState(null);
  stopTicker();
}

export function setWorkoutTimerMuted(muted: boolean) {
  if (!state) return;
  setState({ ...state, muted });
}

export function getWorkoutTimerSnapshot(): TimerSession | null {
  return state;
}

/** Currently displayed seconds for the active step. */
export function getDisplayRemaining(s: TimerSession): number {
  if (!s.running || s.endsAtMs == null) return s.remainingSec;
  return Math.max(0, Math.ceil((s.endsAtMs - Date.now()) / 1000));
}

// ── React hook ──────────────────────────────────────────────────────────────

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useWorkoutTimer(): TimerSession | null {
  return useSyncExternalStore(subscribe, getWorkoutTimerSnapshot, () => null);
}
