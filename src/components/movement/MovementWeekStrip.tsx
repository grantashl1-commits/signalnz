/**
 * MovementWeekStrip — 7-day mini bar of movement minutes (workouts logged).
 * Reads from getLoggedWorkouts() to surface "this week" at a glance.
 */
import { useMemo } from "react";
import { motion } from "framer-motion";
import { getLoggedWorkouts } from "@/lib/cycle-utils";

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export default function MovementWeekStrip() {
  const { perDay, total } = useMemo(() => {
    const perDay: number[] = Array(7).fill(0);
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    let total = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const ds = d.toISOString().split("T")[0];
      const list = getLoggedWorkouts(ds);
      // Approximate 30 minutes per logged workout (no duration in localStorage shape).
      const min = list.length * 30;
      perDay[i] = min;
      total += min;
    }
    return { perDay, total };
  }, []);

  const max = Math.max(60, ...perDay);
  const todayIdx = new Date().getDay();

  return (
    <div className="rounded-[16px] bg-card p-4" style={{ boxShadow: "var(--shadow-soft)" }}>
      <div className="flex items-baseline justify-between mb-3">
        <p className="font-hand text-[12px] text-muted-foreground">this week</p>
        <p className="font-body text-xs text-foreground">
          <span className="font-semibold">{total}</span> min held
        </p>
      </div>
      <div className="flex items-end justify-between gap-1.5 h-16">
        {perDay.map((min, i) => {
          const h = Math.max(4, (min / max) * 100);
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="flex-1 w-full flex items-end">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: i * 0.04, duration: 0.5, ease: "easeOut" }}
                  className="w-full rounded-t-md"
                  style={{
                    backgroundColor: min > 0 ? "hsl(var(--primary))" : "hsl(var(--muted))",
                    opacity: i === todayIdx ? 1 : min > 0 ? 0.65 : 0.3,
                  }}
                />
              </div>
              <span
                className={`font-body text-[9px] ${
                  i === todayIdx ? "text-foreground font-semibold" : "text-muted-foreground/60"
                }`}
              >
                {DAY_LABELS[i]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
