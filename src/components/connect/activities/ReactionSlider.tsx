import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { haptic } from "@/hooks/use-mobile";

const DEFAULT_OPTIONS = [
  { emoji: "😰", label: "Not at all" },
  { emoji: "😟", label: "A little" },
  { emoji: "😐", label: "Neutral" },
  { emoji: "😊", label: "Fairly" },
  { emoji: "🌟", label: "Completely" },
];

interface Props {
  content: {
    question: string;
    options?: { emoji: string; label: string }[];
  };
  onComplete: (response: any) => void;
}

export default function ReactionSlider({ content, onComplete }: Props) {
  const options = content.options || DEFAULT_OPTIONS;
  const [selected, setSelected] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const handleSelect = (i: number) => {
    if (confirmed) return;
    haptic("light");
    setSelected(i);
  };

  const handleConfirm = () => {
    if (selected === null) return;
    haptic("medium");
    setConfirmed(true);
    onComplete({ selected, label: options[selected]?.label, emoji: options[selected]?.emoji });
  };

  return (
    <div className="space-y-6 py-2">
      <p className="font-display text-base font-bold text-foreground text-center leading-snug">
        {content.question}
      </p>

      {/* Emoji scale */}
      <div className="flex items-end justify-between gap-1 px-2">
        {options.map((opt, i) => {
          const isSelected = selected === i;
          const scale = isSelected ? 1.3 : 1;
          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={confirmed}
              className="flex flex-col items-center gap-1.5 flex-1 transition-all"
            >
              <motion.span
                animate={{ scale }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="text-2xl leading-none select-none"
              >
                {opt.emoji}
              </motion.span>
              <span className={`font-body text-[8px] text-center leading-tight transition-colors ${
                isSelected ? "text-primary font-bold" : "text-muted-foreground/50"
              }`}>
                {opt.label}
              </span>
              {/* Selection dot */}
              <div className={`w-2 h-2 rounded-full transition-all ${
                isSelected ? "bg-primary scale-100" : "bg-border scale-75"
              }`} />
            </button>
          );
        })}
      </div>

      {/* Track line */}
      <div className="relative h-1.5 bg-border rounded-full mx-4">
        <motion.div
          className="absolute top-0 left-0 h-full rounded-full bg-primary"
          animate={{
            width: selected !== null ? `${((selected) / (options.length - 1)) * 100}%` : "0%"
          }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        />
      </div>

      <AnimatePresence>
        {selected !== null && !confirmed && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            onClick={handleConfirm}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-body text-sm font-bold"
          >
            Confirm — {options[selected].emoji} {options[selected].label}
          </motion.button>
        )}
        {confirmed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-primary/10 text-primary"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span className="font-body text-sm font-bold">Response recorded</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
