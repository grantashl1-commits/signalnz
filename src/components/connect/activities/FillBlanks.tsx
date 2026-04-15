import { useState } from "react";
import { motion } from "framer-motion";
import { haptic } from "@/hooks/use-mobile";

interface Props {
  content: { sentence: string; blanks: string[] };
  onComplete: (response: any) => void;
}

export default function FillBlanks({ content, onComplete }: Props) {
  const [answers, setAnswers] = useState<string[]>(content.blanks.map(() => ""));
  const [submitted, setSubmitted] = useState(false);

  const parts = content.sentence.split("___");

  const handleSubmit = () => {
    haptic("medium");
    setSubmitted(true);
    onComplete({ sentence: content.sentence, filledAnswers: answers });
  };

  const allFilled = answers.every(a => a.trim().length > 0);

  return (
    <div className="space-y-5">
      <div className="p-5 rounded-2xl bg-card border border-border">
        <p className="font-body text-base leading-loose">
          {parts.map((part, i) => (
            <span key={i}>
              {part}
              {i < parts.length - 1 && (
                <input
                  value={answers[i]}
                  onChange={e => { const next = [...answers]; next[i] = e.target.value; setAnswers(next); }}
                  disabled={submitted}
                  placeholder="..."
                  className="inline-block w-32 border-b-2 border-primary/40 bg-transparent text-center font-body text-sm text-primary mx-1 focus:outline-none focus:border-primary placeholder:text-muted-foreground/30"
                />
              )}
            </span>
          ))}
        </p>
      </div>
      {allFilled && !submitted && (
        <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} onClick={handleSubmit}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-body text-sm font-bold">
          Complete
        </motion.button>
      )}
      {submitted && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <p className="font-body text-sm text-primary font-bold">✨ Beautifully expressed</p>
        </motion.div>
      )}
    </div>
  );
}
