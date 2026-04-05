import { useState } from "react";
import { motion } from "framer-motion";
import { Phase, PHASE_SHORT } from "@/lib/cycle-utils";
import { haptic } from "@/hooks/use-mobile";

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#8B1A2B",
  follicular: "#4CAF50",
  ovulatory: "#F4A63A",
  luteal: "#D4722A",
};

const PHASES: { phase: Phase; start: number; end: number; width: string }[] = [
  { phase: "menstrual", start: 1, end: 5, width: "17.86%" },
  { phase: "follicular", start: 6, end: 13, width: "28.57%" },
  { phase: "ovulatory", start: 14, end: 17, width: "14.29%" },
  { phase: "luteal", start: 18, end: 28, width: "39.29%" },
];

interface Props {
  cycleDay: number;
  currentPhase: Phase;
  onPhasePreview?: (phase: Phase) => void;
}

export default function PhaseProgressStrip({ cycleDay, currentPhase, onPhasePreview }: Props) {
  const [previewPhase, setPreviewPhase] = useState<Phase | null>(null);

  const handleTap = (phase: Phase) => {
    haptic("light");
    setPreviewPhase(phase === previewPhase ? null : phase);
    onPhasePreview?.(phase);
  };

  const markerPosition = ((cycleDay - 1) / 28) * 100;

  return (
    <div className="space-y-2">
      <div className="relative h-3 rounded-full overflow-hidden flex">
        {PHASES.map(({ phase, width }) => (
          <button
            key={phase}
            onClick={() => handleTap(phase)}
            className="h-full transition-opacity active:opacity-80"
            style={{ width, backgroundColor: PHASE_HEX[phase] }}
          />
        ))}

        {/* Current day marker */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
          style={{ left: `${markerPosition}%` }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="h-5 w-5 rounded-full border-2 border-card bg-foreground shadow-md" />
        </motion.div>
      </div>

      {/* Phase labels */}
      <div className="flex">
        {PHASES.map(({ phase, width }) => (
          <div key={phase} style={{ width }} className="text-center">
            <span
              className={`font-hand text-[10px] ${phase === currentPhase ? "font-bold text-foreground" : "text-muted-foreground"}`}
            >
              {PHASE_SHORT[phase].toLowerCase()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
