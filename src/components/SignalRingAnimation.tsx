import { motion } from "framer-motion";
import SignalLogo from "@/components/SignalLogo";

/**
 * Branded loading animation using the actual Signal logo mark.
 * Three variants: ripple (sequential fade), pulse (breathing), orbit (spin).
 */

type Variant = "ripple" | "pulse" | "orbit";

interface Props {
  variant?: Variant;
  size?: number;
  color?: string;
  className?: string;
}

function AnimatedLogo({ size, color, className }: Omit<Props, "variant">) {
  return (
    <div className={className} style={{ width: size, height: size }}>
      <SignalLogo size={size} color={color ?? "currentColor"} />
    </div>
  );
}

/* ─── A: Sequential Ripple ─── app launch / loading */
function SequentialRipple({ size, className, color }: Omit<Props, "variant">) {
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
    >
      <AnimatedLogo size={size} color={color} className={className} />
    </motion.div>
  );
}

/* ─── B: Breathing Pulse ─── idle / thinking / listening */
function BreathingPulse({ size, className, color }: Omit<Props, "variant">) {
  return (
    <motion.div
      animate={{
        opacity: [0.5, 1, 0.5],
        scale: [0.9, 1.05, 0.9],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <AnimatedLogo size={size} color={color} className={className} />
    </motion.div>
  );
}

/* ─── C: Orbit Spin ─── background processing / saving */
function OrbitSpin({ size, className, color }: Omit<Props, "variant">) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      <AnimatedLogo size={size} color={color} className={className} />
    </motion.div>
  );
}

/* ─── Default export ─────────────────────────────────────────── */
export default function SignalRingAnimation({
  variant = "pulse",
  size = 64,
  color = "currentColor",
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
