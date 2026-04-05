import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, RefreshCw, Loader2 } from "lucide-react";
import { haptic } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import type { JournalEntryRow } from "@/hooks/useStoicJournal";

interface Props {
  entries: JournalEntryRow[];
}

export default function JournalInsights({ entries }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(() => {
    try {
      const cached = localStorage.getItem("signal_journal_insights_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        const daysSince = (Date.now() - parsed.generatedAt) / (1000 * 60 * 60 * 24);
        if (daysSince < 7) return parsed.summary;
      }
    } catch {}
    return null;
  });
  const [loading, setLoading] = useState(false);

  const stats = useMemo(() => {
    const last28 = entries.slice(0, 28);
    const phaseCounts: Record<string, number> = {};
    const moodCounts: Record<string, number> = {};
    let totalWords = 0;
    let stoicCount = 0;
    let standardCount = 0;

    for (const e of last28) {
      if (e.cycle_phase) phaseCounts[e.cycle_phase] = (phaseCounts[e.cycle_phase] || 0) + 1;
      if (e.mood) moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
      totalWords += e.word_count || 0;
      if (e.stoic_lens) stoicCount++;
      if (e.entry_type === "standard" || !e.entry_type) standardCount++;
    }

    const topPhase = Object.entries(phaseCounts).sort((a, b) => b[1] - a[1])[0];
    const topMoods = Object.entries(moodCounts).sort((a, b) => b[1] - a[1]).slice(0, 2);
    const avgWords = standardCount > 0 ? Math.round(totalWords / standardCount) : 0;

    return { last28, topPhase, topMoods, avgWords, stoicCount, standardCount };
  }, [entries]);

  if (entries.length < 10) return null;

  const generateSummary = async () => {
    setLoading(true);
    haptic("medium");
    try {
      const fragments = stats.last28.map((e) => ({
        title: e.title?.slice(0, 60),
        preview: (e.content || "").slice(0, 100),
        mood: e.mood,
        phase: e.cycle_phase,
        date: e.date,
      }));

      const { data } = await supabase.functions.invoke("journal-insights", {
        body: { entries: fragments },
      });

      if (data?.summary) {
        setAiSummary(data.summary);
        localStorage.setItem("signal_journal_insights_cache", JSON.stringify({
          summary: data.summary,
          generatedAt: Date.now(),
        }));
      }
    } catch {}
    setLoading(false);
  };

  return (
    <div className="mt-6">
      <button
        onClick={() => { setExpanded(!expanded); haptic("light"); }}
        className="flex items-center justify-between w-full card-warm p-4"
      >
        <span className="font-display text-sm italic text-foreground">Your Journal Patterns</span>
        {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="card-warm p-5 mt-2 space-y-3">
              <p className="font-mono text-[11px] text-muted-foreground">Across your last {stats.last28.length} entries:</p>

              {stats.topPhase && (
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-muted-foreground">Most journaled phase</span>
                  <span className="text-foreground capitalize">{stats.topPhase[0]} ({stats.topPhase[1]} entries)</span>
                </div>
              )}

              {stats.topMoods.length > 0 && (
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-muted-foreground">Most common mood</span>
                  <span className="text-foreground capitalize">{stats.topMoods.map(([m, c]) => `${m} (${c}×)`).join(", ")}</span>
                </div>
              )}

              <div className="flex justify-between font-mono text-xs">
                <span className="text-muted-foreground">Average entry length</span>
                <span className="text-foreground">{stats.avgWords} words</span>
              </div>

              <div className="flex justify-between font-mono text-xs">
                <span className="text-muted-foreground">Stoic reflections saved</span>
                <span className="text-foreground">{stats.stoicCount} of {stats.standardCount} standard entries</span>
              </div>

              <div className="border-t border-border/30 pt-3 mt-3">
                {aiSummary ? (
                  <div>
                    <p className="font-mono text-[10px] text-muted-foreground/60 mb-1">What your journal says about this cycle:</p>
                    <p className="font-display text-sm italic text-foreground leading-relaxed">{aiSummary}</p>
                    <button
                      onClick={generateSummary}
                      disabled={loading}
                      className="flex items-center gap-1.5 mt-2 font-mono text-[11px] text-primary hover:underline"
                    >
                      <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} /> Refresh
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={generateSummary}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary/10 py-3 font-display text-sm italic text-primary hover:bg-primary/15 transition-colors"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {loading ? "Generating..." : "Generate insights →"}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
