import { useState, useEffect } from "react";
import { MapPin, Loader2, Clock, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { haptic } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface CommunityGroup {
  id: string;
  name: string;
  suburb: string;
  city: string | null;
  country: string | null;
  group_type: string;
  status: string;
  description: string | null;
  members_count: number | null;
  challenges: string[];
  questions: string[];
  parent_group_id: string | null;
  created_by: string | null;
}

interface PlacePrediction {
  description: string;
  placeId: string;
  suburb: string;
}

interface CommunityDiscoverProps {
  onJoin: (id: string) => void;
  joined: string[];
}

export default function CommunityDiscover({ onJoin, joined }: CommunityDiscoverProps) {
  const { user } = useAuth();
  const [filter, setFilter] = useState("");
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedSuburb, setSelectedSuburb] = useState<string | null>(null);
  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInterestForm, setShowInterestForm] = useState(false);
  const [interestName, setInterestName] = useState("");
  const [interestDesc, setInterestDesc] = useState("");
  const [interestParent, setInterestParent] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch groups from DB
  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("community_groups")
      .select("*")
      .order("members_count", { ascending: false });
    if (data) {
      setGroups(data.map((g: any) => ({
        ...g,
        challenges: Array.isArray(g.challenges) ? g.challenges : [],
        questions: Array.isArray(g.questions) ? g.questions : [],
      })));
    }
    setLoading(false);
  };

  // Google Places search
  useEffect(() => {
    if (filter.length < 2) { setPredictions([]); return; }
    const timeout = setTimeout(async () => {
      setSearching(true);
      try {
        const { data } = await supabase.functions.invoke("places-autocomplete", {
          body: { input: filter },
        });
        if (data?.predictions) setPredictions(data.predictions);
      } catch {} finally { setSearching(false); }
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

  // Create suburb group request
  const handleCreateSuburbGroup = async (suburb: string) => {
    if (!user) { toast.error("Please sign in to create a group"); return; }
    setSubmitting(true);
    const { error } = await supabase.from("community_groups").insert({
      name: suburb,
      suburb,
      group_type: "suburb",
      status: "pending",
      created_by: user.id,
      description: `A community for ${suburb} neighbours — sharing skills, walks, coffee dates and whatever the neighbourhood needs.`,
    });
    if (error) {
      toast.error("Failed to submit group request");
    } else {
      toast.success("Group request submitted for approval!");
      fetchGroups();
    }
    setSubmitting(false);
  };

  // Create interest group request (under a suburb)
  const handleCreateInterestGroup = async () => {
    if (!user) { toast.error("Please sign in"); return; }
    if (!interestName.trim()) return;
    setSubmitting(true);
    const parentGroup = groups.find(g => g.id === interestParent);
    const { error } = await supabase.from("community_groups").insert({
      name: interestName.trim(),
      suburb: parentGroup?.suburb || selectedSuburb || "",
      city: parentGroup?.city,
      group_type: "interest",
      parent_group_id: interestParent,
      status: "pending",
      created_by: user.id,
      description: interestDesc.trim() || `${interestName.trim()} — a community interest group.`,
    });
    if (error) {
      toast.error("Failed to submit group request");
    } else {
      toast.success("Interest group request submitted for approval!");
      setShowInterestForm(false);
      setInterestName("");
      setInterestDesc("");
      setInterestParent(null);
      fetchGroups();
    }
    setSubmitting(false);
  };

  // Filter groups
  const approvedGroups = groups.filter(g => g.status === "approved");
  const myPending = groups.filter(g => g.status === "pending" && g.created_by === user?.id);

  const filtered = approvedGroups.filter(g =>
    !selectedSuburb
      ? (!filter || g.suburb.toLowerCase().includes(filter.toLowerCase()) || (g.city || "").toLowerCase().includes(filter.toLowerCase()) || g.name.toLowerCase().includes(filter.toLowerCase()))
      : g.suburb.toLowerCase().includes(selectedSuburb.toLowerCase())
  );

  const suburbGroups = filtered.filter(g => g.group_type === "suburb");
  const interestGroups = filtered.filter(g => g.group_type === "interest");

  return (
    <div className="space-y-3">
      {/* Empty state when no groups at all */}
      {!loading && approvedGroups.length === 0 && !selectedSuburb && (
        <div className="text-center py-12 space-y-4">
          <svg width="80" height="80" viewBox="0 0 80 80" className="mx-auto text-primary/30" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <circle cx="25" cy="30" r="8" />
            <circle cx="55" cy="30" r="8" />
            <circle cx="40" cy="55" r="8" />
            <path d="M32 34 L34 50" strokeLinecap="round" />
            <path d="M48 34 L46 50" strokeLinecap="round" />
            <path d="M25 38 C20 50 35 55 33 48" strokeLinecap="round" opacity="0.5" />
            <path d="M55 38 C60 50 45 55 47 48" strokeLinecap="round" opacity="0.5" />
          </svg>
          <h3 className="font-display text-xl font-bold italic text-foreground">Your village is being built.</h3>
          <p className="font-display text-sm italic text-muted-foreground">Be the first in your area.</p>
          <button
            onClick={async () => {
              haptic("medium");
              if (navigator.share) {
                try {
                  await navigator.share({ title: "Signal Community", text: "Join me on Signal — a wellness app for cycle-synced living.", url: window.location.origin });
                } catch {}
              } else {
                await navigator.clipboard.writeText(window.location.origin);
                toast.success("Link copied to clipboard!");
              }
            }}
            className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-7 py-3 font-display text-sm font-semibold active:scale-[0.97] transition-transform"
          >
            Invite someone →
          </button>
        </div>
      )}

      {/* Vision card */}
      {(approvedGroups.length > 0 || selectedSuburb) && (
      <div className="card-warm p-5">
        <p className="font-mono text-[11px] text-primary uppercase tracking-wider mb-1.5">The vision</p>
        <p className="font-display text-sm italic text-foreground leading-relaxed">
          As technology reshapes work, the most valuable thing we'll have is each other. Find your neighbours.
          Share your skills. Trade what you know. Build the village that's been there all along.
        </p>
      </div>
      )}

      {/* Search */}
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

      {/* Pending requests */}
      {myPending.length > 0 && (
        <div className="space-y-2">
          <p className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider">Pending approval</p>
          {myPending.map(g => (
            <div key={g.id} className="card-warm p-4 opacity-70">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <h3 className="font-display text-base font-bold italic text-foreground">{g.name}</h3>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground ml-auto">
                  {g.group_type === "interest" ? "Interest group" : "Suburb group"}
                </span>
              </div>
              <p className="font-display text-[13px] italic text-muted-foreground">{g.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* No groups found — create suburb */}
      {selectedSuburb && suburbGroups.length === 0 && (
        <div className="card-warm p-5 text-center space-y-3">
          <MapPin className="h-8 w-8 text-primary mx-auto" />
          <h3 className="font-display text-lg font-bold italic text-foreground">{selectedSuburb}</h3>
          <p className="font-body text-sm text-muted-foreground">No group for {selectedSuburb} yet. Be the first!</p>
          <button
            onClick={() => handleCreateSuburbGroup(selectedSuburb)}
            disabled={submitting}
            className="touch-btn font-display text-sm italic text-primary-foreground bg-primary rounded-full px-6 py-3 active:scale-[0.97] disabled:opacity-50"
          >
            {submitting ? "Submitting…" : `Request ${selectedSuburb} group`}
          </button>
          <p className="font-mono text-[10px] text-muted-foreground">Groups require admin approval before going live</p>
        </div>
      )}

      {/* Suggest interest group button */}
      {(suburbGroups.length > 0 || !selectedSuburb) && (
        <button
          onClick={() => {
            haptic("light");
            setInterestParent(suburbGroups[0]?.id || null);
            setShowInterestForm(true);
          }}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span className="font-display text-sm italic">Suggest an interest group (e.g. Mums & Bubs, Running Club)</span>
        </button>
      )}

      {/* Group cards */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
        </div>
      ) : (
        <>
          {[...suburbGroups, ...interestGroups].map((g) => {
            const isJoined = joined.includes(g.id);
            const parentName = g.parent_group_id ? groups.find(p => p.id === g.parent_group_id)?.name : null;
            return (
              <div key={g.id} className="card-warm p-5">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-display text-xl font-bold italic text-foreground mb-0.5">{g.name}</h3>
                      {g.group_type === "interest" && (
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-accent/20 text-accent-foreground">
                          {parentName ? `${parentName}` : "Interest"}
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-xs text-muted-foreground">{g.city || g.suburb} · {g.members_count || 0} members</p>
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

                {g.challenges.length > 0 && (
                  <div className="bg-secondary/50 rounded-xl p-3.5 mb-2.5">
                    <p className="font-mono text-[11px] text-primary mb-1.5">Active challenges</p>
                    {g.challenges.slice(0, 2).map((c: string, i: number) => (
                      <p key={i} className="font-display text-[13px] italic text-foreground/70 leading-relaxed mb-1">{c}</p>
                    ))}
                  </div>
                )}

                {g.questions.slice(0, 2).map((q: string, i: number) => (
                  <div key={i} className="flex gap-1.5 items-start mb-1">
                    <span className="text-primary text-xs flex-shrink-0 mt-0.5">·</span>
                    <span className="font-mono text-[11px] text-muted-foreground leading-relaxed">{q}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </>
      )}

      {/* Interest group creation dialog */}
      <Dialog open={showInterestForm} onOpenChange={setShowInterestForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl italic">Suggest an interest group</DialogTitle>
            <DialogDescription className="font-body text-sm text-muted-foreground">
              Interest groups sit within a suburb community. Your request will be reviewed before going live.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider mb-1 block">Parent suburb</label>
              <select
                value={interestParent || ""}
                onChange={e => setInterestParent(e.target.value || null)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-card font-display text-sm italic text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Select suburb…</option>
                {approvedGroups.filter(g => g.group_type === "suburb").map(g => (
                  <option key={g.id} value={g.id}>{g.suburb}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider mb-1 block">Group name</label>
              <input
                value={interestName}
                onChange={e => setInterestName(e.target.value)}
                placeholder="e.g. Mums & Bubs, Running Club…"
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-card font-display text-sm italic text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
                style={{ fontSize: "16px" }}
              />
            </div>
            <div>
              <label className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider mb-1 block">Description (optional)</label>
              <textarea
                value={interestDesc}
                onChange={e => setInterestDesc(e.target.value)}
                placeholder="What's this group about?"
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-card font-display text-sm italic text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
            </div>
            <button
              onClick={handleCreateInterestGroup}
              disabled={submitting || !interestName.trim() || !interestParent}
              className="w-full touch-btn font-display text-sm italic text-primary-foreground bg-primary rounded-full px-6 py-3 active:scale-[0.97] disabled:opacity-50"
            >
              {submitting ? "Submitting…" : "Submit for approval"}
            </button>
            <p className="font-mono text-[10px] text-muted-foreground text-center">Groups require admin approval before going live</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
