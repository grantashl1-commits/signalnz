/**
 * Blocking and reporting in the community. A block hides that member's messages
 * and Nearby entry from you (kept on the device for instant hiding, stored in
 * community_blocks so it follows you); a report goes to community_reports for an
 * admin to review.
 */
import { supabase } from "@/integrations/supabase/client";

const CACHE_KEY = "signal_community_blocked";
export const BLOCKS_CHANGED = "signal:community-blocks-changed";

export const REPORT_REASONS = ["Unkind or harassing", "Spam or selling", "Unsafe or harmful", "Something else"] as const;

export function cachedBlockedIds(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(CACHE_KEY) || "[]")); } catch { return new Set(); }
}

function cache(ids: Set<string>) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify([...ids])); } catch { /* still hidden this visit */ }
  window.dispatchEvent(new Event(BLOCKS_CHANGED));
}

export async function refreshBlockedIds(): Promise<Set<string>> {
  const { data, error } = await supabase.from("community_blocks" as never).select("blocked_id");
  if (error || !data) return cachedBlockedIds();
  const ids = new Set((data as { blocked_id: string }[]).map(r => r.blocked_id));
  cache(ids);
  return ids;
}

export async function blockMember(userId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in to block members.");
  const { error } = await supabase.from("community_blocks" as never).upsert({ blocker_id: user.id, blocked_id: userId } as never);
  if (error) throw error;
  cache(new Set([...cachedBlockedIds(), userId]));
}

export async function unblockMember(userId: string): Promise<void> {
  const { error } = await supabase.from("community_blocks" as never).delete().eq("blocked_id", userId);
  if (error) throw error;
  const ids = cachedBlockedIds();
  ids.delete(userId);
  cache(ids);
}

export async function reportMember(report: { targetUserId: string; messageId?: string; reason: string; details?: string }): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in to report.");
  const { error } = await supabase.from("community_reports" as never).insert({
    reporter_id: user.id,
    target_user_id: report.targetUserId,
    message_id: report.messageId ?? null,
    reason: report.reason,
    details: report.details?.trim() || null,
  } as never);
  if (error) throw error;
}
