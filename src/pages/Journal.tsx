import { useState } from "react";
import { motion } from "framer-motion";
import { PenLine } from "lucide-react";
import JournalEditor from "@/components/JournalEditor";
import { CymatiSketch, BotanicalSprig, SacredSpiral } from "@/components/BotanicalElements";
import { getCycleInfo, getLastPeriodStart } from "@/lib/cycle-utils";
import { haptic } from "@/hooks/use-mobile";

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

const cardVariant = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.08 * i, duration: 0.35, ease: "easeOut" as const } }),
};

export default function JournalPage() {
  const info = getCycleInfo(getLastPeriodStart());
  const [journalType, setJournalType] = useState<"expressive" | "gratitude" | "future-self" | null>(null);
  const [entries] = useState(getJournalEntries());

  return (
    <div className="max-w-3xl mx-auto space-y-8 md:space-y-10 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.04]">
        <CymatiSketch phase={info.phase} size={300} opacity={1} className="md:hidden" />
        <CymatiSketch phase={info.phase} size={500} opacity={1} className="hidden md:block" />
      </div>

      <div className="absolute top-0 right-0 -translate-y-4 md:-translate-y-6 translate-x-4 md:translate-x-6 pointer-events-none">
        <SacredSpiral size={80} opacity={0.1} className="md:hidden" />
        <SacredSpiral size={120} opacity={0.12} className="hidden md:block" />
      </div>

      <div>
        <p className="font-hand text-sm font-bold text-primary">journal</p>
        <h1 className="font-display text-[1.75rem] md:text-4xl font-bold italic text-foreground mt-1">Write to Process</h1>
        <p className="font-body text-sm text-muted-foreground mt-1">Reflect, release, reconnect</p>
      </div>

      <section className="space-y-4">
        {/* Single column on mobile, 3 cols on desktop */}
        <div className="grid gap-3 md:gap-4 sm:grid-cols-3">
          {JOURNALS.map((j, i) => (
            <motion.div key={j.id} custom={i} initial="hidden" animate="visible" variants={cardVariant}
              className="card-warm p-5 cursor-pointer touch-card"
              onClick={() => { haptic("medium"); setJournalType(j.id); }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-2xl">{j.icon}</span>
              <h3 className="font-display text-base md:text-lg italic text-foreground mt-2">{j.title}</h3>
              <p className="font-hand text-sm font-bold text-primary mt-0.5">{j.subtitle}</p>
              <p className="font-body text-sm text-muted-foreground mt-2 leading-relaxed">{j.desc}</p>
              <button className="touch-btn mt-4 w-full rounded-xl bg-foreground px-4 py-3 min-h-[52px] font-body text-sm font-bold text-background active:opacity-90 transition-opacity">
                Begin Writing
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      <BotanicalSprig width={160} className="mx-auto md:hidden" />
      <BotanicalSprig width={200} className="mx-auto hidden md:block" />

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
