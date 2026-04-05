import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun, Sunset } from "lucide-react";
import { haptic } from "@/hooks/use-mobile";

export type CycleMode = "cycling" | "perimenopause" | "post-menopause";

const MODES: { id: CycleMode; label: string; desc: string; who: string; Icon: typeof Moon }[] = [
  {
    id: "cycling",
    label: "Cycling",
    desc: "Regular or irregular periods",
    who: "Women with an active menstrual cycle",
    Icon: Moon,
  },
  {
    id: "perimenopause",
    label: "Perimenopause",
    desc: "Periods changing, symptoms starting",
    who: "Women in the transition (typically 40s, sometimes late 30s)",
    Icon: Sunset,
  },
  {
    id: "post-menopause",
    label: "Post-menopause",
    desc: "12+ months since last period",
    who: "Women post-menopause",
    Icon: Sun,
  },
];

interface Props {
  onSelect: (mode: CycleMode) => void;
  onClose?: () => void;
}

export default function CycleModeSelector({ onSelect, onClose }: Props) {
  const [selected, setSelected] = useState<CycleMode | null>(null);

  const handleConfirm = () => {
    if (!selected) return;
    haptic("success");
    onSelect(selected);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="fixed inset-x-0 bottom-0 z-50 bg-card rounded-t-[20px] border-t border-border"
        style={{ maxHeight: "90vh", paddingBottom: "env(safe-area-inset-bottom)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-border mx-auto mt-3 mb-4" />

        <div className="px-5 pb-8 space-y-5">
          <div className="text-center">
            <h2 className="font-display text-xl italic text-foreground mb-1">
              which best describes where you are right now?
            </h2>
            <p className="font-body text-xs text-muted-foreground">
              this determines your personalised cycle experience. you can change it any time.
            </p>
          </div>

          <div className="space-y-3">
            {MODES.map((mode) => {
              const isSelected = selected === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => { haptic("light"); setSelected(mode.id); }}
                  className={`touch-btn w-full card-warm p-4 text-left transition-all ${isSelected ? "ring-2 ring-primary" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${isSelected ? "bg-primary/10" : "bg-secondary"}`}>
                      <mode.Icon className={`h-5 w-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-display text-base italic text-foreground">{mode.label}</p>
                      <p className="font-body text-sm text-muted-foreground mt-0.5">{mode.desc}</p>
                      <p className="font-hand text-xs text-muted-foreground/70 mt-1">{mode.who}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleConfirm}
            disabled={!selected}
            className="touch-btn w-full rounded-xl bg-primary px-4 py-3.5 min-h-[52px] font-hand text-base text-primary-foreground active:opacity-90 disabled:opacity-30"
          >
            continue →
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
