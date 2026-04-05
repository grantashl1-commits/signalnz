import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { JournalEntryRow } from "@/hooks/useStoicJournal";

const PHASE_HEX: Record<string, string> = {
  menstrual: "#C4526E",
  follicular: "#5C4A9E",
  ovulatory: "#C47A8A",
  luteal: "#9B89B4",
};

interface Props {
  entries: JournalEntryRow[];
  onTapDay: (date: string, entry?: JournalEntryRow) => void;
}

export default function PhaseHeatMap({ entries, onTapDay }: Props) {
  const [offset, setOffset] = useState(0); // 0 = current 28 days

  const { days, rangeLabel } = useMemo(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - 27 + offset * 28);

    const daysArr: { date: string; dayNum: number; entry?: JournalEntryRow; phase?: string }[] = [];

    for (let i = 0; i < 28; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      const entry = entries.find((e) => e.date === dateStr || e.created_at?.startsWith(dateStr));
      daysArr.push({
        date: dateStr,
        dayNum: d.getDate(),
        entry,
        phase: entry?.cycle_phase || undefined,
      });
    }

    const s = new Date(start);
    const e = new Date(start);
    e.setDate(e.getDate() + 27);
    const label = `${s.toLocaleDateString("en-NZ", { month: "short" })} ${s.getDate()} – ${e.toLocaleDateString("en-NZ", { month: "short" })} ${e.getDate()}`;

    return { days: daysArr, rangeLabel: label };
  }, [entries, offset]);

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setOffset((o) => o - 1)}
          className="touch-btn min-w-[36px] min-h-[36px] flex items-center justify-center text-muted-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="font-mono text-[11px] text-muted-foreground">{rangeLabel}</span>
        <button
          onClick={() => setOffset((o) => Math.min(o + 1, 0))}
          disabled={offset >= 0}
          className="touch-btn min-w-[36px] min-h-[36px] flex items-center justify-center text-muted-foreground disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-1">
        {days.map((day) => {
          const color = day.phase ? PHASE_HEX[day.phase] : undefined;
          const hasEntry = !!day.entry;
          const hasLens = !!(day.entry?.stoic_lens);
          const isToday = day.date === new Date().toISOString().split("T")[0];

          return (
            <motion.button
              key={day.date}
              onClick={() => onTapDay(day.date, day.entry || undefined)}
              className="touch-btn flex-shrink-0 flex flex-col items-center gap-0.5"
              whileTap={{ scale: 0.92 }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center relative transition-all"
                style={{
                  backgroundColor: color
                    ? hasEntry ? `${color}` : `${color}30`
                    : hasEntry ? "hsl(var(--muted-foreground) / 0.3)" : "hsl(var(--muted) / 0.4)",
                  border: isToday ? "2px solid hsl(var(--primary))" : "none",
                }}
              >
                {hasEntry && (
                  <span className="text-[9px] font-mono" style={{ color: color ? "#fff" : "hsl(var(--foreground))" }}>
                    ✓
                  </span>
                )}
                {hasLens && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-phase-follicular border border-background" />
                )}
              </div>
              <span className="font-mono text-[8px] text-muted-foreground/60">{day.dayNum}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
