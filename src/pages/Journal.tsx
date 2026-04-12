import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useAndroidBack } from "@/hooks/useAndroidBack";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ArrowLeft, Search, Check, BookOpen, X } from "lucide-react";
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
import GratitudeEditor from "@/components/journal/GratitudeEditor";
import OneLineEditor from "@/components/journal/OneLineEditor";
import JournalInsights from "@/components/journal/JournalInsights";
import { useJournalSync } from "@/hooks/useJournalSync";
import { loadDreamBoard, saveDreamBoard, type JournalEntry, type DreamElement } from "@/lib/journal-store";
import DreamStudio from "@/components/journal/DreamStudio";
import StoicAudioPlayer from "@/components/StoicAudioPlayer";

type Tab = "write" | "entries" | "insights" | "vision";
type View = "list" | "write" | "detail" | "gratitude" | "one-line";
type EntryType = "reflect" | "gratitude" | "one line";

const TABS: { id: Tab; label: string }[] = [
  { id: "write", label: "Write" },
  { id: "entries", label: "Journal Entries" },
  { id: "insights", label: "Memories" },
  { id: "vision", label: "Vision Board" },
];

const TAB_SUBTITLES: Record<Tab, string> = {
  write: "Your story, one chapter at a time.",
  entries: "Everything you've written.",
  insights: "Patterns, reflections, and memories.",
  vision: "Visualise the life you're creating.",
};

