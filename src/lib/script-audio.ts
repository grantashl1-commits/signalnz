export const CALM_READER_VOICE_ID = "XrExE9yKIg1WjnnlVkGX";
export const THEO_VOICE_ID = "UmQN7jS1Ee8B1czsUtQh";
export const REGINA_VOICE_ID = "M7wzTk2Y1hGQyRzr9sbS";
export const CALM_READER_VOICE_LABEL = "Signal Reader";
// Bump this whenever voice routing or default settings change so cached
// audio is regenerated under a fresh path.
export const VOICE_CACHE_VERSION = "voice-routed-v1";

// ── ElevenLabs voice catalogue used by Signal ─────────────────────────
// Female voices
export const VOICE_LILY = "pFZP5JQG7iQjIQuC4Bku";       // warm, soothing — sleep & inner-work
export const VOICE_MATILDA = "XrExE9yKIg1WjnnlVkGX";    // calm reader — default female
export const VOICE_SARAH = "EXAVITQu4vr4xnSDxMaL";      // gentle female — meditation
// Male voices
export const VOICE_GEORGE = "JBFqnCBsd6RMkjVDRZzb";     // warm British male — default male
export const VOICE_DANIEL = "onwK4e9ZLuTAKqWW03F9";     // measured British male
export const VOICE_BRIAN = "nPczCjzI2devNBz1zQrb";      // grounded American male

export interface ElevenLabsVoiceSettings {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
  speed: number;
}

// Default narration settings (matches previous edge function defaults)
export const DEFAULT_VOICE_SETTINGS: ElevenLabsVoiceSettings = {
  stability: 0.58,
  similarity_boost: 0.74,
  style: 0.2,
  use_speaker_boost: true,
  speed: 0.88,
};

// Sleep settings — slower, more stable, less expressive so the voice
// gently fades into the background and supports falling asleep.
export const SLEEP_VOICE_SETTINGS: ElevenLabsVoiceSettings = {
  stability: 0.85,
  similarity_boost: 0.78,
  style: 0.05,
  use_speaker_boost: false,
  speed: 0.75,
};

// Map known authors (matched against MeditationScript.evidenceSource) to a
// preferred ElevenLabs voice. We try to mirror the author's gender so the
// reader feels true to the source material.
const AUTHOR_VOICE_MAP: Array<{ pattern: RegExp; voiceId: string; gender: "female" | "male" }> = [
  // Female authors
  { pattern: /bren[eé]\s*brown/i, voiceId: VOICE_SARAH, gender: "female" },
  { pattern: /brianna\s*wiest/i, voiceId: VOICE_LILY, gender: "female" },
  { pattern: /pooja\s*lakshmin/i, voiceId: VOICE_LILY, gender: "female" },
  { pattern: /tara\s*brach/i, voiceId: VOICE_SARAH, gender: "female" },
  { pattern: /kristin\s*neff/i, voiceId: VOICE_SARAH, gender: "female" },
  { pattern: /stacy\s*sims/i, voiceId: VOICE_MATILDA, gender: "female" },
  { pattern: /alanna\s*(janine\s*)?bird/i, voiceId: VOICE_LILY, gender: "female" },
  // Male authors
  { pattern: /matthew\s*fray/i, voiceId: VOICE_GEORGE, gender: "male" },
  { pattern: /richard\s*miller/i, voiceId: VOICE_DANIEL, gender: "male" },
  { pattern: /kabat[-\s]*zinn/i, voiceId: VOICE_DANIEL, gender: "male" },
  { pattern: /thich\s*nhat\s*hanh/i, voiceId: VOICE_DANIEL, gender: "male" },
  { pattern: /(porges|polyvagal)/i, voiceId: VOICE_GEORGE, gender: "male" },
  { pattern: /(weil|andrew\s*weil)/i, voiceId: VOICE_GEORGE, gender: "male" },
  { pattern: /marcus\s*aurelius|epictetus|seneca|stoic/i, voiceId: VOICE_DANIEL, gender: "male" },
  { pattern: /jordan\s*peterson/i, voiceId: VOICE_BRIAN, gender: "male" },
];

