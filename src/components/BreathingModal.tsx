import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { SacredSpiral } from "@/components/BotanicalElements";
import { useCycle } from "@/contexts/CycleContext";

interface BreathingTechnique {
  name: string;
  phases: { label: string; duration: number }[];
}

const TECHNIQUES: Record<string, BreathingTechnique> = {
  box: {
    name: "Box Breathing",
    phases: [
      { label: "breathe in", duration: 4 },
      { label: "hold", duration: 4 },
      { label: "breathe out", duration: 4 },
      { label: "rest", duration: 4 },
    ],
  },
  sigh: {
    name: "Physiological Sigh",
    phases: [
      { label: "breathe in deeply", duration: 3 },
      { label: "second short inhale", duration: 1 },
      { label: "long exhale", duration: 6 },
    ],
  },
  coherent: {
    name: "Coherent Breathing",
    phases: [
      { label: "breathe in", duration: 6 },
      { label: "breathe out", duration: 6 },
    ],
  },
  "4-7-8": {
    name: "4-7-8 Breathing",
    phases: [
      { label: "breathe in", duration: 4 },
      { label: "hold", duration: 7 },
      { label: "breathe out", duration: 8 },
    ],
  },
};

const PHASE_HEX: Record<string, string> = {
  menstrual: "#C4526E",
  follicular: "#5C4A9E",
  ovulatory: "#C47A8A",
  luteal: "#9B89B4",
};

interface Props {
  techniqueId: string;
  onClose: () => void;
}

export default function BreathingModal({ techniqueId, onClose }: Props) {
  const technique = TECHNIQUES[techniqueId];
  const { currentPhase: cyclePhase } = useCycle();
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [timer, setTimer] = useState(0);
  const [cycles, setCycles] = useState(0);

  const currentPhase = technique.phases[phaseIndex];
  const isInhale = currentPhase.label.toLowerCase().includes("in");
  const isExhale = currentPhase.label.toLowerCase().includes("out");

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

  const scale = isInhale ? 1.0 : isExhale ? 0.6 : 0.8;
  const phaseColor = PHASE_HEX[info.phase] || "#5C4A9E";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-6"
        style={{ backgroundColor: "#FAF6EF", paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <button onClick={onClose} className="absolute right-4 top-4 md:right-6 md:top-6 text-foreground/40 active:text-foreground transition-colors z-10 min-w-[44px] min-h-[44px] flex items-center justify-center touch-btn">
          <X className="h-7 w-7 md:h-8 md:w-8" />
        </button>

        <h2 className="font-display text-2xl md:text-3xl font-bold italic text-foreground mb-1 text-center">{technique.name}</h2>
        <p className="font-mono text-xs text-muted-foreground mb-8 md:mb-12">cycle {cycles + 1}</p>

        {/* Sacred spiral breathing animation */}
        <motion.div
          animate={{ scale }}
          transition={{ duration: currentPhase.duration, ease: "easeInOut" }}
          className="relative flex items-center justify-center"
          style={{ width: 200, height: 200 }}
        >
          <div className="sketch-rotate-fast" style={{ willChange: "transform" }}>
            <SacredSpiral size={200} opacity={isInhale ? 0.5 : isExhale ? 0.15 : 0.3} color={phaseColor} />
          </div>
          <span className="absolute font-mono text-3xl text-foreground">
            {currentPhase.duration - timer}
          </span>
        </motion.div>

        <p className="mt-8 md:mt-10 font-hand text-2xl md:text-3xl text-foreground" style={{ color: phaseColor }}>{currentPhase.label}</p>
        <p className="mt-2 font-mono text-xs text-muted-foreground">
          {timer + 1} of {currentPhase.duration}s
        </p>
      </motion.div>
    </AnimatePresence>
  );
}
