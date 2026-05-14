import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, Loader2, RefreshCw, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCycle } from "@/contexts/CycleContext";
import { haptic } from "@/hooks/use-mobile";

interface Focus {
  theme: string;
  intention: string;
  three_acts: string[];
}

interface Props { userId: string; refreshKey?: number; }

const STORAGE = (uid: string, week: string) => `coach-focus:${uid}:${week}`;

function weekStart(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.getFullYear(), d.getMonth(), diff).toISOString().split("T")[0];
}

export default function WeeklyFocusCard({ userId, refreshKey = 0 }: Props) {
  const { currentPhase, currentCycleDay } = useCycle();
  const [focus, setFocus] = useState<Focus | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasCheckin, setHasCheckin] = useState<boolean | null>(null);
  const [doneActs, setDoneActs] = useState<Set<number>>(new Set());

  const week = weekStart();
  const cacheKey = STORAGE(userId, week);
  const doneKey = `${cacheKey}:done`;

  // Hydrate from cache
  useEffect(() => {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) setFocus(JSON.parse(cached));
      const done = localStorage.getItem(doneKey);
      if (done) setDoneActs(new Set(JSON.parse(done)));
    } catch {}
  }, [cacheKey, doneKey]);

  // Check if a check-in exists this week
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("weekly_checkins")
        .select("energy, sleep_quality, soreness, notes")
        .eq("user_id", userId)
        .eq("week_start_date", week)
        .maybeSingle();
      if (cancelled) return;
      setHasCheckin(!!data);
    })();
    return () => { cancelled = true; };
  }, [userId, week, refreshKey]);

  const generate = async () => {
    setLoading(true);
    haptic("medium");
    try {
      const { data: ci } = await supabase
        .from("weekly_checkins")
        .select("energy, sleep_quality, soreness, notes")
        .eq("user_id", userId)
        .eq("week_start_date", week)
        .maybeSingle();

      const { data: goals } = await supabase
        .from("user_goals")
        .select("goal_description")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1);

      const { data, error } = await supabase.functions.invoke("coach-ai", {
        body: {
          action: "weekly_focus",
          context: {
            energy: ci?.energy,
            sleep: ci?.sleep_quality,
            soreness: ci?.soreness,
            notes: ci?.notes,
            cyclePhase: currentPhase,
            cycleDay: currentCycleDay,
            goal: goals?.[0]?.goal_description || null,
          },
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setFocus(data as Focus);
      localStorage.setItem(cacheKey, JSON.stringify(data));
      setDoneActs(new Set());
      localStorage.removeItem(doneKey);
    } catch (e) {
      console.error("focus generate", e);
    } finally {
      setLoading(false);
    }
  };

  const toggleAct = (i: number) => {
    haptic("light");
    setDoneActs((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      localStorage.setItem(doneKey, JSON.stringify([...next]));
      return next;
    });
  };

  if (hasCheckin === false && !focus) {
    return (
      <div className="card-warm p-5 text-center">
        <Compass className="h-5 w-5 text-muted-foreground/50 mx-auto mb-2" />
        <p className="font-display text-sm italic text-muted-foreground">
          Once you check in, I'll write you a focus for the week.
        </p>
      </div>
    );
  }

  return (
    <div className="card-warm p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Compass className="h-4 w-4 text-primary" />
          <h3 className="font-display text-base italic font-bold text-foreground">This week's focus</h3>
        </div>
        {focus && (
          <button onClick={generate} disabled={loading} className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg" aria-label="Regenerate">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!focus ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <p className="font-display text-sm italic text-muted-foreground mb-3">
              A small thread to follow this week — drawn from your check-in and where you are in your cycle.
            </p>
            <button
              onClick={generate}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-display text-sm italic flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Listening…</> : "Write my focus"}
            </button>
          </motion.div>
        ) : (
          <motion.div key="focus" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
            <p className="font-display text-lg italic text-primary">{focus.theme}</p>
            <p className="font-display text-sm italic text-foreground/85 leading-relaxed">{focus.intention}</p>
            {focus.three_acts?.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {focus.three_acts.map((act, i) => {
                  const done = doneActs.has(i);
                  return (
                    <button
                      key={i}
                      onClick={() => toggleAct(i)}
                      className={`w-full flex items-start gap-2 text-left rounded-xl px-3 py-2 transition ${done ? "bg-primary/8" : "hover:bg-secondary/40"}`}
                    >
                      <span className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${done ? "bg-primary border-primary" : "border-border"}`}>
                        {done && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                      </span>
                      <span className={`font-display text-[13px] italic ${done ? "text-muted-foreground line-through" : "text-foreground/85"}`}>{act}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
