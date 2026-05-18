import { useState, useEffect, useRef, useCallback } from "react";

interface AudioGuideProps {
  audioUrl?: string;
  enabled: boolean;
  muted: boolean;
  onTimeUpdate?: (currentTime: number) => void;
  onEnded?: () => void;
  onError?: () => void;
  playing: boolean;
  /** Metadata exposed to OS media controls (lock-screen / Bluetooth / car) */
  mediaMetadata?: {
    title?: string;
    artist?: string;
    album?: string;
    artworkUrl?: string;
  };
  /** Called when the OS requests pause via lock-screen / headphones / etc. */
  onMediaPause?: () => void;
  /** Called when the OS requests play */
  onMediaPlay?: () => void;
}

/**
 * Headless audio controller. Manages an HTMLAudioElement,
 * exposes time updates, integrates Media Session API for OS-level
 * controls (lock-screen, Bluetooth, AirPods), and acquires a screen
 * wake lock while playing so the device doesn't sleep mid-session.
 */
export function useAudioGuide({
  audioUrl,
  enabled,
  muted,
  playing,
  onTimeUpdate,
  onEnded,
  onError,
  mediaMetadata,
  onMediaPause,
  onMediaPlay,
}: AudioGuideProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // ── Wake-lock helpers ──
  const acquireWakeLock = useCallback(async () => {
    if (wakeLockRef.current) return;
    if (typeof navigator === "undefined" || !("wakeLock" in navigator)) return;
    try {
      wakeLockRef.current = await (navigator as any).wakeLock.request("screen");
      wakeLockRef.current?.addEventListener?.("release", () => {
        wakeLockRef.current = null;
      });
    } catch {
      /* user gesture / permission missing — silent */
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    if (!wakeLockRef.current) return;
    try {
      await wakeLockRef.current.release();
    } catch {
      /* ignore */
    }
    wakeLockRef.current = null;
  }, []);

  // Re-acquire wake lock when tab returns to foreground (if still playing)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && playing && !muted) {
        acquireWakeLock();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [playing, muted, acquireWakeLock]);

  // Create / destroy audio element
  useEffect(() => {
    if (!enabled || !audioUrl) {
      setLoaded(false);
      setError(false);
      return;
    }

    setLoaded(false);
    setError(false);

    const audio = new Audio();
    audio.preload = "auto";
    audio.crossOrigin = "anonymous";
    // Background-playable on iOS Safari (don't fullscreen on play)
    (audio as any).playsInline = true;
    audio.setAttribute("playsinline", "true");

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
      // Sync Media Session position
      if ("mediaSession" in navigator && audio.duration && isFinite(audio.duration)) {
        try {
          (navigator.mediaSession as any).setPositionState?.({
            duration: audio.duration,
            position: t,
            playbackRate: audio.playbackRate,
          });
        } catch {
          /* ignore */
        }
      }
    };
    const handleDurationChange = () => setDuration(audio.duration || 0);
    const handleEnded = () => {
      releaseWakeLock();
      onEnded?.();
    };

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
      releaseWakeLock();
    };
  }, [audioUrl, enabled, onEnded, onError, onTimeUpdate, releaseWakeLock]);

  // ── Media Session API ──
  useEffect(() => {
    if (!enabled || !audioUrl) return;
    if (!("mediaSession" in navigator)) return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: mediaMetadata?.title || "SIGNAL practice",
        artist: mediaMetadata?.artist || "SIGNAL",
        album: mediaMetadata?.album || "Practice",
        artwork: mediaMetadata?.artworkUrl
          ? [
              { src: mediaMetadata.artworkUrl, sizes: "512x512", type: "image/png" },
            ]
          : [],
      });

      navigator.mediaSession.setActionHandler("play", () => {
        const a = audioRef.current;
        if (a) {
          a.play().catch(() => {});
          acquireWakeLock();
        }
        onMediaPlay?.();
      });
      navigator.mediaSession.setActionHandler("pause", () => {
        audioRef.current?.pause();
        releaseWakeLock();
        onMediaPause?.();
      });
      navigator.mediaSession.setActionHandler("seekbackward", (d: any) => {
        const a = audioRef.current;
        if (a) a.currentTime = Math.max(0, a.currentTime - (d.seekOffset || 10));
      });
      navigator.mediaSession.setActionHandler("seekforward", (d: any) => {
        const a = audioRef.current;
        if (a) a.currentTime = Math.min(a.duration || 0, a.currentTime + (d.seekOffset || 10));
      });
      navigator.mediaSession.setActionHandler("seekto", (d: any) => {
        const a = audioRef.current;
        if (a && d.seekTime != null) a.currentTime = d.seekTime;
      });
    } catch {
      /* ignore */
    }

    return () => {
      if (!("mediaSession" in navigator)) return;
      try {
        ["play", "pause", "seekbackward", "seekforward", "seekto"].forEach((a) =>
          navigator.mediaSession.setActionHandler(a as MediaSessionAction, null),
        );
        navigator.mediaSession.metadata = null;
      } catch {
        /* ignore */
      }
    };
  }, [
    enabled,
    audioUrl,
    mediaMetadata?.title,
    mediaMetadata?.artist,
    mediaMetadata?.album,
    mediaMetadata?.artworkUrl,
    onMediaPause,
    onMediaPlay,
    acquireWakeLock,
    releaseWakeLock,
  ]);

  // Play / pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !loaded) return;

    if (playing && !muted) {
      audio.play().catch(() => {
        setError(true);
      });
      acquireWakeLock();
      if ("mediaSession" in navigator) {
        try { navigator.mediaSession.playbackState = "playing"; } catch {}
      }
    } else {
      audio.pause();
      releaseWakeLock();
      if ("mediaSession" in navigator) {
        try { navigator.mediaSession.playbackState = "paused"; } catch {}
      }
    }
  }, [playing, muted, loaded, acquireWakeLock, releaseWakeLock]);

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
