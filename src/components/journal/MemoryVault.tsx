import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Plus, X, Sparkles } from "lucide-react";
import { haptic } from "@/hooks/use-mobile";
import { loadVault, saveVault, getResurfacingMemories, type VaultEntry } from "@/lib/journal-store";
import { HandDrawnBook, WildStar } from "@/components/BotanicalElements";

const VAULT_CATEGORIES = [
  { key: "funny-moments", label: "Funny Moments", desc: "The things that made you laugh out loud", motif: "A soft curve like a smile" },
  { key: "tiny-wins", label: "Tiny Wins", desc: "Small victories that deserve to be remembered", motif: "A tiny star" },
  { key: "firsts", label: "Firsts", desc: "The first time you did something brave or new", motif: "A sprouting seed" },
  { key: "hard-days", label: "Hard Things I Survived", desc: "Proof of your resilience", motif: "A mountain ridge" },
  { key: "lessons", label: "Lessons", desc: "Wisdom earned through experience", motif: "An open book" },
  { key: "love-notes", label: "Love Notes to Self", desc: "Words of kindness you wrote for yourself", motif: "A heart outline" },
  { key: "remember", label: "Things I Want to Remember", desc: "Moments, feelings, and details worth keeping", motif: "A pressed flower" },
  { key: "plot-twists", label: "Plot Twists", desc: "The unexpected turns that changed everything", motif: "A winding path" },
  { key: "beautiful-days", label: "Beautiful Days", desc: "Days that felt like magic", motif: "A sun ray" },
];

// ── Decorative ────────────────────────────────────────────────
function VaultDrawer({ label }: { label: string }) {
  return (
    <svg viewBox="0 0 24 16" className="w-5 h-3.5 text-primary/30 flex-shrink-0">
      <rect x={1} y={1} width={22} height={14} rx={3} fill="none" stroke="currentColor" strokeWidth={0.8} />
      <circle cx={12} cy={8} r={1.5} fill="currentColor" opacity={0.5} />
    </svg>
  );
}

