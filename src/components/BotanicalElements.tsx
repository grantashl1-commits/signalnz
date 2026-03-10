import { Phase } from "@/lib/cycle-utils";

const SKETCH_COLOR = "#8B6F5E";

// ─── Botanical Sprig ────────────────────────────────
// A herb sprig used as section divider
export function BotanicalSprig({ width = 200, opacity = 0.35, color = SKETCH_COLOR, className = "" }: { width?: number; opacity?: number; color?: string; className?: string }) {
  return (
    <svg width={width} height={24} viewBox="0 0 200 24" className={className} style={{ opacity }}>
      <path d="M 10 12 Q 50 11 100 12 Q 150 13 190 12" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round" />
      {/* Left leaves */}
      <path d="M 40 12 Q 35 6 30 4" fill="none" stroke={color} strokeWidth={0.8} strokeLinecap="round" />
      <path d="M 45 12 Q 40 17 35 19" fill="none" stroke={color} strokeWidth={0.8} strokeLinecap="round" />
      <path d="M 60 12 Q 55 5 50 3" fill="none" stroke={color} strokeWidth={0.8} strokeLinecap="round" />
      <path d="M 65 12 Q 60 18 55 20" fill="none" stroke={color} strokeWidth={0.8} strokeLinecap="round" />
      {/* Right leaves */}
      <path d="M 120 12 Q 115 5 110 3" fill="none" stroke={color} strokeWidth={0.8} strokeLinecap="round" />
      <path d="M 125 12 Q 120 18 115 20" fill="none" stroke={color} strokeWidth={0.8} strokeLinecap="round" />
      <path d="M 145 12 Q 140 6 135 4" fill="none" stroke={color} strokeWidth={0.8} strokeLinecap="round" />
      <path d="M 150 12 Q 145 17 140 19" fill="none" stroke={color} strokeWidth={0.8} strokeLinecap="round" />
      {/* Small berries */}
      <circle cx={80} cy={8} r={1.5} fill="none" stroke={color} strokeWidth={0.6} />
      <circle cx={100} cy={14} r={1.5} fill="none" stroke={color} strokeWidth={0.6} />
    </svg>
  );
}

// ─── Sacred Spiral ──────────────────────────────────
export function SacredSpiral({ size = 160, opacity = 0.25, color = SKETCH_COLOR, className = "" }: { size?: number; opacity?: number; color?: string; className?: string }) {
  const cx = size / 2;
  const cy = size / 2;
  // Build Fibonacci-style spiral with slightly wobbly curves
  const points: string[] = [];
  let r = 3;
  const growth = 1.15;
  for (let a = 0; a < Math.PI * 8; a += 0.3) {
    const wobble = Math.sin(a * 3) * 0.8;
    const x = cx + (r + wobble) * Math.cos(a);
    const y = cy + (r + wobble) * Math.sin(a);
    points.push(`${x},${y}`);
    r *= growth ** 0.04;
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={`sketch-rotate ${className}`} style={{ opacity }}>
      <polyline points={points.join(" ")} fill="none" stroke={color} strokeWidth={1} strokeLinecap="round" />
    </svg>
  );
}

// ─── Moon Phase Row ─────────────────────────────────
export function MoonPhaseRow({ width = 240, opacity = 0.35, color = SKETCH_COLOR, className = "" }: { width?: number; opacity?: number; color?: string; className?: string }) {
  const moons = [
    { fill: false, arc: 0 },      // new
    { fill: false, arc: 0.25 },   // waxing crescent
    { fill: false, arc: 0.5 },    // first quarter
    { fill: false, arc: 0.75 },   // waxing gibbous
    { fill: true, arc: 1 },       // full
    { fill: false, arc: 0.75, waning: true },
    { fill: false, arc: 0.5, waning: true },
    { fill: false, arc: 0.25, waning: true },
  ];

  const spacing = width / 9;
  const r = 8;

  return (
    <svg width={width} height={32} viewBox={`0 0 ${width} 32`} className={className} style={{ opacity }}>
      {moons.map((moon, i) => {
        const cx = spacing * (i + 1);
        const cy = 16;
        return (
          <g key={i}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={1} />
            {moon.arc > 0 && moon.arc < 1 && (
              <path
                d={`M ${cx} ${cy - r} A ${r} ${r} 0 0 ${moon.waning ? 0 : 1} ${cx} ${cy + r} A ${r * moon.arc} ${r} 0 0 ${moon.waning ? 1 : 0} ${cx} ${cy - r}`}
                fill={color}
                opacity={0.3}
              />
            )}
            {moon.fill && <circle cx={cx} cy={cy} r={r - 0.5} fill={color} opacity={0.25} />}
          </g>
        );
      })}
    </svg>
  );
}

