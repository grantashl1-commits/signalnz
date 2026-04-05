import { useState, useCallback, useMemo, useRef } from "react";
import { useAndroidBack } from "@/hooks/useAndroidBack";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ArrowLeft, Search, Check, BookOpen, X, Flame } from "lucide-react";
import { BotanicalSprig } from "@/components/BotanicalElements";
import { GatedPage } from "@/components/FeatureGate";
import { AtmosphericHero, ContentSection } from "@/components/AtmosphericSection";
import { useCycle } from "@/contexts/CycleContext";
import { haptic } from "@/hooks/use-mobile";
import { useDailyStoic, useJournalEntries2, type JournalEntryRow, type StoicLens } from "@/hooks/useStoicJournal";
import StoicJournalSeedCard from "@/components/StoicJournalSeedCard";
import StoicLensDisplay from "@/components/StoicLensDisplay";
import JournalEntries from "@/components/journal/JournalEntries";
import JournalActivities from "@/components/journal/JournalActivities";
import MemoryVault, { saveEntryToVault } from "@/components/journal/MemoryVault";
import DreamStudio from "@/components/journal/DreamStudio";
import MoodCheckin from "@/components/journal/MoodCheckin";
import EntryTypeSelector, { type JournalEntryType } from "@/components/journal/EntryTypeSelector";
import GratitudeEditor from "@/components/journal/GratitudeEditor";
import OneLineEditor from "@/components/journal/OneLineEditor";
import PhaseHeatMap from "@/components/journal/PhaseHeatMap";
import WordCountBar from "@/components/journal/WordCountBar";
import JournalInsights from "@/components/journal/JournalInsights";
import { useJournalSync } from "@/hooks/useJournalSync";
import { loadDreamBoard, saveDreamBoard, type JournalEntry, type DreamElement } from "@/lib/journal-store";
import SomaticPlayer from "@/components/practice/SomaticPlayer";
import type { PracticeConfig } from "@/data/practices";

type Tab = "entries" | "activities" | "vault" | "dream";
type View = "list" | "write" | "detail" | "mood-checkin" | "type-select" | "gratitude" | "one-line";

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

const PHASE_COLORS: Record<string, string> = {
  menstrual: "bg-phase-menstrual",
  follicular: "bg-phase-follicular",
  ovulatory: "bg-phase-ovulatory",
  luteal: "bg-phase-luteal",
};

const PHASE_HEX: Record<string, string> = {
  menstrual: "#C4526E",
  follicular: "#5C4A9E",
  ovulatory: "#C47A8A",
  luteal: "#9B89B4",
};

// Phase-aware placeholder prompts
const PHASE_PROMPTS: Record<string, Record<string, string>> = {
  menstrual: {
    default: "What does your body want you to know right now?",
    heavy: "What are you carrying that's ready to be put down?",
  },
  follicular: {
    default: "What's possible for you in the days ahead?",
    clear: "What do you want to build or begin?",
  },
  ovulatory: {
    default: "Who are you being right now, and who do you want to be?",
    grounded: "What are you most ready to offer or express?",
  },
  luteal: {
    default: "What's asking for your attention that you've been avoiding?",
    heavy: "What would it mean to be gentle with yourself today?",
    unsettled: "What feeling keeps returning, and what is it protecting?",
  },
};

function getPlaceholder(phase: string, mood: string | null): string {
  if (mood === "open") return "Start anywhere — your words will find their way.";
  const phasePrompts = PHASE_PROMPTS[phase] || PHASE_PROMPTS.luteal;
  return (mood && phasePrompts[mood]) || phasePrompts.default || "Start writing...";
}