const TAB_TITLES: Record<Tab, string> = {
  write: "Reflect",
  entries: "Reflect",
  insights: "Reflect",
  vision: "Reflect",
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

function buildStoicReadingText(reading: { seq_day: number; title: string; quote: string; source: string; reflection: string }): string {
  return `Day ${reading.seq_day}.\n\n${reading.title}.\n\n"${reading.quote}"\n\n— ${reading.source}\n\n${reading.reflection}`;
}

// ── Writing View (with inline mood + type + collapsible stoic) ──
function WritingView({
  mood,
  entryType,
  onSave,
  onClose,
}: {
  mood: string | null;
  entryType: EntryType;
  onSave: (content: string, wordCount: number) => void;
  onClose: () => void;
}) {
  const { currentPhase } = useCycle();
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(false);
  const { currentDay, reading, listenedToday, markListened } = useDailyStoic();
  const [stoicOpen, setStoicOpen] = useState(false);
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
            <span className="font-body text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">{mood}</span>
          )}
        </div>
        <button onClick={onClose} className="text-muted-foreground min-w-[44px] min-h-[44px] flex items-center justify-center">
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="flex-1 flex flex-col px-5 pb-6 pt-4 overflow-y-auto">
        {/* Collapsible Stoic card */}
        {reading && (
          <>
            <button
              onClick={() => setStoicOpen(!stoicOpen)}
              className="flex items-center gap-2 text-muted-foreground/30 font-body text-[10px] tracking-wide mb-3"
            >
              <span>{stoicOpen ? "▾" : "▸"}</span>
              <span>today's stoic</span>
            </button>
            {stoicOpen && (
              <StoicJournalSeedCard
                reading={reading}
                currentDay={currentDay}
                listenedToday={listenedToday}
                onListen={handleListen}
                onSkip={() => setStoicOpen(false)}
              />
            )}
          </>
        )}

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 w-full resize-none bg-transparent font-hand text-lg text-foreground leading-relaxed placeholder:text-muted-foreground/30 focus:outline-none min-h-[200px]"
          placeholder={placeholder}
          autoFocus
          style={{ caretColor: "hsl(14, 100%, 64%)", fontSize: "18px" }}
        />

        <div className="flex items-center justify-between gap-3 mt-4">
          <span className="font-body text-xs text-muted-foreground">{wordCount} words</span>
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
        <StoicAudioPlayer title={reading.title} text={buildStoicReadingText(reading)} onClose={() => setShowPlayer(false)} />
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

  const typeBadge = entry.entry_type === "gratitude" ? "· Gratitude" : entry.entry_type === "one-line" ? "· One line" : null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <span className="font-body text-[11px] text-muted-foreground">{readTime}</span>
      </div>

      <div>
        <p className="font-body text-xs text-muted-foreground mb-1">{dateLabel}, {timeLabel}</p>
        <div className="flex items-center gap-2 mb-4">
          {entry.mood && (
            <span className="w-2 h-2 rounded-full" style={{
              backgroundColor: entry.mood === "heavy" ? "#C4526E" : entry.mood === "clear" ? "#5C4A9E" : entry.mood === "grounded" ? "#C47A8A" : entry.mood === "unsettled" ? "#9B89B4" : "#999",
            }} />
          )}
          {entry.mood && <span className="font-body text-[11px] text-muted-foreground capitalize">{entry.mood}</span>}
          {entry.cycle_phase && (
            <span className="font-body text-[11px] text-muted-foreground">· {entry.cycle_phase} · Day {entry.cycle_day}</span>
          )}
          {typeBadge && <span className="font-body text-[11px] text-muted-foreground">{typeBadge}</span>}
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
        <StoicAudioPlayer title={reading.title} text={buildStoicReadingText(reading)} onClose={() => setShowPlayer(false)} />
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
        <span className="font-body text-[11px] text-muted-foreground">{dateLabel} · {timeLabel}</span>
        {readTime && <span className="font-body text-[10px] text-muted-foreground/50">{readTime}</span>}
      </div>

      {typeBadge ? (
        <p className="font-display text-sm italic text-foreground mb-2">{typeBadge}</p>
      ) : (
        <p className="font-display text-sm italic text-foreground leading-relaxed mb-2 line-clamp-2">"{preview}..."</p>
      )}

      {entry.mood && (
        <div className="flex items-center gap-1.5 mb-1">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: MOOD_COLORS[entry.mood] || "#999" }} />
          <span className="font-body text-[10px] text-muted-foreground capitalize">{entry.mood}</span>
        </div>
      )}

      {entry.stoic_seq_day && (
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="h-3 w-3 text-primary" />
          <span className="font-body text-[10px] text-muted-foreground">Day {entry.stoic_seq_day} · {entry.stoic_title}</span>
        </div>
      )}
      {entry.stoic_lens && (
        <div className="flex items-center gap-1.5">
          <span className="text-[10px]">🌿</span>
          <span className="font-body text-[10px] text-primary">Reflection saved</span>
        </div>
      )}

      {entry.cycle_phase && (
        <div className="flex items-center gap-1.5 mt-2">
          <span className={`w-1.5 h-1.5 rounded-full ${PHASE_COLORS[entry.cycle_phase] || "bg-muted"}`} />
          <span className="font-body text-[10px] text-muted-foreground">{entry.cycle_phase} · day {entry.cycle_day}</span>
        </div>
      )}
    </motion.div>
  );
}

