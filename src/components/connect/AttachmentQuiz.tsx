import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Heart, Shield, AlertTriangle, Eye, Shuffle, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { haptic } from "@/hooks/use-mobile";

// ── Quiz Data ──────────────────────────────────────────────

const SCALE_LABELS = [
  "Strongly Disagree",
  "Disagree",
  "Slightly Disagree",
  "Neutral / Mixed",
  "Slightly Agree",
  "Agree",
  "Strongly Agree",
];

const ROSENBERG_LABELS = [
  "Strongly Disagree",
  "Disagree",
  "Neither Agree or Disagree",
  "Agree",
  "Strongly Agree",
];

interface QuizSection {
  id: string;
  title: string;
  subtitle: string;
  note?: string;
  scaleLabels: string[];
  questions: string[];
  // scoring key: each question maps to a style
  keys: ("secure" | "anxious" | "avoidant" | "disorganized")[];
}

const SECTIONS: QuizSection[] = [
  {
    id: "mother",
    title: "Relationship Structure: Mother / Caregiver #1",
    subtitle: "Please answer the following questions with respect to your mother or mother-like figure.",
    note: "If this person has passed away, we would like for you to answer these questions with respect to how you felt when they were alive.",
    scaleLabels: SCALE_LABELS,
    questions: [
      "I prefer not to show this person how I feel deep down.",
      "I often worry that this person doesn't really care for me.",
      "It helps to turn to this person in times of need.",
      "I usually discuss my problems and concerns with this person.",
      "I don't feel comfortable opening up to this person.",
      "I find it easy to depend on this person.",
    ],
    keys: ["avoidant", "anxious", "secure", "secure", "avoidant", "secure"],
  },
  {
    id: "father",
    title: "Relationship Structure: Father / Caregiver #2",
    subtitle: "Please answer the following questions with respect to your father or father-like figure.",
    note: "If this person has passed away, we would like for you to answer these questions with respect to how you felt when they were alive.",
    scaleLabels: SCALE_LABELS,
    questions: [
      "I talk things over with this person.",
      "I usually discuss my problems and concerns with this person.",
      "It helps to turn to this person in times of need.",
      "I often worry that this person doesn't really care for me.",
      "I don't feel comfortable opening up to this person.",
      "I find it easy to depend on this person.",
    ],
    keys: ["secure", "secure", "secure", "anxious", "avoidant", "secure"],
  },
  {
    id: "partner",
    title: "Relationship Structure: Romantic Partner",
    subtitle: "Please answer the following questions with respect to your romantic partner.",
    note: "If you are currently not in a romantic relationship, please answer with respect to your most recent meaningful relationship. If you have never been in a romantic relationship before, imagine what such a relationship would be like.",
    scaleLabels: SCALE_LABELS,
    questions: [
      "I usually discuss my problems and concerns with this person.",
      "I prefer not to show this person how I feel deep down.",
      "I find it easy to depend on this person.",
      "It helps to turn to this person in times of need.",
      "I don't feel comfortable opening up to this person.",
      "I'm afraid that this person may abandon me.",
    ],
    keys: ["secure", "avoidant", "secure", "secure", "avoidant", "anxious"],
  },
  {
    id: "general",
    title: "General Attachment Style",
    subtitle: "Please read each of the following statements and rate the extent to which you believe each statement best describes your feelings about close relationships in general.",
    scaleLabels: SCALE_LABELS,
    questions: [
      "I worry that others won't care about me as much as I care about them.",
      "I prefer not to show others how I feel deep down.",
      "I talk things over with people.",
      "I usually discuss my problems and concerns with others.",
      "It helps to turn to people in times of need.",
      "I find it easy to depend on others.",
      "I don't feel comfortable opening up to others.",
      "I often worry that other people do not really care for me.",
    ],
    keys: ["anxious", "avoidant", "secure", "secure", "secure", "secure", "avoidant", "anxious"],
  },
  {
    id: "self_esteem",
    title: "Rosenberg Self Esteem",
    subtitle: "Please indicate the extent to which you agree with the following statements that deal with your general feelings about yourself.",
    scaleLabels: ROSENBERG_LABELS,
    questions: [
      "I take a positive attitude toward myself.",
      "I feel that I'm a person of worth, at least on an equal plane with others.",
      "I feel I do not have much to be proud of.",
      "I am able to do things as well as most other people.",
      "All in all, I am inclined to feel that I am a failure.",
      "I feel that I have a number of good qualities.",
      "On the whole, I am satisfied with myself.",
      "At times I think I am no good at all.",
      "I certainly feel useless at times.",
      "I wish I could have more respect for myself.",
    ],
    keys: [] as any, // Self-esteem uses different scoring
  },
];