// ── Stoic TTS player config ──
function stoicToPracticeConfig(reading: { title: string; tts_script: string | null; duration_sec: number | null; seq_day: number }): PracticeConfig {
  return {
    id: `stoic-day-${reading.seq_day}`,
    title: reading.title,
    subtitle: `Day ${reading.seq_day} of 366`,
    category: "somatic",
    mode: "narrated-sequence",
    durationSec: reading.duration_sec || 240,
    audio: { enabled: true, audioUrl: `/audio/stoic-${reading.seq_day}.mp3`, durationSec: reading.duration_sec || 240, voiceName: "SIGNAL Calm", provider: "elevenlabs" },
    steps: [{ id: "s1", title: "Reading", body: reading.tts_script || "", startTimeSec: 0, endTimeSec: reading.duration_sec || 240 }],
  };
}

// ── Streak calculation ──
function calculateStreak(entries: JournalEntryRow[]): number {
  if (entries.length === 0) return 0;
  const dates = [...new Set(entries.map((e) => e.date || e.created_at?.split("T")[0]))].sort().reverse();
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  if (dates[0] !== today && dates[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diff = (prev.getTime() - curr.getTime()) / 86400000;
    if (Math.round(diff) === 1) streak++;
    else break;
  }
  return streak;
}

// ── Today's Stoic Card (compact, top of journal) ──
function TodayStoicCard({ onListen, onWrite }: { onListen: () => void; onWrite: () => void }) {
  const { currentDay, reading, listenedToday, loading } = useDailyStoic();

  if (loading || !reading) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="card-warm p-4 mb-5">
      <div className="flex items-center gap-2 mb-2">
        <BookOpen className="h-4 w-4 text-primary" />
        <span className="font-mono text-[11px] text-muted-foreground">Day {currentDay} of 366</span>
      </div>
      <h3 className="font-display text-lg italic text-foreground mb-1">"{reading.title}"</h3>
      <p className="font-mono text-[10px] text-muted-foreground mb-3">{reading.author} · {reading.source}</p>
      <div className="flex gap-3">
        <button
          onClick={() => { haptic("medium"); onListen(); }}
          className={`touch-btn flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 font-display text-sm italic transition-all ${
            listenedToday ? "bg-phase-follicular/10 text-phase-follicular" : "bg-secondary text-foreground active:scale-[0.97]"
          }`}
        >
          {listenedToday ? "✓ Listened today" : `▶ Listen · ${Math.round((reading.duration_sec || 240) / 60)} min`}
        </button>
        <button
          onClick={() => { haptic("medium"); onWrite(); }}
          className="touch-btn flex-1 rounded-xl bg-primary py-2.5 font-display text-sm italic text-primary-foreground active:scale-[0.97]"
        >
          Write + Reflect
        </button>
      </div>
      {/* Progress bar */}
      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1 h-1 rounded-full bg-muted/40 overflow-hidden">
          <div className="h-full rounded-full bg-primary/40" style={{ width: `${(currentDay / 366) * 100}%` }} />
        </div>
        <span className="font-mono text-[9px] text-muted-foreground/50">{currentDay} / 366</span>
      </div>
    </motion.div>
  );
}

