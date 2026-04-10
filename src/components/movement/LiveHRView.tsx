import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bluetooth, Activity, PenLine, Save, Check } from "lucide-react";
import {
  ComposedChart, Line, XAxis, YAxis, ResponsiveContainer,
  ReferenceArea, ReferenceLine, Tooltip,
  BarChart, Bar, Cell,
} from "recharts";
import { WildStar } from "@/components/BotanicalElements";
import { useGlobalHeartRate } from "@/contexts/HeartRateContext";
import { useWakeLock } from "@/hooks/useWakeLock";
import {
  getUserAge, setUserAge, getUserWeight, setUserWeight, getMaxHR, getZoneForBPM, HR_ZONES,
  saveWorkoutSession, estimateCalories, type WorkoutSession,
} from "@/data/workouts";
import { useCycle } from "@/contexts/CycleContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { haptic } from "@/hooks/use-mobile";

interface LiveHRViewProps {
  workoutName?: string;
  onClose: () => void;
}

// ─── HR Line Chart ─────────────────────────────────────────────────────────────

interface HRLineChartProps {
  data: { time: number; bpm: number }[];
  maxHR: number;
  /** If provided, draws a vertical "now" line at this second */
  currentSecs?: number;
  height?: number;
}

function HRLineChart({ data, maxHR, currentSecs, height = 160 }: HRLineChartProps) {
  // Downsample: 1 point every 10 seconds (every 5th sample at 2s interval)
  const sampled = data.filter((_, i) => i % 5 === 0 || i === data.length - 1);
  const chartData = sampled.map((d) => ({
    mins: parseFloat((d.time / 60).toFixed(2)),
    bpm: d.bpm,
  }));

  // Zone boundaries in BPM
  const z1 = Math.round(maxHR * 0.50);
  const z2 = Math.round(maxHR * 0.60);
  const z3 = Math.round(maxHR * 0.70);
  const z4 = Math.round(maxHR * 0.80);
  const z5 = Math.round(maxHR * 0.90);
  const yMax = maxHR + 15;

  const currentMins = currentSecs != null
    ? parseFloat((currentSecs / 60).toFixed(2))
    : undefined;

  if (chartData.length < 2) {
    return (
      <div
        className="rounded-2xl bg-card border border-border flex items-center justify-center"
        style={{ height }}
      >
        <p className="font-body text-xs text-muted-foreground">Collecting data…</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-card border border-border p-3 overflow-hidden" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 4, right: 6, bottom: 0, left: 0 }}>
          {/* Zone background bands */}
          <ReferenceArea y1={40}  y2={z1}   fill={HR_ZONES[0].color} fillOpacity={0.12} ifOverflow="extendDomain" />
          <ReferenceArea y1={z1}  y2={z2}   fill={HR_ZONES[1].color} fillOpacity={0.15} ifOverflow="extendDomain" />
          <ReferenceArea y1={z2}  y2={z3}   fill={HR_ZONES[2].color} fillOpacity={0.15} ifOverflow="extendDomain" />
          <ReferenceArea y1={z3}  y2={z4}   fill={HR_ZONES[3].color} fillOpacity={0.15} ifOverflow="extendDomain" />
          <ReferenceArea y1={z4}  y2={yMax} fill={HR_ZONES[4].color} fillOpacity={0.15} ifOverflow="extendDomain" />

          {/* Zone boundary lines */}
          {[
            { y: z2, z: 1 }, { y: z3, z: 2 }, { y: z4, z: 3 }, { y: z5, z: 4 },
          ].map(({ y, z }) => (
            <ReferenceLine
              key={y}
              y={y}
              stroke={HR_ZONES[z].color}
              strokeDasharray="4 3"
              strokeOpacity={0.6}
              strokeWidth={1}
              label={{
                value: `Z${z + 1}`,
                position: "insideTopRight",
                fontSize: 8,
                fill: HR_ZONES[z].color,
                opacity: 0.8,
              }}
            />
          ))}

          {/* "Now" vertical line during live session */}
          {currentMins != null && (
            <ReferenceLine
              x={currentMins}
              stroke="hsl(var(--foreground))"
              strokeWidth={1.5}
              strokeOpacity={0.5}
              strokeDasharray="2 2"
            />
          )}

          <XAxis
            dataKey="mins"
            type="number"
            domain={["dataMin", "dataMax"]}
            tickFormatter={(v) => `${Math.floor(v)}m`}
            tick={{ fontSize: 9, fontFamily: "Montserrat", fill: "hsl(var(--muted-foreground))" }}
            stroke="hsl(var(--border))"
            tickCount={5}
            allowDecimals
          />
          <YAxis
            domain={[Math.max(40, (Math.min(...chartData.map((d) => d.bpm)) - 10)), yMax]}
            tick={{ fontSize: 9, fontFamily: "Montserrat", fill: "hsl(var(--muted-foreground))" }}
            stroke="hsl(var(--border))"
            width={28}
            tickCount={5}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: 11,
              fontFamily: "Montserrat",
            }}
            formatter={(v: number) => [`${v} bpm`, ""]}
            labelFormatter={(l: number) => `${l.toFixed(1)} min`}
          />

          {/* BPM trace */}
          <Line
            type="monotone"
            dataKey="bpm"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={false}
            animationDuration={300}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Zone pill badge ────────────────────────────────────────────────────────────

function ZonePill({ zone }: { zone: typeof HR_ZONES[0] }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={zone.zone}
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="inline-flex items-center gap-2 rounded-full px-5 py-2 mt-3"
        style={{ backgroundColor: zone.color }}
      >
        <span className="font-body text-sm font-bold text-white">
          Zone {zone.zone} · {zone.label}
        </span>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function LiveHRView({ workoutName = "Workout", onClose }: LiveHRViewProps) {
  const hr = useGlobalHeartRate();
  const { currentPhase: cyclePhase, currentCycleDay } = useCycle();
  const { user } = useAuth();
  const wakeLock = useWakeLock();
  const releaseWakeLock = wakeLock.release;

  const [age, setAge] = useState(getUserAge() || 30);
  const [weight, setWeight] = useState(getUserWeight() || 65);
  const [ageSet, setAgeSet] = useState(!!getUserAge());
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [hrData, setHrData] = useState<{ time: number; bpm: number }[]>([]);
  const [summary, setSummary] = useState<WorkoutSession | null>(null);

  // Session save state
  const [sessionNotes, setSessionNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  const intervalRef = useRef<number | null>(null);
  const sampleIntervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const elapsedRef = useRef<number>(0);
  const bpmRef = useRef<number>(0);

  const maxHR = getMaxHR(age);
  const currentZone = hr.bpm > 0 ? getZoneForBPM(hr.bpm, maxHR) : HR_ZONES[0];

  const zone2PlusMins = hrData.filter((d) => getZoneForBPM(d.bpm, maxHR).zone >= 2).length * 2 / 60;
  const zone2Goal = 21;
  const zone2Reached = zone2PlusMins >= zone2Goal;

  useEffect(() => { elapsedRef.current = elapsed; }, [elapsed]);
  useEffect(() => { bpmRef.current = hr.bpm; }, [hr.bpm]);

  // Timer
  useEffect(() => {
    if (running) {
      startTimeRef.current = Date.now() - elapsedRef.current * 1000;
      intervalRef.current = window.setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    }
    return () => {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    };
  }, [running]);

  // HR sampling every 2 seconds
  useEffect(() => {
    if (!running) {
      if (sampleIntervalRef.current) { clearInterval(sampleIntervalRef.current); sampleIntervalRef.current = null; }
      return;
    }
    const addSample = () => {
      const bpm = bpmRef.current;
      if (bpm <= 0) return;
      const secsFromStart = startTimeRef.current > 0
        ? Math.floor((Date.now() - startTimeRef.current) / 1000)
        : elapsedRef.current;
      setHrData((prev) => [...prev, { time: secsFromStart, bpm }]);
    };
    addSample();
    sampleIntervalRef.current = window.setInterval(addSample, 2000);
    return () => {
      if (sampleIntervalRef.current) { clearInterval(sampleIntervalRef.current); sampleIntervalRef.current = null; }
    };
  }, [running]);

  const handleSetAge = () => {
    setUserAge(age);
    setUserWeight(weight);
    setAgeSet(true);
  };

  const handleStart = () => {
    haptic("medium");
    wakeLock.toggle();
    setElapsed(0);
    elapsedRef.current = 0;
    setHrData([]);
    setSaved(false);
    setSavedId(null);
    setRunning(true);
  };

  const handleStop = () => {
    haptic("success");
    setRunning(false);
    releaseWakeLock();
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    if (sampleIntervalRef.current) { clearInterval(sampleIntervalRef.current); sampleIntervalRef.current = null; }

    const finalHrData = hrData.length > 0 ? hrData : (hr.bpm > 0 ? [{ time: elapsed, bpm: hr.bpm }] : []);
    const derivedDurationSecs = elapsed > 0 ? elapsed
      : finalHrData.length > 1 ? finalHrData[finalHrData.length - 1].time
      : finalHrData.length === 1 ? 2 : 0;

    const zoneMins = [0, 0, 0, 0, 0];
    finalHrData.forEach((d) => {
      const z = getZoneForBPM(d.bpm, maxHR);
      zoneMins[z.zone - 1] += 2 / 60;
    });
    const avgHR = finalHrData.length > 0
      ? Math.round(finalHrData.reduce((s, d) => s + d.bpm, 0) / finalHrData.length) : 0;
    const peakHR = finalHrData.length > 0 ? Math.max(...finalHrData.map((d) => d.bpm)) : 0;
    const totalMins = zoneMins.reduce((s, m) => s + m, 0);
    const z2Plus = totalMins > 0
      ? Math.round(((zoneMins[1] + zoneMins[2] + zoneMins[3] + zoneMins[4]) / totalMins) * 100) : 0;
    const cals = estimateCalories(avgHR, derivedDurationSecs / 60, weight, age);

    const session: WorkoutSession = {
      id: `session-${Date.now()}`,
      workoutName,
      duration: derivedDurationSecs,
      avgHR,
      maxHR: peakHR,
      zoneMins: zoneMins.map((m) => Math.round(m * 10) / 10),
      zone2PlusPercent: z2Plus,
      phase: cyclePhase,
      cycleDay: currentCycleDay,
      date: new Date().toISOString().split("T")[0],
      hrData: finalHrData,
      caloriesBurnt: cals,
    };

    saveWorkoutSession(session); // keep localStorage backup
    setSummary(session);
  };

  const handleSaveToSupabase = async (notes: string) => {
    if (!user || !summary || saving) return;
    setSaving(true);

    // Downsample bpm_trace to every 10 seconds for storage
    const bpmTrace = summary.hrData
      .filter((_, i) => i % 5 === 0 || i === summary.hrData.length - 1)
      .map((d) => ({
        minute: parseFloat((d.time / 60).toFixed(2)),
        bpm: d.bpm,
        zone: getZoneForBPM(d.bpm, maxHR).zone,
      }));

    const zonesSummary = HR_ZONES.reduce((acc, z, i) => ({
      ...acc,
      [`z${z.zone}_mins`]: Math.round(summary.zoneMins[i] * 10) / 10,
    }), {} as Record<string, number>);

    const { data, error } = await (supabase as any)
      .from("hr_sessions")
      .insert({
        user_id: user.id,
        workout_name: workoutName,
        duration_minutes: parseFloat((summary.duration / 60).toFixed(1)),
        bpm_trace: bpmTrace,
        avg_bpm: summary.avgHR,
        max_bpm: summary.maxHR,
        calories: summary.caloriesBurnt,
        zones_summary: zonesSummary,
        zone2_plus_percent: summary.zone2PlusPercent,
        cycle_phase: summary.phase,
        cycle_day: summary.cycleDay,
        notes: notes.trim() || null,
      })
      .select("id")
      .single();

    setSaving(false);
    if (!error && data) {
      setSaved(true);
      setSavedId(data.id);
    }
  };

  const handleClose = () => {
    releaseWakeLock();
    onClose();
  };

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h > 0 ? h.toString().padStart(2, "0") + ":" : ""}${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const buildZoneChartData = (data: { time: number; bpm: number }[]) => {
    const zoneTotals = [0, 0, 0, 0, 0];
    data.forEach((d) => { zoneTotals[getZoneForBPM(d.bpm, maxHR).zone - 1] += 2 / 60; });
    return HR_ZONES.map((z, i) => {
      const rawMins = zoneTotals[i];
      return {
        name: `Z${z.zone}`, minutes: rawMins > 0 ? Math.max(rawMins, 0.1) : 0,
        labelMinutes: Math.round(rawMins * 10) / 10,
        color: z.color, label: z.label,
      };
    });
  };

  // ── Summary view ──────────────────────────────────────────────────────────────
  if (summary) {
    const zoneChart = buildZoneChartData(summary.hrData);

    return (
      <div className="fixed inset-0 z-[80] bg-background overflow-y-auto">
        <div className="max-w-lg mx-auto px-5 py-8 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl italic font-bold text-foreground">Session complete.</h2>
            <button onClick={handleClose} className="touch-btn p-2 rounded-full bg-secondary">
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { val: summary.avgHR, label: "Avg HR" },
              { val: summary.maxHR, label: "Max HR" },
              { val: summary.caloriesBurnt || 0, label: "Calories" },
              { val: formatTime(summary.duration), label: "Duration" },
            ].map(({ val, label }) => (
              <div key={label} className="rounded-xl bg-card border border-border p-3 text-center">
                <p className="font-body text-lg text-foreground">{val}</p>
                <p className="font-body text-[10px] text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* HR trace line chart */}
          {summary.hrData.length >= 2 && (
            <div className="space-y-1.5">
              <p className="font-body text-[10px] text-muted-foreground uppercase tracking-[0.15em]">
                Heart rate trace
              </p>
              <HRLineChart data={summary.hrData} maxHR={maxHR} height={180} />
            </div>
          )}

          {/* Zone breakdown colour bar */}
          <div className="rounded-xl overflow-hidden h-10 flex">
            {summary.zoneMins.map((mins, i) => {
              const totalMins = summary.zoneMins.reduce((s, m) => s + m, 0);
              const pct = totalMins > 0 ? (mins / totalMins) * 100 : 0;
              if (pct < 1) return null;
              return (
                <div
                  key={i}
                  className="flex items-center justify-center transition-all"
                  style={{ width: `${pct}%`, backgroundColor: HR_ZONES[i].color }}
                >
                  {pct > 10 && (
                    <span className="font-body text-[10px] font-bold text-white">
                      {Math.round(mins)}m
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Z2+ headline */}
          <div className="text-center">
            <p className="font-body text-4xl text-foreground">{summary.zone2PlusPercent}%</p>
            <p className="font-body text-xs text-muted-foreground mt-1">time above Zone 2</p>
          </div>

          {/* Zone bar chart (secondary) */}
          <div className="space-y-1.5">
            <p className="font-body text-[10px] text-muted-foreground uppercase tracking-[0.15em]">
              Zone breakdown
            </p>
            <div className="h-32 rounded-2xl bg-card border border-border p-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={zoneChart} margin={{ top: 4, right: 5, bottom: 4, left: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fontFamily: "Montserrat" }} stroke="hsl(var(--border))" />
                  <YAxis tick={{ fontSize: 9, fontFamily: "Montserrat" }} stroke="hsl(var(--border))" width={28} unit="m" />
                  <Bar dataKey="minutes" radius={[5, 5, 0, 0]}>
                    {zoneChart.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} stroke="hsl(var(--foreground) / 0.12)"
                        strokeWidth={entry.name === "Z2" ? 1.5 : 0.5} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Zone legend */}
            <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center pt-1">
              {zoneChart.map((z) => (
                <div key={z.name} className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: z.color }} />
                  <span className="font-body text-[10px] text-muted-foreground">{z.name} {z.label}</span>
                  <span className="font-body text-[10px] text-foreground">{z.labelMinutes}m</span>
                </div>
              ))}
            </div>
          </div>

          {zone2Reached && (
            <div className="flex items-center justify-center gap-2">
              <WildStar size={16} />
              <p className="font-body text-sm font-semibold text-primary">Zone 2+ goal reached</p>
            </div>
          )}

          {/* Save to Supabase */}
          {!saved ? (
            <div className="rounded-xl bg-card border border-border p-4 space-y-3">
              <p className="font-body text-sm font-medium text-foreground">Save this session</p>

              {showNotes ? (
                <textarea
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="How did it feel? Any notes..."
                  rows={2}
                  className="w-full rounded-xl bg-background border border-border px-3 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              ) : (
                <button
                  onClick={() => setShowNotes(true)}
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <PenLine className="h-3.5 w-3.5" />
                  <span className="font-body text-xs">Add a note (optional)</span>
                </button>
              )}

              <button
                onClick={() => handleSaveToSupabase(sessionNotes)}
                disabled={saving}
                className="w-full h-11 rounded-full bg-primary text-primary-foreground font-display text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-60 transition-colors"
              >
                {saving ? (
                  <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <><Save className="h-4 w-4" /> Save to Signal</>
                )}
              </button>
            </div>
          ) : (
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 flex items-center justify-center gap-2">
              <div className="h-5 w-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Check className="h-3 w-3 text-emerald-600" />
              </div>
              <span className="font-body text-sm text-emerald-600 font-medium">Session saved to Signal</span>
            </div>
          )}

          <button
            onClick={handleClose}
            className="touch-btn w-full rounded-[14px] py-3 min-h-[52px] font-body text-sm font-bold text-primary-foreground bg-primary"
          >
            Done →
          </button>
        </div>
      </div>
    );
  }

  // ── Connect + age setup view ───────────────────────────────────────────────────
  if (!hr.connected || !ageSet) {
    return (
      <div className="fixed inset-0 z-[80] bg-background overflow-y-auto">
        <div className="max-w-lg mx-auto px-5 py-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl italic font-bold text-foreground">Heart rate monitor.</h2>
            <button onClick={handleClose} className="touch-btn p-2 rounded-full bg-secondary">
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          <div className="rounded-xl p-5 border border-border bg-card/60">
            <p className="font-body text-sm italic text-muted-foreground">
              Connect a Bluetooth chest strap to track your zones in real time.
            </p>
            <p className="font-body text-xs text-muted-foreground mt-2">
              Works with Polar H10, H9, Garmin chest strap, Wahoo TICKR via Bluetooth.
            </p>
          </div>

          {!hr.connected ? (
            <button
              onClick={hr.connect}
              disabled={hr.connecting || !hr.isSupported}
              className="touch-btn w-full rounded-[14px] py-3 min-h-[52px] font-body text-sm font-bold text-primary-foreground bg-primary flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Bluetooth className="h-4 w-4" />
              {hr.connecting ? "Connecting..." : "Connect monitor →"}
            </button>
          ) : (
            <div className="rounded-xl p-4 border border-border bg-card/60 flex items-center gap-3">
              <Bluetooth className="h-4 w-4 text-emerald-500" />
              <span className="font-body text-sm text-emerald-600">Connected · {hr.deviceName} ✓</span>
            </div>
          )}

          {!hr.isSupported && (
            <p className="font-body text-xs italic text-muted-foreground">
              Web Bluetooth is not supported in this browser. Try Chrome on Android or desktop.
            </p>
          )}

          {hr.error && <p className="font-body text-xs text-destructive">{hr.error}</p>}

          {hr.connected && !ageSet && (
            <div className="rounded-xl p-5 border border-border bg-card/60 space-y-4">
              <p className="font-body text-sm text-foreground">Your details help us calculate zones & calories.</p>
              <div>
                <p className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-2">Age</p>
                <div className="flex items-center gap-4 justify-center">
                  <button onClick={() => setAge((a) => Math.max(16, a - 1))} className="touch-btn h-10 w-10 rounded-full bg-secondary font-body text-lg">−</button>
                  <span className="font-body text-3xl text-foreground w-12 text-center">{age}</span>
                  <button onClick={() => setAge((a) => Math.min(80, a + 1))} className="touch-btn h-10 w-10 rounded-full bg-secondary font-body text-lg">+</button>
                </div>
                <p className="font-body text-[10px] text-muted-foreground text-center mt-1">Max HR: {maxHR} bpm</p>
              </div>
              <div>
                <p className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-2">Weight (kg)</p>
                <div className="flex items-center gap-4 justify-center">
                  <button onClick={() => setWeight((w) => Math.max(30, w - 1))} className="touch-btn h-10 w-10 rounded-full bg-secondary font-body text-lg">−</button>
                  <span className="font-body text-3xl text-foreground w-12 text-center">{weight}</span>
                  <button onClick={() => setWeight((w) => Math.min(200, w + 1))} className="touch-btn h-10 w-10 rounded-full bg-secondary font-body text-lg">+</button>
                </div>
                <p className="font-body text-[10px] text-muted-foreground text-center mt-1">Used for calorie calculation</p>
              </div>
              <button onClick={handleSetAge} className="touch-btn w-full rounded-[14px] py-3 min-h-[48px] font-body text-sm font-bold text-primary-foreground bg-primary">
                Save & continue →
              </button>
            </div>
          )}

          {hr.connected && ageSet && (
            <>
              <div className="space-y-1.5">
                {HR_ZONES.map((z) => (
                  <div key={z.zone} className="flex items-center gap-2 rounded-full px-3 py-1.5" style={{ backgroundColor: z.color + "22" }}>
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: z.color }} />
                    <span className="font-body text-xs text-foreground flex-1">Zone {z.zone} · {z.minPct}–{z.maxPct}%</span>
                    <span className="font-body text-xs text-muted-foreground">{z.label}</span>
                  </div>
                ))}
              </div>
              <button onClick={handleStart} className="touch-btn w-full rounded-[14px] py-4 min-h-[56px] font-body text-base font-bold text-primary-foreground bg-primary flex items-center justify-center gap-2">
                <Activity className="h-5 w-5" /> Start session →
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── Live workout view ─────────────────────────────────────────────────────────

  const ringSize = 120;
  const strokeW = 10;
  const radius = (ringSize - strokeW) / 2;
  const circumference = 2 * Math.PI * radius;
  const z2Progress = Math.min(zone2PlusMins / zone2Goal, 1);
  const strokeDash = circumference * z2Progress;

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto transition-colors duration-700" style={{ backgroundColor: currentZone.color + "08" }}>
      <div className="max-w-lg mx-auto px-5 py-6 space-y-5">
        <div className="flex items-center justify-between">
          <p className="font-body text-sm text-muted-foreground">{workoutName}</p>
          {!running && (
            <button onClick={handleClose} className="touch-btn p-2 rounded-full bg-secondary">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Live BPM hero */}
        <div
          className="rounded-3xl p-6 text-center transition-colors duration-700"
          style={{ backgroundColor: currentZone.color + "18" }}
        >
          <motion.p
            className="font-body text-[5rem] leading-none font-bold"
            style={{ color: currentZone.color }}
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
          >
            {hr.bpm || "—"}
          </motion.p>
          <p className="font-body text-xs uppercase tracking-widest mt-1" style={{ color: currentZone.color }}>bpm</p>
          <ZonePill zone={currentZone} />
        </div>

        {/* Zone 2+ ring + timer */}
        <div className="flex items-center justify-center gap-8">
          <div className="relative flex-shrink-0" style={{ width: ringSize, height: ringSize }}>
            <svg width={ringSize} height={ringSize} className="-rotate-90">
              <circle cx={ringSize / 2} cy={ringSize / 2} r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth={strokeW} />
              <circle cx={ringSize / 2} cy={ringSize / 2} r={radius} fill="none" stroke={currentZone.color} strokeWidth={strokeW}
                strokeDasharray={circumference} strokeDashoffset={circumference - strokeDash} strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-body text-sm font-bold text-foreground">
                {Math.round(zone2PlusMins)}<span className="text-muted-foreground">/{zone2Goal}</span>
              </span>
              <span className="font-body text-[9px] text-muted-foreground">min Z2+</span>
            </div>
          </div>
          <div className="text-center">
            <p className="font-body text-3xl text-foreground">{formatTime(elapsed)}</p>
            <p className="font-body text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">elapsed</p>
          </div>
        </div>

        {zone2Reached && (
          <div className="flex items-center justify-center gap-2">
            <WildStar size={16} />
            <p className="font-body text-sm font-semibold" style={{ color: currentZone.color }}>Zone 2+ goal reached</p>
          </div>
        )}

        {/* Real-time HR line chart (replaces bar chart) */}
        {hrData.length >= 4 && (
          <div className="space-y-1.5">
            <p className="font-body text-[10px] text-muted-foreground uppercase tracking-[0.15em]">Heart rate</p>
            <HRLineChart
              data={hrData}
              maxHR={maxHR}
              currentSecs={elapsed}
              height={160}
            />
          </div>
        )}

        {/* Controls */}
        {!running ? (
          <button onClick={handleStart} className="touch-btn w-full rounded-[14px] py-4 min-h-[56px] font-body text-base font-bold text-primary-foreground bg-primary">
            Start session →
          </button>
        ) : (
          <button onClick={handleStop} className="touch-btn w-full rounded-[14px] py-4 min-h-[56px] font-body text-base font-bold text-primary-foreground bg-primary">
            End session →
          </button>
        )}
      </div>
    </div>
  );
}
