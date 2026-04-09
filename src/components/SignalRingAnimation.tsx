import { motion } from "framer-motion";

/**
 * Three branded animation variants for the Signal dot-ring logo mark.
 *
 * A — Sequential Ripple   (app launch / fetch)
 * B — Breathing Pulse     (idle / thinking)
 * C — Orbit Spin          (background processing)
 */

// The ring is ~24 dots arranged in an organic circle with varied sizes,
// matching the brand icon. We use fixed positions derived from the logo.
const DOTS = (() => {
  const count = 24;
  const cx = 50, cy = 50, baseR = 38;
  return Array.from({ length: count }, (_, i) => {
    const angle = (2 * Math.PI * i) / count - Math.PI / 2;
    // Vary radius to create the organic "breathing" ring look
    const sizePattern = [3.8, 2.2, 5, 3, 2, 4.5, 2.8, 5.2, 3.2, 2, 4, 3.5, 2.5, 5, 3, 2.2, 4.2, 2.8, 5, 3.4, 2, 4.5, 3, 2.5];
    const dotR = sizePattern[i % sizePattern.length];
    // Slight radius variation for organic feel
    const rVariation = [0, 1.5, -1, 2, -0.5, 1, -1.5, 0.5, 2, -1, 0, 1.5, -0.5, 2, -1, 0, 1, -1.5, 0.5, 2, -0.5, 1, -1, 1.5];
    const r = baseR + rVariation[i % rVariation.length];
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
      r: dotR,
    };
  });
})();

type Variant = "ripple" | "pulse" | "orbit";

interface Props {
  variant: Variant;
  size?: number;
  color?: string;
  className?: string;
}

/* ─── A: Sequential Ripple ─── */
function SequentialRipple({ size, color, className }: Omit<Props, "variant">) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-label="Signal loading">
      {DOTS.map((dot, i) => (
        <motion.circle
          key={i}
          cx={dot.x}
          cy={dot.y}
          r={dot.r}
          fill={color}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.9, 0.9, 0],
            scale: [0, 1, 1, 0],
          }}
          transition={{
            duration: 2.4,
            repeat: Infinity,
            delay: i * 0.075,
            ease: "easeInOut",
            times: [0, 0.2, 0.7, 1],
          }}
          style={{ transformOrigin: `${dot.x}px ${dot.y}px` }}
        />
      ))}
    </svg>
  );
}

/* ─── B: Breathing Pulse ─── */
function BreathingPulse({ size, color, className }: Omit<Props, "variant">) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-label="Signal thinking">
      {DOTS.map((dot, i) => (
        <motion.circle
          key={i}
          cx={dot.x}
          cy={dot.y}
          r={dot.r}
          fill={color}
          animate={{
            opacity: [0.4, 0.9, 0.4],
            scale: [0.85, 1.15, 0.85],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
          style={{ transformOrigin: `${dot.x}px ${dot.y}px` }}
        />
      ))}
    </svg>
  );
}

/* ─── C: Orbit Spin ─── */
function OrbitSpin({ size, color, className }: Omit<Props, "variant">) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-label="Signal processing">
      <motion.g
        animate={{ rotate: 360 }}
        transition={{
          duration: 3,
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
            r={dot.r}
            fill={color}
            opacity={0.5 + (i / DOTS.length) * 0.5}
          />
        ))}
      </motion.g>
    </svg>
  );
}

export default function SignalRingAnimation({
  variant = "pulse",
  size = 64,
  color = "hsl(var(--primary))",
  className = "",
}: Props) {
  switch (variant) {
    case "ripple":
      return <SequentialRipple size={size} color={color} className={className} />;
    case "pulse":
      return <BreathingPulse size={size} color={color} className={className} />;
    case "orbit":
      return <OrbitSpin size={size} color={color} className={className} />;
  }
}

export { SequentialRipple, BreathingPulse, OrbitSpin };
