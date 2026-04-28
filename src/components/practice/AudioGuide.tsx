import { useState, useEffect, useRef, useCallback } from "react";

interface AudioGuideProps {
  audioUrl?: string;
  enabled: boolean;
  muted: boolean;
  onTimeUpdate?: (currentTime: number) => void;
  onEnded?: () => void;
  onError?: () => void;
  playing: boolean;
}

/**
 * Headless audio controller. Manages an HTMLAudioElement,
 * exposes time updates, and handles errors gracefully.
 */
export function useAudioGuide({
  audioUrl,
  enabled,
  muted,
  playing,
  onTimeUpdate,
  onEnded,
  onError,
}: AudioGuideProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Create / destroy audio element
  useEffect(() => {
    if (!enabled || !audioUrl) {
      setLoaded(false);
      setError(false);
      return;
    }

    // Reset state for the new source
    setLoaded(false);
    setError(false);

    const audio = new Audio();
    audio.preload = "auto";
    audio.crossOrigin = "anonymous";

    const handleCanPlay = () => setLoaded(true);
    const handleError = () => {
      setError(true);
      setLoaded(false);
      onError?.();
    };
    const handleTimeUpdate = () => {
      const t = audio.currentTime;
      setCurrentTime(t);
      onTimeUpdate?.(t);
    };
    const handleDurationChange = () => setDuration(audio.duration || 0);
    const handleEnded = () => onEnded?.();

    audio.addEventListener("canplaythrough", handleCanPlay);
    audio.addEventListener("error", handleError);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("ended", handleEnded);

    audio.src = audioUrl;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.removeEventListener("canplaythrough", handleCanPlay);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("ended", handleEnded);
      audio.src = "";
      audioRef.current = null;
    };
  }, [audioUrl, enabled]);

  // Play / pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !loaded) return;

    if (playing && !muted) {
      audio.play().catch(() => {
        // Autoplay blocked — silent fallback
        setError(true);
      });
    } else {
      audio.pause();
    }
  }, [playing, muted, loaded]);

  // Mute
  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }, []);

  const restart = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  }, []);

  return {
    loaded,
    error,
    currentTime,
    duration,
    seek,
    restart,
    hasAudio: enabled && !!audioUrl && !error,
  };
}
