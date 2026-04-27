import { useState, useMemo, useRef, useCallback, useEffect, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ruler, Camera, Image, Trash2, Plus, Loader2, Sparkles, Flame, Dumbbell, Star, PersonStanding, Activity, Leaf, Bone, Zap, TrendingUp, ChevronDown, Check, type LucideIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { haptic } from "@/hooks/use-mobile";
import { useCycle, type Phase } from "@/contexts/CycleContext";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from "recharts";

// ── Measurement History ──
interface MeasurementEntry {
  id: string;
  date: string;
  cycleDay: number;
  phase: Phase;
  weight: string;
  height: string;
  chest: string;
  waist: string;
  hips: string;
  thighs: string;
  arms: string;
  bodyFat: string;
  energyLevel: number;
  notes: string;
  weightUnit: "kg" | "lbs";
  lengthUnit: "cm" | "in";
}

const HISTORY_KEY = "signal_measurement_history";
const UNIT_KEY = "signal_measurement_units";

function loadHistory(): MeasurementEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveHistory(entries: MeasurementEntry[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
}

function loadUnits(): { weight: "kg" | "lbs"; length: "cm" | "in" } {
  try {
    const raw = localStorage.getItem(UNIT_KEY);
    return raw ? JSON.parse(raw) : { weight: "kg", length: "cm" };
  } catch { return { weight: "kg", length: "cm" }; }
}

function saveUnits(units: { weight: "kg" | "lbs"; length: "cm" | "in" }) {
  localStorage.setItem(UNIT_KEY, JSON.stringify(units));
}

const PHASE_COLOR: Record<Phase, string> = {
  menstrual: "#C4526E",
  follicular: "#5C4A9E",
  ovulatory: "#C47A8A",
  luteal: "#9B89B4",
};

const PHASE_LABEL: Record<Phase, string> = {
  menstrual: "Menstrual",
  follicular: "Follicular",
  ovulatory: "Ovulatory",
  luteal: "Luteal",
};

// ── Measurements Form ──
function MeasurementsForm({ onSaved }: { onSaved: () => void }) {
  const { currentCycleDay, currentPhase } = useCycle();
  const [units, setUnits] = useState(loadUnits);
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [chest, setChest] = useState("");
  const [waist, setWaist] = useState("");
  const [hips, setHips] = useState("");
  const [thighs, setThighs] = useState("");
  const [arms, setArms] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [energyLevel, setEnergyLevel] = useState(3);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);

  // Load height from last entry as default
  useEffect(() => {
    const history = loadHistory();
    if (history.length > 0) {
      setHeight(history[0].height);
    }
  }, []);

  const toggleWeightUnit = () => {
    const next = units.weight === "kg" ? "lbs" as const : "kg" as const;
    const newUnits = { ...units, weight: next };
    setUnits(newUnits);
    saveUnits(newUnits);
    haptic("light");
  };

  const toggleLengthUnit = () => {
    const next = units.length === "cm" ? "in" as const : "cm" as const;
    const newUnits = { ...units, length: next };
    setUnits(newUnits);
    saveUnits(newUnits);
    haptic("light");
  };

  const numericOnly = (val: string) => val.replace(/[^0-9.]/g, "").slice(0, 6);

  const handleSave = () => {
    haptic("medium");
    const entry: MeasurementEntry = {
      id: `m-${Date.now()}`,
      date: new Date().toISOString(),
      cycleDay: currentCycleDay,
      phase: currentPhase,
      weight, height, chest, waist, hips, thighs, arms, bodyFat,
      energyLevel, notes,
      weightUnit: units.weight,
      lengthUnit: units.length,
    };
    const history = loadHistory();
    history.unshift(entry);
    saveHistory(history);
    setSaved(true);
    setTimeout(() => { setSaved(false); onSaved(); }, 1500);
    // Reset form (keep height)
    setWeight(""); setChest(""); setWaist(""); setHips(""); setThighs(""); setArms(""); setBodyFat(""); setNotes("");
    setEnergyLevel(3);
  };

  const hasValues = weight || chest || waist || hips || thighs || arms;

  return (
    <div className="card-warm p-4 rounded-2xl space-y-4">
      <div className="flex items-center gap-2">
        <Ruler className="h-4 w-4 text-primary" />
        <h3 className="font-display text-base font-semibold text-foreground">Log Measurements</h3>
      </div>

      <div className="flex items-center gap-2 text-[10px]">
        <span className="font-body text-muted-foreground">
          {PHASE_LABEL[currentPhase]} · Day {currentCycleDay} · {new Date().toLocaleDateString("en-NZ", { weekday: "short", day: "numeric", month: "short" })}
        </span>
      </div>

      {/* Weight + Height with unit toggles */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="font-body text-[10px] uppercase tracking-widest text-muted-foreground">Weight</label>
            <button onClick={toggleWeightUnit} className="font-body text-[9px] text-primary underline">{units.weight}</button>
          </div>
          <Input type="text" inputMode="decimal" value={weight} onChange={e => setWeight(numericOnly(e.target.value))} placeholder={units.weight === "kg" ? "62" : "137"} className="h-10 text-base rounded-xl bg-background border-border" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="font-body text-[10px] uppercase tracking-widest text-muted-foreground">Height</label>
            <button onClick={toggleLengthUnit} className="font-body text-[9px] text-primary underline">{units.length}</button>
          </div>
          <Input type="text" inputMode="decimal" value={height} onChange={e => setHeight(numericOnly(e.target.value))} placeholder={units.length === "cm" ? "165" : "65"} className="h-10 text-base rounded-xl bg-background border-border" />
        </div>
      </div>

      {/* Body measurements */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { key: "chest", label: "Chest", val: chest, set: setChest },
          { key: "waist", label: "Waist", val: waist, set: setWaist },
          { key: "hips", label: "Hips", val: hips, set: setHips },
          { key: "thighs", label: "Thighs", val: thighs, set: setThighs },
          { key: "arms", label: "Arms", val: arms, set: setArms },
          { key: "bodyFat", label: "Body fat %", val: bodyFat, set: setBodyFat },
        ].map(f => (
          <div key={f.key} className="space-y-1">
            <label className="font-body text-[10px] uppercase tracking-widest text-muted-foreground">
              {f.label} {f.key !== "bodyFat" ? `(${units.length})` : ""}
            </label>
            <Input type="text" inputMode="decimal" value={f.val} onChange={e => f.set(numericOnly(e.target.value))} className="h-10 text-base rounded-xl bg-background border-border" />
          </div>
        ))}
      </div>

      {/* Energy level */}
      <div className="space-y-2">
        <label className="font-body text-[10px] uppercase tracking-widest text-muted-foreground">Energy level</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(level => (
            <button
              key={level}
              onClick={() => { haptic("light"); setEnergyLevel(level); }}
              className={`touch-btn flex-1 rounded-xl py-2.5 min-h-[40px] font-body text-sm font-bold transition-all ${
                energyLevel === level ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
        <div className="flex justify-between">
          <span className="font-body text-[9px] text-muted-foreground">Low</span>
          <span className="font-body text-[9px] text-muted-foreground">High</span>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-1">
        <label className="font-body text-[10px] uppercase tracking-widest text-muted-foreground">Notes</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="e.g. feeling bloated this week, slept better..."
          rows={2}
          className="w-full rounded-xl bg-background px-4 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-1 focus:ring-primary resize-none"
        />
      </div>

      <Button onClick={handleSave} disabled={!hasValues} className="w-full h-10 rounded-full font-body text-sm font-semibold">
        {saved ? "Saved ✓" : "Log entry"}
      </Button>
    </div>
  );
}

// ── Comparison Stats ──
function ComparisonCard({ history }: { history: MeasurementEntry[] }) {
  if (history.length < 4) return null;

  const latest = history[0];
  const first = history[history.length - 1];

  const changes: { label: string; diff: string; positive: boolean }[] = [];

  const calc = (field: keyof MeasurementEntry, label: string) => {
    const a = parseFloat(first[field] as string);
    const b = parseFloat(latest[field] as string);
    if (!a || !b) return;
    const diff = b - a;
    const sign = diff > 0 ? "+" : "";
    const unit = field === "weight" ? latest.weightUnit : field === "bodyFat" ? "%" : latest.lengthUnit;
    changes.push({ label, diff: `${sign}${diff.toFixed(1)} ${unit}`, positive: field === "weight" ? diff < 0 : diff < 0 });
  };

  calc("weight", "Weight");
  calc("waist", "Waist");
  calc("hips", "Hips");
  calc("chest", "Chest");
  calc("thighs", "Thighs");
  calc("arms", "Arms");
  calc("bodyFat", "Body fat");

  if (changes.length === 0) return null;

  return (
    <div className="card-warm p-4 rounded-2xl space-y-3">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-primary" />
        <h3 className="font-display text-sm font-semibold text-foreground">Since you started</h3>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {changes.map(c => (
          <div key={c.label} className="rounded-xl bg-background p-3">
            <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider">{c.label}</p>
            <p className={`font-body text-sm font-bold ${c.positive ? "text-accent" : "text-foreground"}`}>{c.diff}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Measurement Chart ──
function MeasurementChart({ history }: { history: MeasurementEntry[] }) {
  const [metric, setMetric] = useState<"weight" | "waist" | "hips" | "chest">("weight");

  if (history.length < 2) return null;

  const chartData = [...history].reverse().map(entry => ({
    date: new Date(entry.date).toLocaleDateString("en-NZ", { day: "numeric", month: "short" }),
    value: parseFloat(entry[metric] as string) || 0,
    phase: entry.phase,
  })).filter(d => d.value > 0);

  if (chartData.length < 2) return null;

  const unit = metric === "weight" ? history[0]?.weightUnit || "kg" : history[0]?.lengthUnit || "cm";

  return (
    <div className="card-warm p-4 rounded-2xl space-y-3">
      <h3 className="font-display text-sm font-semibold text-foreground">Progress Chart</h3>
      <div className="flex gap-1 rounded-full bg-secondary p-0.5">
        {(["weight", "waist", "hips", "chest"] as const).map(m => (
          <button key={m} onClick={() => { haptic("light"); setMetric(m); }}
            className={`flex-1 rounded-full px-2 py-1.5 font-body text-[10px] font-medium transition-all capitalize ${metric === m ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
          >{m}</button>
        ))}
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} unit={` ${unit}`} domain={["auto", "auto"]} />
            <Tooltip
              contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 11 }}
              formatter={(value: number) => [`${value} ${unit}`, metric]}
            />
            <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))", r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── History Timeline ──
