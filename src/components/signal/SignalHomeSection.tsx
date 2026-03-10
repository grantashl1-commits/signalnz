import { motion } from "framer-motion";
import { Volume2, ChevronRight } from "lucide-react";
import { WildStar } from "@/components/BotanicalElements";
import { DotPattern } from "@/components/AtmosphericSection";
import { PROMPT_CHIPS } from "@/hooks/useSignalContext";
import { haptic } from "@/hooks/use-mobile";

interface Props {
  onOpenSignal: (prompt?: string) => void;
}

export default function SignalHomeSection({ onOpenSignal }: Props) {
  const chips = PROMPT_CHIPS.home;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="relative overflow-hidden rounded-[24px] p-8 md:p-10"
      style={{ backgroundColor: "hsl(var(--primary))" }}
    >
      <DotPattern color="hsl(30 33% 98%)" opacity={0.06} />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <WildStar size={16} color="hsl(30 33% 98%)" />
          </motion.div>
          <span className="font-body text-[10px] uppercase tracking-[0.2em] text-primary-foreground/50 font-medium">
            Signal Guidance
          </span>
        </div>

        <h3 className="font-display text-2xl md:text-3xl font-extrabold text-primary-foreground leading-tight mb-3">
          Give me a signal
        </h3>
        <p className="font-body text-sm text-primary-foreground/60 leading-relaxed max-w-md mb-6">
          A gentle read on where you are, what may be shaping this moment, and what might support you next.
        </p>

        {/* Main CTA */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              haptic("medium");
              onOpenSignal("Give me a signal for today");
            }}
            className="flex items-center gap-2 px-7 py-3.5 rounded-full bg-card text-foreground font-display text-sm font-semibold shadow-lg hover:shadow-xl transition-shadow"
          >
            <WildStar size={14} color="hsl(var(--primary))" />
            Give me a signal
          </motion.button>

          <button
            onClick={() => {
              haptic("light");
              onOpenSignal();
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-primary-foreground/10 border border-primary-foreground/15 text-primary-foreground/70 font-body text-xs hover:text-primary-foreground hover:bg-primary-foreground/15 transition-all"
          >
            <Volume2 className="h-3.5 w-3.5" />
            Listen
          </button>
        </div>

        {/* Quick prompt chips */}
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
              className="group flex items-center gap-1 px-3.5 py-2 rounded-full bg-primary-foreground/8 border border-primary-foreground/10 text-primary-foreground/70 font-body text-xs hover:bg-primary-foreground/12 hover:text-primary-foreground transition-all"
            >
              <span>{chip}</span>
              <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
