import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitFork, Sparkles } from "lucide-react";
import { haptic } from "@/hooks/use-mobile";

interface Props {
  content: { scenario: string; options: { label: string; outcome: string }[] };
  onComplete: (response: any) => void;
}

export default function DecisionPoint({ content, onComplete }: Props) {
  const [chosen, setChosen] = useState<number | null>(null);

  const handleChoose = (i: number) => {
    haptic("medium");
    setChosen(i);
    onComplete({ chosenIndex: i, chosenLabel: content.options[i].label });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <GitFork className="h-5 w-5 text-primary" />
        <span className="font-body text-xs uppercase tracking-wider text-primary font-bold">Decision Point</span>
      </div>
      <div className="p-5 rounded-2xl bg-card border border-border">
        <p className="font-body text-sm text-foreground leading-relaxed italic">{content.scenario}</p>
      </div>
      <AnimatePresence mode="wait">
        {chosen === null ? (
          <motion.div key="options" className="grid gap-2">
            {content.options.map((opt, i) => (
              <motion.button key={i} whileTap={{ scale: 0.97 }} onClick={() => handleChoose(i)}
                className="text-left p-4 rounded-xl border border-border bg-card hover:border-primary/40 transition-all">
                <span className="font-body text-sm font-medium">{opt.label}</span>
              </motion.button>
            ))}
          </motion.div>
        ) : (
          <motion.div key="outcome" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-body text-xs font-bold text-primary">What happens next...</span>
            </div>
            <p className="font-body text-sm text-foreground leading-relaxed">{content.options[chosen].outcome}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
