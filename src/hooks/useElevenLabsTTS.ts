import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  buildVersionedPracticeAudioPath,
  getScriptAudioOverride,
  getVoiceConfig,
  resolveVoiceGender,
  type VoiceGender,
} from "@/lib/script-audio";

interface UseElevenLabsTTSOptions {
  practiceId: string;
  ttsScript: string;
  enabled?: boolean;
  /** Optional author / source string used to auto-route to male voice. */
  author?: string | null;
  /** Explicit override — wins over author inference. */
  voiceGender?: VoiceGender;
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
  author,
  voiceGender,
}: UseElevenLabsTTSOptions) {
  const [audioUrl, setAudioUrl] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const attemptedRef = useRef(false);

  const gender = resolveVoiceGender({ voiceGender, author });
  const { voiceId, voiceVersion } = getVoiceConfig(gender);

  // Check if audio already exists in storage
  const checkCache = useCallback(async (): Promise<string | null> => {
    const overrideUrl = getScriptAudioOverride(practiceId);
    if (overrideUrl) return overrideUrl;

    const filePath = buildVersionedPracticeAudioPath(practiceId, voiceVersion);
    // Use signed URL for private bucket
    const { data: signedData } = await supabase.storage
      .from("practice-audio")
      .createSignedUrl(filePath, 3600); // 1h expiry

    if (!signedData?.signedUrl) return null;

    // HEAD request to verify the file actually exists
    try {
      const resp = await fetch(signedData.signedUrl, { method: "HEAD" });
      if (resp.ok) return signedData.signedUrl;
    } catch {
      // File doesn't exist yet
    }
    return null;
  }, [practiceId, voiceVersion]);

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
            voiceId,
            voiceVersion,
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
  }, [practiceId, ttsScript, checkCache, voiceId, voiceVersion]);

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
    voiceGender: gender,
  };
}
