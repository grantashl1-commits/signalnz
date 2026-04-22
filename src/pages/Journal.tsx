import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useAndroidBack } from "@/hooks/useAndroidBack";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ArrowLeft, Search, Check, BookOpen, X, Sparkles } from "lucide-react";
import { BotanicalSprig } from "@/components/BotanicalElements";
import { GatedFeature } from "@/components/FeatureGate";
import { useFeatureGate } from "@/hooks/useFeatureGate";
import { AtmosphericHero, ContentSection } from "@/components/AtmosphericSection";
import SignalPulse from "@/components/SignalPulse";
import { useCycle } from "@/contexts/CycleContext";
import { haptic } from "@/hooks/use-mobile";
import { useDailyStoic, useJournalEntries2, type JournalEntryRow, type StoicLens } from "@/hooks/useStoicJournal";
import StoicJournalSeedCard from "@/components/StoicJournalSeedCard";
import StoicLensDisplay from "@/components/StoicLensDisplay";
import MemoryVault from "@/components/journal/MemoryVault";
import GratitudeEditor from "@/components/journal/GratitudeEditor";
import OneLineEditor from "@/components/journal/OneLineEditor";
import JournalInsights from "@/components/journal/JournalInsights";
import { useJournalSync } from "@/hooks/useJournalSync";
import { type JournalEntry, type DreamElement, type VaultEntry } from "@/lib/journal-store";
import DreamStudio from "@/components/journal/DreamStudio";
import StoicAudioPlayer from "@/components/StoicAudioPlayer";

type Tab = "write" | "insights" | "vision";
type View = "list" | "write" | "detail" | "gratitude" | "one-line";
type EntryType = "reflect" | "gratitude" | "one line";

const TABS: { id: Tab; label: string }[] = [
  { id: "write", label: "Write" },
  { id: "insights", label: "Memory Vault" },
  { id: "vision", label: "Vision Board" },
];

