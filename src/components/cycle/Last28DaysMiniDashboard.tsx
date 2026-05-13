import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  getMoods, getSymptomsNew, getCycleDayForDate, getPhaseFromDay,
  getDayIndicators, Phase,
} from "@/lib/cycle-utils";

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#C4526E",
  follicular: "#5C4A9E",
  ovulatory: "#C47A8A",
  luteal: "#9B89B4",
};

interface Props {
  cycleStartDate: string;
}

export default function Last28DaysMiniDashboard({ cycleStartDate }: Props) {
  const days = useMemo(() => {
    const out: {
      dateStr: string;
      date: Date;
      cycleDay: number | null;
      phase: Phase | null;
      moodCount: number;
      symptomCount: number;
      isPeriod: boolean;
      logged: boolean;
    }[] = [];
    const today = new Date();
    for (let i = 27; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const cycleDay = cycleStartDate ? getCycleDayForDate(cycleStartDate, d) : null;
      const phase = cycleDay ? getPhaseFromDay(cycleDay) : null;
      const moods = getMoods(dateStr);
      const symptoms = getSymptomsNew(dateStr);
      const ind = getDayIndicators(dateStr, cycleStartDate);
      out.push({
        dateStr,
        date: d,
        cycleDay,
        phase,
        moodCount: moods.length,
        symptomCount: symptoms.length,
        isPeriod: !!ind.isPeriodDay,
        logged: moods.length + symptoms.length > 0,
      });
    }
    return out;
  }, [cycleStartDate]);

  const returnedDays = days.filter((d) => d.logged || d.isPeriod).length;
  const moodsHeld = days.reduce((s, d) => s + d.moodCount, 0);
  const symptomsNoticed = days.reduce((s, d) => s + d.symptomCount, 0);

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="card-warm p-5 space-y-4">
      <div className="flex items-baseline justify-between">
        <h3 className="font-display text-lg italic text-foreground">Last 28 days</h3>
        <span className="font-hand text-[11px] text-muted-foreground/70">a soft picture, not a scoreboard</span>
      </div>

      {/* Day strip */}
      <div className="grid grid-cols-14 gap-[3px]" style={{ gridTemplateColumns: "repeat(14, minmax(0, 1fr))" }}>
        {days.map((d, i) => {
          const base = d.phase ? PHASE_HEX[d.phase] : "#9B89B4";
          const isToday = d.dateStr === todayStr;
          // Period = filled. Logged = ringed dot. Otherwise faint.
          const fill = d.isPeriod ? base : d.logged ? `${base}55` : `${base}1A`;
          return (
            <motion.div
              key={d.dateStr}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.22, delay: i * 0.012 }}
              className="relative aspect-square rounded-[4px] flex items-center justify-center"
              style={{
                backgroundColor: fill,
                outline: isToday ? `1.5px solid ${base}` : undefined,
                outlineOffset: isToday ? -1 : undefined,
              }}
              title={`${d.date.toLocaleDateString(undefined, { day: "numeric", month: "short" })}${
                d.cycleDay ? ` · day ${d.cycleDay}` : ""
              }${d.logged ? ` · ${d.moodCount + d.symptomCount} held` : ""}`}
            >
              {d.logged && !d.isPeriod && (
                <div
                  className="rounded-full"
                  style={{ width: 4, height: 4, backgroundColor: base }}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Phase legend */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
        {(Object.entries(PHASE_HEX) as [Phase, string][]).map(([p, hex]) => (
          <div key={p} className="flex items-center gap-1.5">
            <span className="rounded-[3px]" style={{ width: 8, height: 8, backgroundColor: hex }} />
            <span className="font-body text-[10px] text-muted-foreground capitalize">{p}</span>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 pt-2">
        <Stat n={returnedDays} label={returnedDays === 1 ? "day you returned" : "days you returned"} />
        <Stat n={moodsHeld} label={moodsHeld === 1 ? "mood held" : "moods held"} />
        <Stat n={symptomsNoticed} label="noticed in body" />
      </div>
    </div>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div className="text-center space-y-0.5">
      <div className="font-display text-2xl italic text-foreground tabular-nums">{n}</div>
      <div className="font-hand text-[11px] text-muted-foreground leading-tight">{label}</div>
    </div>
  );
}
