import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Eye, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Props { userId: string; refreshKey?: number; }

interface Pattern { label: string; value: string; }

const REQUIRED = 4;

export default function PatternsInsightCard({ userId, refreshKey = 0 }: Props) {
  const [checkins, setCheckins] = useState<any[]>([]);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancel = false;
    (async () => {
      const [{ data: ci }, { data: wo }] = await Promise.all([
        supabase.from("weekly_checkins").select("*").eq("user_id", userId).order("week_start_date", { ascending: false }).limit(12),
        supabase.from("workout_sessions").select("workout_type, duration_minutes, intensity, completed_at").eq("user_id", userId).order("completed_at", { ascending: false }).limit(40),
      ]);
      if (cancel) return;
      setCheckins(ci || []);
      setWorkouts(wo || []);
      setLoaded(true);
    })();
    return () => { cancel = true; };
  }, [userId, refreshKey]);

  if (!loaded) return null;

  const count = checkins.length;
  if (count < REQUIRED) {
    const remaining = REQUIRED - count;
    return (
      <div className="card-warm p-5 text-center">
        <Lock className="h-5 w-5 text-muted-foreground/40 mx-auto mb-2" />
        <p className="font-display text-sm italic text-foreground/80">Your patterns</p>
        <p className="font-body text-[11px] text-muted-foreground mt-1">
          {remaining} more {remaining === 1 ? "check-in" : "check-ins"} and I can show you what's emerging.
        </p>
        <div className="flex gap-1 justify-center mt-3">
          {Array.from({ length: REQUIRED }).map((_, i) => (
            <span key={i} className={`w-6 h-1.5 rounded-full ${i < count ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>
      </div>
    );
  }

  // ── Compute deterministic patterns ──
  const recent = checkins.slice(0, 4);
  const avgEnergy = recent.reduce((s, c) => s + (c.energy || 0), 0) / recent.length;
  const avgSleep = recent.reduce((s, c) => s + (c.sleep_quality || 0), 0) / recent.length;
  const energyTrend = recent[0].energy - recent[recent.length - 1].energy;
  const sorenessLog = recent.filter((c) => c.soreness && c.soreness !== "none").length;

  // Sleep correlation with energy
  const sleepHigh = checkins.filter((c) => (c.sleep_quality || 0) >= 7);
  const sleepLow = checkins.filter((c) => (c.sleep_quality || 0) <= 5);
  const sleepHighEnergy = sleepHigh.length ? sleepHigh.reduce((s, c) => s + (c.energy || 0), 0) / sleepHigh.length : 0;
  const sleepLowEnergy = sleepLow.length ? sleepLow.reduce((s, c) => s + (c.energy || 0), 0) / sleepLow.length : 0;
  const sleepGap = sleepHighEnergy - sleepLowEnergy;

  // Top workout
  const byType: Record<string, number> = {};
  for (const w of workouts) byType[w.workout_type] = (byType[w.workout_type] || 0) + 1;
  const topWorkout = Object.entries(byType).sort((a, b) => b[1] - a[1])[0];

  const patterns: Pattern[] = [];
  patterns.push({
    label: "Your average this month",
    value: `Energy ${avgEnergy.toFixed(1)} · Sleep ${avgSleep.toFixed(1)}`,
  });
  if (energyTrend > 1) patterns.push({ label: "Trend", value: `Energy is rising — ${energyTrend > 0 ? "+" : ""}${energyTrend} since your last check-in.` });
  else if (energyTrend < -1) patterns.push({ label: "Trend", value: `Energy has dipped ${Math.abs(energyTrend)} points. Worth softening this week.` });
  if (sleepGap > 1.5 && sleepHigh.length && sleepLow.length) {
    patterns.push({ label: "What's holding you up", value: `Weeks you sleep 7+/10, your energy averages ${sleepHighEnergy.toFixed(1)} — vs ${sleepLowEnergy.toFixed(1)} on low-sleep weeks.` });
  }
  if (topWorkout) patterns.push({ label: "What you keep returning to", value: `${topWorkout[0]} (${topWorkout[1]} sessions logged).` });
  if (sorenessLog >= 3) patterns.push({ label: "Body wants softness", value: `You've reported soreness ${sorenessLog} of the last ${recent.length} weeks.` });

  return (
    <div className="card-warm p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Eye className="h-4 w-4 text-primary" />
        <h3 className="font-display text-base italic font-bold text-foreground">Your patterns</h3>
        <span className="ml-auto font-body text-[10px] text-muted-foreground">{count} check-ins</span>
      </div>
      <div className="space-y-2">
        {patterns.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-xl bg-secondary/40 px-3 py-2.5"
          >
            <p className="font-body text-[10px] uppercase tracking-wider text-primary/70 mb-0.5">{p.label}</p>
            <p className="font-display text-sm italic text-foreground/85">{p.value}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
