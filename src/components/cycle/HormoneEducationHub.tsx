import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, BookOpen } from "lucide-react";
import { haptic } from "@/hooks/use-mobile";

interface HormoneCard {
  name: string;
  colour: string;
  tint: string;
  summary: string;
  detail: string;
  source: string;
}

interface TopicCard {
  title: string;
  colour: string;
  tint: string;
  summary: string;
  detail: string;
  source: string;
}

const HORMONES: HormoneCard[] = [
  {
    name: "Oestrogen",
    colour: "#7F5B87",
    tint: "rgba(127, 91, 135, 0.06)",
    summary: "The builder. Supports muscle, bone, mood, memory, and heart health.",
    detail: "Rising in follicular, peaks at ovulation, drops in luteal and menopause. Oestrogen is the hormone most responsible for the 'good weeks' of your cycle — it boosts serotonin, supports collagen production, and sharpens cognitive function. Its decline in perimenopause and menopause is behind many of the symptoms women experience.",
    source: "Sims — Roar; Haver — The New Menopause",
  },
  {
    name: "Progesterone",
    colour: "#9B89B4",
    tint: "rgba(155, 137, 180, 0.06)",
    summary: "The settler — when balanced. Rises in luteal phase.",
    detail: "Can cause fatigue, bloating, and sleep disruption when dominant. Progesterone is your body's calming hormone — it promotes sleep and reduces anxiety when in balance. But in the second half of your cycle, high progesterone raises core temperature, increases perceived exertion during exercise, and accelerates protein breakdown. This is why you feel more hungry and more tired.",
    source: "Vitti — In the Flo; Sims — Roar",
  },
  {
    name: "Testosterone",
    colour: "#C4876B",
    tint: "rgba(196, 135, 107, 0.06)",
    summary: "Yes, women have it. Brief surge at ovulation drives confidence, libido, and strength.",
    detail: "Testosterone declines with age in women just as it does in men, though from a much lower baseline. Around ovulation, a small testosterone spike is partly responsible for increased confidence, motivation, and physical performance. Strength training — particularly heavy compound lifts — supports healthy testosterone levels throughout life.",
    source: "Sims — Next Level; Vitti — In the Flo",
  },
  {
    name: "Cortisol",
    colour: "#D4A84B",
    tint: "rgba(212, 168, 75, 0.06)",
    summary: "The stress hormone. Chronically elevated cortisol disrupts the entire hormonal cascade.",
    detail: "Sleep, rest, and stress management are hormonal interventions — not luxuries. When cortisol stays elevated, it suppresses oestrogen and progesterone production, disrupts ovulation, and can contribute to hypothalamic amenorrhea. Your nervous system state directly shapes your hormonal health.",
    source: "Cabeca — The Hormone Fix",
  },
  {
    name: "Insulin",
    colour: "#6B8DA6",
    tint: "rgba(107, 141, 166, 0.06)",
    summary: "Blood sugar directly affects hormonal balance.",
    detail: "Oestrogen improves insulin sensitivity in the follicular phase — this is why lighter eating feels natural early in your cycle. Progesterone reduces insulin sensitivity in the luteal phase — this is why carb cravings are real and hormonally driven, not a willpower failure. Balancing blood sugar with protein, fibre, and complex carbs supports every other hormone in the cascade.",
    source: "Shah — Hormone Havoc; Inchauspé — Glucose Revolution",
  },
];

