import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Heart, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { haptic } from "@/hooks/use-mobile";

type Lang = "words" | "time" | "gifts" | "service" | "touch";

interface QuizPair {
  a: { text: string; lang: Lang };
  b: { text: string; lang: Lang };
}

const QUIZ_PAIRS: QuizPair[] = [
  { a: { text: "I feel loved when someone compliments me.", lang: "words" }, b: { text: "I feel loved when someone helps me with tasks.", lang: "service" } },
  { a: { text: "I feel loved when someone spends time with me.", lang: "time" }, b: { text: "I feel loved when someone gives me a thoughtful gift.", lang: "gifts" } },
  { a: { text: "I feel loved when someone hugs or touches me affectionately.", lang: "touch" }, b: { text: "I feel loved when someone praises my accomplishments.", lang: "words" } },
  { a: { text: "I feel loved when someone listens to me attentively.", lang: "time" }, b: { text: "I feel loved when someone surprises me with a small gift.", lang: "gifts" } },
  { a: { text: "I feel loved when someone does something kind for me.", lang: "service" }, b: { text: "I feel loved when someone holds my hand or cuddles with me.", lang: "touch" } },
  { a: { text: "I feel loved when someone writes me a heartfelt note or message.", lang: "words" }, b: { text: "I feel loved when someone makes time for me in their schedule.", lang: "time" } },
  { a: { text: "I feel loved when someone gives me a meaningful present.", lang: "gifts" }, b: { text: "I feel loved when someone does something for me without being asked.", lang: "service" } },
  { a: { text: "I feel loved when someone kisses or caresses me.", lang: "touch" }, b: { text: "I feel loved when someone tells me how much they appreciate me.", lang: "words" } },
  { a: { text: "I feel loved when someone spends quality time with me, without distractions.", lang: "time" }, b: { text: "I feel loved when someone gives me a token of their affection.", lang: "gifts" } },
  { a: { text: "I feel loved when someone helps me out when I am overwhelmed.", lang: "service" }, b: { text: "I feel loved when someone hugs me tightly.", lang: "touch" } },
  { a: { text: "I feel loved when someone speaks kindly and encouragingly to me.", lang: "words" }, b: { text: "I feel loved when someone takes time to understand my feelings.", lang: "time" } },
  { a: { text: "I feel loved when someone surprises me with a gift.", lang: "gifts" }, b: { text: "I feel loved when someone goes out of their way to help me.", lang: "service" } },
  { a: { text: "I feel loved when someone shows physical affection toward me.", lang: "touch" }, b: { text: "I feel loved when someone tells me they are proud of me.", lang: "words" } },
  { a: { text: "I feel loved when someone is fully present and engaged with me.", lang: "time" }, b: { text: "I feel loved when someone buys me something special.", lang: "gifts" } },
  { a: { text: "I feel loved when someone helps me with chores or errands.", lang: "service" }, b: { text: "I feel loved when someone embraces me warmly.", lang: "touch" } },
  { a: { text: "I feel loved when someone says 'I love you' or 'I appreciate you.'", lang: "words" }, b: { text: "I feel loved when someone plans a special outing just for us.", lang: "time" } },
  { a: { text: "I feel loved when someone brings me a souvenir or memento.", lang: "gifts" }, b: { text: "I feel loved when someone takes care of something I've been dreading.", lang: "service" } },
  { a: { text: "I feel loved when someone rubs my back or shoulders.", lang: "touch" }, b: { text: "I feel loved when someone leaves me an encouraging voicemail or text.", lang: "words" } },
  { a: { text: "I feel loved when someone gives me their undivided attention.", lang: "time" }, b: { text: "I feel loved when someone picks out the perfect gift for me.", lang: "gifts" } },
  { a: { text: "I feel loved when someone anticipates my needs and acts on them.", lang: "service" }, b: { text: "I feel loved when someone sits close to me or puts their arm around me.", lang: "touch" } },
  { a: { text: "I feel loved when someone encourages me with supportive words.", lang: "words" }, b: { text: "I feel loved when someone cooks a meal or makes something for me.", lang: "service" } },
  { a: { text: "I feel loved when someone takes a walk or does an activity with me.", lang: "time" }, b: { text: "I feel loved when someone strokes my hair or face gently.", lang: "touch" } },
  { a: { text: "I feel loved when someone remembers special occasions with a gift.", lang: "gifts" }, b: { text: "I feel loved when someone validates my emotions verbally.", lang: "words" } },
  { a: { text: "I feel loved when someone runs an errand I haven't had time for.", lang: "service" }, b: { text: "I feel loved when someone makes eye contact and really listens.", lang: "time" } },
  { a: { text: "I feel loved when someone playfully touches or tickles me.", lang: "touch" }, b: { text: "I feel loved when someone gives me flowers or a small token.", lang: "gifts" } },
  { a: { text: "I feel loved when someone texts me sweet things during the day.", lang: "words" }, b: { text: "I feel loved when someone holds me when I'm feeling down.", lang: "touch" } },
  { a: { text: "I feel loved when someone plans a date or quality hangout.", lang: "time" }, b: { text: "I feel loved when someone fixes something that's broken for me.", lang: "service" } },
  { a: { text: "I feel loved when someone wraps a gift beautifully for me.", lang: "gifts" }, b: { text: "I feel loved when someone shares a heartfelt compliment.", lang: "words" } },
  { a: { text: "I feel loved when someone does the dishes or cleans up.", lang: "service" }, b: { text: "I feel loved when someone dances with me or pulls me close.", lang: "touch" } },
  { a: { text: "I feel loved when someone puts away their phone to be with me.", lang: "time" }, b: { text: "I feel loved when someone surprises me with my favourite treat.", lang: "gifts" } },
];

