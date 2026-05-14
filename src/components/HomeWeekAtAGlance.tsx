/**
 * "Your week, gently."
 *
 * A tiny ribbon of the last seven days. Each day shows up to three soft dots:
 *   • move  — sage
 *   • still — primary
 *   • write — accent
 *
 * Days without dots aren't framed as failure — empty days are simply quiet.
 */
import { useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useWeekAtAGlance } from "@/hooks/use-week-at-a-glance";
import { getDayIndicators } from "@/lib/cycle-utils";

export default function HomeWeekAtAGlance() {
  const days = useWeekAtAGlance();

  const cycleLogged = useMemo(() => {
    if (!days) return new Set<string>();
    const out = new Set<string>();
    days.forEach((d) => {
      try {
        const ind = getDayIndicators(d.date, null);
        if (ind.hasMood || ind.hasSymptoms || ind.hasNotes || ind.hasWeight || ind.isPeriodDay) {
          out.add(d.date);
        }
      } catch {}
    });
    return out;
  }, [days]);

  if (!days) {
    return (
      <div className="rounded-[20px] bg-card p-5 animate-pulse h-[112px]" style={{ boxShadow: "var(--shadow-soft)" }} />
    );
  }

  const movedCount = days.filter((d) => d.moved).length;
  const stillCount = days.filter((d) => d.rested).length;
  const wroteCount = days.filter((d) => d.wrote).length;
  const cycleCount = days.filter((d) => cycleLogged.has(d.date)).length;
  const anyActivity = movedCount + stillCount + wroteCount + cycleCount > 0;

  // Per-day total activity for the sparkline (0–4)
  const sparkline = days.map((d) => {
    let n = 0;
    if (d.moved) n++;
    if (d.rested) n++;
    if (d.wrote) n++;
    if (cycleLogged.has(d.date)) n++;
    return n;
  });
  const sparkMax = Math.max(1, ...sparkline);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-[20px] bg-card p-5"
      style={{ boxShadow: "var(--shadow-soft)" }}
    >
      <div className="flex items-baseline justify-between mb-3">
        <p className="font-hand text-[11px] uppercase tracking-wider text-muted-foreground/60">
          your week, gently
        </p>
        {!anyActivity && (
          <p className="font-display italic text-[11px] text-muted-foreground">
            a beginning
          </p>
        )}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => (
          <div key={d.date} className="flex flex-col items-center gap-1.5">
            <span className={`font-hand text-[10px] ${d.isToday ? "text-primary font-semibold" : "text-muted-foreground/50"}`}>
              {d.weekday}
            </span>
            <div
              className={`w-7 h-7 rounded-full flex flex-col items-center justify-center gap-[2px] ${
                d.isToday ? "ring-1 ring-primary/30" : ""
              }`}
              style={{ background: "hsl(var(--secondary) / 0.4)" }}
            >
              <div className="flex flex-wrap justify-center gap-[2px] max-w-[18px]">
                {d.moved && <span className="w-[5px] h-[5px] rounded-full bg-primary/70" title="moved" />}
                {d.rested && <span className="w-[5px] h-[5px] rounded-full bg-accent" title="still" />}
                {d.wrote && <span className="w-[5px] h-[5px] rounded-full bg-foreground/40" title="wrote" />}
                {cycleLogged.has(d.date) && (
                  <span className="w-[5px] h-[5px] rounded-full" style={{ background: "#9B89B4" }} title="cycle log" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Consistency sparkline */}
      <div className="mt-3 flex items-end gap-1 h-5">
        {sparkline.map((v, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm transition-all"
            style={{
              height: `${Math.max(10, (v / sparkMax) * 100)}%`,
              background: v > 0 ? "hsl(var(--primary) / 0.5)" : "hsl(var(--secondary))",
              opacity: v > 0 ? 0.4 + (v / sparkMax) * 0.6 : 0.5,
            }}
            title={`${v} kindnesses`}
          />
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[10px] font-body text-muted-foreground/70 flex-wrap">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-primary/70" /> trained · {movedCount}</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-accent" /> still · {stillCount}</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-foreground/40" /> wrote · {wroteCount}</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full" style={{ background: "#9B89B4" }} /> cycle · {cycleCount}</span>
        </div>
        <Link to="/account" className="font-hand text-[11px] text-primary/70 hover:text-primary transition-colors">
          see the shape →
        </Link>
      </div>
    </motion.div>
  );
}
