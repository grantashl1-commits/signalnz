import { Phase } from "@/lib/cycle-utils";

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#8B1A4A",
  follicular: "#00C9A7",
  ovulatory: "#FFD166",
  luteal: "#4A3F7A",
};

interface CymaticProps {
  phase: Phase;
  size?: number;
  opacity?: number;
  className?: string;
  active?: boolean;
}

// Menstrual: concentric rings with inward triangular nodes at 8 points
function CymaticMenstrual({ size = 400, opacity = 0.2, className = "" }: { size?: number; opacity?: number; className?: string }) {
  const cx = size / 2;
  const cy = size / 2;
  const color = PHASE_HEX.menstrual;

  const rings = [30, 55, 80, 105, 130, 155, 175];
  const trianglePoints = 8;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={`cymatic-rotate ${className}`} style={{ opacity }}>
      {rings.map((r, i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={0.5} opacity={1 - i * 0.1} />
      ))}
      {Array.from({ length: trianglePoints }, (_, i) => {
        const angle = (i / trianglePoints) * Math.PI * 2 - Math.PI / 2;
        const outerR = 170;
        const innerR = 60;
        const x1 = cx + outerR * Math.cos(angle);
        const y1 = cy + outerR * Math.sin(angle);
        const x2 = cx + innerR * Math.cos(angle);
        const y2 = cy + innerR * Math.sin(angle);
        const spreadAngle = 0.08;
        const x3 = cx + (outerR * 0.7) * Math.cos(angle - spreadAngle);
        const y3 = cy + (outerR * 0.7) * Math.sin(angle - spreadAngle);
        const x4 = cx + (outerR * 0.7) * Math.cos(angle + spreadAngle);
        const y4 = cy + (outerR * 0.7) * Math.sin(angle + spreadAngle);
        return (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={0.5} opacity={0.6} />
            <line x1={x3} y1={y3} x2={x2} y2={y2} stroke={color} strokeWidth={0.3} opacity={0.4} />
            <line x1={x4} y1={y4} x2={x2} y2={y2} stroke={color} strokeWidth={0.3} opacity={0.4} />
          </g>
        );
      })}
      {[40, 80, 120].map((r, i) => (
        <circle key={`inner-${i}`} cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={0.3} strokeDasharray="2 4" opacity={0.3} />
      ))}
    </svg>
  );
}

// Follicular: expanding hexagonal lattice - 6-fold symmetry
function CymaticFollicular({ size = 400, opacity = 0.2, className = "" }: { size?: number; opacity?: number; className?: string }) {
  const cx = size / 2;
  const cy = size / 2;
  const color = PHASE_HEX.follicular;

  function hexPoints(centerX: number, centerY: number, r: number): string {
    return Array.from({ length: 6 }, (_, i) => {
      const angle = (i / 6) * Math.PI * 2 - Math.PI / 6;
      return `${centerX + r * Math.cos(angle)},${centerY + r * Math.sin(angle)}`;
    }).join(" ");
  }

  const layers = [0, 35, 70, 105, 140];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={`cymatic-rotate ${className}`} style={{ opacity }}>
      {layers.map((r, i) => (
        <polygon key={i} points={hexPoints(cx, cy, r || 1)} fill="none" stroke={color} strokeWidth={0.5} opacity={i === 0 ? 0 : 0.8 - i * 0.12} />
      ))}
      {/* Radial lines from center to each hex vertex */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const x = cx + 175 * Math.cos(angle);
        const y = cy + 175 * Math.sin(angle);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke={color} strokeWidth={0.3} opacity={0.3} />;
      })}
      {/* Inner lattice nodes */}
      {Array.from({ length: 6 }, (_, i) => {
        const angle = (i / 6) * Math.PI * 2 - Math.PI / 6;
        return [35, 70, 105, 140].map((r) => {
          const x = cx + r * Math.cos(angle);
          const y = cy + r * Math.sin(angle);
          return <circle key={`${i}-${r}`} cx={x} cy={y} r={1.5} fill={color} opacity={0.5} />;
        });
      })}
      {/* Connecting arcs */}
      {[50, 90, 130, 165].map((r, i) => (
        <circle key={`ring-${i}`} cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={0.3} opacity={0.2} strokeDasharray="4 6" />
      ))}
    </svg>
  );
}

