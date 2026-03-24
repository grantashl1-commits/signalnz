import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2, Search, Plus, X, Sparkles, PenLine } from "lucide-react";
import { HandDrawnBook, HandDrawnSparkle, HandDrawnLeaf, WildStar } from "@/components/BotanicalElements";
import { haptic } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { saveEntryToVault } from "@/components/journal/MemoryVault";
import {
  loadEntries,
  saveEntries,
  loadMilestones,
  saveMilestones,
  getNextMilestone,
  MILESTONES,
  PROMPTS,
  TRACKING,
  ENTRY_TYPES,
  EMOTIONAL_TONES,
  type JournalEntry,
  type MilestoneAnalysis,
} from "@/lib/journal-store";

// ── Ink Particles ─────────────────────────────────────────────
function InkParticles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary/10"
          style={{ left: `${15 + i * 15}%`, top: `${20 + (i % 3) * 25}%` }}
          animate={{ y: [0, -8, 0], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 4 + i * 0.5, repeat: Infinity, delay: i * 0.7 }}
        />
      ))}
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────
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

function Pill({ label, variant = "sage" }: { label: string; variant?: "sage" | "primary" | "blue" }) {
  const cls = variant === "primary"
    ? "bg-primary/10 text-primary"
    : variant === "blue"
    ? "bg-accent/10 text-accent"
    : "bg-phase-follicular/10 text-phase-follicular";
  return <span className={`font-mono text-[11px] px-2.5 py-0.5 rounded-full ${cls}`}>{label}</span>;
}

function HandDrawnHeadphones({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" style={{ opacity: 0.7 }}>
      <path d="M 4 12 Q 4 6 10 5 Q 16 6 16 12" fill="none" stroke="hsl(var(--primary))" strokeWidth={0.9} strokeLinecap="round" />
      <path d="M 4 11 L 4 15 Q 4 16 5 16 L 6 16 Q 7 16 7 15 L 7 12 Q 7 11 6 11 L 5 11 Q 4 11 4 12" fill="none" stroke="hsl(var(--primary))" strokeWidth={0.7} />
      <path d="M 16 11 L 16 15 Q 16 16 15 16 L 14 16 Q 13 16 13 15 L 13 12 Q 13 11 14 11 L 15 11 Q 16 11 16 12" fill="none" stroke="hsl(var(--primary))" strokeWidth={0.7} />
    </svg>
  );
}

const TRACKING_ICONS: Record<string, React.FC<{ size?: number }>> = { mood: MoodIcon, energy: EnergyIcon };

// ── Helpers ───────────────────────────────────────────────────
function groupEntries(entries: JournalEntry[]) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 86400000;
  const weekStart = todayStart - 7 * 86400000;
  const monthStart = todayStart - 30 * 86400000;

  const groups: { label: string; subtitle: string; entries: JournalEntry[] }[] = [
    { label: "Today", subtitle: "Capture this before it fades.", entries: [] },
    { label: "Yesterday", subtitle: "Still fresh, still yours.", entries: [] },
    { label: "This Week", subtitle: "The small things you almost forgot.", entries: [] },
    { label: "This Month", subtitle: "A chapter taking shape.", entries: [] },
    { label: "Earlier Chapters", subtitle: "Proof that you have always been becoming.", entries: [] },
  ];

  for (const e of entries) {
    if (e.timestamp >= todayStart) groups[0].entries.push(e);
    else if (e.timestamp >= yesterdayStart) groups[1].entries.push(e);
    else if (e.timestamp >= weekStart) groups[2].entries.push(e);
    else if (e.timestamp >= monthStart) groups[3].entries.push(e);
    else groups[4].entries.push(e);
  }
  return groups.filter((g) => g.entries.length > 0);
}

function getEntryTypeLabel(type?: string) {
  if (!type) return "Free Write";
  return ENTRY_TYPES.find((t) => t.key === type)?.label || "Free Write";
}

function getPreview(entry: JournalEntry): string {
  const values = Object.values(entry.prompts || {}).filter(Boolean);
  if (values.length === 0) return "";
  const text = values[0];
  return text.length > 100 ? text.slice(0, 100) + "..." : text;
}

