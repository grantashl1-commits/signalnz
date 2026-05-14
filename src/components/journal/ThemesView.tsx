import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { VaultEntry } from "@/lib/journal-store";

const THEMES: { key: string; label: string; emoji: string; keywords: string[] }[] = [
  { key: "body",     label: "Body & cycle",   emoji: "🌸", keywords: ["body", "cycle", "phase", "period", "menstrual", "luteal", "follicular", "ovulatory", "energy", "tired", "rest", "sleep", "pain", "ache", "hormone"] },
  { key: "love",     label: "Love & connection", emoji: "💗", keywords: ["love", "partner", "relationship", "him", "her", "them", "kiss", "touch", "intimate", "connection", "together", "us", "we"] },
  { key: "family",   label: "Family",         emoji: "🏡", keywords: ["mum", "mom", "dad", "mother", "father", "sister", "brother", "child", "kid", "son", "daughter", "family", "parents", "home"] },
  { key: "work",     label: "Work & calling", emoji: "🪶", keywords: ["work", "job", "career", "boss", "client", "project", "deadline", "meeting", "office", "business", "money", "purpose", "calling"] },
  { key: "fear",     label: "Fear & worry",   emoji: "🌫", keywords: ["fear", "afraid", "scared", "anxious", "anxiety", "worry", "panic", "dread", "nervous", "overwhelm", "stress"] },
  { key: "joy",      label: "Joy & wonder",   emoji: "✨", keywords: ["joy", "happy", "delight", "wonder", "magic", "beautiful", "grateful", "gratitude", "love", "alive", "bliss", "laugh"] },
  { key: "grief",    label: "Grief & loss",   emoji: "🍂", keywords: ["grief", "loss", "sad", "miss", "missing", "gone", "death", "die", "cry", "tears", "mourn", "ache", "heartbreak"] },
  { key: "growth",   label: "Becoming",       emoji: "🌱", keywords: ["learn", "grow", "growing", "becoming", "change", "shift", "new", "begin", "start", "transform", "evolve", "lesson"] },
  { key: "self",     label: "Self & identity", emoji: "🌙", keywords: ["self", "me", "identity", "worth", "enough", "deserve", "voice", "boundary", "boundaries", "needs", "want", "true"] },
  { key: "rest",     label: "Rest & softness", emoji: "🕊", keywords: ["rest", "soft", "slow", "still", "quiet", "pause", "gentle", "ease", "breath", "calm", "peace"] },
];

interface Props {
  vault: VaultEntry[];
}

function detectThemes(text: string): string[] {
  const lower = text.toLowerCase();
  const hits: string[] = [];
  for (const t of THEMES) {
    if (t.keywords.some(k => new RegExp(`\\b${k}\\b`, "i").test(lower))) {
      hits.push(t.key);
    }
  }
  return hits;
}

export default function ThemesView({ vault }: Props) {
  const [activeTheme, setActiveTheme] = useState<string | null>(null);

  const clustered = useMemo(() => {
    const map: Record<string, VaultEntry[]> = {};
    for (const t of THEMES) map[t.key] = [];
    for (const e of vault) {
      const text = `${e.title} ${e.preview || ""}`;
      const themes = detectThemes(text);
      for (const tk of themes) map[tk].push(e);
    }
    return map;
  }, [vault]);

  const visibleThemes = THEMES.filter(t => clustered[t.key].length > 0);

  if (vault.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="font-display text-sm italic text-muted-foreground/70">
          Themes will appear once you've held a few memories.
        </p>
      </div>
    );
  }

  if (visibleThemes.length === 0) {
    return (
      <div className="text-center py-8">
        <Sparkles className="h-5 w-5 text-primary/40 mx-auto mb-2" />
        <p className="font-display text-sm italic text-muted-foreground/70">
          No themes surfaced yet — keep writing, patterns will emerge.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <p className="font-body text-[11px] text-muted-foreground/60">
        Patterns gently noticed across {vault.length} {vault.length === 1 ? "memory" : "memories"}.
      </p>

      {/* Theme chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTheme(null)}
          className={`rounded-full px-3 py-1.5 font-body text-xs transition-all ${
            activeTheme === null
              ? "bg-primary text-primary-foreground"
              : "bg-secondary/60 text-foreground/70 hover:bg-secondary"
          }`}
        >
          All themes
        </button>
        {visibleThemes.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTheme(activeTheme === t.key ? null : t.key)}
            className={`rounded-full px-3 py-1.5 font-body text-xs transition-all flex items-center gap-1.5 ${
              activeTheme === t.key
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/60 text-foreground/70 hover:bg-secondary"
            }`}
          >
            <span>{t.emoji}</span>
            <span>{t.label}</span>
            <span className="opacity-60">{clustered[t.key].length}</span>
          </button>
        ))}
      </div>

      {/* Clustered entries */}
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {visibleThemes
            .filter(t => activeTheme === null || activeTheme === t.key)
            .map(t => (
              <motion.div
                key={t.key}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{t.emoji}</span>
                  <h3 className="font-display text-[15px] italic text-foreground">{t.label}</h3>
                  <span className="font-body text-[10px] text-muted-foreground/60">
                    · {clustered[t.key].length} {clustered[t.key].length === 1 ? "memory" : "memories"}
                  </span>
                </div>
                <div className="space-y-2">
                  {clustered[t.key].slice(0, activeTheme === t.key ? undefined : 3).map(e => (
                    <div key={e.id} className="card-warm p-3">
                      <p className="font-display text-[14px] italic text-foreground mb-0.5">{e.title}</p>
                      {e.preview && (
                        <p className="font-body text-[12px] text-muted-foreground leading-relaxed line-clamp-2">{e.preview}</p>
                      )}
                      <p className="font-body text-[10px] text-muted-foreground/50 mt-1">{e.date}</p>
                    </div>
                  ))}
                  {activeTheme !== t.key && clustered[t.key].length > 3 && (
                    <button
                      onClick={() => setActiveTheme(t.key)}
                      className="font-body text-[11px] text-primary active:opacity-70"
                    >
                      Show all {clustered[t.key].length} →
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
