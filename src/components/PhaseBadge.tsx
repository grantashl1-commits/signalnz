import { Phase, PHASE_LABELS, PHASE_SHORT } from "@/lib/cycle-utils";

interface PhaseBadgeProps {
  phase: Phase;
  cycleDay?: number;
  size?: "sm" | "md" | "lg";
}

const PHASE_BG: Record<Phase, string> = {
  menstrual: "phase-menstrual-light",
  follicular: "phase-follicular-light",
  ovulatory: "phase-ovulatory-light",
  luteal: "phase-luteal-light",
};

export default function PhaseBadge({ phase, cycleDay, size = "md" }: PhaseBadgeProps) {
  const sizeClasses = {
    sm: "px-2.5 py-1 text-[11px] gap-1.5",
    md: "px-3 py-1.5 text-xs gap-2",
    lg: "px-4 py-2 text-sm gap-2.5",
  };

  return (
    <span className={`inline-flex items-center rounded-full font-hand font-bold ${PHASE_BG[phase]} ${sizeClasses[size]}`}>
      <span>{PHASE_SHORT[phase].toLowerCase()}</span>
      {cycleDay !== undefined && (
        <span className="font-body opacity-70 text-[0.85em]">D{cycleDay}</span>
      )}
    </span>
  );
}
