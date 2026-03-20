import { useState, useEffect, useCallback } from "react";
import { MapPin, Search, Loader2 } from "lucide-react";
import { MOCK_GROUPS, type CommunityGroup } from "@/data/community-data";
import { supabase } from "@/integrations/supabase/client";
import { haptic } from "@/hooks/use-mobile";

interface CommunityDiscoverProps {
  onJoin: (id: string) => void;
  joined: string[];
}

interface PlacePrediction {
  description: string;
  placeId: string;
  suburb: string;
}

export default function CommunityDiscover({ onJoin, joined }: CommunityDiscoverProps) {
  const [filter, setFilter] = useState("");
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedSuburb, setSelectedSuburb] = useState<string | null>(null);

  // Debounced Google Places search
  useEffect(() => {
    if (filter.length < 2) {
      setPredictions([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setSearching(true);
      try {
        const { data, error } = await supabase.functions.invoke("places-autocomplete", {
          body: { input: filter },
        });
        if (data?.predictions) {
          setPredictions(data.predictions);
        }
      } catch {
        // Fallback to local filter
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [filter]);

  const handleSelectSuburb = (suburb: string) => {
    haptic("light");
    setSelectedSuburb(suburb);
    setFilter(suburb);
    setPredictions([]);
  };

  const clearSelection = () => {
    setSelectedSuburb(null);
    setFilter("");
  };

  const filtered = MOCK_GROUPS.filter(
    (g) => !selectedSuburb
      ? (!filter || g.suburb.toLowerCase().includes(filter.toLowerCase()) || g.city.toLowerCase().includes(filter.toLowerCase()))
      : g.suburb.toLowerCase().includes(selectedSuburb.toLowerCase())
  );

  return (
    <div className="space-y-3">
      {/* Vision card */}
      <div className="card-warm p-5">
        <p className="font-mono text-[11px] text-primary uppercase tracking-wider mb-1.5">The vision</p>
        <p className="font-display text-sm italic text-foreground leading-relaxed">
          As technology reshapes work, the most valuable thing we'll have is each other. Find your neighbours.
          Share your skills. Trade what you know. Build the village that's been there all along.
        </p>
      </div>

      {/* Google Places Search */}
      <div className="relative">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={filter}
            onChange={(e) => { setFilter(e.target.value); setSelectedSuburb(null); }}
            placeholder="Search your suburb…"
            className="w-full pl-10 pr-10 py-3 rounded-full border border-border bg-card font-display text-sm italic text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 shadow-sm"
            style={{ fontSize: "16px" }}
            inputMode="search"
            autoComplete="off"
          />
          {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />}
          {selectedSuburb && !searching && (
            <button onClick={clearSelection} className="absolute right-3 top-1/2 -translate-y-1/2 font-body text-xs text-muted-foreground">✕</button>
          )}
        </div>

        {/* Predictions dropdown */}
        {predictions.length > 0 && !selectedSuburb && (
          <div className="absolute z-20 w-full mt-1 rounded-xl bg-card border border-border shadow-lg overflow-hidden">
            {predictions.map(p => (
              <button
                key={p.placeId}
                onClick={() => handleSelectSuburb(p.suburb)}
                className="w-full text-left px-4 py-3 hover:bg-secondary transition-colors flex items-center gap-2"
              >
                <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                <span className="font-display text-sm italic text-foreground">{p.description}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected suburb — create group CTA */}
      {selectedSuburb && filtered.length === 0 && (
        <div className="card-warm p-5 text-center space-y-3">
          <MapPin className="h-8 w-8 text-primary mx-auto" />
          <h3 className="font-display text-lg font-bold italic text-foreground">{selectedSuburb}</h3>
          <p className="font-body text-sm text-muted-foreground">No group for {selectedSuburb} yet. Be the first!</p>
          <button
            onClick={() => { haptic("medium"); onJoin(`new-${selectedSuburb.toLowerCase().replace(/\s/g, "-")}`); }}
            className="touch-btn font-display text-sm italic text-primary-foreground bg-primary rounded-full px-6 py-3 active:scale-[0.97]"
          >
            Create {selectedSuburb} group
          </button>
        </div>
      )}

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
                <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-phase-follicular/10 text-phase-follicular flex-shrink-0">Joined</span>
              ) : (
                <button
                  onClick={() => onJoin(g.id)}
                  className="touch-btn font-display text-sm italic text-primary-foreground bg-primary rounded-full px-5 py-2 active:scale-[0.97] flex-shrink-0"
                >
                  Join
                </button>
              )}
            </div>

            <p className="font-display text-[13px] italic text-muted-foreground leading-relaxed mb-3.5">{g.description}</p>

            <div className="bg-secondary/50 rounded-xl p-3.5 mb-2.5">
              <p className="font-mono text-[11px] text-primary mb-1.5">Active challenges</p>
              {g.challenges.slice(0, 2).map((c, i) => (
                <p key={i} className="font-display text-[13px] italic text-foreground/70 leading-relaxed mb-1">{c}</p>
              ))}
            </div>

            {g.questions.slice(0, 2).map((q, i) => (
              <div key={i} className="flex gap-1.5 items-start mb-1">
                <span className="text-primary text-xs flex-shrink-0 mt-0.5">·</span>
                <span className="font-mono text-[11px] text-muted-foreground leading-relaxed">{q}</span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
