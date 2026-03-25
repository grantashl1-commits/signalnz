import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { haptic } from "@/hooks/use-mobile";
import { AtmosphericHero } from "@/components/AtmosphericSection";
import ReactMarkdown from "react-markdown";
import {
  Dumbbell, Salad, Loader2, RefreshCw, Zap, Moon, Activity,
  Target, TrendingUp, ChevronRight, Plus, Check, Calendar
} from "lucide-react";
import { Navigate } from "react-router-dom";

// ── Helper ──
function getWeekStart(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.getFullYear(), d.getMonth(), diff).toISOString().split("T")[0];
}

const ENERGY_LABELS = ["", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
const SORENESS_OPTIONS = ["None", "Mild", "Moderate", "High"];
const GOAL_TYPES = [
  "Lose weight", "Build fitness", "Run a race", "Improve energy", "Build strength", "Custom"
];

// ═══════════════════════════════════════════════════════
// WEEKLY CHECK-IN CARD
// ═══════════════════════════════════════════════════════
function WeeklyCheckin({ userId, onComplete }: { userId: string; onComplete: () => void }) {
  const [energy, setEnergy] = useState(5);
  const [sleep, setSleep] = useState(5);
  const [soreness, setSoreness] = useState("None");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [alreadyDone, setAlreadyDone] = useState(false);

  useEffect(() => {
    const weekStart = getWeekStart();
    supabase.from("weekly_checkins")
      .select("id")
      .eq("user_id", userId)
      .eq("week_start_date", weekStart)
      .maybeSingle()
      .then(({ data }) => { if (data) setAlreadyDone(true); });
  }, [userId]);

  const handleSubmit = async () => {
    setSaving(true);
    haptic("medium");
    const { error } = await supabase.from("weekly_checkins").insert({
      user_id: userId,
      week_start_date: getWeekStart(),
      energy, sleep_quality: sleep, soreness: soreness.toLowerCase(), notes: notes || null,
    });
    if (error) {
      toast.error("Couldn't save check-in");
    } else {
      toast.success("Check-in saved");
      setAlreadyDone(true);
      onComplete();
    }
    setSaving(false);
  };

  if (alreadyDone) {
    return (
      <div className="card-warm p-5 text-center">
        <Check className="h-6 w-6 text-phase-follicular mx-auto mb-2" />
        <p className="font-display text-sm italic text-foreground/70">This week's check-in complete</p>
      </div>
    );
  }

  return (
    <div className="card-warm p-5 space-y-5">
      <h3 className="font-display text-lg italic text-foreground font-bold">Weekly Check-In</h3>

      {/* Energy */}
      <div>
        <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-2 block">
          Energy this week
        </label>
        <input
          type="range" min={1} max={10} value={energy} onChange={(e) => setEnergy(+e.target.value)}
          className="w-full accent-primary"
        />
        <div className="flex justify-between font-mono text-[9px] text-muted-foreground/50">
          <span>Low</span><span>{energy}/10</span><span>High</span>
        </div>
      </div>

      {/* Sleep */}
      <div>
        <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-2 block">
          Sleep quality
        </label>
        <input
          type="range" min={1} max={10} value={sleep} onChange={(e) => setSleep(+e.target.value)}
          className="w-full accent-primary"
        />
        <div className="flex justify-between font-mono text-[9px] text-muted-foreground/50">
          <span>Poor</span><span>{sleep}/10</span><span>Great</span>
        </div>
      </div>

      {/* Soreness */}
      <div>
        <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-2 block">
          Muscle soreness
        </label>
        <div className="flex gap-2">
          {SORENESS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => { haptic("light"); setSoreness(s); }}
              className={`flex-1 py-2 rounded-xl font-display text-[12px] italic transition-all ${
                soreness === s
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-2 block">
          Anything else to tell your coach? (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value.slice(0, 200))}
          maxLength={200}
          rows={2}
          placeholder="E.g. feeling stressed, tried a new class..."
          className="w-full bg-secondary/30 border border-border rounded-xl px-3 py-2 font-display text-sm italic text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/30 resize-none"
        />
        <p className="font-mono text-[9px] text-muted-foreground/40 text-right">{notes.length}/200</p>
      </div>

      <button
        onClick={handleSubmit}
        disabled={saving}
        className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-display text-sm italic shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        Submit Check-In
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// GOAL TRACKER
// ═══════════════════════════════════════════════════════
function GoalTracker({ userId }: { userId: string }) {
  const [goal, setGoal] = useState<any>(null);
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newGoalType, setNewGoalType] = useState("Build fitness");
  const [newGoalDesc, setNewGoalDesc] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [logValue, setLogValue] = useState("");
  const [logNote, setLogNote] = useState("");

  const fetchGoal = useCallback(async () => {
    setLoading(true);
    const { data: goals } = await supabase
      .from("user_goals")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (goals && goals.length > 0) {
      setGoal(goals[0]);
      const { data: prog } = await supabase
        .from("goal_progress")
        .select("*")
        .eq("goal_id", goals[0].id)
        .order("logged_at", { ascending: true });
      setProgress(prog || []);
    } else {
      setGoal(null);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchGoal(); }, [fetchGoal]);

  const handleCreateGoal = async () => {
    const desc = newGoalType === "Custom" ? newGoalDesc : newGoalType;
    if (!desc) return;
    haptic("medium");
    await supabase.from("user_goals").insert({
      user_id: userId,
      goal_type: newGoalType.toLowerCase().replace(/ /g, "_"),
      goal_description: desc,
      target_date: targetDate || null,
    });
    toast.success("Goal set! 🎯");
    setShowCreate(false);
    setNewGoalDesc("");
    fetchGoal();
  };

  const handleLogProgress = async () => {
    if (!logValue || !goal) return;
    haptic("medium");
    await supabase.from("goal_progress").insert({
      goal_id: goal.id,
      user_id: userId,
      value: parseFloat(logValue),
      note: logNote || null,
    });
    toast.success("Progress logged ✓");
    setLogValue("");
    setLogNote("");
    fetchGoal();
  };

  if (loading) return <div className="card-warm p-5 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>;

  if (!goal) {
    return (
      <div className="card-warm p-5">
        <h3 className="font-display text-lg italic text-foreground font-bold mb-4">Set Your Goal</h3>
        {!showCreate ? (
          <button onClick={() => setShowCreate(true)} className="w-full py-3 rounded-xl bg-secondary/50 border-2 border-dashed border-border text-muted-foreground font-display text-sm italic flex items-center justify-center gap-2">
            <Target className="h-4 w-4" /> Create a goal
          </button>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {GOAL_TYPES.map((g) => (
                <button
                  key={g}
                  onClick={() => setNewGoalType(g)}
                  className={`px-3 py-1.5 rounded-lg font-display text-[12px] italic transition-all ${
                    newGoalType === g ? "bg-primary text-primary-foreground" : "bg-secondary/50 text-muted-foreground"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
            {newGoalType === "Custom" && (
              <input
                value={newGoalDesc}
                onChange={(e) => setNewGoalDesc(e.target.value)}
                placeholder="Describe your goal..."
                className="w-full bg-secondary/30 border border-border rounded-xl px-3 py-2 font-display text-sm italic text-foreground placeholder:text-muted-foreground/30 focus:outline-none"
              />
            )}
            <div>
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">Target date (optional)</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full bg-secondary/30 border border-border rounded-xl px-3 py-2 font-mono text-xs text-foreground focus:outline-none"
              />
            </div>
            <button onClick={handleCreateGoal} className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-display text-sm italic">
              Set Goal 🎯
            </button>
          </div>
        )}
      </div>
    );
  }

  // Calculate progress
  const weeksToGoal = goal.target_date
    ? Math.max(0, Math.ceil((new Date(goal.target_date).getTime() - Date.now()) / (7 * 24 * 60 * 60 * 1000)))
    : null;
  const totalWeeks = goal.target_date
    ? Math.max(1, Math.ceil((new Date(goal.target_date).getTime() - new Date(goal.created_at).getTime()) / (7 * 24 * 60 * 60 * 1000)))
    : null;
  const pct = totalWeeks ? Math.min(100, Math.round(((totalWeeks - (weeksToGoal || 0)) / totalWeeks) * 100)) : 0;

  return (
    <div className="card-warm p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-display text-lg italic text-foreground font-bold">Your Goal</h3>
          <p className="font-display text-sm italic text-primary mt-0.5">{goal.goal_description}</p>
        </div>
        <Target className="h-5 w-5 text-primary/50 flex-shrink-0" />
      </div>

      {/* Progress bar */}
      {totalWeeks && (
        <div>
          <div className="flex justify-between mb-1">
            <span className="font-mono text-[10px] text-muted-foreground">{pct}% complete</span>
            <span className="font-mono text-[10px] text-muted-foreground">{weeksToGoal} weeks to go</span>
          </div>
          <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      )}

      {/* Mini trend chart */}
      {progress.length > 1 && (
        <div className="flex items-end gap-1 h-12">
          {progress.slice(-12).map((p, i) => {
            const max = Math.max(...progress.map(x => x.value));
            const min = Math.min(...progress.map(x => x.value));
            const range = max - min || 1;
            const h = ((p.value - min) / range) * 100;
            return (
              <div
                key={p.id}
                className="flex-1 rounded-t bg-primary/20 hover:bg-primary/40 transition-colors"
                style={{ height: `${Math.max(8, h)}%` }}
                title={`${p.value} — ${new Date(p.logged_at).toLocaleDateString()}`}
              />
            );
          })}
        </div>
      )}

      {/* Log progress */}
      <div className="flex gap-2">
        <input
          type="number"
          value={logValue}
          onChange={(e) => setLogValue(e.target.value)}
          placeholder="Value"
          className="flex-1 bg-secondary/30 border border-border rounded-xl px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground/30 focus:outline-none"
        />
        <input
          value={logNote}
          onChange={(e) => setLogNote(e.target.value)}
          placeholder="Note (opt)"
          className="flex-1 bg-secondary/30 border border-border rounded-xl px-3 py-2 font-display text-xs italic text-foreground placeholder:text-muted-foreground/30 focus:outline-none"
        />
        <button
          onClick={handleLogProgress}
          disabled={!logValue}
          className="px-3 py-2 rounded-xl bg-primary text-primary-foreground disabled:opacity-40"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Recent entries */}
      {progress.length > 0 && (
        <div className="space-y-1">
          {progress.slice(-3).reverse().map((p) => (
            <div key={p.id} className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              <span>{p.value}</span>
              {p.note && <span className="italic">— {p.note}</span>}
              <span className="ml-auto">{new Date(p.logged_at).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// LOG WORKOUT SESSION
// ═══════════════════════════════════════════════════════
function LogWorkout({ userId, onLogged }: { userId: string; onLogged: () => void }) {
  const [type, setType] = useState("Running");
  const [duration, setDuration] = useState("30");
  const [intensity, setIntensity] = useState("moderate");
  const [saving, setSaving] = useState(false);

  const TYPES = ["Running", "Strength", "Yoga", "HIIT", "Walking", "Cycling", "Swimming", "Other"];
  const INTENSITIES = ["light", "moderate", "hard"];

  const handleLog = async () => {
    setSaving(true);
    haptic("medium");
    const { error } = await supabase.from("workout_sessions").insert({
      user_id: userId,
      workout_type: type.toLowerCase(),
      duration_minutes: parseInt(duration) || 30,
      intensity,
    });
    if (error) toast.error("Couldn't log session");
    else { toast.success("Workout logged 💪"); onLogged(); }
    setSaving(false);
  };

  return (
    <div className="card-warm p-5 space-y-4">
      <h3 className="font-display text-lg italic text-foreground font-bold">Log a Workout</h3>

      <div className="flex flex-wrap gap-2">
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => { haptic("light"); setType(t); }}
            className={`px-3 py-1.5 rounded-lg font-display text-[12px] italic transition-all ${
              type === t ? "bg-primary text-primary-foreground" : "bg-secondary/50 text-muted-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">Minutes</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full bg-secondary/30 border border-border rounded-xl px-3 py-2 font-mono text-sm text-foreground focus:outline-none"
          />
        </div>
        <div className="flex-1">
          <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">Intensity</label>
          <div className="flex gap-1">
            {INTENSITIES.map((i) => (
              <button
                key={i}
                onClick={() => { haptic("light"); setIntensity(i); }}
                className={`flex-1 py-2 rounded-lg font-display text-[11px] italic capitalize transition-all ${
                  intensity === i ? "bg-primary text-primary-foreground" : "bg-secondary/50 text-muted-foreground"
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={handleLog}
        disabled={saving}
        className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-display text-sm italic disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Dumbbell className="h-4 w-4" />}
        Log Session
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// COMMUNITY STATS
// ═══════════════════════════════════════════════════════
function CommunityStats({ userId }: { userId: string }) {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const weekStart = getWeekStart();
    supabase.from("workout_sessions")
      .select("user_id, workout_type, duration_minutes")
      .gte("completed_at", weekStart)
      .then(({ data }) => {
        if (!data || data.length === 0) { setStats(null); return; }
        const byUser: Record<string, number> = {};
        const byType: Record<string, number> = {};
        for (const s of data) {
          byUser[s.user_id] = (byUser[s.user_id] || 0) + 1;
          byType[s.workout_type] = (byType[s.workout_type] || 0) + 1;
        }
        const groupSize = Object.keys(byUser).length;
        const avgSessions = Math.round(data.length / groupSize * 10) / 10;
        const topType = Object.entries(byType).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
        const ranked = Object.entries(byUser).sort((a, b) => b[1] - a[1]);
        const userRank = ranked.findIndex(([uid]) => uid === userId) + 1;

        // Top 5
        const top5 = ranked.slice(0, 5);

        setStats({ avgSessions, topType, userRank: userRank || groupSize + 1, groupSize, top5 });
      });
  }, [userId]);

  if (!stats) {
    return (
      <div className="card-warm p-5 text-center">
        <Activity className="h-5 w-5 text-muted-foreground/40 mx-auto mb-2" />
        <p className="font-display text-sm italic text-muted-foreground/50">No community activity this week yet</p>
        <p className="font-mono text-[10px] text-muted-foreground/30 mt-1">Log a workout to get started</p>
      </div>
    );
  }

  return (
    <div className="card-warm p-5 space-y-3">
      <h3 className="font-display text-lg italic text-foreground font-bold">Community Activity</h3>
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center">
          <p className="font-display text-xl font-bold text-foreground">{stats.avgSessions}</p>
          <p className="font-mono text-[9px] text-muted-foreground uppercase">Avg sessions</p>
        </div>
        <div className="text-center">
          <p className="font-display text-xl font-bold text-foreground capitalize">{stats.topType}</p>
          <p className="font-mono text-[9px] text-muted-foreground uppercase">Top workout</p>
        </div>
        <div className="text-center">
          <p className="font-display text-xl font-bold text-primary">#{stats.userRank}</p>
          <p className="font-mono text-[9px] text-muted-foreground uppercase">Your rank</p>
        </div>
      </div>
      {stats.top5.length > 0 && (
        <div className="pt-2 border-t border-border space-y-1">
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Leaderboard</p>
          {stats.top5.map(([uid, count]: [string, number], i: number) => (
            <div key={uid} className={`flex items-center gap-2 font-mono text-[11px] ${uid === userId ? "text-primary font-bold" : "text-muted-foreground"}`}>
              <span className="w-4 text-right">{i + 1}.</span>
              <span className="flex-1">{uid === userId ? "You" : `Member ${i + 1}`}</span>
              <span>{count} sessions</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// AI PLAN GENERATOR
// ═══════════════════════════════════════════════════════
function PlanGenerator({ userId, session }: { userId: string; session: any }) {
  const [generating, setGenerating] = useState<string | null>(null);
  const [plan, setPlan] = useState<{ type: string; content: string; date: string } | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    supabase.from("generated_plans")
      .select("*")
      .eq("user_id", userId)
      .order("generated_at", { ascending: false })
      .limit(5)
      .then(({ data }) => setHistory(data || []));
  }, [userId, plan]);

  const generate = async (planType: "training" | "nutrition") => {
    setGenerating(planType);
    haptic("medium");
    try {
      const { data, error } = await supabase.functions.invoke("generate-plan", {
        body: { planType },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setPlan({ type: planType, content: data.plan, date: new Date().toLocaleDateString() });
      toast.success(`${planType === "training" ? "Training" : "Nutrition"} plan ready!`);
    } catch (e: any) {
      toast.error(e.message || "Failed to generate plan");
    }
    setGenerating(null);
  };

  return (
    <div className="space-y-4">
      {/* Generate buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => generate("training")}
          disabled={!!generating}
          className="card-warm p-5 text-left hover:shadow-md transition-shadow disabled:opacity-50"
        >
          <Dumbbell className="h-6 w-6 text-primary mb-3" />
          <p className="font-display text-sm font-bold italic text-foreground">Training Plan</p>
          <p className="font-mono text-[10px] text-muted-foreground mt-1">Personalised weekly workout</p>
          {generating === "training" && <Loader2 className="h-4 w-4 animate-spin text-primary mt-2" />}
        </button>
        <button
          onClick={() => generate("nutrition")}
          disabled={!!generating}
          className="card-warm p-5 text-left hover:shadow-md transition-shadow disabled:opacity-50"
        >
          <Salad className="h-6 w-6 text-phase-follicular mb-3" />
          <p className="font-display text-sm font-bold italic text-foreground">Nutrition Plan</p>
          <p className="font-mono text-[10px] text-muted-foreground mt-1">Meals matched to your load</p>
          {generating === "nutrition" && <Loader2 className="h-4 w-4 animate-spin text-primary mt-2" />}
        </button>
      </div>

      {/* Stay on page warning */}
      {generating && (
        <div className="rounded-xl bg-primary/5 px-4 py-3 text-center">
          <p className="font-body text-xs text-primary italic">
            Please stay on this page while your plan is being created…
          </p>
        </div>
      )}

      {/* Generated plan display */}
      <AnimatePresence>
        {plan && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="card-warm p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {plan.type === "training"
                  ? <Dumbbell className="h-4 w-4 text-primary" />
                  : <Salad className="h-4 w-4 text-phase-follicular" />}
                <span className="font-display text-sm font-bold italic text-foreground capitalize">
                  {plan.type} Plan
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">{plan.date}</span>
              </div>
              <button
                onClick={() => generate(plan.type as "training" | "nutrition")}
                disabled={!!generating}
                className="p-2 rounded-lg hover:bg-secondary text-muted-foreground transition-colors"
                title="Regenerate"
              >
                <RefreshCw className={`h-4 w-4 ${generating ? "animate-spin" : ""}`} />
              </button>
            </div>
            <div className="prose prose-sm max-w-none font-display italic text-foreground/80 leading-relaxed [&_h1]:text-base [&_h1]:font-bold [&_h2]:text-sm [&_h2]:font-bold [&_h3]:text-sm [&_h3]:font-semibold [&_ul]:space-y-1 [&_li]:text-[13px] [&_p]:text-[13px] [&_strong]:text-foreground">
              <ReactMarkdown>{plan.content}</ReactMarkdown>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History */}
      {history.length > 0 && (
        <div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <Calendar className="h-3 w-3" />
            Previous plans ({history.length})
            <ChevronRight className={`h-3 w-3 transition-transform ${showHistory ? "rotate-90" : ""}`} />
          </button>
          <AnimatePresence>
            {showHistory && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-2 mt-2">
                {history.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => setPlan({ type: h.plan_type, content: h.plan_content, date: new Date(h.generated_at).toLocaleDateString() })}
                    className="w-full text-left card-warm p-3 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center gap-2">
                      {h.plan_type === "training" ? <Dumbbell className="h-3 w-3 text-primary" /> : <Salad className="h-3 w-3 text-phase-follicular" />}
                      <span className="font-display text-xs italic text-foreground capitalize">{h.plan_type} plan</span>
                      <span className="font-mono text-[10px] text-muted-foreground ml-auto">{new Date(h.generated_at).toLocaleDateString()}</span>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// MAIN COACH PAGE
// ═══════════════════════════════════════════════════════
export default function CoachPage() {
  const { user, session } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  if (!user || !session) return <Navigate to="/auth" replace />;

  return (
    <>
      <AtmosphericHero>
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/60 mb-3">MY COACH</p>
        <h1 className="font-display text-4xl md:text-5xl font-bold italic text-white mb-3">Your Plan</h1>
        <p className="font-display text-base italic text-white/70 max-w-md">
          Check in, set goals, and get AI-powered training and nutrition plans.
        </p>
      </AtmosphericHero>

      <div className="max-w-2xl mx-auto px-4 pb-32 space-y-6 mt-6">
        {/* Weekly Check-In */}
        <WeeklyCheckin userId={user.id} onComplete={() => setRefreshKey((k) => k + 1)} />

        {/* Goal Tracker */}
        <GoalTracker userId={user.id} key={`goal-${refreshKey}`} />

        {/* Log Workout */}
        <LogWorkout userId={user.id} onLogged={() => setRefreshKey((k) => k + 1)} />

        {/* Community Stats */}
        <CommunityStats userId={user.id} key={`comm-${refreshKey}`} />

        {/* AI Plan Generator */}
        <div>
          <h2 className="font-display text-xl italic font-bold text-foreground mb-4">Generate My Plan</h2>
          <PlanGenerator userId={user.id} session={session} />
        </div>
      </div>
    </>
  );
}
