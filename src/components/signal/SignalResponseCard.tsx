import { motion } from "framer-motion";
import { ChevronRight, Volume2, Bookmark } from "lucide-react";
import type { SignalResponse } from "@/hooks/useSignalContext";
import { WildStar, BotanicalSprig } from "@/components/BotanicalElements";
import { haptic } from "@/hooks/use-mobile";

interface Props {
  response: SignalResponse;
  onFollowUp: (prompt: string) => void;
  phase: string;
}

const sectionDelay = (i: number) => ({ delay: 0.1 + i * 0.12 });

export default function SignalResponseCard({ response, onFollowUp, phase }: Props) {
  const phaseColor = `hsl(var(--phase-${phase}))`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5 py-2"
    >
      {/* Headline — the distilled signal */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={sectionDelay(0)}
        className="relative"
      >
        <div className="absolute -left-3 top-0 bottom-0 w-[3px] rounded-full" style={{ backgroundColor: phaseColor }} />
        <h3 className="font-display text-xl md:text-2xl font-bold italic text-foreground leading-snug pl-3">
          {response.headline}
        </h3>
      </motion.div>

      {/* Interpretation */}
      {response.interpretation && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={sectionDelay(1)}
          className="rounded-2xl p-5"
          style={{ backgroundColor: "hsl(24 33% 92% / 0.7)" }}
        >
          <p className="font-hand text-xs font-bold text-primary mb-2">What this might mean</p>
          <p className="font-body text-sm text-foreground leading-relaxed">
            {response.interpretation}
          </p>
        </motion.div>
      )}

      {/* Lean into + Soften — two columns on desktop */}
      {(response.leanInto || response.soften) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={sectionDelay(2)}
          className="grid grid-cols-1 md:grid-cols-2 gap-3"
        >
          {response.leanInto && (
            <div className="rounded-2xl border border-border/60 p-5 bg-card/40">
              <p className="font-hand text-xs font-bold text-primary mb-2">What to lean into</p>
              <p className="font-body text-sm text-foreground leading-relaxed">{response.leanInto}</p>
            </div>
          )}
          {response.soften && (
            <div className="rounded-2xl border border-border/60 p-5 bg-card/40">
              <p className="font-hand text-xs font-bold text-muted-foreground mb-2">What to soften</p>
              <p className="font-body text-sm text-foreground leading-relaxed">{response.soften}</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Action */}
      {response.action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={sectionDelay(3)}
          className="rounded-2xl p-5 border border-primary/15"
          style={{ backgroundColor: "hsl(284 22% 44% / 0.05)" }}
        >
          <p className="font-hand text-xs font-bold text-primary mb-2">A gentle next step</p>
          <p className="font-body text-sm text-foreground leading-relaxed">{response.action}</p>
        </motion.div>
      )}

      {/* Practice suggestion */}
      {response.practice && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={sectionDelay(4)}
          className="rounded-2xl p-5 bg-card/60 border border-border/40"
        >
          <p className="font-hand text-xs font-bold text-muted-foreground mb-2">Supporting practice</p>
          <p className="font-body text-sm text-foreground leading-relaxed">{response.practice}</p>
        </motion.div>
      )}

      {/* Actions row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={sectionDelay(5)}
        className="flex items-center gap-3 pt-1"
      >
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/60 text-muted-foreground/60 font-body text-[10px] cursor-not-allowed"
          disabled
        >
          <Volume2 className="h-3 w-3" />
          Listen to this signal
        </button>
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/60 text-muted-foreground/60 font-body text-[10px] cursor-not-allowed"
          disabled
        >
          <Bookmark className="h-3 w-3" />
          Save
        </button>
      </motion.div>

      {/* Decorative divider */}
      <div className="flex justify-center py-2">
        <BotanicalSprig width={100} opacity={0.12} />
      </div>

      {/* Follow-up prompts */}
      {response.followUps && response.followUps.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={sectionDelay(6)}
        >
          <p className="font-hand text-xs font-bold text-muted-foreground mb-2.5">
            Go deeper
          </p>
          <div className="flex flex-wrap gap-2">
            {response.followUps.map((fu, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  haptic("light");
                  onFollowUp(fu);
                }}
                className="group flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-card border border-border text-foreground font-body text-xs hover:border-primary/30 hover:bg-primary/5 transition-all"
              >
                <span>{fu}</span>
                <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
