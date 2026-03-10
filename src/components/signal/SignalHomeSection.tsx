import { motion } from "framer-motion";
import { Sparkles, Volume2, ChevronRight } from "lucide-react";
import { WildStar, BotanicalSprig, SacredSpiral } from "@/components/BotanicalElements";
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
      className="relative overflow-hidden rounded-[22px] border border-primary/15 p-6 md:p-8"
      style={{
        background: "linear-gradient(135deg, hsl(284 22% 44% / 0.06) 0%, hsl(24 33% 92% / 0.5) 100%)",
      }}
    >
      {/* Decorative */}
      <div className="absolute top-3 right-3 pointer-events-none opacity-10">
        <SacredSpiral size={80} />
      </div>

      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <WildStar size={16} color="hsl(284 22% 44%)" />
          </motion.div>
          <span className="font-hand text-xs font-bold text-primary uppercase tracking-wider">
            Signal guidance
          </span>
        </div>

        <h3 className="font-display text-xl md:text-2xl font-bold italic text-foreground leading-tight mb-2">
          Give me a signal
        </h3>
        <p className="font-body text-sm text-muted-foreground leading-relaxed max-w-md mb-5">
          A gentle read on where you are, what may be shaping this moment, and what might support you next.
        </p>

        {/* Main CTA */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              haptic("medium");
              onOpenSignal("Give me a signal for today");
            }}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-display text-sm font-semibold italic shadow-md hover:shadow-lg transition-shadow"
          >
            <WildStar size={14} color="hsl(30 33% 98%)" />
            Give me a signal
          </motion.button>

          <button
            onClick={() => {
              haptic("light");
              onOpenSignal();
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-card border border-border text-muted-foreground font-body text-xs hover:text-foreground hover:border-primary/30 transition-all"
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
              className="group flex items-center gap-1 px-3.5 py-2 rounded-full bg-card/80 border border-border/60 text-foreground font-body text-xs hover:border-primary/25 hover:bg-primary/5 transition-all"
            >
              <span>{chip}</span>
              <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Bottom decoration */}
      <div className="flex justify-end mt-4">
        <BotanicalSprig width={120} opacity={0.12} />
      </div>
    </motion.section>
  );
}
