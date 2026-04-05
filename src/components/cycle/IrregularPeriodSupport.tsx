import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Heart, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import { haptic } from "@/hooks/use-mobile";

interface Props {
  onNavigateToTraining?: () => void;
}

export default function IrregularPeriodSupport({ onNavigateToTraining }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [flagged, setFlagged] = useState(() => localStorage.getItem("periodIrregularFlag") === "true");

  const handleFlag = () => {
    haptic("medium");
    const newVal = !flagged;
    setFlagged(newVal);
    localStorage.setItem("periodIrregularFlag", String(newVal));
  };

  return (
    <div className="space-y-4">
      {/* Flag toggle */}
      <button
        onClick={handleFlag}
        className={`touch-btn w-full card-warm p-4 text-left transition-all ${flagged ? "ring-1 ring-primary" : ""}`}
      >
        <div className="flex items-start gap-3">
          <AlertCircle className={`h-5 w-5 shrink-0 mt-0.5 ${flagged ? "text-primary" : "text-muted-foreground"}`} />
          <div>
            <p className="font-display text-sm italic text-foreground">
              my period has stopped or is very irregular
            </p>
            <p className="font-body text-xs text-muted-foreground mt-1">
              {flagged ? "Flagged — we've adjusted your experience." : "Tap to let Signal know."}
            </p>
          </div>
        </div>
      </button>

      {/* Education when flagged */}
      <AnimatePresence>
        {flagged && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden space-y-4"
          >
            {/* Compassionate response */}
            <div className="card-warm p-4 border-l-2 border-primary">
              <div className="flex items-start gap-2 mb-3">
                <Heart className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="font-display text-sm italic text-foreground">we hear you</p>
              </div>
              <p className="font-body text-xs text-muted-foreground leading-relaxed">
                Missing or irregular periods can have several causes. This is not something to panic about — but it's
                worth understanding what might be happening.
              </p>
            </div>

            {/* Possible causes */}
            <button
              onClick={() => { haptic("light"); setExpanded(!expanded); }}
              className="touch-btn w-full card-warm p-4 text-left"
            >
              <div className="flex items-center justify-between">
                <p className="font-hand text-sm font-bold text-primary">possible causes</p>
                {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </div>
            </button>

            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-3 px-1">
                    {[
                      {
                        title: "Hypothalamic amenorrhea (HA)",
                        text: "Common in women who are under-fueling or over-training. Your body pauses reproduction when it senses insufficient energy. This is reversible with appropriate nutrition and reduced training intensity.",
                      },
                      {
                        title: "Perimenopause",
                        text: "If you're in your late 30s to 50s, irregular periods may signal the beginning of perimenopause. This is a natural transition — not something wrong.",
                      },
                      {
                        title: "Post-hormonal contraception",
                        text: "After stopping hormonal contraception, it can take several months for your natural cycle to return. This is normal but should be monitored.",
                      },
                    ].map((cause) => (
                      <div key={cause.title} className="card-warm p-3">
                        <p className="font-hand text-xs font-bold text-foreground mb-1">{cause.title}</p>
                        <p className="font-body text-[11px] text-muted-foreground leading-relaxed">{cause.text}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* GP signpost */}
            <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-4">
              <p className="font-body text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                If your period has been absent for 3+ months and you're not in perimenopause or post-menopause,
                we recommend speaking to your GP or a women's health specialist.
              </p>
              <p className="font-hand text-[10px] text-amber-600 mt-1">— Rinaldi, No Period Now What</p>
            </div>

            {/* Training adjustment */}
            {onNavigateToTraining && (
              <button
                onClick={() => { haptic("light"); onNavigateToTraining(); }}
                className="touch-btn w-full card-warm p-4 text-left flex items-center justify-between"
              >
                <div>
                  <p className="font-hand text-sm font-bold text-primary">gentle movement programs</p>
                  <p className="font-body text-xs text-muted-foreground">
                    Nervous System Reset & Gentle Daily Movement — designed for recovery
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-primary" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
