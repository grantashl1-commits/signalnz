import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { haptic } from "@/hooks/use-mobile";

const DIMENSIONS = ["Connection", "Safety", "Heard", "Trust", "Intimacy"];

interface Props {
  connectionId: string;
  partnerRole: "member" | "partner";
  partnerName: string;
}

export default function WeeklyCheckIn({ connectionId, partnerRole, partnerName }: Props) {
  const weekKey = (() => {
    const d = new Date();
    const jan1 = new Date(d.getFullYear(), 0, 1);
    const week = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
    return `${d.getFullYear()}-W${String(week).padStart(2, "0")}`;
  })();

  const [values, setValues] = useState<Record<string, number>>(
    Object.fromEntries(DIMENSIONS.map(d => [d, 5]))
  );
  const [appreciation, setAppreciation] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  // Load previous check-ins
  useEffect(() => {
    if (!connectionId) return;
    (supabase.from("connect_checkins" as any).select("*")
      .eq("connection_id", connectionId)
      .eq("partner_role", partnerRole)
      .order("created_at", { ascending: false }).limit(8) as any)
      .then(({ data }: { data: any[] | null }) => {
        if (data) {
          setHistory(data);
          const thisWeek = data.find((d: any) => d.week_key === weekKey);
          if (thisWeek) {
            setSubmitted(true);
            if (thisWeek.scores) setValues(thisWeek.scores);
            if (thisWeek.appreciation) setAppreciation(thisWeek.appreciation);
          }
        }
      });
  }, [connectionId, partnerRole, weekKey]);

  const submit = async () => {
    haptic("medium");
    await (supabase.from("connect_checkins" as any) as any).upsert({
      connection_id: connectionId,
      partner_role: partnerRole,
      scores: values,
      appreciation,
      week_key: weekKey,
    }, { onConflict: "connection_id,partner_role,week_key" });

    setSubmitted(true);
    toast.success("Held. 💜");
  };

  return (
    <div className="px-4 py-4 space-y-6">
      <div className="text-center">
        <p className="font-display text-lg font-bold text-foreground">Weekly check-in</p>
        <p className="text-xs text-muted-foreground mt-1">
          {submitted ? "You've checked in this week" : "Rate this week (1–10)"}
        </p>
      </div>

      <div className="p-4 rounded-2xl border border-border bg-card space-y-5">
        {DIMENSIONS.map(dim => (
          <div key={dim}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-foreground">{dim.toLowerCase()}</span>
              <span className="text-lg font-light text-primary">{values[dim]}</span>
            </div>
            <Slider
              value={[values[dim]]}
              onValueChange={([v]) => setValues(p => ({ ...p, [dim]: v }))}
              min={1} max={10} step={1}
              disabled={submitted}
              className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary"
            />
          </div>
        ))}

        <div className="pt-2">
          <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-2">
            One thing I appreciate about us this week
          </p>
          <textarea
            value={appreciation}
            onChange={e => setAppreciation(e.target.value)}
            placeholder="Write something you appreciate..."
            disabled={submitted}
            className="w-full rounded-xl bg-background border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 resize-none min-h-[70px] focus:outline-none focus:border-primary/30 disabled:opacity-60"
          />
        </div>

        {!submitted && (
          <button
            onClick={submit}
            className="w-full bg-primary text-primary-foreground py-2.5 rounded-full text-sm font-semibold"
          >
            Save check-in
          </button>
        )}
      </div>

      {/* Trend preview */}
      {history.length > 1 && (
        <div className="p-4 rounded-2xl border border-border bg-card">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Trends (last {history.length} weeks)</p>
          <div className="space-y-2">
            {DIMENSIONS.map(dim => {
              const recent = history.slice(0, 4).reverse();
              const avg = recent.reduce((s, h) => s + ((h.scores as any)?.[dim] || 5), 0) / recent.length;
              return (
                <div key={dim} className="flex items-center gap-3">
                  <span className="text-[10px] text-muted-foreground w-16">{dim}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${avg * 10}%` }}
                      className="h-full bg-primary/60 rounded-full"
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground w-6 text-right">{avg.toFixed(1)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
