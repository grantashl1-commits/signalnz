/**
 * ReapHRMonitor — self-contained HR monitoring component for the REAP game.
 *
 * Dependencies: react, recharts
 * No other project-specific imports required — drop it into any React app.
 *
 * Supported devices (Web Bluetooth, standard GATT heart_rate service):
 *   Polar H9, H10 · Garmin HRM-Dual / HRM-Pro chest straps
 *   Wahoo TICKR · CooSpo H6 · any BLE HRM with standard heart_rate GATT service
 *
 * NOT supported: Apple Watch, Garmin GPS watches, wrist-based Fitbits,
 *   or any device that doesn't expose the standard BLE GATT heart_rate service.
 *
 * Browser requirement: Chrome on Android or desktop (Web Bluetooth is not
 *   available in Safari or Firefox).
 */

import { useState, useEffect, useRef, useCallback, type CSSProperties } from "react";
import {
  BarChart, Bar, Cell, XAxis, YAxis,
  ResponsiveContainer, Tooltip,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

interface HRSample {
  time: number; // seconds from session start
  bpm: number;
}

interface ReapSession {
  id: string;
  date: string;           // NZ date YYYY-MM-DD
  startTime: number;      // Unix ms
  endTime: number;
  duration: number;       // seconds
  avgHR: number;
  peakHR: number;
  zoneMins: number[];     // [z1, z2, z3, z4, z5] minutes
  zone2PlusMins: number;
  hrData: HRSample[];
}

interface DailyLog {
  date: string;
  zone2PlusMins: number;  // accumulated across all sessions today
  sessions: ReapSession[];
  survived: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ZONE2_GOAL = 22; // minutes required to survive
const SAMPLE_INTERVAL_MS = 2000;

const HR_ZONES = [
  { zone: 1, label: "Recovery",  minPct: 50, maxPct: 60, color: "#6aaa6a" },
  { zone: 2, label: "Fat Burn",  minPct: 60, maxPct: 70, color: "#d4b84a" },
  { zone: 3, label: "Aerobic",   minPct: 70, maxPct: 80, color: "#e07840" },
  { zone: 4, label: "Threshold", minPct: 80, maxPct: 90, color: "#c03c7c" },
  { zone: 5, label: "Maximum",   minPct: 90, maxPct: 100, color: "#7c50c0" },
] as const;

// ─── Utilities ────────────────────────────────────────────────────────────────

function getMaxHR(age: number): number {
  return Math.round(208 - 0.7 * age);
}

function getZoneForBPM(bpm: number, maxHR: number) {
  const pct = (bpm / maxHR) * 100;
  for (let i = HR_ZONES.length - 1; i >= 0; i--) {
    if (pct >= HR_ZONES[i].minPct) return HR_ZONES[i];
  }
  return HR_ZONES[0];
}

/** Current date in NZ timezone as YYYY-MM-DD */
function getNZDateString(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Pacific/Auckland" });
}

function formatTime(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return h > 0
    ? `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
    : `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

// ─── Persistence ─────────────────────────────────────────────────────────────

function loadDailyLog(date: string): DailyLog {
  try {
    const raw = localStorage.getItem(`reap_daily_${date}`);
    if (raw) return JSON.parse(raw) as DailyLog;
  } catch {}
  return { date, zone2PlusMins: 0, sessions: [], survived: false };
}

function saveDailyLog(log: DailyLog): void {
  localStorage.setItem(`reap_daily_${log.date}`, JSON.stringify(log));
}

function loadWeeklySummary(): DailyLog[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return loadDailyLog(d.toLocaleDateString("en-CA", { timeZone: "Pacific/Auckland" }));
  });
}

// ─── BLE Heart Rate Hook ──────────────────────────────────────────────────────

function useHeartRateBLE() {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [bpm, setBpm] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const deviceRef = useRef<BluetoothDevice | null>(null);
  const charRef = useRef<BluetoothRemoteGATTCharacteristic | null>(null);

  const isSupported =
    typeof navigator !== "undefined" && "bluetooth" in navigator;

  const handleMeasurement = useCallback((event: Event) => {
    const value = (event.target as BluetoothRemoteGATTCharacteristic)?.value;
    if (!value) return;
    const flags = value.getUint8(0);
    const is16Bit = flags & 0x1;
    setBpm(is16Bit ? value.getUint16(1, true) : value.getUint8(1));
  }, []);

  const connect = useCallback(async () => {
    if (!isSupported) {
      setError("Web Bluetooth not available. Use Chrome on Android or desktop.");
      return;
    }
    setConnecting(true);
    setError(null);
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: ["heart_rate"] }],
      });
      deviceRef.current = device;
      device.addEventListener("gattserverdisconnected", () => {
        setConnected(false);
        setBpm(0);
        setDeviceName(null);
      });
      const server = await device.gatt!.connect();
      const service = await server.getPrimaryService("heart_rate");
      const char = await service.getCharacteristic("heart_rate_measurement");
      charRef.current = char;
      await char.startNotifications();
      char.addEventListener("characteristicvaluechanged", handleMeasurement);
      setConnected(true);
      setDeviceName(device.name ?? "Heart Rate Monitor");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (!msg.includes("cancelled")) setError("Could not connect — try again.");
    } finally {
      setConnecting(false);
    }
  }, [isSupported, handleMeasurement]);

  const disconnect = useCallback(() => {
    try {
      charRef.current?.removeEventListener("characteristicvaluechanged", handleMeasurement);
      charRef.current?.stopNotifications();
    } catch {}
    if (deviceRef.current?.gatt?.connected) deviceRef.current.gatt.disconnect();
    setConnected(false);
    setBpm(0);
    setDeviceName(null);
  }, [handleMeasurement]);

  useEffect(() => () => { disconnect(); }, [disconnect]);

  return { connected, connecting, deviceName, bpm, error, connect, disconnect, isSupported };
}

