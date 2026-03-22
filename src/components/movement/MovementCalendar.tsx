import { useState } from "react";
import { motion } from "framer-motion";
import { Dumbbell, Star } from "lucide-react";
import { useCycle } from "@/contexts/CycleContext";
import { getPhaseFromDay, getCycleDayForDate, getLoggedWorkouts } from "@/lib/cycle-utils";
import { getAllSessions, type WorkoutSession } from "@/data/workouts";
import { PhaseIndicator, WildStar } from "@/components/BotanicalElements";
import { haptic } from "@/hooks/use-mobile";

const PHASE_HEX: Record<string, string> = {
  menstrual: "#C4526E", follicular: "#5C4A9E", ovulatory: "#C47A8A", luteal: "#9B89B4",
};

export default function MovementCalendar() {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  const lastPeriod = getLastPeriodStart();
  const sessions = getAllSessions();
  const todayStr = today.toISOString().split("T")[0];

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7; // Mon=0

  const monthName = new Date(viewYear, viewMonth).toLocaleDateString("en-NZ", { month: "long", year: "numeric" });

  // Stats
  let workoutDays = 0;
  let starDays = 0;
  let restDays = 0;

  const dayCells: { date: Date; dateStr: string; hasWorkout: boolean; hasStar: boolean; isRest: boolean; phase: string }[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(viewYear, viewMonth, d);
    const dateStr = date.toISOString().split("T")[0];
    const logged = getLoggedWorkouts(dateStr);
    const session = sessions.find(s => s.date === dateStr);
    const hasStar = session ? session.zone2PlusPercent >= 60 || session.zoneMins.slice(1).reduce((s, m) => s + m, 0) >= 21 : false;
    const cycleDay = lastPeriod ? getCycleDayForDate(lastPeriod, date) : 8;
    const phase = getPhaseFromDay(cycleDay);
    const hasWorkout = logged.length > 0 || !!session;
    const isRest = !hasWorkout && phase === "menstrual";

    if (hasWorkout) workoutDays++;
    if (hasStar) starDays++;
    if (isRest) restDays++;

    dayCells.push({ date, dateStr, hasWorkout, hasStar, isRest, phase });
  }

  // Movement streak
  let streak = 0;
  for (let i = 0; i < 90; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const logged = getLoggedWorkouts(dateStr);
    const session = sessions.find(s => s.date === dateStr);
    if (logged.length > 0 || session) streak++;
    else break;
  }

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  return (
    <div className="space-y-4">
      {/* Month nav */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="touch-btn font-mono text-sm text-muted-foreground px-3 py-1">←</button>
        <h3 className="font-display text-base italic text-foreground">{monthName}</h3>
        <button onClick={nextMonth} className="touch-btn font-mono text-sm text-muted-foreground px-3 py-1">→</button>
      </div>

      {/* Summary */}
      <p className="font-body text-xs text-muted-foreground text-center">
        {workoutDays} workouts · {starDays} Zone 2+ days · {restDays} rest days
      </p>

      {streak > 0 && (
        <p className="font-hand text-sm text-primary text-center flex items-center justify-center gap-1.5">
          <WildStar size={14} /> {streak} days moving
        </p>
      )}

      {/* Calendar grid */}
      <div className="card-warm p-3">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <div key={i} className="text-center">
              <span className="font-body text-[9px] text-muted-foreground">{d}</span>
            </div>
          ))}
        </div>

        {/* Calendar cells */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for offset */}
          {Array.from({ length: firstDayOfWeek }, (_, i) => (
            <div key={`empty-${i}`} className="h-11" />
          ))}

          {dayCells.map(cell => {
            const isToday = cell.dateStr === todayStr;
            return (
              <div
                key={cell.dateStr}
                className={`h-11 rounded-lg flex flex-col items-center justify-center relative transition-all ${
                  cell.hasWorkout
                    ? ""
                    : cell.isRest
                    ? "border border-sage-mist/30"
                    : "bg-secondary/20"
                } ${isToday ? "ring-2 ring-primary" : ""} ${cell.hasStar ? "ring-2 ring-petal-gold" : ""}`}
                style={cell.hasWorkout ? { backgroundColor: `${PHASE_HEX[cell.phase]}20` } : undefined}
              >
                <span className={`font-mono text-[10px] ${cell.hasWorkout ? "text-foreground font-bold" : "text-muted-foreground"}`}>
                  {cell.date.getDate()}
                </span>
                {cell.hasStar && <WildStar size={10} color={PHASE_HEX[cell.phase]} />}
                {cell.hasWorkout && !cell.hasStar && (
                  <PhaseIndicator phase={cell.phase as any} size={10} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
