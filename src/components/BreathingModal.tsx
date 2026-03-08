import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface BreathingTechnique {
  name: string;
  phases: { label: string; duration: number }[];
}

const TECHNIQUES: Record<string, BreathingTechnique> = {
  box: {
    name: "Box Breathing",
    phases: [
      { label: "Inhale", duration: 4 },
      { label: "Hold", duration: 4 },
      { label: "Exhale", duration: 4 },
      { label: "Hold", duration: 4 },
    ],
  },
  sigh: {
    name: "Physiological Sigh",
    phases: [
      { label: "Inhale deeply", duration: 3 },
      { label: "Second short inhale", duration: 1 },
      { label: "Long exhale", duration: 6 },
    ],
  },
  coherent: {
    name: "Coherent Breathing",
    phases: [
      { label: "Inhale", duration: 6 },
      { label: "Exhale", duration: 6 },
    ],
  },
  "4-7-8": {
    name: "4-7-8 Breathing",
    phases: [
      { label: "Inhale", duration: 4 },
      { label: "Hold", duration: 7 },
      { label: "Exhale", duration: 8 },
    ],
  },
};

interface Props {
  techniqueId: string;
  onClose: () => void;
}

export default function BreathingModal({ techniqueId, onClose }: Props) {
  const technique = TECHNIQUES[techniqueId];
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [timer, setTimer] = useState(0);
  const [cycles, setCycles] = useState(0);

  const currentPhase = technique.phases[phaseIndex];
  const isInhale = currentPhase.label.toLowerCase().includes("inhale");
  const isExhale = currentPhase.label.toLowerCase().includes("exhale");

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev + 1 >= currentPhase.duration) {
          setPhaseIndex((pi) => {
            const next = (pi + 1) % technique.phases.length;
            if (next === 0) setCycles((c) => c + 1);
            return next;
          });
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phaseIndex, currentPhase.duration, technique.phases.length]);

  const scale = isInhale ? 1.4 : isExhale ? 0.7 : 1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-foreground/95"
      >
        <button onClick={onClose} className="absolute right-6 top-6 text-primary-foreground/60 hover:text-primary-foreground transition-colors">
          <X className="h-8 w-8" />
        </button>

        <h2 className="font-display text-3xl font-semibold text-primary-foreground mb-2">{technique.name}</h2>
        <p className="text-primary-foreground/50 text-sm mb-12">Cycle {cycles + 1}</p>

        <motion.div
          animate={{ scale }}
          transition={{ duration: currentPhase.duration, ease: "easeInOut" }}
          className="flex h-48 w-48 items-center justify-center rounded-full border-2 border-accent/40"
          style={{ background: `radial-gradient(circle, hsl(149 19% 55% / 0.3), transparent)` }}
        >
          <span className="text-primary-foreground/80 text-lg font-medium">
            {currentPhase.duration - timer}
          </span>
        </motion.div>

        <p className="mt-10 font-display text-2xl text-primary-foreground">{currentPhase.label}</p>
        <p className="mt-2 text-primary-foreground/40 text-sm">
          {timer + 1} of {currentPhase.duration} seconds
        </p>
      </motion.div>
    </AnimatePresence>
  );
}