// Reverse-scored self-esteem items (0-indexed): items 2,4,7,8,9
const ROSENBERG_REVERSE = [2, 4, 7, 8, 9];

interface AttachmentResult {
  style: "secure" | "anxious" | "avoidant" | "disorganized";
  scores: Record<string, number>;
  selfEsteem: number;
  selfEsteemLabel: string;
}

const STYLE_INFO: Record<string, { label: string; color: string; icon: any; description: string; traits: string[] }> = {
  secure: {
    label: "Secure Attachment",
    color: "text-emerald-600",
    icon: Shield,
    description: "You feel comfortable with intimacy and closeness. You trust others and can depend on them, while also feeling that others can depend on you. You generally have a positive view of yourself and your relationships.",
    traits: [
      "Comfortable with emotional closeness",
      "Trust in others and self",
      "Effective at communicating needs",
      "Resilient in relationships",
      "Can give and receive support",
    ],
  },
  anxious: {
    label: "Anxious Attachment",
    color: "text-amber-600",
    icon: Heart,
    description: "You tend to worry about your relationships and whether others truly care about you. You may seek closeness but fear rejection or abandonment. This often stems from inconsistent caregiving in childhood.",
    traits: [
      "Strong desire for closeness and validation",
      "Worry about partner's feelings",
      "Sensitivity to relationship changes",
      "Deep emotional capacity",
      "May struggle with self-soothing",
    ],
  },
  avoidant: {
    label: "Avoidant Attachment",
    color: "text-blue-600",
    icon: Eye,
    description: "You value independence highly and may feel uncomfortable with too much closeness. You tend to keep emotions private and prefer self-reliance. This often develops from emotionally distant caregiving.",
    traits: [
      "Strong sense of independence",
      "Discomfort with vulnerability",
      "Self-reliant problem-solving",
      "May suppress emotions",
      "Value personal space and autonomy",
    ],
  },
  disorganized: {
    label: "Disorganized Attachment",
    color: "text-rose-600",
    icon: Shuffle,
    description: "You may experience conflicting desires for closeness and distance. You might want intimacy but feel anxious or uncomfortable when you get it. This often stems from unpredictable or frightening early experiences.",
    traits: [
      "Conflicting needs for closeness and distance",
      "Difficulty trusting relationships",
      "Strong emotional responses",
      "Can be both anxious and avoidant",
      "Capacity for deep self-awareness with support",
    ],
  },
};

function computeResult(answers: Record<string, number[]>): AttachmentResult {
  const styleTotals: Record<string, number[]> = { secure: [], anxious: [], avoidant: [], disorganized: [] };

  // Score attachment sections
  for (const section of SECTIONS) {
    if (section.id === "self_esteem") continue;
    const sectionAnswers = answers[section.id] || [];
    section.questions.forEach((_, qi) => {
      const val = sectionAnswers[qi];
      if (val !== undefined) {
        styleTotals[section.keys[qi]].push(val);
      }
    });
  }

  // Calculate averages
  const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  const scores: Record<string, number> = {
    secure: avg(styleTotals.secure),
    anxious: avg(styleTotals.anxious),
    avoidant: avg(styleTotals.avoidant),
  };

  // Disorganized = high anxious + high avoidant
  const anxiousNorm = scores.anxious / 7;
  const avoidantNorm = scores.avoidant / 7;
  scores.disorganized = (anxiousNorm + avoidantNorm) / 2 * 7;

  // Determine primary style
  let style: "secure" | "anxious" | "avoidant" | "disorganized" = "secure";
  if (anxiousNorm > 0.5 && avoidantNorm > 0.5) {
    style = "disorganized";
  } else if (scores.anxious > scores.secure && scores.anxious > scores.avoidant) {
    style = "anxious";
  } else if (scores.avoidant > scores.secure && scores.avoidant > scores.anxious) {
    style = "avoidant";
  }

  // Rosenberg Self-Esteem (scored 0-30)
  const seAnswers = answers["self_esteem"] || [];
  let selfEsteem = 0;
  seAnswers.forEach((val, i) => {
    if (ROSENBERG_REVERSE.includes(i)) {
      selfEsteem += (4 - val); // Reverse score (0-4 scale)
    } else {
      selfEsteem += val;
    }
  });

  const selfEsteemLabel = selfEsteem >= 25 ? "High" : selfEsteem >= 15 ? "Normal" : "Low";

  // Normalize scores to percentages
  const total = scores.secure + scores.anxious + scores.avoidant;
  const pctScores: Record<string, number> = {
    secure: total ? Math.round((scores.secure / total) * 100) : 0,
    anxious: total ? Math.round((scores.anxious / total) * 100) : 0,
    avoidant: total ? Math.round((scores.avoidant / total) * 100) : 0,
  };
  pctScores.disorganized = Math.round(Math.min(pctScores.anxious, pctScores.avoidant));

  return { style, scores: pctScores, selfEsteem, selfEsteemLabel };
}

