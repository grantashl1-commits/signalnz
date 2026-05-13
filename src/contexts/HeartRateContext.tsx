import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from "react";
import { summariseSamples, type HRSample, type HRZoneSummary } from "@/lib/hr-zones";

interface HeartRateState {
  connected: boolean;
  connecting: boolean;
  deviceName: string | null;
  bpm: number;
  error: string | null;
}

interface HeartRateContextValue extends HeartRateState {
  connect: () => Promise<void>;
  disconnect: () => void;
  isSupported: boolean;
  /** Begin recording bpm samples for a workout. */
  startSession: () => void;
  /** Stop recording and return a zone summary (or null if no samples). */
  endSession: (hrMax?: number) => HRZoneSummary | null;
  /** True while a session is being recorded. */
  recording: boolean;
}

const HeartRateContext = createContext<HeartRateContextValue | null>(null);

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

  const isSupported = typeof navigator !== "undefined" && "bluetooth" in (navigator as any);

  const handleHRMeasurement = useCallback((event: Event) => {
    const value = (event.target as any)?.value;
    if (!value) return;
    const flags = value.getUint8(0);
    const is16Bit = flags & 0x1;
    const bpm = is16Bit ? value.getUint16(1, true) : value.getUint8(1);
    setState(prev => ({ ...prev, bpm }));
    if (recordingRef.current && bpm > 0) {
      samplesRef.current.push({ t: Date.now(), bpm });
    }
  }, []);

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
    <HeartRateContext.Provider value={{ ...state, connect, disconnect, isSupported, startSession, endSession, recording }}>
      {children}
    </HeartRateContext.Provider>
  );
}

export function useGlobalHeartRate() {
  const ctx = useContext(HeartRateContext);
  if (!ctx) throw new Error("useGlobalHeartRate must be used within HeartRateProvider");
  return ctx;
}
