import { useState } from "react";
import { motion } from "framer-motion";
import { haptic } from "@/hooks/use-mobile";

interface Props {
  content: { questions: { question: string; scale?: number }[] };
  onComplete: (response: any) => void;
}

const SCALE_LABELS = ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"];

function RatingSurvey({ content, onComplete }: Props) {
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

interface ChoiceSurveyProps { content: { question: string; options: string[] }; onComplete: (response: unknown) => void }
function ChoiceSurvey({ content, onComplete }: ChoiceSurveyProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  return <div className="space-y-3"><p>{content.question}</p>
    {content.options.map((option, i) => <button key={option} aria-pressed={selected === i} disabled={saved} className={`block w-full text-left p-4 rounded-xl border ${selected === i ? 'border-primary bg-primary/10' : 'border-border'}`} onClick={() => setSelected(i)}>{option}</button>)}
    {!saved ? <button disabled={selected === null} className="min-h-[44px] px-4 rounded-xl bg-primary text-primary-foreground disabled:opacity-40" onClick={() => { if (selected !== null) { onComplete({ selectedIndex: selected, selectedOption: content.options[selected] }); setSaved(true); } }}>Save response</button> : <p role="status">Response recorded</p>}
  </div>;
}
export default function SurveyActivity(props: Props | ChoiceSurveyProps) {
  return 'options' in props.content ? <ChoiceSurvey {...props as ChoiceSurveyProps} /> : <RatingSurvey {...props as Props} />;
}