const LANG_LABELS: Record<Lang, string> = {
  words: "Words of Affirmation",
  time: "Quality Time",
  gifts: "Receiving Gifts",
  service: "Acts of Service",
  touch: "Physical Touch",
};

const LANG_EMOJI: Record<Lang, string> = {
  words: "💬",
  time: "⏳",
  gifts: "🎁",
  service: "🤝",
  touch: "🤗",
};

const LANG_DESCRIPTIONS: Record<Lang, { summary: string; inRelationships: string; tips: string[] }> = {
  words: {
    summary: "You thrive on verbal encouragement, compliments, and hearing 'I love you.' Spoken or written words carry deep meaning for you — they can build you up or tear you down more than anything else.",
    inRelationships: "You feel most connected when your partner expresses love, gratitude, and admiration through words. Criticism or harsh language can feel deeply wounding. You value thoughtful texts, love notes, and genuine verbal affection.",
    tips: ["Leave sticky notes with kind messages", "Say 'I love you' and 'I appreciate you' often", "Send encouraging texts during the day", "Give specific compliments about character, not just appearance"],
  },
  time: {
    summary: "Nothing says 'I love you' like undivided attention. You feel most loved when someone is fully present — phone down, eyes on you, genuinely engaged in what you're sharing.",
    inRelationships: "Distractions, postponed plans, or a partner who seems emotionally absent can make you feel unloved. You crave meaningful one-on-one time — it doesn't have to be elaborate, just intentional.",
    tips: ["Schedule regular date nights or quality hangouts", "Put phones away during meals together", "Take walks or do shared activities", "Be fully present during conversations"],
  },
  gifts: {
    summary: "Gifts are visual symbols of love to you. It's not about materialism — it's about the thought, effort, and intention behind the gift. A well-chosen present shows someone truly knows you.",
    inRelationships: "You treasure thoughtful gestures: a souvenir from a trip, flowers 'just because,' or a meaningful birthday gift. A forgotten occasion or thoughtless gift can feel like a lack of care. It's the symbolism that matters.",
    tips: ["Keep a running list of things they mention wanting", "Surprise them with small, thoughtful tokens", "Remember and celebrate special occasions", "The cost doesn't matter — the thoughtfulness does"],
  },
  service: {
    summary: "Actions speak louder than words for you. When someone eases your burden — doing the dishes, running an errand, fixing something — it communicates love in a powerful way.",
    inRelationships: "You feel cherished when your partner helps without being asked. Laziness, broken commitments, or creating more work for you can feel deeply hurtful. You value reliability and initiative.",
    tips: ["Help with tasks without being asked", "Take something off their to-do list", "Cook a meal or handle a chore they dislike", "Follow through on promises and commitments"],
  },
  touch: {
    summary: "Physical closeness is how you feel most connected. Hugs, hand-holding, a reassuring touch on the shoulder — these simple gestures make you feel safe, loved, and emotionally grounded.",
    inRelationships: "Physical presence and accessibility are crucial for you. A long period without physical affection can leave you feeling distant. You feel most secure with regular, warm physical connection — not just intimacy, but everyday touch.",
    tips: ["Hold hands while walking or watching TV", "Give long, meaningful hugs", "Sit close together on the couch", "Offer back rubs or gentle physical comfort"],
  },
};

