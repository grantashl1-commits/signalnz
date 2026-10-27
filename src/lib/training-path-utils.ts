import { toast } from "sonner";
import { captureDeviceScope } from "./device-privacy";
/**
 * Helpers for the SIGNAL static training-path data:
 *  - persist the user's selected path
 *  - work out which session is "next" based on logged completions
 *  - extract the unique exercise list across all paths so the Library
 *    can surface them.
 */
import { SIGNAL_TRAINING_PATHS, PARTNER_PATH_ID, partnerSessionHref, type TrainingPath, type DaySession } from "@/data/signal-training-paths";
import { extractExerciseName } from "@/lib/exercise-image-lookup";
import { supabase } from "@/integrations/supabase/client";
import { PARTNER_PROGRESS_EVENT, getNextSessionId, getPartnerProgress, savePartnerProgress } from "@/lib/partner-progress";

/** Window events that mean "the next session may have changed" (listen to both). */
export const TRAINING_PATH_EVENTS = ["signal:training-path-changed", PARTNER_PROGRESS_EVENT] as const;

/** The partner series keeps its own progress and logging in the partner hub. */
export const isPartnerPath = (pathOrId: TrainingPath | string | null | undefined) =>
  (typeof pathOrId === "string" ? pathOrId : pathOrId?.id) === PARTNER_PATH_ID;

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
  // Mirror to profile for cross-device parity (fire-and-forget).
  void mirrorPathToProfile(id);
}

async function mirrorPathToProfile(id: string | null) {
  const scope = captureDeviceScope();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !scope.matches(user.id)) return;
    await supabase
      .from("profiles")
      .upsert({ user_id: user.id, training_path_id: id } as any, { onConflict: "user_id" });
  } catch {}
}

