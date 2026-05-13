/**
 * Tracks the first date a given training session was offered as "next up".
 * If a session has been pending more than a day, the Today card surfaces a
 * gentle "Picked up from {weekday}" hint instead of guilt-tripping the user
 * about a missed workout.
 */
const KEY = "signal_path_session_offered";

type Map = Record<string, string>; // sessionKey -> YYYY-MM-DD

function readMap(): Map {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; }
}
function writeMap(m: Map) {
  try { localStorage.setItem(KEY, JSON.stringify(m)); } catch {}
}

function todayLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Note that a session is being offered today; returns the date it was first offered. */
export function noteOffered(sessionKey: string): string {
  const map = readMap();
  if (!map[sessionKey]) {
    map[sessionKey] = todayLocal();
    writeMap(map);
  }
  return map[sessionKey];
}

/** Number of full days between first-offer date and today. */
export function daysSinceOffered(sessionKey: string): number {
  const first = readMap()[sessionKey];
  if (!first) return 0;
  const a = new Date(first + "T00:00:00");
  const b = new Date(todayLocal() + "T00:00:00");
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / 86400000));
}

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function offeredWeekday(sessionKey: string): string | null {
  const first = readMap()[sessionKey];
  if (!first) return null;
  const d = new Date(first + "T00:00:00");
  return WEEKDAYS[d.getDay()];
}

/** Drop the offered timestamp once a session is completed (or skipped manually). */
export function clearOffered(sessionKey: string) {
  const map = readMap();
  if (map[sessionKey]) {
    delete map[sessionKey];
    writeMap(map);
  }
}