// ─── Zone 2+ Progress Ring ────────────────────────────────────────────────────

interface Zone2RingProps {
  /** Total Zone 2+ minutes today (previous sessions + current session) */
  todayMins: number;
  activeColor: string;
  size?: number;
  strokeWidth?: number;
}

function Zone2Ring({ todayMins, activeColor, size = 140, strokeWidth = 12 }: Zone2RingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(todayMins / ZONE2_GOAL, 1);
  const done = progress >= 1;

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", display: "block" }}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="#2a2a2a" strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={done ? "#22c55e" : activeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - circumference * progress}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease, stroke 0.5s ease" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center",
      }}>
        <span style={{ fontSize: 17, fontWeight: "bold", color: done ? "#22c55e" : "#fff" }}>
          {Math.floor(todayMins)}
          <span style={{ color: "#555" }}>/{ZONE2_GOAL}</span>
        </span>
        <span style={{ fontSize: 10, color: "#666", marginTop: 2 }}>min Z2+</span>
      </div>
    </div>
  );
}

// ─── Live Zone Bar Chart ──────────────────────────────────────────────────────
// Each bar = 30-second bucket, colored by dominant zone, height = avg BPM.

interface ZoneBarChartProps {
  hrData: HRSample[];
  maxHR: number;
  height?: number;
}

