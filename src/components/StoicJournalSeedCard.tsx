import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Play, ChevronDown, ChevronUp } from "lucide-react";
import { haptic } from "@/hooks/use-mobile";
import type { StoicReading } from "@/hooks/useStoicJournal";

interface Props {
  reading: StoicReading;
  currentDay: number;
  listenedToday: boolean;
  collapsed?: boolean;
  onListen: () => void;
  onSkip?: () => void;
}

export default function StoicJournalSeedCard({ reading, currentDay, listenedToday, collapsed: initialCollapsed, onListen, onSkip }: Props) {
  const [collapsed, setCollapsed] = useState(initialCollapsed || false);

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="w-full flex items-center gap-2 rounded-xl bg-secondary/40 px-4 py-2.5 mb-4"
      >
        <BookOpen className="h-4 w-4 text-primary" />
        <span className="font-body text-[11px] text-muted-foreground">Day {currentDay}</span>
        <span className="font-display text-sm italic text-foreground truncate flex-1 text-left">{reading.title}</span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-primary/15 bg-primary/[0.03] p-5 mb-5 space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <span className="font-body text-[11px] uppercase tracking-wider text-primary">Today's Philosophy · Day {currentDay}</span>
        </div>
        <button onClick={() => setCollapsed(true)} className="touch-btn text-muted-foreground">
          <ChevronUp className="h-4 w-4" />
        </button>
      </div>

      <h3 className="font-display text-xl italic text-foreground leading-snug">"{reading.title}"</h3>

      <blockquote className="font-display text-sm italic text-muted-foreground leading-relaxed border-l-2 border-primary/20 pl-4">
        "{reading.quote}"
        <footer className="font-body text-[10px] text-muted-foreground/60 mt-1 not-italic">— {reading.author}, {reading.source}</footer>
      </blockquote>

      <div className="flex gap-3">
        <button
          onClick={() => { haptic("medium"); onListen(); }}
          className={`touch-btn flex-1 flex items-center justify-center gap-2 rounded-xl py-3 font-display text-sm italic transition-all ${
            listenedToday
              ? "bg-primary/10 text-primary"
              : "bg-primary text-primary-foreground active:scale-[0.97]"
          }`}
        >
          {listenedToday ? (
            <>✓ Listened today</>
          ) : (
            <><Play className="h-4 w-4" /> Listen before you write · {Math.round((reading.duration_sec || 240) / 60)} min</>
          )}
        </button>
        {onSkip && (
          <button
            onClick={onSkip}
            className="rounded-xl px-4 py-3 font-body text-sm text-muted-foreground hover:bg-muted/60 transition-colors"
          >
            Skip for now
          </button>
        )}
      </div>

      {reading.journal_prompt && (
        <div className="pt-2 border-t border-border/40">
          <p className="font-body text-xs text-muted-foreground/60 mb-1">A question to write toward:</p>
          <p className="font-display text-sm italic text-foreground leading-relaxed">{reading.journal_prompt}</p>
        </div>
      )}
    </motion.div>
  );
}
