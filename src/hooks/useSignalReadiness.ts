/**
 * useSignalReadiness — Tracks today's activity to determine if Signal is "ready"
 * 
 * Phase 1 (first 7 days): Mystery mode — Signal silently appears when threshold met
 * Phase 2 (day 7+): Transparent mode — shows context chips of what's been collected
 * 
 * Readiness signals (max 5):
 *  ✓ Habits (2+ checked today)
 *  ✓ Journal (wrote today)
 *  ✓ Cycle (logged today or has active tracking)
 *  ✓ Movement (logged today)
 *  ✓ Mood (checked in today)
 * 
 * Unlock threshold: 2 signals + 1 other = ready
 */

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCycle } from "@/contexts/CycleContext";
import { getHabitLog } from "@/data/self-care-rituals";
import { getCheckin } from "@/lib/cycle-utils";

export interface SignalReadinessState {
  /** 0-5 how many data signals are active today */
  signalCount: number;
  /** Max possible signals */
  maxSignals: number;
  /** Whether Signal is unlocked (threshold met) */
  isReady: boolean;
  /** Individual signal statuses */
  signals: {
    habits: boolean;
    journal: boolean;
    cycle: boolean;
    movement: boolean;
    mood: boolean;
  };
  /** Whether user is in mystery phase (first 7 days) or transparent phase */
  phase: "mystery" | "transparent";
  /** Glow intensity 0-1 based on signals collected */
  glowIntensity: number;
  /** Descriptive labels for collected signals */
  contextChips: string[];
}

const UNLOCK_THRESHOLD = 2; // Minimum signals needed

function getFirstSeenDate(): string {
  let date = localStorage.getItem("signal_first_seen_date");
  if (!date) {
    date = new Date().toISOString().split("T")[0];
    localStorage.setItem("signal_first_seen_date", date);
  }
  return date;
}

function getDaysSinceFirstSeen(): number {
  const firstSeen = new Date(getFirstSeenDate());
  const now = new Date();
  const diff = Math.floor((now.getTime() - firstSeen.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

export function useSignalReadiness(): SignalReadinessState {
  const { user } = useAuth();
  const { cycleStartDate } = useCycle();
  const todayStr = new Date().toISOString().split("T")[0];

  // Re-check every 30 seconds for live updates as user completes tasks
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  return useMemo(() => {
    // 1. Check habits (2+ completed today)
    const habitLog = getHabitLog(todayStr);
    const habitsCompleted = Object.values(habitLog).filter(Boolean).length;
    const habitsReady = habitsCompleted >= 2;

    // 2. Check journal (wrote today)
    let journalReady = false;
    try {
      const journalRaw = localStorage.getItem("signal_journal_entries");
      if (journalRaw) {
        const entries = JSON.parse(journalRaw);
        if (Array.isArray(entries)) {
          journalReady = entries.some((e: any) => e.date === todayStr);
        }
      }
      // Also check supabase-synced entries
      const recentJournal = localStorage.getItem("signal_last_journal_date");
      if (recentJournal === todayStr) journalReady = true;
    } catch {}

    // 3. Check cycle (has active tracking)
    const cycleReady = !!cycleStartDate;

    // 4. Check movement (logged today)
    let movementReady = false;
    try {
      const movementLog = localStorage.getItem("signal_movement_log");
      if (movementLog) {
        const parsed = JSON.parse(movementLog);
        movementReady = parsed?.lastDate === todayStr;
      }
    } catch {}

    // 5. Check mood (checked in today)
    const mood = getCheckin();
    const moodReady = !!mood;

    const signals = {
      habits: habitsReady,
      journal: journalReady,
      cycle: cycleReady,
      movement: movementReady,
      mood: moodReady,
    };

    const signalCount = Object.values(signals).filter(Boolean).length;
    const maxSignals = 5;
    const isReady = signalCount >= UNLOCK_THRESHOLD;
    const glowIntensity = Math.min(signalCount / maxSignals, 1);

    // Phase determination
    const daysSinceFirst = getDaysSinceFirstSeen();
    const phase: "mystery" | "transparent" = daysSinceFirst >= 7 ? "transparent" : "mystery";

    // Context chips for transparent phase
    const contextChips: string[] = [];
    if (habitsReady) contextChips.push(`${habitsCompleted} habits`);
    if (journalReady) contextChips.push("journal");
    if (cycleReady) contextChips.push("cycle");
    if (movementReady) contextChips.push("movement");
    if (moodReady) contextChips.push("mood");

    return {
      signalCount,
      maxSignals,
      isReady,
      signals,
      phase,
      glowIntensity,
      contextChips,
    };
  }, [todayStr, cycleStartDate, tick]);
}
