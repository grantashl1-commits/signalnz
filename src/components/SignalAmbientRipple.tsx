import { motion } from "framer-motion";

/**
 * Ambient "signal transmitting" effect — dotted concentric rings pulsing outward,
 * matching the brand's dotted-ring logo motif.
 */
export default function SignalAmbientRipple() {
  const ringConfigs = [
    { dots: 16, dotR: 2.5 },
    { dots: 24, dotR: 2 },
    { dots: 32, dotR: 1.8 },
    { dots: 40, dotR: 1.5 },
    { dots: 48, dotR: 1.2 },
    { dots: 56, dotR: 1 },
  ];

  return (
    <div className="fixed inset-0 z-0 pointer-events-none flex items-center justify-center opacity-50 md:opacity-40">
      <div className="relative w-[320px] h-[320px] md:w-[420px] md:h-[420px] flex items-center justify-center">
        {ringConfigs.map((ring, i) => (
          <motion.svg
            key={i}
            viewBox="0 0 100 100"
            className="absolute w-full h-full"
            initial={{ scale: 0.08, opacity: 0 }}
            animate={{
              scale: [0.08, 0.5, 1.2, 2],
              opacity: [0, 0.35, 0.12, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              delay: i * 1.3,
              ease: "easeOut",
            }}
          >
            {Array.from({ length: ring.dots }, (_, di) => {
              const angle = (2 * Math.PI * di) / ring.dots;
              const cx = 50 + 42 * Math.cos(angle);
              const cy = 50 + 42 * Math.sin(angle);
              return (
                <circle
                  key={di}
                  cx={cx}
                  cy={cy}
                  r={ring.dotR}
                  fill="hsl(var(--primary))"
                  opacity={0.6}
                />
              );
            })}
          </motion.svg>
        ))}

        {/* Centre core — soft glowing dot */}
        <motion.div
          className="absolute w-3 h-3 rounded-full bg-primary/30"
          animate={{
            scale: [1, 1.6, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    </div>
  );
}
