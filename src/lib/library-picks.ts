/**
 * "Add to my plan" — a tiny per-day store of Library exercises the user
 * wants to add onto today's session. Keyed by ISO date so picks naturally
 * roll over each day.
 */
const KEY = "signal_library_picks_v1";

export interface LibraryPick {
  id: string;
  name: string;
  illustration_url?: string | null;
  target?: string | null;
}

type Store = Record<string, LibraryPick[]>; // date -> picks

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function read(): Store {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

function write(s: Store) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(s));
  window.dispatchEvent(new CustomEvent("signal:library-picks-changed"));
}

export function getPicksForToday(): LibraryPick[] {
  return read()[todayISO()] || [];
}

export function isPickedToday(id: string): boolean {
  return getPicksForToday().some(p => p.id === id);
}

export function togglePickToday(pick: LibraryPick): boolean {
  const store = read();
  const day = todayISO();
  const current = store[day] || [];
  const exists = current.some(p => p.id === pick.id);
  store[day] = exists ? current.filter(p => p.id !== pick.id) : [...current, pick];
  write(store);
  return !exists; // returns true if added
}

export function removePickToday(id: string) {
  const store = read();
  const day = todayISO();
  store[day] = (store[day] || []).filter(p => p.id !== id);
  write(store);
}
