import { useState, useEffect, useCallback } from "react";
import { Users } from "lucide-react";
import { GatedPage } from "@/components/FeatureGate";
import { motion, AnimatePresence } from "framer-motion";
import { BotanicalSprig, HandDrawnLeaf } from "@/components/BotanicalElements";
import { AtmosphericHero, ContentSection } from "@/components/AtmosphericSection";
import SignalPulse from "@/components/SignalPulse";
import { supabase } from "@/integrations/supabase/client";
import LocationOptIn from "@/components/community/LocationOptIn";
import CommunityDiscover from "@/components/community/CommunityDiscover";
import NearbyView from "@/components/community/NearbyView";
import ChatRoom from "@/components/community/ChatRoom";
import ChallengesPanel from "@/components/community/ChallengesPanel";
import CommunityProfile from "@/components/community/CommunityProfile";
import { haptic } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { useAccountStatus } from "@/hooks/useAccountStatus";
import SuspensionBanner from "@/components/community/SuspensionBanner";

const TABS = [
  { id: "discover", label: "Discover" },
  { id: "nearby", label: "Nearby" },
  { id: "chat", label: "Chat" },
  { id: "challenges", label: "Challenges" },
  { id: "profile", label: "Profile" },
];

export default function CommunityPage() {
  const [section, setSection] = useState("discover");
  const { suspension } = useAccountStatus();

  const [joined, setJoined] = useState<string[]>([]);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  // DB-derived: true when user has a user_locations row AND is_visible = true.
  // 'hasLocationRow' tells us whether they've ever set up a suburb at all.
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [hasLocationRow, setHasLocationRow] = useState(false);
  const [showOptIn, setShowOptIn] = useState(false);
  const [pendingJoin, setPendingJoin] = useState<string | null>(null);
  const [dbGroups, setDbGroups] = useState<any[]>([]);
  // Map of group_id → unread count (messages newer than last_read_at, not authored by me)
  const [unreadByGroup, setUnreadByGroup] = useState<Record<string, number>>({});
  const [pendingDmUserId, setPendingDmUserId] = useState<string | null>(null);

  // Load persisted state + fetch groups + fetch user memberships
  useEffect(() => {
    fetchGroups();
    fetchMyMemberships();
    refreshLocationStatus();
  }, []);

  // Single source of truth: read user_locations row to determine enabled state.
  const refreshLocationStatus = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      setLocationEnabled(false);
      setHasLocationRow(false);
      return;
    }
    const { data } = await supabase
      .from("user_locations" as any)
      .select("is_visible")
      .eq("user_id", userData.user.id)
      .maybeSingle();
    if (data) {
      setHasLocationRow(true);
      setLocationEnabled(((data as any).is_visible) === true);
    } else {
      setHasLocationRow(false);
      setLocationEnabled(false);
    }
  }, []);

  const fetchGroups = async () => {
    const { data } = await supabase.from("community_groups").select("*").eq("status", "approved");
    if (data) setDbGroups(data);
  };

  const fetchMyMemberships = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return;
    const { data } = await supabase
      .from("community_memberships")
      .select("group_id")
      .eq("user_id", userData.user.id);
    if (data) setJoined(data.map((m) => m.group_id));
  };

  // ─── Unread tracking ────────────────────────────────────
  const computeUnread = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData?.user?.id;
    if (!uid || joined.length === 0) {
      setUnreadByGroup({});
      return;
    }

    const { data: lastReads } = await supabase
      .from("community_last_reads")
      .select("group_id, last_read_at")
      .eq("user_id", uid)
      .in("group_id", joined);

    const lastReadMap = new Map<string, string>();
    (lastReads ?? []).forEach((r: any) => lastReadMap.set(r.group_id, r.last_read_at));

    const counts = await Promise.all(
      joined.map(async (gid) => {
        const since = lastReadMap.get(gid) ?? "1970-01-01T00:00:00Z";
        const { count } = await supabase
          .from("community_messages")
          .select("id", { count: "exact", head: true })
          .eq("group_id", gid)
          .eq("is_removed", false)
          .neq("user_id", uid)
          .gt("created_at", since);
        return [gid, count ?? 0] as const;
      })
    );

    const next: Record<string, number> = {};
    counts.forEach(([gid, c]) => { if (c > 0) next[gid] = c; });
    setUnreadByGroup(next);
  }, [joined]);

  useEffect(() => { computeUnread(); }, [computeUnread, activeGroup, section]);

  useEffect(() => {
    if (joined.length === 0) return;
    const channel = supabase
      .channel("community-unread-watch")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "community_messages" },
        (payload) => {
          const msg = payload.new as any;
          if (!joined.includes(msg.group_id)) return;
          if (section === "chat" && activeGroup === msg.group_id) return;
          supabase.auth.getUser().then(({ data }) => {
            if (data.user?.id === msg.user_id) return;
            setUnreadByGroup((prev) => ({
              ...prev,
              [msg.group_id]: (prev[msg.group_id] ?? 0) + 1,
            }));
          });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [joined, section, activeGroup]);

  const totalUnread = Object.values(unreadByGroup).reduce((a, b) => a + b, 0);

  const persistJoined = (newJoined: string[]) => {
    setJoined(newJoined);
  };

  /**
   * Toggle Nearby visibility. Writes to BOTH:
   *   • user_locations.is_visible    (controls who can see this user in the Nearby SELECT policy)
   *   • profiles.is_nearby_visible   (consumed by NearbyView's filter)
   *
   * If the user has no location row yet, redirect them to the Nearby tab to set one up.
   * Returns true on success, false on failure or no-op (so the Switch can revert UI).
   */
  const toggleLocation = useCallback(async (): Promise<boolean> => {
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData?.user?.id;
    if (!uid) {
      toast.error("Please sign in to manage location");
      return false;
    }
    if (!hasLocationRow) {
      // No suburb on file — bounce to Nearby to do the geolocation flow.
      setSection("nearby");
      setShowOptIn(true);
      toast.info("Set up your suburb in the Nearby tab first");
      return false;
    }
    const next = !locationEnabled;
    const { error: locErr } = await supabase
      .from("user_locations" as any)
      .update({ is_visible: next, updated_at: new Date().toISOString() } as any)
      .eq("user_id", uid);
    if (locErr) {
      toast.error("Couldn't update visibility");
      return false;
    }
    await supabase
      .from("profiles")
      .update({ is_nearby_visible: next } as any)
      .eq("user_id", uid);
    setLocationEnabled(next);
    toast.success(next ? "You're visible in Nearby" : "You're hidden from Nearby");
    return true;
  }, [hasLocationRow, locationEnabled]);

  const joinGroupInDb = async (groupId: string) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return;
    await supabase
      .from("community_memberships")
      .insert({ user_id: userData.user.id, group_id: groupId });
  };

  const join = async (id: string) => {
    // Only suburb-type groups need location verification.
    // Interest groups (Mums & Bubs, running clubs, etc.) join freely.
    const target = dbGroups.find((g) => g.id === id);
    const requiresLocation = target?.group_type === "suburb";

    if (requiresLocation && !locationEnabled) {
      setPendingJoin(id);
      setShowOptIn(true);
      return;
    }
    if (!joined.includes(id)) {
      await joinGroupInDb(id);
      persistJoined([...joined, id]);
    }
    setActiveGroup(id);
    setSection("chat");
  };

  // After accepting the LocationOptIn modal, the user goes to the Nearby tab
  // to do the actual GPS detection. We just close the modal and route them.
  const handleLocationAccept = async () => {
    setShowOptIn(false);
    setSection("nearby");
    if (pendingJoin) {
      // Stash it — they can come back to Discover after granting location.
      setPendingJoin(null);
      toast.info("Enable location, then re-join the group");
    }
  };

  const group = dbGroups.find((g) => g.id === activeGroup) || dbGroups.find((g) => joined.includes(g.id));

  const handleNearbyTab = () => {
    if (!hasLocationRow) setShowOptIn(true);
    setSection("nearby");
  };

  const handleMessageMember = useCallback((userId: string, _displayName: string) => {
    if (joined.length === 0) {
      setSection("discover");
      return;
    }
    setPendingDmUserId(userId);
    setActiveGroup((prev) => prev ?? joined[0]);
    setSection("chat");
  }, [joined]);

  return (
    <GatedPage
      requiredTier="thriving"
      customMessage={{
        icon: <Users className="h-4 w-4" />,
        title: "Community is a Thriving feature",
        subtitle: "Connect with women near you, join interest groups, and build your village.",
        buttonLabel: "Upgrade to Thriving →",
      }}
    >
    <div className="relative">
      <AnimatePresence>
        {showOptIn && (
          <LocationOptIn
            onAccept={handleLocationAccept}
            onDecline={() => { setShowOptIn(false); setPendingJoin(null); }}
          />
        )}
      </AnimatePresence>

      <AtmosphericHero size="md">
        <SignalPulse />
        <div className="text-center relative z-10">
          <p className="font-body text-xs uppercase tracking-[0.3em] text-primary-foreground/40 mb-4">Community</p>
          <h1 className="font-display text-[3rem] md:text-[4rem] font-extrabold text-primary-foreground leading-[1.02] mb-4">Village</h1>
          <p className="font-editorial text-base md:text-lg italic text-primary-foreground/60 max-w-md mx-auto">
            Find your neighbours. Share your gifts. Build the village.
          </p>
        </div>
      </AtmosphericHero>

      <ContentSection className="px-5 md:px-4">

      {suspension && <SuspensionBanner suspension={suspension} />}

      <div className="sticky top-0 md:static z-20 bg-background/95 backdrop-blur-sm pb-4 md:pb-5 -mx-5 px-5 md:mx-0 md:px-0 pt-2 md:pt-0">
        <div className="flex bg-secondary/50 rounded-2xl p-1 overflow-x-auto">
          {TABS.map((t) => {
            const showChatBadge = t.id === "chat" && totalUnread > 0;
            return (
              <button
                key={t.id}
                onClick={() => { haptic("light"); t.id === "nearby" ? handleNearbyTab() : setSection(t.id); }}
                className={`touch-tab flex-1 py-2.5 rounded-xl text-center font-display text-xs transition-all relative whitespace-nowrap min-w-0 ${
                  section === t.id
                    ? "bg-card text-foreground shadow-sm font-medium"
                    : "text-muted-foreground italic"
                }`}
              >
                {t.label}
                {t.id === "nearby" && locationEnabled && (
                  <span className="absolute top-1 right-1.5 w-[5px] h-[5px] rounded-full bg-primary" />
                )}
                {showChatBadge && (
                  <span className="absolute top-0.5 right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                    {totalUnread > 99 ? "99+" : totalUnread}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={section}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
        >
          {section === "discover" && <CommunityDiscover onJoin={join} joined={joined} />}
          {section === "nearby" && (
            <NearbyView
              locationEnabled={locationEnabled}
              onRequestLocation={() => setShowOptIn(true)}
              onToggleLocation={toggleLocation}
              onLocationChanged={refreshLocationStatus}
              onMessageMember={handleMessageMember}
            />
          )}
          {section === "chat" && (
            joined.length === 0 ? (
              <div className="text-center pt-16">
                <HandDrawnLeaf size={40} color="hsl(var(--primary))" className="mx-auto mb-3" />
                <p className="font-display text-xl italic text-foreground mb-2">You haven't joined a community yet.</p>
                <button onClick={() => setSection("discover")} className="touch-btn font-display text-[15px] italic text-primary-foreground bg-primary rounded-full px-7 py-2.5 active:scale-[0.97]">
                  Find my community
                </button>
              </div>
            ) : (
              <div>
                {joined.length > 1 && (
                  <div className="flex gap-1.5 mb-3 overflow-x-auto pb-0.5 scroll-snap-x">
                    {joined.map((id) => {
                      const g = dbGroups.find((g) => g.id === id);
                      if (!g) return null;
                      const unread = unreadByGroup[id] ?? 0;
                      const isActive = activeGroup === id;
                      return (
                        <button
                          key={id}
                          onClick={() => setActiveGroup(id)}
                          className={`touch-btn relative font-display text-[13px] italic rounded-full px-3.5 py-1 whitespace-nowrap border transition-all scroll-snap-item ${
                            isActive
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-card text-foreground border-border"
                          }`}
                        >
                          {g.name || g.suburb}
                          {!isActive && unread > 0 && (
                            <span className="ml-1.5 inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                              {unread > 99 ? "99+" : unread}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
                {group && (
                  <ChatRoom
                    group={group}
                    initialDmUserId={pendingDmUserId}
                    key={group.id}
                  />
                )}
              </div>
            )
          )}
          {section === "challenges" && <ChallengesPanel joined={joined} />}
          {section === "profile" && (
            <CommunityProfile
              locationEnabled={locationEnabled}
              hasLocationRow={hasLocationRow}
              onToggleLocation={toggleLocation}
              onGoToNearby={() => setSection("nearby")}
            />
          )}
        </motion.div>
      </AnimatePresence>

      <BotanicalSprig width={160} className="mx-auto mt-8 md:hidden" />
      <BotanicalSprig width={200} className="mx-auto mt-10 hidden md:block" />
      </ContentSection>
    </div>
    </GatedPage>
  );
}
