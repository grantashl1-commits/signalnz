import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { useCycle } from "@/contexts/CycleContext";
import { haptic } from "@/hooks/use-mobile";
import { toast } from "sonner";

interface Props {
  userId: string;
  /** Optional latest check-in for context */
  context?: { energy?: number; sleep?: number; soreness?: string; goal?: string | null };
  onAsked?: () => void;
}

const QUICK_PROMPTS = [
  "Should I train today?",
  "What should I eat?",
  "Why do I feel like this?",
  "How do I rest well?",
];

export default function QuickAskBar({ userId, context, onAsked }: Props) {
  const { currentPhase, currentCycleDay } = useCycle();
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);

  const ask = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setAnswer(null);
    setOpen(true);
    haptic("medium");
    try {
      const { data, error } = await supabase.functions.invoke("coach-ai", {
        body: {
          action: "quick_ask",
          question: q,
          context: { ...context, cyclePhase: currentPhase, cycleDay: currentCycleDay },
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setAnswer((data as any).answer || "I don't have anything to say just now — try again in a moment.");
      onAsked?.();
    } catch (e: any) {
      toast.error(e?.message || "That didn't land — try again.");
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-warm p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="font-display text-base italic font-bold text-foreground">Quick ask</h3>
      </div>

      {/* One-tap chips */}
      <div className="flex flex-wrap gap-2">
        {QUICK_PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => { setQuestion(p); ask(p); }}
            disabled={loading}
            className="px-3 py-1.5 rounded-full bg-secondary/60 hover:bg-secondary text-foreground/80 font-display text-[12px] italic transition disabled:opacity-50"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Free-text */}
      <div className="flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") ask(question); }}
          placeholder="Ask your coach anything…"
          maxLength={300}
          className="flex-1 bg-secondary/30 border border-border rounded-xl px-3 py-2 font-display text-sm italic text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/30"
        />
        <button
          onClick={() => ask(question)}
          disabled={loading || !question.trim()}
          className="px-3 rounded-xl bg-primary text-primary-foreground disabled:opacity-40 flex items-center justify-center"
          aria-label="Send"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-xl bg-primary/5 border border-primary/15 p-4 mt-1"
          >
            {loading && !answer ? (
              <div className="flex items-center gap-2 text-muted-foreground font-display text-sm italic">
                <Loader2 className="h-4 w-4 animate-spin" /> Listening…
              </div>
            ) : (
              <div className="prose prose-sm max-w-none font-display italic text-foreground/85 leading-relaxed [&_p]:text-[13px] [&_p]:mb-2 [&_p:last-child]:mb-0">
                <ReactMarkdown>{answer || ""}</ReactMarkdown>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