// ── Writing View (Standard Reflection) ──
function WritingView({
  mood,
  onSave,
  onClose,
}: {
  mood: string | null;
  onSave: (content: string, wordCount: number) => void;
  onClose: () => void;
}) {
  const { currentPhase } = useCycle();
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(false);
  const { currentDay, reading, listenedToday, markListened } = useDailyStoic();
  const [showStoicCard, setShowStoicCard] = useState(true);
  const [showPlayer, setShowPlayer] = useState(false);

  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const placeholder = getPlaceholder(currentPhase, mood);

  const handleSave = () => {
    if (!text.trim()) return;
    setSaved(true);
    onSave(text, wordCount);
  };

  const handleListen = () => {
    setShowPlayer(true);
    markListened();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-[100] flex flex-col bg-background"
      style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-lg italic text-foreground">New Entry</h2>
          {mood && (
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">{mood}</span>
          )}
        </div>
        <button onClick={onClose} className="text-muted-foreground min-w-[44px] min-h-[44px] flex items-center justify-center">
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="flex-1 flex flex-col px-5 pb-6 pt-4 overflow-y-auto">
        {reading && showStoicCard && (
          <StoicJournalSeedCard
            reading={reading}
            currentDay={currentDay}
            listenedToday={listenedToday}
            onListen={handleListen}
            onSkip={() => setShowStoicCard(false)}
          />
        )}

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 w-full resize-none bg-transparent font-hand text-lg text-foreground leading-relaxed placeholder:text-muted-foreground/30 focus:outline-none min-h-[200px]"
          placeholder={placeholder}
          autoFocus
          style={{ caretColor: "hsl(14, 100%, 64%)", fontSize: "18px" }}
        />

        <WordCountBar wordCount={wordCount} phaseColor={PHASE_HEX[currentPhase] || "#C4526E"} />

        <div className="flex items-center justify-between gap-3 mt-4">
          <span className="font-mono text-xs text-muted-foreground">{wordCount} words</span>
          <button
            onClick={handleSave}
            disabled={!text.trim()}
            className="touch-btn rounded-xl bg-primary px-6 py-3 min-h-[52px] font-body text-sm font-bold text-primary-foreground active:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
          >
            {saved ? <Check className="h-4 w-4" /> : null}
            {saved ? "Saved" : "Save"}
          </button>
        </div>
      </div>

      {showPlayer && reading && (
        <SomaticPlayer practice={stoicToPracticeConfig(reading)} onClose={() => setShowPlayer(false)} />
      )}
    </motion.div>
  );
}

// ── Entry Detail View ──
function EntryDetailView({
  entry,
  onBack,
  onLensGenerated,
}: {
  entry: JournalEntryRow;
  onBack: () => void;
  onLensGenerated: (lens: StoicLens) => void;
}) {
  const { currentPhase, currentCycleDay } = useCycle();
  const { reading, listenedToday, markListened } = useDailyStoic();
  const [showPlayer, setShowPlayer] = useState(false);

  const createdDate = new Date(entry.created_at);
  const isToday = createdDate.toDateString() === new Date().toDateString();
  const dateLabel = isToday ? "Today" : createdDate.toLocaleDateString("en-NZ", { weekday: "long", day: "numeric", month: "short" });
  const timeLabel = createdDate.toLocaleTimeString("en-NZ", { hour: "2-digit", minute: "2-digit" });
  const readTime = entry.word_count && entry.word_count > 100 ? `${Math.max(1, Math.round(entry.word_count / 200))} min read` : "";

  const handleListen = () => { setShowPlayer(true); markListened(); };

  const displayContent = entry.content || (entry.prompts ? Object.values(entry.prompts).filter(Boolean).join("\n\n") : "");

  // Entry type badge
  const typeBadge = entry.entry_type === "gratitude" ? "· Gratitude" : entry.entry_type === "one-line" ? "· One line" : null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <span className="font-mono text-[11px] text-muted-foreground">{readTime}</span>
      </div>

      <div>
        <p className="font-mono text-xs text-muted-foreground mb-1">{dateLabel}, {timeLabel}</p>
        <div className="flex items-center gap-2 mb-4">
          {entry.mood && (
            <span className="w-2 h-2 rounded-full" style={{
              backgroundColor: entry.mood === "heavy" ? "#C4526E" : entry.mood === "clear" ? "#5C4A9E" : entry.mood === "grounded" ? "#C47A8A" : entry.mood === "unsettled" ? "#9B89B4" : "#999",
            }} />
          )}
          {entry.mood && <span className="font-mono text-[11px] text-muted-foreground capitalize">{entry.mood}</span>}
          {entry.cycle_phase && (
            <span className="font-mono text-[11px] text-muted-foreground">· {entry.cycle_phase} · Day {entry.cycle_day}</span>
          )}
          {typeBadge && <span className="font-mono text-[11px] text-muted-foreground">{typeBadge}</span>}
        </div>
      </div>

      <div className="font-hand text-lg text-foreground leading-relaxed whitespace-pre-wrap">{displayContent}</div>

      {(entry.stoic_seq_day || entry.stoic_lens) && (
        <div className="pt-4 border-t border-border/30">
          <StoicLensDisplay
            entryId={entry.id}
            entryContent={displayContent}
            reading={reading}
            currentPhase={entry.cycle_phase || currentPhase}
            cycleDay={entry.cycle_day || currentCycleDay}
            cycleMode={entry.cycle_mode || "cycling"}
            existingLens={entry.stoic_lens}
            listenedToday={listenedToday}
            onLensGenerated={onLensGenerated}
            onListen={handleListen}
          />
        </div>
      )}

      {entry.stoic_seq_day && reading && (
        <button
          onClick={handleListen}
          className="flex items-center gap-2 rounded-xl bg-secondary/60 px-4 py-3 font-display text-sm italic text-foreground hover:bg-secondary transition-colors w-full justify-center"
        >
          ▶ Listen again · Day {entry.stoic_seq_day}
        </button>
      )}

      {showPlayer && reading && (
        <SomaticPlayer practice={stoicToPracticeConfig(reading)} onClose={() => setShowPlayer(false)} />
      )}
    </motion.div>
  );
}

