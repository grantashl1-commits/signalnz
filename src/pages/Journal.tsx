import { useState } from "react";
import { motion } from "framer-motion";
import { PenLine } from "lucide-react";
import JournalEditor from "@/components/JournalEditor";

const JOURNALS = [
  { id: "expressive" as const, title: "Expressive Writing", subtitle: "Pennebaker Protocol", desc: "Write freely about difficult emotions. No editing, no judgement. This is a proven therapeutic practice for processing stress and trauma.", icon: "✍️" },
  { id: "gratitude" as const, title: "Gratitude Journal", subtitle: "Three prompts", desc: "Reflect on what went well, who helped, and what's ahead. Gratitude journaling is linked to improved sleep and reduced anxiety.", icon: "🙏" },
  { id: "future-self" as const, title: "Future Self", subtitle: "Letter writing", desc: "Write a letter from your future self, 5 years from now. This practice strengthens your connection to long-term goals.", icon: "💌" },
];

// Get saved journal entries
function getJournalEntries(): { date: string; type: string; preview: string }[] {
  const entries: { date: string; type: string; preview: string }[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith("mindcast_journal_")) {
      const parts = key.replace("mindcast_journal_", "").split("_");
      const date = parts.pop() || "";
      const type = parts.join("_") || "";
      const val = localStorage.getItem(key);
      try {
        const texts = JSON.parse(val || "[]");
        const preview = Array.isArray(texts) ? texts.join(" ").slice(0, 80) : String(val).slice(0, 80);
        entries.push({ date, type, preview });
      } catch {
        entries.push({ date, type, preview: String(val).slice(0, 80) });
      }
    }
  }
  return entries.sort((a, b) => b.date.localeCompare(a.date));
}

const TYPE_LABELS: Record<string, string> = {
  expressive: "Expressive Writing",
  gratitude: "Gratitude Journal",
  "future-self": "Future Self",
};

export default function JournalPage() {
  const [journalType, setJournalType] = useState<"expressive" | "gratitude" | "future-self" | null>(null);
  const [entries] = useState(getJournalEntries());

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <div>
        <h1 className="font-display text-3xl font-semibold text-foreground">Journal</h1>
        <p className="text-muted-foreground mt-1">Write to process, reflect, and grow</p>
      </div>

      {/* Journal types */}
      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold text-foreground flex items-center gap-2">
          <PenLine className="h-5 w-5 text-accent" /> Choose Your Practice
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {JOURNALS.map((j, i) => (
            <motion.div
              key={j.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="card-warm p-5 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setJournalType(j.id)}
            >
              <span className="text-2xl">{j.icon}</span>
              <h3 className="font-display text-lg font-semibold text-foreground mt-2">{j.title}</h3>
              <p className="text-xs text-accent font-medium mt-0.5">{j.subtitle}</p>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{j.desc}</p>
              <button className="mt-4 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">
                Start Writing
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Past entries */}
      {entries.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold text-foreground">Past Entries</h2>
          <div className="space-y-2">
            {entries.slice(0, 10).map((entry, i) => (
              <div key={i} className="card-warm p-4 flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-accent">{TYPE_LABELS[entry.type] || entry.type}</span>
                    <span className="text-[10px] text-muted-foreground">{entry.date}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{entry.preview}...</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {journalType && <JournalEditor type={journalType} onClose={() => setJournalType(null)} />}
    </div>
  );
}
