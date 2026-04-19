import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from "react";
import { connectNativeHR, isNative, type HRConnection } from "@/lib/native-hr";

interface HeartRateState {
  connected: boolean;
  connecting: boolean;
  deviceName: string | null;
  bpm: number;
  error: string | null;
}

/**
 * Global session state — the active workout timer + sample log lives here so it
 * survives navigation between pages, page scrolls, and modal toggles.
 */
export interface HRSession {
  running: boolean;
  startedAt: number; // Date.now() at session start (0 if never started)
  elapsedAtStart: number; // Elapsed seconds when start was last pressed (resume support)
  /** Sampled bpm trace, recorded every 2 seconds while running. */
  hrData: { time: number; bpm: number }[];
  /** Optional label of the workout that was running when the session started. */
  workoutName: string | null;
}

interface HeartRateContextValue extends HeartRateState {
  connect: () => Promise<void>;
  disconnect: () => void;
  isSupported: boolean;
  /** Current elapsed seconds — re-computed from `startedAt` so it advances every render tick. */
  session: HRSession;
  elapsed: number;
  startSession: (workoutName?: string) => void;
  stopSession: () => HRSession;
  resetSession: () => void;
}

const HeartRateContext = createContext<HeartRateContextValue | null>(null);

const initialSession: HRSession = {
  running: false,
  startedAt: 0,
  elapsedAtStart: 0,
  hrData: [],
  workoutName: null,
};

export function HeartRateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<HeartRateState>({
    connected: false,
    connecting: false,
    deviceName: null,
    bpm: 0,
    error: null,
  });

  const [session, setSession] = useState<HRSession>(initialSession);
  const [elapsed, setElapsed] = useState(0);

  const deviceRef = useRef<any>(null);
  const characteristicRef = useRef<any>(null);
  const nativeRef = useRef<HRConnection | null>(null);
  const bpmRef = useRef<number>(0);
  const sessionRef = useRef<HRSession>(initialSession);
  const tickRef = useRef<number | null>(null);
  const sampleRef = useRef<number | null>(null);

  useEffect(() => { sessionRef.current = session; }, [session]);
  useEffect(() => { bpmRef.current = state.bpm; }, [state.bpm]);

  // Native (iOS/Android) is always supported via the Capacitor BLE plugin.
  // On the web we fall back to navigator.bluetooth (Chromium-based browsers only).
  const isSupported = isNative()
    || (typeof navigator !== "undefined" && "bluetooth" in (navigator as any));

  const handleHRMeasurement = useCallback((event: Event) => {
    const value = (event.target as any)?.value;
    if (!value) return;
    const flags = value.getUint8(0);
    const is16Bit = flags & 0x1;
    const bpm = is16Bit ? value.getUint16(1, true) : value.getUint8(1);
    setState(prev => ({ ...prev, bpm }));
  }, []);

  const connect = useCallback(async () => {
    if (!isSupported) {
      setState(prev => ({ ...prev, error: "Bluetooth not supported on this device." }));
      return;
    }

    setState(prev => ({ ...prev, connecting: true, error: null }));

    // ── Native path (iOS/Android) — keeps streaming when backgrounded ──
    if (isNative()) {
      try {
        const handle = await connectNativeHR(
          (bpm) => setState(prev => ({ ...prev, bpm })),
          () => setState(prev => ({ ...prev, connected: false, bpm: 0, deviceName: null })),
        );
        nativeRef.current = handle;
        setState({
          connected: true,
          connecting: false,
          deviceName: handle.deviceName,
          bpm: 0,
          error: null,
        });
      } catch (err: any) {
        const msg = String(err?.message || err);
        setState(prev => ({
          ...prev,
          connecting: false,
          error: msg.toLowerCase().includes("cancel") ? null : "Could not connect. Please try again.",
        }));
      }
      return;
    }

    // ── Web Bluetooth fallback ──
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
    if (nativeRef.current) {
      nativeRef.current.disconnect().catch(() => {});
      nativeRef.current = null;
    }
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

  // ── Session timer (runs at the provider level so it persists across pages) ──
  useEffect(() => {
    if (!session.running) {
      if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
      return;
    }
    const tick = () => {
      const s = sessionRef.current;
      if (!s.running || s.startedAt === 0) return;
      const next = s.elapsedAtStart + Math.floor((Date.now() - s.startedAt) / 1000);
      setElapsed(next);
    };
    tick();
    tickRef.current = window.setInterval(tick, 1000);
    return () => {
      if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
    };
  }, [session.running]);

  // ── HR sampler (runs at the provider level so samples accumulate across pages) ──
  useEffect(() => {
    if (!session.running) {
      if (sampleRef.current) { clearInterval(sampleRef.current); sampleRef.current = null; }
      return;
    }
    const addSample = () => {
      const bpm = bpmRef.current;
      if (bpm <= 0) return;
      const s = sessionRef.current;
      const secsFromStart = s.startedAt > 0
        ? s.elapsedAtStart + Math.floor((Date.now() - s.startedAt) / 1000)
        : s.elapsedAtStart;
      setSession(prev => ({ ...prev, hrData: [...prev.hrData, { time: secsFromStart, bpm }] }));
    };
    addSample();
    sampleRef.current = window.setInterval(addSample, 2000);
    return () => {
      if (sampleRef.current) { clearInterval(sampleRef.current); sampleRef.current = null; }
    };
  }, [session.running]);

  const startSession = useCallback((workoutName?: string) => {
    setSession({
      running: true,
      startedAt: Date.now(),
      elapsedAtStart: 0,
      hrData: [],
      workoutName: workoutName ?? sessionRef.current.workoutName ?? null,
    });
    setElapsed(0);
  }, []);

  const stopSession = useCallback((): HRSession => {
    const final: HRSession = { ...sessionRef.current, running: false };
    setSession(final);
    return final;
  }, []);

  const resetSession = useCallback(() => {
    setSession(initialSession);
    setElapsed(0);
  }, []);

  // Do NOT disconnect on unmount — this is the global provider
  // The connection persists across navigation

  return (
    <HeartRateContext.Provider value={{
      ...state,
      connect, disconnect, isSupported,
      session, elapsed,
      startSession, stopSession, resetSession,
    }}>
      {children}
    </HeartRateContext.Provider>
  );
}

export function useGlobalHeartRate() {
  const ctx = useContext(HeartRateContext);
  if (!ctx) throw new Error("useGlobalHeartRate must be used within HeartRateProvider");
  return ctx;
}