// ── Component ──────────────────────────────────────────────

export default function AttachmentQuiz({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const [step, setStep] = useState<"intro" | "quiz" | "results">("intro");
  const [sectionIndex, setSectionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [result, setResult] = useState<AttachmentResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [existingResult, setExistingResult] = useState<any>(null);

  const section = SECTIONS[sectionIndex];
  const totalSections = SECTIONS.length;

  // Check for existing results
  useEffect(() => {
    if (!user) return;
    supabase
      .from("attachment_quiz_results")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setExistingResult(data);
          setResult({
            style: data.attachment_style as any,
            scores: (data.style_scores as any) || {},
            selfEsteem: Number(data.self_esteem_score) || 0,
            selfEsteemLabel: Number(data.self_esteem_score) >= 25 ? "High" : Number(data.self_esteem_score) >= 15 ? "Normal" : "Low",
          });
          setStep("results");
        }
      });
  }, [user]);

  const handleAnswer = (questionIndex: number, value: number) => {
    haptic("light");
    setAnswers((prev) => {
      const sectionAnswers = [...(prev[section.id] || [])];
      sectionAnswers[questionIndex] = value;
      return { ...prev, [section.id]: sectionAnswers };
    });
  };

  const sectionComplete = () => {
    const a = answers[section.id] || [];
    return section.questions.every((_, i) => a[i] !== undefined);
  };

  const handleNext = () => {
    if (sectionIndex < totalSections - 1) {
      setSectionIndex((i) => i + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Calculate and save
      const res = computeResult(answers);
      setResult(res);
      saveResult(res);
      setStep("results");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const saveResult = async (res: AttachmentResult) => {
    if (!user) return;
    setSaving(true);
    await supabase.from("attachment_quiz_results").insert({
      user_id: user.id,
      answers: answers as any,
      attachment_style: res.style,
      style_scores: res.scores as any,
      self_esteem_score: res.selfEsteem,
    });
    setSaving(false);
    toast.success("Results saved");
  };

  const retakeQuiz = () => {
    setAnswers({});
    setSectionIndex(0);
    setResult(null);
    setExistingResult(null);
    setStep("intro");
  };

  // ── Intro ──
  if (step === "intro") {
    return (
      <div className="min-h-screen pb-24 px-6">
        <div className="flex flex-col items-center pt-8 max-w-md mx-auto">
          <button onClick={onBack} className="self-start flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Heart className="w-9 h-9 text-primary" strokeWidth={1.5} />
          </div>

          <h1 className="font-display text-2xl text-foreground text-center mb-3">
            Attachment Style Quiz
          </h1>
          <p className="text-sm text-muted-foreground text-center max-w-sm mb-6 leading-relaxed">
            Take this free, 5-minute attachment style quiz to explore how childhood conditioning manifests in your adult relationships.
          </p>

          <div className="w-full space-y-3 mb-8">
            {[
              { style: "Secure", desc: "The 5 conditions for secure attachment" },
              { style: "Anxious", desc: "How does it develop in childhood?" },
              { style: "Avoidant", desc: "What are symptoms in adult relationships?" },
              { style: "Disorganized", desc: "What is it like to date a disorganized adult?" },
            ].map((item) => (
              <div key={item.style} className="flex items-center gap-4 p-3.5 rounded-2xl bg-card border border-border">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Heart className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{item.style} Attachment</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground/60 text-center mb-6">
            {totalSections} sections · ~{SECTIONS.reduce((a, s) => a + s.questions.length, 0)} questions · ~5 minutes
          </p>

          <button
            onClick={() => setStep("quiz")}
            className="w-full max-w-sm bg-primary text-primary-foreground py-3.5 rounded-full text-sm font-semibold"
          >
            Start the Quiz
          </button>
        </div>
      </div>
    );
  }

  // ── Results ──
  if (step === "results" && result) {
    const info = STYLE_INFO[result.style];
    const Icon = info.icon;

    return (
      <div className="min-h-screen pb-24 px-6">
        <div className="flex flex-col items-center pt-8 max-w-md mx-auto">
          <button onClick={onBack} className="self-start flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Connect
          </button>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4"
          >
            <Icon className={`w-9 h-9 ${info.color}`} strokeWidth={1.5} />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className={`font-display text-2xl text-center mb-2 ${info.color}`}
          >
            {info.label}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-muted-foreground text-center leading-relaxed mb-8 max-w-sm"
          >
            {info.description}
          </motion.p>

          {/* Score breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="w-full bg-card border border-border rounded-2xl p-5 mb-4 space-y-3"
          >
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Style Breakdown</p>
            {(["secure", "anxious", "avoidant"] as const).map((key) => (
              <div key={key} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-foreground font-medium capitalize">{key}</span>
                  <span className="text-muted-foreground">{result.scores[key]}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${result.scores[key]}%` }}
                    transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                    className={`h-full rounded-full ${
                      key === "secure" ? "bg-emerald-500" : key === "anxious" ? "bg-amber-500" : "bg-blue-500"
                    }`}
                  />
                </div>
              </div>
            ))}
          </motion.div>

          {/* Self-Esteem */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="w-full bg-card border border-border rounded-2xl p-5 mb-4"
          >
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Self-Esteem (Rosenberg)</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-foreground">{result.selfEsteem}</span>
              <span className="text-sm text-muted-foreground mb-1">/ 30</span>
              <span className={`ml-auto text-sm font-medium ${
                result.selfEsteemLabel === "High" ? "text-emerald-600" : result.selfEsteemLabel === "Normal" ? "text-foreground" : "text-amber-600"
              }`}>
                {result.selfEsteemLabel}
              </span>
            </div>
          </motion.div>

          {/* Key traits */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="w-full bg-card border border-border rounded-2xl p-5 mb-8"
          >
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Key Characteristics</p>
            <ul className="space-y-2">
              {info.traits.map((trait) => (
                <li key={trait} className="flex items-start gap-2 text-sm text-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  {trait}
                </li>
              ))}
            </ul>
          </motion.div>

          <button
            onClick={retakeQuiz}
            className="w-full max-w-sm border border-border text-foreground py-3 rounded-full text-sm font-medium mb-3"
          >
            Retake Quiz
          </button>
          <button
            onClick={onBack}
            className="w-full max-w-sm bg-primary text-primary-foreground py-3.5 rounded-full text-sm font-semibold"
          >
            Back to Connect
          </button>
        </div>
      </div>
    );
  }

  // ── Quiz Questions ──
  return (
    <div className="min-h-screen pb-24 px-6">
      <div className="max-w-md mx-auto pt-6">
        {/* Progress */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => sectionIndex > 0 ? setSectionIndex((i) => i - 1) : setStep("intro")} className="p-1.5">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex-1 flex gap-1">
            {SECTIONS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full flex-1 transition-colors ${
                  i < sectionIndex ? "bg-primary" : i === sectionIndex ? "bg-primary/60" : "bg-muted"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">{sectionIndex + 1}/{totalSections}</span>
        </div>

        {/* Section header */}
        <AnimatePresence mode="wait">
          <motion.div
            key={section.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="font-display text-lg text-foreground mb-2">{section.title}</h2>
            <p className="text-xs text-muted-foreground mb-1 leading-relaxed">{section.subtitle}</p>
            {section.note && (
              <p className="text-[11px] text-muted-foreground/60 italic mb-6">{section.note}</p>
            )}

            {/* Questions */}
            <div className="space-y-6">
              {section.questions.map((q, qi) => {
                const currentVal = (answers[section.id] || [])[qi];
                return (
                  <div key={qi} className="bg-card border border-border rounded-2xl p-4">
                    <p className="text-[10px] text-muted-foreground mb-1">{qi + 1} of {section.questions.length} questions</p>
                    <p className="text-sm font-medium text-foreground mb-4">{q}</p>

                    {/* Slider-style buttons */}
                    <div className="space-y-1.5">
                      {section.scaleLabels.map((label, li) => (
                        <button
                          key={li}
                          onClick={() => handleAnswer(qi, li)}
                          className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs transition-all border ${
                            currentVal === li
                              ? "bg-primary/15 border-primary/30 text-foreground font-medium"
                              : "bg-background border-border text-muted-foreground hover:border-primary/20"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Continue */}
            <button
              onClick={handleNext}
              disabled={!sectionComplete()}
              className="w-full bg-primary text-primary-foreground py-3.5 rounded-full text-sm font-semibold mt-8 disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {sectionIndex === totalSections - 1 ? "See Results" : "Continue"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
