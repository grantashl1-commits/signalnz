import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Clock, Check, Play, Wind, BookOpen, CircleDot, ChevronDown, Headphones, Volume2, Brain, SlidersHorizontal, ChevronUp, X, Sparkles } from "lucide-react";
import SleepTimer from "@/components/practice/SleepTimer";
import { useSleepMusic } from "@/hooks/useSleepMusic";
import { GatedFeature } from "@/components/FeatureGate";
import { AtmosphericHero, ContentSection } from "@/components/AtmosphericSection";
import SignalPulse from "@/components/SignalPulse";
import { BotanicalSprig } from "@/components/BotanicalElements";
import { useCycle } from "@/contexts/CycleContext";
import { haptic } from "@/hooks/use-mobile";
import { useGatedExpand } from "@/hooks/useGatedExpand";
import SomaticPlayer from "@/components/practice/SomaticPlayer";
import BreathworkPlayer from "@/components/practice/BreathworkPlayer";
import FasciaReleasePlayer from "@/components/practice/FasciaReleasePlayer";
import fasciaReleaseImg from "@/assets/somatic/morning-fascia-release.png";
import type { PracticeConfig } from "@/data/practices";
import {
  BREATHWORK_PRACTICES,
  SOMATIC_PRACTICES,
  formatDuration,
} from "@/data/practices";
import {
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
import {
  GEN_MEDITATION_SCRIPTS,
  GEN_SLEEP_SCRIPTS,
  GEN_INNER_WORK_SCRIPTS,
} from "@/data/generated-mindfulness-scripts";
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

// ── Tabs ──
type TabId = "meditations" | "breathwork" | "somatic" | "sleep";
const TABS: { id: TabId; label: string; icon: typeof Headphones }[] = [
  { id: "meditations", label: "Meditations", icon: CircleDot },
  { id: "breathwork", label: "Breathwork", icon: Wind },
  { id: "somatic", label: "Somatic", icon: Brain },
  { id: "sleep", label: "Sleep", icon: Moon },
];

const cardVariant = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: 0.06 * i, duration: 0.3, ease: "easeOut" as const },
  }),
};

// ── Duration filter ──
type DurationFilter = "all" | "short" | "medium" | "longer";

function filterByDuration<T extends { durationSec: number }>(items: T[], filter: DurationFilter): T[] {
  if (filter === "all") return items;
  if (filter === "short") return items.filter(s => s.durationSec <= 300);
  if (filter === "medium") return items.filter(s => s.durationSec > 300 && s.durationSec <= 900);
  return items.filter(s => s.durationSec > 900);
}

// ── Category filter ──
type CategoryFilter = "all" | "meditation" | "inner-work" | "reading" | "phase-practice";
const CATEGORY_OPTIONS: { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "meditation", label: "Meditation" },
  { value: "inner-work", label: "Inner Work" },
  { value: "reading", label: "Reading" },
  { value: "phase-practice", label: "Phase Practice" },
];

// ── Intensity filter ──
type IntensityFilter = "all" | "beginner" | "intermediate" | "advanced";
const INTENSITY_OPTIONS: { value: IntensityFilter; label: string; desc: string }[] = [
  { value: "all", label: "All levels", desc: "" },
  { value: "beginner", label: "Beginner", desc: "Body scans, gratitude, breath awareness" },
  { value: "intermediate", label: "Intermediate", desc: "Self-compassion, inner child, somatic" },
  { value: "advanced", label: "Advanced", desc: "Parts work, IFS, shadow, deep inner work" },
];

// Tags that indicate advanced practices
const ADVANCED_TAGS = ["parts-work", "inner-child", "shadow", "deep-work", "ifs", "reparenting", "psychology"];
const INTERMEDIATE_TAGS = ["self-compassion", "inner-work", "emotional-processing", "somatic", "healing", "boundaries"];

function getIntensity(script: MeditationScript): IntensityFilter {
  const tags = script.tags;
  if (tags.some(t => ADVANCED_TAGS.includes(t))) return "advanced";
  if (script.category === "inner-work" || tags.some(t => INTERMEDIATE_TAGS.includes(t))) return "intermediate";
  return "beginner";
}

