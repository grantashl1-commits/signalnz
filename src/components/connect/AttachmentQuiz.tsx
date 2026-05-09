import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Heart, Shield, Eye, Shuffle, Briefcase, Brain } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { haptic } from "@/hooks/use-mobile";

// ── Scales ──────────────────────────────────────────────────

const SCALE_7 = [
  "Strongly Disagree", "Disagree", "Slightly Disagree",
  "Neutral / Mixed",
  "Slightly Agree", "Agree", "Strongly Agree",
];

const SCALE_5_SE = [
  "Strongly Disagree", "Disagree", "Neither Agree or Disagree", "Agree", "Strongly Agree",
];

const SCALE_5_ER = [
  "Almost never", "Sometimes", "About half the time", "Most of the time", "Almost always",
];

// ── Section Types ───────────────────────────────────────────

interface QuizSection {
  id: string;
  title: string;
  subtitle: string;
  note?: string;
  scaleLabels: string[];
  questions: string[];
  keys: ("secure" | "anxious" | "avoidant")[];
}

// ── Sections ────────────────────────────────────────────────

const ATTACHMENT_SECTIONS: QuizSection[] = [
  {
    id: "mother",
    title: "Relationship Structure: Mother / Caregiver #1",
    subtitle: "Please answer the following questions with respect to your mother or mother-like figure.",
    note: "If this person has passed away, answer with respect to how you felt when they were alive.",
    scaleLabels: SCALE_7,
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
    note: "If this person has passed away, answer with respect to how you felt when they were alive.",
    scaleLabels: SCALE_7,
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
    note: "If you are not currently in a romantic relationship, answer with respect to your most recent meaningful relationship. If you have never been in one, imagine what it would be like.",
    scaleLabels: SCALE_7,
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
    subtitle: "Rate the extent to which each statement describes your feelings about close relationships in general.",
    scaleLabels: SCALE_7,
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
    id: "work",
    title: "Attachment at Work",
    subtitle: "Understanding workplace attachment patterns can help us better understand our experiences at work; including performance, interpersonal dynamics and organizational culture.",
    note: "This section asks about the workplace attachment patterns that show up in your relationships at work, for example with supervisors, colleagues and in teams.",
    scaleLabels: SCALE_7,
    questions: [
      "It helps to turn to my coworkers when I need help.",
      "I talk things over with my coworkers.",
      "I'm afraid that all my coworkers will quit.",
      "I am concerned that my coworkers won't care about me as much as I care about them.",
      "I usually discuss the problems and concerns I have with my work with my coworkers.",
      "I often worry that my coworkers do not really care for me.",
      "I find it easy to depend on my coworkers.",
      "I don't feel comfortable opening up to my coworkers.",
      "I prefer not to show my coworkers how I feel deep down.",
    ],
    keys: ["secure", "secure", "anxious", "anxious", "secure", "anxious", "secure", "avoidant", "avoidant"],
  },
];

// Emotion Dysregulation (DERS-inspired subscales)
const EMOTION_SECTION = {
  id: "emotion",
  title: "Emotion Regulation",
  subtitle: "Emotion regulation is the ability to be aware of your emotions and to observe, modify, and adapt them to the situation you're in. Being capable of calming ourselves quickly means we spend less time drowning in negative emotions.",
  scaleLabels: SCALE_5_ER,
  questions: [
    "When I'm upset, I believe that I'll end up feeling very depressed.",
    "When I'm upset, I believe that there is nothing I can do to make myself feel better.",
    "When I'm upset, I start to feel very bad about myself.",
    "When I'm upset, I feel out of control.",
    "When I'm upset, I become irritated with myself for feeling that way.",
    "When I'm upset, my emotions feel overwhelming.",
    "When I'm upset, I believe that I will remain that way for a long time.",
    "When I'm upset, I have difficulty focusing on other things.",
    "When I'm upset, I have difficulty getting work done.",
    "When I'm upset, I feel ashamed of myself for feeling that way.",
    "When I'm upset, I have difficulty thinking about anything else.",
    "When I'm upset, my emotions feel overwhelming.",
    "When I'm upset, I believe that wallowing in it is all I can do.",
    "When I'm upset, I lose control over my behaviours.",
    "When I'm upset, it takes me a long time to feel better.",
    "When I'm upset, I have difficulty concentrating.",
  ],
  // Subscale mapping (0-indexed): strategies(0,1,6,12), nonacceptance(4,9), impulse(3,13), goals(7,8,10,15), clarity(2,5,11,14)
  subscales: {
    strategies: [0, 1, 6, 12],
    nonacceptance: [4, 9],
    impulse: [3, 13],
    goals: [7, 8, 10, 15],
    clarity: [2, 5, 11, 14],
  },
};

