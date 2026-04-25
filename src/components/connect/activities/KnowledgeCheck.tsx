import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, RefreshCw, Trophy } from "lucide-react";
import { haptic } from "@/hooks/use-mobile";

interface Question {
  question: string;
  options: string[];
  correct: number;
  explanation?: string;
}

interface Props {
  content: {
    questions: Question[];
    passMark?: number;
    intro?: string;
  };
  onComplete: (response: any) => void;
}

type Phase = "intro" | "quiz" | "feedback" | "results";

export default function KnowledgeCheck({ content, onComplete }: Props) {
  const { questions = [], passMark, intro } = content;
  const required = passMark ?? Math.ceil(questions.length * 0.6);

  const [phase, setPhase] = useState<Phase>(intro ? "intro" : "quiz");
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<{ correct: boolean; selected: number }[]>([]);
  const [revealed, setRevealed] = useState(false);

  const q = questions[qIdx];
  const score = answers.filter(a => a.correct).length;
  const passed = score >= required;

  const handleSelect = (i: number) => {
    if (revealed) return;
    haptic("light");
    setSelected(i);
  };

  const handleCheck = () => {
    if (selected === null) return;
    haptic("medium");
    setRevealed(true);
  };

  const handleNext = () => {
    haptic("light");
    const newAnswers = [...answers, { correct: selected === q.correct, selected: selected! }];
    setAnswers(newAnswers);
    setSelected(null);
    setRevealed(false);

    if (qIdx < questions.length - 1) {
      setQIdx(prev => prev + 1);
    } else {
      setPhase("results");
    }
  };

  const handleRetry = () => {
    haptic("medium");
    setPhase("quiz");
    setQIdx(0);
    setSelected(null);
    setAnswers([]);
    setRevealed(false);
  };

  const handleComplete = () => {
    haptic("medium");
    onComplete({ score, total: questions.length, passed, answers });
  };

  if (phase === "intro") {
    return (
      <div className="space-y-5 py-2">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <span className="text-2xl">🧠</span>
          </div>
          <p className="font-body text-sm text-muted-foreground leading-relaxed">{intro}</p>
          <p className="font-body text-xs text-muted-foreground/60">
            {questions.length} questions · pass {required}/{questions.length} to continue
          </p>
        </div>
        <button
          onClick={() => { haptic("medium"); setPhase("quiz"); }}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-body text-sm font-bold"
        >
          Start knowledge check
        </button>
      </div>
    );
  }

  if (phase === "results") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-5 py-2"
      >
        <div className="text-center space-y-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.1 }}
            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
              passed ? "bg-primary/15" : "bg-destructive/10"
            }`}
          >
            {passed
              ? <Trophy className="h-7 w-7 text-primary" />
              : <RefreshCw className="h-7 w-7 text-destructive" />
            }
          </motion.div>
          <div>
            <p className="font-display text-2xl font-extrabold text-foreground">{score}/{questions.length}</p>
            <p className={`font-body text-sm font-medium mt-1 ${passed ? "text-primary" : "text-destructive"}`}>
              {passed ? "Passed — great work!" : `Need ${required} to pass`}
            </p>
          </div>
        </div>

        {/* Answer review */}
        <div className="space-y-2">
          {questions.map((q, i) => {
            const ans = answers[i];
            return (
              <div key={i} className={`p-3 rounded-xl border text-left flex items-start gap-2 ${
                ans?.correct ? "border-primary/20 bg-primary/5" : "border-destructive/20 bg-destructive/5"
              }`}>
                {ans?.correct
                  ? <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  : <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                }
                <div className="min-w-0">
                  <p className="font-body text-xs font-medium text-foreground">{q.question}</p>
                  {!ans?.correct && q.explanation && (
                    <p className="font-body text-[10px] text-muted-foreground mt-1">{q.explanation}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {passed ? (
          <button
            onClick={handleComplete}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-body text-sm font-bold flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4" /> Continue
          </button>
        ) : (
          <button
            onClick={handleRetry}
            className="w-full py-3 rounded-xl border-2 border-primary text-primary font-body text-sm font-bold flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-4 w-4" /> Try again
          </button>
        )}
      </motion.div>
    );
  }

  // Quiz phase
  return (
    <div className="space-y-4 py-2">
      {/* Progress dots */}
      <div className="flex items-center justify-center gap-1.5">
        {questions.map((_, i) => (
          <div key={i} className={`rounded-full transition-all ${
            i < answers.length ? "w-4 h-2 bg-primary"
            : i === qIdx ? "w-4 h-2 bg-primary/40"
            : "w-2 h-2 bg-border"
          }`} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={qIdx}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          <p className="font-display text-base font-bold text-foreground leading-snug">{q.question}</p>

          <div className="space-y-2">
            {q.options.map((opt, i) => {
              let state: "default" | "correct" | "wrong" | "selected" = "default";
              if (revealed) {
                if (i === q.correct) state = "correct";
                else if (i === selected) state = "wrong";
              } else if (i === selected) {
                state = "selected";
              }

              return (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  disabled={revealed}
                  className={`w-full text-left p-3.5 rounded-xl border-2 font-body text-sm transition-all flex items-center gap-3 ${
                    state === "correct" ? "border-primary bg-primary/10 text-primary font-bold"
                    : state === "wrong" ? "border-destructive bg-destructive/8 text-destructive"
                    : state === "selected" ? "border-primary/60 bg-primary/8 text-foreground"
                    : "border-border bg-card text-foreground hover:border-primary/30"
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 text-xs font-bold ${
                    state === "correct" ? "border-primary bg-primary text-primary-foreground"
                    : state === "wrong" ? "border-destructive bg-destructive text-white"
                    : state === "selected" ? "border-primary text-primary"
                    : "border-border text-muted-foreground"
                  }`}>
                    {state === "correct" ? "✓" : state === "wrong" ? "✗" : String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>

          {revealed && q.explanation && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-xl bg-accent/30 border border-accent/50"
            >
              <p className="font-body text-xs text-muted-foreground leading-relaxed">{q.explanation}</p>
            </motion.div>
          )}

          {!revealed ? (
            <button
              onClick={handleCheck}
              disabled={selected === null}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-body text-sm font-bold disabled:opacity-40"
            >
              Check answer
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-body text-sm font-bold"
            >
              {qIdx < questions.length - 1 ? "Next question →" : "See results"}
            </button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
