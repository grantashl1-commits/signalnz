import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BotanicalSprig, HerbCluster, WildStar } from "@/components/BotanicalElements";
import { supabase } from "@/integrations/supabase/client";
import { useCycle } from "@/contexts/CycleContext";
import {
  Phase, getDaysUntilNextPhase,
  getRecentSymptoms, getRecentMoods, getDailySignal, setDailySignal,
  PHASE_LABELS, PHASE_SHORT,
} from "@/lib/cycle-utils";

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#C4526E", follicular: "#5C4A9E", ovulatory: "#C47A8A", luteal: "#9B89B4",
};

const PHASE_DESCRIPTIONS: Record<Phase, string> = {
  menstrual: "Both estrogen and progesterone are at their lowest. The body is shedding the uterine lining. Energy and mood tend to be lower.",
  follicular: "Estrogen is rising steadily. Energy, motivation, and cognitive function are increasing. The body is preparing for ovulation.",
  ovulatory: "Estrogen peaks and LH surges trigger ovulation. Testosterone also rises briefly. Peak energy, confidence, and communication.",
  luteal: "Progesterone rises then both hormones drop. The body prepares for menstruation. Energy decreases, detail-orientation increases, PMS possible.",
};

// Fallback templates when AI is unavailable
const FALLBACK_SIGNALS: Record<Phase, string> = {
  menstrual: "Your body is in its most restorative phase right now — both estrogen and progesterone are at their lowest. The fatigue you might be feeling is not laziness, it is biology. A warm meal with iron-rich foods like lentils, leafy greens, or seeds will help replenish what your body is spending. Be gentle with yourself today.",
  follicular: "Estrogen is rising and your brain is genuinely operating differently right now — verbal fluency, creative thinking, and pain tolerance are all higher than they were last week. This is a real biological window. If there is something hard you have been putting off — today and the next few days are when your body will support you most.",
  ovulatory: "You are at peak signal today. Estrogen is at its highest and your body is producing more testosterone than at any other point in your cycle — energy, confidence, and sociability are all elevated right now. Notice this. You deserve to know when your body is working in your favour.",
  luteal: "Your body is in its most progesterone-dominant days and the fatigue you might be feeling is real — it is not laziness, it is biology. A warm meal with complex carbs and magnesium-rich foods like dark chocolate or pumpkin seeds will genuinely help more than pushing through.",
};

export default function DailySignalCard() {
  const { currentPhase, currentCycleDay, cycleStartDate } = useCycle();
  const info = { phase: currentPhase, cycleDay: currentCycleDay };
  const todayStr = new Date().toISOString().split("T")[0];
  const [signal, setSignal] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check cache first
    const cached = getDailySignal(todayStr);
    if (cached) {
      setSignal(cached);
      return;
    }

    // Fetch from AI
    const fetchSignal = async () => {
      setLoading(true);
      try {
        const recentSymptoms = getRecentSymptoms(3);
        const recentMoods = getRecentMoods(2);
        const allSymptoms = recentSymptoms.flatMap((s) => s.symptoms);
        const allMoods = recentMoods.flatMap((m) => m.moods);
        const daysUntilPeriod = info.cycleDay >= 25 ? 29 - info.cycleDay : undefined;

        const { data, error } = await supabase.functions.invoke("cycle-ai", {
          body: {
            type: "daily-signal",
            cycleDay: info.cycleDay,
            phase: PHASE_SHORT[info.phase],
            phaseDescription: PHASE_DESCRIPTIONS[info.phase],
            recentSymptoms: allSymptoms.length > 0 ? allSymptoms : undefined,
            recentMoods: allMoods.length > 0 ? allMoods : undefined,
            periodDueIn: daysUntilPeriod,
          },
        });

        if (error) throw error;

        const message = data?.message;
        if (message) {
          setSignal(message);
          setDailySignal(todayStr, message);
        } else {
          throw new Error("No message returned");
        }
      } catch (err) {
        console.error("Daily signal AI error, using fallback:", err);
        const fallback = FALLBACK_SIGNALS[info.phase];
        setSignal(fallback);
        setDailySignal(todayStr, fallback);
      } finally {
        setLoading(false);
      }
    };

    fetchSignal();
  }, [todayStr, info.phase, info.cycleDay]);

  if (!signal && !loading) return null;

  const phaseColor = PHASE_HEX[info.phase];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative overflow-hidden rounded-[18px] border border-border"
      style={{ backgroundColor: "hsl(var(--card))" }}
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
        {loading ? (
          <div className="space-y-2">
            <div className="h-4 bg-foreground/5 rounded animate-pulse w-full" />
            <div className="h-4 bg-foreground/5 rounded animate-pulse w-5/6" />
            <div className="h-4 bg-foreground/5 rounded animate-pulse w-4/6" />
          </div>
        ) : (
          <p className="font-display text-base italic text-foreground leading-relaxed pr-8" style={{ lineHeight: 1.7 }}>
            {signal}
          </p>
        )}

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
  const { currentPhase, currentCycleDay } = useCycle();
  const info = { phase: currentPhase, cycleDay: currentCycleDay };

  if (info.cycleDay < 25 || info.cycleDay > 28) return null;

  const daysUntil = 29 - info.cycleDay;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl px-4 py-3 text-center"
      style={{ backgroundColor: "hsl(var(--card))" }}
    >
      <p className="font-hand text-sm text-muted-foreground">
        <WildStar size={12} color="#8B6F5E" className="inline-block mr-1 -mt-0.5" />
        your period may arrive in the next {daysUntil === 1 ? "day" : `${daysUntil} days`}
      </p>
    </motion.div>
  );
}
