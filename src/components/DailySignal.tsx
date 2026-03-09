import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BotanicalSprig, HerbCluster, WildStar } from "@/components/BotanicalElements";
import {
  Phase, getCycleInfo, getLastPeriodStart, getDaysUntilNextPhase,
  getRecentSymptoms, getRecentMoods, getDailySignal, setDailySignal,
  PHASE_LABELS, PHASE_SHORT,
} from "@/lib/cycle-utils";

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#C4526E", follicular: "#7D9E82", ovulatory: "#E8A030", luteal: "#9B89B4",
};

// Phase-specific template signals (used when no AI is available)
const TEMPLATE_SIGNALS: Record<Phase, string[]> = {
  menstrual: [
    "Your body is in its most restorative phase right now — both estrogen and progesterone are at their lowest. The fatigue you might be feeling is not laziness, it is biology. A warm meal with iron-rich foods like lentils, leafy greens, or seeds will help replenish what your body is spending. Be gentle with yourself today.",
    "This is your inner winter. Your uterus is doing hard work and your body is asking for rest — that is a legitimate need, not a weakness. Focus on warmth, slow movement, and foods rich in iron and magnesium. You are not behind; you are regenerating.",
    "Your hormones are at their lowest point right now, which means your energy and mood may feel quieter than usual. This is temporary and completely phase-appropriate. Prioritise rest, warm nourishing food, and gentle connection. Your body knows what it is doing.",
  ],
  follicular: [
    "Estrogen is rising and your brain is genuinely operating differently right now — verbal fluency, creative thinking, and pain tolerance are all higher than they were last week. This is a real biological window. If there is something hard you have been putting off — a conversation, a project, a hard workout — today and the next few days are when your body will support you most.",
    "Your body is building momentum. Estrogen is climbing and with it comes clarity, motivation, and a natural optimism that is hormonal, not imaginary. Lean into it. Start new things, plan, create. Your biology is backing you up right now.",
    "You are in your power phase. Energy is rising, your body is recovering from menstruation, and your brain is primed for new learning and creative work. Fermented foods and complex carbs will fuel the climb. Trust the rising signal.",
  ],
  ovulatory: [
    "You are at peak signal today. Estrogen is at its highest and your body is producing more testosterone than at any other point in your cycle — energy, confidence, and sociability are all elevated right now. Notice this. You deserve to know when your body is working in your favour.",
    "This is your most communicative, magnetic phase. Pain tolerance is highest, verbal fluency peaks, and your body is naturally more resilient. If there are important conversations to have or challenges to face, your biology is primed for them right now.",
    "Everything is at its peak. Your hormones are working together beautifully right now — high estrogen, a surge of LH, and a small boost of testosterone. Use this window for the things that matter most to you. You will not feel this capable again until next cycle.",
  ],
  luteal: [
    "Your body is in its most progesterone-dominant days and the fatigue you might be feeling is real — it is not laziness, it is biology. The carbohydrate cravings are your brain asking for serotonin, which drops as progesterone rises. A warm meal with complex carbs and magnesium-rich foods like dark chocolate or pumpkin seeds will genuinely help more than pushing through.",
    "Progesterone is your dominant hormone right now, and it is a sedative. The urge to slow down, nest, and turn inward is not a character flaw — it is a hormonal instruction. Listen to it. Lower your expectations of productivity and raise your standards of self-care.",
    "You are entering the most detail-oriented phase of your cycle. Progesterone heightens your inner critic but also sharpens your ability to edit, refine, and complete tasks. Channel that energy into finishing things rather than starting new ones. Your body is winding down — honour the complexity.",
  ],
};

function getTemplateSignal(phase: Phase, cycleDay: number): string {
  const templates = TEMPLATE_SIGNALS[phase];
  // Use cycle day to pick a varied template
  return templates[cycleDay % templates.length];
}

// Contextual additions based on logged data
function addContext(base: string, info: ReturnType<typeof getCycleInfo>, recentSymptoms: ReturnType<typeof getRecentSymptoms>, recentMoods: ReturnType<typeof getRecentMoods>): string {
  // For late luteal, add period due note
  if (info.cycleDay >= 25 && info.cycleDay <= 28) {
    const daysUntil = 29 - info.cycleDay;
    return base;
  }

  return base;
}

export default function DailySignalCard() {
  const lastPeriod = getLastPeriodStart();
  const info = getCycleInfo(lastPeriod);
  const todayStr = new Date().toISOString().split("T")[0];
  const [signal, setSignal] = useState<string>("");

  useEffect(() => {
    // Check cache first
    const cached = getDailySignal(todayStr);
    if (cached) {
      setSignal(cached);
      return;
    }

    // Generate template-based signal
    const recentSymptoms = getRecentSymptoms(3);
    const recentMoods = getRecentMoods(2);
    const base = getTemplateSignal(info.phase, info.cycleDay);
    const enriched = addContext(base, info, recentSymptoms, recentMoods);

    setSignal(enriched);
    setDailySignal(todayStr, enriched);
  }, [todayStr, info.phase, info.cycleDay]);

  if (!signal) return null;

  const phaseColor = PHASE_HEX[info.phase];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative overflow-hidden rounded-[18px] border border-border"
      style={{ backgroundColor: "#F5EDE0" }}
    >
      {/* Left border */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[18px]" style={{ backgroundColor: phaseColor }} />

      {/* Decorative elements */}
      <div className="absolute top-2 right-2 pointer-events-none">
        <HerbCluster size={60} opacity={0.2} />
      </div>

      <div className="p-5 pl-6">
        {/* Header */}
        <div className="flex items-center gap-1.5 mb-3">
          <WildStar size={14} color={phaseColor} />
          <span className="font-hand text-xs font-bold" style={{ color: phaseColor }}>today's signal</span>
        </div>

        {/* Message */}
        <p className="font-display text-base italic text-foreground leading-relaxed pr-8" style={{ lineHeight: 1.7 }}>
          {signal}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4">
          <BotanicalSprig width={100} opacity={0.2} />
          <span className="font-body text-[10px] font-light text-muted-foreground">
            day {info.cycleDay} · {PHASE_SHORT[info.phase].toLowerCase()}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// Period due reminder banner
export function PeriodDueReminder() {
  const lastPeriod = getLastPeriodStart();
  const info = getCycleInfo(lastPeriod);

  if (info.cycleDay < 25 || info.cycleDay > 28) return null;

  const daysUntil = 29 - info.cycleDay;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl px-4 py-3 text-center"
      style={{ backgroundColor: "#F5EDE0" }}
    >
      <p className="font-hand text-sm text-muted-foreground">
        <WildStar size={12} color="#8B6F5E" className="inline-block mr-1 -mt-0.5" />
        your period may arrive in the next {daysUntil === 1 ? "day" : `${daysUntil} days`}
      </p>
    </motion.div>
  );
}
