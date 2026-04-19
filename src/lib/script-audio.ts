export const CALM_READER_VOICE_ID = "M7wzTk2Y1hGQyRzr9sbS";
export const CALM_READER_VOICE_LABEL = "Regina";
export const VOICE_CACHE_VERSION = "regina-v1";

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

export function buildVersionedPracticeAudioPath(practiceId: string) {
  return `practices/${VOICE_CACHE_VERSION}/${practiceId}.mp3`;
}

export function pickPreferredReaderVoice(voices: SpeechSynthesisVoice[]) {
  const preferredPatterns = [/samantha/i, /ava/i, /allison/i, /victoria/i, /karen/i, /moira/i, /serena/i, /susan/i, /zira/i, /female/i];

  return (
    voices.find((voice) => voice.lang.toLowerCase().startsWith("en") && preferredPatterns.some((pattern) => pattern.test(voice.name))) ||
    voices.find((voice) => voice.lang.toLowerCase().startsWith("en") && !/google|microsoft david/i.test(voice.name)) ||
    voices.find((voice) => voice.lang.toLowerCase().startsWith("en"))
  );
}