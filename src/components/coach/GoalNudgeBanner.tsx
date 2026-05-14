import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Props { userId: string; }

export default function GoalNudgeBanner({ userId }: Props) {
  const [goal, setGoal] = useState<any>(null);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: goals } = await supabase
        .from("user_goals")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1);
      if (cancelled || !goals || goals.length === 0) return;
      const g = goals[0];
      setGoal(g);

      // Compute progress (time-based if target_date, otherwise from logged entries)
      if (g.target_date) {
        const total = Math.max(1, new Date(g.target_date).getTime() - new Date(g.created_at).getTime());
        const done = Math.min(total, Date.now() - new Date(g.created_at).getTime());
        setPct(Math.round((done / total) * 100));
      } else {
        const { count } = await supabase
          .from("goal_progress")
          .select("id", { count: "exact", head: true })
          .eq("goal_id", g.id);
        setPct(Math.min(100, (count || 0) * 10));
      }
    })();
    return () => { cancelled = true; };
  }, [userId]);

  if (!goal) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-primary/20 bg-primary/5 p-4"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
          <Target className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-body text-[10px] uppercase tracking-wider text-primary/70">Still building toward</p>
          <p className="font-display text-sm italic text-foreground truncate">{goal.goal_description}</p>
        </div>
        <span className="font-display text-base text-primary">{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="h-full rounded-full bg-primary/70"
        />
      </div>
    </motion.div>
  );
}
