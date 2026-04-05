import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RotateCcw } from "lucide-react";
import { DOSHA_RESULTS, STARTER_PACKS, type DoshaType } from "@/data/habit-library";
import { haptic } from "@/hooks/use-mobile";

const QUESTIONS = [
  {
    question: "Your natural energy pattern",
    options: [
      { label: "I feel best in the morning, get tired early", dosha: "kapha" as DoshaType },
      { label: "I'm sharp and focused mid-morning to noon, then tired", dosha: "pitta" as DoshaType },
      { label: "I get a second wind in the evening but then can't sleep", dosha: "vata" as DoshaType },
    ],
  },
  {
    question: "Under stress, you tend to...",
    options: [
      { label: "Withdraw, sleep more, comfort eat", dosha: "kapha" as DoshaType },
      { label: "Get irritable, push harder, skip meals", dosha: "pitta" as DoshaType },
      { label: "Worry, can't switch off, lose appetite", dosha: "vata" as DoshaType },
    ],
  },
  {
    question: "Your body type tendency",
    options: [
      { label: "Easy to gain weight, slow metabolism", dosha: "kapha" as DoshaType },
      { label: "Medium build, runs warm, tends to inflammation", dosha: "pitta" as DoshaType },
      { label: "Naturally lean, tends to dryness, light sleeper", dosha: "vata" as DoshaType },
    ],
  },
];

export default function DoshaQuiz() {
  const [saved, setSaved] = useState<DoshaType | null>(() => {
    return localStorage.getItem("dosha_type") as DoshaType | null;
  });
  const [answers, setAnswers] = useState<(DoshaType | null)[]>([null, null, null]);
  const [step, setStep] = useState(saved ? -1 : 0);

  const handleAnswer = (questionIdx: number, dosha: DoshaType) => {
    haptic("light");
    const newAnswers = [...answers];
    newAnswers[questionIdx] = dosha;
    setAnswers(newAnswers);

    if (questionIdx < 2) {
      setTimeout(() => setStep(questionIdx + 1), 300);
    } else {
      // Calculate result
      const counts: Record<DoshaType, number> = { vata: 0, pitta: 0, kapha: 0 };
      newAnswers.forEach(a => { if (a) counts[a]++; });
      const result = (Object.entries(counts) as [DoshaType, number][])
        .sort((a, b) => b[1] - a[1])[0][0];
      localStorage.setItem("dosha_type", result);
      setSaved(result);
      setStep(-1);
    }
  };

  const handleRetake = () => {
    haptic("light");
    setSaved(null);
    setAnswers([null, null, null]);
    setStep(0);
    localStorage.removeItem("dosha_type");
  };

  if (saved && step === -1) {
    const result = DOSHA_RESULTS[saved];
    const packs = result.recommendedPacks.map(id => STARTER_PACKS.find(p => p.id === id)).filter(Boolean);

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-[18px] bg-card p-5 shadow-soft"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-display text-base font-semibold text-foreground capitalize">
              {saved} Dosha
            </span>
          </div>
          <button onClick={handleRetake} className="touch-btn p-1.5 rounded-full hover:bg-secondary">
            <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>

        <p className="font-body text-sm text-muted-foreground mb-3">{result.description}</p>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {result.priorities.map(p => (
            <span key={p} className="font-body text-xs bg-primary/10 text-primary rounded-full px-2.5 py-1">
              {p}
            </span>
          ))}
        </div>

        {packs.length > 0 && (
          <p className="font-body text-xs text-muted-foreground">
            Recommended: {packs.map(p => p!.name).join(" + ")}
          </p>
        )}
      </motion.div>
    );
  }

  if (step < 0) return null;

  const q = QUESTIONS[step];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-[18px] bg-card p-5 shadow-soft"
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="font-display text-base font-semibold text-foreground">
          Discover Your Dosha
        </span>
      </div>

      <p className="font-body text-xs text-muted-foreground mb-1">
        Question {step + 1} of 3
      </p>
      <p className="font-body text-sm font-medium text-foreground mb-4">{q.question}</p>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-2"
        >
          {q.options.map(opt => (
            <button
              key={opt.dosha}
              onClick={() => handleAnswer(step, opt.dosha)}
              className="touch-btn w-full text-left rounded-[12px] border border-border p-3.5 font-body text-sm text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all"
            >
              {opt.label}
            </button>
          ))}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
