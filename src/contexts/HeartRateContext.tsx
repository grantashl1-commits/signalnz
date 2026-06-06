import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from "react";
import { summariseSamples, type HRSample, type HRZoneSummary } from "@/lib/hr-zones";

interface HeartRateState {
  connected: boolean;
  connecting: boolean;
  deviceName: string | null;
  bpm: number;
  error: string | null;
}

export interface LiveHRSample {
  /** Seconds since session start */
  time: number;
  bpm: number;
}

export interface LiveSessionState {
  /** Overlay full-screen view is visible */
  open: boolean;
  /** Recording in progress (continues while minimized) */
  active: boolean;
  /** Display label / workout name for the session */
  workoutName: string;
  /** ms timestamp when recording started (0 if not yet started) */
  startedAt: number;
  /** Live samples collected during the session */
  samples: LiveHRSample[];
}

interface HeartRateContextValue extends HeartRateState {
  connect: () => Promise<void>;
  disconnect: () => void;
  isSupported: boolean;
  /** Begin recording bpm samples for a workout. (Legacy inline path use.) */
  startSession: () => void;
  /** Stop recording and return a zone summary (or null if no samples). */
  endSession: (hrMax?: number) => HRZoneSummary | null;
  /** True while a session is being recorded. */
  recording: boolean;

  // ── Live overlay session (heavy HR session view) ───────────────────────────
  live: LiveSessionState;
  /** Live tick (seconds) — re-renders consumers ~1Hz while recording. */
  liveElapsed: number;
  /** Open the live overlay, optionally setting / resetting the workout name. */
  openLive: (workoutName?: string) => void;
  /** Hide the overlay without ending the session. */
  minimizeLive: () => void;
  /** Re-show the overlay. */
  restoreLive: () => void;
  /** Begin recording the live session (starts timer + sample collection). */
  startLive: () => void;
  /** Stop the live session timer; samples remain in state for summary view. */
  stopLive: () => { samples: LiveHRSample[]; durationSecs: number };
  /** Discard any live session state and close the overlay. */
  endLive: () => void;
}

const HeartRateContext = createContext<HeartRateContextValue | null>(null);

const INITIAL_LIVE: LiveSessionState = {
  open: false,
  active: false,
  workoutName: "Workout",
  startedAt: 0,
  samples: [],
};

