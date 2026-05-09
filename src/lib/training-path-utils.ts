/**
 * Helpers for the SIGNAL static training-path data:
 *  - persist the user's selected path
 *  - work out which session is "next" based on logged completions
 *  - extract the unique exercise list across all paths so the Library
 *    can surface them.
 */
import { SIGNAL_TRAINING_PATHS, type TrainingPath, type DaySession } from "@/data/signal-training-paths";
import { extractExerciseName } from "@/lib/exercise-image-lookup";

const SELECTED_PATH_KEY = "signal_selected_training_path";
const COMPLETED_SESSIONS_KEY = "signal_path_completed_sessions";

export function getSelectedPathId(): string | null {
  try {
    return localStorage.getItem(SELECTED_PATH_KEY);
  } catch {
    return null;
  }
}

export function setSelectedPathId(id: string | null) {
  try {
    if (id) localStorage.setItem(SELECTED_PATH_KEY, id);
    else localStorage.removeItem(SELECTED_PATH_KEY);
    window.dispatchEvent(new Event("signal:training-path-changed"));
  } catch {}
}

export function getSelectedPath(): TrainingPath | null {
  const id = getSelectedPathId();
  if (!id) return null;
  return SIGNAL_TRAINING_PATHS.find(p => p.id === id) ?? null;
}

/** sessionKey = `${pathId}::w${week}::d${day}` */
function sessionKey(pathId: string, week: number, day: number) {
  return `${pathId}::w${week}::d${day}`;
}

function getCompletedMap(): Record<string, true> {
  try {
    return JSON.parse(localStorage.getItem(COMPLETED_SESSIONS_KEY) || "{}");
  } catch {
    return {};
  }
}

export function isSessionCompleted(pathId: string, week: number, day: number): boolean {
  return !!getCompletedMap()[sessionKey(pathId, week, day)];
}

export function markSessionCompleted(pathId: string, week: number, day: number) {
  const map = getCompletedMap();
  map[sessionKey(pathId, week, day)] = true;
  try {
    localStorage.setItem(COMPLETED_SESSIONS_KEY, JSON.stringify(map));
    window.dispatchEvent(new Event("signal:training-path-changed"));
  } catch {}
}

export interface NextSessionInfo {
  path: TrainingPath;
  week: number;
  day: number;
  session: DaySession;
  totalSessions: number;
  completedCount: number;
  finished: boolean;
}

/**
 * Walk every session in the path in order. Return the first one that
 * isn't yet marked completed. Skip true rest days (durationMin === 0)
 * so "next session" always points at something the user can actually do.
 */
export function getNextSession(path: TrainingPath): NextSessionInfo | null {
  if (!path.weeks.length) return null;
  const completed = getCompletedMap();
  let totalSessions = 0;
  let completedCount = 0;
  let next: { week: number; day: number; session: DaySession } | null = null;

  for (const w of path.weeks) {
    for (const s of w.sessions) {
      const isRest = (s.durationMin ?? 0) === 0;
      if (isRest) continue;
      totalSessions++;
      const key = sessionKey(path.id, w.week, s.day);
      if (completed[key]) {
        completedCount++;
      } else if (!next) {
        next = { week: w.week, day: s.day, session: s };
      }
    }
  }

  if (!next) {
    // Programme finished — surface the very last session for repeat.
    const lastWeek = path.weeks[path.weeks.length - 1];
    const lastSession = lastWeek.sessions
      .filter(s => (s.durationMin ?? 0) > 0)
      .pop() ?? lastWeek.sessions[lastWeek.sessions.length - 1];
    return {
      path,
      week: lastWeek.week,
      day: lastSession.day,
      session: lastSession,
      totalSessions,
      completedCount,
      finished: true,
    };
  }

  return {
    path,
    week: next.week,
    day: next.day,
    session: next.session,
    totalSessions,
    completedCount,
    finished: false,
  };
}

/** Every unique exercise name that appears in any session's structure. */
export function getAllPathExercises(): { name: string; paths: string[] }[] {
  const map = new Map<string, Set<string>>();
  for (const path of SIGNAL_TRAINING_PATHS) {
    for (const w of path.weeks) {
      for (const s of w.sessions) {
        for (const line of s.structure || []) {
          const name = extractExerciseName(line);
          if (!name) continue;
          // Strip trailing parenthetical qualifiers ("(new)", "(+ load)") for grouping
          const clean = name.replace(/\s*\(.*?\)\s*$/g, "").trim();
          if (!clean) continue;
          if (!map.has(clean)) map.set(clean, new Set());
          map.get(clean)!.add(path.name);
        }
      }
    }
  }
  return Array.from(map.entries())
    .map(([name, paths]) => ({ name, paths: Array.from(paths) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