// Ovulatory: 12-point star mandala with fine radial lines and interference rings
function CymaticOvulatory({ size = 400, opacity = 0.25, className = "" }: { size?: number; opacity?: number; className?: string }) {
  const cx = size / 2;
  const cy = size / 2;
  const color = PHASE_HEX.ovulatory;
  const points = 12;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={`cymatic-rotate ${className}`} style={{ opacity }}>
      {/* Radial lines */}
      {Array.from({ length: points * 2 }, (_, i) => {
        const angle = (i / (points * 2)) * Math.PI * 2;
        const len = i % 2 === 0 ? 180 : 120;
        return (
          <line key={i} x1={cx} y1={cy}
            x2={cx + len * Math.cos(angle)} y2={cy + len * Math.sin(angle)}
            stroke={color} strokeWidth={i % 2 === 0 ? 0.5 : 0.3} opacity={i % 2 === 0 ? 0.6 : 0.3}
          />
        );
      })}
      {/* Interference rings */}
      {[20, 40, 60, 80, 100, 120, 145, 170].map((r, i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={0.4} opacity={0.3 + (i % 2) * 0.15} />
      ))}
      {/* Star outline */}
      {(() => {
        const outerR = 175;
        const innerR = 90;
        const pts = Array.from({ length: points * 2 }, (_, i) => {
          const r = i % 2 === 0 ? outerR : innerR;
          const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
          return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
        }).join(" ");
        return <polygon points={pts} fill="none" stroke={color} strokeWidth={0.6} opacity={0.5} />;
      })()}
      {/* Node dots at star tips */}
      {Array.from({ length: points }, (_, i) => {
        const angle = (i / points) * Math.PI * 2 - Math.PI / 2;
        const x = cx + 175 * Math.cos(angle);
        const y = cy + 175 * Math.sin(angle);
        return <circle key={i} cx={x} cy={y} r={2} fill={color} opacity={0.7} />;
      })}
    </svg>
  );
}

// Luteal: overlapping offset circles creating moiré patterns
function CymaticLuteal({ size = 400, opacity = 0.2, className = "" }: { size?: number; opacity?: number; className?: string }) {
  const cx = size / 2;
  const cy = size / 2;
  const color = PHASE_HEX.luteal;
  const offset = 25;

  const centers = [
    [cx - offset, cy],
    [cx + offset, cy],
    [cx, cy - offset],
    [cx, cy + offset],
  ];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={`cymatic-rotate ${className}`} style={{ opacity }}>
      {centers.map(([ccx, ccy], ci) =>
        [30, 55, 80, 105, 130, 155, 175].map((r, ri) => (
          <circle
            key={`${ci}-${ri}`}
            cx={ccx}
            cy={ccy}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={0.4}
            opacity={0.5 - ri * 0.05}
          />
        ))
      )}
      {/* Central interference node */}
      <circle cx={cx} cy={cy} r={3} fill={color} opacity={0.5} />
      {/* Cross threads */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <line key={i} x1={cx} y1={cy}
            x2={cx + 170 * Math.cos(angle)} y2={cy + 170 * Math.sin(angle)}
            stroke={color} strokeWidth={0.2} opacity={0.2}
          />
        );
      })}
    </svg>
  );
}

// Universal component
export default function CymaticPattern({ phase, size = 400, opacity, className = "", active = false }: CymaticProps) {
  const defaultOpacity = active ? (phase === "ovulatory" ? 0.25 : 0.2) : (phase === "ovulatory" ? 0.15 : 0.1);
  const op = opacity ?? defaultOpacity;

  switch (phase) {
    case "menstrual": return <CymaticMenstrual size={size} opacity={op} className={className} />;
    case "follicular": return <CymaticFollicular size={size} opacity={op} className={className} />;
    case "ovulatory": return <CymaticOvulatory size={size} opacity={op} className={className} />;
    case "luteal": return <CymaticLuteal size={size} opacity={op} className={className} />;
  }
}

// Mini version for badges
export function CymaticMini({ phase, size = 20 }: { phase: Phase; size?: number }) {
  return <CymaticPattern phase={phase} size={size} opacity={0.8} className="" />;
}

export { CymaticMenstrual, CymaticFollicular, CymaticOvulatory, CymaticLuteal };
