import { useState, useMemo } from "react";
import { useCycle } from "@/contexts/CycleContext";
import { getLoggedWorkouts } from "@/lib/cycle-utils";
import { getAllSessions, WORKOUTS } from "@/data/workouts";
import { WildStar } from "@/components/BotanicalElements";

const REST_IDS = new Set(["rest-walk-restore", "mobility-flow"]);

export default function MovementCalendar() {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const todayStr = today.toISOString().split("T")[0];

  const sessions = useMemo(() => getAllSessions(), []);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
  const monthName = new Date(viewYear, viewMonth).toLocaleDateString("en-NZ", { month: "long", year: "numeric" });

  // Build per-day data
  const { dayCells, workoutCount, totalMinutes, zone2Days, activityDays, restDays, elapsedDays } = useMemo(() => {
    const cells: { day: number; dateStr: string; hasWorkout: boolean; isZone2: boolean; isRest: boolean; isToday: boolean; isPast: boolean }[] = [];
    let wCount = 0;
    let mins = 0;
    let z2 = 0;
    let actDays = 0;
    let rDays = 0;
    let elapsed = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(viewYear, viewMonth, d);
      const dateStr = date.toISOString().split("T")[0];
      const isToday = dateStr === todayStr;
      const isPast = date < today && !isToday;

      const logged = getLoggedWorkouts(dateStr);
      const session = sessions.find(s => s.date === dateStr);
      const hasWorkout = logged.length > 0 || !!session;

      // Is it a rest/recovery workout?
      const isRestWorkout = logged.length > 0 && logged.every(id => REST_IDS.has(id));

      // Zone 2+ = has a real (non-rest) workout
      const isZone2 = hasWorkout && !isRestWorkout;

      // Marked rest = user completed a rest-type workout
      const isRest = isRestWorkout;

      if (isPast || isToday) elapsed++;

      if (hasWorkout) {
        wCount++;
        actDays++;
        // Duration: prefer session data, fallback to workout durationMin
        if (session) {
          mins += Math.round(session.duration / 60);
        } else {
          for (const id of logged) {
            const w = WORKOUTS.find(x => x.id === id);
            if (w) mins += w.durationMin;
          }
        }
      }

      if (isZone2) z2++;

      // Rest day = past day with no activity logged, or active rest workout
      if ((isPast && !hasWorkout) || isRest) rDays++;

      cells.push({ day: d, dateStr, hasWorkout, isZone2, isRest, isToday, isPast });
    }

    return { dayCells: cells, workoutCount: wCount, totalMinutes: mins, zone2Days: z2, activityDays: actDays, restDays: rDays, elapsedDays: elapsed };
  }, [viewYear, viewMonth, daysInMonth, todayStr, sessions]);

  const consistency = elapsedDays > 0 ? Math.round((activityDays / elapsedDays) * 100) : 0;

  // Streak
  const streak = useMemo(() => {
    let s = 0;
    for (let i = 0; i < 90; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const logged = getLoggedWorkouts(dateStr);
      const session = sessions.find(ss => ss.date === dateStr);
      if (logged.length > 0 || session) s++;
      else break;
    }
    return s;
  }, [sessions]);

  // Current week strip
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const weekDays = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + mondayOffset + i);
      const dateStr = d.toISOString().split("T")[0];
      const logged = getLoggedWorkouts(dateStr);
      const session = sessions.find(s => s.date === dateStr);
      return { date: d, dateStr, hasWorkout: logged.length > 0 || !!session, isToday: dateStr === todayStr };
    }), [sessions, mondayOffset]);

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
        {workoutCount} workouts · {zone2Days} Zone 2+ days · {restDays} rest days
      </p>

      {streak > 0 && (
        <p className="font-hand text-sm text-primary text-center flex items-center justify-center gap-1.5">
          <WildStar size={14} /> {streak} days moving
        </p>
      )}

      {/* Calendar grid */}
      <div className="card-warm p-3">
        <div className="grid grid-cols-7 gap-1 mb-1">
          {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d, i) => (
            <div key={i} className="text-center">
              <span className="font-body text-[9px] text-muted-foreground">{d}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDayOfWeek }, (_, i) => (
            <div key={`empty-${i}`} className="h-11" />
          ))}

          {dayCells.map(cell => (
            <div
              key={cell.dateStr}
              className={`h-11 rounded-lg flex items-center justify-center relative transition-all ${
                cell.isToday && !cell.hasWorkout ? "ring-2 ring-primary" : ""
              }`}
              style={
                cell.hasWorkout && !cell.isRest
                  ? { backgroundColor: "hsl(var(--primary))" }
                  : cell.isRest
                  ? { backgroundColor: "hsl(var(--primary) / 0.1)" }
                  : undefined
              }
            >
              <span
                className={`font-mono text-[10px] ${
                  cell.hasWorkout && !cell.isRest
                    ? "text-primary-foreground font-bold"
                    : cell.isRest
                    ? "text-primary/70 font-medium"
                    : "text-muted-foreground"
                }`}
              >
                {cell.day}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Workouts", value: String(workoutCount) },
          { label: "Minutes", value: String(totalMinutes) },
          { label: "Zone 2+", value: String(zone2Days) },
          { label: "Consistency", value: `${consistency}%` },
        ].map(stat => (
          <div key={stat.label} className="card-warm p-3 text-center">
            <p className="font-display text-lg font-bold text-foreground">{stat.value}</p>
            <p className="font-body text-[9px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Week strip */}
      <div className="card-warm p-3">
        <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider mb-2">This week</p>
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map(wd => (
            <div key={wd.dateStr} className="flex flex-col items-center gap-1">
              <span className={`font-mono text-[9px] ${wd.isToday ? "text-primary font-bold" : "text-muted-foreground"}`}>
                {wd.date.toLocaleDateString("en-NZ", { weekday: "narrow" })}
              </span>
              <span className={`font-mono text-[10px] ${wd.isToday ? "text-foreground font-bold" : "text-muted-foreground"}`}>
                {wd.date.getDate()}
              </span>
              {wd.hasWorkout && (
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              )}
              {!wd.hasWorkout && <div className="w-1.5 h-1.5" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
