import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  buildVersionedPracticeAudioPath,
  CALM_READER_VOICE_ID,
  getScriptAudioOverride,
  type ElevenLabsVoiceSettings,
} from "@/lib/script-audio";

interface UseElevenLabsTTSOptions {
  practiceId: string;
  ttsScript: string;
  enabled?: boolean;
  /** Override the ElevenLabs voice id. Defaults to Signal's calm reader. */
  voiceId?: string;
  /** Override the ElevenLabs voice_settings (stability, speed, etc.). */
  voiceSettings?: ElevenLabsVoiceSettings;
}

/**
 * Generates ElevenLabs TTS audio for a practice via the tts-generate edge function.
 * Checks storage cache first; generates on-demand if not found.
 * Returns a public URL to the cached MP3.
 */
export function useElevenLabsTTS({
  practiceId,
  ttsScript,
  enabled = true,
  voiceId,
  voiceSettings,
}: UseElevenLabsTTSOptions) {
  const [audioUrl, setAudioUrl] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const attemptedRef = useRef(false);
  const effectiveVoiceId = voiceId || CALM_READER_VOICE_ID;

  // Check if audio already exists in storage (private bucket → signed URL)
  const checkCache = useCallback(async (): Promise<string | null> => {
    const overrideUrl = getScriptAudioOverride(practiceId);
    if (overrideUrl) return overrideUrl;

    const filePath = buildVersionedPracticeAudioPath(practiceId, effectiveVoiceId);

    // Verify the object exists by listing the parent folder
    const lastSlash = filePath.lastIndexOf("/");
    const folder = filePath.slice(0, lastSlash);
    const fileName = filePath.slice(lastSlash + 1);
    const { data: list } = await supabase.storage
      .from("practice-audio")
      .list(folder, { search: fileName, limit: 1 });
    if (!list || list.length === 0) return null;

    const { data: signed } = await supabase.storage
      .from("practice-audio")
      .createSignedUrl(filePath, 60 * 60 * 24 * 7);
    return signed?.signedUrl ?? null;
  }, [practiceId, effectiveVoiceId]);

  // Generate audio via edge function
  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Check cache first
      const cached = await checkCache();
      if (cached) {
        setAudioUrl(cached);
        setLoading(false);
        return;
      }

      // Get user identifier for credit tracking
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: { user } } = await supabase.auth.getUser();
      const user_identifier = user?.id || user?.email || "anonymous";

      // Call edge function to generate + store
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tts-generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            text: ttsScript,
            practiceId,
            voiceId: effectiveVoiceId,
            voiceSettings,
            user_identifier,
          }),
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `TTS failed: ${response.status}`);
      }

      const data = await response.json();
      setAudioUrl(data.audioUrl);
    } catch (err: any) {
      console.error("ElevenLabs TTS error:", err);
      setError(err.message || "Failed to generate audio");
    } finally {
      setLoading(false);
    }
  }, [practiceId, ttsScript, checkCache, effectiveVoiceId, voiceSettings]);

  // Auto-check cache on mount
  useEffect(() => {
    if (!enabled || attemptedRef.current) return;
    attemptedRef.current = true;

    checkCache().then((cached) => {
      if (cached) setAudioUrl(cached);
    });
  }, [enabled, checkCache]);

  return {
    audioUrl,
    loading,
    error,
    generate,
    hasGeneratedAudio: !!audioUrl,
  };
}
