import { useState } from "react";
import { motion } from "framer-motion";
import { PenLine } from "lucide-react";
import JournalEditor from "@/components/JournalEditor";
import { CymatiSketch, BotanicalSprig, SacredSpiral } from "@/components/BotanicalElements";
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
    <div className="max-w-3xl mx-auto space-y-10 relative">
      {/* Faint cymatic watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.04]">
        <CymatiSketch phase={info.phase} size={500} opacity={1} />
      </div>

      <div className="absolute top-0 right-0 -translate-y-6 translate-x-6 pointer-events-none">
        <SacredSpiral size={120} opacity={0.12} />
      </div>

      <div>
        <p className="font-hand text-sm font-bold text-primary">journal</p>
        <h1 className="font-display text-4xl font-bold italic text-foreground mt-1">Write to Process</h1>
        <p className="font-body text-sm text-muted-foreground mt-1">Reflect, release, reconnect</p>
      </div>

      <section className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          {JOURNALS.map((j, i) => (
            <motion.div key={j.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="card-warm p-5 cursor-pointer hover:shadow-lg transition-all"
              onClick={() => setJournalType(j.id)}
            >
              <span className="text-2xl">{j.icon}</span>
              <h3 className="font-display text-lg italic text-foreground mt-2">{j.title}</h3>
              <p className="font-hand text-sm font-bold text-primary mt-0.5">{j.subtitle}</p>
              <p className="font-body text-sm text-muted-foreground mt-2 leading-relaxed">{j.desc}</p>
              <button className="mt-4 w-full rounded-xl bg-foreground px-4 py-2.5 font-body text-sm font-bold text-background hover:opacity-90 transition-opacity">
                Begin Writing
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      <BotanicalSprig width={200} className="mx-auto" />

      {entries.length > 0 && (
        <section className="space-y-3">
          <p className="font-hand text-sm font-bold text-primary">past entries</p>
          {entries.slice(0, 8).map((entry, i) => (
            <div key={i} className="card-warm p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-hand text-sm font-bold text-primary">{TYPE_LABELS[entry.type] || entry.type}</span>
                <span className="font-mono text-[10px] text-muted-foreground">{entry.date}</span>
              </div>
              <p className="font-hand text-sm text-muted-foreground line-clamp-2">{entry.preview}...</p>
            </div>
          ))}
        </section>
      )}

      {journalType && <JournalEditor type={journalType} onClose={() => setJournalType(null)} />}
    </div>
  );
}
