import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { haptic } from "@/hooks/use-mobile";

interface Props {
  content: { cards: { title: string; body: string; icon?: string }[] };
  onComplete: (response: any) => void;
}

export default function CarouselActivity({ content, onComplete }: Props) {
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(1);
  const card = content.cards[idx];
  const isLast = idx === content.cards.length - 1;

  const go = (d: number) => {
    haptic("light");
    setDir(d);
    setIdx(prev => Math.max(0, Math.min(content.cards.length - 1, prev + d)));
  };

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card min-h-[200px]">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div key={idx} custom={dir}
            initial={{ opacity: 0, x: dir * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -40 }}
            transition={{ duration: 0.25 }}
            className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="font-body text-xs text-muted-foreground">{idx + 1} / {content.cards.length}</span>
            </div>
            <h4 className="font-display text-lg font-bold text-foreground mb-2">{card.title}</h4>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">{card.body}</p>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex items-center justify-between">
        <button onClick={() => go(-1)} disabled={idx === 0} className="p-2 rounded-full border border-border disabled:opacity-30">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex gap-1.5">
          {content.cards.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${i === idx ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/20"}`} />
          ))}
        </div>
        {isLast ? (
          <button onClick={() => { haptic("medium"); onComplete({ viewed: true }); }}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-body text-xs font-bold">Done</button>
        ) : (
          <button onClick={() => go(1)} className="p-2 rounded-full border border-border">
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}
