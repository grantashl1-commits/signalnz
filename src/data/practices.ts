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
  ttsScript?: string;
<<<<<<< Updated upstream
  /** ElevenLabs voice id override (per-script). */
  ttsVoiceId?: string;
  /** Marks this practice as a sleep reading — uses slower, sleep-tuned voice settings. */
  ttsIsSleep?: boolean;
  /** Free-text source/author used to auto-pick a voice when ttsVoiceId is absent. */
  ttsEvidenceSource?: string;
=======
  voiceId?: string;
>>>>>>> Stashed changes
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
    ttsScript: `Welcome. [pause] Let’s take a moment to settle in. [pause] Find a comfortable position, wherever you are. [long pause]

Today, we’ll practice Box Breathing. [pause] This simple, rhythmic breath helps to gently reset your nervous system, bringing a sense of calm and balance. [long pause]

The pattern is simple: We’ll breathe in for four counts, [pause] hold for four, [pause] breathe out for four, [pause] and hold again for four. [pause] We’ll repeat this square rhythm together.

Let’s begin. [pause]

Breathe in, two, three, four. [pause]
Hold, two, three, four. [pause]
Breathe out, two, three, four. [pause]
Hold, two, three, four. [long pause]

Breathe in, two, three, four. [pause]
Hold, two, three, four. [pause]
Breathe out, two, three, four. [pause]
Hold, two, three, four. [long pause]

Just letting your body settle into this rhythm. [pause]

Breathe in. [pause]
Hold. [long pause]
Breathe out. [long pause]
Hold. [long pause]

Breathe in. [long pause]
Hold. [long pause]
Breathe out. [long pause]
Hold. [long pause]

Finding your own natural flow now. [long pause]

Breathe in. [long pause]
Hold. [long pause]
Breathe out. [long pause]
Hold. [long pause]

Breathe in. [long pause]
Hold. [long pause]
Breathe out. [long pause]
Hold. [long pause]

Just a few more rounds, sensing the balance you’re creating. [long pause]

Breathe in. [long pause]
Hold. [long pause]
Breathe out. [long pause]
Hold. [long pause]

Breathe in. [long pause]
Hold. [long pause]
Breathe out. [long pause]
Hold. [long pause]

This is your final round. [long pause]

Breathe in. [long pause]
Hold. [long pause]
Breathe out. [long pause]
Hold. [long pause]

Now, just release the count. [pause] Allow your breath to return to its natural rhythm. [long pause]

Notice how your body feels. [pause] You’ve offered your nervous system a gentle reset, [pause] creating a quiet space within. [long pause]

Take this feeling with you as you move into the rest of your day. [long pause]`,
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
    ttsScript: `Welcome. [pause] Settle into your space. [pause] Let's bring a little calm to your system. [pause]

Today, we’ll be practicing the Physiological Sigh. [pause] It’s a powerful way your body naturally reduces stress, and we’re going to guide it intentionally. [long pause]

Here's how it works: You'll take a deep breath in through your nose, then, right before you exhale, take another quick, short sip of air. [pause] Think of it like two inhales back to back. [long pause] Then you'll breathe out slowly, fully, and completely through your mouth, as if you’re sighing out all the tension. [pause] No need to force anything, just a gentle, long exhale. [long pause]

Let's begin. [pause]

Breathe in... [pause]
And take another little sip of air... [pause]
Now, sigh it out slowly, completely. [long pause]

Breathe in... [long pause]
Sip... [pause]
And exhale, releasing everything. [long pause]

Just like that. [pause] Your body knows what to do. [long pause]

Breathe in... [long pause]
Sip... [pause]
Breathe out. [long pause]

In... [long pause]
Sip... [pause]
Out. [long pause]

In... [long pause]
Sip... [pause]
Out. [long pause]

Continue at your own pace now, for a few more rounds. [pause] Just the double inhale, followed by that long, sighing exhale. [long pause]

You’re doing beautifully. [long pause]
Each exhale is a moment of release. [long pause]

One more round now. [long pause]

And a final, gentle exhale. [long pause]

Allow your breath to return to its natural rhythm. [long pause] Notice any shifts in your body, in your mind. [long pause] You’ve just offered your nervous system a beautiful gift of calm. [long pause] Carry this feeling with you. [long pause]`,
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
    ttsScript: `Welcome. [pause] Settle into your space now. [pause] Let’s bring your attention gently inward. [long pause]

Today, we're going to explore Coherent Breathing. [pause] This rhythmic practice is a wonderful way to harmonize your nervous system, bringing a sense of calm and balance. [long pause]

Our pattern will be a gentle inhale for a count of five, [pause] and then a smooth exhale for a count of five. [pause] There’s no need to strain or push. [pause] Simply allow your breath to flow naturally with the rhythm. [long pause]

Let's begin. [long pause]

Breathe in, two, three, four, five. [pause]
Breathe out, two, three, four, five. [long pause]

Breathe in, two, three, four, five. [pause]
Breathe out, two, three, four, five. [long pause]

Feel the gentle expansion and release. [pause]

Breathe in, two, three, four, five. [pause]
Breathe out, two, three, four, five. [long pause]

Breathe in. [long pause]
Breathe out. [long pause]

Finding your natural rhythm here. [pause]

Breathe in. [long pause]
Breathe out. [long pause]

Allow your body to soften with each exhale. [pause]

Breathe in. [long pause]
Breathe out. [long pause]

Breathe in. [long pause]
Breathe out. [long pause]

Just noticing the rise and fall. [pause]

Breathe in. [long pause]
Breathe out. [long pause]

Breathe in. [long pause]
Breathe out. [long pause]

You’re doing beautifully. [long pause]

Breathe in. [long pause]
Breathe out. [long pause]

Breathe in. [long pause]
Breathe out. [long pause]

Continue to let your breath flow. [long pause]

Breathe in. [long pause]
Breathe out. [long pause]

Breathe in. [long pause]
Breathe out. [long pause]

Almost there. [long pause]

Breathe in, two, three, four, five. [pause]
Breathe out, two, three, four, five. [long pause]

One last round with this rhythm. [pause]

Breathe in, two, three, four, five. [pause]
Breathe out, two, three, four, five. [long pause]

Now, allow your breath to return to its natural pace. [long pause] Take a moment to notice how you feel. [pause] You’ve just offered a beautiful gift to your nervous system, [pause] supporting its ability to find calm and resilience. [long pause] Carry this gentle awareness with you as you move forward.`,
  },
  {
    id: "four-seven-eight",
    title: "4-7-8 Breathing",
    subtitle: "Sleep and deep calm",
    category: "breathwork",
    mode: "timed-breath",
    durationSec: 228,
    rounds: 12,
    emoji: "☽",
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
    ttsScript: `Welcome. [pause] Take a moment to just settle in. [pause] Find a comfortable position, [pause] allowing your body to soften wherever it can. [long pause]

Today, we'll explore 4-7-8 breathing, a simple yet powerful technique that acts like a natural tranquilizer for your nervous system. [pause] It’s especially wonderful for unwinding and preparing for rest. [long pause]

Here’s how it works: you'll gently inhale through your nose for a count of four, [pause] hold your breath for a count of seven, [pause] and then exhale completely through your mouth, [pause] making a soft whooshing sound, [pause] for a count of eight. [pause] Let’s try it together. [long pause]

Breathe in. [pause] Two, three, four. [pause]
Hold. [long pause] Two, three, four, five, six, seven. [long pause]
Breathe out. [long pause] Two, three, four, five, six, seven, eight. [long pause]

Let’s go again. [pause] Relaxing into the rhythm. [pause]

Breathe in. [pause] Two, three, four. [pause]
Hold. [long pause] Two, three, four, five, six, seven. [long pause]
Breathe out. [long pause] Two, three, four, five, six, seven, eight. [long pause]

Feeling your body soften with each exhalation. [pause]

Breathe in. [pause]
Hold. [long pause]
Breathe out. [long pause]

Inhaling calm. [pause] Releasing tension. [pause]

Breathe in. [pause]
Hold. [long pause]
Breathe out. [long pause]

Continuing at your own pace now, [pause] guided by my voice. [long pause]

Breathe in. [pause]
Hold. [long pause]
Breathe out. [long pause]

Breathe in. [pause]
Hold. [long pause]
Breathe out. [long pause]

Just a few more rounds. [pause] Allowing your nervous system to fully unwind. [long pause]

Breathe in. [long pause]
Hold. [long pause]
Breathe out. [long pause]

Final round. [pause] Deepest breath yet. [long pause]

Breathe in. [long pause]
Hold. [long pause]
Breathe out. [long pause]

[long pause]

Gently return to your natural breath. [pause] Notice the stillness you've created within. [pause] You’ve just offered your nervous system a profound moment of peace and calm. [long pause] Carry this feeling with you. [long pause]`,
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
