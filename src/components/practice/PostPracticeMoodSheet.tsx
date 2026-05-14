import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  practiceTitle: string;
  onSubmit: (mood: number) => void;
  onSkip: () => void;
}

const MOODS = [
  { value: 1, label: "Heavy", glyph: "•", caption: "Still tender" },
  { value: 2, label: "Steady", glyph: "•", caption: "Neutral" },
  { value: 3, label: "Light", glyph: "•", caption: "Eased" },
];

export default function PostPracticeMoodSheet({ open, practiceTitle, onSubmit, onSkip }: Props) {
  const [selected, setSelected] = useState<number | null>(null);

  const handleSelect = (v: number) => {
    setSelected(v);
    setTimeout(() => {
      onSubmit(v);
      setSelected(null);
    }, 300);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[80] bg-foreground/40"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onSkip}
          />
          <motion.div
            className="bottom-sheet z-[81]"
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <div className="bottom-sheet-handle" />
            <div className="px-6 py-6">
              <div className="flex items-start justify-between mb-1">
                <p className="font-body text-[10px] uppercase tracking-[0.2em] text-bloom">
                  After {practiceTitle}
                </p>
                <button onClick={onSkip} className="touch-btn p-2 -mt-2 -mr-2 rounded-full bg-secondary">
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>
              <h3 className="font-display text-2xl italic font-bold text-foreground mb-1 leading-tight">
                How does your body feel?
              </h3>
              <p className="font-hand text-sm text-bloom mb-6">
                Just a soft check. Your cycle remembers.
              </p>

              <div className="flex items-stretch justify-between gap-2 mb-2">
                {MOODS.map((m) => {
                  const isSelected = selected === m.value;
                  return (
                    <button
                      key={m.value}
                      onClick={() => handleSelect(m.value)}
                      className={`flex-1 touch-btn rounded-[16px] py-5 flex flex-col items-center gap-1 border-2 transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10 scale-[1.04]"
                          : "border-border bg-card hover:border-primary/30"
                      }`}
                    >
                      <div className="flex items-center gap-1 mb-1">
                        {Array.from({ length: m.value }).map((_, i) => (
                          <span
                            key={i}
                            className="block rounded-full bg-primary"
                            style={{ width: 10, height: 10 }}
                          />
                        ))}
                        {Array.from({ length: 3 - m.value }).map((_, i) => (
                          <span
                            key={`e${i}`}
                            className="block rounded-full bg-border"
                            style={{ width: 10, height: 10 }}
                          />
                        ))}
                      </div>
                      <p className="font-display text-sm font-semibold text-foreground">{m.label}</p>
                      <p className="font-display text-[11px] italic text-muted-foreground">{m.caption}</p>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={onSkip}
                className="w-full mt-4 font-body text-xs text-muted-foreground py-2"
              >
                Skip for now
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
