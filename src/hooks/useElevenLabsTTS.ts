import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UseElevenLabsTTSOptions {
  practiceId: string;
  ttsScript: string;
  enabled?: boolean;
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
}: UseElevenLabsTTSOptions) {
  const [audioUrl, setAudioUrl] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const attemptedRef = useRef(false);

  // Check if audio already exists in storage
  const checkCache = useCallback(async (): Promise<string | null> => {
    const filePath = `practices/${practiceId}.mp3`;
    const { data } = supabase.storage
      .from("practice-audio")
      .getPublicUrl(filePath);

    if (!data?.publicUrl) return null;

    // HEAD request to verify the file actually exists
    try {
      const resp = await fetch(data.publicUrl, { method: "HEAD" });
      if (resp.ok) return data.publicUrl;
    } catch {
      // File doesn't exist yet
    }
    return null;
  }, [practiceId]);

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
  }, [practiceId, ttsScript, checkCache]);

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
