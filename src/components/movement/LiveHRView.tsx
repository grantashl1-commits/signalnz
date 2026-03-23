import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { X, Bluetooth, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";
import { WildStar } from "@/components/BotanicalElements";
import { useGlobalHeartRate } from "@/contexts/HeartRateContext";
import { useWakeLock } from "@/hooks/useWakeLock";
import {
  getUserAge, setUserAge, getUserWeight, setUserWeight, getMaxHR, getZoneForBPM, HR_ZONES,
  saveWorkoutSession, estimateCalories, type WorkoutSession,
} from "@/data/workouts";
import { useCycle } from "@/contexts/CycleContext";
import { haptic } from "@/hooks/use-mobile";

interface LiveHRViewProps {
  workoutName?: string;
  onClose: () => void;
}

export default function LiveHRView({ workoutName = "Workout", onClose }: LiveHRViewProps) {
  const hr = useGlobalHeartRate();
  const { currentPhase: cyclePhase, currentCycleDay } = useCycle();
  const wakeLock = useWakeLock();
  const releaseWakeLock = wakeLock.release;
  const [age, setAge] = useState(getUserAge() || 30);
  const [weight, setWeight] = useState(getUserWeight() || 65);
  const [ageSet, setAgeSet] = useState(!!getUserAge());
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [hrData, setHrData] = useState<{ time: number; bpm: number }[]>([]);
  const [summary, setSummary] = useState<WorkoutSession | null>(null);
  const intervalRef = useRef<number | null>(null);
  const sampleIntervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const elapsedRef = useRef<number>(0);
  const bpmRef = useRef<number>(0);

  const maxHR = getMaxHR(age);
  const currentZone = hr.bpm > 0 ? getZoneForBPM(hr.bpm, maxHR) : HR_ZONES[0];

  // Zone 2+ minutes
  const zone2PlusMins = hrData.filter(d => {
    const z = getZoneForBPM(d.bpm, maxHR);
    return z.zone >= 2;
  }).length * 2 / 60;

  const zone2Goal = 21;
  const zone2Reached = zone2PlusMins >= zone2Goal;

  useEffect(() => {
    elapsedRef.current = elapsed;
  }, [elapsed]);

  useEffect(() => {
    bpmRef.current = hr.bpm;
  }, [hr.bpm]);

  useEffect(() => {
    if (running) {
      startTimeRef.current = Date.now() - elapsedRef.current * 1000;
      intervalRef.current = window.setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [running]);

  // Record HR data every 2 seconds while running
  useEffect(() => {
    if (!running) {
      if (sampleIntervalRef.current) {
        clearInterval(sampleIntervalRef.current);
        sampleIntervalRef.current = null;
      }
      return;
    }

    const addSample = () => {
      const bpm = bpmRef.current;
      if (bpm <= 0) return;

      const secsFromStart = startTimeRef.current > 0
        ? Math.floor((Date.now() - startTimeRef.current) / 1000)
        : elapsedRef.current;

      setHrData(prev => [...prev, { time: secsFromStart, bpm }]);
    };

    // capture immediately, then continue on interval
    addSample();
    sampleIntervalRef.current = window.setInterval(addSample, 2000);

    return () => {
      if (sampleIntervalRef.current) {
        clearInterval(sampleIntervalRef.current);
        sampleIntervalRef.current = null;
      }
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
    setRunning(true);
  };

  const handleStop = () => {
    haptic("success");
    setRunning(false);
    releaseWakeLock();

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (sampleIntervalRef.current) {
      clearInterval(sampleIntervalRef.current);
      sampleIntervalRef.current = null;
    }

    const finalHrData = hrData.length > 0 ? hrData : (hr.bpm > 0 ? [{ time: elapsed, bpm: hr.bpm }] : []);
    const derivedDurationSecs = elapsed > 0
      ? elapsed
      : finalHrData.length > 1
        ? finalHrData[finalHrData.length - 1].time
        : finalHrData.length === 1
          ? 2
          : 0;
    const info = { phase: cyclePhase, cycleDay: currentCycleDay };
    const zoneMins = [0, 0, 0, 0, 0];
    finalHrData.forEach(d => {
      const z = getZoneForBPM(d.bpm, maxHR);
      zoneMins[z.zone - 1] += 2 / 60;
    });
    const avgHR = finalHrData.length > 0 ? Math.round(finalHrData.reduce((s, d) => s + d.bpm, 0) / finalHrData.length) : 0;
    const peakHR = finalHrData.length > 0 ? Math.max(...finalHrData.map(d => d.bpm)) : 0;
    const totalMins = zoneMins.reduce((s, m) => s + m, 0);
    const z2Plus = totalMins > 0 ? Math.round(((zoneMins[1] + zoneMins[2] + zoneMins[3] + zoneMins[4]) / totalMins) * 100) : 0;
    const cals = estimateCalories(avgHR, derivedDurationSecs / 60, weight, age);

    const session: WorkoutSession = {
      id: `session-${Date.now()}`,
      workoutName,
      duration: derivedDurationSecs,
      avgHR,
      maxHR: peakHR,
      zoneMins: zoneMins.map(m => Math.round(m * 10) / 10),
      zone2PlusPercent: z2Plus,
      phase: info.phase,
      cycleDay: info.cycleDay,
      date: new Date().toISOString().split("T")[0],
      hrData: finalHrData,
      caloriesBurnt: cals,
    };

    saveWorkoutSession(session);
    setSummary(session);
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

  // Build zone time-distribution data for bar chart
  const buildZoneChartData = (data: { time: number; bpm: number }[]) => {
    const zoneTotals = [0, 0, 0, 0, 0];
    data.forEach(d => {
      const z = getZoneForBPM(d.bpm, maxHR);
      zoneTotals[z.zone - 1] += 2 / 60; // each point = 2 sec
    });
    return HR_ZONES.map((z, i) => {
      const rawMins = zoneTotals[i];
      const chartMins = rawMins > 0 ? Math.max(rawMins, 0.1) : 0;

      return {
      name: `Z${z.zone}`,
      minutes: chartMins,
      labelMinutes: Math.round(rawMins * 10) / 10,
      color: z.color,
      label: z.label,
      };
    });
  };

  // Summary view
  if (summary) {
    const zoneChart = buildZoneChartData(summary.hrData);
    return (
      <div className="fixed inset-0 z-[80] bg-background overflow-y-auto">
        <div className="max-w-lg mx-auto px-5 py-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl italic font-bold text-foreground">Session complete.</h2>
            <button onClick={handleClose} className="touch-btn p-2 rounded-full bg-secondary">
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          {/* Zone bar */}
          <div className="rounded-xl overflow-hidden h-10 flex">
            {summary.zoneMins.map((mins, i) => {
              const totalMins = summary.zoneMins.reduce((s, m) => s + m, 0);
              const pct = totalMins > 0 ? (mins / totalMins) * 100 : 0;
              if (pct < 1) return null;
              return (
                <div
                  key={i}
                  className="flex items-center justify-center"
                  style={{ width: `${pct}%`, backgroundColor: HR_ZONES[i].color }}
                >
                  {pct > 10 && (
                    <span className="font-body text-[10px] font-bold text-card">{Math.round(mins)}m</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <p className="font-mono text-4xl text-foreground">{summary.zone2PlusPercent}%</p>
            <p className="font-hand text-sm text-petal-gold mt-1">Above Zone 2 is where fitness is built.</p>
          </div>

          {/* Zone breakdown chart */}
          <div className="h-40 rounded-2xl bg-card p-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={zoneChart} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fontFamily: "Space Mono" }} stroke="hsl(var(--border))" />
                <YAxis tick={{ fontSize: 9, fontFamily: "Space Mono" }} stroke="hsl(var(--border))" width={30} unit="m" />
                <Bar dataKey="minutes" radius={[6, 6, 0, 0]}>
                  {zoneChart.map((entry, idx) => (
                    <Cell
                      key={idx}
                      fill={entry.color}
                      stroke="hsl(var(--foreground) / 0.15)"
                      strokeWidth={entry.name === "Z2" ? 1.6 : 1}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Zone legend */}
          <div className="flex flex-wrap gap-2 justify-center">
            {zoneChart.map(z => (
              <div key={z.name} className="flex items-center gap-1">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: z.color }} />
                <span className="font-body text-[10px] text-muted-foreground">{z.name} {z.label}</span>
                <span className="font-mono text-[10px] text-foreground">{z.labelMinutes}m</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              { val: summary.avgHR, label: "Avg HR" },
              { val: summary.maxHR, label: "Max HR" },
              { val: summary.caloriesBurnt || 0, label: "Calories" },
              { val: formatTime(summary.duration), label: "Total Time" },
            ].map(({ val, label }) => (
              <div key={label} className="card-warm p-3 text-center">
                <p className="font-mono text-lg text-foreground">{val}</p>
                <p className="font-hand text-[10px] text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>

          {zone2Reached && (
            <div className="flex items-center justify-center gap-2">
              <WildStar size={20} />
              <p className="font-hand text-sm text-petal-gold">Zone 2 goal reached</p>
            </div>
          )}

          <button onClick={handleClose} className="touch-btn w-full rounded-[14px] py-3 min-h-[52px] font-body text-sm font-bold text-primary-foreground bg-primary">
            Done →
          </button>
        </div>
      </div>
    );
  }

  // Connect + age setup view
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

          <div className="card-warm p-5" style={{ backgroundColor: "hsl(36 47% 94%)" }}>
            <p className="font-body text-sm italic text-muted-foreground">
              Connect a Bluetooth chest strap to track your zones in real time.
            </p>
            <p className="font-hand text-xs text-muted-foreground mt-2">
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
            <div className="card-warm p-4 flex items-center gap-3" style={{ backgroundColor: "hsl(var(--sage-mist) / 0.15)" }}>
              <Bluetooth className="h-4 w-4 text-sage-mist" />
              <span className="font-hand text-sm text-sage-mist">Connected · {hr.deviceName} ✓</span>
            </div>
          )}

          {!hr.isSupported && (
            <p className="font-body text-xs italic text-muted-foreground">
              Web Bluetooth is not supported in this browser. Try Chrome on Android or desktop.
            </p>
          )}

          {hr.error && <p className="font-body text-xs text-destructive">{hr.error}</p>}

          {hr.connected && !ageSet && (
            <div className="card-warm p-5 space-y-4">
              <p className="font-body text-sm text-foreground">Your details help us calculate zones & calories.</p>
              <div>
                <p className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-2">Age</p>
                <div className="flex items-center gap-4 justify-center">
                  <button onClick={() => setAge(a => Math.max(16, a - 1))} className="touch-btn h-10 w-10 rounded-full bg-secondary font-mono text-lg">−</button>
                  <span className="font-mono text-3xl text-foreground w-12 text-center">{age}</span>
                  <button onClick={() => setAge(a => Math.min(80, a + 1))} className="touch-btn h-10 w-10 rounded-full bg-secondary font-mono text-lg">+</button>
                </div>
                <p className="font-mono text-[10px] text-muted-foreground text-center mt-1">Max HR: {maxHR} bpm</p>
              </div>
              <div>
                <p className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-2">Weight (kg)</p>
                <div className="flex items-center gap-4 justify-center">
                  <button onClick={() => setWeight(w => Math.max(30, w - 1))} className="touch-btn h-10 w-10 rounded-full bg-secondary font-mono text-lg">−</button>
                  <span className="font-mono text-3xl text-foreground w-12 text-center">{weight}</span>
                  <button onClick={() => setWeight(w => Math.min(200, w + 1))} className="touch-btn h-10 w-10 rounded-full bg-secondary font-mono text-lg">+</button>
                </div>
                <p className="font-mono text-[10px] text-muted-foreground text-center mt-1">Used for calorie calculation</p>
              </div>
              <button onClick={handleSetAge} className="touch-btn w-full rounded-[14px] py-3 min-h-[48px] font-body text-sm font-bold text-primary-foreground bg-primary">
                Save & continue →
              </button>
            </div>
          )}

          {hr.connected && ageSet && (
            <>
              <div className="space-y-1.5">
                {HR_ZONES.map(z => (
                  <div key={z.zone} className="flex items-center gap-2 rounded-full px-3 py-1.5" style={{ backgroundColor: z.color + "22" }}>
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: z.color }} />
                    <span className="font-body text-xs text-foreground flex-1">Zone {z.zone} · {z.minPct}–{z.maxPct}%</span>
                    <span className="font-hand text-xs text-muted-foreground">{z.label}</span>
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

  // Zone 2+ ring SVG
  const ringSize = 120;
  const strokeW = 10;
  const radius = (ringSize - strokeW) / 2;
  const circumference = 2 * Math.PI * radius;
  const z2Progress = Math.min(zone2PlusMins / zone2Goal, 1);
  const strokeDash = circumference * z2Progress;

  // Live zone distribution for bar chart
  const liveZoneChart = buildZoneChartData(hrData);

  // Live workout view
  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto" style={{ backgroundColor: currentZone.color + "08" }}>
      <div className="max-w-lg mx-auto px-5 py-6 space-y-5">
        <div className="flex items-center justify-between">
          <p className="font-hand text-sm text-muted-foreground">{workoutName}</p>
          {!running && (
            <button onClick={handleClose} className="touch-btn p-2 rounded-full bg-secondary">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* BPM + zone label */}
        <div
          className="rounded-3xl p-6 text-center transition-colors duration-700"
          style={{ backgroundColor: currentZone.color + "18" }}
        >
          <motion.p
            className="font-mono text-[5rem] leading-none font-bold"
            style={{ color: currentZone.color }}
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
          >
            {hr.bpm || "—"}
          </motion.p>
          <p className="font-body text-xs uppercase tracking-widest mt-1" style={{ color: currentZone.color }}>bpm</p>
          <div
            className="inline-flex items-center gap-2 rounded-full px-5 py-2 mt-3 transition-colors duration-700"
            style={{ backgroundColor: currentZone.color }}
          >
            <span className="font-body text-sm font-bold text-white">Zone {currentZone.zone} · {currentZone.label}</span>
          </div>
        </div>

        {/* Zone 2+ progress ring + timer */}
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
              <span className="font-mono text-sm font-bold text-foreground">
                {Math.round(zone2PlusMins)}<span className="text-muted-foreground">/{zone2Goal}</span>
              </span>
              <span className="font-body text-[9px] text-muted-foreground">min Z2+</span>
            </div>
          </div>

          <div className="text-center">
            <p className="font-mono text-3xl text-foreground">{formatTime(elapsed)}</p>
            <p className="font-body text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">elapsed</p>
          </div>
        </div>

        {zone2Reached && (
          <div className="flex items-center justify-center gap-2">
            <WildStar size={16} />
            <p className="font-body text-sm font-semibold" style={{ color: currentZone.color }}>Zone 2+ goal reached</p>
          </div>
        )}

        {/* Live zone bar chart */}
        {hrData.length > 2 && (
          <div className="h-36 rounded-2xl bg-card p-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={liveZoneChart} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fontFamily: "Space Mono" }} stroke="hsl(var(--border))" />
                <YAxis tick={{ fontSize: 9, fontFamily: "Space Mono" }} stroke="hsl(var(--border))" width={30} unit="m" />
                <Bar dataKey="minutes" radius={[6, 6, 0, 0]}>
                  {liveZoneChart.map((entry, idx) => (
                    <Cell
                      key={idx}
                      fill={entry.color}
                      stroke="hsl(var(--foreground) / 0.15)"
                      strokeWidth={entry.name === "Z2" ? 1.6 : 1}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
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
