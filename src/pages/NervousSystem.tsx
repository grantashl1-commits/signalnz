import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Headphones, Moon, Clock, Check, Loader2, Play, Sparkles, Wind, BookOpen, CircleDot, ChevronDown } from "lucide-react";
import { GatedPage } from "@/components/FeatureGate";
import { AtmosphericHero, ContentSection } from "@/components/AtmosphericSection";
import SignalPulse from "@/components/SignalPulse";
import { BotanicalSprig } from "@/components/BotanicalElements";
import { useCycle } from "@/contexts/CycleContext";
import { haptic } from "@/hooks/use-mobile";
import SomaticPlayer from "@/components/practice/SomaticPlayer";
import type { PracticeConfig } from "@/data/practices";
import {
  ALL_MEDITATION_SCRIPTS,
  MEDITATION_SCRIPTS,
  READING_SCRIPTS,
  INNER_WORK_SCRIPTS,
  SLEEP_SCRIPTS,
  PHASE_SCRIPTS,
  QUICK_PRACTICES,
  GROUNDING_PRACTICES,
  PRESENCE_PRACTICES,
  getMeditationById,
  formatMeditationDuration,
  type MeditationScript,
} from "@/data/meditation-scripts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// ── Convert MeditationScript → PracticeConfig ──
function toPracticeConfig(script: MeditationScript): PracticeConfig {
  return {
    id: script.id,
    title: script.title,
    subtitle: script.subtitle,
    category: "somatic",
    mode: "narrated-sequence",
    durationSec: script.durationSec,
    benefit: script.description,
    audio: {
      enabled: true,
      audioUrl: `/audio/${script.id}.mp3`,
      durationSec: script.durationSec,
      voiceName: "SIGNAL Calm",
      provider: "elevenlabs",
    },
    steps: script.steps,
  };
}

// ── AI Check-in chips ──
const AI_CHIPS = [
  "I feel anxious and can't settle",
  "I'm really tired but can't sleep",
  "I feel emotionally heavy today",
  "I need to reset — I've been in my head all day",
  "I'm in my luteal phase and struggling",
  "I need something short — 5 minutes",
];

// ── Tabs: Practice and Sleep ──
type TabId = "practice" | "sleep";
const TABS: { id: TabId; label: string; icon: typeof Headphones }[] = [
  { id: "practice", label: "Practice", icon: Headphones },
  { id: "sleep", label: "Sleep", icon: Moon },
];

const cardVariant = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: 0.06 * i, duration: 0.3, ease: "easeOut" as const },
  }),
};

// ── Completion tracking hook ──
function useMindfulnessLogs() {
  const { user } = useAuth();
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];
    
    supabase
      .from("mindfulness_logs")
      .select("practice_id, duration_sec, log_date")
      .eq("user_id", user.id)
      .eq("completed", true)
      .gte("log_date", new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0])
      .then(({ data }) => {
        if (!data) return;
        const todayDone = new Set(data.filter((d) => d.log_date === today).map((d) => d.practice_id));
        setCompleted(todayDone);
        
        const days = new Set(data.map((d) => d.log_date));
        let s = 0;
        for (let i = 0; i < 30; i++) {
          const d = new Date(Date.now() - i * 86400000).toISOString().split("T")[0];
          if (days.has(d)) s++;
          else if (i > 0) break;
        }
        setStreak(s);
      });
  }, [user]);

  const logCompletion = async (practiceId: string, durationSec: number, phase: string) => {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];
    const script = getMeditationById(practiceId);
    await supabase.from("mindfulness_logs").insert({
      user_id: user.id,
      practice_id: practiceId,
      practice_type: script?.category || "meditation",
      duration_sec: durationSec,
      completed: true,
      log_date: today,
      cycle_phase: phase,
    });
    setCompleted((prev) => new Set([...prev, practiceId]));
  };

  return { completed, streak, logCompletion };
}

