import type { PartnerStation } from "@/data/partner-program";
import StationArt from "./StationArt";

const BLOCK_DOT: Record<PartnerStation["block"], string> = {
  Strength: "bg-move text-background",
  Reformer: "bg-reflect text-background",
  Core: "bg-goals text-background",
};

/** Light tile for the hub preview grid (Signal member-page style). */
export function PreviewTile({ station, number, load }: { station: PartnerStation; number: number; load?: string | null }) {
  return (
    <div className="relative min-w-0 rounded-2xl border border-border bg-card p-1.5" data-testid="partner-preview-tile">
      <span className={`absolute left-2.5 top-2.5 z-10 flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[11px] font-extrabold tabular-nums ${BLOCK_DOT[station.block]}`}>
        {number}
      </span>
      <div className="aspect-square overflow-hidden rounded-xl bg-[#fbf8f3]">
        <StationArt station={station} fallbackSize={88} />
      </div>
      <p className="mt-1.5 px-0.5 text-[10.5px] font-extrabold uppercase leading-tight tracking-[0.04em] text-foreground line-clamp-2 sm:text-xs">{station.shortLabel}</p>
      <p className="px-0.5 pb-0.5 text-[10.5px] text-muted-foreground tabular-nums sm:text-xs">{station.reps}{load ? ` · ${load}` : ""}</p>
    </div>
  );
}

interface ClassTileProps {
  station: PartnerStation;
  number: number;
  active?: boolean;
  done?: boolean;
  workerName?: string;
  /** Planned load for the week, e.g. "10 kg dumbbells". */
  load?: string | null;
  onSelect?: () => void;
}

/** TV-wall tile used inside class mode (styles in class-mode.css). */
export function ClassTile({ station, number, active = false, done = false, workerName, load, onSelect }: ClassTileProps) {
  const Wrapper = onSelect ? "button" : "div";
  return (
    <Wrapper
      type={onSelect ? "button" : undefined}
      onClick={onSelect}
      className="pc-tile text-left"
      data-active={active}
      data-done={done && !active}
      data-block={station.block}
      aria-current={active ? "step" : undefined}
      aria-label={`Station ${number}: ${station.name}, ${station.reps}`}
    >
      <div className="pc-art relative min-h-0 flex-1">
        <StationArt station={station} animate={active} fallbackSize={120} />
        <span className="pc-badge pc-num absolute left-1.5 top-1.5">{number}</span>
        {active && workerName && <span className="pc-worker-pill absolute right-1.5 top-1.5 max-w-[70%] truncate">{workerName}</span>}
      </div>
      <p className="pc-caps pc-tile-label mt-1.5 truncate">{station.shortLabel}</p>
      <p className="pc-tile-reps pc-muted pc-num truncate">{station.reps}{load ? ` · ${load}` : ""}</p>
    </Wrapper>
  );
}
