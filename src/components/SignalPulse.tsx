import { motion } from "framer-motion";
import SignalLogo from "./SignalLogo";

/**
 * Loading / ambient animation using the actual SIGNAL purple icon logo.
 * Gently pulses and rotates the brand mark.
 */
export default function SignalPulse({
  size = 64,
}: {
  color?: string;
  opacity?: number;
  size?: number;
}) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      <motion.div
        animate={{
          scale: [0.9, 1.05, 0.9],
          opacity: [0.5, 0.85, 0.5],
          rotate: [0, 360],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <SignalLogo size={size} />
      </motion.div>
    </div>
  );
}
