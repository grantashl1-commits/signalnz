import { motion } from "framer-motion";
import signalIcon from "@/assets/pwa-icon-512-purple.png";

/**
 * Branded loading animation using the actual Signal purple icon.
 * Three variants: ripple (sequential fade), pulse (breathing), orbit (spin).
 */

type Variant = "ripple" | "pulse" | "orbit";

interface Props {
  variant?: Variant;
  size?: number;
  color?: string;
  className?: string;
}

/* ─── A: Sequential Ripple ─── app launch / loading */
function SequentialRipple({ size, className }: Omit<Props, "variant">) {
  return (
    <motion.img
      src={signalIcon}
      alt="Loading"
      width={size}
      height={size}
      className={className}
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
    />
  );
}

/* ─── B: Breathing Pulse ─── idle / thinking / listening */
function BreathingPulse({ size, className }: Omit<Props, "variant">) {
  return (
    <motion.img
      src={signalIcon}
      alt="Thinking"
      width={size}
      height={size}
      className={className}
      animate={{
        opacity: [0.5, 1, 0.5],
        scale: [0.9, 1.05, 0.9],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

/* ─── C: Orbit Spin ─── background processing / saving */
function OrbitSpin({ size, className }: Omit<Props, "variant">) {
  return (
    <motion.img
      src={signalIcon}
      alt="Processing"
      width={size}
      height={size}
      className={className}
      animate={{ rotate: 360 }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "linear",
      }}
    />
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
