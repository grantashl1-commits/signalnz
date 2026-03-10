import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2, Search } from "lucide-react";
import { BotanicalSprig, CymatiSketch, HandDrawnBook, HandDrawnSparkle, HandDrawnLeaf, WildStar } from "@/components/BotanicalElements";
import { getCycleInfo, getLastPeriodStart } from "@/lib/cycle-utils";
import { haptic } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";

// ── CONSTANTS ─────────────────────────────────────────────────
const PROMPTS = [
  { key: "proud", label: "Today I was proud of…", ph: "Even the smallest thing counts. What showed up in you today that deserves acknowledgement?", rows: 3 },
  { key: "feeling", label: "Today I felt…", ph: "What emotions visited you? Where did you feel them in your body?", rows: 3 },
  { key: "grateful", label: "Today I was grateful for…", ph: "What moments, people or small things brought a sense of thankfulness?", rows: 3 },
  { key: "working_towards", label: "Right now I am working towards…", ph: "What intention, goal or change are you nurturing in yourself?", rows: 3 },
  { key: "challenge", label: "Today didn't go well when…", ph: "What felt hard? Which part of you struggled — and what was it protecting you from?", rows: 3 },
  { key: "body", label: "In my body today I noticed…", ph: "Where did you hold tension or ease? What was your body communicating?", rows: 3 },
  { key: "inner_voice", label: "My inner voice said today…", ph: "What did the self-critic, the worrier, or the inner child say? Which part was speaking?", rows: 3 },
  { key: "desire", label: "Something I secretly want…", ph: "What do you yearn for but haven't let yourself fully claim yet? No judgement here.", rows: 3 },
  { key: "tomorrow", label: "Tomorrow I will…", ph: "One intention. One act of self-care or courage you'll offer yourself.", rows: 2 },
  { key: "free", label: "Anything on my mind…", ph: "This space belongs entirely to you. No prompts, no structure — just the truth of today.", rows: 5 },
];

const TRACKING = [
  { key: "mood", label: "Mood", max: 10 },
  { key: "energy", label: "Energy", max: 10 },
];

const MILESTONES = [
  { count: 7, label: "1-Week Reflection", type: "weekly" },
  { count: 14, label: "2-Week Reflection", type: "weekly" },
  { count: 21, label: "3-Week Reflection", type: "weekly" },
  { count: 30, label: "Monthly Reflection", type: "monthly" },
  { count: 90, label: "3-Month Reflection", type: "quarterly" },
  { count: 180, label: "6-Month Reflection", type: "biannual" },
  { count: 365, label: "Yearly Reflection", type: "yearly" },
];

// ── STORAGE ───────────────────────────────────────────────────
interface JournalEntry {
  id: string;
  date: string;
  timestamp: number;
  prompts: Record<string, string>;
  tracking: Record<string, number>;
  tags: string[];
  ai: any | null;
}

interface MilestoneAnalysis {
  milestoneType: string;
  count: number;
  date: string;
  analysis: any;
}

function loadEntries(): JournalEntry[] {
  try {
    const raw = localStorage.getItem("mindcast_journal_v2");
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveEntries(entries: JournalEntry[]) {
  localStorage.setItem("mindcast_journal_v2", JSON.stringify(entries));
}

function loadMilestones(): MilestoneAnalysis[] {
  try {
    const raw = localStorage.getItem("mindcast_milestones");
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveMilestones(milestones: MilestoneAnalysis[]) {
  localStorage.setItem("mindcast_milestones", JSON.stringify(milestones));
}

function getNextMilestone(entryCount: number, completedMilestones: MilestoneAnalysis[]): typeof MILESTONES[0] | null {
  const completedCounts = new Set(completedMilestones.map(m => m.count));
  return MILESTONES.find(m => entryCount >= m.count && !completedCounts.has(m.count)) || null;
}

// ── PILL ──────────────────────────────────────────────────────
function Pill({ label, variant = "sage" }: { label: string; variant?: "sage" | "primary" | "blue" }) {
  const cls = variant === "primary"
    ? "bg-primary/10 text-primary"
    : variant === "blue"
    ? "bg-[hsl(220,60%,95%)] text-[hsl(220,50%,45%)]"
    : "bg-phase-follicular/10 text-phase-follicular";
  return (
    <span className={`font-mono text-[11px] px-2.5 py-0.5 rounded-full ${cls}`}>{label}</span>
  );
}

// ── TRACKING ICONS ────────────────────────────────────────────
function MoodIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ opacity: 0.7 }}>
      <circle cx={8} cy={8} r={6.5} fill="none" stroke="hsl(var(--phase-follicular))" strokeWidth={0.9} />
      <circle cx={6} cy={6.5} r={0.7} fill="hsl(var(--phase-follicular))" opacity={0.6} />
      <circle cx={10} cy={6.5} r={0.7} fill="hsl(var(--phase-follicular))" opacity={0.6} />
      <path d="M 5.5 9.5 Q 8 12 10.5 9.5" fill="none" stroke="hsl(var(--phase-follicular))" strokeWidth={0.7} strokeLinecap="round" />
    </svg>
  );
}

function EnergyIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ opacity: 0.7 }}>
      <path d="M 9 2 L 6 8 L 9 8 L 7 14" fill="none" stroke="hsl(var(--primary))" strokeWidth={1} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const TRACKING_ICONS: Record<string, React.FC<{ size?: number }>> = {
  mood: MoodIcon,
  energy: EnergyIcon,
};

// ── PODCAST ICON ──────────────────────────────────────────────
function HandDrawnHeadphones({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" style={{ opacity: 0.7 }}>
      <path d="M 4 12 Q 4 6 10 5 Q 16 6 16 12" fill="none" stroke="hsl(var(--primary))" strokeWidth={0.9} strokeLinecap="round" />
      <path d="M 4 11 L 4 15 Q 4 16 5 16 L 6 16 Q 7 16 7 15 L 7 12 Q 7 11 6 11 L 5 11 Q 4 11 4 12" fill="none" stroke="hsl(var(--primary))" strokeWidth={0.7} />
      <path d="M 16 11 L 16 15 Q 16 16 15 16 L 14 16 Q 13 16 13 15 L 13 12 Q 13 11 14 11 L 15 11 Q 16 11 16 12" fill="none" stroke="hsl(var(--primary))" strokeWidth={0.7} />
    </svg>
  );
}

// ── NEW ENTRY FORM ────────────────────────────────────────────
function NewEntryForm({ onSaved }: { onSaved: (entries: JournalEntry[]) => void }) {
  const [prompts, setPrompts] = useState<Record<string, string>>({});
  const [tracking, setTracking] = useState({ mood: 5, energy: 5 });
  const [saving, setSaving] = useState(false);

  const today = new Date().toLocaleDateString("en-NZ", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const save = () => {
    setSaving(true);
    haptic("medium");
    const entry: JournalEntry = {
      id: Date.now().toString(),
      date: today,
      timestamp: Date.now(),
      prompts,
      tracking,
      tags: [],
      ai: null,
    };
    const existing = loadEntries();
    const updated = [entry, ...existing];
    saveEntries(updated);
    setSaving(false);
    onSaved(updated);
  };

  return (
    <div className="space-y-3 pb-10">
      <p className="font-mono text-xs text-muted-foreground">{today}</p>

      {/* Tracking sliders */}
      <div className="card-warm p-5">
        <h3 className="font-display text-lg italic text-foreground mb-4">How does your body feel right now?</h3>
        {TRACKING.map((f) => {
          const Icon = TRACKING_ICONS[f.key];
          return (
            <div key={f.key} className="mb-3.5">
              <div className="flex justify-between mb-1">
                <span className="font-mono text-[13px] text-foreground/70 flex items-center gap-1.5">
                  {Icon && <Icon size={14} />} {f.label}
                </span>
                <span className="font-display text-lg italic text-primary">{tracking[f.key as keyof typeof tracking]}</span>
              </div>
              <input
                type="range"
                min={0}
                max={f.max}
                value={tracking[f.key as keyof typeof tracking]}
                onChange={(e) => setTracking((t) => ({ ...t, [f.key]: +e.target.value }))}
                className="w-full accent-primary cursor-pointer"
              />
            </div>
          );
        })}
      </div>

      {/* Journal prompts */}
      {PROMPTS.map((p) => (
        <div key={p.key} className="card-warm p-5">
          <label className="block font-display text-lg italic text-foreground mb-2.5">{p.label}</label>
          <textarea
            rows={p.rows}
            value={prompts[p.key] || ""}
            onChange={(e) => setPrompts((prev) => ({ ...prev, [p.key]: e.target.value }))}
            placeholder={p.ph}
            className="w-full font-display text-sm italic text-foreground bg-secondary/30 border border-border rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 leading-relaxed placeholder:text-muted-foreground/40"
            style={{ fontSize: "16px" }}
          />
        </div>
      ))}

      <button
        onClick={save}
        disabled={saving}
        className="touch-btn w-full rounded-[14px] bg-primary py-4 font-display text-[17px] italic text-primary-foreground active:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {saving ? "Saving…" : "Save entry"}
      </button>
    </div>
  );
}

// ── ENTRIES LIST ──────────────────────────────────────────────
function EntriesList({
  entries,
  onAnalyse,
  onViewAnalysis,
  onMilestoneAnalyse,
  milestone,
  milestoneLoading,
}: {
  entries: JournalEntry[];
  onAnalyse: (entry: JournalEntry) => void;
  onViewAnalysis: (entry: JournalEntry) => void;
  onMilestoneAnalyse: () => void;
  milestone: typeof MILESTONES[0] | null;
  milestoneLoading: boolean;
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return entries;
    const q = search.toLowerCase();
    return entries.filter((e) => {
      if (e.date.toLowerCase().includes(q)) return true;
      if (e.tags?.some(t => t.toLowerCase().includes(q))) return true;
      return Object.values(e.prompts || {}).some(v => v.toLowerCase().includes(q));
    });
  }, [entries, search]);

  if (!entries.length) {
    return (
      <div className="text-center pt-16">
        <HandDrawnBook size={48} color="hsl(var(--primary))" className="mx-auto mb-4" />
        <p className="font-display text-xl italic text-foreground mb-2">Your story begins today.</p>
        <p className="font-display text-sm italic text-muted-foreground">Your first entry is waiting to be written.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-10">
      {/* Milestone banner */}
      {milestone && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-gradient-to-br from-primary/8 to-phase-follicular/8 border border-primary/15 p-5"
        >
          <div className="flex items-center gap-2 mb-2">
            <WildStar size={22} />
            <h3 className="font-display text-lg italic text-foreground">{milestone.label}</h3>
          </div>
          <p className="font-display text-sm italic text-muted-foreground mb-3">
            You've reached {milestone.count} entries. Ready for a deep reflection on your growth and patterns?
          </p>
          <button
            onClick={onMilestoneAnalyse}
            disabled={milestoneLoading}
            className="rounded-xl bg-primary px-5 py-2.5 font-display text-sm italic text-primary-foreground active:opacity-90 disabled:opacity-50 flex items-center gap-2"
          >
            {milestoneLoading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Reflecting…</>
            ) : (
              <><HandDrawnSparkle size={14} color="hsl(var(--primary-foreground))" /> Begin {milestone.label}</>
            )}
          </button>
        </motion.div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search entries…"
          className="w-full rounded-xl border border-border bg-secondary/30 pl-9 pr-3 py-2.5 font-display text-sm italic text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
          style={{ fontSize: "16px" }}
        />
      </div>

      {filtered.length === 0 && search && (
        <p className="font-display text-sm italic text-muted-foreground text-center py-8">No entries match "{search}"</p>
      )}

      {filtered.map((e) => (
        <motion.div
          key={e.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-warm p-5"
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="font-display text-base italic text-foreground mb-1">{e.date}</p>
              {e.tracking && (
                <div className="flex gap-2.5 font-mono text-xs text-muted-foreground items-center">
                  <span className="flex items-center gap-1"><MoodIcon size={12} /> {e.tracking.mood}/10</span>
                  <span className="flex items-center gap-1"><EnergyIcon size={12} /> {e.tracking.energy}/10</span>
                </div>
              )}
            </div>
            {e.ai ? (
              <button
                onClick={() => onViewAnalysis(e)}
                className="font-mono text-[11px] text-muted-foreground bg-secondary rounded-full px-3.5 py-1.5 active:opacity-70"
              >
                View analysis
              </button>
            ) : (
              <button
                onClick={() => onAnalyse(e)}
                className="font-mono text-[11px] text-primary border border-primary/30 rounded-full px-3.5 py-1.5 active:opacity-70 flex items-center gap-1"
              >
                <HandDrawnSparkle size={12} color="hsl(var(--primary))" /> Analyse
              </button>
            )}
          </div>
          {e.prompts?.feeling && (
            <p className="font-display text-[13px] italic text-muted-foreground line-clamp-2 leading-relaxed mb-2.5">
              "{e.prompts.feeling}"
            </p>
          )}
          {e.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {e.tags.map((t) => (
                <Pill key={t} label={t} />
              ))}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

// ── AI ANALYSIS VIEW ──────────────────────────────────────────
function AnalysisView({ entry, onBack, isMilestone }: { entry: JournalEntry; onBack: () => void; isMilestone?: boolean }) {
  const ai = entry?.ai;

  if (!ai || !ai.summary || ai.summary.startsWith("Unable")) {
    return (
      <div className="text-center pt-16">
        <HandDrawnLeaf size={40} color="hsl(var(--primary))" className="mx-auto mb-4" />
        <p className="font-display text-xl italic text-foreground mb-2">
          {isMilestone ? "Reflecting on your journey…" : "Reading your entry with care…"}
        </p>
        <p className="font-mono text-xs text-muted-foreground">Your AI therapist is listening.</p>
        <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mt-6" />
      </div>
    );
  }

  const Section = ({ title, accent, children }: { title: string; accent?: string; children: React.ReactNode }) => (
    <div className={`card-warm p-5 mb-3 ${accent ? "border-l-[3px]" : ""}`} style={accent ? { borderLeftColor: accent } : undefined}>
      <h3 className="font-display text-[17px] italic text-foreground mb-2.5">{title}</h3>
      {children}
    </div>
  );

  return (
    <div className="pb-10">
      <button onClick={onBack} className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground mb-4 active:opacity-70">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to entries
      </button>
      <h2 className="font-display text-2xl font-bold italic text-foreground mb-0.5">
        {isMilestone ? ai.milestone_title || "Growth Reflection" : "Soul Analysis"}
      </h2>
      <p className="font-mono text-xs text-muted-foreground mb-5">{entry.date}</p>

      {/* Summary */}
      {ai.summary && (
        <div className="rounded-2xl bg-primary/5 border border-primary/15 p-4.5 mb-3">
          <p className="font-mono text-[11px] text-primary uppercase tracking-wider mb-2">
            {isMilestone ? "Your journey so far" : "Today's signal"}
          </p>
          <p className="font-display text-sm italic text-foreground/80 leading-relaxed">{ai.summary}</p>
        </div>
      )}

      {/* Growth arc (milestone only) */}
      {ai.growth_arc && (
        <Section title="Your Growth Arc" accent="hsl(var(--phase-follicular))">
          <p className="font-display text-sm italic text-foreground/70 leading-relaxed">{ai.growth_arc}</p>
        </Section>
      )}

      {/* Evolved patterns (milestone only) */}
      {ai.evolved_patterns?.length > 0 && (
        <Section title="How You've Evolved">
          {ai.evolved_patterns.map((p: string, i: number) => (
            <div key={i} className="flex gap-2.5 mb-2.5">
              <span className="text-sm text-phase-follicular flex-shrink-0 mt-0.5">·</span>
              <p className="font-display text-sm italic text-foreground/70 leading-relaxed">{p}</p>
            </div>
          ))}
        </Section>
      )}

      {/* Themes & Emotions */}
      {(ai.themes?.length > 0 || ai.emotions?.length > 0) && (
        <Section title="Themes & Emotions">
          <div className="flex flex-wrap gap-1.5">
            {ai.themes?.map((t: string) => <Pill key={t} label={t} variant="primary" />)}
            {ai.emotions?.map((e: string) => <Pill key={e} label={e} />)}
          </div>
        </Section>
      )}

      {/* IFS Insight */}
      {ai.ifs_insight && (
        <Section title="Parts Work Insight (IFS)" accent="hsl(var(--petal-gold))">
          <p className="font-display text-sm italic text-foreground/70 leading-relaxed">{ai.ifs_insight}</p>
        </Section>
      )}

      {/* Patterns */}
      {ai.patterns?.length > 0 && (
        <Section title="Patterns I Notice">
          {ai.patterns.map((p: string, i: number) => (
            <div key={i} className="flex gap-2.5 mb-2.5">
              <span className="text-sm text-[hsl(var(--petal-gold))] flex-shrink-0 mt-0.5">·</span>
              <p className="font-display text-sm italic text-foreground/70 leading-relaxed">{p}</p>
            </div>
          ))}
        </Section>
      )}

      {/* Unspoken desires */}
      {ai.unspoken_desires && (
        <div className="rounded-2xl bg-phase-follicular/5 border border-phase-follicular/15 p-4.5 mb-3">
          <h3 className="font-display text-[17px] italic text-foreground mb-2">What I sense you're reaching for…</h3>
          <p className="font-display text-sm italic text-phase-follicular leading-relaxed">{ai.unspoken_desires}</p>
        </div>
      )}

      {/* Strengths */}
      {ai.strengths?.length > 0 && (
        <Section title="Strengths I See in You">
          <div className="flex flex-wrap gap-1.5">
            {ai.strengths.map((s: string) => <Pill key={s} label={s} variant="blue" />)}
          </div>
        </Section>
      )}

      {/* Recommendations */}
      {ai.recommendations?.length > 0 && (
        <Section title="Recommendations For You">
          {ai.recommendations.map((r: any, i: number) => (
            <div key={i} className="flex gap-3 bg-secondary/30 rounded-xl p-3.5 mb-2">
              <div className="mt-0.5">
                {r.type === "book" ? <HandDrawnBook size={20} color="hsl(var(--primary))" /> : r.type === "podcast" ? <HandDrawnHeadphones size={20} /> : <HandDrawnLeaf size={20} color="hsl(var(--phase-follicular))" />}
              </div>
              <div>
                <p className="font-display text-sm italic text-foreground mb-0.5">{r.title}</p>
                <p className="font-mono text-xs text-muted-foreground leading-snug mb-1.5">{r.reason}</p>
                <Pill label={r.type} variant="primary" />
              </div>
            </div>
          ))}
        </Section>
      )}

      {/* Next steps */}
      {ai.next_steps?.length > 0 && (
        <Section title="Your Next Steps">
          {ai.next_steps.map((s: string, i: number) => (
            <div key={i} className="flex gap-2.5 mb-2.5">
              <span className="font-mono text-xs text-primary font-bold flex-shrink-0 mt-0.5">{i + 1}.</span>
              <p className="font-display text-sm italic text-foreground/70 leading-relaxed">{s}</p>
            </div>
          ))}
        </Section>
      )}

      {/* Affirmation */}
      {ai.affirmation && (
        <div className="rounded-2xl bg-gradient-to-br from-primary/5 to-secondary p-6 text-center mb-3 border border-primary/10">
          <WildStar size={28} className="mx-auto mb-3" />
          <p className="font-display text-lg italic text-foreground leading-relaxed">"{ai.affirmation}"</p>
        </div>
      )}
    </div>
  );
}

// ── MILESTONE ANALYSIS VIEW ───────────────────────────────────
function MilestoneView({ milestone, onBack }: { milestone: MilestoneAnalysis; onBack: () => void }) {
  const fakeEntry: JournalEntry = {
    id: `milestone-${milestone.count}`,
    date: milestone.date,
    timestamp: Date.now(),
    prompts: {},
    tracking: { mood: 0, energy: 0 },
    tags: [],
    ai: milestone.analysis,
  };
  return <AnalysisView entry={fakeEntry} onBack={onBack} isMilestone />;
}

// ── MAIN PAGE ─────────────────────────────────────────────────
export default function JournalPage() {
  const info = getCycleInfo(getLastPeriodStart());
  const [view, setView] = useState<"list" | "new" | "analysis" | "milestone">("list");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [activeEntry, setActiveEntry] = useState<JournalEntry | null>(null);
  const [analysing, setAnalysing] = useState(false);
  const [milestones, setMilestones] = useState<MilestoneAnalysis[]>([]);
  const [milestoneLoading, setMilestoneLoading] = useState(false);
  const [activeMilestone, setActiveMilestone] = useState<MilestoneAnalysis | null>(null);

  useEffect(() => {
    setEntries(loadEntries());
    setMilestones(loadMilestones());
  }, []);

  const nextMilestone = useMemo(() => getNextMilestone(entries.length, milestones), [entries.length, milestones]);

  const handleAnalyse = async (entry: JournalEntry) => {
    setAnalysing(true);
    setActiveEntry({ ...entry, ai: null });
    setView("analysis");
    haptic("medium");

    try {
      const { data, error } = await supabase.functions.invoke("journal-ai", {
        body: {
          entry,
          recentEntries: entries.filter((e) => e.id !== entry.id).slice(0, 5),
        },
      });

      if (error) throw error;

      const updated = entries.map((e) =>
        e.id === entry.id ? { ...e, ai: data, tags: data.tags || [] } : e
      );
      setEntries(updated);
      saveEntries(updated);
      setActiveEntry({ ...entry, ai: data, tags: data.tags || [] });
    } catch {
      setActiveEntry({
        ...entry,
        ai: {
          summary: "Unable to analyse right now — please try again in a moment.",
          themes: [],
          recommendations: [],
          next_steps: [],
          tags: [],
        },
      });
    }
    setAnalysing(false);
  };

  const handleMilestoneAnalyse = async () => {
    if (!nextMilestone) return;
    setMilestoneLoading(true);
    haptic("medium");

    try {
      const { data, error } = await supabase.functions.invoke("journal-ai", {
        body: {
          milestoneType: nextMilestone.type,
          milestoneCount: nextMilestone.count,
          milestoneLabel: nextMilestone.label,
          allEntries: entries.slice(0, nextMilestone.count),
        },
      });

      if (error) throw error;

      const newMilestone: MilestoneAnalysis = {
        milestoneType: nextMilestone.type,
        count: nextMilestone.count,
        date: new Date().toLocaleDateString("en-NZ", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
        analysis: data,
      };

      const updatedMilestones = [...milestones, newMilestone];
      setMilestones(updatedMilestones);
      saveMilestones(updatedMilestones);
      setActiveMilestone(newMilestone);
      setView("milestone");
    } catch {
      // Silently fail
    }
    setMilestoneLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto relative">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.04]">
        <CymatiSketch phase={info.phase} size={300} opacity={1} className="md:hidden" />
        <CymatiSketch phase={info.phase} size={500} opacity={1} className="hidden md:block" />
      </div>

      {/* Header */}
      {view !== "analysis" && view !== "milestone" && (
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="font-hand text-sm font-bold text-primary">Journal</p>
            <h1 className="font-display text-[1.75rem] md:text-4xl font-bold italic text-foreground mt-0.5">
              {view === "new" ? "New Entry" : "My Journal"}
            </h1>
            {view === "list" && entries.length > 0 && (
              <p className="font-mono text-xs text-muted-foreground mt-1">
                {entries.length} {entries.length === 1 ? "entry" : "entries"}
              </p>
            )}
          </div>
          <div>
            {view === "list" && (
              <button
                onClick={() => { haptic("medium"); setView("new"); }}
                className="touch-btn font-display text-[15px] italic text-primary-foreground bg-primary rounded-full px-5 py-2.5 active:opacity-90"
              >
                + New entry
              </button>
            )}
            {view === "new" && (
              <button
                onClick={() => setView("list")}
                className="font-mono text-xs text-muted-foreground active:opacity-70"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {view === "list" && (
            <EntriesList
              entries={entries}
              onAnalyse={handleAnalyse}
              onViewAnalysis={(e) => { setActiveEntry(e); setView("analysis"); }}
              onMilestoneAnalyse={handleMilestoneAnalyse}
              milestone={nextMilestone}
              milestoneLoading={milestoneLoading}
            />
          )}
          {view === "new" && (
            <NewEntryForm onSaved={(updated) => { setEntries(updated); setView("list"); }} />
          )}
          {view === "analysis" && activeEntry && (
            <AnalysisView entry={activeEntry} onBack={() => setView("list")} />
          )}
          {view === "milestone" && activeMilestone && (
            <MilestoneView milestone={activeMilestone} onBack={() => setView("list")} />
          )}
        </motion.div>
      </AnimatePresence>

      <BotanicalSprig width={160} className="mx-auto mt-8 md:hidden" />
      <BotanicalSprig width={200} className="mx-auto mt-10 hidden md:block" />
    </div>
  );
}
