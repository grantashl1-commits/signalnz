/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Up to two Bluetooth heart-rate straps at once (partner A and partner B),
 * using the standard Heart Rate Service (0x180D) and Heart Rate Measurement
 * characteristic (0x2A37). Each strap gets one automatic reconnect attempt
 * after an unexpected drop; everything is released on unmount.
 */
import { useCallback, useEffect, useRef, useState } from "react";

export type StrapSlot = "A" | "B";

export interface StrapState {
  connected: boolean;
  connecting: boolean;
  reconnecting: boolean;
  deviceName: string | null;
  bpm: number;
  error: string | null;
}

export const BLUETOOTH_UNSUPPORTED_MESSAGE =
  "Heart-rate straps connect in Chrome on Android, Windows, Mac or Chromebook. iPhone Safari can't connect to Bluetooth from a web page yet.";

const INITIAL: StrapState = { connected: false, connecting: false, reconnecting: false, deviceName: null, bpm: 0, error: null };

/** Parse a 0x2A37 Heart Rate Measurement value: bit 0 of the flags selects an 8- or 16-bit BPM. */
export function parseHeartRateMeasurement(value: DataView): number {
  const flags = value.getUint8(0);
  return flags & 0x01 ? value.getUint16(1, true) : value.getUint8(1);
}

interface StrapRefs {
  device: any | null;
  characteristic: any | null;
  manual: boolean;
  retried: boolean;
  onValue: ((e: Event) => void) | null;
  onDisconnect: (() => void) | null;
}

const emptyRefs = (): StrapRefs => ({ device: null, characteristic: null, manual: false, retried: false, onValue: null, onDisconnect: null });

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
    r.onValue = (event: Event) => {
      const value = (event.target as any)?.value as DataView | undefined;
      if (!value || value.byteLength < 2) return;
      patch(slot, { bpm: parseHeartRateMeasurement(value) });
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
      r.retried = false;
      r.onDisconnect = () => {
        const cur = refs.current[slot];
        if (cur.manual || cur.device !== device) return;
        patch(slot, { connected: false, bpm: 0 });
        if (cur.retried) { patch(slot, { reconnecting: false, error: "Strap disconnected. Tap Connect strap to pair it again." }); return; }
        cur.retried = true;
        patch(slot, { reconnecting: true });
        subscribe(slot)
          .then(() => { cur.retried = false; patch(slot, { connected: true, reconnecting: false, error: null }); })
          .catch(() => patch(slot, { reconnecting: false, error: "Strap disconnected. Tap Connect strap to pair it again." }));
      };
      device.addEventListener("gattserverdisconnected", r.onDisconnect);
      await subscribe(slot);
      patch(slot, { connected: true, connecting: false, reconnecting: false, deviceName: device.name || "Heart-rate strap", bpm: 0, error: null });
    } catch (err: any) {
      const cancelled = err?.name === "NotFoundError" || /cancel/i.test(err?.message ?? "");
      patch(slot, { connecting: false, error: cancelled ? null : "Couldn't connect. Wake the strap (moisten the pads) and try again." });
    }
  }, [isSupported, patch, release, subscribe]);

  const disconnect = useCallback((slot: StrapSlot) => {
    release(slot);
    patch(slot, { ...INITIAL });
  }, [patch, release]);

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
