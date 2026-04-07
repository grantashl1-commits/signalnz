import { motion } from "framer-motion";

/**
 * Subtle signal pulse animation — dotted concentric rings that slowly expand and fade,
 * matching the brand's dotted-ring logo motif.
 */
export default function SignalPulse({
  color = "hsl(var(--primary-foreground))",
  opacity = 0.08,
  size = 300,
}: {
  color?: string;
  opacity?: number;
  size?: number;
}) {
  const ringConfigs = [
    { dots: 24, dotR: 3 },
    { dots: 32, dotR: 2.5 },
    { dots: 40, dotR: 2 },
  ];

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      {ringConfigs.map((ring, i) => (
        <motion.svg
          key={i}
          viewBox="0 0 100 100"
          className="absolute"
          style={{ width: size, height: size }}
          initial={{ scale: 0.3, opacity: 0 }}
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
        >
          {Array.from({ length: ring.dots }, (_, di) => {
            const angle = (2 * Math.PI * di) / ring.dots;
            const cx = 50 + 40 * Math.cos(angle);
            const cy = 50 + 40 * Math.sin(angle);
            return (
              <circle
                key={di}
                cx={cx}
                cy={cy}
                r={ring.dotR}
                fill={color}
              />
            );
          })}
        </motion.svg>
      ))}
    </div>
  );
}