// Self-Esteem
const SELF_ESTEEM_SECTION = {
  id: "self_esteem",
  title: "Rosenberg Self-Esteem",
  subtitle: "Please indicate the extent to which you agree with the following statements that deal with your general feelings about yourself.",
  scaleLabels: SCALE_5_SE,
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
  reverseItems: [2, 4, 7, 8, 9],
};

// All sections in order
const ALL_SECTIONS = [
  ...ATTACHMENT_SECTIONS.map((s) => ({ ...s, type: "attachment" as const })),
  { ...EMOTION_SECTION, type: "emotion" as const, keys: [] as any[] },
  { ...SELF_ESTEEM_SECTION, type: "self_esteem" as const, keys: [] as any[] },
];

// ── Scoring ─────────────────────────────────────────────────

type StyleKey = "secure" | "anxious" | "avoidant" | "fearful_avoidant";

function levelLabel(score: number, max: number): string {
  const pct = score / max;
  if (pct >= 0.75) return "Very High";
  if (pct >= 0.55) return "High";
  if (pct >= 0.35) return "Medium";
  if (pct >= 0.15) return "Low";
  return "Very Low";
}

interface SectionResult {
  id: string;
  title: string;
  style: StyleKey;
  anxietyScore: number;
  avoidanceScore: number;
  anxietyLevel: string;
  avoidanceLevel: string;
}

interface EmotionResult {
  total: string; // Low / Medium / High
  subscales: Record<string, string>;
}

interface FullResult {
  primaryStyle: StyleKey;
  sections: SectionResult[];
  selfEsteem: number;
  selfEsteemLabel: string;
  selfLiking: string;
  selfCompetence: string;
  emotionRegulation: EmotionResult;
  stylePercentages: Record<string, number>;
}

