import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";

const MUSIC_PROMPTS = [
  "Gentle ambient sleep music with soft piano, warm synth pads, and quiet rain. Very slow tempo, deeply calming. No percussion.",
  "Peaceful nighttime ambience with soft harp, gentle wind chimes, and distant ocean waves. Minimal, serene, and warm.",
  "Deep relaxation music with low cello drones, soft nature sounds, and gentle breathing rhythm. Ultra calm and meditative.",
];

export function useSleepMusic() {
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    setPlaying(false);
  }, []);

  const play = useCallback(async () => {
    if (playing) {
      stop();
      return;
    }

    setLoading(true);
    try {
      const prompt = MUSIC_PROMPTS[Math.floor(Math.random() * MUSIC_PROMPTS.length)];

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sleep-music`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ prompt, duration: 120 }),
        }
      );

      if (!response.ok) {
        throw new Error(`Music generation failed: ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      blobUrlRef.current = url;

      const audio = new Audio(url);
      audio.loop = true;
      audio.volume = 0.3;
      audioRef.current = audio;

      await audio.play();
      setPlaying(true);
    } catch (err) {
      console.error("Sleep music error:", err);
      toast.error("Couldn't generate background music. Try again.");
    } finally {
      setLoading(false);
    }
  }, [playing, stop]);

  const toggle = useCallback(() => {
    if (playing) stop();
    else play();
  }, [playing, play, stop]);

  return { playing, loading, toggle, stop };
}
