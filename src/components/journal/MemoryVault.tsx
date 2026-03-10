import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { haptic } from "@/hooks/use-mobile";
import { loadVault, saveVault, type VaultEntry } from "@/lib/journal-store";
import { HandDrawnBook } from "@/components/BotanicalElements";

const VAULT_CATEGORIES = [
  { key: "funny-moments", label: "Funny Moments", desc: "The things that made you laugh out loud" },
  { key: "tiny-wins", label: "Tiny Wins", desc: "Small victories that deserve to be remembered" },
  { key: "firsts", label: "Firsts", desc: "The first time you did something brave or new" },
  { key: "lessons", label: "Lessons", desc: "Wisdom earned through experience" },
  { key: "remember", label: "Things I Want to Remember", desc: "Moments, feelings, and details worth keeping" },
  { key: "hard-days", label: "Hard Days I Survived", desc: "Proof of your resilience" },
];

export default function MemoryVault() {
  const [vault, setVault] = useState<VaultEntry[]>(() => loadVault());
  const [adding, setAdding] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newPreview, setNewPreview] = useState("");

  const grouped = useMemo(() => {
    const map: Record<string, VaultEntry[]> = {};
    for (const c of VAULT_CATEGORIES) map[c.key] = [];
    for (const e of vault) {
      if (map[e.category]) map[e.category].push(e);
    }
    return map;
  }, [vault]);

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
      </div>

      {VAULT_CATEGORIES.map((cat) => (
        <div key={cat.key}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-display text-lg italic text-foreground">{cat.label}</h3>
              <p className="font-mono text-[11px] text-muted-foreground">{cat.desc}</p>
            </div>
            <button
              onClick={() => { setAdding(adding === cat.key ? null : cat.key); setNewTitle(""); setNewPreview(""); }}
              className="font-mono text-[11px] text-primary active:opacity-70"
            >
              {adding === cat.key ? "Cancel" : "+ Add"}
            </button>
          </div>

          {/* Add form */}
          {adding === cat.key && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="card-warm p-4 mb-3">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Title"
                className="w-full font-display text-sm italic text-foreground bg-secondary/30 border border-border rounded-xl px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                style={{ fontSize: "16px" }}
                autoFocus
              />
              <textarea
                value={newPreview}
                onChange={(e) => setNewPreview(e.target.value)}
                placeholder="A few words about this memory..."
                rows={2}
                className="w-full font-display text-sm italic text-foreground bg-secondary/30 border border-border rounded-xl px-3 py-2 resize-none mb-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                style={{ fontSize: "16px" }}
              />
              <button onClick={() => addManual(cat.key)} className="w-full rounded-xl bg-primary py-2.5 font-display text-sm italic text-primary-foreground active:opacity-90">
                Save to vault
              </button>
            </motion.div>
          )}

          {/* Entries */}
          {grouped[cat.key]?.length > 0 ? (
            <div className="space-y-2 mb-2">
              {grouped[cat.key].map((e) => (
                <motion.div key={e.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-warm p-4 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-[15px] italic text-foreground mb-0.5">{e.title}</p>
                    {e.preview && <p className="font-body text-[13px] text-muted-foreground leading-relaxed line-clamp-2">{e.preview}</p>}
                    <p className="font-mono text-[10px] text-muted-foreground/60 mt-1">{e.date}</p>
                  </div>
                  <button onClick={() => remove(e.id)} className="text-muted-foreground/40 hover:text-destructive transition-colors flex-shrink-0 mt-1">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              ))}
            </div>
          ) : (
            !adding && (
              <div className="card-warm p-4 mb-2 opacity-60">
                <p className="font-display text-sm italic text-muted-foreground text-center">No memories saved yet</p>
              </div>
            )
          )}
        </div>
      ))}
    </div>
  );
}

// Utility to save a journal entry to vault from entries tab
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
