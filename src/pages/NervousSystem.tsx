import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Headphones, BookOpen, Heart, Moon, Clock, Check, Loader2, Play, Sparkles, ExternalLink } from "lucide-react";
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
  getMeditationById,
  getMeditationsForPhase,
  formatMeditationDuration,
  type MeditationScript,
} from "@/data/meditation-scripts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// ── Convert MeditationScript → PracticeConfig for SomaticPlayer ──
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

// ── Further Listening (curated external) ──
const FURTHER_LISTENING = [
  { title: "RAIN Meditation", teacher: "Tara Brach", platform: "Insight Timer", dur: "20 min", url: "https://insighttimer.com/tarabrach/guided-meditations/rain-meditation-25" },
  { title: "MBSR Body Scan", teacher: "Jon Kabat-Zinn", platform: "YouTube", dur: "45 min", url: "https://www.youtube.com/watch?v=u4gZgnCy5ew" },
  { title: "Loving-kindness", teacher: "Sharon Salzberg", platform: "Insight Timer", dur: "15 min", url: "https://insighttimer.com/sharonsalzberg/guided-meditations/lovingkindness-meditation" },
];

// ── AI Check-in chips ──
const AI_CHIPS = [
  "I feel anxious and can't settle",
  "I'm really tired but can't sleep",
  "I feel emotionally heavy today",
  "I need to reset — I've been in my head all day",
  "I'm in my luteal phase and struggling",
  "I need something short — 5 minutes",
];

// ── Tabs ──
type TabId = "meditate" | "read" | "inner-work" | "sleep";
const TABS: { id: TabId; label: string; icon: typeof Headphones }[] = [
  { id: "meditate", label: "Meditate", icon: Headphones },
  { id: "read", label: "Read & Reflect", icon: BookOpen },
  { id: "inner-work", label: "Inner Work", icon: Heart },
  { id: "sleep", label: "Sleep", icon: Moon },
];

const CATEGORY_FILTERS: Record<TabId, string[]> = {
  meditate: ["All", "Nervous System", "Self-Compassion", "Phase Practice"],
  read: ["All", "Morning", "Evening", "Inner Work"],
  "inner-work": ["All", "Inner Child", "Self-Care", "Parts Work"],
  sleep: ["All", "10 min", "15 min", "30 min"],
};

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
  const [minutesThisWeek, setMinutesThisWeek] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];
    
    // Fetch today's completions
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
        const totalSec = data.reduce((sum, d) => sum + (d.duration_sec || 0), 0);
        setMinutesThisWeek(Math.round(totalSec / 60));
        
        // Streak: count consecutive days with completions
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
    setMinutesThisWeek((prev) => prev + Math.round(durationSec / 60));
  };

  return { completed, minutesThisWeek, streak, logCompletion };
}

