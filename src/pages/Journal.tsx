import { useState } from "react";
import { motion } from "framer-motion";
import { PenLine } from "lucide-react";
import JournalEditor from "@/components/JournalEditor";
import CymaticPattern from "@/components/CymaticPatterns";
import { getCycleInfo, getLastPeriodStart } from "@/lib/cycle-utils";

const JOURNALS = [
  { id: "expressive" as const, title: "Expressive Writing", subtitle: "Pennebaker Protocol", desc: "Write freely about difficult emotions. No editing, no judgement. A proven practice for processing.", icon: "✍️" },
  { id: "gratitude" as const, title: "Gratitude Journal", subtitle: "Three prompts", desc: "Reflect on what went well, who helped, and what's ahead.", icon: "🙏" },
  { id: "future-self" as const, title: "Future Self", subtitle: "Letter writing", desc: "Write a letter from your future self, 5 years from now.", icon: "💌" },
];

function getJournalEntries(): { date: string; type: string; preview: string }[] {
  const entries: { date: string; type: string; preview: string }[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith("mindcast_journal_")) {
      const parts = key.replace("mindcast_journal_", "").split("_");
      const date = parts.pop() || "";
      const type = parts.join("_") || "";
      try {
        const texts = JSON.parse(localStorage.getItem(key) || "[]");
        const preview = Array.isArray(texts) ? texts.join(" ").slice(0, 80) : "";
        entries.push({ date, type, preview });
      } catch { entries.push({ date, type, preview: "" }); }
    }
  }
  return entries.sort((a, b) => b.date.localeCompare(a.date));
}

const TYPE_LABELS: Record<string, string> = { expressive: "Expressive", gratitude: "Gratitude", "future-self": "Future Self" };

export default function JournalPage() {
  const info = getCycleInfo(getLastPeriodStart());
  const [journalType, setJournalType] = useState<"expressive" | "gratitude" | "future-self" | null>(null);
  const [entries] = useState(getJournalEntries());

  return (
    <div className="max-w-3xl mx-auto space-y-10 light-mode" style={{ "--background": "210 25% 96%", "--foreground": "210 40% 10%", "--card": "0 0% 100%", "--card-foreground": "210 40% 10%", "--muted": "210 15% 90%", "--muted-foreground": "210 15% 40%", "--border": "210 15% 88%" } as React.CSSProperties}>
      {/* Faint cymatic watermark */}
      <div className="fixed inset-0 -z-10 flex items-center justify-center pointer-events-none opacity-[0.03]">
        <CymaticPattern phase={info.phase} size={500} opacity={1} />
      </div>

      <div>
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "#00C9A7" }}>journal</p>
        <h1 className="font-display text-4xl font-light italic text-foreground mt-1">Write to Process</h1>
        <p className="font-body text-sm text-muted-foreground mt-1">Reflect, release, reconnect</p>
      </div>

      <section className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          {JOURNALS.map((j, i) => (
            <motion.div key={j.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="rounded-xl border border-border bg-card p-5 cursor-pointer hover:shadow-lg transition-all"
              onClick={() => setJournalType(j.id)}
            >
              <span className="text-2xl">{j.icon}</span>
              <h3 className="font-display text-lg italic text-foreground mt-2">{j.title}</h3>
              <p className="font-body text-[10px] font-bold uppercase tracking-[0.2em] mt-0.5" style={{ color: "#00C9A7" }}>{j.subtitle}</p>
              <p className="font-body text-sm text-muted-foreground mt-2 leading-relaxed">{j.desc}</p>
              <button className="mt-4 w-full rounded-lg bg-foreground px-4 py-2.5 font-body text-xs font-bold uppercase tracking-widest text-background hover:opacity-90 transition-opacity">
                Begin Writing
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {entries.length > 0 && (
        <section className="space-y-3">
          <p className="font-body text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "#00C9A7" }}>past signals</p>
          {entries.slice(0, 8).map((entry, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-body text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "#00C9A7" }}>{TYPE_LABELS[entry.type] || entry.type}</span>
                <span className="font-mono text-[10px] text-muted-foreground">{entry.date}</span>
              </div>
              <p className="font-mono text-xs text-muted-foreground line-clamp-2">{entry.preview}...</p>
            </div>
          ))}
        </section>
      )}

      {journalType && <JournalEditor type={journalType} onClose={() => setJournalType(null)} />}
    </div>
  );
}
