/**
 * Horizontal scroll-snap of the next three days, so today doesn't sit alone
 * on the Today tab. One-line, phase-aware whisper per day.
 */
import { motion } from "framer-motion";
import { Phase, PHASE_SHORT, getPhaseFromDay } from "@/lib/cycle-utils";

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#C4526E",
  follicular: "#5C4A9E",
  ovulatory: "#C47A8A",
  luteal: "#9B89B4",
};

const PHASE_WHISPER: Record<Phase, string> = {
  menstrual: "softer, slower — let the body lead",
  follicular: "energy lifting — try something new",
  ovulatory: "brightest day — speak it, lift it",
  luteal: "warmer foods, gentler pace",
};

interface Props {
  cycleDay: number;
}

const DAY_LABEL = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function WhatsComingNext({ cycleDay }: Props) {
  const today = new Date();
  const upcoming = [1, 2, 3].map((offset) => {
    const d = new Date(today);
    d.setDate(today.getDate() + offset);
    const cd = ((cycleDay - 1 + offset) % 28) + 1;
    const phase = getPhaseFromDay(cd);
    return {
      offset,
      label: offset === 1 ? "Tomorrow" : DAY_LABEL[d.getDay()],
      dateLabel: d.toLocaleDateString("en-NZ", { day: "numeric", month: "short" }),
      cycleDay: cd,
      phase,
    };
  });

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between px-1">
        <p className="font-hand text-sm text-muted-foreground">what's coming next</p>
        <span className="font-body text-[10px] text-muted-foreground/60">next 3 days</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {upcoming.map((d, i) => {
          const color = PHASE_HEX[d.phase];
          return (
            <motion.div
              key={d.offset}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-[14px] bg-card shadow-soft p-3"
              style={{ borderTop: `2px solid ${color}` }}
            >
              <div className="flex items-baseline justify-between">
                <p className="font-display text-sm font-bold text-foreground">{d.label}</p>
                <span className="font-body text-[10px] text-muted-foreground">D{d.cycleDay}</span>
              </div>
              <p className="font-body text-[10px] uppercase tracking-[0.1em] mt-0.5" style={{ color }}>
                {PHASE_SHORT[d.phase]}
              </p>
              <p className="font-body text-[11px] text-muted-foreground italic leading-snug mt-1.5">
                {PHASE_WHISPER[d.phase]}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
