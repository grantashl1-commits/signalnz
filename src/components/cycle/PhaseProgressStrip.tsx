import { useState } from "react";
import { motion } from "framer-motion";
import { Phase, PHASE_SHORT } from "@/lib/cycle-utils";
import { haptic } from "@/hooks/use-mobile";

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#C4526E",
  follicular: "#5C4A9E",
  ovulatory: "#C47A8A",
  luteal: "#9B89B4",
};

const PHASES: { phase: Phase; start: number; end: number; days: number }[] = [
  { phase: "menstrual", start: 1, end: 5, days: 5 },
  { phase: "follicular", start: 6, end: 13, days: 8 },
  { phase: "ovulatory", start: 14, end: 17, days: 4 },
  { phase: "luteal", start: 18, end: 28, days: 11 },
];

const TOTAL_DAYS = 28;

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

  // SVG dimensions
  const size = 260;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 100;
  const strokeWidth = 18;
  const gapAngle = 3; // degrees gap between segments

  // Build arc segments
  const segments: { phase: Phase; startAngle: number; endAngle: number; color: string }[] = [];
  let cumulativeDays = 0;
  PHASES.forEach(({ phase, days }) => {
    const startAngle = (cumulativeDays / TOTAL_DAYS) * 360 - 90;
    cumulativeDays += days;
    const endAngle = (cumulativeDays / TOTAL_DAYS) * 360 - 90;
    segments.push({ phase, startAngle: startAngle + gapAngle / 2, endAngle: endAngle - gapAngle / 2, color: PHASE_HEX[phase] });
  });

  // Current day marker position on the arc
  const dayAngle = ((cycleDay - 0.5) / TOTAL_DAYS) * 360 - 90;
  const dayRad = (dayAngle * Math.PI) / 180;
  const markerX = cx + radius * Math.cos(dayRad);
  const markerY = cy + radius * Math.sin(dayRad);

  // Arc path helper
  const arcPath = (startDeg: number, endDeg: number, r: number) => {
    const startRad = (startDeg * Math.PI) / 180;
    const endRad = (endDeg * Math.PI) / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const largeArc = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  // Label positions (midpoint of each arc, pushed outward)
  const labelRadius = radius + 28;

  return (
    <div className="flex flex-col items-center" style={{ padding: '8px 0 16px' }}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        className="overflow-visible"
      >
        <defs>
          {/* Glow filter for the marker */}
          <filter id="marker-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Subtle glow for active segment */}
          <filter id="segment-glow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Phase arc segments */}
        {segments.map(({ phase, startAngle, endAngle, color }) => {
          const isActive = phase === currentPhase;
          return (
            <g key={phase} onClick={() => handleTap(phase)} style={{ cursor: "pointer" }}>
              <motion.path
                d={arcPath(startAngle, endAngle, radius)}
                fill="none"
                stroke={color}
                strokeWidth={isActive ? strokeWidth + 4 : strokeWidth}
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: isActive ? 1 : 0.35 }}
                transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
                filter={isActive ? "url(#segment-glow)" : undefined}
              />
            </g>
          );
        })}

        {/* Phase labels around the wheel */}
        {segments.map(({ phase, startAngle, endAngle }) => {
          const midAngle = ((startAngle + endAngle) / 2 * Math.PI) / 180;
          const lx = cx + labelRadius * Math.cos(midAngle);
          const ly = cy + labelRadius * Math.sin(midAngle);
          const isActive = phase === currentPhase;
          return (
            <text
              key={`label-${phase}`}
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="central"
              fill={isActive ? "hsl(280, 20%, 25%)" : "hsl(284, 16%, 60%)"}
              fontSize={isActive ? 10 : 9}
              fontFamily="var(--font-hand)"
              fontWeight={isActive ? 700 : 400}
              style={{ textTransform: "lowercase" }}
            >
              {PHASE_SHORT[phase].toLowerCase()}
            </text>
          );
        })}

        {/* Center content */}
        <text
          x={cx}
          y={cy - 14}
          textAnchor="middle"
          dominantBaseline="central"
          fill="hsl(280, 20%, 25%)"
          fontSize={32}
          fontFamily="var(--font-display)"
          fontWeight={800}
        >
          {cycleDay}
        </text>
        <text
          x={cx}
          y={cy + 12}
          textAnchor="middle"
          dominantBaseline="central"
          fill="hsl(284, 16%, 55%)"
          fontSize={10}
          fontFamily="var(--font-mono)"
          letterSpacing="0.08em"
        >
          DAY
        </text>

        {/* Glowing marker dot at current day */}
        <motion.circle
          cx={markerX}
          cy={markerY}
          r={7}
          fill="hsl(284, 22%, 44%)"
          stroke="hsl(30, 33%, 98%)"
          strokeWidth={3}
          filter="url(#marker-glow)"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.6, type: "spring", stiffness: 300, damping: 20 }}
        />

        {/* Pulsing ring around marker */}
        <motion.circle
          cx={markerX}
          cy={markerY}
          r={12}
          fill="none"
          stroke="hsl(284, 22%, 44%)"
          strokeWidth={1.5}
          initial={{ opacity: 0.6, scale: 0.8 }}
          animate={{ opacity: [0.5, 0, 0.5], scale: [0.9, 1.4, 0.9] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
}
