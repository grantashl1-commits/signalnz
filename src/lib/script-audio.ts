// ── Signal voice policy ───────────────────────────────────────────────
// Only TWO ElevenLabs voices are permitted across the entire app:
//   • Regina (female) — the default reader for Signal
//   • Theo   (male)   — used when the source author is male
// Any other voice ID (legacy or accidental) is coerced back to Regina.

export const REGINA_VOICE_ID = "M7wzTk2Y1hGQyRzr9sbS"; // female — default
export const THEO_VOICE_ID = "UmQN7jS1Ee8B1czsUtQh";   // male

// The "calm reader" alias = Regina. Kept so existing imports keep working.
export const CALM_READER_VOICE_ID = REGINA_VOICE_ID;
export const CALM_READER_VOICE_LABEL = "Signal Reader";

// Bump this whenever voice routing or default settings change so cached
// audio is regenerated under a fresh path.
export const VOICE_CACHE_VERSION = "regina-theo-v2";

const ALLOWED_VOICE_IDS = new Set<string>([REGINA_VOICE_ID, THEO_VOICE_ID]);

/** Coerce any incoming voice ID to one of the two allowed voices. */
export function enforceAllowedVoice(voiceId?: string | null): string {
  if (voiceId && ALLOWED_VOICE_IDS.has(voiceId)) return voiceId;
  return REGINA_VOICE_ID;
}

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

// Author → gender map. We only choose between Theo (male) and Regina (female).
// Anything not matched falls through to Regina.
const MALE_AUTHOR_PATTERNS: RegExp[] = [
  /matthew\s*fray/i,
  /richard\s*miller/i,
  /kabat[-\s]*zinn/i,
  /thich\s*nhat\s*hanh/i,
  /(porges|polyvagal)/i,
  /(weil|andrew\s*weil)/i,
  /marcus\s*aurelius|epictetus|seneca|stoic/i,
  /jordan\s*peterson/i,
];

/**
 * Pick an ElevenLabs voice for a script.
 *
 * Resolution order:
 *   1. Explicit `voiceId` on the script — coerced to Regina/Theo if not one already.
 *   2. Author match against `evidenceSource` (male → Theo, otherwise Regina).
 *   3. Regina (default).
 */
export function resolveScriptVoiceId(opts: {
  scriptId?: string;
  explicitVoiceId?: string;
  evidenceSource?: string;
}): string {
  if (opts.explicitVoiceId) return enforceAllowedVoice(opts.explicitVoiceId);

  const src = opts.evidenceSource || "";
  if (MALE_AUTHOR_PATTERNS.some((p) => p.test(src))) return THEO_VOICE_ID;

  return REGINA_VOICE_ID;
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
