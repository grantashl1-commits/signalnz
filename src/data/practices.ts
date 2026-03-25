// ── Practice Data Model ─────────────────────────────────────

import { somaticScripts } from "./somatic-scripts";

export type PracticeMode = "timed-breath" | "narrated-sequence";
export type PracticeCategory = "breathwork" | "somatic" | "meditation";
export type AudioProvider = "elevenlabs" | "manual-upload";

export interface BreathPhase {
  label: string;
  seconds: number;
  cue?: string;
}

export interface PracticeStep {
  id: string;
  title: string;
  body: string;
  startTimeSec?: number;
  endTimeSec?: number;
}

export interface PracticeAudio {
  enabled: boolean;
  audioUrl?: string;
  durationSec?: number;
  voiceName?: string;
  provider?: AudioProvider;
}

export interface PracticeConfig {
  id: string;
  title: string;
  subtitle?: string;
  category: PracticeCategory;
  mode: PracticeMode;
  durationSec: number;
  audio: PracticeAudio;
  phases?: BreathPhase[];
  rounds?: number;
  steps?: PracticeStep[];
  /** @deprecated Use illustrationUrl instead */
  emoji?: string;
  illustrationUrl?: string;
  benefit?: string;
  // future-ready fields
  locale?: string;
  backgroundAudioUrl?: string;
}

// ── Breathwork Practices ────────────────────────────────────

export const BREATHWORK_PRACTICES: PracticeConfig[] = [
  {
    id: "box-breathing",
    title: "Box Breathing",
    subtitle: "Acute stress and focus",
    category: "breathwork",
    mode: "timed-breath",
    durationSec: 192,
    rounds: 12,
    emoji: "◻",
    benefit: "Equalises all four phases of the breath to create immediate nervous system balance.",
    audio: {
      enabled: true,
      audioUrl: "/audio/box-breathing.mp3",
      durationSec: 192,
      voiceName: "SIGNAL Calm",
      provider: "elevenlabs",
    },
    phases: [
      { label: "Inhale", seconds: 4, cue: "Breathe in" },
      { label: "Hold", seconds: 4, cue: "Hold" },
      { label: "Exhale", seconds: 4, cue: "Breathe out" },
      { label: "Hold", seconds: 4, cue: "Hold" },
    ],
  },
  {
    id: "physiological-sigh",
    title: "Physiological Sigh",
    subtitle: "Panic and overwhelm",
    category: "breathwork",
    mode: "timed-breath",
    durationSec: 135,
    rounds: 15,
    emoji: "≋",
    benefit: "The fastest-known way to reduce acute stress. Your body already does this instinctively.",
    audio: {
      enabled: true,
      audioUrl: "/audio/physiological-sigh.mp3",
      durationSec: 135,
      voiceName: "SIGNAL Calm",
      provider: "elevenlabs",
    },
    phases: [
      { label: "Inhale", seconds: 2, cue: "Deep breath in" },
      { label: "Sniff", seconds: 1, cue: "One more sip of air" },
      { label: "Exhale", seconds: 6, cue: "Long slow exhale" },
    ],
  },
  {
    id: "coherent-breathing",
    title: "Coherent Breathing",
    subtitle: "Daily regulation and HRV",
    category: "breathwork",
    mode: "timed-breath",
    durationSec: 300,
    rounds: 30,
    emoji: "〰",
    benefit: "5-5 rhythm synchronises heart rate variability — the gold standard for daily nervous system health.",
    audio: {
      enabled: true,
      audioUrl: "/audio/coherent-breathing.mp3",
      durationSec: 300,
      voiceName: "SIGNAL Calm",
      provider: "elevenlabs",
    },
    phases: [
      { label: "Inhale", seconds: 5, cue: "Breathe in" },
      { label: "Exhale", seconds: 5, cue: "Breathe out" },
    ],
  },
  {
    id: "four-seven-eight",
    title: "4-7-8 Breathing",
    subtitle: "Sleep and deep calm",
    category: "breathwork",
    mode: "timed-breath",
    durationSec: 228,
    rounds: 12,
    emoji: "🌙",
    benefit: "Dr. Weil's natural tranquiliser. The extended hold activates a profound parasympathetic response.",
    audio: {
      enabled: true,
      audioUrl: "/audio/4-7-8.mp3",
      durationSec: 228,
      voiceName: "SIGNAL Calm",
      provider: "elevenlabs",
    },
    phases: [
      { label: "Inhale", seconds: 4, cue: "Breathe in" },
      { label: "Hold", seconds: 7, cue: "Hold gently" },
      { label: "Exhale", seconds: 8, cue: "Slow exhale" },
    ],
  },
];

// ── Somatic Practices ───────────────────────────────────────
// Steps and narrations are sourced from somatic-scripts.ts.
// This array holds the PracticeConfig entries for the player system.


import butterflyHugImg from "@/assets/somatic/butterfly-hug.png";
import grounding54321Img from "@/assets/somatic/grounding-54321.png";
import somaticOrientingImg from "@/assets/somatic/somatic-orienting.png";
import haveningTouchImg from "@/assets/somatic/havening-touch.png";
import neurogenicTremoringImg from "@/assets/somatic/neurogenic-tremoring.png";
import bodyScanImg from "@/assets/somatic/body-scan.png";

const SOMATIC_ILLUSTRATIONS: Record<string, string> = {
  "butterfly-hug": butterflyHugImg,
  "grounding-54321": grounding54321Img,
  "somatic-orienting": somaticOrientingImg,
  "havening-touch": haveningTouchImg,
  "neurogenic-tremoring": neurogenicTremoringImg,
  "body-scan": bodyScanImg,
};

function buildSomaticPractices(): PracticeConfig[] {
  return somaticScripts.map((script) => ({
    id: script.id,
    title: script.title,
    subtitle: script.subtitle,
    category: "somatic" as PracticeCategory,
    mode: "narrated-sequence" as PracticeMode,
    durationSec: script.durationSec,
    illustrationUrl: SOMATIC_ILLUSTRATIONS[script.id],
    benefit: script.description,
    audio: {
      enabled: true,
      audioUrl: `/audio/${script.id}.mp3`,
      durationSec: script.durationSec,
      voiceName: "SIGNAL Calm",
      provider: "elevenlabs" as AudioProvider,
    },
    steps: script.steps,
  }));
}

export const SOMATIC_PRACTICES: PracticeConfig[] = buildSomaticPractices();

// ── All practices combined ──────────────────────────────────

export const ALL_PRACTICES: PracticeConfig[] = [
  ...BREATHWORK_PRACTICES,
  ...SOMATIC_PRACTICES,
];

export function getPracticeById(id: string): PracticeConfig | undefined {
  return ALL_PRACTICES.find((p) => p.id === id);
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (s === 0) return `${m} min`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
