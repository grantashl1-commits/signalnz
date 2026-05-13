/**
 * Phase-aware warm-up and cool-down sequences shown above/below the
 * main session structure on the Today card. Short, body-led, no kit.
 */
import type { Phase } from "@/lib/cycle-utils";

export interface MicroSequence {
  title: string;
  durationMin: number;
  moves: string[];
}

const WARMUP: Record<Phase, MicroSequence> = {
  menstrual: {
    title: "Slow warm-up",
    durationMin: 4,
    moves: [
      "Cat-cow x 8 — soften through the spine",
      "Standing forward fold — let the head hang",
      "Hip circles x 6 each way",
      "Two slow rounds of child's pose breathing",
    ],
  },
  follicular: {
    title: "Wake-up warm-up",
    durationMin: 5,
    moves: [
      "Marching on the spot — 60 sec",
      "Arm circles x 10 each way",
      "Bodyweight squats x 10 — slow and full",
      "World's greatest stretch x 4 each side",
    ],
  },
  ovulatory: {
    title: "Power warm-up",
    durationMin: 6,
    moves: [
      "Jumping jacks — 45 sec",
      "Inchworms x 6",
      "Glute bridges x 12",
      "Cossack squats x 6 each side",
      "Two reactive jumps + hold the landing",
    ],
  },
  luteal: {
    title: "Steady warm-up",
    durationMin: 5,
    moves: [
      "Slow march — 60 sec",
      "Hip openers x 8 each side",
      "Bird-dog x 8 each side",
      "Bodyweight squats x 8",
    ],
  },
};

const COOLDOWN: Record<Phase, MicroSequence> = {
  menstrual: {
    title: "Restorative cool-down",
    durationMin: 6,
    moves: [
      "Legs up the wall — 2 min, slow breath",
      "Supine twist — 60 sec each side",
      "Child's pose — 60 sec, exhale longer than inhale",
    ],
  },
  follicular: {
    title: "Soft cool-down",
    durationMin: 5,
    moves: [
      "Forward fold — 45 sec",
      "Pigeon — 60 sec each side",
      "Supine hamstring stretch — 45 sec each side",
      "Box breathing — 1 min",
    ],
  },
  ovulatory: {
    title: "Open cool-down",
    durationMin: 5,
    moves: [
      "Down-dog walks — 60 sec",
      "Pigeon — 45 sec each side",
      "Thread the needle — 30 sec each side",
      "Slow nasal breath — 1 min",
    ],
  },
  luteal: {
    title: "Wind-down cool-down",
    durationMin: 6,
    moves: [
      "Reclined butterfly — 90 sec",
      "Supine twist — 60 sec each side",
      "Legs up the wall — 90 sec",
      "Long exhales — 4 in, 8 out, 6 rounds",
    ],
  },
};

export function getWarmup(phase: Phase): MicroSequence {
  return WARMUP[phase];
}

export function getCooldown(phase: Phase): MicroSequence {
  return COOLDOWN[phase];
}

const PREF_KEY = "signal_warmup_cooldown_pref_v1";
type Pref = { warmup: boolean; cooldown: boolean };
const DEFAULT: Pref = { warmup: true, cooldown: true };

export function getWarmupCooldownPref(): Pref {
  if (typeof window === "undefined") return DEFAULT;
  try {
    return { ...DEFAULT, ...JSON.parse(window.localStorage.getItem(PREF_KEY) || "{}") };
  } catch {
    return DEFAULT;
  }
}

export function setWarmupCooldownPref(p: Pref) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PREF_KEY, JSON.stringify(p));
}
