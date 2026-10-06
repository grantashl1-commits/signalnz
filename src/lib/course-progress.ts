/**
 * Course progress (Modules, Connect, Embodiment, Parenting).
 *
 * Progress is written locally first so lessons complete and modules unlock
 * instantly — even offline, and even if the Supabase table is unavailable —
 * then mirrored to `connect_course_progress` for cross-device continuity.
 * (That table is created in supabase/migrations/20261007000000_course_progress.sql.)
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface CourseProgressRow {
  activity_id: string;
  lesson_id?: string | null;
  module_id?: string | null;
  activity_type?: string | null;
  response?: unknown;
  completed: boolean;
}

const KEY = "signal_course_progress_v1";
// The course tables aren't in the generated types yet; use an untyped client for them.
const db = supabase as unknown as SupabaseClient;

function readLocal(): Record<string, CourseProgressRow> {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}") as Record<string, CourseProgressRow>;
  } catch {
    return {};
  }
}

function writeLocal(map: Record<string, CourseProgressRow>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    /* storage full */
  }
}

/** Completed activities for this member: local progress merged with the cloud copy. */
export async function loadCourseProgress(userId?: string | null): Promise<CourseProgressRow[]> {
  const local = readLocal();
  if (userId) {
    try {
      const { data, error } = await db
        .from("connect_course_progress")
        .select("activity_id, lesson_id, module_id, completed")
        .eq("user_id", userId)
        .eq("completed", true);
      if (!error && Array.isArray(data)) {
        for (const r of data as CourseProgressRow[]) {
          if (r?.activity_id && !local[r.activity_id]) local[r.activity_id] = { ...r, completed: true };
        }
        writeLocal(local);
      }
    } catch {
      /* offline / table missing — local progress still works */
    }
  }
  return Object.values(local).filter((r) => r.completed);
}

/** Mark an activity complete (local immediately, cloud best-effort). */
export async function saveCourseActivity(userId: string | null | undefined, row: CourseProgressRow): Promise<void> {
  const local = readLocal();
  local[row.activity_id] = { ...row, completed: true };
  writeLocal(local);
  if (!userId) return;
  try {
    await db.from("connect_course_progress").upsert({ user_id: userId, ...row, completed: true }, { onConflict: "user_id,activity_id" });
  } catch {
    /* best effort */
  }
}
