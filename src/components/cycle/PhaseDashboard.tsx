import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Dumbbell, Brain, Heart, AlertTriangle } from "lucide-react";
import { Phase, PHASE_LABELS } from "@/lib/cycle-utils";
import { CymatiSketch, BotanicalSprig } from "@/components/BotanicalElements";
import { haptic } from "@/hooks/use-mobile";

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#C4526E",
  follicular: "#5C4A9E",
  ovulatory: "#C47A8A",
  luteal: "#9B89B4",
};

interface PhaseContent {
  hormones: string;
  energy: number;
  body: string;
  mind: string;
  train: string;
  training: string;
  nutrition: string;
  sleep: string;
  energyExpect: string;
  coachingNote: string;
  injuryNote?: string;
}

const PHASE_CONTENT: Record<Phase, PhaseContent> = {
  menstrual: {
    hormones: "Oestrogen and progesterone at their lowest",
    energy: 2,
    body: "Increased sensitivity, possible cramping. Your body is in an inflammatory state.",
    mind: "Inner clarity is high. Introspective, reflective. Energy is lowest but wisdom peaks.",
    train: "Somatic movement, gentle yoga, walking. Avoid HIIT.",
    training: "Lower intensity. Somatic movement, gentle yoga, walking. Avoid HIIT. The nervous system is under load.",
    nutrition: "Iron-rich foods. Anti-inflammatory eating. Magnesium for cramps (leafy greens, dark chocolate, nuts).",
    sleep: "Allow more — the body is doing real work.",
    energyExpect: "Lower and that is normal. Signal does not push you to 'push through' this phase.",
    coachingNote: "This is not weakness. This is your body completing a biological process. Rest is training.",
  },
  follicular: {
    hormones: "Oestrogen rising — energy and focus are building",
    energy: 4,
    body: "Increased stamina, clearer skin. Best phase for learning new movements.",
    mind: "Optimistic, motivated, sociable. Great for starting new projects and planning.",
    train: "Strength training, HIIT, trying new workouts. Build intensity.",
    training: "Build intensity. Great for learning new skills and movements. Strength gains are more accessible here.",
    nutrition: "Lighter foods work well. Oestrogen supports insulin sensitivity — lower carb needs than luteal.",
    sleep: "Usually best this phase.",
    energyExpect: "Rising. Channel it.",
    coachingNote: "Your follicular phase is your superpower window. Use it.",
  },
  ovulatory: {
    hormones: "Oestrogen peaks, testosterone surges briefly",
    energy: 5,
    body: "Highest pain threshold, peak strength. Ligament laxity increases.",
    mind: "Confident, communicative, magnetic. Peak verbal and social fluency.",
    train: "Peak performance window. Schedule heaviest lifts here.",
    training: "Peak performance window. Schedule heaviest lifts and hardest sessions here. But: warm up thoroughly — ligament laxity is highest.",
    nutrition: "Light and clean. Oestrogen peak suppresses appetite slightly.",
    sleep: "Good, but can be disrupted by the brief testosterone surge.",
    energyExpect: "Peak.",
    coachingNote: "You are transmitting at full signal.",
    injuryNote: "Oestrogen peaks can increase joint laxity. Warm up longer and avoid aggressive overstretching this week.",
  },
  luteal: {
    hormones: "Progesterone rising, then both drop",
    energy: 3,
    body: "Bloating possible, heightened senses. Higher core temperature.",
    mind: "Detail-oriented in first half, then PMS possible. More introspective.",
    train: "Maintain consistency but reduce intensity (days 20–28). Moderate loads, more rest.",
    training: "Maintain consistency but reduce intensity in the second half (days 20–28). Moderate loads, more rest between sets.",
    nutrition: "Increase carbohydrates and protein — progesterone increases protein breakdown. Magnesium and B6 support PMS. Cravings are real and hormonally driven.",
    sleep: "Progesterone disrupts sleep architecture. Prioritise sleep hygiene. Magnesium glycinate before bed.",
    energyExpect: "Declining in second half. Plan lighter work and admin-heavy tasks.",
    coachingNote: "Luteal cravings are your body asking for more fuel. Eat more protein and complex carbs — not less.",
  },
};

