import { motion } from "framer-motion";

/**
 * Branded loading animation using the actual Signal brand icon (Icon_purple.png).
 * Three variants: ripple (sequential fade), pulse (breathing), orbit (spin).
 *
 * Uses the real brand mark PNG so the loader visually matches the logo
 * everywhere (header, splash, PWA icon).
 */

type Variant = "ripple" | "pulse" | "orbit";

interface Props {
  variant?: Variant;
  size?: number;
  /** Optional CSS color filter for tinting. Ignored — kept for API compatibility. */
  color?: string;
  className?: string;
}

const ICON_SRC = "/logos/Icon_purple.png";

function BrandIcon({ size, className }: { size: number; className?: string }) {
  return (
    <img
      src={ICON_SRC}
      alt=""
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size, display: "block" }}
      draggable={false}
    />
  );
}

/* ─── A: Sequential Ripple ─── app launch / loading */
function SequentialRipple({ size, className }: Omit<Props, "variant" | "color">) {
  return (
    <motion.div
      animate={{
        opacity: [0, 1, 1, 0],
        scale: [0.8, 1.05, 1.05, 0.8],
      }}
      transition={{
        duration: 2.4,
        repeat: Infinity,
        ease: "easeInOut",
        times: [0, 0.2, 0.7, 1],
      }}
      style={{ width: size, height: size }}
    >
      <BrandIcon size={size} className={className} />
    </motion.div>
  );
}

/* ─── B: Breathing Pulse ─── idle / thinking / listening */
function BreathingPulse({ size, className }: Omit<Props, "variant" | "color">) {
  return (
    <motion.div
      animate={{
        opacity: [0.55, 1, 0.55],
        scale: [0.92, 1.04, 0.92],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{ width: size, height: size }}
    >
      <BrandIcon size={size} className={className} />
    </motion.div>
  );
}

/* ─── C: Orbit Spin ─── background processing / saving */
function OrbitSpin({ size, className }: Omit<Props, "variant" | "color">) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "linear",
      }}
      style={{ width: size, height: size }}
    >
      <BrandIcon size={size} className={className} />
    </motion.div>
  );
}

/* ─── Default export ─────────────────────────────────────────── */
export default function SignalRingAnimation({
  variant = "pulse",
  size = 64,
  className = "",
}: Props) {
  switch (variant) {
    case "ripple":
      return <SequentialRipple size={size} className={className} />;
    case "orbit":
      return <OrbitSpin size={size} className={className} />;
    case "pulse":
    default:
      return <BreathingPulse size={size} className={className} />;
  }
}

export { SequentialRipple, BreathingPulse, OrbitSpin };
