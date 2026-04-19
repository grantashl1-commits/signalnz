import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, VolumeX, Volume2, X, Loader2 } from "lucide-react";
import type { PracticeConfig } from "@/data/practices";
import { useAudioGuide } from "./AudioGuide";
import { useElevenLabsTTS } from "@/hooks/useElevenLabsTTS";
import { haptic } from "@/hooks/use-mobile";
import { CALM_READER_VOICE_LABEL, pickPreferredReaderVoice } from "@/lib/script-audio";

interface Props {
  practice: PracticeConfig;
  onClose: () => void;
}

export default function BreathworkPlayer({ practice, onClose }: Props) {
  const phases = practice.phases || [];
  const totalPhaseTime = phases.reduce((a, p) => a + p.seconds, 0);

  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [tick, setTick] = useState(0);
  const [round, setRound] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Voice cue state
  const [lastCue, setLastCue] = useState("");
  const cueTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ElevenLabs TTS for full narration (Lily voice)
  const hasTtsScript = !!practice.ttsScript;
  const {
    audioUrl: ttsAudioUrl,
    loading: ttsLoading,
    error: ttsError,
    generate: generateTts,
  } = useElevenLabsTTS({
    practiceId: practice.id,
    ttsScript: practice.ttsScript || "",
    enabled: hasTtsScript,
    author: practice.author,
    voiceGender: practice.voiceGender,
  });

  // Determine the best audio source: TTS narration > pre-uploaded file
  const effectiveAudioUrl = ttsAudioUrl || practice.audio.audioUrl;

  const { hasAudio, restart: restartAudio } = useAudioGuide({
    audioUrl: effectiveAudioUrl,
    enabled: practice.audio.enabled || !!ttsAudioUrl,
    muted,
    playing,
  });

  // Auto-generate TTS on mount if script exists but no cached audio
  useEffect(() => {
    if (hasTtsScript && !ttsAudioUrl && !ttsLoading && !ttsError) {
      generateTts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Speak cue using SpeechSynthesis ONLY when no audio guide is playing
  const speakCue = useCallback(
    (text: string) => {
      if (muted || !text) return;
      setLastCue(text);
      if (cueTimeoutRef.current) clearTimeout(cueTimeoutRef.current);
      cueTimeoutRef.current = setTimeout(() => setLastCue(""), 2000);

      // Only use Web Speech API if no audio narration is playing
      if (!hasAudio && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = "en-US";
        u.rate = 0.82;
        u.pitch = 0.92;
        u.volume = 0.75;
        const voice = pickPreferredReaderVoice(window.speechSynthesis.getVoices());
        if (voice) u.voice = voice;
        window.speechSynthesis.speak(u);
      }
    },
    [muted, hasAudio]
  );

  // Timer loop
  useEffect(() => {
    if (!playing || phases.length === 0) return;

    timerRef.current = setInterval(() => {
      setElapsed((e) => e + 1);
      setTick((t) => {
        const currentPhase = phases[phaseIdx];
        if (t + 1 >= currentPhase.seconds) {
          setPhaseIdx((i) => {
            const next = (i + 1) % phases.length;
            if (next === 0) setRound((r) => r + 1);
            const nextPhase = phases[next];
            if (nextPhase.cue) speakCue(nextPhase.cue);
            return next;
          });
          return 0;
        }
        return t + 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [playing, phaseIdx, phases, speakCue]);

  // Speak first cue on start
  useEffect(() => {
    if (phases[0]?.cue && playing) {
      speakCue(phases[0].cue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRestart = () => {
    haptic("light");
    setPhaseIdx(0);
    setTick(0);
    setRound(0);
    setElapsed(0);
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    if (restartAudio) restartAudio();
  };

  const handleClose = () => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    onClose();
  };

  const currentPhase = phases[phaseIdx] || { label: "", seconds: 4 };
  const remaining = currentPhase.seconds - tick;
  const isInhale = currentPhase.label.toLowerCase().includes("inhale") || currentPhase.label.toLowerCase().includes("sniff");
  const isExhale = currentPhase.label.toLowerCase().includes("exhale");
  const scale = isInhale
    ? 0.6 + 0.4 * (tick / currentPhase.seconds)
    : isExhale
    ? 1.0 - 0.4 * (tick / currentPhase.seconds)
    : 0.8;

  const maxRounds = practice.rounds || 999;
  const elapsedMin = Math.floor(elapsed / 60);
  const elapsedSec = elapsed % 60;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-6"
        style={{
          backgroundColor: "hsl(var(--background))",
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {/* Close */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 md:right-6 md:top-6 text-muted-foreground hover:text-foreground transition-colors z-10 min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="End session"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Title */}
        <div className="text-center mb-2">
          <h2 className="font-display text-2xl md:text-3xl font-bold italic text-foreground">
            {practice.title}
          </h2>
          <p className="font-body text-sm text-muted-foreground mt-1">
            {practice.subtitle}
          </p>
        </div>

        {/* Round + Time */}
        <div className="flex items-center gap-4 mb-6">
          <span className="font-body text-xs text-muted-foreground">
            round {round + 1}{maxRounds < 999 ? ` / ${maxRounds}` : ""}
          </span>
          <span className="text-muted-foreground/30">·</span>
          <span className="font-body text-xs text-muted-foreground">
            {elapsedMin}:{elapsedSec.toString().padStart(2, "0")}
          </span>
        </div>

        {/* Breathing circle animation */}
        <div className="relative w-56 h-56 md:w-64 md:h-64 flex items-center justify-center mb-6">
          {/* Outer pulse ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary/20"
            animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.15, 0.3] }}
            transition={{ duration: totalPhaseTime || 4, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Breathing orb */}
          <div
            className="absolute rounded-full bg-primary/10 transition-transform ease-in-out"
            style={{
              width: "85%",
              height: "85%",
              transform: `scale(${scale})`,
              transitionDuration: `${currentPhase.seconds * 0.9}s`,
            }}
          />
          <div className="absolute w-[60%] h-[60%] rounded-full bg-primary/15 border border-primary/25" />
          <div className="absolute w-[40%] h-[40%] rounded-full bg-primary/20" />

          {/* Center content */}
          <div className="relative text-center z-10">
            <p className="font-display text-xl italic text-primary mb-1">
              {currentPhase.label}
            </p>
            <p className="font-body text-5xl text-foreground font-light">
              {remaining}
            </p>
          </div>
        </div>

        {/* Voice cue toast */}
        <AnimatePresence>
          {lastCue && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="font-display text-lg italic text-primary/70 mb-4 h-7"
            >
              "{lastCue}"
            </motion.p>
          )}
        </AnimatePresence>
        {!lastCue && <div className="h-7 mb-4" />}

        {/* Audio status badge */}
        <div className="mb-6">
          {ttsLoading ? (
            <span className="font-body text-[11px] px-3 py-1 rounded-full bg-primary/10 text-primary inline-flex items-center gap-1.5">
              <Loader2 className="h-3 w-3 animate-spin" />
              preparing {CALM_READER_VOICE_LABEL}…
            </span>
          ) : hasAudio ? (
            <span className="font-body text-[11px] px-3 py-1 rounded-full bg-primary/10 text-primary">
              guided by {CALM_READER_VOICE_LABEL}
            </span>
          ) : ttsError ? (
            <span className="font-body text-[11px] px-3 py-1 rounded-full bg-muted text-muted-foreground">
              voice cues active
            </span>
          ) : (
            <span className="font-body text-[11px] px-3 py-1 rounded-full bg-muted text-muted-foreground">
              timer only
            </span>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleRestart}
            className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-secondary/80 transition-colors"
            aria-label="Restart"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              haptic("medium");
              setPlaying(!playing);
            }}
            className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:opacity-90 transition-opacity"
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
          </button>
          <button
            onClick={() => {
              haptic("light");
              setMuted(!muted);
              if ("speechSynthesis" in window && !muted) window.speechSynthesis.cancel();
            }}
            className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-secondary/80 transition-colors"
            aria-label={muted ? "Unmute voice" : "Mute voice"}
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        </div>

        {/* Fallback message */}
        {!hasAudio && !ttsLoading && practice.audio.enabled && (
          <p className="font-body text-xs text-muted-foreground/60 mt-6 text-center max-w-xs">
            Audio guidance is loading. Follow the on-screen breathing circle in the meantime.
          </p>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
