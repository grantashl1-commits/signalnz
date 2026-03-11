import { motion } from "framer-motion";

/**
 * Subtle ambient "signal ripple" that floats in the bottom-right corner
 * of every page, reinforcing the feeling that a signal is always arriving.
 */
export default function SignalAmbientRipple() {
  return (
    <div className="fixed bottom-32 right-8 z-10 pointer-events-none opacity-80 md:bottom-20 md:right-20 md:opacity-70">
      <div className="relative w-24 h-24 flex items-center justify-center">
        {/* Expanding ripple rings */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border-2 border-primary/30"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{
              scale: [0.5, 1.6, 2.2],
              opacity: [0.3, 0.1, 0],
            }}
            transition={{
              duration: 4.5,
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
              className="w-1.5 h-1.5 rounded-full bg-primary/40"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.8, 0.3],
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