/** Hydrate the local selected-path cache from the user's profile if local is empty. */
export async function hydrateSelectedPathFromProfile(): Promise<void> {
  const scope = captureDeviceScope();
  try {
    if (getSelectedPathId()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("training_path_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!scope.matches(user.id)) return;
    const remote = (data as any)?.training_path_id as string | null;
    if (remote) {
      localStorage.setItem(SELECTED_PATH_KEY, remote);
      window.dispatchEvent(new Event("signal:training-path-changed"));
    }
  } catch {}
}

/** The plan onboarding starts a member on, from her first movement goal, equipment and level. */
export function pathForOnboarding(goal: string | undefined, equipment: string, level: string | null): string {
  switch (goal) {
    case "strength":
    case "event":
      if (equipment === "gym" && level !== "beginner") return "the-forge";
      return equipment === "home-none" ? "mat-pilates" : "strength-from-the-ground-up";
    case "fat_loss": return "signal-circuit-progressive";
    case "cardio": return "learn-to-run";
    case "stress":
    case "recovery": return "rest-and-restore-somatic-full";
    // "Return to myself, gently" and "Move with more ease": 30-minute, low-impact classes.
    default: return "mat-pilates";
  }
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

export function markSessionCompleted(pathId: string, week: number, day: number, actual?: WorkoutActual) {
  // The partner hub ticks its own sessions and writes its own workout_logs row.
  if (isPartnerPath(pathId)) return;
  const map = getCompletedMap();
  map[sessionKey(pathId, week, day)] = true;
  try {
    localStorage.setItem(COMPLETED_SESSIONS_KEY, JSON.stringify(map));
    window.dispatchEvent(new Event("signal:training-path-changed"));
  } catch {}

  // Carry through to the calendar / workout history.
  void logSessionToCalendar(pathId, week, day, actual);
  localStorage.setItem("signal_training_progress_updated_at", String(Date.now()));
  void syncTrainingProgress();
}

/** Reset all completed sessions for a path so the user can start over from week 1 day 1. */
export function resetPathProgress(pathId: string, userId?: string | null) {
  if (isPartnerPath(pathId)) {
    // Start the series again: ticks clear, logged weights stay so loads carry over.
    const progress = getPartnerProgress(userId);
    savePartnerProgress({ ...progress, completed: {} }, userId);
    return;
  }
  const map = getCompletedMap();
  const prefix = `${pathId}::`;
  let changed = false;
  for (const k of Object.keys(map)) {
    if (k.startsWith(prefix)) { delete map[k]; changed = true; }
  }
  if (changed) {
    localStorage.setItem("signal_training_progress_updated_at", String(Date.now()));
    try {
      localStorage.setItem(COMPLETED_SESSIONS_KEY, JSON.stringify(map));
      void syncTrainingProgress();
      window.dispatchEvent(new Event("signal:training-path-changed"));
    } catch {}
  }
}

export interface PlannedExercise { exercise_name: string; sets?: number; reps?: number; weight_kg?: number }

/** Every exercise a session prescribes: its blocks, any legacy structure lines, then extra picks. */
export function plannedExercises(session: DaySession, extra: string[] = []): PlannedExercise[] {
  const out = new Map<string, PlannedExercise>();
  for (const block of session.supersets ?? []) for (const e of block.exercises) {
    if (out.has(e.name)) continue;
    // "10", "8–10" or "10 each side" read as reps; holds ("20 s") and counts stay blank.
    const reps = typeof e.reps === "number" ? e.reps : /^(\d+)(?:\s*[–-]\s*\d+)?(?:\s+each side)?$/.exec(String(e.reps).trim())?.[1];
    const kg = e.weight?.match(/(\d+(?:\.\d+)?)\s*kg/i)?.[1];
    out.set(e.name, { exercise_name: e.name, sets: e.sets || undefined, reps: reps === undefined ? undefined : Number(reps), weight_kg: kg ? Number(kg) : undefined });
  }
  const lines = (session.structure ?? []).filter(line => !/^(warm up|cool down):/i.test(line));
  for (const name of [...lines.map(extractExerciseName), ...extra]) {
    if (name && !out.has(name)) out.set(name, { exercise_name: name });
  }
  return [...out.values()];
}

export interface WorkoutActual {
  durationMinutes?: number;
  notes?: string;
  exercises?: Array<{ exercise_name: string; sets?: number; reps?: number; weight_kg?: number }>;
}
const PENDING_LOGS = 'signal_training_pending_logs';
const PROGRESS_TIME = 'signal_training_progress_updated_at';
const PROGRESS_KIND = 'signal_training_progress_v1';
type PendingLog = { id: string; session_date: string; duration_minutes: number | null; notes: string; completed: boolean; exercises: WorkoutActual['exercises'] };
function pendingLogs(): PendingLog[] {
  try { return JSON.parse(localStorage.getItem(PENDING_LOGS) || '[]'); } catch { return []; }
}
async function logSessionToCalendar(pathId: string, week: number, day: number, actual?: WorkoutActual) {
  const path = SIGNAL_TRAINING_PATHS.find(p => p.id === pathId);
  const session = path?.weeks.find(w => w.week === week)?.sessions.find(s => s.day === day);
  if (!path || !session) return;
  const now = new Date();
  const date = [now.getFullYear(), String(now.getMonth()+1).padStart(2,'0'), String(now.getDate()).padStart(2,'0')].join('-');
  const marker = '[' + sessionKey(pathId,week,day) + ']';
  const queue = pendingLogs();
  if (!queue.some(row => row.session_date === date && row.notes.includes(marker))) {
    queue.push({id:crypto.randomUUID(),session_date:date,duration_minutes:actual?.durationMinutes ?? null,
      notes: path.name + ' · ' + session.name + ' ' + marker + (actual?.notes ? '\n' + actual.notes : ''), completed:true,
      exercises:actual?.exercises ?? plannedExercises(session).map(({exercise_name}) => ({exercise_name})),
    });
    localStorage.setItem(PENDING_LOGS, JSON.stringify(queue));
  }
  await flushTrainingLogs();
}
let flushing: Promise<void> | null = null;
export async function flushTrainingLogs(): Promise<void> {
  if (flushing) return flushing;
  const scope = captureDeviceScope();
  flushing = (async () => {
    try {
      const {data:{user}} = await supabase.auth.getUser();
      if (!user || !scope.matches(user.id)) return;
      for (const row of pendingLogs()) {
        if (!scope.matches(user.id)) return;
        const {error} = await supabase.from('workout_logs').upsert({...row,user_id:user.id}, {onConflict:'id'});
        if (error) throw error;
        if (!scope.matches(user.id)) return;
        localStorage.setItem(PENDING_LOGS,JSON.stringify(pendingLogs().filter(p => p.id !== row.id)));
      }
    } catch {
      if (scope.valid()) toast.error('Workout saved on this device. Cloud sync will retry when you reconnect.');
    }
  })().finally(() => {flushing=null;});
  return flushing;
}

/** Restore progress on any member screen; retain resets using a last-edited timestamp. */
export async function syncTrainingProgress(): Promise<void> {
  const scope = captureDeviceScope();
  try {
    const {data:{user}} = await supabase.auth.getUser();
    if (!user || !scope.matches(user.id)) return;
    const {data:row,error} = await supabase.from('user_plans').select('id,plan_data').eq('user_id',user.id).eq('plan_type','training').eq('plan_data->>kind',PROGRESS_KIND).order('generated_at',{ascending:false}).limit(1).maybeSingle();
    if (error) throw error;
    if (!scope.matches(user.id)) return;
    const remote = row?.plan_data as {completed?: Record<string,true>; updatedAt?: number} | undefined;
    const localTime = Number(localStorage.getItem(PROGRESS_TIME) || 0);
    if ((remote?.updatedAt ?? 0) > localTime && remote?.completed) {
      localStorage.setItem(COMPLETED_SESSIONS_KEY,JSON.stringify(remote.completed));
      localStorage.setItem(PROGRESS_TIME,String(remote.updatedAt));
      window.dispatchEvent(new Event('signal:training-path-changed'));
    } else if (localTime > (remote?.updatedAt ?? 0)) {
      const plan_data = {kind:PROGRESS_KIND,completed:getCompletedMap(),updatedAt:localTime};
      const result = row ? await supabase.from('user_plans').update({plan_data,generated_at:new Date().toISOString()}).eq('id',row.id).eq('user_id',user.id)
        : await supabase.from('user_plans').insert({user_id:user.id,plan_type:'training',plan_data});
      if (result.error) throw result.error;
    }
  } catch {
    if (scope.valid()) toast.error('Training progress is saved on this device. Cloud sync will retry when you reconnect.');
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
 * Where "Start" goes for a path's next session: the partner series opens its
 * class hub on that session; other paths are logged from the Move tab (null).
 */
export function sessionStartHref(info: Pick<NextSessionInfo, "path" | "week" | "day"> | null | undefined): string | null {
  return info && isPartnerPath(info.path) ? partnerSessionHref(info.week, info.day) : null;
}

const isRestOrOptional = (s: DaySession) => (s.durationMin ?? 0) === 0 || !!s.optional || !!s.isRestDay;

/**
 * Walk every session in the path in order. Return the first one that
 * isn't yet marked completed. Skip rest days and optional extras so
 * "next session" always points at the plan's next real session.
 * The partner series reads its completion from the partner hub (per user),
 * so the path and the hub always agree.
 */
export function getNextSession(path: TrainingPath, opts: { userId?: string | null } = {}): NextSessionInfo | null {
  if (!path.weeks.length) return null;
  const partner = isPartnerPath(path) ? getPartnerProgress(opts.userId) : null;
  const partnerNext = partner ? getNextSessionId(partner) : null;
  const completed: Record<string, true> = partner
    ? Object.fromEntries(path.weeks.flatMap(w => w.sessions.filter(s => partner.completed[`w${w.week}-s${s.day}`]).map(s => [sessionKey(path.id, w.week, s.day), true] as const)))
    : getCompletedMap();
  let totalSessions = 0;
  let completedCount = 0;
  let next: { week: number; day: number; session: DaySession } | null = null;

  for (const w of path.weeks) {
    for (const s of w.sessions) {
      // Rest days and optional extras (walks, conditioning, stretch) never block the plan.
      if (isRestOrOptional(s)) continue;
      totalSessions++;
      const key = sessionKey(path.id, w.week, s.day);
      if (completed[key]) {
        completedCount++;
      } else if (!next && (!partner || partnerNext === `w${w.week}-s${s.day}`)) {
        next = { week: w.week, day: s.day, session: s };
      }
    }
  }

  if (!next) {
    // Programme finished — surface the very last session for repeat.
    const lastWeek = path.weeks[path.weeks.length - 1];
    const lastSession = lastWeek.sessions
      .filter(s => !isRestOrOptional(s))
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