// ─── Seed Geometry (Flower of Life sketch) ──────────
export function SeedGeometry({ size = 200, opacity = 0.2, color = SKETCH_COLOR, className = "" }: { size?: number; opacity?: number; color?: string; className?: string }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.18;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={`sketch-rotate ${className}`} style={{ opacity }}>
      {/* Center circle */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={1} />
      {/* 6 surrounding petals */}
      {Array.from({ length: 6 }, (_, i) => {
        const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
        const px = cx + r * Math.cos(angle);
        const py = cy + r * Math.sin(angle);
        return <circle key={i} cx={px} cy={py} r={r} fill="none" stroke={color} strokeWidth={0.8} />;
      })}
      {/* Outer ring */}
      <circle cx={cx} cy={cy} r={r * 2.05} fill="none" stroke={color} strokeWidth={0.5} strokeDasharray="3 5" />
    </svg>
  );
}

// ─── Root System ────────────────────────────────────
export function RootSystem({ size = 300, opacity = 0.1, color = SKETCH_COLOR, className = "" }: { size?: number; opacity?: number; color?: string; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 300 300" className={className} style={{ opacity }}>
      {/* Main trunk */}
      <path d="M 150 20 Q 148 60 145 100 Q 142 140 138 180 Q 135 220 130 260" fill="none" stroke={color} strokeWidth={1.2} strokeLinecap="round" />
      {/* Branch left */}
      <path d="M 145 80 Q 120 100 90 110 Q 70 115 50 120" fill="none" stroke={color} strokeWidth={0.8} strokeLinecap="round" />
      <path d="M 90 110 Q 80 130 70 150" fill="none" stroke={color} strokeWidth={0.5} strokeLinecap="round" />
      <path d="M 90 110 Q 75 105 60 95" fill="none" stroke={color} strokeWidth={0.5} strokeLinecap="round" />
      {/* Branch right */}
      <path d="M 148 90 Q 175 105 200 115 Q 220 120 240 125" fill="none" stroke={color} strokeWidth={0.8} strokeLinecap="round" />
      <path d="M 200 115 Q 210 135 220 155" fill="none" stroke={color} strokeWidth={0.5} strokeLinecap="round" />
      <path d="M 200 115 Q 215 108 230 100" fill="none" stroke={color} strokeWidth={0.5} strokeLinecap="round" />
      {/* Lower branches */}
      <path d="M 140 160 Q 110 175 80 185 Q 60 190 40 195" fill="none" stroke={color} strokeWidth={0.6} strokeLinecap="round" />
      <path d="M 80 185 Q 70 200 65 215" fill="none" stroke={color} strokeWidth={0.4} strokeLinecap="round" />
      <path d="M 142 170 Q 170 185 195 195 Q 215 200 235 205" fill="none" stroke={color} strokeWidth={0.6} strokeLinecap="round" />
      <path d="M 195 195 Q 205 210 210 225" fill="none" stroke={color} strokeWidth={0.4} strokeLinecap="round" />
      {/* Tiny root tendrils */}
      <path d="M 130 240 Q 115 250 100 260" fill="none" stroke={color} strokeWidth={0.3} strokeLinecap="round" />
      <path d="M 135 250 Q 145 265 155 275" fill="none" stroke={color} strokeWidth={0.3} strokeLinecap="round" />
      <path d="M 128 260 Q 120 275 115 285" fill="none" stroke={color} strokeWidth={0.3} strokeLinecap="round" />
    </svg>
  );
}

