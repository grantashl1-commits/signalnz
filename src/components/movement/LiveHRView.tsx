import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bluetooth, Activity, PenLine, Save, Check, Minus, Plus, GripHorizontal, BluetoothOff } from "lucide-react";
import {
  ComposedChart, Line, XAxis, YAxis, ResponsiveContainer,
  ReferenceArea, ReferenceLine, Tooltip,
  BarChart, Bar, Cell,
} from "recharts";
import { WildStar } from "@/components/BotanicalElements";
import { useGlobalHeartRate } from "@/contexts/HeartRateContext";
import { useProfile } from "@/hooks/useProfile";
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
  const profile = useProfile();
  const wakeLock = useWakeLock();
  const releaseWakeLock = wakeLock.release;

  // Derive age from profile date_of_birth
  const profileAge = useMemo(() => {
    if (profile.dateOfBirth) {
      const dob = new Date(profile.dateOfBirth);
      const today = new Date();
      let a = today.getFullYear() - dob.getFullYear();
      if (today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) a--;
      return a;
    }
    return null;
  }, [profile.dateOfBirth]);

  const profileWeight = profile.weightKg;

  // Use profile data first, then localStorage, then defaults
  const [age, setAge] = useState(profileAge || getUserAge() || 30);
  const [weight, setWeight] = useState(profileWeight || getUserWeight() || 65);
  const hasProfileData = !!(profileAge && profileWeight);
  const [ageSet, setAgeSet] = useState(hasProfileData || !!getUserAge());

  // Update when profile loads
  useEffect(() => {
    if (profileAge) { setAge(profileAge); setUserAge(profileAge); }
    if (profileWeight) { setWeight(profileWeight); setUserWeight(profileWeight); }
    if (profileAge && profileWeight) setAgeSet(true);
  }, [profileAge, profileWeight]);

  // ── Session state lives in HeartRateContext so it survives navigation ──
  const { session, elapsed, startSession, stopSession, resetSession } = hr;
  const running = session.running;
  const hrData = session.hrData;
  const [summary, setSummary] = useState<WorkoutSession | null>(null);

  // Session save state
  const [sessionNotes, setSessionNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  const maxHR = getMaxHR(age);
  const currentZone = hr.bpm > 0 ? getZoneForBPM(hr.bpm, maxHR) : HR_ZONES[0];

  const zone2PlusMins = hrData.filter((d) => getZoneForBPM(d.bpm, maxHR).zone >= 2).length * 2 / 60;
  const zone2Goal = 21;
  const zone2Reached = zone2PlusMins >= zone2Goal;

  const handleSetAge = () => {
    setUserAge(age);
    setUserWeight(weight);
    setAgeSet(true);
  };

  const handleStart = () => {
    haptic("medium");
    wakeLock.toggle();
    setSaved(false);
    setSavedId(null);
    startSession(workoutName);
  };

  const handleStop = () => {
    haptic("success");
    releaseWakeLock();
    const finalSession = stopSession();
    const finalHrData = finalSession.hrData.length > 0
      ? finalSession.hrData
      : (hr.bpm > 0 ? [{ time: elapsed, bpm: hr.bpm }] : []);
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

    // Also create a workout_log entry so it shows on calendar & My Log
    let hrSessionId: string | null = null;
    if (!error && data) {
      hrSessionId = data.id;
      await (supabase as any)
        .from("workout_logs")
        .insert({
          user_id: user.id,
          session_date: summary.date,
          workout_template_id: null,
          exercises: [],
          duration_minutes: Math.round(summary.duration / 60),
          notes: notes.trim() || null,
          completed: true,
          cycle_phase: summary.phase,
          hr_session_id: hrSessionId,
        });
    }

    setSaving(false);
    if (!error && data) {
      setSaved(true);
      setSavedId(data.id);
    }
  };

  const handleClose = () => {
    // Do NOT release wakelock or stop the global session — keep recording in
    // the background. Closing this view just hides the full chart; the floating
    // chip stays visible on the page so the user can re-open it any time.
    onClose();
  };

  const handleDoneAndReset = () => {
    releaseWakeLock();
    resetSession();
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
                  <><Save className="h-4 w-4" /> Save session</>
                )}
              </button>
            </div>
          ) : (
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 flex items-center justify-center gap-2">
              <div className="h-5 w-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Check className="h-3 w-3 text-emerald-600" />
              </div>
              <span className="font-body text-sm text-emerald-600 font-medium">Session saved</span>
            </div>
          )}

          <button
            onClick={handleDoneAndReset}
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
              <span className="font-body text-sm text-emerald-600 flex-1">Connected · {hr.deviceName} ✓</span>
              <button
                onClick={() => { haptic("light"); hr.disconnect(); }}
                className="touch-btn flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-muted-foreground hover:text-foreground"
                aria-label="Disconnect heart rate monitor"
              >
                <BluetoothOff className="h-3.5 w-3.5" />
                <span className="font-body text-xs">Disconnect</span>
              </button>
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

  // ── Live workout view: draggable floating panel ───────────────────────────────
  // Solid background so underlying page stays readable; the panel can be moved
  // anywhere on screen (e.g. tucked to the bottom while reading exercise notes).
  return (
    <DraggableHRPanel
      workoutName={workoutName}
      bpm={hr.bpm}
      currentZone={currentZone}
      elapsed={elapsed}
      formatTime={formatTime}
      hrData={hrData}
      maxHR={maxHR}
      zone2PlusMins={zone2PlusMins}
      zone2Goal={zone2Goal}
      zone2Reached={zone2Reached}
      onClose={handleClose}
      onStop={handleStop}
      onDisconnect={() => { haptic("light"); hr.disconnect(); }}
      connected={hr.connected}
      deviceName={hr.deviceName}
    />
  );
}

