import { useState } from "react";
import { WildStar } from "@/components/BotanicalElements";
import { Phase, getSeedsTaken, setSeedsTaken } from "@/lib/cycle-utils";
import { Checkbox } from "@/components/ui/checkbox";
import { haptic } from "@/hooks/use-mobile";

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#C4526E",
  follicular: "#5C4A9E",
  ovulatory: "#C47A8A",
  luteal: "#9B89B4",
};

interface SeedCyclingCardProps {
  cycleDay: number;
  phase: Phase;
}

export default function SeedCyclingCard({ cycleDay, phase }: SeedCyclingCardProps) {
  const todayStr = new Date().toISOString().split("T")[0];
  const [taken, setTaken] = useState(getSeedsTaken(todayStr));
  const [showStar, setShowStar] = useState(false);
  const isFirstHalf = cycleDay <= 14;
  const phaseColor = PHASE_HEX[phase];

  const handleToggle = (checked: boolean) => {
    haptic("light");
    setTaken(checked);
    setSeedsTaken(todayStr, checked);
    if (checked) {
      setShowStar(true);
      setTimeout(() => setShowStar(false), 1500);
    }
  };

  return (
    <div
      className="rounded-[14px] p-3 flex items-center gap-3"
      style={{
        backgroundColor: "#F5EDE0",
        boxShadow: "0 2px 12px rgba(139, 111, 94, 0.1)",
        maxHeight: 60,
      }}
    >
      {/* Seed SVG */}
      <svg width="28" height="28" viewBox="0 0 28 28" className="flex-shrink-0">
        <ellipse cx="10" cy="14" rx="6" ry="8" fill="none" stroke="#8B6F5E" strokeWidth="1" />
        <ellipse cx="18" cy="14" rx="6" ry="8" fill="none" stroke="#8B6F5E" strokeWidth="1" />
        <path d="M14 6 Q14 2 16 0" fill="none" stroke="#8B6F5E" strokeWidth="0.8" />
      </svg>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-hand text-xs font-bold" style={{ color: phaseColor }}>
          Seed cycling
        </p>
        <p className="font-body text-[11px] text-foreground truncate">
          {isFirstHalf
            ? "Pumpkin seeds · 1 tbsp + Flaxseeds · 1 tbsp"
            : "Sunflower seeds · 1 tbsp + Sesame · 1 tbsp"}
        </p>
      </div>

      {/* Checkbox */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {showStar && <WildStar size={14} color={phaseColor} />}
        <Checkbox
          checked={taken}
          onCheckedChange={(c) => handleToggle(c === true)}
          className="h-5 w-5"
          style={taken ? { backgroundColor: phaseColor, borderColor: phaseColor } : {}}
        />
      </div>
    </div>
  );
}
