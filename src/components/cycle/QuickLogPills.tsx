import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Check } from "lucide-react";
import { toast } from "sonner";
import { haptic } from "@/hooks/use-mobile";
import {
  getMoods, setMoods,
  getSymptomsNew, setSymptomsNew,
  Phase,
} from "@/lib/cycle-utils";

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#C4526E",
  follicular: "#5C4A9E",
  ovulatory: "#C47A8A",
  luteal: "#9B89B4",
};

const MOODS = [
  { id: "calm", label: "calm" },
  { id: "soft", label: "soft" },
  { id: "tender", label: "tender" },
  { id: "bright", label: "bright" },
  { id: "tired", label: "tired" },
  { id: "tense", label: "tense" },
];

const QUICK_SYMPTOMS = [
  "cramps", "bloating", "headache", "low energy", "tender breasts", "clear skin",
];

interface Props {
  dateStr: string;
  phase: Phase;
  onOpenFull?: () => void;
  onChange?: () => void;
}

export default function QuickLogPills({ dateStr, phase, onOpenFull, onChange }: Props) {
  const [moods, setLocalMoods] = useState<string[]>(() => getMoods(dateStr));
  const [symptoms, setLocalSymptoms] = useState<string[]>(() => getSymptomsNew(dateStr));
  const [showSymptoms, setShowSymptoms] = useState(false);
  const phaseColor = PHASE_HEX[phase];

  useEffect(() => {
    setLocalMoods(getMoods(dateStr));
    setLocalSymptoms(getSymptomsNew(dateStr));
  }, [dateStr]);

  const toggleMood = (id: string) => {
    haptic("light");
    const next = moods.includes(id) ? moods.filter((m) => m !== id) : [...moods, id];
    setLocalMoods(next);
    setMoods(dateStr, next);
    onChange?.();
    if (!moods.includes(id)) toast.success("Held.", { duration: 1400 });
  };

  const toggleSymptom = (id: string) => {
    haptic("light");
    const next = symptoms.includes(id) ? symptoms.filter((s) => s !== id) : [...symptoms, id];
    setLocalSymptoms(next);
    setSymptomsNew(dateStr, next);
    onChange?.();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between px-1">
        <p className="font-hand text-sm text-muted-foreground">how today feels in your body</p>
        {(moods.length > 0 || symptoms.length > 0) && (
          <span className="font-hand text-[11px] text-muted-foreground/60">
            {moods.length + symptoms.length} held
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {MOODS.map((m) => {
          const on = moods.includes(m.id);
          return (
            <button
              key={m.id}
              onClick={() => toggleMood(m.id)}
              className="touch-btn rounded-full px-3.5 py-2 min-h-[40px] font-body text-xs font-medium transition-all border"
              style={{
                backgroundColor: on ? `${phaseColor}1A` : "transparent",
                borderColor: on ? `${phaseColor}66` : "hsl(var(--border))",
                color: on ? phaseColor : "hsl(var(--muted-foreground))",
              }}
            >
              {on && <Check className="inline h-3 w-3 mr-1" />}
              {m.label}
            </button>
          );
        })}
        <button
          onClick={() => { haptic("light"); setShowSymptoms((s) => !s); }}
          className="touch-btn rounded-full px-3.5 py-2 min-h-[40px] font-body text-xs font-medium border border-dashed text-muted-foreground hover:text-foreground transition-all"
          style={{ borderColor: "hsl(var(--border))" }}
        >
          <Plus className="inline h-3 w-3 mr-1" />
          {symptoms.length > 0 ? `body (${symptoms.length})` : "body"}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {showSymptoms && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="pt-1 flex flex-wrap gap-2">
              {QUICK_SYMPTOMS.map((s) => {
                const on = symptoms.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => toggleSymptom(s)}
                    className="touch-btn rounded-full px-3 py-1.5 min-h-[36px] font-body text-[11px] transition-all border"
                    style={{
                      backgroundColor: on ? `${phaseColor}14` : "transparent",
                      borderColor: on ? `${phaseColor}55` : "hsl(var(--border))",
                      color: on ? phaseColor : "hsl(var(--muted-foreground))",
                    }}
                  >
                    {on && <Check className="inline h-3 w-3 mr-1" />}
                    {s}
                  </button>
                );
              })}
              {onOpenFull && (
                <button
                  onClick={() => { haptic("light"); onOpenFull(); }}
                  className="touch-btn rounded-full px-3 py-1.5 min-h-[36px] font-hand text-[12px] text-primary"
                >
                  more →
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
