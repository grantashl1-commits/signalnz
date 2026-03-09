import { useState } from "react";
import { MOCK_GROUPS, type CommunityGroup } from "@/data/community-data";

interface CommunityDiscoverProps {
  onJoin: (id: string) => void;
  joined: string[];
}

export default function CommunityDiscover({ onJoin, joined }: CommunityDiscoverProps) {
  const [filter, setFilter] = useState("");
  const filtered = MOCK_GROUPS.filter(
    (g) => !filter || g.suburb.toLowerCase().includes(filter.toLowerCase()) || g.city.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-3">
      {/* Vision card */}
      <div className="card-warm p-5">
        <p className="font-mono text-[11px] text-primary uppercase tracking-wider mb-1.5">the vision</p>
        <p className="font-display text-sm italic text-foreground leading-relaxed">
          As technology reshapes work, the most valuable thing we'll have is each other. Find your neighbours.
          Share your skills. Trade what you know. Build the village that's been there all along.
        </p>
      </div>

      {/* Search */}
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Search by suburb or city…"
        className="w-full px-4 py-3 rounded-full border border-border bg-card font-display text-sm italic text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 shadow-sm"
        style={{ fontSize: "16px" }}
        inputMode="search"
        autoComplete="off"
      />

      {/* Group cards */}
      {filtered.map((g) => {
        const isJoined = joined.includes(g.id);
        return (
          <div key={g.id} className="card-warm p-5">
            <div className="flex justify-between items-start mb-2 gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-xl font-bold italic text-foreground mb-0.5">{g.suburb}</h3>
                <p className="font-mono text-xs text-muted-foreground">{g.city} · {g.members} members</p>
              </div>
              {isJoined ? (
                <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-phase-follicular/10 text-phase-follicular flex-shrink-0">joined ✓</span>
              ) : (
                <button
                  onClick={() => onJoin(g.id)}
                  className="touch-btn font-display text-sm italic text-primary-foreground bg-primary rounded-full px-5 py-2 active:scale-[0.97] flex-shrink-0"
                >
                  join
                </button>
              )}
            </div>

            <p className="font-display text-[13px] italic text-muted-foreground leading-relaxed mb-3.5">{g.description}</p>

            <div className="bg-secondary/50 rounded-xl p-3.5 mb-2.5">
              <p className="font-mono text-[11px] text-primary mb-1.5">active challenges</p>
              {g.challenges.slice(0, 2).map((c, i) => (
                <p key={i} className="font-display text-[13px] italic text-foreground/70 leading-relaxed mb-1">{c}</p>
              ))}
            </div>

            {g.questions.slice(0, 2).map((q, i) => (
              <div key={i} className="flex gap-1.5 items-start mb-1">
                <span className="text-primary text-xs flex-shrink-0 mt-0.5">?</span>
                <span className="font-mono text-[11px] text-muted-foreground leading-relaxed">{q}</span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
