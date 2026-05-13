import { motion } from "framer-motion";
import { useMemo } from "react";
import type { JournalEntryRow } from "@/hooks/useStoicJournal";

interface Props {
  entries: JournalEntryRow[];
  onQuickOneLine?: () => void;
}

/** Weekly rhythm strip — shown at top of Write tab. Days returned this week,
 *  total words held, gentle nudge to one-line if today is empty. */
export default function WeeklyJournalRhythm({ entries, onQuickOneLine }: Props) {
  const stats = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    const day = now.getDay(); // Sun=0
    const diff = (day + 6) % 7; // Mon-start
    startOfWeek.setDate(now.getDate() - diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const todayStr = now.toDateString();
    const daysReturned = new Set<string>();
    let words = 0;
    let todayHasEntry = false;

    for (const e of entries) {
      const d = new Date(e.created_at);
      if (d >= startOfWeek) {
        daysReturned.add(d.toDateString());
        words += e.word_count || 0;
        if (d.toDateString() === todayStr) todayHasEntry = true;
      }
    }
    return { daysReturned: daysReturned.size, words, todayHasEntry };
  }, [entries]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-secondary/40 border border-border/30 px-4 py-3 flex items-center justify-between gap-3"
    >
      <div className="flex-1 min-w-0">
        <p className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
          This week
        </p>
        <p className="font-display italic text-sm text-foreground leading-snug">
          {stats.daysReturned === 0
            ? "A blank page is a beginning."
            : `You returned ${stats.daysReturned} ${stats.daysReturned === 1 ? "day" : "days"} · ${stats.words} words held`}
        </p>
      </div>
      {!stats.todayHasEntry && onQuickOneLine && (
        <button
          onClick={onQuickOneLine}
          className="touch-btn shrink-0 rounded-xl bg-card border border-border/40 px-3 py-2 min-h-[44px] font-body text-xs font-bold text-foreground active:opacity-80 transition-opacity"
        >
          One line
        </button>
      )}
    </motion.div>
  );
}
