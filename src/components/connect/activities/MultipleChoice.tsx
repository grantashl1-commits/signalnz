import { useState } from "react";
import { motion } from "framer-motion";
import { CheckSquare, Square, Sparkles } from "lucide-react";
import { haptic } from "@/hooks/use-mobile";

interface Props {
  content: { question: string; options: string[]; explanation?: string };
  onComplete: (response: any) => void;
}

export default function MultipleChoice({ content, onComplete }: Props) {
  const [selected, setSelected] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const toggle = (i: number) => {
    if (submitted) return;
    haptic("light");
    setSelected(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  };

  const handleSubmit = () => {
    haptic("medium");
    setSubmitted(true);
    onComplete({ selectedIndices: selected, selectedOptions: selected.map(i => content.options[i]) });
  };

  return (
    <div className="space-y-4">
      <p className="font-body text-sm text-foreground leading-relaxed">{content.question}</p>
      <p className="font-body text-xs text-muted-foreground">Select all that apply</p>
      <div className="space-y-2">
        {content.options.map((opt, i) => (
          <motion.button key={i} whileTap={{ scale: 0.98 }} onClick={() => toggle(i)}
            className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 ${
              selected.includes(i) ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/30"
            }`}>
            {selected.includes(i) ? <CheckSquare className="h-5 w-5 text-primary mt-0.5 shrink-0" /> : <Square className="h-5 w-5 text-muted-foreground/40 mt-0.5 shrink-0" />}
            <span className="font-body text-sm">{opt}</span>
          </motion.button>
        ))}
      </div>
      {selected.length > 0 && !submitted && (
        <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} onClick={handleSubmit}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-body text-sm font-bold">
          Continue
        </motion.button>
      )}
      {submitted && content.explanation && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-xl bg-accent/50 border border-accent">
          <div className="flex items-center gap-2 mb-2"><Sparkles className="h-4 w-4 text-primary" /><span className="font-body text-xs font-bold uppercase tracking-wider text-primary">Insight</span></div>
          <p className="font-body text-sm text-muted-foreground leading-relaxed">{content.explanation}</p>
        </motion.div>
      )}
    </div>
  );
}