// ── Practice Card styling by category ──
const CARD_THEME: Record<string, {
  border: string;       // left border color
  bg: string;           // subtle bg tint
  Icon: typeof Moon;    // corner icon
  iconColor: string;
}> = {
  meditation:       { border: "hsl(var(--primary))",          bg: "hsl(var(--primary) / 0.04)",         Icon: CircleDot,  iconColor: "hsl(var(--primary) / 0.35)" },
  sleep:            { border: "hsl(220 40% 18%)",             bg: "hsl(220 30% 14% / 0.06)",           Icon: Moon,       iconColor: "hsl(220 30% 35% / 0.4)" },
  "inner-work":     { border: "hsl(30 60% 55%)",             bg: "hsl(30 60% 55% / 0.05)",            Icon: Wind,       iconColor: "hsl(30 50% 50% / 0.4)" },
  reading:          { border: "hsl(var(--primary))", bg: "hsl(var(--primary) / 0.04)", Icon: BookOpen, iconColor: "hsl(var(--primary) / 0.35)" },
  "phase-practice": { border: "hsl(var(--primary))",          bg: "hsl(var(--primary) / 0.04)",         Icon: Sparkles,   iconColor: "hsl(var(--primary) / 0.3)" },
};

const DEFAULT_THEME = CARD_THEME.meditation;

