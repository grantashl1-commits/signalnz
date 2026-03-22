import { useMemo } from "react";
import { useCycle } from "@/contexts/CycleContext";
import {
  getCheckin,
  getRecentSymptoms, getRecentMoods, getWaterCount,
  PHASE_SHORT,
} from "@/lib/cycle-utils";
import { getHabits, getHabitLog } from "@/data/self-care-rituals";

export interface SignalContext {
  cycleDay: number;
  phase: string;
  phaseFull: string;
  mood: string | null;
  habitsCompleted: number;
  habitsTotal: number;
  timeOfDay: string;
  recentJournal: string | null;
  symptoms: string | null;
  water: number;
}

function getTimeOfDay(): string {
  const h = new Date().getHours();
  if (h < 6) return "early morning";
  if (h < 12) return "morning";
  if (h < 14) return "midday";
  if (h < 17) return "afternoon";
  if (h < 20) return "evening";
  return "night";
}

export function useSignalContext(): SignalContext {
  const { currentPhase, currentCycleDay } = useCycle();
  return useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const habits = getHabits();
    const habitLog = getHabitLog(todayStr);
    const habitsCompleted = Object.values(habitLog).filter(Boolean).length;
    const mood = getCheckin();
    const recentSymptoms = getRecentSymptoms(3).flatMap(s => s.symptoms);
    const recentMoods = getRecentMoods(2).flatMap(m => m.moods);

    // Check for recent journal entries
    let recentJournal: string | null = null;
    try {
      const journalRaw = localStorage.getItem("signal_journal_entries");
      if (journalRaw) {
        const entries = JSON.parse(journalRaw);
        if (Array.isArray(entries) && entries.length > 0) {
          const latest = entries[entries.length - 1];
          recentJournal = latest.title || latest.text?.slice(0, 100) || null;
        }
      }
    } catch {}

    return {
      cycleDay: info.cycleDay,
      phase: PHASE_SHORT[info.phase],
      phaseFull: info.phase,
      mood,
      habitsCompleted,
      habitsTotal: habits.length,
      timeOfDay: getTimeOfDay(),
      recentJournal,
      symptoms: recentSymptoms.length > 0 ? recentSymptoms.join(", ") : null,
      water: getWaterCount(),
    };
  }, []);
}

export const SIGNAL_MODES = [
  { id: "today", label: "Today", description: "Orientation for the day ahead" },
  { id: "right-now", label: "Right now", description: "What this moment needs" },
  { id: "tonight", label: "Tonight", description: "Evening wind-down" },
  { id: "this-week", label: "This week", description: "Weekly rhythm and patterns" },
  { id: "deeper-insight", label: "Deeper insight", description: "Reflective pattern reading" },
] as const;

export type SignalMode = typeof SIGNAL_MODES[number]["id"];

export interface SignalResponse {
  headline: string;
  interpretation: string;
  leanInto: string;
  soften: string;
  action: string;
  practice: string | null;
  followUps: string[];
}

export const PROMPT_CHIPS: Record<string, string[]> = {
  general: [
    "Give me a signal that I'm on the right track",
    "Why do I feel off today?",
    "What does my body need right now?",
    "What should I lean into today?",
    "What should I stop forcing?",
    "Give me a signal for tonight",
    "Read the pattern beneath this feeling",
    "Help me come back to myself",
  ],
  home: [
    "Why do I feel like this?",
    "What should I focus on today?",
    "What would support me most?",
    "Give me a 2-minute reset",
  ],
  journal: [
    "Give me a signal from this entry",
    "Read the pattern",
    "Turn this into clarity",
  ],
  dream: [
    "Give me a signal for the life I'm building",
    "What wants nurturing next?",
    "What is this vision asking of me?",
  ],
  movement: [
    "Give me a signal for my body today",
    "Should I push, maintain, or soften?",
    "Adapt this workout to my energy",
  ],
  nutrition: [
    "Give me a signal for what to eat today",
    "What would support my energy?",
    "Adapt this meal to my needs",
  ],
  cycle: [
    "What is this phase asking of me?",
    "What should I expect next?",
    "Translate my hormones into real life",
  ],
  breathwork: [
    "Give me a signal for my nervous system",
    "What practice fits how I feel?",
    "I'm overwhelmed",
    "I need grounding before bed",
  ],
  community: [
    "Give me a signal for connection",
    "Where might I feel most supported?",
    "What kind of community energy do I need?",
  ],
};
