import { motion } from "framer-motion";

/**
 * Three branded animation variants for the SIGNAL ring logo mark.
 *
 * All variants use the same dot pattern as the actual logo icon —
 * a ring of dramatically varying-sized circles (large, medium, small, tiny)
 * with NO centre dot. Dot positions reverse-engineered from Icon.png.
 *
 * A — Sequential Ripple   (app launch / loading)
 * B — Breathing Pulse     (idle / thinking / listening)
 * C — Orbit Spin          (background processing)
 */

// [clockwise degrees from 12 o'clock, orbit radius, dot radius]
// 100×100 viewBox, centre = 50,50
const RAW_DOTS: [number, number, number][] = [
  [348, 37, 1.5],  // tiny  — just before 12
  [7,   35, 2.8],  // small — just after 12
  [27,  34, 4.2],  // medium
  [43,  37, 1.5],  // tiny
  [57,  30, 8.5],  // LARGE  ~2 o'clock
  [77,  36, 2.5],  // small
  [92,  37, 1.5],  // tiny
  [107, 30, 8.0],  // LARGE  ~3 o'clock
  [128, 35, 3.0],  // medium-small
  [147, 37, 1.5],  // tiny
  [163, 34, 4.0],  // medium
  [184, 30, 7.5],  // LARGE  ~5 o'clock
  [208, 28, 9.5],  // LARGEST ~6 o'clock
  [232, 32, 5.5],  // medium-large
  [250, 36, 2.5],  // small
  [262, 37, 1.5],  // tiny
  [279, 30, 8.5],  // LARGE  ~9 o'clock
  [297, 34, 3.5],  // medium
  [310, 37, 1.8],  // tiny
  [324, 35, 2.8],  // small
  [338, 30, 7.5],  // LARGE  ~11 o'clock
];

function degToXY(deg: number, r: number) {
  const rad = (deg - 90) * (Math.PI / 180);
  return { x: 50 + r * Math.cos(rad), y: 50 + r * Math.sin(rad) };
}

const DOTS = RAW_DOTS.map(([deg, r, dotR]) => ({ ...degToXY(deg, r), dotR }));

type Variant = "ripple" | "pulse" | "orbit";

interface Props {
  variant?: Variant;
  size?: number;
  color?: string;
  className?: string;
}

/* ─── A: Sequential Ripple ───────────────────────────────────────
   Each circle appears and fades in sequence around the ring —
   feels like a signal "awakening." Used for loading / launch.
──────────────────────────────────────────────────────────────── */
function SequentialRipple({ size, color, className }: Omit<Props, "variant">) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      aria-label="Loading"
    >
      {DOTS.map((dot, i) => (
        <motion.circle
          key={i}
          cx={dot.x}
          cy={dot.y}
          r={dot.dotR}
          fill={color}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 1, 0],
            scale:   [0, 1, 1, 0],
          }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            delay: i * 0.08,
            ease: "easeInOut",
            times: [0, 0.15, 0.72, 1],
          }}
          style={{ transformOrigin: `${dot.x}px ${dot.y}px` }}
        />
      ))}
    </svg>
  );
}

/* ─── B: Breathing Pulse ─────────────────────────────────────────
   All dots gently swell and fade together — organic breathing feel.
   Large dots lead the breath; small ones follow with a slight delay.
   Used for idle / listening / thinking states.
──────────────────────────────────────────────────────────────── */
function BreathingPulse({ size, color, className }: Omit<Props, "variant">) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      aria-label="Thinking"
    >
      {DOTS.map((dot, i) => {
        // Large dots (dotR > 6) lead; small ones trail slightly
        const isLarge = dot.dotR > 6;
        const delay = isLarge ? (i / DOTS.length) * 0.6 : (i / DOTS.length) * 0.9 + 0.1;
        return (
          <motion.circle
            key={i}
            cx={dot.x}
            cy={dot.y}
            r={dot.dotR}
            fill={color}
            animate={{
              opacity: [0.35, 1, 0.35],
              scale:   [0.75, 1.1, 0.75],
            }}
            transition={{
              duration: 2.6,
              repeat: Infinity,
              delay,
              ease: "easeInOut",
            }}
            style={{ transformOrigin: `${dot.x}px ${dot.y}px` }}
          />
        );
      })}
    </svg>
  );
}

/* ─── C: Orbit Spin ──────────────────────────────────────────────
   The full ring rotates slowly — a quiet, continuous signal.
   Used for background processing / saving.
──────────────────────────────────────────────────────────────── */
function OrbitSpin({ size, color, className }: Omit<Props, "variant">) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      aria-label="Processing"
    >
      <motion.g
        animate={{ rotate: 360 }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{ transformOrigin: "50px 50px" }}
      >
        {DOTS.map((dot, i) => (
          <circle
            key={i}
            cx={dot.x}
            cy={dot.y}
            r={dot.dotR}
            fill={color}
            opacity={0.45 + (i / DOTS.length) * 0.55}
          />
        ))}
      </motion.g>
    </svg>
  );
}

/* ─── Default export ─────────────────────────────────────────── */
export default function SignalRingAnimation({
  variant = "pulse",
  size = 64,
  color = "hsl(var(--primary))",
  className = "",
}: Props) {
  switch (variant) {
    case "ripple":
      return <SequentialRipple size={size} color={color} className={className} />;
    case "orbit":
      return <OrbitSpin size={size} color={color} className={className} />;
    case "pulse":
    default:
      return <BreathingPulse size={size} color={color} className={className} />;
  }
}

export { SequentialRipple, BreathingPulse, OrbitSpin };
