import { motion } from "framer-motion";

/**
 * Subtle ambient "signal ripple" that floats in the bottom-right corner
 * of every page, reinforcing the feeling that a signal is always arriving.
 */
export default function SignalAmbientRipple() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none flex items-center justify-center opacity-60 md:opacity-50">
      <div className="relative w-40 h-40 flex items-center justify-center">
        {/* Expanding ripple rings */}
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border border-primary/20"
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{
              scale: [0.3, 2.5, 5],
              opacity: [0.4, 0.15, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              delay: i * 1.2,
              ease: "easeOut",
            }}
          />
        ))}

        {/* Pulsing dots */}
        <div className="flex items-center gap-1.5 relative z-10">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-primary/60"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                delay: i * 0.4,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