const ITEMS_PER_PAGE = 5;

export default function LoveLanguagesQuiz({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [answers, setAnswers] = useState<Record<number, "a" | "b">>({});
  const [page, setPage] = useState(0);
  const [result, setResult] = useState<{ scores: Record<Lang, number>; primary: Lang; secondary: Lang } | null>(null);
  const [saving, setSaving] = useState(false);

  const totalPages = Math.ceil(QUIZ_PAIRS.length / ITEMS_PER_PAGE);
  const startIdx = page * ITEMS_PER_PAGE;
  const currentPairs = QUIZ_PAIRS.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  const allAnswered = QUIZ_PAIRS.every((_, i) => answers[i] !== undefined);
  const pageAllAnswered = currentPairs.every((_, i) => answers[startIdx + i] !== undefined);

  // Load previous result
  useEffect(() => {
    if (!user) return;
    supabase
      .from("attachment_quiz_results")
      .select("*")
      .eq("user_id", user.id)
      .not("style_scores", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data?.[0]?.style_scores) {
          const raw = data[0].style_scores as Record<string, unknown>;
          if (raw._quiz_type === "love_languages" && raw.scores) {
            const scores = raw.scores as Record<Lang, number>;
            const sorted = (Object.entries(scores) as [Lang, number][]).sort((a, b) => b[1] - a[1]);
            setResult({ scores, primary: sorted[0][0], secondary: sorted[1][0] });
          }
        }
      });
  }, [user]);

  function computeResult() {
    const scores: Record<Lang, number> = { words: 0, time: 0, gifts: 0, service: 0, touch: 0 };
    QUIZ_PAIRS.forEach((pair, i) => {
      const choice = answers[i];
      if (choice) scores[pair[choice].lang]++;
    });
    const sorted = (Object.entries(scores) as [Lang, number][]).sort((a, b) => b[1] - a[1]);
    return { scores, primary: sorted[0][0], secondary: sorted[1][0] };
  }

  async function handleSubmit() {
    if (!allAnswered || !user) return;
    setSaving(true);
    haptic("medium");
    const res = computeResult();
    setResult(res);

    await supabase.from("attachment_quiz_results").insert([{
      user_id: user.id,
      answers: JSON.parse(JSON.stringify(answers)),
      attachment_style: `love_language_${res.primary}`,
      style_scores: JSON.parse(JSON.stringify({ _quiz_type: "love_languages", scores: res.scores, primary: res.primary, secondary: res.secondary })),
      self_esteem_score: null,
    }]);

    setSaving(false);
    toast.success("Held — your Love Languages are in your profile.");
  }

  // ═══ RESULTS ═══
  if (result) {
    const primary = result.primary;
    const secondary = result.secondary;
    const maxScore = Math.max(...Object.values(result.scores));

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen pb-24 px-5 pt-6"
      >
        <button onClick={onClose} className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Connect
        </button>

        <div className="text-center mb-8">
          <div className="text-5xl mb-3">{LANG_EMOJI[primary]}</div>
          <h2 className="font-display text-2xl text-foreground mb-1">Your Love Language</h2>
          <p className="text-lg font-semibold text-primary">{LANG_LABELS[primary]}</p>
          <p className="text-xs text-muted-foreground mt-1">Secondary: {LANG_LABELS[secondary]}</p>
        </div>

        {/* Score bars */}
        <div className="space-y-3 mb-8">
          {(Object.entries(result.scores) as [Lang, number][])
            .sort((a, b) => b[1] - a[1])
            .map(([lang, score]) => (
              <div key={lang} className="flex items-center gap-3">
                <span className="text-lg w-7 text-center">{LANG_EMOJI[lang]}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className={lang === primary ? "font-semibold text-foreground" : "text-muted-foreground"}>
                      {LANG_LABELS[lang]}
                    </span>
                    <span className="text-muted-foreground">{score}/{QUIZ_PAIRS.length / 2 + 1}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(score / maxScore) * 100}%` }}
                      transition={{ delay: 0.2, duration: 0.6 }}
                      className={`h-full rounded-full ${lang === primary ? "bg-primary" : "bg-primary/40"}`}
                    />
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* Primary detail */}
        <div className="rounded-2xl bg-card border border-border p-5 mb-4">
          <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" /> {LANG_LABELS[primary]}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">{LANG_DESCRIPTIONS[primary].summary}</p>
          <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">In Relationships</h4>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">{LANG_DESCRIPTIONS[primary].inRelationships}</p>
          <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">How to speak this language</h4>
          <ul className="space-y-1.5">
            {LANG_DESCRIPTIONS[primary].tips.map((tip) => (
              <li key={tip} className="text-sm text-muted-foreground flex items-start gap-2">
                <Heart className="w-3 h-3 text-primary mt-1 shrink-0" /> {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Secondary detail */}
        <div className="rounded-2xl bg-card border border-border p-5 mb-8">
          <h3 className="font-semibold text-foreground mb-2">{LANG_EMOJI[secondary]} {LANG_LABELS[secondary]} <span className="text-xs text-muted-foreground font-normal">(secondary)</span></h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">{LANG_DESCRIPTIONS[secondary].summary}</p>
          <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">How to speak this language</h4>
          <ul className="space-y-1.5">
            {LANG_DESCRIPTIONS[secondary].tips.map((tip) => (
              <li key={tip} className="text-sm text-muted-foreground flex items-start gap-2">
                <Heart className="w-3 h-3 text-primary/60 mt-1 shrink-0" /> {tip}
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={() => { setResult(null); setAnswers({}); setPage(0); }}
          className="w-full py-3 rounded-full border border-border text-sm text-muted-foreground"
        >
          Retake Quiz
        </button>
      </motion.div>
    );
  }

  // ═══ QUIZ ═══
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pb-24 px-5 pt-6"
    >
      <button onClick={onClose} className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Connect
      </button>

      <h2 className="font-display text-2xl text-foreground mb-1">Love Languages Test</h2>
      <p className="text-sm text-muted-foreground mb-6">Choose the option that resonates most with you.</p>

      {/* Progress */}
      <div className="flex gap-1 mb-8">
        {Array.from({ length: totalPages }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${i <= page ? "bg-primary" : "bg-muted"}`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          {currentPairs.map((pair, localIdx) => {
            const idx = startIdx + localIdx;
            return (
              <div key={idx} className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Choose your preferred option:</p>
                {(["a", "b"] as const).map((choice) => (
                  <button
                    key={choice}
                    onClick={() => {
                      haptic("light");
                      setAnswers((prev) => ({ ...prev, [idx]: choice }));
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border text-sm transition-all ${
                      answers[idx] === choice
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    <span className="text-muted-foreground mr-2">{choice}.</span>
                    {pair[choice].text}
                  </button>
                ))}
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-3 mt-8">
        {page > 0 && (
          <button
            onClick={() => setPage((p) => p - 1)}
            className="flex-1 py-3 rounded-full border border-border text-sm text-muted-foreground"
          >
            Previous
          </button>
        )}
        {page < totalPages - 1 ? (
          <button
            onClick={() => pageAllAnswered && setPage((p) => p + 1)}
            disabled={!pageAllAnswered}
            className="flex-1 py-3 rounded-full bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 flex items-center justify-center gap-2"
          >
            Next <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!allAnswered || saving}
            className="flex-1 py-3 rounded-full bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40"
          >
            {saving ? "Saving..." : "See My Results"}
          </button>
        )}
      </div>
    </motion.div>
  );
}
