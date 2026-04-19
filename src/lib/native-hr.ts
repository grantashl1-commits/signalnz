/**
 * Native Bluetooth Heart Rate adapter.
 *
 * Uses @capacitor-community/bluetooth-le on iOS/Android so the connection
 * keeps streaming when the screen is locked or the user backgrounds the app.
 * Falls back to the Web Bluetooth API in the browser preview / PWA.
 */
import { Capacitor } from "@capacitor/core";
import { BleClient, numbersToDataView } from "@capacitor-community/bluetooth-le";

const HR_SERVICE = "0000180d-0000-1000-8000-00805f9b34fb";
const HR_MEASUREMENT = "00002a37-0000-1000-8000-00805f9b34fb";

export const isNative = () =>
  Capacitor.isNativePlatform?.() ?? Capacitor.getPlatform() !== "web";

export interface HRConnection {
  deviceName: string;
  disconnect: () => Promise<void>;
}

/** Decode a Heart Rate Measurement characteristic into BPM (handles 8/16-bit flag). */
export function decodeHrMeasurement(value: DataView): number {
  const flags = value.getUint8(0);
  const is16Bit = flags & 0x1;
  return is16Bit ? value.getUint16(1, true) : value.getUint8(1);
}

/**
 * Connect to a heart-rate monitor on a native device and start streaming
 * BPM samples to `onBpm`. Returns a handle for disconnecting later.
 */
export async function connectNativeHR(
  onBpm: (bpm: number) => void,
  onDisconnect?: () => void,
): Promise<HRConnection> {
  await BleClient.initialize({ androidNeverForLocation: true });

  const device = await BleClient.requestDevice({
    services: [HR_SERVICE],
  });

  await BleClient.connect(device.deviceId, () => {
    onDisconnect?.();
  });

  await BleClient.startNotifications(
    device.deviceId,
    HR_SERVICE,
    HR_MEASUREMENT,
    (value) => {
      try {
        const bpm = decodeHrMeasurement(value);
        if (bpm > 0) onBpm(bpm);
      } catch {
        // ignore malformed packets
      }
    },
  );

  return {
    deviceName: device.name || "Heart Rate Monitor",
    disconnect: async () => {
      try {
        await BleClient.stopNotifications(device.deviceId, HR_SERVICE, HR_MEASUREMENT);
      } catch {}
      try {
        await BleClient.disconnect(device.deviceId);
      } catch {}
    },
  };
}

// Re-export for callers that want raw helpers
export { numbersToDataView };
