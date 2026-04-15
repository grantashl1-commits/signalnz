import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Sparkles, Loader2, ArrowRight, CheckCircle2, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { haptic } from "@/hooks/use-mobile";

export interface ReflectionCard {
  key: string;
  label: string;
  text: string;
  shared: boolean;
}

const CARD_LABELS: Record<string, string> = {
  what_happened: "what happened",
  how_i_felt: "how I felt",
  what_i_need: "what I need",
  what_i_want_to_say: "what I want to say",
};

interface Props {
  connectionId: string;
  partnerRole: "member" | "partner";
  partnerName: string;
  onCardsSent: (cards: ReflectionCard[]) => void;
}

export default function PrivateReflection({ connectionId, partnerRole, partnerName, onCardsSent }: Props) {
  const [entry, setEntry] = useState("");
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState<ReflectionCard[] | null>(null);
  const [sent, setSent] = useState(false);

  const organise = async () => {
    if (!entry.trim()) return;
    setLoading(true);
    haptic("medium");
    try {
      const { data, error } = await supabase.functions.invoke("connect-reflect", {
        body: { journal_entry: entry, mode: "partnership", action: "reflect" },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setCards([
        { key: "what_happened", label: CARD_LABELS.what_happened, text: data.what_happened, shared: false },
        { key: "how_i_felt", label: CARD_LABELS.how_i_felt, text: data.how_i_felt, shared: false },
        { key: "what_i_need", label: CARD_LABELS.what_i_need, text: data.what_i_need, shared: false },
        { key: "what_i_want_to_say", label: CARD_LABELS.what_i_want_to_say, text: data.what_i_want_to_say, shared: false },
      ]);
    } catch (e: any) {
      toast.error("Something went wrong — let's try again");
    } finally {
      setLoading(false);
    }
  };

  const toggleShare = (key: string) => {
    setCards(prev => prev!.map(c => c.key === key ? { ...c, shared: !c.shared } : c));
  };

  const sendToRoom = async () => {
    const shared = cards!.filter(c => c.shared);
    if (shared.length === 0) {
      toast.error("Toggle at least one card to share");
      return;
    }
    haptic("medium");

    // Save reflection to DB
    await (supabase.from("connect_reflections" as any) as any).insert({
      connection_id: connectionId,
      partner_role: partnerRole,
      raw_entry: entry,
      cards: cards,
      shared_keys: shared.map(c => c.key),
    });

    onCardsSent(shared);
    setSent(true);
    toast.success(`${shared.length} card(s) sent to the shared space 💜`);
  };

  if (sent) {
    return (
      <div className="text-center py-12 px-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4 opacity-60" />
          <p className="font-display text-lg font-bold text-foreground mb-2">Cards shared</p>
          <p className="text-sm text-muted-foreground mb-6">
            When {partnerName} has also shared, the shared space will open.
          </p>
          <button
            onClick={() => { setCards(null); setEntry(""); setSent(false); }}
            className="text-xs text-muted-foreground flex items-center gap-1.5 mx-auto hover:text-foreground"
          >
            <RotateCcw className="w-3 h-3" /> Write another reflection
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      <div className="flex items-center gap-2 mb-4">
        <Lock className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground font-medium">Private — only you can see this</span>
      </div>

      <AnimatePresence mode="wait">
        {!cards ? (
          <motion.div key="write" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <p className="text-sm text-muted-foreground mb-3 italic">
              Write freely about what's on your mind about your relationship. The AI will organise your thoughts into shareable cards.
            </p>
            <textarea
              value={entry}
              onChange={e => setEntry(e.target.value)}
              placeholder="Write honestly — no one else will see this raw entry..."
              className="w-full min-h-[200px] rounded-2xl bg-card border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/30 transition-colors resize-none"
            />
            <div className="mt-4 flex justify-center">
              <button
                onClick={organise}
                disabled={!entry.trim() || loading}
                className="bg-primary text-primary-foreground px-6 py-3 rounded-full text-sm font-semibold flex items-center gap-2 disabled:opacity-40"
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
          <motion.div key="cards" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="space-y-3">
              {cards.map((card, i) => (
                <motion.div
                  key={card.key}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 rounded-2xl border border-border bg-card"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">{card.label}</span>
                    <button
                      onClick={() => toggleShare(card.key)}
                      className={`text-xs px-3 py-1 rounded-full transition-all ${
                        card.shared
                          ? "bg-primary/20 text-primary font-semibold"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {card.shared ? "sharing ✓" : `share with ${partnerName}`}
                    </button>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed">{card.text}</p>
                </motion.div>
              ))}
            </div>

            <div className="flex gap-3 mt-6 justify-center">
              <button
                onClick={() => setCards(null)}
                className="px-5 py-2.5 rounded-full text-sm text-muted-foreground border border-border hover:text-foreground"
              >
                Back to writing
              </button>
              <button
                onClick={sendToRoom}
                className="bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2"
              >
                Send to shared space <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
