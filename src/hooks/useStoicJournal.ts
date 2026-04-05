// PRIVATE — member content is never used for any AI feature other than
// stoic-journal-ai, which only operates when the member explicitly requests
// "Generate my reflection" for a specific entry.

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface StoicReading {
  id: string;
  seq_day: number;
  title: string;
  author: string;
  source: string;
  quote: string;
  reflection: string;
  journal_prompt: string | null;
  tts_script: string | null;
  duration_sec: number | null;
  month: string | null;
  day_of_month: number | null;
}

export interface StoicLens {
  seq_day: number;
  stoic_title: string;
  bridge_metaphor: string;
  stoic_principle: string;
  carry_forward: string;
  generated_at: string;
}

export interface JournalEntryRow {
  id: string;
  user_id: string;
  content: string | null;
  title: string | null;
  word_count: number | null;
  mood: string | null;
  cycle_phase: string | null;
  cycle_day: number | null;
  cycle_mode: string | null;
  stoic_seq_day: number | null;
  stoic_title: string | null;
  stoic_lens: StoicLens | null;
  created_at: string;
  updated_at: string;
  // legacy fields from existing schema
  prompts: Record<string, string>;
  tags: string[];
  date: string;
  timestamp: number;
}

export function useDailyStoic() {
  const { user } = useAuth();
  const [currentDay, setCurrentDay] = useState(1);
  const [reading, setReading] = useState<StoicReading | null>(null);
  const [listenedToday, setListenedToday] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchReading = useCallback(async (day: number) => {
    const { data: readingData } = await supabase
      .from("daily_stoic_readings")
      .select("*")
      .eq("seq_day", day)
      .maybeSingle();
    if (readingData) setReading(readingData as unknown as StoicReading);
  }, []);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    const fetchProgress = async () => {
      const { data: progress } = await supabase
        .from("member_stoic_progress")
        .select("current_seq_day, last_listened_at")
        .eq("user_id", user.id)
        .maybeSingle();

      const day = progress?.current_seq_day || 1;
      setCurrentDay(day);

      if (progress?.last_listened_at) {
        const today = new Date().toISOString().split("T")[0];
        const lastListened = progress.last_listened_at.split("T")[0];
        setListenedToday(lastListened === today);
      }

      await fetchReading(day);
      setLoading(false);
    };

    fetchProgress();
  }, [user, fetchReading]);

  const markListened = useCallback(async () => {
    if (!user) return;
    const now = new Date().toISOString();

    const { data: existing } = await supabase
      .from("member_stoic_progress")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("member_stoic_progress")
        .update({ last_listened_at: now, updated_at: now })
        .eq("user_id", user.id);
    } else {
      await supabase.from("member_stoic_progress").insert({
        user_id: user.id,
        current_seq_day: 1,
        last_listened_at: now,
        total_days_completed: 0,
      });
    }
    setListenedToday(true);
  }, [user]);

  const advanceDay = useCallback(async () => {
    if (!user) return;
    const nextDay = currentDay >= 366 ? 1 : currentDay + 1;

    await supabase
      .from("member_stoic_progress")
      .update({
        current_seq_day: nextDay,
        total_days_completed: currentDay,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    setCurrentDay(nextDay);
    await fetchReading(nextDay);
  }, [user, currentDay, fetchReading]);

  // Navigate to a specific day without changing progress
  const previewDay = useCallback(async (day: number) => {
    if (day < 1 || day > 366) return;
    await fetchReading(day);
  }, [fetchReading]);

  return { currentDay, reading, listenedToday, loading, markListened, advanceDay, previewDay };
}

export function useJournalEntries2() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntryRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    const { data } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100);

    if (data) setEntries(data as unknown as JournalEntryRow[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const saveEntry = useCallback(async (entry: {
    content: string;
    title?: string;
    word_count?: number;
    mood?: string;
    cycle_phase?: string;
    cycle_day?: number;
    cycle_mode?: string;
    stoic_seq_day?: number;
    stoic_title?: string;
  }) => {
    if (!user) return null;
    const id = crypto.randomUUID();
    const now = new Date();
    const { data, error } = await supabase.from("journal_entries").insert({
      id,
      user_id: user.id,
      content: entry.content,
      title: entry.title || entry.content.slice(0, 60),
      word_count: entry.word_count,
      mood: entry.mood,
      cycle_phase: entry.cycle_phase,
      cycle_day: entry.cycle_day,
      cycle_mode: entry.cycle_mode,
      stoic_seq_day: entry.stoic_seq_day,
      stoic_title: entry.stoic_title,
      date: now.toISOString().split("T")[0],
      timestamp: now.getTime(),
      prompts: {},
      tags: [],
    }).select().single();

    if (data) {
      setEntries((prev) => [data as unknown as JournalEntryRow, ...prev]);
      return data as unknown as JournalEntryRow;
    }
    return null;
  }, [user]);

  const updateStoicLens = useCallback(async (entryId: string, lens: StoicLens) => {
    await supabase
      .from("journal_entries")
      .update({ stoic_lens: JSON.parse(JSON.stringify(lens)) })
      .eq("id", entryId);

    setEntries((prev) =>
      prev.map((e) => (e.id === entryId ? { ...e, stoic_lens: lens } : e))
    );
  }, []);

  return { entries, loading, saveEntry, updateStoicLens, refetch: fetchEntries };
}
