import { useMemo } from "react";
import { motion } from "framer-motion";
import { Leaf } from "lucide-react";
import type { Habit } from "@/data/self-care-rituals";

interface Props {
  habits: Habit[];
  history: Record<string, Set<string>>;
  phaseColor: string;
}

function last7(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });
}

/** Sunday-only "Weekly ritual review" card. */
export default function WeeklyRitualReview({ habits, history, phaseColor }: Props) {
  const isSunday = new Date().getDay() === 0;

  const stats = useMemo(() => {
    const days = last7();
    return habits.map((h) => {
      const count = days.filter((d) => history[d]?.has(h.id)).length;
      return { id: h.id, name: h.name, count };
    });
  }, [habits, history]);

  if (!isSunday || habits.length === 0) return null;

  const sorted = [...stats].sort((a, b) => b.count - a.count);
  const strongest = sorted[0];
  const quietest = sorted[sorted.length - 1];
  const totalReturns = stats.reduce((s, h) => s + h.count, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 }}
      className="rounded-[22px] shadow-soft p-6 mb-6 border"
      style={{
        background: `linear-gradient(135deg, ${phaseColor}10, hsl(var(--card)))`,
        borderColor: `${phaseColor}30`,
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <Leaf className="h-4 w-4" style={{ color: phaseColor }} />
        <p className="font-body text-[10px] uppercase tracking-[0.2em]" style={{ color: phaseColor }}>
          Sunday review
        </p>
      </div>
      <h3 className="font-display text-xl italic font-bold text-foreground leading-snug mb-3">
        A quiet look back at your week.
      </h3>
      <p className="font-hand text-sm text-bloom mb-4">
        You returned {totalReturns} {totalReturns === 1 ? "time" : "times"} this week.
      </p>

      <div className="space-y-2.5">
        {strongest && strongest.count > 0 && (
          <div className="rounded-[14px] bg-card/80 p-3">
            <p className="font-body text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
              Most held
            </p>
            <p className="font-display text-sm font-semibold text-foreground">
              {strongest.name}
              <span className="font-hand text-xs font-normal text-bloom ml-1.5">
                · {strongest.count}/7 days
              </span>
            </p>
          </div>
        )}
        {quietest && quietest.id !== strongest?.id && quietest.count < 4 && (
          <div className="rounded-[14px] bg-card/80 p-3">
            <p className="font-body text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
              Quietly waiting
            </p>
            <p className="font-display text-sm font-semibold text-foreground/80">
              {quietest.name}
              <span className="font-hand text-xs font-normal text-muted-foreground ml-1.5">
                · {quietest.count}/7 days
              </span>
            </p>
            <p className="font-display text-[11px] italic text-muted-foreground mt-1">
              No need to fix it. Just notice.
            </p>
          </div>
        )}
      </div>

      <p className="font-display text-xs italic text-muted-foreground mt-4 text-center">
        A new week begins tomorrow.
      </p>
    </motion.div>
  );
}
