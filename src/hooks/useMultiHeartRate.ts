/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Up to two Bluetooth heart-rate straps at once (partner A and partner B),
 * using the standard Heart Rate Service (0x180D) and Heart Rate Measurement
 * characteristic (0x2A37). After an unexpected drop each strap retries with
 * backoff (1 s, 3 s, 8 s); a strap that stays connected but stops sending
 * beats (taken off, flat battery) drops to "no signal" after 5 s.
 * Everything is released on unmount.
 */
import { useCallback, useEffect, useRef, useState } from "react";

export type StrapSlot = "A" | "B";

export interface StrapState {
  connected: boolean;
  connecting: boolean;
  reconnecting: boolean;
  deviceName: string | null;
  bpm: number;
  /** Time of the last valid beat (ms since epoch), 0 before the first one. */
  lastAt: number;
  error: string | null;
}

export const BLUETOOTH_UNSUPPORTED_MESSAGE =
  "Heart-rate straps connect in Chrome on Android, Windows, Mac or Chromebook. iPhone Safari can't connect to Bluetooth from a web page yet.";
export const BLUETOOTH_OFF_MESSAGE = "Bluetooth is off or unavailable on this device. Turn it on, then tap Connect strap.";
const DROPPED_MESSAGE = "Strap disconnected. Tap Connect strap to pair it again.";

/** Beats older than this are treated as no signal. */
export const STRAP_STALE_MS = 5000;
const RETRY_DELAYS_MS = [1000, 3000, 8000];
const MIN_BPM = 25;
const MAX_BPM = 240;

const INITIAL: StrapState = { connected: false, connecting: false, reconnecting: false, deviceName: null, bpm: 0, lastAt: 0, error: null };

/**
 * Parse a 0x2A37 Heart Rate Measurement value: bit 0 of the flags selects an
 * 8- or 16-bit BPM. Returns null for a packet too short for its format.
 */
export function parseHeartRateMeasurement(value: DataView): number | null {
  if (value.byteLength < 2) return null;
  const flags = value.getUint8(0);
  if (flags & 0x01) return value.byteLength >= 3 ? value.getUint16(1, true) : null;
  return value.getUint8(1);
}

/** A plausible heart rate (drops sensor glitches such as 0 or 300 bpm). */
export const isPlausibleBpm = (bpm: number | null): bpm is number => bpm != null && bpm >= MIN_BPM && bpm <= MAX_BPM;

interface StrapRefs {
  device: any | null;
  characteristic: any | null;
  manual: boolean;
  onValue: ((e: Event) => void) | null;
  onDisconnect: (() => void) | null;
}

