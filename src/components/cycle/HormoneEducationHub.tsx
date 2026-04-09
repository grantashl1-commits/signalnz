import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, BookOpen } from "lucide-react";
import { haptic } from "@/hooks/use-mobile";

interface HormoneCard {
  name: string;
  colour: string;
  tint: string; // very faint background when expanded
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

export default function HormoneEducationHub() {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

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
    </div>
  );
}