const DEEP_DIVE_TOPICS: TopicCard[] = [
  {
    title: "Hypothalamic Amenorrhea",
    colour: "#C4526E",
    tint: "rgba(196, 82, 110, 0.06)",
    summary: "When your period disappears — it's your body's way of telling you something important.",
    detail: "Hypothalamic amenorrhea (HA) occurs when the brain's hypothalamus slows or stops releasing GnRH, shutting down the menstrual cycle. The three most common triggers are under-eating, over-exercising, and chronic stress — often in combination. Recovery requires addressing the root cause: increasing caloric intake, reducing exercise intensity, and managing stress. It is not a diagnosis of exclusion — it's a signal that your body needs more fuel and rest. Many women recover their cycles within 3–6 months of making changes.",
    source: "Rinaldi — No Period. Now What?",
  },
  {
    title: "Living in Your Flo",
    colour: "#5C4A9E",
    tint: "rgba(92, 74, 158, 0.06)",
    summary: "Syncing your life to your cycle — food, movement, work, and relationships.",
    detail: "The cycle syncing method maps your energy, creativity, and social needs to each phase. During menstruation, prioritise rest and reflection. In the follicular phase, initiate new projects and try new workouts. Ovulation is your social and creative peak — schedule presentations, dates, and high-intensity training. The luteal phase calls for wrapping up tasks, nesting, and strength-based exercise. This isn't about restriction — it's about working with your biology instead of against it.",
    source: "Vitti — In the Flo",
  },
  {
    title: "Fertility Awareness",
    colour: "#C47A8A",
    tint: "rgba(196, 122, 138, 0.06)",
    summary: "Understanding your fertile window through body literacy.",
    detail: "Your fertile window is approximately 6 days per cycle — the 5 days before ovulation and ovulation day itself. Tracking cervical fluid (from dry to sticky to creamy to clear/stretchy), basal body temperature, and cervix position gives you a reliable picture of where you are in your cycle. BBT rises 0.2–0.5°C after ovulation and stays elevated through the luteal phase. These signs, combined with cycle length tracking, form the basis of the fertility awareness method — useful whether you're trying to conceive or simply understand your body better.",
    source: "Sekhon — The Lucky Egg",
  },
  {
    title: "The Hormone Fix",
    colour: "#D4A84B",
    tint: "rgba(212, 168, 75, 0.06)",
    summary: "A keto-green approach to hormonal balance, especially around menopause.",
    detail: "Dr. Cabeca's approach combines alkaline eating with ketogenic principles — focusing on nutrient-dense greens, healthy fats, and adequate protein while maintaining an alkaline urinary pH. The protocol addresses the metabolic shifts that happen as oestrogen declines: increased insulin resistance, cortisol sensitivity, and inflammatory markers. Key pillars include intermittent fasting (starting with a 12-hour window), stress resilience practices, and targeted supplementation including maca, DIM, and omega-3s. The goal is metabolic flexibility — the ability to burn both glucose and fat efficiently.",
    source: "Cabeca — The Hormone Fix",
  },
  {
    title: "Perimenopause & What to Expect",
    colour: "#9B89B4",
    tint: "rgba(155, 137, 180, 0.06)",
    summary: "The transition can start in your late 30s and last 4–10 years.",
    detail: "Perimenopause begins when ovarian function starts to fluctuate — often years before periods actually stop. Symptoms include irregular cycles, heavier or lighter periods, hot flushes, night sweats, sleep disruption, mood changes, brain fog, joint pain, and changes in body composition. Progesterone drops first, leading to oestrogen dominance in early perimenopause. Later, oestrogen also declines. Strength training becomes essential for maintaining bone density, muscle mass, and metabolic health. Protein needs increase to 1.2–1.6g per kg of bodyweight. Sleep hygiene, stress management, and targeted nutrition are your most powerful tools.",
    source: "Haver — The New Menopause; Gunter — The Menopause Manifesto",
  },
  {
    title: "Post-Menopause Strength",
    colour: "#6B8DA6",
    tint: "rgba(107, 141, 166, 0.06)",
    summary: "Menopause is not the end — it's the beginning of a powerful new chapter.",
    detail: "After menopause (12 consecutive months without a period), your hormonal landscape stabilises at new baselines. The focus shifts to maintaining what you've built: bone density through resistance training and impact exercise, muscle mass through adequate protein (aim for 30g+ per meal), cardiovascular health through Zone 2 training, and cognitive function through continued learning and social connection. HRT remains an option for many women and should be discussed with a knowledgeable provider. The evidence supports its use for symptom relief and long-term health when started within 10 years of menopause onset.",
    source: "Gunter — The Menopause Manifesto; Haver — The New Menopause",
  },
  {
    title: "Hormone Havoc & Gut Health",
    colour: "#7F5B87",
    tint: "rgba(127, 91, 135, 0.06)",
    summary: "Your gut microbiome directly influences oestrogen metabolism.",
    detail: "The estrobolome — a collection of gut bacteria — produces an enzyme called beta-glucuronidase that determines how much oestrogen is recycled vs. excreted. Poor gut health can lead to either oestrogen excess or deficiency. Supporting your microbiome through diverse plant foods (aim for 30+ different plants per week), fermented foods, adequate fibre, and minimising ultra-processed foods directly supports hormonal balance. Chronic inflammation from gut dysbiosis can also drive cortisol elevation, creating a feedback loop that disrupts the entire hormonal cascade.",
    source: "Shah — Hormone Havoc",
  },
];

