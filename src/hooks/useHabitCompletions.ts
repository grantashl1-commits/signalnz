/**
 * Phase 5B — useHabitCompletions
 *
 * Manages habit completion state with dual persistence:
 * - localStorage for instant reads/writes (no loading flicker)
 * - Supabase habit_completions table for cross-device sync + 4-week history
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  getHabitLog,
  setHabitLog,
  toggleHabitForDate,
} from "@/data/self-care-rituals";

/** Returns a set of habitIds completed on a given date, from Supabase rows */
function rowsToDateMap(
  rows: { habit_id: string; completed_date: string }[]
): Record<string, Set<string>> {
  const map: Record<string, Set<string>> = {};
  rows.forEach(({ habit_id, completed_date }) => {
    if (!map[completed_date]) map[completed_date] = new Set();
    map[completed_date].add(habit_id);
  });
  return map;
}

export interface HabitCompletionsResult {
  /** Set of habitIds completed today */
  completedIds: Set<string>;
  /** Toggle a habit for today — optimistic, syncs to Supabase */
  toggle: (habitId: string) => Promise<void>;
  /** 28-day history: date string → Set of completed habitIds */
  history: Record<string, Set<string>>;
  /** Whether the Supabase history is loading */
  historyLoading: boolean;
}

export function useHabitCompletions(): HabitCompletionsResult {
  const { user } = useAuth();
  const todayStr = new Date().toISOString().split("T")[0];
  const supabaseLoaded = useRef(false);

  // Initialise from localStorage for zero-latency first render
  const [completedIds, setCompletedIds] = useState<Set<string>>(() => {
    const log = getHabitLog(todayStr);
    return new Set(Object.keys(log).filter((k) => log[k]));
  });

  const [history, setHistory] = useState<Record<string, Set<string>>>({});
  const [historyLoading, setHistoryLoading] = useState(false);

  // Load today's completions + 28-day history from Supabase on mount
  useEffect(() => {
    if (!user || supabaseLoaded.current) return;
    supabaseLoaded.current = true;

    const load = async () => {
      setHistoryLoading(true);
      try {
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - 28);
        const fromStr = fromDate.toISOString().split("T")[0];

        const { data, error } = await (supabase as any)
          .from("habit_completions")
          .select("habit_id, completed_date")
          .eq("user_id", user.id)
          .gte("completed_date", fromStr)
          .order("completed_date", { ascending: true });

        if (error) throw error;
        if (data) {
          const hist = rowsToDateMap(data);
          setHistory(hist);

          // Use Supabase as authoritative source for today's completions
          const todaySet = hist[todayStr] ?? new Set<string>();
          setCompletedIds(todaySet);

          // Sync back to localStorage
          const log: Record<string, boolean> = {};
          todaySet.forEach((id) => { log[id] = true; });
          setHabitLog(todayStr, log);
        }
      } catch {
      } finally {
        setHistoryLoading(false);
      }
    };

    load();
  }, [user, todayStr]);

  const toggle = useCallback(
    async (habitId: string) => {
      const wasCompleted = completedIds.has(habitId);

      // 1. Optimistic UI update
      setCompletedIds((prev) => {
        const next = new Set(prev);
        wasCompleted ? next.delete(habitId) : next.add(habitId);
        return next;
      });

      // 2. localStorage sync (instant)
      toggleHabitForDate(todayStr, habitId);

      // 3. Update history state
      setHistory((prev) => {
        const next = { ...prev };
        const day = next[todayStr] ? new Set(next[todayStr]) : new Set<string>();
        wasCompleted ? day.delete(habitId) : day.add(habitId);
        next[todayStr] = day;
        return next;
      });

      // 4. Supabase sync (background)
      if (!user) return;
      try {
        if (wasCompleted) {
          await (supabase as any)
            .from("habit_completions")
            .delete()
            .eq("user_id", user.id)
            .eq("habit_id", habitId)
            .eq("completed_date", todayStr);
        } else {
          await (supabase as any)
            .from("habit_completions")
            .upsert(
              {
                user_id: user.id,
                habit_id: habitId,
                completed_date: todayStr,
                completed_at: new Date().toISOString(),
              },
              { onConflict: "user_id,habit_id,completed_date" }
            );
        }
      } catch {
        // Roll back optimistic update on failure
        setCompletedIds((prev) => {
          const next = new Set(prev);
          wasCompleted ? next.add(habitId) : next.delete(habitId);
          return next;
        });
        toggleHabitForDate(todayStr, habitId); // revert localStorage too
      }
    },
    [user, todayStr, completedIds]
  );

  return { completedIds, toggle, history, historyLoading };
}
