import { Check } from "lucide-react";
import type { PartnerProgram, PartnerSession } from "@/data/partner-program";
import type { PartnerProgress } from "@/lib/partner-progress";

interface Props {
  program: PartnerProgram;
  progress: PartnerProgress;
  nextId: string | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

/** 8-week overview: W1..W8 × 3 sessions with Upper/Lower labels and done ticks. */
export default function ProgramGrid({ program, progress, nextId, selectedId, onSelect }: Props) {
  const weeks = [...new Set(program.sessions.map(s => s.week))].sort((a, b) => a - b);
  const byWeek = (w: number) => program.sessions.filter(s => s.week === w).sort((a, b) => a.index - b.index);
  const upper = program.sessions.filter(s => s.focus === "Upper").length;
  const lower = program.sessions.length - upper;
  const done = program.sessions.filter(s => progress.completed[s.id]).length;

  return (
    <section className="card-warm space-y-4 p-5" aria-labelledby="partner-plan-heading">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="eyebrow text-move">Your 8 weeks</p>
          <h3 id="partner-plan-heading" className="font-display text-xl">{done} of {program.sessions.length} sessions done</h3>
        </div>
        <p className="text-right text-xs text-muted-foreground">{upper} upper · {lower} lower<br />3 a week</p>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
        <div className="h-full rounded-full bg-move transition-all" style={{ width: `${(done / Math.max(1, program.sessions.length)) * 100}%` }} />
      </div>
      <div className="space-y-1.5" role="list">
        {weeks.map(w => {
          const phase = program.phases.find(p => p.weeks.includes(w));
          return (
            <div key={w} className="grid grid-cols-[52px_1fr_1fr_1fr] items-stretch gap-1.5" role="listitem">
              <div className="flex flex-col justify-center">
                <span className="text-sm font-bold tabular-nums">W{w}</span>
                {phase && <span className="truncate text-[10px] leading-tight text-muted-foreground">{phase.name}</span>}
              </div>
              {byWeek(w).map(s => <Cell key={s.id} session={s} done={!!progress.completed[s.id]} next={s.id === nextId} selected={s.id === selectedId} onSelect={onSelect} />)}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">Tap any session to preview it. Doing one out of order is fine — the plan always offers the next one you haven't done.</p>
    </section>
  );
}

function Cell({ session, done, next, selected, onSelect }: { session: PartnerSession; done: boolean; next: boolean; selected: boolean; onSelect: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(session.id)}
      aria-pressed={selected}
      aria-label={`Week ${session.week} session ${session.index}: ${session.focus} ${session.style}${done ? ", done" : next ? ", up next" : ""}`}
      className={`relative min-h-[48px] rounded-xl border px-2 py-1.5 text-left transition-colors ${
        selected ? "border-foreground bg-foreground text-background" : done ? "border-move/30 bg-move/10" : next ? "border-move bg-card" : "border-border bg-card"
      }`}
    >
      <span className="block text-xs font-bold">{session.focus}</span>
      <span className={`block truncate text-[10px] ${selected ? "text-background/75" : "text-muted-foreground"}`}>{session.style}</span>
      {done && (
        <span className={`absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full ${selected ? "bg-background text-foreground" : "bg-move text-background"}`}>
          <Check className="h-3 w-3" strokeWidth={3} />
        </span>
      )}
      {next && !done && !selected && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-move" aria-hidden="true" />}
    </button>
  );
}
