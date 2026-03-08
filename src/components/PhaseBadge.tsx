import { Phase, PHASE_LABELS, PHASE_SHORT } from "@/lib/cycle-utils";
import { CymaticMini } from "@/components/CymaticPatterns";

interface PhaseBadgeProps {
  phase: Phase;
  cycleDay?: number;
  size?: "sm" | "md" | "lg";
}

const PHASE_BG: Record<Phase, string> = {
  menstrual: "bg-phase-menstrual",
  follicular: "bg-phase-follicular",
  ovulatory: "bg-phase-ovulatory",
  luteal: "bg-phase-luteal",
};

const PHASE_TEXT: Record<Phase, string> = {
  menstrual: "text-white",
  follicular: "text-primary-foreground",
  ovulatory: "text-primary-foreground",
  luteal: "text-white",
};

export default function PhaseBadge({ phase, cycleDay, size = "md" }: PhaseBadgeProps) {
  const sizeClasses = {
    sm: "px-2.5 py-1 text-[10px] gap-1.5",
    md: "px-3 py-1.5 text-xs gap-2",
    lg: "px-4 py-2 text-sm gap-2.5",
  };

  return (
    <span className={`inline-flex items-center rounded-full font-body font-medium ${PHASE_BG[phase]} ${PHASE_TEXT[phase]} ${sizeClasses[size]}`}>
      <span className="flex-shrink-0 overflow-hidden rounded-full">
        <CymaticMini phase={phase} size={size === "lg" ? 20 : size === "md" ? 16 : 12} />
      </span>
      <span className="uppercase tracking-wider">{PHASE_SHORT[phase]}</span>
      {cycleDay !== undefined && (
        <span className="font-mono opacity-80">D{cycleDay}</span>
      )}
    </span>
  );
}
