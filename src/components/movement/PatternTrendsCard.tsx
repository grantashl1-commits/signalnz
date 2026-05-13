/**
 * Volume sparkline per movement pattern (push/pull/hinge/squat/carry +
 * cardio + mobility) over the last 8 weeks. Sourced from workout_logs.
 */
import { usePatternTrends, type PatternTrend } from "@/hooks/use-pattern-trends";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

function Sparkline({ series }: { series: number[] }) {
  const max = Math.max(1, ...series);
  const w = 80;
  const h = 22;
  const step = w / Math.max(1, series.length - 1);
  const points = series
    .map((v, i) => `${(i * step).toFixed(1)},${(h - (v / max) * h).toFixed(1)}`)
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        className="text-primary/70"
      />
      {series.map((v, i) => {
        if (v === 0) return null;
        const cx = i * step;
        const cy = h - (v / max) * h;
        return <circle key={i} cx={cx} cy={cy} r={1.2} className="fill-primary/80" />;
      })}
    </svg>
  );
}

function TrendArrow({ t }: { t: PatternTrend }) {
  const delta = t.thisWeek - t.lastWeek;
  if (delta > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] text-primary/80">
        <TrendingUp className="h-3 w-3" />+{delta}
      </span>
    );
  }
  if (delta < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
        <TrendingDown className="h-3 w-3" />{delta}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground/70">
      <Minus className="h-3 w-3" />0
    </span>
  );
}

export default function PatternTrendsCard() {
  const { trends, loading, weeks } = usePatternTrends();

  if (loading) {
    return (
      <div className="card-warm p-4 space-y-2">
        <div className="h-3 w-24 bg-secondary/60 rounded animate-pulse" />
        <div className="h-16 bg-secondary/40 rounded animate-pulse" />
      </div>
    );
  }

  const visible = trends.filter(t => t.total > 0);

  if (visible.length === 0) {
    return (
      <div className="card-warm p-5 text-center space-y-2">
        <p className="font-display text-base font-bold text-foreground">A beginning</p>
        <p className="font-editorial text-xs italic text-muted-foreground leading-relaxed">
          Once you log a few sessions, your patterns will draw themselves here — push, pull, hinge, squat. The shape of your strength.
        </p>
      </div>
    );
  }

  return (
    <div className="card-warm p-4 space-y-3">
      <div className="flex items-baseline justify-between">
        <p className="font-hand text-sm font-bold text-primary">Patterns held</p>
        <p className="font-body text-[10px] text-muted-foreground">last {weeks} weeks</p>
      </div>
      <ul className="space-y-2.5">
        {visible.map(t => (
          <li key={t.pattern} className="flex items-center gap-3">
            <div className="w-16 shrink-0">
              <p className="font-body text-xs font-medium text-foreground/85">{t.label}</p>
              <p className="font-body text-[10px] text-muted-foreground">{t.total} session{t.total === 1 ? "" : "s"}</p>
            </div>
            <div className="flex-1">
              <Sparkline series={t.series} />
            </div>
            <div className="w-12 text-right">
              <TrendArrow t={t} />
            </div>
          </li>
        ))}
      </ul>
      <p className="font-editorial text-[11px] italic text-muted-foreground/80 leading-relaxed pt-1 border-t border-border/40">
        Variety keeps the body curious. The arrow is just a whisper, never a demand.
      </p>
    </div>
  );
}
