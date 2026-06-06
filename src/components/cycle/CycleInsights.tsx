import { useMemo } from "react";
import { motion } from "framer-motion";
import { getPhaseFromDay, Phase } from "@/lib/cycle-utils";

interface Props {
  cycleStartDate: string;
}

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#C4526E",
  follicular: "#5C4A9E",
  ovulatory: "#C47A8A",
  luteal: "#9B89B4",
};

const CYCLE_LENGTH = 28;
const HISTORY_COUNT = 6;

function fmt(d: Date): string {
  return d.toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" });
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export default function CycleInsights({ cycleStartDate }: Props) {
  const cycles = useMemo(() => {
    if (!cycleStartDate) return [];
    const anchor = new Date(cycleStartDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const rows: { start: Date; end: Date; length: number; inProgress: boolean }[] = [];
    for (let i = 0; i < HISTORY_COUNT; i++) {
      const start = addDays(anchor, -CYCLE_LENGTH * i);
      const end = addDays(start, CYCLE_LENGTH - 1);
      const inProgress = i === 0 && end >= today;
      const length = inProgress
        ? Math.max(1, Math.floor((today.getTime() - start.getTime()) / 86400000) + 1)
        : CYCLE_LENGTH;
      rows.push({ start, end, length, inProgress });
    }
    return rows;
  }, [cycleStartDate]);

  if (!cycleStartDate) {
    return (
      <div className="card-warm p-5 text-center">
        <p className="font-display text-base italic text-foreground mb-1">your insights are building</p>
        <p className="font-body text-xs text-muted-foreground leading-relaxed">
          Set your last period start to see your cycle history appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cycle lengths table */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-warm p-5"
      >
        <p className="font-hand text-sm font-bold text-primary mb-1">cycle lengths</p>
        <p className="font-body text-[11px] text-muted-foreground mb-4 leading-relaxed">
          Your last {cycles.length} cycles, anchored on your recorded start date.
        </p>

        <div className="overflow-hidden rounded-xl border border-border/60">
          <table className="w-full text-left">
            <thead className="bg-secondary/50">
              <tr>
                <th className="font-body text-[10px] uppercase tracking-wider text-muted-foreground font-medium px-3 py-2">Cycle</th>
                <th className="font-body text-[10px] uppercase tracking-wider text-muted-foreground font-medium px-3 py-2">Dates</th>
                <th className="font-body text-[10px] uppercase tracking-wider text-muted-foreground font-medium px-3 py-2 text-right">Length</th>
              </tr>
            </thead>
            <tbody>
              {cycles.map((c, i) => (
                <tr key={i} className={i === 0 ? "bg-primary/5" : ""}>
                  <td className="font-body text-xs text-foreground px-3 py-2.5 whitespace-nowrap">
                    {i === 0 ? (
                      <span className="font-hand text-primary">current</span>
                    ) : (
                      <span className="text-muted-foreground">−{i}</span>
                    )}
                  </td>
                  <td className="font-body text-xs text-foreground px-3 py-2.5">
                    <span className="whitespace-nowrap">{fmt(c.start)}</span>
                    <span className="text-muted-foreground"> – </span>
                    <span className="whitespace-nowrap">{c.inProgress ? "in progress" : fmt(c.end)}</span>
                  </td>
                  <td className="font-body text-xs text-foreground px-3 py-2.5 text-right tabular-nums">
                    {c.length} d
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="font-hand text-[10px] text-muted-foreground/70 mt-3 leading-snug">
          Cycle lengths assume a 28-day rhythm. Log future period starts to refine this picture.
        </p>
      </motion.div>

      {/* Typical energy across cycle */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="card-warm p-5"
      >
        <p className="font-hand text-sm font-bold text-primary mb-1">typical energy across cycle</p>
        <p className="font-body text-[11px] text-muted-foreground mb-4 leading-relaxed">
          Estimated energy levels across a 28-day cycle based on hormonal patterns.
        </p>

        <div className="flex gap-2">
          <div className="flex flex-col justify-between py-1 shrink-0">
            <span className="font-body text-[8px] text-muted-foreground">High</span>
            <span className="font-body text-[8px] text-muted-foreground">Low</span>
          </div>
          <div className="flex-1">
            <div className="flex items-end gap-[2px] h-24">
              {Array.from({ length: 28 }, (_, i) => {
                const day = i + 1;
                const phase = getPhaseFromDay(day);
                const heights: Record<Phase, number[]> = {
                  menstrual: [30, 25, 20, 25, 30],
                  follicular: [35, 45, 55, 65, 70, 75, 80, 85],
                  ovulatory: [95, 100, 95],
                  luteal: [80, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30, 30],
                };
                const phaseDay =
                  phase === "menstrual" ? day - 1
                  : phase === "follicular" ? day - 6
                  : phase === "ovulatory" ? day - 14
                  : day - 17;
                const h = heights[phase][phaseDay] || 40;

                return (
                  <div
                    key={day}
                    className="flex-1 rounded-t"
                    style={{ height: `${h}%`, backgroundColor: PHASE_HEX[phase], opacity: 0.6 }}
                  />
                );
              })}
            </div>
            <div className="flex justify-between font-body text-[9px] text-muted-foreground mt-1">
              <span>Day 1</span>
              <span>Day 14</span>
              <span>Day 28</span>
            </div>
            <p className="font-body text-[8px] text-muted-foreground text-center mt-0.5">Day of cycle</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-3 justify-center">
          {(["menstrual", "follicular", "ovulatory", "luteal"] as Phase[]).map((p) => (
            <div key={p} className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PHASE_HEX[p], opacity: 0.6 }} />
              <span className="font-body text-[10px] text-muted-foreground capitalize">{p}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
