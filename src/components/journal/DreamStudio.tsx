import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Type, Target, Heart, Image, Quote, Trash2, X, Sparkles, ArrowRight, Layers } from "lucide-react";
import { haptic } from "@/hooks/use-mobile";
import { loadDreamBoard, saveDreamBoard, type DreamElement } from "@/lib/journal-store";
import { WildStar, HandDrawnSparkle } from "@/components/BotanicalElements";

// ── Element Types ─────────────────────────────────────────────
const ELEMENT_TYPES = [
  { type: "text" as const, label: "Add Text Note", icon: Type, placeholder: "Write your thought..." },
  { type: "quote" as const, label: "Add Quote", icon: Quote, placeholder: "Enter an inspiring quote..." },
  { type: "goal" as const, label: "Add Goal", icon: Target, placeholder: "What are you working towards?" },
  { type: "affirmation" as const, label: "Add Affirmation", icon: Heart, placeholder: "I am..." },
  { type: "image" as const, label: "Add Dream Image", icon: Image, placeholder: "Describe your dream image..." },
];

// ── Dream Prompts ─────────────────────────────────────────────
const DREAM_PROMPTS = [
  "My dream home in nature",
  "A peaceful morning routine",
  "A creative studio filled with sunlight",
  "The version of me who feels confident and free",
  "My soft life",
  "The life I am becoming",
  "A cozy evening with people I love",
  "My ideal workspace",
];

// ── Dream Rituals ─────────────────────────────────────────────
const DREAM_RITUALS = [
  { id: "dream-morning", title: "Build Your Dream Morning", desc: "Visualise your ideal morning from the moment you open your eyes.", prompts: ["What time do you wake up?", "What does the light look like?", "What do you do first?", "What do you eat?", "How do you feel?"] },
  { id: "next-chapter", title: "Design Your Next Chapter", desc: "What does the next season of your life look like?", prompts: ["What are you letting go of?", "What are you welcoming in?", "Where are you?", "Who is with you?", "What does it feel like?"] },
  { id: "safe-home", title: "Create Your Safe Home Energy", desc: "Design the feeling of home that you carry with you.", prompts: ["What does your space smell like?", "What textures surround you?", "What sounds are in the background?", "What objects bring you comfort?"] },
  { id: "grounded-self", title: "Visualise Your Most Grounded Self", desc: "Meet the version of you who moves through life with ease.", prompts: ["How does she hold her body?", "What does she wear?", "How does she respond to stress?", "What does she protect?", "What does she no longer tolerate?"] },
  { id: "creative-life", title: "Build Your Creative Life", desc: "Imagine a life where creativity flows freely.", prompts: ["What do you create?", "Where do you create?", "What inspires you?", "Who are you creating for?"] },
  { id: "romanticise-future", title: "Romanticise Your Future", desc: "Find the beauty in the life you are building.", prompts: ["What small pleasures fill your days?", "What makes you laugh?", "What traditions do you keep?", "What legacy are you leaving?"] },
];

// ── Future Self Prompts ───────────────────────────────────────
const FUTURE_SELF_PROMPTS = [
  "Who are you becoming?",
  "What does she protect?",
  "What does she no longer tolerate?",
  "What does her life feel like?",
  "What does she choose?",
  "How does she spend her mornings?",
  "What brings her peace?",
];

