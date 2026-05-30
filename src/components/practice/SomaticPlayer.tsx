import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  VolumeX,
  Volume2,
  X,
  Loader2,
} from "lucide-react";
import type { PracticeConfig, PracticeStep } from "@/data/practices";
import { formatDuration } from "@/data/practices";
import { useAudioGuide } from "./AudioGuide";
import { useSpeechGuide } from "@/hooks/useSpeechGuide";
import { useElevenLabsTTS } from "@/hooks/useElevenLabsTTS";
import { getSomaticScriptById } from "@/data/somatic-scripts";
import { resolveScriptVoiceId, resolveVoiceSettings } from "@/lib/script-audio";
import { haptic } from "@/hooks/use-mobile";

interface Props {
  practice: PracticeConfig;
  onClose: () => void;
}

export default function SomaticPlayer({ practice, onClose }: Props) {
  const steps = practice.steps || [];
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Get the TTS script — prefer the script attached to the practice config
  // (used by meditation & sleep readings), fall back to the somatic library.
  const somaticScript = getSomaticScriptById(practice.id);
  const ttsScript =
    practice.ttsScript || somaticScript?.ttsScript || somaticScript?.narration || "";

  // Resolve which ElevenLabs voice to use and which preset to apply.
  const ttsVoiceId = resolveScriptVoiceId({
    scriptId: practice.id,
    explicitVoiceId: practice.ttsVoiceId,
    evidenceSource: practice.ttsEvidenceSource,
  });
  const ttsVoiceSettings = resolveVoiceSettings({
    isSleep: practice.ttsIsSleep,
  });

  // ElevenLabs TTS generation hook
  const {
    audioUrl: generatedAudioUrl,
    loading: ttsLoading,
    error: ttsError,
    generate: generateTTS,
    hasGeneratedAudio,
  } = useElevenLabsTTS({
    practiceId: practice.id,
    ttsScript,
    enabled: !!ttsScript,
    voiceId: ttsVoiceId,
    voiceSettings: ttsVoiceSettings,
  });

  // Auto-generate narration on first play if we have a script but no audio yet
  const autoGenRef = useRef(false);
  useEffect(() => {
    if (
      playing &&
      ttsScript &&
      !hasGeneratedAudio &&
      !ttsLoading &&
      !ttsError &&
      !autoGenRef.current
    ) {
      autoGenRef.current = true;
      generateTTS();
    }
  }, [playing, ttsScript, hasGeneratedAudio, ttsLoading, ttsError, generateTTS]);

  // Use generated audio URL if available, otherwise fall back to practice config
  const effectiveAudioUrl = hasGeneratedAudio
    ? generatedAudioUrl
    : practice.audio.audioUrl;

  const { hasAudio, currentTime, seek, restart: audioRestart } = useAudioGuide({
    audioUrl: effectiveAudioUrl,
    enabled: practice.audio.enabled,
    muted,
    playing,
    mediaMetadata: {
      title: practice.title,
      artist: "SIGNAL",
      album: practice.subtitle || practice.category,
      artworkUrl: practice.illustrationUrl,
    },
    onMediaPlay: () => setPlaying(true),
    onMediaPause: () => setPlaying(false),
    onTimeUpdate: (t) => {
      for (let i = steps.length - 1; i >= 0; i--) {
        const step = steps[i];
        if (step.startTimeSec !== undefined && t >= step.startTimeSec) {
          setActiveStepIdx(i);
          break;
        }
      }
    },
    onEnded: () => {
      setPlaying(false);
      setActiveStepIdx(steps.length - 1);
    },
  });

  // Use browser speech when no recorded/generated audio is available.
  // Falls back if there's no TTS script, or if TTS generation failed.
  const hasTTSPath = !!ttsScript;
  const ttsBlocked = hasTTSPath && !ttsError;
  const { supported: speechSupported, isSpeaking } = useSpeechGuide({
    steps,
    playing: playing && !hasAudio && !ttsBlocked,
    muted,
    activeStepIdx,
    onStepComplete: (nextIdx) => setActiveStepIdx(nextIdx),
    onAllComplete: () => {
      setPlaying(false);
      setActiveStepIdx(steps.length - 1);
    },
    rate: 0.72,
    pitch: 0.88,
  });

  const usingSpeech = !hasAudio && !ttsBlocked && speechSupported;

  // Elapsed timer (works even without audio)
  useEffect(() => {
    if (!playing) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [playing]);

  // Manual step navigation when no audio timing
  const goToStep = useCallback(
    (idx: number) => {
      if (idx < 0 || idx >= steps.length) return;
      setActiveStepIdx(idx);
      const step = steps[idx];
      if (step.startTimeSec !== undefined && hasAudio) {
        seek(step.startTimeSec);
      }
    },
    [steps, hasAudio, seek]
  );

  const handleRestart = () => {
    haptic("light");
    setElapsed(0);
    setActiveStepIdx(0);
    if (hasAudio) audioRestart();
  };

  const handleSkipBack = () => {
    haptic("light");
    if (hasAudio) {
      seek(Math.max(0, currentTime - 10));
    } else {
      goToStep(Math.max(0, activeStepIdx - 1));
    }
  };

  const handleSkipForward = () => {
    haptic("light");
    if (hasAudio) {
      seek(currentTime + 10);
    } else {
      goToStep(Math.min(steps.length - 1, activeStepIdx + 1));
    }
  };

  const progress = practice.durationSec > 0 ? Math.min(1, elapsed / practice.durationSec) : 0;

  return (
    <AnimatePresence>
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
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <div className="flex-1 min-w-0">
            <p className="font-body text-[11px] text-primary uppercase tracking-wider">
              {practice.category}
            </p>
            <h2 className="font-display text-xl md:text-2xl font-bold italic text-foreground truncate">
              {practice.title}
            </h2>
            <p className="font-body text-sm text-muted-foreground">
              {practice.subtitle} · {formatDuration(practice.durationSec)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-3 w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
            aria-label="Close practice"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-5 mb-1">
          <div className="w-full h-1 rounded-full bg-muted/60 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-primary"
              style={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="font-body text-[10px] text-muted-foreground">
              {formatDuration(elapsed)}
            </span>
            <span className="font-body text-[10px] text-muted-foreground">
              {formatDuration(practice.durationSec)}
            </span>
          </div>
        </div>

        {/* Steps list */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
          {steps.map((step, i) => {
            const isActive = i === activeStepIdx;
            const isPast = i < activeStepIdx;

            return (
              <motion.div
                key={step.id}
                layout
                onClick={() => {
                  haptic("light");
                  goToStep(i);
                }}
                className={`rounded-2xl p-4 cursor-pointer transition-all duration-300 ${
                  isActive
                    ? "bg-primary/10 border border-primary/25 shadow-sm"
                    : isPast
                    ? "bg-secondary/30 opacity-50"
                    : "bg-secondary/20 opacity-60"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 font-body text-xs transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : isPast
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isPast ? "✓" : i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4
                      className={`font-display text-sm font-semibold mb-0.5 ${
                        isActive ? "italic text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {step.title}
                    </h4>
                    <p
                      className={`font-body text-sm leading-relaxed ${
                        isActive ? "text-foreground/80" : "text-muted-foreground/60"
                      }`}
                    >
                      {step.body}
                    </p>
                    {/* Speaking indicator */}
                    {isActive && usingSpeech && isSpeaking && playing && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <div className="flex gap-0.5">
                          {[0, 1, 2].map((j) => (
                            <motion.div
                              key={j}
                              className="w-1 rounded-full bg-primary"
                              animate={{ height: [4, 10, 4] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: j * 0.15 }}
                            />
                          ))}
                        </div>
                        <span className="font-body text-[10px] text-primary">Speaking</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Audio status */}
        {!hasAudio && !hasGeneratedAudio && ttsScript && !ttsLoading && !ttsError && (
          <div className="px-5 py-2 flex flex-col items-center gap-2">
            <button
              onClick={() => {
                haptic("medium");
                generateTTS();
              }}
              className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-display text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              Generate Voice Narration
            </button>
            <p className="font-body text-xs text-muted-foreground/60 text-center">
              Uses AI voice · First time only, then cached
            </p>
          </div>
        )}
        {ttsLoading && (
          <div className="px-5 py-3 flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <p className="font-body text-sm text-primary">Generating voice narration…</p>
          </div>
        )}
        {ttsError && !hasAudio && (
          <div className="px-5 py-2 flex flex-col items-center gap-1">
            <p className="font-body text-xs text-destructive text-center">{ttsError}</p>
            {usingSpeech && (
              <p className="font-body text-xs text-muted-foreground/60 text-center">
                Using browser voice as fallback
              </p>
            )}
          </div>
        )}
        {usingSpeech && !ttsLoading && !ttsError && !ttsScript && (
          <div className="px-5 py-2">
            <p className="font-body text-xs text-primary/60 text-center">
              Using voice guidance · Press play to begin
            </p>
          </div>
        )}
        {!hasAudio && !speechSupported && !hasGeneratedAudio && practice.audio.enabled && (
          <div className="px-5 py-2">
            <p className="font-body text-xs text-muted-foreground/60 text-center">
              Audio guidance is unavailable in this browser. You can still follow the on-screen steps.
            </p>
          </div>
        )}

        {/* Controls */}
        <div className="px-5 pb-5 pt-3 flex items-center justify-center gap-3">
          <button
            onClick={handleRestart}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-secondary/80 transition-colors"
            aria-label="Restart"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={handleSkipBack}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-secondary/80 transition-colors"
            aria-label="Skip back"
          >
            <SkipBack className="h-4 w-4" />
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
            onClick={handleSkipForward}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-secondary/80 transition-colors"
            aria-label="Skip forward"
          >
            <SkipForward className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              haptic("light");
              setMuted(!muted);
            }}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-secondary/80 transition-colors"
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