const SINGLE_PROMPT_TYPES = ["free-write", "tiny-win", "funny-moment", "gratitude-note", "letter-future-self", "dream-entry", "goal-reflection", "release", "lesson-learned"];

const SINGLE_PROMPT_CONFIG: Record<string, { label: string; ph: string }> = {
  "free-write": { label: "Write freely...", ph: "This space is yours. No rules, no structure. Just let it flow." },
  "tiny-win": { label: "My tiny win today...", ph: "Even the smallest victories deserve celebration. What went right?" },
  "funny-moment": { label: "Something that made me laugh...", ph: "Capture the joy. What was the moment?" },
  "gratitude-note": { label: "I am grateful for...", ph: "What people, moments, or small things brought thankfulness today?" },
  "letter-future-self": { label: "Dear future me...", ph: "Write a letter to the version of you who is living the life you are building." },
  "dream-entry": { label: "My dream...", ph: "What are you dreaming about? A goal, a vision, or something you saw in sleep?" },
  "goal-reflection": { label: "Reflecting on my goals...", ph: "How are you progressing? What needs to shift?" },
  "release": { label: "I am ready to let go of...", ph: "What no longer serves you? What are you releasing today?" },
  "lesson-learned": { label: "Today I learned...", ph: "What insight, realisation, or lesson showed up for you recently?" },
};

// ── Decorative Line Art ───────────────────────────────────────
function JournalLineart({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 20" className={`text-primary/10 ${className}`} fill="none" stroke="currentColor" strokeWidth={0.5}>
      <path d="M 0 10 Q 25 2 50 10 Q 75 18 100 10 Q 125 2 150 10 Q 175 18 200 10" />
      <circle cx={100} cy={10} r={2} fill="currentColor" opacity={0.3} />
    </svg>
  );
}

