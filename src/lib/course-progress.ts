/** Account-scoped course progress, with durable local writes and retryable cloud sync. */
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { captureDeviceScope } from './device-privacy';
export interface CourseProgressRow {
  activity_id: string; lesson_id?: string | null; module_id?: string | null;
  activity_type?: string | null; response?: unknown; completed: boolean; updated_at?: string;
}
type LocalRow = CourseProgressRow & { pending?: boolean; revision?: string };
const KEY = 'signal_course_progress_v1';
const DRAFTS = 'signal_course_drafts_v1';
export const COURSE_PROGRESS_EVENT = 'signal:course-progress';
const db = supabase as unknown as SupabaseClient;
function readLocal(): Record<string, LocalRow> {
  const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('Saved course progress could not be read.');
  return raw;
}
function writeLocal(map: Record<string, LocalRow>) {
  localStorage.setItem(KEY, JSON.stringify(map));
  window.dispatchEvent(new Event(COURSE_PROGRESS_EVENT));
}
export function getLocalCourseProgress(): CourseProgressRow[] { return Object.values(readLocal()).filter(r => r.completed); }
export function hasPendingCourseProgress(): boolean { return Object.values(readLocal()).some(r => r.pending); }
export function readCourseDraft(activityId: string): string | undefined {
  const drafts = JSON.parse(localStorage.getItem(DRAFTS) || '{}');
  return typeof drafts[activityId] === 'string' ? drafts[activityId] : undefined;
}
export function saveCourseDraft(activityId: string, text: string) {
  const drafts = JSON.parse(localStorage.getItem(DRAFTS) || '{}');
  drafts[activityId] = text; localStorage.setItem(DRAFTS, JSON.stringify(drafts));
}
export function clearCourseDraft(activityId: string) {
  const drafts = JSON.parse(localStorage.getItem(DRAFTS) || '{}');
  delete drafts[activityId]; localStorage.setItem(DRAFTS, JSON.stringify(drafts));
}
let active: { scope: ReturnType<typeof captureDeviceScope>; promise: Promise<void> } | undefined;
/** Serialize uploads; keep a newer edit queued if an older request finishes. */
export function flushCourseProgress(userId: string): Promise<void> {
  const scope = captureDeviceScope();
  if (!scope.matches(userId)) return Promise.resolve();
  if (active?.scope.valid() && active.scope.owner === userId) return active.promise;
  const job = { scope, promise: Promise.resolve() };
  job.promise = (async () => {
    while (scope.matches(userId)) {
      const row = Object.values(readLocal()).find(r => r.pending);
      if (!row) return;
      const { pending: _pending, revision: _revision, ...payload } = row;
      const { error } = await db.from('connect_course_progress').upsert({ ...payload, user_id: userId }, { onConflict: 'user_id,activity_id' });
      if (error) throw error;
      if (!scope.matches(userId)) return;
      const current = readLocal();
      if (current[row.activity_id]?.revision === row.revision) {
        current[row.activity_id] = { ...current[row.activity_id], pending: false }; writeLocal(current);
      }
    }
  })().finally(() => { if (active === job) active = undefined; });
  active = job; return job.promise;
}
/** Merge into the current cache, never a pre-request snapshot. */
export async function loadCourseProgress(userId?: string | null): Promise<CourseProgressRow[]> {
  const scope = captureDeviceScope();
  if (userId && !scope.matches(userId)) return [];
  if (userId) {
    try { await flushCourseProgress(userId); } catch { /* queued rows stay available offline */ }
    if (!scope.matches(userId)) return [];
    const remote: CourseProgressRow[] = [];
    try {
      for (let offset = 0; ; offset += 500) {
        const { data, error } = await db.from('connect_course_progress')
          .select('activity_id,lesson_id,module_id,activity_type,response,completed,updated_at')
          .eq('user_id', userId).eq('completed', true).order('activity_id').range(offset, offset + 499);
        if (!scope.matches(userId)) return [];
        if (error) throw error;
        remote.push(...(data ?? []) as CourseProgressRow[]);
        if (!data || data.length < 500) break;
      }
    } catch { return scope.matches(userId) ? getLocalCourseProgress() : []; }
    if (!scope.matches(userId)) return [];
    const local = readLocal();
    for (const row of remote) {
      const existing = local[row.activity_id];
      if (!existing || (!existing.pending && (Date.parse(row.updated_at || '') > Date.parse(existing.updated_at || '') || (!existing.updated_at && row.response !== undefined)))) local[row.activity_id] = { ...row, pending: false };
    }
    // Migrate old local-only rows only when the cloud has no copy.
    for (const row of Object.values(local)) {
      if (row.pending === undefined && !remote.some(r => r.activity_id === row.activity_id)) {
        row.pending = true; row.revision = crypto.randomUUID(); row.updated_at = new Date().toISOString();
      }
    }
    writeLocal(local);
    try { await flushCourseProgress(userId); } catch { /* retained for reconnect */ }
  }
  return scope.valid() ? getLocalCourseProgress() : [];
}
/** Resolve after a durable device write; retain network failures for retry. */
export async function saveCourseActivity(userId: string | null | undefined, row: CourseProgressRow): Promise<void> {
  const scope = captureDeviceScope();
  if (userId && !scope.matches(userId)) throw new Error('Your account changed. Reopen the lesson to save.');
  const local = readLocal();
  local[row.activity_id] = { ...row, completed: true, updated_at: new Date().toISOString(), revision: crypto.randomUUID(), pending: !!userId };
  writeLocal(local);
  if (userId) void flushCourseProgress(userId).catch(() => { /* pending remains visible */ });
}
