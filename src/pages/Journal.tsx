import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BotanicalSprig, CymatiSketch } from "@/components/BotanicalElements";
import { AtmosphericHero, ContentSection } from "@/components/AtmosphericSection";
import { getCycleInfo, getLastPeriodStart } from "@/lib/cycle-utils";
import { haptic } from "@/hooks/use-mobile";
import JournalEntries from "@/components/journal/JournalEntries";
import JournalActivities from "@/components/journal/JournalActivities";
import MemoryVault, { saveEntryToVault } from "@/components/journal/MemoryVault";
import DreamStudio from "@/components/journal/DreamStudio";
import { loadDreamBoard, saveDreamBoard, type JournalEntry, type DreamElement, loadEntries, saveEntries } from "@/lib/journal-store";
import SignalContextChips from "@/components/signal/SignalContextChips";
import { useSignalPanel } from "@/hooks/useSignalPanel";

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
  const info = getCycleInfo(getLastPeriodStart());
  const { openSignal } = useSignalPanel();
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
    <div className="relative">
      {/* ═══ HERO ═══ */}
      <AtmosphericHero size="md">
        <div className="text-center">
          <p className="font-body text-[10px] uppercase tracking-[0.25em] text-primary-foreground/50 mb-3">Journal</p>
          <h1 className="font-display text-[2.5rem] md:text-[3.5rem] font-extrabold text-primary-foreground leading-[1.05] mb-3">
            {tab === "entries" ? "My Journal" : tab === "activities" ? "Activities" : tab === "vault" ? "Memory Vault" : "Dream Studio"}
          </h1>
          <p className="font-display text-base md:text-lg italic text-primary-foreground/70 max-w-md mx-auto">
            {TAB_SUBTITLES[tab]}
          </p>
        </div>
      </AtmosphericHero>

      <ContentSection className="px-5 md:px-4">
        {/* Signal context chips */}
        <div className="mb-4">
          <SignalContextChips
            pageContext={tab === "dream" ? "dream" : "journal"}
            onOpenSignal={(prompt) => openSignal(prompt, tab === "dream" ? "dream" : "journal")}
            compact
          />
        </div>

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
  );
}
