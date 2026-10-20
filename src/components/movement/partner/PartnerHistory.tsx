import { CloudOff } from "lucide-react";
import { summarisePartner, type LegacyPartnerSession, type PartnerSessionLog, type PartnerSlot } from "@/lib/partner-progress";

const LEGACY_PLAN_NAMES: Record<string, string> = {
  "lower-strength": "Lower body · Strength",
  "upper-strength": "Upper body · Strength",
  "lower-pump": "Lower body · Pump",
  "upper-pump": "Upper body · Pump",
};

const prettyDate = (d: string) => {
  const date = new Date(`${d}T12:00:00`);
  return Number.isNaN(date.getTime()) ? d : date.toLocaleDateString("en-NZ", { weekday: "short", day: "numeric", month: "short" });
};

interface Props {
  logs: PartnerSessionLog[];
  legacy: LegacyPartnerSession[];
  canSync: boolean;
  syncingId: string | null;
  onRetry: (log: PartnerSessionLog) => void;
}

export default function PartnerHistory({ logs, legacy, canSync, syncingId, onRetry }: Props) {
  if (!logs.length && !legacy.length) return null;
  return (
    <section className="card-warm space-y-3 p-5" aria-labelledby="partner-history-heading">
      <h3 id="partner-history-heading" className="font-display text-xl">Completed sessions</h3>
      {[...logs].reverse().slice(0, 12).map(log => (
        <div key={log.id} className="border-b border-border pb-3 last:border-0" data-testid="partner-history-item">
          <details>
            <summary className="cursor-pointer list-none">
              <p className="text-sm font-semibold">{log.title}</p>
              <p className="text-xs text-muted-foreground">
                {prettyDate(log.date)} · {Math.max(1, Math.round(log.elapsed / 60))} min ·{" "}
                {(["A", "B"] as PartnerSlot[]).map(slot => {
                  const s = summarisePartner(log.records, slot);
                  return `${log.partners[slot]} ${s.sets} sets${s.kg ? ` · ${s.kg.toLocaleString("en-NZ")} kg` : ""}`;
                }).join("  ·  ")}
              </p>
            </summary>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              {(["A", "B"] as PartnerSlot[]).map(slot => (
                <div key={slot}>
                  <p className="text-xs font-bold uppercase tracking-wide">{log.partners[slot]}</p>
                  <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                    {log.records.filter(r => r.partner === slot).map((r, i) => (
                      <li key={i}>R{r.round} · {r.exercise_name}: {r.reps}{r.weight ? ` @ ${r.weight}` : ""}</li>
                    ))}
                  </ul>
                  {log.hr?.[slot] && <p className="mt-1 text-xs">Avg {log.hr[slot]!.avg} bpm · max {log.hr[slot]!.max} · {log.hr[slot]!.effortMinutes} effort min</p>}
                </div>
              ))}
            </div>
          </details>
          {canSync && !log.synced && (
            <button type="button" disabled={syncingId !== null} onClick={() => onRetry(log)} className="mt-2 inline-flex items-center gap-1.5 text-sm underline disabled:opacity-50">
              <CloudOff className="h-3.5 w-3.5" /> {syncingId === log.id ? "Saving…" : "Saved on this device — retry cloud save"}
            </button>
          )}
        </div>
      ))}
      {legacy.length > 0 && (
        <details className="pt-1">
          <summary className="cursor-pointer text-sm text-muted-foreground">Earlier partner circuits ({legacy.length})</summary>
          <ul className="mt-2 space-y-2">
            {[...legacy].reverse().slice(0, 12).map(s => (
              <li key={s.id} className="text-xs">
                <details>
                  <summary className="cursor-pointer">{prettyDate(s.date)} · {LEGACY_PLAN_NAMES[s.planId] ?? s.planId} · {s.records.length} sets</summary>
                  <ul className="mt-1 space-y-0.5 text-muted-foreground">
                    {s.records.map((r, i) => <li key={i}>Round {r.round} · {r.partner} · {r.exercise_name}: {r.reps} · {r.weight || "Bodyweight"}</li>)}
                  </ul>
                </details>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
