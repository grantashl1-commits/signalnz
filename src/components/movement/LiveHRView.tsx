import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { X, Bluetooth, Activity } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ReferenceLine, ResponsiveContainer } from "recharts";
import { WildStar } from "@/components/BotanicalElements";
import { useHeartRate } from "@/hooks/useHeartRate";
import { useWakeLock } from "@/hooks/useWakeLock";
import {
  getUserAge, setUserAge, getMaxHR, getZoneForBPM, HR_ZONES,
  saveWorkoutSession, type WorkoutSession,
} from "@/data/workouts";
import { getCycleInfo, getLastPeriodStart } from "@/lib/cycle-utils";
import { haptic } from "@/hooks/use-mobile";

interface LiveHRViewProps {
  workoutName?: string;
  onClose: () => void;
}

export default function LiveHRView({ workoutName = "Workout", onClose }: LiveHRViewProps) {
  const hr = useHeartRate();
  const { request: requestWakeLock, release: releaseWakeLock } = useWakeLock();
  const [age, setAge] = useState(getUserAge() || 30);
  const [ageSet, setAgeSet] = useState(!!getUserAge());
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [hrData, setHrData] = useState<{ time: number; bpm: number }[]>([]);
  const [summary, setSummary] = useState<WorkoutSession | null>(null);
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const maxHR = getMaxHR(age);
  const currentZone = hr.bpm > 0 ? getZoneForBPM(hr.bpm, maxHR) : HR_ZONES[0];

  // Zone boundaries
  const zoneBoundaries = HR_ZONES.map(z => Math.round((z.minPct / 100) * maxHR));

  // Zone 2+ minutes
  const zone2PlusMins = hrData.filter(d => {
    const z = getZoneForBPM(d.bpm, maxHR);
    return z.zone >= 2;
  }).length * 2 / 60; // Each point = ~2 sec

  const zone2Goal = 21;
  const zone2Reached = zone2PlusMins >= zone2Goal;

  useEffect(() => {
    if (running) {
      requestWakeLock();
      startTimeRef.current = Date.now() - elapsed * 1000;
      intervalRef.current = window.setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  // Record HR data every 2 seconds
  useEffect(() => {
    if (!running || hr.bpm === 0) return;
    const timer = setInterval(() => {
      setHrData(prev => [...prev, { time: elapsed, bpm: hr.bpm }]);
    }, 2000);
    return () => clearInterval(timer);
  }, [running, hr.bpm, elapsed]);

  const handleSetAge = () => {
    setUserAge(age);
    setAgeSet(true);
  };

  const handleStart = () => {
    haptic("medium");
    setRunning(true);
    setElapsed(0);
    setHrData([]);
  };

  const handleStop = () => {
    haptic("success");
    setRunning(false);
    releaseWakeLock();
    if (intervalRef.current) clearInterval(intervalRef.current);

    // Calculate summary
    const info = getCycleInfo(getLastPeriodStart());
    const zoneMins = [0, 0, 0, 0, 0];
    hrData.forEach(d => {
      const z = getZoneForBPM(d.bpm, maxHR);
      zoneMins[z.zone - 1] += 2 / 60;
    });
    const avgHR = hrData.length > 0 ? Math.round(hrData.reduce((s, d) => s + d.bpm, 0) / hrData.length) : 0;
    const peakHR = hrData.length > 0 ? Math.max(...hrData.map(d => d.bpm)) : 0;
    const totalMins = zoneMins.reduce((s, m) => s + m, 0);
    const z2Plus = totalMins > 0 ? Math.round(((zoneMins[1] + zoneMins[2] + zoneMins[3] + zoneMins[4]) / totalMins) * 100) : 0;

    const session: WorkoutSession = {
      id: `session-${Date.now()}`,
      workoutName,
      duration: elapsed,
      avgHR,
      maxHR: peakHR,
      zoneMins: zoneMins.map(m => Math.round(m * 10) / 10),
      zone2PlusPercent: z2Plus,
      phase: info.phase,
      cycleDay: info.cycleDay,
      date: new Date().toISOString().split("T")[0],
      hrData,
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

  // Summary view
  if (summary) {
    const totalMins = summary.zoneMins.reduce((s, m) => s + m, 0);
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

          <div className="grid grid-cols-3 gap-3">
            {[
              { val: summary.avgHR, label: "Avg HR" },
              { val: summary.maxHR, label: "Max HR" },
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
              <p className="font-hand text-sm text-petal-gold">Zone 2 goal reached ✨</p>
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
              To keep your screen on while cooking, go to Settings → Display and set screen timeout to 5 minutes.
            </p>
          )}

          {hr.error && <p className="font-body text-xs text-destructive">{hr.error}</p>}

          {hr.connected && !ageSet && (
            <div className="card-warm p-5 space-y-3">
              <p className="font-body text-sm text-foreground">Your age helps us calculate your zones.</p>
              <div className="flex items-center gap-4 justify-center">
                <button onClick={() => setAge(a => Math.max(16, a - 1))} className="touch-btn h-10 w-10 rounded-full bg-secondary font-mono text-lg">−</button>
                <span className="font-mono text-3xl text-foreground w-12 text-center">{age}</span>
                <button onClick={() => setAge(a => Math.min(80, a + 1))} className="touch-btn h-10 w-10 rounded-full bg-secondary font-mono text-lg">+</button>
              </div>
              <p className="font-mono text-[10px] text-muted-foreground text-center">Max HR: {maxHR} bpm</p>
              <button onClick={handleSetAge} className="touch-btn w-full rounded-[14px] py-3 min-h-[48px] font-body text-sm font-bold text-primary-foreground bg-primary">
                Set age →
              </button>
            </div>
          )}

          {hr.connected && ageSet && (
            <>
              {/* Zone definitions */}
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

  // Live workout view
  return (
    <div className="fixed inset-0 z-[80] bg-background overflow-y-auto">
      <div className="max-w-lg mx-auto px-5 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="font-hand text-sm text-muted-foreground">{workoutName}</p>
          {!running && (
            <button onClick={handleClose} className="touch-btn p-2 rounded-full bg-secondary">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* BPM */}
        <div className="text-center">
          <motion.p
            className="font-mono text-[5rem] leading-none"
            style={{ color: currentZone.color }}
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
          >
            {hr.bpm || "—"}
          </motion.p>
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mt-2" style={{ backgroundColor: currentZone.color }}>
            <span className="font-hand text-sm font-bold text-card">Zone {currentZone.zone} · {currentZone.label}</span>
          </div>
        </div>

        {/* Live graph */}
        {hrData.length > 1 && (
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hrData.slice(-90)}>
                <XAxis
                  dataKey="time"
                  tickFormatter={v => formatTime(v)}
                  tick={{ fontSize: 9, fontFamily: "Space Mono" }}
                  stroke="hsl(var(--border))"
                />
                <YAxis
                  domain={[zoneBoundaries[0] - 10, maxHR + 10]}
                  tick={{ fontSize: 9, fontFamily: "Space Mono" }}
                  stroke="hsl(var(--border))"
                  width={35}
                />
                {zoneBoundaries.map((bpm, i) => (
                  <ReferenceLine key={i} y={bpm} stroke="hsl(var(--border))" strokeDasharray="3 3" />
                ))}
                <Area
                  type="monotone"
                  dataKey="bpm"
                  stroke={currentZone.color}
                  fill={currentZone.color}
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Timer */}
        <p className="font-mono text-2xl text-foreground text-center">{formatTime(elapsed)}</p>

        {/* Zone 2 progress */}
        <div className="text-center">
          {zone2Reached ? (
            <p className="font-hand text-sm text-petal-gold flex items-center justify-center gap-1">
              <WildStar size={14} /> Zone 2 goal reached ✨
            </p>
          ) : (
            <p className="font-hand text-sm text-petal-gold">
              {Math.round(zone2PlusMins)} min in Zone 2+ · {Math.max(0, Math.round(zone2Goal - zone2PlusMins))} min to ✨
            </p>
          )}
        </div>

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
