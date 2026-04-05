import { motion } from "framer-motion";
import { PenLine, Heart, Minus } from "lucide-react";
import { haptic } from "@/hooks/use-mobile";

export type JournalEntryType = "standard" | "gratitude" | "one-line";

interface Props {
  onSelect: (type: JournalEntryType) => void;
  onCancel: () => void;
}

const TYPES = [
  {
    id: "standard" as const,
    icon: PenLine,
    label: "Reflection",
    desc: "Full journal entry with Stoic lens",
  },
  {
    id: "gratitude" as const,
    icon: Heart,
    label: "Gratitude",
    desc: "3 structured questions",
  },
  {
    id: "one-line" as const,
    icon: Minus,
    label: "One Line",
    desc: "Quick capture · one sentence",
  },
];

export default function EntryTypeSelector({ onSelect, onCancel }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="fixed inset-0 z-[110] flex flex-col items-center justify-center bg-background px-6"
      style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="font-display text-2xl italic text-foreground mb-8 text-center"
      >
        What kind of entry today?
      </motion.p>

      <div className="flex flex-col gap-3 w-full max-w-sm">
        {TYPES.map((t, i) => (
          <motion.button
            key={t.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.06 }}
            onClick={() => { haptic("medium"); onSelect(t.id); }}
            className="touch-btn card-warm p-5 text-left flex items-center gap-4 hover:shadow-md active:scale-[0.98] transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center flex-shrink-0">
              <t.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-base italic text-foreground">{t.label}</h3>
              <p className="font-mono text-[11px] text-muted-foreground">{t.desc}</p>
            </div>
          </motion.button>
        ))}
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        onClick={onCancel}
        className="mt-8 font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Cancel
      </motion.button>
    </motion.div>
  );
}
