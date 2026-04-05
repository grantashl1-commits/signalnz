import { motion, AnimatePresence } from "framer-motion";

interface Props {
  wordCount: number;
  phaseColor?: string;
}

export default function WordCountBar({ wordCount, phaseColor = "#C4526E" }: Props) {
  if (wordCount < 50) return null;

  const target = 150;
  const progress = Math.min(wordCount / target, 1);
  const done = progress >= 1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mt-2"
      >
        {done ? (
          <span className="font-mono text-[11px] text-muted-foreground/40">✓</span>
        ) : (
          <>
            <div className="flex-1 h-1.5 rounded-full bg-muted/40 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: `${phaseColor}99` }}
                initial={{ width: 0 }}
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <span className="font-mono text-[11px] text-muted-foreground/50 whitespace-nowrap">
              {wordCount} words · keep going
            </span>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