function computeFullResult(answers: Record<string, number[]>): FullResult {
  // ── Attachment sections ──
  const sections: SectionResult[] = [];

  for (const sec of ATTACHMENT_SECTIONS) {
    const a = answers[sec.id] || [];
    const anxietyVals: number[] = [];
    const avoidanceVals: number[] = [];
    const secureVals: number[] = [];

    sec.questions.forEach((_, qi) => {
      const v = a[qi] ?? 3; // default to neutral
      if (sec.keys[qi] === "anxious") anxietyVals.push(v);
      else if (sec.keys[qi] === "avoidant") avoidanceVals.push(v);
      else secureVals.push(v);
    });

    const avgAnx = anxietyVals.length ? anxietyVals.reduce((s, v) => s + v, 0) / anxietyVals.length : 0;
    const avgAvd = avoidanceVals.length ? avoidanceVals.reduce((s, v) => s + v, 0) / avoidanceVals.length : 0;

    // Map 0-6 to 1-7 scale for display
    const anxScore = +(avgAnx + 1).toFixed(1);
    const avdScore = +(avgAvd + 1).toFixed(1);

    let style: StyleKey = "secure";
    if (anxScore >= 4 && avdScore >= 4) style = "fearful_avoidant";
    else if (avdScore >= 4) style = "avoidant";
    else if (anxScore >= 4) style = "anxious";

    sections.push({
      id: sec.id,
      title: sec.id === "mother" ? "Mother (CG1)" : sec.id === "father" ? "Father (CG2)" : sec.id === "partner" ? "Romantic" : sec.id === "work" ? "At Work" : "General",
      style,
      anxietyScore: anxScore,
      avoidanceScore: avdScore,
      anxietyLevel: levelLabel(anxScore, 7),
      avoidanceLevel: levelLabel(avdScore, 7),
    });
  }

  // Primary style from General section
  const general = sections.find((s) => s.id === "general")!;
  const primaryStyle = general.style;

  // Style percentages based on all sections
  const styleCounts: Record<StyleKey, number> = { secure: 0, anxious: 0, avoidant: 0, fearful_avoidant: 0 };
  sections.forEach((s) => styleCounts[s.style]++);
  const total = sections.length || 1;
  const stylePercentages = {
    secure: Math.round((styleCounts.secure / total) * 100),
    anxious: Math.round((styleCounts.anxious / total) * 100),
    avoidant: Math.round((styleCounts.avoidant / total) * 100),
    fearful_avoidant: Math.round((styleCounts.fearful_avoidant / total) * 100),
  };

  // ── Self-Esteem (Rosenberg, 0-30 scale) ──
  const seAnswers = answers["self_esteem"] || [];
  let selfEsteem = 0;
  const likingItems = [0, 1, 5, 6]; // positive self-worth items
  const compItems = [3]; // competence items
  let likingScore = 0, compScore = 0, likingCount = 0, compCount = 0;

  seAnswers.forEach((val, i) => {
    const score = SELF_ESTEEM_SECTION.reverseItems.includes(i) ? (4 - val) : val;
    selfEsteem += score;
    if (likingItems.includes(i)) { likingScore += score; likingCount++; }
    if (compItems.includes(i)) { compScore += score; compCount++; }
  });

  const selfEsteemLabel = selfEsteem >= 25 ? "High" : selfEsteem >= 15 ? "Normal" : "Low";
  const selfLiking = likingCount ? levelLabel(likingScore / likingCount, 4) : "Medium";
  const selfCompetence = compCount ? levelLabel(compScore / compCount, 4) : "Medium";

  // ── Emotion Dysregulation (DERS) ──
  const emAnswers = answers["emotion"] || [];
  const emTotal = emAnswers.reduce((s, v) => s + v, 0);
  const emMax = EMOTION_SECTION.questions.length * 4;
  const emLabel = emTotal >= emMax * 0.65 ? "High" : emTotal >= emMax * 0.35 ? "Medium" : "Low";

  const subscaleResults: Record<string, string> = {};
  for (const [name, indices] of Object.entries(EMOTION_SECTION.subscales)) {
    const vals = indices.map((i) => emAnswers[i] ?? 2);
    const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
    subscaleResults[name] = avg >= 3 ? "High" : avg >= 1.5 ? "Medium" : "Low";
  }

  return {
    primaryStyle,
    sections,
    selfEsteem,
    selfEsteemLabel,
    selfLiking,
    selfCompetence,
    emotionRegulation: { total: emLabel, subscales: subscaleResults },
    stylePercentages,
  };
}

// ── Rich Style Descriptions ─────────────────────────────────

