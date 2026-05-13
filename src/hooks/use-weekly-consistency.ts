/**
 * Counts the distinct local days in the last 7 on which the user logged a
 * workout. Mirrors the "days you returned" framing used on the Account
 * page — we never call rest days a "broken streak".
 */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useWeeklyConsistency() {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setDays(0); return; }
        const since = new Date();
        since.setDate(since.getDate() - 6);
        const sinceStr = since.toISOString().slice(0, 10);
        const { data } = await supabase
          .from("workout_logs")
          .select("session_date")
          .eq("user_id", user.id)
          .gte("session_date", sinceStr);
        if (cancelled) return;
        const uniq = new Set((data || []).map((r: any) => r.session_date));
        setDays(uniq.size);
      } catch {
        if (!cancelled) setDays(0);
      }
    })();
    const refresh = () => {
      // re-run on next tick by triggering effect; cheap to re-mount via state nudge
      setDays(null);
    };
    window.addEventListener("signal:training-path-changed", refresh);
    return () => {
      cancelled = true;
      window.removeEventListener("signal:training-path-changed", refresh);
    };
  }, [days === null]);

  return days ?? 0;
}
