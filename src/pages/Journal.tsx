import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { BotanicalSprig, CymatiSketch } from "@/components/BotanicalElements";
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
  { key: "mood", label: "Mood", emoji: "🌿", max: 10 },
  { key: "energy", label: "Energy", emoji: "⚡", max: 10 },
  { key: "sleep", label: "Sleep (hrs)", emoji: "🌙", max: 12 },
  { key: "water", label: "Water (glasses)", emoji: "💧", max: 12 },
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

function loadEntries(): JournalEntry[] {
  try {
    const raw = localStorage.getItem("mindcast_journal_v2");
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveEntries(entries: JournalEntry[]) {
  localStorage.setItem("mindcast_journal_v2", JSON.stringify(entries));
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

// ── NEW ENTRY FORM ────────────────────────────────────────────
function NewEntryForm({ onSaved }: { onSaved: (entries: JournalEntry[]) => void }) {
  const [prompts, setPrompts] = useState<Record<string, string>>({});
  const [tracking, setTracking] = useState({ mood: 5, energy: 5, sleep: 7, water: 6 });
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
        {TRACKING.map((f) => (
          <div key={f.key} className="mb-3.5">
            <div className="flex justify-between mb-1">
              <span className="font-mono text-[13px] text-foreground/70">{f.emoji} {f.label}</span>
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
        ))}
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
        {saving ? "saving…" : "save entry →"}
      </button>
    </div>
  );
}

// ── ENTRIES LIST ──────────────────────────────────────────────
function EntriesList({
  entries,
  onAnalyse,
  onViewAnalysis,
}: {
  entries: JournalEntry[];
  onAnalyse: (entry: JournalEntry) => void;
  onViewAnalysis: (entry: JournalEntry) => void;
}) {
  if (!entries.length) {
    return (
      <div className="text-center pt-16">
        <div className="text-5xl mb-4">📖</div>
        <p className="font-display text-xl italic text-foreground mb-2">your story begins today.</p>
        <p className="font-display text-sm italic text-muted-foreground">your first entry is waiting to be written.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-10">
      {entries.map((e) => (
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
                <div className="flex gap-2.5 font-mono text-xs text-muted-foreground">
                  <span>🌿 {e.tracking.mood}/10</span>
                  <span>⚡ {e.tracking.energy}/10</span>
                  <span>🌙 {e.tracking.sleep}h</span>
                </div>
              )}
            </div>
            {e.ai ? (
              <button
                onClick={() => onViewAnalysis(e)}
                className="font-mono text-[11px] text-muted-foreground bg-secondary rounded-full px-3.5 py-1.5 active:opacity-70"
              >
                view analysis
              </button>
            ) : (
              <button
                onClick={() => onAnalyse(e)}
                className="font-mono text-[11px] text-primary border border-primary/30 rounded-full px-3.5 py-1.5 active:opacity-70"
              >
                ✨ analyse
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
function AnalysisView({ entry, onBack }: { entry: JournalEntry; onBack: () => void }) {
  const ai = entry?.ai;

  if (!ai || !ai.summary || ai.summary.startsWith("Unable")) {
    return (
      <div className="text-center pt-16">
        <div className="text-4xl mb-4">🌿</div>
        <p className="font-display text-xl italic text-foreground mb-2">reading your entry with care…</p>
        <p className="font-mono text-xs text-muted-foreground">your AI therapist is listening.</p>
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
        <ArrowLeft className="h-3.5 w-3.5" /> back to entries
      </button>
      <h2 className="font-display text-2xl font-bold italic text-foreground mb-0.5">Soul Analysis</h2>
      <p className="font-mono text-xs text-muted-foreground mb-5">{entry.date}</p>

      {/* Summary */}
      {ai.summary && (
        <div className="rounded-2xl bg-primary/5 border border-primary/15 p-4.5 mb-3">
          <p className="font-mono text-[11px] text-primary uppercase tracking-wider mb-2">today's signal</p>
          <p className="font-display text-sm italic text-foreground/80 leading-relaxed">{ai.summary}</p>
        </div>
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
        <Section title="🔮 Parts Work Insight (IFS)" accent="hsl(var(--petal-gold))">
          <p className="font-display text-sm italic text-foreground/70 leading-relaxed">{ai.ifs_insight}</p>
        </Section>
      )}

      {/* Patterns */}
      {ai.patterns?.length > 0 && (
        <Section title="Patterns I Notice">
          {ai.patterns.map((p: string, i: number) => (
            <div key={i} className="flex gap-2.5 mb-2.5">
              <span className="text-sm text-[hsl(var(--petal-gold))] flex-shrink-0 mt-0.5">◈</span>
              <p className="font-display text-sm italic text-foreground/70 leading-relaxed">{p}</p>
            </div>
          ))}
        </Section>
      )}

      {/* Unspoken desires */}
      {ai.unspoken_desires && (
        <div className="rounded-2xl bg-phase-follicular/5 border border-phase-follicular/15 p-4.5 mb-3">
          <h3 className="font-display text-[17px] italic text-foreground mb-2">💚 What I sense you're reaching for…</h3>
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
              <span className="text-xl">{r.type === "book" ? "📚" : r.type === "podcast" ? "🎧" : "🌿"}</span>
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
          <div className="text-3xl mb-3">✨</div>
          <p className="font-display text-lg italic text-foreground leading-relaxed">"{ai.affirmation}"</p>
        </div>
      )}
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────
export default function JournalPage() {
  const info = getCycleInfo(getLastPeriodStart());
  const [view, setView] = useState<"list" | "new" | "analysis">("list");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [activeEntry, setActiveEntry] = useState<JournalEntry | null>(null);
  const [analysing, setAnalysing] = useState(false);

  useEffect(() => {
    setEntries(loadEntries());
  }, []);

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

  return (
    <div className="max-w-3xl mx-auto relative">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.04]">
        <CymatiSketch phase={info.phase} size={300} opacity={1} className="md:hidden" />
        <CymatiSketch phase={info.phase} size={500} opacity={1} className="hidden md:block" />
      </div>

      {/* Header */}
      {view !== "analysis" && (
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="font-hand text-sm font-bold text-primary">journal</p>
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
                + new entry
              </button>
            )}
            {view === "new" && (
              <button
                onClick={() => setView("list")}
                className="font-mono text-xs text-muted-foreground active:opacity-70"
              >
                cancel
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
            />
          )}
          {view === "new" && (
            <NewEntryForm onSaved={(updated) => { setEntries(updated); setView("list"); }} />
          )}
          {view === "analysis" && activeEntry && (
            <AnalysisView entry={activeEntry} onBack={() => setView("list")} />
          )}
        </motion.div>
      </AnimatePresence>

      <BotanicalSprig width={160} className="mx-auto mt-8 md:hidden" />
      <BotanicalSprig width={200} className="mx-auto mt-10 hidden md:block" />
    </div>
  );
}
