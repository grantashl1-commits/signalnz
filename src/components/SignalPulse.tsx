import { motion } from "framer-motion";

/**
 * Ambient dot-pattern pulse used inside AtmosphericHero headers.
 * Creates a gentle breathing / radial effect behind page titles.
 */
export default function SignalPulse({
  color = "rgba(255,255,255,0.08)",
  opacity = 0.5,
  size = 64,
}: {
  color?: string;
  opacity?: number;
  size?: number;
}) {
  const dots = Array.from({ length: 3 });

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      {dots.map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: size * (1 + i * 0.8),
            height: size * (1 + i * 0.8),
            border: `1px solid ${color}`,
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [opacity * (1 - i * 0.15), opacity * 0.3, opacity * (1 - i * 0.15)],
          }}
          transition={{
            duration: 4 + i * 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.6,
          }}
        />
      ))}
    </div>
  );
}
