import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { WildStar } from "@/components/BotanicalElements";
import { PROMPT_CHIPS } from "@/hooks/useSignalContext";
import { haptic } from "@/hooks/use-mobile";

interface Props {
  pageContext: string;
  onOpenSignal: (prompt?: string) => void;
  compact?: boolean;
}

/**
 * Reusable prompt chip strip for contextual signal entry points
 * across Journal, Movement, Nutrition, Cycle, Breathwork, Community pages
 */
export default function SignalContextChips({ pageContext, onOpenSignal, compact }: Props) {
  const chips = PROMPT_CHIPS[pageContext] || PROMPT_CHIPS.general;

  if (compact) {
    return (
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            haptic("medium");
            onOpenSignal(chips[0]);
          }}
          className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary/8 border border-primary/15 text-foreground font-body text-xs hover:bg-primary/12 transition-all"
        >
          <WildStar size={10} color="hsl(284 22% 44%)" />
          <span>Give me a signal</span>
        </motion.button>
        {chips.slice(1, 3).map((chip) => (
          <button
            key={chip}
            onClick={() => {
              haptic("light");
              onOpenSignal(chip);
            }}
            className="flex-shrink-0 px-3 py-2 rounded-full bg-secondary/50 text-muted-foreground font-body text-[11px] hover:text-foreground hover:bg-secondary transition-all whitespace-nowrap"
          >
            {chip}
          </button>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-[18px] border border-border/50 p-4 bg-card/40"
    >
      <div className="flex items-center gap-1.5 mb-3">
        <WildStar size={12} color="hsl(284 22% 44%)" />
        <span className="font-hand text-xs font-bold text-primary">Give me a signal</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <motion.button
            key={chip}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              haptic("light");
              onOpenSignal(chip);
            }}
            className="group flex items-center gap-1 px-3.5 py-2 rounded-full bg-background border border-border/60 text-foreground font-body text-xs hover:border-primary/25 hover:bg-primary/5 transition-all"
          >
            <span>{chip}</span>
            <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
