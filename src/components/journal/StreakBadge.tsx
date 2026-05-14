import { useMemo } from "react";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import type { JournalEntryRow } from "@/hooks/useStoicJournal";

interface Props {
  entries: JournalEntryRow[];
}

/** Count consecutive days (ending today or yesterday) the user has returned to journal. */
function calcStreak(entries: JournalEntryRow[]): number {
  if (!entries.length) return 0;
  const days = new Set<string>();
  for (const e of entries) {
    const d = new Date(e.created_at);
    d.setHours(0, 0, 0, 0);
    days.add(d.toDateString());
  }
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  // If today missing, allow streak to count from yesterday
  if (!days.has(cursor.toDateString())) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(cursor.toDateString())) return 0;
  }
  while (days.has(cursor.toDateString())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export default function StreakBadge({ entries }: Props) {
  const streak = useMemo(() => calcStreak(entries), [entries]);
  if (streak === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex items-center gap-1.5 rounded-full bg-primary/8 border border-primary/15 px-3 py-1"
    >
      <motion.span
        animate={{ scale: [1, 1.12, 1] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        className="inline-flex"
      >
        <Flame className="h-3.5 w-3.5 text-primary" fill="hsl(14, 100%, 64%, 0.25)" />
      </motion.span>
      <span className="font-body text-[11px] text-foreground">
        <span className="font-bold">{streak}</span>{" "}
        <span className="text-muted-foreground">{streak === 1 ? "day you've returned" : "days you've returned"}</span>
      </span>
    </motion.div>
  );
}
