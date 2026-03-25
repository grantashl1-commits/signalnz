import { motion } from "framer-motion";

interface Props {
  prompt: string;
}

export default function SignalListeningState({ prompt }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4 }}
      className="py-16 flex flex-col items-center gap-8"
    >
      {/* Ripple rings */}
      <div className="relative w-20 h-20 flex items-center justify-center">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border border-primary/20"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{
              scale: [0.6, 1.4, 1.8],
              opacity: [0.4, 0.15, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.8,
              ease: "easeOut",
            }}
          />
        ))}

        {/* Pulsing dots */}
        <div className="flex items-center gap-2 relative z-10">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-primary/60"
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>

      {/* Message */}
      <div className="text-center space-y-3">
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="font-display text-base italic"
          style={{ color: "hsl(280 20% 25%)" }}
        >
          Listening for your signal...
        </motion.p>

        {prompt && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="font-body text-xs text-muted-foreground/50 max-w-xs mx-auto leading-relaxed"
          >
            "{prompt}"
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}
