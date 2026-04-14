import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Moon, Sun, Baby, Milk, Clock } from "lucide-react";
import { BABY_SLEEP_SCHEDULES, type WeeklySchedule } from "@/data/parenting-course";

export default function BabySleepSchedule() {
  const [weekIdx, setWeekIdx] = useState(0);
  const schedule = BABY_SLEEP_SCHEDULES[weekIdx];

  const isNightRow = (time: string) =>
    time.includes("PM") && parseInt(time) >= 7 && parseInt(time) !== 12 ||
    time.includes("AM") && parseInt(time) < 7 ||
    time.toLowerCase().includes("night") ||
    time.toLowerCase().includes("dream");

  return (
    <div className="space-y-4">
      {/* Week selector */}
      <div className="flex items-center justify-between bg-card border border-border rounded-2xl p-4">
        <button
          onClick={() => setWeekIdx(Math.max(0, weekIdx - 1))}
          disabled={weekIdx === 0}
          className="p-2 rounded-full bg-secondary disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4 text-foreground" />
        </button>
        <div className="text-center">
          <h3 className="font-display text-lg font-bold text-foreground">{schedule.weekLabel}</h3>
          <p className="font-body text-xs text-muted-foreground">{schedule.ageRange}</p>
        </div>
        <button
          onClick={() => setWeekIdx(Math.min(BABY_SLEEP_SCHEDULES.length - 1, weekIdx + 1))}
          disabled={weekIdx === BABY_SLEEP_SCHEDULES.length - 1}
          className="p-2 rounded-full bg-secondary disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4 text-foreground" />
        </button>
      </div>

      {/* Sleep summary pills */}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <Sun className="h-4 w-4 text-amber-600" />
          <div>
            <p className="font-body text-[10px] text-muted-foreground">Day sleep</p>
            <p className="font-display text-sm font-bold text-foreground">{schedule.totalDaySleep}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
          <Moon className="h-4 w-4 text-indigo-600" />
          <div>
            <p className="font-body text-[10px] text-muted-foreground">Night sleep</p>
            <p className="font-display text-sm font-bold text-foreground">{schedule.totalNightSleep}</p>
          </div>
        </div>
      </div>

      {/* Key notes */}
      <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
        <h4 className="font-display text-xs font-bold text-primary mb-2 flex items-center gap-1.5">
          <Baby className="h-3.5 w-3.5" /> Key Notes for {schedule.weekLabel}
        </h4>
        <ul className="space-y-1.5">
          {schedule.keyNotes.map((note, i) => (
            <li key={i} className="font-body text-xs text-muted-foreground flex gap-2">
              <span className="text-primary mt-0.5 shrink-0">•</span>
              <span>{note}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Schedule table */}
      <AnimatePresence mode="wait">
        <motion.div
          key={weekIdx}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-1.5"
        >
          {schedule.schedule.map((row, i) => {
            const night = isNightRow(row.time);
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`p-3 rounded-xl border transition-all ${
                  night
                    ? "bg-indigo-500/5 border-indigo-500/15"
                    : "bg-card border-border"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    night ? "bg-indigo-500/15" : "bg-amber-500/15"
                  }`}>
                    {night
                      ? <Moon className="h-3.5 w-3.5 text-indigo-500" />
                      : row.activity.toLowerCase().includes("feed")
                        ? <Milk className="h-3.5 w-3.5 text-amber-600" />
                        : row.activity.toLowerCase().includes("nap") || row.activity.toLowerCase().includes("bed")
                          ? <Moon className="h-3.5 w-3.5 text-amber-600" />
                          : <Clock className="h-3.5 w-3.5 text-amber-600" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-xs font-bold text-foreground">{row.time}</span>
                    </div>
                    <p className="font-body text-sm text-foreground mt-0.5">{row.activity}</p>
                    {row.feedNote && (
                      <p className="font-body text-[11px] text-muted-foreground mt-1 bg-secondary/50 rounded-lg px-2 py-1.5 leading-relaxed">
                        {row.feedNote}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Week dots indicator */}
      <div className="flex justify-center gap-1.5 pt-2">
        {BABY_SLEEP_SCHEDULES.map((_, i) => (
          <button
            key={i}
            onClick={() => setWeekIdx(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === weekIdx ? "bg-primary w-5" : "bg-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
