import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Phase } from "@/lib/cycle-utils";
import { getKidAlternative } from "@/data/kids-alternatives";
import { haptic } from "@/hooks/use-mobile";

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#C4526E",
  follicular: "#7D9E82",
  ovulatory: "#E8A030",
  luteal: "#9B89B4",
};

interface KidsDinnerAltProps {
  dinnerName: string;
  phase: Phase;
}

export default function KidsDinnerAlt({ dinnerName, phase }: KidsDinnerAltProps) {
  const [expanded, setExpanded] = useState(false);
  const alt = getKidAlternative(dinnerName);
  const phaseColor = PHASE_HEX[phase];

  return (
    <div className="mt-2">
      <button
        onClick={() => {
          haptic("light");
          setExpanded(!expanded);
        }}
        className="touch-btn flex items-center gap-1 font-body text-[13px] italic text-muted-foreground"
        style={{ fontWeight: 300 }}
      >
        Kids won't eat this? →
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div
              className="mt-2 rounded-xl p-3"
              style={{
                borderLeft: `3px solid ${phaseColor}`,
                backgroundColor: `${phaseColor}08`,
              }}
            >
              <p className="font-hand text-sm font-bold" style={{ color: phaseColor }}>
                Kid-friendly version
              </p>
              <p className="font-body text-xs text-muted-foreground mt-1 leading-relaxed">
                {alt}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
