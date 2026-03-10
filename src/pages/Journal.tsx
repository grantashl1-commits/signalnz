import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BotanicalSprig, CymatiSketch } from "@/components/BotanicalElements";
import { getCycleInfo, getLastPeriodStart } from "@/lib/cycle-utils";
import { haptic } from "@/hooks/use-mobile";
import JournalEntries from "@/components/journal/JournalEntries";
import JournalActivities from "@/components/journal/JournalActivities";
import MemoryVault, { saveEntryToVault } from "@/components/journal/MemoryVault";
import DreamStudio from "@/components/journal/DreamStudio";
import type { JournalEntry } from "@/lib/journal-store";

type Tab = "entries" | "activities" | "vault" | "dream";

const TABS: { id: Tab; label: string }[] = [
  { id: "entries", label: "My Entries" },
  { id: "activities", label: "Activities" },
  { id: "vault", label: "Memory Vault" },
  { id: "dream", label: "Dream Studio" },
];

const TAB_TITLES: Record<Tab, string> = {
  entries: "My Journal",
  activities: "Journal Activities",
  vault: "Memory Vault",
  dream: "Dream Studio",
};

export default function JournalPage() {
  const info = getCycleInfo(getLastPeriodStart());
  const [tab, setTab] = useState<Tab>("entries");
  const [vaultRefresh, setVaultRefresh] = useState(0);

  const handleSaveToVault = useCallback((entry: JournalEntry) => {
    haptic("medium");
    saveEntryToVault(entry, "remember");
    setVaultRefresh((v) => v + 1);
  }, []);

  return (
    <div className="max-w-3xl mx-auto relative">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.04]">
        <CymatiSketch phase={info.phase} size={300} opacity={1} className="md:hidden" />
        <CymatiSketch phase={info.phase} size={500} opacity={1} className="hidden md:block" />
      </div>

      {/* Header */}
      <div className="mb-1">
        <p className="font-hand text-sm font-bold text-primary">Journal</p>
        <h1 className="font-display text-[1.5rem] md:text-3xl font-bold italic text-foreground mt-0.5">
          {TAB_TITLES[tab]}
        </h1>
      </div>

      {/* Sub-nav pill */}
      <div className="sticky top-[52px] md:static z-20 bg-background/95 backdrop-blur-sm pb-4 md:pb-6 -mx-5 px-5 md:mx-0 md:px-0 pt-2 md:pt-0">
        <div className="flex bg-muted/60 rounded-2xl p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => { haptic("light"); setTab(t.id); }}
              className={`touch-tab flex-1 py-2.5 rounded-xl font-display text-[13px] transition-all ${
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
          {tab === "entries" && <JournalEntries onSaveToVault={handleSaveToVault} />}
          {tab === "activities" && <JournalActivities />}
          {tab === "vault" && <MemoryVault key={vaultRefresh} />}
          {tab === "dream" && <DreamStudio />}
        </motion.div>
      </AnimatePresence>

      <BotanicalSprig width={160} className="mx-auto mt-8 md:hidden" />
      <BotanicalSprig width={200} className="mx-auto mt-10 hidden md:block" />
    </div>
  );
}
