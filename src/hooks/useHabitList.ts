/**
 * useHabitList — Supabase-backed habit list sync.
 * Reads/writes to localStorage for instant UI, syncs to profiles.habits
 * so the user's habit list is restored on any device or new session.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getHabits, saveHabits, type Habit } from "@/data/self-care-rituals";

export function useHabitList() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>(() => getHabits());
  const synced = useRef(false);

  // On login, pull from Supabase and merge (Supabase is authoritative)
  useEffect(() => {
    if (!user || synced.current) return;
    synced.current = true;

    const load = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("habits")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error || !data) return;
      const cloudHabits: Habit[] = (data as any).habits || [];
      if (cloudHabits.length > 0) {
        // Merge: keep local habits not in cloud, but cloud is authoritative for existing ids
        const local = getHabits();
        const cloudIds = new Set(cloudHabits.map((h) => h.id));
        const localOnly = local.filter((h) => !cloudIds.has(h.id));
        const merged = [...cloudHabits, ...localOnly];
        saveHabits(merged);
        setHabits(merged);
      } else if (habits.length > 0) {
        // Nothing in cloud yet — push local habits up
        pushToSupabase(habits, user.id);
      }
    };

    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Listen for localStorage changes (from HabitLibraryPicker's addHabit calls)
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === "mindcast_habits") {
        const updated = getHabits();
        setHabits(updated);
        if (user) pushToSupabase(updated, user.id);
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [user]);

  const pushToSupabase = (list: Habit[], userId: string) => {
    supabase
      .from("profiles")
      .upsert({ user_id: userId, habits: list as any } as any, { onConflict: "user_id" })
      .catch(() => {});
  };

  const removeHabit = useCallback((id: string) => {
    const updated = habits.filter((h) => h.id !== id);
    saveHabits(updated);
    setHabits(updated);
    if (user) pushToSupabase(updated, user.id);
  }, [habits, user]);

  const refreshHabits = useCallback(() => {
    const updated = getHabits();
    setHabits(updated);
    if (user) pushToSupabase(updated, user.id);
  }, [user]);

  return { habits, removeHabit, refreshHabits };
}
