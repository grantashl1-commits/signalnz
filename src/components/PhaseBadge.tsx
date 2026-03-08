import { Phase, PHASE_COLORS, PHASE_LABELS } from "@/lib/cycle-utils";

interface PhaseBadgeProps {
  phase: Phase;
  cycleDay?: number;
  size?: "sm" | "md" | "lg";
}

export default function PhaseBadge({ phase, cycleDay, size = "md" }: PhaseBadgeProps) {
  const sizeClasses = {
    sm: "px-2.5 py-1 text-xs",
    md: "px-4 py-1.5 text-sm",
    lg: "px-5 py-2 text-base",
  };

  return (
    <span className={`inline-flex items-center gap-2 rounded-full font-medium ${PHASE_COLORS[phase]} ${sizeClasses[size]}`}>
      {PHASE_LABELS[phase]}
      {cycleDay !== undefined && <span className="opacity-80">· Day {cycleDay}</span>}
    </span>
  );
}
