import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { getHabits, getHabitLog } from "@/data/self-care-rituals";

interface Props {
  phaseColor: string;
}

function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return ["S", "M", "T", "W", "T", "F", "S"][d.getDay()];
}

function getCompletionPct(dateStr: string): number {
  const habits = getHabits();
  if (habits.length === 0) return 0;
  const log = getHabitLog(dateStr);
  const completed = habits.filter(h => log[h.id]).length;
  return (completed / habits.length) * 100;
}

function calculateStreak(): { current: number; best: number } {
  let current = 0;
  let best = 0;
  let streak = 0;
  const habits = getHabits();
  if (habits.length === 0) return { current: 0, best: 0 };

  for (let i = 0; i < 90; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const pct = getCompletionPct(dateStr);

    if (pct >= 80) {
      streak++;
      if (i === 0 || (i > 0 && streak > 0)) {
        // continuing streak
      }
    } else {
      if (i === 0 && pct < 80) {
        // today not complete, check if yesterday was
      }
      if (streak > best) best = streak;
      if (i === 0) {
        // today incomplete — streak might still be alive from yesterday
        continue;
      }
      if (current === 0) current = streak;
      streak = 0;
    }
  }
  if (streak > best) best = streak;
  if (current === 0) current = streak;

  return { current, best };
}

export default function ConsistencyStrip({ phaseColor }: Props) {
  const days = getLast7Days();
  const dayData = days.map(d => ({ date: d, pct: getCompletionPct(d) }));
  const todayPct = dayData[dayData.length - 1]?.pct || 0;
  const daysComplete = dayData.filter(d => d.pct >= 80).length;
  const { current, best } = calculateStreak();

  return (
    <div className="rounded-[18px] bg-card p-5 shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {current > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1.5"
            >
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="font-body text-sm font-semibold text-foreground">
                {current} day streak
              </span>
            </motion.div>
          )}
        </div>
        <div className="flex items-center gap-3 font-body text-xs text-muted-foreground">
          {best > 0 && <span>Best: {best} days</span>}
          <span>This week: {daysComplete}/7</span>
        </div>
      </div>

      <div className="flex items-center gap-2 justify-between">
        {dayData.map((d, i) => {
          const isToday = i === dayData.length - 1;
          return (
            <div key={d.date} className="flex flex-col items-center gap-1.5">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all"
                style={{
                  borderColor: d.pct === 0 ? "hsl(var(--border))" : phaseColor,
                  backgroundColor:
                    d.pct >= 80 ? phaseColor :
                    d.pct > 0 ? `${phaseColor}66` : "transparent",
                  boxShadow: isToday ? `0 0 0 2px ${phaseColor}33` : undefined,
                }}
              />
              <span className={`font-body text-[10px] ${isToday ? "font-bold text-foreground" : "text-muted-foreground"}`}>
                {getDayLabel(d.date)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
