import { motion } from "framer-motion";
import { haptic } from "@/hooks/use-mobile";

const MOODS = [
  { id: "grounded", label: "Grounded", emoji: "🌿" },
  { id: "clear", label: "Clear", emoji: "✨" },
  { id: "open", label: "Open", emoji: "🌸" },
  { id: "heavy", label: "Heavy", emoji: "🌧️" },
  { id: "unsettled", label: "Unsettled", emoji: "🌊" },
] as const;

interface Props {
  phaseColor: string;
  onSelect: (mood: string) => void;
  onSkip: () => void;
}

export default function MoodCheckin({ phaseColor, onSelect, onSkip }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="fixed inset-0 z-[110] flex flex-col items-center justify-center bg-background px-8"
      style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="font-display text-2xl md:text-3xl italic text-foreground mb-8 text-center"
      >
        How are you arriving today?
      </motion.h2>

      <div className="grid grid-cols-2 gap-3 w-full max-w-sm mb-4">
        {MOODS.slice(0, 4).map((mood, i) => (
          <motion.button
            key={mood.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 + i * 0.05 }}
            onClick={() => { haptic("medium"); onSelect(mood.id); }}
            className="touch-btn flex items-center gap-2.5 rounded-2xl border border-border/60 px-5 py-4 hover:border-primary/30 active:scale-[0.97] transition-all"
            style={{ background: `${phaseColor}08` }}
          >
            <span className="text-lg">{mood.emoji}</span>
            <span className="font-display text-sm italic text-foreground">{mood.label}</span>
          </motion.button>
        ))}
      </div>

      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.35 }}
        onClick={() => { haptic("medium"); onSelect(MOODS[4].id); }}
        className="touch-btn flex items-center gap-2.5 rounded-2xl border border-border/60 px-5 py-4 hover:border-primary/30 active:scale-[0.97] transition-all w-full max-w-sm mb-8"
        style={{ background: `${phaseColor}08` }}
      >
        <span className="text-lg">{MOODS[4].emoji}</span>
        <span className="font-display text-sm italic text-foreground">{MOODS[4].label}</span>
      </motion.button>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        onClick={() => { haptic("light"); onSkip(); }}
        className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Skip →
      </motion.button>
    </motion.div>
  );
}