// ── Practice Card ──
function PracticeCard({
  script,
  index,
  isDone,
  onSelect,
  isSleep,
}: {
  script: MeditationScript;
  index: number;
  isDone: boolean;
  onSelect: (s: MeditationScript) => void;
  isSleep?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  const categoryColors: Record<string, string> = {
    meditation: "bg-primary/10 text-primary",
    reading: "bg-primary/10 text-primary",
    "inner-work": "bg-primary/10 text-primary",
    sleep: "bg-primary/10 text-primary",
    "phase-practice": "bg-primary/10 text-primary",
  };

  const theme = CARD_THEME[script.category] || DEFAULT_THEME;
  const CornerIcon = theme.Icon;

  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={cardVariant}
      className="relative overflow-hidden rounded-2xl border border-border shadow-sm"
      style={{
        borderLeft: `3px solid ${theme.border}`,
        backgroundColor: isSleep ? "#EDE8F0" : theme.bg,
      }}
    >
      {/* Sleep moon watermark */}
      {isSleep && (
        <svg
          className="absolute top-3 right-3 pointer-events-none"
          width="64" height="64" viewBox="0 0 64 64" fill="none"
          style={{ opacity: 0.06 }}
        >
          <path d="M48 36c0-11-9-20-20-20a20 20 0 0 0-4 .4A16 16 0 1 1 47.6 40a20 20 0 0 0 .4-4Z" fill="currentColor" />
        </svg>
      )}
      {/* Corner type icon */}
      <CornerIcon
        className="absolute top-4 right-4 h-5 w-5 pointer-events-none"
        style={{ color: theme.iconColor }}
        strokeWidth={1.5}
      />

      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-2 mb-1 pr-7">
          <h3 className="font-display text-[15px] italic text-foreground leading-snug">{script.title}</h3>
          {isDone && (
            <span className="flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 font-body text-[10px] text-primary shrink-0">
              <Check className="h-3 w-3" /> Done
            </span>
          )}
        </div>
        <p className="font-hand text-xs font-bold text-primary mb-1.5">{script.subtitle}</p>
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className={`font-body text-[10px] px-2.5 py-0.5 rounded-full font-medium ${categoryColors[script.category] || "bg-muted text-muted-foreground"}`}>
            {script.category.replace("-", " ")}
          </span>
          <span className="font-body text-[11px] text-muted-foreground/70 flex items-center gap-1">
            <Clock className="h-3 w-3" /> {formatMeditationDuration(script.durationSec)}
          </span>
        </div>

        {/* Collapsed: one-line preview + Begin pill */}
        {!expanded && (
          <div className="mt-2 flex items-end justify-between gap-3">
            <button
              onClick={() => { haptic("light"); setExpanded(true); }}
              className="flex-1 min-w-0 text-left group"
            >
              <p className="font-body text-[12px] text-muted-foreground leading-relaxed line-clamp-1">
                {script.description}
              </p>
              <span className="inline-flex items-center gap-0.5 font-body text-[10px] text-primary mt-0.5">
                Read more <ChevronDown className="h-3 w-3" />
              </span>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); haptic("medium"); onSelect(script); }}
              className={`shrink-0 rounded-full px-4 py-2 font-display text-xs italic active:scale-[0.96] flex items-center gap-1.5 transition-transform ${
                isSleep
                  ? "bg-primary/70 text-primary-foreground"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              <Play className="h-3 w-3" /> Begin →
            </button>
          </div>
        )}
      </div>

      {/* Expanded: full description + prominent CTA */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <button
                onClick={() => { haptic("light"); setExpanded(false); }}
                className="inline-flex items-center gap-0.5 font-body text-[10px] text-primary mb-2"
              >
                Show less <ChevronDown className="h-3 w-3 rotate-180" />
              </button>
              <p className="font-body text-[13px] text-muted-foreground leading-relaxed mb-3">{script.description}</p>
              <button
                onClick={() => { haptic("medium"); onSelect(script); }}
                className={`touch-btn w-full rounded-[14px] py-3 font-display text-sm italic text-primary-foreground active:scale-[0.97] flex items-center justify-center gap-2 ${
                  isSleep ? "bg-primary/70" : "bg-primary"
                }`}
              >
                <Play className="h-4 w-4" /> begin this practice
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── "Right now I need..." contextual chips ──
const CONTEXTUAL_CHIPS: Record<string, { label: string; practiceId: string }[]> = {
  "morning-default": [
    { label: "A 5-min reset", practiceId: "quick-001" },
    { label: "Set my intention", practiceId: "quick-005" },
    { label: "Arrive in my body", practiceId: "quick-004" },
    { label: "Clear my head", practiceId: "quick-003" },
    { label: "Ground myself", practiceId: "ground-002" },
  ],
  "midday-active": [
    { label: "Focus", practiceId: "quick-003" },
    { label: "Quick breath", practiceId: "quick-004" },
    { label: "Values check-in", practiceId: "quick-005" },
    { label: "Clear my head", practiceId: "quick-001" },
    { label: "Ground myself", practiceId: "ground-002" },
  ],
  "evening-luteal": [
    { label: "Let go of the day", practiceId: "ground-002" },
    { label: "Make room for how I feel", practiceId: "presence-003" },
    { label: "Wind down", practiceId: "sleep-003" },
    { label: "Clear my head", practiceId: "quick-003" },
    { label: "Ground myself", practiceId: "quick-004" },
  ],
  "menstrual": [
    { label: "Pebble meditation", practiceId: "quick-002" },
    { label: "Full body release", practiceId: "ground-002" },
    { label: "Something short", practiceId: "quick-001" },
    { label: "Wind down", practiceId: "sleep-003" },
    { label: "Ground myself", practiceId: "quick-004" },
  ],
};

function getContextualChips(phase: string): { label: string; practiceId: string }[] {
  const h = new Date().getHours();
  if (phase === "menstrual") return CONTEXTUAL_CHIPS["menstrual"];
  if (h >= 18 && (phase === "luteal")) return CONTEXTUAL_CHIPS["evening-luteal"];
  if (h >= 11 && h < 18 && (phase === "follicular" || phase === "ovulatory")) return CONTEXTUAL_CHIPS["midday-active"];
  return CONTEXTUAL_CHIPS["morning-default"];
}

function RightNowChips({ onSelect }: { onSelect: (s: MeditationScript) => void }) {
  const { currentPhase } = useCycle();
  const chips = getContextualChips(currentPhase);
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <div className="mb-6">
      <h2 className="font-display text-lg italic text-foreground mb-1">Right now I need…</h2>
      <p className="font-body text-[11px] text-muted-foreground mb-3 italic" style={{ fontWeight: 300 }}>
        Tap what feels right — we'll take you straight there.
      </p>
      <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1">
        {chips.map((chip) => {
          const isActive = activeId === chip.practiceId;
          return (
            <motion.button
              key={chip.practiceId}
              onClick={() => {
                const s = getMeditationById(chip.practiceId);
                if (s) {
                  haptic("medium");
                  setActiveId(chip.practiceId);
                  onSelect(s);
                }
              }}
              animate={isActive ? { scale: [1, 0.96, 1] } : {}}
              transition={{ duration: 0.3 }}
              className={`whitespace-nowrap rounded-full border min-h-[44px] px-4 py-2.5 font-body text-xs flex items-center gap-2 transition-all ${
                isActive
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-primary/25 bg-primary/5 text-foreground hover:bg-primary/10"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 shrink-0" style={{ opacity: isActive ? 1 : 0.45 }} />
              {chip.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ── Get all practice scripts ──
function getPracticeScripts(): MeditationScript[] {
  return [
    ...MEDITATION_SCRIPTS,
    ...PHASE_SCRIPTS,
    ...QUICK_PRACTICES,
    ...GROUNDING_PRACTICES,
    ...READING_SCRIPTS,
    ...PRESENCE_PRACTICES,
    ...INNER_WORK_SCRIPTS,
  ];
}

// ── AI Check-in ──
function AICheckin({ onSelectPractice }: { onSelectPractice: (s: MeditationScript) => void }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ practiceId: string; explanation: string } | null>(null);
  const { currentPhase, currentCycleDay } = useCycle();

  const handleSubmit = async (text: string) => {
    if (!text.trim()) return;
    setInput(text);
    setLoading(true);
    setResult(null);
    try {
      const { data } = await supabase.functions.invoke("mindfulness-ai", {
        body: { input: text, currentPhase, currentCycleDay },
      });
      if (data) setResult(data);
    } catch {
      setResult({ practiceId: "med-004", explanation: "Based on how you're feeling, the Relaxation Response may help." });
    }
    setLoading(false);
  };

  const recommended = result ? getMeditationById(result.practiceId) : null;
  const AI_CHIPS_LOCAL = [
    "I feel anxious and can't settle",
    "I'm really tired but can't sleep",
    "I feel emotionally heavy today",
    "I need to reset — I've been in my head all day",
    "I'm in my luteal phase and struggling",
    "I need something short — 5 minutes",
  ];

  return (
    <div className="card-warm p-6 space-y-4">
      <h2 className="font-display text-xl italic text-foreground">How are you feeling right now?</h2>
      <div className="flex flex-wrap gap-2">
        {AI_CHIPS_LOCAL.map((chip) => (
          <button
            key={chip}
            onClick={() => handleSubmit(chip)}
            className="rounded-full border border-border px-3 py-1.5 font-body text-xs text-muted-foreground hover:bg-secondary/60 transition-colors"
          >
            {chip}
          </button>
        ))}
      </div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Or describe how you feel in your own words..."
        className="w-full rounded-xl border border-border bg-background p-4 font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none h-20"
      />
      <button
        onClick={() => handleSubmit(input)}
        disabled={loading || !input.trim()}
        className="rounded-xl bg-primary px-6 py-3 font-body text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        Get a Recommendation
      </button>

      {loading && (
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="font-hand text-sm animate-pulse">finding what your body needs...</span>
        </div>
      )}

      {result && recommended && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-body text-[11px] px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">recommended</span>
            <span className="font-body text-[11px] text-muted-foreground">{formatMeditationDuration(recommended.durationSec)}</span>
          </div>
          <h3 className="font-display text-lg italic text-foreground">{recommended.title}</h3>
          <p className="font-body text-sm text-muted-foreground leading-relaxed">{result.explanation}</p>
          <button
            onClick={() => { haptic("medium"); onSelectPractice(recommended); }}
            className="touch-btn w-full rounded-[14px] bg-primary py-3 font-display text-sm italic text-primary-foreground active:scale-[0.97] flex items-center justify-center gap-2"
          >
            <Play className="h-4 w-4" /> start practice →
          </button>
        </motion.div>
      )}
    </div>
  );
}

// ── Duration sort filter ──
type DurationFilter = "all" | "short" | "medium" | "longer";

function filterByDuration(scripts: MeditationScript[], filter: DurationFilter): MeditationScript[] {
  if (filter === "all") return scripts;
  if (filter === "short") return scripts.filter(s => s.durationSec <= 300);
  if (filter === "medium") return scripts.filter(s => s.durationSec > 300 && s.durationSec <= 900);
  return scripts.filter(s => s.durationSec > 900);
}

// ── MAIN PAGE ──
export default function NervousSystemPage() {
  const [tab, setTab] = useState<TabId>(() => {
    return new Date().getHours() >= 20 ? "sleep" : "practice";
  });
  const [durationFilter, setDurationFilter] = useState<DurationFilter>("all");
  const [activePractice, setActivePractice] = useState<PracticeConfig | null>(null);
  const { currentPhase } = useCycle();
  const { completed, streak, logCompletion } = useMindfulnessLogs();

  const scripts = useMemo(() => {
    const base = tab === "sleep" ? SLEEP_SCRIPTS : getPracticeScripts();
    return filterByDuration(base, durationFilter);
  }, [tab, durationFilter]);

  const handleSelect = (script: MeditationScript) => {
    setActivePractice(toPracticeConfig(script));
  };

  const handleClose = () => {
    if (activePractice) {
      logCompletion(activePractice.id, activePractice.durationSec, currentPhase);
    }
    setActivePractice(null);
  };

  return (
    <GatedPage requiredTier="nourished">
      <div className="relative">
        <AtmosphericHero size="md">
          <SignalPulse />
          <div className="text-center relative z-10 px-6">
            <p className="font-body text-xs uppercase tracking-[0.3em] text-primary-foreground/40 mb-4">Mindfulness</p>
            <h1 className="font-display text-[clamp(2rem,8vw,4rem)] md:text-[4rem] font-extrabold text-primary-foreground leading-[1.05] mb-2 break-words">
              Mindfulness &amp; Inner&nbsp;Work
            </h1>
            {streak > 1 && (
              <p className="font-body text-xs text-primary-foreground/50">
                {streak}-day streak
              </p>
            )}
          </div>
        </AtmosphericHero>

        <ContentSection className="px-5 md:px-4">
          {/* Right now I need... */}
          <RightNowChips onSelect={handleSelect} />

          {/* Tabs */}
          <div className="sticky top-0 md:static z-20 bg-background/95 backdrop-blur-sm pb-3 -mx-5 px-5 md:mx-0 md:px-0 pt-2 md:pt-0">
            <div className="flex bg-muted/60 rounded-2xl p-1 max-w-sm mx-auto">
              {TABS.map((t) => {
                const TabIcon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => { haptic("light"); setTab(t.id); setDurationFilter("all"); }}
                    className={`touch-tab flex-1 py-2.5 rounded-xl font-display text-sm transition-all flex items-center justify-center gap-1.5 ${
                      tab === t.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground italic"
                    }`}
                  >
                    <TabIcon className="h-3.5 w-3.5" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duration sort (Practice tab only) */}
          {tab === "practice" && (
            <div className="flex gap-2 pb-3">
              {(["all", "short", "medium", "longer"] as DurationFilter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setDurationFilter(f)}
                  className={`whitespace-nowrap rounded-full px-3 py-1.5 font-body text-[11px] transition-colors ${
                    durationFilter === f
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {f === "all" ? "All" : f === "short" ? "Under 5 min" : f === "medium" ? "5–15 min" : "15+ min"}
                </button>
              ))}
            </div>
          )}

          {/* Inner Work content warning */}
          {tab === "practice" && (
            <div className="rounded-xl bg-phase-menstrual/5 border border-phase-menstrual/15 p-4 mb-4 hidden">
              {/* kept but hidden — inner work warning only shows contextually */}
            </div>
          )}

          {/* Practice Cards */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${tab}-${durationFilter}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              {scripts.map((s, i) => (
                <PracticeCard
                  key={s.id}
                  script={s}
                  index={i}
                  isDone={completed.has(s.id)}
                  onSelect={handleSelect}
                  isSleep={tab === "sleep"}
                />
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Breathwork link */}
          <div className="mt-8 text-center">
            <Link to="/breathwork" className="font-body text-sm text-primary hover:underline">
              For breathwork and body-based practices → Breathwork
            </Link>
          </div>

          <BotanicalSprig width={160} className="mx-auto mt-8" />

          {/* AI Check-in */}
          <div className="mt-8">
            <AICheckin onSelectPractice={handleSelect} />
          </div>

          <BotanicalSprig width={180} className="mx-auto mt-8 hidden md:block" />
        </ContentSection>

        {/* Player */}
        {activePractice && (
          <SomaticPlayer practice={activePractice} onClose={handleClose} />
        )}
      </div>
    </GatedPage>
  );
}