// ── Element Card ──────────────────────────────────────────────
function ElementCard({ element, onDelete, onUpdate }: { element: DreamElement; onDelete: () => void; onUpdate: (updates: Partial<DreamElement>) => void }) {
  const [editing, setEditing] = useState(false);

  const styles: Record<string, { bg: string; label: string; labelColor: string }> = {
    text: { bg: "bg-card border-border", label: "Note", labelColor: "text-muted-foreground" },
    quote: { bg: "bg-primary/5 border-primary/15", label: "Quote", labelColor: "text-primary" },
    goal: { bg: "bg-phase-follicular/5 border-phase-follicular/15", label: "Goal", labelColor: "text-phase-follicular" },
    affirmation: { bg: "bg-accent/5 border-accent/15", label: "Affirmation", labelColor: "text-accent" },
    image: { bg: "bg-secondary/60 border-border", label: "Dream", labelColor: "text-muted-foreground" },
  };

  const s = styles[element.type] || styles.text;

  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`rounded-2xl border ${s.bg} p-4 break-inside-avoid mb-3 group hover:shadow-md transition-shadow relative overflow-hidden`}>
      {/* Subtle glow */}
      <div className="absolute -top-8 -right-8 w-16 h-16 rounded-full bg-primary/0 group-hover:bg-primary/5 transition-colors duration-500 blur-xl" />

      <div className="flex items-start justify-between gap-2 mb-2 relative">
        <span className={`font-mono text-[10px] uppercase tracking-wider ${s.labelColor}`}>{s.label}</span>
        <button onClick={onDelete} className="text-muted-foreground/20 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {element.linkedEntryId && (
        <p className="font-mono text-[9px] text-primary/50 mb-1 flex items-center gap-1"><Layers className="h-3 w-3" /> Pinned from journal</p>
      )}

      {element.type === "image" && element.imageUrl ? (
        <img src={element.imageUrl} alt={element.content} className="w-full rounded-xl mb-2 object-cover max-h-48" />
      ) : null}

      {editing ? (
        <textarea
          value={element.content}
          onChange={(e) => onUpdate({ content: e.target.value })}
          onBlur={() => setEditing(false)}
          rows={3}
          className="w-full bg-transparent font-display text-sm italic text-foreground resize-none focus:outline-none leading-relaxed"
          style={{ fontSize: "16px" }}
          autoFocus
        />
      ) : (
        <p onClick={() => setEditing(true)} className={`font-display text-sm italic leading-relaxed cursor-text ${element.content ? "text-foreground" : "text-muted-foreground/40"}`}>
          {element.content || "Tap to edit..."}
        </p>
      )}
    </motion.div>
  );
}

// ── Add Element Modal ─────────────────────────────────────────
function AddElementModal({ type, content, onChange, onConfirm, onCancel }: { type: DreamElement["type"]; content: string; onChange: (v: string) => void; onConfirm: () => void; onCancel: () => void }) {
  const config = ELEMENT_TYPES.find((t) => t.type === type)!;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card-warm p-5 my-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-lg italic text-foreground">{config.label}</h3>
        <button onClick={onCancel} className="text-muted-foreground active:text-foreground"><X className="h-4 w-4" /></button>
      </div>
      <textarea value={content} onChange={(e) => onChange(e.target.value)} placeholder={config.placeholder} rows={3} className="w-full font-display text-sm italic text-foreground bg-secondary/30 border border-border rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 leading-relaxed placeholder:text-muted-foreground/40 mb-3" style={{ fontSize: "16px" }} autoFocus />

      {type === "image" && (
        <div className="mb-3">
          <p className="font-mono text-[11px] text-muted-foreground mb-2">Inspiration prompts:</p>
          <div className="flex flex-wrap gap-1.5">
            {DREAM_PROMPTS.map((p) => (
              <button key={p} onClick={() => onChange(p)} className="font-mono text-[10px] px-2.5 py-1 rounded-full bg-secondary text-muted-foreground active:bg-primary/10 active:text-primary transition-colors">{p}</button>
            ))}
          </div>
          <p className="font-mono text-[10px] text-muted-foreground/50 mt-2 italic">Image generation coming soon. Your prompt will be saved.</p>
        </div>
      )}

      <button onClick={onConfirm} className="w-full rounded-[14px] bg-primary py-3 font-display text-sm italic text-primary-foreground active:opacity-90">Add to board</button>
    </motion.div>
  );
}

