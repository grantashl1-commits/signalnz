import { motion } from "framer-motion";

/**
 * Ambient "signal transmitting" effect — concentric rings pulsing outward
 * in the app's purple brand colour, creating a living, intentional feel.
 */
export default function SignalAmbientRipple() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none flex items-center justify-center opacity-50 md:opacity-40">
      <div className="relative w-[320px] h-[320px] md:w-[420px] md:h-[420px] flex items-center justify-center">
        {/* Concentric signal rings — staggered outward pulse */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: "100%",
              height: "100%",
              border: `${1.5 - i * 0.15}px solid hsl(var(--primary) / ${0.18 - i * 0.02})`,
            }}
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
          />
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
