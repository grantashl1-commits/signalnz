import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock, Sparkles, Loader2, ArrowRight, CheckCircle2,
  RotateCcw, Copy, Check, Heart, Lightbulb, Compass,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { haptic } from "@/hooks/use-mobile";

export interface ReflectionCard {
  key: string;
  label: string;
  text: string;
  shared: boolean;
}

interface ReflectResult {
  message_to_send: string;
  validation: string;
  insight: string;
  anticipate: string;
}

interface Props {
  connectionId: string;
  partnerRole: "member" | "partner";
  partnerName: string;
  onCardsSent: () => void;
}

export default function PrivateReflection({ connectionId, partnerRole, partnerName, onCardsSent }: Props) {
  const [entry, setEntry] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReflectResult | null>(null);
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);

  const organise = async () => {
    if (!entry.trim()) return;
    setLoading(true);
    haptic("medium");
    try {
      const { data, error } = await supabase.functions.invoke("connect-reflect", {
        body: { journal_entry: entry, mode: "partnership", action: "reflect" },
      });

      if (error || !data) throw error ?? new Error("No response received");
      if (data.error) throw new Error(data.error);
      if (!data.message_to_send) throw new Error("That didn't come through fully — try again in a moment.");

      setResult(data as ReflectResult);
      haptic("light");
    } catch (e: any) {
      console.error("connect-reflect:", e);
      toast.error("Something didn't land — try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.message_to_send);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      haptic("light");
    } catch {}
  };

  const sendToRoom = async () => {
    if (!result) return;
    haptic("medium");

    const sharedCard: ReflectionCard = {
      key: "what_happened",
      label: "what I want to say",
      text: result.message_to_send,
      shared: true,
    };

    const allCards: ReflectionCard[] = [
      sharedCard,
      { key: "how_i_felt", label: "how I felt", text: result.validation, shared: false },
      { key: "what_i_need", label: "insight", text: result.insight, shared: false },
      { key: "what_i_want_to_say", label: "anticipate", text: result.anticipate, shared: false },
    ];

    try {
      await (supabase.from("connect_reflections" as any) as any).insert({
        connection_id: connectionId,
        partner_role: partnerRole,
        raw_entry: entry,
        cards: allCards,
        shared_keys: ["what_happened"],
      });
    } catch (e) {
      console.error("Failed to save reflection:", e);
    }

    onCardsSent();
    setSent(true);
    toast.success(`Message sent to ${partnerName} 💜`);
  };

  if (sent) {
    return (
      <div className="text-center py-12 px-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4 opacity-60" />
          <p className="font-display text-lg font-bold text-foreground mb-2">Message sent</p>
          <p className="font-body text-sm text-muted-foreground mb-6">
            When {partnerName} responds, you'll see it in the Shared space.
          </p>
          <button
            onClick={() => { setResult(null); setEntry(""); setSent(false); }}
            className="font-body text-xs text-muted-foreground flex items-center gap-1.5 mx-auto hover:text-foreground transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Write another reflection
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <Lock className="w-4 h-4 text-muted-foreground" />
        <span className="font-body text-xs text-muted-foreground">Private — only you can see this</span>
      </div>

      <AnimatePresence mode="wait">
        {!result ? (
          /* ── Write view ── */
          <motion.div key="write" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <p className="font-display text-sm italic text-muted-foreground leading-relaxed">
              Write freely about what's on your mind. The AI will help you find the right words and give you private insights.
            </p>
            <textarea
              value={entry}
              onChange={e => setEntry(e.target.value)}
              placeholder="Write honestly — no one else will see this raw entry..."
              className="w-full min-h-[200px] rounded-[18px] bg-card border border-border px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/30 transition-colors resize-none leading-relaxed"
            />
            <div className="flex justify-center">
              <button
                onClick={organise}
                disabled={!entry.trim() || loading}
                className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-body text-sm font-semibold flex items-center gap-2 disabled:opacity-40 active:opacity-80 transition-opacity"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Finding the right words...</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Organise with AI</>
                )}
              </button>
            </div>
          </motion.div>
        ) : (
          /* ── Result view ── */
          <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">

            {/* Message to send */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="rounded-[18px] border-2 border-primary/25 bg-primary/5 p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="font-hand text-[10px] font-bold uppercase tracking-wider text-primary">Message to {partnerName}</span>
                <span className="font-body text-[9px] text-muted-foreground bg-secondary/80 px-2 py-0.5 rounded-full">NVC structured</span>
              </div>
              <p className="font-body text-sm text-foreground/85 leading-relaxed">{result.message_to_send}</p>
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-primary/15">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 font-body text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy text"}
                </button>
                <span className="text-border">·</span>
                <span className="font-body text-[10px] text-muted-foreground/60 italic">Send this to {partnerName} using the button below</span>
              </div>
            </motion.div>

            {/* Private insights header */}
            <div className="flex items-center gap-1.5 px-1 pt-1">
              <Lock className="w-3 h-3 text-muted-foreground/60" />
              <span className="font-hand text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Just for you</span>
            </div>

            {/* Validation */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-[16px] p-4"
              style={{ backgroundColor: "hsl(330 35% 96%)", border: "1px solid hsl(330 25% 88%)" }}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <Heart className="w-3.5 h-3.5" style={{ color: "hsl(330 55% 55%)" }} />
                <span className="font-hand text-[10px] font-bold uppercase tracking-wider" style={{ color: "hsl(330 55% 55%)" }}>
                  How you're feeling
                </span>
              </div>
              <p className="font-body text-sm text-foreground/80 leading-relaxed">{result.validation}</p>
            </motion.div>

            {/* Insight */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-[16px] p-4"
              style={{ backgroundColor: "hsl(284 25% 96%)", border: "1px solid hsl(284 20% 88%)" }}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <Lightbulb className="w-3.5 h-3.5 text-primary" />
                <span className="font-hand text-[10px] font-bold uppercase tracking-wider text-primary/70">
                  Why you might be reacting this way
                </span>
              </div>
              <p className="font-body text-sm text-foreground/80 leading-relaxed">{result.insight}</p>
            </motion.div>

            {/* Anticipate */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-[16px] p-4"
              style={{ backgroundColor: "hsl(38 40% 96%)", border: "1px solid hsl(38 30% 88%)" }}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <Compass className="w-3.5 h-3.5" style={{ color: "hsl(38 65% 48%)" }} />
                <span className="font-hand text-[10px] font-bold uppercase tracking-wider" style={{ color: "hsl(38 65% 48%)" }}>
                  What to expect next
                </span>
              </div>
              <p className="font-body text-sm text-foreground/80 leading-relaxed">{result.anticipate}</p>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="flex gap-3 pt-1"
            >
              <button
                onClick={() => setResult(null)}
                className="font-body px-4 py-2.5 rounded-full text-sm text-muted-foreground border border-border hover:text-foreground transition-colors flex-shrink-0"
              >
                ← Rewrite
              </button>
              <button
                onClick={sendToRoom}
                className="flex-1 bg-primary text-primary-foreground px-5 py-2.5 rounded-full font-body text-sm font-semibold flex items-center justify-center gap-2 active:opacity-80 transition-opacity"
              >
                Send to {partnerName} <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
