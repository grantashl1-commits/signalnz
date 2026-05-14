import { motion } from "framer-motion";
import { Flame } from "lucide-react";

interface Props {
  streak: number;
  weekMinutes: number;
  weekSessions: number;
  weeklyByDay: { date: string; minutes: number }[];
}

const DOW = ["S", "M", "T", "W", "T", "F", "S"];

export default function BreathworkStreakHeader({ streak, weekMinutes, weekSessions, weeklyByDay }: Props) {
  const todayStr = new Date().toISOString().split("T")[0];
  const maxMin = Math.max(1, ...weeklyByDay.map(d => d.minutes));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-[20px] bg-card shadow-soft p-5 mb-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-primary" />
          <p className="font-display text-base italic text-foreground">
            <span className="font-bold not-italic text-primary">{streak}</span>{" "}
            {streak === 1 ? "day" : "days"} of breathwork
          </p>
        </div>
        <p className="font-hand text-xs text-bloom">
          {weekSessions} {weekSessions === 1 ? "session" : "sessions"} · {weekMinutes} min
        </p>
      </div>

      <div className="flex items-end justify-between gap-1">
        {weeklyByDay.map((d) => {
          const isToday = d.date === todayStr;
          const dow = new Date(d.date + "T12:00:00").getDay();
          const pct = (d.minutes / maxMin) * 100;
          return (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full h-9 flex items-end">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(pct, d.minutes > 0 ? 18 : 4)}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="w-full rounded-t-[4px]"
                  style={{
                    backgroundColor: d.minutes > 0
                      ? (isToday ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.5)")
                      : "hsl(var(--border))",
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

      {streak === 0 && weekSessions === 0 && (
        <p className="font-display text-xs italic text-muted-foreground mt-3 text-center">
          A first breath. That's the whole beginning.
        </p>
      )}
    </motion.div>
  );
}
