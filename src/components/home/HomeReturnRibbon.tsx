/**
 * HomeReturnRibbon — return-streak + pick-up-where-you-left card.
 * Streak counts consecutive days a mood/symptom/journal was logged.
 * "Pick up" surfaces the most recent route the user touched.
 */
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Flame } from "lucide-react";

const TRACKED_KEYS = [
  "mindcast_moods_",
  "mindcast_symptoms_",
  "mindcast_symptoms_new_",
];

function countReturnDays(): number {
  if (typeof window === "undefined") return 0;
  let count = 0;
  for (let i = 0; i < 60; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().split("T")[0];
    const found = TRACKED_KEYS.some((k) => localStorage.getItem(k + ds));
    // also count journal entries for that day
    const entriesRaw = localStorage.getItem("signal_journal_entries");
    let hasJournal = false;
    if (entriesRaw) {
      try {
        const entries = JSON.parse(entriesRaw) as Array<{ created_at?: string | number }>;
        hasJournal = entries.some((e) => {
          const t = e.created_at ? new Date(e.created_at) : null;
          return t && t.toISOString().split("T")[0] === ds;
        });
      } catch {}
    }
    if (found || hasJournal) count++;
    else if (i > 0) break; // allow today empty, but stop on first gap
  }
  return count;
}

const ROUTE_LABELS: Record<string, string> = {
  "/journal": "your last journal",
  "/breathwork": "your last breath",
  "/mindfulness": "your last practice",
  "/cycle": "your cycle log",
  "/nutrition": "today's nourishment",
  "/movement": "your movement",
  "/practice": "your rituals",
  "/coach": "your coach",
  "/connect": "your connect space",
};

function lastVisited(): { to: string; label: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("signal_last_route");
    if (!raw) return null;
    const { to, at } = JSON.parse(raw);
    if (!to || ROUTE_LABELS[to] == null) return null;
    if (Date.now() - (at ?? 0) > 1000 * 60 * 60 * 48) return null;
    if (to === "/" || to === "/home") return null;
    return { to, label: ROUTE_LABELS[to] };
  } catch { return null; }
}

export default function HomeReturnRibbon() {
  const days = useMemo(() => countReturnDays(), []);
  const last = useMemo(() => lastVisited(), []);

  if (days < 1 && !last) return null;

  return (
    <div className="rounded-[16px] bg-card overflow-hidden" style={{ boxShadow: "var(--shadow-soft)" }}>
      {days >= 1 && (
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40">
          <Flame className="h-3.5 w-3.5 text-primary/70" />
          <p className="font-hand text-[13px] text-foreground">
            {days} {days === 1 ? "day" : "days"} you've returned
          </p>
        </div>
      )}
      {last && (
        <Link
          to={last.to}
          className="flex items-center gap-3 px-4 py-3 active:bg-secondary/40 transition-colors min-h-[44px]"
        >
          <div className="flex-1">
            <p className="font-hand text-[11px] text-muted-foreground">pick up</p>
            <p className="font-body text-sm text-foreground">{last.label} →</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </Link>
      )}
    </div>
  );
}
