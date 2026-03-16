import { motion } from "framer-motion";

/**
 * Subtle signal pulse animation — concentric rings that slowly expand and fade.
 * Used behind hero sections to create a "tuning in" sensation.
 */
export default function SignalPulse({
  color = "hsl(var(--primary-foreground))",
  opacity = 0.06,
  size = 300,
}: {
  color?: string;
  opacity?: number;
  size?: number;
}) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border"
          style={{
            width: size,
            height: size,
            borderColor: color,
            opacity: 0,
          }}
          animate={{
            scale: [0.3, 2, 3.5],
            opacity: [opacity, opacity * 0.5, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            delay: i * 2.6,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}