/**
 * Pick an ElevenLabs voice for a script.
 *
 * Resolution order:
 *   1. Explicit `voiceId` on the script (highest priority)
 *   2. Localstorage override for this script id
 *   3. Author match against `evidenceSource`
 *   4. Default Signal reader (Matilda)
 */
export function resolveScriptVoiceId(opts: {
  scriptId?: string;
  explicitVoiceId?: string;
  evidenceSource?: string;
}): string {
  if (opts.explicitVoiceId) return opts.explicitVoiceId;
  if (opts.scriptId) {
    const override = getScriptAudioOverride(opts.scriptId);
    // overrides store full URLs — only use when not a URL (kept as a future hook)
    if (override && !/^https?:/i.test(override)) return override;
  }
  const src = opts.evidenceSource || "";
  for (const entry of AUTHOR_VOICE_MAP) {
    if (entry.pattern.test(src)) return entry.voiceId;
  }
  return CALM_READER_VOICE_ID;
}

/**
 * Resolve voice settings for a script. Sleep practices get the slower,
 * more stable preset; everything else gets the default narration preset.
 */
export function resolveVoiceSettings(opts: {
  category?: string;
  isSleep?: boolean;
  override?: Partial<ElevenLabsVoiceSettings>;
}): ElevenLabsVoiceSettings {
  const base =
    opts.isSleep || opts.category === "sleep"
      ? SLEEP_VOICE_SETTINGS
      : DEFAULT_VOICE_SETTINGS;
  return { ...base, ...(opts.override || {}) };
}

const SCRIPT_AUDIO_OVERRIDES_KEY = "signal_script_audio_overrides";

type ScriptAudioOverrideMap = Record<string, string>;

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getScriptAudioOverrides(): ScriptAudioOverrideMap {
  if (!canUseStorage()) return {};

  try {
    const raw = window.localStorage.getItem(SCRIPT_AUDIO_OVERRIDES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function getScriptAudioOverride(scriptId: string): string | undefined {
  return getScriptAudioOverrides()[scriptId];
}

export function setScriptAudioOverride(scriptId: string, audioUrl: string) {
  if (!canUseStorage()) return;
  const next = { ...getScriptAudioOverrides(), [scriptId]: audioUrl };
  window.localStorage.setItem(SCRIPT_AUDIO_OVERRIDES_KEY, JSON.stringify(next));
}

export function removeScriptAudioOverride(scriptId: string) {
  if (!canUseStorage()) return;
  const next = { ...getScriptAudioOverrides() };
  delete next[scriptId];
  window.localStorage.setItem(SCRIPT_AUDIO_OVERRIDES_KEY, JSON.stringify(next));
}

export function buildVersionedPracticeAudioPath(practiceId: string, voiceId?: string) {
  // Namespace by voice id so the same script can be cached separately
  // when narrated by different voices.
  const voiceNamespace = voiceId ? voiceId.slice(0, 12) : "default";
  return `practices/${VOICE_CACHE_VERSION}/${voiceNamespace}/${practiceId}.mp3`;
}

export function pickPreferredReaderVoice(voices: SpeechSynthesisVoice[]) {
  const preferredPatterns = [/samantha/i, /ava/i, /allison/i, /victoria/i, /karen/i, /moira/i, /serena/i, /susan/i, /zira/i, /female/i];

  return (
    voices.find((voice) => voice.lang.toLowerCase().startsWith("en") && preferredPatterns.some((pattern) => pattern.test(voice.name))) ||
    voices.find((voice) => voice.lang.toLowerCase().startsWith("en") && !/google|microsoft david/i.test(voice.name)) ||
    voices.find((voice) => voice.lang.toLowerCase().startsWith("en"))
  );
}