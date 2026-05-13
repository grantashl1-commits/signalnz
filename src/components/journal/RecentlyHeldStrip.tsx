import { motion } from "framer-motion";
import type { JournalEntryRow } from "@/hooks/useStoicJournal";

interface Props {
  entries: JournalEntryRow[];
  onOpen: (entry: JournalEntryRow) => void;
}

/** Horizontal carousel of the 5 most recently held entries — one-tap to detail. */
export default function RecentlyHeldStrip({ entries, onOpen }: Props) {
  const recent = entries.slice(0, 5);
  if (recent.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground px-1">
        Recently held
      </p>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-5 px-5 pb-1">
        {recent.map((e) => {
          const d = new Date(e.created_at);
          const isToday = d.toDateString() === new Date().toDateString();
          const dateLabel = isToday
            ? "Today"
            : d.toLocaleDateString("en-NZ", { weekday: "short", day: "numeric" });
          const preview = (e.content || Object.values(e.prompts || {}).filter(Boolean).join(" ") || "").slice(0, 80);
          return (
            <motion.button
              key={e.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => onOpen(e)}
              className="shrink-0 w-[180px] text-left rounded-2xl bg-card border border-border/30 p-3 active:opacity-80 transition-opacity"
            >
              <p className="font-body text-[10px] text-muted-foreground mb-1">
                {dateLabel}
                {e.cycle_phase ? ` · ${e.cycle_phase}` : ""}
              </p>
              <p className="font-hand text-sm text-foreground leading-snug line-clamp-3">
                {preview || "—"}
              </p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
