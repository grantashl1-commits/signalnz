import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, ChevronDown } from "lucide-react";
import { ORGAN_CLOCK } from "@/data/habit-library";

export default function OrganClockCard() {
  const [expanded, setExpanded] = useState(false);

  // Determine current organ based on hour
  const hour = new Date().getHours();
  const currentIdx = Math.floor(((hour + 21) % 24) / 2); // maps 3am=0, 5am=1, etc.

  return (
    <div className="rounded-[18px] bg-card p-5 shadow-soft">
      <button
        onClick={() => setExpanded(!expanded)}
        className="touch-btn w-full flex items-center gap-3 text-left"
      >
        <Clock className="h-5 w-5 text-primary flex-shrink-0" />
        <div className="flex-1">
          <p className="font-display text-base font-semibold text-foreground">
            Chinese Medicine Organ Clock
          </p>
          <p className="font-body text-xs text-muted-foreground mt-0.5">
            Each organ has a 2-hour peak activity window
          </p>
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-1">
              {ORGAN_CLOCK.map((entry, i) => {
                const isCurrent = i === currentIdx;
                return (
                  <div
                    key={entry.organ}
                    className={`flex items-start gap-3 rounded-lg px-3 py-2 transition-colors ${
                      isCurrent ? "bg-primary/10" : ""
                    }`}
                  >
                    <span className="font-mono text-xs text-muted-foreground w-16 flex-shrink-0 pt-0.5">
                      {entry.time}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className={`font-body text-sm font-medium ${isCurrent ? "text-primary" : "text-foreground"}`}>
                        {entry.organ}
                      </span>
                      <p className="font-body text-xs text-muted-foreground mt-0.5">
                        {entry.connection}
                      </p>
                    </div>
                    {isCurrent && (
                      <span className="font-body text-[10px] uppercase tracking-wider text-primary bg-primary/10 rounded-full px-2 py-0.5 flex-shrink-0">
                        Now
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 p-3 rounded-lg bg-secondary/50">
              <p className="font-body text-xs text-muted-foreground italic leading-relaxed">
                "Working with this clock — rather than against it — is one of the simplest ways to support your body's natural rhythms."
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
