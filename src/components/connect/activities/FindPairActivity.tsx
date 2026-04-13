import { useState } from "react";
import { motion } from "framer-motion";
import { haptic } from "@/hooks/use-mobile";
import { Sparkles } from "lucide-react";

interface Props {
  content: { pairs: [string, string][]; instruction?: string };
  onComplete: (response: any) => void;
}

export default function FindPairActivity({ content, onComplete }: Props) {
  const [allItems] = useState(() => {
    const left = content.pairs.map((p, i) => ({ text: p[0], pairIdx: i, side: "left" as const }));
    const right = content.pairs.map((p, i) => ({ text: p[1], pairIdx: i, side: "right" as const }));
    return { left: left.sort(() => Math.random() - 0.5), right: right.sort(() => Math.random() - 0.5) };
  });
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matched, setMatched] = useState<number[]>([]);
  const done = matched.length === content.pairs.length;

  const handleLeftClick = (pairIdx: number) => {
    if (matched.includes(pairIdx)) return;
    haptic("light");
    setSelectedLeft(pairIdx);
  };

  const handleRightClick = (pairIdx: number) => {
    if (matched.includes(pairIdx) || selectedLeft === null) return;
    haptic("medium");
    if (pairIdx === selectedLeft) {
      setMatched(prev => [...prev, pairIdx]);
      setSelectedLeft(null);
      if (matched.length + 1 === content.pairs.length) {
        onComplete({ matched: true, pairs: content.pairs.length });
      }
    } else {
      setSelectedLeft(null);
    }
  };

  return (
    <div className="space-y-4">
      {content.instruction && <p className="font-body text-sm text-muted-foreground">{content.instruction}</p>}
      <p className="font-body text-xs text-muted-foreground">Tap left, then tap the matching right</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          {allItems.left.map(item => (
            <motion.button key={item.text} whileTap={{ scale: 0.95 }}
              onClick={() => handleLeftClick(item.pairIdx)}
              className={`w-full p-3 rounded-xl border text-left font-body text-xs transition-all ${
                matched.includes(item.pairIdx) ? "bg-primary/10 border-primary/30 opacity-60" :
                selectedLeft === item.pairIdx ? "border-primary bg-primary/5" : "border-border bg-card"
              }`}>
              {item.text}
            </motion.button>
          ))}
        </div>
        <div className="space-y-2">
          {allItems.right.map(item => (
            <motion.button key={item.text} whileTap={{ scale: 0.95 }}
              onClick={() => handleRightClick(item.pairIdx)}
              className={`w-full p-3 rounded-xl border text-left font-body text-xs transition-all ${
                matched.includes(item.pairIdx) ? "bg-primary/10 border-primary/30 opacity-60" : "border-border bg-card hover:border-primary/30"
              }`}>
              {item.text}
            </motion.button>
          ))}
        </div>
      </div>
      {done && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 justify-center p-3 rounded-xl bg-primary/10">
          <Sparkles className="h-4 w-4 text-primary" />
          <p className="font-body text-sm font-bold text-primary">All pairs matched! 🎉</p>
        </motion.div>
      )}
    </div>
  );
}
