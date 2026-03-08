import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import CymaticPattern from "@/components/CymaticPatterns";
import { getCycleInfo, getLastPeriodStart } from "@/lib/cycle-utils";

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
  const info = getCycleInfo(getLastPeriodStart());
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

  const scale = isInhale ? 1.0 : isExhale ? 0.6 : (isInhale ? 1.0 : 0.8);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
        style={{ backgroundColor: "#080E14" }}
      >
        <button onClick={onClose} className="absolute right-6 top-6 text-foreground/40 hover:text-foreground transition-colors z-10">
          <X className="h-8 w-8" />
        </button>

        <h2 className="font-display text-3xl font-light italic text-foreground mb-1">{technique.name}</h2>
        <p className="font-mono text-xs text-muted-foreground mb-12">cycle {cycles + 1}</p>

        {/* Cymatic breathing pattern */}
        <motion.div
          animate={{ scale }}
          transition={{ duration: currentPhase.duration, ease: "easeInOut" }}
          className="relative flex items-center justify-center"
          style={{ width: 240, height: 240 }}
        >
          <div className="cymatic-rotate-fast">
            <CymaticPattern phase={info.phase} size={240} opacity={isInhale ? 0.6 : isExhale ? 0.2 : 0.4} active />
          </div>
          <span className="absolute font-mono text-3xl text-foreground">
            {currentPhase.duration - timer}
          </span>
        </motion.div>

        <p className="mt-10 font-display text-2xl italic text-foreground">{currentPhase.label}</p>
        <p className="mt-2 font-mono text-xs text-muted-foreground">
          {timer + 1} of {currentPhase.duration}s
        </p>
      </motion.div>
    </AnimatePresence>
  );
}
