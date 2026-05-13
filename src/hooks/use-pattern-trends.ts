/**
 * Roll up the last 8 weeks of `workout_logs` into per-pattern session
 * counts. Returns one bucket per movement pattern, suitable for a
 * lightweight inline sparkline on the Progress tab.
 */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { patternsForSession, PATTERN_LABEL, type MovementPattern } from "@/lib/movement-patterns";

const WEEKS = 8;

export interface PatternTrend {
  pattern: MovementPattern;
  label: string;
  series: number[]; // length = WEEKS, oldest → newest
  total: number;
  thisWeek: number;
  lastWeek: number;
}

function startOfISOWeek(d: Date): Date {
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7; // Mon=0
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
}

function weekIndex(date: Date, anchor: Date): number {
  const ms = startOfISOWeek(date).getTime() - anchor.getTime();
  return Math.floor(ms / (7 * 24 * 60 * 60 * 1000));
}

export function usePatternTrends() {
  const [trends, setTrends] = useState<PatternTrend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const anchor = startOfISOWeek(new Date());
      anchor.setDate(anchor.getDate() - 7 * (WEEKS - 1));
      const sinceISO = anchor.toISOString().slice(0, 10);

      const { data } = await supabase
        .from("workout_logs")
        .select("session_date, exercises, notes")
        .eq("user_id", user.id)
        .eq("completed", true)
        .gte("session_date", sinceISO)
        .order("session_date", { ascending: true });

      if (cancelled) return;

      const buckets: Record<MovementPattern, number[]> = {
        push: Array(WEEKS).fill(0),
        pull: Array(WEEKS).fill(0),
        hinge: Array(WEEKS).fill(0),
        squat: Array(WEEKS).fill(0),
        carry: Array(WEEKS).fill(0),
        cardio: Array(WEEKS).fill(0),
        mobility: Array(WEEKS).fill(0),
      };

      for (const row of data || []) {
        const date = new Date(row.session_date);
        const wi = weekIndex(date, anchor);
        if (wi < 0 || wi >= WEEKS) continue;
        const patterns = patternsForSession(row.exercises as any[], row.notes ?? undefined);
        for (const p of patterns) buckets[p][wi] += 1;
      }

      const result: PatternTrend[] = (Object.keys(buckets) as MovementPattern[]).map(p => {
        const series = buckets[p];
        return {
          pattern: p,
          label: PATTERN_LABEL[p],
          series,
          total: series.reduce((a, b) => a + b, 0),
          thisWeek: series[WEEKS - 1] || 0,
          lastWeek: series[WEEKS - 2] || 0,
        };
      });

      setTrends(result);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  return { trends, loading, weeks: WEEKS };
}
