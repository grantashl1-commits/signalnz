import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BotanicalSprig, HandDrawnVillage, HandDrawnLeaf } from "@/components/BotanicalElements";
import { AtmosphericHero, ContentSection } from "@/components/AtmosphericSection";
import { MOCK_GROUPS } from "@/data/community-data";
import LocationOptIn from "@/components/community/LocationOptIn";
import CommunityDiscover from "@/components/community/CommunityDiscover";
import NearbyView from "@/components/community/NearbyView";
import ChatRoom from "@/components/community/ChatRoom";
import ChallengesPanel from "@/components/community/ChallengesPanel";
import CommunityProfile from "@/components/community/CommunityProfile";
import { haptic } from "@/hooks/use-mobile";
import SignalContextChips from "@/components/signal/SignalContextChips";
import { useSignalPanel } from "@/hooks/useSignalPanel";

const TABS = [
  { id: "discover", label: "Discover" },
  { id: "nearby", label: "Nearby" },
  { id: "chat", label: "Chat" },
  { id: "challenges", label: "Challenges" },
  { id: "profile", label: "Profile" },
];

export default function CommunityPage() {
  const [section, setSection] = useState("discover");
  const { openSignal } = useSignalPanel();
  const [joined, setJoined] = useState<string[]>([]);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [showOptIn, setShowOptIn] = useState(false);
  const [pendingJoin, setPendingJoin] = useState<string | null>(null);

  // Load persisted state
  useEffect(() => {
    try {
      const saved = localStorage.getItem("signal_community_joined");
      if (saved) setJoined(JSON.parse(saved));
      const loc = localStorage.getItem("signal_community_location");
      if (loc === "true") setLocationEnabled(true);
    } catch {}
  }, []);

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
    // For suburb groups, validate location first
    const group = MOCK_GROUPS.find(g => g.id === id);
    if (group && !locationEnabled) {
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

  const group = MOCK_GROUPS.find((g) => g.id === activeGroup) || MOCK_GROUPS.find((g) => joined.includes(g.id));

  const handleNearbyTab = () => {
    if (!locationEnabled) setShowOptIn(true);
    setSection("nearby");
  };

  return (
    <div className="max-w-3xl mx-auto relative">
      {/* Location opt-in modal */}
      <AnimatePresence>
        {showOptIn && (
          <LocationOptIn
            onAccept={handleLocationAccept}
            onDecline={() => { setShowOptIn(false); setPendingJoin(null); }}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center gap-2 mb-0.5">
        <HandDrawnVillage size={22} color="hsl(var(--primary))" />
        <h1 className="font-display text-[1.75rem] md:text-4xl font-bold italic text-foreground">Community</h1>
      </div>
      <p className="font-display text-[13px] italic text-muted-foreground mb-4">
        Find your neighbours. Share your gifts. Build the village.
      </p>
      <SignalContextChips pageContext="community" onOpenSignal={(p) => openSignal(p, "community")} compact />

      {/* Tab bar — sticky on mobile */}
      <div className="sticky top-[52px] md:static z-20 bg-background/95 backdrop-blur-sm pb-4 md:pb-5 -mx-5 px-5 md:mx-0 md:px-0 pt-2 md:pt-0">
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
                <span className="absolute top-1 right-1.5 w-[5px] h-[5px] rounded-full bg-phase-follicular" />
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
                      const g = MOCK_GROUPS.find((g) => g.id === id);
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
                          {g.suburb}
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
    </div>
  );
}
