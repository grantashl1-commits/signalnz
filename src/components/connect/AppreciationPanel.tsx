import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Star, Shield, Eye, Ear, Hand, Sparkles, Sun, Moon, Flower2, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { haptic } from "@/hooks/use-mobile";

/* ─── Research-backed phrases ───
 * Sourced from Gottman's "turning toward" research, NVC needs,
 * and common themes in relationship counselling about what
 * partners wish they heard more often.
 */

export interface AppreciationPhrase {
  id: string;
  icon: React.ElementType;
  phrase: string;
  subtext: string;
  color: string;
  category: "safety" | "seen" | "valued" | "loved" | "gratitude";
}

export const APPRECIATION_PHRASES: AppreciationPhrase[] = [
  // What women wish they heard more
  { id: "see-you", icon: Eye, phrase: "I see you", subtext: "I notice everything you do", color: "from-violet-400 to-purple-500", category: "seen" },
  { id: "enough", icon: Star, phrase: "You are enough", subtext: "Exactly as you are, right now", color: "from-amber-400 to-orange-500", category: "valued" },
  { id: "listening", icon: Ear, phrase: "I'm listening", subtext: "Tell me more — I want to understand", color: "from-sky-400 to-blue-500", category: "seen" },
  { id: "not-alone", icon: Hand, phrase: "You don't have to do it all", subtext: "Let me carry some of this with you", color: "from-teal-400 to-emerald-500", category: "safety" },
  { id: "here-for-you", icon: Shield, phrase: "I'm here for you", subtext: "No matter what — I'm not going anywhere", color: "from-indigo-400 to-blue-500", category: "safety" },

  // What men wish they heard more
  { id: "proud", icon: Sparkles, phrase: "I'm proud of you", subtext: "I see how hard you try", color: "from-rose-400 to-pink-500", category: "valued" },
  { id: "trust", icon: Shield, phrase: "I trust you", subtext: "I believe in your judgment", color: "from-emerald-400 to-green-500", category: "valued" },
  { id: "safe", icon: Heart, phrase: "You make me feel safe", subtext: "Being with you feels like home", color: "from-pink-400 to-rose-500", category: "loved" },
  { id: "believe", icon: Sun, phrase: "I believe in you", subtext: "Even when you don't believe in yourself", color: "from-yellow-400 to-amber-500", category: "valued" },
  { id: "thank-you", icon: Flower2, phrase: "Thank you for being you", subtext: "Not for what you do — for who you are", color: "from-fuchsia-400 to-purple-500", category: "gratitude" },

  // Universal / Gottman-inspired
  { id: "love-unsaid", icon: Heart, phrase: "I love you — even when I forget to say it", subtext: "It's always there, underneath everything", color: "from-red-400 to-rose-500", category: "loved" },
  { id: "choose-you", icon: Moon, phrase: "I'd choose you again", subtext: "Every single time", color: "from-slate-400 to-indigo-500", category: "loved" },
];

interface Props {
  connectionId: string;
  senderRole: "member" | "partner";
}

export default function AppreciationPanel({ connectionId, senderRole }: Props) {
  const [sending, setSending] = useState<string | null>(null);
  const [sent, setSent] = useState<Set<string>>(new Set());

  const sendAppreciation = async (phrase: AppreciationPhrase) => {
    if (sending) return;
    setSending(phrase.id);
    haptic("medium");

    try {
      await supabase.from("connect_messages").insert({
        connection_id: connectionId,
        sender_role: senderRole,
        content: `💜 ${phrase.phrase}`,
        metadata: {
          type: "appreciation",
          phrase_id: phrase.id,
          subtext: phrase.subtext,
        },
      });
      setSent((prev) => new Set(prev).add(phrase.id));
      toast.success("Sent 💜");
    } catch {
      toast.error("Couldn't send — try again");
    }
    setSending(null);
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="text-center">
        <p className="font-display text-lg font-bold text-foreground">I appreciate you</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
          Sometimes the most powerful thing is hearing what usually goes unsaid. Tap to send.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {APPRECIATION_PHRASES.map((phrase) => {
          const isSent = sent.has(phrase.id);
          const isSending = sending === phrase.id;
          const Icon = phrase.icon;

          return (
            <motion.button
              key={phrase.id}
              onClick={() => sendAppreciation(phrase)}
              disabled={isSending}
              whileTap={{ scale: 0.95 }}
              className={`relative p-4 rounded-2xl border text-left transition-all ${
                isSent
                  ? "border-primary/30 bg-primary/5"
                  : "border-border bg-card hover:border-primary/20 active:scale-[0.98]"
              }`}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${phrase.color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="font-display text-sm font-bold text-foreground leading-tight">{phrase.phrase}</p>
              <p className="text-[10px] text-muted-foreground mt-1 leading-snug">{phrase.subtext}</p>

              {isSent && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center"
                >
                  <Heart className="w-3 h-3 text-primary fill-primary" />
                </motion.div>
              )}

              {isSending && (
                <div className="absolute inset-0 rounded-2xl bg-background/50 flex items-center justify-center">
                  <Send className="w-4 h-4 text-primary animate-pulse" />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      <p className="text-[10px] text-muted-foreground/50 text-center italic">
        Based on Gottman's turning-toward research & what partners wish they heard more
      </p>
    </div>
  );
}
