/**
 * Maps a Library exercise to the cycle phase where it tends to land best,
 * based on its category and body part. This is a soft suggestion — the user
 * can do anything, anytime — but the tag helps surface what's in tune today.
 */
import type { Phase } from "@/lib/cycle-utils";

export interface PhaseSuggestion {
  phase: Phase;
  reason: string;
}

const CATEGORY_PHASE: Record<string, Phase> = {
  power: "ovulatory",
  strength: "ovulatory",
  cardio: "follicular",
  hiit: "ovulatory",
  pilates: "luteal",
  yoga: "menstrual",
  stretch: "menstrual",
  mobility: "menstrual",
  rehabilitation: "menstrual",
  rehab: "menstrual",
  recovery: "menstrual",
  endurance: "follicular",
};

const REASON: Record<Phase, string> = {
  menstrual: "Best in your inward week",
  follicular: "Rising-energy days",
  ovulatory: "Peak-power window",
  luteal: "Steady, grounded effort",
};

export function suggestPhaseForExercise(ex: {
  category?: string | null;
  body_part?: string | null;
  target?: string | null;
}): PhaseSuggestion {
  const cat = (ex.category || "").toLowerCase().trim();
  const phase = CATEGORY_PHASE[cat] || "follicular";
  return { phase, reason: REASON[phase] };
}
