import { useState, useEffect } from "react";
import { MapPin, Loader2, Clock, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { haptic } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useCycle } from "@/contexts/CycleContext";
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
  const { suburb: mySuburb } = useProfile();
  const { currentPhase } = useCycle();
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
    if (!user) { toast.error("Come in first — then you can begin a group."); return; }
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
      toast.error("That didn't land — try again in a moment.");
    } else {
      toast.success("Held — your group is on its way through approval.");
      fetchGroups();
    }
    setSubmitting(false);
  };

  // Create interest group request (under a suburb)
  const handleCreateInterestGroup = async () => {
    if (!user) { toast.error("Come in first."); return; }
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
      toast.error("That didn't land — try again in a moment.");
    } else {
      toast.success("Held — your interest group is on its way through approval.");
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

  // Three-bucket sectioning for the rendered list:
  //   • Near you   — suburb groups matching the user's profile suburb (or all when unknown)
  //   • Same phase — interest groups whose name/description mentions current cycle phase
  //   • Interests  — remaining interest groups
  const matchSuburb = (s: string | null | undefined) =>
    mySuburb && s ? s.toLowerCase().includes(mySuburb.toLowerCase()) : false;

  const phaseKeyword = (currentPhase || "").toLowerCase();
  const matchPhase = (g: CommunityGroup) => {
    if (!phaseKeyword) return false;
    const hay = `${g.name} ${g.description ?? ""}`.toLowerCase();
    return hay.includes(phaseKeyword);
  };

  const nearYouGroups = mySuburb
    ? suburbGroups.filter((g) => matchSuburb(g.suburb) || matchSuburb(g.city))
    : suburbGroups;
  const otherSuburbGroups = mySuburb
    ? suburbGroups.filter((g) => !nearYouGroups.includes(g))
    : [];
  const samePhaseGroups = interestGroups.filter(matchPhase);
  const otherInterestGroups = interestGroups.filter((g) => !samePhaseGroups.includes(g));

  const sections = [
    { id: "near", label: mySuburb ? `Near you · ${mySuburb}` : "Suburbs", items: nearYouGroups },
    { id: "phase", label: phaseKeyword ? `Same phase · ${phaseKeyword}` : "Same phase", items: samePhaseGroups },
    { id: "interests", label: "Interests", items: otherInterestGroups },
    { id: "other-suburbs", label: "Other suburbs", items: otherSuburbGroups },
  ].filter((s) => s.items.length > 0);

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
                toast.success("Copied — share when you’re ready.");
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
      <div className="relative rounded-2xl p-6 overflow-hidden" style={{ backgroundColor: "#1A0F2E" }}>
        {/* Radial dot motif */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.05]" viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice">
          {Array.from({ length: 40 }).map((_, i) => {
            const angle = (i / 40) * Math.PI * 2;
            const ring = Math.floor(i / 10);
            const dist = 15 + ring * 18;
            return (
              <circle
                key={i}
                cx={100 + Math.cos(angle) * dist}
                cy={60 + Math.sin(angle) * dist}
                r={2 + (ring % 2)}
                fill="white"
              />
            );
          })}
        </svg>
        <p className="font-body text-[11px] text-primary uppercase tracking-[0.2em] mb-2.5 relative z-10">The Vision</p>
        <p className="font-display text-[15px] italic leading-relaxed relative z-10" style={{ color: "#FAF7F2" }}>
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
          <p className="font-body text-[11px] text-muted-foreground uppercase tracking-wider">Pending approval</p>
          {myPending.map(g => (
            <div key={g.id} className="card-warm p-4 opacity-70">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <h3 className="font-display text-base font-bold italic text-foreground">{g.name}</h3>
                <span className="font-body text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground ml-auto">
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
          <p className="font-body text-sm text-muted-foreground">No group for {selectedSuburb} yet — you could begin one.</p>
          <button
            onClick={() => handleCreateSuburbGroup(selectedSuburb)}
            disabled={submitting}
            className="touch-btn font-display text-sm italic text-primary-foreground bg-primary rounded-full px-6 py-3 active:scale-[0.97] disabled:opacity-50"
          >
            {submitting ? "Submitting…" : `Request ${selectedSuburb} group`}
          </button>
          <p className="font-body text-[10px] text-muted-foreground">Groups require admin approval before going live</p>
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
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card-warm p-5 space-y-3">
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                  <div className="h-6 w-2/3 rounded-xl animate-shimmer bg-gradient-to-r from-[#E8E0F0] via-[#F3EEF8] to-[#E8E0F0] bg-[length:200%_100%]" />
                  <div className="h-4 w-full rounded-lg animate-shimmer bg-gradient-to-r from-[#E8E0F0] via-[#F3EEF8] to-[#E8E0F0] bg-[length:200%_100%]" />
                </div>
                <div className="h-9 w-20 rounded-full animate-shimmer bg-gradient-to-r from-[#E8E0F0] via-[#F3EEF8] to-[#E8E0F0] bg-[length:200%_100%]" />
              </div>
              <div className="h-3 w-24 rounded animate-shimmer bg-gradient-to-r from-[#E8E0F0] via-[#F3EEF8] to-[#E8E0F0] bg-[length:200%_100%]" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {sections.map((section) => (
            <div key={section.id} className="space-y-2.5">
              <p className="font-body text-[11px] uppercase tracking-wider text-muted-foreground pt-2 px-1">
                {section.label}
              </p>
              {section.items.map((g) => {
                const isJoined = joined.includes(g.id);
                const parentName = g.parent_group_id ? groups.find(p => p.id === g.parent_group_id)?.name : null;
                return (
                  <div key={g.id} className="card-warm p-5">
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-display text-xl font-bold italic text-foreground mb-1">{g.name}</h3>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          <span className="font-body text-xs text-muted-foreground">{g.city || g.suburb}</span>
                          <span className="font-body text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                            {g.members_count || 0} {(g.members_count || 0) === 1 ? "member" : "members"}
                          </span>
                          {g.group_type === "interest" && parentName && (
                            <span className="font-body text-[10px] px-2 py-0.5 rounded-full bg-accent/20 text-accent-foreground">
                              {parentName}
                            </span>
                          )}
                        </div>
                        {(g.members_count || 0) > 0 && (
                          <div className="flex -space-x-2 mt-2">
                            {Array.from({ length: Math.min(g.members_count || 0, 4) }).map((_, ai) => (
                              <div
                                key={ai}
                                className="w-7 h-7 rounded-full bg-primary/15 border-2 border-card flex items-center justify-center"
                              >
                                <span className="font-body text-[9px] font-semibold text-primary">
                                  {String.fromCharCode(65 + ai)}
                                </span>
                              </div>
                            ))}
                            {(g.members_count || 0) > 4 && (
                              <div className="w-7 h-7 rounded-full bg-secondary border-2 border-card flex items-center justify-center">
                                <span className="font-body text-[9px] font-medium text-muted-foreground">+{(g.members_count || 0) - 4}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      {isJoined ? (
                        <span className="font-body text-[11px] px-2.5 py-0.5 rounded-full bg-primary/10 text-primary flex-shrink-0 mt-1">Joined</span>
                      ) : (
                        <button
                          onClick={() => onJoin(g.id)}
                          className="touch-btn font-body text-sm font-medium text-primary border border-primary rounded-full px-5 h-9 active:scale-[0.97] flex-shrink-0 mt-1 hover:bg-primary/5 transition-colors"
                        >
                          Join
                        </button>
                      )}
                    </div>

                    <p className="font-display text-[13px] italic text-muted-foreground leading-relaxed mb-3.5">{g.description}</p>

                    {g.challenges.length > 0 && (
                      <div className="bg-secondary/50 rounded-xl p-3.5 mb-2.5">
                        <p className="font-body text-[11px] text-primary mb-1.5">Active challenges</p>
                        {g.challenges.slice(0, 2).map((c: string, i: number) => (
                          <p key={i} className="font-display text-[13px] italic text-foreground/70 leading-relaxed mb-1">{c}</p>
                        ))}
                      </div>
                    )}

                    {g.questions.slice(0, 2).map((q: string, i: number) => (
                      <div key={i} className="flex gap-1.5 items-start mb-1">
                        <span className="text-primary text-xs flex-shrink-0 mt-0.5">·</span>
                        <span className="font-body text-[11px] text-muted-foreground leading-relaxed">{q}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
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
              <label className="font-body text-[11px] text-muted-foreground uppercase tracking-wider mb-1 block">Parent suburb</label>
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
              <label className="font-body text-[11px] text-muted-foreground uppercase tracking-wider mb-1 block">Group name</label>
              <input
                value={interestName}
                onChange={e => setInterestName(e.target.value)}
                placeholder="e.g. Mums & Bubs, Running Club…"
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-card font-display text-sm italic text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
                style={{ fontSize: "16px" }}
              />
            </div>
            <div>
              <label className="font-body text-[11px] text-muted-foreground uppercase tracking-wider mb-1 block">Description (optional)</label>
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
            <p className="font-body text-[10px] text-muted-foreground text-center">Groups require admin approval before going live</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
