/**
 * Workout rotation engine — assigns a workout to each day of the week
 * based on user body goals and current cycle phase.
 */
import type { Phase } from "@/lib/cycle-utils";

// ─── Goal-based weekly templates ────────────────────
// Each entry is Mon–Sun (index 0–6). Values are semantic slot names
// that map to phase-specific workout IDs.
type Slot = "lower" | "upper" | "full" | "glutes-core" | "pilates" | "mobility" | "rest" | "cardio-walk";

const GOAL_TEMPLATES: Record<string, Slot[]> = {
  "lose-weight":        ["lower", "cardio-walk", "full", "rest", "upper", "glutes-core", "rest"],
  "gain-muscle":        ["upper", "lower", "rest", "full", "glutes-core", "mobility", "rest"],
  "tone-define":        ["full", "pilates", "lower", "rest", "upper", "glutes-core", "rest"],
  "improve-flexibility":["mobility", "pilates", "mobility", "rest", "pilates", "mobility", "rest"],
  "stress-relief":      ["mobility", "pilates", "rest", "mobility", "pilates", "rest", "cardio-walk"],
};

const DEFAULT_TEMPLATE: Slot[] = ["upper", "lower", "full", "rest", "glutes-core", "mobility", "rest"];

// ─── Phase-specific workout ID maps ────────────────
// Each slot maps to a real workout ID per phase.
const SLOT_TO_ID: Record<Phase, Record<Slot, string>> = {
  menstrual: {
    lower: "menstrual-full-body-a",     // gentler full body as substitute
    upper: "menstrual-full-body-b",
    full: "menstrual-full-body-a",
    "glutes-core": "menstrual-full-body-b",
    pilates: "rest-walk-restore",       // no dedicated pilates in menstrual
    mobility: "rest-walk-restore",
    rest: "rest-walk-restore",
    "cardio-walk": "rest-walk-restore",
  },
  follicular: {
    lower: "lower-body-a",
    upper: "upper-body-a",
    full: "full-body-a",
    "glutes-core": "lower-body-b",
    pilates: "full-body-b",
    mobility: "rest-walk-restore",
    rest: "rest-walk-restore",
    "cardio-walk": "rest-walk-restore",
  },
  ovulatory: {
    lower: "ovu-lower-power",
    upper: "ovu-upper-strength",
    full: "ovu-power-full-body",
    "glutes-core": "ovu-core-stability",
    pilates: "ovu-athletic-conditioning",
    mobility: "ovu-mobility-flow",
    rest: "rest-walk-restore",
    "cardio-walk": "rest-walk-restore",
  },
  luteal: {
    lower: "lut-lower-strength",
    upper: "lut-upper-strength",
    full: "lut-full-body-strength",
    "glutes-core": "lut-glutes-core",
    pilates: "lut-pilates-strength",
    mobility: "lut-mobility-flow",
    rest: "rest-walk-restore",
    "cardio-walk": "rest-walk-restore",
  },
};

// ─── Phase intensity adjustments ───────────────────
// Menstrual: max 1 strength, rest is gentle
// Ovulatory: keep template as-is (peak)
// Luteal: keep template but swap one strength for mobility
function applyPhaseOverrides(template: Slot[], phase: Phase): Slot[] {
  const out = [...template];

  if (phase === "menstrual") {
    // Cap strength at 1, convert extras to rest/mobility
    let strengthCount = 0;
    for (let i = 0; i < out.length; i++) {
      const s = out[i];
      if (s === "lower" || s === "upper" || s === "full" || s === "glutes-core") {
        strengthCount++;
        if (strengthCount > 1) {
          out[i] = strengthCount === 2 ? "mobility" : "rest";
        }
      }
      // Replace cardio-walk with rest
      if (s === "cardio-walk") out[i] = "rest";
    }
    return out;
  }

  if (phase === "luteal") {
    // Replace last strength slot with pilates or mobility
    for (let i = out.length - 1; i >= 0; i--) {
      if (out[i] === "lower" || out[i] === "upper" || out[i] === "full" || out[i] === "glutes-core") {
        out[i] = "pilates";
        break;
      }
    }
    return out;
  }

  return out; // follicular and ovulatory unchanged
}

// ─── Blend multiple goals ──────────────────────────
function blendTemplates(goals: string[]): Slot[] {
  if (goals.length === 0) return DEFAULT_TEMPLATE;
  if (goals.length === 1) return GOAL_TEMPLATES[goals[0]] || DEFAULT_TEMPLATE;

  // Score each slot by frequency across selected goal templates
  const slotScores: Record<number, Record<Slot, number>> = {};
  for (let day = 0; day < 7; day++) {
    slotScores[day] = {} as Record<Slot, number>;
    for (const g of goals) {
      const t = GOAL_TEMPLATES[g] || DEFAULT_TEMPLATE;
      const slot = t[day];
      slotScores[day][slot] = (slotScores[day][slot] || 0) + 1;
    }
  }

  const blended: Slot[] = [];
  for (let day = 0; day < 7; day++) {
    const entries = Object.entries(slotScores[day]) as [Slot, number][];
    entries.sort((a, b) => b[1] - a[1]);
    blended.push(entries[0][0]);
  }

  // Safety: never 3 consecutive strength days
  for (let i = 2; i < blended.length; i++) {
    const isStrength = (s: Slot) => ["lower", "upper", "full", "glutes-core"].includes(s);
    if (isStrength(blended[i]) && isStrength(blended[i - 1]) && isStrength(blended[i - 2])) {
      blended[i] = "rest";
    }
  }

  return blended;
}

// ─── Public API ────────────────────────────────────

export interface DayAssignment {
  dayIndex: number;   // 0=Mon, 6=Sun
  dayLabel: string;
  slot: Slot;
  workoutId: string;
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/**
 * Returns the 7-day workout rotation for the current phase + goals.
 */
export function getWeeklyRotation(phase: Phase, bodyGoals: string[]): DayAssignment[] {
  const base = blendTemplates(bodyGoals);
  const adjusted = applyPhaseOverrides(base, phase);
  const slotMap = SLOT_TO_ID[phase];

  return adjusted.map((slot, i) => ({
    dayIndex: i,
    dayLabel: DAY_LABELS[i],
    slot,
    workoutId: slotMap[slot],
  }));
}

/**
 * Returns today's workout assignment.
 * dayOfWeek: JS Date.getDay() (0=Sun, 1=Mon, ..., 6=Sat)
 */
export function getTodayAssignment(phase: Phase, bodyGoals: string[], dayOfWeek: number): DayAssignment {
  const rotation = getWeeklyRotation(phase, bodyGoals);
  const scheduleIdx = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // convert to Mon=0
  return rotation[scheduleIdx];
}

/** Phase guidance messages */
export const PHASE_GUIDANCE: Record<Phase, string> = {
  menstrual: "Honour your body — rest is productive.",
  follicular: "Estrogen is rising — try heavier weights or new challenges.",
  ovulatory: "Peak energy — push if it feels good.",
  luteal: "Drop intensity 20% if needed. Listen to your body.",
};