// ─── Herb Cluster ───────────────────────────────────
export function HerbCluster({ size = 100, opacity = 0.3, color = SKETCH_COLOR, className = "" }: { size?: number; opacity?: number; color?: string; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} style={{ opacity }}>
      {/* Tall stem with small florets */}
      <path d="M 30 85 Q 28 60 30 40 Q 31 25 30 15" fill="none" stroke={color} strokeWidth={0.8} strokeLinecap="round" />
      <circle cx={30} cy={12} r={2} fill="none" stroke={color} strokeWidth={0.6} />
      <circle cx={27} cy={18} r={1.5} fill="none" stroke={color} strokeWidth={0.5} />
      <circle cx={33} cy={17} r={1.5} fill="none" stroke={color} strokeWidth={0.5} />
      {/* Sprig with round leaves */}
      <path d="M 55 88 Q 53 65 55 45 Q 56 30 55 20" fill="none" stroke={color} strokeWidth={0.8} strokeLinecap="round" />
      <ellipse cx={48} cy={35} rx={5} ry={3.5} fill="none" stroke={color} strokeWidth={0.6} transform="rotate(-15 48 35)" />
      <ellipse cx={62} cy={40} rx={5} ry={3.5} fill="none" stroke={color} strokeWidth={0.6} transform="rotate(15 62 40)" />
      <ellipse cx={49} cy={50} rx={4.5} ry={3} fill="none" stroke={color} strokeWidth={0.6} transform="rotate(-10 49 50)" />
      <ellipse cx={61} cy={55} rx={4.5} ry={3} fill="none" stroke={color} strokeWidth={0.6} transform="rotate(10 61 55)" />
      {/* Low ground cover */}
      <path d="M 75 90 Q 73 78 75 68" fill="none" stroke={color} strokeWidth={0.6} strokeLinecap="round" />
      <path d="M 75 75 Q 68 72 63 68" fill="none" stroke={color} strokeWidth={0.5} strokeLinecap="round" />
      <path d="M 75 75 Q 82 72 87 68" fill="none" stroke={color} strokeWidth={0.5} strokeLinecap="round" />
      <path d="M 75 82 Q 67 80 60 78" fill="none" stroke={color} strokeWidth={0.5} strokeLinecap="round" />
      <path d="M 75 82 Q 83 80 90 78" fill="none" stroke={color} strokeWidth={0.5} strokeLinecap="round" />
    </svg>
  );
}

// ─── CymatiSketch — hand-drawn cymatic patterns ─────
const PHASE_SKETCH_COLORS: Record<Phase, string> = {
  menstrual: "#C4526E",
  follicular: "#5C4A9E",
  ovulatory: "#C47A8A",
  luteal: "#9B89B4",
};

export function CymatiSketch({ phase, size = 300, opacity = 0.12, className = "" }: { phase: Phase; size?: number; opacity?: number; className?: string }) {
  const cx = size / 2;
  const cy = size / 2;
  const color = PHASE_SKETCH_COLORS[phase];

  switch (phase) {
    case "menstrual":
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={`sketch-rotate ${className}`} style={{ opacity }}>
          {[25, 45, 65, 85, 105, 125].map((r, i) => (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={0.8} />
          ))}
          {Array.from({ length: 8 }, (_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            const x1 = cx + 120 * Math.cos(angle);
            const y1 = cy + 120 * Math.sin(angle);
            const x2 = cx + 30 * Math.cos(angle);
            const y2 = cy + 30 * Math.sin(angle);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={0.5} />;
          })}
        </svg>
      );
    case "follicular":
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={`sketch-rotate ${className}`} style={{ opacity }}>
          {[0, 30, 60, 90, 120].map((r, i) => {
            const pts = Array.from({ length: 6 }, (_, j) => {
              const angle = (j / 6) * Math.PI * 2 - Math.PI / 6;
              return `${cx + (r || 1) * Math.cos(angle)},${cy + (r || 1) * Math.sin(angle)}`;
            }).join(" ");
            return <polygon key={i} points={pts} fill="none" stroke={color} strokeWidth={0.8} />;
          })}
          {Array.from({ length: 6 }, (_, i) => {
            const angle = (i / 6) * Math.PI * 2 - Math.PI / 6;
            return [30, 60, 90, 120].map((r) => (
              <circle key={`${i}-${r}`} cx={cx + r * Math.cos(angle)} cy={cy + r * Math.sin(angle)} r={1.5} fill={color} opacity={0.4} />
            ));
          })}
        </svg>
      );
    case "ovulatory":
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={`sketch-rotate ${className}`} style={{ opacity }}>
          {Array.from({ length: 24 }, (_, i) => {
            const angle = (i / 24) * Math.PI * 2;
            const len = i % 2 === 0 ? 130 : 80;
            return <line key={i} x1={cx} y1={cy} x2={cx + len * Math.cos(angle)} y2={cy + len * Math.sin(angle)} stroke={color} strokeWidth={i % 2 === 0 ? 0.6 : 0.3} />;
          })}
          {[20, 40, 60, 80, 100, 120].map((r, i) => (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={0.5} />
          ))}
        </svg>
      );
    case "luteal":
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={`sketch-rotate ${className}`} style={{ opacity }}>
          {[[-15, 0], [15, 0], [0, -15], [0, 15]].map(([ox, oy], ci) =>
            [25, 45, 65, 85, 105, 125].map((r, ri) => (
              <circle key={`${ci}-${ri}`} cx={cx + ox} cy={cy + oy} r={r} fill="none" stroke={color} strokeWidth={0.4} opacity={0.6 - ri * 0.05} />
            ))
          )}
        </svg>
      );
  }
}

