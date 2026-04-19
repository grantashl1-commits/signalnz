import { useState, useEffect } from "react";
import { Users } from "lucide-react";
import { GatedPage } from "@/components/FeatureGate";
import { motion, AnimatePresence } from "framer-motion";
import { BotanicalSprig, HandDrawnVillage, HandDrawnLeaf } from "@/components/BotanicalElements";
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

  const persistJoined = (newJoined: string[]) => {
    setJoined(newJoined);
    localStorage.setItem("signal_community_joined", JSON.stringify(newJoined));
  };

  const toggleLocation = () => {
    const next = !locationEnabled;
    setLocationEnabled(next);
    localStorage.setItem("signal_community_location", String(next));
  };

  const join = (id: string) => {
    if (!locationEnabled) {
      setPendingJoin(id);
      setShowOptIn(true);
      return;
    }
    const newJoined = joined.includes(id) ? joined : [...joined, id];
    persistJoined(newJoined);
    setActiveGroup(id);
    setSection("chat");
  };

  const handleLocationAccept = () => {
    setLocationEnabled(true);
    localStorage.setItem("signal_community_location", "true");
    setShowOptIn(false);
    if (pendingJoin) {
      const newJoined = joined.includes(pendingJoin) ? joined : [...joined, pendingJoin];
      persistJoined(newJoined);
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
          {TABS.map((t) => (
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
            </button>
          ))}
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
          {section === "nearby" && <NearbyView locationEnabled={locationEnabled} onRequestLocation={() => setShowOptIn(true)} onToggleLocation={toggleLocation} />}
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
                      return (
                        <button
                          key={id}
                          onClick={() => setActiveGroup(id)}
                          className={`touch-btn font-display text-[13px] italic rounded-full px-3.5 py-1 whitespace-nowrap border transition-all scroll-snap-item ${
                            activeGroup === id
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-card text-foreground border-border"
                          }`}
                        >
                          {g.name || g.suburb}
                        </button>
                      );
                    })}
                  </div>
                )}
                {group && <ChatRoom group={group} />}
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