// ── Expandable Filter Panel ──
function FilterPanel({
  durationFilter, setDurationFilter,
  categoryFilter, setCategoryFilter,
  intensityFilter, setIntensityFilter,
  activeCount,
}: {
  durationFilter: DurationFilter; setDurationFilter: (f: DurationFilter) => void;
  categoryFilter: CategoryFilter; setCategoryFilter: (f: CategoryFilter) => void;
  intensityFilter: IntensityFilter; setIntensityFilter: (f: IntensityFilter) => void;
  activeCount: number;
}) {
  const [open, setOpen] = useState(false);

  const clearAll = () => {
    setDurationFilter("all");
    setCategoryFilter("all");
    setIntensityFilter("all");
  };

  return (
    <div className="pb-3">
      <button onClick={() => { haptic("light"); setOpen(!open); }}
        className="flex items-center gap-2 font-body text-xs text-muted-foreground hover:text-foreground transition-colors">
        <SlidersHorizontal className="h-3.5 w-3.5" />
        <span>Filters</span>
        {activeCount > 0 && (
          <span className="flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold">{activeCount}</span>
        )}
        {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="pt-3 space-y-4">
              {/* Duration */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-body text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Duration</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(["all", "short", "medium", "longer"] as DurationFilter[]).map((f) => (
                    <button key={f} onClick={() => { haptic("light"); setDurationFilter(f); }}
                      className={`rounded-full px-3 py-1.5 font-body text-[11px] transition-colors ${
                        durationFilter === f ? "bg-primary text-primary-foreground" : "bg-muted/60 text-muted-foreground hover:bg-muted"
                      }`}>
                      {f === "all" ? "All" : f === "short" ? "Under 5 min" : f === "medium" ? "5–15 min" : "15+ min"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <p className="font-body text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Category</p>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORY_OPTIONS.map((opt) => (
                    <button key={opt.value} onClick={() => { haptic("light"); setCategoryFilter(opt.value); }}
                      className={`rounded-full px-3 py-1.5 font-body text-[11px] transition-colors ${
                        categoryFilter === opt.value ? "bg-primary text-primary-foreground" : "bg-muted/60 text-muted-foreground hover:bg-muted"
                      }`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Intensity */}
              <div>
                <p className="font-body text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Intensity</p>
                <div className="space-y-1.5">
                  {INTENSITY_OPTIONS.map((opt) => (
                    <button key={opt.value} onClick={() => { haptic("light"); setIntensityFilter(opt.value); }}
                      className={`w-full text-left rounded-xl px-3 py-2 font-body text-[11px] transition-colors flex items-center justify-between ${
                        intensityFilter === opt.value ? "bg-primary text-primary-foreground" : "bg-muted/60 text-muted-foreground hover:bg-muted"
                      }`}>
                      <div>
                        <span className="font-medium">{opt.label}</span>
                        {opt.desc && <span className={`block text-[10px] mt-0.5 ${intensityFilter === opt.value ? "text-primary-foreground/70" : "text-muted-foreground/60"}`}>{opt.desc}</span>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {activeCount > 0 && (
                <button onClick={() => { haptic("light"); clearAll(); }}
                  className="flex items-center gap-1 font-body text-[11px] text-primary hover:text-primary/80 transition-colors">
                  <X className="h-3 w-3" /> Clear all filters
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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

// ── Card themes ──
const CARD_THEME: Record<string, {
  border: string; bg: string; Icon: typeof Moon; iconColor: string;
}> = {
  meditation:       { border: "hsl(var(--primary))",   bg: "hsl(var(--primary) / 0.04)",   Icon: CircleDot,  iconColor: "hsl(var(--primary) / 0.35)" },
  sleep:            { border: "hsl(220 40% 18%)",      bg: "hsl(220 30% 14% / 0.06)",      Icon: Moon,       iconColor: "hsl(220 30% 35% / 0.4)" },
  "inner-work":     { border: "hsl(30 60% 55%)",       bg: "hsl(30 60% 55% / 0.05)",       Icon: Wind,       iconColor: "hsl(30 50% 50% / 0.4)" },
  reading:          { border: "hsl(var(--primary))",    bg: "hsl(var(--primary) / 0.04)",    Icon: BookOpen,   iconColor: "hsl(var(--primary) / 0.35)" },
  "phase-practice": { border: "hsl(var(--primary))",    bg: "hsl(var(--primary) / 0.04)",    Icon: CircleDot,  iconColor: "hsl(var(--primary) / 0.3)" },
};
const DEFAULT_THEME = CARD_THEME.meditation;

// ── Meditation Practice Card ──
function MeditationCard({
  script, index, isDone, onSelect, isSleep,
}: {
  script: MeditationScript; index: number; isDone: boolean;
  onSelect: (s: MeditationScript) => void; isSleep?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const theme = CARD_THEME[script.category] || DEFAULT_THEME;
  const { guard: guardExpand } = useGatedExpand("nervous_browse");
  const CornerIcon = theme.Icon;

  return (
    <motion.div
      custom={index} initial="hidden" animate="visible" variants={cardVariant}
      className="relative overflow-hidden rounded-2xl border border-border shadow-sm"
      style={{ borderLeft: `3px solid ${theme.border}`, backgroundColor: isSleep ? "#EDE8F0" : theme.bg }}
    >
      {isSleep && (
        <svg className="absolute top-3 right-3 pointer-events-none" width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ opacity: 0.06 }}>
          <path d="M48 36c0-11-9-20-20-20a20 20 0 0 0-4 .4A16 16 0 1 1 47.6 40a20 20 0 0 0 .4-4Z" fill="currentColor" />
        </svg>
      )}
      <CornerIcon className="absolute top-4 right-4 h-5 w-5 pointer-events-none" style={{ color: theme.iconColor }} strokeWidth={1.5} />

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
          <span className="font-body text-[10px] px-2.5 py-0.5 rounded-full font-medium bg-primary/10 text-primary">
            {script.category.replace("-", " ")}
          </span>
          <span className={`font-body text-[10px] px-2.5 py-0.5 rounded-full font-medium ${
            getIntensity(script) === "beginner" ? "bg-emerald-500/10 text-emerald-700" :
            getIntensity(script) === "intermediate" ? "bg-amber-500/10 text-amber-700" :
            "bg-rose-500/10 text-rose-700"
          }`}>
            {getIntensity(script)}
          </span>
          <span className="font-body text-[11px] text-muted-foreground/70 flex items-center gap-1">
            <Clock className="h-3 w-3" /> {formatMeditationDuration(script.durationSec)}
          </span>
        </div>

        {!expanded && (
          <div className="mt-2 flex items-end justify-between gap-3">
              <button onClick={() => { haptic("light"); if (guardExpand()) setExpanded(true); }} className="flex-1 min-w-0 text-left group">
                <p className="font-body text-[12px] text-muted-foreground leading-relaxed line-clamp-1">{script.description}</p>
              <span className="inline-flex items-center gap-0.5 font-body text-[10px] text-primary mt-0.5">
                Read more <ChevronDown className="h-3 w-3" />
              </span>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); haptic("medium"); onSelect(script); }}
              className={`shrink-0 rounded-full px-4 py-2 font-display text-xs italic active:scale-[0.96] flex items-center gap-1.5 transition-transform ${
                isSleep ? "bg-primary/70 text-primary-foreground" : "bg-primary text-primary-foreground"
              }`}
            >
              <Play className="h-3 w-3" /> Begin →
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: "easeOut" }} className="overflow-hidden">
            <div className="px-4 pb-4">
              <button onClick={() => { haptic("light"); setExpanded(false); }} className="inline-flex items-center gap-0.5 font-body text-[10px] text-primary mb-2">
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

// ── Breathwork icon SVGs ──
const BreathworkIcon = ({ id }: { id: string }) => {
  const cls = "text-primary/30";
  const size = 36;
  if (id === "box-breathing") return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" className={cls}>
      <rect x="6" y="6" width="24" height="24" rx="2" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" />
      <rect x="12" y="12" width="12" height="12" rx="1" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    </svg>
  );
  if (id === "physiological-sigh") return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" className={cls}>
      <path d="M4 22c4-8 8 4 12-4s4 2 8-6 4 8 8 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M4 26c4-4 8 2 12-2s4 1 8-3 4 4 8 0" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
  if (id === "four-seven-eight") return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" className={cls}>
      <path d="M26 14a10 10 0 1 0-3.5 7.6A7 7 0 0 1 26 14Z" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="15" cy="20" r="1.5" fill="currentColor" opacity="0.3" />
      <circle cx="20" cy="16" r="1" fill="currentColor" opacity="0.2" />
    </svg>
  );
  if (id === "coherent-breathing") return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" className={cls}>
      <path d="M3 20 l4-6 3 4 3-10 3 12 3-8 3 6 3-4 4 6 3-2 3 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="18" cy="18" r="3" stroke="currentColor" strokeWidth="1" opacity="0.3" />
    </svg>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" className={cls}>
      <circle cx="18" cy="18" r="10" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
    </svg>
  );
};

// ── Breathwork Card ──
function BreathworkCard({ p, index, onSelect }: { p: PracticeConfig; index: number; onSelect: (p: PracticeConfig) => void }) {
  const [expanded, setExpanded] = useState(false);
  const { guard: guardExpand } = useGatedExpand("nervous_browse");
  return (
    <motion.div
      key={p.id} custom={index} initial="hidden" animate="visible" variants={cardVariant}
      className={`card-warm p-5 cursor-pointer touch-card relative ${expanded ? "ring-[1.5px] ring-primary" : ""}`}
      onClick={() => { if (guardExpand()) setExpanded(!expanded); }}
    >
      <div className="absolute top-4 left-4"><BreathworkIcon id={p.id} /></div>
      <div className="pl-11">
        <h3 className="font-display text-lg italic text-foreground mb-1">{p.title}</h3>
        {p.phases && p.phases.length > 0 && (
          <div className="flex items-center gap-2.5 mb-2">
            <span className="font-body text-[28px] font-bold text-primary leading-none">
              {p.phases.map((ph) => ph.seconds).join("-")}
            </span>
            <motion.div
              className="w-4 h-4 rounded-full border-2 border-primary/50"
              animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              style={{ backgroundColor: "hsl(var(--primary) / 0.15)" }}
            />
          </div>
        )}
        <p className="font-body text-[14px] text-foreground/70 mb-1">{p.subtitle}</p>
        <div className="flex items-center gap-2 mb-2">
          {p.audio.enabled && (
            <span className="flex items-center gap-1.5 font-body text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[#FAF7F4] text-primary border border-primary/15 shadow-sm">
              <Volume2 className="h-3.5 w-3.5 text-primary" /> Guided audio
            </span>
          )}
          <span className="font-body text-[11px] text-muted-foreground/70 flex items-center gap-1">
            <Clock className="h-3 w-3" /> {formatDuration(p.durationSec)}
          </span>
        </div>

        {!expanded && (
          <div className="flex items-end justify-between gap-3 mt-1">
            <p className="font-display text-[12px] italic text-muted-foreground leading-relaxed line-clamp-1 flex-1 min-w-0">{p.benefit}</p>
            <button
              onClick={(e) => { e.stopPropagation(); haptic("medium"); onSelect(p); }}
              className="shrink-0 rounded-full border border-primary/25 px-3.5 h-9 font-display text-xs italic text-primary active:scale-[0.96] flex items-center gap-1.5 transition-transform hover:bg-primary/5"
            >
              Begin →
            </button>
          </div>
        )}
        {expanded && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.25, ease: "easeOut" }}>
            <p className="font-display text-[13px] italic text-muted-foreground leading-relaxed mb-3">{p.benefit}</p>
            <button
              onClick={(e) => { e.stopPropagation(); haptic("medium"); onSelect(p); }}
              className="touch-btn w-full rounded-[14px] bg-primary py-3.5 font-display text-base italic text-primary-foreground active:scale-[0.97]"
            >
              begin this practice →
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// ── Somatic fallback icons ──
const SomaticFallbackIcon = ({ id }: { id: string }) => {
  const cls = "text-primary/30";
  const s = 44;
  const icons: Record<string, JSX.Element> = {
    "butterfly-hug": (
      <svg width={s} height={s} viewBox="0 0 44 44" fill="none" className={cls}>
        <path d="M22 14c-6-8-16-2-12 8 2 5 8 8 12 10 4-2 10-5 12-10 4-10-6-16-12-8Z" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
    "grounding-54321": (
      <svg width={s} height={s} viewBox="0 0 44 44" fill="none" className={cls}>
        <circle cx="22" cy="22" r="14" stroke="currentColor" strokeWidth="1.5" />
        {[0,1,2,3,4].map(i => <circle key={i} cx={22 + 10*Math.cos((i*72-90)*Math.PI/180)} cy={22 + 10*Math.sin((i*72-90)*Math.PI/180)} r="2" fill="currentColor" opacity="0.4" />)}
      </svg>
    ),
    "somatic-orienting": (
      <svg width={s} height={s} viewBox="0 0 44 44" fill="none" className={cls}>
        <circle cx="22" cy="22" r="6" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="22" cy="22" r="12" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
        <path d="M22 6v4M22 34v4M6 22h4M34 22h4" stroke="currentColor" strokeWidth="1" />
      </svg>
    ),
    "havening-touch": (
      <svg width={s} height={s} viewBox="0 0 44 44" fill="none" className={cls}>
        <path d="M16 30c-2-4 0-8 4-10s8-1 10 3 0 8-4 10-8 1-10-3Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M20 20c1-3 3-5 6-4" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        <path d="M18 24c-1-3 0-6 3-7" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      </svg>
    ),
    "neurogenic-tremoring": (
      <svg width={s} height={s} viewBox="0 0 44 44" fill="none" className={cls}>
        <path d="M8 22c2-4 4 4 6-4s4 4 6-4 4 4 6-4 4 4 6-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M8 28c2-3 4 3 6-3s4 3 6-3 4 3 6-3 4 3 6-3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
      </svg>
    ),
    "body-scan": (
      <svg width={s} height={s} viewBox="0 0 44 44" fill="none" className={cls}>
        <ellipse cx="22" cy="14" rx="5" ry="6" stroke="currentColor" strokeWidth="1.5" />
        <path d="M17 20v14M27 20v14M14 28h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  };
  return icons[id] || (
    <svg width={s} height={s} viewBox="0 0 44 44" fill="none" className={cls}>
      <circle cx="22" cy="22" r="14" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
    </svg>
  );
};

// ── Somatic Card ──
function SomaticCard({ p, index, onSelect }: { p: PracticeConfig; index: number; onSelect: (p: PracticeConfig) => void }) {
  const [expanded, setExpanded] = useState(false);
  const { guard: guardExpand } = useGatedExpand("nervous_browse");
  return (
    <motion.div
      key={p.id} custom={index} initial="hidden" animate="visible" variants={cardVariant}
      className="card-warm p-5 cursor-pointer touch-card"
      onClick={() => { if (guardExpand()) setExpanded(!expanded); }}
    >
      <div className="flex gap-3 items-start">
        {p.illustrationUrl ? (
          <img src={p.illustrationUrl} alt={p.title} className="w-[44px] h-[44px] object-contain flex-shrink-0 rounded-lg" loading="lazy" width={44} height={44} />
        ) : (
          <SomaticFallbackIcon id={p.id} />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-lg italic text-foreground mb-1">{p.title}</h3>
          <div className="flex gap-1.5 mb-1.5 flex-wrap items-center">
            <span className="font-body text-[11px] px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">{p.subtitle}</span>
            <span className="font-body text-[11px] text-muted-foreground/70 flex items-center gap-1">
              <Clock className="h-3 w-3" /> {formatDuration(p.durationSec)}
            </span>
            {p.audio.enabled && (
              <span className="flex items-center gap-1.5 font-body text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[#FAF7F4] text-primary border border-primary/15 shadow-sm">
                <Volume2 className="h-3.5 w-3.5 text-primary" /> Guided
              </span>
            )}
          </div>
          {!expanded && (
            <div className="flex items-end justify-between gap-3 mt-1">
              <p className="font-display text-[12px] italic text-muted-foreground leading-relaxed line-clamp-1 flex-1 min-w-0">{p.benefit}</p>
              <button
                onClick={(e) => { e.stopPropagation(); haptic("medium"); onSelect(p); }}
                className="shrink-0 rounded-full border border-primary/25 px-3.5 h-9 font-display text-xs italic text-primary active:scale-[0.96] flex items-center gap-1.5 transition-transform hover:bg-primary/5"
              >
                Begin →
              </button>
            </div>
          )}
          {expanded && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.25, ease: "easeOut" }}>
              <p className="font-display text-[13px] italic text-muted-foreground leading-relaxed mb-3">{p.benefit}</p>
              <button
                onClick={(e) => { e.stopPropagation(); haptic("medium"); onSelect(p); }}
                className="touch-btn w-full rounded-[14px] bg-primary py-3.5 font-display text-base italic text-primary-foreground active:scale-[0.97]"
              >
                begin this practice →
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── MAIN PAGE ──
export default function NervousSystemPage() {
  const [tab, setTab] = useState<TabId>(() => {
    return new Date().getHours() >= 20 ? "sleep" : "meditations";
  });
  const [durationFilter, setDurationFilter] = useState<DurationFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [intensityFilter, setIntensityFilter] = useState<IntensityFilter>("all");
  const [activePractice, setActivePractice] = useState<PracticeConfig | null>(null);
  const [showFasciaRelease, setShowFasciaRelease] = useState(false);
  const activeFilterCount = (durationFilter !== "all" ? 1 : 0) + (categoryFilter !== "all" ? 1 : 0) + (intensityFilter !== "all" ? 1 : 0);
  const { currentPhase } = useCycle();
  const { completed, streak, logCompletion } = useMindfulnessLogs();
  const sleepMusic = useSleepMusic();
  const navigate = useNavigate();

  // Meditation scripts for the meditations tab
  const meditationScripts = useMemo(() => {
    let all: MeditationScript[] = [
      ...MEDITATION_SCRIPTS,
      ...GEN_MEDITATION_SCRIPTS,
      ...READING_SCRIPTS,
      ...INNER_WORK_SCRIPTS,
      ...GEN_INNER_WORK_SCRIPTS,
      ...PHASE_SCRIPTS,
      ...QUICK_PRACTICES,
      ...GROUNDING_PRACTICES,
      ...PRESENCE_PRACTICES,
    ];
    // Category filter
    if (categoryFilter !== "all") {
      all = all.filter(s => s.category === categoryFilter);
    }
    // Intensity filter
    if (intensityFilter !== "all") {
      all = all.filter(s => getIntensity(s) === intensityFilter);
    }
    return filterByDuration(all, durationFilter);
  }, [durationFilter, categoryFilter, intensityFilter]);

  // Sleep scripts
  const sleepScripts = useMemo(() => {
    const all = [...SLEEP_SCRIPTS, ...GEN_SLEEP_SCRIPTS];
    return filterByDuration(all, durationFilter);
  }, [durationFilter]);

  // Breathwork practices
  const breathworkPractices = useMemo(() => {
    return filterByDuration(BREATHWORK_PRACTICES, durationFilter);
  }, [durationFilter]);

  // Somatic practices
  const somaticPractices = useMemo(() => {
    return filterByDuration(SOMATIC_PRACTICES, durationFilter);
  }, [durationFilter]);

  const handleSelectMeditation = (script: MeditationScript) => {
    setActivePractice(toPracticeConfig(script));
  };

  const handleClose = () => {
    if (activePractice) {
      logCompletion(activePractice.id, activePractice.durationSec, currentPhase);
    }
    setActivePractice(null);
  };

  const TAB_SUBTITLES: Record<TabId, string> = {
    meditations: "Meditations & inner work.",
    breathwork: "Breathwork & regulation.",
    somatic: "Somatic exercises.",
    sleep: "Sleep & rest.",
  };

  return (
    <div>
      <div className="relative">
        <AtmosphericHero size="md">
          <SignalPulse />
          <div className="text-center relative z-10 px-6">
            <p className="font-body text-xs uppercase tracking-[0.3em] text-primary-foreground/40 mb-4">Mindfulness</p>
            <h1 className="font-display text-[3rem] md:text-[4rem] font-extrabold text-primary-foreground leading-[1.02] mb-4">Still</h1>
            <p className="font-editorial text-base md:text-lg italic text-primary-foreground/60 max-w-md mx-auto">
              {TAB_SUBTITLES[tab]}
            </p>
          </div>
        </AtmosphericHero>

        <ContentSection className="px-5 md:px-4">
          {/* Embodiment Course entry card */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            onClick={() => { haptic("medium"); navigate("/embodiment/course"); }}
            className="w-full text-left mb-5 p-5 rounded-2xl border border-primary/20 bg-gradient-to-br from-teal-500/10 to-emerald-400/5 hover:border-primary/40 active:scale-[0.99] transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500/20 to-emerald-400/10 flex items-center justify-center shrink-0">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body text-[10px] uppercase tracking-widest text-primary/60 mb-0.5">New Course</p>
                <h3 className="font-display text-sm font-bold text-foreground">Nervous System Healing</h3>
                <p className="font-body text-xs text-muted-foreground mt-1 line-clamp-2">
                  Polyvagal theory, window of tolerance, coercive control, attachment, body signals & your personalised toolkit.
                </p>
                <p className="font-body text-[10px] text-primary mt-2">6 modules · 18 lessons · 70 activities →</p>
              </div>
            </div>
          </motion.button>

          {/* 4-tab nav */}
          <div className="sticky top-0 md:static z-20 bg-background/95 backdrop-blur-sm pb-3 -mx-5 px-5 md:mx-0 md:px-0 pt-2 md:pt-0">
            <div className="flex bg-muted/60 rounded-2xl p-1 max-w-lg mx-auto overflow-x-auto scrollbar-hide">
              {TABS.map((t) => {
                const TabIcon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => { haptic("light"); setTab(t.id); setDurationFilter("all"); setCategoryFilter("all"); setIntensityFilter("all"); }}
                    className={`touch-tab flex-1 py-2.5 rounded-xl font-display text-[13px] transition-all flex items-center justify-center gap-1 whitespace-nowrap min-w-0 px-2 ${
                      tab === t.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground italic"
                    }`}
                  >
                    <TabIcon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filters — expandable panel for meditations, simple duration pills for other tabs */}
          {tab === "meditations" ? (
            <FilterPanel
              durationFilter={durationFilter} setDurationFilter={setDurationFilter}
              categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter}
              intensityFilter={intensityFilter} setIntensityFilter={setIntensityFilter}
              activeCount={activeFilterCount}
            />
          ) : (
            <div className="flex gap-2 pb-3 overflow-x-auto scrollbar-hide">
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

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${tab}-${durationFilter}-${categoryFilter}-${intensityFilter}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="space-y-8 md:space-y-10"
            >
              {/* Meditations tab */}
              {tab === "meditations" && meditationScripts.length === 0 && (
                <div className="text-center py-12">
                  <p className="font-body text-sm text-muted-foreground">No practices match your filters</p>
                  <button onClick={() => { setDurationFilter("all"); setCategoryFilter("all"); setIntensityFilter("all"); }}
                    className="font-body text-xs text-primary mt-2 hover:underline">Clear filters</button>
                </div>
              )}
              {tab === "meditations" && meditationScripts.map((s, i) => (
                <MeditationCard key={s.id} script={s} index={i} isDone={completed.has(s.id)} onSelect={handleSelectMeditation} />
              ))}

              {/* Breathwork tab */}
              {tab === "breathwork" && breathworkPractices.map((p, i) => (
                <BreathworkCard key={p.id} p={p} index={i} onSelect={setActivePractice} />
              ))}

              {/* Somatic tab */}
              {tab === "somatic" && (
                <>
                  {/* Fascia Release special card */}
                  <FasciaReleaseCard index={0} onSelect={() => setShowFasciaRelease(true)} />
                  {somaticPractices.map((p, i) => (
                    <SomaticCard key={p.id} p={p} index={i + 1} onSelect={setActivePractice} />
                  ))}
                </>
              )}

              {/* Sleep tab */}
              {tab === "sleep" && (
                <>
                  <SleepTimer
                    onTimerEnd={sleepMusic.stop}
                    musicPlaying={sleepMusic.playing}
                    onToggleMusic={sleepMusic.toggle}
                    musicLoading={sleepMusic.loading}
                  />
                  {sleepScripts.map((s, i) => (
                    <MeditationCard key={s.id} script={s} index={i} isDone={completed.has(s.id)} onSelect={handleSelectMeditation} isSleep />
                  ))}
                </>
              )}
            </motion.div>
          </AnimatePresence>

          <BotanicalSprig width={160} className="mx-auto mt-8" />
        </ContentSection>

        {/* Players */}
        {activePractice?.mode === "timed-breath" && (
          <BreathworkPlayer practice={activePractice} onClose={() => { handleClose(); }} />
        )}
        {activePractice?.mode === "narrated-sequence" && (
          <SomaticPlayer practice={activePractice} onClose={handleClose} />
        )}
        {showFasciaRelease && (
          <FasciaReleasePlayer onClose={() => setShowFasciaRelease(false)} />
        )}
      </div>
    </div>
  );
}

// ── Fascia Release special card ──
function FasciaReleaseCard({ index, onSelect }: { index: number; onSelect: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const { guard: guardExpand } = useGatedExpand("nervous_browse");
  return (
    <motion.div
      custom={index} initial="hidden" animate="visible" variants={cardVariant}
      className="card-warm p-5 cursor-pointer touch-card"
      onClick={() => { if (guardExpand()) setExpanded(!expanded); }}
    >
      <div className="flex gap-3 items-start">
        <img src={fasciaReleaseImg} alt="Morning Fascia Release" className="w-[44px] h-[44px] object-contain flex-shrink-0 rounded-lg" loading="lazy" width={44} height={44} />
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-lg italic text-foreground mb-1">Morning Fascia Release</h3>
          <div className="flex gap-1.5 mb-1.5 flex-wrap">
            <span className="font-body text-[11px] px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">full body</span>
            <span className="font-body text-[11px] text-muted-foreground/70 flex items-center gap-1">
              <Clock className="h-3 w-3" /> 7 min
            </span>
            <span className="flex items-center gap-1.5 font-body text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[#FAF7F4] text-primary border border-primary/15 shadow-sm">
              <Volume2 className="h-3.5 w-3.5 text-primary" /> Guided
            </span>
          </div>
          {!expanded && (
            <div className="flex items-end justify-between gap-3 mt-1">
              <p className="font-display text-[12px] italic text-muted-foreground leading-relaxed line-clamp-1 flex-1 min-w-0">
                A 7-move morning sequence to wake up the fascia, move the lymph, and reset your nervous system.
              </p>
              <button
                onClick={(e) => { e.stopPropagation(); haptic("medium"); onSelect(); }}
                className="shrink-0 rounded-full border border-primary/25 px-3.5 h-9 font-display text-xs italic text-primary active:scale-[0.96] flex items-center gap-1.5 transition-transform hover:bg-primary/5"
              >
                Begin →
              </button>
            </div>
          )}
          {expanded && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.25, ease: "easeOut" }}>
              <p className="font-display text-[13px] italic text-muted-foreground leading-relaxed mb-3">
                A 7-move morning sequence to wake up the fascia, move the lymph, and reset your nervous system.
              </p>
              <button
                onClick={(e) => { e.stopPropagation(); haptic("medium"); onSelect(); }}
                className="touch-btn w-full rounded-[14px] bg-primary py-3.5 font-display text-base italic text-primary-foreground active:scale-[0.97]"
              >
                begin this practice →
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