export default function MemoryVault() {
  const [vault, setVault] = useState<VaultEntry[]>(() => loadVault());
  const [adding, setAdding] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newPreview, setNewPreview] = useState("");

  const resurfacing = useMemo(() => getResurfacingMemories(vault), [vault]);

  const grouped = useMemo(() => {
    const map: Record<string, VaultEntry[]> = {};
    for (const c of VAULT_CATEGORIES) map[c.key] = [];
    for (const e of vault) {
      if (map[e.category]) map[e.category].push(e);
    }
    return map;
  }, [vault]);

  const totalMemories = vault.length;

  const addManual = (category: string) => {
    if (!newTitle.trim()) return;
    haptic("medium");
    const entry: VaultEntry = {
      id: Date.now().toString(),
      entryId: "",
      category,
      title: newTitle.trim(),
      preview: newPreview.trim(),
      date: new Date().toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" }),
      timestamp: Date.now(),
    };
    const updated = [entry, ...vault];
    setVault(updated);
    saveVault(updated);
    setAdding(null);
    setNewTitle("");
    setNewPreview("");
  };

  const remove = (id: string) => {
    haptic("light");
    const updated = vault.filter((e) => e.id !== id);
    setVault(updated);
    saveVault(updated);
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="mb-2">
        <p className="font-hand text-sm font-bold text-primary mb-1">Memory Vault</p>
        <p className="font-body text-sm text-muted-foreground leading-relaxed">
          A curated archive of the moments, lessons, and memories that matter most to you.
        </p>
        {totalMemories > 0 && (
          <p className="font-mono text-[11px] text-muted-foreground/60 mt-1">{totalMemories} {totalMemories === 1 ? "memory" : "memories"} saved</p>
        )}
      </div>

      {/* Empty state */}
      {totalMemories === 0 && (
        <div className="text-center pt-8 pb-4">
          <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 3, repeat: Infinity }}>
            <HandDrawnBook size={48} color="hsl(var(--primary))" className="mx-auto mb-4" />
          </motion.div>
          <h2 className="font-display text-xl italic text-foreground mb-2">Your Memory Vault</h2>
          <p className="font-display text-sm italic text-muted-foreground max-w-sm mx-auto">
            This is where your favourite pieces of your life can live. Save moments from your journal or add them directly.
          </p>
        </div>
      )}

      {/* Resurfacing memories */}
      {resurfacing.length > 0 && (
        <div className="rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <p className="font-display text-[15px] italic text-foreground">A note your past self left you</p>
          </div>
          {resurfacing.map((r, i) => (
            <div key={i} className="bg-card/50 rounded-xl p-4 mb-2 last:mb-0">
              <p className="font-mono text-[10px] text-primary uppercase tracking-wider mb-1">{r.label}</p>
              <p className="font-display text-sm italic text-foreground mb-0.5">{r.entry.title}</p>
              {r.entry.preview && <p className="font-body text-[13px] text-muted-foreground line-clamp-2">{r.entry.preview}</p>}
              <p className="font-mono text-[10px] text-muted-foreground/50 mt-1">{r.entry.date}</p>
            </div>
          ))}
        </div>
      )}

      {/* Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {VAULT_CATEGORIES.map((cat) => (
        <div key={cat.key} className="min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <VaultDrawer label={cat.label} />
              <div>
                <h3 className="font-display text-[16px] italic text-foreground">{cat.label}</h3>
                <p className="font-mono text-[10px] text-muted-foreground/60">{cat.desc}</p>
              </div>
            </div>
            <button
              onClick={() => { setAdding(adding === cat.key ? null : cat.key); setNewTitle(""); setNewPreview(""); }}
              className="font-mono text-[11px] text-primary active:opacity-70 flex items-center gap-1"
            >
              {adding === cat.key ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
              {adding === cat.key ? "Cancel" : "Add"}
            </button>
          </div>

          {/* Add form */}
          <AnimatePresence>
            {adding === cat.key && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="card-warm p-4 mb-3">
                  <input
                    type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="What do you want to remember?"
                    className="w-full font-display text-sm italic text-foreground bg-secondary/30 border border-border rounded-xl px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    style={{ fontSize: "16px" }}
                    autoFocus
                  />
                  <textarea
                    value={newPreview} onChange={(e) => setNewPreview(e.target.value)}
                    placeholder="A few words about this memory..."
                    rows={2}
                    className="w-full font-display text-sm italic text-foreground bg-secondary/30 border border-border rounded-xl px-3 py-2 resize-none mb-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    style={{ fontSize: "16px" }}
                  />
                  <button onClick={() => addManual(cat.key)} className="w-full rounded-xl bg-primary py-2.5 font-display text-sm italic text-primary-foreground active:opacity-90">
                    Save to vault
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Entries */}
          {grouped[cat.key]?.length > 0 ? (
            <div className="space-y-2 mb-2">
              {grouped[cat.key].map((e) => (
                <motion.div key={e.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-warm p-4 flex items-start gap-3 group hover:shadow-sm transition-shadow">
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-[15px] italic text-foreground mb-0.5">{e.title}</p>
                    {e.preview && <p className="font-body text-[13px] text-muted-foreground leading-relaxed line-clamp-2">{e.preview}</p>}
                    <p className="font-mono text-[10px] text-muted-foreground/50 mt-1">{e.date}</p>
                  </div>
                  <button onClick={() => remove(e.id)} className="text-muted-foreground/20 hover:text-destructive transition-colors flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              ))}
            </div>
          ) : (
            !adding && grouped[cat.key]?.length === 0 && (
              <div className="rounded-xl border border-dashed border-border/50 p-4 mb-2 text-center">
                <p className="font-display text-sm italic text-muted-foreground/50">No memories saved yet</p>
              </div>
            )
          )}
        </div>
      ))}
      </div>
    </div>
  );
}

// ── Public utility ────────────────────────────────────────────
export function saveEntryToVault(entry: { id: string; title?: string; date: string; timestamp: number; prompts: Record<string, string> }, category: string) {
  const vault = loadVault();
  const preview = Object.values(entry.prompts).filter(Boolean)[0] || "";
  const ve: VaultEntry = {
    id: Date.now().toString(),
    entryId: entry.id,
    category,
    title: entry.title || entry.date,
    preview: preview.slice(0, 150),
    date: entry.date,
    timestamp: entry.timestamp,
  };
  saveVault([ve, ...vault]);
}