// ── Stoic Entry List Card ──
function StoicEntryCard({ entry, onClick }: { entry: JournalEntryRow; onClick: () => void }) {
  const createdDate = new Date(entry.created_at);
  const isToday = createdDate.toDateString() === new Date().toDateString();
  const dateLabel = isToday ? "Today" : createdDate.toLocaleDateString("en-NZ", { weekday: "short", day: "numeric", month: "short" });
  const timeLabel = createdDate.toLocaleTimeString("en-NZ", { hour: "2-digit", minute: "2-digit" });
  const preview = (entry.content || entry.title || Object.values(entry.prompts || {}).filter(Boolean)[0] || "").slice(0, 100);
  const readTime = entry.word_count && entry.word_count > 100 ? `${Math.max(1, Math.round(entry.word_count / 200))} min read` : "";

  const typeBadge = entry.entry_type === "gratitude" ? "· Gratitude" : entry.entry_type === "one-line" ? "· One line" : null;

  const MOOD_COLORS: Record<string, string> = {
    heavy: "#C4526E", clear: "#5C4A9E", grounded: "#C47A8A", unsettled: "#9B89B4", open: "#999",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="card-warm p-4 cursor-pointer hover:shadow-md transition-shadow"
      style={entry.cycle_phase ? { backgroundColor: `${PHASE_HEX[entry.cycle_phase] || "#999"}08` } : undefined}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono text-[11px] text-muted-foreground">{dateLabel} · {timeLabel}</span>
        {readTime && <span className="font-mono text-[10px] text-muted-foreground/50">{readTime}</span>}
      </div>

      {typeBadge ? (
        <p className="font-display text-sm italic text-foreground mb-2">{typeBadge}</p>
      ) : (
        <p className="font-display text-sm italic text-foreground leading-relaxed mb-2 line-clamp-2">"{preview}..."</p>
      )}

      {entry.mood && (
        <div className="flex items-center gap-1.5 mb-1">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: MOOD_COLORS[entry.mood] || "#999" }} />
          <span className="font-mono text-[10px] text-muted-foreground capitalize">{entry.mood}</span>
        </div>
      )}

      {entry.stoic_seq_day && (
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="h-3 w-3 text-primary" />
          <span className="font-mono text-[10px] text-muted-foreground">Day {entry.stoic_seq_day} · {entry.stoic_title}</span>
        </div>
      )}
      {entry.stoic_lens && (
        <div className="flex items-center gap-1.5">
          <span className="text-[10px]">🌿</span>
          <span className="font-mono text-[10px] text-phase-follicular">Reflection saved</span>
        </div>
      )}

      {entry.cycle_phase && (
        <div className="flex items-center gap-1.5 mt-2">
          <span className={`w-1.5 h-1.5 rounded-full ${PHASE_COLORS[entry.cycle_phase] || "bg-muted"}`} />
          <span className="font-mono text-[10px] text-muted-foreground">{entry.cycle_phase} · day {entry.cycle_day}</span>
        </div>
      )}
    </motion.div>
  );
}

