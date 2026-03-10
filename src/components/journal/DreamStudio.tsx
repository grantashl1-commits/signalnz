import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, Type, Target, Heart, Image, Quote, Trash2, Move, X } from "lucide-react";
import { haptic } from "@/hooks/use-mobile";
import { loadDreamBoard, saveDreamBoard, type DreamElement } from "@/lib/journal-store";
import { WildStar } from "@/components/BotanicalElements";

const ELEMENT_TYPES = [
  { type: "text" as const, label: "Add Text Note", icon: Type, placeholder: "Write your thought..." },
  { type: "quote" as const, label: "Add Quote", icon: Quote, placeholder: "Enter an inspiring quote..." },
  { type: "goal" as const, label: "Add Goal", icon: Target, placeholder: "What are you working towards?" },
  { type: "affirmation" as const, label: "Add Affirmation", icon: Heart, placeholder: "I am..." },
  { type: "image" as const, label: "Add Dream Image", icon: Image, placeholder: "Describe your dream image..." },
];

const DREAM_PROMPTS = [
  "My dream home in nature",
  "A peaceful morning routine",
  "A creative studio filled with sunlight",
  "The version of me who feels confident and free",
  "A cozy evening with people I love",
  "My ideal workspace",
];

function ElementCard({
  element,
  onDelete,
  onUpdate,
}: {
  element: DreamElement;
  onDelete: () => void;
  onUpdate: (updates: Partial<DreamElement>) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);

  const bgClass = {
    text: "bg-card border-border",
    quote: "bg-primary/5 border-primary/15",
    goal: "bg-phase-follicular/5 border-phase-follicular/15",
    affirmation: "bg-accent/5 border-accent/15",
    image: "bg-secondary/60 border-border",
  }[element.type];

  const labelClass = {
    text: "text-muted-foreground",
    quote: "text-primary",
    goal: "text-phase-follicular",
    affirmation: "text-accent",
    image: "text-muted-foreground",
  }[element.type];

  const typeLabel = {
    text: "Note",
    quote: "Quote",
    goal: "Goal",
    affirmation: "Affirmation",
    image: "Dream",
  }[element.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-2xl border ${bgClass} p-4 break-inside-avoid mb-3`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className={`font-mono text-[10px] uppercase tracking-wider ${labelClass}`}>{typeLabel}</span>
        <button onClick={onDelete} className="text-muted-foreground/40 hover:text-destructive transition-colors">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

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
        <p
          onClick={() => setEditing(true)}
          className={`font-display text-sm italic leading-relaxed cursor-text ${element.content ? "text-foreground" : "text-muted-foreground/40"}`}
        >
          {element.content || "Tap to edit..."}
        </p>
      )}
    </motion.div>
  );
}

export default function DreamStudio() {
  const [elements, setElements] = useState<DreamElement[]>(() => loadDreamBoard());
  const [showMenu, setShowMenu] = useState(false);
  const [addingType, setAddingType] = useState<DreamElement["type"] | null>(null);
  const [newContent, setNewContent] = useState("");

  const persist = useCallback((els: DreamElement[]) => {
    setElements(els);
    saveDreamBoard(els);
  }, []);

  const addElement = (type: DreamElement["type"]) => {
    setAddingType(type);
    setNewContent("");
    setShowMenu(false);
  };

  const confirmAdd = () => {
    if (!addingType || !newContent.trim()) return;
    haptic("medium");
    const el: DreamElement = {
      id: Date.now().toString(),
      type: addingType,
      content: newContent.trim(),
      x: 0,
      y: 0,
      width: 200,
      height: 100,
    };
    persist([...elements, el]);
    setAddingType(null);
    setNewContent("");
  };

  const deleteElement = (id: string) => {
    haptic("light");
    persist(elements.filter((e) => e.id !== id));
  };

  const updateElement = (id: string, updates: Partial<DreamElement>) => {
    persist(elements.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  };

  // Empty state
  if (elements.length === 0 && !addingType) {
    return (
      <div className="text-center pt-16 pb-10">
        <WildStar size={48} className="mx-auto mb-4" />
        <h2 className="font-display text-2xl italic text-foreground mb-2">Dream Studio</h2>
        <p className="font-hand text-sm font-bold text-primary mb-3">Imagine the life you are quietly building.</p>
        <p className="font-body text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto mb-6">
          Add images, goals, and ideas that represent the future you are creating.
        </p>
        <button
          onClick={() => setShowMenu(true)}
          className="touch-btn rounded-[14px] bg-primary px-8 py-3.5 font-display text-base italic text-primary-foreground active:scale-[0.97]"
        >
          Start your board
        </button>

        {showMenu && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 max-w-sm mx-auto">
            <div className="card-warm p-4 space-y-2">
              {ELEMENT_TYPES.map((t) => (
                <button
                  key={t.type}
                  onClick={() => addElement(t.type)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/60 active:bg-secondary transition-colors text-left"
                >
                  <t.icon className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="font-display text-sm italic text-foreground">{t.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {addingType && (
          <AddElementModal
            type={addingType}
            content={newContent}
            onChange={setNewContent}
            onConfirm={confirmAdd}
            onCancel={() => setAddingType(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="pb-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-hand text-sm font-bold text-primary mb-1">Dream Studio</p>
          <p className="font-mono text-[11px] text-muted-foreground">{elements.length} elements on your board</p>
        </div>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="touch-btn w-10 h-10 rounded-full bg-primary flex items-center justify-center active:opacity-90"
        >
          {showMenu ? <X className="h-5 w-5 text-primary-foreground" /> : <Plus className="h-5 w-5 text-primary-foreground" />}
        </button>
      </div>

      {/* Add menu */}
      {showMenu && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="card-warm p-3 mb-4 space-y-1">
          {ELEMENT_TYPES.map((t) => (
            <button
              key={t.type}
              onClick={() => addElement(t.type)}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/60 active:bg-secondary transition-colors text-left"
            >
              <t.icon className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="font-display text-sm italic text-foreground">{t.label}</span>
            </button>
          ))}
        </motion.div>
      )}

      {/* Add element modal */}
      {addingType && (
        <AddElementModal
          type={addingType}
          content={newContent}
          onChange={setNewContent}
          onConfirm={confirmAdd}
          onCancel={() => setAddingType(null)}
        />
      )}

      {/* Dream prompts */}
      {elements.length < 3 && (
        <div className="mb-4">
          <p className="font-mono text-[11px] text-muted-foreground mb-2">Try a prompt:</p>
          <div className="flex flex-wrap gap-2">
            {DREAM_PROMPTS.slice(0, 4).map((p) => (
              <button
                key={p}
                onClick={() => { setAddingType("text"); setNewContent(p); }}
                className="font-mono text-[11px] px-3 py-1.5 rounded-full bg-secondary text-muted-foreground active:bg-primary/10 active:text-primary transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Masonry board */}
      <div className="columns-2 gap-3">
        {elements.map((el) => (
          <ElementCard
            key={el.id}
            element={el}
            onDelete={() => deleteElement(el.id)}
            onUpdate={(updates) => updateElement(el.id, updates)}
          />
        ))}
      </div>
    </div>
  );
}

// ── Add Element Modal ─────────────────────────────────────────
function AddElementModal({
  type,
  content,
  onChange,
  onConfirm,
  onCancel,
}: {
  type: DreamElement["type"];
  content: string;
  onChange: (v: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const config = ELEMENT_TYPES.find((t) => t.type === type)!;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card-warm p-5 my-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-lg italic text-foreground">{config.label}</h3>
        <button onClick={onCancel} className="text-muted-foreground active:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder={config.placeholder}
        rows={3}
        className="w-full font-display text-sm italic text-foreground bg-secondary/30 border border-border rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 leading-relaxed placeholder:text-muted-foreground/40 mb-3"
        style={{ fontSize: "16px" }}
        autoFocus
      />

      {type === "image" && (
        <div className="mb-3">
          <p className="font-mono text-[11px] text-muted-foreground mb-2">Inspiration prompts:</p>
          <div className="flex flex-wrap gap-1.5">
            {DREAM_PROMPTS.map((p) => (
              <button key={p} onClick={() => onChange(p)} className="font-mono text-[10px] px-2.5 py-1 rounded-full bg-secondary text-muted-foreground active:bg-primary/10">
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      <button onClick={onConfirm} className="w-full rounded-[14px] bg-primary py-3 font-display text-sm italic text-primary-foreground active:opacity-90">
        Add to board
      </button>
    </motion.div>
  );
}
