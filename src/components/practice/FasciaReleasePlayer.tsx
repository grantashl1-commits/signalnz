import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Volume2, VolumeX, Leaf } from "lucide-react";
import { FASCIA_EXERCISES, type FasciaExercise } from "@/data/fascia-release-exercises";
import { haptic } from "@/hooks/use-mobile";

interface Props {
  onClose: () => void;
}

type Phase = "exercise" | "transition" | "complete";

const TRANSITION_SECONDS = 3;

export default function FasciaReleasePlayer({ onClose }: Props) {
  const [exerciseIdx, setExerciseIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("exercise");
  const [secondsLeft, setSecondsLeft] = useState(FASCIA_EXERCISES[0].durationSec);
  const [transitionCount, setTransitionCount] = useState(TRANSITION_SECONDS);
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // TTS audio refs
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const prefetchedAudioRef = useRef<{ idx: number; audio: HTMLAudioElement } | null>(null);

  const exercise = FASCIA_EXERCISES[exerciseIdx];
  const totalExercises = FASCIA_EXERCISES.length;

  // ── TTS Generation ──────────────────────────────────────────
  const generateTTS = useCallback(
    async (text: string): Promise<HTMLAudioElement | null> => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tts-generate-inline`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({ text }),
          }
        );
        if (!response.ok) return null;
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        return audio;
      } catch {
        return null;
      }
    },
    []
  );

  // Play TTS for current exercise
  const playTTS = useCallback(
    async (ex: FasciaExercise, idx: number) => {
      if (mutedRef.current) return;

      // Check prefetch cache
      if (prefetchedAudioRef.current?.idx === idx) {
        const audio = prefetchedAudioRef.current.audio;
        prefetchedAudioRef.current = null;
        currentAudioRef.current = audio;
        try { await audio.play(); } catch { /* autoplay blocked */ }
        return;
      }

      const audio = await generateTTS(ex.ttsScript);
      if (audio && !mutedRef.current) {
        currentAudioRef.current = audio;
        try { await audio.play(); } catch { /* autoplay blocked */ }
      }
    },
    [generateTTS]
  );

  // Prefetch next exercise audio
  const prefetchNext = useCallback(
    async (nextIdx: number) => {
      if (nextIdx >= totalExercises) return;
      const nextEx = FASCIA_EXERCISES[nextIdx];
      const audio = await generateTTS(nextEx.ttsScript);
      if (audio) {
        prefetchedAudioRef.current = { idx: nextIdx, audio };
      }
    },
    [totalExercises, generateTTS]
  );

  // ── Exercise Timer ──────────────────────────────────────────
  useEffect(() => {
    if (phase !== "exercise") return;

    // Play audio for current exercise
    playTTS(exercise, exerciseIdx);

    // Start prefetching next exercise audio after a small delay
    const prefetchTimeout = setTimeout(() => {
      prefetchNext(exerciseIdx + 1);
    }, 2000);

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          // Stop current audio
          if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current = null;
          }

          if (exerciseIdx < totalExercises - 1) {
            setPhase("transition");
            setTransitionCount(TRANSITION_SECONDS);
          } else {
            setPhase("complete");
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(prefetchTimeout);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, exerciseIdx, playTTS, prefetchNext, exercise, totalExercises]);

  // ── Transition Timer ────────────────────────────────────────
  useEffect(() => {
    if (phase !== "transition") return;

    timerRef.current = setInterval(() => {
      setTransitionCount((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          const nextIdx = exerciseIdx + 1;
          setExerciseIdx(nextIdx);
          setSecondsLeft(FASCIA_EXERCISES[nextIdx].durationSec);
          setPhase("exercise");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, exerciseIdx]);

  // ── Mute toggle ─────────────────────────────────────────────
  const handleMute = () => {
    haptic("light");
    setMuted((prev) => {
      const next = !prev;
      mutedRef.current = next;
      if (next && currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
      return next;
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
    };
  }, []);

  // ── Circular progress ring ──────────────────────────────────
  const CircularTimer = ({ seconds, total }: { seconds: number; total: number }) => {
    const size = 200;
    const strokeWidth = 6;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = 1 - seconds / total;
    const offset = circumference * (1 - progress);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return (
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
            opacity={0.3}
          />
          {/* Progress ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-5xl font-extrabold text-foreground tabular-nums">
            {mins}:{secs.toString().padStart(2, "0")}
          </span>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col"
      style={{
        backgroundColor: "hsl(var(--background))",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <button
          onClick={() => {
            haptic("medium");
            onClose();
          }}
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Progress indicator */}
        {phase !== "complete" && (
          <p className="font-body text-xs text-muted-foreground uppercase tracking-wider">
            Exercise {exerciseIdx + 1} of {totalExercises}
          </p>
        )}

        <button
          onClick={handleMute}
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          aria-label={muted ? "Unmute" : "Mute"}
        >
          {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </button>
      </div>

      {/* Step dots */}
      {phase !== "complete" && (
        <div className="flex items-center justify-center gap-1.5 px-5 py-3">
          {FASCIA_EXERCISES.map((_, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === exerciseIdx ? 24 : 8,
                backgroundColor:
                  i < exerciseIdx
                    ? "hsl(var(--primary))"
                    : i === exerciseIdx
                    ? "hsl(var(--primary))"
                    : "hsl(var(--muted))",
                opacity: i <= exerciseIdx ? 1 : 0.4,
              }}
            />
          ))}
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <AnimatePresence mode="wait">
          {/* EXERCISE SCREEN */}
          {phase === "exercise" && (
            <motion.div
              key={`exercise-${exerciseIdx}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex flex-col items-center text-center gap-8"
            >
              <div>
                <p className="font-body text-xs text-primary uppercase tracking-[0.2em] mb-3">
                  Morning Fascia Release
                </p>
                <h1 className="font-display text-3xl md:text-4xl font-extrabold text-foreground leading-tight">
                  {exercise.id}. {exercise.name}
                </h1>
              </div>

              <p className="font-body text-base md:text-lg text-muted-foreground max-w-sm leading-relaxed">
                {exercise.instruction}
              </p>

              <CircularTimer seconds={secondsLeft} total={exercise.durationSec} />
            </motion.div>
          )}

          {/* TRANSITION SCREEN */}
          {phase === "transition" && (
            <motion.div
              key="transition"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex flex-col items-center text-center gap-6"
            >
              <p className="font-body text-sm text-muted-foreground uppercase tracking-wider">
                Next up
              </p>
              <h2 className="font-display text-3xl font-extrabold text-foreground">
                {FASCIA_EXERCISES[exerciseIdx + 1]?.name}
              </h2>
              <div className="font-display text-6xl font-extrabold text-primary tabular-nums">
                {transitionCount}
              </div>
            </motion.div>
          )}

          {/* COMPLETION SCREEN */}
          {phase === "complete" && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex flex-col items-center text-center gap-6"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Leaf className="h-8 w-8 text-primary" />
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-extrabold text-foreground">
                Morning release complete
              </h1>
              <p className="font-body text-base text-muted-foreground max-w-xs leading-relaxed">
                7 minutes of fascia release to wake up your body and reset your nervous system.
              </p>
              <button
                onClick={() => {
                  haptic("medium");
                  onClose();
                }}
                className="mt-4 rounded-[14px] bg-primary px-8 py-4 font-display text-base italic text-primary-foreground active:scale-[0.97] transition-transform"
              >
                Back to Somatic
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
