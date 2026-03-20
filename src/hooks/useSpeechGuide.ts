import { useState, useEffect, useRef, useCallback } from "react";

interface SpeechGuideOptions {
  steps: { id: string; title: string; body: string }[];
  playing: boolean;
  muted: boolean;
  activeStepIdx: number;
  onStepComplete: (nextIdx: number) => void;
  onAllComplete: () => void;
  rate?: number;
  pitch?: number;
}

/**
 * Uses the Web Speech API (SpeechSynthesis) to read practice steps aloud.
 * Speaks each step's body text, then advances to the next step.
 */
export function useSpeechGuide({
  steps,
  playing,
  muted,
  activeStepIdx,
  onStepComplete,
  onAllComplete,
  rate = 0.85,
  pitch = 1.0,
}: SpeechGuideOptions) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const currentStepRef = useRef(activeStepIdx);
  const playingRef = useRef(playing);

  // Track latest values in refs to avoid stale closures
  useEffect(() => { currentStepRef.current = activeStepIdx; }, [activeStepIdx]);
  useEffect(() => { playingRef.current = playing; }, [playing]);

  // Check support
  useEffect(() => {
    setSupported("speechSynthesis" in window);
  }, []);

  const stopSpeaking = useCallback(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    utteranceRef.current = null;
    setIsSpeaking(false);
  }, []);

  const speakStep = useCallback((stepIdx: number) => {
    if (!supported || muted) return;
    const step = steps[stepIdx];
    if (!step) return;

    // Cancel any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(step.body);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.lang = "en-NZ";

    // Try to pick a soft, soothing voice — prefer female voices
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
      (v) => v.lang.startsWith("en") && (v.name.toLowerCase().includes("samantha") || v.name.toLowerCase().includes("karen") || v.name.toLowerCase().includes("moira"))
    ) || voices.find(
      (v) => v.lang.startsWith("en") && v.name.toLowerCase().includes("female")
    ) || voices.find(
      (v) => v.lang.startsWith("en-") && !v.name.toLowerCase().includes("google")
    ) || voices.find(
      (v) => v.lang.startsWith("en")
    );
    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => setIsSpeaking(true);

    utterance.onend = () => {
      setIsSpeaking(false);
      if (!playingRef.current) return;

      const nextIdx = currentStepRef.current + 1;
      if (nextIdx < steps.length) {
        // Small pause between steps
        setTimeout(() => {
          if (playingRef.current) {
            onStepComplete(nextIdx);
          }
        }, 1200);
      } else {
        onAllComplete();
      }
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [supported, muted, steps, rate, pitch, onStepComplete, onAllComplete]);

  // When playing starts or step changes, speak the current step
  useEffect(() => {
    if (!supported) return;

    if (playing && !muted) {
      speakStep(activeStepIdx);
    } else {
      stopSpeaking();
    }

    return () => {
      // Don't stop on cleanup if still playing — let the utterance finish
    };
  }, [playing, activeStepIdx, muted]);

  // Stop speech when unmounting
  useEffect(() => {
    return () => stopSpeaking();
  }, [stopSpeaking]);

  return {
    supported,
    isSpeaking,
    stopSpeaking,
  };
}
