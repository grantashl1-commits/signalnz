import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { haptic } from "@/hooks/use-mobile";

interface FlipCardItem {
  front: string;
  back: string;
  emoji?: string;
  tag?: string;
}

interface Props {
  content: { cards: FlipCardItem[]; instruction?: string };
  onComplete: (response: any) => void;
}

export default function FlipCard({ content, onComplete }: Props) {
  const { cards = [] } = content;
  const [flipped, setFlipped] = useState<Set<number>>(new Set());
  const [done, setDone] = useState(false);
  const allFlipped = flipped.size === cards.length;

  const flip = (i: number) => {
    haptic("light");
    setFlipped(prev => {
      const next = new Set(prev);
      next.add(i);
      return next;
    });
  };

  const handleComplete = () => {
    haptic("medium");
    setDone(true);
    onComplete({ flipped: cards.length, total: cards.length });
  };

  return (
    <div className="space-y-4">
      <p className="font-body text-xs text-muted-foreground text-center">
        Tap each card to reveal — {flipped.size}/{cards.length} revealed
      </p>

      <div className="grid grid-cols-2 gap-3">
        {cards.map((card, i) => {
          const isFlipped = flipped.has(i);
          return (
            <div
              key={i}
              onClick={() => !isFlipped && flip(i)}
              className="relative cursor-pointer"
              style={{ perspective: "1000px", height: "130px" }}
            >
              <motion.div
                className="relative w-full h-full"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Front */}
                <div
                  className="absolute inset-0 rounded-2xl border-2 border-border bg-gradient-to-br from-primary/8 to-primary/4 flex flex-col items-center justify-center p-3 text-center"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  {card.emoji && <span className="text-2xl mb-1.5">{card.emoji}</span>}
                  <p className="font-display text-xs font-bold text-foreground leading-snug">{card.front}</p>
                  <p className="font-body text-[9px] text-primary/60 mt-2 uppercase tracking-wider">Tap to reveal</p>
                </div>

                {/* Back */}
                <div
                  className="absolute inset-0 rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/15 to-primary/5 flex flex-col items-center justify-center p-3 text-center"
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                  {card.tag && (
                    <span className="font-body text-[8px] uppercase tracking-widest text-primary/60 mb-1">{card.tag}</span>
                  )}
                  <p className="font-body text-xs text-foreground leading-snug">{card.back}</p>
                  <CheckCircle2 className="h-3 w-3 text-primary/40 mt-2" />
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {allFlipped && !done && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleComplete}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-body text-sm font-bold flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4" /> All cards revealed — continue
          </motion.button>
        )}
        {done && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-primary/10 text-primary"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span className="font-body text-sm font-bold">Complete</span>
          </motion.div>
        )}
      </AnimatePresence>

      {!allFlipped && (
        <p className="text-center font-body text-[10px] text-muted-foreground/40">
          Reveal all {cards.length} cards to continue
        </p>
      )}
    </div>
  );
}
