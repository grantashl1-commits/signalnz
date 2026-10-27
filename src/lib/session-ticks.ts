/**
 * Rounds a member has ticked off during today's session, kept on the device so a
 * reload or a quick look at another tab doesn't lose them. Keyed by the session
 * ("path::w1::d3"), then exercise name → rounds done. Cleared when she finishes.
 */
const KEY = "signal_session_ticks";
export type SessionTicks = Record<string, number>;

function all(): Record<string, SessionTicks> {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; }
}

export function getSessionTicks(sessionKey: string): SessionTicks {
  return all()[sessionKey] ?? {};
}

export function setSessionTick(sessionKey: string, name: string, rounds: number): SessionTicks {
  const store = all();
  const ticks = { ...(store[sessionKey] ?? {}) };
  if (rounds > 0) ticks[name] = rounds; else delete ticks[name];
  // Only the session in progress is kept.
  try { localStorage.setItem(KEY, JSON.stringify({ [sessionKey]: ticks })); } catch { /* ticks still show this visit */ }
  return ticks;
}

export function clearSessionTicks(sessionKey: string) {
  const store = all();
  if (!(sessionKey in store)) return;
  delete store[sessionKey];
  try { localStorage.setItem(KEY, JSON.stringify(store)); } catch { /* nothing left to keep */ }
}