// ── Dream Ritual Flow ─────────────────────────────────────────
function DreamRitualFlow({ ritual, onComplete, onBack }: { ritual: typeof DREAM_RITUALS[0]; onComplete: (elements: DreamElement[]) => void; onBack: () => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(ritual.prompts.map(() => ""));

  const isLast = step === ritual.prompts.length - 1;

  const complete = () => {
    const elements: DreamElement[] = answers.filter(Boolean).map((a, i) => ({
      id: `${Date.now()}-${i}`,
      type: "text" as const,
      content: `${ritual.prompts[i]}\n${a}`,
      x: 0, y: 0, width: 200, height: 100,
      zIndex: i,
    }));
    onComplete(elements);
  };

  return (
    <div className="pb-10">
      <button onClick={onBack} className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground mb-4 active:opacity-70">
        <X className="h-3.5 w-3.5" /> Exit ritual
      </button>

      <div className="text-center mb-6">
        <p className="font-mono text-[11px] text-primary uppercase tracking-wider mb-2">Dream Ritual</p>
        <h2 className="font-display text-2xl italic text-foreground mb-1">{ritual.title}</h2>
        <p className="font-body text-sm text-muted-foreground">{ritual.desc}</p>
        <div className="flex gap-1 justify-center mt-3">
          {ritual.prompts.map((_, i) => (
            <div key={i} className={`w-8 h-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-border"}`} />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="card-warm p-6">
          <p className="font-display text-xl italic text-foreground mb-4">{ritual.prompts[step]}</p>
          <textarea
            value={answers[step]}
            onChange={(e) => { const next = [...answers]; next[step] = e.target.value; setAnswers(next); }}
            rows={5}
            placeholder="Close your eyes and imagine..."
            className="w-full font-display text-[15px] italic text-foreground bg-transparent resize-none focus:outline-none leading-[1.9] placeholder:text-muted-foreground/30"
            style={{ fontSize: "16px" }}
            autoFocus
          />
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-3 mt-4">
        {step > 0 && <button onClick={() => setStep(step - 1)} className="flex-1 rounded-[14px] border border-border py-3.5 font-display text-sm italic text-muted-foreground">Back</button>}
        {isLast ? (
          <button onClick={complete} className="flex-1 rounded-[14px] bg-primary py-3.5 font-display text-sm italic text-primary-foreground active:opacity-90 flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4" /> Add to board
          </button>
        ) : (
          <button onClick={() => setStep(step + 1)} className="flex-1 rounded-[14px] bg-primary py-3.5 font-display text-sm italic text-primary-foreground active:opacity-90 flex items-center justify-center gap-2">
            Next <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Future Self Mode ──────────────────────────────────────────
function FutureSelfMode({ onComplete, onBack }: { onComplete: (elements: DreamElement[]) => void; onBack: () => void }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentPrompt, setCurrentPrompt] = useState(0);

  const complete = () => {
    const elements: DreamElement[] = Object.entries(answers).filter(([, v]) => v.trim()).map(([k, v], i) => ({
      id: `future-${Date.now()}-${i}`,
      type: "affirmation" as const,
      content: `${FUTURE_SELF_PROMPTS[parseInt(k)]}\n${v}`,
      x: 0, y: 0, width: 200, height: 100, zIndex: i,
    }));
    onComplete(elements);
  };

  return (
    <div className="pb-10">
      <button onClick={onBack} className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground mb-4 active:opacity-70"><X className="h-3.5 w-3.5" /> Exit</button>

      <div className="text-center mb-6">
        <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity }}>
          <WildStar size={36} className="mx-auto mb-3" />
        </motion.div>
        <p className="font-mono text-[11px] text-primary uppercase tracking-wider mb-2">Future Self Mode</p>
        <h2 className="font-display text-2xl italic text-foreground mb-1">Who are you becoming?</h2>
        <p className="font-body text-sm text-muted-foreground">Build your vision from identity, not just aesthetics.</p>
      </div>

      <div className="space-y-4">
        {FUTURE_SELF_PROMPTS.map((p, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card-warm p-5">
            <p className="font-display text-[15px] italic text-foreground mb-2">{p}</p>
            <textarea
              value={answers[i] || ""}
              onChange={(e) => setAnswers((a) => ({ ...a, [i]: e.target.value }))}
              rows={2}
              placeholder="..."
              className="w-full font-display text-sm italic text-foreground bg-secondary/30 border border-border rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/30"
              style={{ fontSize: "16px" }}
            />
          </motion.div>
        ))}
      </div>

      <button onClick={complete} className="w-full rounded-[14px] bg-primary py-3.5 font-display text-base italic text-primary-foreground active:opacity-90 mt-4 flex items-center justify-center gap-2">
        <Sparkles className="h-4 w-4" /> Add to board
      </button>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function DreamStudio({ pinnedEntry }: { pinnedEntry?: { id: string; content: string } | null }) {
  const [elements, setElements] = useState<DreamElement[]>(() => loadDreamBoard());
  const [showMenu, setShowMenu] = useState(false);
  const [addingType, setAddingType] = useState<DreamElement["type"] | null>(null);
  const [newContent, setNewContent] = useState("");
  const [activeRitual, setActiveRitual] = useState<typeof DREAM_RITUALS[0] | null>(null);
  const [showFutureSelf, setShowFutureSelf] = useState(false);
  const [view, setView] = useState<"board" | "rituals">("board");

  const persist = useCallback((els: DreamElement[]) => { setElements(els); saveDreamBoard(els); }, []);

  const addElement = (type: DreamElement["type"]) => { setAddingType(type); setNewContent(""); setShowMenu(false); };

  const confirmAdd = () => {
    if (!addingType || !newContent.trim()) return;
    haptic("medium");
    const el: DreamElement = { id: Date.now().toString(), type: addingType, content: newContent.trim(), x: 0, y: 0, width: 200, height: 100, zIndex: elements.length };
    persist([...elements, el]);
    setAddingType(null);
    setNewContent("");
  };

  const deleteElement = (id: string) => { haptic("light"); persist(elements.filter((e) => e.id !== id)); };
  const updateElement = (id: string, updates: Partial<DreamElement>) => { persist(elements.map((e) => (e.id === id ? { ...e, ...updates } : e))); };

  const handleRitualComplete = (newEls: DreamElement[]) => {
    persist([...elements, ...newEls]);
    setActiveRitual(null);
    setView("board");
  };

  const handleFutureSelfComplete = (newEls: DreamElement[]) => {
    persist([...elements, ...newEls]);
    setShowFutureSelf(false);
    setView("board");
  };

  // Ritual flow
  if (activeRitual) return <DreamRitualFlow ritual={activeRitual} onComplete={handleRitualComplete} onBack={() => setActiveRitual(null)} />;
  if (showFutureSelf) return <FutureSelfMode onComplete={handleFutureSelfComplete} onBack={() => setShowFutureSelf(false)} />;

  // Empty state
  if (elements.length === 0 && !addingType && view === "board") {
    return (
      <div className="pb-10">
        <div className="text-center pt-12 pb-8 relative">
          {/* Floating particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <motion.div key={i} className="absolute w-1.5 h-1.5 rounded-full bg-primary/10" style={{ left: `${20 + i * 15}%`, top: `${30 + (i % 3) * 20}%` }}
                animate={{ y: [0, -12, 0], opacity: [0.1, 0.4, 0.1] }}
                transition={{ duration: 5 + i, repeat: Infinity, delay: i * 0.8 }}
              />
            ))}
          </div>
          <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity }}>
            <WildStar size={56} className="mx-auto mb-5" />
          </motion.div>
          <h2 className="font-display text-2xl italic text-foreground mb-2">Dream Studio</h2>
          <p className="font-hand text-sm font-bold text-primary mb-3">Imagine the life you are quietly building.</p>
          <p className="font-body text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto mb-6">
            This is a space to explore your dreams without judgement. Add images, goals, and ideas that represent the future you are creating.
          </p>
          <button onClick={() => setShowMenu(true)} className="touch-btn rounded-[14px] bg-primary px-8 py-3.5 font-display text-base italic text-primary-foreground active:scale-[0.97]">
            Start your board
          </button>
        </div>

        {/* Dream rituals preview */}
        <div className="mt-6">
          <p className="font-hand text-sm font-bold text-primary mb-3">Or try a guided ritual</p>
          <div className="space-y-2">
            {DREAM_RITUALS.slice(0, 3).map((r) => (
              <button key={r.id} onClick={() => setActiveRitual(r)} className="w-full card-warm p-4 text-left active:opacity-90 hover:shadow-sm transition-shadow">
                <p className="font-display text-[15px] italic text-foreground mb-0.5">{r.title}</p>
                <p className="font-mono text-[11px] text-muted-foreground">{r.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {showMenu && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 card-warm p-4 space-y-2">
            {ELEMENT_TYPES.map((t) => (
              <button key={t.type} onClick={() => addElement(t.type)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/60 active:bg-secondary transition-colors text-left">
                <t.icon className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="font-display text-sm italic text-foreground">{t.label}</span>
              </button>
            ))}
          </motion.div>
        )}

        {addingType && <AddElementModal type={addingType} content={newContent} onChange={setNewContent} onConfirm={confirmAdd} onCancel={() => setAddingType(null)} />}
      </div>
    );
  }

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-hand text-sm font-bold text-primary mb-0.5">Dream Studio</p>
          <p className="font-mono text-[11px] text-muted-foreground">{elements.length} elements on your board</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setView(view === "rituals" ? "board" : "rituals")} className={`touch-btn px-3 py-2 rounded-xl font-mono text-[11px] transition-all ${view === "rituals" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
            Rituals
          </button>
          <button onClick={() => setShowMenu(!showMenu)} className="touch-btn w-10 h-10 rounded-full bg-primary flex items-center justify-center active:opacity-90">
            {showMenu ? <X className="h-5 w-5 text-primary-foreground" /> : <Plus className="h-5 w-5 text-primary-foreground" />}
          </button>
        </div>
      </div>

      {/* Add menu */}
      <AnimatePresence>
        {showMenu && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="card-warm p-3 mb-4 space-y-1">
            {ELEMENT_TYPES.map((t) => (
              <button key={t.type} onClick={() => addElement(t.type)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/60 active:bg-secondary transition-colors text-left">
                <t.icon className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="font-display text-sm italic text-foreground">{t.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {addingType && <AddElementModal type={addingType} content={newContent} onChange={setNewContent} onConfirm={confirmAdd} onCancel={() => setAddingType(null)} />}

      {/* Rituals view */}
      {view === "rituals" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 mb-6">
          {/* Future Self Mode */}
          <motion.button whileTap={{ scale: 0.98 }} onClick={() => setShowFutureSelf(true)} className="w-full rounded-2xl bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/15 p-5 text-left active:opacity-90">
            <div className="flex items-center gap-2 mb-2">
              <HandDrawnSparkle size={18} color="hsl(var(--primary))" />
              <p className="font-mono text-[11px] text-primary uppercase tracking-wider">Featured</p>
            </div>
            <h3 className="font-display text-lg italic text-foreground mb-1">Future Self Mode</h3>
            <p className="font-body text-sm text-muted-foreground">Build your vision from identity, not just aesthetics. A guided journey into who you are becoming.</p>
          </motion.button>

          {/* Ritual cards */}
          {DREAM_RITUALS.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card-warm p-5">
              <h3 className="font-display text-[17px] italic text-foreground mb-1">{r.title}</h3>
              <p className="font-body text-[13px] text-muted-foreground leading-relaxed mb-2">{r.desc}</p>
              <p className="font-mono text-[11px] text-muted-foreground/60 mb-3">{r.prompts.length} steps</p>
              <button onClick={() => setActiveRitual(r)} className="touch-btn w-full rounded-[14px] bg-primary py-3 font-display text-sm italic text-primary-foreground active:scale-[0.97]">
                Begin ritual
              </button>
            </motion.div>
          ))}

          {/* Living board placeholder */}
          <div className="rounded-2xl border border-dashed border-primary/20 p-5 text-center">
            <Layers className="h-5 w-5 text-primary/40 mx-auto mb-2" />
            <p className="font-display text-sm italic text-foreground/60 mb-1">Living Board</p>
            <p className="font-mono text-[11px] text-muted-foreground/50">Coming soon: pin journal entries, attach proof moments, and turn dreams into lived memories.</p>
          </div>
        </motion.div>
      )}

      {/* Board view */}
      {view === "board" && (
        <>
          {/* Prompt suggestions */}
          {elements.length < 4 && (
            <div className="mb-4">
              <p className="font-mono text-[11px] text-muted-foreground mb-2">What future are you dreaming into?</p>
              <div className="flex flex-wrap gap-2">
                {DREAM_PROMPTS.slice(0, 4).map((p) => (
                  <button key={p} onClick={() => { setAddingType("text"); setNewContent(p); }} className="font-mono text-[10px] px-3 py-1.5 rounded-full bg-secondary text-muted-foreground active:bg-primary/10 active:text-primary transition-colors">{p}</button>
                ))}
              </div>
            </div>
          )}

          {/* Masonry board */}
          <div className="columns-2 md:columns-3 xl:columns-4 gap-3">
            {elements.map((el) => (
              <ElementCard key={el.id} element={el} onDelete={() => deleteElement(el.id)} onUpdate={(updates) => updateElement(el.id, updates)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
