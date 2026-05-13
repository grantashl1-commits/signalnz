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
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useWeekAtAGlance } from "@/hooks/use-week-at-a-glance";

export default function HomeWeekAtAGlance() {
  const days = useWeekAtAGlance();
  if (!days) {
    return (
      <div className="rounded-[20px] bg-card p-5 animate-pulse h-[112px]" style={{ boxShadow: "var(--shadow-soft)" }} />
    );
  }

  const movedCount = days.filter((d) => d.moved).length;
  const stillCount = days.filter((d) => d.rested).length;
  const wroteCount = days.filter((d) => d.wrote).length;
  const anyActivity = movedCount + stillCount + wroteCount > 0;

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
        {days.map((d) => (
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
              <div className="flex gap-[2px]">
                {d.moved && <span className="w-[5px] h-[5px] rounded-full bg-primary/70" title="moved" />}
                {d.rested && <span className="w-[5px] h-[5px] rounded-full bg-accent" title="still" />}
                {d.wrote && <span className="w-[5px] h-[5px] rounded-full bg-foreground/40" title="wrote" />}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-[10px] font-body text-muted-foreground/70">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-primary/70" /> moved · {movedCount}</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-accent" /> still · {stillCount}</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-foreground/40" /> wrote · {wroteCount}</span>
        </div>
        <Link to="/account" className="font-hand text-[11px] text-primary/70 hover:text-primary transition-colors">
          see the shape →
        </Link>
      </div>
    </motion.div>
  );
}
