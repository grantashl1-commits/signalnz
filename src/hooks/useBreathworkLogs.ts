import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface BreathworkLog {
  id: string;
  practice_key: string;
  practice_title: string | null;
  category: string;
  duration_minutes: number;
  mood: number | null;
  cycle_phase: string | null;
  date: string;
  created_at: string;
}

function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function last7Dates(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return ymd(d);
  });
}

export function useBreathworkLogs() {
  const [logs, setLogs] = useState<BreathworkLog[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const since = new Date();
    since.setDate(since.getDate() - 60);
    const { data } = await supabase
      .from("breathwork_logs" as any)
      .select("*")
      .eq("user_id", user.id)
      .gte("date", ymd(since))
      .order("date", { ascending: false });
    setLogs(((data as any[]) || []) as BreathworkLog[]);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const logPractice = useCallback(async (input: {
    practice_key: string;
    practice_title?: string;
    category?: string;
    duration_minutes: number;
    mood?: number | null;
    cycle_phase?: string | null;
  }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const row = {
      user_id: user.id,
      practice_key: input.practice_key,
      practice_title: input.practice_title ?? null,
      category: input.category ?? "breathwork",
      duration_minutes: Math.max(0, Math.round(input.duration_minutes * 100) / 100),
      mood: input.mood ?? null,
      cycle_phase: input.cycle_phase ?? null,
      date: ymd(new Date()),
    };
    const { data, error } = await supabase.from("breathwork_logs" as any).insert(row).select().single();
    if (!error && data) {
      setLogs(prev => [data as any, ...prev]);
      return (data as any).id as string;
    }
    return null;
  }, []);

  const updateMood = useCallback(async (id: string, mood: number) => {
    await supabase.from("breathwork_logs" as any).update({ mood }).eq("id", id);
    setLogs(prev => prev.map(l => l.id === id ? { ...l, mood } : l));
  }, []);

  // Streak: consecutive days back from today with >=1 log
  const streak = (() => {
    const dates = new Set(logs.map(l => l.date));
    let n = 0;
    const cursor = new Date();
    while (dates.has(ymd(cursor))) {
      n++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return n;
  })();

  // This week (last 7 days)
  const week = last7Dates();
  const weeklyByDay = week.map(date => {
    const total = logs
      .filter(l => l.date === date)
      .reduce((s, l) => s + Number(l.duration_minutes || 0), 0);
    return { date, minutes: Math.round(total) };
  });
  const weekMinutes = weeklyByDay.reduce((s, d) => s + d.minutes, 0);
  const weekSessions = logs.filter(l => week.includes(l.date)).length;

  return {
    logs,
    loading,
    streak,
    weekMinutes,
    weekSessions,
    weeklyByDay,
    logPractice,
    updateMood,
    refresh,
  };
}
