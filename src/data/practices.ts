// ── Practice Data Model ─────────────────────────────────────

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
  emoji?: string;
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
    emoji: "🌬",
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

export const SOMATIC_PRACTICES: PracticeConfig[] = [
  {
    id: "butterfly-hug",
    title: "Butterfly Hug",
    subtitle: "Bilateral self-soothing",
    category: "somatic",
    mode: "narrated-sequence",
    durationSec: 300,
    emoji: "🦋",
    benefit: "Bilateral stimulation as used in EMDR therapy. Calms the nervous system and gently integrates stored emotion.",
    audio: {
      enabled: true,
      audioUrl: "/audio/butterfly-hug.mp3",
      durationSec: 300,
      voiceName: "SIGNAL Calm",
      provider: "elevenlabs",
    },
    steps: [
      { id: "1", title: "Settle", body: "Cross your arms over your chest, with your hands resting on opposite shoulders.", startTimeSec: 0, endTimeSec: 40 },
      { id: "2", title: "Soften your gaze", body: "Close your eyes, or soften your gaze downward toward the floor.", startTimeSec: 40, endTimeSec: 75 },
      { id: "3", title: "Begin tapping", body: "Slowly alternate tapping left and right, like butterfly wings.", startTimeSec: 75, endTimeSec: 120 },
      { id: "4", title: "Breathe naturally", body: "Let your breath stay slow and natural as you continue.", startTimeSec: 120, endTimeSec: 170 },
      { id: "5", title: "Notice", body: "Notice feelings, images, or sensations arising, and observe them without judgment.", startTimeSec: 170, endTimeSec: 220 },
      { id: "6", title: "Continue", body: "Continue for several minutes, or until a natural sense of calm arrives.", startTimeSec: 220, endTimeSec: 270 },
      { id: "7", title: "Rest", body: "Rest both hands over your heart. Feel it beating. You are held.", startTimeSec: 270, endTimeSec: 300 },
    ],
  },
  {
    id: "grounding-54321",
    title: "5-4-3-2-1 Grounding",
    subtitle: "Sensory anchoring",
    category: "somatic",
    mode: "narrated-sequence",
    durationSec: 300,
    emoji: "🌱",
    benefit: "Interrupts anxiety spirals by anchoring all five senses in the present moment.",
    audio: {
      enabled: true,
      audioUrl: "/audio/grounding-54321.mp3",
      durationSec: 300,
      voiceName: "SIGNAL Calm",
      provider: "elevenlabs",
    },
    steps: [
      { id: "1", title: "Arrive", body: "Find a comfortable seat. Take three slow breaths and simply arrive here.", startTimeSec: 0, endTimeSec: 40 },
      { id: "2", title: "5 things you see", body: "Notice 5 things you can SEE — name them silently, one by one.", startTimeSec: 40, endTimeSec: 85 },
      { id: "3", title: "4 things you touch", body: "Notice 4 things you can TOUCH. Feel each texture with curiosity.", startTimeSec: 85, endTimeSec: 135 },
      { id: "4", title: "3 things you hear", body: "Notice 3 things you can HEAR right now, in this moment.", startTimeSec: 135, endTimeSec: 185 },
      { id: "5", title: "2 things you smell", body: "Notice 2 things you can SMELL, or bring familiar scents to mind.", startTimeSec: 185, endTimeSec: 235 },
      { id: "6", title: "1 thing you taste", body: "Notice 1 thing you can TASTE.", startTimeSec: 235, endTimeSec: 265 },
      { id: "7", title: "Return", body: "Return to your breath. You are here. You are safe. You are present.", startTimeSec: 265, endTimeSec: 300 },
    ],
  },
  {
    id: "somatic-orienting",
    title: "Somatic Orienting",
    subtitle: "Vagal safety signalling",
    category: "somatic",
    mode: "narrated-sequence",
    durationSec: 300,
    emoji: "🧭",
    benefit: "Activates the vagus nerve's social engagement system — signalling to your body: I am safe right now.",
    audio: {
      enabled: true,
      audioUrl: "/audio/somatic-orienting.mp3",
      durationSec: 300,
      voiceName: "SIGNAL Calm",
      provider: "elevenlabs",
    },
    steps: [
      { id: "1", title: "Arrive", body: "Sit or stand. Take a moment to simply arrive in your body.", startTimeSec: 0, endTimeSec: 40 },
      { id: "2", title: "Look around", body: "Like a curious animal, slowly begin to look around the space.", startTimeSec: 40, endTimeSec: 85 },
      { id: "3", title: "Soft gaze", body: "Let your gaze move without agenda — soft, unhurried, open.", startTimeSec: 85, endTimeSec: 130 },
      { id: "4", title: "Follow naturally", body: "Let your head and neck follow your gaze naturally.", startTimeSec: 130, endTimeSec: 175 },
      { id: "5", title: "Find safety", body: "Notice anything that brings a sense of safety, pleasure or ease.", startTimeSec: 175, endTimeSec: 220 },
      { id: "6", title: "Rest your gaze", body: "Rest your gaze there. Notice what happens in your body.", startTimeSec: 220, endTimeSec: 260 },
      { id: "7", title: "Ground", body: "Feel your feet on the floor. The weight of gravity holding you. You are safe.", startTimeSec: 260, endTimeSec: 300 },
    ],
  },
  {
    id: "havening-touch",
    title: "Havening Touch",
    subtitle: "Stress depotentiation",
    category: "somatic",
    mode: "narrated-sequence",
    durationSec: 480,
    emoji: "🤲",
    benefit: "Uses sensory input to depotentiate stress-encoded memories. Developed by Dr Ronald Ruden. Deeply calming.",
    audio: {
      enabled: true,
      audioUrl: "/audio/havening-touch.mp3",
      durationSec: 480,
      voiceName: "SIGNAL Calm",
      provider: "elevenlabs",
    },
    steps: [
      { id: "1", title: "Choose a focus", body: "Bring to mind something mildly stressful — save deeply traumatic memories for your therapist.", startTimeSec: 0, endTimeSec: 60 },
      { id: "2", title: "Rate distress", body: "Rate your distress 0–10. Hold that number lightly.", startTimeSec: 60, endTimeSec: 110 },
      { id: "3", title: "Stroke arms", body: "Stroke your arms slowly from shoulder to elbow, again and again.", startTimeSec: 110, endTimeSec: 190 },
      { id: "4", title: "Stroke palms", body: "Now stroke your palms together slowly, as if washing your hands.", startTimeSec: 190, endTimeSec: 270 },
      { id: "5", title: "Stroke face", body: "Then stroke gently under your eyes, from cheekbones to temples.", startTimeSec: 270, endTimeSec: 350 },
      { id: "6", title: "Count or hum", body: "While doing this, count softly to 20, or hum a simple melody.", startTimeSec: 350, endTimeSec: 420 },
      { id: "7", title: "Check in", body: "Check in. Has the number reduced? Repeat until you feel lighter.", startTimeSec: 420, endTimeSec: 480 },
    ],
  },
  {
    id: "body-scan",
    title: "Somatic Body Scan",
    subtitle: "Interoceptive awareness",
    category: "somatic",
    mode: "narrated-sequence",
    durationSec: 900,
    emoji: "🔍",
    benefit: "Builds interoceptive awareness — your ability to hear and trust your body's wisdom.",
    audio: {
      enabled: true,
      audioUrl: "/audio/body-scan.mp3",
      durationSec: 900,
      voiceName: "SIGNAL Calm",
      provider: "elevenlabs",
    },
    steps: [
      { id: "1", title: "Settle", body: "Lie down comfortably. Close your eyes. Take 3 slow, deep breaths.", startTimeSec: 0, endTimeSec: 100 },
      { id: "2", title: "Crown", body: "Bring awareness to the crown of your head. What do you notice?", startTimeSec: 100, endTimeSec: 220 },
      { id: "3", title: "Face", body: "Move slowly down: forehead, eyes, jaw. Where are you holding tension?", startTimeSec: 220, endTimeSec: 350 },
      { id: "4", title: "Heart", body: "Continue to throat, chest, heart space. What feelings live here?", startTimeSec: 350, endTimeSec: 480 },
      { id: "5", title: "Belly", body: "Move into your belly — your emotional centre. Breathe into it softly.", startTimeSec: 480, endTimeSec: 610 },
      { id: "6", title: "Lower body", body: "Continue to hips, thighs, knees, calves, feet. Ground into the earth.", startTimeSec: 610, endTimeSec: 780 },
      { id: "7", title: "Whole body", body: "Expand awareness to your whole body as one. Ask: what does my body need to tell me today?", startTimeSec: 780, endTimeSec: 900 },
    ],
  },
];

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