function ZoneBarChart({ hrData, maxHR, height = 155 }: ZoneBarChartProps) {
  const BUCKET = 30; // seconds

  if (hrData.length < 2) {
    return (
      <div style={emptyChartStyle(height)}>
        <span style={{ color: "#555", fontSize: 12 }}>Collecting data…</span>
      </div>
    );
  }

  const maxTime = hrData[hrData.length - 1].time;
  const buckets: { label: string; bpm: number; color: string }[] = [];

  for (let t = 0; t <= maxTime; t += BUCKET) {
    const inBucket = hrData.filter(d => d.time >= t && d.time < t + BUCKET);
    if (inBucket.length === 0) continue;
    const avg = Math.round(inBucket.reduce((s, d) => s + d.bpm, 0) / inBucket.length);
    const zone = getZoneForBPM(avg, maxHR);
    const min = Math.floor(t / 60);
    const sec = t % 60;
    buckets.push({ label: `${min}:${sec.toString().padStart(2, "0")}`, bpm: avg, color: zone.color });
  }

  const yMin = Math.max(40, Math.min(...buckets.map(b => b.bpm)) - 10);
  const yMax = maxHR + 10;

  return (
    <div style={{ height, background: "#181818", borderRadius: 12, padding: "10px 6px 6px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={buckets} margin={{ top: 2, right: 4, bottom: 2, left: 0 }}>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 8, fill: "#555" }}
            stroke="#2a2a2a"
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[yMin, yMax]}
            tick={{ fontSize: 8, fill: "#555" }}
            stroke="#2a2a2a"
            width={30}
          />
          <Tooltip
            contentStyle={{ background: "#222", border: "1px solid #333", borderRadius: 8, fontSize: 11 }}
            formatter={(v: number) => [`${v} bpm`, "Avg BPM"]}
            labelFormatter={(l: string) => `Time ${l}`}
          />
          <Bar dataKey="bpm" radius={[3, 3, 0, 0]} isAnimationActive={false}>
            {buckets.map((b, i) => <Cell key={i} fill={b.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Session-summary zone bar chart — one bar per zone showing total minutes
function ZoneSummaryBarChart({ zoneMins, height = 140 }: { zoneMins: number[]; height?: number }) {
  const data = HR_ZONES.map((z, i) => ({
    name: `Z${z.zone}`,
    minutes: Math.round(zoneMins[i] * 10) / 10,
    color: z.color,
    label: z.label,
  }));

  return (
    <div style={{ height, background: "#181818", borderRadius: 12, padding: "8px 6px 6px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#666" }} stroke="#2a2a2a" />
          <YAxis tick={{ fontSize: 9, fill: "#666" }} stroke="#2a2a2a" width={28} unit="m" />
          <Tooltip
            contentStyle={{ background: "#222", border: "1px solid #333", borderRadius: 8, fontSize: 11 }}
            formatter={(v: number) => [`${v}m`, "Minutes"]}
          />
          <Bar dataKey="minutes" radius={[5, 5, 0, 0]} isAnimationActive={false}>
            {data.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ReapHRMonitor() {
  const hr = useHeartRateBLE();

  const [age, setAge] = useState<number>(() => {
    const stored = localStorage.getItem("reap_age");
    return stored ? Number(stored) : 30;
  });
  const [ageConfirmed, setAgeConfirmed] = useState(() => !!localStorage.getItem("reap_age"));

  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [hrData, setHrData] = useState<HRSample[]>([]);
  const [finishedSession, setFinishedSession] = useState<ReapSession | null>(null);
  const [showWeekly, setShowWeekly] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sampleRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startMsRef = useRef<number>(0);
  const bpmRef = useRef(0);
  const elapsedRef = useRef(0);

  const maxHR = getMaxHR(age);
  const currentZone = hr.bpm > 0 ? getZoneForBPM(hr.bpm, maxHR) : HR_ZONES[0];

  const todayDate = getNZDateString();
  const [todayLog, setTodayLog] = useState<DailyLog>(() => loadDailyLog(todayDate));

  // Zone 2+ minutes accumulated in the current live session
  const sessionZ2Mins = hrData.filter(d => getZoneForBPM(d.bpm, maxHR).zone >= 2).length
    * (SAMPLE_INTERVAL_MS / 1000) / 60;

  // Total Zone 2+ for today: previous sessions + this one
  const totalZ2Today = todayLog.zone2PlusMins + sessionZ2Mins;
  const survived = totalZ2Today >= ZONE2_GOAL;

  useEffect(() => { bpmRef.current = hr.bpm; }, [hr.bpm]);
  useEffect(() => { elapsedRef.current = elapsed; }, [elapsed]);

  // Timer
  useEffect(() => {
    if (!running) return;
    startMsRef.current = Date.now() - elapsedRef.current * 1000;
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startMsRef.current) / 1000));
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [running]);

  // HR sampling
  useEffect(() => {
    if (!running) {
      if (sampleRef.current) clearInterval(sampleRef.current);
      return;
    }
    const sample = () => {
      const bpm = bpmRef.current;
      if (bpm <= 0) return;
      setHrData(prev => [...prev, {
        time: Math.floor((Date.now() - startMsRef.current) / 1000),
        bpm,
      }]);
    };
    sample();
    sampleRef.current = setInterval(sample, SAMPLE_INTERVAL_MS);
    return () => { if (sampleRef.current) clearInterval(sampleRef.current); };
  }, [running]);

  const handleLogSession = () => {
    setElapsed(0);
    elapsedRef.current = 0;
    setHrData([]);
    setFinishedSession(null);
    setRunning(true);
  };

  const handleEndSession = () => {
    setRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (sampleRef.current) clearInterval(sampleRef.current);

    const date = getNZDateString();
    const zoneMins = [0, 0, 0, 0, 0];
    hrData.forEach(d => {
      zoneMins[getZoneForBPM(d.bpm, maxHR).zone - 1] += SAMPLE_INTERVAL_MS / 1000 / 60;
    });

    const avgHR = hrData.length > 0
      ? Math.round(hrData.reduce((s, d) => s + d.bpm, 0) / hrData.length) : 0;
    const peakHR = hrData.length > 0 ? Math.max(...hrData.map(d => d.bpm)) : 0;
    const z2PlusMins = zoneMins.slice(1).reduce((s, m) => s + m, 0);

    const session: ReapSession = {
      id: `reap-${Date.now()}`,
      date,
      startTime: startMsRef.current,
      endTime: Date.now(),
      duration: elapsed,
      avgHR,
      peakHR,
      zoneMins: zoneMins.map(m => Math.round(m * 10) / 10),
      zone2PlusMins: Math.round(z2PlusMins * 10) / 10,
      hrData,
    };

    const newTotal = Math.round((todayLog.zone2PlusMins + z2PlusMins) * 10) / 10;
    const updatedLog: DailyLog = {
      ...todayLog,
      zone2PlusMins: newTotal,
      sessions: [...todayLog.sessions, session],
      survived: newTotal >= ZONE2_GOAL,
    };
    saveDailyLog(updatedLog);
    setTodayLog(updatedLog);
    setFinishedSession(session);
  };

  // ── Weekly summary ──────────────────────────────────────────────────────────
  if (showWeekly) {
    const weekly = loadWeeklySummary();
    return (
      <div style={pageStyle}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <h2 style={headingStyle}>Weekly log</h2>
          <button onClick={() => setShowWeekly(false)} style={btn("ghost")}>← Back</button>
        </div>
        {weekly.map(day => (
          <div key={day.date} style={{
            marginBottom: 10, padding: "14px 16px",
            background: "#181818", borderRadius: 12,
            border: `1px solid ${day.survived ? "#22c55e44" : "#2a2a2a"}`,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "#ccc" }}>{day.date}</span>
              <span style={{
                fontSize: 12, fontWeight: "bold",
                color: day.survived ? "#22c55e" : day.zone2PlusMins > 0 ? "#d4b84a" : "#444",
              }}>
                {day.survived
                  ? "SURVIVED"
                  : day.zone2PlusMins > 0
                    ? `${day.zone2PlusMins}m / ${ZONE2_GOAL}m`
                    : "No activity"}
              </span>
            </div>
            {day.sessions.length > 0 && (
              <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
                {day.sessions.map(s => (
                  <span key={s.id} style={{
                    fontSize: 11, color: "#666",
                    background: "#222", borderRadius: 6, padding: "3px 8px",
                  }}>
                    {formatTime(s.duration)} · {s.zone2PlusMins}m Z2+
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // ── Session complete ────────────────────────────────────────────────────────
  if (finishedSession) {
    const totalZ2 = todayLog.zone2PlusMins; // already includes this session
    const dayDone = totalZ2 >= ZONE2_GOAL;

    return (
      <div style={pageStyle}>
        <h2 style={{ ...headingStyle, marginBottom: 20 }}>Session complete</h2>

        {/* Stats grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
          {[
            { label: "Duration",  val: formatTime(finishedSession.duration) },
            { label: "Z2+ this session", val: `${finishedSession.zone2PlusMins}m` },
            { label: "Avg HR",    val: `${finishedSession.avgHR} bpm` },
            { label: "Peak HR",   val: `${finishedSession.peakHR} bpm` },
          ].map(({ label, val }) => (
            <div key={label} style={statCard}>
              <div style={{ fontSize: 22, fontWeight: "bold", color: "#fff" }}>{val}</div>
              <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* REAP status */}
        <div style={{
          padding: 18, borderRadius: 14, marginBottom: 20, textAlign: "center",
          background: dayDone ? "#22c55e0d" : "#181818",
          border: `1px solid ${dayDone ? "#22c55e66" : "#2a2a2a"}`,
        }}>
          <div style={{ fontSize: 32, fontWeight: "bold", color: dayDone ? "#22c55e" : "#d4b84a" }}>
            {Math.round(totalZ2)}<span style={{ color: "#444" }}>/{ZONE2_GOAL}</span>
            <span style={{ fontSize: 14, color: "#666", marginLeft: 4 }}>min Z2+</span>
          </div>
          <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>accumulated today</div>
          {dayDone ? (
            <div style={{ fontSize: 16, fontWeight: "bold", color: "#22c55e", marginTop: 10 }}>
              You survived today.
            </div>
          ) : (
            <div style={{ fontSize: 13, color: "#888", marginTop: 10 }}>
              {Math.ceil(ZONE2_GOAL - totalZ2)} more minutes in Z2+ to survive
            </div>
          )}
        </div>

        {/* Zone bar chart — total minutes per zone */}
        <p style={sectionLabel}>Zone breakdown</p>
        <ZoneSummaryBarChart zoneMins={finishedSession.zoneMins} />

        {/* Zone legend */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 12px", justifyContent: "center", marginTop: 10, marginBottom: 20 }}>
          {HR_ZONES.map((z, i) => (
            <div key={z.zone} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: z.color }} />
              <span style={{ fontSize: 10, color: "#666" }}>Z{z.zone} {z.label}</span>
              <span style={{ fontSize: 10, color: "#aaa" }}>{finishedSession.zoneMins[i]}m</span>
            </div>
          ))}
        </div>

        <button onClick={handleLogSession} style={{ ...btn("primary"), marginBottom: 8 }}>
          Log another session
        </button>
        <button onClick={() => setShowWeekly(true)} style={btn("ghost")}>
          View weekly log
        </button>
      </div>
    );
  }

  // ── Setup: connect device + confirm age ─────────────────────────────────────
  if (!hr.connected || !ageConfirmed) {
    return (
      <div style={pageStyle}>
        <h1 style={{ fontSize: 28, fontWeight: "bold", margin: "0 0 4px" }}>REAP</h1>
        <p style={{ fontSize: 13, color: "#666", marginBottom: 24 }}>
          Log 22+ minutes in Zone 2 or above to survive the day.
        </p>

        {/* Today's accumulated progress */}
        {todayLog.zone2PlusMins > 0 && (
          <div style={{
            padding: "12px 16px", borderRadius: 12, marginBottom: 20,
            background: todayLog.survived ? "#22c55e11" : "#181818",
            border: `1px solid ${todayLog.survived ? "#22c55e44" : "#2a2a2a"}`,
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{ fontSize: 13, color: "#aaa" }}>Today's Z2+ total</span>
            <span style={{ fontSize: 15, fontWeight: "bold", color: todayLog.survived ? "#22c55e" : "#d4b84a" }}>
              {todayLog.zone2PlusMins}m / {ZONE2_GOAL}m
            </span>
          </div>
        )}

        {/* Device support note */}
        <div style={{
          background: "#181818", borderRadius: 12, padding: 16,
          marginBottom: 20, fontSize: 12, color: "#888",
          border: "1px solid #2a2a2a",
        }}>
          <p style={{ margin: "0 0 6px", color: "#ccc", fontWeight: "bold" }}>Compatible devices</p>
          <p style={{ margin: "0 0 8px" }}>
            Polar H9 / H10 &nbsp;·&nbsp; Garmin HRM-Dual / HRM-Pro &nbsp;·&nbsp;
            Wahoo TICKR &nbsp;·&nbsp; CooSpo H6 &nbsp;·&nbsp;
            any BLE device with the standard GATT <em>heart_rate</em> service.
          </p>
          <p style={{ margin: 0, color: "#e87040" }}>
            Apple Watch, Garmin GPS watches, and most wrist-based Fitbits do
            not expose heart rate via Web Bluetooth.
          </p>
        </div>

        {/* Connect button */}
        {!hr.connected ? (
          <>
            <button
              onClick={hr.connect}
              disabled={hr.connecting || !hr.isSupported}
              style={{ ...btn("primary"), marginBottom: 8, opacity: hr.connecting || !hr.isSupported ? 0.5 : 1 }}
            >
              {hr.connecting ? "Connecting…" : "Connect HR monitor"}
            </button>
            {!hr.isSupported && (
              <p style={{ fontSize: 11, color: "#e87040", marginTop: 6 }}>
                Web Bluetooth requires Chrome on Android or desktop — not available in Safari or Firefox.
              </p>
            )}
            {hr.error && (
              <p style={{ fontSize: 12, color: "#ef4444", marginTop: 6 }}>{hr.error}</p>
            )}
          </>
        ) : (
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "#181818", borderRadius: 12, padding: "12px 16px",
            border: "1px solid #22c55e44", marginBottom: 16,
          }}>
            <span style={{ fontSize: 18, color: "#22c55e" }}>✓</span>
            <span style={{ fontSize: 14, color: "#ccc" }}>Connected · {hr.deviceName}</span>
          </div>
        )}

        {/* Age input */}
        {hr.connected && !ageConfirmed && (
          <div style={{
            background: "#181818", borderRadius: 14, padding: 20,
            border: "1px solid #2a2a2a", marginTop: 16,
          }}>
            <p style={{ fontSize: 13, color: "#aaa", marginBottom: 16 }}>
              Your age is used to calculate heart rate zones.
            </p>
            <p style={{ fontSize: 11, color: "#666", textAlign: "center", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>Age</p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginBottom: 8 }}>
              <button onClick={() => setAge(a => Math.max(16, a - 1))} style={btn("ghost", 44)}>−</button>
              <span style={{ fontSize: 36, fontWeight: "bold", width: 52, textAlign: "center" }}>{age}</span>
              <button onClick={() => setAge(a => Math.min(80, a + 1))} style={btn("ghost", 44)}>+</button>
            </div>
            <p style={{ fontSize: 11, color: "#555", textAlign: "center", marginBottom: 20 }}>
              Max HR: {maxHR} bpm
            </p>
            <button
              onClick={() => { localStorage.setItem("reap_age", age.toString()); setAgeConfirmed(true); }}
              style={btn("primary")}
            >
              Confirm age
            </button>
          </div>
        )}

        {/* Zone reference + start */}
        {hr.connected && ageConfirmed && (
          <div style={{ marginTop: 20 }}>
            <p style={sectionLabel}>Your zones</p>
            {HR_ZONES.map(z => (
              <div key={z.zone} style={{
                display: "flex", alignItems: "center", gap: 10,
                background: z.color + "18", borderRadius: 8, padding: "8px 12px",
                marginBottom: 6, border: `1px solid ${z.color}33`,
              }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: z.color, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 13, color: "#ddd" }}>Zone {z.zone} · {z.label}</span>
                <span style={{ fontSize: 12, color: "#666" }}>
                  {Math.round(maxHR * z.minPct / 100)}–{Math.round(maxHR * z.maxPct / 100)} bpm
                </span>
              </div>
            ))}
            <button onClick={handleLogSession} style={{ ...btn("primary"), marginTop: 18 }}>
              Log Session →
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── Live session ────────────────────────────────────────────────────────────
  return (
    <div style={{ ...pageStyle, transition: "background 0.6s" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <span style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          REAP · Live
        </span>
        <span style={{ fontSize: 12, color: currentZone.color }}>{hr.deviceName}</span>
      </div>

      {/* BPM hero */}
      <div style={{
        background: currentZone.color + "18",
        borderRadius: 20, padding: "24px 16px", textAlign: "center", marginBottom: 20,
        border: `1px solid ${currentZone.color}44`,
        transition: "background 0.6s, border-color 0.6s",
      }}>
        <div style={{ fontSize: 88, fontWeight: "bold", color: currentZone.color, lineHeight: 1 }}>
          {hr.bpm || "—"}
        </div>
        <div style={{ fontSize: 11, color: currentZone.color, textTransform: "uppercase", letterSpacing: "0.12em", marginTop: 4 }}>
          bpm
        </div>
        <div style={{
          display: "inline-block", marginTop: 14,
          padding: "7px 22px", borderRadius: 999,
          background: currentZone.color,
          fontSize: 13, fontWeight: "bold", color: "#fff",
          transition: "background 0.4s",
        }}>
          Zone {currentZone.zone} · {currentZone.label}
        </div>
      </div>

      {/* Zone 2+ ring + elapsed timer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 40, marginBottom: 20 }}>
        <Zone2Ring
          todayMins={totalZ2Today}
          activeColor={currentZone.color}
        />
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 38, fontWeight: "bold", fontVariantNumeric: "tabular-nums" }}>
            {formatTime(elapsed)}
          </div>
          <div style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 6 }}>
            elapsed
          </div>
        </div>
      </div>

      {/* Survived banner */}
      {survived && (
        <div style={{
          textAlign: "center", padding: "10px 16px", borderRadius: 12, marginBottom: 16,
          background: "#22c55e0d", border: "1px solid #22c55e44",
          fontSize: 14, fontWeight: "bold", color: "#22c55e",
        }}>
          You've survived today!
        </div>
      )}

      {/* Live zone bar chart */}
      {hrData.length >= 4 && (
        <div style={{ marginBottom: 20 }}>
          <p style={sectionLabel}>Heart rate by zone</p>
          <ZoneBarChart hrData={hrData} maxHR={maxHR} />
        </div>
      )}

      {/* End session */}
      <button onClick={handleEndSession} style={{ ...btn("danger"), marginBottom: 8 }}>
        End Session
      </button>
      <button onClick={() => setShowWeekly(true)} style={btn("ghost")}>
        Weekly log
      </button>
    </div>
  );
}

// ─── Style helpers ────────────────────────────────────────────────────────────

const pageStyle: CSSProperties = {
  maxWidth: 480,
  margin: "0 auto",
  padding: "28px 16px 40px",
  background: "#111",
  minHeight: "100vh",
  color: "#fff",
  fontFamily: "system-ui, -apple-system, sans-serif",
};

const headingStyle: CSSProperties = {
  fontSize: 22,
  fontWeight: "bold",
  margin: 0,
};

const sectionLabel: CSSProperties = {
  fontSize: 10,
  color: "#555",
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  marginBottom: 8,
};

const statCard: CSSProperties = {
  background: "#181818",
  borderRadius: 12,
  padding: "14px 12px",
  textAlign: "center",
  border: "1px solid #2a2a2a",
};

function emptyChartStyle(height: number): CSSProperties {
  return {
    height,
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "#181818", borderRadius: 12,
  };
}

function btn(variant: "primary" | "danger" | "ghost", size?: number): CSSProperties {
  const base: CSSProperties = {
    display: "flex", alignItems: "center", justifyContent: "center",
    width: size ?? "100%",
    height: size ?? 52,
    minWidth: size,
    borderRadius: size ? "50%" : 14,
    border: "none",
    fontSize: size ? 20 : 15,
    fontWeight: "bold",
    cursor: "pointer",
    transition: "opacity 0.15s",
  };
  if (variant === "primary") return { ...base, background: "#e63946", color: "#fff" };
  if (variant === "danger")  return { ...base, background: "#ef4444", color: "#fff" };
  return { ...base, background: "#1e1e1e", color: "#bbb", border: "1px solid #2a2a2a" };
}