interface Props {
  phase: Phase;
  cycleDay: number;
}

export default function PhaseDashboard({ phase, cycleDay }: Props) {
  const [expanded, setExpanded] = useState(false);
  const content = PHASE_CONTENT[phase];
  const color = PHASE_HEX[phase];
  const phaseStartDay = phase === "menstrual" ? 1 : phase === "follicular" ? 6 : phase === "ovulatory" ? 14 : 18;
  const dayInPhase = cycleDay - phaseStartDay + 1;

  const tiles = [
    { label: "Body", icon: Heart, text: content.body },
    { label: "Mind", icon: Brain, text: content.mind },
    { label: "Train", icon: Dumbbell, text: content.train },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden card-warm"
    >
      {/* Phase colour accent */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-[18px]" style={{ backgroundColor: color }} />
      <div className="absolute top-3 right-3 pointer-events-none">
        <CymatiSketch phase={phase} size={60} opacity={0.08} />
      </div>

      <div className="p-5 pl-6 space-y-4">
        {/* Phase header */}
        <div>
          <h3 className="font-display text-xl italic" style={{ color }}>{PHASE_LABELS[phase]}</h3>
          <p className="font-hand text-sm text-muted-foreground mt-0.5">
            Day {cycleDay} of cycle · Day {dayInPhase} of phase
          </p>
          <p className="font-body text-sm text-foreground/80 mt-2 leading-relaxed italic">
            {content.hormones}
          </p>
        </div>

        {/* Energy dots */}
        <div className="flex items-center gap-2">
          <span className="font-body text-[10px] text-muted-foreground uppercase tracking-wider">Energy</span>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <span
                key={n}
                className={`h-2.5 w-2.5 rounded-full ${n <= content.energy ? "" : "bg-border"}`}
                style={n <= content.energy ? { backgroundColor: color } : {}}
              />
            ))}
          </div>
        </div>

        {/* 3 quick-read tiles */}
        <div className="grid grid-cols-3 gap-2">
          {tiles.map(({ label, icon: Icon, text }) => (
            <div key={label} className="rounded-xl bg-background/60 border border-border/50 p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Icon className="h-3.5 w-3.5" style={{ color }} />
                <span className="font-hand text-xs font-bold" style={{ color }}>{label}</span>
              </div>
              <p className="font-body text-[11px] text-muted-foreground leading-relaxed">{text}</p>
            </div>
          ))}
        </div>

        {/* Injury warning for ovulatory */}
        {content.injuryNote && (
          <div className="flex items-start gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-3">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="font-body text-xs text-amber-800 dark:text-amber-200 leading-relaxed">{content.injuryNote}</p>
          </div>
        )}

        {/* Expand button */}
        <button
          onClick={() => { haptic("light"); setExpanded(!expanded); }}
          className="touch-btn flex items-center gap-1 font-hand text-xs text-primary"
        >
          {expanded ? "less detail" : "full phase guide"} 
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {/* Expanded guide */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <BotanicalSprig width={120} opacity={0.15} className="mx-auto mb-3" />
              <div className="space-y-3 border-t border-border pt-3">
                {[
                  { label: "Training", text: content.training },
                  { label: "Nutrition", text: content.nutrition },
                  { label: "Sleep", text: content.sleep },
                  { label: "Energy", text: content.energyExpect },
                ].map(({ label, text }) => (
                  <div key={label}>
                    <p className="font-hand text-xs font-bold" style={{ color }}>{label}</p>
                    <p className="font-body text-xs text-muted-foreground leading-relaxed mt-0.5">{text}</p>
                  </div>
                ))}

                {/* Coaching note */}
                <div className="rounded-xl p-3 mt-2" style={{ backgroundColor: `${color}08` }}>
                  <p className="font-display text-sm italic text-foreground leading-relaxed">
                    "{content.coachingNote}"
                  </p>
                  <p className="font-hand text-[10px] text-muted-foreground mt-1">— signal cycle coach</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
