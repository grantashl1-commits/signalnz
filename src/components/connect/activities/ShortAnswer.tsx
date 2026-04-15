import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { haptic } from "@/hooks/use-mobile";

interface Props {
  content: { question: string; placeholder?: string; correctAnswer?: string; explanation?: string };
  onComplete: (response: any) => void;
}

export default function ShortAnswer({ content, onComplete }: Props) {
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    haptic("medium");
    setSubmitted(true);
    onComplete({ answer });
  };

  return (
    <div className="space-y-4">
      <p className="font-body text-sm text-foreground leading-relaxed">{content.question}</p>
      <Input value={answer} onChange={e => setAnswer(e.target.value)} disabled={submitted}
        placeholder={content.placeholder || "Type your answer..."} className="rounded-xl" />
      {answer.trim().length > 0 && !submitted && (
        <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} onClick={handleSubmit}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-body text-sm font-bold">Submit</motion.button>
      )}
      {submitted && content.explanation && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-xl bg-accent/50 border border-accent">
          <p className="font-body text-sm text-muted-foreground">{content.explanation}</p>
        </motion.div>
      )}
    </div>
  );
}