// ─── Draggable floating HR panel ────────────────────────────────────────────────

interface DraggableHRPanelProps {
  workoutName: string;
  bpm: number;
  currentZone: typeof HR_ZONES[0];
  elapsed: number;
  formatTime: (s: number) => string;
  hrData: { time: number; bpm: number }[];
  maxHR: number;
  zone2PlusMins: number;
  zone2Goal: number;
  zone2Reached: boolean;
  onClose: () => void;
  onStop: () => void;
  onDisconnect: () => void;
  connected: boolean;
  deviceName: string | null;
}

function DraggableHRPanel({
  workoutName, bpm, currentZone, elapsed, formatTime, hrData, maxHR,
  zone2PlusMins, zone2Goal, zone2Reached, onClose, onStop, onDisconnect,
  connected, deviceName,
}: DraggableHRPanelProps) {
  const PANEL_W = 320;
  const [collapsed, setCollapsed] = useState(false);
  const [pos, setPos] = useState(() => {
    // Default near top-right, below the page header
    if (typeof window === "undefined") return { x: 20, y: 80 };
    const stored = localStorage.getItem("signal_hr_panel_pos");
    if (stored) {
      try {
        const p = JSON.parse(stored);
        if (typeof p.x === "number" && typeof p.y === "number") return p;
      } catch {}
    }
    return { x: Math.max(8, window.innerWidth - PANEL_W - 16), y: 80 };
  });
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);

  // Persist position
  useEffect(() => {
    localStorage.setItem("signal_hr_panel_pos", JSON.stringify(pos));
  }, [pos]);

  // Clamp on viewport resize
  useEffect(() => {
    const onResize = () => {
      setPos((p) => ({
        x: Math.min(Math.max(8, p.x), window.innerWidth - PANEL_W - 8),
        y: Math.min(Math.max(8, p.y), window.innerHeight - 80),
      }));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y };
  }, [pos.x, pos.y]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    const panelH = collapsed ? 64 : 360;
    setPos({
      x: Math.min(Math.max(8, dragRef.current.origX + dx), window.innerWidth - PANEL_W - 8),
      y: Math.min(Math.max(8, dragRef.current.origY + dy), window.innerHeight - panelH),
    });
  }, [collapsed]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
    dragRef.current = null;
  }, []);

  const z2Pct = Math.min((zone2PlusMins / zone2Goal) * 100, 100);

  return (
    <div
      className="fixed z-[80] rounded-2xl bg-card border border-border shadow-2xl select-none"
      style={{
        left: pos.x,
        top: pos.y,
        width: PANEL_W,
        // Solid background — never see-through. Subtle zone-tint accent on header.
        boxShadow: `0 18px 40px -12px ${currentZone.color}55, 0 8px 20px -8px hsl(var(--foreground) / 0.15)`,
      }}
    >
      {/* Drag handle / header */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="flex items-center gap-2 px-3 py-2 rounded-t-2xl cursor-grab active:cursor-grabbing touch-none"
        style={{ backgroundColor: currentZone.color + "22" }}
      >
        <GripHorizontal className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <motion.div
            className="h-2 w-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: currentZone.color }}
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <span className="font-body text-xs font-bold text-foreground truncate">
            {bpm || "—"} bpm · Z{currentZone.zone}
          </span>
          <span className="font-body text-[10px] text-muted-foreground truncate">
            {formatTime(elapsed)}
          </span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); haptic("light"); setCollapsed((c) => !c); }}
          onPointerDown={(e) => e.stopPropagation()}
          className="touch-btn p-1.5 rounded-full hover:bg-secondary"
          aria-label={collapsed ? "Expand panel" : "Collapse panel"}
        >
          {collapsed ? <Plus className="h-3.5 w-3.5 text-muted-foreground" /> : <Minus className="h-3.5 w-3.5 text-muted-foreground" />}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); haptic("light"); onClose(); }}
          onPointerDown={(e) => e.stopPropagation()}
          className="touch-btn p-1.5 rounded-full hover:bg-secondary"
          aria-label="Hide panel"
        >
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      {!collapsed && (
        <div className="p-4 space-y-3">
          <p className="font-body text-[10px] text-muted-foreground uppercase tracking-widest truncate">
            {workoutName}
          </p>

          {/* BPM hero (compact) */}
          <div
            className="rounded-xl p-3 text-center transition-colors"
            style={{ backgroundColor: currentZone.color + "12" }}
          >
            <motion.p
              className="font-body text-5xl leading-none font-bold"
              style={{ color: currentZone.color }}
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
            >
              {bpm || "—"}
            </motion.p>
            <p className="font-body text-[10px] uppercase tracking-widest mt-1" style={{ color: currentZone.color }}>
              Zone {currentZone.zone} · {currentZone.label}
            </p>
          </div>

          {/* Zone 2+ progress + elapsed */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-secondary/60 p-2">
              <p className="font-body text-[9px] text-muted-foreground uppercase tracking-wider">Z2+ progress</p>
              <p className="font-body text-sm font-bold text-foreground mt-0.5">
                {Math.round(zone2PlusMins)}<span className="text-muted-foreground">/{zone2Goal}m</span>
              </p>
              <div className="mt-1 h-1.5 rounded-full bg-border overflow-hidden">
                <div
                  className="h-full transition-all duration-700"
                  style={{ width: `${z2Pct}%`, backgroundColor: currentZone.color }}
                />
              </div>
            </div>
            <div className="rounded-lg bg-secondary/60 p-2">
              <p className="font-body text-[9px] text-muted-foreground uppercase tracking-wider">Elapsed</p>
              <p className="font-body text-sm font-bold text-foreground mt-0.5">{formatTime(elapsed)}</p>
              {zone2Reached && (
                <p className="font-body text-[9px] mt-0.5" style={{ color: currentZone.color }}>
                  ✓ Z2+ goal reached
                </p>
              )}
            </div>
          </div>

          {/* Compact line chart */}
          {hrData.length >= 4 && (
            <HRLineChart data={hrData} maxHR={maxHR} currentSecs={elapsed} height={90} />
          )}

          {/* Connection + actions */}
          {connected && (
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-600">
              <Bluetooth className="h-3 w-3" />
              <span className="font-body truncate flex-1">{deviceName}</span>
              <button
                onClick={onDisconnect}
                className="touch-btn rounded-full bg-secondary px-2 py-1 text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                aria-label="Disconnect monitor"
              >
                <BluetoothOff className="h-3 w-3" />
                <span className="font-body text-[10px]">Disconnect</span>
              </button>
            </div>
          )}

          <button
            onClick={onStop}
            className="touch-btn w-full rounded-[12px] py-2.5 min-h-[44px] font-body text-sm font-bold text-primary-foreground bg-primary"
          >
            End session →
          </button>
        </div>
      )}
    </div>
  );
}