export default function HormoneEducationHub() {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [expandedTopicIdx, setExpandedTopicIdx] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <BookOpen className="h-4 w-4 text-primary" />
        <p className="font-display text-base italic text-foreground">understanding your hormones</p>
      </div>

      {/* Colour legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-1">
        {HORMONES.map((h) => (
          <div key={h.name} className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: h.colour }} />
            <span
              className="font-body uppercase"
              style={{
                fontSize: 'var(--label-size)',
                letterSpacing: 'var(--label-tracking)',
                color: 'hsl(var(--label-color))',
              }}
            >
              {h.name}
            </span>
          </div>
        ))}
      </div>

      {HORMONES.map((h, i) => {
        const isExpanded = expandedIdx === i;
        return (
          <motion.div
            key={h.name}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="card-warm overflow-hidden"
            style={{
              backgroundColor: isExpanded ? h.tint : undefined,
              transition: 'background-color 0.3s ease',
            }}
          >
            <button
              onClick={() => { haptic("light"); setExpandedIdx(isExpanded ? null : i); }}
              className="touch-btn w-full p-4 text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: h.colour }} />
                  <span className="font-display text-sm italic text-foreground">{h.name}</span>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <p className="font-body text-xs text-muted-foreground mt-1.5 leading-relaxed">{h.summary}</p>
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 pt-0 border-t" style={{ borderColor: `${h.colour}20` }}>
                    <p className="font-body text-xs text-foreground/80 leading-relaxed mt-3">{h.detail}</p>
                    <p className="font-hand text-[10px] text-muted-foreground mt-2">— {h.source}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      {/* Deep dive topics */}
      <div className="pt-6">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="h-4 w-4 text-primary" />
          <p className="font-display text-base italic text-foreground">deep dives</p>
        </div>

        {DEEP_DIVE_TOPICS.map((t, i) => {
          const isExpanded = expandedTopicIdx === i;
          return (
            <motion.div
              key={t.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card-warm overflow-hidden mb-2"
              style={{
                backgroundColor: isExpanded ? t.tint : undefined,
                transition: 'background-color 0.3s ease',
              }}
            >
              <button
                onClick={() => { haptic("light"); setExpandedTopicIdx(isExpanded ? null : i); }}
                className="touch-btn w-full p-4 text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: t.colour }} />
                    <span className="font-display text-sm italic text-foreground">{t.title}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <p className="font-body text-xs text-muted-foreground mt-1.5 leading-relaxed">{t.summary}</p>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-0 border-t" style={{ borderColor: `${t.colour}20` }}>
                      <p className="font-body text-xs text-foreground/80 leading-relaxed mt-3">{t.detail}</p>
                      <p className="font-hand text-[10px] text-muted-foreground mt-2">— {t.source}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