const emptyRefs = (): StrapRefs => ({ device: null, characteristic: null, manual: false, onValue: null, onDisconnect: null });
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useMultiHeartRate() {
  const [straps, setStraps] = useState<Record<StrapSlot, StrapState>>({ A: INITIAL, B: INITIAL });
  const refs = useRef<Record<StrapSlot, StrapRefs>>({ A: emptyRefs(), B: emptyRefs() });
  const mounted = useRef(true);
  const isSupported = typeof navigator !== "undefined" && "bluetooth" in navigator && !!(navigator as any).bluetooth;

  const patch = useCallback((slot: StrapSlot, next: Partial<StrapState>) => {
    if (!mounted.current) return;
    setStraps(prev => ({ ...prev, [slot]: { ...prev[slot], ...next } }));
  }, []);

  const subscribe = useCallback(async (slot: StrapSlot) => {
    const r = refs.current[slot];
    const server = await r.device.gatt.connect();
    const service = await server.getPrimaryService("heart_rate");
    const characteristic = await service.getCharacteristic("heart_rate_measurement");
    if (r.characteristic && r.onValue) {
      try { r.characteristic.removeEventListener("characteristicvaluechanged", r.onValue); } catch { /* already gone */ }
    }
    r.onValue = (event: Event) => {
      const value = (event.target as any)?.value as DataView | undefined;
      if (!value) return;
      const bpm = parseHeartRateMeasurement(value);
      if (!isPlausibleBpm(bpm)) return;
      patch(slot, { bpm, lastAt: Date.now() });
    };
    characteristic.addEventListener("characteristicvaluechanged", r.onValue);
    await characteristic.startNotifications();
    r.characteristic = characteristic;
  }, [patch]);

  const release = useCallback((slot: StrapSlot) => {
    const r = refs.current[slot];
    r.manual = true;
    try {
      if (r.characteristic && r.onValue) r.characteristic.removeEventListener("characteristicvaluechanged", r.onValue);
      r.characteristic?.stopNotifications?.().catch?.(() => {});
    } catch { /* already gone */ }
    try {
      if (r.device && r.onDisconnect) r.device.removeEventListener("gattserverdisconnected", r.onDisconnect);
      if (r.device?.gatt?.connected) r.device.gatt.disconnect();
    } catch { /* already gone */ }
    refs.current[slot] = emptyRefs();
  }, []);

  const connect = useCallback(async (slot: StrapSlot) => {
    if (!isSupported) { patch(slot, { error: BLUETOOTH_UNSUPPORTED_MESSAGE }); return; }
    patch(slot, { connecting: true, error: null });
    try {
      // requestDevice is called first so it keeps the tap's user activation.
      const device = await (navigator as any).bluetooth.requestDevice({ filters: [{ services: ["heart_rate"] }] });
      const other = refs.current[slot === "A" ? "B" : "A"].device;
      if (other && other.id === device.id) {
        patch(slot, { connecting: false, error: `That strap is already connected for partner ${slot === "A" ? "B" : "A"}.` });
        return;
      }
      release(slot);
      const r = refs.current[slot];
      r.device = device;
      r.manual = false;
      r.onDisconnect = () => {
        const cur = refs.current[slot];
        if (cur.manual || cur.device !== device) return;
        patch(slot, { connected: false, bpm: 0, reconnecting: true });
        void (async () => {
          for (const wait of RETRY_DELAYS_MS) {
            await sleep(wait);
            const now = refs.current[slot];
            if (now.manual || now.device !== device || !mounted.current) return;
            try {
              await subscribe(slot);
              patch(slot, { connected: true, reconnecting: false, error: null });
              return;
            } catch { /* try again after the next delay */ }
          }
          patch(slot, { reconnecting: false, error: DROPPED_MESSAGE });
        })();
      };
      device.addEventListener("gattserverdisconnected", r.onDisconnect);
      await subscribe(slot);
      patch(slot, { connected: true, connecting: false, reconnecting: false, deviceName: device.name || "Heart-rate strap", bpm: 0, lastAt: 0, error: null });
    } catch (err: any) {
      const message = String(err?.message ?? "");
      // Chrome reports both "user cancelled the chooser" and "adapter not available" as NotFoundError.
      const cancelled = (err?.name === "NotFoundError" || err?.name === "AbortError") && /cancel/i.test(message);
      const off = /adapter|bluetooth.*(off|unavailable|not available)|globally disabled/i.test(message);
      patch(slot, {
        connecting: false,
        error: cancelled ? null : off ? BLUETOOTH_OFF_MESSAGE : "Couldn't connect. Wake the strap (moisten the pads) and try again.",
      });
    }
  }, [isSupported, patch, release, subscribe]);

  const disconnect = useCallback((slot: StrapSlot) => {
    release(slot);
    patch(slot, { ...INITIAL });
  }, [patch, release]);

  // Watchdog: a connected strap that stops notifying goes to "no signal" instead of freezing its last beat.
  useEffect(() => {
    const id = window.setInterval(() => {
      setStraps(prev => {
        let changed = false;
        const next = { ...prev };
        (["A", "B"] as StrapSlot[]).forEach(slot => {
          const s = prev[slot];
          if (s.bpm > 0 && Date.now() - s.lastAt > STRAP_STALE_MS) { next[slot] = { ...s, bpm: 0 }; changed = true; }
        });
        return changed ? next : prev;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      release("A");
      release("B");
    };
  }, [release]);

  return { straps, connect, disconnect, isSupported };
}
