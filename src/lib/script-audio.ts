// ── Voice catalogue ──────────────────────────────────────
// Female (default): Regina — warm, grounded female reader
// Male: Theo — calm, contemplative male reader (used for scripts attributed
// to male teachers like Jon Kabat-Zinn, Eckhart Tolle, Alan Watts, etc.)

export const FEMALE_VOICE_ID = "M7wzTk2Y1hGQyRzr9sbS";
export const FEMALE_VOICE_LABEL = "Regina";
export const FEMALE_VOICE_VERSION = "regina-v1";

export const MALE_VOICE_ID = "UmQN7jS1Ee8B1czsUtQh";
export const MALE_VOICE_LABEL = "Theo";
export const MALE_VOICE_VERSION = "theo-v1";

// Back-compat aliases — existing imports still resolve to the default reader.
export const CALM_READER_VOICE_ID = FEMALE_VOICE_ID;
export const CALM_READER_VOICE_LABEL = FEMALE_VOICE_LABEL;
export const VOICE_CACHE_VERSION = FEMALE_VOICE_VERSION;

export type VoiceGender = "female" | "male";

// Lowercase last-name fragments. If any appear in the script's author /
// evidenceSource string, the script is read by the male voice (Theo).
const MALE_TEACHER_FRAGMENTS = [
  "kabat-zinn",
  "kabat zinn",
  "thich nhat hanh",
  "eckhart tolle",
  "tolle",
  "alan watts",
  "watts",
  "ram dass",
  "ryan holiday",
  "marcus aurelius",
  "seneca",
  "epictetus",
  "joseph goldstein",
  "jack kornfield",
  "tara brach", // intentionally female — kept here as a NEGATIVE example only; do NOT add
  "sam harris",
  "jon kabat",
  "shinzen young",
  "pema chödrön", // female — same note
  "rick hanson",
  "rumi",
  "lao tzu",
  "viktor frankl",
  "carl jung",
  "james clear",
  "mark manson",
  "robert greene",
  "naval ravikant",
  "yuval noah harari",
  "david goggins",
  "andrew huberman",
];

// Strip the negative female examples that snuck into the list above so
// the matcher only contains genuine male fragments.
const FEMALE_FRAGMENTS_TO_EXCLUDE = ["tara brach", "pema chödrön"];
const MALE_AUTHOR_FRAGMENTS = MALE_TEACHER_FRAGMENTS.filter(
  (f) => !FEMALE_FRAGMENTS_TO_EXCLUDE.includes(f)
);

/**
 * Decide which voice should narrate a script.
 * Precedence: explicit override > author inference > female default.
 */
export function resolveVoiceGender(opts: {
  voiceGender?: VoiceGender;
  author?: string | null;
}): VoiceGender {
  if (opts.voiceGender) return opts.voiceGender;
  const author = (opts.author || "").toLowerCase();
  if (!author) return "female";
  return MALE_AUTHOR_FRAGMENTS.some((frag) => author.includes(frag))
    ? "male"
    : "female";
}

export function getVoiceConfig(gender: VoiceGender) {
  return gender === "male"
    ? { voiceId: MALE_VOICE_ID, voiceVersion: MALE_VOICE_VERSION, label: MALE_VOICE_LABEL }
    : { voiceId: FEMALE_VOICE_ID, voiceVersion: FEMALE_VOICE_VERSION, label: FEMALE_VOICE_LABEL };
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

/**
 * Versioned storage path for a practice's cached audio. Defaults to the
 * female (Regina) folder for backwards compatibility.
 */
export function buildVersionedPracticeAudioPath(
  practiceId: string,
  voiceVersion: string = FEMALE_VOICE_VERSION
) {
  return `practices/${voiceVersion}/${practiceId}.mp3`;
}

export function pickPreferredReaderVoice(voices: SpeechSynthesisVoice[]) {
  const preferredPatterns = [/samantha/i, /ava/i, /allison/i, /victoria/i, /karen/i, /moira/i, /serena/i, /susan/i, /zira/i, /female/i];

  return (
    voices.find((voice) => voice.lang.toLowerCase().startsWith("en") && preferredPatterns.some((pattern) => pattern.test(voice.name))) ||
    voices.find((voice) => voice.lang.toLowerCase().startsWith("en") && !/google|microsoft david/i.test(voice.name)) ||
    voices.find((voice) => voice.lang.toLowerCase().startsWith("en"))
  );
}