// ── Practice Card ──
function PracticeCard({
  script,
  index,
  isDone,
  onSelect,
}: {
  script: MeditationScript;
  index: number;
  isDone: boolean;
  onSelect: (s: MeditationScript) => void;
}) {
  const categoryColors: Record<string, string> = {
    meditation: "bg-phase-follicular/10 text-phase-follicular",
    reading: "bg-phase-ovulatory/10 text-phase-ovulatory",
    "inner-work": "bg-phase-menstrual/10 text-phase-menstrual",
    sleep: "bg-phase-luteal/10 text-phase-luteal",
    "phase-practice": "bg-primary/10 text-primary",
  };

  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={cardVariant}
      className="card-warm p-5"
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <h3 className="font-display text-lg italic text-foreground leading-snug">{script.title}</h3>
        {isDone && (
          <span className="flex items-center gap-1 rounded-full bg-phase-follicular/15 px-2 py-0.5 font-mono text-[10px] text-phase-follicular shrink-0">
            <Check className="h-3 w-3" /> Done
          </span>
        )}
      </div>
      <p className="font-hand text-sm font-bold text-primary mb-1">{script.subtitle}</p>
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full ${categoryColors[script.category] || "bg-muted text-muted-foreground"}`}>
          {script.category.replace("-", " ")}
        </span>
        <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" /> {formatMeditationDuration(script.durationSec)}
        </span>
        {script.phase !== "all" && Array.isArray(script.phase) && script.phase.map((p) => (
          <span key={p} className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{p}</span>
        ))}
      </div>
      <p className="font-body text-[13px] text-muted-foreground leading-relaxed mb-3">{script.description}</p>
      <button
        onClick={() => { haptic("medium"); onSelect(script); }}
        className="touch-btn w-full rounded-[14px] bg-primary py-3.5 font-display text-base italic text-primary-foreground active:scale-[0.97] flex items-center justify-center gap-2"
      >
        <Play className="h-4 w-4" /> begin this practice
      </button>
    </motion.div>
  );
}

// ── Today's Practice suggestion ──
function TodaySuggestion({ onSelect }: { onSelect: (s: MeditationScript) => void }) {
  const { currentPhase, currentCycleDay } = useCycle();

  const suggestion = useMemo(() => {
    const h = new Date().getHours();
    // Evening → sleep practice
    if (h >= 20) {
      return SLEEP_SCRIPTS[2]; // Letting Go of the Day
    }
    // Phase-specific
    const phaseMap: Record<string, string> = {
      menstrual: "phase-001",
      follicular: "read-001",
      ovulatory: "phase-003",
      luteal: "phase-004",
    };
    const id = phaseMap[currentPhase] || "med-004";
    return getMeditationById(id) || MEDITATION_SCRIPTS[0];
  }, [currentPhase]);

  if (!suggestion) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-warm p-5 mb-6 border border-primary/20"
    >
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="font-hand text-sm font-bold text-primary">Today's Practice</span>
        <span className="font-mono text-[10px] text-muted-foreground ml-auto">
          Day {currentCycleDay} · {currentPhase}
        </span>
      </div>
      <h3 className="font-display text-xl italic text-foreground mb-1">{suggestion.title}</h3>
      <p className="font-body text-sm text-muted-foreground mb-3">{suggestion.subtitle} · {formatMeditationDuration(suggestion.durationSec)}</p>
      <button
        onClick={() => { haptic("medium"); onSelect(suggestion); }}
        className="touch-btn w-full rounded-[14px] bg-primary py-3 font-display text-sm italic text-primary-foreground active:scale-[0.97] flex items-center justify-center gap-2"
      >
        <Play className="h-4 w-4" /> begin
      </button>
    </motion.div>
  );
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
      // Fallback
      setResult({ practiceId: "med-004", explanation: "Based on how you're feeling, the Relaxation Response may help — it's one of the most evidence-based stress-reduction techniques available." });
    }
    setLoading(false);
  };

  const recommended = result ? getMeditationById(result.practiceId) : null;

  return (
    <div className="card-warm p-6 space-y-4">
      <h2 className="font-display text-xl italic text-foreground">How are you feeling right now?</h2>
      <div className="flex flex-wrap gap-2">
        {AI_CHIPS.map((chip) => (
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
            <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">recommended</span>
            <span className="font-mono text-[11px] text-muted-foreground">{formatMeditationDuration(recommended.durationSec)}</span>
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

// ── Tab Content ──
function getScriptsForTab(tab: TabId): MeditationScript[] {
  switch (tab) {
    case "meditate": return [...MEDITATION_SCRIPTS, ...PHASE_SCRIPTS];
    case "read": return READING_SCRIPTS;
    case "inner-work": return INNER_WORK_SCRIPTS;
    case "sleep": return SLEEP_SCRIPTS;
  }
}

function filterScripts(scripts: MeditationScript[], filter: string, tab: TabId): MeditationScript[] {
  if (filter === "All") return scripts;
  
  if (tab === "sleep") {
    const minMap: Record<string, [number, number]> = {
      "10 min": [0, 660],
      "15 min": [660, 960],
      "30 min": [960, 9999],
    };
    const range = minMap[filter];
    if (range) return scripts.filter((s) => s.durationSec >= range[0] && s.durationSec < range[1]);
  }

  const tagMap: Record<string, string[]> = {
    "Nervous System": ["nervous-system", "stress-reduction", "parasympathetic"],
    "Self-Compassion": ["self-compassion", "warmth"],
    "Phase Practice": ["menstrual", "follicular", "ovulatory", "luteal"],
    "Morning": ["morning", "intention"],
    "Evening": ["evening", "wind-down"],
    "Inner Work": ["inner-work", "psychology"],
    "Inner Child": ["inner-child", "reparenting"],
    "Self-Care": ["self-care", "values", "boundaries"],
    "Parts Work": ["parts-work", "inner-work"],
  };
  const tags = tagMap[filter];
  if (tags) return scripts.filter((s) => s.tags.some((t) => tags.includes(t)));
  return scripts;
}

// ── MAIN PAGE ──
export default function NervousSystemPage() {
  const [tab, setTab] = useState<TabId>(() => {
    // Time-aware: default to Sleep after 8pm
    return new Date().getHours() >= 20 ? "sleep" : "meditate";
  });
  const [filter, setFilter] = useState("All");
  const [activePractice, setActivePractice] = useState<PracticeConfig | null>(null);
  const { currentPhase } = useCycle();
  const { completed, minutesThisWeek, streak, logCompletion } = useMindfulnessLogs();

  const scripts = useMemo(() => filterScripts(getScriptsForTab(tab), filter, tab), [tab, filter]);

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
          <div className="text-center relative z-10">
            <p className="font-body text-xs uppercase tracking-[0.3em] text-primary-foreground/40 mb-4">Mindfulness</p>
            <h1 className="font-display text-[3rem] md:text-[4rem] font-extrabold text-primary-foreground leading-[1.02] mb-2">
              Mindfulness & Inner Work
            </h1>
            {minutesThisWeek > 0 && (
              <p className="font-mono text-xs text-primary-foreground/50">
                {minutesThisWeek} min this week{streak > 1 ? ` · ${streak}-day streak` : ""}
              </p>
            )}
          </div>
        </AtmosphericHero>

        <ContentSection className="px-5 md:px-4">
          {/* Today's Practice */}
          <TodaySuggestion onSelect={handleSelect} />

          {/* Tabs */}
          <div className="sticky top-[52px] md:static z-20 bg-background/95 backdrop-blur-sm pb-3 -mx-5 px-5 md:mx-0 md:px-0 pt-2 md:pt-0">
            <div className="flex bg-muted/60 rounded-2xl p-1 max-w-lg mx-auto">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { haptic("light"); setTab(t.id); setFilter("All"); }}
                  className={`touch-tab flex-1 py-2.5 rounded-xl font-display text-sm transition-all ${
                    tab === t.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground italic"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1 scrollbar-hide">
            {CATEGORY_FILTERS[tab].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 font-mono text-[11px] transition-colors ${
                  filter === f
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Inner Work content warning */}
          {tab === "inner-work" && (
            <div className="rounded-xl bg-phase-menstrual/5 border border-phase-menstrual/15 p-4 mb-4">
              <p className="font-body text-sm text-muted-foreground leading-relaxed italic">
                These practices invite deeper self-inquiry. Choose a time when you have space and quiet. You are always in control.
              </p>
            </div>
          )}

          {/* Practice Cards */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${tab}-${filter}`}
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
                />
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Further Listening (bottom of Meditate tab) */}
          {tab === "meditate" && (
            <div className="mt-10 space-y-4">
              <h3 className="font-hand text-sm font-bold text-muted-foreground/60">From the teachers who inspired us</h3>
              <div className="space-y-3">
                {FURTHER_LISTENING.map((fl) => (
                  <a
                    key={fl.title}
                    href={fl.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card-warm p-4 flex items-center justify-between group hover:shadow-md transition-shadow"
                  >
                    <div>
                      <p className="font-display text-sm italic text-foreground">{fl.title}</p>
                      <p className="font-mono text-[10px] text-muted-foreground">{fl.teacher} · {fl.platform} · {fl.dur}</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Breathwork link */}
          <div className="mt-8 text-center">
            <a href="/breathwork" className="font-body text-sm text-primary hover:underline">
              For breathwork and body-based practices → Breathwork
            </a>
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
