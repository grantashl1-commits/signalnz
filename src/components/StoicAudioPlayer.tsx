import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, X, Volume2, Loader2 } from "lucide-react";
import { haptic } from "@/hooks/use-mobile";

interface Props {
  title: string;
  text: string;
  onClose: () => void;
}

/**
 * Lightweight Stoic reading player using Web Speech API.
 * Creates SpeechSynthesisUtterance synchronously in gesture context
 * to satisfy mobile autoplay policies.
 *
 * Falls back to ElevenLabs tts-generate-inline if SpeechSynthesis
 * is unavailable.
 */
export default function StoicAudioPlayer({ title, text, onClose }: Props) {
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [useTTS, setUseTTS] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const hasSpeechSynth = typeof window !== "undefined" && "speechSynthesis" in window;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hasSpeechSynth) window.speechSynthesis.cancel();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const pickVoice = useCallback(() => {
    if (!hasSpeechSynth) return undefined;
    const voices = window.speechSynthesis.getVoices();
    return (
      voices.find((v) => v.lang.startsWith("en") && /samantha|karen|moira|zira/i.test(v.name)) ||
      voices.find((v) => v.lang.startsWith("en") && /female/i.test(v.name)) ||
      voices.find((v) => v.lang.startsWith("en-") && !/google/i.test(v.name)) ||
      voices.find((v) => v.lang.startsWith("en"))
    );
  }, []);

  // Play via ElevenLabs TTS (fallback) — now uses cached URL response
  const playViaTTS = useCallback(async () => {
    setLoading(true);
    try {
      // Get user identifier for credit tracking
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
          body: JSON.stringify({ text, user_identifier }),
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
      // Silently fail — user can read the text instead
    }
  }, [text]);

  const handlePlay = useCallback(() => {
    haptic("light");

    // Already playing — pause
    if (playing) {
      if (hasSpeechSynth && utteranceRef.current) {
        window.speechSynthesis.pause();
      }
      if (audioRef.current) audioRef.current.pause();
      setPlaying(false);
      return;
    }

    // Resume paused speech
    if (hasSpeechSynth && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setPlaying(true);
      return;
    }

    // Resume paused audio element
    if (audioRef.current && audioRef.current.paused && audioRef.current.currentTime > 0) {
      audioRef.current.play();
      setPlaying(true);
      return;
    }

    // --- Fresh play ---

    // Try Web Speech API first (create utterance SYNCHRONOUSLY in gesture)
    if (hasSpeechSynth) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.85;
      utterance.pitch = 1.0;

      const voice = pickVoice();
      if (voice) utterance.voice = voice;

      // Estimate total duration for progress bar
      const wordCount = text.split(/\s+/).length;
      const estimatedDurationSec = wordCount / (150 * 0.85 / 60); // ~150 wpm at 0.85 rate
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

      utterance.onerror = (e) => {
        // If speech synthesis fails, try ElevenLabs
        if (e.error !== "canceled") {
          setUseTTS(true);
          playViaTTS();
        }
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      return;
    }

    // No Web Speech API — use ElevenLabs
    setUseTTS(true);
    playViaTTS();
  }, [playing, text, pickVoice, playViaTTS]);

  const handleStop = useCallback(() => {
    if (hasSpeechSynth) window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPlaying(false);
    setProgress(0);
    utteranceRef.current = null;
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
              {playing ? "Playing…" : progress >= 100 ? "Finished" : "Tap to listen"}
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
