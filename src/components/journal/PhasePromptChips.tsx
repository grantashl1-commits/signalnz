import { motion } from "framer-motion";
import { haptic } from "@/hooks/use-mobile";

type Phase = "menstrual" | "follicular" | "ovulatory" | "luteal";

const CHIPS: Record<Phase, { mood: string; label: string; prompt: string }[]> = {
  menstrual: [
    { mood: "heavy", label: "what I'm carrying", prompt: "What I'm carrying that's ready to be put down…" },
    { mood: "default", label: "what my body knows", prompt: "What my body wants me to know right now…" },
    { mood: "open", label: "just begin", prompt: "" },
  ],
  follicular: [
    { mood: "clear", label: "what's possible", prompt: "What feels possible in the days ahead…" },
    { mood: "default", label: "what I want to begin", prompt: "Something I'd like to begin or build…" },
    { mood: "open", label: "just begin", prompt: "" },
  ],
  ovulatory: [
    { mood: "grounded", label: "what I want to offer", prompt: "What I'm most ready to offer or express…" },
    { mood: "default", label: "who I'm being", prompt: "Who I'm being right now, and who I want to be…" },
    { mood: "open", label: "just begin", prompt: "" },
  ],
  luteal: [
    { mood: "heavy", label: "be gentle with me", prompt: "What it would mean to be gentle with myself today…" },
    { mood: "unsettled", label: "what keeps returning", prompt: "A feeling that keeps returning, and what it might be protecting…" },
    { mood: "default", label: "what I'm avoiding", prompt: "Something asking for my attention that I've been avoiding…" },
  ],
};

interface Props {
  phase: Phase;
  onPick: (mood: string, seedText: string) => void;
}

export default function PhasePromptChips({ phase, onPick }: Props) {
  const chips = CHIPS[phase] || CHIPS.luteal;
  return (
    <div className="space-y-1.5">
      <p className="font-body text-[10px] uppercase tracking-[0.15em] text-muted-foreground/70">
        For this phase — pick a doorway
      </p>
      <div className="scroll-snap-x flex gap-2 -mx-1 px-1 pb-1">
        {chips.map((c, i) => (
          <motion.button
            key={c.label}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.2 }}
            onClick={() => {
              haptic("light");
              onPick(c.mood, c.prompt);
            }}
            className="touch-btn scroll-snap-item shrink-0 rounded-full px-3 py-1.5 min-h-[36px] font-display text-[12px] italic bg-secondary/70 text-foreground/80 hover:bg-secondary transition-colors whitespace-nowrap"
          >
            {c.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
