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

const TABS = [
  { id: "discover", label: "Discover" },
  { id: "nearby", label: "Nearby" },
  { id: "chat", label: "Chat" },
  { id: "challenges", label: "Challenges" },
  { id: "profile", label: "Profile" },
];

export default function CommunityPage() {
  const [section, setSection] = useState("discover");

  const [joined, setJoined] = useState<string[]>([]);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [showOptIn, setShowOptIn] = useState(false);
  const [pendingJoin, setPendingJoin] = useState<string | null>(null);
  const [dbGroups, setDbGroups] = useState<any[]>([]);
  // Map of group_id → unread count (messages newer than last_read_at, not authored by me)
  const [unreadByGroup, setUnreadByGroup] = useState<Record<string, number>>({});
  const [pendingDmUserId, setPendingDmUserId] = useState<string | null>(null);

  // Load persisted state + fetch groups + fetch user memberships
  useEffect(() => {
    try {
      const loc = localStorage.getItem("signal_community_location");
      if (loc === "true") setLocationEnabled(true);
    } catch {}
    fetchGroups();
    fetchMyMemberships();
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

    // Fetch last_read_at per group
    const { data: lastReads } = await supabase
      .from("community_last_reads")
      .select("group_id, last_read_at")
      .eq("user_id", uid)
      .in("group_id", joined);

    const lastReadMap = new Map<string, string>();
    (lastReads ?? []).forEach((r: any) => lastReadMap.set(r.group_id, r.last_read_at));

    // For each joined group, count messages newer than last_read (or all if none)
    // Run in parallel for speed.
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

  // Recompute when joined groups change, when active group changes,
  // or when section changes (so leaving/entering chat refreshes badges).
  useEffect(() => { computeUnread(); }, [computeUnread, activeGroup, section]);

  // Realtime: any new message in one of my joined groups bumps the badge.
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
          // Skip if it's the active group I'm currently viewing in chat
          if (section === "chat" && activeGroup === msg.group_id) return;
          // Skip my own messages
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

  // Total unread across all joined groups (for the Chat tab badge)
  const totalUnread = Object.values(unreadByGroup).reduce((a, b) => a + b, 0);

  const persistJoined = (newJoined: string[]) => {
    setJoined(newJoined);
  };

  const toggleLocation = () => {
    const next = !locationEnabled;
    setLocationEnabled(next);
    localStorage.setItem("signal_community_location", String(next));
  };

  const joinGroupInDb = async (groupId: string) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return;
    // Idempotent: ignore conflict if already a member
    await supabase
      .from("community_memberships")
      .insert({ user_id: userData.user.id, group_id: groupId });
  };

  const join = async (id: string) => {
    if (!locationEnabled) {
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

  const handleLocationAccept = async () => {
    setLocationEnabled(true);
    localStorage.setItem("signal_community_location", "true");
    setShowOptIn(false);
    if (pendingJoin) {
      if (!joined.includes(pendingJoin)) {
        await joinGroupInDb(pendingJoin);
        persistJoined([...joined, pendingJoin]);
      }
      setActiveGroup(pendingJoin);
      setSection("chat");
      setPendingJoin(null);
    }
  };

  const group = dbGroups.find((g) => g.id === activeGroup) || dbGroups.find((g) => joined.includes(g.id));

  const handleNearbyTab = () => {
    if (!locationEnabled) setShowOptIn(true);
    setSection("nearby");
  };

  // From Nearby: Message a member → open the user's primary group chat with @mention prefilled.
  // Falls back to the first joined group if a perfect match can't be found.
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
      {/* Location opt-in modal */}
      <AnimatePresence>
        {showOptIn && (
          <LocationOptIn
            onAccept={handleLocationAccept}
            onDecline={() => { setShowOptIn(false); setPendingJoin(null); }}
          />
        )}
      </AnimatePresence>

      {/* ═══ HERO ═══ */}
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


      {/* Tab bar — sticky on mobile */}
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

      {/* Content */}
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
          {section === "profile" && <CommunityProfile locationEnabled={locationEnabled} onToggleLocation={toggleLocation} />}
        </motion.div>
      </AnimatePresence>

      <BotanicalSprig width={160} className="mx-auto mt-8 md:hidden" />
      <BotanicalSprig width={200} className="mx-auto mt-10 hidden md:block" />
      </ContentSection>
    </div>
    </GatedPage>
  );
}
