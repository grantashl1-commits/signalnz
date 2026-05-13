/**
 * Gentle banner that surfaces when the next phase shift is within 3 days.
 * Body-first voice — never urgent, never alarmist. Acknowledges what's
 * coming so the day doesn't arrive cold.
 */
import { motion } from "framer-motion";
import { Phase, PHASE_LABELS, getDaysUntilNextPhase } from "@/lib/cycle-utils";

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#C4526E",
  follicular: "#5C4A9E",
  ovulatory: "#C47A8A",
  luteal: "#9B89B4",
};

const NEXT_PHASE: Record<Phase, Phase> = {
  menstrual: "follicular",
  follicular: "ovulatory",
  ovulatory: "luteal",
  luteal: "menstrual",
};

const APPROACH_COPY: Record<Phase, (days: number) => { whisper: string; what: string }> = {
  follicular: (d) => ({
    whisper: d === 0 ? "your follicular days begin today" : `${d} ${d === 1 ? "day" : "days"} until your follicular rise`,
    what: "energy starts climbing — let it surprise you",
  }),
  ovulatory: (d) => ({
    whisper: d === 0 ? "ovulation is here" : `${d} ${d === 1 ? "day" : "days"} until your peak`,
    what: "the brightest part of the month — speak, lift, gather",
  }),
  luteal: (d) => ({
    whisper: d === 0 ? "your luteal days are arriving" : `${d} ${d === 1 ? "day" : "days"} until you turn inward`,
    what: "warmer foods, slower mornings, longer sleep",
  }),
  menstrual: (d) => ({
    whisper: d === 0 ? "your body may be preparing" : `${d} ${d === 1 ? "day" : "days"} until your bleed may begin`,
    what: "make space — you're allowed to soften now",
  }),
};

interface Props {
  cycleDay: number;
  phase: Phase;
}

export default function PhaseCountdownBanner({ cycleDay, phase }: Props) {
  const daysUntil = getDaysUntilNextPhase(cycleDay, phase);
  if (daysUntil > 3) return null;

  const next = NEXT_PHASE[phase];
  const color = PHASE_HEX[next];
  const { whisper, what } = APPROACH_COPY[next](daysUntil);

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[18px] p-4 shadow-soft"
      style={{ backgroundColor: `${color}10`, borderLeft: `3px solid ${color}` }}
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-hand text-sm" style={{ color }}>{whisper}</p>
        <span className="font-body text-[10px] uppercase tracking-[0.15em]" style={{ color: `${color}cc` }}>
          {PHASE_LABELS[next]}
        </span>
      </div>
      <p className="font-body text-xs text-muted-foreground mt-1.5 italic leading-relaxed">{what}</p>
    </motion.div>
  );
}
