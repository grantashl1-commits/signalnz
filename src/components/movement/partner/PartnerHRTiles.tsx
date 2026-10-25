import { Bluetooth, BluetoothOff, Heart, Loader2 } from "lucide-react";
import { getZoneForBPM } from "@/data/workouts";
import { BLUETOOTH_UNSUPPORTED_MESSAGE, type StrapSlot, type StrapState } from "@/hooks/useMultiHeartRate";

/**
 * Semantic five-zone palette shared with the light class theme.
 */
export const ZONE_COLOURS: Record<number, string> = {
  1: "hsl(var(--hr-zone-1))",
  2: "hsl(var(--hr-zone-2))",
  3: "hsl(var(--hr-zone-3))",
  4: "hsl(var(--hr-zone-4))",
  5: "hsl(var(--hr-zone-5))",
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
  const busy = strap.connecting || strap.reconnecting;
  const status = strap.reconnecting
    ? "Reconnecting…"
    : strap.connecting
      ? "Connecting…"
      : strap.connected
        ? strap.bpm ? strap.deviceName : strap.lastAt ? "No signal: check the strap is on and damp" : "Waiting for a beat…"
        : null;

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
      disabled={!isSupported || busy}
      aria-label={`Connect ${name}'s heart-rate strap`}
      style={!isSupported ? { opacity: 0.5 } : undefined}
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bluetooth className="h-4 w-4" />} Connect strap
    </button>
  );

  if (variant === "mini") {
    return (
      <div className="pc-hr p-3" data-testid={`hr-tile-${slot}`}>
        {colour && <div className="pc-hr-fill" data-zone={zone?.zone} />}
        <div className="relative flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="pc-caps truncate text-sm">{name}</p>
            <p className="pc-num text-2xl font-extrabold leading-none">{bpmText}<span className="ml-1 text-xs font-semibold">bpm</span></p>
            <p className="text-xs">{zone ? `Z${zone.zone} ${zone.label} · ${pct}%` : status ?? "No strap"}</p>
          </div>
          {!strap.connected && isSupported && (
            <button
              type="button"
              className="pc-btn pc-btn-icon"
              onClick={() => onConnect(slot)}
              disabled={busy}
              aria-label={`Connect ${name}'s heart-rate strap`}
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bluetooth className="h-4 w-4" />}
            </button>
          )}
        </div>
        {strap.error && <p className="relative mt-1.5 text-xs text-destructive" role="status">{strap.error}</p>}
      </div>
    );
  }

  if (variant === "strip") {
    return (
      <div className="pc-hr flex items-center gap-4 px-4 py-3" data-testid={`hr-tile-${slot}`}>
        {colour && <div className="pc-hr-fill" data-zone={zone?.zone} />}
        <div className="relative min-w-0 flex-1">
          <p className="pc-hr-name truncate">{name}</p>
          <p className="pc-sub truncate">{zone ? `Zone ${zone.zone} · ${zone.label} · ${pct}% of max` : strap.error ?? status ?? `Max HR ${maxHR}`}</p>
        </div>
        <p className="pc-hr-bpm pc-num relative flex items-center gap-2">
          {live && <Heart className="h-7 w-7 fill-current motion-safe:animate-pulse" aria-hidden="true" />}
          {bpmText}
          <span className="pc-sub font-semibold">bpm</span>
        </p>
        <div className="relative text-right">
          <p className="pc-num text-3xl font-extrabold leading-none">{effortMinutes}</p>
          <p className="pc-sub">effort min</p>
        </div>
        {isSupported && <div className="relative">{connectButton}</div>}
      </div>
    );
  }

  return (
    <div className="pc-hr flex min-h-0 flex-col p-4 sm:p-6 lg:p-10" data-testid={`hr-tile-${slot}`}>
      {colour && <div className="pc-hr-fill" data-zone={zone?.zone} />}
      <div className="relative flex items-start justify-between gap-3">
        <p className="pc-hr-name truncate">{name}</p>
        {zone && <span className="pc-caps pc-sub shrink-0 rounded-full bg-card px-3 py-1">Zone {zone.zone} · {zone.label}</span>}
      </div>
      <div className="relative mt-3 flex flex-1 items-end justify-between gap-4 sm:mt-6">
        <div>
          <p className="pc-hr-bpm pc-num flex items-center gap-2">
            {live && <Heart className="h-10 w-10 fill-current motion-safe:animate-pulse sm:h-12 sm:w-12 lg:h-20 lg:w-20" aria-hidden="true" />}
            {bpmText}
          </p>
          <p className="pc-sub mt-1 font-semibold">{live ? `${pct}% of max (${maxHR})` : status ?? `Max HR ${maxHR}`}</p>
        </div>
        <div className="text-right">
          <p className="pc-num text-4xl font-extrabold leading-none sm:text-5xl lg:text-7xl">{effortMinutes}</p>
          <p className="pc-sub">effort min<span className="sr-only"> (zone 3 and above)</span></p>
        </div>
      </div>
      <div className="relative mt-3 flex flex-wrap items-center justify-between gap-2 sm:mt-6">
        <p className="pc-sub min-w-0 flex-1">{strap.error ?? (strap.connected ? strap.deviceName : "Works fine without a strap")}</p>
        {isSupported && connectButton}
      </div>
    </div>
  );
}

export function BluetoothNotice({ isSupported }: { isSupported: boolean }) {
  if (isSupported) return null;
  return <p className="pc-sub pc-muted" role="note">{BLUETOOTH_UNSUPPORTED_MESSAGE}</p>;
}
