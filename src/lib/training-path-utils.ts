/**
 * Helpers for the SIGNAL static training-path data:
 *  - persist the user's selected path
 *  - work out which session is "next" based on logged completions
 *  - extract the unique exercise list across all paths so the Library
 *    can surface them.
 */
import { SIGNAL_TRAINING_PATHS, type TrainingPath, type DaySession } from "@/data/signal-training-paths";
import { extractExerciseName } from "@/lib/exercise-image-lookup";
import { supabase } from "@/integrations/supabase/client";

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

  // Carry through to the calendar / workout history.
  void logSessionToCalendar(pathId, week, day);
}

/** Reset all completed sessions for a path so the user can start over from week 1 day 1. */
export function resetPathProgress(pathId: string) {
  const map = getCompletedMap();
  const prefix = `${pathId}::`;
  let changed = false;
  for (const k of Object.keys(map)) {
    if (k.startsWith(prefix)) { delete map[k]; changed = true; }
  }
  if (changed) {
    try {
      localStorage.setItem(COMPLETED_SESSIONS_KEY, JSON.stringify(map));
      window.dispatchEvent(new Event("signal:training-path-changed"));
    } catch {}
  }
}

/** Insert a workout_logs row so the completed session shows on the calendar. */
async function logSessionToCalendar(pathId: string, week: number, day: number) {
  try {
    const path = SIGNAL_TRAINING_PATHS.find(p => p.id === pathId);
    const weekObj = path?.weeks.find(w => w.week === week);
    const session = weekObj?.sessions.find(s => s.day === day);
    if (!path || !session) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Local YYYY-MM-DD (NZ-safe enough for a session_date column).
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    // Build a lightweight exercises array from structure for body-tag derivation.
    const exercises = (session.structure || [])
      .map(line => {
        const name = extractExerciseName(line);
        return name ? { exercise_name: name } : null;
      })
      .filter(Boolean) as { exercise_name: string }[];

    // Avoid duplicate inserts on rapid double-tap.
    const { data: existing } = await supabase
      .from("workout_logs")
      .select("id")
      .eq("user_id", user.id)
      .eq("session_date", dateStr)
      .ilike("notes", `%${pathId}::w${week}::d${day}%`)
      .limit(1);
    if (existing && existing.length > 0) return;

    await supabase.from("workout_logs").insert({
      user_id: user.id,
      session_date: dateStr,
      duration_minutes: session.durationMin ?? null,
      notes: `${path.name} · ${session.name} [${pathId}::w${week}::d${day}]`,
      completed: true,
      exercises,
    });
  } catch (e) {
    console.warn("[training-path] failed to log session to calendar", e);
  }
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