const STYLE_INFO: Record<StyleKey, {
  label: string;
  color: string;
  bgColor: string;
  icon: any;
  summary: string;
  childhood: string;
  inRelationships: string;
  strengths: string[];
  challenges: string[];
  growthAreas: string[];
}> = {
  secure: {
    label: "Secure",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50 border-emerald-200",
    icon: Shield,
    summary: "You feel comfortable with intimacy and independence. You can depend on others and let them depend on you without anxiety about the relationship.",
    childhood: "Secure attachment typically develops when caregivers are consistently responsive, attuned, and emotionally available. The child learns that their needs will be met and that relationships are a source of safety and comfort.",
    inRelationships: "You tend to communicate openly, manage conflict constructively, and trust your partner. You're comfortable with closeness and can give your partner space without anxiety. You can regulate your emotions relatively well and repair ruptures in the relationship.",
    strengths: [
      "Comfortable with both closeness and independence",
      "Trust in self and others",
      "Effective communicator of needs and boundaries",
      "Resilient — can recover from relational setbacks",
      "Able to provide and receive emotional support",
    ],
    challenges: [
      "May struggle when partnered with someone highly insecure",
      "Can sometimes be unaware of deeper attachment wounds",
      "May find it hard to understand why others struggle with intimacy",
    ],
    growthAreas: [
      "Continue developing emotional vocabulary",
      "Practice holding space for partners with different attachment styles",
      "Maintain self-care and boundaries even when being relied upon",
    ],
  },
  anxious: {
    label: "Anxious (Preoccupied)",
    color: "text-amber-700",
    bgColor: "bg-amber-50 border-amber-200",
    icon: Heart,
    summary: "You have a strong desire for closeness and intimacy, but you often worry about whether others truly care about you. You may seek reassurance and be highly attuned to signs of rejection.",
    childhood: "Anxious attachment often develops when caregiving is inconsistent — sometimes warm and responsive, other times emotionally unavailable. The child learns that love is available but unpredictable, leading them to become hypervigilant about maintaining closeness.",
    inRelationships: "You tend to be deeply invested in relationships and may become preoccupied with your partner's availability and feelings. You're highly empathetic and emotionally perceptive, but may interpret ambiguous signals as rejection. You often seek proximity and reassurance.",
    strengths: [
      "Deep emotional capacity and empathy",
      "Highly attuned to others' emotional states",
      "Strong commitment to relationships",
      "Willingness to work on relationship issues",
      "Warm and caring partner when feeling secure",
    ],
    challenges: [
      "Tendency toward protest behaviours when feeling disconnected",
      "Difficulty self-soothing without external validation",
      "May compromise own needs to maintain closeness",
      "Sensitivity to perceived rejection or withdrawal",
      "Rumination about relationship security",
    ],
    growthAreas: [
      "Develop self-soothing and grounding practices",
      "Build tolerance for ambiguity in relationships",
      "Practice communicating needs directly rather than through protest",
      "Strengthen self-worth independent of relationships",
      "Learn to differentiate between real threats and triggered responses",
    ],
  },
  avoidant: {
    label: "Dismissive-Avoidant",
    color: "text-blue-700",
    bgColor: "bg-blue-50 border-blue-200",
    icon: Eye,
    summary: "You value independence and self-reliance highly. You tend to suppress emotional needs and may feel uncomfortable when others get too close or demand vulnerability.",
    childhood: "Avoidant attachment typically develops when caregivers are emotionally distant, dismissive of emotional needs, or reward self-sufficiency over emotional expression. The child learns that vulnerability is unsafe and that relying on others leads to disappointment.",
    inRelationships: "You crave independence, self-reliance, and a degree of emotional distance — especially when relationships feel intense or when partners demand greater intimacy. You may intellectualise emotions rather than feel them, and can appear emotionally unavailable even when you care deeply.",
    strengths: [
      "Strong sense of autonomy and self-reliance",
      "Calm under pressure — good at compartmentalising",
      "Independent problem-solving abilities",
      "Can offer stability and grounding to relationships",
      "Often highly capable and accomplished",
    ],
    challenges: [
      "Difficulty recognising and expressing emotional needs",
      "May withdraw or shut down during conflict",
      "Partners may feel emotionally starved",
      "Tendency to deactivate attachment needs under stress",
      "May idealise self-reliance at the expense of connection",
    ],
    growthAreas: [
      "Practice naming and sitting with emotions",
      "Gradually increase vulnerability with trusted people",
      "Notice when you're withdrawing and experiment with staying present",
      "Acknowledge that needing others is a strength, not a weakness",
      "Work on differentiation between healthy independence and emotional avoidance",
    ],
  },
  fearful_avoidant: {
    label: "Fearful-Avoidant (Disorganized)",
    color: "text-rose-700",
    bgColor: "bg-rose-50 border-rose-200",
    icon: Shuffle,
    summary: "You experience conflicting desires — wanting closeness but also fearing it. You may oscillate between pursuing and withdrawing from intimacy, sometimes within the same relationship.",
    childhood: "Fearful-avoidant attachment typically forms when the child perceives their source of safety (their primary caregiver) as simultaneously frightening. This creates an impossible bind: the person they need to go to for safety is also the source of fear. This pattern is also associated with trauma, loss, or abuse in the caregiving relationship.",
    inRelationships: "You may deeply desire connection but feel overwhelmed by the vulnerability it requires. You might push partners away when things feel too close, then feel abandoned when they withdraw. This push-pull dynamic can feel confusing both to you and your partners.",
    strengths: [
      "Capacity for deep self-awareness once healing begins",
      "High emotional sensitivity and perception",
      "Often creative, intuitive, and deeply empathetic",
      "Strong desire for authentic connection",
      "Resilience — having navigated complex relational patterns",
    ],
    challenges: [
      "Push-pull dynamics in relationships",
      "Difficulty trusting others' intentions",
      "Emotional flooding or dissociation under stress",
      "May recreate familiar relational patterns unconsciously",
      "Difficulty maintaining consistent emotional availability",
    ],
    growthAreas: [
      "Work with a therapist who understands attachment and trauma",
      "Develop a 'window of tolerance' for emotional intimacy",
      "Practice grounding techniques when feeling flooded",
      "Build a narrative around your childhood experiences",
      "Learn to recognise the difference between past patterns and present reality",
    ],
  },
};