// ── Entry Type Picker ─────────────────────────────────────────
function EntryTypePicker({ onSelect, onCancel }: { onSelect: (type: string) => void; onCancel: () => void }) {
  return (
    <div className="pb-10 relative max-w-4xl mx-auto">
      <InkParticles />
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-hand text-sm font-bold text-primary">New Entry</p>
          <h2 className="font-display text-2xl italic text-foreground">What would you like to write?</h2>
          <p className="font-body text-sm text-muted-foreground mt-1">A small moment can become a chapter.</p>
        </div>
        <button onClick={onCancel} className="text-muted-foreground active:text-foreground min-w-[44px] min-h-[44px] flex items-center justify-center">
          <X className="h-5 w-5" />
        </button>
      </div>
      <JournalLineart className="w-full h-5 mb-4" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {ENTRY_TYPES.map((t, i) => {
          const tone = EMOTIONAL_TONES[t.tone];
          return (
            <motion.button
              key={t.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.25 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { haptic("light"); onSelect(t.key); }}
              className="card-warm p-4 text-left group hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-primary/8 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                  <PenLine className="h-3 w-3 text-primary" />
                </div>
                {tone && <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded-full ${tone.color}`}>{tone.label}</span>}
              </div>
              <h3 className="font-display text-[15px] italic text-foreground mb-1">{t.label}</h3>
              <p className="font-mono text-[11px] text-muted-foreground leading-snug">{t.desc}</p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ── New Entry Form ────────────────────────────────────────────
function NewEntryForm({ entryType, onSaved, onCancel }: { entryType: string; onSaved: (entries: JournalEntry[]) => void; onCancel: () => void }) {
  const [prompts, setPrompts] = useState<Record<string, string>>({});
  const [tracking, setTracking] = useState({ mood: 5, energy: 5 });
  const [saving, setSaving] = useState(false);

  const today = new Date().toLocaleDateString("en-NZ", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const typeConfig = ENTRY_TYPES.find((t) => t.key === entryType);
  const isSingle = SINGLE_PROMPT_TYPES.includes(entryType);

  const save = () => {
    setSaving(true);
    haptic("medium");
    const title = isSingle ? (prompts["main"] || "").slice(0, 60) || typeConfig?.label || "Untitled" : today;
    const tone = typeConfig?.tone;

    // Auto-vault certain entry types
    const AUTO_VAULT_TYPES: Record<string, string> = {
      "letter-future-self": "love-notes",
      "tiny-win": "tiny-wins",
      "funny-moment": "funny-moments",
      "gratitude-note": "remember",
      "lesson-learned": "lessons",
      "dream-entry": "remember",
      "release": "hard-days",
    };
    const autoVaultCategory = AUTO_VAULT_TYPES[entryType];

    const entry: JournalEntry = {
      id: Date.now().toString(),
      date: today,
      timestamp: Date.now(),
      prompts,
      tracking,
      tags: [],
      ai: null,
      entryType,
      title,
      emotionalTone: tone,
      savedToVault: !!autoVaultCategory,
      vaultCategory: autoVaultCategory,
    };
    const existing = loadEntries();
    const updated = [entry, ...existing];
    saveEntries(updated);

    // Auto-save to vault
    if (autoVaultCategory) {
      saveEntryToVault(entry, autoVaultCategory);
    }

    setSaving(false);
    onSaved(updated);
  };

  return (
    <div className="space-y-3 pb-10 relative max-w-2xl mx-auto">
      <InkParticles />
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="font-hand text-sm font-bold text-primary">{typeConfig?.label || "New Entry"}</p>
          <p className="font-mono text-xs text-muted-foreground">{today}</p>
        </div>
        <button onClick={onCancel} className="text-muted-foreground active:text-foreground">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Tracking */}
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
              <input type="range" min={0} max={f.max} value={tracking[f.key as keyof typeof tracking]} onChange={(e) => setTracking((t) => ({ ...t, [f.key]: +e.target.value }))} className="w-full accent-primary cursor-pointer" />
            </div>
          );
        })}
      </div>

      {/* Writing area */}
      {isSingle ? (
        <div className="card-warm p-6 min-h-[300px]">
          <label className="block font-display text-xl italic text-foreground mb-3">{SINGLE_PROMPT_CONFIG[entryType]?.label || "Write..."}</label>
          <JournalLineart className="w-32 h-4 mb-4 opacity-50" />
          <textarea
            rows={10}
            value={prompts["main"] || ""}
            onChange={(e) => setPrompts((p) => ({ ...p, main: e.target.value }))}
            placeholder={SINGLE_PROMPT_CONFIG[entryType]?.ph || "Start writing..."}
            className="w-full font-display text-[15px] italic text-foreground bg-transparent resize-none focus:outline-none leading-[1.9] placeholder:text-muted-foreground/30"
            style={{ fontSize: "16px" }}
            autoFocus
          />
        </div>
      ) : (
        PROMPTS.map((p) => (
          <div key={p.key} className="card-warm p-5">
            <label className="block font-display text-lg italic text-foreground mb-2.5">{p.label}</label>
            <textarea rows={p.rows} value={prompts[p.key] || ""} onChange={(e) => setPrompts((prev) => ({ ...prev, [p.key]: e.target.value }))} placeholder={p.ph} className="w-full font-display text-sm italic text-foreground bg-secondary/30 border border-border rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 leading-relaxed placeholder:text-muted-foreground/40" style={{ fontSize: "16px" }} />
          </div>
        ))
      )}

      <button onClick={save} disabled={saving} className="touch-btn w-full rounded-[14px] bg-primary py-4 font-display text-[17px] italic text-primary-foreground active:opacity-90 disabled:opacity-50 transition-opacity">
        {saving ? "Saving..." : "Save entry"}
      </button>
    </div>
  );
}

// ── Analysis View ─────────────────────────────────────────────
function AnalysisView({ entry, onBack, isMilestone }: { entry: JournalEntry; onBack: () => void; isMilestone?: boolean }) {
  const ai = entry?.ai;

  if (!ai || !ai.summary || ai.summary.startsWith("Unable")) {
    return (
      <div className="text-center pt-16">
        <HandDrawnLeaf size={40} color="hsl(var(--primary))" className="mx-auto mb-4" />
        <p className="font-display text-xl italic text-foreground mb-2">{isMilestone ? "Reflecting on your journey..." : "Reading your entry with care..."}</p>
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
    <div className="pb-10 max-w-3xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground mb-4 active:opacity-70"><ArrowLeft className="h-3.5 w-3.5" /> Back to entries</button>
      <h2 className="font-display text-2xl font-bold italic text-foreground mb-0.5">{isMilestone ? ai.milestone_title || "Growth Reflection" : "Soul Analysis"}</h2>
      <p className="font-mono text-xs text-muted-foreground mb-5">{entry.date}</p>

      {ai.summary && (
        <div className="rounded-2xl bg-primary/5 border border-primary/15 p-4 mb-3">
          <p className="font-mono text-[11px] text-primary uppercase tracking-wider mb-2">{isMilestone ? "Your journey so far" : "Today's signal"}</p>
          <p className="font-display text-sm italic text-foreground/80 leading-relaxed">{ai.summary}</p>
        </div>
      )}

      {ai.growth_arc && <Section title="Your Growth Arc" accent="hsl(var(--phase-follicular))"><p className="font-display text-sm italic text-foreground/70 leading-relaxed">{ai.growth_arc}</p></Section>}

      {(ai.themes?.length > 0 || ai.emotions?.length > 0) && (
        <Section title="Themes & Emotions"><div className="flex flex-wrap gap-1.5">{ai.themes?.map((t: string) => <Pill key={t} label={t} variant="primary" />)}{ai.emotions?.map((e: string) => <Pill key={e} label={e} />)}</div></Section>
      )}

      {ai.ifs_insight && <Section title="Parts Work Insight (IFS)" accent="hsl(var(--secondary))"><p className="font-display text-sm italic text-foreground/70 leading-relaxed">{ai.ifs_insight}</p></Section>}

      {ai.patterns?.length > 0 && <Section title="Patterns I Notice">{ai.patterns.map((p: string, i: number) => <div key={i} className="flex gap-2.5 mb-2.5"><span className="text-sm text-primary flex-shrink-0 mt-0.5">·</span><p className="font-display text-sm italic text-foreground/70 leading-relaxed">{p}</p></div>)}</Section>}

      {ai.strengths?.length > 0 && <Section title="Strengths I See in You"><div className="flex flex-wrap gap-1.5">{ai.strengths.map((s: string) => <Pill key={s} label={s} variant="blue" />)}</div></Section>}

      {ai.recommendations?.length > 0 && (
        <Section title="Recommendations For You">
          {ai.recommendations.map((r: any, i: number) => (
            <div key={i} className="flex gap-3 bg-secondary/30 rounded-xl p-3.5 mb-2">
              <div className="mt-0.5">{r.type === "book" ? <HandDrawnBook size={20} color="hsl(var(--primary))" /> : r.type === "podcast" ? <HandDrawnHeadphones size={20} /> : <HandDrawnLeaf size={20} color="hsl(var(--phase-follicular))" />}</div>
              <div><p className="font-display text-sm italic text-foreground mb-0.5">{r.title}</p><p className="font-mono text-xs text-muted-foreground leading-snug mb-1.5">{r.reason}</p><Pill label={r.type} variant="primary" /></div>
            </div>
          ))}
        </Section>
      )}

      {ai.next_steps?.length > 0 && <Section title="Your Next Steps">{ai.next_steps.map((s: string, i: number) => <div key={i} className="flex gap-2.5 mb-2.5"><span className="font-mono text-xs text-primary font-bold flex-shrink-0 mt-0.5">{i + 1}.</span><p className="font-display text-sm italic text-foreground/70 leading-relaxed">{s}</p></div>)}</Section>}

      {ai.affirmation && (
        <div className="rounded-2xl bg-gradient-to-br from-primary/5 to-secondary p-6 text-center mb-3 border border-primary/10">
          <WildStar size={28} className="mx-auto mb-3" />
          <p className="font-display text-lg italic text-foreground leading-relaxed">"{ai.affirmation}"</p>
        </div>
      )}
    </div>
  );
}

// ── Entry Card ────────────────────────────────────────────────
function EntryCard({
  entry,
  onAnalyse,
  onViewAnalysis,
  onSaveToVault,
  onPinToDreamStudio,
}: {
  entry: JournalEntry;
  onAnalyse: (e: JournalEntry) => void;
  onViewAnalysis: (e: JournalEntry) => void;
  onSaveToVault?: (e: JournalEntry) => void;
  onPinToDreamStudio?: (e: JournalEntry) => void;
}) {
  const tone = entry.emotionalTone ? EMOTIONAL_TONES[entry.emotionalTone] : null;
  const preview = getPreview(entry);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-warm p-5 group hover:shadow-md transition-shadow relative overflow-hidden"
    >
      {/* Subtle glow effect on hover */}
      <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-primary/0 group-hover:bg-primary/5 transition-colors duration-500 blur-2xl" />

      <div className="flex justify-between items-start mb-2 relative">
        <div className="flex-1 min-w-0">
          <p className="font-display text-base italic text-foreground mb-1 truncate">{entry.title || entry.date}</p>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">{getEntryTypeLabel(entry.entryType)}</span>
            {tone && <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full ${tone.color}`}>{tone.label}</span>}
            <span className="font-mono text-[10px] text-muted-foreground/60">{new Date(entry.timestamp).toLocaleDateString("en-NZ", { day: "numeric", month: "short" })}</span>
          </div>
          {entry.tracking && (
            <div className="flex gap-2.5 font-mono text-xs text-muted-foreground items-center">
              <span className="flex items-center gap-1"><MoodIcon size={12} /> {entry.tracking.mood}/10</span>
              <span className="flex items-center gap-1"><EnergyIcon size={12} /> {entry.tracking.energy}/10</span>
            </div>
          )}
        </div>
        <div className="flex gap-1 flex-shrink-0 ml-2">
          {entry.ai ? (
            <button onClick={() => onViewAnalysis(entry)} className="font-mono text-[10px] text-muted-foreground bg-secondary rounded-full px-2.5 py-1 active:opacity-70">View analysis</button>
          ) : (
            <button onClick={() => onAnalyse(entry)} className="font-mono text-[10px] text-primary border border-primary/30 rounded-full px-2.5 py-1 active:opacity-70 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Analyse
            </button>
          )}
        </div>
      </div>

      {preview && <p className="font-display text-[13px] italic text-muted-foreground line-clamp-2 leading-relaxed mb-2">"{preview}"</p>}

      {entry.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">{entry.tags.map((t) => <Pill key={t} label={t} />)}</div>
      )}

      {/* Bottom actions */}
      <div className="flex gap-2 mt-2 pt-2 border-t border-border/50">
        {onSaveToVault && !entry.savedToVault && (
          <button onClick={() => onSaveToVault(entry)} className="font-mono text-[10px] text-muted-foreground hover:text-primary transition-colors active:opacity-70">
            Save to vault
          </button>
        )}
        {entry.savedToVault && <span className="font-mono text-[10px] text-primary/60">In vault</span>}
        {onPinToDreamStudio && (
          <button onClick={() => onPinToDreamStudio(entry)} className="font-mono text-[10px] text-muted-foreground hover:text-primary transition-colors active:opacity-70">
            Pin to Dream Studio
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function JournalEntries({
  onSaveToVault,
  onPinToDreamStudio,
  journalSync,
}: {
  onSaveToVault?: (entry: JournalEntry) => void;
  onPinToDreamStudio?: (entry: JournalEntry) => void;
  journalSync?: {
    entries: JournalEntry[];
    milestones: MilestoneAnalysis[];
    saveEntry: (entry: JournalEntry) => Promise<void>;
    updateEntry: (entry: JournalEntry) => Promise<void>;
    updateEntries: (entries: JournalEntry[]) => Promise<void>;
    saveMilestone: (milestone: MilestoneAnalysis) => Promise<void>;
    setEntries: React.Dispatch<React.SetStateAction<JournalEntry[]>>;
  };
}) {
  const [localEntries, setLocalEntries] = useState<JournalEntry[]>(() => loadEntries());
  const [localMilestones, setLocalMilestones] = useState<MilestoneAnalysis[]>(() => loadMilestones());

  const entries = journalSync?.entries ?? localEntries;
  const milestones = journalSync?.milestones ?? localMilestones;
  const setEntries = journalSync?.setEntries ?? setLocalEntries;

  const [view, setView] = useState<"list" | "pick-type" | "new" | "analysis" | "milestone">("list");
  const [entryType, setEntryType] = useState("free-write");
  const [activeEntry, setActiveEntry] = useState<JournalEntry | null>(null);
  const [milestoneLoading, setMilestoneLoading] = useState(false);
  const [activeMilestone, setActiveMilestone] = useState<MilestoneAnalysis | null>(null);
  const [search, setSearch] = useState("");

  const nextMilestone = useMemo(() => getNextMilestone(entries.length, milestones), [entries.length, milestones]);

  const filtered = useMemo(() => {
    if (!search.trim()) return entries;
    const q = search.toLowerCase();
    return entries.filter((e) => {
      if (e.date.toLowerCase().includes(q)) return true;
      if (e.title?.toLowerCase().includes(q)) return true;
      if (e.tags?.some((t) => t.toLowerCase().includes(q))) return true;
      return Object.values(e.prompts || {}).some((v) => v.toLowerCase().includes(q));
    });
  }, [entries, search]);

  const groups = useMemo(() => groupEntries(filtered), [filtered]);

  const handleAnalyse = async (entry: JournalEntry) => {
    setActiveEntry({ ...entry, ai: null });
    setView("analysis");
    haptic("medium");
    try {
      const { data, error } = await supabase.functions.invoke("journal-ai", {
        body: { entry, recentEntries: entries.filter((e) => e.id !== entry.id).slice(0, 5) },
      });
      if (error) throw error;
      const updated = entries.map((e) => e.id === entry.id ? { ...e, ai: data, tags: data.tags || [] } : e);
      setEntries(updated);
      saveEntries(updated);
      const updatedEntry = { ...entry, ai: data, tags: data.tags || [] };
      setActiveEntry(updatedEntry);
      if (journalSync) {
        journalSync.updateEntry(updatedEntry);
      }

      // Fire journal-insights in background to build user profile
      const userId = localStorage.getItem("signal_user_id") || crypto.randomUUID();
      if (!localStorage.getItem("signal_user_id")) localStorage.setItem("signal_user_id", userId);
      supabase.functions.invoke("journal-insights", {
        body: { entry, analysis: data, userIdentifier: userId },
      }).catch(() => {});
    } catch {
      setActiveEntry({ ...entry, ai: { summary: "Unable to analyse right now. Please try again.", themes: [], recommendations: [], next_steps: [], tags: [] } });
    }
  };

  const handleMilestoneAnalyse = async () => {
    if (!nextMilestone) return;
    setMilestoneLoading(true);
    haptic("medium");
    try {
      const { data, error } = await supabase.functions.invoke("journal-ai", { body: { milestoneType: nextMilestone.type, milestoneCount: nextMilestone.count, milestoneLabel: nextMilestone.label, allEntries: entries.slice(0, nextMilestone.count) } });
      if (error) throw error;
      const nm: MilestoneAnalysis = { milestoneType: nextMilestone.type, count: nextMilestone.count, date: new Date().toLocaleDateString("en-NZ", { weekday: "long", day: "numeric", month: "long", year: "numeric" }), analysis: data };
      if (journalSync) {
        await journalSync.saveMilestone(nm);
      } else {
        const updatedMilestones = [...milestones, nm];
        setLocalMilestones(updatedMilestones);
        saveMilestones(updatedMilestones);
      }
      setActiveMilestone(nm);
      setView("milestone");
    } catch { /* silently fail */ }
    setMilestoneLoading(false);
  };

  // Sub-views
  if (view === "analysis" && activeEntry) return <AnalysisView entry={activeEntry} onBack={() => setView("list")} />;
  if (view === "milestone" && activeMilestone) {
    const fakeEntry: JournalEntry = { id: `milestone-${activeMilestone.count}`, date: activeMilestone.date, timestamp: Date.now(), prompts: {}, tracking: { mood: 0, energy: 0 }, tags: [], ai: activeMilestone.analysis };
    return <AnalysisView entry={fakeEntry} onBack={() => setView("list")} isMilestone />;
  }
  if (view === "pick-type") return <EntryTypePicker onSelect={(t) => { setEntryType(t); setView("new"); }} onCancel={() => setView("list")} />;
  if (view === "new") return <NewEntryForm entryType={entryType} onSaved={(updated) => {
    setEntries(updated);
    // Cloud sync the new entry (first in list)
    if (journalSync && updated.length > 0) {
      journalSync.saveEntry(updated[0]);
    }
    setView("list");
  }} onCancel={() => setView("list")} />;

  return (
    <div className="space-y-4 pb-10 relative">
      <InkParticles />

      {/* New entry button */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => { haptic("medium"); setView("pick-type"); }}
        className="touch-btn w-full card-warm p-5 flex items-center gap-4 active:opacity-90 group hover:shadow-md transition-shadow"
      >
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:from-primary/20 group-hover:to-primary/10 transition-colors">
          <Plus className="h-5 w-5 text-primary" />
        </div>
        <div className="text-left">
          <p className="font-display text-[16px] italic text-foreground">New entry</p>
          <p className="font-mono text-[11px] text-muted-foreground">Capture this before it fades.</p>
        </div>
      </motion.button>

      {/* Milestone banner */}
      {nextMilestone && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-gradient-to-br from-primary/8 to-phase-follicular/8 border border-primary/15 p-5">
          <div className="flex items-center gap-2 mb-2"><WildStar size={22} /><h3 className="font-display text-lg italic text-foreground">{nextMilestone.label}</h3></div>
          <p className="font-display text-sm italic text-muted-foreground mb-3">You've reached {nextMilestone.count} entries. Ready for a deep reflection?</p>
          <button onClick={handleMilestoneAnalyse} disabled={milestoneLoading} className="rounded-xl bg-primary px-5 py-2.5 font-display text-sm italic text-primary-foreground active:opacity-90 disabled:opacity-50 flex items-center gap-2">
            {milestoneLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Reflecting...</> : <><HandDrawnSparkle size={14} color="hsl(var(--primary-foreground))" /> Begin {nextMilestone.label}</>}
          </button>
        </motion.div>
      )}

      {/* Search */}
      {entries.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search entries..." className="w-full rounded-xl border border-border bg-secondary/30 pl-9 pr-3 py-2.5 font-display text-sm italic text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30" style={{ fontSize: "16px" }} />
        </div>
      )}

      {/* Empty state */}
      {entries.length === 0 && (
        <div className="text-center pt-12 relative">
          <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity }}>
            <HandDrawnBook size={56} color="hsl(var(--primary))" className="mx-auto mb-4" />
          </motion.div>
          <h2 className="font-display text-2xl italic text-foreground mb-2">Your story begins today.</h2>
          <p className="font-display text-sm italic text-muted-foreground mb-1">Small thoughts become chapters.</p>
          <p className="font-body text-xs text-muted-foreground/60 mt-4 max-w-xs mx-auto">
            This is your private inner world. A place for reflection, imagination, and becoming.
          </p>
          <JournalLineart className="w-48 h-5 mx-auto mt-6" />
        </div>
      )}

      {/* Grouped entries */}
      {groups.map((group, gi) => (
        <div key={group.label}>
          <div className="flex items-center gap-3 mb-3">
            <div>
              <p className="font-hand text-sm font-bold text-primary">{group.label}</p>
              <p className="font-mono text-[10px] text-muted-foreground/60">{group.subtitle}</p>
            </div>
            <div className="flex-1 h-px bg-border/40" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {group.entries.map((e) => (
              <EntryCard
                key={e.id}
                entry={e}
                onAnalyse={handleAnalyse}
                onViewAnalysis={(e) => { setActiveEntry(e); setView("analysis"); }}
                onSaveToVault={onSaveToVault}
                onPinToDreamStudio={onPinToDreamStudio}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