// ── MAIN PAGE ──
export default function JournalPage() {
  const { currentPhase, currentCycleDay } = useCycle();
  const [tab, setTab] = useState<Tab>("entries");
  const [view, setView] = useState<View>("list");
  const [selectedEntry, setSelectedEntry] = useState<JournalEntryRow | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStoic, setFilterStoic] = useState(false);
  const [pinnedEntry, setPinnedEntry] = useState<{ id: string; content: string } | null>(null);
  const [currentMood, setCurrentMood] = useState<string | null>(null);

  const { currentDay, reading, listenedToday, markListened, advanceDay } = useDailyStoic();
  const { entries, loading, saveEntry, updateStoicLens } = useJournalEntries2();
  const journalSync = useJournalSync();

  const [showPlayer, setShowPlayer] = useState(false);
  const [postSaveEntry, setPostSaveEntry] = useState<JournalEntryRow | null>(null);

  const streak = useMemo(() => calculateStreak(entries), [entries]);

  // Android back button support — close internal views before leaving page
  const handleAndroidBack = useCallback(() => {
    if (view === "write" || view === "detail" || view === "mood-checkin" ||
        view === "type-select" || view === "gratitude" || view === "one-line") {
      setView("list");
      return true;
    }
    return false;
  }, [view]);
  useAndroidBack(handleAndroidBack);

  // Start the write flow: show entry type selector
  const handleWrite = () => setView("type-select");

  // Entry type selected → mood check-in for standard, skip for others
  const handleTypeSelect = (type: JournalEntryType) => {
    if (type === "standard") {
      setView("mood-checkin");
    } else if (type === "gratitude") {
      setView("gratitude");
    } else {
      setView("one-line");
    }
  };

  const handleMoodSelected = (mood: string) => {
    setCurrentMood(mood);
    setView("write");
  };

  const handleMoodSkip = () => {
    setCurrentMood(null);
    setView("write");
  };

  const handleListen = () => {
    setShowPlayer(true);
    markListened();
  };

  const handleSave = async (content: string, wordCount: number, entryType: string = "standard") => {
    const saved = await saveEntry({
      content,
      word_count: wordCount,
      entry_type: entryType,
      mood: currentMood || undefined,
      cycle_phase: currentPhase,
      cycle_day: currentCycleDay,
      cycle_mode: "cycling",
      stoic_seq_day: entryType === "standard" ? reading?.seq_day : undefined,
      stoic_title: entryType === "standard" ? reading?.title : undefined,
    });

    if (saved) {
      setPostSaveEntry(saved);
      if (listenedToday && entryType === "standard") advanceDay();
    }
    setView("list");
    setCurrentMood(null);
  };

  const handleLensGenerated = (lens: StoicLens) => {
    if (selectedEntry) updateStoicLens(selectedEntry.id, lens);
    if (postSaveEntry) updateStoicLens(postSaveEntry.id, lens);
  };

  const filteredEntries = useMemo(() => {
    let list = entries;
    if (filterStoic) list = list.filter((e) => e.stoic_lens);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((e) =>
        (e.content || "").toLowerCase().includes(q) ||
        (e.title || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [entries, filterStoic, searchQuery]);

  const handleHeatMapTap = (date: string, entry?: JournalEntryRow) => {
    if (entry) {
      setSelectedEntry(entry);
      setView("detail");
    } else {
      handleWrite();
    }
  };

  // Legacy journal sync callbacks
  const handleSaveToVault = useCallback(async (entry: JournalEntry) => {
    haptic("medium");
    const preview = Object.values(entry.prompts).filter(Boolean)[0] || "";
    const ve = { id: Date.now().toString(), entryId: entry.id, category: "remember", title: entry.title || entry.date, preview: preview.slice(0, 150), date: entry.date, timestamp: entry.timestamp };
    await journalSync.saveVaultEntry(ve);
    await journalSync.updateEntry({ ...entry, savedToVault: true });
  }, [journalSync]);

  const handlePinToDreamStudio = useCallback(async (entry: JournalEntry) => {
    haptic("medium");
    const content = Object.values(entry.prompts).filter(Boolean)[0] || entry.title || "";
    const el: DreamElement = { id: `pin-${Date.now()}`, type: "text", content: content.slice(0, 200), x: Math.random() * 400 + 100, y: Math.random() * 300 + 100, width: 240, height: 140, zIndex: 0, linkedEntryId: entry.id };
    const board = loadDreamBoard();
    saveDreamBoard([...board, el]);
    await journalSync.updateEntry({ ...entry, pinnedToDreamStudio: true });
    setTab("dream");
  }, [journalSync]);

  return (
    <GatedPage requiredTier="nourished">
      <div className="relative">
        <AtmosphericHero size="md">
          <div className="text-center">
            <p className="font-body text-xs uppercase tracking-[0.3em] text-primary-foreground/40 mb-4">Journal</p>
            <h1 className="font-display text-[3rem] md:text-[4rem] font-extrabold text-primary-foreground leading-[1.02] mb-4">
              {tab === "entries" ? "My Journal" : tab === "activities" ? "Activities" : tab === "vault" ? "Memory Vault" : "Dream Studio"}
            </h1>
            <div className="flex items-center justify-center gap-3">
              <p className="font-display text-base md:text-lg italic text-primary-foreground/60 max-w-md">
                {TAB_SUBTITLES[tab]}
              </p>
              {streak > 0 && tab === "entries" && (
                <span className="flex items-center gap-1 font-mono text-xs text-primary-foreground/50">
                  <Flame className="h-3.5 w-3.5 text-orange-400" />
                  {streak} day{streak > 1 ? "s" : ""}
                  {streak >= 7 ? " — you're building something real" : ""}
                </span>
              )}
            </div>
          </div>
        </AtmosphericHero>

        <ContentSection className="px-5 md:px-4">
          {/* Tabs */}
          <div className="sticky top-0 md:static z-20 bg-background/95 backdrop-blur-sm pb-4 md:pb-6 -mx-5 px-5 md:mx-0 md:px-0 pt-2 md:pt-0">
            <div className="flex bg-muted/60 rounded-2xl p-1 max-w-xl overflow-x-auto scrollbar-hide">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { haptic("light"); setTab(t.id); setView("list"); setSelectedEntry(null); setPostSaveEntry(null); }}
                  className={`touch-tab flex-1 py-2.5 rounded-xl font-display text-[12px] md:text-[13px] transition-all whitespace-nowrap min-w-0 ${
                    tab === t.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground italic"
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
              {tab === "entries" && view === "list" && (
                <div className="space-y-4">
                  {/* Today's Stoic card */}
                  <TodayStoicCard onListen={handleListen} onWrite={handleWrite} />

                  {/* Post-save Stoic Lens prompt */}
                  {postSaveEntry && !postSaveEntry.stoic_lens && postSaveEntry.stoic_seq_day && (
                    <div className="mb-4">
                      <StoicLensDisplay
                        entryId={postSaveEntry.id}
                        entryContent={postSaveEntry.content || ""}
                        reading={reading}
                        currentPhase={currentPhase}
                        cycleDay={currentCycleDay}
                        cycleMode="cycling"
                        existingLens={null}
                        listenedToday={listenedToday}
                        onLensGenerated={handleLensGenerated}
                        onListen={handleListen}
                      />
                    </div>
                  )}

                  {/* Phase Heat Map */}
                  <PhaseHeatMap entries={entries} onTapDay={handleHeatMapTap} />

                  {/* New Entry + Search */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleWrite}
                      className="touch-btn flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-display text-sm italic text-primary-foreground active:scale-[0.97]"
                    >
                      <Plus className="h-4 w-4" /> Write
                    </button>
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search entries..."
                        className="w-full rounded-xl border border-border bg-background pl-9 pr-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  {/* Filter */}
                  <button
                    onClick={() => setFilterStoic(!filterStoic)}
                    className={`rounded-full px-3 py-1.5 font-mono text-[11px] transition-colors ${
                      filterStoic ? "bg-primary text-primary-foreground" : "bg-muted/60 text-muted-foreground"
                    }`}
                  >
                    With Stoic reflection
                  </button>

                  {/* Entry list */}
                  {filteredEntries.length > 0 ? (
                    <div className="space-y-3">
                      {filteredEntries.map((entry) => (
                        <StoicEntryCard
                          key={entry.id}
                          entry={entry}
                          onClick={() => { setSelectedEntry(entry); setView("detail"); }}
                        />
                      ))}
                    </div>
                  ) : (
                    <JournalEntries
                      onSaveToVault={handleSaveToVault}
                      onPinToDreamStudio={handlePinToDreamStudio}
                      journalSync={journalSync}
                    />
                  )}

                  {/* Journal Insights */}
                  <JournalInsights entries={entries} />
                </div>
              )}

              {tab === "entries" && view === "detail" && selectedEntry && (
                <EntryDetailView
                  entry={selectedEntry}
                  onBack={() => { setView("list"); setSelectedEntry(null); }}
                  onLensGenerated={handleLensGenerated}
                />
              )}

              {tab === "activities" && <JournalActivities />}
              {tab === "vault" && (
                <MemoryVault
                  vault={journalSync.vault}
                  onSaveVaultEntry={journalSync.saveVaultEntry}
                  onRemoveVaultEntry={journalSync.removeVaultEntry}
                />
              )}
              {tab === "dream" && <DreamStudio pinnedEntry={pinnedEntry} />}
            </motion.div>
          </AnimatePresence>

          <BotanicalSprig width={160} className="mx-auto mt-8 md:hidden" />
          <BotanicalSprig width={200} className="mx-auto mt-10 hidden md:block" />
        </ContentSection>

        {/* Entry Type Selector */}
        <AnimatePresence>
          {view === "type-select" && (
            <EntryTypeSelector onSelect={handleTypeSelect} onCancel={() => setView("list")} />
          )}
        </AnimatePresence>

        {/* Mood Check-in */}
        <AnimatePresence>
          {view === "mood-checkin" && (
            <MoodCheckin
              phaseColor={PHASE_HEX[currentPhase] || "#C4526E"}
              onSelect={handleMoodSelected}
              onSkip={handleMoodSkip}
            />
          )}
        </AnimatePresence>

        {/* Standard Writing modal */}
        <AnimatePresence>
          {view === "write" && (
            <WritingView mood={currentMood} onSave={(c, w) => handleSave(c, w, "standard")} onClose={() => setView("list")} />
          )}
        </AnimatePresence>

        {/* Gratitude Editor */}
        <AnimatePresence>
          {view === "gratitude" && (
            <GratitudeEditor
              phase={currentPhase}
              onSave={(c, w) => handleSave(c, w, "gratitude")}
              onClose={() => setView("list")}
            />
          )}
        </AnimatePresence>

        {/* One-Line Editor */}
        <AnimatePresence>
          {view === "one-line" && (
            <OneLineEditor
              onSave={(c, w) => handleSave(c, w, "one-line")}
              onClose={() => setView("list")}
            />
          )}
        </AnimatePresence>

        {/* Stoic TTS Player */}
        {showPlayer && reading && (
          <SomaticPlayer practice={stoicToPracticeConfig(reading)} onClose={() => setShowPlayer(false)} />
        )}
      </div>
    </GatedPage>
  );
}