const TAB_SUBTITLES: Record<Tab, string> = {
  write: "Your story, one chapter at a time.",
  insights: "Patterns, reflections, and memories.",
  vision: "Visualise the life you're creating.",
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

function buildAncestralVaultEntry(entry: JournalEntryRow, lens: StoicLens): VaultEntry {
  const date = new Date(entry.created_at).toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" });
  return {
    id: `ancestral-${entry.id}`,
    entryId: entry.id,
    category: "journal-entries",
    title: lens.stoic_title || entry.title || "Ancestral reflection",
    preview: `${lens.bridge_metaphor}\n\n${lens.stoic_principle}`.slice(0, 320),
    date,
    timestamp: new Date(entry.created_at).getTime(),
  };
}

// ── Writing View (full-screen modal) ──
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

  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const placeholder = getPlaceholder(currentPhase, mood);

  const handleSave = () => {
    if (!text.trim()) return;
    setSaved(true);
    onSave(text, wordCount);
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

      {showPlayer && reading && (
        <StoicAudioPlayer title={reading.title} text={buildStoicReadingText(reading)} onClose={() => setShowPlayer(false)} />
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
  const [currentMood, setCurrentMood] = useState<string | null>(null);
  const [entryType, setEntryType] = useState<EntryType>("reflect");
  const [promptIdx, setPromptIdx] = useState(0);

  const { currentDay, reading, listenedToday, markListened, advanceDay } = useDailyStoic();
  const { entries, loading, saveEntry, updateStoicLens } = useJournalEntries2();
  const journalSync = useJournalSync();

  const [showPlayer, setShowPlayer] = useState(false);
  const [postSaveEntry, setPostSaveEntry] = useState<JournalEntryRow | null>(null);

  // Inline write state (for the Write tab textarea)
  const [inlineText, setInlineText] = useState("");
  const [inlineSaving, setInlineSaving] = useState(false);
  const [inlineSaved, setInlineSaved] = useState(false);

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

  // Inline save for the Write tab textarea
  const handleInlineSave = async () => {
    if (!inlineText.trim() || inlineSaving) return;
    setInlineSaving(true);
    const wordCount = inlineText.split(/\s+/).filter(Boolean).length;
    const saved = await saveEntry({
      content: inlineText,
      word_count: wordCount,
      entry_type: "standard",
      mood: currentMood || undefined,
      cycle_phase: currentPhase,
      cycle_day: currentCycleDay,
      cycle_mode: "cycling",
      stoic_seq_day: reading?.seq_day,
      stoic_title: reading?.title,
    });

    if (saved) {
      setPostSaveEntry(saved);
      setInlineSaved(true);
      setTimeout(() => setInlineSaved(false), 3000);
    }
    setInlineSaving(false);
    setInlineText("");
  };

  const handleLensGenerated = (lens: StoicLens) => {
    if (selectedEntry) updateStoicLens(selectedEntry.id, lens);
    if (postSaveEntry) updateStoicLens(postSaveEntry.id, lens);
  };

  const handleSaveToVault = useCallback(async (entry: JournalEntry) => {
    haptic("medium");
    const preview = Object.values(entry.prompts).filter(Boolean)[0] || "";
    const ve = { id: Date.now().toString(), entryId: entry.id, category: "remember", title: entry.title || entry.date, preview: preview.slice(0, 150), date: entry.date, timestamp: entry.timestamp };
    await journalSync.saveVaultEntry(ve);
    await journalSync.updateEntry({ ...entry, savedToVault: true });
  }, [journalSync]);

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

  const inlineWordCount = inlineText.split(/\s+/).filter(Boolean).length;

  return (
    <GatedFeature featureKey="journal_write">
      <div className="relative">
        <AtmosphericHero size="md">
          <SignalPulse />
          <div className="text-center relative z-10">
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
                <div className="space-y-6 md:space-y-8">

                  {/* Rotating prompt */}
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
                        "{MYTH_PROMPTS[promptIdx]}"
                      </motion.p>
                    </AnimatePresence>
                  </div>

                  {/* Inline journal textarea + save */}
                  <div className="card-warm p-4 space-y-3">
                    <textarea
                      value={inlineText}
                      onChange={(e) => setInlineText(e.target.value)}
                      placeholder={getPlaceholder(currentPhase, currentMood)}
                      rows={5}
                      className="w-full resize-none bg-transparent font-hand text-lg text-foreground leading-relaxed placeholder:text-muted-foreground/30 focus:outline-none"
                      style={{ caretColor: "hsl(14, 100%, 64%)", fontSize: "18px" }}
                    />
                    <div className="flex items-center justify-between">
                      <span className="font-body text-xs text-muted-foreground">{inlineWordCount} words</span>
                      <button
                        onClick={handleInlineSave}
                        disabled={!inlineText.trim() || inlineSaving}
                        className="touch-btn rounded-xl bg-primary px-5 py-2.5 min-h-[44px] font-body text-sm font-bold text-primary-foreground active:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                      >
                        {inlineSaved ? <Check className="h-4 w-4" /> : null}
                        {inlineSaving ? "Saving…" : inlineSaved ? "Saved" : "Save entry"}
                      </button>
                    </div>
                  </div>

                  {/* ── Daily Philosophy ── */}
                  {reading && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <span className="font-body text-[10px] uppercase tracking-[0.15em] text-primary">Today's Philosophy · Day {currentDay}</span>
                      </div>

                      <div className="rounded-2xl border border-primary/15 bg-primary/[0.03] p-5 space-y-3">
                        <h3 className="font-display text-xl italic text-foreground leading-snug">"{reading.title}"</h3>
                        <blockquote className="font-editorial text-sm italic text-muted-foreground leading-relaxed border-l-2 border-primary/20 pl-4">
                          "{reading.quote}"
                        </blockquote>
                        <p className="font-body text-[11px] text-muted-foreground">— {reading.source}</p>
                        <p className="font-body text-sm text-foreground/80 leading-relaxed">{reading.reflection}</p>

                        {reading.journal_prompt && (
                          <p className="font-hand text-sm text-primary/80 pt-2 border-t border-border/30">
                            {reading.journal_prompt}
                          </p>
                        )}

                        {/* Listen button */}
                        <button
                          onClick={handleListen}
                          className="flex items-center gap-2 rounded-xl bg-secondary/60 px-4 py-2.5 font-display text-sm italic text-foreground hover:bg-secondary transition-colors w-full justify-center"
                        >
                          ▶ Listen to today's reading
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ── AI Metaphor CTA ── */}
                  {postSaveEntry && !postSaveEntry.stoic_lens && postSaveEntry.stoic_seq_day && reading && (
                    <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-5 space-y-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="font-body text-[10px] uppercase tracking-[0.15em] text-primary">Ancestral Reflection</span>
                      </div>
                      <p className="font-display text-base italic text-foreground leading-relaxed">
                        Curious to see how your journal relates to the wisdom of our ancestors?
                      </p>
                      <p className="font-body text-xs text-muted-foreground leading-relaxed">
                        We'll weave a metaphor connecting your words to the philosophy above — drawing from the Dao, ancient fables, and timeless wisdom traditions.
                      </p>
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

                  {/* Show existing lens if already generated */}
                  {postSaveEntry && postSaveEntry.stoic_lens && (
                    <div className="rounded-2xl border border-primary/15 bg-primary/[0.03] p-5 space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="font-body text-[10px] uppercase tracking-[0.15em] text-primary">Your Reflection</span>
                      </div>
                      <p className="font-display text-sm italic text-foreground/80 leading-relaxed">{postSaveEntry.stoic_lens.bridge_metaphor}</p>
                      <p className="font-body text-xs text-muted-foreground italic">{postSaveEntry.stoic_lens.stoic_principle}</p>
                      <p className="font-hand text-sm text-primary">{postSaveEntry.stoic_lens.carry_forward}</p>
                    </div>
                  )}
                </div>
              )}

              {/* ═══ MEMORY VAULT TAB ═══ */}
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
              {tab === "write" && view === "detail" && selectedEntry && (
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

        {/* TTS Player */}
        {showPlayer && reading && (
          <StoicAudioPlayer title={reading.title} text={buildStoicReadingText(reading)} onClose={() => setShowPlayer(false)} />
        )}
      </div>
    </GatedFeature>
  );
}
