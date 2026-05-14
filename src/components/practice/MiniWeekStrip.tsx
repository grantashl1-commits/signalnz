import { motion } from "framer-motion";

interface Props {
  history: Record<string, Set<string>>;
  totalHabits: number;
  phaseColor: string;
}

function last7(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });
}

const DOW = ["S", "M", "T", "W", "T", "F", "S"];

export default function MiniWeekStrip({ history, totalHabits, phaseColor }: Props) {
  const days = last7();
  const todayStr = new Date().toISOString().split("T")[0];
  const completedDays = days.filter(d => (history[d]?.size ?? 0) > 0).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 }}
      className="rounded-[18px] bg-card shadow-soft p-4 mb-4"
    >
      <div className="flex items-center justify-between mb-2.5">
        <p className="font-body text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
          Last 7 days
        </p>
        <p className="font-hand text-xs text-bloom">
          {completedDays} {completedDays === 1 ? "day" : "days"} returned
        </p>
      </div>
      <div className="flex items-end justify-between gap-1">
        {days.map((day) => {
          const done = history[day]?.size ?? 0;
          const pct = totalHabits > 0 ? Math.min(1, done / totalHabits) : 0;
          const isToday = day === todayStr;
          const dow = new Date(day + "T12:00:00").getDay();
          return (
            <div key={day} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full h-10 flex items-end">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(pct * 100, done > 0 ? 12 : 4)}%` }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  className="w-full rounded-[4px]"
                  style={{
                    backgroundColor: done > 0 ? `${phaseColor}${isToday ? "" : "70"}` : "hsl(var(--border))",
                    minHeight: 3,
                  }}
                />
              </div>
              <span className={`font-body text-[9px] ${isToday ? "font-bold text-foreground" : "text-muted-foreground/70"}`}>
                {DOW[dow]}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
