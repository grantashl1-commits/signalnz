import { Bluetooth, BluetoothOff, Heart, Loader2 } from "lucide-react";
import { getZoneForBPM } from "@/data/workouts";
import { BLUETOOTH_UNSUPPORTED_MESSAGE, type StrapSlot, type StrapState } from "@/hooks/useMultiHeartRate";

/** Vivid 5-zone palette that reads on a dark TV screen (grey → blue → green → amber → red). */
export const ZONE_COLOURS: Record<number, string> = {
  1: "#8a9bb0",
  2: "#3ba7ff",
  3: "#22c55e",
  4: "#ffb020",
  5: "#ff4d4f",
};

export interface PartnerHRInfo {
  slot: StrapSlot;
  name: string;
  strap: StrapState;
  maxHR: number;
  effortMinutes: number;
}

interface TileProps extends PartnerHRInfo {
  variant: "strip" | "screen" | "mini";
  isSupported: boolean;
  onConnect: (slot: StrapSlot) => void;
  onDisconnect: (slot: StrapSlot) => void;
}

export function PartnerHRTile({ slot, name, strap, maxHR, effortMinutes, variant, isSupported, onConnect, onDisconnect }: TileProps) {
  const live = strap.connected && strap.bpm > 0;
  const zone = live ? getZoneForBPM(strap.bpm, maxHR) : null;
  const pct = live ? Math.round((strap.bpm / maxHR) * 100) : null;
  const colour = zone ? ZONE_COLOURS[zone.zone] : undefined;
  const status = strap.reconnecting ? "Reconnecting…" : strap.connecting ? "Connecting…" : strap.connected ? (strap.bpm ? strap.deviceName : "Waiting for a beat…") : null;

  const bpmText = live ? strap.bpm : <span className="pc-hr-empty">--</span>;

  const connectButton = strap.connected ? (
    <button type="button" className="pc-btn text-sm" onClick={() => onDisconnect(slot)} aria-label={`Disconnect ${name}'s strap`}>
      <BluetoothOff className="h-4 w-4" /> Disconnect
    </button>
  ) : (
    <button
      type="button"
      className="pc-btn text-sm"
      onClick={() => onConnect(slot)}
      disabled={!isSupported || strap.connecting || strap.reconnecting}
      aria-label={`Connect ${name}'s heart-rate strap`}
      style={!isSupported ? { opacity: 0.5 } : undefined}
    >
      {strap.connecting || strap.reconnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bluetooth className="h-4 w-4" />} Connect strap
    </button>
  );

  if (variant === "mini") {
    return (
      <div className="pc-hr p-3" data-testid={`hr-tile-${slot}`}>
        {colour && <div className="pc-hr-fill" style={{ background: `linear-gradient(135deg, ${colour}, ${colour}99)` }} />}
        <div className="relative flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="pc-caps truncate text-sm">{name}</p>
            <p className="pc-num text-2xl font-extrabold leading-none">{bpmText}<span className="ml-1 text-xs font-semibold opacity-80">bpm</span></p>
            <p className="text-xs opacity-80">{zone ? `Z${zone.zone} ${zone.label} · ${pct}%` : status ?? "No strap"}</p>
          </div>
          {!strap.connected && isSupported && (
            <button type="button" className="pc-btn pc-btn-icon" onClick={() => onConnect(slot)} aria-label={`Connect ${name}'s heart-rate strap`}>
              {strap.connecting || strap.reconnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bluetooth className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (variant === "strip") {
    return (
      <div className="pc-hr flex items-center gap-4 px-4 py-3" data-testid={`hr-tile-${slot}`}>
        {colour && <div className="pc-hr-fill" style={{ background: `linear-gradient(120deg, ${colour}, ${colour}b3 70%, ${colour}80)` }} />}
        <div className="relative min-w-0 flex-1">
          <p className="pc-hr-name truncate">{name}</p>
          <p className="pc-sub truncate opacity-90">{zone ? `Zone ${zone.zone} · ${zone.label} · ${pct}% of max` : strap.error ?? status ?? `Max HR ${maxHR}`}</p>
        </div>
        <p className="pc-hr-bpm pc-num relative flex items-center gap-2">
          {live && <Heart className="h-7 w-7 fill-current motion-safe:animate-pulse" aria-hidden="true" />}
          {bpmText}
          <span className="pc-sub font-semibold opacity-80">bpm</span>
        </p>
        <div className="relative text-right">
          <p className="pc-num text-3xl font-extrabold leading-none">{effortMinutes}</p>
          <p className="pc-sub opacity-90">effort min</p>
        </div>
        {isSupported && <div className="relative">{connectButton}</div>}
      </div>
    );
  }

  return (
    <div className="pc-hr flex flex-col p-6 lg:p-10" data-testid={`hr-tile-${slot}`}>
      {colour && <div className="pc-hr-fill" style={{ background: `linear-gradient(140deg, ${colour}, ${colour}b3 70%, ${colour}80)` }} />}
      <div className="relative flex items-start justify-between gap-3">
        <p className="pc-hr-name truncate">{name}</p>
        {zone && <span className="pc-caps pc-sub shrink-0 rounded-full bg-black/25 px-3 py-1">Zone {zone.zone} · {zone.label}</span>}
      </div>
      <div className="relative mt-6 flex flex-1 items-end justify-between gap-4">
        <div>
          <p className="pc-hr-bpm pc-num flex items-center gap-2">
            {live && <Heart className="h-12 w-12 fill-current motion-safe:animate-pulse lg:h-20 lg:w-20" aria-hidden="true" />}
            {bpmText}
          </p>
          <p className="pc-sub mt-1 font-semibold opacity-90">{live ? `${pct}% of max (${maxHR})` : status ?? `Max HR ${maxHR}`}</p>
        </div>
        <div className="text-right">
          <p className="pc-num text-5xl font-extrabold leading-none lg:text-7xl">{effortMinutes}</p>
          <p className="pc-sub opacity-90">effort min<span className="sr-only"> (zone 3 and above)</span></p>
        </div>
      </div>
      <div className="relative mt-6 flex items-center justify-between gap-2">
        <p className="pc-sub truncate opacity-80">{strap.error ?? (strap.connected ? strap.deviceName : "Works fine without a strap")}</p>
        {isSupported && connectButton}
      </div>
    </div>
  );
}

export function BluetoothNotice({ isSupported }: { isSupported: boolean }) {
  if (isSupported) return null;
  return <p className="pc-sub pc-muted" role="note">{BLUETOOTH_UNSUPPORTED_MESSAGE}</p>;
}
