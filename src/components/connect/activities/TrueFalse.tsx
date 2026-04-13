import { useState } from "react";
import { motion } from "framer-motion";
import { Check, X, Sparkles } from "lucide-react";
import { haptic } from "@/hooks/use-mobile";

interface Props {
  content: { statement: string; correctAnswer?: boolean; explanation?: string };
  onComplete: (response: any) => void;
}

export default function TrueFalse({ content, onComplete }: Props) {
  const [answer, setAnswer] = useState<boolean | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handleAnswer = (val: boolean) => {
    haptic("medium");
    setAnswer(val);
    setRevealed(true);
    onComplete({ answer: val, statement: content.statement });
  };

  const isCorrect = content.correctAnswer === undefined || answer === content.correctAnswer;

  return (
    <div className="space-y-5">
      <div className="p-5 rounded-2xl bg-card border border-border">
        <p className="font-body text-base text-foreground leading-relaxed text-center italic">"{content.statement}"</p>
      </div>
      {answer === null ? (
        <div className="grid grid-cols-2 gap-3">
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleAnswer(true)}
            className="py-4 rounded-xl bg-primary/10 border border-primary/20 font-body text-sm font-bold text-primary flex items-center justify-center gap-2">
            <Check className="h-5 w-5" /> True
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleAnswer(false)}
            className="py-4 rounded-xl bg-secondary border border-border font-body text-sm font-bold text-foreground flex items-center justify-center gap-2">
            <X className="h-5 w-5" /> False
          </motion.button>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className={`p-4 rounded-xl border text-center ${isCorrect ? "bg-primary/10 border-primary/30" : "bg-destructive/10 border-destructive/30"}`}>
          <p className="font-body text-sm font-bold">{isCorrect ? "✨ That's right!" : "Not quite!"}</p>
        </motion.div>
      )}
      {revealed && content.explanation && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-xl bg-accent/50 border border-accent">
          <div className="flex items-center gap-2 mb-2"><Sparkles className="h-4 w-4 text-primary" /><span className="font-body text-xs font-bold uppercase tracking-wider text-primary">Learn more</span></div>
          <p className="font-body text-sm text-muted-foreground leading-relaxed">{content.explanation}</p>
        </motion.div>
      )}
    </div>
  );
}
