import { useEffect, useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { haptic } from "@/hooks/use-mobile";
import { toLocalDateStr } from "@/lib/local-date";
import {
  getCycleStats, logPeriodStart, logPeriodEnd, removePeriod, daysBetween, fromDateStr,
  PERIOD_HISTORY_EVENT, type CycleStats,
} from "@/lib/period-history";

const fmt = (s: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }) =>
  fromDateStr(s).toLocaleDateString("en-NZ", opts);

/**
 * Every logged period, month after month — with averages, the next predicted
 * start, and a form to back-fill previous months.
 */
export default function CycleHistoryPanel({ onChange }: { onChange?: () => void }) {
  const [stats, setStats] = useState<CycleStats>(() => getCycleStats());
  const [adding, setAdding] = useState(false);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  useEffect(() => {
    const refresh = () => setStats(getCycleStats());
    window.addEventListener(PERIOD_HISTORY_EVENT, refresh);
    return () => window.removeEventListener(PERIOD_HISTORY_EVENT, refresh);
  }, []);

  const today = toLocalDateStr();
  const save = () => {
    if (!start) return;
    if (start > today) { toast.error("That date is in the future."); return; }
    if (end && end < start) { toast.error("The end date is before the start."); return; }
    haptic("success");
    logPeriodStart(start);
    if (end) logPeriodEnd(end);
    setAdding(false); setStart(""); setEnd("");
    toast.success("Period saved to your history.");
    onChange?.();
  };

  const remove = (s: string) => {
    haptic("medium");
    removePeriod(s);
    toast("Period removed.");
    onChange?.();
  };

  const periods = [...stats.periods].reverse();

  return (
    <section className="card-warm p-5 space-y-5" aria-labelledby="cycle-history-heading">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 id="cycle-history-heading" className="font-display text-lg font-semibold text-foreground">Your cycle history</h3>
          <p className="text-[12px] text-muted-foreground">Every period you log is kept here, month after month.</p>
        </div>
        <button
          onClick={() => { haptic("light"); setAdding((v) => !v); }}
          className="touch-btn flex flex-none items-center gap-1.5 whitespace-nowrap rounded-full bg-foreground px-3.5 py-2 text-[12px] font-semibold text-background"
          aria-expanded={adding}
        >
          <Plus className="h-3.5 w-3.5" /> Log a period
        </button>
      </div>

      {adding && (
        <div className="rounded-2xl border border-border bg-background p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Started
              <input type="date" max={today} value={start} onChange={(e) => setStart(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground" style={{ fontSize: 16 }} />
            </label>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Ended <span className="normal-case tracking-normal font-normal">(optional)</span>
              <input type="date" max={today} min={start || undefined} value={end} onChange={(e) => setEnd(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground" style={{ fontSize: 16 }} />
            </label>
          </div>
          <button onClick={save} disabled={!start}
            className="touch-btn w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-40">
            Save period
          </button>
        </div>
      )}

      {stats.periods.length > 0 && (
        <dl className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl bg-secondary/70 p-3">
            <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Avg cycle</dt>
            <dd className="display-serif text-[1.75rem] leading-tight text-foreground">{stats.avgCycleLength}<span className="text-sm text-muted-foreground"> d</span></dd>
          </div>
          <div className="rounded-2xl bg-secondary/70 p-3">
            <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Avg period</dt>
            <dd className="display-serif text-[1.75rem] leading-tight text-foreground">{stats.avgPeriodLength}<span className="text-sm text-muted-foreground"> d</span></dd>
          </div>
          <div className="rounded-2xl bg-secondary/70 p-3">
            <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Next due</dt>
            <dd className="display-serif text-[1.35rem] leading-tight text-foreground pt-1">{stats.nextPredictedStart ? fmt(stats.nextPredictedStart) : "—"}</dd>
          </div>
        </dl>
      )}

      {periods.length === 0 ? (
        <p className="text-[13px] text-muted-foreground">No periods logged yet. Tap a day in the calendar or “Log a period” to start your history.</p>
      ) : (
        <ol className="divide-y divide-border/70">
          {periods.map((p, i) => {
            const prev = periods[i + 1];
            const cycleLen = prev ? daysBetween(prev.start, p.start) : null;
            const len = p.end ? daysBetween(p.start, p.end) + 1 : null;
            return (
              <li key={p.start} className="flex items-center gap-3 py-3">
                <span className="h-2.5 w-2.5 flex-none rounded-full bg-phase-menstrual" />
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-medium text-foreground">{fmt(p.start, { month: "long", year: "numeric" })}</p>
                  <p className="text-[12px] text-muted-foreground">
                    {fmt(p.start)}{p.end ? ` – ${fmt(p.end)}` : " · end not logged"}
                    {len ? ` · ${len} days` : ""}
                    {cycleLen ? ` · ${cycleLen}-day cycle` : ""}
                  </p>
                </div>
                <button onClick={() => remove(p.start)} aria-label={`Remove period starting ${fmt(p.start)}`}
                  className="touch-btn rounded-full p-2 text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