function HistoryTimeline({ history }: { history: MeasurementEntry[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (history.length === 0) return null;

  return (
    <div className="card-warm p-4 rounded-2xl space-y-3">
      <h3 className="font-display text-sm font-semibold text-foreground">History</h3>
      <div className="space-y-2">
        {history.slice(0, 12).map(entry => {
          const isOpen = expanded === entry.id;
          return (
            <button
              key={entry.id}
              onClick={() => { haptic("light"); setExpanded(isOpen ? null : entry.id); }}
              className="touch-card w-full text-left rounded-xl bg-background p-3 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PHASE_COLOR[entry.phase] }} />
                  <span className="font-body text-xs font-medium text-foreground">
                    {new Date(entry.date).toLocaleDateString("en-NZ", { weekday: "short", day: "numeric", month: "short" })}
                  </span>
                  <span className="font-body text-[9px] text-muted-foreground">
                    Day {entry.cycleDay} · {PHASE_LABEL[entry.phase]}
                  </span>
                </div>
                <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </div>

              {/* Summary row */}
              <div className="flex gap-3 mt-1.5">
                {entry.weight && <span className="font-body text-[10px] text-muted-foreground">{entry.weight} {entry.weightUnit}</span>}
                {entry.waist && <span className="font-body text-[10px] text-muted-foreground">W: {entry.waist}</span>}
                {entry.hips && <span className="font-body text-[10px] text-muted-foreground">H: {entry.hips}</span>}
                <span className="font-body text-[10px] text-muted-foreground">E {entry.energyLevel}/5</span>
              </div>

              {/* Expanded detail */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border">
                      {entry.chest && <div><p className="font-body text-[9px] text-muted-foreground">Chest</p><p className="font-body text-xs text-foreground">{entry.chest} {entry.lengthUnit}</p></div>}
                      {entry.waist && <div><p className="font-body text-[9px] text-muted-foreground">Waist</p><p className="font-body text-xs text-foreground">{entry.waist} {entry.lengthUnit}</p></div>}
                      {entry.hips && <div><p className="font-body text-[9px] text-muted-foreground">Hips</p><p className="font-body text-xs text-foreground">{entry.hips} {entry.lengthUnit}</p></div>}
                      {entry.thighs && <div><p className="font-body text-[9px] text-muted-foreground">Thighs</p><p className="font-body text-xs text-foreground">{entry.thighs} {entry.lengthUnit}</p></div>}
                      {entry.arms && <div><p className="font-body text-[9px] text-muted-foreground">Arms</p><p className="font-body text-xs text-foreground">{entry.arms} {entry.lengthUnit}</p></div>}
                      {entry.bodyFat && <div><p className="font-body text-[9px] text-muted-foreground">Body fat</p><p className="font-body text-xs text-foreground">{entry.bodyFat}%</p></div>}
                    </div>
                    {entry.notes && (
                      <p className="font-body text-[11px] text-muted-foreground mt-2 italic">"{entry.notes}"</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Body Goals Section (unchanged) ──
const BODY_GOALS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "lose-weight", label: "Lose weight", icon: Flame },
  { id: "maintain", label: "Maintain weight", icon: TrendingUp },
  { id: "gain-muscle", label: "Build muscle", icon: Dumbbell },
  { id: "tone-up", label: "Tone & define", icon: Star },
  { id: "flexibility", label: "Improve flexibility", icon: PersonStanding },
  { id: "endurance", label: "Build endurance", icon: Activity },
  { id: "stress-relief", label: "Stress relief", icon: Leaf },
  { id: "posture", label: "Fix posture", icon: Bone },
  { id: "energy", label: "More energy", icon: Zap },
];

const GOALS_KEY = "signal_body_goals";

function loadBodyGoals(): string[] {
  try {
    const raw = localStorage.getItem(GOALS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveBodyGoals(goals: string[]) {
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
}

function BodyGoalsSection() {
  const [goals, setGoals] = useState<string[]>(loadBodyGoals());
  const [customGoal, setCustomGoal] = useState("");
  const [saved, setSaved] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [planSummary, setPlanSummary] = useState<string | null>(null);
  const { currentPhase, currentCycleDay } = useCycle();
  const info = { phase: currentPhase, cycleDay: currentCycleDay };

  useEffect(() => {
    try {
      const raw = localStorage.getItem("signal_ai_workout_plan");
      if (raw) {
        const plan = JSON.parse(raw);
        setPlanSummary(plan.summary || null);
      }
    } catch {}
  }, []);

  const toggleGoal = (id: string) => {
    haptic("light");
    setGoals(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]);
  };

  const generatePlan = async (goalsToUse: string[]) => {
    setGenerating(true);
    try {
      const goalLabels = goalsToUse.map(g => {
        const preset = BODY_GOALS.find(bg => bg.id === g);
        return preset ? preset.label : g;
      });
      const { data, error } = await supabase.functions.invoke("workout-plan", {
        body: { goals: goalLabels, phase: info.phase, cycleDay: info.cycleDay },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      localStorage.setItem("signal_ai_workout_plan", JSON.stringify(data));
      setPlanSummary(data.summary || "Plan generated!");
      haptic("success");
    } catch (e: any) {
      console.error("Plan generation failed, using fallback:", e);
      const { getFallbackPlan } = await import("@/data/workout-plans");
      const goalLabels = goalsToUse.map(g => {
        const preset = BODY_GOALS.find(bg => bg.id === g);
        return preset ? preset.label : g;
      });
      const fallback = getFallbackPlan(goalLabels);
      localStorage.setItem("signal_ai_workout_plan", JSON.stringify(fallback));
      setPlanSummary(fallback.summary);
      haptic("success");
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    haptic("medium");
    saveBodyGoals(goals);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
    if (goals.length > 0) {
      await generatePlan(goals);
    }
  };

  const addCustom = () => {
    if (!customGoal.trim()) return;
    haptic("medium");
    setGoals(prev => [...prev, customGoal.trim()]);
    setCustomGoal("");
  };

  return (
    <div className="card-warm p-5 rounded-2xl space-y-4">
      <div>
        <h3 className="font-display text-base font-semibold italic text-foreground">What do you want from your body?</h3>
        <p className="font-body text-xs text-muted-foreground mt-1">Select your goals — AI will build a personalised 4-week plan for your Today tab.</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {BODY_GOALS.map(g => {
          const active = goals.includes(g.id);
          return (
            <motion.button
              key={g.id}
              onClick={() => toggleGoal(g.id)}
              animate={active ? { scale: [1, 1.03, 1] } : {}}
              transition={{ duration: 0.25 }}
              className={`touch-btn rounded-xl p-3 min-h-[48px] text-left transition-all border flex items-center gap-2 relative ${
                active
                  ? "border-primary bg-primary/15 shadow-sm"
                  : "border-border bg-card opacity-60"
              }`}
            >
              <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                active ? "bg-primary" : "bg-muted/30"
              }`}>
                <g.icon className={`h-3.5 w-3.5 ${active ? "text-primary-foreground" : "text-muted-foreground"}`} />
              </div>
              <span className={`font-body text-xs font-medium ${active ? "text-foreground" : "text-muted-foreground"}`}>{g.label}</span>
              <AnimatePresence>
                {active && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-primary flex items-center justify-center"
                  >
                    <Check className="h-2.5 w-2.5 text-primary-foreground" strokeWidth={3} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      <div className="flex gap-2">
        <input type="text" value={customGoal} onChange={e => setCustomGoal(e.target.value)} onKeyDown={e => e.key === "Enter" && addCustom()}
          placeholder="Add your own goal..." className="flex-1 rounded-xl bg-card px-4 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-1 focus:ring-primary" />
        <button onClick={addCustom} disabled={!customGoal.trim()} className="touch-btn rounded-xl px-4 py-2.5 bg-primary text-primary-foreground font-body text-sm font-bold disabled:opacity-30">Add</button>
      </div>

      {goals.filter(g => !BODY_GOALS.some(bg => bg.id === g)).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {goals.filter(g => !BODY_GOALS.some(bg => bg.id === g)).map(g => (
            <span key={g} className="rounded-full px-3 py-1 bg-primary/10 font-body text-xs text-primary font-medium flex items-center gap-1">
              {g}
              <button onClick={() => { haptic("light"); setGoals(prev => prev.filter(x => x !== g)); }} className="ml-1 text-primary/50 hover:text-primary">×</button>
            </span>
          ))}
        </div>
      )}

      <motion.button
        onClick={handleSave}
        disabled={generating || goals.length === 0}
        animate={!generating && !saved && goals.length > 0 ? { scale: [1, 1.02, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="touch-btn w-full rounded-xl py-3 min-h-[44px] bg-primary text-primary-foreground font-body text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {generating ? (<><Loader2 className="h-4 w-4 animate-spin" />Generating your plan...</>) : saved ? ("✓ Saved & plan generated!") : (<><Sparkles className="h-4 w-4" />Save goals & generate plan</>)}
      </motion.button>

      {planSummary && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-primary/5 border border-primary/10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <p className="font-display text-sm font-semibold italic text-foreground">Your AI Plan</p>
          </div>
          <p className="font-body text-xs text-muted-foreground leading-relaxed">{planSummary}</p>
          <p className="font-body text-[10px] text-primary mt-2">→ Check your Today tab for this week's workouts</p>
        </motion.div>
      )}
    </div>
  );
}

// ── 3D Body Visualisation Card ──
import BodyVisualisationCard from "@/components/BodyVisualisationCard";

// ── Main Export ──
export default function BodyVisualiser() {
  return (
    <div className="space-y-6">
      <BodyGoalsSection />
    </div>
  );
}

// Re-export types used by other components
export type MuscleGroup =
  | "chest" | "shoulders" | "biceps" | "triceps" | "forearms"
  | "upper-back" | "lats" | "lower-back"
  | "core" | "obliques"
  | "glutes" | "quads" | "hamstrings" | "calves" | "hip-flexors" | "adductors";