// ─── Hand Underline ─────────────────────────────────
export function HandUnderline({ width = 120, color = "hsl(14, 100%, 64%)", opacity = 0.6, className = "" }: { width?: number; color?: string; opacity?: number; className?: string }) {
  return (
    <svg width={width} height={8} viewBox={`0 0 ${width} 8`} className={className} style={{ opacity }}>
      <path
        d={`M 2 5 Q ${width * 0.3} 2 ${width * 0.5} 4.5 Q ${width * 0.7} 7 ${width - 2} 4`}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── Wild Star ──────────────────────────────────────
export function WildStar({ size = 20, color = "hsl(14, 100%, 64%)", opacity = 0.7, className = "" }: { size?: number; color?: string; opacity?: number; className?: string }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.4;
  const ir = r * 0.4;
  const pts = Array.from({ length: 10 }, (_, i) => {
    const rad = i % 2 === 0 ? r : ir;
    const angle = (i / 10) * Math.PI * 2 - Math.PI / 2;
    // Slight wobble
    const wobble = Math.sin(i * 1.7) * (size * 0.04);
    return `${cx + (rad + wobble) * Math.cos(angle)},${cy + (rad + wobble) * Math.sin(angle)}`;
  }).join(" ");

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={className} style={{ opacity }}>
      <polygon points={pts} fill="none" stroke={color} strokeWidth={1} strokeLinejoin="round" />
    </svg>
  );
}

// ─── Compact CymaticMini for badges ─────────────────
export function CymaticMini({ phase, size = 20 }: { phase: Phase; size?: number }) {
  return <CymatiSketch phase={phase} size={size} opacity={0.6} className="" />;
}

// ─── Phase Indicator (hand-drawn motifs) ────────────
const PHASE_INDICATOR_COLORS: Record<Phase, string> = {
  menstrual: "#C4526E",
  follicular: "#5C4A9E",
  ovulatory: "#C47A8A",
  luteal: "#9B89B4",
};

export function PhaseIndicator({ phase, size = 18, className = "" }: { phase: Phase; size?: number; className?: string }) {
  const color = PHASE_INDICATOR_COLORS[phase];
  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  const sw = s * 0.055; // stroke weight scales with size

  switch (phase) {
    // Menstrual — crescent moon
    case "menstrual":
      return (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} className={className}>
          <path
            d={`M ${cx + s * 0.08} ${cy - s * 0.35} A ${s * 0.35} ${s * 0.35} 0 1 0 ${cx + s * 0.08} ${cy + s * 0.35} A ${s * 0.24} ${s * 0.24} 0 1 1 ${cx + s * 0.08} ${cy - s * 0.35}`}
            fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"
          />
          {/* tiny imperfection dot */}
          <circle cx={cx - s * 0.12} cy={cy - s * 0.06} r={s * 0.025} fill={color} opacity={0.4} />
        </svg>
      );

    // Follicular — sprouting leaf / rising stem
    case "follicular":
      return (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} className={className}>
          {/* stem */}
          <path
            d={`M ${cx} ${s * 0.88} Q ${cx - s * 0.02} ${s * 0.6} ${cx} ${s * 0.35}`}
            fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"
          />
          {/* left leaf */}
          <path
            d={`M ${cx} ${s * 0.48} Q ${cx - s * 0.2} ${s * 0.32} ${cx - s * 0.15} ${s * 0.18} Q ${cx - s * 0.06} ${s * 0.28} ${cx} ${s * 0.42}`}
            fill="none" stroke={color} strokeWidth={sw * 0.9} strokeLinecap="round"
          />
          {/* right leaf */}
          <path
            d={`M ${cx} ${s * 0.56} Q ${cx + s * 0.18} ${s * 0.42} ${cx + s * 0.14} ${s * 0.28} Q ${cx + s * 0.05} ${s * 0.38} ${cx} ${s * 0.5}`}
            fill="none" stroke={color} strokeWidth={sw * 0.9} strokeLinecap="round"
          />
          {/* tiny bud at top */}
          <circle cx={cx} cy={s * 0.32} r={s * 0.035} fill="none" stroke={color} strokeWidth={sw * 0.7} />
        </svg>
      );

    // Ovulatory — radiant sunburst / bloom
    case "ovulatory":
      return (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} className={className}>
          {/* centre circle */}
          <circle cx={cx} cy={cy} r={s * 0.12} fill="none" stroke={color} strokeWidth={sw} />
          {/* organic rays */}
          {Array.from({ length: 12 }, (_, i) => {
            const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
            const inner = s * 0.17;
            const outer = i % 2 === 0 ? s * 0.4 : s * 0.3;
            const wobble = Math.sin(i * 2.3) * s * 0.02;
            return (
              <line
                key={i}
                x1={cx + inner * Math.cos(angle)}
                y1={cy + inner * Math.sin(angle)}
                x2={cx + (outer + wobble) * Math.cos(angle)}
                y2={cy + (outer + wobble) * Math.sin(angle)}
                stroke={color}
                strokeWidth={i % 3 === 0 ? sw : sw * 0.7}
                strokeLinecap="round"
              />
            );
          })}
        </svg>
      );

    // Luteal — soft wave / closing petal
    case "luteal":
      return (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} className={className}>
          {/* upper wave */}
          <path
            d={`M ${s * 0.1} ${cy - s * 0.06} Q ${s * 0.3} ${cy - s * 0.22} ${cx} ${cy - s * 0.06} Q ${s * 0.7} ${cy + s * 0.1} ${s * 0.9} ${cy - s * 0.06}`}
            fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"
          />
          {/* lower wave */}
          <path
            d={`M ${s * 0.1} ${cy + s * 0.14} Q ${s * 0.3} ${cy} ${cx} ${cy + s * 0.14} Q ${s * 0.7} ${cy + s * 0.28} ${s * 0.9} ${cy + s * 0.14}`}
            fill="none" stroke={color} strokeWidth={sw * 0.8} strokeLinecap="round"
          />
          {/* tiny seed dot */}
          <circle cx={cx} cy={cy + s * 0.04} r={s * 0.03} fill={color} opacity={0.35} />
        </svg>
      );
  }
}

// ─── Default export for backward compat ─────────────
export default function CymaticPattern({ phase, size = 400, opacity, className = "", active = false }: { phase: Phase; size?: number; opacity?: number; className?: string; active?: boolean }) {
  const defaultOpacity = active ? 0.15 : 0.1;
  return <CymatiSketch phase={phase} size={size} opacity={opacity ?? defaultOpacity} className={className} />;
}

export { CymatiSketch as CymaticMenstrual };
export { CymatiSketch as CymaticFollicular };
export { CymatiSketch as CymaticOvulatory };
export { CymatiSketch as CymaticLuteal };
