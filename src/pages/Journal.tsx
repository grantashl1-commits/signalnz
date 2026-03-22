import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BotanicalSprig, CymatiSketch } from "@/components/BotanicalElements";
import { GatedPage } from "@/components/FeatureGate";
import { AtmosphericHero, ContentSection } from "@/components/AtmosphericSection";
import { useCycle } from "@/contexts/CycleContext";
import { haptic } from "@/hooks/use-mobile";
import JournalEntries from "@/components/journal/JournalEntries";
import JournalActivities from "@/components/journal/JournalActivities";
import MemoryVault, { saveEntryToVault } from "@/components/journal/MemoryVault";
import DreamStudio from "@/components/journal/DreamStudio";
import { loadDreamBoard, saveDreamBoard, type JournalEntry, type DreamElement, loadEntries, saveEntries } from "@/lib/journal-store";

type Tab = "entries" | "activities" | "vault" | "dream";

const TABS: { id: Tab; label: string }[] = [
  { id: "entries", label: "My Entries" },
  { id: "activities", label: "Activities" },
  { id: "vault", label: "Memory Vault" },
  { id: "dream", label: "Dream Studio" },
];

const TAB_SUBTITLES: Record<Tab, string> = {
  entries: "Your story, one chapter at a time.",
  activities: "Creative rituals for reflection and play.",
  vault: "Your favourite pieces of your life.",
  dream: "Imagine the life you are quietly building.",
};

export default function JournalPage() {
  const { currentPhase, currentCycleDay } = useCycle();
  const info = { phase: currentPhase, cycleDay: currentCycleDay };
  
  const [tab, setTab] = useState<Tab>("entries");
  const [vaultRefresh, setVaultRefresh] = useState(0);
  const [pinnedEntry, setPinnedEntry] = useState<{ id: string; content: string } | null>(null);

  const handleSaveToVault = useCallback((entry: JournalEntry) => {
    haptic("medium");
    saveEntryToVault(entry, "remember");
    // Mark entry as saved to vault
    const entries = loadEntries();
    const updated = entries.map((e) => e.id === entry.id ? { ...e, savedToVault: true } : e);
    saveEntries(updated);
    setVaultRefresh((v) => v + 1);
  }, []);

  const handlePinToDreamStudio = useCallback((entry: JournalEntry) => {
    haptic("medium");
    const content = Object.values(entry.prompts).filter(Boolean)[0] || entry.title || "";
    const el: DreamElement = {
      id: `pin-${Date.now()}`,
      type: "text",
      content: content.slice(0, 200),
      x: Math.random() * 400 + 100, y: Math.random() * 300 + 100, width: 240, height: 140,
      zIndex: 0,
      linkedEntryId: entry.id,
    };
    const board = loadDreamBoard();
    saveDreamBoard([...board, el]);
    // Mark entry
    const entries = loadEntries();
    const updated = entries.map((e) => e.id === entry.id ? { ...e, pinnedToDreamStudio: true } : e);
    saveEntries(updated);
    setTab("dream");
  }, []);

  return (
    <GatedPage requiredTier="nourished">
    <div className="relative">
      {/* ═══ HERO ═══ */}
      <AtmosphericHero size="md">
        <div className="text-center">
          <p className="font-body text-xs uppercase tracking-[0.3em] text-primary-foreground/40 mb-4">Journal</p>
          <h1 className="font-display text-[3rem] md:text-[4rem] font-extrabold text-primary-foreground leading-[1.02] mb-4">
            {tab === "entries" ? "My Journal" : tab === "activities" ? "Activities" : tab === "vault" ? "Memory Vault" : "Dream Studio"}
          </h1>
          <p className="font-display text-base md:text-lg italic text-primary-foreground/60 max-w-md mx-auto">
            {TAB_SUBTITLES[tab]}
          </p>
        </div>
      </AtmosphericHero>

      <ContentSection className="px-5 md:px-4">

      <div className="sticky top-[52px] md:static z-20 bg-background/95 backdrop-blur-sm pb-4 md:pb-6 -mx-5 px-5 md:mx-0 md:px-0 pt-2 md:pt-0">
        <div className="flex bg-muted/60 rounded-2xl p-1 max-w-xl overflow-x-auto scrollbar-hide">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => { haptic("light"); setTab(t.id); }}
              className={`touch-tab flex-1 py-2.5 rounded-xl font-display text-[12px] md:text-[13px] transition-all whitespace-nowrap min-w-0 ${
                tab === t.id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground italic"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
        >
          {tab === "entries" && <JournalEntries onSaveToVault={handleSaveToVault} onPinToDreamStudio={handlePinToDreamStudio} />}
          {tab === "activities" && <JournalActivities />}
          {tab === "vault" && <MemoryVault key={vaultRefresh} />}
          {tab === "dream" && <DreamStudio pinnedEntry={pinnedEntry} />}
        </motion.div>
      </AnimatePresence>

      <BotanicalSprig width={160} className="mx-auto mt-8 md:hidden" />
      <BotanicalSprig width={200} className="mx-auto mt-10 hidden md:block" />
      </ContentSection>
    </div>
    </GatedPage>
  );
}
