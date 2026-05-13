/**
 * Phase-aware "what to expect this week" card — surfaces only the hormone
 * info that matters now, instead of the full Hormone Education wall. The
 * full hub stays underneath, behind a soft "more about all four phases"
 * disclosure.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Phase, PHASE_LABELS } from "@/lib/cycle-utils";
import { haptic } from "@/hooks/use-mobile";

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#C4526E",
  follicular: "#5C4A9E",
  ovulatory: "#C47A8A",
  luteal: "#9B89B4",
};

interface PhaseInfo {
  hormones: string;
  body: string;
  mind: string;
  whisper: string;
}

const PHASE_INFO: Record<Phase, PhaseInfo> = {
  menstrual: {
    hormones: "Oestrogen and progesterone are at their lowest. Prostaglandins drive cramps and the shed.",
    body: "Sensitive, possibly tender. Iron is leaving — replenish gently.",
    mind: "Quieter, more reflective. Inner clarity is highest now.",
    whisper: "Rest is real work. Your body is finishing something whole.",
  },
  follicular: {
    hormones: "Oestrogen is rising. FSH is building a new follicle.",
    body: "Stamina returns. Skin clears. Sleep often deepens.",
    mind: "Optimistic, curious, ready to begin. Best for new ideas.",
    whisper: "This is your starting line. Plant something.",
  },
  ovulatory: {
    hormones: "Oestrogen peaks. A brief testosterone surge sharpens drive.",
    body: "Strength and pain threshold are highest. Ligaments are looser — warm up well.",
    mind: "Magnetic, fluent, confident. Words come easily.",
    whisper: "Speak the harder thing. Lift the heavier weight. The world is open.",
  },
  luteal: {
    hormones: "Progesterone rises, then drops. Body temperature lifts slightly.",
    body: "Appetite grows. Sleep can fragment. Sensitivity returns in the second half.",
    mind: "More inward. Boundaries feel sharper for a reason.",
    whisper: "Eat warmer. Sleep longer. Trust what feels too much — it's information.",
  },
};

interface Props {
  phase: Phase;
  cycleDay: number;
}

export default function PhaseLearnCard({ phase, cycleDay }: Props) {
  const [openOthers, setOpenOthers] = useState(false);
  const info = PHASE_INFO[phase];
  const color = PHASE_HEX[phase];
  const otherPhases = (["menstrual", "follicular", "ovulatory", "luteal"] as Phase[]).filter((p) => p !== phase);

  return (
    <div className="space-y-5">
      <div className="rounded-[18px] bg-card shadow-soft p-5 space-y-4" style={{ borderTop: `3px solid ${color}` }}>
        <div className="flex items-baseline justify-between">
          <div>
            <p className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground">This week</p>
            <h3 className="font-display text-2xl font-bold italic text-foreground mt-1">
              You're in your {PHASE_LABELS[phase].toLowerCase()} phase
            </h3>
          </div>
          <span className="font-body text-[11px] font-medium rounded-full px-2.5 py-0.5"
            style={{ backgroundColor: `${color}15`, color }}>
            Day {cycleDay}
          </span>
        </div>

        <p className="font-editorial text-base italic text-foreground leading-relaxed" style={{ color: `${color}dd` }}>
          "{info.whisper}"
        </p>

        <div className="space-y-3 pt-1">
          <Row label="Hormones" body={info.hormones} color={color} />
          <Row label="Body" body={info.body} color={color} />
          <Row label="Mind" body={info.mind} color={color} />
        </div>
      </div>

      <button
        onClick={() => { haptic("light"); setOpenOthers((v) => !v); }}
        className="touch-btn w-full flex items-center justify-between rounded-2xl bg-secondary/40 px-4 py-3 min-h-[48px]"
      >
        <span className="font-body text-xs text-muted-foreground">
          {openOthers ? "hide" : "more about"} the other three phases
        </span>
        <motion.div animate={{ rotate: openOthers ? 180 : 0 }}>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {openOthers && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden space-y-3"
          >
            {otherPhases.map((p) => {
              const c = PHASE_HEX[p];
              const i = PHASE_INFO[p];
              return (
                <div key={p} className="rounded-[14px] bg-card/60 shadow-soft p-4 space-y-2"
                  style={{ borderLeft: `3px solid ${c}` }}>
                  <p className="font-display text-sm font-bold italic text-foreground">{PHASE_LABELS[p]}</p>
                  <p className="font-editorial text-xs italic" style={{ color: `${c}cc` }}>"{i.whisper}"</p>
                  <p className="font-body text-[11px] text-muted-foreground leading-relaxed">{i.body}</p>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Row({ label, body, color }: { label: string; body: string; color: string }) {
  return (
    <div>
      <p className="font-body text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color }}>{label}</p>
      <p className="font-body text-sm text-foreground leading-relaxed">{body}</p>
    </div>
  );
}
