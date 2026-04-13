import { useState } from "react";
import { motion } from "framer-motion";
import { haptic } from "@/hooks/use-mobile";

interface Props {
  content: { questions: { question: string; scale?: number }[] };
  onComplete: (response: any) => void;
}

const SCALE_LABELS = ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"];

export default function SurveyActivity({ content, onComplete }: Props) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const allDone = Object.keys(answers).length === content.questions.length;

  const handleSubmit = () => {
    haptic("medium");
    setSubmitted(true);
    onComplete({ answers: content.questions.map((q, i) => ({ question: q.question, rating: answers[i] })) });
  };

  return (
    <div className="space-y-5">
      {content.questions.map((q, qi) => (
        <div key={qi} className="space-y-2">
          <p className="font-body text-sm text-foreground">{q.question}</p>
          <div className="flex gap-1">
            {Array.from({ length: q.scale || 5 }, (_, i) => (
              <button key={i} onClick={() => { haptic("light"); setAnswers(prev => ({ ...prev, [qi]: i + 1 })); }}
                disabled={submitted}
                className={`flex-1 py-2.5 rounded-lg text-xs font-body font-bold transition-all ${
                  answers[qi] === i + 1 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-accent"
                }`}>
                {i + 1}
              </button>
            ))}
          </div>
          <div className="flex justify-between">
            <span className="font-body text-[10px] text-muted-foreground/50">{SCALE_LABELS[0]}</span>
            <span className="font-body text-[10px] text-muted-foreground/50">{SCALE_LABELS[4]}</span>
          </div>
        </div>
      ))}
      {allDone && !submitted && (
        <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} onClick={handleSubmit}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-body text-sm font-bold">Submit Survey</motion.button>
      )}
    </div>
  );
}
