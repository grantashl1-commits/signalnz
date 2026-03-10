import { useState } from "react";
import { MOCK_NEARBY, type NearbyUser } from "@/data/community-data";
import { HandDrawnLeaf, HandDrawnLock } from "@/components/BotanicalElements";

function Avatar({ initials, size = 34, color = "hsl(var(--primary))", online }: { initials: string; size?: number; color?: string; online?: boolean }) {
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <div
        className="rounded-full flex items-center justify-center"
        style={{ width: size, height: size, background: `${color}22`, border: `1.5px solid ${color}40` }}
      >
        <span className="font-mono font-bold" style={{ fontSize: size * 0.33, color }}>{initials}</span>
      </div>
      {online !== undefined && (
        <div
          className="absolute bottom-[1px] right-[1px] rounded-full border-2 border-background"
          style={{ width: size * 0.28, height: size * 0.28, background: online ? "hsl(var(--phase-follicular))" : "hsl(var(--muted))" }}
        />
      )}
    </div>
  );
}

interface NearbyViewProps {
  locationEnabled: boolean;
  onRequestLocation: () => void;
  onToggleLocation?: () => void;
}

export default function NearbyView({ locationEnabled, onRequestLocation, onToggleLocation }: NearbyViewProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [connectSent, setConnectSent] = useState<string[]>([]);
  const [filterSuburb, setFilterSuburb] = useState("all");

  const suburbs = ["all", ...Array.from(new Set(MOCK_NEARBY.map((u) => u.suburb)))];
  const filtered = filterSuburb === "all" ? MOCK_NEARBY : MOCK_NEARBY.filter((u) => u.suburb === filterSuburb);

  if (!locationEnabled) {
    return (
      <div>
        <div className="relative rounded-2xl overflow-hidden mb-4">
          <div className="blur-md opacity-50 pointer-events-none">
            <div className="grid grid-cols-2 gap-2.5">
              {MOCK_NEARBY.slice(0, 4).map((u) => (
                <div key={u.id} className="card-warm p-3.5">
                  <Avatar initials={u.avatar} size={36} color={u.color} online={u.online} />
                  <p className="font-display text-[15px] italic text-foreground mt-2">{u.name}</p>
                  <p className="font-mono text-[11px] text-muted-foreground">{u.suburb}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
            <HandDrawnLeaf size={40} color="hsl(var(--primary))" className="mb-2.5" />
            <h3 className="font-display text-xl font-bold italic text-foreground mb-1.5 text-center">Your neighbours are here.</h3>
            <p className="font-mono text-xs text-muted-foreground text-center mb-4 leading-relaxed">
              Enable nearby to see who else is using the app in your area.
            </p>
            <button onClick={onRequestLocation} className="touch-btn font-display text-[15px] italic text-primary-foreground bg-primary rounded-full px-7 py-3 active:scale-[0.97]">
              Enable nearby
            </button>
          </div>
        </div>

        <div className="card-warm p-4">
          <p className="font-mono text-[11px] text-primary mb-1.5">Your privacy</p>
          <p className="font-display text-[13px] italic text-foreground leading-relaxed">
            Nearby uses suburb-level location only. We never pinpoint your home, track your movements, or share your exact address.
            Think of it like saying "I'm in Ponsonby" — not "I'm at 42 Brown Street."
          </p>
        </div>
      </div>
    );
  }

  // Expanded profile
  if (selected) {
    const u = MOCK_NEARBY.find((x) => x.id === selected)!;
    const sent = connectSent.includes(u.id);
    return (
      <div>
        <button onClick={() => setSelected(null)} className="touch-btn font-mono text-xs text-muted-foreground mb-3.5 active:scale-[0.97] min-h-[44px]">Back to nearby</button>
        <div className="card-warm p-5">
          <div className="flex gap-3.5 items-center mb-4">
            <Avatar initials={u.avatar} size={52} color={u.color} online={u.online} />
            <div className="min-w-0">
              <h3 className="font-display text-[22px] font-bold italic text-foreground">{u.name}</h3>
              <p className="font-mono text-xs text-muted-foreground">{u.suburb} · {u.distance}</p>
              {u.online && <p className="font-mono text-[11px] text-phase-follicular mt-0.5">Active now</p>}
            </div>
          </div>

          <div className="bg-secondary/50 rounded-xl p-3.5 mb-3.5">
            <p className="font-mono text-[10px] text-primary mb-1.5">What they offer</p>
            <p className="font-display text-[15px] italic text-foreground leading-relaxed">{u.offering}</p>
          </div>

          <div className="mb-4">
            <p className="font-mono text-[10px] text-muted-foreground mb-2">Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {u.skills.map((s) => (
                <span key={s} className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-phase-follicular/10 text-phase-follicular">{s}</span>
              ))}
            </div>
          </div>

          <div className="card-warm p-3.5 mb-4 bg-amber-50 border-amber-200/30">
            <p className="font-mono text-[10px] text-primary mb-1">Privacy note</p>
            <p className="font-mono text-[11px] text-foreground/60 leading-relaxed">
              You can see {u.name.split(" ")[0]} is in {u.suburb}. That's all the location information shared. Meeting up is entirely your choice.
            </p>
          </div>

          <button
            onClick={() => setConnectSent((c) => [...c, u.id])}
            disabled={sent}
            className={`touch-btn w-full py-3.5 rounded-[14px] font-display text-base italic active:scale-[0.97] ${
              sent ? "bg-phase-follicular/10 text-phase-follicular" : "bg-primary text-primary-foreground"
            }`}
          >
            {sent ? "Connection request sent" : `Connect with ${u.name.split(" ")[0]}`}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Privacy reminder */}
      <div className="flex items-center gap-2 bg-phase-follicular/10 rounded-[10px] px-3 py-2.5 mb-4">
        <HandDrawnLock size={16} color="hsl(var(--phase-follicular))" />
        <span className="font-mono text-[11px] text-phase-follicular flex-1">Showing suburb-level only · your address is never visible</span>
        <button onClick={onToggleLocation} className="touch-btn font-mono text-[10px] text-muted-foreground">Turn off</button>
      </div>

      {/* Schematic suburb map */}
      <div className="card-warm p-4 mb-4 bg-secondary/50">
        <p className="font-mono text-[11px] text-primary mb-2.5">People near you · Auckland</p>
        <div className="relative h-[140px]">
          {[
            { label: "Ponsonby", x: "30%", y: "35%", count: MOCK_NEARBY.filter((u) => u.suburb === "Ponsonby").length },
            { label: "Grey Lynn", x: "18%", y: "55%", count: MOCK_NEARBY.filter((u) => u.suburb === "Grey Lynn").length },
            { label: "Newmarket", x: "60%", y: "50%", count: MOCK_NEARBY.filter((u) => u.suburb === "Newmarket").length },
          ].map((zone) => (
            <button
              key={zone.label}
              onClick={() => setFilterSuburb(zone.label === filterSuburb ? "all" : zone.label)}
              className="touch-btn absolute -translate-x-1/2 -translate-y-1/2 bg-transparent border-none text-center"
              style={{ left: zone.x, top: zone.y }}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-0.5 transition-all ${
                  filterSuburb === zone.label ? "bg-primary border-2 border-primary" : "bg-primary/15 border-2 border-primary/30"
                }`}
              >
                <span className={`font-mono text-[13px] font-bold ${filterSuburb === zone.label ? "text-primary-foreground" : "text-primary"}`}>
                  {zone.count}
                </span>
              </div>
              <span className={`font-mono text-[10px] ${filterSuburb === zone.label ? "text-foreground" : "text-muted-foreground"}`}>
                {zone.label}
              </span>
            </button>
          ))}
          <div className="absolute animate-pulse" style={{ left: "30%", top: "35%", transform: "translate(-50%,-50%)" }}>
            <div className="w-[60px] h-[60px] rounded-full bg-primary/10" />
          </div>
        </div>
        <p className="font-mono text-[10px] text-muted-foreground text-center mt-1.5">Tap a suburb to filter · zones are approximate</p>
      </div>

      {/* Suburb filter pills */}
      <div className="flex gap-1.5 mb-3.5 overflow-x-auto pb-1 scroll-snap-x">
        {suburbs.map((s) => (
          <button
            key={s}
            onClick={() => setFilterSuburb(s)}
            className={`touch-btn font-mono text-[11px] rounded-full px-3.5 py-1.5 whitespace-nowrap flex-shrink-0 border transition-all scroll-snap-item ${
              filterSuburb === s
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border"
            }`}
          >
            {s === "all" ? "Everyone" : s}
          </button>
        ))}
      </div>

      {/* Online count */}
      <div className="font-mono text-[11px] text-muted-foreground mb-3">
        <span className="inline-block w-[7px] h-[7px] rounded-full bg-phase-follicular mr-1.5" />
        {filtered.filter((u) => u.online).length} active now
        <span className="ml-3 text-muted-foreground/60">· {filtered.length} total in view</span>
      </div>

      {/* User cards grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {filtered.map((u) => (
          <button key={u.id} onClick={() => setSelected(u.id)} className="touch-card card-warm p-3.5 text-left active:scale-[0.98]">
            <div className="flex justify-between items-start mb-2">
              <Avatar initials={u.avatar} size={36} color={u.color} online={u.online} />
              <span className="font-mono text-[10px] text-muted-foreground">{u.distance}</span>
            </div>
            <p className="font-display text-[15px] italic text-foreground mb-0.5">{u.name}</p>
            <p className="font-mono text-[10px] text-muted-foreground mb-2">{u.suburb}</p>
            <div className="flex flex-wrap gap-1">
              {u.skills.slice(0, 1).map((s) => (
                <span key={s} className="font-mono text-[10px] px-2 py-[1px] rounded-full bg-phase-follicular/10 text-phase-follicular">{s}</span>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
