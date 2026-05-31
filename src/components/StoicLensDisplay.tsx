import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2, BookOpen, Play, ChevronDown, ChevronUp } from "lucide-react";
import { haptic } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import type { StoicLens, StoicReading } from "@/hooks/useStoicJournal";

interface Props {
  entryId: string;
  entryContent: string;
  reading: StoicReading | null;
  currentPhase: string;
  cycleDay: number;
  cycleMode: string;
  existingLens: StoicLens | null;
  listenedToday: boolean;
  onLensGenerated: (lens: StoicLens) => void;
  onListen?: () => void;
}

const LOADING_MESSAGES = [
  "Reading your words...",
  "Connecting to ancient wisdom...",
  "Weaving your metaphor...",
];

export default function StoicLensDisplay({
  entryId, entryContent, reading, currentPhase, cycleDay, cycleMode,
  existingLens, listenedToday, onLensGenerated, onListen,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [loadingIdx, setLoadingIdx] = useState(0);
  const [lens, setLens] = useState<StoicLens | null>(existingLens);
  const [error, setError] = useState<string | null>(null);
  const [showPassage, setShowPassage] = useState(false);

  const generateLens = async () => {
    if (!reading) return;
    setLoading(true);
    setLoadingIdx(0);
    setError(null);

    const interval = setInterval(() => {
      setLoadingIdx((prev) => Math.min(prev + 1, LOADING_MESSAGES.length - 1));
    }, 2000);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("stoic-journal-ai", {
        body: {
          journal_entry_id: entryId,
          journal_content: entryContent,
          stoic_seq_day: reading.seq_day,
          stoic_title: reading.title,
          stoic_quote: reading.quote,
          stoic_source: `${reading.author}, ${reading.source}`,
          stoic_reflection: reading.reflection,
          current_phase: currentPhase,
          cycle_day: cycleDay,
          cycle_mode: cycleMode,
        },
      });

      clearInterval(interval);

      if (fnError || !data) {
        setError("Something didn't connect today. Your reflection is saved. Try again, or just sit with what you wrote.");
      } else {
        const generatedLens: StoicLens = {
          seq_day: reading.seq_day,
          stoic_title: reading.title,
          bridge_metaphor: data.bridge_metaphor,
          stoic_principle: data.stoic_principle,
          carry_forward: data.carry_forward,
          generated_at: new Date().toISOString(),
        };
        setLens(generatedLens);
        onLensGenerated(generatedLens);
      }
    } catch {
      clearInterval(interval);
      setError("Something didn't connect today. Your reflection is saved. Try again, or just sit with what you wrote.");
    }

    setLoading(false);
  };

  // Show existing lens
  if (lens) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-primary/20 bg-primary/[0.03] p-5 space-y-4"
      >
        <div className="flex items-center gap-2">
          <span className="font-body text-base">🌿</span>
          <span className="font-body text-[11px] uppercase tracking-wider text-primary">The Stoic Lens · Day {lens.seq_day}</span>
        </div>
        <p className="font-body text-[11px] text-muted-foreground">{lens.stoic_title} — {reading?.author}</p>

        <p className="font-display text-base italic text-foreground leading-relaxed">{lens.bridge_metaphor}</p>

        <div className="space-y-1">
          <p className="font-body text-[10px] uppercase tracking-wider text-muted-foreground/60">The principle</p>
          <p className="font-body text-sm text-muted-foreground leading-relaxed">{lens.stoic_principle}</p>
        </div>

        <div className="space-y-1 pt-2 border-t border-border/30">
          <p className="font-body text-[10px] uppercase tracking-wider text-muted-foreground/60">Carry this forward</p>
          <p className="font-display text-sm italic text-foreground leading-relaxed">{lens.carry_forward}</p>
        </div>

        {/* Written passage toggle */}
        {reading?.reflection && (
          <div className="pt-2 border-t border-border/30">
            <button
              onClick={() => setShowPassage(!showPassage)}
              className="flex items-center gap-2 font-body text-[11px] text-primary hover:underline"
            >
              <BookOpen className="h-3 w-3" />
              {showPassage ? "Hide today's passage" : "Read today's passage"}
              {showPassage ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
            {showPassage && (
              <div className="mt-3 space-y-2">
                <blockquote className="font-display text-sm italic text-muted-foreground leading-relaxed border-l-2 border-primary/20 pl-4">
                  "{reading.quote}"
                  <footer className="font-body text-[10px] text-muted-foreground/60 mt-1 not-italic">— {reading.author}, {reading.source}</footer>
                </blockquote>
                <p className="font-body text-sm text-foreground/80 leading-relaxed">{reading.reflection}</p>
              </div>
            )}
          </div>
        )}
      </motion.div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="rounded-2xl border border-primary/10 bg-primary/[0.02] p-6 flex flex-col items-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="font-hand text-sm text-muted-foreground animate-pulse">{LOADING_MESSAGES[loadingIdx]}</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-2xl border border-border p-5 space-y-3">
        <p className="font-body text-sm text-muted-foreground italic">{error}</p>
        <button
          onClick={generateLens}
          className="rounded-xl bg-secondary px-4 py-2 font-body text-sm text-foreground hover:bg-secondary/80 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  // Generate prompt
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-primary/15 bg-primary/[0.03] p-5 space-y-3"
    >
      <div className="flex items-center gap-2">
        <span className="font-body text-base">🌿</span>
        <span className="font-display text-lg italic text-foreground">The Stoic Lens</span>
      </div>

      {!listenedToday && reading && onListen && (
        <button
          onClick={() => { haptic("medium"); onListen(); }}
          className="touch-btn flex items-center gap-2 rounded-xl bg-secondary px-4 py-3 font-display text-sm italic text-foreground active:scale-[0.97]"
        >
          <Play className="h-4 w-4" /> Listen · Day {reading.seq_day}
        </button>
      )}

      <p className="font-body text-sm text-muted-foreground leading-relaxed">
        Let Signal weave a metaphor connecting your words to today's philosophy — drawing from the Dao, ancient fables, and timeless wisdom traditions.
      </p>
      <button
        onClick={() => { haptic("medium"); generateLens(); }}
        className="touch-btn w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-display text-sm italic text-primary-foreground active:scale-[0.97]"
      >
        <Sparkles className="h-4 w-4" /> Generate my reflection →
      </button>
      <p className="font-body text-xs text-muted-foreground/50 text-center">
        Uses what you wrote + Day {reading?.seq_day}'s reading to create something made just for today.
      </p>

      {/* Written passage toggle */}
      {reading?.reflection && (
        <div className="pt-2 border-t border-border/30">
          <button
            onClick={() => setShowPassage(!showPassage)}
            className="flex items-center gap-2 font-body text-[11px] text-primary hover:underline"
          >
            <BookOpen className="h-3 w-3" />
            {showPassage ? "Hide passage" : "Read today's passage"}
            {showPassage ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          {showPassage && (
            <div className="mt-3 space-y-2">
              <blockquote className="font-display text-sm italic text-muted-foreground leading-relaxed border-l-2 border-primary/20 pl-4">
                "{reading.quote}"
                <footer className="font-body text-[10px] text-muted-foreground/60 mt-1 not-italic">— {reading.author}, {reading.source}</footer>
              </blockquote>
              <p className="font-body text-sm text-foreground/80 leading-relaxed">{reading.reflection}</p>
            </div>
          )}
        </div>
      )}

    </motion.div>
  );
}