const ER_SUBSCALE_LABELS: Record<string, string> = {
  strategies: "Access to Effective Strategies",
  nonacceptance: "Non-Acceptance of Emotions",
  impulse: "Impulse Control",
  goals: "Goal-Directed Behaviour",
  clarity: "Emotional Clarity",
};

// ── Component ───────────────────────────────────────────────

export default function AttachmentQuiz({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const [step, setStep] = useState<"intro" | "quiz" | "results">("intro");
  const [sectionIndex, setSectionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [result, setResult] = useState<FullResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const section = ALL_SECTIONS[sectionIndex];
  const totalSections = ALL_SECTIONS.length;

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
        if (data?.style_scores && data?.attachment_style) {
          // Reconstruct result from stored data
          const stored = data.style_scores as any;
          if (stored.sections) {
            setResult(stored as FullResult);
            setStep("results");
          }
        }
      });
  }, [user]);

  const handleAnswer = (questionIndex: number, value: number) => {
    haptic("light");
    setAnswers((prev) => {
      const arr = [...(prev[section.id] || [])];
      arr[questionIndex] = value;
      return { ...prev, [section.id]: arr };
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
      const res = computeFullResult(answers);
      setResult(res);
      saveResult(res);
      setStep("results");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const saveResult = async (res: FullResult) => {
    if (!user) return;
    setSaving(true);
    await supabase.from("attachment_quiz_results").insert({
      user_id: user.id,
      answers: answers as any,
      attachment_style: res.primaryStyle,
      style_scores: res as any, // store full result
      self_esteem_score: res.selfEsteem,
    });
    setSaving(false);
    toast.success("Held — your reflection is in your profile.");
  };

  const retakeQuiz = () => {
    setAnswers({});
    setSectionIndex(0);
    setResult(null);
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

          <h1 className="font-display text-2xl text-foreground text-center mb-3">Attachment Style Quiz</h1>
          <p className="text-sm text-muted-foreground text-center max-w-sm mb-6 leading-relaxed">
            Explore how your early experiences shaped the way you connect — with partners, parents, colleagues, and yourself.
          </p>

          <div className="w-full space-y-3 mb-6">
            {[
              { icon: Shield, title: "Secure", desc: "Comfortable with closeness and autonomy" },
              { icon: Heart, title: "Anxious (Preoccupied)", desc: "Strong desire for closeness, worry about rejection" },
              { icon: Eye, title: "Dismissive-Avoidant", desc: "Values independence, suppresses emotional needs" },
              { icon: Shuffle, title: "Fearful-Avoidant", desc: "Conflicting desires for closeness and distance" },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-4 p-3.5 rounded-2xl bg-card border border-border">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="w-full bg-card border border-border rounded-2xl p-4 mb-6">
            <p className="text-xs font-semibold text-foreground mb-2">What this quiz measures:</p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>• Attachment patterns with each caregiver</li>
              <li>• Romantic attachment style</li>
              <li>• General interpersonal attachment</li>
              <li>• Attachment at work</li>
              <li>• Emotion regulation capacity</li>
              <li>• Rosenberg Self-Esteem</li>
            </ul>
          </div>

          <p className="text-xs text-muted-foreground/60 text-center mb-6">
            {totalSections} sections · {ALL_SECTIONS.reduce((a, s) => a + s.questions.length, 0)} questions · ~8 minutes
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
    const info = STYLE_INFO[result.primaryStyle];
    const Icon = info.icon;

    return (
      <div className="min-h-screen pb-24 px-6">
        <div className="flex flex-col pt-8 max-w-md mx-auto">
          <button onClick={onBack} className="self-start flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Connect
          </button>

          {/* Primary result */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl border p-6 mb-6 ${info.bgColor}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-full bg-background/80 flex items-center justify-center">
                <Icon className={`w-7 h-7 ${info.color}`} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Your General Attachment Style</p>
                <h2 className={`font-display text-xl ${info.color}`}>{info.label}</h2>
              </div>
            </div>
            <p className="text-sm text-foreground leading-relaxed">{info.summary}</p>
          </motion.div>

          {/* Per-section scores */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-card border border-border rounded-2xl p-5 mb-4"
          >
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Comparing Your Attachment Scores</p>
            <div className="space-y-3">
              {result.sections.map((sec) => {
                const secInfo = STYLE_INFO[sec.style];
                return (
                  <div key={sec.id} className="flex items-center justify-between">
                    <span className="text-sm text-foreground font-medium w-20">{sec.title}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${secInfo.bgColor} ${secInfo.color}`}>
                      {secInfo.label.split(" ")[0]}
                    </span>
                    <div className="flex gap-3 text-[10px] text-muted-foreground">
                      <span>Anx: {sec.anxietyScore}</span>
                      <span>Avd: {sec.avoidanceScore}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Childhood Origins */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-card border border-border rounded-2xl p-5 mb-4"
          >
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">How This Style Forms</p>
            <p className="text-sm text-foreground leading-relaxed">{info.childhood}</p>
          </motion.div>

          {/* In Relationships */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-border rounded-2xl p-5 mb-4"
          >
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">In Your Relationships</p>
            <p className="text-sm text-foreground leading-relaxed">{info.inRelationships}</p>
          </motion.div>

          {/* Strengths & Challenges */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="grid grid-cols-1 gap-4 mb-4"
          >
            <div className="bg-card border border-border rounded-2xl p-5">
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-3">Your Strengths</p>
              <ul className="space-y-2">
                {info.strengths.map((s) => (
                  <li key={s} className="flex items-start gap-2 text-sm text-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-card border border-border rounded-2xl p-5">
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-3">Challenges to Be Aware Of</p>
              <ul className="space-y-2">
                {info.challenges.map((c) => (
                  <li key={c} className="flex items-start gap-2 text-sm text-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-card border border-border rounded-2xl p-5">
              <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">Growth Areas</p>
              <ul className="space-y-2">
                {info.growthAreas.map((g) => (
                  <li key={g} className="flex items-start gap-2 text-sm text-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    {g}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Self-Esteem */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card border border-border rounded-2xl p-5 mb-4"
          >
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Self-Esteem (Rosenberg)</p>
            <div className="flex items-end gap-2 mb-3">
              <span className="text-3xl font-bold text-foreground">{result.selfEsteem}</span>
              <span className="text-sm text-muted-foreground mb-1">/ 30</span>
              <span className={`ml-auto text-sm font-medium ${
                result.selfEsteemLabel === "High" ? "text-emerald-600" : result.selfEsteemLabel === "Normal" ? "text-foreground" : "text-amber-600"
              }`}>
                {result.selfEsteemLabel}
              </span>
            </div>
            <div className="flex gap-4 text-xs">
              <div className="flex-1 bg-muted rounded-xl p-3 text-center">
                <p className="text-muted-foreground mb-0.5">Self-Liking</p>
                <p className="font-semibold text-foreground">{result.selfLiking}</p>
              </div>
              <div className="flex-1 bg-muted rounded-xl p-3 text-center">
                <p className="text-muted-foreground mb-0.5">Self-Competence</p>
                <p className="font-semibold text-foreground">{result.selfCompetence}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
              Self-esteem affects our decision-making, mental health, and overall well-being. It also shapes how we feel and act in relationships, and our internal drive to handle challenges and pursue personal growth.
            </p>
          </motion.div>

          {/* Emotion Regulation */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-card border border-border rounded-2xl p-5 mb-8"
          >
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Emotion Regulation</p>
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-foreground">
                {result.emotionRegulation.total === "High" ? "High Challenges" : result.emotionRegulation.total === "Medium" ? "Medium Challenges" : "Low Challenges"}
              </span>
              <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${
                result.emotionRegulation.total === "High" ? "bg-rose-50 text-rose-700 border border-rose-200" :
                result.emotionRegulation.total === "Medium" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                "bg-emerald-50 text-emerald-700 border border-emerald-200"
              }`}>
                {result.emotionRegulation.total}
              </span>
            </div>
            <div className="space-y-2">
              {Object.entries(result.emotionRegulation.subscales).map(([key, level]) => (
                <div key={key} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{ER_SUBSCALE_LABELS[key] || key}</span>
                  <span className={`font-medium ${
                    level === "High" ? "text-rose-600" : level === "Medium" ? "text-amber-600" : "text-emerald-600"
                  }`}>{level}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
              Emotion regulation is your ability to be aware of emotions and adapt them to situations. Being capable of calming yourself quickly means less time drowning in negative emotions, which supports your relationships and personal goals.
            </p>
          </motion.div>

          {/* Expanded per-section details */}
          <div className="space-y-3 mb-8">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Detailed Section Results</p>
            {result.sections.map((sec) => {
              const secInfo = STYLE_INFO[sec.style];
              const isOpen = expandedSection === sec.id;
              return (
                <div key={sec.id} className="bg-card border border-border rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setExpandedSection(isOpen ? null : sec.id)}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{sec.title}</p>
                      <p className={`text-xs ${secInfo.color}`}>{secInfo.label}</p>
                    </div>
                    <ArrowRight className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-90" : ""}`} />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 space-y-2 border-t border-border pt-3">
                      <div className="flex gap-4 text-xs">
                        <div className="flex-1 bg-muted rounded-lg p-2.5 text-center">
                          <p className="text-muted-foreground">Anxiety</p>
                          <p className="font-bold text-foreground">{sec.anxietyScore}</p>
                          <p className="text-[10px] text-muted-foreground">{sec.anxietyLevel}</p>
                        </div>
                        <div className="flex-1 bg-muted rounded-lg p-2.5 text-center">
                          <p className="text-muted-foreground">Avoidance</p>
                          <p className="font-bold text-foreground">{sec.avoidanceScore}</p>
                          <p className="text-[10px] text-muted-foreground">{sec.avoidanceLevel}</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-2">
                        {secInfo.summary}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button onClick={retakeQuiz} className="w-full border border-border text-foreground py-3 rounded-full text-sm font-medium mb-3">
            Retake Quiz
          </button>
          <button onClick={onBack} className="w-full bg-primary text-primary-foreground py-3.5 rounded-full text-sm font-semibold mb-6">
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
            {ALL_SECTIONS.map((_, i) => (
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

        <AnimatePresence mode="wait">
          <motion.div
            key={section.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="font-display text-lg text-foreground mb-2">{section.title}</h2>
            <p className="text-xs text-muted-foreground mb-1 leading-relaxed">{section.subtitle}</p>
            {"note" in section && section.note && (
              <p className="text-[11px] text-muted-foreground/60 italic mb-6">{section.note}</p>
            )}

            <div className="space-y-5">
              {section.questions.map((q, qi) => {
                const currentVal = (answers[section.id] || [])[qi];
                return (
                  <div key={qi} className="bg-card border border-border rounded-2xl p-4">
                    <p className="text-[10px] text-muted-foreground mb-1">{qi + 1} of {section.questions.length} questions</p>
                    <p className="text-sm font-medium text-foreground mb-3">{q}</p>
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

            <button
              onClick={handleNext}
              disabled={!sectionComplete()}
              className="w-full bg-primary text-primary-foreground py-3.5 rounded-full text-sm font-semibold mt-8 disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {sectionIndex === totalSections - 1 ? "See My Results" : "Continue"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