export function HeartRateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<HeartRateState>({
    connected: false,
    connecting: false,
    deviceName: null,
    bpm: 0,
    error: null,
  });

  const deviceRef = useRef<any>(null);
  const characteristicRef = useRef<any>(null);
  const samplesRef = useRef<HRSample[]>([]);
  const [recording, setRecording] = useState(false);
  const recordingRef = useRef(false);

  // ── Live overlay session ─────────────────────────────────────────────────
  const [live, setLive] = useState<LiveSessionState>(INITIAL_LIVE);
  const [liveElapsed, setLiveElapsed] = useState(0);
  const liveActiveRef = useRef(false);
  const liveStartedAtRef = useRef(0);
  const bpmRef = useRef(0);
  const tickIntervalRef = useRef<number | null>(null);
  const sampleIntervalRef = useRef<number | null>(null);

  const isSupported = typeof navigator !== "undefined" && "bluetooth" in (navigator as any);

  const handleHRMeasurement = useCallback((event: Event) => {
    const value = (event.target as any)?.value;
    if (!value) return;
    const flags = value.getUint8(0);
    const is16Bit = flags & 0x1;
    const bpm = is16Bit ? value.getUint16(1, true) : value.getUint8(1);
    setState(prev => ({ ...prev, bpm }));
    bpmRef.current = bpm;
    if (recordingRef.current && bpm > 0) {
      samplesRef.current.push({ t: Date.now(), bpm });
    }
  }, []);

  // Legacy inline-path session API
  const startSession = useCallback(() => {
    samplesRef.current = [];
    recordingRef.current = true;
    setRecording(true);
  }, []);

  const endSession = useCallback((hrMax = 190): HRZoneSummary | null => {
    recordingRef.current = false;
    setRecording(false);
    const summary = summariseSamples(samplesRef.current, hrMax);
    samplesRef.current = [];
    return summary;
  }, []);

  // ── Live overlay control ────────────────────────────────────────────────
  const openLive = useCallback((workoutName?: string) => {
    setLive(prev => ({
      ...prev,
      open: true,
      // Only overwrite the name when a new one is provided AND we aren't mid-session.
      workoutName: !prev.active && workoutName ? workoutName : prev.workoutName,
    }));
  }, []);

  const minimizeLive = useCallback(() => {
    setLive(prev => ({ ...prev, open: false }));
  }, []);

  const restoreLive = useCallback(() => {
    setLive(prev => ({ ...prev, open: true }));
  }, []);

  const startLive = useCallback(() => {
    const now = Date.now();
    liveStartedAtRef.current = now;
    liveActiveRef.current = true;
    setLiveElapsed(0);
    setLive(prev => ({ ...prev, active: true, startedAt: now, samples: [] }));
  }, []);

  const stopLive = useCallback(() => {
    liveActiveRef.current = false;
    const startedAt = liveStartedAtRef.current || Date.now();
    const durationSecs = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
    let snapshot: LiveHRSample[] = [];
    setLive(prev => {
      snapshot = prev.samples;
      return { ...prev, active: false };
    });
    return { samples: snapshot, durationSecs };
  }, []);

  const endLive = useCallback(() => {
    liveActiveRef.current = false;
    liveStartedAtRef.current = 0;
    setLiveElapsed(0);
    setLive(INITIAL_LIVE);
  }, []);

  // Ticker + sampler effect — runs whenever `live.active` changes
  useEffect(() => {
    if (!live.active) {
      if (tickIntervalRef.current) { clearInterval(tickIntervalRef.current); tickIntervalRef.current = null; }
      if (sampleIntervalRef.current) { clearInterval(sampleIntervalRef.current); sampleIntervalRef.current = null; }
      return;
    }
    // 1Hz ticker
    tickIntervalRef.current = window.setInterval(() => {
      const start = liveStartedAtRef.current;
      if (!start) return;
      setLiveElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    // 2s sampler
    const pushSample = () => {
      const bpm = bpmRef.current;
      if (bpm <= 0) return;
      const start = liveStartedAtRef.current;
      const t = start ? Math.floor((Date.now() - start) / 1000) : 0;
      setLive(prev => ({ ...prev, samples: [...prev.samples, { time: t, bpm }] }));
    };
    pushSample();
    sampleIntervalRef.current = window.setInterval(pushSample, 2000);
    return () => {
      if (tickIntervalRef.current) { clearInterval(tickIntervalRef.current); tickIntervalRef.current = null; }
      if (sampleIntervalRef.current) { clearInterval(sampleIntervalRef.current); sampleIntervalRef.current = null; }
    };
  }, [live.active]);

  const connect = useCallback(async () => {
    if (!isSupported) {
      setState(prev => ({ ...prev, error: "Bluetooth not supported in this browser." }));
      return;
    }

    setState(prev => ({ ...prev, connecting: true, error: null }));

    try {
      const nav = navigator as any;
      const device = await nav.bluetooth.requestDevice({
        filters: [{ services: ["heart_rate"] }],
      });

      deviceRef.current = device;

      device.addEventListener("gattserverdisconnected", () => {
        setState(prev => ({ ...prev, connected: false, bpm: 0, deviceName: null }));
      });

      const server = await device.gatt!.connect();
      const service = await server.getPrimaryService("heart_rate");
      const characteristic = await service.getCharacteristic("heart_rate_measurement");

      characteristicRef.current = characteristic;
      await characteristic.startNotifications();
      characteristic.addEventListener("characteristicvaluechanged", handleHRMeasurement);

      setState({
        connected: true,
        connecting: false,
        deviceName: device.name || "Heart Rate Monitor",
        bpm: 0,
        error: null,
      });
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        connecting: false,
        error: err.message?.includes("cancelled") ? null : "Could not connect. Please try again.",
      }));
    }
  }, [isSupported, handleHRMeasurement]);

  const disconnect = useCallback(() => {
    if (characteristicRef.current) {
      try {
        characteristicRef.current.removeEventListener("characteristicvaluechanged", handleHRMeasurement);
        characteristicRef.current.stopNotifications();
      } catch {}
    }
    if (deviceRef.current?.gatt?.connected) {
      deviceRef.current.gatt.disconnect();
    }
    setState({ connected: false, connecting: false, deviceName: null, bpm: 0, error: null });
  }, [handleHRMeasurement]);

  // Do NOT disconnect on unmount — this is the global provider
  // The connection persists across navigation

  return (
    <HeartRateContext.Provider
      value={{
        ...state,
        connect,
        disconnect,
        isSupported,
        startSession,
        endSession,
        recording,
        live,
        liveElapsed,
        openLive,
        minimizeLive,
        restoreLive,
        startLive,
        stopLive,
        endLive,
      }}
    >
      {children}
    </HeartRateContext.Provider>
  );
}

export function useGlobalHeartRate() {
  const ctx = useContext(HeartRateContext);
  if (!ctx) throw new Error("useGlobalHeartRate must be used within HeartRateProvider");
  return ctx;
}
