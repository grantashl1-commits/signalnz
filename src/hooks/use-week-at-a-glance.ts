/**
 * Aggregates the last 7 local days of activity across movement, mindfulness,
 * and journal — without ever framing rest as a broken streak.
 *
 * Returns a per-day array (oldest → today) with simple booleans we can dot
 * onto a tiny weekly ribbon.
 */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DayDot {
  date: string;             // yyyy-mm-dd
  weekday: string;          // "M","T","W"...
  isToday: boolean;
  moved: boolean;
  rested: boolean;          // mindfulness / breathwork
  wrote: boolean;           // journal
}

const W = ["S", "M", "T", "W", "T", "F", "S"];

function lastNDates(n: number): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

export function useWeekAtAGlance() {
  const [days, setDays] = useState<DayDot[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const dates = lastNDates(7);
      const since = dates[0];
      const todayStr = dates[6];

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          if (!cancelled) {
            setDays(dates.map((d) => ({
              date: d, weekday: W[new Date(d + "T12:00:00").getDay()],
              isToday: d === todayStr, moved: false, rested: false, wrote: false,
            })));
          }
          return;
        }

        const [{ data: workouts }, { data: mind }] = await Promise.all([
          supabase.from("workout_logs")
            .select("session_date, completed")
            .eq("user_id", user.id)
            .gte("session_date", since),
          supabase.from("mindfulness_logs")
            .select("log_date, completed")
            .eq("user_id", user.id)
            .gte("log_date", since),
        ]);

        // Journal is in localStorage (signal_journal_entries) — read defensively
        let wroteSet = new Set<string>();
        try {
          const raw = localStorage.getItem("signal_journal_entries");
          if (raw) {
            const arr = JSON.parse(raw);
            (Array.isArray(arr) ? arr : []).forEach((e: any) => {
              const d = e?.date || e?.created_at || e?.createdAt;
              if (typeof d === "string") wroteSet.add(d.slice(0, 10));
            });
          }
        } catch {}

        const movedSet = new Set((workouts || []).filter((r: any) => r.completed !== false).map((r: any) => r.session_date));
        const restedSet = new Set((mind || []).filter((r: any) => r.completed !== false).map((r: any) => r.log_date));

        if (cancelled) return;
        setDays(dates.map((d) => ({
          date: d,
          weekday: W[new Date(d + "T12:00:00").getDay()],
          isToday: d === todayStr,
          moved: movedSet.has(d),
          rested: restedSet.has(d),
          wrote: wroteSet.has(d),
        })));
      } catch {
        if (!cancelled) setDays([]);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return days;
}
