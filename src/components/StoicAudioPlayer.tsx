import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, X, Volume2, Loader2 } from "lucide-react";
import { haptic } from "@/hooks/use-mobile";
import { CALM_READER_VOICE_ID, CALM_READER_VOICE_LABEL, pickPreferredReaderVoice } from "@/lib/script-audio";

interface Props {
  title: string;
  text: string;
  onClose: () => void;
}

/**
 * Stoic reading player — ElevenLabs Lily voice first (via tts-generate-inline),
 * falls back to Web Speech API only if ElevenLabs is unavailable.
 */
export default function StoicAudioPlayer({ title, text, onClose }: Props) {
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Play via ElevenLabs TTS (primary) — uses cached URL response
  const playViaTTS = useCallback(async () => {
    setLoading(true);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: { user } } = await supabase.auth.getUser();
      const user_identifier = user?.id || user?.email || "anonymous";

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tts-generate-inline`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text, user_identifier, voiceId: CALM_READER_VOICE_ID }),
        }
      );
      if (!response.ok) throw new Error("TTS failed");
      const data = await response.json();
      const audioSrc = data.audioUrl;
      if (!audioSrc) throw new Error("No audio URL returned");

      const audio = new Audio(audioSrc);
      audioRef.current = audio;

      audio.onended = () => {
        setPlaying(false);
        setProgress(100);
        if (intervalRef.current) clearInterval(intervalRef.current);
      };

      await audio.play();
      setPlaying(true);
      setLoading(false);

      // Track progress
      intervalRef.current = setInterval(() => {
        if (audio.duration > 0) {
          setProgress((audio.currentTime / audio.duration) * 100);
        }
      }, 500);
    } catch {
      setLoading(false);
      // Fall back to Web Speech API
      playViaSpeechSynth();
    }
  }, [text]);

  // Web Speech API fallback
  const playViaSpeechSynth = useCallback(() => {
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.82;
    utterance.pitch = 0.95;

    const voices = window.speechSynthesis.getVoices();
    const voice = pickPreferredReaderVoice(voices);
    if (voice) utterance.voice = voice;

    const wordCount = text.split(/\s+/).length;
    const estimatedDurationSec = wordCount / (150 * 0.85 / 60);
    const startTime = Date.now();

    utterance.onstart = () => {
      setPlaying(true);
      intervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        setProgress(Math.min((elapsed / estimatedDurationSec) * 100, 98));
      }, 500);
    };

    utterance.onend = () => {
      setPlaying(false);
      setProgress(100);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };

    window.speechSynthesis.speak(utterance);
  }, [text]);

  const handlePlay = useCallback(() => {
    haptic("light");

    // Already playing — pause
    if (playing) {
      if (audioRef.current) audioRef.current.pause();
      if ("speechSynthesis" in window) window.speechSynthesis.pause();
      setPlaying(false);
      return;
    }

    // Resume paused audio element
    if (audioRef.current && audioRef.current.paused && audioRef.current.currentTime > 0) {
      audioRef.current.play();
      setPlaying(true);
      return;
    }

    // Resume paused speech
    if ("speechSynthesis" in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setPlaying(true);
      return;
    }

    // --- Fresh play — try ElevenLabs first ---
    playViaTTS();
  }, [playing, playViaTTS]);

  const handleStop = useCallback(() => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPlaying(false);
    setProgress(0);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      className="fixed inset-x-0 bottom-0 z-[110] bg-card border-t border-border shadow-2xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="px-5 py-4">
        {/* Progress bar */}
        <div className="w-full h-1 bg-muted/40 rounded-full mb-3 overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center gap-4">
          {/* Play/Pause */}
          <button
            onClick={handlePlay}
            disabled={loading}
            className="touch-btn w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground active:scale-95 transition-transform disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : playing ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 ml-0.5" />
            )}
          </button>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="font-display text-sm italic text-foreground truncate">{title}</p>
            <p className="font-body text-[10px] text-muted-foreground flex items-center gap-1">
              <Volume2 className="h-3 w-3" />
              {playing ? `Playing ${CALM_READER_VOICE_LABEL}…` : progress >= 100 ? "Finished" : "Tap to listen"}
            </p>
          </div>

          {/* Close */}
          <button
            onClick={() => { handleStop(); onClose(); }}
            className="touch-btn w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted/40"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
