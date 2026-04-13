import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Sparkles } from "lucide-react";
import { haptic } from "@/hooks/use-mobile";

interface Props {
  content: { question: string; options: string[]; correctIndex: number | null; explanation?: string };
  onComplete: (response: any) => void;
}

export default function SingleChoice({ content, onComplete }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handleSelect = (i: number) => {
    if (revealed) return;
    haptic("light");
    setSelected(i);
  };

  const handleReveal = () => {
    haptic("medium");
    setRevealed(true);
    onComplete({ selectedIndex: selected, selectedOption: content.options[selected!] });
  };

  const isCorrect = content.correctIndex === null || selected === content.correctIndex;

  return (
    <div className="space-y-4">
      <p className="font-body text-sm text-foreground leading-relaxed">{content.question}</p>
      <div className="space-y-2">
        {content.options.map((opt, i) => (
          <motion.button
            key={i}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect(i)}
            className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 ${
              selected === i
                ? revealed
                  ? isCorrect || content.correctIndex === null
                    ? "border-primary bg-primary/10"
                    : i === content.correctIndex
                    ? "border-primary bg-primary/10"
                    : "border-destructive bg-destructive/10"
                  : "border-primary bg-primary/5"
                : "border-border bg-card hover:border-primary/30"
            }`}
          >
            {selected === i && revealed ? (
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            ) : (
              <Circle className={`h-5 w-5 mt-0.5 shrink-0 ${selected === i ? "text-primary" : "text-muted-foreground/40"}`} />
            )}
            <span className="font-body text-sm">{opt}</span>
          </motion.button>
        ))}
      </div>
      {selected !== null && !revealed && (
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleReveal}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-body text-sm font-bold"
        >
          Confirm
        </motion.button>
      )}
      {revealed && content.explanation && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-xl bg-accent/50 border border-accent">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-body text-xs font-bold uppercase tracking-wider text-primary">Insight</span>
          </div>
          <p className="font-body text-sm text-muted-foreground leading-relaxed">{content.explanation}</p>
        </motion.div>
      )}
    </div>
  );
}