// ── MAIN PAGE ──
export default function JournalPage() {
  const { currentPhase, currentCycleDay } = useCycle();
  const [tab, setTab] = useState<Tab>("write");
  const [view, setView] = useState<View>("list");
  const [selectedEntry, setSelectedEntry] = useState<JournalEntryRow | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStoic, setFilterStoic] = useState(false);
  const [pinnedEntry, setPinnedEntry] = useState<{ id: string; content: string } | null>(null);
  const [currentMood, setCurrentMood] = useState<string | null>(null);
  const [entryType, setEntryType] = useState<EntryType>("reflect");
  const [promptIdx, setPromptIdx] = useState(0);

  const { currentDay, reading, listenedToday, markListened, advanceDay } = useDailyStoic();
  const { entries, loading, saveEntry, updateStoicLens } = useJournalEntries2();
  const journalSync = useJournalSync();

  const [showPlayer, setShowPlayer] = useState(false);
  const [postSaveEntry, setPostSaveEntry] = useState<JournalEntryRow | null>(null);

  const MYTH_PROMPTS_COUNT = 25;
  useEffect(() => {
    const interval = setInterval(() => {
      setPromptIdx((prev) => (prev + 1) % MYTH_PROMPTS_COUNT);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAndroidBack = useCallback(() => {
    if (view === "write" || view === "detail" || view === "gratitude" || view === "one-line") {
      setView("list");
      return true;
    }
    return false;
  }, [view]);
  useAndroidBack(handleAndroidBack);

  const handleWrite = () => {
    if (entryType === "gratitude") {
      setView("gratitude");
    } else if (entryType === "one line") {
      setView("one-line");
    } else {
      setView("write");
    }
  };

  const handleListen = () => {
    setShowPlayer(true);
    markListened();
  };

  const handleSave = async (content: string, wordCount: number, saveEntryType: string = "standard") => {
    const saved = await saveEntry({
      content,
      word_count: wordCount,
      entry_type: saveEntryType,
      mood: currentMood || undefined,
      cycle_phase: currentPhase,
      cycle_day: currentCycleDay,
      cycle_mode: "cycling",
      stoic_seq_day: saveEntryType === "standard" ? reading?.seq_day : undefined,
      stoic_title: saveEntryType === "standard" ? reading?.title : undefined,
    });

    if (saved) {
      setPostSaveEntry(saved);
      if (listenedToday && saveEntryType === "standard") advanceDay();
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
  }, [journalSync]);

  return (
    <GatedPage requiredTier="nourished">
      <div className="relative">
        <AtmosphericHero size="md">
          <div className="text-center">
            <p className="font-body text-xs uppercase tracking-[0.3em] text-primary-foreground/40 mb-4">Journal</p>
            <h1 className="font-display text-[3rem] md:text-[4rem] font-extrabold text-primary-foreground leading-[1.02] mb-4">Reflect</h1>
            <p className="font-editorial text-base md:text-lg italic text-primary-foreground/60 max-w-md mx-auto">
              {TAB_SUBTITLES[tab]}
            </p>
          </div>
        </AtmosphericHero>

        <ContentSection className="px-5 md:px-4">
          {/* Tabs */}
          <div className="sticky top-0 md:static z-20 bg-background/95 backdrop-blur-sm pb-4 md:pb-6 -mx-5 px-5 md:mx-0 md:px-0 pt-2 md:pt-0">
            <div className="flex bg-muted/60 rounded-2xl p-1 max-w-md overflow-x-auto scrollbar-hide">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { haptic("light"); setTab(t.id); setView("list"); setSelectedEntry(null); setPostSaveEntry(null); }}
                  className={`touch-tab flex-1 py-2.5 rounded-xl font-display text-[13px] transition-all whitespace-nowrap ${
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
              {/* ═══ WRITE TAB ═══ */}
              {tab === "write" && view === "list" && (
                <div className="space-y-8 md:space-y-10">

                  {/* Write button */}
                  <button
                    onClick={handleWrite}
                    className="touch-btn w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-4 font-display text-base italic text-primary-foreground active:scale-[0.97]"
                  >
                    <Plus className="h-4 w-4" /> Start writing
                  </button>

                  {/* Daily prompt + stats strip */}
                  {(() => {
                    const MYTH_PROMPTS = [
                      "What stories have you been telling yourself about who you are?",
                      "What would be possible if you rewrote your most limiting belief?",
                      "Where in your life are you refusing the call to adventure?",
                      "What part of yourself have you been hiding from the world?",
                      "Who have been the mentors in your life, and what wisdom did they offer?",
                      "What fears are you carrying that no longer serve you?",
                      "What does your inner hero look like when you let them speak?",
                      "What moment in your life marked a crossing of the threshold?",
                      "What would it mean to yield to what life is asking of you right now?",
                      "What shadow are you avoiding that might hold your greatest gift?",
                      "When did your plans fall apart — and what grew from the wreckage?",
                      "What does the unknown feel like in your body right now?",
                      "What belief did you inherit that you're ready to let go of?",
                      "What is your personal myth — the story you tell about who you are?",
                      "What challenge transformed you into who you are becoming?",
                      "What would your life look like if you trusted the process?",
                      "What are you being called toward that you keep resisting?",
                      "What does it mean to come home to yourself?",
                      "What old identity are you clinging to that no longer fits?",
                      "What would your most authentic self do differently today?",
                      "What have you been afraid to face with compassion?",
                      "What new chapter are you ready to begin writing?",
                      "How might your greatest wound become your greatest teacher?",
                      "What does courage look like for you in this season of life?",
                      "What would happen if you let go of needing to know the outcome?",
                    ];


                    const prompt = MYTH_PROMPTS[promptIdx];
                    const now = new Date();
                    const weekStart = new Date(now);
                    weekStart.setDate(now.getDate() - now.getDay());
                    const weekStartStr = weekStart.toISOString().split("T")[0];
                    const thisWeekCount = entries.filter(e => e.date >= weekStartStr).length;
                    const totalCount = entries.length;

                    return (
                      <div className="pt-4 space-y-4">
                        <div className="text-center px-4 min-h-[60px] flex items-center justify-center">
                          <AnimatePresence mode="wait">
                            <motion.p
                              key={promptIdx}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -8 }}
                              transition={{ duration: 0.4 }}
                              className="font-display italic leading-relaxed"
                              style={{ fontSize: 'var(--quote-size)', color: 'hsl(var(--muted-foreground))' }}
                            >
                              "{prompt}"
                            </motion.p>
                          </AnimatePresence>
                        </div>

                        {/* Stats strip */}
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="font-body" style={{ fontSize: 'var(--label-size)', letterSpacing: 'var(--label-tracking)', color: 'hsl(var(--label-color))' }}>
                            {thisWeekCount} {thisWeekCount === 1 ? "entry" : "entries"} this week
                          </span>
                          <span style={{ color: 'hsl(var(--label-color))', fontSize: 'var(--label-size)' }}>·</span>
                          <span className="font-body" style={{ fontSize: 'var(--label-size)', letterSpacing: 'var(--label-tracking)', color: 'hsl(var(--label-color))' }}>
                            {totalCount} total
                          </span>
                        </div>
                      </div>
                    );
                  })()}

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
                </div>
              )}

              {/* ═══ ENTRIES TAB ═══ */}
              {tab === "entries" && view === "list" && (
                <div className="space-y-8 md:space-y-10">
                  {/* Search */}
                  <div className="flex gap-3">
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

                  <button
                    onClick={() => setFilterStoic(!filterStoic)}
                    className={`rounded-full px-3 py-1.5 font-body text-[11px] transition-colors ${
                      filterStoic ? "bg-primary text-primary-foreground" : "bg-muted/60 text-muted-foreground"
                    }`}
                  >
                    With Stoic reflection
                  </button>

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
                </div>
              )}

              {/* ═══ MEMORIES TAB ═══ */}
              {tab === "insights" && (
                <div className="space-y-6">
                  <JournalInsights entries={entries} />
                  <MemoryVault
                    vault={journalSync.vault}
                    onSaveVaultEntry={journalSync.saveVaultEntry}
                    onRemoveVaultEntry={journalSync.removeVaultEntry}
                  />
                </div>
              )}

              {/* ═══ VISION BOARD TAB ═══ */}
              {tab === "vision" && (
                <div className="space-y-4">
                  <DreamStudio pinnedEntry={null} />
                </div>
              )}

              {/* Entry detail */}
              {(tab === "write" || tab === "entries") && view === "detail" && selectedEntry && (
                <EntryDetailView
                  entry={selectedEntry}
                  onBack={() => { setView("list"); setSelectedEntry(null); }}
                  onLensGenerated={handleLensGenerated}
                />
              )}
            </motion.div>
          </AnimatePresence>

          <BotanicalSprig width={160} className="mx-auto mt-8 md:hidden" />
          <BotanicalSprig width={200} className="mx-auto mt-10 hidden md:block" />
        </ContentSection>

        {/* Standard Writing modal */}
        <AnimatePresence>
          {view === "write" && (
            <WritingView mood={currentMood} entryType={entryType} onSave={(c, w) => handleSave(c, w, "standard")} onClose={() => setView("list")} />
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
          <StoicAudioPlayer title={reading.title} text={buildStoicReadingText(reading)} onClose={() => setShowPlayer(false)} />
        )}
      </div>
    </GatedPage>
  );
}
